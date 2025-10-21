"""Shared fixtures for xSchedule tests."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_HOST, CONF_PORT
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.xschedule.const import (
    DOMAIN,
    CONF_PASSWORD,
    DEFAULT_NAME,
)


@pytest.fixture
def mock_config_entry():
    """Return a mock config entry."""
    return MockConfigEntry(
        domain=DOMAIN,
        title=DEFAULT_NAME,
        data={
            CONF_HOST: "192.168.1.100",
            CONF_PORT: 80,
            CONF_PASSWORD: "",
        },
        unique_id="xschedule_192.168.1.100_80",
    )


@pytest.fixture
def mock_api_client():
    """Return a mock API client."""
    client = MagicMock()
    client.get_playing_status = AsyncMock(return_value={
        "status": "playing",
        "playlist": "Test Playlist",
        "step": "Test Song",
        "position": 30,
        "length": 180,
    })
    client.get_playlists = AsyncMock(return_value=["Playlist 1", "Playlist 2"])
    client.get_playlist_steps = AsyncMock(return_value=[
        {"name": "Song 1", "duration": 180},
        {"name": "Song 2", "duration": 240},
    ])
    client.get_schedules = AsyncMock(return_value=[
        {"name": "Schedule 1", "playlist": "Playlist 1"},
    ])
    client.close = AsyncMock()
    return client


@pytest.fixture
def mock_websocket():
    """Return a mock WebSocket client."""
    ws = MagicMock()
    ws.connect = AsyncMock()
    ws.disconnect = AsyncMock()
    ws.is_connected = False
    return ws


@pytest.fixture
async def hass_instance(hass: HomeAssistant):
    """Return a Home Assistant instance."""
    return hass
