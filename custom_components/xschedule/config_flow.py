"""Config flow for xSchedule integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv

from .api_client import (
    XScheduleAPIClient,
    XScheduleAuthError,
    XScheduleConnectionError,
)
from .const import (
    CONF_PASSWORD,
    DEFAULT_PORT,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_HOST): cv.string,
        vol.Required(CONF_PORT, default=DEFAULT_PORT): cv.port,
        vol.Optional(CONF_PASSWORD): cv.string,
    }
)


async def validate_connection(
    hass: HomeAssistant, data: dict[str, Any]
) -> dict[str, str]:
    """Validate the user input allows us to connect to xSchedule."""
    errors = {}

    # Create API client
    client = XScheduleAPIClient(
        host=data[CONF_HOST],
        port=data[CONF_PORT],
        password=data.get(CONF_PASSWORD),
    )

    try:
        # Validate connection by attempting to get status
        is_valid = await client.validate_connection()

        if not is_valid:
            errors["base"] = "cannot_connect"

    except XScheduleAuthError:
        _LOGGER.error("Authentication failed for xSchedule")
        errors["base"] = "invalid_auth"
    except XScheduleConnectionError:
        _LOGGER.error("Could not connect to xSchedule")
        errors["base"] = "cannot_connect"
    except Exception as err:  # pylint: disable=broad-except
        _LOGGER.exception("Unexpected exception during validation: %s", err)
        errors["base"] = "unknown"
    finally:
        await client.close()

    return errors


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for xSchedule."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            # Validate connection
            errors = await validate_connection(self.hass, user_input)

            if not errors:
                # Create unique ID based on host and port
                await self.async_set_unique_id(
                    f"{user_input[CONF_HOST]}:{user_input[CONF_PORT]}"
                )
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=f"xSchedule ({user_input[CONF_HOST]})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )
