# Queue Standardization Plan

Implement standard Home Assistant `enqueue` parameter support while retaining advanced custom queue management features.

## Overview

Support both standard HA queue operations (via `play_media` with `enqueue` parameter) AND custom queue services for advanced features. This provides:
- **Standard compatibility:** Works with any HA card/interface via `enqueue`
- **Advanced features:** Drag-drop reordering, individual deletion, priority management via custom services

## Current State

### Custom Queue Services (Keep All)

| Service | Purpose | Standard Equivalent? |
|---------|---------|---------------------|
| `xschedule.add_to_internal_queue` | Add song to queue | `play_media` with `enqueue: next` |
| `xschedule.remove_from_internal_queue` | Remove specific song | ❌ None |
| `xschedule.reorder_internal_queue` | Drag-drop reordering | ❌ None |
| `xschedule.clear_internal_queue` | Clear entire queue | `play_media` with `enqueue: replace` |

### Standard HA Queue Operations (Add Support)

| Enqueue Value | Behavior | Implementation |
|--------------|----------|----------------|
| `play` (default) | Play immediately | Current behavior |
| `add` | Add to end of queue | Call `async_add_to_internal_queue()` |
| `next` | Play after current | Call `async_add_to_internal_queue()` (front) |
| `replace` | Clear queue and play | Call `async_clear_internal_queue()` then play |

## Implementation Plan

### Step 1: Add Enqueue Parameter Support (Backend)

**File:** `custom_components/xschedule/media_player.py`

**Changes:**

1. Import `MediaPlayerEnqueue`:
   ```python
   from homeassistant.components.media_player import (
       BrowseMedia,
       MediaPlayerEntity,
       MediaPlayerEntityFeature,
       MediaPlayerEnqueue,  # Add this
       MediaPlayerState,
       MediaType,
   )
   ```

2. Update `async_play_media()` signature and logic:
   ```python
   async def async_play_media(
       self,
       media_type: MediaType | str,
       media_id: str,
       enqueue: MediaPlayerEnqueue | None = None,
       **kwargs: Any
   ) -> None:
       """Play media from media browser with optional queue support."""
       _LOGGER.info(
           "Play media called: type=%s, id=%s, enqueue=%s, kwargs=%s",
           media_type, media_id, enqueue, kwargs
       )
       
       # Parse media_id to extract song name if needed
       if "|||" in media_id:
           # Playing specific song: "playlist|||song"
           playlist, song = media_id.split("|||", 1)
           song_name = song
       else:
           # Playing entire playlist or just song name
           song_name = media_id
       
       # Handle enqueue parameter
       if enqueue == MediaPlayerEnqueue.REPLACE:
           # Clear queue and play immediately
           _LOGGER.info("Enqueue REPLACE: Clearing queue before playback")
           await self.async_clear_internal_queue()
           # Then proceed with normal play (fall through)
           
       elif enqueue == MediaPlayerEnqueue.ADD:
           # Add to end of internal queue
           _LOGGER.info("Enqueue ADD: Adding '%s' to end of queue", song_name)
           await self.async_add_to_internal_queue(song_name)
           return  # Don't play immediately
           
       elif enqueue == MediaPlayerEnqueue.NEXT:
           # Add to front of internal queue (play after current)
           _LOGGER.info("Enqueue NEXT: Adding '%s' to front of queue", song_name)
           await self.async_add_to_internal_queue(song_name)
           return  # Don't play immediately
       
       # enqueue == MediaPlayerEnqueue.PLAY or None: Play immediately (default)
       _LOGGER.info("Playing immediately: %s", media_id)
       
       # ... rest of existing play_media logic ...
       # (Current WebSocket/REST API command logic)
   ```

### Step 2: Keep All Custom Queue Services

**No changes needed** - all custom services remain:
- `xschedule.add_to_internal_queue` - Used by custom cards
- `xschedule.remove_from_internal_queue` - No standard equivalent
- `xschedule.reorder_internal_queue` - No standard equivalent
- `xschedule.clear_internal_queue` - Used by custom cards

### Step 3: Update Documentation

**File:** `README.md`

Add section:

```markdown
### Queue Management

xSchedule supports both standard and advanced queue operations:

#### Standard Queue (Any HA Card)
Use the standard `media_player.play_media` service with the `enqueue` parameter:
- `enqueue: play` - Play immediately (default)
- `enqueue: add` - Add to end of queue
- `enqueue: next` - Play after current track
- `enqueue: replace` - Clear queue and play

Example:
```yaml
service: media_player.play_media
target:
  entity_id: media_player.xschedule
data:
  media_content_type: music
  media_content_id: "Hanau Pa|||Sandbar"
  enqueue: next
```

#### Advanced Queue (Custom Cards)
Our custom cards provide additional queue management:
- **Reorder:** Drag-and-drop songs to change playback order
- **Remove:** Delete individual songs with X button
- **Priority:** Songs added multiple times play sooner
- **Clear:** Remove all queued songs at once
```

**File:** `custom_components/xschedule/services.yaml`

No changes needed - keep all service definitions.

### Step 4: Add Tests

**File:** `tests/test_media_player.py`

Add new test class:

```python
class TestEnqueueSupport:
    """Test standard enqueue parameter support in play_media."""
    
    @pytest.mark.asyncio
    async def test_enqueue_play_plays_immediately(self, media_player_entity, mock_websocket):
        """Test enqueue: play plays immediately (default behavior)."""
        from homeassistant.components.media_player import MediaPlayerEnqueue
        
        await media_player_entity.async_play_media(
            "music",
            "Hanau Pa|||Sandbar",
            enqueue=MediaPlayerEnqueue.PLAY
        )
        
        # Should send play command immediately
        mock_websocket.command.assert_called_once()
        assert media_player_entity._internal_queue == []
    
    @pytest.mark.asyncio
    async def test_enqueue_add_to_queue(self, media_player_entity, mock_websocket):
        """Test enqueue: add adds to end of queue."""
        from homeassistant.components.media_player import MediaPlayerEnqueue
        
        # Add first song
        await media_player_entity.async_play_media(
            "music",
            "Hanau Pa|||Sandbar",
            enqueue=MediaPlayerEnqueue.ADD
        )
        
        # Should NOT play immediately
        mock_websocket.command.assert_not_called()
        
        # Should be in queue
        assert len(media_player_entity._internal_queue) == 1
        assert media_player_entity._internal_queue[0]["song"] == "Sandbar"
    
    @pytest.mark.asyncio
    async def test_enqueue_next_to_front(self, media_player_entity, mock_websocket):
        """Test enqueue: next adds to front of queue."""
        from homeassistant.components.media_player import MediaPlayerEnqueue
        
        # Add first song
        await media_player_entity.async_add_to_internal_queue("Song1")
        
        # Add another with enqueue: next
        await media_player_entity.async_play_media(
            "music",
            "Hanau Pa|||Song2",
            enqueue=MediaPlayerEnqueue.NEXT
        )
        
        # Song2 should be at front (will play first)
        assert len(media_player_entity._internal_queue) == 2
        assert media_player_entity._internal_queue[0]["song"] == "Song2"
        assert media_player_entity._internal_queue[1]["song"] == "Song1"
    
    @pytest.mark.asyncio
    async def test_enqueue_replace_clears_queue(self, media_player_entity, mock_websocket):
        """Test enqueue: replace clears queue before playing."""
        from homeassistant.components.media_player import MediaPlayerEnqueue
        
        # Add some songs to queue
        await media_player_entity.async_add_to_internal_queue("Song1")
        await media_player_entity.async_add_to_internal_queue("Song2")
        assert len(media_player_entity._internal_queue) == 2
        
        # Play with replace
        await media_player_entity.async_play_media(
            "music",
            "Hanau Pa|||NewSong",
            enqueue=MediaPlayerEnqueue.REPLACE
        )
        
        # Queue should be cleared
        assert len(media_player_entity._internal_queue) == 0
        
        # Should play immediately
        mock_websocket.command.assert_called()
    
    @pytest.mark.asyncio
    async def test_enqueue_none_plays_immediately(self, media_player_entity, mock_websocket):
        """Test no enqueue parameter plays immediately (backward compat)."""
        await media_player_entity.async_play_media(
            "music",
            "Hanau Pa|||Sandbar"
            # No enqueue parameter
        )
        
        # Should send play command immediately
        mock_websocket.command.assert_called_once()
        assert media_player_entity._internal_queue == []
```

### Step 5: Integration Testing

Test scenarios:

1. **From standard HA media browser:**
   - Browse to xSchedule playlists
   - Right-click a song → "Add to queue"
   - Verify it appears in custom card's queue UI
   - Verify it plays after current song

2. **From custom xSchedule card:**
   - Click queue button on a song
   - Verify it uses custom service (for advanced features)
   - Verify drag-drop reordering works
   - Verify individual delete works

3. **Mixed usage:**
   - Add songs via standard enqueue
   - Add songs via custom queue button
   - Reorder queue via drag-drop
   - Verify playback order is correct

4. **From standard media player card:**
   - Use "Add to queue" from three-dot menu
   - Verify queue updates in xSchedule custom card

## Benefits

1. **Universal Compatibility:** Any HA card can queue songs using standard `enqueue`
2. **Advanced Features:** Custom cards retain drag-drop, deletion, priority
3. **No Breaking Changes:** Custom services still work for existing automations
4. **Better UX:** Works with native HA media browser queue controls
5. **Standards Compliant:** Follows HA media player conventions
6. **Flexible:** Users choose standard or advanced queue features

## Testing Checklist

- [ ] Import `MediaPlayerEnqueue` in media_player.py
- [ ] Update `async_play_media()` signature with `enqueue` parameter
- [ ] Implement `enqueue: play` (default immediate playback)
- [ ] Implement `enqueue: add` (add to end of queue)
- [ ] Implement `enqueue: next` (add to front of queue)
- [ ] Implement `enqueue: replace` (clear and play)
- [ ] Write 6 unit tests for enqueue functionality
- [ ] Test from standard HA media browser
- [ ] Test from custom xSchedule card
- [ ] Test mixed usage (standard + custom)
- [ ] Update README.md with enqueue documentation
- [ ] Verify custom services still work
- [ ] Verify drag-drop reordering still works
- [ ] Verify individual song deletion still works
- [ ] Run full test suite (`npm test && pytest`)

## Implementation Notes

- Keep ALL custom queue services - they provide features beyond standard `enqueue`
- `enqueue: add` and `enqueue: next` both use `async_add_to_internal_queue()` internally
- The difference between `add` and `next` is insertion position (end vs. front)
- `enqueue: replace` clears queue but then plays normally (doesn't add to queue)
- Custom cards continue using `xschedule.add_to_internal_queue` for advanced features
- Standard HA cards automatically get queue support via `enqueue` parameter

