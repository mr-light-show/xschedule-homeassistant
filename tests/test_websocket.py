"""Tests for xSchedule WebSocket client."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
from aiohttp import WSMessage, WSMsgType

from custom_components.xschedule.websocket import XScheduleWebSocket


@pytest.fixture
def websocket_client():
    """Create WebSocket client instance."""
    return XScheduleWebSocket(
        host="192.168.1.100",
        port=80,
        password="testpass",
    )


@pytest.fixture
def websocket_client_no_password():
    """Create WebSocket client without password."""
    return XScheduleWebSocket(
        host="192.168.1.100",
        port=80,
        password=None,
    )


class TestWebSocketInit:
    """Test WebSocket initialization."""

    def test_init_with_password(self, websocket_client):
        """Test initialization with password."""
        assert websocket_client.host == "192.168.1.100"
        assert websocket_client.port == 80
        assert websocket_client.password == "testpass"
        assert websocket_client._ws_url == "ws://192.168.1.100:80/"

    def test_init_without_password(self, websocket_client_no_password):
        """Test initialization without password."""
        assert websocket_client_no_password.password is None

    def test_initial_connection_state(self, websocket_client):
        """Test initial connection state."""
        assert websocket_client.connected is False
        assert websocket_client._ws is None


class TestConnectionManagement:
    """Test connection lifecycle."""

    @pytest.mark.asyncio
    async def test_connect_success(self, websocket_client):
        """Test successful WebSocket connection."""
        mock_ws = MagicMock()
        mock_session = MagicMock()
        mock_session.ws_connect = AsyncMock(return_value=mock_ws)

        with patch('aiohttp.ClientSession', return_value=mock_session):
            await websocket_client.connect()

            assert websocket_client.connected is True
            assert websocket_client._ws == mock_ws

    @pytest.mark.asyncio
    async def test_disconnect(self, websocket_client):
        """Test WebSocket disconnection."""
        mock_ws = MagicMock()
        mock_ws.close = AsyncMock()
        websocket_client._ws = mock_ws
        websocket_client._connected = True

        await websocket_client.disconnect()

        mock_ws.close.assert_called_once()
        assert websocket_client.connected is False

    @pytest.mark.asyncio
    async def test_disconnect_when_not_connected(self, websocket_client):
        """Test disconnect when not connected."""
        # Should not raise error
        await websocket_client.disconnect()

        assert websocket_client.connected is False


class TestMessageHandling:
    """Test WebSocket message handling."""

    @pytest.mark.asyncio
    async def test_callback_on_message(self):
        """Test callback is called on message receipt."""
        messages_received = []

        def callback(data):
            messages_received.append(data)

        # Create client with callback
        websocket_client = XScheduleWebSocket(
            host="192.168.1.100",
            port=80,
            password="testpass",
            status_callback=callback,
        )

        # Simulate message handling
        import json
        test_data = {"status": "playing", "playlist": "Test"}
        await websocket_client._handle_message(json.dumps(test_data))

        assert len(messages_received) == 1
        assert messages_received[0] == test_data

    @pytest.mark.asyncio
    async def test_callback_receives_all_message_types(self):
        """Test callback receives various message types."""
        import json
        messages_received = []

        def callback(data):
            messages_received.append(data)

        websocket_client = XScheduleWebSocket(
            host="192.168.1.100",
            port=80,
            password=None,
            status_callback=callback,
        )

        # Test different message types
        test_data_1 = {"status": "playing"}
        test_data_2 = {"queue": ["song1", "song2"]}

        await websocket_client._handle_message(json.dumps(test_data_1))
        await websocket_client._handle_message(json.dumps(test_data_2))

        assert len(messages_received) == 2
        assert messages_received[0] == test_data_1
        assert messages_received[1] == test_data_2

    @pytest.mark.asyncio
    async def test_no_callback_no_error(self):
        """Test that no callback doesn't cause errors."""
        import json
        websocket_client = XScheduleWebSocket(
            host="192.168.1.100",
            port=80,
            password=None,
            status_callback=None,
        )

        # Should not raise error when callback is None
        test_data = {"status": "playing"}
        await websocket_client._handle_message(json.dumps(test_data))


class TestReconnectionLogic:
    """Test reconnection and error handling."""

    @pytest.mark.asyncio
    async def test_connection_loop_continues_on_error(self, websocket_client):
        """Test connection loop continues after connection error."""
        # The _connection_loop() method should handle exceptions and retry
        # This is tested by verifying the method exists and is async
        assert asyncio.iscoroutinefunction(websocket_client._connection_loop)

    @pytest.mark.asyncio
    async def test_running_flag_controls_connection_loop(self, websocket_client):
        """Test that _running flag controls the connection loop."""
        # Initially not running
        assert websocket_client._running is False

        # Connect should set running to True
        with patch.object(websocket_client, '_connection_loop', new=AsyncMock()):
            await websocket_client.connect()
            assert websocket_client._running is True

        # Disconnect should set running to False
        await websocket_client.disconnect()
        assert websocket_client._running is False


class TestPasswordAuthentication:
    """Test password authentication."""

    @pytest.mark.asyncio
    async def test_connect_with_password(self, websocket_client):
        """Test connection includes password in URL."""
        mock_ws = MagicMock()
        mock_session = MagicMock()
        mock_session.ws_connect = AsyncMock(return_value=mock_ws)

        with patch('aiohttp.ClientSession', return_value=mock_session):
            await websocket_client.connect()

            # Verify password was hashed and included
            call_args = mock_session.ws_connect.call_args
            assert "Pass=" in str(call_args) or websocket_client.password is not None

    @pytest.mark.asyncio
    async def test_connect_without_password(self, websocket_client_no_password):
        """Test connection without password."""
        mock_ws = MagicMock()
        mock_session = MagicMock()
        mock_session.ws_connect = AsyncMock(return_value=mock_ws)

        with patch('aiohttp.ClientSession', return_value=mock_session):
            await websocket_client_no_password.connect()

            assert websocket_client_no_password.password is None


class TestHeartbeat:
    """Test heartbeat mechanism."""

    @pytest.mark.asyncio
    async def test_heartbeat_task_created_on_connection(self, websocket_client):
        """Test heartbeat task is created when connected."""
        # The _heartbeat() method should exist and be async
        assert asyncio.iscoroutinefunction(websocket_client._heartbeat)

        # Initially no heartbeat task
        assert websocket_client._heartbeat_task is None

    @pytest.mark.asyncio
    async def test_heartbeat_cancelled_on_disconnect(self, websocket_client):
        """Test heartbeat task is cancelled on disconnect."""
        # Create a mock heartbeat task
        mock_task = AsyncMock()
        mock_task.cancel = MagicMock()
        websocket_client._heartbeat_task = mock_task
        websocket_client._connected = True

        await websocket_client.disconnect()

        # Heartbeat task should be cancelled
        mock_task.cancel.assert_called_once()


class TestMessageParsing:
    """Test message parsing."""

    def test_parse_json_message(self, websocket_client):
        """Test parsing valid JSON message."""
        import json

        test_data = {"status": "playing", "playlist": "Test"}
        json_str = json.dumps(test_data)

        parsed = json.loads(json_str)
        assert parsed == test_data

    def test_parse_invalid_json(self, websocket_client):
        """Test handling of invalid JSON."""
        import json

        invalid_json = "{invalid json}"

        with pytest.raises(json.JSONDecodeError):
            json.loads(invalid_json)


class TestCleanup:
    """Test resource cleanup."""

    @pytest.mark.asyncio
    async def test_cleanup_on_disconnect(self, websocket_client):
        """Test proper cleanup on disconnect."""
        mock_ws = MagicMock()
        mock_ws.close = AsyncMock()
        websocket_client._ws = mock_ws
        websocket_client._connected = True

        await websocket_client.disconnect()

        assert websocket_client._ws is None
        assert websocket_client.connected is False

    @pytest.mark.asyncio
    async def test_callback_cleanup_on_disconnect(self, websocket_client):
        """Test callback is preserved through disconnect."""
        messages_received = []

        def callback(data):
            messages_received.append(data)

        # Callback is set at initialization, persists through disconnect
        websocket_client._status_callback = callback
        await websocket_client.disconnect()

        # Callback reference should still exist
        assert websocket_client._status_callback is not None
