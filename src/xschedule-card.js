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
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  dj: {
    playlistDisplay: 'expanded',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  jukebox: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
  },
  minimal: {
    playlistDisplay: 'hidden',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
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
    this._progressInterval = null;
    this._lastPlaylist = null;
    this._lastPlaylistSongs = [];

    // Track previous values for render optimization
    this._previousState = null;
    this._previousTitle = null;
    this._previousPlaylist = null;
    this._previousPlaylists = null;
    this._previousSongs = null;
    this._previousQueue = null;
    this._previousMediaPositionUpdatedAt = null;
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

  connectedCallback() {
    super.connectedCallback();
    // Start progress bar update interval (every second)
    // Only update the progress bar DOM element directly, not the entire component
    this._progressInterval = setInterval(() => {
      if (this._entity?.state === 'playing') {
        this._updateProgressBar();
      }
    }, 1000);
  }

  _updateProgressBar() {
    // Update progress bar directly without triggering full re-render
    const progressFill = this.shadowRoot?.querySelector('.progress-fill');
    if (progressFill && this._entity) {
      const percentage = this._calculateProgress();
      progressFill.style.width = `${percentage}%`;
    }
  }

  _calculateProgress() {
    if (!this._entity?.attributes) return 0;

    const duration = this._entity.attributes.media_duration;
    const position = this._entity.attributes.media_position;
    const updatedAt = this._entity.attributes.media_position_updated_at;

    if (!duration || !position || !updatedAt) return 0;

    // Calculate current position based on when it was last updated
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const elapsed = (now - lastUpdate) / 1000;
    const currentPosition = position + elapsed;

    return Math.min(100, (currentPosition / duration) * 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up interval
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = null;
    }
  }

  set hass(hass) {
    this._hass = hass;

    // Get entity
    const entityId = this.config.entity;
    this._entity = hass.states[entityId];

    if (this._entity) {
      // Extract playlists from source_list and sort alphabetically
      this._playlists = (this._entity.attributes.source_list || []).sort((a, b) => a.localeCompare(b));

      const currentPlaylist = this._entity.attributes.playlist;
      const playlistSongs = this._entity.attributes.playlist_songs || [];
      const isIdle = this._entity.state === 'idle' ||
                     this._entity.state === 'off' ||
                     this._entity.state === 'unavailable' ||
                     this._entity.state === 'unknown';

      // Clear cached songs when player is idle and no current playlist
      // This ensures song list disappears when playback fully stops
      if (isIdle && !currentPlaylist) {
        this._lastPlaylistSongs = [];
      }
      // Remember the last playlist and its songs when not playing from queue
      else if (currentPlaylist && currentPlaylist !== 'Queue' && playlistSongs.length > 0) {
        this._lastPlaylist = currentPlaylist;
        this._lastPlaylistSongs = playlistSongs;
      }

      // Extract songs - use current playlist songs if available, otherwise use last known playlist songs
      this._songs = playlistSongs.length > 0 ? playlistSongs : this._lastPlaylistSongs;

      // Extract queue
      this._queue = this._entity.attributes.queue || [];
    }

    // Trigger update check
    this.requestUpdate();
  }

  shouldUpdate(changedProperties) {
    // If entity exists, check if meaningful data changed
    if (this._entity) {
      // Check if this is the first time we have entity data
      const isFirstRender = this._previousState === null;

      const stateChanged = this._entity.state !== this._previousState;
      const titleChanged = this._entity.attributes.media_title !== this._previousTitle;
      const playlistChanged = this._entity.attributes.playlist !== this._previousPlaylist;
      const playlistsChanged = JSON.stringify(this._entity.attributes.source_list) !== this._previousPlaylists;
      const songsChanged = JSON.stringify(this._entity.attributes.playlist_songs) !== this._previousSongs;
      const queueChanged = JSON.stringify(this._entity.attributes.queue) !== this._previousQueue;
      const mediaPositionUpdatedAtChanged = this._entity.attributes.media_position_updated_at !== this._previousMediaPositionUpdatedAt;

      // Update tracking variables
      this._previousState = this._entity.state;
      this._previousTitle = this._entity.attributes.media_title;
      this._previousPlaylist = this._entity.attributes.playlist;
      this._previousPlaylists = JSON.stringify(this._entity.attributes.source_list);
      this._previousSongs = JSON.stringify(this._entity.attributes.playlist_songs);
      this._previousQueue = JSON.stringify(this._entity.attributes.queue);
      this._previousMediaPositionUpdatedAt = this._entity.attributes.media_position_updated_at;

      // Allow first render, or only if something meaningful changed
      return isFirstRender || stateChanged || titleChanged || playlistChanged ||
             playlistsChanged || songsChanged || queueChanged || mediaPositionUpdatedAtChanged;
    }

    return super.shouldUpdate(changedProperties);
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

    const isPlaying = this._entity.state === 'playing';
    const isPaused = this._entity.state === 'paused';
    const isIdle = this._entity.state === 'idle';

    return html`
      <ha-card>
        <div class="card-content ${this.config.compactMode ? 'compact' : ''}">
          ${this.config.showEntityName ? this._renderEntityName() : ''}
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

  _renderEntityName() {
    const friendlyName = this._entity.attributes.friendly_name || this._entity.entity_id;

    return html`
      <div class="entity-name">
        <ha-icon icon="mdi:lightbulb-group"></ha-icon>
        <span>${friendlyName}</span>
      </div>
    `;
  }

  _renderNowPlaying() {
    // Get attributes without fallback text
    const playlist = this._entity.attributes.playlist;
    const song = this._entity.attributes.song;

    // Check validity - hide "No playlist" and "No song" placeholders
    const hasValidPlaylist = playlist && playlist !== '' && playlist !== 'No playlist';
    const hasValidSong = song && song !== '' && song !== 'No song';

    // Check if player is idle
    const isIdle = this._entity.state === 'idle' ||
                   this._entity.state === 'off' ||
                   this._entity.state === 'unavailable' ||
                   this._entity.state === 'unknown';

    // Hide entire section if idle OR (no valid content AND queue/songs are empty)
    if (isIdle || (!hasValidPlaylist && !hasValidSong) ||
        (this._queue.length === 0 && this._songs.length === 0)) {
      return '';
    }

    return html`
      <div class="now-playing">
        ${this.config.showPlaylistName && hasValidPlaylist ?
          html`<div class="playlist-name">${playlist}</div>` : ''}
        ${hasValidSong ? html`<div class="song-name">${song}</div>` : ''}
      </div>
    `;
  }

  _renderProgressBar() {
    if (!this.config.showProgressBar) return '';

    // Don't show progress bar if player is idle or no content available
    const isIdle = this._entity.state === 'idle' ||
                   this._entity.state === 'off' ||
                   this._entity.state === 'unavailable' ||
                   this._entity.state === 'unknown';

    // Hide if idle or both queue and songs are empty
    if (isIdle || (this._queue.length === 0 && this._songs.length === 0)) {
      return '';
    }

    const duration = this._entity.attributes.media_duration;
    const basePosition = this._entity.attributes.media_position;

    // Don't show progress bar if we don't have valid duration data
    if (!duration || duration <= 0) return '';

    // Use shared calculation method
    const progress = this._calculateProgress();

    // Calculate position for time display
    let position = basePosition || 0;
    if (this._entity.state === 'playing') {
      const updatedAt = this._entity.attributes.media_position_updated_at;
      if (updatedAt) {
        const lastUpdate = new Date(updatedAt);
        const now = new Date();
        const elapsed = (now - lastUpdate) / 1000;
        position = Math.min(duration, position + elapsed);
      }
    }

    return html`
      <div class="progress-container">
        <div
          class="progress-bar ${this.config.enableSeek ? 'seekable' : ''}"
          @click=${this.config.enableSeek ? this._handleSeek : null}
        >
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
    const queueCount = this._queue.length;

    // Hide completely if queue is empty
    if (queueCount === 0) {
      return '';
    }

    // Auto mode: hidden if empty, expanded if has items
    if (displayMode === 'auto' && queueCount === 0) {
      return '';
    }
    if (displayMode === 'hidden') {
      return '';
    }

    const isCollapsed = displayMode === 'collapsed' && !this._queueExpanded;

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

        ${!isCollapsed
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
                      ${song.name === currentSong ? html`<ha-icon icon="mdi:music" class="current-icon"></ha-icon>` : ''}
                      <span class="song-name">${song.name}</span>
                      ${this.config.showDuration !== false && song.duration ? html`<span class="song-duration">${this._formatTime(song.duration / 1000)}</span>` : ''}
                      ${this.config.showSongActions !== false
                        ? html`
                            <div class="song-actions">
                              ${this.config.showPlayButton !== false
                                ? html`
                                    <button
                                      @click=${() => this._playSong(song.name)}
                                      class="action-btn-compact"
                                      title="Play Now"
                                    >
                                      <ha-icon icon="mdi:play-outline"></ha-icon>
                                    </button>
                                  `
                                : ''}
                              ${this.config.showAddToQueueButton !== false
                                ? html`
                                    <button
                                      @click=${() => this._addToQueue(song.name)}
                                      class="action-btn-compact"
                                      title="Add to Queue"
                                    >
                                      <ha-icon icon="mdi:playlist-plus"></ha-icon>
                                    </button>
                                  `
                                : ''}
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
            <ha-icon icon="mdi:play-outline"></ha-icon>
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

    // Confirm if something is playing and confirmDisruptive is enabled
    if (this.config.confirmDisruptive !== false && this._entity.state === 'playing') {
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

      .card-content.compact {
        gap: 12px;
      }

      .card-content.compact ha-card {
        padding: 12px;
      }

      /* Compact mode: reduce font size by ~2pt for expanded lists */
      .card-content.compact .song-list,
      .card-content.compact .queue-list,
      .card-content.compact .playlist-list {
        font-size: 0.875em; /* Reduces base font from ~14px to ~12px */
      }

      .card-content.compact .song-duration,
      .card-content.compact .queue-duration {
        font-size: 0.8em; /* Already small, reduce proportionally */
      }

      .card-content.compact .section h3 {
        font-size: 0.9em; /* Section headers slightly smaller */
      }

      .card-content.compact .badge {
        font-size: 0.75em; /* Badges slightly smaller */
      }

      .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--error-color);
      }

      .entity-name {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 0.95em;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .entity-name ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .now-playing {
        text-align: left;
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
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.2));
        border-radius: 3px;
        position: relative;
        overflow: hidden;
      }

      .progress-bar.seekable {
        cursor: pointer;
      }

      .progress-fill {
        height: 100%;
        background: var(--accent-color, var(--primary-color, #03a9f4));
        border-radius: 3px;
        transition: width 0.1s linear;
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
        gap: 4px;
      }

      .playback-controls ha-icon-button {
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 28px;
      }

      .playback-controls .play-pause {
        --mdc-icon-button-size: 56px;
        --mdc-icon-size: 40px;
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
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--primary-background-color);
        cursor: pointer;
        transition: background 0.2s;
      }

      .playlist-item:hover {
        background: var(--secondary-background-color);
      }

      .playlist-item.active {
        border-left: 4px solid var(--accent-color);
        font-weight: 600;
      }

      .song-item {
        flex-direction: row;
        align-items: center;
        cursor: default;
      }

      .song-item.current {
        border-left: 4px solid var(--accent-color);
        font-weight: 600;
      }

      .song-item .current-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      .song-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .song-duration,
      .queue-duration {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .song-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
        margin-left: auto;
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

      .action-btn-compact {
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
      }

      .action-btn-compact:hover {
        background: var(--dark-primary-color);
      }

      .action-btn-compact ha-icon {
        --mdc-icon-size: 18px;
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
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 20px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 0.9em;
      }

      .empty-state .hint {
        display: none;
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

// Log card info to console
console.info(
  '%c  XSCHEDULE-CARD  \n%c  Version 1.3.1-pre2  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

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
