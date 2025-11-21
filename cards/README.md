# xSchedule Lovelace Cards

Frontend custom cards for the xSchedule Home Assistant integration.

## Cards Included

### xSchedule Media Player Card (`xschedule-card`)

The main playback control card with 5 preset modes and extensive customization options.

**Features:**
- 5 preset modes: Simple, DJ, Jukebox, Minimal, Custom
- Visual configuration editor (no YAML needed)
- Real-time WebSocket updates
- Queue management with drag-and-drop reordering
- Long-press context menu for quick actions
- Highly customizable display options

### xSchedule Playlist Browser Card (`xschedule-playlist-browser`)

A companion card for browsing playlists with scheduling information.

**Features:**
- Smart scheduling display (Today 8PM, Tomorrow 9AM, etc.)
- Duration calculation for all playlists
- Two sort modes: by schedule or alphabetical
- Visual status badges for playing/scheduled playlists
- Expandable song lists with song details

## Installation (Future - If Extracted to Separate Repo)

> **Note:** Currently, these cards are automatically installed with the xSchedule integration.  
> This section describes how installation would work if the cards were in a separate HACS plugin repository.

### Via HACS

1. Add custom repository: `https://github.com/mr-light-show/xschedule-cards`
2. Category: Lovelace
3. Search for "xSchedule Cards"
4. Install

### Manual

1. Download latest release
2. Copy `dist/` contents to `/config/www/xschedule-cards/`
3. Add resources in Lovelace:
   - `/hacsfiles/xschedule-cards/xschedule-card.js`
   - `/hacsfiles/xschedule-cards/xschedule-playlist-browser.js`

## Development

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install
```

### Building

```bash
# Build once
npm run build

# The build outputs to:
# - dist/ (gitignored build artifacts)
# - ../custom_components/xschedule/www/ (deployed files)
```

### Testing

```bash
# Run tests once
npm test

# Watch mode (auto-rerun on file changes)
npm run test:watch
```

### Project Structure

```
cards/
├── src/                          # Source files
│   ├── xschedule-card.js         # Main player card
│   ├── xschedule-card-editor.js  # Visual editor for player card
│   ├── xschedule-playlist-browser.js  # Playlist browser card
│   └── mode-presets.js           # Preset configurations
│
├── test/                         # Frontend tests
│   ├── xschedule-card.test.js
│   ├── xschedule-card-editor.test.js
│   ├── xschedule-playlist-browser.test.js
│   └── helpers/                  # Test utilities
│       ├── mock-hass.js
│       ├── mock-lovelace.js
│       └── test-utils.js
│
├── dist/                         # Build output (gitignored)
├── coverage/                     # Test coverage reports (gitignored)
│
├── package.json                  # Dependencies & scripts
├── rollup.config.mjs             # Build configuration
└── web-test-runner.config.mjs    # Test configuration
```

### Dependencies

**Production:**
- `lit` (^3.1.0) - Web Components framework

**Development:**
- `rollup` (^4.9.4) - Module bundler
- `@rollup/plugin-node-resolve` (^15.2.3) - Import resolution
- `@web/test-runner` (^0.18.0) - Test runner
- `sinon` (^17.0.1) - Test utilities (spies, stubs, mocks)

### Build Process

The build process:

1. **Bundle**: Rollup combines source files and resolves imports
2. **Output**: Creates ES modules in `dist/`
3. **Deploy**: Copies built files to `../custom_components/xschedule/www/`

The integration automatically registers the cards from the `www/` directory when loaded.

### Testing Strategy

**Unit Tests:**
- Component rendering
- State management
- User interactions
- Feature detection
- Generic player compatibility

**Test Coverage:**
- Minimum 45% statement coverage
- Minimum 50% branch coverage
- Minimum 20% function coverage

Run `npm test` to see current coverage.

### Code Style

- ES6+ JavaScript
- LitElement web components
- Functional programming patterns
- Comprehensive JSDoc comments

### Local Development Workflow

1. Make changes to source files in `src/`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Deploy to HA: `cd .. && ./scripts/deploy.sh`
5. Clear browser cache and test in HA

For active development, use `npm run test:watch` to auto-run tests on file changes.

## Contributing

See [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) for general contribution guidelines.

### Card-Specific Guidelines

1. **Maintain backwards compatibility** - Cards are installed automatically with the integration
2. **Test with multiple players** - Support both xSchedule and generic media players
3. **Update tests** - Add tests for new features
4. **Document configuration** - Update main README.md for user-facing changes

## License

See [../LICENSE](../LICENSE)

