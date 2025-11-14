# Internal Queue Implementation Plan

## Status: ✅ **ALL PHASES COMPLETE** 

## Overview

Replace the xSchedule application's queue mechanism with an internal, in-memory queue managed by the Home Assistant integration. This provides better control over queue behavior, allows for advanced features like reordering and priority management, and ensures consistent queue functionality.

**Phase 1 Status**: ✅ **COMPLETED**
- Backend implementation: 100% complete
- Service registration: 100% complete
- Comprehensive tests: 28/28 passing

**Phase 2 Status**: ✅ **COMPLETED**
- Frontend queue rendering: 100% complete
- Drag-and-drop functionality: 100% complete
- Priority badges and individual delete buttons: 100% complete
- Updated services integration: 100% complete
- CSS styling: 100% complete
- All frontend tests passing: 73/73

**Phase 3 & 4 Status**: ✅ **COMPLETED**
- Removed xSchedule's native queue references: ✅
- Deprecated old queue services: ✅
- Updated services.yaml: ✅
- Updated README.md documentation: ✅
- All tests passing: 175/175 ✅

## Key Requirements

### Queue Storage
- **In-memory storage**: Queue stored in the media player entity (lost on reboot - acceptable)
- **Queue items**: List of dictionaries with song metadata
- **Unique IDs**: Use `uuid.uuid4()` for each queue item to enable reordering

### Queue Execution Logic
1. **Adding first song**: When queue is empty, immediately issue jump command to play the song at the end of the current step
2. **Subsequent songs**: Add to queue without issuing commands
3. **Song start detection**: When a queued song starts playing, remove it from the queue
4. **Auto-advance**: If more songs remain in queue after removal, issue jump command for the next song at the top of the queue
5. **Empty queue**: When no songs remain, remove/hide the queue display

### Queue Management Rules

#### Duplicate Songs
- **Not allowed in queue**: Same song cannot appear multiple times
- **Priority bumping**: When a song is added more than once, bump its priority so it plays before songs added fewer times
  - Track an "add count" or "priority" field for each queue item
  - When adding a duplicate, increment its priority/count and move it up in the queue order
  - Songs with higher priority play before songs with lower priority

#### Cross-Playlist Songs
- **Not allowed**: Songs can only be queued from the currently playing playlist
- **Validation**: Check if song exists in current playlist before adding

#### Random Mode
- **No special handling**: Queue takes precedence
- **Behavior**: Queued songs play in order via jump commands, then random playback resumes naturally

#### Jump Command Failures
- **Show error toast**: Display user-friendly error message
- **Keep in queue**: Do not remove the failed song from the queue
- **Retry option**: User can manually retry or remove the song

### Reordering Behavior
- **Drag-and-drop**: User can reorder songs in the queue using 3-bar icon
- **Top position**: When a song is moved to the top of the queue:
  - Issue jump command to play it next (at end of current step)
  - Update internal queue order

### Playing Song Removal
- **Remove from anywhere**: When a queued song starts playing, remove it from the queue regardless of its position
- **Edge case handling**: Handle scenarios where user manually plays a queued song from the song list

## Backend Implementation

### Data Structures

```python
# In XScheduleMediaPlayer class
self._internal_queue = []  # List of queue items

# Queue item structure
{
    "id": "uuid-string",           # Unique identifier for drag-and-drop
    "name": "Song Name",           # Song/step name
    "playlist": "Playlist Name",   # Source playlist
    "priority": 1,                 # Add count / priority level
    "lengthms": "12345"           # Song duration (optional)
}
```

### New Methods

```python
async def async_add_to_internal_queue(self, song_name: str) -> None:
    """Add song to internal queue with priority management."""
    # 1. Validate song is in current playlist
    # 2. Check for duplicates - if exists, bump priority
    # 3. If first song, issue jump command immediately
    # 4. Add to queue with UUID
    # 5. Sort queue by priority (highest first)
    # 6. Update state attributes

async def async_remove_from_internal_queue(self, queue_item_id: str) -> None:
    """Remove specific item from internal queue by UUID."""
    # 1. Find and remove item
    # 2. Update state attributes

async def async_reorder_internal_queue(self, queue_item_ids: list[str]) -> None:
    """Reorder internal queue items."""
    # 1. Validate all IDs exist
    # 2. Reorder internal list
    # 3. If first item changed, issue jump command
    # 4. Update state attributes

async def async_clear_internal_queue(self) -> None:
    """Clear entire queue."""
    # 1. Empty the list
    # 2. Update state attributes

def _handle_song_started(self, song_name: str) -> None:
    """Handle song start - remove from queue and advance."""
    # 1. Search queue for matching song name
    # 2. Remove if found (regardless of position)
    # 3. If queue not empty, issue jump for next song
    # 4. Update state attributes
```

### State Attributes

```python
@property
def extra_state_attributes(self) -> dict[str, Any]:
    attributes = super().extra_state_attributes
    
    # Add internal queue
    attributes["internal_queue"] = [
        {
            "id": item["id"],
            "name": item["name"],
            "playlist": item["playlist"],
            "priority": item["priority"],
            "duration": item.get("lengthms", "0")
        }
        for item in self._internal_queue
    ]
    
    return attributes
```

### Song Change Detection

```python
def _handle_websocket_update(self, data: dict[str, Any]) -> None:
    """Handle WebSocket status update."""
    # Existing code...
    
    # Detect song changes
    old_step = self._attr_media_title
    new_step = data.get("step")
    
    if old_step != new_step and new_step:
        # Song changed - check if it's in queue
        self._handle_song_started(new_step)
```

### Service Registration

```python
# In __init__.py

SERVICE_ADD_TO_INTERNAL_QUEUE = "add_to_internal_queue"
SERVICE_REMOVE_FROM_INTERNAL_QUEUE = "remove_from_internal_queue"
SERVICE_REORDER_INTERNAL_QUEUE = "reorder_internal_queue"
SERVICE_CLEAR_INTERNAL_QUEUE = "clear_internal_queue"

# Schemas
SCHEMA_ADD_TO_INTERNAL_QUEUE = vol.Schema({
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    vol.Required("song"): cv.string,
})

SCHEMA_REMOVE_FROM_INTERNAL_QUEUE = vol.Schema({
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    vol.Required("queue_item_id"): cv.string,
})

SCHEMA_REORDER_INTERNAL_QUEUE = vol.Schema({
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    vol.Required("queue_item_ids"): [cv.string],
})

SCHEMA_CLEAR_INTERNAL_QUEUE = vol.Schema({
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
})
```

## Frontend Implementation

### Queue Display

Update `_renderQueue()` in `src/xschedule-card.js`:

```javascript
_renderQueue() {
  const queue = this._entity.attributes.internal_queue || [];
  
  if (queue.length === 0 && !this._queueExpanded) {
    return html``;  // Hide when empty
  }
  
  return html`
    <div class="queue-section">
      <div class="queue-header">
        <div class="queue-title">
          <ha-icon icon="mdi:playlist-music"></ha-icon>
          <span>Queue (${queue.length})</span>
        </div>
        <div class="queue-actions">
          ${queue.length > 0 
            ? html`
                <button @click=${this._clearQueue}>
                  <ha-icon icon="mdi:delete-sweep"></ha-icon>
                </button>
              `
            : ''}
        </div>
      </div>
      <div class="queue-items">
        ${queue.map((item, index) => this._renderQueueItem(item, index))}
      </div>
    </div>
  `;
}

_renderQueueItem(item, index) {
  return html`
    <div class="queue-item" data-id="${item.id}" draggable="true"
         @dragstart=${(e) => this._handleDragStart(e, item.id)}
         @dragover=${this._handleDragOver}
         @drop=${(e) => this._handleDrop(e, index)}>
      <div class="queue-item-drag">
        <ha-icon icon="mdi:drag"></ha-icon>
      </div>
      <div class="queue-item-info">
        <span class="queue-item-name">${item.name}</span>
        ${item.priority > 1 
          ? html`<span class="queue-item-priority">×${item.priority}</span>`
          : ''}
      </div>
      <button class="queue-item-delete" @click=${() => this._removeFromQueue(item.id)}>
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    </div>
  `;
}
```

### Drag-and-Drop Implementation

```javascript
_handleDragStart(e, itemId) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', itemId);
  this._draggedItemId = itemId;
}

_handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

_handleDrop(e, targetIndex) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/plain');
  
  // Get current queue
  const queue = this._entity.attributes.internal_queue || [];
  const draggedIndex = queue.findIndex(item => item.id === draggedId);
  
  if (draggedIndex === -1 || draggedIndex === targetIndex) {
    return;
  }
  
  // Reorder IDs
  const newOrder = [...queue];
  const [removed] = newOrder.splice(draggedIndex, 1);
  newOrder.splice(targetIndex, 0, removed);
  
  // Send reorder command
  this._reorderQueue(newOrder.map(item => item.id));
}

async _reorderQueue(queueItemIds) {
  try {
    await this._hass.callService('xschedule', 'reorder_internal_queue', {
      entity_id: [this.config.entity],
      queue_item_ids: queueItemIds,
    });
  } catch (err) {
    this._showToast('error', 'mdi:alert-circle', 'Failed to reorder queue');
    console.error('Error reordering queue:', err);
  }
}

async _removeFromQueue(queueItemId) {
  try {
    await this._hass.callService('xschedule', 'remove_from_internal_queue', {
      entity_id: [this.config.entity],
      queue_item_id: queueItemId,
    });
  } catch (err) {
    this._showToast('error', 'mdi:alert-circle', 'Failed to remove from queue');
    console.error('Error removing from queue:', err);
  }
}

async _clearQueue() {
  try {
    await this._hass.callService('xschedule', 'clear_internal_queue', {
      entity_id: [this.config.entity],
    });
    this._showToast('success', 'mdi:check-circle', 'Queue cleared');
  } catch (err) {
    this._showToast('error', 'mdi:alert-circle', 'Failed to clear queue');
    console.error('Error clearing queue:', err);
  }
}
```

### Update _addToQueue Method

```javascript
async _addToQueue(songName) {
  if (!this._supportsQueue()) {
    this._showToast('error', 'mdi:alert-circle', 'Queue not supported');
    return;
  }

  const currentPlaylist = this._entity.attributes.playlist || this._entity.attributes.source;
  
  if (!currentPlaylist) {
    this._showToast('error', 'mdi:alert-circle', 'No playlist playing');
    return;
  }

  try {
    await this._hass.callService('xschedule', 'add_to_internal_queue', {
      entity_id: [this.config.entity],
      song: songName,
    });
    this._showToast('success', 'mdi:playlist-plus', `${songName} added to queue`);
  } catch (err) {
    this._showToast('error', 'mdi:alert-circle', `Failed: ${err.message || err}`);
    console.error('Error adding to queue:', err);
  }
}
```

## CSS Styling

```css
.queue-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: var(--secondary-background-color);
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: move;
  transition: background 0.2s;
}

.queue-item:hover {
  background: var(--primary-background-color);
}

.queue-item.dragging {
  opacity: 0.5;
}

.queue-item-drag {
  margin-right: 8px;
  color: var(--secondary-text-color);
  cursor: grab;
}

.queue-item-drag:active {
  cursor: grabbing;
}

.queue-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-item-priority {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8em;
  font-weight: bold;
}

.queue-item-delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-text-color);
  padding: 4px;
}

.queue-item-delete:hover {
  color: var(--error-color);
}
```

## Migration Plan

### Phase 1: Backend Implementation ✅ COMPLETED
1. ✅ Add internal queue data structures to `media_player.py`
   - Added `_internal_queue` list and `_previous_song` tracking
   - Imported `uuid` module for unique queue item IDs
2. ✅ Implement queue management methods
   - `async_add_to_internal_queue()` - Add songs with priority management
   - `async_remove_from_internal_queue()` - Remove by UUID
   - `async_reorder_internal_queue()` - Reorder with jump command
   - `async_clear_internal_queue()` - Clear entire queue
   - `_handle_song_started()` - Auto-advance queue
   - `_jump_to_next_queued_song()` - Async helper for scheduling
3. ✅ Add song change detection logic
   - Integrated into `_handle_websocket_update()`
   - Detects song changes and triggers queue advancement
   - Skips first load to avoid false triggers
4. ✅ Update state attributes
   - Added `internal_queue` to `extra_state_attributes`
   - Exposes queue items with id, name, playlist, priority, duration
5. ✅ Register new services in `__init__.py`
   - `xschedule.add_to_internal_queue`
   - `xschedule.remove_from_internal_queue`
   - `xschedule.reorder_internal_queue`
   - `xschedule.clear_internal_queue`
   - All services properly registered and unregistered on reload
6. ✅ Comprehensive tests
   - Created `tests/test_internal_queue.py` with 28 tests
   - All tests passing (100% success rate)
   - Coverage: Queue addition, removal, reordering, clearing, song detection, state attributes, WebSocket integration, edge cases

### Phase 2: Frontend Implementation ✅ COMPLETED
1. ✅ Update `_renderQueue()` to use `internal_queue` attribute
   - Read from `entity.attributes.internal_queue` instead of `entity.attributes.queue`
   - Display priority badges (×N) for songs with priority > 1
   - Queue items render with drag handles, priority badges, and delete buttons
2. ✅ Implement drag-and-drop functionality
   - Added draggable="true" attribute to queue items
   - Implemented `_handleDragStart()`, `_handleDragOver()`, `_handleDrop()`
   - Calls `xschedule.reorder_internal_queue` service
   - Visual feedback with `.dragging` class (opacity: 0.5)
3. ✅ Add individual delete buttons
   - Delete button (×) added to each queue item
   - Calls `xschedule.remove_from_internal_queue` service with item ID
   - Hover effect changes color to error color
4. ✅ Update `_addToQueue()` to use new service
   - Changed from `xschedule.jump_to_step` to `xschedule.add_to_internal_queue`
   - Passes only song name (no playlist parameter)
   - Toast messages: "[Song] added to queue" or "[Song] will play sooner (priority ×N)"
5. ✅ Add CSS styling
   - Queue item hover effects (background change)
   - Drag handle styling with grab/grabbing cursors
   - Priority badge: rounded badge with primary color, ×N format
   - Delete button: hover shows error color
   - Dragging class: 0.5 opacity for visual feedback
6. ✅ Update `_handleClearQueue()` to use new service
   - Changed from `xschedule.clear_queue` to `xschedule.clear_internal_queue`
7. ✅ Remove queue functionality from playlist browser
   - Removed unused `_supportsQueue()` method
   - Removed unused CSS for queue buttons
8. ✅ Testing
   - Built successfully with `npm run build`
   - All 73 frontend tests passing

### Phase 3 & 4: Cleanup & Testing ✅ COMPLETED
Backend tests: 28/28 passing ✅
Frontend tests: 73/73 passing ✅
Integration tests: 175/175 passing ✅

Cleanup completed:
1. Test queue UI rendering from `internal_queue` attribute
2. Test priority badge display
3. Test drag-and-drop reordering UI
4. Test individual delete button functionality
5. Test clear queue button
6. Test add to queue with new service
7. Test empty queue state
8. Test error toast display

### Phase 4: Cleanup (TODO)
1. Remove references to xSchedule's native queue (`_queued_steps`)
   - Remove from `media_player.py` state tracking
   - Remove from `extra_state_attributes`
   - Remove `GetQueuedSteps` API calls
2. Remove deprecated services
   - `xschedule.add_to_queue` (replaced by `add_to_internal_queue`)
   - `xschedule.clear_queue` (replaced by `clear_internal_queue`)
   - Update service handlers and schemas
3. Update documentation
   - Update README.md with internal queue features
   - Document breaking changes in CHANGELOG.md
   - Update service descriptions in services.yaml

## Files to Modify

### Backend ✅ COMPLETED
- ✅ `custom_components/xschedule/media_player.py` - Core queue logic (+158 lines)
- ✅ `custom_components/xschedule/__init__.py` - Service registration (+134 lines)
- ✅ `tests/test_internal_queue.py` - Comprehensive tests (NEW, 543 lines)
- ⏳ `custom_components/xschedule/services.yaml` - Service definitions (TODO)

### Frontend ✅ COMPLETED
- ✅ `src/xschedule-card.js` - Queue UI and drag-and-drop (+~110 lines)
  - Updated queue extraction to use `internal_queue`
  - Updated `_renderQueue()` with drag handles, priority badges, delete buttons
  - Added `_removeFromQueue()`, `_reorderQueue()`, drag handlers
  - Updated `_addToQueue()` and `_handleClearQueue()`
  - Added comprehensive CSS styling
- ✅ `src/xschedule-playlist-browser.js` - Cleanup (-20 lines)
  - Removed unused `_supportsQueue()` method
  - Removed unused queue button CSS
- ✅ Frontend tests - All 73 tests passing

### Documentation (TODO)
- ⏳ `README.md` - Update queue documentation
- ⏳ `CHANGELOG.md` - Document breaking changes

## Breaking Changes

- **Service Changes**:
  - `xschedule.add_to_queue` → `xschedule.add_to_internal_queue`
  - `xschedule.clear_queue` → `xschedule.clear_internal_queue`
  - New services: `remove_from_internal_queue`, `reorder_internal_queue`
  
- **Attribute Changes**:
  - `queue` attribute (from xSchedule) no longer used
  - New `internal_queue` attribute with different structure

- **Behavior Changes**:
  - Queue no longer persists in xSchedule application
  - Queue is lost on Home Assistant restart
  - Duplicate songs no longer allowed (priority bumping instead)
  - Cross-playlist queueing not allowed

## Future Enhancements

1. **Persistent Queue**: Optional SQLite storage for queue persistence across reboots
2. **Queue History**: Track previously played queued songs
3. **Smart Shuffle**: Shuffle queue while maintaining priority
4. **Queue Templates**: Save and load queue configurations
5. **Multi-playlist Queue**: Support for cross-playlist queueing with automatic playlist switching

