"""Tests for xSchedule API client."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from aiohttp import ClientError, ClientResponseError
import time

from custom_components.xschedule.api_client import (
    XScheduleAPIClient,
    XScheduleAPIError,
    XScheduleConnectionError,
    XScheduleAuthError,
    X_SCHEDULE_NO_FAILURE_DETAIL,
    _command_status,
    format_command_failure,
    is_xschedule_no_detail_jump_error,
)


@pytest.fixture
def api_client():
    """Create API client instance."""
    return XScheduleAPIClient(
        host="192.168.1.100",
        port=80,
        password="testpass",
    )


@pytest.fixture
def api_client_no_password():
    """Create API client without password."""
    return XScheduleAPIClient(
        host="192.168.1.100",
        port=80,
        password=None,
    )


class TestAPIClientInit:
    """Test API client initialization."""

    def test_init_with_password(self, api_client):
        """Test initialization with password."""
        assert api_client.host == "192.168.1.100"
        assert api_client.port == 80
        assert api_client.password == "testpass"
        assert api_client._base_url == "http://192.168.1.100:80"

    def test_init_without_password(self, api_client_no_password):
        """Test initialization without password."""
        assert api_client_no_password.password is None

    def test_password_hash(self, api_client):
        """Test password MD5 hash generation."""
        hash_value = api_client._get_password_hash()
        assert hash_value is not None
        assert len(hash_value) == 32  # MD5 produces 32 char hex

    def test_no_password_hash(self, api_client_no_password):
        """Test password hash is None when no password."""
        assert api_client_no_password._get_password_hash() is None


class TestCaching:
    """Test caching behavior."""

    def test_cache_valid_within_ttl(self, api_client):
        """Test cache is valid within TTL."""
        current_time = time.time()
        assert api_client._is_cache_valid(current_time, 300) is True

    def test_cache_invalid_after_ttl(self, api_client):
        """Test cache is invalid after TTL expires."""
        old_time = time.time() - 400  # 400 seconds ago
        assert api_client._is_cache_valid(old_time, 300) is False

    def test_invalidate_specific_playlist(self, api_client):
        """Test invalidating cache for specific playlist."""
        # Add some cache entries
        api_client._schedule_cache["Playlist 1"] = ([{"test": "data"}], time.time())
        api_client._steps_cache["Playlist 1"] = ([{"step": "data"}], time.time())
        api_client._schedule_cache["Playlist 2"] = ([{"test": "data2"}], time.time())

        # Invalidate only Playlist 1
        api_client.invalidate_cache("Playlist 1")

        assert "Playlist 1" not in api_client._schedule_cache
        assert "Playlist 1" not in api_client._steps_cache
        assert "Playlist 2" in api_client._schedule_cache

    def test_invalidate_all_cache(self, api_client):
        """Test invalidating all cache."""
        # Add cache entries
        api_client._schedule_cache["Playlist 1"] = ([{"test": "data"}], time.time())
        api_client._steps_cache["Playlist 1"] = ([{"step": "data"}], time.time())

        # Invalidate all
        api_client.invalidate_cache()

        assert len(api_client._schedule_cache) == 0
        assert len(api_client._steps_cache) == 0


class TestAPIRequests:
    """Test API request methods."""

    @pytest.mark.asyncio
    async def test_get_playing_status_success(self, api_client):
        """Test successful get_playing_status call."""
        mock_response = {
            "status": "playing",
            "playlist": "Test Playlist",
            "step": "Test Song",
            "position": 30,
            "length": 180,
        }

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playing_status()

            assert result == mock_response
            assert result["status"] == "playing"
            assert result["playlist"] == "Test Playlist"

    @pytest.mark.asyncio
    async def test_get_playlists_success(self, api_client):
        """Test successful get_playlists call."""
        mock_response = {
            "playlists": ["Playlist 1", "Playlist 2", "Playlist 3"]
        }

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playlists()

            assert result == ["Playlist 1", "Playlist 2", "Playlist 3"]
            assert len(result) == 3

    @pytest.mark.asyncio
    async def test_get_playlist_steps_with_cache(self, api_client):
        """Test get_playlist_steps uses cache when valid."""
        cached_data = [{"name": "Song 1"}, {"name": "Song 2"}]
        api_client._steps_cache["Test Playlist"] = (cached_data, time.time())

        # Should return cached data without calling API
        result = await api_client.get_playlist_steps("Test Playlist")

        assert result == cached_data

    @pytest.mark.asyncio
    async def test_get_playlist_steps_force_refresh(self, api_client):
        """Test get_playlist_steps with force_refresh bypasses cache."""
        cached_data = [{"name": "Old Song"}]
        api_client._steps_cache["Test Playlist"] = (cached_data, time.time())

        new_data = [{"name": "New Song"}]
        mock_response = {"steps": new_data}

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playlist_steps("Test Playlist", force_refresh=True)

            assert result == new_data
            assert result != cached_data

    @pytest.mark.asyncio
    async def test_get_schedules_with_cache(self, api_client):
        """Test get_playlist_schedules uses cache when valid."""
        cached_data = [{"name": "Schedule 1"}]
        api_client._schedule_cache["TestPlaylist"] = (cached_data, time.time())

        result = await api_client.get_playlist_schedules("TestPlaylist")

        assert result == cached_data

    @pytest.mark.asyncio
    async def test_get_schedules_expired_cache(self, api_client):
        """Test get_playlist_schedules fetches fresh data when cache expired."""
        cached_data = [{"name": "Old Schedule"}]
        old_time = time.time() - 400  # Expired
        api_client._schedule_cache["TestPlaylist"] = (cached_data, old_time)

        new_data = [{"name": "New Schedule"}]
        mock_response = {"schedules": new_data}

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playlist_schedules("TestPlaylist")

            assert result == new_data

    @pytest.mark.asyncio
    async def test_play_playlist_success(self, api_client):
        """Test play_playlist command."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value={"result": "ok"})):
            await api_client.play_playlist("Test Playlist")

            # Should complete without error

    @pytest.mark.asyncio
    async def test_play_playlist_step_success(self, api_client):
        """Test play_playlist_step command."""
        with patch.object(api_client, '_request', new=AsyncMock(return_value={"result": "ok"})):
            await api_client.play_playlist_step("Test Playlist", "Song 1")

            # Should complete without error

    @pytest.mark.asyncio
    async def test_close_session(self, api_client):
        """Test closing client session."""
        # Create a mock session
        mock_session = MagicMock()
        mock_session.close = AsyncMock()
        api_client._session = mock_session
        api_client._own_session = True

        await api_client.close()

        mock_session.close.assert_called_once()
        assert api_client._session is None


class TestErrorHandling:
    """Test error handling."""

    @pytest.mark.asyncio
    async def test_connection_error(self, api_client):
        """Test handling of connection errors."""
        with patch.object(api_client, '_request', side_effect=ClientError("Connection failed")):
            with pytest.raises(Exception):
                await api_client.get_playing_status()

    @pytest.mark.asyncio
    async def test_empty_playlist_response(self, api_client):
        """Test handling of empty playlist list."""
        mock_response = {"playlists": []}

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playlists()

            assert result == []
            assert len(result) == 0

    @pytest.mark.asyncio
    async def test_missing_fields_in_response(self, api_client):
        """Test handling of responses with missing fields."""
        mock_response = {"status": "idle"}  # Missing other fields

        with patch.object(api_client, '_request', new=AsyncMock(return_value=mock_response)):
            result = await api_client.get_playing_status()

            assert result["status"] == "idle"
            assert "playlist" not in result


class TestCommandResultHelpers:
    """Tests for _command_status and format_command_failure."""

    def test_command_status_dict_ok_variants(self) -> None:
        """Result field is normalized case-insensitively."""
        assert _command_status({"result": "ok"}) == "ok"
        assert _command_status({"result": "OK"}) == "ok"
        assert _command_status({"result": " Ok "}) == "ok"
        assert _command_status({"result": "Failed"}) == "failed"
        assert _command_status({}) is None
        assert _command_status("not a dict") is None

    def test_format_command_failure_message_only(self) -> None:
        """Message text is used when present."""
        assert "cannot jump" in format_command_failure(
            {"result": "failed", "message": "cannot jump", "reference": ""}
        )

    def test_format_command_failure_empty_message_uses_reference(self) -> None:
        """Empty message still yields detail from reference when present."""
        out = format_command_failure(
            {"result": "failed", "message": "", "reference": "step1"}
        )
        assert "step1" in out

    def test_format_command_failure_whitespace_message_uses_reference(
        self,
    ) -> None:
        out = format_command_failure(
            {"result": "failed", "message": "   ", "reference": "ref2"}
        )
        assert "ref2" in out

    def test_format_command_failure_empty_message_and_reference(self) -> None:
        """No message and no reference still returns a non-empty explanation."""
        out = format_command_failure(
            {"result": "failed", "message": "", "reference": ""}
        )
        assert out
        assert out == X_SCHEDULE_NO_FAILURE_DETAIL

    def test_is_xschedule_no_detail_jump_error_true(self) -> None:
        """Jump exception with only the no-details detail is detectable."""
        err = XScheduleAPIError(f"Jump failed: {X_SCHEDULE_NO_FAILURE_DETAIL}")
        assert is_xschedule_no_detail_jump_error(err) is True

    def test_is_xschedule_no_detail_jump_error_false_with_message(self) -> None:
        err = XScheduleAPIError("Jump failed: output not ready")
        assert is_xschedule_no_detail_jump_error(err) is False

    def test_is_xschedule_no_detail_jump_error_false_unrelated(self) -> None:
        assert is_xschedule_no_detail_jump_error(XScheduleAPIError("connection failed")) is False
