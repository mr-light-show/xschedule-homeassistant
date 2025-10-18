"""WebSocket connection manager for xSchedule."""
from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Callable
from typing import Any

import aiohttp

from .const import WS_HEARTBEAT_INTERVAL, WS_RETRY_DELAY

_LOGGER = logging.getLogger(__name__)


class XScheduleWebSocket:
    """WebSocket connection manager for xSchedule real-time updates."""

    def __init__(
        self,
        host: str,
        port: int,
        password: str | None = None,
        status_callback: Callable[[dict[str, Any]], None] | None = None,
    ) -> None:
        """Initialize the WebSocket manager."""
        self.host = host
        self.port = port
        self.password = password
        self._ws_url = f"ws://{host}:{port}/"
        self._status_callback = status_callback

        self._ws: aiohttp.ClientWebSocketResponse | None = None
        self._session: aiohttp.ClientSession | None = None
        self._running = False
        self._reconnect_task: asyncio.Task | None = None
        self._heartbeat_task: asyncio.Task | None = None
        self._connected = False

    @property
    def connected(self) -> bool:
        """Return if WebSocket is connected."""
        return self._connected and self._ws is not None and not self._ws.closed

    async def connect(self) -> bool:
        """Connect to xSchedule WebSocket."""
        if self._running:
            _LOGGER.warning("WebSocket already running")
            return self.connected

        self._running = True
        self._reconnect_task = asyncio.create_task(self._connection_loop())
        return True

    async def disconnect(self) -> None:
        """Disconnect from xSchedule WebSocket."""
        _LOGGER.debug("Disconnecting WebSocket")
        self._running = False

        # Cancel tasks
        if self._reconnect_task:
            self._reconnect_task.cancel()
            try:
                await self._reconnect_task
            except asyncio.CancelledError:
                pass

        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass

        # Close WebSocket
        if self._ws and not self._ws.closed:
            await self._ws.close()
            self._ws = None

        # Close session
        if self._session:
            await self._session.close()
            self._session = None

        self._connected = False

    async def _connection_loop(self) -> None:
        """Main connection loop with automatic reconnection."""
        retry_count = 0
        max_retry_delay = 60  # Maximum 60 seconds between retries

        while self._running:
            try:
                if self._session is None:
                    self._session = aiohttp.ClientSession()

                _LOGGER.info("Connecting to xSchedule WebSocket at %s", self._ws_url)
                async with self._session.ws_connect(self._ws_url) as ws:
                    self._ws = ws
                    self._connected = True
                    retry_count = 0  # Reset retry count on successful connection

                    _LOGGER.info("WebSocket connected to xSchedule")

                    # Start heartbeat
                    if self._heartbeat_task is None or self._heartbeat_task.done():
                        self._heartbeat_task = asyncio.create_task(self._heartbeat())

                    # Listen for messages
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            await self._handle_message(msg.data)
                        elif msg.type == aiohttp.WSMsgType.ERROR:
                            _LOGGER.error("WebSocket error: %s", ws.exception())
                            break
                        elif msg.type == aiohttp.WSMsgType.CLOSED:
                            _LOGGER.warning("WebSocket closed")
                            break

            except aiohttp.ClientError as err:
                _LOGGER.warning("WebSocket connection error: %s", err)
            except Exception as err:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected WebSocket error: %s", err)
            finally:
                self._connected = False
                if self._ws:
                    self._ws = None

                # Cancel heartbeat
                if self._heartbeat_task:
                    self._heartbeat_task.cancel()
                    try:
                        await self._heartbeat_task
                    except asyncio.CancelledError:
                        pass
                    self._heartbeat_task = None

            # Exponential backoff for reconnection
            if self._running:
                retry_count += 1
                delay = min(WS_RETRY_DELAY * (2 ** (retry_count - 1)), max_retry_delay)
                _LOGGER.info("Reconnecting in %d seconds...", delay)
                await asyncio.sleep(delay)

    async def _heartbeat(self) -> None:
        """Send periodic status queries to detect state changes."""
        try:
            while self._running and self.connected:
                await asyncio.sleep(30)  # Poll every 30 seconds
                if self._ws and not self._ws.closed:
                    # Query full status to detect state changes
                    await self.send_query("GetPlayingStatus")
                    await self.send_query("GetQueuedSteps")
        except asyncio.CancelledError:
            pass
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.error("Heartbeat error: %s", err)

    async def _handle_message(self, data: str) -> None:
        """Handle incoming WebSocket message."""
        try:
            message = json.loads(data)
            _LOGGER.debug("Received WebSocket message: %s", message)

            # xSchedule sends status updates - call callback for all messages
            # Not just those with "status" key
            if isinstance(message, dict) and self._status_callback:
                self._status_callback(message)

        except json.JSONDecodeError as err:
            _LOGGER.error("Failed to decode WebSocket message: %s", err)
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.exception("Error handling WebSocket message: %s", err)

    async def send_query(
        self, query_name: str, parameters: str = "", reference: str = ""
    ) -> bool:
        """Send a query via WebSocket."""
        if not self.connected:
            _LOGGER.warning("Cannot send query, WebSocket not connected")
            return False

        message = {
            "Type": "Query",
            "Query": query_name,
            "Parameters": parameters,
        }

        if reference:
            message["Reference"] = reference

        if self.password:
            message["Pass"] = self.password

        try:
            await self._ws.send_json(message)
            _LOGGER.debug("Sent query: %s", query_name)
            return True
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.error("Error sending query: %s", err)
            return False

    async def send_command(
        self, command_name: str, parameters: str = "", reference: str = ""
    ) -> bool:
        """Send a command via WebSocket."""
        if not self.connected:
            _LOGGER.warning("Cannot send command, WebSocket not connected")
            return False

        message = {
            "Type": "Command",
            "Command": command_name,
            "Parameters": parameters,
        }

        if reference:
            message["Reference"] = reference

        if self.password:
            message["Pass"] = self.password

        try:
            await self._ws.send_json(message)
            _LOGGER.debug("Sent command: %s", command_name)
            return True
        except Exception as err:  # pylint: disable=broad-except
            _LOGGER.error("Error sending command: %s", err)
            return False
