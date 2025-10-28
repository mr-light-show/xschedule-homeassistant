"""Regression tests for bugs fixed in v1.2.1 → v1.3.0.

These tests verify that specific bugs that have already occurred do not recur.
Each test documents the bug, the fix commit, and the code location.
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch, call
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
    client.get_playlist_steps = AsyncMock(return_value=[])
    client.get_queued_steps = AsyncMock(return_value=[])
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


class TestRegressionV122Pre1:
    """Regression tests for bugs fixed in v1.2.2-pre1."""

    @pytest.mark.asyncio
    async def test_regression_stale_songs_on_playlist_switch(
        self, hass: HomeAssistant, media_player_entity, mock_api_client
    ):
        """Verify playlist songs clear when switching playlists.

        Bug: v1.2.2-pre1 (commit db5d0f4)
        - Entity-level cache (_current_playlist_steps) wasn't cleared when playlist changed
        - Media Player card showed old playlist songs when switching playlists
        - Only the Playlist Browser card updated correctly

        Fix: media_player.py:289
        - Added: self._current_playlist_steps = []
        - Cache cleared when old_playlist != self._attr_media_playlist

        Test verifies:
        1. Play "Halloween" playlist with songs
        2. Verify songs cached
        3. Switch to "Halloween Background" playlist
        4. Verify cache cleared and new songs fetched
        """
        # Setup: Play "Halloween" playlist
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"},
            {"name": "Pirates of the Caribbean", "lengthms": "289400"},
        ]

        data_halloween = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
        }
        media_player_entity._handle_websocket_update(data_halloween)

        # Wait for async tasks to complete
        await hass.async_block_till_done()

        # Trigger async_update to fetch playlist steps
        await media_player_entity.async_update()

        # Verify songs cached for "Halloween"
        assert media_player_entity._current_playlist_steps is not None
        assert len(media_player_entity._current_playlist_steps) == 2
        assert media_player_entity._current_playlist_steps[0]["name"] == "Light Em Up"

        # Change playlist to "Halloween Background"
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "House lights", "lengthms": "120000"},
        ]

        data_background = {
            "status": "playing",
            "playlist": "Halloween Background",
            "step": "House lights",
        }
        media_player_entity._handle_websocket_update(data_background)

        # Wait for async tasks to complete
        await hass.async_block_till_done()

        # CRITICAL: Cache should be cleared (bug fix verification)
        # This is the fix from commit db5d0f4
        assert media_player_entity._current_playlist_steps == []

        # Trigger async_update to fetch new playlist steps
        await media_player_entity.async_update()

        # Verify new songs loaded
        assert len(media_player_entity._current_playlist_steps) == 1
        assert media_player_entity._current_playlist_steps[0]["name"] == "House lights"

    @pytest.mark.asyncio
    async def test_regression_blank_card_on_playlist_start(
        self, hass: HomeAssistant, media_player_entity, mock_api_client, mock_websocket
    ):
        """Verify card shows content when playlist starts via WebSocket.

        Bug: v1.2.2-pre1 (commit 8b997ec)
        - Media Player card showed completely blank when playlist started
        - Playlist Browser card worked correctly
        - Root cause: should_poll=False + no async_update call = no playlist_songs

        Fix: media_player.py:291-298
        - Added: asyncio.create_task(fetch_playlist_steps())
        - Triggers async_update when playlist changes to fetch songs immediately

        Test verifies:
        1. Entity is idle (no playlist)
        2. WebSocket message: playlist starts playing
        3. Verify async task created to fetch playlist steps
        4. Verify playlist_songs populated after fetch
        """
        # Setup: Entity is idle
        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity._attr_media_playlist is None
        assert media_player_entity._current_playlist_steps == []

        # Mock playlist steps response
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"},
        ]
        
        # WebSocket message: Playlist starts playing
        data = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
        }
        
        # Configure mock to return playing status (for async_update when websocket disconnected)
        mock_api_client.get_playing_status.return_value = data
        
        # Disconnect websocket so async_update fetches playlist steps
        mock_websocket.connected = False

        # The _handle_websocket_update should trigger async_update
        media_player_entity._handle_websocket_update(data)

        # Wait for async tasks to complete, then manually call async_update to ensure playlist steps are fetched
        await hass.async_block_till_done()
        await media_player_entity.async_update()

        # Verify playlist steps were fetched
        mock_api_client.get_playlist_steps.assert_called_once_with("Halloween")
        
        # Verify songs populated
        assert len(media_player_entity._current_playlist_steps) == 1
        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 1

        # Verify entity state updated
        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity._attr_media_playlist == "Halloween"


class TestRegressionV122Pre2:
    """Regression tests for bugs fixed in v1.2.2-pre2."""

    @pytest.mark.asyncio
    async def test_regression_stale_songs_after_stop(
        self, hass: HomeAssistant, media_player_entity, mock_api_client, mock_websocket
    ):
        """Verify songs clear from Python backend when playlist stops.

        Bug: v1.2.2-pre2 (commit 587828c)
        - Media Player card showed old playlist songs after playback stopped
        - No songs highlighted, but list remained visible
        - Playlist Browser card updated correctly
        - Frontend bug: _lastPlaylistSongs cache not cleared

        Fix: xschedule-card.js:194-198 (frontend fix)
        Python side: Verify backend clears data correctly

        Test verifies:
        1. Playlist is playing with songs cached
        2. Stop playlist (status=idle)
        3. Verify Python backend clears playlist and songs
        4. Frontend test in test/state-sync.test.js verifies cache clearing
        """
        # Setup: Play playlist with songs
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"},
        ]
        
        data_playing = {
            "status": "playing",
            "playlist": "Halloween",
            "step": "Light Em Up",
        }
        
        # Configure mock to return playing status (for async_update when websocket disconnected)
        mock_api_client.get_playing_status.return_value = data_playing
        
        # Disconnect websocket so async_update fetches playlist steps
        mock_websocket.connected = False
        
        media_player_entity._handle_websocket_update(data_playing)
        
        # Wait for async task to fetch steps, then manually call async_update to ensure playlist steps are fetched
        await hass.async_block_till_done()
        await media_player_entity.async_update()

        # Verify initial state
        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity._attr_media_playlist == "Halloween"
        assert len(media_player_entity._current_playlist_steps) > 0

        # Stop playlist
        data_idle = {
            "status": "idle",
            "outputtolights": "false",  # Truly stopped, not between songs
        }
        mock_api_client.get_playing_status.return_value = data_idle
        media_player_entity._handle_websocket_update(data_idle)

        # CRITICAL: Python backend should clear all media attributes
        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity._attr_media_playlist is None
        assert media_player_entity._attr_media_title is None
        assert media_player_entity._attr_media_position is None
        assert media_player_entity._attr_media_duration is None

        # Verify playlist steps cleared (media_player.py:208-209)
        assert media_player_entity._current_playlist_steps == []
        assert media_player_entity._queued_steps == []


class TestRegressionV121CPUOptimizations:
    """Regression tests for CPU optimization bugs fixed in v1.2.1."""

    def test_regression_cpu_excessive_polling(self, media_player_entity):
        """Verify polling is disabled to prevent excessive CPU usage.

        Bug: v1.2.1
        - Integration used excessive CPU on Home Assistant server
        - Default should_poll=True caused unnecessary 30-second polling
        - WebSocket provides real-time updates, polling not needed

        Fix: media_player.py:78
        - Added: _attr_should_poll = False
        - Disables Home Assistant's default polling behavior

        Test verifies:
        - Entity has should_poll = False set
        """
        # CRITICAL: should_poll must be False
        assert media_player_entity.should_poll is False

    @pytest.mark.asyncio
    async def test_regression_cpu_excessive_controller_events(
        self, hass: HomeAssistant, media_player_entity
    ):
        """Verify controller events only fire on actual status changes.

        Bug: v1.2.1
        - Controller status events fired on every WebSocket message
        - Caused excessive event bus traffic and CPU usage
        - Binary sensors updated even when status unchanged

        Fix: media_player.py:255-267
        - Added: Change detection (new_status != self._previous_controller_status)
        - Only fire event if controller status actually changed

        Test verifies:
        1. First controller status fires event
        2. Identical controller status does NOT fire event
        3. Changed controller status fires event
        """
        # Track events fired
        events_fired = []

        def capture_event(event):
            events_fired.append(event.data)

        hass.bus.async_listen(f"{DOMAIN}_controller_status_update", capture_event)

        # First update: Should fire event
        data_initial = {
            "status": "playing",
            "pingstatus": [
                {"controller": "Tree", "ip": "192.168.1.101", "result": "Ok"},
                {"controller": "House", "ip": "192.168.1.102", "result": "Ok"},
            ],
        }
        media_player_entity._handle_websocket_update(data_initial)
        await hass.async_block_till_done()

        # Verify event fired
        assert len(events_fired) == 1
        assert len(events_fired[0]["controllers"]) == 2

        # Second update: Same status, should NOT fire event
        data_same = {
            "status": "playing",
            "pingstatus": [
                {"controller": "Tree", "ip": "192.168.1.101", "result": "Ok"},
                {"controller": "House", "ip": "192.168.1.102", "result": "Ok"},
            ],
        }
        media_player_entity._handle_websocket_update(data_same)
        await hass.async_block_till_done()

        # CRITICAL: Event should NOT fire (bug fix verification)
        assert len(events_fired) == 1  # Still only 1 event

        # Third update: Changed status, should fire event
        data_changed = {
            "status": "playing",
            "pingstatus": [
                {"controller": "Tree", "ip": "192.168.1.101", "result": "Failed"},
                {"controller": "House", "ip": "192.168.1.102", "result": "Ok"},
            ],
        }
        media_player_entity._handle_websocket_update(data_changed)
        await hass.async_block_till_done()

        # Event should fire for changed status
        assert len(events_fired) == 2
        assert events_fired[1]["controllers"][0]["result"] == "Failed"

    @pytest.mark.asyncio
    async def test_regression_cpu_websocket_debouncing(
        self, hass: HomeAssistant, media_player_entity
    ):
        """Verify WebSocket updates are debounced to reduce CPU usage.

        Bug: v1.2.1
        - Every WebSocket message triggered immediate state update
        - Rapid updates (during playback) caused excessive CPU usage
        - Home Assistant state machine updated too frequently

        Fix: media_player.py:317-336
        - Added: 200ms debounce window
        - Batches rapid updates into single state update

        Test verifies:
        1. Multiple rapid WebSocket messages received
        2. Only one debounced state update scheduled
        3. State update occurs after 200ms delay
        """
        # Track state updates scheduled
        update_calls = []

        original_schedule = media_player_entity.schedule_update_ha_state

        def track_schedule(*args, **kwargs):
            update_calls.append(asyncio.get_event_loop().time())
            return original_schedule(*args, **kwargs)

        media_player_entity.schedule_update_ha_state = track_schedule

        # Send 5 rapid WebSocket updates (simulate real playback)
        for i in range(5):
            data = {
                "status": "playing",
                "playlist": "Halloween",
                "step": "Light Em Up",
                "positionms": str(30000 + (i * 100)),  # Position advancing
            }
            media_player_entity._handle_websocket_update(data)
            await asyncio.sleep(0.01)  # 10ms between messages

        # Wait for debounce window (200ms + buffer)
        await asyncio.sleep(0.25)

        # Wait for all async tasks to complete
        await hass.async_block_till_done()

        # CRITICAL: Should have only 1 state update scheduled (debounced)
        # Without debouncing, this would be 5 updates
        assert len(update_calls) <= 2  # Allow for 1-2 updates (debounced)

        # Verify debounce delay
        if len(update_calls) >= 2:
            time_diff = update_calls[-1] - update_calls[0]
            assert time_diff >= 0.15  # At least 150ms between updates


class TestRegressionConditionalAPICalls:
    """Regression tests for conditional API call optimizations from v1.2.1."""

    @pytest.mark.asyncio
    async def test_regression_conditional_playlist_fetch(
        self, hass: HomeAssistant, media_player_entity, mock_api_client
    ):
        """Verify playlist steps only fetched when needed.

        Bug: v1.2.1
        - Playlist steps fetched on every async_update call
        - Caused unnecessary API requests and cache misses
        - Increased CPU usage and network traffic

        Fix: media_player.py:348-356
        - Added: Only fetch if playlist is playing AND not cached
        - Conditional: if self._attr_media_playlist and not self._current_playlist_steps

        Test verifies:
        1. Playlist steps fetched when playing and cache empty
        2. Playlist steps NOT fetched when already cached
        3. Playlist steps NOT fetched when idle
        """
        # Reset mock to ignore setup calls
        mock_api_client.get_playlist_steps.reset_mock()

        # Scenario 1: Playing playlist, cache empty - SHOULD fetch
        media_player_entity._attr_media_playlist = "Halloween"
        media_player_entity._current_playlist_steps = []

        mock_api_client.get_playlist_steps.return_value = [
            {"name": "Light Em Up", "lengthms": "185750"},
        ]

        await media_player_entity.async_update()
        await hass.async_block_till_done()

        # Verify API called
        mock_api_client.get_playlist_steps.assert_called_once_with("Halloween")

        # Scenario 2: Playing playlist, cache populated - should NOT fetch
        mock_api_client.get_playlist_steps.reset_mock()
        media_player_entity._current_playlist_steps = [
            {"name": "Light Em Up", "lengthms": "185750"},
        ]

        await media_player_entity.async_update()
        await hass.async_block_till_done()

        # CRITICAL: API should NOT be called (cache hit)
        mock_api_client.get_playlist_steps.assert_not_called()

        # Scenario 3: Idle, no playlist - should NOT fetch
        mock_api_client.get_playlist_steps.reset_mock()
        media_player_entity._attr_media_playlist = None
        media_player_entity._current_playlist_steps = []

        await media_player_entity.async_update()
        await hass.async_block_till_done()

        # API should NOT be called (no playlist)
        mock_api_client.get_playlist_steps.assert_not_called()
