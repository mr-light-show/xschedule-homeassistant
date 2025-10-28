"""Tests for xSchedule config flow."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.xschedule.const import DOMAIN, CONF_PASSWORD
from custom_components.xschedule.config_flow import ConfigFlow


@pytest.fixture
def mock_api_client():
    """Mock API client for testing."""
    client = MagicMock()
    client.validate_connection = AsyncMock(return_value=True)
    client.get_playing_status = AsyncMock(return_value={"status": "idle"})
    client.close = AsyncMock()
    return client


class TestConfigFlow:
    """Test config flow."""

    @pytest.mark.asyncio
    async def test_user_flow_success(self, hass: HomeAssistant, mock_api_client):
        """Test successful user configuration."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "user"

        # Patch both the validation API client AND the setup to prevent real aiohttp sessions
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_api_client,
        ), patch(
            "custom_components.xschedule.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "192.168.1.100",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "",
                },
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "xSchedule (192.168.1.100)"
        assert result["data"][CONF_HOST] == "192.168.1.100"
        assert result["data"][CONF_PORT] == 80

    @pytest.mark.asyncio
    async def test_user_flow_with_password(self, hass: HomeAssistant, mock_api_client):
        """Test configuration with password."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        # Patch both the validation API client AND the setup to prevent real aiohttp sessions
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_api_client,
        ), patch(
            "custom_components.xschedule.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "192.168.1.100",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "testpassword",
                },
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["data"][CONF_PASSWORD] == "testpassword"

    @pytest.mark.asyncio
    async def test_connection_error(self, hass: HomeAssistant):
        """Test connection error handling."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        mock_client = MagicMock()
        mock_client.validate_connection = AsyncMock(side_effect=Exception("Connection failed"))
        mock_client.close = AsyncMock()

        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_client,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "192.168.1.100",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "",
                },
            )

        assert result["type"] == FlowResultType.FORM
        assert result["errors"] == {"base": "unknown"}

    @pytest.mark.asyncio
    async def test_invalid_host(self, hass: HomeAssistant):
        """Test invalid host handling."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        mock_client = MagicMock()
        mock_client.validate_connection = AsyncMock(return_value=False)
        mock_client.close = AsyncMock()

        # Test with empty host - should be caught by voluptuous validation
        # But if it gets through, the connection should fail
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_client,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "invalid-host",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "",
                },
            )

        # Should show form with error
        assert result["type"] == FlowResultType.FORM
        assert result["errors"] == {"base": "cannot_connect"}

    @pytest.mark.asyncio
    async def test_duplicate_entry(self, hass: HomeAssistant, mock_api_client):
        """Test duplicate entry prevention."""
        # Create first entry
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        # Patch both the validation API client AND the setup to prevent real aiohttp sessions
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_api_client,
        ), patch(
            "custom_components.xschedule.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "192.168.1.100",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "",
                },
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY

        # Try to create duplicate
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        # Patch again for the duplicate attempt
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_api_client,
        ), patch(
            "custom_components.xschedule.async_setup_entry",
            return_value=True,
        ):
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {
                    CONF_HOST: "192.168.1.100",
                    CONF_PORT: 80,
                    CONF_PASSWORD: "",
                },
            )

        assert result["type"] == FlowResultType.ABORT
        assert result["reason"] == "already_configured"


class TestOptionsFlow:
    """Test options flow."""

    @pytest.mark.asyncio
    async def test_options_flow(self, hass: HomeAssistant, mock_config_entry):
        """Test options flow initialization."""
        mock_config_entry.add_to_hass(hass)

        result = await hass.config_entries.options.async_init(
            mock_config_entry.entry_id
        )

        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "init"

    @pytest.mark.asyncio
    async def test_options_flow_update(self, hass: HomeAssistant, mock_config_entry, mock_api_client):
        """Test options flow updates configuration."""
        mock_config_entry.add_to_hass(hass)

        result = await hass.config_entries.options.async_init(
            mock_config_entry.entry_id
        )

        # Patch the API client for validation
        with patch(
            "custom_components.xschedule.config_flow.XScheduleAPIClient",
            return_value=mock_api_client,
        ):
            result = await hass.config_entries.options.async_configure(
                result["flow_id"],
                user_input={
                    CONF_HOST: "192.168.1.200",
                    CONF_PORT: 8080,
                    CONF_PASSWORD: "newpassword",
                },
            )

        assert result["type"] == FlowResultType.CREATE_ENTRY

        # Verify config entry was updated
        assert mock_config_entry.data[CONF_HOST] == "192.168.1.200"
        assert mock_config_entry.data[CONF_PORT] == 8080
        assert mock_config_entry.data[CONF_PASSWORD] == "newpassword"


class TestValidation:
    """Test input validation."""

    @pytest.mark.asyncio
    async def test_validate_port_range(self, hass: HomeAssistant):
        """Test port number validation."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        # Port should be between 1-65535
        # This test depends on actual validation implementation

    @pytest.mark.asyncio
    async def test_validate_host_format(self, hass: HomeAssistant):
        """Test host format validation."""
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        # Host can be IP address or hostname
        # This test depends on actual validation implementation
