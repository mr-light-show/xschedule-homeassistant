/**
 * xSchedule Media Player Card for Home Assistant
 *
 * A custom Lovelace card for controlling xSchedule lighting sequencer
 */

import { LitElement, html, css } from 'lit';

// Mode configurations with default settings
const MODE_PRESETS = {
  simple: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
  },
  dj: {
    playlistDisplay: 'expanded',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
  },
  jukebox: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
  },
  minimal: {
    playlistDisplay: 'hidden',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
  },
  custom: {
    // Custom mode uses user-provided settings
  },
};

class XScheduleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _entity: { type: Object },
      _playlists: { type: Array },
      _songs: { type: Array },
      _queue: { type: Array },
      _songsExpanded: { type: Boolean },
      _queueExpanded: { type: Boolean },
      _toast: { type: Object },
      _contextMenu: { type: Object },
    };
  }

  constructor() {
    super();
    this._playlists = [];
    this._songs = [];
    this._queue = [];
    this._songsExpanded = false;
    this._queueExpanded = false;
    this._toast = null;
    this._contextMenu = null;
    this._longPressTimer = null;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    const mode = config.mode || 'simple';
    const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;

    // Merge mode preset with custom config
    this.config = {
      entity: config.entity,
      mode,
      ...modePreset,
      ...config, // User config overrides preset
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

      // Extract songs from current playlist
      this._songs = this._entity.attributes.playlist_songs || [];

      // Extract queue
      this._queue = this._entity.attributes.queue || [];
    }
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

    const isPlaying = this._entity.state === 'playing';
    const isPaused = this._entity.state === 'paused';
    const isIdle = this._entity.state === 'idle';

    return html`
      <ha-card>
        <div class="card-content">
          ${this._renderNowPlaying()}
          ${this._renderProgressBar()}
          ${this._renderPlaybackControls()}
          ${this.config.showVolumeControl ? this._renderVolumeControl() : ''}
          ${this._renderPlaylistSelector()}
          ${this._renderQueue()}
          ${this._renderSongs()}
        </div>
        ${this._toast ? this._renderToast() : ''}
        ${this._contextMenu ? this._renderContextMenu() : ''}
      </ha-card>
    `;
  }

  _renderNowPlaying() {
    const playlist = this._entity.attributes.playlist || 'No playlist';
    const song = this._entity.attributes.song || 'No song';

    return html`
      <div class="now-playing">
        <div class="playlist-name">${playlist}</div>
        <div class="song-name">${song}</div>
      </div>
    `;
  }

  _renderProgressBar() {
    if (!this.config.showProgressBar) return '';

    const position = this._entity.attributes.media_position || 0;
    const duration = this._entity.attributes.media_duration || 0;
    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return html`
      <div class="progress-container">
        <div class="progress-bar" @click=${this._handleSeek}>
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="time-display">
          <span>${this._formatTime(position)}</span>
          <span>${this._formatTime(duration)}</span>
        </div>
      </div>
    `;
  }

  _renderPlaybackControls() {
    if (!this.config.showPlaybackControls) return '';

    const isPlaying = this._entity.state === 'playing';
    const isPaused = this._entity.state === 'paused';

    return html`
      <div class="playback-controls">
        <ha-icon-button
          @click=${this._handlePrevious}
          title="Previous"
        >
          <ha-icon icon="mdi:skip-previous"></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${isPlaying ? this._handlePause : this._handlePlay}
          class="play-pause"
          title=${isPlaying ? 'Pause' : 'Play'}
        >
          <ha-icon icon=${isPlaying ? 'mdi:pause' : 'mdi:play'}></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${this._handleStop}
          title="Stop"
        >
          <ha-icon icon="mdi:stop"></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${this._handleNext}
          title="Next"
        >
          <ha-icon icon="mdi:skip-next"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  _renderVolumeControl() {
    const volumeLevel = this._entity.attributes.volume_level || 0;
    const isMuted = this._entity.attributes.is_volume_muted || false;

    return html`
      <div class="volume-control">
        <ha-icon-button
          @click=${this._handleMuteToggle}
          title=${isMuted ? 'Unmute' : 'Mute'}
        >
          <ha-icon icon=${isMuted ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon>
        </ha-icon-button>
        <input
          type="range"
          min="0"
          max="100"
          .value=${volumeLevel * 100}
          @input=${this._handleVolumeChange}
          class="volume-slider"
        />
      </div>
    `;
  }

  _renderPlaylistSelector() {
    const displayMode = this.config.playlistDisplay;
    if (displayMode === 'hidden') return '';

    const currentPlaylist = this._entity.attributes.playlist;

    if (displayMode === 'collapsed') {
      return html`
        <div class="section playlist-section">
          <select
            @change=${this._handlePlaylistChange}
            .value=${currentPlaylist || ''}
            class="playlist-select"
          >
            <option value="">Select playlist...</option>
            ${this._playlists.map(
              (playlist) => html`
                <option value=${playlist} ?selected=${playlist === currentPlaylist}>
                  ${playlist}
                </option>
              `
            )}
          </select>
        </div>
      `;
    }

    // Expanded mode
    return html`
      <div class="section playlist-section">
        <h3>
          <ha-icon icon="mdi:playlist-music"></ha-icon>
          Playlists
        </h3>
        <div class="playlist-list">
          ${this._playlists.map(
            (playlist) => html`
              <div
                class="playlist-item ${playlist === currentPlaylist ? 'active' : ''}"
                @click=${() => this._selectPlaylist(playlist)}
              >
                <ha-icon icon=${playlist === currentPlaylist ? 'mdi:play-circle' : 'mdi:playlist-music'}></ha-icon>
                <span>${playlist}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  _renderQueue() {
    const displayMode = this.config.queueDisplay;

    // Auto mode: hidden if empty, expanded if has items
    if (displayMode === 'auto' && this._queue.length === 0) {
      return '';
    }
    if (displayMode === 'hidden') {
      return '';
    }

    const isCollapsed = displayMode === 'collapsed' && !this._queueExpanded;
    const queueCount = this._queue.length;

    return html`
      <div class="section queue-section">
        <div class="section-header" @click=${this._toggleQueue}>
          <h3>
            <ha-icon icon="mdi:format-list-numbered"></ha-icon>
            Queue
            ${queueCount > 0 ? html`<span class="badge">${queueCount}</span>` : ''}
          </h3>
          ${displayMode === 'collapsed'
            ? html`<ha-icon icon=${this._queueExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>`
            : ''}
        </div>

        ${!isCollapsed && queueCount > 0
          ? html`
              <div class="queue-list">
                ${this._queue.map(
                  (item, index) => html`
                    <div class="queue-item">
                      <span class="queue-number">${index + 1}</span>
                      <div class="queue-info">
                        <span class="queue-name">${item.name}</span>
                        ${item.duration ? html`<span class="queue-duration">${this._formatTime(item.duration / 1000)}</span>` : ''}
                      </div>
                    </div>
                  `
                )}
              </div>
              <button class="clear-queue-btn" @click=${this._handleClearQueue}>
                <ha-icon icon="mdi:playlist-remove"></ha-icon>
                Clear Queue
              </button>
            `
          : ''}

        ${!isCollapsed && queueCount === 0
          ? html`
              <div class="empty-state">
                <ha-icon icon="mdi:playlist-plus"></ha-icon>
                <p>Queue is empty</p>
                <p class="hint">Tap "Add to Queue" on any song</p>
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderSongs() {
    const displayMode = this.config.songsDisplay;
    if (displayMode === 'hidden') return '';

    const isCollapsed = displayMode === 'collapsed' && !this._songsExpanded;
    const songCount = this._songs.length;
    const currentSong = this._entity.attributes.song;

    return html`
      <div class="section songs-section">
        <div class="section-header" @click=${this._toggleSongs}>
          <h3>
            <ha-icon icon="mdi:music"></ha-icon>
            Songs
            ${songCount > 0 ? html`<span class="badge">${songCount}</span>` : ''}
          </h3>
          ${displayMode === 'collapsed'
            ? html`<ha-icon icon=${this._songsExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>`
            : ''}
        </div>

        ${!isCollapsed
          ? html`
              <div class="song-list">
                ${this._songs.map(
                  (song) => html`
                    <div
                      class="song-item ${song.name === currentSong ? 'current' : ''}"
                      @touchstart=${(e) => this._handleLongPressStart(e, song.name)}
                      @touchend=${this._handleLongPressEnd}
                      @touchmove=${this._handleLongPressEnd}
                      @mousedown=${(e) => this._handleLongPressStart(e, song.name)}
                      @mouseup=${this._handleLongPressEnd}
                      @mouseleave=${this._handleLongPressEnd}
                    >
                      <div class="song-info">
                        ${song.name === currentSong ? html`<ha-icon icon="mdi:music" class="current-icon"></ha-icon>` : ''}
                        <span class="song-name">${song.name}</span>
                        ${song.duration ? html`<span class="song-duration">${this._formatTime(song.duration / 1000)}</span>` : ''}
                      </div>
                      ${this.config.showSongActions !== false
                        ? html`
                            <div class="song-actions">
                              <button
                                @click=${() => this._playSong(song.name)}
                                class="action-btn"
                                title="Play Now"
                              >
                                <ha-icon icon="mdi:play"></ha-icon>
                                <span>Play Now</span>
                              </button>
                              <button
                                @click=${() => this._addToQueue(song.name)}
                                class="action-btn"
                                title="Add to Queue"
                              >
                                <ha-icon icon="mdi:playlist-plus"></ha-icon>
                                <span>Add to Queue</span>
                              </button>
                            </div>
                          `
                        : ''}
                    </div>
                  `
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderToast() {
    return html`
      <div class="toast ${this._toast.type}">
        <ha-icon icon=${this._toast.icon}></ha-icon>
        <span>${this._toast.message}</span>
      </div>
    `;
  }

  _renderContextMenu() {
    return html`
      <div class="context-menu-overlay" @click=${this._closeContextMenu}>
        <div
          class="context-menu"
          style="top: ${this._contextMenu.y}px; left: ${this._contextMenu.x}px"
          @click=${(e) => e.stopPropagation()}
        >
          <div class="context-menu-header">
            <ha-icon icon="mdi:music"></ha-icon>
            <span>${this._contextMenu.songName}</span>
          </div>
          <button
            class="context-menu-item"
            @click=${() => {
              this._playSong(this._contextMenu.songName);
              this._closeContextMenu();
            }}
          >
            <ha-icon icon="mdi:play"></ha-icon>
            <span>Play Now</span>
          </button>
          <button
            class="context-menu-item"
            @click=${() => {
              this._addToQueue(this._contextMenu.songName);
              this._closeContextMenu();
            }}
          >
            <ha-icon icon="mdi:playlist-plus"></ha-icon>
            <span>Add to Queue</span>
          </button>
          <button
            class="context-menu-item"
            @click=${() => {
              this._showSongInfo(this._contextMenu.songName);
              this._closeContextMenu();
            }}
          >
            <ha-icon icon="mdi:information"></ha-icon>
            <span>Song Info</span>
          </button>
        </div>
      </div>
    `;
  }

  // Event handlers

  _handlePlay() {
    this._callService('media_play');
  }

  _handlePause() {
    this._callService('media_pause');
  }

  _handleStop() {
    this._callService('media_stop');
  }

  _handleNext() {
    this._callService('media_next_track');
  }

  _handlePrevious() {
    this._callService('media_previous_track');
  }

  _handleSeek(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const duration = this._entity.attributes.media_duration || 0;
    const position = duration * percent;

    this._callService('media_seek', { seek_position: position });
  }

  _handleVolumeChange(e) {
    const volume = parseInt(e.target.value) / 100;
    this._callService('volume_set', { volume_level: volume });
  }

  _handleMuteToggle() {
    const isMuted = this._entity.attributes.is_volume_muted || false;
    this._callService('volume_mute', { is_volume_muted: !isMuted });
  }

  _handlePlaylistChange(e) {
    const playlist = e.target.value;
    if (playlist) {
      this._selectPlaylist(playlist);
    }
  }

  _selectPlaylist(playlist) {
    this._callService('select_source', { source: playlist });
    this._showToast('success', 'mdi:check-circle', `Playing: ${playlist}`);
  }

  async _playSong(songName) {
    const playlist = this._entity.attributes.playlist;
    if (!playlist) {
      this._showToast('error', 'mdi:alert-circle', 'No playlist selected');
      return;
    }

    // Confirm if something is playing
    if (this._entity.state === 'playing') {
      if (!confirm('Replace current song?')) {
        return;
      }
    }

    try {
      await this._hass.callService('xschedule', 'play_song', {
        entity_id: this.config.entity,
        playlist,
        song: songName,
      });
      this._showToast('success', 'mdi:play-circle', `Now playing: ${songName}`);
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to play song');
    }
  }

  async _addToQueue(songName) {
    const playlist = this._entity.attributes.playlist;
    if (!playlist) {
      this._showToast('error', 'mdi:alert-circle', 'No playlist selected');
      return;
    }

    // Check if already in queue
    if (this._queue.some((item) => item.name === songName)) {
      this._showToast('info', 'mdi:information', 'Already in queue');
      return;
    }

    try {
      await this._hass.callService('xschedule', 'add_to_queue', {
        entity_id: this.config.entity,
        playlist,
        song: songName,
      });
      this._showToast('success', 'mdi:check-circle', 'Added to queue');
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to add to queue');
    }
  }

  async _handleClearQueue() {
    if (!confirm('Clear entire queue?')) {
      return;
    }

    try {
      await this._hass.callService('xschedule', 'clear_queue', {
        entity_id: this.config.entity,
      });
      this._showToast('success', 'mdi:check-circle', 'Queue cleared');
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to clear queue');
    }
  }

  _toggleSongs() {
    if (this.config.songsDisplay === 'collapsed') {
      this._songsExpanded = !this._songsExpanded;
      this.requestUpdate();
    }
  }

  _toggleQueue() {
    if (this.config.queueDisplay === 'collapsed') {
      this._queueExpanded = !this._queueExpanded;
      this.requestUpdate();
    }
  }

  _handleLongPressStart(e, songName) {
    // Clear any existing timer
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
    }

    // Start long press timer (500ms)
    this._longPressTimer = setTimeout(() => {
      // Prevent default click behavior
      e.preventDefault();

      // Get touch/mouse position
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;

      // Show context menu
      this._contextMenu = {
        songName,
        x: Math.min(x, window.innerWidth - 220), // Keep menu on screen
        y: Math.min(y, window.innerHeight - 200),
      };
      this.requestUpdate();

      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }

  _handleLongPressEnd() {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  _closeContextMenu() {
    this._contextMenu = null;
    this.requestUpdate();
  }

  _showSongInfo(songName) {
    const song = this._songs.find((s) => s.name === songName);
    if (song) {
      const duration = song.duration ? this._formatTime(song.duration / 1000) : 'Unknown';
      this._showToast('info', 'mdi:information', `${songName} - Duration: ${duration}`);
    }
  }

  // Utility methods

  _callService(service, data = {}) {
    this._hass.callService('media_player', service, {
      entity_id: this.config.entity,
      ...data,
    });
  }

  _formatTime(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  _showToast(type, icon, message) {
    this._toast = { type, icon, message };
    this.requestUpdate();

    setTimeout(() => {
      this._toast = null;
      this.requestUpdate();
    }, 2000);
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--error-color);
      }

      .now-playing {
        text-align: center;
        margin-bottom: 8px;
      }

      .playlist-name {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .song-name {
        font-size: 1.3em;
        font-weight: 700;
        color: var(--primary-text-color);
        margin-top: 4px;
      }

      .progress-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .progress-bar {
        height: 6px;
        background: var(--disabled-text-color);
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: var(--accent-color);
        transition: width 0.3s ease;
      }

      .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }

      .playback-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
      }

      .playback-controls ha-icon-button {
        --mdc-icon-button-size: 48px;
        --mdc-icon-size: 32px;
      }

      .playback-controls .play-pause {
        --mdc-icon-button-size: 64px;
        --mdc-icon-size: 48px;
      }

      .volume-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .volume-slider {
        flex: 1;
        height: 6px;
      }

      .section {
        border-top: 1px solid var(--divider-color);
        padding-top: 12px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        margin-bottom: 8px;
      }

      .section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1em;
        font-weight: 600;
      }

      .badge {
        background: var(--accent-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 600;
      }

      .playlist-select {
        width: 100%;
        padding: 12px;
        font-size: 1em;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .playlist-list,
      .song-list,
      .queue-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playlist-item,
      .song-item,
      .queue-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: var(--primary-background-color);
        cursor: pointer;
        transition: background 0.2s;
      }

      .playlist-item:hover {
        background: var(--secondary-background-color);
      }

      .playlist-item.active {
        background: var(--accent-color);
        color: white;
      }

      .song-item {
        flex-direction: column;
        align-items: stretch;
        cursor: default;
      }

      .song-item.current {
        background: var(--accent-color);
        color: white;
      }

      .song-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .song-name {
        flex: 1;
      }

      .song-duration,
      .queue-duration {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }

      .song-actions {
        display: flex;
        gap: 8px;
      }

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9em;
        cursor: pointer;
        transition: background 0.2s;
      }

      .action-btn:hover {
        background: var(--dark-primary-color);
      }

      .queue-number {
        font-weight: 700;
        color: var(--accent-color);
      }

      .queue-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .clear-queue-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px;
        margin-top: 8px;
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9em;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .clear-queue-btn:hover {
        opacity: 0.8;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px;
        color: var(--secondary-text-color);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.5;
      }

      .empty-state .hint {
        font-size: 0.85em;
        opacity: 0.7;
      }

      .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: var(--primary-background-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideUp 0.3s ease;
      }

      .toast.success {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .toast.error {
        background: var(--error-color);
        color: white;
      }

      .toast.info {
        background: var(--info-color, #2196f3);
        color: white;
      }

      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100%);
        }
        to {
          transform: translateX(-50%) translateY(0);
        }
      }

      .context-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1001;
        animation: fadeIn 0.2s ease;
      }

      .context-menu {
        position: fixed;
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        padding: 8px;
        min-width: 200px;
        animation: scaleIn 0.2s ease;
        z-index: 1002;
      }

      .context-menu-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .context-menu-header ha-icon {
        --mdc-icon-size: 20px;
        color: var(--accent-color);
      }

      .context-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--primary-text-color);
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s;
      }

      .context-menu-item:hover {
        background: var(--secondary-background-color);
      }

      .context-menu-item ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .action-btn span {
          display: none;
        }

        .context-menu {
          min-width: 180px;
        }
      }
    `;
  }
}

customElements.define('xschedule-card', XScheduleCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-card',
  name: 'xSchedule Media Player',
  description: 'A custom card for controlling xSchedule lighting sequencer',
  preview: true,
});

// Register card editor
XScheduleCard.getConfigElement = async () => {
  await import('./xschedule-card-editor.js');
  return document.createElement('xschedule-card-editor');
};

// Stub for card picker
XScheduleCard.getStubConfig = () => ({
  entity: '',
  mode: 'simple',
});
