# xSchedule: Queue and Play Commands

Understanding the actual xSchedule API commands for playing songs and managing queues.

## The Question

How to play a selected song after the current song ends?

## The Answer

**For songs in a different playlist:** Use the queue system (`Enqueue playlist step`). The queue plays automatically when the current playlist ends or the scheduler is idle.

**For songs in the same playlist:** Use `Jump to specified step in current playlist at the end of current step` to transition smoothly to another song in the currently playing playlist.

**When nothing is playing:** Use `Play playlist step` to play immediately.

## Actual xSchedule API Commands

Based on the [official xSchedule API Documentation](https://raw.githubusercontent.com/xLightsSequencer/xLights/master/documentation/xSchedule%20API%20Documentation.txt), here are the commands that actually exist:

### 1. Enqueue playlist step ✅

**Command:** `Enqueue playlist step`  
**Parameters:** `<playlist name>,<step name>`

**Description:** Adds a step to the persistent queue. The queue automatically plays when:
- The current playlist finishes (not looping)
- The scheduler enters an idle state
- No scheduled playlists take priority

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Enqueue%20playlist%20step&Parameters=Holiday%20Music,Jingle%20Bells"
```

**Key Characteristics:**
- ✅ Works with songs from ANY playlist
- ✅ Builds a persistent list of songs
- ✅ Can query queue with `GetQueuedSteps`
- ✅ Queue persists until cleared with `Clear playlist queue`
- ✅ Multiple songs can be enqueued
- ⚠️ Only plays when current playlist ends or scheduler is idle

**Use Case:** Building a multi-song playlist that users can see and manage, especially when mixing songs from different playlists.

---

### 2. Jump to specified step in current playlist at the end of current step ✅

**Command:** `Jump to specified step in current playlist at the end of current step`  
**Parameters:** `<step name>` (just the step name, NOT the playlist)

**Description:** Jumps to a different song in the **currently playing playlist** after the current song ends. This only works if:
- A playlist is currently playing
- The target song is in that same playlist

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Jump%20to%20specified%20step%20in%20current%20playlist%20at%20the%20end%20of%20current%20step&Parameters=Silent%20Night"
```

**Key Characteristics:**
- ✅ Smooth transition within the same playlist
- ✅ Plays immediately after current step ends
- ✅ Doesn't require queue system
- ❌ Only works within currently playing playlist
- ❌ Cannot switch to a different playlist

**Use Case:** Quick song selection within the currently playing show/playlist without interrupting the current song.

---

### 3. Play playlist step ✅

**Command:** `Play playlist step`  
**Parameters:** `<playlist name>,<step name>`

**Description:** Immediately plays the specified step from the specified playlist. This interrupts whatever is currently playing.

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Play%20playlist%20step&Parameters=Holiday%20Music,Jingle%20Bells"
```

**Key Characteristics:**
- ✅ Works with any playlist
- ✅ Plays immediately
- ⚠️ Interrupts current playback
- ℹ️ Plays just this one step, then stops (unless part of a schedule)

**Use Case:** Immediate playback when nothing is playing, or when you want to interrupt current playback.

---

### 4. Play playlist starting at step ✅

**Command:** `Play playlist starting at step`  
**Parameters:** `<playlist name>,<step name>`

**Description:** Starts playing the specified playlist beginning at the specified step, then continues through the rest of the playlist.

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Play%20playlist%20starting%20at%20step&Parameters=Holiday%20Music,Jingle%20Bells"
```

**Key Characteristics:**
- ✅ Works with any playlist
- ✅ Plays immediately
- ✅ Continues through entire playlist after the starting step
- ⚠️ Interrupts current playback

**Use Case:** Starting a playlist from a specific song rather than from the beginning.

---

### 5. Stop playlist at end of current step ✅

**Command:** `Stop playlist at end of current step`  
**Parameters:** (none)

**Description:** Stops the currently playing playlist after the current step completes. This allows queued songs to play automatically.

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Stop%20playlist%20at%20end%20of%20current%20step"
```

**Key Characteristics:**
- ✅ Graceful stop (doesn't interrupt current song)
- ✅ Allows queue to take over
- ✅ Clean transition

**Use Case:** Ending a playlist gracefully to let queued songs play.

---

### 6. Clear playlist queue ✅

**Command:** `Clear playlist queue`  
**Parameters:** (none)

**Description:** Clears all songs from the queue.

**Example:**
```bash
curl "http://host:8080/xScheduleCommand?Command=Clear%20playlist%20queue"
```

**Use Case:** Clearing the queue to start fresh.

---

## Commands That DO NOT Exist ❌

These commands were incorrectly documented but **do not actually exist** in xSchedule:

- ❌ `Play playlist step after current step` - Does NOT exist
- ❌ `Insert playlist at current position` - Does NOT exist
- ❌ `Play queue` - Does NOT exist (queue plays automatically)

---

## Comparison: Different Approaches

| Scenario | Best Command | Why |
|----------|-------------|-----|
| Song in same playlist | `Jump to specified step in current playlist at the end of current step` | Smooth transition, no interruption |
| Song in different playlist | `Enqueue playlist step` | Only option for cross-playlist "play next" |
| Nothing playing | `Play playlist step` | Immediate playback |
| Want to interrupt | `Play playlist step` or `Play playlist starting at step` | Immediate control |

---

## Key Limitations

1. **Cannot play songs from different playlists after current step ends without using queue**
   - The queue is the ONLY way to play a song from a different playlist after the current song
   - The jump command only works within the currently playing playlist

2. **Queue is passive**
   - Queue only plays when the current playlist ends or scheduler is idle
   - No command to "force play queue now"
   - Must use `Stop playlist at end of current step` to allow queue to take over

3. **Within-playlist jumping is supported**
   - You CAN jump to any song in the currently playing playlist
   - This provides smooth transitions without interruption

---

## Implementation in xSchedule Integration

### Smart Command Selection

The xSchedule Home Assistant integration uses intelligent command selection:

```python
# Pseudocode for smart queue behavior
if current_playlist == song_playlist:
    # Same playlist - use jump command
    command = "Jump to specified step in current playlist at the end of current step"
    params = song_name  # Just the song name
elif no playlist playing:
    # Nothing playing - play immediately
    command = "Play playlist step"
    params = f"{playlist_name},{song_name}"
else:
    # Different playlist - use queue
    command = "Enqueue playlist step"
    params = f"{playlist_name},{song_name}"
```

### Current Implementation (Queue)

```python
# In custom_components/xschedule/api_client.py
async def enqueue_step(self, playlist_name: str, step_name: str) -> dict[str, Any]:
    """Add a step to the queue."""
    params = f"{playlist_name},{step_name}"
    result = await self.command("Enqueue playlist step", params)
    self.invalidate_cache()
    return result
```

### New Addition (Jump to Step)

```python
# In custom_components/xschedule/api_client.py
async def jump_to_step_at_end(self, step_name: str) -> dict[str, Any]:
    """Jump to step in current playlist at end of current step."""
    result = await self.command(
        "Jump to specified step in current playlist at the end of current step",
        step_name
    )
    self.invalidate_cache()
    return result
```

---

## Why Queue is the Default

The queue functionality is the primary implementation because it:
1. **Works across playlists** - Can mix songs from any playlist
2. **Provides visibility** - Users can see what's queued (`GetQueuedSteps`)
3. **Is manageable** - Can be cleared, modified, viewed
4. **Matches user expectations** - Similar to Spotify, music apps
5. **Is universal** - Works whether playlist is playing or not

The "jump to step" command is used opportunistically when it provides a better user experience (same playlist, smoother transition).

---

## References

- [xSchedule API Documentation](https://raw.githubusercontent.com/xLightsSequencer/xLights/master/documentation/xSchedule%20API%20Documentation.txt)
- [xSchedule Integration (This Repository)](https://github.com/mr-light-show/xschedule-homeassistant)

---

## Testing Commands

```bash
# Test 1: Add to queue (works always)
curl "http://192.168.0.226:8080/xScheduleCommand?Command=Enqueue%20playlist%20step&Parameters=hanau%20pa,Gilligans%20island"

# Test 2: Jump within current playlist (only if "hanau pa" is playing)
curl "http://192.168.0.226:8080/xScheduleCommand?Command=Jump%20to%20specified%20step%20in%20current%20playlist%20at%20the%20end%20of%20current%20step&Parameters=Gilligans%20island"

# Test 3: Play immediately (interrupts current)
curl "http://192.168.0.226:8080/xScheduleCommand?Command=Play%20playlist%20step&Parameters=hanau%20pa,Gilligans%20island"

# Test 4: Check queue
curl "http://192.168.0.226:8080/xScheduleQuery?Query=GetQueuedSteps"

# Test 5: Clear queue
curl "http://192.168.0.226:8080/xScheduleCommand?Command=Clear%20playlist%20queue"
```
