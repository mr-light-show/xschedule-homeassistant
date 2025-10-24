# xSchedule API Reference

Comprehensive documentation of the xSchedule REST API as used by the Home Assistant integration, combining official xSchedule documentation with actual response structures from a live system.

---

## Overview

### Base URL Format
```
http://{host}:{port}/xScheduleQuery?Query={QueryName}&Parameters={params}
```

### Common Patterns

**All responses include:**
- `reference` field (usually empty string)

**Data Type Conventions:**
- Booleans are **strings** ("true"/"false"), not native booleans
- Times provided in two formats:
  - Formatted: `"MM:SS.mmm"` (e.g., "2:00.000")
  - Milliseconds: Integer (e.g., "120000")
- Dates/times: ISO-like format `"YYYY-MM-DD HH:MM:SS"`

**Important Note from Official Docs:**
> "Unique ID is valid for this session only"

IDs should not be persisted or relied upon across xSchedule restarts.

---

## API Endpoints

### 1. GetPlaylists

**Purpose:** Retrieve list of available playlists with metadata

**Request:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetPlaylists"
```

**Actual Response Structure:**
```json
{
    "playlists": [
        {
            "name": "Halloween Background",
            "id": "10",
            "looping": "true",
            "nextscheduled": "2025-10-23 17:00:00",
            "length": "10:30.000",
            "lengthms": "630000"
        },
        {
            "name": "Halloween",
            "id": "11",
            "looping": "false",
            "nextscheduled": "",
            "length": "33:24.275",
            "lengthms": "2004275"
        }
    ],
    "reference": ""
}
```

**Field Reference:**

| Field | Type | Description | Example | Used? | Usage Location |
|-------|------|-------------|---------|-------|----------------|
| `name` | string | Playlist identifier | "Halloween Background" | ✅ Yes | api_client.py:168 - Extracted for source_list |
| `id` | string | Unique session ID | "10" | ❌ No | N/A - Session-specific, not persisted |
| `looping` | string | Whether playlist loops | "true" | ❌ No | Could show loop status |
| `nextscheduled` | string | Next scheduled time | "2025-10-23 17:00:00" | ❌ No | Could show in UI |
| `length` | string | Total duration (formatted) | "10:30.000" | ❌ No | Superseded by lengthms |
| `lengthms` | string | Total duration (milliseconds) | "630000" | ❌ No | Could show playlist duration |

**Integration Usage:**
- **File:** `api_client.py:get_playlists()`
- **Caching:** 5 minutes
- **Exposes:** `source_list` attribute in media player
- **Only uses:** `name` field
- **Returns:** List of playlist names (strings)

**Enhancement Opportunities:**
- Show playlist duration (`lengthms`)
- Show loop status (`looping`)
- Show next scheduled time (`nextscheduled`)
- Filter playlists by schedule status

---

### 2. GetPlayingStatus

**Purpose:** Get comprehensive current playback information

**Request:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetPlayingStatus"
```

**Response - Playing State:**
```json
{
    "status": "playing",
    "playlist": "Halloween Background",
    "playlistid": "10",
    "playlistlooping": "true",
    "playlistloopsleft": "-32",
    "random": "false",
    "step": "House lights",
    "stepid": "50",
    "steplooping": "false",
    "steploopsleft": "-1",
    "length": "2:00.000",
    "lengthms": "120000",
    "position": "1:57.925",
    "positionms": "117925",
    "left": "0:02.075",
    "leftms": "2075",
    "playlistposition": "1:57.925",
    "playlistpositionms": "117925",
    "playlistleft": "0:02.075",
    "playlistleftms": "2075",
    "trigger": "scheduled",
    "schedulename": "October sunset-30 -> 11pm",
    "scheduleend": "2025-10-21 23:00",
    "scheduleid": "17",
    "nextstep": "House lights",
    "nextstepid": "50",
    "version": "2025.10",
    "queuelength": "0",
    "volume": "100",
    "brightness": "100",
    "time": "2025-10-21 22:07:23",
    "ip": "192.168.0.185",
    "reference": "",
    "autooutputtolights": "false",
    "passwordset": "false",
    "outputtolights": "true",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0"
        },
        {
            "controller": "192.168.1.110 Inside",
            "ip": "192.168.1.110",
            "result": "Failed",
            "failcount": "6699"
        }
    ]
}
```

**Response - Idle State:**
```json
{
    "status": "idle",
    "outputtolights": "false",
    "volume": "100",
    "brightness": "100",
    "ip": "192.168.0.85",
    "version": "2025.10",
    "reference": "",
    "passwordset": "false",
    "time": "2025-10-22 08:19:28",
    "pingstatus": [...]
}
```

**Field Reference:**

| Field | Type | Description (Official Docs) | Example | Used? | Usage Location |
|-------|------|----------------------------|---------|-------|----------------|
| `status` | string | Current state: "idle", "paused", or "playing" | "playing" | ✅ Yes | media_player.py:161 - Maps to MediaPlayerState |
| `playlist` | string | Current playlist name | "Halloween Background" | ✅ Yes | media_player.py:177 - Exposed as media_playlist |
| `playlistid` | string | Current playlist session ID | "10" | ❌ No | Session-specific |
| `playlistlooping` | string | Playlist loop state | "true" | ❌ No | Could show in UI |
| `playlistloopsleft` | string | Remaining loops (-1 = infinite) | "-32" | ❌ No | Could show in UI |
| `random` | string | Random mode active | "false" | ❌ No | Could show in UI |
| `step` | string | Current step/song name | "House lights" | ✅ Yes | media_player.py:180 - Exposed as media_title |
| `stepid` | string | Current step session ID | "50" | ❌ No | Session-specific |
| `steplooping` | string | Step loop state | "false" | ❌ No | Could show in UI |
| `steploopsleft` | string | Remaining step loops | "-1" | ❌ No | Could show in UI |
| `length` | string | Step duration (formatted) | "2:00.000" | ❌ No | Superseded by lengthms |
| `lengthms` | string | Step duration (milliseconds) | "120000" | ✅ Yes | media_player.py:195 - Converted to media_duration |
| `position` | string | Current position (formatted) | "1:57.925" | ❌ No | Superseded by positionms |
| `positionms` | string | Current position (milliseconds) | "117925" | ✅ Yes | media_player.py:186 - Converted to media_position |
| `left` | string | Time remaining (formatted) | "0:02.075" | ❌ No | Superseded by leftms |
| `leftms` | string | Time remaining (milliseconds) | "2075" | ✅ Yes | media_player.py:202 - Stored as _time_remaining |
| `playlistposition` | string | Position in playlist (formatted) | "1:57.925" | ❌ No | Could show total progress |
| `playlistpositionms` | string | Position in playlist (ms) | "117925" | ❌ No | Could show total progress |
| `playlistleft` | string | Playlist time left (formatted) | "0:02.075" | ❌ No | Could show in UI |
| `playlistleftms` | string | Playlist time left (ms) | "2075" | ❌ No | Could show in UI |
| `trigger` | string | Playback source: "Manual", "Queued", or "Scheduled" | "scheduled" | ❌ No | Could show how started |
| `schedulename` | string | Active schedule name | "October sunset-30 -> 11pm" | ❌ No | Could show in UI |
| `scheduleend` | string | Schedule stop time | "2025-10-21 23:00" | ❌ No | Could show in UI |
| `scheduleid` | string | Schedule session ID | "17" | ❌ No | Session-specific |
| `nextstep` | string | Next step name | "House lights" | ❌ No | Could show in UI |
| `nextstepid` | string | Next step session ID | "50" | ❌ No | Session-specific |
| `version` | string | xSchedule version | "2025.10" | ❌ No | Could show in UI |
| `queuelength` | string | Number of queued items | "0" | ❌ No | Redundant with queue attribute |
| `volume` | string | Current volume (0-100) | "100" | ✅ Yes | media_player.py:210 - Converted to volume_level (0-1) |
| `brightness` | string | Current brightness (0-100) | "100" | ❌ No | Could expose as attribute |
| `time` | string | Server time | "2025-10-21 22:07:23" | ❌ No | Could use for sync |
| `ip` | string | Server IP address | "192.168.0.185" | ❌ No | Could show in UI |
| `autooutputtolights` | string | Auto output mode | "false" | ❌ No | Advanced feature |
| `passwordset` | string | Whether password configured | "false" | ❌ No | Security info |
| `outputtolights` | string | Output active | "true" | ✅ Yes | media_player.py:176 - Used to detect truly stopped |
| `pingstatus` | array | Controller health status | [...] | ❌ No | Could monitor controllers |

**pingstatus Array Fields:**

| Field | Type | Description | Example | Used? |
|-------|------|-------------|---------|-------|
| `controller` | string | Controller name | "192.168.1.101 Tree / Eves" | ❌ No |
| `ip` | string | Controller IP | "192.168.1.101" | ❌ No |
| `result` | string | Health: "Ok" or "Failed" | "Ok" | ❌ No |
| `failcount` | string | Consecutive failures | "0" | ❌ No |

**Integration Usage:**
- **File:** `media_player.py:_handle_websocket_update()`
- **Caching:** Real-time via WebSocket, polled as fallback
- **Key Logic:** Detect truly stopped vs between songs
  ```python
  # Truly stopped: status="idle" + no "playlist" field + outputtolights="false"
  if "playlist" not in data and data.get("outputtolights", "false") == "false":
      # Clear playlist_steps and queued_steps
  ```

**Enhancement Opportunities:**
- Show total playlist progress (playlistpositionms/playlistleftms)
- Display active schedule info (schedulename, scheduleend)
- Show trigger source (Manual/Queued/Scheduled)
- Monitor controller health (pingstatus)
- Expose brightness control
- Show next song preview (nextstep)
- Display loop status and remaining loops

---

### 3. GetPlayListSteps

**Purpose:** Get list of steps/songs in a specific playlist

**Request:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetPlayListSteps&Parameters={PlaylistName}"
```

**Example:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetPlayListSteps&Parameters=Halloween"
```

**Actual Response Structure:**
```json
{
    "steps": [
        {
            "name": "Light Em Up",
            "id": "17",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "0:00.000",
            "length": "3:05.750",
            "lengthms": "185750"
        },
        {
            "name": "Pirates of the Caribbean",
            "id": "18",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "3:05.750",
            "length": "4:49.400",
            "lengthms": "289400"
        }
    ],
    "reference": ""
}
```

**Field Reference:**

| Field | Type | Description (Official Docs) | Example | Used? | Usage Location |
|-------|------|----------------------------|---------|-------|----------------|
| `name` | string | Step identifier/song name | "Light Em Up" | ✅ Yes | media_player.py:290 - Exposed in playlist_songs |
| `id` | string | Unique session ID | "17" | ❌ No | Session-specific |
| `startonly` | string | Step type: start only | "false" | ❌ No | Could indicate step type |
| `endonly` | string | Step type: end only | "false" | ❌ No | Could indicate step type |
| `everystep` | string | Step type: every step | "false" | ❌ No | Could indicate step type |
| `offset` | string | Cumulative position in playlist | "3:05.750" | ❌ No | Could show in timeline |
| `length` | string | Step duration (formatted) | "3:05.750" | ❌ No | Superseded by lengthms |
| `lengthms` | string | Step duration (milliseconds) | "185750" | ✅ Yes | media_player.py:291 - Exposed as duration |

**Note from Official Docs:**
> "If playlist name isn't unique, returns first match only"

**Integration Usage:**
- **File:** `api_client.py:get_playlist_steps()`
- **Caching:** 3 minutes
- **Used For:** Display song list in xSchedule Media Player card
- **Exposes:** `playlist_songs` attribute with name and duration
- **Called:** When playlist is playing (media_playlist is not None)

**Enhancement Opportunities:**
- Show step types (startonly/endonly/everystep) with icons
- Display cumulative timeline with offsets
- Show total playlist length calculated from offsets + durations

---

### 4. GetPlayListSchedules

**Purpose:** Get schedules for a specific playlist

**Request:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetPlayListSchedules&Parameters={PlaylistName}"
```

**Expected Response Structure (from official docs):**
```json
{
    "schedules": [
        {
            "name": "Schedule Name",
            "id": "1",
            "enabled": "true",
            "active": "false",
            "looping": "true",
            "loops": "5",
            "random": "false",
            "nextactive": "2025-10-23 18:00:00",
            "scheduleend": ""
        }
    ],
    "reference": ""
}
```

**Field Reference (from Official Docs):**

| Field | Type | Description | Example | Used? | Usage Location |
|-------|------|-------------|---------|-------|----------------|
| `name` | string | Schedule identifier | "October sunset-30 -> 11pm" | ✅ Yes | xschedule-playlist-browser.js |
| `id` | string | Unique session ID | "1" | ❌ No | Session-specific |
| `enabled` | string | Can schedule run? | "true" | ✅ Likely | Used to filter schedules |
| `active` | string | Is schedule running now? | "false" | ✅ Likely | Used to show active state |
| `looping` | string | Schedule repeats when complete | "true" | ❌ Unknown | Could show in UI |
| `loops` | string | Loop count limit (if applicable) | "5" | ❌ Unknown | Could show in UI |
| `random` | string | Randomized playback enabled | "false" | ❌ Unknown | Could show in UI |
| `nextactive` | string | Future activation time (if inactive) | "2025-10-23 18:00:00" | ✅ Yes | Shown as schedule time in UI |
| `scheduleend` | string | Stop time (if currently active) | "2025-10-21 23:00" | ✅ Likely | Could show when active |

**Integration Usage:**
- **File:** `api_client.py:get_playlist_schedules()`
- **Caching:** 5 minutes
- **Used In:** `xschedule-playlist-browser.js` for schedule display
- **Exposes:** Schedule times next to playlists in Playlist Browser card

**Note:** No actual response captured - structure based on official documentation.

---

### 5. GetQueuedSteps

**Purpose:** List queued playlist steps from "Enqueue playlist step" commands

**Request:**
```bash
curl "http://{host}:{port}/xScheduleQuery?Query=GetQueuedSteps"
```

**Expected Response Structure (from official docs):**
```json
{
    "steps": [
        {
            "name": "Step Name",
            "id": "50",
            "length": "2:00.000",
            "lengthms": "120000"
        }
    ],
    "reference": ""
}
```

**Field Reference (from Official Docs):**

| Field | Type | Description | Example | Used? | Usage Location |
|-------|------|-------------|---------|-------|----------------|
| `name` | string | Step identifier/song name | "House lights" | ✅ Yes | media_player.py:292 - Exposed in queue |
| `id` | string | Unique session ID | "50" | ✅ Yes | media_player.py:293 - Exposed in queue |
| `length` | string | Step duration (formatted) | "2:00.000" | ❌ No | Superseded by lengthms |
| `lengthms` | string | Step duration (milliseconds) | "120000" | ✅ Yes | media_player.py:294 - Exposed as duration |

**Integration Usage:**
- **File:** `api_client.py:get_queued_steps()`
- **Caching:** None (real-time)
- **Used For:** Display queue in xSchedule Media Player card
- **Exposes:** `queue` attribute with name, id, and duration
- **Called:** On every update

**Note:** No actual response captured - structure based on official documentation and integration code.

---

## Integration Implementation Map

### Backend (Python)

#### api_client.py
All API interactions with caching:

| Method | API | Cache TTL | Returns | Usage |
|--------|-----|-----------|---------|-------|
| `get_playlists()` | GetPlaylists | 5 min | List[str] | source_list attribute |
| `get_playlist_schedules()` | GetPlayListSchedules | 5 min | List[dict] | Playlist browser schedules |
| `get_playlist_steps()` | GetPlayListSteps | 3 min | List[dict] | playlist_songs attribute |
| `get_queued_steps()` | GetQueuedSteps | None | List[dict] | queue attribute |
| `get_playing_status()` | GetPlayingStatus | None | dict | Fallback when WebSocket down |

**Caching Strategy:**
- Playlists/Schedules: 5 minutes (infrequent changes)
- Steps/Songs: 3 minutes (moderate changes)
- Status/Queue: Real-time (frequent changes)

#### media_player.py
Status parsing and attribute exposure:

**From GetPlayingStatus:**
- `status` → `MediaPlayerState` (PLAYING/PAUSED/IDLE)
- `playlist` → `media_playlist` attribute
- `step` → `media_title` attribute
- `positionms` → `media_position` (÷1000 for seconds)
- `lengthms` → `media_duration` (÷1000 for seconds)
- `leftms` → `time_remaining` attribute
- `volume` → `volume_level` (÷100 for 0-1 range)
- `outputtolights` → Used to detect truly stopped

**From GetPlayListSteps:**
- Exposed as `playlist_songs` in `extra_state_attributes`
- Each song: `{name, duration}` (duration in milliseconds)

**From GetQueuedSteps:**
- Exposed as `queue` in `extra_state_attributes`
- Each item: `{name, id, duration}` (duration in milliseconds)

#### websocket.py
Real-time updates:
- Receives same JSON as GetPlayingStatus
- Auto-reconnection with exponential backoff
- Heartbeat query every 5 minutes
- Callbacks to `_handle_websocket_update()`

### Frontend (JavaScript)

#### xschedule-card.js
Media player card display:

**Uses:**
- `entity.state` - Show PLAYING/PAUSED/IDLE
- `entity.attributes.media_title` - Current song name
- `entity.attributes.media_position` - Progress bar position
- `entity.attributes.media_duration` - Progress bar total
- `entity.attributes.playlist_songs` - Song list display
- `entity.attributes.queue` - Queue list display
- `entity.attributes.source_list` - Playlist selector
- `entity.attributes.playlist` - Current playlist name

**Features:**
- Progress bar updates every second
- Song list shows current playlist
- Queue list shows queued items
- Playlist selector for source selection

#### xschedule-playlist-browser.js
Schedule browser card:

**Uses:**
- `entity.attributes.source_list` - Available playlists
- Schedule data from GetPlayListSchedules API
- Song data from GetPlayListSteps API

**Features:**
- Shows playlists with next scheduled time
- Expands to show playlist songs
- Updates every 5 minutes for schedule times
- Displays schedule windows

---

## Field Reference (Alphabetical)

Complete cross-API field reference:

| Field | APIs | Type | Description | Used | Notes |
|-------|------|------|-------------|------|-------|
| active | GetPlayListSchedules | string | Is schedule running now | ✅ Likely | Shows active state |
| autooutputtolights | GetPlayingStatus | string | Auto output mode | ❌ No | Advanced feature |
| brightness | GetPlayingStatus | string | Current brightness (0-100) | ❌ No | Enhancement opportunity |
| controller | GetPlayingStatus.pingstatus | string | Controller name | ❌ No | Could monitor health |
| enabled | GetPlayListSchedules | string | Can schedule run | ✅ Likely | Filter schedules |
| endonly | GetPlayListSteps | string | Step type: end only | ❌ No | Step classification |
| everystep | GetPlayListSteps | string | Step type: every step | ❌ No | Step classification |
| failcount | GetPlayingStatus.pingstatus | string | Consecutive failures | ❌ No | Controller monitoring |
| id | All | string | Session-specific unique ID | Mixed | Don't persist |
| ip | GetPlayingStatus, pingstatus | string | IP address | ❌ No | Network info |
| left | GetPlayingStatus | string | Time remaining (formatted) | ❌ No | Use leftms instead |
| leftms | GetPlayingStatus | string | Time remaining (ms) | ✅ Yes | Used for time_remaining |
| length | All | string | Duration (formatted) | ❌ No | Use lengthms instead |
| lengthms | All | string | Duration (milliseconds) | ✅ Yes | Preferred time format |
| looping | GetPlaylists, GetPlayListSchedules | string | Loop enabled | ❌ No | Enhancement opportunity |
| loops | GetPlayListSchedules | string | Loop count limit | ❌ No | Enhancement opportunity |
| name | All | string | Item identifier | ✅ Yes | Primary identifier |
| nextactive | GetPlayListSchedules | string | Next activation time | ✅ Yes | Shown in UI |
| nextstep | GetPlayingStatus | string | Next step name | ❌ No | Preview feature |
| nextstepid | GetPlayingStatus | string | Next step session ID | ❌ No | Session-specific |
| nextscheduled | GetPlaylists | string | Next scheduled time | ❌ No | Enhancement opportunity |
| offset | GetPlayListSteps | string | Cumulative position | ❌ No | Timeline feature |
| outputtolights | GetPlayingStatus | string | Output active | ✅ Yes | Stop detection |
| passwordset | GetPlayingStatus | string | Password configured | ❌ No | Security info |
| pingstatus | GetPlayingStatus | array | Controller health | ❌ No | Monitoring feature |
| playlist | GetPlayingStatus | string | Current playlist name | ✅ Yes | Core field |
| playlistid | GetPlayingStatus | string | Playlist session ID | ❌ No | Session-specific |
| playlistleft | GetPlayingStatus | string | Playlist time left (fmt) | ❌ No | Use playlistleftms |
| playlistleftms | GetPlayingStatus | string | Playlist time left (ms) | ❌ No | Total progress |
| playlistlooping | GetPlayingStatus | string | Playlist loop state | ❌ No | Enhancement opportunity |
| playlistloopsleft | GetPlayingStatus | string | Remaining loops | ❌ No | Enhancement opportunity |
| playlistposition | GetPlayingStatus | string | Position in playlist (fmt) | ❌ No | Use playlistpositionms |
| playlistpositionms | GetPlayingStatus | string | Position in playlist (ms) | ❌ No | Total progress |
| position | GetPlayingStatus | string | Current position (fmt) | ❌ No | Use positionms |
| positionms | GetPlayingStatus | string | Current position (ms) | ✅ Yes | Core field |
| queuelength | GetPlayingStatus | string | Number queued | ❌ No | Redundant |
| random | GetPlayingStatus, GetPlayListSchedules | string | Random mode | ❌ No | Enhancement opportunity |
| reference | All | string | Reference field | ❌ No | Usually empty |
| result | GetPlayingStatus.pingstatus | string | Health: Ok/Failed | ❌ No | Controller monitoring |
| scheduleend | GetPlayingStatus, GetPlayListSchedules | string | Schedule stop time | ❌ No | Enhancement opportunity |
| scheduleid | GetPlayingStatus | string | Schedule session ID | ❌ No | Session-specific |
| schedulename | GetPlayingStatus | string | Active schedule name | ❌ No | Enhancement opportunity |
| startonly | GetPlayListSteps | string | Step type: start only | ❌ No | Step classification |
| status | GetPlayingStatus | string | State: idle/paused/playing | ✅ Yes | Core field |
| step | GetPlayingStatus | string | Current step name | ✅ Yes | Core field |
| stepid | GetPlayingStatus | string | Step session ID | ❌ No | Session-specific |
| steplooping | GetPlayingStatus | string | Step loop state | ❌ No | Enhancement opportunity |
| steploopsleft | GetPlayingStatus | string | Remaining step loops | ❌ No | Enhancement opportunity |
| time | GetPlayingStatus | string | Server time | ❌ No | Sync feature |
| trigger | GetPlayingStatus | string | Playback source | ❌ No | Enhancement opportunity |
| version | GetPlayingStatus | string | xSchedule version | ❌ No | Info display |
| volume | GetPlayingStatus | string | Current volume (0-100) | ✅ Yes | Core field |

---

## Important Patterns & Quirks

### 1. Session-Only IDs
**From Official Docs:**
> "Unique ID is valid for this session only"

**Implications:**
- Don't persist IDs across restarts
- Use names for long-term references
- IDs may change if xSchedule restarts

**Integration Approach:**
- Uses names as primary identifiers
- IDs only used transiently (queue display)

### 2. Time Format Conventions

**Two Formats Provided:**
- **Formatted String:** `"MM:SS.mmm"` (e.g., "2:00.000")
- **Milliseconds:** Integer as string (e.g., "120000")

**Integration Preference:**
- Always uses millisecond fields (`lengthms`, `positionms`, `leftms`)
- Converts to seconds (÷1000) for Home Assistant
- Ignores formatted strings (less precise, harder to parse)

### 3. Boolean String Values

**Pattern:**
All boolean-like values are **strings**, not native booleans:
- `"true"` not `true`
- `"false"` not `false`

**Critical Code:**
```python
# CORRECT:
if data.get("outputtolights") == "false":

# WRONG:
if not data.get("outputtolights"):  # This would fail!
```

**Always compare with string literals when checking boolean fields.**

### 4. Status Ambiguity

**Problem:**
The `status` field value `"idle"` is ambiguous:
- **Between songs:** `status: "idle"` + `playlist` field present
- **Truly stopped:** `status: "idle"` + no `playlist` field + `outputtolights: "false"`

**Integration Solution:**
```python
# Truly stopped detection:
if (status == "idle" and
    "playlist" not in data and
    data.get("outputtolights", "false") == "false"):
    # Clear playlist_steps and queued_steps
```

**Why This Matters:**
- Prevents clearing song list between songs (would cause flickering)
- Only clears when playback truly stops
- Critical for proper UI behavior

### 5. Field Presence vs Null

**Pattern:**
xSchedule **omits fields** rather than setting them to null/empty:
- Playing: All fields present
- Idle: Many fields absent (not present in JSON)

**Integration Approach:**
```python
# Check field presence:
if "playlist" in data:
    self._attr_media_playlist = data["playlist"]

# Not:
if data.get("playlist"):  # Would fail for empty string
```

### 6. Playlist Name Uniqueness

**From Official Docs (GetPlayListSteps):**
> "If playlist name isn't unique, returns first match only"

**Implication:**
- Playlist names should be unique
- API doesn't warn about duplicates
- First match wins (arbitrary)

**Integration Impact:**
- Low (users unlikely to have duplicate names)
- Could add validation/warning in future

### 7. Loop Count Semantics

**Pattern:**
Loop counts use `-1` for infinite:
- `playlistloopsleft: "-32"` (finite, 32 remaining)
- `playlistloopsleft: "-1"` (infinite looping)
- `steploopsleft: "-1"` (infinite looping)

**Not Currently Used:**
Integration doesn't expose loop information, but could show:
- "Looping" badge if `-1`
- "X loops left" if positive

### 8. Controller Health Monitoring

**pingstatus Array:**
- Always present in GetPlayingStatus
- Shows health of all configured controllers
- `result: "Ok"` or `result: "Failed"`
- `failcount` shows consecutive failures

**Not Currently Used:**
Could add controller health monitoring:
- Sensor for failed controllers
- Alert on failures
- Display in diagnostic panel

### 9. WebSocket vs Polling Behavior

**WebSocket (Primary):**
- Receives GetPlayingStatus updates automatically
- Same JSON structure as polling API
- Heartbeat query every 5 minutes
- Auto-reconnect with exponential backoff

**Polling (Fallback):**
- Used when WebSocket disconnected
- Less efficient than WebSocket push
- Same endpoints and response format

**Integration Approach:**
- Prefer WebSocket for real-time updates
- Fallback to polling if WebSocket fails
- Transparent to rest of integration

### 10. Schedule Time Display

**nextscheduled vs nextactive:**
- `nextscheduled` (GetPlaylists) - When playlist next scheduled
- `nextactive` (GetPlayListSchedules) - When schedule activates

**Integration Uses:**
- Playlist Browser shows schedule times every 5 minutes
- Times displayed relative to current time
- Updates automatically via timer

---

## Enhancement Opportunities

### High Value (User-Facing)

1. **Total Playlist Progress**
   - Fields: `playlistpositionms`, `playlistleftms`
   - Show: "Song 3/13, 12:15/33:24 total"
   - Benefit: Better context for long playlists

2. **Schedule Information Display**
   - Fields: `schedulename`, `scheduleend`, `trigger`
   - Show: "Playing from schedule: October sunset-30 -> 11pm (ends 23:00)"
   - Benefit: Know why/when playing

3. **Loop Status Display**
   - Fields: `playlistlooping`, `playlistloopsleft`, `steplooping`
   - Show: "Looping (32 left)" or "Looping ∞"
   - Benefit: Know if/when playlist repeats

4. **Next Song Preview**
   - Field: `nextstep`
   - Show: "Next: Pirates of the Caribbean"
   - Benefit: See what's coming

5. **Playlist Duration Display**
   - Fields from GetPlaylists: `length`, `lengthms`
   - Show: Total playlist length in source list
   - Benefit: Know playlist length before playing

### Medium Value (Monitoring)

6. **Controller Health Monitoring**
   - Field: `pingstatus` array
   - Create: Binary sensors for each controller
   - Benefit: Alert on controller failures

7. **Brightness Control**
   - Field: `brightness`
   - Expose: As additional control
   - Benefit: Match volume control capability

8. **Random Mode Indicator**
   - Field: `random`
   - Show: Shuffle icon when active
   - Benefit: Know playback mode

9. **Playlist Offset Timeline**
   - Field from GetPlayListSteps: `offset`
   - Show: Visual timeline of playlist
   - Benefit: See playlist structure

### Low Value (Informational)

10. **Server Information**
    - Fields: `version`, `ip`, `time`
    - Show: In integration info/diagnostics
    - Benefit: Troubleshooting

11. **Step Type Indicators**
    - Fields from GetPlayListSteps: `startonly`, `endonly`, `everystep`
    - Show: Icons for special steps
    - Benefit: Understand playlist structure

12. **Trigger Source Badge**
    - Field: `trigger` (Manual/Queued/Scheduled)
    - Show: How playback started
    - Benefit: Context for current playback

---

## Implementation Notes

### Cache Strategy

**Why Cache?**
- Reduce API load on xSchedule
- Improve response times
- Reduce network traffic

**Cache TTLs:**
- **5 minutes:** Playlists, Schedules (infrequent changes)
- **3 minutes:** Playlist steps/songs (moderate changes)
- **Real-time:** Status, queue (frequent changes)

**Invalidation:**
- State changes (idle → playing)
- Playlist changes
- Manual refresh via `force_refresh` parameter

### Data Type Conversions

**Time Conversions:**
```python
# Milliseconds to seconds (for HA):
seconds = int(data["lengthms"]) / 1000

# Volume 0-100 to 0-1 (for HA):
volume_level = int(data["volume"]) / 100
```

**String Booleans:**
```python
# Always compare with strings:
if data.get("outputtolights") == "false":
    # ...

# Not:
if not data.get("outputtolights"):  # WRONG!
```

### Error Handling

**Missing Fields:**
```python
# Check presence:
if "playlist" in data:
    value = data["playlist"]

# Or use .get() with default:
value = data.get("playlist", "")
```

**Invalid Values:**
```python
try:
    position = int(data["positionms"]) / 1000
except (ValueError, TypeError):
    position = 0  # Fallback
```

### Thread Safety

**Caching:**
- Dictionary-based cache (Python GIL protects)
- Time-based expiration
- No explicit locking needed

**WebSocket:**
- Single connection per instance
- Callbacks executed serially
- No race conditions

---

## References

### Official Documentation
- **xSchedule API Documentation:** [xLights GitHub](https://github.com/xLightsSequencer/xLights/blob/9e6beb37b3e8dd83b3836967758055f9c4ff2d17/documentation/xSchedule%20API%20Documentation.txt)
- **xSchedule Project:** Part of xLights sequencer software

### Integration Files
- `custom_components/xschedule/api_client.py` - API client with caching
- `custom_components/xschedule/media_player.py` - Media player entity
- `custom_components/xschedule/websocket.py` - WebSocket connection
- `src/xschedule-card.js` - Media player card
- `src/xschedule-playlist-browser.js` - Playlist browser card

### Version Information
- **Integration Version:** 1.1.1
- **xSchedule Version (tested):** 2025.10
- **Home Assistant:** 2024.1.0+
- **Document Date:** 2025-10-23

---

## Changelog

### 2025-10-23 - Initial Creation
- Compiled from actual API responses
- Combined with official xSchedule documentation
- Mapped all integration usage
- Identified enhancement opportunities
- Documented quirks and patterns

---

*This document will be updated as new API endpoints are discovered or integration usage changes.*