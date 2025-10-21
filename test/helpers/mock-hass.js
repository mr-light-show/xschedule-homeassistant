/**
 * Mock Home Assistant object for testing
 */

export function createMockHass(overrides = {}) {
  const events = {};
  const listeners = {};

  return {
    connection: {
      subscribeEvents: (callback, eventType) => {
        if (!listeners[eventType]) {
          listeners[eventType] = [];
        }
        listeners[eventType].push(callback);

        // Return unsubscribe function
        return Promise.resolve(() => {
          const index = listeners[eventType].indexOf(callback);
          if (index > -1) {
            listeners[eventType].splice(index, 1);
          }
        });
      },

      // Helper to trigger events in tests
      _triggerEvent: (eventType, data) => {
        if (listeners[eventType]) {
          listeners[eventType].forEach(callback => {
            callback({ data });
          });
        }
      },
    },

    callService: async (domain, service, data) => {
      events[`${domain}.${service}`] = data;
      return Promise.resolve();
    },

    states: {
      'media_player.xschedule': {
        entity_id: 'media_player.xschedule',
        state: 'idle',
        attributes: {
          friendly_name: 'xSchedule',
          supported_features: 0,
        },
      },
    },

    config: {
      language: 'en',
      unit_system: {
        length: 'km',
        mass: 'kg',
        temperature: 'C',
      },
    },

    user: {
      id: 'test-user',
      name: 'Test User',
      is_admin: true,
    },

    // Helper to get last service call
    _getLastServiceCall: (domain, service) => {
      return events[`${domain}.${service}`];
    },

    // Helper to set entity state
    _setState: (entityId, state, attributes = {}) => {
      if (!this.states[entityId]) {
        this.states[entityId] = { entity_id: entityId };
      }
      this.states[entityId].state = state;
      this.states[entityId].attributes = { ...this.states[entityId].attributes, ...attributes };
    },

    ...overrides,
  };
}

/**
 * Create mock entity state for testing
 */
export function createMockEntityState(entityId, state, attributes = {}) {
  return {
    entity_id: entityId,
    state: state,
    attributes: {
      friendly_name: entityId.split('.')[1],
      ...attributes,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
}

/**
 * Create mock config for cards
 */
export function createMockCardConfig(overrides = {}) {
  return {
    entity: 'media_player.xschedule',
    mode: 'simple',
    name: 'xSchedule Media Player',
    ...overrides,
  };
}

/**
 * Helper to create and configure a component before first render
 */
export async function createConfiguredElement(elementTag, config, hass) {
  const element = document.createElement(elementTag);

  // Set config first (required before render and before setting hass)
  if (config) {
    element.setConfig(config);
  }

  // Add to DOM before setting hass (some components need to be in DOM)
  document.body.appendChild(element);

  // Set hass after element is in DOM (may trigger render)
  if (hass) {
    element.hass = hass;
  }

  // Wait for updates
  await element.updateComplete;

  return element;
}
