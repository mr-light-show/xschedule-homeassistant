# xSchedule Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/mr-light-show/xschedule-homeassistant.svg)](https://github.com/mr-light-show/xschedule-homeassistant/releases)
[![License](https://img.shields.io/github/license/mr-light-show/xschedule-homeassistant.svg)](LICENSE)

Home Assistant integration and custom dashboard card for [xSchedule](https://github.com/xLightsSequencer/xLights), a lighting sequencer system from the xLights project.

## Features

### Integration
- **Full Media Player Support**: Control xSchedule as a native Home Assistant media player
- **Real-time Updates**: WebSocket connection for live status updates (no polling!)
- **Playlist Management**: Browse and play playlists and individual steps/songs
- **Queue Support**: Add songs to play queue with duplicate prevention
- **Volume Control**: Adjust volume and mute/unmute
- **Playback Controls**: Play, pause, stop, next, previous, and seek
- **Event System**: Fire Home Assistant events for all actions

### Dashboard Card
- **Highly Configurable**: Show/hide any control or display element
- **Multiple Display Modes**: Expanded, collapsed, or hidden views for playlists and queue
- **Modern UI**: Clean, responsive interface consistent with Home Assistant design
- **Real-time Position**: Live playback position updates via WebSocket
- **Quick Actions**: Play songs immediately or add to queue with one tap

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add `https://github.com/mr-light-show/xschedule-homeassistant` as an integration
6. Click "Install"
7. Restart Home Assistant

### Manual Installation

1. Download the latest release
2. Copy the `custom_components/xschedule` folder to your Home Assistant `config/custom_components/` directory
3. Copy the `www/xschedule-card.js` file to your `config/www/` directory
4. Restart Home Assistant

## Configuration

### Integration Setup

1. Go to **Settings** → **Devices & Services**
2. Click **Add Integration**
3. Search for "xSchedule"
4. Enter your xSchedule host/IP address and port
5. (Optional) Enter password if your xSchedule web interface is password protected

### Dashboard Card Setup

Add the card via the UI:

1. Edit your dashboard
2. Click **Add Card**
3. Search for "xSchedule Media Player"
4. Select your xSchedule entity
5. Configure display options as desired

Or add manually to your dashboard YAML:

```yaml
type: custom:xschedule-card
entity: media_player.xschedule
show_playlist: true
playlist_mode: expanded  # expanded, collapsed, or hidden
show_queue: true
queue_mode: expanded
show_volume: true
show_seek: true
```

## Card Configuration Options

The card offers extensive configuration organized into logical groups:

### Display Options
- Playlist display mode (expanded/collapsed/hidden)
- Queue display mode (expanded/collapsed/hidden)
- Show/hide step duration
- Show/hide step actions (play/queue icons)

### Control Options
- Show/hide individual playback buttons
- Show/hide volume controls
- Show/hide seek bar
- Show/hide queue controls

### Status Display
- Show/hide now playing information
- Show/hide playlist name
- Show/hide time remaining
- Time format options

### Layout Options
- Card layout presets (default/compact/minimal)
- Custom colors and icons
- Card height settings

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
