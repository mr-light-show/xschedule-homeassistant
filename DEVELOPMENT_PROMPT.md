# xSchedule Home Assistant Integration & Dashboard Card

You are developing a Home Assistant integration and custom dashboard card for xSchedule, a lighting sequencer playback system.

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
- Map playlist "steps" (xSchedule's internal API term) to songs/tracks for user display (via `GetPlayListSteps` query)
- **Note**: While the API uses "step" terminology, the UI should use "song" for better user experience

**Playback Controls:**
- **Play**: `Play the selected playlist <playlist name>`
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
- Current song name (API: step name)
- List of songs in active playlist (API: steps from `GetPlayListSteps`)
- Queue contents (API: from `GetQueuedSteps`)
- Playback position, duration, and time remaining
- Volume level and mute state

### Queue Management
- **Add to queue**: `Enqueue playlist step <playlist>,<step>` command (display as "Add to Queue" in UI)
- **Clear queue**: `Clear playlist queue` command
- **Query queue**: `GetQueuedSteps` query returns song info (API: step name, unique ID, and length)
- **Duplicate prevention**: xSchedule API automatically prevents adding songs if they are already the last song in the queue (per API documentation)
- **Card-level duplicate checking**: The card should implement full queue duplicate checking (not just last song)
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

### User Experience Principles

The card should follow these UX principles:
1. **Simple by default**: Most users should never need to configure anything
2. **Progressive disclosure**: Advanced features available but not overwhelming
3. **Clear feedback**: Always show what's happening (loading, success, errors)
4. **Mobile-first**: Touch-friendly with appropriate spacing and gestures
5. **Contextual UI**: Adapt display based on state (empty, playing, error)

### Default Card Layout

By default, the card should show a clean, collapsed view:

```
┌─────────────────────────────────┐
│ [Playlist Name]                 │
│ [Step/Song Name]                │
│ ━━━━━━━━━━━━━━━━━━━━━━ 0:45/2:30│
│                                 │
│       ⏮  ⏯  ⏹  ⏭              │
│                                 │
│ Playlist: [Christmas ▼]         │
│ Queue: [3 items ▼]              │
│ Songs: [12 items ▼]             │
└─────────────────────────────────┘
```

**Key Features:**
- Current playlist and song names prominently displayed (separate lines)
- Progress bar with time display
- Primary controls (prev/play/stop/next) centered
- Volume control hidden by default (accessible in settings/custom mode)
- Everything else collapsed but accessible with one tap
- Queue positioned above Songs (queue is "what's next", songs are "browse")

### Card Modes (Presets)

To simplify configuration, provide preset modes that configure multiple options at once:

#### **Simple Mode (Default)**
Best for: "Just play my playlist" users
- Shows: Playlist selector (collapsed), basic playback controls, now playing, progress bar
- Hides: Song list browser, queue, volume controls, advanced controls
- Configuration:
  ```yaml
  type: custom:xschedule-card
  entity: media_player.xschedule
  mode: simple
  ```

#### **DJ Mode**
Best for: Live performance, manual control
- Shows: All playlists expanded, queue prominent, song actions visible
- Auto-opens: Next 5 songs in playlist
- Quick actions: Play Now, Add to Queue buttons are larger
- Configuration:
  ```yaml
  type: custom:xschedule-card
  entity: media_player.xschedule
  mode: dj
  ```

#### **Jukebox Mode**
Best for: Party mode, collaborative queuing
- Shows: All songs expanded, prominent queue section
- Emphasizes: "Add to Queue" actions (larger, more visible)
- Shows: Queue count badge prominently
- Configuration:
  ```yaml
  type: custom:xschedule-card
  entity: media_player.xschedule
  mode: jukebox
  ```

#### **Minimal Mode**
Best for: Dashboard widgets, small spaces
- Shows: Only playback controls and now playing info
- Hides: Everything else
- Configuration:
  ```yaml
  type: custom:xschedule-card
  entity: media_player.xschedule
  mode: minimal
  ```

#### **Custom Mode**
Unlocks all configuration options for power users
- Configuration:
  ```yaml
  type: custom:xschedule-card
  entity: media_player.xschedule
  mode: custom
  # ... full configuration options below
  ```

### Card Configuration Options

When in **Custom Mode**, the card is highly configurable via the Home Assistant UI (card editor). Organize configuration options into logical groups:

#### **Display Options Group**

**Playlist Selection Mode:**
- `collapsed` (default): Show as dropdown selector
- `expanded`: Show full list of all playlists
- `hidden`: Hide playlist selector entirely

**Songs Display Mode:**
- `collapsed` (default): Show as expandable section with count (e.g., "Songs: [12 items ▼]")
- `expanded`: Show full list of all songs in current playlist
- `hidden`: Hide songs list entirely

**Queue Display Mode:**
- `auto` (default): Show expanded when queue has items, collapsed when empty, hidden when unused
- `expanded`: Always show full list of queued songs
- `collapsed`: Show as expandable section with count badge (e.g., "Queue: [3 items ▼]")
- `hidden`: Hide queue view entirely

**Song List Options:**
- Show/hide song duration
- Show/hide song actions (Play Now button, Add to Queue button)
- Maximum number of visible items before scrolling (default: 10)

#### **Control Options Group**

**Playback Controls:**
- Show/hide play button
- Show/hide pause button
- Show/hide stop button
- Show/hide previous button
- Show/hide next button
- Show/hide seek/progress bar

**Volume Controls:**
- Show/hide volume slider (hidden by default)
- Show/hide mute toggle (hidden by default)
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
- **Previous/next song buttons** (both supported by API)
- **Seekable progress bar** showing current position and total duration (using `Set step position ms` command)
- Currently playing song name
- Volume slider with mute toggle (hidden by default, can be enabled in custom mode)

### Songs List (Current Playlist)
Display all songs in the current playlist (respects display mode configuration):
- Song name and duration (if enabled)
- Two labeled actions per song (if enabled):
  - **Play Now**: Use `mdi:play` icon with text label - Play this song immediately (`Play playlist step <playlist>,<step>`)
  - **Add to Queue**: Use `mdi:playlist-plus` icon with text label - Add to queue (`Enqueue playlist step <playlist>,<step>`)
- Collapsed mode: Shows "Songs: [12 items]" with `mdi:chevron-down` expand arrow
- Hidden mode: Does not display songs list
- Current song is highlighted with subtle background color and `mdi:music` or `mdi:music-note` icon
- Completed songs are dimmed, upcoming songs normal weight

### Queue Display
Queue is displayed **above** the songs list (respects display mode configuration):
- Visual divider line between queue and songs list
- Display queued songs in order with their names and durations (if enabled)
- Show "Clear Queue" button with `mdi:playlist-remove` icon (if enabled) - API only supports clearing entire queue, not individual removal
- Auto mode: Expanded when has items, collapsed when empty, hidden when feature unused
- Collapsed mode: Shows "Queue: [3 items]" with count badge and `mdi:chevron-down` arrow
- Hidden mode: Does not display queue view
- Queue items use `mdi:format-list-numbered` or similar icon to indicate order

### Action Clarity & Feedback

**Button Labels:**
- Always use text labels with MDI icons (not icons alone)
- Use Material Design Icons from Home Assistant's icon set
- Examples:
  - "Play Now" with `mdi:play` icon
  - "Add to Queue" with `mdi:playlist-plus` icon
  - "Pause" with `mdi:pause` icon
  - "Stop" with `mdi:stop` icon
  - "Next" with `mdi:skip-next` icon
  - "Previous" with `mdi:skip-previous` icon
- On hover/long-press: Show tooltip with additional context

**User Feedback:**
- **Success**: Show brief toast notification (2 seconds) with `mdi:check-circle` icon
  - "Added to queue" with checkmark
  - "Now playing: [Song Name]" with `mdi:play-circle` icon
- **Duplicate Prevention**: Show toast when song already in queue with `mdi:information` icon
  - "Already in queue"
- **Errors**: Show clear error message with `mdi:alert-circle` icon
  - "Failed to connect to xSchedule"
  - "Playlist not found"
- **Confirmation**: For disruptive actions (replacing current song):
  - Quick toast: "Replace current song?" with action buttons
  - Use `mdi:alert` icon for confirmation dialogs

**Visual Feedback:**
- Song clicked: Briefly highlight with animation (200ms)
- Adding to queue: Show loading spinner (`mdi:loading` or Home Assistant's standard spinner) on button briefly
- Current song: Highlight with accent color background and `mdi:play-circle` or `mdi:music` icon
- Queue items: Show `mdi:drag` or `mdi:drag-horizontal` handle icon (even if dragging not supported)

### Contextual UI & Empty States

**No Playlist Selected:**
```
┌─────────────────────────────────┐
│  mdi:playlist-music             │
│  Select a playlist to begin     │
│                                 │
│  Playlist: [Select... ▼]       │
└─────────────────────────────────┘
```

**Queue Empty (Auto Mode):**
```
┌─────────────────────────────────┐
│  mdi:playlist-plus              │
│  Queue (0)                      │
│  Tap "Add to Queue" on any      │
│  song to play it next           │
└─────────────────────────────────┘
```

**Connection Lost:**
```
┌─────────────────────────────────┐
│  mdi:lan-disconnect             │
│  Lost connection to xSchedule   │
│  [mdi:refresh Retry] [Settings] │
└─────────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────────┐
│  mdi:loading (spinning)         │
│  Loading...                     │
│  Connecting to xSchedule        │
└─────────────────────────────────┘
```

### Mobile-First Interactions

**Touch Targets:**
- Minimum 44px height for all interactive elements
- Adequate spacing between buttons (8px minimum)
- Larger tap areas for primary controls

**Responsive Behavior:**
- **Desktop (>1024px)**: Can show more expanded by default, 3-column layout if needed
- **Tablet (768px-1024px)**: 2-column layout, moderate defaults
- **Mobile (<768px)**: Single column, everything collapsed by default, stack vertically

**Optional Gestures** (if feasible):
- Swipe song right: Add to queue
- Swipe song left: Play now
- Long press song: Show context menu with all actions
- Pull down queue section: Refresh

### Visual Design
- Clean, modern interface consistent with Home Assistant design language
- Clear visual hierarchy:
  1. **Primary**: Now playing info + playback controls
  2. **Secondary**: Queue (what's next)
  3. **Tertiary**: Songs list (browsing)
  4. **Utility**: Playlist selector, volume, settings
- Responsive layout for different screen sizes
- Loading states and error messages with clear icons
- Show playback position updating in real-time
- Respect user's configured display options for clean, customized appearance
- Use Home Assistant's standard color scheme and spacing tokens

### Material Design Icons (MDI) Reference

All icons must use Home Assistant's built-in Material Design Icons. Key icons for this integration:

**Playback Controls:**
- `mdi:play` - Play button
- `mdi:play-circle` - Play with emphasis
- `mdi:pause` - Pause button
- `mdi:stop` - Stop button
- `mdi:skip-next` - Next song
- `mdi:skip-previous` - Previous song
- `mdi:replay` - Restart/replay

**Playlist & Queue:**
- `mdi:playlist-music` - Playlist/songs list
- `mdi:playlist-play` - Active playlist
- `mdi:playlist-plus` - Add to queue
- `mdi:playlist-remove` - Clear queue/remove
- `mdi:format-list-numbered` - Numbered list (queue order)
- `mdi:music` - Music note (current song)
- `mdi:music-note` - Alternative music icon

**Schedule & Time:**
- `mdi:clock` - Scheduled time
- `mdi:clock-outline` - Scheduled (outline version)
- `mdi:clock-alert` - Past schedule/alert
- `mdi:calendar` - Date-related
- `mdi:calendar-clock` - Scheduled event

**Volume:**
- `mdi:volume-high` - Volume icon
- `mdi:volume-medium` - Mid volume
- `mdi:volume-low` - Low volume
- `mdi:volume-mute` - Muted
- `mdi:volume-off` - Volume off

**UI Elements:**
- `mdi:chevron-down` - Expand/collapse arrow
- `mdi:chevron-up` - Collapse arrow
- `mdi:chevron-right` - Next/forward
- `mdi:drag` - Drag handle (vertical)
- `mdi:drag-horizontal` - Drag handle (horizontal)
- `mdi:dots-vertical` - More options menu

**Status & Feedback:**
- `mdi:check-circle` - Success
- `mdi:information` - Info message
- `mdi:alert-circle` - Error
- `mdi:alert` - Warning/confirmation
- `mdi:loading` - Loading spinner
- `mdi:refresh` - Retry/refresh

**Connection:**
- `mdi:lan-connect` - Connected
- `mdi:lan-disconnect` - Disconnected
- `mdi:wifi` - Wireless connection
- `mdi:access-point` - Network access point

**Settings:**
- `mdi:cog` - Settings gear
- `mdi:tune` - Adjust/configure
- `mdi:wrench` - Tools/configuration

### Card Editor UI

The card editor should be simple and approachable:

**For Simple/DJ/Jukebox/Minimal Modes:**
Show only mode selector:
```
Card Mode: [Simple ▼]
  • Simple (default)
  • DJ Mode
  • Jukebox Mode
  • Minimal
  • Custom

[Save]
```

**For Custom Mode:**
Provide organized tabs with advanced options:

**Tab 1: Appearance**
```
Display Options:
  Playlist Selector: [Collapsed ▼]
  Songs List: [Collapsed ▼]
  Queue: [Auto ▼]

Visual Options:
  [✓] Show song duration
  [✓] Show progress bar
  [✓] Show time remaining
  [ ] Compact mode
```

**Tab 2: Controls**
```
Playback Controls:
  [✓] Show previous/next buttons
  [✓] Show stop button
  [✓] Show seek bar

Volume:
  [ ] Show volume slider
  [ ] Show mute button
  Orientation: [Horizontal ▼]

Song Actions:
  [✓] Show "Play Now" buttons
  [✓] Show "Add to Queue" buttons
```

**Tab 3: Advanced**
```
Behavior:
  Max visible songs: [10]
  Confirm disruptive actions: [✓]
  Show tooltips: [✓]

[Save] [Reset to Defaults]
```

- Preview of changes in real-time where possible
- "Reset to Defaults" button to revert to Simple mode
- Help text for each option explaining what it does

---

## Playlist Browser Card (Companion Card)

In addition to the main media player card, provide a companion **Playlist Browser Card** for users who want a dedicated view of all available playlists.

### Playlist Browser Card Layout

```
┌─────────────────────────────────┐
│ xSchedule Playlists             │
│                                 │
│ Sort: [By Schedule ▼]           │
│                                 │
│ mdi:play Christmas Lights       │
│                        [Playing] │
│ Duration: 45:30                 │
│                                 │
│ mdi:clock New Year Show         │
│                 [Today 11:30PM] │
│ Duration: 1:15:00               │
│                                 │
│ mdi:clock Holiday Party         │
│              [Tomorrow 6:00PM]  │
│ Duration: 52:45                 │
│                                 │
│ mdi:clock Halloween             │
│                [Friday 8:00PM]  │
│ Duration: 38:20                 │
│                                 │
│ mdi:clock Thanksgiving          │
│               [Nov 28 7:00PM]   │
│ Duration: 1:05:15               │
│                                 │
│ mdi:playlist-music Birthday     │
│ Duration: 22:15                 │
└─────────────────────────────────┘
```

### Features

**Sorting Options:**
- **By Schedule** (default): Shows playlists ordered by next scheduled time
  - Currently playing playlist shown at top with "Playing" badge
  - Scheduled playlists show time/date of next run
  - Unscheduled playlists at bottom (no time shown)
- **Alphabetical**: Shows all playlists in A-Z order
  - Currently playing playlist still has visual indicator
  - Simple, predictable ordering

**Playlist Display:**
- Playlist name (prominent)
- Duration (total length of all songs in playlist)
- Status indicators with MDI icons:
  - **[Playing]** badge for active playlist with `mdi:play` or `mdi:play-circle` icon
  - **[Scheduled Time]** for scheduled playlists with `mdi:clock` or `mdi:clock-outline` icon and smart date formatting:
    - Same day: "Today 11:30 PM"
    - Next day: "Tomorrow 8:00 AM"
    - Within 7 days: "[Day of week] 9:00 PM" (e.g., "Friday 9:00 PM")
    - Beyond 7 days: "[Month Day] [Time]" (e.g., "Oct 31 8:00 PM")
  - No icon/indicator for unscheduled playlists (use `mdi:playlist-music` as default)

**Interactions:**
- Tap playlist: Play immediately (shows confirmation if something is playing)
- Long press: Show context menu:
  - Play Now
  - View Songs
  - View Schedule Info (if scheduled)

**Visual Design:**
- Currently playing playlist: Highlighted with accent color, `mdi:play` or `mdi:play-circle` icon
- Scheduled playlists: `mdi:clock` or `mdi:clock-outline` icon with time
- Past-schedule/inactive: Dimmed appearance with `mdi:clock-alert` icon
- Unscheduled: Normal appearance with `mdi:playlist-music` icon

### Configuration Options

```yaml
type: custom:xschedule-playlist-browser
entity: media_player.xschedule
sort_by: schedule  # schedule | alphabetical
show_duration: true
show_status: true
compact_mode: false
confirm_play: true  # Show confirmation when switching playlists
```

**Configuration UI:**
```
┌─────────────────────────────────┐
│ Playlist Browser Card Settings  │
│                                 │
│ Sort by: [Schedule ▼]           │
│   • By Schedule (next playing)  │
│   • Alphabetical                │
│                                 │
│ Display:                        │
│   [✓] Show playlist duration    │
│   [✓] Show schedule times       │
│   [✓] Show status badges        │
│   [ ] Compact mode              │
│                                 │
│ Behavior:                       │
│   [✓] Confirm before playing    │
│   [✓] Show context menu         │
│                                 │
│ [Save]                          │
└─────────────────────────────────┘
```

### API Requirements

To implement this card, need to query:
- **GetPlayLists**: List of all available playlists
- **GetPlayListSchedules <playlist_name>**: Schedule information for each playlist
  - Returns: name, unique ID, enabled flag, active flag, looping, randomization, **next active time**, end time
- **GetPlayingStatus**: Currently playing playlist
- **GetPlayListSteps <playlist_name>**: To calculate total duration for each playlist

**Schedule Sorting Logic:**
1. Query `GetPlayListSchedules` for each playlist
2. Extract "next active time" field
3. Sort by:
   - Currently playing: Always at top
   - Scheduled playlists: By next active time (soonest first)
   - Unscheduled playlists: Alphabetically at bottom
4. Format time display (smart relative formatting):
   - Same day: "Today [time]" (e.g., "Today 11:30 PM")
   - Next day: "Tomorrow [time]" (e.g., "Tomorrow 8:00 AM")
   - 2-7 days away: "[Day of week] [time]" (e.g., "Friday 9:00 PM", "Wednesday 6:30 PM")
   - 8+ days away: "[Month Day] [time]" (e.g., "Oct 31 8:00 PM", "Dec 25 12:00 AM")
5. Time format: Use 12-hour format with AM/PM

### Use Cases

**When to use this card:**
- Dashboard overview: See all playlists at a glance
- Planning view: See what's scheduled to play when
- Quick playlist switching: Fast access to any playlist
- Seasonal content: Easily see holiday playlists and when they're scheduled

**Layout suggestions:**
- **Desktop**: Place alongside main media player card in 2-column layout
- **Mobile**: Separate tab or view from main player
- **Dashboard**: Use as a standalone widget for playlist management

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

GetPlayListSchedules <playlist_name>
  Returns: Schedule details including:
    - name: Schedule name
    - id: Unique schedule ID
    - enabled: Whether schedule is enabled
    - active: Whether schedule is currently active
    - loop: Looping enabled
    - random: Randomization enabled
    - nextactivetime: Next time this schedule will activate
    - endtime: Schedule end time
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
