# Standardize xSchedule Interfaces Analysis

Replace non-standard interfaces with standard Home Assistant conventions where possible, improving compatibility and reducing custom code complexity.

## Phase 1: Entity Attribute Analysis

### Current Custom Attributes vs. Standard HA Attributes

| Custom Attribute | Standard HA Equivalent | Status |
|-----------------|------------------------|---------|
| `playlist` | `media_playlist` | Duplicate - Remove |
| `song` | `media_title` | Duplicate - Remove |
| `playlist_songs` | N/A (via BROWSE_MEDIA) | Keep + Enhance Browse |
| `integration` | N/A | Keep (feature detection) |
| (none) | `media_track` | Missing - Add |

**Note:** Queue attributes (`queue`, `internal_queue`) are covered in `queue_standardization.md`

**Recommendation:**

- **Remove** duplicates: `playlist` and `song` (use standard `media_playlist` and `media_title`)
- **Keep** `playlist_songs` - Provides instant current playlist display for xSchedule players
- **Enhance** `BROWSE_MEDIA` - Add duration field to song entries for universal compatibility
- **Update** cards - Use `playlist_songs` if available (xSchedule), otherwise fetch via `BROWSE_MEDIA` (universal)
- **Use** `media_track` for current step number in playlist (standard)
- **Remove** custom `playlist` attribute (use standard `media_playlist` only)

---

## Phase 2: Service Interface Analysis

### Current Custom Services vs. Standard HA Services

| Custom Service | Standard HA Equivalent | Status |
|---------------|------------------------|---------|
| `xschedule.jump_to_step` | N/A (Playlist navigation) | Keep - xSchedule-specific |
| `xschedule.get_playlist_schedules` | N/A (Schedule info) | Keep - xSchedule-specific |
| `xschedule.get_playlist_steps` | `media_player.browse_media` | Deprecate - Use browse |
| `xschedule.get_playlists_with_metadata` | `media_player.browse_media` | Deprecate - Use browse |
| (none) | `media_player.select_source` | Already implemented ✓ |

**Note:** Queue services are handled separately in `queue_standardization.md`

**Recommendation:**

- **Keep** `jump_to_step` - xSchedule-specific extended functionality
- **Keep** `get_playlist_schedules` - xSchedule-specific schedule info
- **Deprecate** `get_playlist_steps` and `get_playlists_with_metadata` - Use `BROWSE_MEDIA` instead
- **No backward compatibility needed** - Cards and integration are distributed together

---

## Phase 3: Frontend Card Analysis

### Current Card Service Calls

**xschedule-card.js:**
- ✓ Uses `media_player.play_media` for playlist/song playback (standard)
- ✓ Uses `media_player.select_source` for playlist selection (standard)
- ✓ Uses `media_player.turn_off` for power off (standard)
- ✗ Reads `playlist_songs` attribute directly (update to support fallback)

**Note:** Queue management is covered in `queue_standardization.md`

**xschedule-playlist-browser.js:**
- ✓ Uses `media_player.play_media` for playlist playback (standard)
- ✗ Uses `xschedule.get_playlist_schedules` service (keep - xSchedule-specific)
- ✗ Uses `xschedule.get_playlist_steps` service (migrate to `BROWSE_MEDIA`)

**Recommendation:**

- **Update xschedule-card.js:** Add fallback to `BROWSE_MEDIA` when `playlist_songs` unavailable
- **Update xschedule-playlist-browser.js:** Migrate from `get_playlist_steps` to `BROWSE_MEDIA`
- **Keep** schedule info display using `get_playlist_schedules` (xSchedule-specific feature)

---

## Phase 4: Implementation Plan

### 4.1 Backend Changes (media_player.py)

1. **Enhance BROWSE_MEDIA with duration:**
   ```python
   # In _async_build_playlist_songs_browser()
   for step in steps_data:
       step_name = step.get("name", "Unknown")
       duration_ms = int(step.get("lengthms") or 0)
       
       children.append(
           BrowseMedia(
               can_expand=False,
               can_play=True,
               media_class=MediaType.MUSIC,
               media_content_id=f"{playlist_name}|||{step_name}",
               media_content_type=MediaType.MUSIC,
               title=step_name,
               thumbnail=None,
               duration=duration_ms / 1000,  # Convert ms to seconds
           )
       )
   ```

2. **Add media_track to extra_state_attributes:**
   ```python
   # Track current song position in playlist
   if self._current_step_id and self._current_playlist_steps:
       for idx, step in enumerate(self._current_playlist_steps, 1):
           if step.get("id") == self._current_step_id:
               attributes["media_track"] = idx
               break
   ```

3. **Remove duplicate attributes (after frontend migration):**
   - Remove `attributes["playlist"]` (use `media_playlist` only)
   - Remove `attributes["song"]` (use `media_title` only)

### 4.2 Frontend Changes (xschedule-card.js)

1. **Add BROWSE_MEDIA fallback for song list:**
   ```javascript
   async _fetchSongsViaBrowse(playlist) {
     if (!playlist) return [];
     
     try {
       const result = await this.hass.callWS({
         type: 'media_player/browse_media',
         entity_id: this.config.entity,
         media_content_type: 'playlist',
         media_content_id: playlist
       });
       
       return result.children?.map(child => ({
         name: child.title,
         duration: child.duration ? Math.round(child.duration * 1000) : 0
       })) || [];
     } catch (err) {
       console.error('Failed to fetch songs via browse:', err);
       return [];
     }
   }
   
   // In shouldUpdate():
   if (currentPlaylist !== this._lastFetchedPlaylist) {
     this._lastFetchedPlaylist = currentPlaylist;
     
     // Use playlist_songs if available, otherwise fetch via browse
     if (this._entity.attributes.playlist_songs) {
       this._songs = playlistSongs;
     } else {
       // Fallback to browse for non-xSchedule players
       this._fetchSongsViaBrowse(currentPlaylist).then(songs => {
         this._songs = songs;
         this.requestUpdate();
       });
     }
   }
   ```

2. **Migrate attribute reads:**
   - Replace `this._entity.attributes.playlist` with `this._entity.attributes.media_playlist || this._entity.attributes.playlist` (support both during migration)
   - Replace `this._entity.attributes.song` with `this._entity.attributes.media_title || this._entity.attributes.song`

### 4.3 Frontend Changes (xschedule-playlist-browser.js)

1. **Replace `get_playlist_steps` with BROWSE_MEDIA:**
   ```javascript
   async _fetchPlaylistSongs(playlistName) {
     try {
       const result = await this.hass.callWS({
         type: 'media_player/browse_media',
         entity_id: this.config.entity,
         media_content_type: 'playlist',
         media_content_id: playlistName
       });
       
       return result.children?.map(child => ({
         name: child.title,
         duration: child.duration ? Math.round(child.duration * 1000) : 0
       })) || [];
     } catch (err) {
       console.error('Failed to fetch playlist songs:', err);
       return [];
     }
   }
   ```

2. **Keep schedule fetching unchanged:**
   - `xschedule.get_playlist_schedules` remains for xSchedule-specific schedule info display

### 4.4 Backend Cleanup (after frontend migration)

1. **Deprecate redundant services in __init__.py:**
   - Remove `xschedule.get_playlist_steps` service registration
   - Remove `xschedule.get_playlists_with_metadata` service registration

2. **Update services.yaml:**
   - Remove deprecated service definitions
   - Keep jump services (xSchedule-specific)
   - Queue services are covered in `queue_standardization.md`

3. **Update README.md:**
   - Document that `BROWSE_MEDIA` is the standard way to fetch playlist contents
   - Document that `playlist_songs` attribute provides instant access for xSchedule players
   - Note that cards gracefully fallback to browse when attribute is unavailable

---

## Phase 5: Testing Strategy

**Note:** Queue testing is covered separately in `queue_standardization.md`

1. **Test with xSchedule player:**
   - Verify `playlist_songs` attribute still works
   - Verify `BROWSE_MEDIA` includes duration
   - Verify cards use `playlist_songs` for instant display

2. **Test with non-xSchedule player (simulation):**
   - Remove `playlist_songs` attribute temporarily
   - Verify cards fetch via `BROWSE_MEDIA` fallback
   - Verify song list displays correctly with durations

3. **Test attribute migration:**
   - Verify `media_playlist` and `media_title` are populated
   - Verify `media_track` shows correct position
   - Verify cards work with both old and new attributes during transition

---

## Benefits of This Approach

1. **Universal Compatibility:** Cards work with any media player that supports `BROWSE_MEDIA`
2. **Optimized for xSchedule:** Instant playlist display via `playlist_songs` attribute
3. **Standards-Compliant:** Uses standard HA attributes and services where possible
4. **Feature Preservation:** Retains xSchedule-specific features (jump, schedules)
5. **Graceful Degradation:** Cards automatically adapt based on available features
6. **Reduced Complexity:** Fewer custom services to maintain
7. **Better Integration:** Works seamlessly with HA's native media browser

**Note:** Queue-specific benefits are covered in `queue_standardization.md`

---

## Migration Order

**Note:** Queue standardization order is in `queue_standardization.md`

1. ✅ **First:** Enhance `BROWSE_MEDIA` with duration (backend) - **COMPLETED**
2. ✅ **Second:** Add `media_track` support (backend) - **COMPLETED**
3. ✅ **Third:** Update cards to support browse fallback (frontend) - **COMPLETED**
4. ✅ **Fourth:** Migrate attribute reads in cards (frontend) - **COMPLETED**
5. **Fifth:** Test thoroughly with and without `playlist_songs`
6. **Last:** Remove deprecated services and attributes (cleanup)

