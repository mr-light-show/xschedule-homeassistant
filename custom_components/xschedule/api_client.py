"""xSchedule API client for Home Assistant integration."""
from __future__ import annotations

import asyncio
import hashlib
import logging
from typing import Any
from urllib.parse import quote, urlencode

import aiohttp

from .const import API_COMMAND, API_QUERY

_LOGGER = logging.getLogger(__name__)


class XScheduleAPIError(Exception):
    """Base exception for xSchedule API errors."""


class XScheduleConnectionError(XScheduleAPIError):
    """Exception for connection errors."""


class XScheduleAuthError(XScheduleAPIError):
    """Exception for authentication errors."""


class XScheduleAPIClient:
    """Client for interacting with xSchedule API."""

    def __init__(
        self,
        host: str,
        port: int,
        password: str | None = None,
        session: aiohttp.ClientSession | None = None,
    ) -> None:
        """Initialize the API client."""
        self.host = host
        self.port = port
        self.password = password
        self._session = session
        self._own_session = session is None
        self._base_url = f"http://{host}:{port}"

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None:
            self._session = aiohttp.ClientSession()
        return self._session

    async def close(self) -> None:
        """Close the API client session."""
        if self._own_session and self._session:
            await self._session.close()
            self._session = None

    def _get_password_hash(self) -> str | None:
        """Get MD5 hash of password if configured."""
        if self.password:
            return hashlib.md5(self.password.encode()).hexdigest()
        return None

    async def _request(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
        timeout: int = 10,
    ) -> Any:
        """Make HTTP request to xSchedule API."""
        session = await self._get_session()

        # Add password if configured
        if params is None:
            params = {}
        if self.password:
            params["Pass"] = self._get_password_hash()

        # Build URL manually with pre-encoded parameters
        # We do this because xSchedule requires %20 for spaces, not +
        # Parameters dict already has pre-encoded values from query()/command()
        url = f"{self._base_url}/{endpoint}"
        if params:
            # Build query string manually to preserve our encoding
            query_parts = []
            for key, value in params.items():
                # Value is already encoded if it came from query()/command()
                # Don't encode again
                query_parts.append(f"{key}={value}")
            url = f"{url}?{'&'.join(query_parts)}"

        try:
            async with asyncio.timeout(timeout):
                # Don't pass params - URL already has query string
                async with session.get(url) as response:
                    response.raise_for_status()
                    data = await response.json()

                    # Check for authentication error
                    if isinstance(data, dict) and data.get("result") == "failed":
                        if "password" in data.get("message", "").lower():
                            raise XScheduleAuthError("Authentication failed")

                    return data
        except aiohttp.ClientError as err:
            _LOGGER.error("Error connecting to xSchedule at %s: %s", url, err)
            raise XScheduleConnectionError(f"Connection failed: {err}") from err
        except asyncio.TimeoutError as err:
            _LOGGER.error("Timeout connecting to xSchedule at %s", url)
            raise XScheduleConnectionError("Connection timeout") from err

    async def query(self, query_name: str, parameters: str = "") -> Any:
        """Execute a query against xSchedule API."""
        params = {"Query": query_name}
        if parameters:
            # Manually encode parameters to use %20 instead of + for spaces
            # xSchedule doesn't accept + as space encoding
            params["Parameters"] = quote(parameters, safe='')

        _LOGGER.debug("Executing query: %s with params: %s", query_name, parameters)
        return await self._request(API_QUERY, params)

    async def command(self, command_name: str, parameters: str = "") -> Any:
        """Execute a command against xSchedule API."""
        params = {"Command": command_name}
        if parameters:
            # Manually encode parameters to use %20 instead of + for spaces
            # xSchedule doesn't accept + as space encoding
            params["Parameters"] = quote(parameters, safe='')

        _LOGGER.debug("Executing command: %s with params: %s", command_name, parameters)
        return await self._request(API_COMMAND, params)

    # Status and information queries

    async def get_playing_status(self) -> dict[str, Any]:
        """Get current playing status."""
        return await self.query("GetPlayingStatus")

    async def get_playlists(self) -> list[str]:
        """Get list of all playlists."""
        result = await self.query("GetPlayLists")
        # API returns dict with 'playlists' key containing list of playlist objects
        if isinstance(result, dict) and "playlists" in result:
            playlists = result["playlists"]
            # Extract playlist names from objects (handle both string and object formats)
            if playlists and isinstance(playlists[0], dict):
                return [p.get("name", p) for p in playlists]
            return playlists
        return []

    async def get_playlist_steps(self, playlist_name: str) -> list[dict[str, Any]]:
        """Get list of steps/songs in a playlist."""
        result = await self.query("GetPlayListSteps", playlist_name)
        # API returns dict with 'steps' key containing list
        if isinstance(result, dict) and "steps" in result:
            return result["steps"]
        return []

    async def get_queued_steps(self) -> list[dict[str, Any]]:
        """Get list of queued steps."""
        result = await self.query("GetQueuedSteps")
        if isinstance(result, dict) and "steps" in result:
            return result["steps"]
        return []

    async def get_playlist_schedules(self, playlist_name: str) -> list[dict[str, Any]]:
        """Get schedule information for a playlist."""
        _LOGGER.warning("xSchedule API: Getting schedules for playlist: '%s'", playlist_name)
        result = await self.query("GetPlayListSchedules", playlist_name)
        _LOGGER.warning("xSchedule API: Result for '%s': %s", playlist_name, result)
        if isinstance(result, dict) and "schedules" in result:
            _LOGGER.warning("xSchedule API: Found %d schedules for '%s'", len(result["schedules"]), playlist_name)
            return result["schedules"]
        _LOGGER.warning("xSchedule API: No schedules found for '%s'", playlist_name)
        return []

    # Playback control commands

    async def play_playlist(self, playlist_name: str) -> dict[str, Any]:
        """Play specified playlist."""
        return await self.command("Play specified playlist", playlist_name)

    async def pause(self) -> dict[str, Any]:
        """Pause playback."""
        return await self.command("Pause")

    async def stop(self) -> dict[str, Any]:
        """Stop playback."""
        return await self.command("Stop")

    async def next_step(self) -> dict[str, Any]:
        """Go to next step in current playlist."""
        return await self.command("Next step in current playlist")

    async def previous_step(self) -> dict[str, Any]:
        """Go to previous step in current playlist."""
        return await self.command("Prior step in current playlist")

    async def restart_step(self) -> dict[str, Any]:
        """Restart current step."""
        return await self.command("Restart step in current playlist")

    async def play_playlist_step(
        self, playlist_name: str, step_name: str
    ) -> dict[str, Any]:
        """Play specific step in a playlist."""
        params = f"{playlist_name},{step_name}"
        return await self.command("Play playlist step", params)

    async def set_step_position(self, position_ms: int) -> dict[str, Any]:
        """Set playback position in current step (seek)."""
        return await self.command("Set step position ms", str(position_ms))

    # Volume control commands

    async def set_volume(self, volume: int) -> dict[str, Any]:
        """Set volume level (0-100)."""
        return await self.command("Set volume to", str(volume))

    async def adjust_volume(self, adjustment: int) -> dict[str, Any]:
        """Adjust volume by relative amount (-100 to 100)."""
        return await self.command("Adjust volume by", str(adjustment))

    async def toggle_mute(self) -> dict[str, Any]:
        """Toggle mute state."""
        return await self.command("Toggle mute")

    # Queue management commands

    async def enqueue_step(
        self, playlist_name: str, step_name: str
    ) -> dict[str, Any]:
        """Add a step to the queue."""
        params = f"{playlist_name},{step_name}"
        return await self.command("Enqueue playlist step", params)

    async def clear_queue(self) -> dict[str, Any]:
        """Clear the playlist queue."""
        return await self.command("Clear playlist queue")

    # Validation and testing

    async def validate_connection(self) -> bool:
        """Validate connection to xSchedule."""
        try:
            status = await self.get_playing_status()
            return isinstance(status, dict)
        except XScheduleAPIError:
            return False
