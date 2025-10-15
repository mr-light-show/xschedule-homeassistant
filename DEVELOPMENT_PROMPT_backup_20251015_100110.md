# xSchedule Home Assistant Integration & Dashboard Card

You are developing a Home Assistant integration and custom dashboard card for xSchedule, a lighting sequencer system.

## Integration Requirements

### API Interface
- Interface with xSchedule using the API documented at: https://github.com/xLightsSequencer/xLights/blob/master/documentation/xSchedule%20API%20Documentation.txt
- **Use WebSocket connection for real-time status updates** (preferred over polling)
- Use async/await patterns for all API calls
- Implement proper error handling and connection retry logic
- WebSocket endpoint: `ws://<host>:<port>/`
- HTTP endpoints (for initial queries or fallback):
  - Query: `http://<host>:<port>/xScheduleQuery?Query=<query_name>&Parameters=<params>`
  - Command: `http://<host>:<port>/xScheduleCommand?Command=<command_name>&Parameters=<params>`

### Installation
- Must be installable via HACS (Home Assistant Community Store)
- Follow HACS integration standards and directory structure

### Configuration
- Provide a config flow UI for setup (no YAML configuration required)
- Required configuration: xSchedule host/IP address and port
- Optional: Password (if xSchedule web interface is password protected)
- Validate connection during setup using `GetPlayingStatus` query

### Media Player Entity
Implement as a full-featured `media_player` entity with:

**Playlists:**
- Surface xSchedule playlists as media player sources (via `GetPlayLists` query)
- Map playlist "steps" (xSchedule's term for individual songs/sequences) to tracks (via `GetPlayListSteps` query)

**Playback Controls:**
- **Play**: `Play specified playlist <playlist name>`
- **Pause**: `Pause` command
- **Stop**: `Stop` command
- **Next**: `Next step in current playlist` command
- **Previous**: `Prior step in current playlist` command
- **Seek**: `Set step position ms <pos>` command for seeking within current step

**Position/Duration:**
- Receive real-time updates via WebSocket (status messages pushed automatically)
- Status messages include:
  - `position`: Current playback position in step
  - `length`: Total duration of current step
  - `left`: Time remaining in current step
  - `time`: Formatted time display
- Fallback: Poll `GetPlayingStatus` if WebSocket unavailable

**Volume Control:**
- Volume level: `Set volume to <0-100>` command
- Volume adjustment: `Adjust volume by <-100 to 100>` command
- Mute toggle: `Toggle mute` command

**State Attributes:**
- Current playlist name
- Current step/song name
- List of steps in active playlist (from `GetPlayListSteps`)
- Queue contents (from `GetQueuedSteps`)
- Playback position, duration, and time remaining
- Volume level and mute state

### Queue Management
- **Add to queue**: `Enqueue playlist step <playlist>,<step>` command
- **Clear queue**: `Clear playlist queue` command
- **Query queue**: `GetQueuedSteps` query returns step name, unique ID, and length
- **Duplicate prevention**: xSchedule API automatically prevents adding steps if they are already the last song in the queue (per API documentation)
- **Note**: API does not support removing individual queue items or reordering queue

### Events
Fire Home Assistant events for all actions:
- `xschedule_play`
- `xschedule_pause`
- `xschedule_stop`
- `xschedule_next`
- `xschedule_previous`
- `xschedule_seek`
- `xschedule_playlist_changed`
- `xschedule_volume_set`
- `xschedule_volume_adjust`
- `xschedule_mute_toggle`
- `xschedule_queue_add`
- `xschedule_queue_clear`

## Dashboard Card Requirements

### Card Configuration Options

The card must be highly configurable via the Home Assistant UI (card editor). Organize configuration options into logical groups:

#### **Display Options Group**

**Playlist Display Mode:**
- `expanded` (default): Show full list of all steps/songs in current playlist
- `collapsed`: Show as dropdown/expandable section
- `hidden`: Hide playlist view entirely

**Queue Display Mode:**
- `expanded` (default): Show full list of queued steps when queue is not empty
- `collapsed`: Show as dropdown/expandable section with count badge
- `hidden`: Hide queue view entirely

**Step/Song List Options:**
- Show/hide step duration
- Show/hide step actions (play icon, queue icon)
- Maximum number of visible items (before scrolling)

#### **Control Options Group**

**Playback Controls:**
- Show/hide play button
- Show/hide pause button
- Show/hide stop button
- Show/hide previous button
- Show/hide next button
- Show/hide seek/progress bar

**Volume Controls:**
- Show/hide volume slider
- Show/hide mute toggle
- Volume slider orientation (horizontal/vertical)

**Queue Controls:**
- Show/hide "Clear Queue" button
- Show/hide individual step queue actions

#### **Status Display Group**

**Now Playing Information:**
- Show/hide current playlist name
- Show/hide current step/song name
- Show/hide playback position/duration
- Show/hide time remaining
- Format for time display (e.g., "0:12 / 1:00" or "12s / 60s")

**Visual Options:**
- Show/hide album art placeholder
- Show/hide status icons (playing/paused indicators)
- Compact mode (reduced padding/spacing)

#### **Layout Options Group**

**Card Layout:**
- `default`: Controls → Now Playing → Queue → Playlist
- `compact`: Minimal controls with collapsible sections
- `minimal`: Only controls and now playing info

**Theme Options:**
- Use custom colors for progress bar
- Use custom icons for controls
- Card height (auto/fixed)

### Media Player Controls
Standard media player interface (configurable via options above):
- Play/pause/stop buttons
- **Previous/next step buttons** (both supported by API)
- Volume slider with mute toggle
- **Seekable progress bar** showing current position and total duration (using `Set step position ms` command)
- Currently playing step/song name

### Playlist View
Display all steps/songs in the current playlist (respects display mode configuration):
- Step name and duration (if enabled)
- Two actions per step (if enabled):
  - **Play icon**: Play this step immediately (`Play playlist step <playlist>,<step>`)
  - **Queue icon**: Add to queue (`Enqueue playlist step <playlist>,<step>`)
- Collapsed mode: Shows dropdown with current playlist name and step count
- Hidden mode: Does not display playlist view

### Queue Display
When steps are in the queue (respects display mode configuration):
- Show queue section **above** the playlist section
- Visual divider line between queue and playlist
- Display queued steps in order with their names and durations (if enabled)
- Show "Clear Queue" button (if enabled) - API only supports clearing entire queue, not individual removal
- Collapsed mode: Shows dropdown with "Queue (N)" badge
- Hidden mode: Does not display queue view

### Queue Logic
- When adding a step to the queue via the card, check if it's already in the queue
- If step already exists in queue, **do not add duplicate** and optionally show a notification
- **Note**: The xSchedule API itself prevents adding a step if it's already the last song in the queue

### Visual Design
- Clean, modern interface consistent with Home Assistant design language
- Clear visual hierarchy: controls → now playing → queue → playlist (when all visible)
- Responsive layout for different screen sizes
- Loading states and error messages
- Show playback position updating in real-time
- Respect user's configured display options for clean, customized appearance

### Card Editor UI
Provide a visual editor in Home Assistant with organized tabs/sections:
- **Display** tab: Playlist/Queue/Song display modes
- **Controls** tab: Show/hide individual control elements
- **Status** tab: Now playing information display options
- **Layout** tab: Overall card layout and theme options
- Preview of changes in real-time where possible

---

## API Capabilities Summary

✅ **Supported Features:**
- Previous track button - API has "Prior step in current playlist"
- Seek position - API has "Set step position ms" command
- Volume control - Full support
- Queue functionality - Basic add and clear operations
- Playlist and step management - Full support

⚠️ **Limitations:**
- Queue management is limited: Can only add items and clear entire queue (cannot remove individual items or reorder)
- xSchedule API itself prevents duplicate queue additions only if the step is already the **last** song in queue (not anywhere in queue), so card should implement full duplicate checking
- Authentication via password MD5 hash if web interface is password protected

## Technical Implementation Notes

### WebSocket Connection (Recommended)

**WebSocket Endpoint:**
```
ws://<host>:<port>/
```

**Message Format - Send Commands:**
```json
{
  "Type": "Command",
  "Command": "<command_name>",
  "Parameters": "<parameters>",
  "Reference": "<optional_callback_reference>",
  "Pass": "<auth_pass_if_needed>"
}
```

**Message Format - Send Queries:**
```json
{
  "Type": "Query",
  "Query": "<query_name>",
  "Parameters": "<parameters>",
  "Reference": "<optional_callback_reference>",
  "Pass": "<auth_pass_if_needed>"
}
```

**Received Status Updates:**
WebSocket automatically pushes status update messages containing a `status` property with the full playback state:
```json
{
  "status": "playing|paused|idle",
  "playlist": "Playlist Name",
  "step": "Step/Song Name",
  "position": 12345,
  "length": 60000,
  "left": 47655,
  "time": "0:12 / 1:00",
  "stepid": 123,
  "nextstepid": 124
}
```

**Implementation Tips:**
- Use a reconnecting WebSocket library for automatic reconnection
- Register callback functions to handle status updates
- Send commands/queries via WebSocket instead of HTTP when connected
- Implement fallback to HTTP if WebSocket connection fails

### HTTP API Endpoints (Fallback/Initial Setup)

**Query Endpoint:**
```
http://<host>:<port>/xScheduleQuery?Query=<query_name>&Parameters=<params>
```

**Command Endpoint:**
```
http://<host>:<port>/xScheduleCommand?Command=<command_name>&Parameters=<params>
```

### Common Commands Reference

**Playback Control:**
```
Play specified playlist <playlist_name>
Pause
Stop
Next step in current playlist
Prior step in current playlist
Restart step in current playlist
Play playlist step <playlist_name>,<step_name>
Set step position ms <milliseconds>
```

**Volume Control:**
```
Set volume to <0-100>
Adjust volume by <-100 to 100>
Toggle mute
```

**Queue Management:**
```
Enqueue playlist step <playlist_name>,<step_name>
Clear playlist queue
```

**Playlist Navigation:**
```
Jump to specified step in current playlist <step_name>
Play playlist starting at step <playlist_name>,<step_name>
```

### Common Queries Reference

**Status & Information:**
```
GetPlayingStatus
  Returns: status, playlist, step, position, length, left, time, stepid, nextstepid

GetPlayLists
  Returns: Array of available playlist names

GetPlayListSteps <playlist_name>
  Returns: Array of steps with name, duration, and metadata

GetQueuedSteps
  Returns: Array of queued steps with name, unique ID, and length
```

### Status Fields Explanation

**Playback State:**
- `status`: Current state - `"playing"`, `"paused"`, or `"idle"`
- `playlist`: Name of the currently active playlist
- `step`: Name of the current step/song
- `stepid`: Unique ID of current step
- `nextstepid`: Unique ID of next step

**Timing:**
- `position`: Current playback position in milliseconds
- `length`: Total duration of current step in milliseconds
- `left`: Time remaining in current step in milliseconds
- `time`: Human-readable time display (e.g., "0:12 / 1:00")
