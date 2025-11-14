"""Entity attribute contract tests for Home Assistant integration.

These tests verify that the media player entity exposes the correct
attribute structure for JavaScript frontend consumption. They ensure
the contract between Python backend and JavaScript frontend is maintained.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from homeassistant.components.media_player import MediaPlayerState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.xschedule.media_player import XScheduleMediaPlayer
from custom_components.xschedule.const import DOMAIN


@pytest.fixture
def mock_api_client():
    """Create mock API client."""
    client = MagicMock()
    client.get_playing_status = AsyncMock(return_value={"status": "idle"})
    client.get_playlists = AsyncMock(return_value=["Halloween", "Halloween Background"])
    client.get_playlist_steps = AsyncMock(return_value=[
        {"name": "Light Em Up", "lengthms": "185750"},
        {"name": "Pirates of the Caribbean", "lengthms": "289400"},
    ])
    client.jump_to_step_at_end = AsyncMock(return_value={"result": "ok"})
    client.invalidate_cache = MagicMock()
    client.close = AsyncMock()
    return client


@pytest.fixture
def mock_websocket():
    """Create mock WebSocket client."""
    ws = MagicMock()
    ws.connect = AsyncMock()
    ws.disconnect = AsyncMock()
    ws.send_command = AsyncMock()
    ws.connected = True  # Mark as connected so async_update doesn't re-fetch status
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

    with patch('custom_components.xschedule.media_player.XScheduleWebSocket', return_value=mock_websocket):
        entity = XScheduleMediaPlayer(
            config_entry=config_entry,
            api_client=mock_api_client,
            hass=hass,
        )

    entity.entity_id = "media_player.xschedule_test"
    await entity.async_added_to_hass()

    return entity


class TestEntityAttributesPlaying:
    """Test entity attributes when playing."""

    @pytest.mark.asyncio
    async def test_core_attributes_when_playing(self, media_player_entity):
        """Verify core attributes present when playing.

        JavaScript cards expect these attributes to always be present
        when state is 'playing'.
        """
        # Set up playing state
        data = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
            "positionms": "45000",
            "lengthms": "185750",
            "leftms": "140750",
            "volume": "100",
        }
        media_player_entity._handle_websocket_update(data)

        # Core state attributes
        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity.media_playlist == "Halloween"
        assert media_player_entity.media_title == "Light Em Up"
        assert media_player_entity.media_position == 45.0
        assert media_player_entity.media_duration == 185.75

        # Volume
        assert media_player_entity.volume_level == 1.0

    @pytest.mark.asyncio
    async def test_extra_state_attributes_when_playing(self, media_player_entity, mock_api_client):
        """Verify extra_state_attributes structure when playing.

        Frontend cards rely on these attributes for display.
        """
        # Set up playing state with songs
        data = {"status": "playing", "playlist": "Halloween", "step": "Light Em Up"}
        media_player_entity._handle_websocket_update(data)
        await media_player_entity.async_update()

        attrs = media_player_entity.extra_state_attributes

        # Verify required attributes exist
        assert "playlist_songs" in attrs
        assert "internal_queue" in attrs
        assert "source_list" in attrs

    @pytest.mark.asyncio
    async def test_playlist_songs_attribute_structure(self, media_player_entity, mock_api_client):
        """Verify playlist_songs attribute structure for frontend.

        Frontend JavaScript expects array of objects with name and duration.
        Source: xschedule-card.js:188, 206
        """
        # Set up playing state
        data = {"status": "playing", "playlist": "Halloween", "step": "Light Em Up"}
        media_player_entity._handle_websocket_update(data)
        await media_player_entity.async_update()

        attrs = media_player_entity.extra_state_attributes
        playlist_songs = attrs["playlist_songs"]

        # Should be list
        assert isinstance(playlist_songs, list)
        assert len(playlist_songs) == 2

        # Each song should have name and duration (in milliseconds)
        song1 = playlist_songs[0]
        assert "name" in song1
        assert "duration" in song1
        assert song1["name"] == "Light Em Up"
        assert song1["duration"] == 185750  # Milliseconds

    @pytest.mark.asyncio
    async def test_source_list_attribute(self, media_player_entity):
        """Verify source_list attribute (available playlists).

        Frontend uses this for playlist selector.
        Source: xschedule-card.js:185
        """
        attrs = media_player_entity.extra_state_attributes

        assert "source_list" in attrs
        source_list = attrs["source_list"]

        assert isinstance(source_list, list)
        assert "Halloween" in source_list
        assert "Halloween Background" in source_list


class TestEntityAttributesIdle:
    """Test entity attributes when idle."""

    @pytest.mark.asyncio
    async def test_core_attributes_when_idle(self, media_player_entity):
        """Verify core attributes cleared when idle.

        Critical for bug fixes from v1.2.2-pre2 (commit 587828c).
        Frontend must not display stale data.
        """
        # First set playing state
        data_playing = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
            "positionms": "45000",
            "lengthms": "185750",
        }
        media_player_entity._handle_websocket_update(data_playing)

        # Verify playing
        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity.media_playlist is not None

        # Transition to idle
        data_idle = {"status": "idle", "outputtolights": "false"}
        media_player_entity._handle_websocket_update(data_idle)

        # ALL media attributes should be cleared
        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity.media_playlist is None
        assert media_player_entity.media_title is None
        assert media_player_entity.media_position is None
        assert media_player_entity.media_duration is None

    @pytest.mark.asyncio
    async def test_extra_attributes_when_idle(self, media_player_entity):
        """Verify extra attributes when idle.

        Frontend should still have playlist list, but songs/queue empty.
        """
        data = {"status": "idle"}
        media_player_entity._handle_websocket_update(data)

        attrs = media_player_entity.extra_state_attributes

        # Should still have source_list (available playlists)
        assert "source_list" in attrs
        assert len(attrs["source_list"]) > 0

        # Playlist songs should be empty
        assert "playlist_songs" in attrs
        assert attrs["playlist_songs"] == []

        # Queue should be empty
        assert "internal_queue" in attrs
        assert attrs["internal_queue"] == []


class TestEntityAttributesQueue:
    """Test queue attribute structure."""

    @pytest.mark.asyncio
    async def test_queue_attribute_structure(self, media_player_entity, mock_api_client):
        """Verify queue attribute structure for frontend.

        Frontend expects array of objects with name, id, playlist, priority, and duration.
        Source: xschedule-card.js
        """
        # Set up playing state with a playlist
        playing_data = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Thriller",
            "lengthms": "358000",
        }
        media_player_entity._handle_websocket_update(playing_data)
        
        # Mock playlist steps so songs can be found
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Thriller", "lengthms": "358000"},
            {"name": "Monster Mash", "lengthms": "182000"},
        ]
        await media_player_entity.async_update()
        
        # Add songs to internal queue
        await media_player_entity.async_add_to_internal_queue("Thriller")
        await media_player_entity.async_add_to_internal_queue("Monster Mash")

        attrs = media_player_entity.extra_state_attributes
        queue = attrs["internal_queue"]

        # Should be list
        assert isinstance(queue, list)
        assert len(queue) == 2

        # Each queue item should have name, id, playlist, priority, duration
        item1 = queue[0]
        assert "name" in item1
        assert "id" in item1
        assert "playlist" in item1
        assert "priority" in item1
        assert "duration" in item1
        assert item1["name"] == "Thriller"

    @pytest.mark.asyncio
    async def test_empty_queue(self, media_player_entity, mock_api_client):
        """Verify empty queue returns empty list, not None."""
        attrs = media_player_entity.extra_state_attributes
        queue = attrs["internal_queue"]

        assert isinstance(queue, list)
        assert len(queue) == 0


class TestEntityAttributesControllerHealth:
    """Test controller health attributes."""

    @pytest.mark.asyncio
    async def test_controller_health_in_attributes(self, media_player_entity):
        """Verify controller health status in attributes.

        Used by binary sensors and potentially frontend display.
        """
        data = {
            "status": "playing",
            "pingstatus": [
                {"controller": "Tree", "ip": "192.168.1.101", "result": "Ok", "failcount": "0"},
                {"controller": "House", "ip": "192.168.1.102", "result": "Failed", "failcount": "2"},
            ]
        }
        media_player_entity._handle_websocket_update(data)

        # Controller status stored internally
        assert hasattr(media_player_entity, '_controller_status')
        assert len(media_player_entity._controller_status) == 2
        assert media_player_entity._controller_status[0]["result"] == "Ok"
        assert media_player_entity._controller_status[1]["result"] == "Failed"


class TestEntityAttributesCacheInvalidation:
    """Test attribute updates after cache invalidation."""

    @pytest.mark.asyncio
    async def test_attributes_refresh_after_playlist_change(
        self, media_player_entity, mock_api_client
    ):
        """Verify attributes update with fresh data after playlist change.

        Critical for bug fix from v1.2.2-pre1 (commit db5d0f4, 8b997ec).
        Ensures no stale song data displayed.
        """
        # Play Halloween playlist
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"},
            {"name": "Pirates of the Caribbean", "lengthms": "289400"},
        ]

        data_halloween = {"status": "playing", "playlist": "Halloween"}
        media_player_entity._handle_websocket_update(data_halloween)
        await media_player_entity.async_update()

        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 2
        assert attrs["playlist_songs"][0]["name"] == "Light Em Up"

        # Change to Halloween Background playlist
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "House lights", "lengthms": "120000"},
        ]

        data_background = {"status": "playing", "playlist": "Halloween Background"}
        media_player_entity._handle_websocket_update(data_background)
        await media_player_entity.async_update()

        # Attributes should reflect NEW playlist
        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 1
        assert attrs["playlist_songs"][0]["name"] == "House lights"

    @pytest.mark.asyncio
    async def test_no_stale_data_after_stop(self, hass: HomeAssistant, media_player_entity, mock_api_client, mock_websocket):
        """Verify no stale data in attributes after stop.

        Critical for bug fix from v1.2.2-pre2 (commit 587828c).
        Frontend should not display old songs.
        """
        # Setup: Play with songs
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"}
        ]
        
        # Configure mock to return playing status (for async_update when websocket disconnected)
        data_playing = {"status": "playing", "playlist": "Halloween"}
        mock_api_client.get_playing_status.return_value = data_playing
        
        # Disconnect websocket so async_update fetches playlist steps
        mock_websocket.connected = False
        
        media_player_entity._handle_websocket_update(data_playing)
        
        # Wait for async task, then manually call async_update to ensure playlist steps are fetched
        await hass.async_block_till_done()
        await media_player_entity.async_update()

        # Verify songs present
        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 1

        # Now stop
        data_idle = {"status": "idle", "outputtolights": "false"}
        mock_api_client.get_playing_status.return_value = data_idle
        media_player_entity._handle_websocket_update(data_idle)

        # Verify songs cleared
        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 0


class TestEntityAttributeTypes:
    """Test attribute data types match frontend expectations."""

    @pytest.mark.asyncio
    async def test_numeric_types(self, media_player_entity):
        """Verify numeric attributes are proper types, not strings."""
        data = {
            "status": "playing",
            "positionms": "45000",
            "lengthms": "185750",
            "volume": "100",
        }
        media_player_entity._handle_websocket_update(data)

        # Position and duration should be float (seconds)
        assert isinstance(media_player_entity.media_position, float)
        assert isinstance(media_player_entity.media_duration, float)

        # Volume should be float 0.0-1.0
        assert isinstance(media_player_entity.volume_level, float)
        assert 0.0 <= media_player_entity.volume_level <= 1.0

    @pytest.mark.asyncio
    async def test_list_types(self, media_player_entity):
        """Verify list attributes are always lists, never None."""
        attrs = media_player_entity.extra_state_attributes

        # All list attributes should be lists, not None
        assert isinstance(attrs.get("playlist_songs", []), list)
        assert isinstance(attrs.get("queue", []), list)
        assert isinstance(attrs.get("source_list", []), list)

    @pytest.mark.asyncio
    async def test_string_types(self, media_player_entity):
        """Verify string attributes."""
        data = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
        }
        media_player_entity._handle_websocket_update(data)

        # Playlist and title should be strings
        assert isinstance(media_player_entity.media_playlist, str)
        assert isinstance(media_player_entity.media_title, str)


class TestEntityAttributeAvailability:
    """Test attribute availability in different states."""

    @pytest.mark.asyncio
    async def test_attributes_available_immediately_after_init(self, media_player_entity):
        """Verify attributes dict exists immediately, not None.

        Frontend may query attributes before any updates.
        """
        attrs = media_player_entity.extra_state_attributes

        assert attrs is not None
        assert isinstance(attrs, dict)
        assert "source_list" in attrs
        assert "playlist_songs" in attrs
        assert "internal_queue" in attrs

    @pytest.mark.asyncio
    async def test_attributes_survive_state_transitions(self, media_player_entity):
        """Verify attributes dict always available through state changes."""
        # Idle
        data_idle = {"status": "idle"}
        media_player_entity._handle_websocket_update(data_idle)
        assert media_player_entity.extra_state_attributes is not None

        # Playing
        data_playing = {"status": "playing", "playlist": "Halloween"}
        media_player_entity._handle_websocket_update(data_playing)
        assert media_player_entity.extra_state_attributes is not None

        # Paused
        data_paused = {"status": "paused"}
        media_player_entity._handle_websocket_update(data_paused)
        assert media_player_entity.extra_state_attributes is not None

        # Back to idle
        media_player_entity._handle_websocket_update(data_idle)
        assert media_player_entity.extra_state_attributes is not None
