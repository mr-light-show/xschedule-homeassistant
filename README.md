# xSchedule Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/mr-light-show/xschedule-homeassistant.svg)](https://github.com/mr-light-show/xschedule-homeassistant/releases)
[![License](https://img.shields.io/github/license/mr-light-show/xschedule-homeassistant.svg)](LICENSE)

Home Assistant integration and custom dashboard card for [xSchedule](https://github.com/xLightsSequencer/xLights), a lighting sequencer system from the xLights project.

## Features

### Integration
- **Full Media Player Support**: Control xSchedule as a native Home Assistant media player
- **Real-time Updates**: WebSocket connection for live status updates (no polling!)
- **Media Browser Support**: Navigate playlists and songs using HA's built-in media browser
- **Playlist Management**: Browse and play playlists and individual steps/songs
- **Queue Support**: Add songs to play queue with duplicate prevention
- **Volume Control**: Adjust volume and mute/unmute
- **Playback Controls**: Play, pause, stop, next, previous, and seek
- **Event System**: Fire Home Assistant events for all actions

### Dashboard Card
- **5 Preset Modes**: Simple, DJ, Jukebox, Minimal, and Custom modes for different use cases
- **Visual Configuration**: Configure cards with a built-in visual editor (no YAML editing needed!)
- **Long-Press Context Menu**: Long-press any song for quick actions (mobile & desktop)
- **Highly Configurable**: Show/hide any control or display element
- **Multiple Display Modes**: Expanded, collapsed, or hidden views for playlists and queue
- **Modern UI**: Clean, responsive interface consistent with Home Assistant design
- **Real-time Position**: Live playback position updates via WebSocket
- **Quick Actions**: Play songs immediately or add to queue with one tap

### Playlist Browser Card
- **Smart Scheduling**: See when playlists are scheduled to run (Today 8PM, Tomorrow 9AM, etc.)
- **Duration Display**: Shows total playlist duration calculated from all songs
- **Two Sort Modes**: By schedule (next to play) or alphabetical
- **Status Badges**: Visual indicators for playing and scheduled playlists

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add `https://github.com/mr-light-show/xschedule-homeassistant` as an integration
6. Click "Install"
7. Restart Home Assistant
8. Add the integration: Settings → Devices & Services → Add Integration → "xSchedule"
   - The custom cards will be automatically registered via the integration
9. Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
10. The cards should now be available in the card picker!

### Manual Installation

1. Download the latest release
2. Copy the `custom_components/xschedule` folder (including the `www/` subdirectory) to your Home Assistant `config/custom_components/` directory
3. Restart Home Assistant
4. Add the integration: Settings → Devices & Services → Add Integration → Search for "xSchedule"
   - The custom cards will be automatically registered via the integration
5. Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
6. The cards should now be available in the card picker!

## Configuration

### Integration Setup

1. Go to **Settings** → **Devices & Services**
2. Click **Add Integration**
3. Search for "xSchedule"
4. Enter your xSchedule host/IP address and port
5. (Optional) Enter password if your xSchedule web interface is password protected

### Dashboard Card Setup

This integration includes **two custom Lovelace cards**:

#### xSchedule Media Player Card

The main playback control card with 5 preset modes.

**Add via UI (Recommended):**
1. Edit your dashboard
2. Click **Add Card**
3. Search for "xSchedule Media Player"
4. Select your xSchedule entity
5. Choose a mode or configure with visual editor

**Or add manually to your dashboard YAML:**

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: simple  # simple (default), dj, jukebox, minimal, or custom
```

### Card Modes

Choose the mode that best fits your use case:

#### Simple Mode (Default)
**Best for:** Basic playback control

Perfect for users who just want to select a playlist and control playback. Clean and uncluttered.

**What you see:**
- Now playing info (playlist + song)
- Progress bar with time
- Playback controls (prev, play/pause, stop, next)
- Playlist selector (dropdown)

**What's hidden:**
- Songs list
- Queue
- Volume controls

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: simple
```

#### DJ Mode
**Best for:** Live performance and manual control

Ideal for DJs and live operators who need quick access to playlists, songs, and queue management.

**What you see:**
- All playlists in an expanded list
- All songs in current playlist with action buttons
- Queue section (prominent)
- Playback controls

**Perfect for:**
- Live shows
- Real-time playlist switching
- Quick song selection
- Managing what plays next

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: dj
```

#### Jukebox Mode
**Best for:** Party mode and collaborative queuing

Great for parties where guests can browse songs and add them to the queue.

**What you see:**
- Songs list (expanded with all songs visible)
- Queue section (prominent with count badge)
- "Add to Queue" buttons highlighted
- Playlist selector (dropdown)

**Perfect for:**
- Parties and gatherings
- Let guests pick songs
- Building a playlist on the fly
- Seeing what's coming up next

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: jukebox
```

#### Minimal Mode
**Best for:** Small spaces and dashboard widgets

Stripped-down interface showing only essential controls. Perfect for compact dashboard layouts.

**What you see:**
- Now playing info
- Playback controls
- Progress bar

**What's hidden:**
- Playlist selector
- Songs list
- Queue
- Volume controls

**Perfect for:**
- Dashboard widgets
- Mobile dashboards
- Picture frames
- Small screens

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: minimal
```

### Media Browser Support

xSchedule now supports Home Assistant's native media browser, allowing you to browse and play playlists and songs through the standard HA interface.

**To use the media browser:**

1. Open any media player card (standard HA media card works!)
2. Click the **"Browse Media"** button
3. Navigate through your playlists
4. Click a playlist to see all songs
5. Click a song to play it, or click the playlist name to play the whole playlist

**Benefits:**
- Works with **any** Home Assistant media player card
- No need for custom cards if you prefer the native experience
- Hierarchical browsing: Playlists → Songs
- Potential for voice assistant integration

**Note:** The media browser works **alongside** the custom xSchedule cards. Use whichever interface you prefer - they complement each other!

#### Custom Mode
**Best for:** Power users who want complete control

Unlocks all configuration options. Use the visual editor or configure via YAML.

**What you can customize:**
- Which sections to show/hide
- Expanded, collapsed, or hidden for each section
- Volume controls visibility
- Song action buttons
- Maximum visible items
- Confirmation dialogs
- And much more!

**Configure with visual editor:**
1. Add card with Custom mode
2. Click Configure
3. Use the 4-tab editor (General, Appearance, Controls, Advanced)

**Or configure via YAML:**

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
mode: custom
playlistDisplay: expanded    # expanded, collapsed, or hidden
songsDisplay: collapsed       # expanded, collapsed, or hidden
queueDisplay: auto            # auto, expanded, collapsed, or hidden
showVolumeControl: true       # true or false
showSongActions: true         # true or false
showProgressBar: true         # true or false
maxVisibleSongs: 10           # number of songs before scrolling
confirmDisruptive: true       # confirm before replacing current song
```

### Quick Comparison

| Feature | Simple | DJ | Jukebox | Minimal | Custom |
|---------|--------|----|---------|---------| -------|
| Playlist Selector | Dropdown | Expanded | Dropdown | Hidden | Your choice |
| Songs List | Hidden | Expanded | Expanded | Hidden | Your choice |
| Queue | Hidden | Expanded | Expanded | Hidden | Your choice |
| Volume Controls | Hidden | Hidden | Hidden | Hidden | Your choice |
| Song Actions | N/A | Visible | Visible | N/A | Your choice |
| Best For | Simple playback | Live shows | Parties | Widgets | Power users |

#### xSchedule Playlist Browser Card

A companion card for browsing all playlists with schedule information.

Add via UI:
1. Edit your dashboard
2. Click **Add Card**
3. Search for "xSchedule Playlist Browser"
4. Select your xSchedule entity

Or add manually to your dashboard YAML:

```yaml
type: custom:xschedule-playlist-browser
entity: media_player.xschedule
sort_by: schedule  # schedule (default) or alphabetical
show_duration: true
show_status: true
```

## Advanced Features

### Long-Press Context Menu

Long-press (500ms) any song to bring up a quick action menu:
- **Play Now** - Play this song immediately
- **Add to Queue** - Add to the playback queue
- **Song Info** - View song details

Works on both mobile (with haptic feedback) and desktop!

### Visual Configuration Editor

For Custom mode, use the built-in visual editor instead of editing YAML:

1. Add card or click Configure on existing card
2. Select "Custom" mode
3. Use the 4-tab editor:
   - **General**: Playlist, songs, and queue display modes
   - **Appearance**: Show/hide visual elements
   - **Controls**: Enable/disable playback and volume controls
   - **Advanced**: Fine-tune behavior and limits

### Smart Queue Management

The card includes intelligent duplicate prevention:
- Checks entire queue (not just last song)
- Shows "Already in queue" message
- Prevents accidental duplicates

### Real-Time Updates

All cards update in real-time via WebSocket:
- Position updates as song plays
- Queue changes reflect immediately
- State changes across all cards
- No polling - efficient and responsive

## Development

### Building the Card

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with watch
npm run watch
```

The built card will be in `dist/xschedule-card.js`.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

See [DEVELOPMENT_PROMPT.md](DEVELOPMENT_PROMPT.md) for detailed implementation specifications.

## Requirements

- Home Assistant 2024.1 or newer
- xSchedule running and accessible on your network
- xSchedule API enabled (enabled by default)

## API Documentation

This integration uses the xSchedule API documented here:
https://github.com/xLightsSequencer/xLights/blob/master/documentation/xSchedule%20API%20Documentation.txt

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- [xLights/xSchedule](https://github.com/xLightsSequencer/xLights) - The amazing lighting sequencer software
- Home Assistant community for integration patterns and best practices

## Support

- [Report Issues](https://github.com/mr-light-show/xschedule-homeassistant/issues)
- [Discussions](https://github.com/mr-light-show/xschedule-homeassistant/discussions)
