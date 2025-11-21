/**
 * xSchedule Media Player Card for Home Assistant
 *
 * A custom Lovelace card for controlling xSchedule lighting sequencer
 */

import { LitElement, html, css } from 'lit';
import { MODE_PRESETS } from './mode-presets.js';

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
      _forceExpandPlaylists: { type: Boolean },
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
    this._forceExpandPlaylists = false;
    this._lastFetchedPlaylist = null; // Track playlist fetched via browse

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

      const currentPlaylist = this._entity.attributes.media_playlist || this._entity.attributes.playlist;
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

      // Extract internal queue (managed by integration)
      this._queue = this._entity.attributes.internal_queue || [];
    }

    // Trigger update check
    this.requestUpdate();
  }

  shouldUpdate(changedProperties) {
    // Always update if config changed (mode or display settings)
    // This ensures all mode preset values are reflected when switching modes
    if (changedProperties.has('config')) {
      return true;
    }

    // Always update when force expand changes (for idle play button behavior)
    if (changedProperties.has('_forceExpandPlaylists')) {
      return true;
    }

    // If entity exists, check if meaningful data changed
    if (this._entity) {
      // Check if this is the first time we have entity data
      const isFirstRender = this._previousState === null;

      const stateChanged = this._entity.state !== this._previousState;
      const titleChanged = this._entity.attributes.media_title !== this._previousTitle;
      const playlistChanged = (this._entity.attributes.media_playlist || this._entity.attributes.playlist) !== this._previousPlaylist;
      const playlistsChanged = JSON.stringify(this._entity.attributes.source_list) !== this._previousPlaylists;
      const songsChanged = JSON.stringify(this._entity.attributes.playlist_songs) !== this._previousSongs;
      const queueChanged = JSON.stringify(this._entity.attributes.internal_queue) !== this._previousQueue;
      const mediaPositionUpdatedAtChanged = this._entity.attributes.media_position_updated_at !== this._previousMediaPositionUpdatedAt;

      // Check if we need to fetch songs via browse_media (for non-xSchedule players)
      const currentPlaylist = this._entity.attributes.media_playlist || this._entity.attributes.playlist;
      if (currentPlaylist && currentPlaylist !== this._lastFetchedPlaylist) {
        // Use playlist_songs if available (xSchedule player)
        if (this._entity.attributes.playlist_songs) {
          // Songs are already in attributes, no need to fetch
          this._lastFetchedPlaylist = currentPlaylist;
        } else {
          // Fallback to browse_media for non-xSchedule players
          this._lastFetchedPlaylist = currentPlaylist;
          this._fetchSongsViaBrowse(currentPlaylist).then(songs => {
            this._songs = songs;
            this.requestUpdate();
          });
        }
      }

      // Update tracking variables
      this._previousState = this._entity.state;
      this._previousTitle = this._entity.attributes.media_title;
      this._previousPlaylist = this._entity.attributes.media_playlist || this._entity.attributes.playlist;
      this._previousPlaylists = JSON.stringify(this._entity.attributes.source_list);
      this._previousSongs = JSON.stringify(this._entity.attributes.playlist_songs);
      this._previousQueue = JSON.stringify(this._entity.attributes.internal_queue);
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

    return html`
      <ha-card>
        <div class="card-content ${this.config.compactMode ? 'compact' : ''}">
          ${this.config.showEntityName ? this._renderEntityName() : ''}
          ${this._renderNowPlaying()}
          
          ${this.config.compactMode
            ? this._renderCompactControlsAndProgress()
            : html`
                ${this._renderProgressBar()}
                ${this._renderPlaybackControls()}
              `
          }
          
          ${this.config.showVolumeControl ? this._renderVolumeControl() : ''}
          ${this._renderPlaylistSelector()}
          ${this._supportsQueue() ? this._renderQueue() : ''}
          ${this._renderSongs()}
        </div>
        ${this._toast ? this._renderToast() : ''}
        ${this._contextMenu ? this._renderContextMenu() : ''}
      </ha-card>
    `;
  }

  _renderEntityName() {
    // Use custom name if provided, otherwise fall back to entity's friendly_name
    const displayName = this.config.entityName || 
                        this._entity.attributes.friendly_name || 
                        this._entity.entity_id;
    
    // Use custom icon if provided, otherwise fall back to default
    const displayIcon = this.config.entityIcon || 'mdi:lightbulb-group';

    return html`
      <div class="entity-name">
        <ha-icon icon="${displayIcon}"></ha-icon>
        <span>${displayName}</span>
      </div>
    `;
  }

  _renderNowPlaying() {
    // Get attributes without fallback text
    const playlist = this._getCurrentPlaylistOrSource();
    const song = this._entity.attributes.media_title || this._entity.attributes.song;

    // Check validity - hide "No playlist" and "No song" placeholders
    const hasValidPlaylist = playlist && playlist !== '' && playlist !== 'No playlist';
    const hasValidSong = song && song !== '' && song !== 'No song';

    // Check if player is idle
    const isIdle = this._entity.state === 'idle' ||
                   this._entity.state === 'off' ||
                   this._entity.state === 'unavailable' ||
                   this._entity.state === 'unknown';

    // Hide entire section if idle OR (no valid content)
    // Don't hide just because songs/queue are empty - that's normal for generic players
    if (isIdle || (!hasValidPlaylist && !hasValidSong)) {
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

  _renderCompactControlsAndProgress() {
    const progressBar = this._renderProgressBar();
    const controls = this._renderPlaybackControls();
    
    // If either is empty, render them separately (fallback)
    if (!progressBar || !controls) {
      return html`
        ${controls}
        ${progressBar}
      `;
    }
    
    // Both exist: render in compact horizontal layout
    return html`
      <div class="compact-controls-progress">
        <div class="compact-controls">
          ${controls}
        </div>
        <div class="compact-progress">
          ${progressBar}
        </div>
      </div>
    `;
  }

  _isIdle() {
    return this._entity.state === 'idle' ||
           this._entity.state === 'off' ||
           this._entity.state === 'unavailable' ||
           this._entity.state === 'unknown';
  }

  _hasActivePlaylist() {
    const playlist = this._getCurrentPlaylistOrSource();
    return playlist && playlist !== '' && playlist !== 'No playlist';
  }

  _renderPlaybackControls() {
    if (!this.config.showPlaybackControls) return '';
    
    const isIdle = this._isIdle();
    const hasActivePlaylist = this._hasActivePlaylist();
    
    // Home Assistant MediaPlayerEntityFeature standard values
    // Source: homeassistant.components.media_player.MediaPlayerEntityFeature
    const FEATURE_PAUSE = 0x1;          // MediaPlayerEntityFeature.PAUSE
    const FEATURE_PREVIOUS = 0x10;      // MediaPlayerEntityFeature.PREVIOUS_TRACK
    const FEATURE_NEXT = 0x20;          // MediaPlayerEntityFeature.NEXT_TRACK
    const FEATURE_TURN_OFF = 0x100;     // MediaPlayerEntityFeature.TURN_OFF
    const FEATURE_STOP = 0x1000;        // MediaPlayerEntityFeature.STOP
    const FEATURE_PLAY = 0x4000;        // MediaPlayerEntityFeature.PLAY
    
    // Idle state logic
    if (isIdle || !hasActivePlaylist) {
      const playlistHidden = this.config.playlistDisplay === 'hidden';
      
      // Only show play button if playlists are hidden and play is supported
      if (playlistHidden && this._supportsFeature(FEATURE_PLAY)) {
        return html`
          <div class="playback-controls">
            <ha-icon-button
              @click=${this._handleIdlePlay}
              class="play-pause"
              title="Play"
            >
              <ha-icon icon="mdi:play"></ha-icon>
            </ha-icon-button>
          </div>
        `;
      }
      
      // Otherwise hide all controls
      return '';
    }
    
    // Normal playback controls when active
    const isPlaying = this._entity.state === 'playing';

    return html`
      <div class="playback-controls">
        ${this.config.showPowerOffButton && this._supportsFeature(FEATURE_TURN_OFF) ? html`
          <ha-icon-button
            @click=${this._handlePowerOff}
            title="Power Off (Stop All)"
            class="power-off-btn"
          >
            <ha-icon icon="mdi:power"></ha-icon>
          </ha-icon-button>
        ` : ''}

        ${this._supportsFeature(FEATURE_PREVIOUS) ? html`
          <ha-icon-button
            @click=${this._handlePrevious}
            title="Previous"
          >
            <ha-icon icon="mdi:skip-previous"></ha-icon>
          </ha-icon-button>
        ` : ''}

        ${this._supportsFeature(FEATURE_PLAY) || this._supportsFeature(FEATURE_PAUSE) ? html`
          <ha-icon-button
            @click=${isPlaying ? this._handlePause : this._handlePlay}
            class="play-pause"
            title=${isPlaying ? 'Pause' : 'Play'}
          >
            <ha-icon icon=${isPlaying ? 'mdi:pause' : 'mdi:play'}></ha-icon>
          </ha-icon-button>
        ` : ''}

        ${this._supportsFeature(FEATURE_STOP) ? html`
          <ha-icon-button
            @click=${this._handleStop}
            title="Stop"
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        ` : ''}

        ${this._supportsFeature(FEATURE_NEXT) ? html`
          <ha-icon-button
            @click=${this._handleNext}
            title="Next"
          >
            <ha-icon icon="mdi:skip-next"></ha-icon>
          </ha-icon-button>
        ` : ''}
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
    const isIdle = this._isIdle();
    const hasActivePlaylist = this._hasActivePlaylist();
    
    // Auto mode: show playlists when idle without active playlist
    if (displayMode === 'auto' && isIdle && !hasActivePlaylist) {
      this._forceExpandPlaylists = true;
    }
    
    // Force expand takes precedence
    if (this._forceExpandPlaylists) {
      return this._renderExpandedPlaylists();
    }
    
    if (displayMode === 'hidden') return '';

    const currentPlaylist = this._getCurrentPlaylistOrSource();

    if (displayMode === 'collapsed') {
      const isXSchedule = this._isXSchedulePlayer();
      const placeholder = isXSchedule ? 'Select playlist...' : 'Select source...';
      
      return html`
        <div class="section playlist-section">
          <select
            @change=${this._handlePlaylistChange}
            class="playlist-select"
          >
            <option value="" ?selected=${!currentPlaylist}>${placeholder}</option>
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
    return this._renderExpandedPlaylists();
  }

  _renderExpandedPlaylists() {
    const currentItem = this._getCurrentPlaylistOrSource();
    const isXSchedule = this._isXSchedulePlayer();
    const label = isXSchedule ? 'Playlists' : 'Sources';
    
    return html`
      <div class="section playlist-section">
        <h3>
          <ha-icon icon="mdi:playlist-music"></ha-icon>
          ${label}
          ${this._forceExpandPlaylists ? html`
            <ha-icon-button
              class="playlist-close-btn"
              @click=${this._closeForceExpandedPlaylists}
              .label=${'Close'}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </ha-icon-button>
          ` : ''}
        </h3>
        <div class="playlist-list">
          ${this._playlists.map(
            (playlist) => html`
              <div
                class="playlist-item ${playlist === currentItem ? 'active' : ''}"
                @click=${() => this._selectPlaylist(playlist)}
              >
                <ha-icon icon=${playlist === currentItem ? 'mdi:play-circle' : 'mdi:playlist-music'}></ha-icon>
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
        <div class="section-header">
          <div @click=${this._toggleQueue} style="display: flex; align-items: center; flex: 1; cursor: pointer;">
            <h3>
              <ha-icon icon="mdi:format-list-numbered"></ha-icon>
              Queue
              ${queueCount > 0 ? html`<span class="badge">${queueCount}</span>` : ''}
            </h3>
            ${displayMode === 'collapsed'
              ? html`<ha-icon icon=${this._queueExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>`
              : ''}
          </div>
          ${queueCount > 0 
            ? html`
                <button 
                  class="queue-header-delete"
                  @click=${(e) => {
                    e.stopPropagation();
                    this._handleClearQueue();
                  }}
                  title="Clear entire queue"
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `
            : ''}
        </div>

        ${!isCollapsed
          ? html`
              <div class="queue-list">
                ${this._queue.map(
                  (item, index) => html`
                    <div 
                      class="queue-item"
                      draggable="true"
                      data-id="${item.id}"
                      @dragstart=${(e) => this._handleDragStart(e, item.id)}
                      @dragover=${this._handleDragOver}
                      @drop=${(e) => this._handleDrop(e, index)}
                    >
                      <div class="queue-drag-handle">
                        <ha-icon icon="mdi:drag"></ha-icon>
                      </div>
                      <span class="queue-number">${index + 1}</span>
                      <div class="queue-info">
                        <span class="queue-name">${item.name}</span>
                        ${item.priority > 1 
                          ? html`<span class="queue-priority-badge">×${item.priority}</span>`
                          : ''}
                        ${item.duration ? html`<span class="queue-duration">${this._formatTime(item.duration / 1000)}</span>` : ''}
                      </div>
                      <button 
                        class="queue-item-delete"
                        @click=${(e) => {
                          e.stopPropagation();
                          this._removeFromQueue(item.id);
                        }}
                        title="Remove from queue"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderSongs() {
    const displayMode = this.config.songsDisplay;
    if (displayMode === 'hidden') return '';

    const songCount = this._songs.length;

    // Auto-hide if enabled and 0 or 1 songs
    if (this.config.autoHideSongsWhenEmpty && songCount <= 1) {
      return '';
    }

    const isCollapsed = displayMode === 'collapsed' && !this._songsExpanded;
    const currentSong = this._entity.attributes.media_title || this._entity.attributes.song;

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
                              ${this.config.showAddToQueueButton !== false && this._supportsQueue()
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
          ${this._supportsQueue()
            ? html`
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
              `
            : ''}
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

  async _handlePowerOff() {
    // Confirm before turning off
    if (this.config.confirmDisruptive !== false) {
      if (!confirm('Stop all playlists, schedules, and clear queue?')) {
        return;
      }
    }

    try {
      await this._hass.callService('media_player', 'turn_off', {
        entity_id: this.config.entity,
      });
      this._showToast('success', 'mdi:power', 'All stopped');
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Power off failed');
      console.error('Error turning off:', err);
    }
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

  _supportsQueue() {
    return this._isXSchedulePlayer();
  }

  _getCurrentPlaylistOrSource() {
    if (!this._entity) return null;
    
    // For xSchedule: use media_playlist or playlist
    // For generic players: use source
    return this._entity.attributes.media_playlist || 
           this._entity.attributes.playlist ||
           this._entity.attributes.source;
  }

  _supportsFeature(feature) {
    const features = this._entity?.attributes?.supported_features || 0;
    return (features & feature) !== 0;
  }

  async _fetchSongsViaBrowse(playlist) {
    if (!playlist) return [];
    
    try {
      const result = await this._hass.callWS({
        type: 'media_player/browse_media',
        entity_id: this.config.entity,
        media_content_type: 'playlist',
        media_content_id: playlist
      });
      
      // Map browse_media children to song format
      return result.children?.map(child => ({
        name: child.title,
        duration: child.duration ? Math.round(child.duration * 1000) : 0
      })) || [];
    } catch (err) {
      console.error('Failed to fetch songs via browse:', err);
      return [];
    }
  }

  _selectPlaylist(playlist) {
    const entity = this._entity;
    const features = entity?.attributes?.supported_features || 0;
    
    // Feature flags from Home Assistant
    const SUPPORT_PLAY_MEDIA = 0x200;    // 512
    const SUPPORT_SELECT_SOURCE = 0x400; // 1024
    
    const isXSchedule = this._isXSchedulePlayer();
    
    // For xSchedule, prefer PLAY_MEDIA
    // For generic players, prefer SELECT_SOURCE (standard way to change source)
    if (isXSchedule && (features & SUPPORT_PLAY_MEDIA)) {
      this._hass.callService('media_player', 'play_media', {
        entity_id: this.config.entity,
        media_content_type: 'playlist',
        media_content_id: playlist,
      });
    } else if (features & SUPPORT_SELECT_SOURCE) {
      this._hass.callService('media_player', 'select_source', {
        entity_id: this.config.entity,
        source: playlist,
      });
    } else if (features & SUPPORT_PLAY_MEDIA) {
      // Fallback to PLAY_MEDIA for players that only support that
      this._hass.callService('media_player', 'play_media', {
        entity_id: this.config.entity,
        media_content_type: 'music',
        media_content_id: playlist,
      });
    } else {
      console.warn('Player does not support playlist playback');
      this._showToast('error', 'mdi:alert-circle', 'Player does not support playlists');
      return;
    }
    
    // Auto-collapse after selection
    if (this._forceExpandPlaylists) {
      this._forceExpandPlaylists = false;
      this.requestUpdate();
    }
    
    this._showToast('success', 'mdi:check-circle', `Playing: ${playlist}`);
  }

  async _handleIdlePlay() {
    const playlists = this._entity.attributes.source_list || [];
    
    if (playlists.length === 0) {
      this._showToast('error', 'mdi:alert-circle', 'No playlists available');
      return;
    }
    
    // Single playlist: play it immediately
    if (playlists.length === 1) {
      await this._selectPlaylist(playlists[0]);
      return;
    }
    
    // Multiple playlists: force expand playlist section
    this._forceExpandPlaylists = true;
    this.requestUpdate();
    this._showToast('info', 'mdi:playlist-music', 'Select a playlist to play');
  }

  _closeForceExpandedPlaylists(e) {
    e?.stopPropagation();
    this._forceExpandPlaylists = false;
  }

  async _playSong(songName) {
    const playlist = this._entity.attributes.media_playlist || this._entity.attributes.playlist || this._entity.attributes.source;
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
      // Use standard media_player.play_media command with |||  delimiter
      await this._hass.callService('media_player', 'play_media', {
        entity_id: this.config.entity,
        media_content_type: 'music',
        media_content_id: `${playlist}|||${songName}`,
      });
      this._showToast('success', 'mdi:play-circle', `Now playing: ${songName}`);
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to play song');
      console.error('Error playing song:', err);
    }
  }

  async _addToQueue(songName) {
    // Queue functionality is xSchedule-specific
    if (!this._supportsQueue()) {
      this._showToast('error', 'mdi:alert-circle', 'Queue not supported by this player');
      return;
    }

    try {
      // Check if song is already in queue to show appropriate message
      const existingItem = this._queue.find(item => item.name === songName);
      const willBumpPriority = existingItem !== undefined;
      
      await this._hass.callService('xschedule', 'add_to_internal_queue', {
        entity_id: [this.config.entity],
        song: songName,
      });
      
      if (willBumpPriority) {
        const newPriority = existingItem.priority + 1;
        this._showToast('success', 'mdi:arrow-up-bold', `${songName} will play sooner (priority ×${newPriority})`);
      } else {
        this._showToast('success', 'mdi:playlist-plus', `${songName} added to queue`);
      }
    } catch (err) {
      console.error('Add to queue failed:', err);
      this._showToast('error', 'mdi:alert-circle', `Failed: ${err.message || err}`);
    }
  }

  async _handleClearQueue() {
    if (!confirm('Clear entire queue?')) {
      return;
    }

    try {
      await this._hass.callService('xschedule', 'clear_internal_queue', {
        entity_id: [this.config.entity],
      });
      this._showToast('success', 'mdi:check-circle', 'Queue cleared');
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to clear queue');
    }
  }

  async _removeFromQueue(queueItemId) {
    try {
      await this._hass.callService('xschedule', 'remove_from_internal_queue', {
        entity_id: [this.config.entity],
        queue_item_id: queueItemId,
      });
      this._showToast('success', 'mdi:check-circle', 'Removed from queue');
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to remove from queue');
      console.error('Error removing from queue:', err);
    }
  }

  async _reorderQueue(queueItemIds) {
    try {
      await this._hass.callService('xschedule', 'reorder_internal_queue', {
        entity_id: [this.config.entity],
        queue_item_ids: queueItemIds,
      });
    } catch (err) {
      this._showToast('error', 'mdi:alert-circle', 'Failed to reorder queue');
      console.error('Error reordering queue:', err);
    }
  }

  _handleDragStart(e, itemId) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    this._draggedItemId = itemId;
    e.target.classList.add('dragging');
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  _handleDrop(e, targetIndex) {
    e.preventDefault();
    
    // Remove dragging class from all items
    const items = this.shadowRoot.querySelectorAll('.queue-item');
    items.forEach(item => item.classList.remove('dragging'));
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (!draggedId) return;
    
    // Get current queue
    const queue = this._queue || [];
    const draggedIndex = queue.findIndex(item => item.id === draggedId);
    
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      return;
    }
    
    // Reorder IDs
    const newOrder = [...queue];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    // Send reorder command
    this._reorderQueue(newOrder.map(item => item.id));
  }

  _toggleSongs() {
    if (this.config.songsDisplay === 'collapsed') {
      this._songsExpanded = !this._songsExpanded;
    }
  }

  _toggleQueue() {
    if (this.config.queueDisplay === 'collapsed') {
      this._queueExpanded = !this._queueExpanded;
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

    setTimeout(() => {
      this._toast = null;
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

      /* Compact mode: controls and progress on same line */
      .compact-controls-progress {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .compact-controls {
        flex-shrink: 0; /* Don't shrink controls */
      }

      .compact-progress {
        flex: 1; /* Fill remaining space */
        min-width: 0; /* Allow flexbox to shrink if needed */
      }

      /* Adjust progress bar styling in compact mode */
      .compact-controls-progress .progress-container {
        /* Ensure progress bar uses full width */
        width: 100%;
      }

      /* Ensure controls don't have extra spacing in compact layout */
      .compact-controls .playback-controls {
        margin: 0;
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

      /* Left-justify when only play button is shown (idle state) */
      .playback-controls:has(ha-icon-button:only-child) {
        justify-content: flex-start;
      }

      .playback-controls ha-icon-button {
        --mdc-icon-button-size: 34px;
        --mdc-icon-size: 24px;
      }

      .playback-controls .play-pause {
        --mdc-icon-button-size: 48px;
        --mdc-icon-size: 34px;
      }

      .playback-controls .power-off-btn {
        color: var(--error-color);
      }

      .playback-controls .power-off-btn:hover {
        color: var(--error-state-color);
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

      .playlist-section h3 {
        position: relative;
      }

      .playlist-close-btn {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .playlist-close-btn:hover {
        color: var(--primary-text-color);
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

      .queue-item {
        cursor: move;
      }

      .queue-item:hover {
        background: var(--secondary-background-color);
      }

      .queue-item.dragging {
        opacity: 0.5;
      }

      .queue-drag-handle {
        display: flex;
        align-items: center;
        color: var(--secondary-text-color);
        cursor: grab;
        margin-right: -4px;
      }

      .queue-drag-handle:active {
        cursor: grabbing;
      }

      .queue-drag-handle ha-icon {
        --mdc-icon-size: 20px;
      }

      .queue-number {
        font-weight: 700;
        color: var(--accent-color);
        min-width: 24px;
      }

      .queue-info {
        flex: 1;
        display: flex;
        gap: 8px;
        align-items: center;
        min-width: 0;
      }

      .queue-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .queue-priority-badge {
        background: var(--primary-color);
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.8em;
        font-weight: bold;
        flex-shrink: 0;
      }

      .queue-duration {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .queue-item-delete {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s, background 0.2s;
      }

      .queue-item-delete:hover {
        color: var(--error-color);
        background: var(--error-color-opacity, rgba(var(--rgb-error-color), 0.1));
      }

      .queue-item-delete ha-icon {
        --mdc-icon-size: 18px;
      }

      .queue-header-delete {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 8px;
        border-radius: 4px;
        transition: color 0.2s, background 0.2s;
        flex-shrink: 0;
      }

      .queue-header-delete:hover {
        color: var(--error-color);
        background: var(--error-color-opacity, rgba(var(--rgb-error-color), 0.1));
      }

      .queue-header-delete ha-icon {
        --mdc-icon-size: 20px;
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
  '%c  XSCHEDULE-CARD  \n%c  Version 1.7.3  ',
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
