# Testing Guide for xSchedule Home Assistant Integration

This document provides comprehensive information about the testing infrastructure for the xSchedule Home Assistant integration.

## Overview

The project uses a dual testing approach:
- **Backend Testing**: Python tests using pytest
- **Frontend Testing**: JavaScript tests using Web Test Runner

## Backend Testing (Python)

### Setup

Install test dependencies:
```bash
pip install -r requirements_test.txt
```

### Running Tests

Run all backend tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=custom_components.xschedule --cov-report=html
```

Run specific test file:
```bash
pytest tests/test_media_player.py
```

Run specific test:
```bash
pytest tests/test_media_player.py::TestMediaPlayerStateTransitions::test_idle_state_clears_attributes
```

### Test Structure

```
tests/
├── __init__.py
├── conftest.py                 # Shared fixtures
├── test_api_client.py          # API client tests (~20 tests)
├── test_media_player.py        # Media player entity tests (~25 tests)
├── test_websocket.py           # WebSocket client tests (~20 tests)
└── test_config_flow.py         # Configuration flow tests (~15 tests)
```

### Key Test Coverage

**test_api_client.py**
- HTTP request/response handling
- Caching behavior (TTL, force refresh)
- Error handling
- Password authentication

**test_media_player.py** (includes bug fix verification)
- ✅ Idle state clears attributes (stale song display bug fix)
- ✅ Cache invalidation events fired
- State transitions (playing/paused/idle)
- WebSocket update handling
- Service calls

**test_websocket.py**
- Connection lifecycle
- Message broadcasting
- Reconnection logic
- Multiple listeners

**test_config_flow.py**
- User configuration flow
- Connection validation
- Duplicate entry prevention
- Options flow

## Frontend Testing (JavaScript)

### Setup

Install test dependencies:
```bash
npm install
```

### Running Tests

Run all frontend tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run with coverage:
```bash
npm run test:coverage
```

### Test Structure

```
test/
├── helpers/
│   └── mock-hass.js            # Mock Home Assistant utilities
├── xschedule-card.test.js      # Media player card tests (~15 tests)
├── xschedule-playlist-browser.test.js  # Playlist browser tests (~12 tests)
└── xschedule-card-editor.test.js       # Config editor tests (~10 tests)
```

### Key Test Coverage

**xschedule-card.test.js**
- Mode switching (auto/custom/compact)
- ✅ Stale media info cleared on idle (bug fix verification)
- State display (playing/paused/idle)
- Media controls
- WebSocket subscription
- Playlist/songs display toggling

**xschedule-playlist-browser.test.js**
- ✅ Cache invalidation event subscription (bug fix verification)
- ✅ Force refresh on cache invalidation
- Schedule display
- Playlist selection
- Queue operations

**xschedule-card-editor.test.js** (includes bug fix verification)
- ✅ Display mode selects show selected values (bug fix verification)
- Entity selection
- Mode selection
- Checkbox options
- Config change events
- Validation

## Critical Regression Tests

The following tests verify recent bug fixes and must always pass:

### Backend
1. **test_idle_state_clears_attributes** (test_media_player.py:56)
   - Verifies attributes cleared when state becomes IDLE
   - Prevents stale song display bug

2. **test_cache_invalidation_event_fired** (test_media_player.py:106)
   - Verifies cache invalidation event is fired on state change
   - Enables frontend notification of backend changes

### Frontend
1. **clears stale media info when transitioning to idle** (xschedule-card.test.js:89)
   - Verifies frontend doesn't display stale song info
   - Complements backend fix

2. **refetches data when cache invalidation event received** (xschedule-playlist-browser.test.js:38)
   - Verifies frontend responds to cache invalidation events
   - Tests event subscription and force refresh

3. **shows selected value for playlistDisplay/songsDisplay/queueDisplay** (xschedule-card-editor.test.js:72-124)
   - Verifies display mode selects show correct selected option
   - Prevents config editor display bug

## CI/CD Integration

### GitHub Actions Workflow

The project uses GitHub Actions for continuous integration:

```yaml
.github/workflows/test.yml
```

**Jobs:**
1. **backend-tests**: Runs pytest with coverage reporting
2. **frontend-tests**: Runs Web Test Runner and builds project
3. **lint**: Runs ESLint for code quality
4. **quality-gate**: Ensures all checks pass

### Triggering CI

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### Coverage Reports

Coverage reports are uploaded to Codecov:
- Backend coverage: `pytest --cov`
- Frontend coverage: Web Test Runner built-in

## Coverage Goals

### Current Implementation (Phase 1)
- Backend: >70% statement coverage
- Frontend: >60% statement coverage

### Target (Phase 2)
- Backend: >80% statement coverage
- Frontend: >70% statement coverage
- Integration tests: 3-5 critical user flows

## Writing New Tests

### Backend Test Example

```python
@pytest.mark.asyncio
async def test_my_feature(media_player_entity):
    """Test description."""
    # Arrange
    data = {"status": "playing"}

    # Act
    media_player_entity._handle_websocket_update(data)

    # Assert
    assert media_player_entity.state == MediaPlayerState.PLAYING
```

### Frontend Test Example

```javascript
it('displays custom name', async () => {
  // Arrange
  element = await fixture(html`<xschedule-card></xschedule-card>`);
  const config = createMockCardConfig({ name: 'Custom' });

  // Act
  element.setConfig(config);
  await element.updateComplete;

  // Assert
  const nameElement = element.shadowRoot.querySelector('.name');
  expect(nameElement.textContent).to.include('Custom');
});
```

## Troubleshooting

### Backend Tests Fail

**Issue**: Module import errors
```bash
# Solution: Install in development mode
pip install -e .
```

**Issue**: Async test warnings
```bash
# Solution: Ensure pytest-asyncio is installed
pip install pytest-asyncio
```

### Frontend Tests Fail

**Issue**: Browser launch errors
```bash
# Solution: Install Playwright browsers
npx playwright install chromium
```

**Issue**: Component not defined
```bash
# Solution: Ensure component is imported in test file
import '../src/xschedule-card.js';
```

## Best Practices

1. **Write tests for all bug fixes** - Prevent regressions
2. **Test edge cases** - Empty data, missing fields, errors
3. **Use descriptive test names** - Explain what is being tested
4. **Keep tests isolated** - Each test should be independent
5. **Mock external dependencies** - Don't rely on real API calls
6. **Test user interactions** - Simulate button clicks, input changes
7. **Verify visual state** - Check that UI reflects data correctly

## Future Enhancements

### Phase 2
- Increase coverage to >80% backend, >70% frontend
- Add integration tests with Docker
- Visual regression testing for UI
- Performance benchmarks

### Phase 3
- Property-based testing for edge cases
- Mutation testing for test quality
- E2E tests with real xSchedule server
- Cross-browser testing (Firefox, Safari)

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [Web Test Runner documentation](https://modern-web.dev/docs/test-runner/overview/)
- [Open WC Testing](https://open-wc.org/docs/testing/testing-package/)
- [Home Assistant Testing](https://developers.home-assistant.io/docs/development_testing)
