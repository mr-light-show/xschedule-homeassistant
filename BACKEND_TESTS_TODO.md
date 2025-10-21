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

### Phase 3: High Effort (Requires HA expertise)
1. Set up proper Home Assistant test environment
2. Create fixtures for `hass`, config entries, entity registry
3. Configure `pytest-homeassistant-custom-component` properly
4. Update config flow tests to use proper HA testing patterns
5. Update media player tests to use proper HA testing patterns

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
