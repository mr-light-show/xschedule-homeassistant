"""Media player platform for xSchedule integration."""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any
from datetime import datetime

from homeassistant.components.media_player import (
    BrowseMedia,
    MediaPlayerEntity,
    MediaPlayerEntityFeature,
    MediaPlayerState,
    MediaType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .api_client import (
    XScheduleAPIClient,
    XScheduleAPIError,
    _command_status,
    format_command_failure,
    is_xschedule_no_detail_jump_error,
)
from .const import (
    CONF_PASSWORD,
    DEFAULT_NAME,
    DOMAIN,
    EVENT_CACHE_INVALIDATED,
    EVENT_MUTE_TOGGLE,
    EVENT_NEXT,
    EVENT_PAUSE,
    EVENT_PLAY,
    EVENT_PLAYLIST_CHANGED,
    EVENT_PREVIOUS,
    EVENT_SEEK,
    EVENT_STOP,
    EVENT_VOLUME_ADJUST,
    EVENT_VOLUME_SET,
)
from .websocket import XScheduleWebSocket

_LOGGER = logging.getLogger(__name__)


def _parse_length_ms(value: Any) -> int:
    """Parse lengthms from API payloads; return 0 if missing or invalid."""
    if value is None or value == "":
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0


def _is_meaningful_text(value: Any) -> bool:
    """Return True when a websocket text field carries a usable value."""
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return bool(value)


def _parse_ms_to_seconds(value: Any) -> float | None:
    """Convert xSchedule millisecond fields to seconds, or None if unusable."""
    if value is None or value == "":
        return None
    try:
        return int(value) / 1000
    except (ValueError, TypeError):
        return None


# Define custom TRACE level for very verbose logging
TRACE_LEVEL = 5
logging.addLevelName(TRACE_LEVEL, "TRACE")


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up xSchedule media player from a config entry."""
    _LOGGER.debug("Setting up xSchedule media player")

    host = config_entry.data[CONF_HOST]
    port = config_entry.data[CONF_PORT]
    password = config_entry.data.get(CONF_PASSWORD)

    # Create API client
    api_client = XScheduleAPIClient(host, port, password)

    # Create media player entity
    entity = XScheduleMediaPlayer(config_entry, api_client, hass)

    # Store entity reference in hass.data for binary_sensor to access
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    if "entities" not in hass.data[DOMAIN]:
        hass.data[DOMAIN]["entities"] = {}
    hass.data[DOMAIN]["entities"][config_entry.entry_id] = entity

    async_add_entities([entity], True)


class XScheduleMediaPlayer(MediaPlayerEntity):
    """Representation of an xSchedule media player."""

    _attr_media_content_type = MediaType.PLAYLIST
    _attr_should_poll = False  # WebSocket provides real-time updates
    _attr_supported_features = (
        MediaPlayerEntityFeature.PLAY
        | MediaPlayerEntityFeature.PAUSE
        | MediaPlayerEntityFeature.STOP
        | MediaPlayerEntityFeature.PREVIOUS_TRACK
        | MediaPlayerEntityFeature.NEXT_TRACK
        | MediaPlayerEntityFeature.SELECT_SOURCE
        | MediaPlayerEntityFeature.VOLUME_SET
        | MediaPlayerEntityFeature.VOLUME_MUTE
        | MediaPlayerEntityFeature.SEEK
        | MediaPlayerEntityFeature.PLAY_MEDIA
        | MediaPlayerEntityFeature.BROWSE_MEDIA
        | MediaPlayerEntityFeature.TURN_OFF
    )

    def __init__(
        self,
        config_entry: ConfigEntry,
        api_client: XScheduleAPIClient,
        hass: HomeAssistant,
    ) -> None:
        """Initialize the xSchedule media player."""
        self._config_entry = config_entry
        self._api_client = api_client
        self._hass = hass

        # Entity attributes
        self._attr_name = DEFAULT_NAME
        self._attr_unique_id = f"{DOMAIN}_{config_entry.entry_id}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name=DEFAULT_NAME,
            manufacturer="xLights",
            model="xSchedule",
            configuration_url=f"http://{config_entry.data[CONF_HOST]}:{config_entry.data[CONF_PORT]}",
        )

        # State tracking
        self._attr_state = MediaPlayerState.IDLE
        self._attr_media_title = None  # Current song/step name
        self._attr_media_playlist = None  # Current playlist name
        self._attr_media_position = None
        self._attr_media_duration = None
        self._attr_volume_level = None
        self._attr_is_volume_muted = False

        # Additional state
        self._playlists: list[str] = []
        self._current_playlist_steps: list[dict[str, Any]] = []
        self._time_remaining = None
        self._controller_status: list[dict[str, Any]] = []  # Controller health (pingstatus)
        self._previous_controller_status: list[dict[str, Any]] = []  # For change detection
        
        # Internal queue management (in-memory, lost on reboot)
        self._internal_queue: list[dict[str, Any]] = []
        self._previous_song: str | None = None  # For song change detection

        # WebSocket connection
        self._websocket: XScheduleWebSocket | None = None
        self._setup_websocket()

        # Debouncing for WebSocket updates
        self._update_debounce_task: asyncio.Task | None = None
        self._update_debounce_delay = 0.2  # 200ms debounce window
        self._last_published_snapshot: tuple[Any, ...] | None = None

    def _is_confirmed_playback_stop(self, data: dict[str, Any]) -> bool:
        """Return True when a non-playing status means playback truly stopped.

        xSchedule often reports brief idle gaps during seek or between steps.
        Those messages omit outputtolights; real stops include it explicitly.
        """
        if data.get("playlist"):
            return False
        if data.get("step"):
            return False
        if "outputtolights" not in data:
            return False
        return data.get("outputtolights") == "false"

    def _build_publish_snapshot(self) -> tuple[Any, ...]:
        """Build a comparable snapshot of entity state exposed to Home Assistant."""
        attrs = self.extra_state_attributes
        return (
            str(self._attr_state),
            self._attr_media_title,
            self._attr_media_playlist,
            round(self._attr_media_position, 2)
            if self._attr_media_position is not None
            else None,
            round(self._attr_media_duration, 2)
            if self._attr_media_duration is not None
            else None,
            self._attr_volume_level,
            self._attr_is_volume_muted,
            self._time_remaining,
            tuple(
                (item["id"], item["name"], item["priority"])
                for item in self._internal_queue
            ),
            tuple(
                (song["name"], song["duration"])
                for song in attrs.get("playlist_songs", [])
            ),
            tuple(self._playlists or []),
        )

    def _publish_state_if_changed(self) -> None:
        """Publish entity state only when meaningful fields changed."""
        snapshot = self._build_publish_snapshot()
        if snapshot == self._last_published_snapshot:
            _LOGGER.log(TRACE_LEVEL, "Skipping duplicate state publish")
            return

        self._last_published_snapshot = snapshot
        if self._hass is not None:
            self.async_write_ha_state()

    def _request_state_publish(self, *, immediate: bool = False) -> None:
        """Schedule a debounced publish, or publish immediately after preparing data."""
        if self.hass is None:
            return

        if immediate:
            self.hass.async_create_task(self._async_publish_after_ready())
            return

        self._schedule_debounced_update()

    async def _async_fetch_playlist_steps_if_needed(self) -> None:
        """Fetch playlist steps when a playlist is active but songs are not cached."""
        if not self._attr_media_playlist or self._current_playlist_steps:
            return

        self._current_playlist_steps = await self._api_client.get_playlist_steps(
            self._attr_media_playlist
        )

    async def _async_publish_after_ready(self) -> None:
        """Fetch any missing playlist data, then publish if state changed."""
        try:
            await self._async_fetch_playlist_steps_if_needed()
        except XScheduleAPIError as err:
            _LOGGER.error("Error fetching playlist steps before publish: %s", err)

        self._publish_state_if_changed()

    def _setup_websocket(self) -> None:
        """Set up WebSocket connection."""
        host = self._config_entry.data[CONF_HOST]
        port = self._config_entry.data[CONF_PORT]
        password = self._config_entry.data.get(CONF_PASSWORD)

        self._websocket = XScheduleWebSocket(
            host, port, password, self._handle_websocket_update
        )

    async def async_added_to_hass(self) -> None:
        """Run when entity is added to hass."""
        await super().async_added_to_hass()

        # Connect WebSocket
        if self._websocket:
            await self._websocket.connect()

            # If WebSocket is connected, it will send data soon
            # Wait a brief moment for initial data
            await asyncio.sleep(0.1)

        # Fetch initial status if controller data not yet populated
        # This handles the case where WebSocket hasn't connected or sent data yet
        if not self._controller_status:
            _LOGGER.info("Controller status empty after WebSocket connect, fetching via API")
            try:
                await self.async_update()
            except Exception as err:
                _LOGGER.error("Failed to fetch initial status: %s", err)
        else:
            _LOGGER.debug("Controller status already populated via WebSocket (%d controllers)",
                         len(self._controller_status))

    async def async_will_remove_from_hass(self) -> None:
        """Run when entity will be removed from hass."""
        await super().async_will_remove_from_hass()

        # Disconnect WebSocket
        if self._websocket:
            await self._websocket.disconnect()

        # Close API client
        await self._api_client.close()

    def _handle_websocket_update(self, data: dict[str, Any]) -> None:
        """Handle WebSocket status update."""
        _LOGGER.log(TRACE_LEVEL, "WebSocket status update: %s", data)

        # Store previous state for change detection
        old_state = self._attr_state
        old_playlist = self._attr_media_playlist

        # Update state from status
        status = data.get("status", "idle").lower()
        became_idle = False
        if status == "playing":
            self._attr_state = MediaPlayerState.PLAYING
        elif status == "paused":
            self._attr_state = MediaPlayerState.PAUSED
        elif self._is_confirmed_playback_stop(data):
            became_idle = self._attr_state in (
                MediaPlayerState.PLAYING,
                MediaPlayerState.PAUSED,
            )
            self._attr_state = MediaPlayerState.IDLE
            # Clear media attributes when playback truly stopped
            self._attr_media_title = None
            self._attr_media_playlist = None
            self._attr_media_position = None
            self._attr_media_duration = None
            self._time_remaining = None
            self._current_playlist_steps = []
        else:
            _LOGGER.debug("Ignoring transient non-playing status: %s", status)

        # Merge partial websocket deltas into cached media fields.
        if "playlist" in data and _is_meaningful_text(data["playlist"]):
            self._attr_media_playlist = data["playlist"]

        if "step" in data:
            new_song = data["step"]
            if _is_meaningful_text(new_song):
                # Detect song changes for internal queue management
                if new_song != self._previous_song:
                    if self._previous_song is not None:  # Skip on first load
                        _LOGGER.debug(
                            "Song changed from '%s' to '%s'",
                            self._previous_song,
                            new_song,
                        )
                        self._handle_song_started(new_song)
                    self._previous_song = new_song
                self._attr_media_title = new_song

        # Update position and duration (use millisecond fields)
        if "positionms" in data:
            position = _parse_ms_to_seconds(data["positionms"])
            if position is not None:
                self._attr_media_position = position
                self._attr_media_position_updated_at = dt_util.utcnow()

        if "lengthms" in data:
            duration = _parse_ms_to_seconds(data["lengthms"])
            if duration is not None:
                self._attr_media_duration = duration

        if (
            (not self._attr_media_duration or self._attr_media_duration <= 0)
            and self._attr_media_title
            and self._current_playlist_steps
        ):
            for step in self._current_playlist_steps:
                if step.get("name") == self._attr_media_title:
                    ms = _parse_length_ms(step.get("lengthms"))
                    if ms > 0:
                        self._attr_media_duration = ms / 1000.0
                    break

        if "leftms" in data:
            time_remaining = _parse_ms_to_seconds(data["leftms"])
            if time_remaining is not None:
                self._time_remaining = time_remaining

        # Update volume level from status
        if "volume" in data:
            # Convert 0-100 to 0-1 (handle both int and string)
            try:
                self._attr_volume_level = int(data["volume"]) / 100
            except (ValueError, TypeError):
                self._attr_volume_level = None

        # Update controller health status
        if "pingstatus" in data and isinstance(data["pingstatus"], list):
            new_status = data["pingstatus"]

            # Only fire event if controller status actually changed
            if new_status != self._previous_controller_status:
                self._controller_status = new_status
                self._previous_controller_status = new_status.copy() if new_status else []

                _LOGGER.debug("Controller status changed: %d controllers found", len(self._controller_status))
                # Fire event for binary sensors to update (only if entity is attached to hass)
                if self._hass is not None:
                    self._hass.bus.async_fire(
                        f"{DOMAIN}_controller_status_update",
                        {
                            "entry_id": self._config_entry.entry_id,
                            "controllers": self._controller_status,
                        },
                    )
                    _LOGGER.debug("Fired controller_status_update event for %d controllers",
                                 len(self._controller_status))
            else:
                # Status unchanged, just update the reference (no event)
                self._controller_status = new_status

        # Detect state transitions and invalidate cache
        if old_state != self._attr_state or old_playlist != self._attr_media_playlist:
            _LOGGER.debug(
                "State changed: %s → %s, playlist: %s → %s",
                old_state,
                self._attr_state,
                old_playlist,
                self._attr_media_playlist,
            )
            # Invalidate cache when state changes
            self._api_client.invalidate_cache()

            # Clear entity-level cached playlist steps when playlist changes
            # Debounced publish will fetch new steps before writing state
            if old_playlist != self._attr_media_playlist:
                self._current_playlist_steps = []

            # Fire event to notify frontend of cache invalidation
            if self.hass and self.entity_id:
                self._hass.bus.fire(
                    EVENT_CACHE_INVALIDATED,
                    {
                        "entity_id": self.entity_id,
                        "old_state": str(old_state),
                        "new_state": str(self._attr_state),
                        "old_playlist": old_playlist,
                        "new_playlist": self._attr_media_playlist,
                    },
                )

        if became_idle and self._internal_queue:
            _LOGGER.info(
                "Playback became idle with %d queued item(s); advancing queue",
                len(self._internal_queue),
            )
            self._hass.async_create_task(self._async_play_queue_head(immediate=True))

        # Schedule entity update with debouncing (only if entity has been added to hass)
        if self.hass and self.entity_id:
            self._request_state_publish()

    def _schedule_debounced_update(self) -> None:
        """Schedule a debounced update to avoid excessive state updates.

        Batches rapid WebSocket updates within a 200ms window into a single
        Home Assistant state update.
        """
        # Cancel any pending debounce task
        if self._update_debounce_task and not self._update_debounce_task.done():
            self._update_debounce_task.cancel()

        # Only create debounce task if entity is attached to hass
        if self.hass is None:
            return

        # Create new debounce task
        async def debounced_update():
            """Wait for debounce delay, then publish once if needed."""
            try:
                await asyncio.sleep(self._update_debounce_delay)
                if self.hass is not None:
                    await self._async_publish_after_ready()
            except asyncio.CancelledError:
                pass  # Task was cancelled, another update is coming

        self._update_debounce_task = self.hass.async_create_task(debounced_update())

    async def async_update(self) -> None:
        """Update the entity state.

        Note: should_poll = False, so this is only called manually
        or when WebSocket is disconnected.
        """
        try:
            # Get playing status (only if WebSocket not connected)
            if not self._websocket or not self._websocket.connected:
                status = await self._api_client.get_playing_status()
                self._handle_websocket_update(status)

            # Only fetch playlists if we don't have them yet
            # Frontend can force refresh via services if needed
            if not self._playlists:
                self._playlists = await self._api_client.get_playlists()

            # Get current playlist steps only if playlist is playing
            # and we don't already have them cached
            if self._attr_media_playlist and not self._current_playlist_steps:
                self._current_playlist_steps = await self._api_client.get_playlist_steps(
                    self._attr_media_playlist
                )

        except XScheduleAPIError as err:
            _LOGGER.error("Error updating xSchedule state: %s", err)
            self._attr_state = MediaPlayerState.OFF

    @property
    def source_list(self) -> list[str]:
        """List of available playlists (sources)."""
        return self._playlists

    @property
    def source(self) -> str | None:
        """Name of the current playlist (source)."""
        return self._attr_media_playlist

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return entity specific state attributes."""
        attributes = {
            "playlist": self._attr_media_playlist,
            "song": self._attr_media_title,
            "time_remaining": self._time_remaining,
            "source_list": self._playlists or [],  # Available playlists for frontend selector
        }

        # Add current playlist steps (always include for frontend compatibility)
        attributes["playlist_songs"] = [
            {
                "name": step.get("name"),
                "duration": _parse_length_ms(step.get("lengthms")),
            }
            for step in (self._current_playlist_steps or [])
        ]

        # Track current song position in playlist (1-indexed)
        if self._attr_media_title and self._current_playlist_steps:
            for idx, step in enumerate(self._current_playlist_steps, 1):
                if step.get("name") == self._attr_media_title:
                    attributes["media_track"] = idx
                    break

        # Add internal queue (in-memory, managed by integration)
        attributes["internal_queue"] = [
            {
                "id": item["id"],
                "name": item["name"],
                "playlist": item["playlist"],
                "priority": item["priority"],
                "duration": _parse_length_ms(item.get("lengthms")),
            }
            for item in (self._internal_queue or [])
        ]

        return attributes

    # Playback control methods

    async def async_media_play(self) -> None:
        """Send play command."""
        try:
            # When paused, xSchedule resumes by toggling Pause again (not "Play specified playlist",
            # which restarts/reshuffles the playlist and can skip to a new step, especially in random mode).
            if self._attr_state == MediaPlayerState.PAUSED:
                if self._websocket and self._websocket.connected:
                    await self._websocket.send_command("Pause")
                else:
                    await self._api_client.pause()
                self._hass.bus.fire(
                    EVENT_PLAY,
                    {"entity_id": self.entity_id, "playlist": self._attr_media_playlist},
                )
                return

            # If a playlist is selected, play it; otherwise send generic Play
            if self._attr_media_playlist:
                if self._websocket and self._websocket.connected:
                    await self._websocket.send_command(
                        "Play specified playlist", self._attr_media_playlist
                    )
                else:
                    await self._api_client.play_playlist(self._attr_media_playlist)
            else:
                if self._websocket and self._websocket.connected:
                    await self._websocket.send_command("Play")
                else:
                    await self._api_client.command("Play")

            self._hass.bus.fire(
                EVENT_PLAY,
                {"entity_id": self.entity_id, "playlist": self._attr_media_playlist},
            )

        except XScheduleAPIError as err:
            _LOGGER.error("Error playing: %s", err)

    async def async_media_pause(self) -> None:
        """Send pause command."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Pause")
            else:
                await self._api_client.pause()

            self._hass.bus.fire(EVENT_PAUSE, {"entity_id": self.entity_id})

        except XScheduleAPIError as err:
            _LOGGER.error("Error pausing: %s", err)

    async def async_media_stop(self) -> None:
        """Send stop command."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Stop")
            else:
                await self._api_client.stop()

            self._hass.bus.fire(EVENT_STOP, {"entity_id": self.entity_id})

        except XScheduleAPIError as err:
            _LOGGER.error("Error stopping: %s", err)

    async def async_turn_off(self) -> None:
        """Turn off - stop all playlists, schedules, and empty queue."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Stop all now")
            else:
                await self._api_client.stop_all_now()

            _LOGGER.info("Executed 'Stop all now' command")

        except XScheduleAPIError as err:
            _LOGGER.error("Error turning off: %s", err)

    async def async_media_next_track(self) -> None:
        """Send next track command."""
        try:
            if await self._async_play_queue_head(immediate=True):
                self._hass.bus.fire(EVENT_NEXT, {"entity_id": self.entity_id})
                return

            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Next step in current playlist")
            else:
                await self._api_client.next_step()

            self._hass.bus.fire(EVENT_NEXT, {"entity_id": self.entity_id})

        except XScheduleAPIError as err:
            _LOGGER.error("Error going to next track: %s", err)

    async def async_media_previous_track(self) -> None:
        """Send previous track command."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Prior step in current playlist")
            else:
                await self._api_client.previous_step()

            self._hass.bus.fire(EVENT_PREVIOUS, {"entity_id": self.entity_id})

        except XScheduleAPIError as err:
            _LOGGER.error("Error going to previous track: %s", err)

    async def async_media_seek(self, position: float) -> None:
        """Seek to position in current track."""
        try:
            # Convert seconds to milliseconds
            position_ms = int(position * 1000)

            if self._websocket and self._websocket.connected:
                await self._websocket.send_command(
                    "Set step position ms", str(position_ms)
                )
            else:
                await self._api_client.set_step_position(position_ms)

            self._hass.bus.fire(
                EVENT_SEEK,
                {"entity_id": self.entity_id, "position": position},
            )

        except XScheduleAPIError as err:
            _LOGGER.error("Error seeking: %s", err)

    async def async_select_source(self, source: str) -> None:
        """Select playlist (source) to play."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Play specified playlist", source)
            else:
                await self._api_client.play_playlist(source)

            self._attr_media_playlist = source
            # Invalidate cache when playlist changes
            self._api_client.invalidate_cache(source)
            self._hass.bus.fire(
                EVENT_PLAYLIST_CHANGED,
                {"entity_id": self.entity_id, "playlist": source},
            )

        except XScheduleAPIError as err:
            _LOGGER.error("Error selecting source: %s", err)

    # Volume control methods

    async def async_set_volume_level(self, volume: float) -> None:
        """Set volume level (0..1)."""
        try:
            # Convert 0-1 to 0-100
            volume_percent = int(volume * 100)

            if self._websocket and self._websocket.connected:
                await self._websocket.send_command(
                    "Set volume to", str(volume_percent)
                )
            else:
                await self._api_client.set_volume(volume_percent)

            self._attr_volume_level = volume
            self._hass.bus.fire(
                EVENT_VOLUME_SET,
                {"entity_id": self.entity_id, "volume": volume},
            )

        except XScheduleAPIError as err:
            _LOGGER.error("Error setting volume: %s", err)

    async def async_mute_volume(self, mute: bool) -> None:
        """Mute or unmute volume."""
        try:
            # xSchedule only has toggle mute, so check current state
            if mute != self._attr_is_volume_muted:
                if self._websocket and self._websocket.connected:
                    await self._websocket.send_command("Toggle mute")
                else:
                    await self._api_client.toggle_mute()

                self._attr_is_volume_muted = mute
                self._hass.bus.fire(
                    EVENT_MUTE_TOGGLE,
                    {"entity_id": self.entity_id, "muted": mute},
                )

        except XScheduleAPIError as err:
            _LOGGER.error("Error toggling mute: %s", err)

    # Custom service methods for queue management

    async def async_play_song(self, playlist: str, song: str) -> None:
        """Play a specific song (step) from a playlist."""
        try:
            await self._async_insert_queue_item(playlist, song, position="front")
            await self._async_play_queue_head(immediate=True)

            self._api_client.invalidate_cache(playlist)
            self._hass.bus.fire(
                EVENT_PLAY,
                {
                    "entity_id": self.entity_id,
                    "playlist": playlist,
                    "song": song,
                },
            )
            if self.hass is not None:
                self._request_state_publish(immediate=True)

        except XScheduleAPIError as err:
            _LOGGER.error("Error playing song: %s", err)


    async def async_jump_to_step(self, step: str) -> None:
        """Jump to specified step in current playlist at end of current step."""
        try:
            _LOGGER.debug("Jump to step called: step='%s'", step)
            # Use REST API for now - WebSocket format needs investigation
            # WebSocket was returning: {'result': 'failed', 'reference': '', 'message': 'Empty request.'}
            _LOGGER.debug("Sending via REST API: step='%s'", step)
            result = await self._api_client.jump_to_step_at_end(step)

            if not isinstance(result, dict):
                _LOGGER.info("Jump to step '%s' sent (response: %s)", step, result)
                return

            status = _command_status(result)
            if status in ("ok", "success"):
                _LOGGER.info("Successfully jumped to step '%s' at end of current step", step)
            elif status == "failed":
                error_msg = format_command_failure(result)
                _LOGGER.error("Jump to step '%s' failed: %s", step, error_msg)
                raise XScheduleAPIError(f"Jump failed: {error_msg}")
            else:
                _LOGGER.warning(
                    "Jump to step '%s' returned unexpected response: %s", step, result
                )

        except XScheduleAPIError as err:
            _LOGGER.error("Error jumping to step '%s': %s", step, err)
            raise

    # Internal Queue Management Methods

    async def _async_ensure_playlist_steps(self, playlist: str) -> list[dict[str, Any]]:
        """Return playlist steps, using cache when the playlist is currently active."""
        if playlist == self._attr_media_playlist and self._current_playlist_steps:
            return self._current_playlist_steps

        try:
            steps = await self._api_client.get_playlist_steps(playlist)
        except XScheduleAPIError as err:
            raise XScheduleAPIError(f"Failed to fetch playlist steps: {err}") from err

        if playlist == self._attr_media_playlist:
            self._current_playlist_steps = steps
        return steps

    async def _async_build_queue_item(
        self, playlist: str, song_name: str
    ) -> dict[str, Any]:
        """Build a queue item after validating the song exists in the playlist."""
        steps = await self._async_ensure_playlist_steps(playlist)
        song_data = next(
            (step for step in steps if step.get("name") == song_name),
            None,
        )
        if not song_data:
            raise XScheduleAPIError(
                f"Song '{song_name}' not found in playlist '{playlist}'"
            )

        return {
            "id": str(uuid.uuid4()),
            "name": song_name,
            "playlist": playlist,
            "priority": 1,
            "lengthms": song_data.get("lengthms", "0"),
        }

    async def _async_insert_queue_item(
        self,
        playlist: str,
        song_name: str,
        *,
        position: str = "back",
    ) -> bool:
        """Insert or bump priority. Returns True if the item is now queue head."""
        existing_item = next(
            (
                item
                for item in self._internal_queue
                if item["name"] == song_name and item["playlist"] == playlist
            ),
            None,
        )
        if existing_item:
            _LOGGER.info("Song '%s' already in queue, bumping priority", song_name)
            existing_item["priority"] += 1
            self._internal_queue.sort(key=lambda item: item["priority"], reverse=True)
            return self._internal_queue[0]["id"] == existing_item["id"]

        queue_item = await self._async_build_queue_item(playlist, song_name)
        if position == "front":
            self._internal_queue.insert(0, queue_item)
        else:
            self._internal_queue.append(queue_item)
        _LOGGER.info(
            "Added '%s' to internal queue (%s) with id %s",
            song_name,
            position,
            queue_item["id"],
        )
        return self._internal_queue[0]["id"] == queue_item["id"]

    async def _async_start_playlist_at_step(self, playlist: str, step: str) -> None:
        """Start playback at a step and continue through the playlist."""
        if self._websocket and self._websocket.connected:
            await self._websocket.send_command(
                "Play playlist starting at step", f"{playlist},{step}"
            )
        else:
            await self._api_client.play_playlist_starting_at_step(playlist, step)
        self._api_client.invalidate_cache(playlist)

    async def _async_play_queue_head(self, *, immediate: bool = False) -> bool:
        """Play the first item in the internal queue."""
        if not self._internal_queue:
            return False

        head = self._internal_queue[0]
        playlist = head["playlist"]
        song_name = head["name"]
        current_playlist = self._attr_media_playlist
        active = self._attr_state in (MediaPlayerState.PLAYING, MediaPlayerState.PAUSED)

        if immediate or not active or not current_playlist:
            _LOGGER.info(
                "Starting queued song '%s' from playlist '%s' (immediate=%s)",
                song_name,
                playlist,
                immediate,
            )
            await self._async_start_playlist_at_step(playlist, song_name)
        elif playlist == current_playlist:
            _LOGGER.info(
                "Scheduling jump to queued song '%s' at end of current step",
                song_name,
            )
            await self.async_jump_to_step(song_name)
        else:
            _LOGGER.info(
                "Handing off queued song '%s' (%s) to xSchedule native queue",
                song_name,
                playlist,
            )
            await self._api_client.enqueue_step(playlist, song_name)
            await self._api_client.stop_playlist_at_end()
            self._internal_queue.pop(0)
            if self.hass is not None:
                self._request_state_publish(immediate=True)

        return True

    async def async_add_to_internal_queue(self, song_name: str) -> None:
        """Add song to internal queue with priority management."""
        _LOGGER.debug("Adding '%s' to internal queue", song_name)

        current_playlist = self._attr_media_playlist
        if not current_playlist:
            raise XScheduleAPIError("No playlist currently playing")

        is_head = await self._async_insert_queue_item(
            current_playlist, song_name, position="back"
        )
        if is_head:
            try:
                immediate = self._attr_state not in (
                    MediaPlayerState.PLAYING,
                    MediaPlayerState.PAUSED,
                )
                await self._async_play_queue_head(immediate=immediate)
            except XScheduleAPIError as err:
                if is_xschedule_no_detail_jump_error(err):
                    _LOGGER.warning(
                        "Jump to '%s' returned failed with no reason from xSchedule; "
                        "internal queue is unchanged. Retry or check xSchedule if the next "
                        "track does not follow the queue.",
                        song_name,
                    )
                else:
                    _LOGGER.error("Failed to jump to '%s': %s", song_name, err)
                    raise

        if self.hass is not None:
            self._request_state_publish(immediate=True)

    async def async_remove_from_internal_queue(self, queue_item_id: str) -> None:
        """Remove specific item from internal queue by UUID."""
        _LOGGER.debug("Removing queue item with id '%s'", queue_item_id)
        
        # Find and remove item
        item = next((item for item in self._internal_queue if item["id"] == queue_item_id), None)
        if not item:
            raise XScheduleAPIError(f"Queue item with id '{queue_item_id}' not found")
        
        self._internal_queue.remove(item)
        _LOGGER.info("Removed '%s' from internal queue", item["name"])
        
        # Update state
        if self.hass is not None:
            self._request_state_publish(immediate=True)

    async def async_reorder_internal_queue(self, queue_item_ids: list[str]) -> None:
        """Reorder internal queue items."""
        _LOGGER.debug("Reordering queue: %s", queue_item_ids)
        
        # 1. Validate all IDs exist
        for queue_id in queue_item_ids:
            if not any(item["id"] == queue_id for item in self._internal_queue):
                raise XScheduleAPIError(f"Queue item with id '{queue_id}' not found")
        
        # Validate count matches
        if len(queue_item_ids) != len(self._internal_queue):
            raise XScheduleAPIError(
                f"Invalid reorder: expected {len(self._internal_queue)} items, got {len(queue_item_ids)}"
            )
        
        # Store old first item
        old_first_id = self._internal_queue[0]["id"] if self._internal_queue else None
        
        # 2. Reorder internal list
        id_to_item = {item["id"]: item for item in self._internal_queue}
        self._internal_queue = [id_to_item[queue_id] for queue_id in queue_item_ids]
        _LOGGER.info("Reordered internal queue")
        
        # 3. If first item changed, issue jump command
        new_first_id = self._internal_queue[0]["id"] if self._internal_queue else None
        if old_first_id != new_first_id and new_first_id:
            try:
                _LOGGER.info(
                    "First item changed to '%s', advancing queue",
                    self._internal_queue[0]["name"],
                )
                await self._async_play_queue_head(immediate=False)
            except XScheduleAPIError as err:
                if is_xschedule_no_detail_jump_error(err):
                    _LOGGER.warning(
                        "Jump to '%s' returned failed with no reason after reorder; "
                        "queue order is kept. Retry or check xSchedule if playback does not match.",
                        self._internal_queue[0]["name"],
                    )
                else:
                    _LOGGER.error(
                        "Failed to advance to '%s': %s",
                        self._internal_queue[0]["name"],
                        err,
                    )
                    raise
        
        # Update state
        if self.hass is not None:
            self._request_state_publish(immediate=True)

    async def async_clear_internal_queue(self) -> None:
        """Clear entire internal queue."""
        _LOGGER.info("Clearing internal queue (%d items)", len(self._internal_queue))
        self._internal_queue = []
        if self.hass is not None:
            self._request_state_publish(immediate=True)

    def _handle_song_started(self, song_name: str) -> None:
        """Handle song start - remove from queue and advance if needed."""
        if not self._internal_queue:
            return
        
        # Search queue for matching song name
        matching_item = next((item for item in self._internal_queue if item["name"] == song_name), None)
        if not matching_item:
            return  # Song not in queue
        
        _LOGGER.info("Song '%s' started playing, removing from queue", song_name)
        self._internal_queue.remove(matching_item)
        
        # If queue not empty, issue jump for next song
        if self._internal_queue:
            next_song = self._internal_queue[0]["name"]
            _LOGGER.info(
                "Queue has %d items remaining, scheduling advance to '%s'",
                len(self._internal_queue),
                next_song,
            )
            self._hass.async_create_task(self._async_play_queue_head(immediate=False))
        else:
            _LOGGER.info("Queue is now empty")

    async def async_browse_media(
        self,
        media_content_type: MediaType | str | None = None,
        media_content_id: str | None = None,
    ) -> BrowseMedia:
        """Implement the websocket media browsing helper."""
        _LOGGER.debug(
            "Browse media called: type=%s, id=%s", media_content_type, media_content_id
        )

        # Root level: Show all playlists
        if media_content_type is None:
            return await self._async_build_playlists_browser()

        # Drill down: Show songs in selected playlist
        if media_content_type == "playlist":
            return await self._async_build_playlist_songs_browser(media_content_id)

        # Fallback
        raise ValueError(f"Unsupported media type: {media_content_type}")

    async def _async_build_playlists_browser(self) -> BrowseMedia:
        """Build root level showing all playlists."""
        children = []

        for playlist_name in self._playlists:
            children.append(
                BrowseMedia(
                    can_expand=True,
                    can_play=True,  # Can play entire playlist
                    children_media_class=MediaType.MUSIC,
                    media_class=MediaType.PLAYLIST,
                    media_content_id=playlist_name,
                    media_content_type="playlist",
                    title=playlist_name,
                    thumbnail=None,
                )
            )

        return BrowseMedia(
            can_expand=True,
            can_play=False,
            children_media_class=MediaType.PLAYLIST,
            media_class="directory",
            media_content_id="root",
            media_content_type="playlists",
            title="xSchedule Playlists",
            thumbnail=None,
            children=children,
        )

    async def _async_build_playlist_songs_browser(
        self, playlist_name: str
    ) -> BrowseMedia:
        """Build songs list for a specific playlist."""
        # Fetch playlist steps via API
        try:
            steps_data = await self._api_client.get_playlist_steps(playlist_name)
        except Exception as err:
            _LOGGER.error("Error fetching playlist steps for %s: %s", playlist_name, err)
            steps_data = []

        children = []
        for step in steps_data:
            step_name = step.get("name", "Unknown")
            duration_ms = _parse_length_ms(step.get("lengthms"))

            browse_item = BrowseMedia(
                can_expand=False,
                can_play=True,
                media_class=MediaType.MUSIC,
                media_content_id=f"{playlist_name}|||{step_name}",  # delimiter
                media_content_type=MediaType.MUSIC,
                title=step_name,
                thumbnail=None,
            )
            # Set duration as attribute (may not be supported in older HA versions)
            # This will be included in future HA versions that support duration
            browse_item.duration = duration_ms / 1000  # Convert ms to seconds
            children.append(browse_item)

        return BrowseMedia(
            can_expand=True,
            can_play=True,  # Can play whole playlist
            children_media_class=MediaType.MUSIC,
            media_class=MediaType.PLAYLIST,
            media_content_id=playlist_name,
            media_content_type="playlist",
            title=playlist_name,
            thumbnail=None,
            children=children,
        )

    async def async_play_media(
        self,
        media_type: MediaType | str,
        media_id: str,
        **kwargs: Any
    ) -> None:
        """Play media from media browser."""
        _LOGGER.info("Play media called: type=%s, id=%s, kwargs=%s", media_type, media_id, kwargs)
        _LOGGER.info("WebSocket connected: %s", self._websocket and self._websocket.connected if self._websocket else False)

        # Parse media_id
        if "|||" in media_id:
            # Playing specific song: "playlist|||song"
            playlist, song = media_id.split("|||", 1)

            try:
                await self._async_insert_queue_item(playlist, song, position="front")
                await self._async_play_queue_head(immediate=True)

                _LOGGER.info(
                    "Queued and started song %s from playlist %s", song, playlist
                )

                self._api_client.invalidate_cache(playlist)
                self._hass.bus.fire(
                    EVENT_PLAY,
                    {
                        "entity_id": self.entity_id,
                        "playlist": playlist,
                        "song": song,
                    },
                )
                if self.hass is not None:
                    self._request_state_publish(immediate=True)

            except XScheduleAPIError as err:
                _LOGGER.error("Error playing media: %s", err)
        else:
            # Playing entire playlist
            playlist = media_id

            try:
                if self._websocket and self._websocket.connected:
                    _LOGGER.info("Sending WebSocket command: Play specified playlist with params: %s", playlist)
                    result = await self._websocket.send_command("Play specified playlist", playlist)
                    _LOGGER.info("WebSocket command result: %s", result)
                else:
                    _LOGGER.info("Using REST API fallback: play_playlist(%s)", playlist)
                    result = await self._api_client.play_playlist(playlist)
                    _LOGGER.info("REST API result: %s", result)

                _LOGGER.info("Successfully played playlist %s", playlist)

                self._hass.bus.fire(
                    EVENT_PLAYLIST_CHANGED,
                    {"entity_id": self.entity_id, "playlist": playlist},
                )

            except XScheduleAPIError as err:
                _LOGGER.error("Error playing playlist: %s", err)

    async def async_get_playlist_schedules(self, playlist: str, force_refresh: bool = False) -> list[dict[str, Any]]:
        """Get schedule information for a playlist."""
        try:
            return await self._api_client.get_playlist_schedules(playlist, force_refresh)
        except XScheduleAPIError as err:
            _LOGGER.error("Error getting playlist schedules: %s", err)
            return []
