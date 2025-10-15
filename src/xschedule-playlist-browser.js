/**
 * xSchedule Playlist Browser Card for Home Assistant
 *
 * A companion card for browsing and selecting xSchedule playlists
 */

class XSchedulePlaylistBrowser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = {
      sort_by: config.sort_by || 'schedule',
      show_duration: config.show_duration !== false,
      show_status: config.show_status !== false,
      compact_mode: config.compact_mode || false,
      confirm_play: config.confirm_play !== false,
      ...config
    };
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this.content = document.createElement('ha-card');
      this.content.innerHTML = `
        <div class="card-content">
          <h2>xSchedule Playlists</h2>
          <p>Entity: ${this.config.entity}</p>
          <p>Sort: ${this.config.sort_by}</p>
          <p>TODO: Implement playlist browser UI</p>
        </div>
      `;
      this.shadowRoot.appendChild(this.content);
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];

    if (state) {
      // TODO: Fetch and display playlists
      // - Get list of playlists
      // - Get schedule information for each
      // - Sort based on configuration
      // - Display with status badges
      console.log('xSchedule Playlist Browser state:', state);
    }
  }

  getCardSize() {
    return this.config.compact_mode ? 4 : 6;
  }
}

customElements.define('xschedule-playlist-browser', XSchedulePlaylistBrowser);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-playlist-browser',
  name: 'xSchedule Playlist Browser',
  description: 'Browse and select xSchedule playlists with schedule information'
});
