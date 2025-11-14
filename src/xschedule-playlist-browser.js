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
      _expandedPlaylist: { type: String },
      _playlistSongs: { type: Object },
    };
  }

  constructor() {
    super();
    this._playlists = [];
    this._playlistSchedules = {};
    this._loading = false;
    this._expandedPlaylist = null; // Track which playlist is expanded
    this._playlistSongs = {}; // Cache of songs for each playlist
    this._updateInterval = null; // Timer for time display updates only
    this._initialLoad = true; // Track if this is the first load

    // Track previous values for render optimization
    this._previousState = null;
    this._previousPlaylists = null;
    this._previousSchedules = null;
    this._previousExpandedPlaylist = null;
    this._previousPlaylistSongs = null;
    this._previousTimeUpdate = null;
    this._lastTimeUpdate = Date.now();
  }

  connectedCallback() {
    super.connectedCallback();
    // Update every 5 minutes to refresh relative time displays
    this._updateInterval = setInterval(() => {
      this._lastTimeUpdate = Date.now();
      this.requestUpdate();
    }, 300000); // 5 minutes

    // Subscribe to cache invalidation events when hass is available
    if (this._hass) {
      this._subscribeToCacheEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    // Unsubscribe from cache events
    this._unsubscribeCacheEvents();
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
    const oldHass = this._hass;
    this._hass = hass;

    // Subscribe to events if hass just became available
    if (!oldHass && hass) {
      this._subscribeToCacheEvents();
    }

    // Get entity
    const entityId = this.config.entity;
    this._entity = hass.states[entityId];

    if (this._entity) {
      // Always use current source_list from entity (no caching)
      const newSourceList = this._entity.attributes.source_list || [];

      // If playlists changed, update and fetch schedule info
      if (JSON.stringify(this._playlists) !== JSON.stringify(newSourceList)) {
        this._playlists = newSourceList;
        if (newSourceList.length > 0) {
          // On initial load: show cached data, then force refresh
          // On subsequent updates: just use cache normally
          const forceRefresh = this._initialLoad;
          if (this._initialLoad) {
            this._initialLoad = false;
          }
          this._fetchScheduleInfo(forceRefresh);
        }
      }
    }

    // Note: Don't call requestUpdate() here - let _fetchScheduleInfo() trigger it when data is ready
  }

  shouldUpdate(changedProperties) {
    // If entity exists, check if meaningful data changed
    if (this._entity) {
      // Check if this is the first time we have entity data
      const isFirstRender = this._previousState === null;

      const stateChanged = this._entity.state !== this._previousState;
      const playlistsChanged = JSON.stringify(this._entity.attributes.source_list) !== this._previousPlaylists;
      const schedulesChanged = JSON.stringify(this._playlistSchedules) !== this._previousSchedules;
      const expandedChanged = this._expandedPlaylist !== this._previousExpandedPlaylist;
      const songsChanged = JSON.stringify(this._playlistSongs) !== this._previousPlaylistSongs;
      const timeElapsed = this._lastTimeUpdate !== this._previousTimeUpdate;

      // Update tracking variables
      this._previousState = this._entity.state;
      this._previousPlaylists = JSON.stringify(this._entity.attributes.source_list);
      this._previousSchedules = JSON.stringify(this._playlistSchedules);
      this._previousExpandedPlaylist = this._expandedPlaylist;
      this._previousPlaylistSongs = JSON.stringify(this._playlistSongs);
      this._previousTimeUpdate = this._lastTimeUpdate;

      // Allow first render, or only if something meaningful changed
      return isFirstRender || stateChanged || playlistsChanged || schedulesChanged ||
             expandedChanged || songsChanged || timeElapsed;
    }

    return super.shouldUpdate(changedProperties);
  }

  // Feature detection helpers
  _isXSchedulePlayer() {
    if (!this._entity) return false;
    // Detect xSchedule player by checking for xSchedule-specific attributes
    return (
      this._entity.attributes.integration === 'xschedule' ||
      this._entity.attributes.playlist_songs !== undefined ||
      this._entity.attributes.queue !== undefined
    );
  }

  async _fetchScheduleInfo(forceRefresh = false) {
    // Don't fetch if already in progress
    if (this._loading) return;

    this._loading = true;

    try {
      const newSchedules = {};

      // Fetch playlist metadata (including durations) once for all playlists
      let playlistsMetadata = {};
      try {
        const metadataResponse = await this._hass.callWS({
          type: 'call_service',
          domain: 'xschedule',
          service: 'get_playlists_with_metadata',
          service_data: {
            entity_id: this.config.entity,
            force_refresh: forceRefresh,
          },
          return_response: true,
        });

        if (metadataResponse && metadataResponse.response && metadataResponse.response.playlists) {
          // Convert array to map by playlist name
          playlistsMetadata = metadataResponse.response.playlists.reduce((acc, playlist) => {
            acc[playlist.name] = playlist;
            return acc;
          }, {});
        }
      } catch (err) {
        console.error('Failed to fetch playlists metadata:', err);
      }

      // Fetch schedule info for each playlist
      for (const playlist of this._playlists) {
        try {
          const response = await this._hass.callWS({
            type: 'call_service',
            domain: 'xschedule',
            service: 'get_playlist_schedules',
            service_data: {
              entity_id: this.config.entity,
              playlist: playlist,
              force_refresh: forceRefresh,
            },
            return_response: true,
          });


          if (response && response.response && response.response.schedules && response.response.schedules.length > 0) {
            const schedules = response.response.schedules;

            // Find the best schedule to display:
            // 1. Currently active schedule (active: "TRUE" or nextactive: "NOW!")
            // 2. Soonest upcoming schedule (earliest valid date)
            let schedule = null;

            // First, look for active schedule
            const activeSchedule = schedules.find(s => s.active === "TRUE" || s.nextactive === "NOW!");
            if (activeSchedule) {
              schedule = activeSchedule;
            } else {
              // Find soonest upcoming schedule (skip "A long time from now" and invalid dates)
              const upcomingSchedules = schedules
                .filter(s => {
                  const na = s.nextactive;
                  return na && na !== "A long time from now" && na !== "N/A" && na.match(/\d{4}-\d{2}-\d{2}/);
                })
                .sort((a, b) => {
                  // Sort by nextactive date (earliest first)
                  return new Date(a.nextactive) - new Date(b.nextactive);
                });

              schedule = upcomingSchedules.length > 0 ? upcomingSchedules[0] : schedules[0];
              if (schedule) {
              }
            }

            if (!schedule) {
              continue; // Skip this playlist
            }

            // Get duration from metadata (lengthms field is milliseconds, convert to seconds)
            let totalDuration = 0;
            if (playlistsMetadata[playlist] && playlistsMetadata[playlist].lengthms) {
              totalDuration = parseInt(playlistsMetadata[playlist].lengthms) / 1000;
            }

            newSchedules[playlist] = {
              nextActiveTime: schedule.nextactive,  // Fixed: field is "nextactive" not "nextactivetime"
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
      // Force shouldUpdate to detect this change by clearing previous state
      this._previousSchedules = null;
    } finally {
      // Always reset loading state, even if there's an unexpected error
      this._loading = false;
      this.requestUpdate();
    }
  }

  _subscribeToCacheEvents() {
    if (!this._hass || this._cacheEventUnsub) return;

    // Subscribe to xSchedule cache invalidation events
    this._cacheEventUnsub = this._hass.connection.subscribeEvents(
      (event) => {
        // Only refetch if this is our entity
        if (event.data.entity_id === this.config.entity) {
          console.debug('Backend cache invalidated, refetching schedule info');
          this._fetchScheduleInfo(true); // Force refresh to get fresh data
        }
      },
      'xschedule_cache_invalidated'
    );
  }

  _unsubscribeCacheEvents() {
    if (this._cacheEventUnsub) {
      this._cacheEventUnsub.then(unsub => unsub());
      this._cacheEventUnsub = null;
    }
  }

  render() {
    if (!this.config) {
      return html``;
    }

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
            ${this._loading && this._playlists.length > 0
              ? html`<ha-circular-progress active style="--md-circular-progress-size: 16px; margin-left: 8px;"></ha-circular-progress>`
              : ''}
          </h1>
        </div>

        <div class="card-content ${this.config.compact_mode ? 'compact' : ''}">
          ${this._loading && this._playlists.length === 0
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
    const isExpanded = this._expandedPlaylist === playlistName;

    return html`
      <div class="playlist-item ${isPlaying ? 'playing' : ''} ${this.config.compact_mode ? 'compact' : ''} ${isExpanded ? 'expanded' : ''}">
        <div class="playlist-header" @click=${() => this._togglePlaylist(playlistName)}>
          <ha-icon
            icon=${isPlaying ? 'mdi:play-circle' : hasSchedule ? 'mdi:clock-outline' : 'mdi:playlist-music'}
            class="playlist-icon"
          ></ha-icon>
          <div class="playlist-name">${playlistName}</div>
          ${this._renderScheduleInfo(isPlaying, scheduleInfo)}
          <button
            class="play-btn"
            @click=${(e) => this._playPlaylist(e, playlistName)}
            title="Play playlist"
          >
            <ha-icon icon="mdi:play-outline"></ha-icon>
          </button>
          <ha-icon
            icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            class="expand-icon"
          ></ha-icon>
        </div>

        ${isExpanded ? this._renderSongList(playlistName) : ''}
      </div>
    `;
  }

  _renderScheduleInfo(isPlaying, scheduleInfo) {
    const parts = [];

    // Always show playing status first
    // Check both isPlaying (current playlist) AND nextActiveTime === "NOW!" (schedule is active)
    if (isPlaying || (scheduleInfo && scheduleInfo.nextActiveTime === "NOW!")) {
      parts.push(html`<span class="schedule-info playing-status">[Playing]</span>`);
    }

    // Show duration first (if enabled and available)
    if (this.config.show_duration && scheduleInfo && scheduleInfo.duration > 0) {
      const durationStr = this._formatDuration(scheduleInfo.duration);
      parts.push(html`<span class="schedule-info duration">[${durationStr}]</span>`);
    }

    // Show schedule time second (if not playing)
    if (!isPlaying && scheduleInfo && scheduleInfo.nextActiveTime && scheduleInfo.nextActiveTime !== "NOW!") {
      // Skip special values that aren't parseable dates
      if (scheduleInfo.nextActiveTime !== "A long time from now" && scheduleInfo.nextActiveTime !== "N/A") {
        const timeStr = this._formatScheduleTime(scheduleInfo.nextActiveTime);
        parts.push(html`<span class="schedule-info schedule-time">[${timeStr}]</span>`);
      }
    }

    return parts;
  }

  _getSortedPlaylists() {
    const playlists = [...this._playlists];
    const currentPlaylist = this._entity.attributes.playlist;

    if (this.config.sort_by === 'schedule') {
      // Sort by schedule:
      // 1. Currently playing playlist (from media player state)
      // 2. Active schedules (nextActiveTime === "NOW!")
      // 3. Upcoming schedules (by time)
      // 4. No schedules (alphabetically)
      return playlists.sort((a, b) => {
        // Currently playing always first
        if (a === currentPlaylist) return -1;
        if (b === currentPlaylist) return 1;

        const scheduleA = this._playlistSchedules[a];
        const scheduleB = this._playlistSchedules[b];

        const isActiveA = scheduleA?.nextActiveTime === "NOW!";
        const isActiveB = scheduleB?.nextActiveTime === "NOW!";

        // Active schedules (NOW!) come next
        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        // Both active or both not active - sort by schedule time
        if (scheduleA?.nextActiveTime && scheduleB?.nextActiveTime) {
          // Skip unparseable values
          const parseableA = scheduleA.nextActiveTime !== "A long time from now" &&
                            scheduleA.nextActiveTime !== "N/A" &&
                            scheduleA.nextActiveTime !== "NOW!";
          const parseableB = scheduleB.nextActiveTime !== "A long time from now" &&
                            scheduleB.nextActiveTime !== "N/A" &&
                            scheduleB.nextActiveTime !== "NOW!";

          if (parseableA && parseableB) {
            return new Date(scheduleA.nextActiveTime) - new Date(scheduleB.nextActiveTime);
          }
          if (parseableA) return -1;
          if (parseableB) return 1;
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

    // Format time in 12-hour format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeFormatted = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Normalize dates to midnight for accurate day comparison
    const dateDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((dateDate - nowDate) / (1000 * 60 * 60 * 24));

    // Same day
    if (diffDays === 0) {
      return `Today ${timeFormatted}`;
    }

    // Tomorrow
    if (diffDays === 1) {
      return `Tomorrow ${timeFormatted}`;
    }

    // Yesterday (in case of past schedules)
    if (diffDays === -1) {
      return `Yesterday ${timeFormatted}`;
    }

    // Within a week (show day name)
    if (diffDays > 0 && diffDays <= 7) {
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


  async _togglePlaylist(playlistName) {
    if (this._expandedPlaylist === playlistName) {
      // Collapse if already expanded
      this._expandedPlaylist = null;
    } else {
      // Expand and fetch songs if not cached
      this._expandedPlaylist = playlistName;

      if (!this._playlistSongs[playlistName]) {
        await this._fetchPlaylistSongs(playlistName);
      }
    }
    this.requestUpdate();
  }

  async _fetchPlaylistSongs(playlistName, forceRefresh = false) {
    try {
      const response = await this._hass.callWS({
        type: 'call_service',
        domain: 'xschedule',
        service: 'get_playlist_steps',
        service_data: {
          entity_id: this.config.entity,
          playlist: playlistName,
          force_refresh: forceRefresh,
        },
        return_response: true,
      });

      if (response && response.response && response.response.steps) {
        this._playlistSongs[playlistName] = response.response.steps;
        this.requestUpdate();
      }
    } catch (err) {
      console.error(`Failed to fetch songs for ${playlistName}:`, err);
      this._playlistSongs[playlistName] = [];
    }
  }

  _renderSongList(playlistName) {
    const songs = this._playlistSongs[playlistName];

    if (!songs) {
      return html`
        <div class="song-list loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
        </div>
      `;
    }

    if (songs.length === 0) {
      return html`
        <div class="song-list empty">
          <p>No songs in this playlist</p>
        </div>
      `;
    }

    return html`
      <div class="song-list">
        ${songs.map((song) => html`
          <div class="song-item-compact">
            <span class="song-name-compact">${song.name}</span>
            ${song.duration ? html`<span class="song-duration-compact">${this._formatDuration(song.duration / 1000)}</span>` : ''}
          </div>
        `)}
      </div>
    `;
  }

  async _playPlaylist(e, playlistName) {
    e.stopPropagation(); // Prevent playlist toggle

    // Check if confirmation is required
    if (this.config.confirm_play) {
      const confirmed = confirm(`Play playlist "${playlistName}"?`);
      if (!confirmed) {
        return;
      }
    }

    try {
      // Use standard media_player.play_media command
      await this._hass.callService('media_player', 'play_media', {
        entity_id: this.config.entity,
        media_content_type: 'playlist',
        media_content_id: playlistName,
      });
    } catch (err) {
      console.error('Failed to play playlist:', err);
    }
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
        padding: 12px;
        transition: background 0.2s;
      }

      .playlist-item.compact {
        padding: 8px;
      }

      .playlist-item.playing {
        border-left: 4px solid var(--accent-color);
        font-weight: 600;
      }

      .playlist-header {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .playlist-icon {
        --mdc-icon-size: 24px;
        flex-shrink: 0;
      }

      .playlist-name {
        flex: 1;
        font-size: 1em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .expand-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
        opacity: 0.7;
        transition: transform 0.2s;
      }

      .play-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .play-btn:hover {
        background: var(--dark-primary-color);
      }

      .play-btn ha-icon {
        --mdc-icon-size: 24px;
      }

      .schedule-info {
        font-size: 0.85em;
        margin-left: 8px;
        white-space: nowrap;
      }

      .schedule-info.playing-status {
        color: var(--accent-color);
        font-weight: 600;
      }

      .schedule-info.schedule-time {
        color: var(--secondary-text-color);
      }

      .schedule-info.duration {
        color: var(--secondary-text-color);
        opacity: 0.85;
      }

      .song-list {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .song-list.loading,
      .song-list.empty {
        padding: 12px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .song-item-compact {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: var(--card-background-color);
        border-radius: 4px;
        transition: background 0.2s;
      }

      .song-item-compact:hover {
        background: var(--secondary-background-color);
      }

      .song-name-compact {
        flex: 1;
        font-size: 0.9em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .song-duration-compact {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-left: auto;
        margin-right: 8px;
        white-space: nowrap;
      }


      /* Removed special styling for songs in playing playlist - songs use normal colors */

      @media (max-width: 768px) {
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .schedule-info {
          font-size: 0.75em;
        }

        .playlist-name {
          font-size: 0.95em;
        }
      }
    `;
  }
}

// Configuration Editor
class XSchedulePlaylistBrowserEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = config;
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (this.config[target.configValue] === value) {
      return;
    }

    const newConfig = {
      ...this.config,
      [target.configValue]: value,
    };

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    // Get all media_player entities (not just xSchedule)
    const entities = Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith('media_player.'))
      .sort((a, b) => {
        // Sort xSchedule players to the top for convenience
        const aIsXSchedule = a.includes('xschedule') || 
                            this.hass.states[a].attributes.playlist_songs !== undefined;
        const bIsXSchedule = b.includes('xschedule') || 
                            this.hass.states[b].attributes.playlist_songs !== undefined;
        if (aIsXSchedule && !bIsXSchedule) return -1;
        if (!aIsXSchedule && bIsXSchedule) return 1;
        // Otherwise sort alphabetically
        const aName = this.hass.states[a].attributes.friendly_name || a;
        const bName = this.hass.states[b].attributes.friendly_name || b;
        return aName.localeCompare(bName);
      });

    return html`
      <div class="card-config">
        <div class="form-group">
          <label for="entity">Entity (Required)</label>
          <select
            id="entity"
            .configValue=${'entity'}
            .value=${this.config.entity || ''}
            @change=${this._valueChanged}
          >
            <option value="">Select a media player...</option>
            ${entities.map(entityId => html`
              <option value="${entityId}" ?selected=${this.config.entity === entityId}>
                ${this.hass.states[entityId].attributes.friendly_name || entityId}
              </option>
            `)}
          </select>
        </div>

        <div class="form-group">
          <label for="sort_by">Sort By</label>
          <select
            id="sort_by"
            .configValue=${'sort_by'}
            .value=${this.config.sort_by || 'schedule'}
            @change=${this._valueChanged}
          >
            <option value="schedule">Schedule (Next to Play)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'show_duration'}
              .checked=${this.config.show_duration !== false}
              @change=${this._valueChanged}
            />
            Show Duration
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'show_status'}
              .checked=${this.config.show_status !== false}
              @change=${this._valueChanged}
            />
            Show Status Badges
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'compact_mode'}
              .checked=${this.config.compact_mode || false}
              @change=${this._valueChanged}
            />
            Compact Mode
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'confirm_play'}
              .checked=${this.config.confirm_play !== false}
              @change=${this._valueChanged}
            />
            Confirm Before Playing
          </label>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        padding: 16px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .form-group select,
      .form-group input[type="text"] {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .form-group label input[type="checkbox"] {
        margin-right: 8px;
      }
    `;
  }
}

customElements.define('xschedule-playlist-browser-editor', XSchedulePlaylistBrowserEditor);
customElements.define('xschedule-playlist-browser', XSchedulePlaylistBrowser);

// Log card info to console
console.info(
  '%c  XSCHEDULE-PLAYLIST-BROWSER  \n%c  Version 1.5.3-pre1  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Register editor
XSchedulePlaylistBrowser.getConfigElement = function() {
  return document.createElement('xschedule-playlist-browser-editor');
};

// Provide stub config for card picker
XSchedulePlaylistBrowser.getStubConfig = function() {
  return {
    entity: '',
    sort_by: 'schedule',
    show_duration: true,
    show_status: true,
    compact_mode: false,
    confirm_play: true,
  };
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-playlist-browser',
  name: 'xSchedule Playlist Browser',
  description: 'Browse and select xSchedule playlists with schedule information',
  preview: true,
});
