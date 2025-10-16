/**
 * xSchedule Playlist Browser Card for Home Assistant
 *
 * A companion card for browsing and selecting xSchedule playlists with schedule information
 */

import { LitElement, html, css } from 'lit';

class XSchedulePlaylistBrowser extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _entity: { type: Object },
      _playlists: { type: Array },
      _playlistSchedules: { type: Object },
      _loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._playlists = [];
    this._playlistSchedules = {};
    this._loading = true;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = {
      entity: config.entity,
      sort_by: config.sort_by || 'schedule',
      show_duration: config.show_duration !== false,
      show_status: config.show_status !== false,
      compact_mode: config.compact_mode || false,
      confirm_play: config.confirm_play !== false,
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;

    // Get entity
    const entityId = this.config.entity;
    this._entity = hass.states[entityId];

    if (this._entity) {
      // Extract playlists from source_list
      this._playlists = this._entity.attributes.source_list || [];

      // Fetch schedule information for each playlist
      this._fetchScheduleInfo();
    }
  }

  async _fetchScheduleInfo() {
    this._loading = true;
    const newSchedules = {};

    // Fetch schedule info for each playlist
    for (const playlist of this._playlists) {
      try {
        const response = await this._hass.callService(
          'xschedule',
          'get_playlist_schedules',
          {
            entity_id: this.config.entity,
            playlist: playlist,
          },
          { return_response: true }
        );

        if (response && response.schedules && response.schedules.length > 0) {
          const schedule = response.schedules[0]; // Use first schedule

          // Calculate total duration from playlist steps
          const stepsResponse = await this._hass.callService(
            'xschedule',
            'get_playlist_steps',
            {
              entity_id: this.config.entity,
              playlist: playlist,
            },
            { return_response: true }
          );

          let totalDuration = 0;
          if (stepsResponse && stepsResponse.steps) {
            totalDuration = stepsResponse.steps.reduce(
              (sum, step) => sum + (step.duration || 0),
              0
            );
          }

          newSchedules[playlist] = {
            nextActiveTime: schedule.nextactivetime,
            enabled: schedule.enabled,
            active: schedule.active,
            duration: totalDuration,
          };
        }
      } catch (err) {
        console.error(`Failed to fetch schedule for ${playlist}:`, err);
      }
    }

    this._playlistSchedules = newSchedules;
    this._loading = false;
    this.requestUpdate();
  }

  render() {
    if (!this._entity) {
      return html`
        <ha-card>
          <div class="card-content error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Entity ${this.config.entity} not found</p>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon="mdi:playlist-music"></ha-icon>
            xSchedule Playlists
          </h1>
          ${this._renderSortSelector()}
        </div>

        <div class="card-content ${this.config.compact_mode ? 'compact' : ''}">
          ${this._loading
            ? html`
                <div class="loading">
                  <ha-circular-progress active></ha-circular-progress>
                  <p>Loading playlists...</p>
                </div>
              `
            : this._renderPlaylists()}
        </div>
      </ha-card>
    `;
  }

  _renderSortSelector() {
    return html`
      <select
        class="sort-select"
        .value=${this.config.sort_by}
        @change=${this._handleSortChange}
      >
        <option value="schedule">By Schedule</option>
        <option value="alphabetical">Alphabetical</option>
      </select>
    `;
  }

  _renderPlaylists() {
    if (this._playlists.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:playlist-music-outline"></ha-icon>
          <p>No playlists found</p>
        </div>
      `;
    }

    const sortedPlaylists = this._getSortedPlaylists();
    const currentPlaylist = this._entity.attributes.playlist;

    return html`
      <div class="playlist-list">
        ${sortedPlaylists.map((playlist) =>
          this._renderPlaylistItem(playlist, playlist === currentPlaylist)
        )}
      </div>
    `;
  }

  _renderPlaylistItem(playlistName, isPlaying) {
    const scheduleInfo = this._playlistSchedules[playlistName];
    const hasSchedule = scheduleInfo && scheduleInfo.nextActiveTime;

    return html`
      <div
        class="playlist-item ${isPlaying ? 'playing' : ''} ${this.config.compact_mode ? 'compact' : ''}"
        @click=${() => this._handlePlaylistClick(playlistName)}
      >
        <div class="playlist-main">
          <ha-icon
            icon=${isPlaying ? 'mdi:play-circle' : hasSchedule ? 'mdi:clock-outline' : 'mdi:playlist-music'}
            class="playlist-icon"
          ></ha-icon>

          <div class="playlist-info">
            <div class="playlist-name">${playlistName}</div>

            ${this.config.show_duration && scheduleInfo?.duration
              ? html`<div class="playlist-duration">Duration: ${this._formatDuration(scheduleInfo.duration)}</div>`
              : ''}
          </div>

          ${this.config.show_status ? this._renderStatus(isPlaying, scheduleInfo) : ''}
        </div>
      </div>
    `;
  }

  _renderStatus(isPlaying, scheduleInfo) {
    if (isPlaying) {
      return html`
        <div class="status-badge playing">
          <ha-icon icon="mdi:play"></ha-icon>
          Playing
        </div>
      `;
    }

    if (scheduleInfo && scheduleInfo.nextActiveTime) {
      const timeStr = this._formatScheduleTime(scheduleInfo.nextActiveTime);
      return html`
        <div class="status-badge scheduled">
          <ha-icon icon="mdi:clock"></ha-icon>
          ${timeStr}
        </div>
      `;
    }

    return '';
  }

  _getSortedPlaylists() {
    const playlists = [...this._playlists];
    const currentPlaylist = this._entity.attributes.playlist;

    if (this.config.sort_by === 'schedule') {
      // Sort by schedule: playing first, then by next active time, then alphabetically
      return playlists.sort((a, b) => {
        // Currently playing always first
        if (a === currentPlaylist) return -1;
        if (b === currentPlaylist) return 1;

        // Then by schedule time
        const scheduleA = this._playlistSchedules[a];
        const scheduleB = this._playlistSchedules[b];

        if (scheduleA?.nextActiveTime && scheduleB?.nextActiveTime) {
          return new Date(scheduleA.nextActiveTime) - new Date(scheduleB.nextActiveTime);
        }
        if (scheduleA?.nextActiveTime) return -1;
        if (scheduleB?.nextActiveTime) return 1;

        // Finally alphabetically
        return a.localeCompare(b);
      });
    }

    // Alphabetical sort (but playing first)
    return playlists.sort((a, b) => {
      if (a === currentPlaylist) return -1;
      if (b === currentPlaylist) return 1;
      return a.localeCompare(b);
    });
  }

  _formatScheduleTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();

    // Calculate days difference
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format time in 12-hour format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeFormatted = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Same day
    if (diffDays === 0) {
      return `Today ${timeFormatted}`;
    }

    // Tomorrow
    if (diffDays === 1) {
      return `Tomorrow ${timeFormatted}`;
    }

    // Within a week (show day name)
    if (diffDays <= 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[date.getDay()]} ${timeFormatted}`;
    }

    // Beyond a week (show month and day)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${timeFormatted}`;
  }

  _formatDuration(seconds) {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async _handlePlaylistClick(playlistName) {
    // Show confirmation if something is playing and confirm_play is enabled
    if (this.config.confirm_play && this._entity.state === 'playing') {
      if (!confirm(`Switch to ${playlistName}?`)) {
        return;
      }
    }

    // Play the playlist
    try {
      await this._hass.callService('media_player', 'select_source', {
        entity_id: this.config.entity,
        source: playlistName,
      });
    } catch (err) {
      console.error('Failed to play playlist:', err);
    }
  }

  _handleSortChange(e) {
    this.config = {
      ...this.config,
      sort_by: e.target.value,
    };
    this.requestUpdate();
  }

  getCardSize() {
    return this.config.compact_mode ? 4 : 6;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      ha-card {
        overflow: hidden;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.2em;
        font-weight: 600;
      }

      .sort-select {
        padding: 8px 12px;
        font-size: 0.9em;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .card-content {
        padding: 12px;
      }

      .card-content.compact {
        padding: 8px;
      }

      .error,
      .loading,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        text-align: center;
      }

      .error {
        color: var(--error-color);
      }

      .error ha-icon,
      .loading ha-icon,
      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.5;
      }

      .playlist-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playlist-item {
        background: var(--primary-background-color);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
      }

      .playlist-item:hover {
        background: var(--secondary-background-color);
        transform: translateX(4px);
      }

      .playlist-item.playing {
        background: var(--accent-color);
        color: white;
      }

      .playlist-item.playing:hover {
        background: var(--dark-primary-color, var(--accent-color));
      }

      .playlist-main {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
      }

      .playlist-item.compact .playlist-main {
        padding: 10px;
      }

      .playlist-icon {
        --mdc-icon-size: 32px;
        flex-shrink: 0;
      }

      .playlist-item.compact .playlist-icon {
        --mdc-icon-size: 24px;
      }

      .playlist-info {
        flex: 1;
        min-width: 0;
      }

      .playlist-name {
        font-size: 1.1em;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playlist-item.compact .playlist-name {
        font-size: 1em;
      }

      .playlist-duration {
        font-size: 0.85em;
        opacity: 0.8;
        margin-top: 2px;
      }

      .status-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 0.85em;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .playlist-item.compact .status-badge {
        padding: 4px 8px;
        font-size: 0.75em;
      }

      .status-badge ha-icon {
        --mdc-icon-size: 16px;
      }

      .status-badge.playing {
        background: var(--light-primary-color, rgba(255, 255, 255, 0.3));
      }

      .playlist-item.playing .status-badge.playing {
        background: rgba(255, 255, 255, 0.2);
      }

      .status-badge.scheduled {
        background: var(--info-color, #2196f3);
        color: white;
      }

      @media (max-width: 768px) {
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .sort-select {
          width: 100%;
        }

        .status-badge {
          font-size: 0.75em;
          padding: 4px 8px;
        }
      }
    `;
  }
}

customElements.define('xschedule-playlist-browser', XSchedulePlaylistBrowser);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-playlist-browser',
  name: 'xSchedule Playlist Browser',
  description: 'Browse and select xSchedule playlists with schedule information',
  preview: true,
});
