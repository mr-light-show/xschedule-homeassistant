# Fix xSchedule Card Not Recognizing Playing State on Page Reload

## Problem

On page reload, the xSchedule media player card doesn't recognize what's currently playing, even though the xSchedule playlist browser card does show the correct playlist.

**Symptoms:**
- Entity state shows: `playlist: null`, `song: null`
- Card displays "No playlist" / "No song"
- Non-xSchedule players (e.g., Pandora) work correctly on reload
- xSchedule playlist browser card works (makes active service calls)

**Root Cause:**
1. `async_update()` doesn't fetch current playing status - only fetches playlist names
2. `media_playlist` and `media_title` are only populated by WebSocket status updates
3. On page reload, if no WebSocket update has arrived yet, attributes remain `None`/`null`
4. Deprecated attributes (`playlist`, `song`) in `extra_state_attributes` are also `null`

## Solution

Make `async_update()` actively fetch the current playing status via REST API, ensuring the entity always has valid state on initialization/reload.

## Implementation Steps

### Step 1: Update async_update() to Fetch Playing Status

**File:** `custom_components/xschedule/media_player.py`

**Current behavior (line ~365-388):**
```python
async def async_update(self) -> None:
    """Fetch latest state from xSchedule."""
    try:
        # Connect WebSocket if not connected
        if not self._websocket or not self._websocket.connected:
            await self._async_connect_websocket()
            
        # WebSocket handles updates, we just maintain connection
        if self._websocket and self._websocket.connected:
            status = await self._websocket.query("GetPlayingStatus")
            if status:
                self._handle_websocket_update(status)

        # Only fetch playlists if we don't have them yet
        if not self._playlists:
            self._playlists = await self._api_client.get_playlists()

        # Get current playlist steps only if playlist is playing
        # and we don't already have them cached
        if self._attr_media_playlist and not self._current_playlist_steps:
            self._current_playlist_steps = await self._api_client.get_playlist_steps(
                self._attr_media_playlist
            )
```

**New behavior:**
```python
async def async_update(self) -> None:
    """Fetch latest state from xSchedule."""
    try:
        # Connect WebSocket if not connected
        if not self._websocket or not self._websocket.connected:
            await self._async_connect_websocket()
        
        # Fetch current playing status (ensures state on reload)
        # WebSocket will also send updates, but this guarantees we have initial state
        try:
            status = await self._api_client.query("GetPlayingStatus")
            if status:
                self._handle_websocket_update(status)
        except Exception as err:
            _LOGGER.debug("Failed to fetch playing status in async_update: %s", err)
        
        # Only fetch playlists if we don't have them yet
        if not self._playlists:
            self._playlists = await self._api_client.get_playlists()

        # Get current playlist steps only if playlist is playing
        # and we don't already have them cached
        if self._attr_media_playlist and not self._current_playlist_steps:
            self._current_playlist_steps = await self._api_client.get_playlist_steps(
                self._attr_media_playlist
            )
```

**Changes:**
- Always fetch `GetPlayingStatus` via REST API in `async_update()`
- Process status through existing `_handle_websocket_update()` method
- WebSocket updates continue to work (real-time updates)
- Ensures entity has valid state immediately on initialization/reload

### Step 2: Remove Deprecated Attributes

**File:** `custom_components/xschedule/media_player.py` (line ~404-410)

**Current:**
```python
attributes = {
    "playlist": self._attr_media_playlist,
    "song": self._attr_media_title,
    "time_remaining": self._time_remaining,
    "source_list": self._playlists or [],
}
```

**New:**
```python
attributes = {
    "time_remaining": self._time_remaining,
    "source_list": self._playlists or [],
}
```

**Reason:**
- `playlist` and `song` are deprecated (duplicates of `media_playlist` and `media_title`)
- Frontend cards already use standard attributes with fallback
- Completing standardization migration

### Step 3: Verify Frontend Fallbacks Still Work

**File:** `cards/src/xschedule-card.js`

**Current code already has fallbacks:**
```javascript
// Line 128
const currentPlaylist = this._entity.attributes.media_playlist || this._entity.attributes.playlist;

// Line 277
const song = this._entity.attributes.media_title || this._entity.attributes.song;
```

**After removing deprecated attributes:**
- Primary path: `media_playlist` and `media_title` (standard attributes)
- Fallback path: `playlist` and `song` (for older integration versions)
- Card will work with both old and new integration versions

### Step 4: Test Scenarios

1. **Page Reload Test:**
   - Restart Home Assistant
   - Open UI immediately
   - Verify xSchedule card shows current playlist/song
   - Verify state shows `media_playlist` and `media_title` (not `null`)

2. **WebSocket Update Test:**
   - Change song/playlist in xSchedule
   - Verify card updates in real-time
   - Confirm WebSocket updates still work

3. **Idle State Test:**
   - Stop playback
   - Verify card shows idle state correctly
   - Confirm attributes are cleared

4. **Generic Player Test:**
   - Test Pandora/other player cards still work
   - Verify no regression

## Expected Results

**Before Fix:**
```yaml
playlist: null
song: null
media_playlist: (not visible in state, but null)
media_title: (not visible in state, but null)
```

**After Fix:**
```yaml
# Deprecated attributes removed
media_playlist: "Christmas"  # Now populated on reload
media_title: "Jingle Bells"  # Now populated on reload
```

**Card Behavior:**
- ✅ Recognizes playing state immediately on page reload
- ✅ Real-time updates via WebSocket continue to work
- ✅ Generic players still work (no regression)
- ✅ Standardization complete (deprecated attributes removed)

## Benefits

1. **Immediate State on Reload:** Entity always has current state
2. **Better User Experience:** No blank card on page reload
3. **Consistency:** Works like other media players
4. **Standards Compliance:** Deprecated attributes removed
5. **Dual Update Path:** REST API for initialization, WebSocket for real-time
6. **No Breaking Changes:** Frontend fallbacks ensure backward compatibility

## Files Modified

1. `custom_components/xschedule/media_player.py` - Update `async_update()` and remove deprecated attributes
2. Frontend already compatible (has fallbacks)
3. Build frontend (no code changes needed)

