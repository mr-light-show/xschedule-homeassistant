"""Binary sensor platform for xSchedule controller health monitoring."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Storage key for sensor registry
SENSOR_REGISTRY_KEY = f"{DOMAIN}_controller_sensors"


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up xSchedule controller health binary sensors."""
    _LOGGER.debug("Binary sensor platform setup starting for entry %s", config_entry.entry_id)

    # Get the media player entity to access controller status
    media_player_component = hass.data.get("media_player")
    if not media_player_component:
        _LOGGER.warning("Media player component not loaded, cannot create controller sensors")
        return

    # Find our media player entity
    entity_id = f"media_player.{DOMAIN}"
    media_player_entity = media_player_component.get_entity(entity_id)

    if not media_player_entity:
        _LOGGER.warning("xSchedule media player entity not found")
        return

    if not hasattr(media_player_entity, "_controller_status"):
        _LOGGER.warning("xSchedule media player has no _controller_status attribute")
        return

    # Initialize sensor registry in hass.data for tracking
    if SENSOR_REGISTRY_KEY not in hass.data:
        hass.data[SENSOR_REGISTRY_KEY] = {}

    sensor_registry = hass.data[SENSOR_REGISTRY_KEY]

    # If controller status is empty, try to fetch it
    if not media_player_entity._controller_status:
        _LOGGER.info("Controller status empty on setup, triggering media player update")
        try:
            await media_player_entity.async_update()
        except Exception as err:
            _LOGGER.error("Failed to update media player for controller status: %s", err)

    _LOGGER.debug("Found %d controllers in media player", len(media_player_entity._controller_status))

    # Create a binary sensor for each controller
    sensors = []
    for controller_data in media_player_entity._controller_status:
        if "controller" in controller_data and "ip" in controller_data:
            controller_name = controller_data["controller"]
            unique_id = f"{DOMAIN}_{config_entry.entry_id}_controller_{controller_name}"

            # Check if sensor already exists in registry
            if unique_id in sensor_registry:
                _LOGGER.debug("Sensor %s already exists, skipping", unique_id)
                continue

            sensor = XScheduleControllerSensor(
                config_entry,
                controller_data,
            )
            sensors.append(sensor)
            sensor_registry[unique_id] = sensor
            _LOGGER.debug("Created sensor for controller: %s", controller_name)

    if sensors:
        async_add_entities(sensors, True)
        _LOGGER.info("Created %d controller health sensors", len(sensors))
    else:
        _LOGGER.warning("No controller sensors created (found %d controllers)",
                       len(media_player_entity._controller_status))

    # Listen for controller status updates
    @callback
    def handle_controller_update(event):
        """Handle controller status update events."""
        if event.data.get("entry_id") != config_entry.entry_id:
            return

        controllers = event.data.get("controllers", [])
        _LOGGER.debug("Controller status update event received with %d controllers", len(controllers))

        # Update existing sensors or create new ones
        new_sensors = []
        for controller_data in controllers:
            if "controller" in controller_data and "ip" in controller_data:
                controller_name = controller_data["controller"]
                unique_id = f"{DOMAIN}_{config_entry.entry_id}_controller_{controller_name}"

                if unique_id in sensor_registry:
                    # Update existing sensor
                    sensor_registry[unique_id].update_from_data(controller_data)
                    _LOGGER.debug("Updated existing sensor: %s", controller_name)
                else:
                    # Create new sensor
                    new_sensor = XScheduleControllerSensor(
                        config_entry,
                        controller_data,
                    )
                    new_sensors.append(new_sensor)
                    sensor_registry[unique_id] = new_sensor
                    _LOGGER.info("Creating new sensor for controller: %s", controller_name)

        if new_sensors:
            async_add_entities(new_sensors, True)
            _LOGGER.info("Added %d new controller health sensors", len(new_sensors))

    hass.bus.async_listen(
        f"{DOMAIN}_controller_status_update",
        handle_controller_update,
    )
    _LOGGER.debug("Binary sensor platform setup completed, event listener registered")


class XScheduleControllerSensor(BinarySensorEntity):
    """Binary sensor for xSchedule controller health."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_has_entity_name = True

    def __init__(
        self,
        config_entry: ConfigEntry,
        controller_data: dict[str, Any],
    ) -> None:
        """Initialize the controller health sensor."""
        self._config_entry = config_entry
        self._controller_name = controller_data.get("controller", "Unknown")
        self._controller_ip = controller_data.get("ip", "0.0.0.0")

        # Set unique_id and name
        self._attr_unique_id = f"{DOMAIN}_{config_entry.entry_id}_controller_{self._controller_name}"
        self._attr_name = f"{self._controller_name} Health"

        # Set device info to group with xSchedule integration
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name="xSchedule",
            manufacturer="xLights",
            model="xSchedule",
        )

        # Update state from initial data
        self.update_from_data(controller_data)

        _LOGGER.debug("Initialized controller sensor: %s (unique_id: %s)",
                     self._controller_name, self._attr_unique_id)

    @callback
    def update_from_data(self, controller_data: dict[str, Any]) -> None:
        """Update sensor state from controller data."""
        # Binary sensor is ON when controller is healthy (result == "Ok")
        result = controller_data.get("result", "Failed")
        self._attr_is_on = result == "Ok"

        # Store additional attributes
        self._attr_extra_state_attributes = {
            "controller_name": self._controller_name,
            "ip_address": controller_data.get("ip", self._controller_ip),
            "result": result,
            "fail_count": controller_data.get("failcount", "0"),
        }

        # Schedule update
        if self.hass:
            self.async_write_ha_state()

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return True

    @property
    def icon(self) -> str:
        """Return the icon based on status."""
        if self.is_on:
            return "mdi:check-network"
        return "mdi:close-network"
