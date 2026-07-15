"""Tests for integration-side state publish optimizations."""
from __future__ import annotations

import asyncio
from unittest.mock import MagicMock

import pytest

from custom_components.xschedule.media_player import XScheduleMediaPlayer
from homeassistant.components.media_player import MediaPlayerState
from homeassistant.core import HomeAssistant


class TestTransientIdleHandling:
    """Verify brief idle gaps do not clear media attributes."""

    @pytest.mark.asyncio
    async def test_transient_idle_preserves_media_attributes(self, media_player_entity):
        """Seek/step gaps with outputtolights active should not clear now playing."""
        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Halloween"
        media_player_entity._attr_media_title = "The Munsters"
        media_player_entity._attr_media_position = 26.0
        media_player_entity._attr_media_duration = 180.0

        media_player_entity._handle_websocket_update(
            {"status": "idle", "outputtolights": "true"}
        )

        assert media_player_entity.state == MediaPlayerState.PLAYING
        assert media_player_entity.media_playlist == "Halloween"
        assert media_player_entity.media_title == "The Munsters"
        assert media_player_entity.media_position == 26.0
        assert media_player_entity.media_duration == 180.0

    @pytest.mark.asyncio
    async def test_bare_idle_during_pause_preserves_media(self, media_player_entity):
        """Seek gaps send idle without outputtolights; playback attrs must persist."""
        media_player_entity._attr_state = MediaPlayerState.PAUSED
        media_player_entity._attr_media_playlist = "Hanau Pa"
        media_player_entity._attr_media_title = "The Tiki Tiki Tiki Room"
        media_player_entity._attr_media_position = 90.349
        media_player_entity._attr_media_duration = 180.0

        media_player_entity._handle_websocket_update({"status": "idle"})

        assert media_player_entity.state == MediaPlayerState.PAUSED
        assert media_player_entity.media_playlist == "Hanau Pa"
        assert media_player_entity.media_title == "The Tiki Tiki Tiki Room"
        assert media_player_entity.media_position == 90.349

    @pytest.mark.asyncio
    async def test_confirmed_stop_still_clears_media_attributes(self, media_player_entity):
        """A true stop should still clear media attributes."""
        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Halloween"
        media_player_entity._attr_media_title = "The Munsters"
        media_player_entity._attr_media_position = 26.0
        media_player_entity._attr_media_duration = 180.0

        media_player_entity._handle_websocket_update(
            {"status": "idle", "outputtolights": "false"}
        )

        assert media_player_entity.state == MediaPlayerState.IDLE
        assert media_player_entity.media_playlist is None
        assert media_player_entity.media_title is None
        assert media_player_entity.media_position is None
        assert media_player_entity.media_duration is None


class TestPublishDeduping:
    """Verify duplicate snapshots are not published to Home Assistant."""

    @pytest.mark.asyncio
    async def test_duplicate_publish_skipped(self, media_player_entity):
        """Identical entity snapshots should only publish once."""
        media_player_entity._last_published_snapshot = None
        media_player_entity.async_write_ha_state = MagicMock()
        publish_calls = []
        original_publish = media_player_entity._publish_state_if_changed

        def track_publish():
            publish_calls.append(1)
            return original_publish()

        media_player_entity._publish_state_if_changed = track_publish

        media_player_entity._publish_state_if_changed()
        media_player_entity._publish_state_if_changed()

        assert len(publish_calls) == 2
        assert media_player_entity.async_write_ha_state.call_count == 1

    @pytest.mark.asyncio
    async def test_pause_like_updates_publish_once(
        self, hass: HomeAssistant, media_player_entity
    ):
        """Back-to-back websocket updates with same meaningful state publish once."""
        media_player_entity._last_published_snapshot = None
        media_player_entity.async_write_ha_state = MagicMock()

        media_player_entity._attr_state = MediaPlayerState.PLAYING
        media_player_entity._attr_media_playlist = "Halloween"
        media_player_entity._attr_media_title = "The Munsters"
        media_player_entity._attr_media_position = 26.029
        media_player_entity._attr_media_duration = 180.0

        paused = {
            "status": "paused",
            "playlist": "Halloween",
            "step": "The Munsters",
            "positionms": "26029",
            "lengthms": "180000",
            "outputtolights": "false",
        }

        media_player_entity._handle_websocket_update(paused)
        media_player_entity._handle_websocket_update(paused)

        await asyncio.sleep(0.25)
        await hass.async_block_till_done()
        await media_player_entity._async_publish_after_ready()

        assert media_player_entity.async_write_ha_state.call_count == 1


class TestBatchedPlaylistPublish:
    """Verify playlist songs are fetched before the debounced publish."""

    @pytest.mark.asyncio
    async def test_playlist_change_publishes_once_with_songs(
        self, hass: HomeAssistant, media_player_entity, mock_api_client
    ):
        """Playlist changes should fetch songs and publish a single snapshot."""
        media_player_entity._last_published_snapshot = None
        media_player_entity.async_write_ha_state = MagicMock()
        mock_api_client.get_playlist_steps.return_value = [
            {"name": "House lights", "lengthms": "120000"},
        ]

        media_player_entity._handle_websocket_update(
            {
                "status": "playing",
                "playlist": "Halloween Background",
                "step": "House lights",
                "positionms": "0",
                "lengthms": "120000",
            }
        )

        await media_player_entity._async_publish_after_ready()

        mock_api_client.get_playlist_steps.assert_called_once_with("Halloween Background")
        assert media_player_entity.async_write_ha_state.call_count == 1

        attrs = media_player_entity.extra_state_attributes
        assert len(attrs["playlist_songs"]) == 1
        assert attrs["playlist_songs"][0]["name"] == "House lights"
