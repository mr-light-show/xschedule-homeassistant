/**
 * xSchedule Media Player Card for Home Assistant
 *
 * A custom Lovelace card for controlling xSchedule lighting sequencer
 */

class XScheduleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this.content = document.createElement('ha-card');
      this.content.innerHTML = `
        <div class="card-content">
          <p>xSchedule Media Player</p>
          <p>Entity: ${this.config.entity}</p>
          <p>TODO: Implement card UI</p>
        </div>
      `;
      this.shadowRoot.appendChild(this.content);
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];

    if (state) {
      // TODO: Update card with entity state
      console.log('xSchedule state:', state);
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('xschedule-card', XScheduleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-card',
  name: 'xSchedule Media Player',
  description: 'A custom card for controlling xSchedule lighting sequencer'
});
