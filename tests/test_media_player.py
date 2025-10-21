"""Tests for xSchedule media player entity."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from homeassistant.components.media_player import MediaPlayerState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.xschedule.media_player import XScheduleMediaPlayer
from custom_components.xschedule.const import DOMAIN, EVENT_CACHE_INVALIDATED


@pytest.fixture
def mock_api_client():
    """Create mock API client."""
    client = MagicMock()
    client.get_playing_status = AsyncMock(return_value={
        "status": "playing",
        "playlist": "Test Playlist",
        "step": "Test Song",
        "positionms": 30000,
        "lengthms": 180000,
        "leftms": 150000,
    })
    client.get_playlists = AsyncMock(return_value=["Playlist 1", "Playlist 2"])
    client.invalidate_cache = MagicMock()
    client.play_playlist = AsyncMock()
    client.play_playlist_step = AsyncMock()
    client.close = AsyncMock()
    return client


@pytest.fixture
def mock_websocket():
    """Create mock WebSocket client."""
    ws = MagicMock()
    ws.connect = AsyncMock()
    ws.disconnect = AsyncMock()
    ws.is_connected = False
    return ws


@pytest.fixture
async def media_player_entity(hass: HomeAssistant, mock_api_client, mock_websocket):
    """Create media player entity for testing."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        title="xSchedule Test",
        data={
            "host": "192.168.1.100",
            "port": 80,
            "password": "",
        },
    )

    entity = XScheduleMediaPlayer(
        config_entry=config_entry,
        api_client=mock_api_client,
        websocket=mock_websocket,
    )
    entity.hass = hass
    entity._attr_unique_id = "xschedule_test"
    entity.entity_id = "media_player.xschedule_test"

    return entity


class TestMediaPlayerStateTransitions:
    """Test media player state transitions."""

    @pytest.mark.asyncio
    async def test_playing_state(self, media_player_entity):
        """Test entity transitions to playing state."""
        data = {
            "status": "playing",
            "playlist": "Test Playlist",
            "step": "Test Song",
            "positionms": 30000,
            "lengthms": 180000,
        }

        media_player_entity._handle_websocket_update(data)

        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity.media_title == "Test Song"
        assert media_player_entity.media_playlist == "Test Playlist"
        assert media_player_entity.media_position == 30.0
        assert media_player_entity.media_duration == 180.0

    @pytest.mark.asyncio
    async def test_paused_state(self, media_player_entity):
        """Test entity transitions to paused state."""
        data = {
            "status": "paused",
            "playlist": "Test Playlist",
            "step": "Test Song",
        }

        media_player_entity._handle_websocket_update(data)

        assert media_player_entity.state == MediaPlayerState.PAUSED

    @pytest.mark.asyncio
    async def test_idle_state_clears_attributes(self, media_player_entity):
        """Test that idle state clears all media attributes (bug fix verification)."""
        # First set some data
        media_player_entity._attr_media_title = "Old Song"
        media_player_entity._attr_media_playlist = "Old Playlist"
        media_player_entity._attr_media_position = 30.0
        media_player_entity._attr_media_duration = 180.0
        media_player_entity._time_remaining = 150.0
        media_player_entity._attr_state = MediaPlayerState.PLAYING

        # Now transition to idle
        data = {"status": "idle"}
        media_player_entity._handle_websocket_update(data)

        # Verify ALL attributes are cleared
        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity.media_title is None
        assert media_player_entity.media_playlist is None
        assert media_player_entity.media_position is None
        assert media_player_entity.media_duration is None
        assert media_player_entity._time_remaining is None

    @pytest.mark.asyncio
    async def test_idle_without_old_data(self, media_player_entity):
        """Test idle state when no previous data exists."""
        data = {"status": "idle"}

        media_player_entity._handle_websocket_update(data)

        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity.media_title is None
        assert media_player_entity.media_playlist is None


class TestCacheInvalidation:
    """Test cache invalidation behavior."""

    @pytest.mark.asyncio
    async def test_cache_invalidated_on_state_change(self, hass: HomeAssistant, media_player_entity, mock_api_client):
        """Test cache is invalidated when state changes."""
        media_player_entity._attr_state = MediaPlayerState.PLAYING

        data = {"status": "paused"}
        media_player_entity._handle_websocket_update(data)

        # Verify cache was invalidated
        mock_api_client.invalidate_cache.assert_called_once()

    @pytest.mark.asyncio
    async def test_cache_invalidated_on_playlist_change(self, hass: HomeAssistant, media_player_entity, mock_api_client):
        """Test cache is invalidated when playlist changes."""
        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Old Playlist"

        data = {
            "status": "playing",
            "playlist": "New Playlist",
        }
        media_player_entity._handle_websocket_update(data)

        # Verify cache was invalidated
        mock_api_client.invalidate_cache.assert_called_once()

    @pytest.mark.asyncio
    async def test_cache_not_invalidated_without_change(self, hass: HomeAssistant, media_player_entity, mock_api_client):
        """Test cache is not invalidated when no state/playlist change."""
        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Test Playlist"

        data = {
            "status": "playing",
            "playlist": "Test Playlist",
            "step": "Different Song",  # Only song changed
        }
        media_player_entity._handle_websocket_update(data)

        # Cache should not be invalidated for song-only changes
        mock_api_client.invalidate_cache.assert_not_called()

    @pytest.mark.asyncio
    async def test_cache_invalidation_event_fired(self, hass: HomeAssistant, media_player_entity):
        """Test cache invalidation event is fired (bug fix verification)."""
        events = []

        def capture_event(event):
            events.append(event)

        hass.bus.async_listen(EVENT_CACHE_INVALIDATED, capture_event)

        # Set initial state
        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Old Playlist"

        # Change state
        data = {
            "status": "idle",
        }
        media_player_entity._handle_websocket_update(data)

        # Wait for event processing
        await hass.async_block_till_done()

        # Verify event was fired
        assert len(events) == 1
        event_data = events[0].data
        assert event_data["entity_id"] == "media_player.xschedule_test"
        assert event_data["old_state"] == str(MediaPlayerState.PLAYING)
        assert event_data["new_state"] == str(MediaPlayerState.IDLE)
        assert event_data["old_playlist"] == "Old Playlist"


class TestWebSocketUpdates:
    """Test WebSocket update handling."""

    @pytest.mark.asyncio
    async def test_conditional_updates_with_missing_fields(self, media_player_entity):
        """Test updates work correctly when fields are missing."""
        # Set initial data
        media_player_entity._attr_media_title = "Old Song"
        media_player_entity._attr_media_playlist = "Old Playlist"
        media_player_entity._attr_state = MediaPlayerState.PLAYING

        # Update with only status field (no playlist or step)
        data = {"status": "playing"}
        media_player_entity._handle_websocket_update(data)

        # Old values should persist for non-idle states
        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity.media_title == "Old Song"
        assert media_player_entity.media_playlist == "Old Playlist"

    @pytest.mark.asyncio
    async def test_position_update_milliseconds(self, media_player_entity):
        """Test position is correctly converted from milliseconds."""
        data = {
            "status": "playing",
            "positionms": 45000,  # 45 seconds
            "lengthms": 200000,   # 200 seconds
            "leftms": 155000,     # 155 seconds
        }

        media_player_entity._handle_websocket_update(data)

        assert media_player_entity.media_position == 45.0
        assert media_player_entity.media_duration == 200.0
        assert media_player_entity._time_remaining == 155.0

    @pytest.mark.asyncio
    async def test_position_update_invalid_values(self, media_player_entity):
        """Test handling of invalid position values."""
        data = {
            "status": "playing",
            "positionms": "invalid",
            "lengthms": "invalid",
        }

        media_player_entity._handle_websocket_update(data)

        # Should default to 0 for invalid values
        assert media_player_entity.media_position == 0.0
        assert media_player_entity.media_duration == 0.0


class TestMediaPlayerServices:
    """Test media player service calls."""

    @pytest.mark.asyncio
    async def test_play_media_playlist(self, media_player_entity, mock_api_client):
        """Test play_media service with playlist."""
        await media_player_entity.async_play_media(
            media_type="playlist",
            media_id="Test Playlist",
        )

        mock_api_client.play_playlist.assert_called_once_with("Test Playlist")

    @pytest.mark.asyncio
    async def test_play_media_track(self, media_player_entity, mock_api_client):
        """Test play_media service with track."""
        media_player_entity._attr_media_playlist = "Current Playlist"

        await media_player_entity.async_play_media(
            media_type="track",
            media_id="Song Name",
        )

        mock_api_client.play_playlist_step.assert_called_once_with(
            "Current Playlist",
            "Song Name",
        )

    @pytest.mark.asyncio
    async def test_update_fetches_status(self, media_player_entity, mock_api_client):
        """Test update method fetches current status."""
        await media_player_entity.async_update()

        mock_api_client.get_playing_status.assert_called_once()


class TestEntityAttributes:
    """Test entity attributes and properties."""

    def test_supported_features(self, media_player_entity):
        """Test supported features are defined."""
        features = media_player_entity.supported_features
        assert features is not None

    def test_unique_id(self, media_player_entity):
        """Test unique ID is set."""
        assert media_player_entity.unique_id == "xschedule_test"

    def test_name(self, media_player_entity):
        """Test entity name is set."""
        assert media_player_entity.name is not None
