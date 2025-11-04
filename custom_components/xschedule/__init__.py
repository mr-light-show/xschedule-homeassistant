"""The xSchedule integration."""
from __future__ import annotations

import logging
import shutil
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers import entity_platform

_LOGGER = logging.getLogger(__name__)

DOMAIN = "xschedule"
PLATFORMS = [Platform.MEDIA_PLAYER, Platform.BINARY_SENSOR]

# Service schemas
SERVICE_PLAY_SONG = "play_song"
SERVICE_ADD_TO_QUEUE = "add_to_queue"
SERVICE_CLEAR_QUEUE = "clear_queue"
SERVICE_GET_PLAYLIST_SCHEDULES = "get_playlist_schedules"
SERVICE_GET_PLAYLIST_STEPS = "get_playlist_steps"
SERVICE_GET_PLAYLISTS_WITH_METADATA = "get_playlists_with_metadata"

SCHEMA_PLAY_SONG = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("playlist"): cv.string,
        vol.Required("song"): cv.string,
    }
)

SCHEMA_ADD_TO_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("playlist"): cv.string,
        vol.Required("song"): cv.string,
    }
)

SCHEMA_CLEAR_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
    }
)

SCHEMA_GET_PLAYLIST_SCHEDULES = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("playlist"): cv.string,
        vol.Optional("force_refresh", default=False): cv.boolean,
    }
)

SCHEMA_GET_PLAYLIST_STEPS = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("playlist"): cv.string,
        vol.Optional("force_refresh", default=False): cv.boolean,
    }
)

SCHEMA_GET_PLAYLISTS_WITH_METADATA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("force_refresh", default=False): cv.boolean,
    }
)


async def _copy_cards_to_www(hass: HomeAssistant) -> dict[str, int]:
    """
    Copy card files to www directory.

    Returns a dict mapping card names to their modification timestamps.
    """
    timestamps = {}
    try:
        # Source directory (integration's www folder)
        source_dir = Path(__file__).parent / "www"

        # Destination directory (Home Assistant's www folder)
        dest_dir = Path(hass.config.path("www"))
        dest_dir.mkdir(exist_ok=True)

        # Cards to copy
        cards = ["xschedule-card.js", "xschedule-playlist-browser.js"]

        for card in cards:
            source_file = source_dir / card
            dest_file = dest_dir / card

            # Copy if source exists and dest doesn't exist or is older
            if source_file.exists():
                if not dest_file.exists() or source_file.stat().st_mtime > dest_file.stat().st_mtime:
                    await hass.async_add_executor_job(shutil.copy2, source_file, dest_file)
                    _LOGGER.info("Copied %s to www directory", card)

                # Get the modification timestamp for cache busting
                timestamps[card] = int(dest_file.stat().st_mtime)
            else:
                _LOGGER.warning("Source file %s not found", source_file)

    except Exception as err:
        _LOGGER.error("Error copying cards to www directory: %s", err)

    return timestamps


async def _register_frontend_resources(hass: HomeAssistant, timestamps: dict[str, int]) -> None:
    """
    Register frontend resources with Home Assistant using lovelace resources storage.

    Uses file modification timestamps as cache busters to avoid browser cache issues.
    """
    try:
        # Get the lovelace configuration
        lovelace_config = hass.data.get("lovelace")
        if not lovelace_config:
            _LOGGER.warning("Lovelace not loaded, skipping resource registration")
            return

        _LOGGER.info("Lovelace config found, attempting to register resources")

        # Cards to register with cache-busting timestamps
        cards = [
            {
                "url": f"/local/xschedule-card.js?t={timestamps.get('xschedule-card.js', 0)}",
                "res_type": "module"
            },
            {
                "url": f"/local/xschedule-playlist-browser.js?t={timestamps.get('xschedule-playlist-browser.js', 0)}",
                "res_type": "module"
            },
        ]

        # Try to access lovelace resources
        if not hasattr(lovelace_config, "resources"):
            _LOGGER.warning("Lovelace resources not accessible (might be in YAML mode)")
            return

        resources = lovelace_config.resources
        _LOGGER.info("Lovelace resources object found: %s", type(resources))

        if not hasattr(resources, "async_items"):
            _LOGGER.warning("Resources does not have async_items method")
            return

        if not hasattr(resources, "async_create_item"):
            _LOGGER.warning("Resources does not have async_create_item method")
            return

        # Get existing resources once (async_items() is not actually async, it returns a list)
        if callable(resources.async_items):
            existing = resources.async_items()
        else:
            existing = []

        _LOGGER.debug("Found %d existing resources total", len(existing))

        for card in cards:
            # Check if already registered (check base URL without timestamp)
            base_url = card["url"].split("?")[0]
            already_registered = False
            resources_to_delete = []

            # Find matching resources (our cards only)
            for existing_resource in existing:
                existing_url = existing_resource.get("url", "")
                existing_base = existing_url.split("?")[0]

                if existing_base == base_url:
                    # Check if this is exactly the same URL (including timestamp)
                    if existing_url == card["url"]:
                        # Already registered with correct timestamp
                        _LOGGER.debug("Resource already registered: %s", card["url"])
                        already_registered = True
                    else:
                        # Old entry with different timestamp - mark for deletion
                        _LOGGER.debug("Marking for deletion (timestamp mismatch): %s", existing_url)
                        resources_to_delete.append(existing_resource)

            # Delete old entries BEFORE adding new one
            if resources_to_delete and hasattr(resources, "async_delete_item"):
                for old_resource in resources_to_delete:
                    resource_id = old_resource.get("id")
                    old_url = old_resource.get("url", "")
                    try:
                        await resources.async_delete_item(resource_id)
                        _LOGGER.info("Removed old resource: %s", old_url)
                    except Exception as del_err:
                        _LOGGER.warning("Failed to delete old resource %s: %s", old_url, del_err)

            # Add the resource if not already registered
            if not already_registered:
                try:
                    await resources.async_create_item(card)
                    _LOGGER.info("Registered resource: %s", card["url"])
                except Exception as add_err:
                    _LOGGER.error("Failed to register resource %s: %s", card["url"], add_err)

        _LOGGER.info("Frontend resource registration completed")

    except Exception as err:
        _LOGGER.error("Error registering frontend resources: %s", err, exc_info=True)


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up xSchedule from a config entry."""
    _LOGGER.debug("Setting up xSchedule integration")

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Copy cards to www and get timestamps for cache busting
    timestamps = await _copy_cards_to_www(hass)

    # Try to register resources immediately if Home Assistant has already started
    # This fixes the issue where adding the integration to a running HA instance
    # required two reboots because the homeassistant_started event had already fired
    lovelace_config = hass.data.get("lovelace")
    if lovelace_config and hasattr(lovelace_config, "resources"):
        # HA has already started, register immediately
        _LOGGER.info("Home Assistant already started, registering resources immediately")
        await _register_frontend_resources(hass, timestamps)
    else:
        # HA hasn't started yet, wait for the event
        _LOGGER.debug("Home Assistant not fully started, will register resources after startup")
        async def register_resources_when_ready(event):
            """Register resources after Home Assistant has started."""
            _LOGGER.debug("Home Assistant started, registering frontend resources")
            await _register_frontend_resources(hass, timestamps)
        
        hass.bus.async_listen_once("homeassistant_started", register_resources_when_ready)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for options changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register services
    async def async_play_song(call: ServiceCall) -> None:
        """Handle play_song service call."""
        entity_ids = call.data["entity_id"]
        playlist = call.data["playlist"]
        song = call.data["song"]

        for entity_id in entity_ids:
            # Get the media player entity directly from the component
            component = hass.data.get("media_player")
            if component:
                entity_obj = component.get_entity(entity_id)
                if entity_obj and hasattr(entity_obj, "async_play_song"):
                    await entity_obj.async_play_song(playlist, song)

    async def async_add_to_queue(call: ServiceCall) -> None:
        """Handle add_to_queue service call."""
        entity_ids = call.data["entity_id"]
        playlist = call.data["playlist"]
        song = call.data["song"]

        for entity_id in entity_ids:
            # Get the media player entity directly from the component
            component = hass.data.get("media_player")
            if component:
                entity_obj = component.get_entity(entity_id)
                if entity_obj and hasattr(entity_obj, "async_add_to_queue"):
                    await entity_obj.async_add_to_queue(playlist, song)

    async def async_clear_queue(call: ServiceCall) -> None:
        """Handle clear_queue service call."""
        entity_ids = call.data["entity_id"]

        for entity_id in entity_ids:
            # Get the media player entity directly from the component
            component = hass.data.get("media_player")
            if component:
                entity_obj = component.get_entity(entity_id)
                if entity_obj and hasattr(entity_obj, "async_clear_queue"):
                    await entity_obj.async_clear_queue()

    async def async_get_playlist_schedules(call: ServiceCall) -> dict[str, Any]:
        """Handle get_playlist_schedules service call."""
        entity_id = call.data["entity_id"]
        playlist = call.data["playlist"]
        force_refresh = call.data.get("force_refresh", False)

        # Get the media player entity directly from the component
        component = hass.data.get("media_player")
        if component:
            entity_obj = component.get_entity(entity_id)
            if entity_obj and hasattr(entity_obj, "async_get_playlist_schedules"):
                schedules = await entity_obj.async_get_playlist_schedules(playlist, force_refresh)
                return {"schedules": schedules}

        return {"schedules": []}

    async def async_get_playlist_steps(call: ServiceCall) -> dict[str, Any]:
        """Handle get_playlist_steps service call."""
        entity_id = call.data["entity_id"]
        playlist = call.data["playlist"]
        force_refresh = call.data.get("force_refresh", False)

        # Get the media player entity directly from the component
        component = hass.data.get("media_player")
        if component:
            entity_obj = component.get_entity(entity_id)
            if entity_obj and hasattr(entity_obj, "_api_client"):
                steps = await entity_obj._api_client.get_playlist_steps(playlist, force_refresh)
                return {"steps": steps}

        return {"steps": []}

    async def async_get_playlists_with_metadata(call: ServiceCall) -> dict[str, Any]:
        """Handle get_playlists_with_metadata service call."""
        entity_id = call.data["entity_id"]
        force_refresh = call.data.get("force_refresh", False)

        # Get the media player entity directly from the component
        component = hass.data.get("media_player")
        if component:
            entity_obj = component.get_entity(entity_id)
            if entity_obj and hasattr(entity_obj, "_api_client"):
                playlists = await entity_obj._api_client.get_playlists_with_metadata(force_refresh)
                return {"playlists": playlists}

        return {"playlists": []}

    hass.services.async_register(
        DOMAIN, SERVICE_PLAY_SONG, async_play_song, schema=SCHEMA_PLAY_SONG
    )
    hass.services.async_register(
        DOMAIN, SERVICE_ADD_TO_QUEUE, async_add_to_queue, schema=SCHEMA_ADD_TO_QUEUE
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_QUEUE, async_clear_queue, schema=SCHEMA_CLEAR_QUEUE
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_PLAYLIST_SCHEDULES,
        async_get_playlist_schedules,
        schema=SCHEMA_GET_PLAYLIST_SCHEDULES,
        supports_response=True,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_PLAYLIST_STEPS,
        async_get_playlist_steps,
        schema=SCHEMA_GET_PLAYLIST_STEPS,
        supports_response=True,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_PLAYLISTS_WITH_METADATA,
        async_get_playlists_with_metadata,
        schema=SCHEMA_GET_PLAYLISTS_WITH_METADATA,
        supports_response=True,
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading xSchedule integration")

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    # Unregister services if this is the last entry
    if not hass.data[DOMAIN]:
        hass.services.async_remove(DOMAIN, SERVICE_PLAY_SONG)
        hass.services.async_remove(DOMAIN, SERVICE_ADD_TO_QUEUE)
        hass.services.async_remove(DOMAIN, SERVICE_CLEAR_QUEUE)
        hass.services.async_remove(DOMAIN, SERVICE_GET_PLAYLIST_SCHEDULES)
        hass.services.async_remove(DOMAIN, SERVICE_GET_PLAYLIST_STEPS)
        hass.services.async_remove(DOMAIN, SERVICE_GET_PLAYLISTS_WITH_METADATA)

    return unload_ok
