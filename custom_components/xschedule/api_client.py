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
        # Cache storage: dict[playlist_name, tuple[data, timestamp]]
        self._schedule_cache: dict[str, tuple[list[dict[str, Any]], float]] = {}
        self._steps_cache: dict[str, tuple[list[dict[str, Any]], float]] = {}
        self._schedule_cache_ttl = 300  # 5 minutes for schedules (reduced from 10)
        self._steps_cache_ttl = 180  # 3 minutes for steps/songs (reduced from 5)

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

    def _is_cache_valid(self, cache_time: float, ttl: int) -> bool:
        """Check if cache entry is still valid."""
        import time
        return (time.time() - cache_time) < ttl

    def invalidate_cache(self, playlist_name: str | None = None) -> None:
        """Invalidate cache for a playlist or all playlists."""
        if playlist_name:
            self._schedule_cache.pop(playlist_name, None)
            self._steps_cache.pop(playlist_name, None)
        else:
            self._schedule_cache.clear()
            self._steps_cache.clear()

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
        # Manually encode command name to use %20 instead of + for spaces
        # xSchedule doesn't accept + as space encoding
        params = {"Command": quote(command_name, safe='')}
        if parameters:
            # Manually encode parameters to use %20 instead of + for spaces
            params["Parameters"] = quote(parameters, safe='')

        _LOGGER.debug("Executing command: %s with params: %s", command_name, parameters)
        result = await self._request(API_COMMAND, params)
        _LOGGER.debug("Command response: %s", result)
        
        # Check if command failed
        if isinstance(result, dict) and result.get("result") == "failed":
            _LOGGER.warning("Command '%s' failed: %s", command_name, result.get("message", "Unknown error"))
        
        return result

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

    async def get_playlists_with_metadata(self, force_refresh: bool = False) -> list[dict[str, Any]]:
        """Get full playlist objects with all metadata (duration, loop status, etc.)."""
        import time

        # Force refresh: invalidate cache first
        if force_refresh:
            _LOGGER.debug("Force refresh requested for playlists metadata")
            self._playlists_cache = {}
            self._playlists_cache_time = 0

        # Check cache first (same cache as get_playlists, 5 min TTL)
        if self._playlists_cache_time and (time.time() - self._playlists_cache_time < 300):
            if "metadata" in self._playlists_cache:
                _LOGGER.debug("Using cached playlists metadata")
                return self._playlists_cache["metadata"]

        try:
            result = await self.query("GetPlaylists")
        except XScheduleAPIError as err:
            _LOGGER.error("Failed to get playlists metadata: %s", err)
            return []

        # API returns dict with 'playlists' key containing list of playlist objects
        if isinstance(result, dict) and "playlists" in result:
            playlists = result["playlists"]
            if playlists and isinstance(playlists[0], dict):
                # Cache full playlist objects
                self._playlists_cache["metadata"] = playlists
                self._playlists_cache_time = time.time()
                return playlists
        return []

    async def get_playlist_steps(self, playlist_name: str, force_refresh: bool = False) -> list[dict[str, Any]]:
        """Get list of steps/songs in a playlist (with 3 min caching)."""
        import time

        # Force refresh: invalidate cache first
        if force_refresh:
            _LOGGER.debug("Force refresh requested for steps: '%s'", playlist_name)
            self._steps_cache.pop(playlist_name, None)

        # Check cache first
        if playlist_name in self._steps_cache:
            cached_steps, cache_time = self._steps_cache[playlist_name]
            if self._is_cache_valid(cache_time, self._steps_cache_ttl):
                _LOGGER.debug("Using cached steps for '%s'", playlist_name)
                return cached_steps

        # Cache miss or expired - fetch from API
        _LOGGER.debug("Fetching steps for playlist: '%s'", playlist_name)
        result = await self.query("GetPlayListSteps", playlist_name)
        # API returns dict with 'steps' key containing list
        if isinstance(result, dict) and "steps" in result:
            steps = result["steps"]
            # Store in cache with current timestamp
            self._steps_cache[playlist_name] = (steps, time.time())
            return steps
        return []

    async def get_queued_steps(self) -> list[dict[str, Any]]:
        """Get list of queued steps."""
        result = await self.query("GetQueuedSteps")
        if isinstance(result, dict) and "steps" in result:
            return result["steps"]
        return []

    async def get_playlist_schedules(self, playlist_name: str, force_refresh: bool = False) -> list[dict[str, Any]]:
        """Get schedule information for a playlist (with 5 min caching)."""
        import time

        # Force refresh: invalidate cache first
        if force_refresh:
            _LOGGER.debug("Force refresh requested for schedules: '%s'", playlist_name)
            self._schedule_cache.pop(playlist_name, None)

        # Check cache first
        if playlist_name in self._schedule_cache:
            cached_schedules, cache_time = self._schedule_cache[playlist_name]
            if self._is_cache_valid(cache_time, self._schedule_cache_ttl):
                _LOGGER.debug("Using cached schedules for '%s'", playlist_name)
                return cached_schedules

        # Cache miss or expired - fetch from API
        _LOGGER.debug("Fetching schedules for playlist: '%s'", playlist_name)
        result = await self.query("GetPlayListSchedules", playlist_name)
        if isinstance(result, dict) and "schedules" in result:
            schedules = result["schedules"]
            # Store in cache with current timestamp
            self._schedule_cache[playlist_name] = (schedules, time.time())
            _LOGGER.debug("Found %d schedules for '%s'", len(schedules), playlist_name)
            return schedules
        _LOGGER.debug("No schedules found for '%s'", playlist_name)
        return []

    # Playback control commands

    async def play_playlist(self, playlist_name: str) -> dict[str, Any]:
        """Play specified playlist."""
        result = await self.command("Play specified playlist", playlist_name)
        self.invalidate_cache(playlist_name)
        return result

    async def pause(self) -> dict[str, Any]:
        """Pause playback."""
        result = await self.command("Pause")
        self.invalidate_cache()
        return result

    async def stop(self) -> dict[str, Any]:
        """Stop playback."""
        result = await self.command("Stop")
        self.invalidate_cache()
        return result

    async def stop_all_now(self) -> dict[str, Any]:
        """Stop all playlists, schedules, and empty the queue."""
        result = await self.command("Stop all now")
        self.invalidate_cache()
        return result

    async def next_step(self) -> dict[str, Any]:
        """Go to next step in current playlist."""
        result = await self.command("Next step in current playlist")
        self.invalidate_cache()
        return result

    async def previous_step(self) -> dict[str, Any]:
        """Go to previous step in current playlist."""
        result = await self.command("Prior step in current playlist")
        self.invalidate_cache()
        return result

    async def restart_step(self) -> dict[str, Any]:
        """Restart current step."""
        result = await self.command("Restart step in current playlist")
        self.invalidate_cache()
        return result

    async def play_playlist_step(
        self, playlist_name: str, step_name: str
    ) -> dict[str, Any]:
        """Play specific step in a playlist."""
        params = f"{playlist_name},{step_name}"
        result = await self.command("Play playlist step", params)
        self.invalidate_cache(playlist_name)
        return result

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
        result = await self.command("Enqueue playlist step", params)
        self.invalidate_cache()
        return result

    async def clear_queue(self) -> dict[str, Any]:
        """Clear the playlist queue."""
        result = await self.command("Clear playlist queue")
        self.invalidate_cache()
        return result

    async def jump_to_step_at_end(self, step_name: str) -> dict[str, Any]:
        """Jump to specified step in current playlist at end of current step."""
        result = await self.command(
            "Jump to specified step in current playlist at the end of current step",
            step_name
        )
        self.invalidate_cache()
        return result

    # Validation and testing

    async def validate_connection(self) -> bool:
        """Validate connection to xSchedule."""
        try:
            status = await self.get_playing_status()
            return isinstance(status, dict)
        except XScheduleAPIError:
            return False
