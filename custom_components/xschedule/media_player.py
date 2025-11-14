"""Media player platform for xSchedule integration."""
from __future__ import annotations

import asyncio
import logging
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

from .api_client import XScheduleAPIClient, XScheduleAPIError
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
    EVENT_QUEUE_ADD,
    EVENT_QUEUE_CLEAR,
    EVENT_SEEK,
    EVENT_STOP,
    EVENT_VOLUME_ADJUST,
    EVENT_VOLUME_SET,
)
from .websocket import XScheduleWebSocket

_LOGGER = logging.getLogger(__name__)


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
        self._queued_steps: list[dict[str, Any]] = []
        self._time_remaining = None
        self._controller_status: list[dict[str, Any]] = []  # Controller health (pingstatus)
        self._previous_controller_status: list[dict[str, Any]] = []  # For change detection

        # WebSocket connection
        self._websocket: XScheduleWebSocket | None = None
        self._setup_websocket()

        # Debouncing for WebSocket updates
        self._update_debounce_task: asyncio.Task | None = None
        self._update_debounce_delay = 0.2  # 200ms debounce window

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
        _LOGGER.debug("WebSocket status update: %s", data)

        # Store previous state for change detection
        old_state = self._attr_state
        old_playlist = self._attr_media_playlist

        # Update state from status
        status = data.get("status", "idle").lower()
        if status == "playing":
            self._attr_state = MediaPlayerState.PLAYING
        elif status == "paused":
            self._attr_state = MediaPlayerState.PAUSED
        else:
            self._attr_state = MediaPlayerState.IDLE
            # Clear media attributes when idle to prevent stale data
            self._attr_media_title = None
            self._attr_media_playlist = None
            self._attr_media_position = None
            self._attr_media_duration = None
            self._time_remaining = None
            # Also clear playlist/queue data if truly stopped (not just between songs)
            # Check: no playlist field AND outputtolights is false
            if "playlist" not in data and data.get("outputtolights", "false") == "false":
                self._current_playlist_steps = []
                self._queued_steps = []

        # Update current media info
        if "playlist" in data:
            self._attr_media_playlist = data["playlist"]

        if "step" in data:
            self._attr_media_title = data["step"]

        # Update position and duration (use millisecond fields)
        if "positionms" in data:
            # Convert milliseconds to seconds (handle both int and string)
            try:
                self._attr_media_position = int(data["positionms"]) / 1000
                self._attr_media_position_updated_at = dt_util.utcnow()
            except (ValueError, TypeError):
                self._attr_media_position = 0
                self._attr_media_position_updated_at = dt_util.utcnow()

        if "lengthms" in data:
            # Convert milliseconds to seconds (handle both int and string)
            try:
                self._attr_media_duration = int(data["lengthms"]) / 1000
            except (ValueError, TypeError):
                self._attr_media_duration = 0

        if "leftms" in data:
            # Convert milliseconds to seconds (handle both int and string)
            try:
                self._time_remaining = int(data["leftms"]) / 1000
            except (ValueError, TypeError):
                self._time_remaining = 0

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
            # This ensures fresh data is fetched for the new playlist
            if old_playlist != self._attr_media_playlist:
                self._current_playlist_steps = []

                # Trigger async update to fetch new playlist steps immediately
                # This prevents the card from showing blank when playlist starts
                async def fetch_playlist_steps():
                    """Fetch playlist steps and notify Home Assistant."""
                    await self.async_update()
                    # Only schedule state update if entity is still attached to hass
                    if self.hass is not None:
                        self.schedule_update_ha_state()

                # Use hass.async_create_task to tie task to HA lifecycle
                if self.hass is not None:
                    self.hass.async_create_task(fetch_playlist_steps())

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

        # Schedule entity update with debouncing (only if entity has been added to hass)
        if self.hass and self.entity_id:
            self._schedule_debounced_update()

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
            """Wait for debounce delay, then update state."""
            try:
                await asyncio.sleep(self._update_debounce_delay)
                # Only schedule state update if entity is still attached to hass
                if self.hass is not None:
                    self.schedule_update_ha_state()
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

            # Fetch queue if we don't have it yet or WebSocket is disconnected
            # WebSocket doesn't push queue updates, so we need to poll periodically
            if (not self._queued_steps) or (not self._websocket or not self._websocket.connected):
                self._queued_steps = await self._api_client.get_queued_steps()

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
                "duration": int(step.get("lengthms") or 0),  # Convert string to int milliseconds
            }
            for step in (self._current_playlist_steps or [])
        ]

        # Add queued steps (always include queue key for frontend compatibility)
        attributes["queue"] = [
            {
                "name": step.get("name"),
                "id": step.get("id"),
                "duration": int(step.get("lengthms") or 0),  # Convert string to int milliseconds
            }
            for step in (self._queued_steps or [])
        ]

        return attributes

    # Playback control methods

    async def async_media_play(self) -> None:
        """Send play command."""
        try:
            # If a playlist is selected, play it; otherwise resume
            if self._attr_media_playlist:
                if self._websocket and self._websocket.connected:
                    await self._websocket.send_command(
                        "Play specified playlist", self._attr_media_playlist
                    )
                else:
                    await self._api_client.play_playlist(self._attr_media_playlist)
            else:
                # Just send play/resume command
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

    async def async_media_next_track(self) -> None:
        """Send next track command."""
        try:
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
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command(
                    "Play playlist step", f"{playlist},{song}"
                )
            else:
                await self._api_client.play_playlist_step(playlist, song)

            # Invalidate cache when playing a song
            self._api_client.invalidate_cache(playlist)
            self._hass.bus.fire(
                EVENT_PLAY,
                {
                    "entity_id": self.entity_id,
                    "playlist": playlist,
                    "song": song,
                },
            )

        except XScheduleAPIError as err:
            _LOGGER.error("Error playing song: %s", err)

    async def async_add_to_queue(self, playlist: str, song: str) -> None:
        """Add a song (step) to the queue."""
        try:
            # Check if already in queue (full duplicate prevention)
            if self._is_in_queue(song):
                _LOGGER.info("Song '%s' already in queue, skipping", song)
                return

            if self._websocket and self._websocket.connected:
                await self._websocket.send_command(
                    "Enqueue playlist step", f"{playlist},{song}"
                )
            else:
                await self._api_client.enqueue_step(playlist, song)

            self._hass.bus.fire(
                EVENT_QUEUE_ADD,
                {
                    "entity_id": self.entity_id,
                    "playlist": playlist,
                    "song": song,
                },
            )

            # Update queue
            await self.async_update()

        except XScheduleAPIError as err:
            _LOGGER.error("Error adding to queue: %s", err)

    async def async_clear_queue(self) -> None:
        """Clear the playlist queue."""
        try:
            if self._websocket and self._websocket.connected:
                await self._websocket.send_command("Clear playlist queue")
            else:
                await self._api_client.clear_queue()

            self._queued_steps = []
            self._hass.bus.fire(EVENT_QUEUE_CLEAR, {"entity_id": self.entity_id})

        except XScheduleAPIError as err:
            _LOGGER.error("Error clearing queue: %s", err)

    async def async_jump_to_step(self, step: str) -> None:
        """Jump to specified step in current playlist at end of current step."""
        try:
            _LOGGER.debug("Jump to step called: step='%s'", step)
            if self._websocket and self._websocket.connected:
                _LOGGER.debug("Sending via WebSocket: 'Jump to specified step in current playlist at the end of current step' with step='%s'", step)
                await self._websocket.send_command(
                    "Jump to specified step in current playlist at the end of current step",
                    step
                )
            else:
                _LOGGER.debug("Sending via REST API: step='%s'", step)
                await self._api_client.jump_to_step_at_end(step)

            _LOGGER.info("Successfully jumped to step '%s' at end of current step", step)

        except XScheduleAPIError as err:
            _LOGGER.error("Error jumping to step '%s': %s", step, err)
            raise

    def _is_in_queue(self, song_name: str) -> bool:
        """Check if a song is already in the queue."""
        return any(step.get("name") == song_name for step in self._queued_steps)

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

            children.append(
                BrowseMedia(
                    can_expand=False,
                    can_play=True,
                    media_class=MediaType.MUSIC,
                    media_content_id=f"{playlist_name}|||{step_name}",  # delimiter
                    media_content_type=MediaType.MUSIC,
                    title=step_name,
                    thumbnail=None,
                )
            )

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
                # Use WebSocket for async command
                if self._websocket and self._websocket.connected:
                    _LOGGER.info("Sending WebSocket command: Play playlist step with params: %s,%s", playlist, song)
                    result = await self._websocket.send_command(
                        "Play playlist step", f"{playlist},{song}"
                    )
                    _LOGGER.info("WebSocket command result: %s", result)
                else:
                    # Fallback to REST API
                    _LOGGER.info("Using REST API fallback: play_playlist_step(%s, %s)", playlist, song)
                    result = await self._api_client.play_playlist_step(playlist, song)
                    _LOGGER.info("REST API result: %s", result)

                _LOGGER.info("Successfully played song %s from playlist %s", song, playlist)

                # Invalidate cache
                self._api_client.invalidate_cache(playlist)
                self._hass.bus.fire(
                    EVENT_PLAY,
                    {
                        "entity_id": self.entity_id,
                        "playlist": playlist,
                        "song": song,
                    },
                )

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
