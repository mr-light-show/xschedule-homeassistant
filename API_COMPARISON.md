# Media Player API Comparison

Comparison of xSchedule, FPP, and xLights Schedule APIs for media player integration in Home Assistant.

## API Comparison Table

| Function | xSchedule API (Current Repo) | FPP API | xLights Schedule API |
|----------|------------------------------|---------|---------------------|
| **Get Status** | Query: `GetPlayingStatus` | GET `/api/fppd/status` (returns JSON with status, playlist, sequence, times) | Query: `GetPlayingStatus` |
| **Get Playlists** | Query: `GetPlayLists` | GET `/api/playlists` (returns array of playlist objects) | Query: `GetPlayLists` |
| **Get Playlist Details** | Query: `GetPlaylists` (with metadata) | GET `/api/playlist/{name}` (returns playlist with sequences/items) | Query: `GetPlaylists` |
| **Get Playlist Steps/Songs** | Query: `GetPlayListSteps` + Parameters: `{playlist}` | GET `/api/playlist/{name}` (same as details, includes sequences) | Query: `GetPlayListSteps` + Parameters: `{playlist}` |
| **Get Queue** | Query: `GetQueuedSteps` | GET `/api/fppd/playlist` (returns current/queued playlists) | ❌ Not available |
| **Get Schedules** | Query: `GetPlayListSchedules` + Parameters: `{playlist}` | ❌ Not available (FPP handles schedules differently) | ❌ Not available |
| **Play Playlist** | Command: `Play specified playlist` + Parameters: `{playlist}` | POST `/api/command` + JSON: `{"command":"Start Playlist","args":["name"]}` | Command: `Play specified playlist` + Parameters: `{playlist}` |
| **Play Song/Step** | Command: `Play playlist step` + Parameters: `{playlist},{song}` | POST `/api/command` + JSON: `{"command":"Insert Playlist Immediate","args":["name","0","0","false"]}` | Command: `Play playlist step` + Parameters: `{playlist},{step}` |
| **Stop** | Command: `Stop` | POST `/api/playlists/stop` OR POST `/api/command` + JSON: `{"command":"Stop Gracefully"}` | Command: `Stop` |
| **Pause** | Command: `Pause` | POST `/api/command` + JSON: `{"command":"Pause"}` | Command: `Pause` |
| **Resume** | Command: `Pause` (toggles) | POST `/api/command` + JSON: `{"command":"Resume"}` | Command: `Pause` (toggles) |
| **Next** | Command: `Next step in current playlist` | POST `/api/command` + JSON: `{"command":"Next Playlist Item"}` | Command: `Next step in current playlist` |
| **Previous** | Command: `Prior step in current playlist` | POST `/api/command` + JSON: `{"command":"Prev Playlist Item"}` | Command: `Prior step in current playlist` |
| **Restart** | Command: `Restart step in current playlist` | ❌ Not available (no restart command in FPP) | Command: `Restart step in current playlist` |
| **Seek** | Command: `Set step position ms` + Parameters: `{position_ms}` | ❌ Not available (FPP sequences cannot be seeked) | Command: `Set step position ms` + Parameters: `{position_ms}` |
| **Set Volume** | Command: `Set volume to` + Parameters: `{0-100}` | POST `/api/system/volume` + JSON: `{"volume": 0-100}` | Command: `Set volume to` + Parameters: `{0-100}` |
| **Adjust Volume** | Command: `Adjust volume by` + Parameters: `{-100 to +100}` | ❌ Not available (must calculate and use absolute volume) | Command: `Adjust volume by` + Parameters: `{-100 to +100}` |
| **Mute** | Command: `Toggle mute` | ❌ Not available (can set volume to 0, but no mute state) | Command: `Toggle mute` |
| **Enqueue Step** | Command: `Enqueue playlist step` + Parameters: `{playlist},{song}` | POST `/api/command` + JSON: `{"command":"Insert Playlist After Current","args":["name","-1","-1","false"]}` | ❌ Not available |
| **Clear Queue** | Command: `Clear playlist queue` | POST `/api/playlists/stop` (stops current, effectively clears queue) | ❌ Not available |
| **Real-time Updates** | ✅ WebSocket `/xScheduleQuery` | ❌ Polling only | ❌ Polling only |
| **Media Browser** | ✅ Hierarchical (Playlists → Songs) | ❌ Not implemented | ❌ Not implemented |

## Key Differences

### xSchedule (Current Repository)
- ✅ Most feature-complete implementation
- ✅ WebSocket for real-time updates (no polling)
- ✅ Queue management (enqueue, clear)
- ✅ Schedule information per playlist
- ✅ Media browser support (hierarchical browsing)
- ✅ Precise seeking within steps
- ✅ Relative volume adjustment
- ✅ Restart current step
- ✅ Mute/unmute support

### FPP (Falcon Pi Player)
- ✅ Modern RESTful JSON API design
- ✅ Cover art support
- ✅ Basic queue management (Insert After Current)
- ✅ Playlist/sequence management
- ✅ Stop, pause, resume, next, previous controls
- ❌ No WebSocket (polling-based updates via `/api/fppd/status`)
- ❌ No seeking capability (sequences play through)
- ❌ No schedule information via API (handled in FPP UI)
- ❌ No media browser implementation
- ❌ No restart current sequence command
- ❌ Absolute volume only (no relative adjustment)
- ❌ No mute command (workaround: set volume to 0)

### xLights Schedule
- ✅ Similar command set to xSchedule
- ✅ Basic playback controls
- ❌ No WebSocket (polling-based updates)
- ❌ No queue management
- ❌ No schedule information
- ❌ No media browser
- ❌ Less metadata available

## API Format Comparison

### xSchedule/xLights
- **Base URL**: `http://{host}:{port}/`
- **Query Endpoint**: `/xScheduleQuery?Query={name}&Parameters={params}&Pass={md5_hash}`
- **Command Endpoint**: `/xScheduleCommand?Command={name}&Parameters={params}&Pass={md5_hash}`
- **WebSocket**: `ws://{host}:{port}/xScheduleQuery` (xSchedule only)
- **Authentication**: MD5 hash of password
- **Parameter Encoding**: URL-encoded with `%20` for spaces (not `+`)

### FPP
- **Base URL**: `http://{host}/`
- **Command Endpoint**: `/api/command` (POST with JSON payload)
- **Status Endpoint**: `/api/fppd/status` (GET for current state)
- **Playlist Endpoints**: `/api/playlists` (GET), `/api/playlist/{name}` (GET)
- **Volume Endpoint**: `/api/system/volume` (POST with JSON)
- **Methods**: Standard HTTP (GET, POST, PUT, DELETE)
- **Data Format**: JSON request/response bodies
- **Command Structure**: `{"command":"Command Name","args":["param1","param2"]}`
- **No WebSocket**: Uses polling for status updates
- **No Authentication**: Open API (can be secured at network level)

## References

- [xSchedule Integration (This Repository)](https://github.com/mr-light-show/xschedule-homeassistant)
- [ha-xlights GitHub Repository](https://github.com/Aleks130699/ha-xlights)
- [ha-fpp GitHub Repository](https://github.com/Aleks130699/ha-fpp)
- [FPP Official Repository](https://github.com/FalconChristmas/fpp)
- [FPP REST Commands Examples (Community Gist)](https://gist.github.com/jazakrzewski/d35b61f48246c6b4f9fc63ebd5089548)

## Implementation Notes

The current xSchedule integration provides the most comprehensive feature set due to:
1. xSchedule's rich API with extensive query/command options
2. WebSocket support for real-time updates without polling
3. Advanced features like queue management and schedule tracking
4. Full Home Assistant media browser integration
5. Support for both absolute and relative volume control

