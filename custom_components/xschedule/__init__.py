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
PLATFORMS = [Platform.MEDIA_PLAYER]

# Service schemas
SERVICE_PLAY_SONG = "play_song"
SERVICE_ADD_TO_QUEUE = "add_to_queue"
SERVICE_CLEAR_QUEUE = "clear_queue"
SERVICE_GET_PLAYLIST_SCHEDULES = "get_playlist_schedules"
SERVICE_GET_PLAYLIST_STEPS = "get_playlist_steps"

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
    }
)

SCHEMA_GET_PLAYLIST_STEPS = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("playlist"): cv.string,
    }
)


async def _copy_cards_to_www(hass: HomeAssistant) -> None:
    """Copy card files to www directory if they don't exist."""
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

            # Only copy if source exists and dest doesn't exist or is older
            if source_file.exists():
                if not dest_file.exists() or source_file.stat().st_mtime > dest_file.stat().st_mtime:
                    await hass.async_add_executor_job(shutil.copy2, source_file, dest_file)
                    _LOGGER.info("Copied %s to www directory", card)
    except Exception as err:
        _LOGGER.error("Error copying cards to www directory: %s", err)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up xSchedule from a config entry."""
    _LOGGER.debug("Setting up xSchedule integration")

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Copy card files to www directory for user access
    await _copy_cards_to_www(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register services
    async def async_play_song(call: ServiceCall) -> None:
        """Handle play_song service call."""
        entity_ids = call.data["entity_id"]
        playlist = call.data["playlist"]
        song = call.data["song"]

        for entity_id in entity_ids:
            entity = hass.states.get(entity_id)
            if entity and entity.platform == DOMAIN:
                # Get the media player entity
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
            entity = hass.states.get(entity_id)
            if entity and entity.platform == DOMAIN:
                # Get the media player entity
                component = hass.data.get("media_player")
                if component:
                    entity_obj = component.get_entity(entity_id)
                    if entity_obj and hasattr(entity_obj, "async_add_to_queue"):
                        await entity_obj.async_add_to_queue(playlist, song)

    async def async_clear_queue(call: ServiceCall) -> None:
        """Handle clear_queue service call."""
        entity_ids = call.data["entity_id"]

        for entity_id in entity_ids:
            entity = hass.states.get(entity_id)
            if entity and entity.platform == DOMAIN:
                # Get the media player entity
                component = hass.data.get("media_player")
                if component:
                    entity_obj = component.get_entity(entity_id)
                    if entity_obj and hasattr(entity_obj, "async_clear_queue"):
                        await entity_obj.async_clear_queue()

    async def async_get_playlist_schedules(call: ServiceCall) -> dict[str, Any]:
        """Handle get_playlist_schedules service call."""
        entity_id = call.data["entity_id"]
        playlist = call.data["playlist"]

        entity = hass.states.get(entity_id)
        if entity and entity.platform == DOMAIN:
            # Get the media player entity
            component = hass.data.get("media_player")
            if component:
                entity_obj = component.get_entity(entity_id)
                if entity_obj and hasattr(entity_obj, "async_get_playlist_schedules"):
                    schedules = await entity_obj.async_get_playlist_schedules(playlist)
                    return {"schedules": schedules}

        return {"schedules": []}

    async def async_get_playlist_steps(call: ServiceCall) -> dict[str, Any]:
        """Handle get_playlist_steps service call."""
        entity_id = call.data["entity_id"]
        playlist = call.data["playlist"]

        entity = hass.states.get(entity_id)
        if entity and entity.platform == DOMAIN:
            # Get the media player entity
            component = hass.data.get("media_player")
            if component:
                entity_obj = component.get_entity(entity_id)
                if entity_obj and hasattr(entity_obj, "_api_client"):
                    steps = await entity_obj._api_client.get_playlist_steps(playlist)
                    return {"steps": steps}

        return {"steps": []}

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

    return unload_ok
