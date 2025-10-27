"""API contract tests for xSchedule REST API responses.

These tests verify that the Python API client correctly parses actual
xSchedule API responses. They use real response structures from
xschedule_api_reference.md to ensure the integration handles all
field types, conversions, and edge cases correctly.
"""
import pytest
from unittest.mock import AsyncMock, patch

from custom_components.xschedule.api_client import (
    XScheduleAPIClient,
    XScheduleAPIError,
)
from tests.fixtures.api_responses import (
    PLAYING_STATUS_FULL,
    PLAYING_STATUS_BACKGROUND,
    PLAYING_STATUS_IDLE,
    PLAYING_STATUS_PAUSED,
    PLAYING_STATUS_MINIMAL,
    PLAYLISTS_RESPONSE,
    PLAYLISTS_RESPONSE_EMPTY,
    PLAYLISTS_RESPONSE_STRINGS,
    PLAYLIST_STEPS_HALLOWEEN,
    PLAYLIST_STEPS_BACKGROUND,
    PLAYLIST_STEPS_EMPTY,
    QUEUED_STEPS_WITH_ITEMS,
    QUEUED_STEPS_EMPTY,
    PLAYLIST_SCHEDULES_RESPONSE,
    PLAYLIST_SCHEDULES_EMPTY,
    RESPONSE_WITH_INVALID_MILLISECONDS,
    RESPONSE_WITH_MISSING_FIELDS,
    RESPONSE_WITH_NULL_VALUES,
    RESPONSE_WITH_EXTRA_FIELDS,
)


@pytest.fixture
def api_client():
    """Create API client instance."""
    return XScheduleAPIClient(
        host="192.168.1.100",
        port=80,
        password=None,
    )


class TestGetPlayingStatusContract:
    """Verify GetPlayingStatus response parsing."""

    @pytest.mark.asyncio
    async def test_parse_playing_full_response(self, api_client):
        """Parse complete playing status response with all fields.

        Verifies:
        - Status field parsed correctly
        - Playlist and step names extracted
        - Millisecond fields present (positionms, lengthms, leftms)
        - Volume parsed
        - Controller ping status present
        - All optional fields handled gracefully
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYING_STATUS_FULL)):
            result = await api_client.get_playing_status()

            # Verify core playback fields
            assert result["status"] == "playing"
            assert result["playlist"] == "Halloween"
            assert result["step"] == "Light Em Up"

            # Verify millisecond time fields (used by media_player.py)
            assert result["positionms"] == "117925"
            assert result["lengthms"] == "185750"
            assert result["leftms"] == "67825"

            # Verify volume
            assert result["volume"] == "100"

            # Verify controller health data
            assert "pingstatus" in result
            assert isinstance(result["pingstatus"], list)
            assert len(result["pingstatus"]) == 2
            assert result["pingstatus"][0]["controller"] == "192.168.1.101 Tree / Eves"
            assert result["pingstatus"][0]["result"] == "Ok"

            # Verify boolean strings (not native booleans)
            assert result["outputtolights"] == "true"
            assert isinstance(result["outputtolights"], str)

    @pytest.mark.asyncio
    async def test_parse_idle_response(self, api_client):
        """Parse idle status response with minimal fields.

        Verifies:
        - Handles missing playlist/step fields gracefully
        - Status correctly identified as "idle"
        - No errors when media fields absent
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYING_STATUS_IDLE)):
            result = await api_client.get_playing_status()

            assert result["status"] == "idle"
            assert "playlist" not in result
            assert "step" not in result
            assert result["volume"] == "100"

    @pytest.mark.asyncio
    async def test_parse_paused_response(self, api_client):
        """Parse paused status response."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYING_STATUS_PAUSED)):
            result = await api_client.get_playing_status()

            assert result["status"] == "paused"
            assert result["playlist"] == "Halloween"
            assert result["positionms"] == "90000"

    @pytest.mark.asyncio
    async def test_parse_minimal_response(self, api_client):
        """Parse response with only status field.

        Tests graceful degradation when API returns minimal data.
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYING_STATUS_MINIMAL)):
            result = await api_client.get_playing_status()

            assert result["status"] == "playing"
            assert "playlist" not in result
            assert "step" not in result


class TestGetPlaylistsContract:
    """Verify GetPlaylists response parsing."""

    @pytest.mark.asyncio
    async def test_parse_playlists_with_metadata(self, api_client):
        """Parse playlists with full metadata (dict format).

        Verifies:
        - Extracts playlist names from dict objects
        - Handles metadata fields (lengthms, looping, nextscheduled)
        - Returns list of strings (api_client.py:168)
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLISTS_RESPONSE)):
            result = await api_client.get_playlists()

            # Should extract names only
            assert isinstance(result, list)
            assert len(result) == 2
            assert "Halloween Background" in result
            assert "Halloween" in result

    @pytest.mark.asyncio
    async def test_parse_playlists_string_format(self, api_client):
        """Parse playlists when API returns simple string list."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLISTS_RESPONSE_STRINGS)):
            result = await api_client.get_playlists()

            assert isinstance(result, list)
            assert len(result) == 2
            assert "Halloween Background" in result
            assert "Halloween" in result

    @pytest.mark.asyncio
    async def test_parse_empty_playlists(self, api_client):
        """Parse empty playlist response."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLISTS_RESPONSE_EMPTY)):
            result = await api_client.get_playlists()

            assert isinstance(result, list)
            assert len(result) == 0


class TestGetPlaylistStepsContract:
    """Verify GetPlayListSteps response parsing."""

    @pytest.mark.asyncio
    async def test_parse_playlist_steps_halloween(self, api_client):
        """Parse Halloween playlist steps.

        Verifies:
        - Extracts step list from "steps" key
        - Step names present
        - Duration in milliseconds (lengthms field)
        - Additional metadata available (offset, startonly, etc.)
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_STEPS_HALLOWEEN)):
            result = await api_client.get_playlist_steps("Halloween")

            assert isinstance(result, list)
            assert len(result) == 3

            # Verify first step
            step1 = result[0]
            assert step1["name"] == "Light Em Up"
            assert step1["lengthms"] == "185750"
            assert step1["offset"] == "0:00.000"

            # Verify second step
            step2 = result[1]
            assert step2["name"] == "Pirates of the Caribbean"
            assert step2["lengthms"] == "289400"

    @pytest.mark.asyncio
    async def test_parse_playlist_steps_background(self, api_client):
        """Parse Halloween Background playlist (single step)."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_STEPS_BACKGROUND)):
            result = await api_client.get_playlist_steps("Halloween Background")

            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["name"] == "House lights"
            assert result[0]["lengthms"] == "120000"

    @pytest.mark.asyncio
    async def test_parse_empty_playlist_steps(self, api_client):
        """Parse playlist with no steps."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_STEPS_EMPTY)):
            result = await api_client.get_playlist_steps("Empty Playlist")

            assert isinstance(result, list)
            assert len(result) == 0


class TestGetQueuedStepsContract:
    """Verify GetQueuedSteps response parsing."""

    @pytest.mark.asyncio
    async def test_parse_queued_steps_with_items(self, api_client):
        """Parse queue with queued items.

        Verifies:
        - Queue items extracted from "steps" key
        - Each item has name and duration
        - Playlist field present (which playlist step is from)
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=QUEUED_STEPS_WITH_ITEMS)):
            result = await api_client.get_queued_steps()

            assert isinstance(result, list)
            assert len(result) == 2

            assert result[0]["name"] == "Thriller"
            assert result[0]["lengthms"] == "358000"
            assert result[0]["playlist"] == "Halloween"

    @pytest.mark.asyncio
    async def test_parse_empty_queue(self, api_client):
        """Parse empty queue."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=QUEUED_STEPS_EMPTY)):
            result = await api_client.get_queued_steps()

            assert isinstance(result, list)
            assert len(result) == 0


class TestGetPlaylistSchedulesContract:
    """Verify GetPlayListSchedules response parsing."""

    @pytest.mark.asyncio
    async def test_parse_playlist_schedules(self, api_client):
        """Parse playlist schedules.

        Verifies:
        - Schedules extracted from "schedules" key
        - Schedule metadata present (enabled, active, times)
        - Boolean strings ("true"/"false")
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_SCHEDULES_RESPONSE)):
            result = await api_client.get_playlist_schedules("Halloween")

            assert isinstance(result, list)
            assert len(result) == 2

            # Verify first schedule
            sched1 = result[0]
            assert sched1["name"] == "October sunset-30 -> 11pm"
            assert sched1["enabled"] == "true"
            assert sched1["active"] == "true"
            assert sched1["playlist"] == "Halloween"
            assert sched1["starttime"] == "17:00:00"

    @pytest.mark.asyncio
    async def test_parse_empty_schedules(self, api_client):
        """Parse playlist with no schedules."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_SCHEDULES_EMPTY)):
            result = await api_client.get_playlist_schedules("No Schedules")

            assert isinstance(result, list)
            assert len(result) == 0


class TestDataTypeConversions:
    """Test correct handling of xSchedule's data type conventions."""

    def test_boolean_strings_not_native_booleans(self):
        """Verify boolean fields are strings "true"/"false", not True/False.

        xSchedule API returns strings, not native booleans. This is
        important because Python's media_player.py must handle strings.
        """
        response = PLAYING_STATUS_FULL

        assert response["outputtolights"] == "true"
        assert isinstance(response["outputtolights"], str)
        assert response["outputtolights"] is not True

        assert response["playlistlooping"] == "true"
        assert isinstance(response["playlistlooping"], str)

    def test_millisecond_fields_are_strings(self):
        """Verify millisecond fields are strings, not integers.

        The API returns time values as strings. Python code must
        convert them to int/float for use.
        """
        response = PLAYING_STATUS_FULL

        assert response["positionms"] == "117925"
        assert isinstance(response["positionms"], str)

        assert response["lengthms"] == "185750"
        assert isinstance(response["lengthms"], str)

    def test_id_fields_are_strings(self):
        """Verify ID fields are strings (session-specific, not persistent).

        xSchedule docs: "Unique ID is valid for this session only"
        """
        response = PLAYING_STATUS_FULL

        assert response["playlistid"] == "11"
        assert isinstance(response["playlistid"], str)

        assert response["stepid"] == "17"
        assert isinstance(response["stepid"], str)


class TestEdgeCases:
    """Test edge cases and error conditions."""

    @pytest.mark.asyncio
    async def test_invalid_millisecond_values(self, api_client):
        """Test handling of invalid millisecond values.

        When API returns non-numeric values, Python code should
        handle gracefully (media_player.py uses try/except).
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=RESPONSE_WITH_INVALID_MILLISECONDS)):
            result = await api_client.get_playing_status()

            # Should not raise exception
            assert result["status"] == "playing"
            assert result["positionms"] == "invalid"  # Returned as-is

    @pytest.mark.asyncio
    async def test_missing_fields(self, api_client):
        """Test response with missing optional fields.

        API may omit fields when not applicable. Code should not
        assume all fields present.
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=RESPONSE_WITH_MISSING_FIELDS)):
            result = await api_client.get_playing_status()

            assert result["status"] == "playing"
            assert "playlist" not in result
            assert "step" not in result

    @pytest.mark.asyncio
    async def test_null_values(self, api_client):
        """Test response with null/None values."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=RESPONSE_WITH_NULL_VALUES)):
            result = await api_client.get_playing_status()

            assert result["status"] == "playing"
            assert result["playlist"] is None
            assert result["step"] is None

    @pytest.mark.asyncio
    async def test_extra_fields_ignored(self, api_client):
        """Test forward compatibility - extra fields don't break parsing.

        Future xSchedule versions may add new fields. Code should
        ignore unknown fields gracefully.
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=RESPONSE_WITH_EXTRA_FIELDS)):
            result = await api_client.get_playing_status()

            assert result["status"] == "playing"
            assert result["playlist"] == "Halloween"
            # Extra fields present but don't cause errors
            assert "future_field_1" in result


class TestCaching:
    """Test API client caching behavior."""

    @pytest.mark.asyncio
    async def test_playlist_steps_caching(self, api_client):
        """Verify playlist steps are cached (3 minute TTL).

        Important for CPU optimization (v1.2.1).
        Reduces API calls and network traffic.
        """
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_STEPS_HALLOWEEN)):
            # First call - should hit API
            result1 = await api_client.get_playlist_steps("Halloween")
            assert len(result1) == 3

            # Second call - should use cache
            result2 = await api_client.get_playlist_steps("Halloween")
            assert result2 == result1

            # Verify API only called once (cached)
            assert api_client._request.call_count == 1

    @pytest.mark.asyncio
    async def test_playlist_schedules_caching(self, api_client):
        """Verify playlist schedules are cached (5 minute TTL)."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_SCHEDULES_RESPONSE)):
            # First call
            result1 = await api_client.get_playlist_schedules("Halloween")
            assert len(result1) == 2

            # Second call - cached
            result2 = await api_client.get_playlist_schedules("Halloween")
            assert result2 == result1

            # API called once
            assert api_client._request.call_count == 1

    @pytest.mark.asyncio
    async def test_force_refresh_bypasses_cache(self, api_client):
        """Verify force_refresh parameter bypasses cache."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value=PLAYLIST_STEPS_HALLOWEEN)):
            # First call - populate cache
            result1 = await api_client.get_playlist_steps("Halloween")

            # Second call with force_refresh - should hit API
            result2 = await api_client.get_playlist_steps("Halloween", force_refresh=True)

            # API called twice (cache bypassed)
            assert api_client._request.call_count == 2

    def test_cache_invalidation_specific_playlist(self, api_client):
        """Test invalidating cache for specific playlist."""
        import time

        # Add cache entries
        api_client._steps_cache["Halloween"] = ([{"name": "Song 1"}], time.time())
        api_client._schedule_cache["Halloween"] = ([{"name": "Sched 1"}], time.time())
        api_client._steps_cache["Background"] = ([{"name": "Song 2"}], time.time())

        # Invalidate only Halloween
        api_client.invalidate_cache("Halloween")

        assert "Halloween" not in api_client._steps_cache
        assert "Halloween" not in api_client._schedule_cache
        assert "Background" in api_client._steps_cache  # Not cleared

    def test_cache_invalidation_all_playlists(self, api_client):
        """Test invalidating all cache."""
        import time

        # Add cache entries
        api_client._steps_cache["Halloween"] = ([{"name": "Song 1"}], time.time())
        api_client._schedule_cache["Background"] = ([{"name": "Sched 1"}], time.time())

        # Invalidate all
        api_client.invalidate_cache()

        assert len(api_client._steps_cache) == 0
        assert len(api_client._schedule_cache) == 0
