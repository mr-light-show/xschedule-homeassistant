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
SERVICE_JUMP_TO_STEP = "jump_to_step"
SERVICE_GET_PLAYLIST_SCHEDULES = "get_playlist_schedules"
SERVICE_GET_PLAYLISTS_WITH_METADATA = "get_playlists_with_metadata"

# Internal Queue services
SERVICE_ADD_TO_INTERNAL_QUEUE = "add_to_internal_queue"
SERVICE_REMOVE_FROM_INTERNAL_QUEUE = "remove_from_internal_queue"
SERVICE_REORDER_INTERNAL_QUEUE = "reorder_internal_queue"
SERVICE_CLEAR_INTERNAL_QUEUE = "clear_internal_queue"

SCHEMA_PLAY_SONG = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("playlist"): cv.string,
        vol.Required("song"): cv.string,
    }
)

SCHEMA_JUMP_TO_STEP = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("step"): cv.string,
    }
)

SCHEMA_GET_PLAYLIST_SCHEDULES = vol.Schema(
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

# Internal Queue schemas
SCHEMA_ADD_TO_INTERNAL_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("song"): cv.string,
    }
)

SCHEMA_REMOVE_FROM_INTERNAL_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("queue_item_id"): cv.string,
    }
)

SCHEMA_REORDER_INTERNAL_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required("queue_item_ids"): [cv.string],
    }
)

SCHEMA_CLEAR_INTERNAL_QUEUE = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
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
        _LOGGER.info("Lovelace config mode: %s", lovelace_config.get("mode", "unknown") if isinstance(lovelace_config, dict) else "storage")

        if not hasattr(resources, "async_items"):
            _LOGGER.warning("Resources does not have async_items method - might be YAML mode")
            return

        if not hasattr(resources, "async_create_item"):
            _LOGGER.warning("Resources does not have async_create_item method - might be YAML mode")
            return
        
        _LOGGER.info("Resource collection type: %s", type(resources))
        _LOGGER.info("Resource collection ID: %s", getattr(resources, 'collection_id', 'unknown'))

        # Get existing resources once (async_items() is not actually async, it returns a list)
        if callable(resources.async_items):
            existing = resources.async_items()
        else:
            existing = []

        _LOGGER.info("Found %d existing resources total", len(existing))
        _LOGGER.info("Existing resources: %s", [r.get("url", "") for r in existing])

        for card in cards:
            # Check if already registered (check base URL without timestamp)
            base_url = card["url"].split("?")[0]
            already_registered = False
            resources_to_delete = []

            # Find matching resources (our cards only)
            for existing_resource in existing:
                existing_url = existing_resource.get("url", "")
                existing_base = existing_url.split("?")[0]

                _LOGGER.debug("Checking existing resource: %s (base: %s) against our card: %s (base: %s)", 
                             existing_url, existing_base, card["url"], base_url)

                if existing_base == base_url:
                    # Check if this is exactly the same URL (including timestamp)
                    if existing_url == card["url"]:
                        # Already registered with correct timestamp
                        _LOGGER.info("Resource already registered: %s", card["url"])
                        already_registered = True
                    else:
                        # Old entry with different timestamp - mark for deletion
                        _LOGGER.warning("Marking xSchedule resource for deletion (timestamp mismatch): %s", existing_url)
                        resources_to_delete.append(existing_resource)

            # Delete old entries BEFORE adding new one
            if resources_to_delete and hasattr(resources, "async_delete_item"):
                _LOGGER.info("Deleting %d old xSchedule resources", len(resources_to_delete))
                for old_resource in resources_to_delete:
                    resource_id = old_resource.get("id")
                    old_url = old_resource.get("url", "")
                    try:
                        _LOGGER.warning("DELETING resource ID=%s URL=%s", resource_id, old_url)
                        await resources.async_delete_item(resource_id)
                        _LOGGER.info("Successfully removed old xSchedule resource: %s", old_url)
                    except Exception as del_err:
                        _LOGGER.error("Failed to delete old resource %s: %s", old_url, del_err)

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


# Removed async_setup() - it was registering resources too early (before other integrations)
# and causing other HACS cards to be removed. Only async_setup_entry() should register resources.


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

    # Delay resource registration until Home Assistant is fully started
    # This ensures Lovelace resources are loaded before we try to register
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

    async def async_jump_to_step(call: ServiceCall) -> None:
        """Handle jump_to_step service call."""
        entity_ids = call.data["entity_id"]
        step = call.data["step"]

        _LOGGER.debug("jump_to_step service called: entity_ids=%s, step=%s", entity_ids, step)

        for entity_id in entity_ids:
            # Get the media player entity directly from the component
            component = hass.data.get("media_player")
            if not component:
                _LOGGER.error("media_player component not found in hass.data")
                continue
                
            entity_obj = component.get_entity(entity_id)
            if not entity_obj:
                _LOGGER.error("Entity %s not found in media_player component", entity_id)
                continue
                
            if not hasattr(entity_obj, "async_jump_to_step"):
                _LOGGER.error("Entity %s does not have async_jump_to_step method", entity_id)
                continue
                
            try:
                _LOGGER.debug("Calling async_jump_to_step on entity %s with step=%s", entity_id, step)
                await entity_obj.async_jump_to_step(step)
                _LOGGER.info("Successfully called async_jump_to_step for %s", entity_id)
            except Exception as err:
                _LOGGER.error("Error calling async_jump_to_step for %s: %s", entity_id, err, exc_info=True)

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

    # Internal Queue service handlers
    async def async_add_to_internal_queue(call: ServiceCall) -> None:
        """Handle add_to_internal_queue service call."""
        entity_ids = call.data["entity_id"]
        song = call.data["song"]

        _LOGGER.debug("add_to_internal_queue service called: entity_ids=%s, song=%s", entity_ids, song)

        for entity_id in entity_ids:
            component = hass.data.get("media_player")
            if not component:
                _LOGGER.error("media_player component not found in hass.data")
                continue
                
            entity_obj = component.get_entity(entity_id)
            if not entity_obj:
                _LOGGER.error("Entity %s not found in media_player component", entity_id)
                continue
                
            if not hasattr(entity_obj, "async_add_to_internal_queue"):
                _LOGGER.error("Entity %s does not have async_add_to_internal_queue method", entity_id)
                continue
                
            try:
                _LOGGER.debug("Calling async_add_to_internal_queue on entity %s with song=%s", entity_id, song)
                await entity_obj.async_add_to_internal_queue(song)
                _LOGGER.info("Successfully called async_add_to_internal_queue for %s", entity_id)
            except Exception as err:
                _LOGGER.error("Error calling async_add_to_internal_queue for %s: %s", entity_id, err, exc_info=True)
                raise

    async def async_remove_from_internal_queue(call: ServiceCall) -> None:
        """Handle remove_from_internal_queue service call."""
        entity_ids = call.data["entity_id"]
        queue_item_id = call.data["queue_item_id"]

        _LOGGER.debug("remove_from_internal_queue service called: entity_ids=%s, queue_item_id=%s", 
                     entity_ids, queue_item_id)

        for entity_id in entity_ids:
            component = hass.data.get("media_player")
            if not component:
                _LOGGER.error("media_player component not found in hass.data")
                continue
                
            entity_obj = component.get_entity(entity_id)
            if not entity_obj:
                _LOGGER.error("Entity %s not found in media_player component", entity_id)
                continue
                
            if not hasattr(entity_obj, "async_remove_from_internal_queue"):
                _LOGGER.error("Entity %s does not have async_remove_from_internal_queue method", entity_id)
                continue
                
            try:
                _LOGGER.debug("Calling async_remove_from_internal_queue on entity %s", entity_id)
                await entity_obj.async_remove_from_internal_queue(queue_item_id)
                _LOGGER.info("Successfully called async_remove_from_internal_queue for %s", entity_id)
            except Exception as err:
                _LOGGER.error("Error calling async_remove_from_internal_queue for %s: %s", entity_id, err, exc_info=True)
                raise

    async def async_reorder_internal_queue(call: ServiceCall) -> None:
        """Handle reorder_internal_queue service call."""
        entity_ids = call.data["entity_id"]
        queue_item_ids = call.data["queue_item_ids"]

        _LOGGER.debug("reorder_internal_queue service called: entity_ids=%s, queue_item_ids=%s", 
                     entity_ids, queue_item_ids)

        for entity_id in entity_ids:
            component = hass.data.get("media_player")
            if not component:
                _LOGGER.error("media_player component not found in hass.data")
                continue
                
            entity_obj = component.get_entity(entity_id)
            if not entity_obj:
                _LOGGER.error("Entity %s not found in media_player component", entity_id)
                continue
                
            if not hasattr(entity_obj, "async_reorder_internal_queue"):
                _LOGGER.error("Entity %s does not have async_reorder_internal_queue method", entity_id)
                continue
                
            try:
                _LOGGER.debug("Calling async_reorder_internal_queue on entity %s", entity_id)
                await entity_obj.async_reorder_internal_queue(queue_item_ids)
                _LOGGER.info("Successfully called async_reorder_internal_queue for %s", entity_id)
            except Exception as err:
                _LOGGER.error("Error calling async_reorder_internal_queue for %s: %s", entity_id, err, exc_info=True)
                raise

    async def async_clear_internal_queue(call: ServiceCall) -> None:
        """Handle clear_internal_queue service call."""
        entity_ids = call.data["entity_id"]

        _LOGGER.debug("clear_internal_queue service called: entity_ids=%s", entity_ids)

        for entity_id in entity_ids:
            component = hass.data.get("media_player")
            if not component:
                _LOGGER.error("media_player component not found in hass.data")
                continue
                
            entity_obj = component.get_entity(entity_id)
            if not entity_obj:
                _LOGGER.error("Entity %s not found in media_player component", entity_id)
                continue
                
            if not hasattr(entity_obj, "async_clear_internal_queue"):
                _LOGGER.error("Entity %s does not have async_clear_internal_queue method", entity_id)
                continue
                
            try:
                _LOGGER.debug("Calling async_clear_internal_queue on entity %s", entity_id)
                await entity_obj.async_clear_internal_queue()
                _LOGGER.info("Successfully called async_clear_internal_queue for %s", entity_id)
            except Exception as err:
                _LOGGER.error("Error calling async_clear_internal_queue for %s: %s", entity_id, err, exc_info=True)
                raise

    hass.services.async_register(
        DOMAIN, SERVICE_PLAY_SONG, async_play_song, schema=SCHEMA_PLAY_SONG
    )
    hass.services.async_register(
        DOMAIN, SERVICE_JUMP_TO_STEP, async_jump_to_step, schema=SCHEMA_JUMP_TO_STEP
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
        SERVICE_GET_PLAYLISTS_WITH_METADATA,
        async_get_playlists_with_metadata,
        schema=SCHEMA_GET_PLAYLISTS_WITH_METADATA,
        supports_response=True,
    )

    # Register internal queue services
    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_TO_INTERNAL_QUEUE,
        async_add_to_internal_queue,
        schema=SCHEMA_ADD_TO_INTERNAL_QUEUE,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_FROM_INTERNAL_QUEUE,
        async_remove_from_internal_queue,
        schema=SCHEMA_REMOVE_FROM_INTERNAL_QUEUE,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REORDER_INTERNAL_QUEUE,
        async_reorder_internal_queue,
        schema=SCHEMA_REORDER_INTERNAL_QUEUE,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CLEAR_INTERNAL_QUEUE,
        async_clear_internal_queue,
        schema=SCHEMA_CLEAR_INTERNAL_QUEUE,
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
        hass.services.async_remove(DOMAIN, SERVICE_JUMP_TO_STEP)
        hass.services.async_remove(DOMAIN, SERVICE_GET_PLAYLIST_SCHEDULES)
        hass.services.async_remove(DOMAIN, SERVICE_GET_PLAYLISTS_WITH_METADATA)
        # Unregister internal queue services
        hass.services.async_remove(DOMAIN, SERVICE_ADD_TO_INTERNAL_QUEUE)
        hass.services.async_remove(DOMAIN, SERVICE_REMOVE_FROM_INTERNAL_QUEUE)
        hass.services.async_remove(DOMAIN, SERVICE_REORDER_INTERNAL_QUEUE)
        hass.services.async_remove(DOMAIN, SERVICE_CLEAR_INTERNAL_QUEUE)

    return unload_ok
