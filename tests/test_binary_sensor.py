"""Tests for xSchedule binary_sensor platform."""
import pytest
from unittest.mock import AsyncMock, Mock, patch
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.const import STATE_ON, STATE_OFF, CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant

from custom_components.xschedule import async_setup_entry
from custom_components.xschedule.binary_sensor import XScheduleControllerSensor, clean_controller_name
from custom_components.xschedule.const import DOMAIN, CONF_PASSWORD, DEFAULT_NAME


class TestCleanControllerName:
    """Test clean_controller_name helper function."""

    def test_removes_ip_from_start(self):
        """Test that IP address is removed from the start of controller name."""
        assert clean_controller_name("192.168.1.101 Tree / Eves") == "Tree / Eves"
        assert clean_controller_name("192.168.1.102 Web") == "Web"
        assert clean_controller_name("192.168.1.103 Pumpkins") == "Pumpkins"

    def test_preserves_name_without_ip(self):
        """Test that names without IP addresses are unchanged."""
        assert clean_controller_name("Tree / Eves") == "Tree / Eves"
        assert clean_controller_name("Web") == "Web"
        assert clean_controller_name("Test Controller") == "Test Controller"

    def test_trims_whitespace(self):
        """Test that extra whitespace is trimmed."""
        assert clean_controller_name("192.168.1.101  Tree / Eves  ") == "Tree / Eves"
        assert clean_controller_name("  Tree / Eves  ") == "Tree / Eves"

    def test_handles_various_ip_formats(self):
        """Test handling of various IP address formats."""
        assert clean_controller_name("10.0.0.1 Controller") == "Controller"
        assert clean_controller_name("172.16.254.1 Device") == "Device"
        assert clean_controller_name("255.255.255.255 Max") == "Max"

    def test_ip_not_at_start_preserved(self):
        """Test that IP addresses not at the start are preserved."""
        assert clean_controller_name("Controller 192.168.1.101") == "Controller 192.168.1.101"
        assert clean_controller_name("Test (192.168.1.101)") == "Test (192.168.1.101)"


class TestBinarySensorSetup:
    """Test binary sensor platform setup."""

    async def test_setup_requires_media_player(self, hass: HomeAssistant):
        """Test that setup handles missing media player gracefully."""
        # When media player component doesn't exist yet, setup should handle gracefully
        from custom_components.xschedule.binary_sensor import async_setup_entry

        entry = MockConfigEntry(
            domain=DOMAIN,
            title=DEFAULT_NAME,
            data={
                CONF_HOST: "192.168.1.100",
                CONF_PORT: 80,
                CONF_PASSWORD: "",
            },
            unique_id="xschedule_192.168.1.100_80",
        )
        entry.add_to_hass(hass)

        # Should handle missing media player component
        mock_add_entities = Mock()
        await async_setup_entry(hass, entry, mock_add_entities)

        # Should not have added any entities since media player doesn't exist
        mock_add_entities.assert_not_called()


class TestControllerSensor:
    """Test XScheduleControllerSensor entity."""

    def test_sensor_init_with_healthy_controller(self, mock_config_entry):
        """Test sensor initialization with healthy controller."""
        controller_data = {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, controller_data)

        assert sensor.is_on is True
        assert sensor.device_class == BinarySensorDeviceClass.CONNECTIVITY
        assert sensor.name == "Tree / Eves Health"  # IP address should be removed from display name
        assert "192.168.1.101" in sensor.extra_state_attributes["ip_address"]

    def test_sensor_init_with_failed_controller(self, mock_config_entry):
        """Test sensor initialization with failed controller."""
        controller_data = {
            "controller": "192.168.1.110 Inside",
            "ip": "192.168.1.110",
            "result": "Failed",
            "failcount": "3",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, controller_data)

        assert sensor.is_on is False
        assert sensor.extra_state_attributes["fail_count"] == "3"
        assert sensor.extra_state_attributes["result"] == "Failed"

    def test_sensor_update_from_data(self, mock_config_entry):
        """Test sensor updates when controller data changes."""
        initial_data = {
            "controller": "Test Controller",
            "ip": "192.168.1.100",
            "result": "Ok",
            "failcount": "0",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, initial_data)
        assert sensor.is_on is True

        # Update to failed state
        failed_data = {
            "controller": "Test Controller",
            "ip": "192.168.1.100",
            "result": "Failed",
            "failcount": "5",
        }

        sensor.update_from_data(failed_data)

        assert sensor.is_on is False
        assert sensor.extra_state_attributes["fail_count"] == "5"
        assert sensor.extra_state_attributes["result"] == "Failed"

    def test_sensor_icon_changes_with_status(self, mock_config_entry):
        """Test that sensor icon changes based on health status."""
        healthy_data = {
            "controller": "Test Controller",
            "ip": "192.168.1.100",
            "result": "Ok",
            "failcount": "0",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, healthy_data)
        assert sensor.icon == "mdi:check-network"

        # Update to failed
        failed_data = {
            "controller": "Test Controller",
            "ip": "192.168.1.100",
            "result": "Failed",
            "failcount": "1",
        }

        sensor.update_from_data(failed_data)
        assert sensor.icon == "mdi:close-network"

    def test_sensor_unique_id_format(self, mock_config_entry):
        """Test that unique_id follows expected format."""
        controller_data = {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, controller_data)

        expected_unique_id = (
            f"{DOMAIN}_{mock_config_entry.entry_id}_controller_192.168.1.101 Tree / Eves"
        )
        assert sensor.unique_id == expected_unique_id

    def test_sensor_always_available(self, mock_config_entry):
        """Test that sensor is always marked as available."""
        controller_data = {
            "controller": "Test Controller",
            "ip": "192.168.1.100",
            "result": "Failed",
            "failcount": "10",
        }

        sensor = XScheduleControllerSensor(mock_config_entry, controller_data)

        # Even if controller is failing, sensor entity should be available
        assert sensor.available is True


class TestControllerStatusEvents:
    """Test controller status update events."""

    async def test_event_data_structure(self, hass: HomeAssistant):
        """Test the structure of controller status update events."""
        # Track fired events
        events = []

        async def event_listener(event):
            events.append(event)

        hass.bus.async_listen(
            f"{DOMAIN}_controller_status_update",
            event_listener,
        )

        # Fire a mock event with expected structure
        test_controllers = [
            {
                "controller": "Test Controller",
                "ip": "192.168.1.100",
                "result": "Ok",
                "failcount": "0",
            }
        ]

        hass.bus.async_fire(
            f"{DOMAIN}_controller_status_update",
            {
                "entry_id": "test_entry_id",
                "controllers": test_controllers,
            },
        )
        await hass.async_block_till_done()

        # Verify event was received with correct structure
        assert len(events) == 1
        assert events[0].data["entry_id"] == "test_entry_id"
        assert "controllers" in events[0].data
        assert len(events[0].data["controllers"]) == 1
        assert events[0].data["controllers"][0]["controller"] == "Test Controller"
