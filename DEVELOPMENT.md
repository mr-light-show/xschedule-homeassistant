# xSchedule Development Guide

## Development Workflow

### Prerequisites

1. **SSH Access**: Ensure you can SSH to your Home Assistant instance:
   ```bash
   ssh $USER@homeassistant.local
   ```

2. **Node.js & npm**: For building frontend assets:
   ```bash
   node --version  # Should be v18 or higher
   npm --version
   ```

3. **Python**: For backend development and testing:
   ```bash
   python --version  # Should be 3.11 or higher
   ```

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd xSchedule
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```

## Deployment Scripts

### Standard Deployment

Deploy changes without restarting Home Assistant:

```bash
./deploy.sh
```

This will:
- Build frontend assets (if package.json exists)
- Sync Python files to Home Assistant
- Sync frontend JS files to Home Assistant
- Exclude cache files and temporary files

**When to use:** After making changes that don't require a restart (frontend-only changes).

### Quick Deploy + Restart

Deploy changes and restart Home Assistant in one command:

```bash
./deploy-restart.sh
```

This will:
- Run `./deploy.sh` to sync all files
- Restart Home Assistant core via REST API

**When to use:** After making backend changes (Python code, services, etc.).

**Note:** The script uses a long-lived access token stored in the script to call the Home Assistant REST API for restarting. This is more reliable than SSH-based restart commands.

### Manual Deployment Steps

If you prefer manual control:

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Copy files manually:**
   ```bash
   rsync -avz --delete \
     --exclude='__pycache__' \
     custom_components/xschedule/ \
     $USER@homeassistant.local:/config/custom_components/xschedule/
   ```

3. **Restart Home Assistant:**
   ```bash
   # Via REST API (recommended):
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     "http://homeassistant.local:8123/api/services/homeassistant/restart"
   
   # Or use the deploy-restart.sh script:
   ./deploy-restart.sh
   ```

## Development Cycle

### Frontend Development

1. Make changes to frontend files:
   - `src/xschedule-card.js`
   - `src/xschedule-playlist-browser.js`
   - `src/xschedule-card-editor.js`
   - `src/mode-presets.js`

2. Test locally (if using Rollup watch):
   ```bash
   npm run dev
   ```

3. Build and deploy:
   ```bash
   npm run build
   ./deploy.sh
   ```

4. Clear browser cache:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+Shift+Del` and clear cache

5. Refresh Home Assistant UI

### Backend Development

1. Make changes to backend files:
   - `custom_components/xschedule/__init__.py`
   - `custom_components/xschedule/media_player.py`
   - `custom_components/xschedule/api_client.py`
   - `custom_components/xschedule/websocket.py`
   - etc.

2. Run tests locally:
   ```bash
   pytest tests/
   ```

3. Deploy and restart:
   ```bash
   ./deploy-restart.sh
   ```

4. Wait ~30-60 seconds for Home Assistant to restart

5. Check logs for errors:
   ```bash
   ssh $USER@homeassistant.local 'tail -f /config/home-assistant.log'
   ```

### Testing

#### Frontend Tests

```bash
npm test
```

This runs the Web Test Runner suite for frontend components.

#### Backend Tests

```bash
pytest
```

Run specific test file:
```bash
pytest tests/test_media_player.py
```

Run with verbose output:
```bash
pytest -v
```

Run with coverage:
```bash
pytest --cov=custom_components.xschedule
```

### Linting

#### Frontend Linting

```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

#### Backend Linting

```bash
pylint custom_components/xschedule/
```

Or use Home Assistant's style checker:
```bash
black custom_components/xschedule/
```

## Debugging

### Enable Debug Logging

Add to Home Assistant `configuration.yaml`:

```yaml
logger:
  default: info
  logs:
    custom_components.xschedule: debug
```

Restart Home Assistant, then view logs:

```bash
ssh $USER@homeassistant.local 'tail -f /config/home-assistant.log | grep xschedule'
```

### Enable Trace Logging (Very Verbose)

For even more detailed WebSocket logging:

```yaml
logger:
  default: info
  logs:
    custom_components.xschedule: 5  # TRACE level
```

### Frontend Debugging

Open browser Developer Tools (F12) and check:
- **Console tab**: JavaScript errors and console.log output
- **Network tab**: Failed resource loads
- **Elements tab**: Inspect custom element properties

## Version Management

Use the version update script to bump versions consistently:

```bash
./update-version.sh patch   # 1.0.0 -> 1.0.1
./update-version.sh minor   # 1.0.1 -> 1.1.0
./update-version.sh major   # 1.1.0 -> 2.0.0
./update-version.sh pre     # 1.0.0 -> 1.0.1-pre1
```

This updates:
- `package.json`
- `custom_components/xschedule/manifest.json`
- Frontend card version constants

## Release Process

1. Ensure all tests pass:
   ```bash
   npm test && pytest
   ```

2. Update version:
   ```bash
   ./update-version.sh minor  # or patch/major
   ```

3. Build frontend:
   ```bash
   npm run build
   ```

4. Commit changes:
   ```bash
   git add .
   git commit -m "Release vX.Y.Z"
   ```

5. Create Git tag:
   ```bash
   git tag vX.Y.Z
   git push origin main --tags
   ```

6. Create GitHub release:
   ```bash
   gh release create vX.Y.Z --generate-notes
   ```

## Useful Commands

### Check Home Assistant Status

```bash
ssh $USER@homeassistant.local 'ha core info'
```

### View Integration State

```bash
ssh $USER@homeassistant.local 'ha core state media_player.xschedule'
```

### Reload Integration (Without Full Restart)

This only works for config changes, not code changes:

```bash
ssh $USER@homeassistant.local 'ha core reload --config'
```

### SSH into Home Assistant Container

```bash
ssh $USER@homeassistant.local
```

Then navigate to custom component:
```bash
cd /config/custom_components/xschedule
ls -la
```

## Troubleshooting

### "Permission denied" during rsync

Ensure SSH key is set up:
```bash
ssh-copy-id $USER@homeassistant.local
```

### Changes not appearing after deployment

1. Check file timestamps on HA:
   ```bash
   ssh $USER@homeassistant.local 'ls -la /config/custom_components/xschedule/'
   ```

2. Clear browser cache completely

3. Restart Home Assistant:
   ```bash
   ./deploy-restart.sh
   ```

### Integration not loading

Check Home Assistant logs:
```bash
ssh $USER@homeassistant.local 'grep -i "xschedule\|error\|exception" /config/home-assistant.log | tail -50'
```

### Frontend card not updating

1. Check browser cache is cleared
2. Check for JavaScript errors in browser console (F12)
3. Verify files were synced:
   ```bash
   ssh $USER@homeassistant.local 'ls -la /config/custom_components/xschedule/www/'
   ```

## Additional Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [Custom Components Guide](https://developers.home-assistant.io/docs/creating_component_index/)
- [Custom Cards Guide](https://developers.home-assistant.io/docs/frontend/custom-ui/creating-custom-cards/)

