# Backend Tests TODO

## Status
Backend tests are **placeholder stubs** that were created to show the structure but don't match the actual implementation. They are currently disabled in CI/CD.

## Issues Found

### 1. API Client Tests (`tests/test_api_client.py`)

**Problem**: Tests call non-existent methods
- ❌ Test calls: `get_schedules()`
- ✅ Actual method: `get_playlist_schedules(playlist_name)`

**Fix Required**:
```python
# Lines 161-181: Update these tests
# Change: await api_client.get_schedules()
# To: await api_client.get_playlist_schedules("TestPlaylist")
```

**Tests Affected**:
- `test_get_schedules_with_cache` (line 161)
- `test_get_schedules_expired_cache` (line 171)

---

### 2. WebSocket Tests (`tests/test_websocket.py`)

**Problem**: Tests expect attributes/methods that don't exist

**Missing Attributes**:
- ❌ `._host` - Test expects this (line 35)
- ❌ `._password` - Test expects this (line 42)
- ❌ `.is_connected` - Test expects this (line 46)
- ✅ Actual: `.connected` exists instead

**Missing Methods**:
- ❌ `.add_listener()` - Test expects this (lines 99, 120, 139)
- ✅ Actual: Different event handling mechanism

**Fix Required**:
1. Check actual WebSocket implementation to understand:
   - How connection state is tracked
   - How event listeners are registered
   - What the actual internal structure is
2. Update tests to match actual implementation

**Tests Affected**:
- `test_init_with_password` (line 35)
- `test_init_without_password` (line 42)
- `test_initial_connection_state` (line 46)
- `test_connect_success` (line 63)
- `test_disconnect` (line 85)
- `test_callback_on_message` (line 99)
- `test_multiple_listeners` (line 120)
- `test_remove_listener` (line 139)
- And more...

---

### 3. Config Flow Tests (`tests/test_config_flow.py`)

**Problem**: Tests expect Home Assistant test fixtures that aren't configured

**Missing Setup**:
- Home Assistant test environment
- Mock `hass` fixture with proper structure
- Mock config entries
- Mock entity registry

**Fix Required**:
1. Set up proper Home Assistant test fixtures in `tests/conftest.py`
2. Add mock objects for:
   - `HomeAssistant` instance
   - Config entry flow
   - Entry creation/validation
3. May need `pytest-homeassistant-custom-component` plugin configured properly

**Tests Affected**: All config flow tests (9 tests)

---

### 4. Media Player Tests (`tests/test_media_player.py`)

**Problem**: Tests have `ERROR` status - can't even run due to missing fixtures

**Missing Setup**:
- Home Assistant test environment
- Mock `hass` instance
- Mock entity platform
- Mock API client
- Mock WebSocket

**Fix Required**:
1. Same as config flow - need proper HA test environment
2. Add fixtures for media player entity setup
3. Mock all dependencies (API client, WebSocket, etc.)

**Tests Affected**: All media player tests (17 tests)

---

## Test Results Summary

### Phase 1 Results (commit 2b8acd6):
- ✅ **29 passing** (44%) - Quick fixes for method/property names
- ❌ **36 failing/errors** - Remaining mismatches and missing fixtures

### Phase 2 Results (commit 954f614):
- ✅ **35 passing** (54%) - WebSocket event handling fixed
- ❌ **13 failing** - WebSocket connection management issues
- ❌ **20 errors** - Home Assistant fixture issues

**Progress**: +14 tests passing from original baseline (21 → 35)

### Currently Passing (35):
- API client initialization tests
- API client caching tests
- API client request tests
- Error handling tests
- WebSocket initialization tests
- WebSocket message handling tests (NEW in Phase 2)
- WebSocket reconnection logic tests (NEW in Phase 2)

### Still Failing (13):
- 4 WebSocket connection tests (mock setup issues)
- 9 Config flow tests (missing HA fixtures)

### Still Erroring (20):
- 17 Media player tests (missing HA fixtures)
- 3 WebSocket tests (lingering tasks - cleanup needed)

---

## Recommended Fix Approach

### Phase 1: Quick Fixes (Low-hanging fruit) ✅ COMPLETED
1. ✅ Fix API client method name: `get_schedules()` → `get_playlist_schedules()`
2. ✅ Update WebSocket property access: `.is_connected` → `.connected`
3. ✅ Update WebSocket property access: `._host` → `.host`, `._password` → `.password`

### Phase 2: Medium Effort ✅ COMPLETED
1. ✅ Review WebSocket implementation to understand event handling
2. ✅ Update WebSocket tests to match actual implementation (callback-based)
3. ✅ Remove tests for non-existent methods (add_listener/remove_listener)
4. ✅ Fix WebSocket property and attribute references

### Phase 3: Set Up Proper Home Assistant Test Environment

## What's Involved

Setting up a "proper Home Assistant test environment" means configuring pytest to properly load and test your custom integration the same way Home Assistant core tests its built-in integrations.

## Home Assistant's Approved Testing Approach

**Official Method:**
- Testing Framework: pytest with pytest-asyncio
- Custom Component Plugin: `pytest-homeassistant-custom-component` (already installed ✅)
- Key Fixtures:
  - `hass` - Provides a test instance of Home Assistant
  - `enable_custom_integrations` - Required for HA versions >= 2021.6.0b0
  - Registry fixtures (`entity_registry`, `device_registry`, etc.)

**Standard Pattern Used by Existing Integrations:**

tests/conftest.py:
```python
"""Shared fixtures for testing."""
import pytest

# This autouse fixture enables loading custom integrations
pytest_plugins = "pytest_homeassistant_custom_component"

@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests."""
    yield
```

## What's Currently Missing

1. **Missing `enable_custom_integrations` Fixture**
   - Our conftest.py doesn't use the `enable_custom_integrations` fixture
   - This causes "Cannot find integration xschedule" errors
   - Home Assistant can't load the custom component during tests

2. **Missing custom_components/__init__.py**
   - The package needs an `__init__.py` to be importable
   - Without it, pytest can't find the integration

3. **Improper Fixture Usage**
   - Tests use `hass: HomeAssistant` but don't enable custom integrations first
   - This means HA doesn't know about our xschedule component

## Implementation Steps

### Step 1: Update tests/conftest.py
Add the enable_custom_integrations fixture:

```python
"""Shared fixtures for xSchedule tests."""
import pytest
from unittest.mock import AsyncMock, MagicMock
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

# Enable loading custom integrations
pytest_plugins = "pytest_homeassistant_custom_component"

@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations defined in the repository."""
    yield

# ... rest of existing fixtures
```

### Step 2: Create custom_components/__init__.py
Add an empty `__init__.py` to make the package importable:

```python
"""Custom components package."""
```

### Step 3: Update Test Files (if needed)
Most test files should work as-is once the integration loads properly. The `hass` fixture will now be able to find and load the xschedule integration.

## Expected Outcomes

**Before (current state):**
- 35/68 tests passing (54%)
- 13 failed - config flow tests fail with "Integration 'xschedule' not found"
- 20 errors - media player tests can't initialize

**After Phase 3:**
- Should reach ~50-55/68 tests passing (75-80%)
- Config flow tests should pass (9 tests)
- Media player initialization tests should pass (~10 tests)
- Remaining failures will be actual test logic issues, not fixture problems

## Validation Steps

1. Run tests locally: `pytest tests/test_config_flow.py -v`
2. Verify integration loads: Should see "INFO Loading integration xschedule"
3. Check config flow tests pass
4. Verify media player can initialize
5. Run full test suite and confirm improvement

## Why This Is Standard

This approach:
- ✅ Matches Home Assistant core testing patterns
- ✅ Used by all well-tested custom components
- ✅ Recommended in official HA developer docs
- ✅ Provides proper isolation and cleanup
- ✅ Enables advanced features (snapshots, registries, etc.)

## Effort Estimate

**Time**: 30-60 minutes
- 5 minutes: Add conftest.py fixture
- 5 minutes: Create __init__.py
- 20-40 minutes: Debug any remaining issues and verify tests pass

**Complexity**: Medium - Need to understand pytest fixture system and HA's integration loading

---

## Future Work

Once tests are fixed:
1. Re-enable backend tests in `.github/workflows/test.yml`
2. Remove `if: false` condition
3. Update quality gate to check backend tests
4. Add backend coverage requirements

---

## Current Test Coverage

**Frontend Tests**: ✅ 59/59 passing (66.6% coverage)
**Backend Tests**: 🔲 Disabled (placeholder stubs)

**CI/CD Status**: ✅ Passing (frontend only)
