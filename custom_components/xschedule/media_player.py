"""Media player platform for xSchedule integration."""
from __future__ import annotations

import logging
from typing import Any
from datetime import datetime

from homeassistant.components.media_player import (
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

    async_add_entities([entity], True)


class XScheduleMediaPlayer(MediaPlayerEntity):
    """Representation of an xSchedule media player."""

    _attr_media_content_type = MediaType.PLAYLIST
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

        # WebSocket connection
        self._websocket: XScheduleWebSocket | None = None
        self._setup_websocket()

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

        # Update state from status
        status = data.get("status", "idle").lower()
        if status == "playing":
            self._attr_state = MediaPlayerState.PLAYING
        elif status == "paused":
            self._attr_state = MediaPlayerState.PAUSED
        else:
            self._attr_state = MediaPlayerState.IDLE

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

        # Schedule entity update (only if entity has been added to hass)
        if self.hass and self.entity_id:
            self.schedule_update_ha_state()

    async def async_update(self) -> None:
        """Update the entity state."""
        try:
            # Get playing status (only if WebSocket not connected)
            if not self._websocket or not self._websocket.connected:
                status = await self._api_client.get_playing_status()
                self._handle_websocket_update(status)

            # Get playlists
            self._playlists = await self._api_client.get_playlists()

            # Get current playlist steps if playlist is playing
            if self._attr_media_playlist:
                self._current_playlist_steps = await self._api_client.get_playlist_steps(
                    self._attr_media_playlist
                )

            # Get queued steps
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
        }

        # Add current playlist steps (songs)
        if self._current_playlist_steps:
            attributes["playlist_songs"] = [
                {
                    "name": step.get("name"),
                    "duration": step.get("duration"),
                }
                for step in self._current_playlist_steps
            ]

        # Add queued steps
        if self._queued_steps:
            attributes["queue"] = [
                {
                    "name": step.get("name"),
                    "id": step.get("id"),
                    "duration": step.get("length"),
                }
                for step in self._queued_steps
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

    def _is_in_queue(self, song_name: str) -> bool:
        """Check if a song is already in the queue."""
        return any(step.get("name") == song_name for step in self._queued_steps)

    async def async_get_playlist_schedules(self, playlist: str) -> list[dict[str, Any]]:
        """Get schedule information for a playlist."""
        try:
            return await self._api_client.get_playlist_schedules(playlist)
        except XScheduleAPIError as err:
            _LOGGER.error("Error getting playlist schedules: %s", err)
            return []
