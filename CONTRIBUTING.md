# Contributing to xSchedule Home Assistant Integration

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Python 3.11 or higher
- Node.js 20 or higher
- Home Assistant development environment (optional but recommended)

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/xschedule-homeassistant.git
   cd xschedule-homeassistant
   ```

2. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

3. **Build the card**
   ```bash
   npm run build
   ```

## Project Structure

```
xschedule-homeassistant/
├── custom_components/xschedule/   # Home Assistant integration
│   ├── __init__.py                # Integration entry point
│   ├── manifest.json              # Integration metadata
│   ├── const.py                   # Constants
│   ├── config_flow.py             # Configuration flow
│   └── media_player.py            # Media player entity
├── src/                           # Card source code (unminified)
│   └── xschedule-card.js         # Custom Lovelace card
├── dist/                          # Built card (generated, not committed)
│   └── xschedule-card.js         # Bundled card
└── docs/                          # Documentation
```

## Development Workflow

### Working on the Integration

1. Make changes to files in `custom_components/xschedule/`
2. Test in your Home Assistant development environment
3. Ensure code follows Python best practices
4. Add appropriate logging

### Working on the Card

1. Edit source files in `src/`
2. Run development build with watch mode:
   ```bash
   npm run watch
   ```
3. Test in Home Assistant by pointing to the built file in `dist/`
4. The card will automatically rebuild when you save changes

### Building for Production

```bash
npm run build
```

This creates an optimized, minified bundle in `dist/xschedule-card.js`

## Testing

### Integration Testing

1. Copy `custom_components/xschedule` to your Home Assistant config directory
2. Restart Home Assistant
3. Add the integration through the UI
4. Verify all functionality works

### Card Testing

1. Copy `dist/xschedule-card.js` to your `config/www/` directory
2. Add the card to your dashboard
3. Test all configuration options
4. Verify WebSocket connectivity and real-time updates

## Code Style

### Python
- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where applicable
- Add docstrings to all functions and classes

### JavaScript
- Use modern ES6+ syntax
- Format code with Prettier: `npm run format`
- Lint code with ESLint: `npm run lint`

## Commit Messages

Follow conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor code`
- `test: Add tests`
- `chore: Update dependencies`

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Test thoroughly
   - Update documentation if needed

3. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

5. **Address review feedback**
   - Make requested changes
   - Push updates to the same branch

## Release Process

Releases are automated via GitHub Actions:

1. Create a new tag:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

2. Create a GitHub release from the tag

3. GitHub Actions will:
   - Build the JavaScript bundle
   - Create distribution archives
   - Upload release assets
   - Update the release notes

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
