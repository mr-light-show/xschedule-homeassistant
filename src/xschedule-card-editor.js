/**
 * xSchedule Card Editor
 *
 * Configuration UI for xSchedule media player card
 */

import { LitElement, html, css } from 'lit';
import { MODE_PRESETS } from './mode-presets.js';

const MODE_OPTIONS = [
  { value: 'simple', label: 'Simple (Default)' },
  { value: 'dj', label: 'DJ Mode' },
  { value: 'jukebox', label: 'Jukebox Mode' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'custom', label: 'Custom' },
];

const DISPLAY_MODE_OPTIONS = [
  { value: 'expanded', label: 'Expanded' },
  { value: 'collapsed', label: 'Collapsed' },
  { value: 'hidden', label: 'Hidden' },
];

const QUEUE_DISPLAY_OPTIONS = [
  { value: 'auto', label: 'Auto (show when has items)' },
  { value: 'expanded', label: 'Expanded' },
  { value: 'collapsed', label: 'Collapsed' },
  { value: 'hidden', label: 'Hidden' },
];

class XScheduleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _currentTab: { type: String },
    };
  }

  constructor() {
    super();
    this._currentTab = 'general';
  }

  setConfig(config) {
    if (!config) {
      this.config = config;
      return;
    }
    
    const mode = config.mode || 'simple';
    const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
    
    // Merge mode preset with config (same logic as card)
    this.config = {
      entity: config.entity,
      mode,
      ...modePreset,
      ...config, // User config overrides preset
    };
  }

  render() {
    if (!this.config) {
      return html``;
    }

    const isCustomMode = this.config.mode === 'custom';

    return html`
      <div class="card-config">
        <!-- General Settings -->
        <div class="form-group">
          <label for="entity">Entity (required)</label>
          <select
            id="entity"
            .value=${this.config.entity || ''}
            @change=${this._entityChanged}
          >
            <option value="">Select entity...</option>
            ${this._getMediaPlayerEntities().map(
              (entity) => html`
                <option value=${entity.entity_id} ?selected=${entity.entity_id === this.config.entity}>
                  ${entity.attributes.friendly_name || entity.entity_id}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group">
          <label for="mode">Card Mode</label>
          <select
            id="mode"
            .value=${this.config.mode || 'simple'}
            @change=${this._modeChanged}
          >
            ${MODE_OPTIONS.map(
              (option) => html`
                <option value=${option.value} ?selected=${this.config.mode === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
          <div class="hint">
            ${this._getModeDescription(this.config.mode || 'simple')}
          </div>
        </div>

        ${isCustomMode
          ? html`
              <!-- Tabs for Custom Mode -->
              <div class="tabs">
                <button
                  class="tab ${this._currentTab === 'general' ? 'active' : ''}"
                  @click=${() => this._selectTab('general')}
                >
                  General
                </button>
                <button
                  class="tab ${this._currentTab === 'appearance' ? 'active' : ''}"
                  @click=${() => this._selectTab('appearance')}
                >
                  Appearance
                </button>
                <button
                  class="tab ${this._currentTab === 'controls' ? 'active' : ''}"
                  @click=${() => this._selectTab('controls')}
                >
                  Controls
                </button>
                <button
                  class="tab ${this._currentTab === 'advanced' ? 'active' : ''}"
                  @click=${() => this._selectTab('advanced')}
                >
                  Advanced
                </button>
              </div>

              <!-- Tab Content -->
              ${this._currentTab === 'general' ? this._renderGeneralTab() : ''}
              ${this._currentTab === 'appearance' ? this._renderAppearanceTab() : ''}
              ${this._currentTab === 'controls' ? this._renderControlsTab() : ''}
              ${this._currentTab === 'advanced' ? this._renderAdvancedTab() : ''}
            `
          : html`
              <div class="preset-info">
                <ha-icon icon="mdi:information"></ha-icon>
                <p>
                  This preset mode has predefined settings.
                  Switch to <strong>Custom</strong> mode to configure individual options.
                </p>
              </div>
            `}
      </div>
    `;
  }

  _renderGeneralTab() {
    return html`
      <div class="tab-content">
        <h3>Display Options</h3>

        <div class="form-group">
          <label for="playlistDisplay">Playlist Display</label>
          <select
            id="playlistDisplay"
            .value=${this.config.playlistDisplay || 'collapsed'}
            @change=${this._valueChanged}
          >
            ${DISPLAY_MODE_OPTIONS.map(
              (option) => html`
                <option value=${option.value} ?selected=${(this.config.playlistDisplay || 'collapsed') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group">
          <label for="songsDisplay">Songs Display</label>
          <select
            id="songsDisplay"
            .value=${this.config.songsDisplay || 'collapsed'}
            @change=${this._valueChanged}
          >
            ${DISPLAY_MODE_OPTIONS.map(
              (option) => html`
                <option value=${option.value} ?selected=${(this.config.songsDisplay || 'collapsed') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group">
          <label for="queueDisplay">Queue Display</label>
          <select
            id="queueDisplay"
            .value=${this.config.queueDisplay || 'auto'}
            @change=${this._valueChanged}
          >
            ${QUEUE_DISPLAY_OPTIONS.map(
              (option) => html`
                <option value=${option.value} ?selected=${(this.config.queueDisplay || 'auto') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>
      </div>
    `;
  }

  _renderAppearanceTab() {
    return html`
      <div class="tab-content">
        <h3>Visual Options</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showEntityName || false}
              @change=${(e) => this._checkboxChanged('showEntityName', e)}
            />
            Show entity name header
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPlaylistName || false}
              @change=${(e) => this._checkboxChanged('showPlaylistName', e)}
            />
            Show playlist name
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showProgressBar !== false}
              @change=${(e) => this._checkboxChanged('showProgressBar', e)}
            />
            Show progress bar
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              id="songActionsParent"
              .checked=${this.config.showSongActions !== false}
              .indeterminate=${this._getSongActionsIndeterminate()}
              @change=${(e) => this._songActionsParentChanged(e)}
            />
            Show song actions (enable both buttons below)
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${this.config.showPlayButton !== false}
              @change=${(e) => this._songActionsChildChanged('showPlayButton', e)}
            />
            Show "Play Now" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${this.config.showAddToQueueButton !== false}
              @change=${(e) => this._songActionsChildChanged('showAddToQueueButton', e)}
            />
            Show "Add to Queue" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showDuration !== false}
              @change=${(e) => this._checkboxChanged('showDuration', e)}
            />
            Show song duration
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.compactMode || false}
              @change=${(e) => this._checkboxChanged('compactMode', e)}
            />
            Compact mode (reduced padding)
          </label>
        </div>
      </div>
    `;
  }

  _renderControlsTab() {
    return html`
      <div class="tab-content">
        <h3>Playback Controls</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPlaybackControls !== false}
              @change=${(e) => this._checkboxChanged('showPlaybackControls', e)}
            />
            Show playback controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showVolumeControl || false}
              @change=${(e) => this._checkboxChanged('showVolumeControl', e)}
            />
            Show volume controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.enableSeek || false}
              @change=${(e) => this._checkboxChanged('enableSeek', e)}
            />
            Enable seek on progress bar
          </label>
          <div class="hint">Allow clicking progress bar to seek to position</div>
        </div>
      </div>
    `;
  }

  _renderAdvancedTab() {
    return html`
      <div class="tab-content">
        <h3>Behavior</h3>

        <div class="form-group">
          <label for="maxVisibleSongs">Maximum visible songs</label>
          <input
            type="number"
            id="maxVisibleSongs"
            min="1"
            max="50"
            .value=${this.config.maxVisibleSongs || 10}
            @change=${this._valueChanged}
          />
          <div class="hint">Number of songs to show before scrolling</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.confirmDisruptive !== false}
              @change=${(e) => this._checkboxChanged('confirmDisruptive', e)}
            />
            Confirm before disruptive actions
          </label>
          <div class="hint">Show confirmation when replacing current song</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showTooltips !== false}
              @change=${(e) => this._checkboxChanged('showTooltips', e)}
            />
            Show tooltips on hover
          </label>
        </div>

        <div class="form-group">
          <button class="reset-button" @click=${this._resetToDefaults}>
            <ha-icon icon="mdi:restore"></ha-icon>
            Reset to Simple Mode
          </button>
        </div>
      </div>
    `;
  }

  _getMediaPlayerEntities() {
    if (!this.hass) return [];
    return Object.values(this.hass.states).filter(
      (entity) =>
        entity.entity_id.startsWith('media_player.') &&
        (entity.attributes.playlist_songs !== undefined ||
         entity.entity_id.includes('xschedule'))
    );
  }

  _getModeDescription(mode) {
    const descriptions = {
      simple: 'Best for basic playback. Shows playlist selector and playback controls.',
      dj: 'Best for live performance. Shows all playlists expanded, queue prominent, and song actions visible.',
      jukebox: 'Best for party mode. Shows all songs expanded with prominent queue section.',
      minimal: 'Best for small spaces. Shows only playback controls and now playing info.',
      custom: 'Unlock all configuration options for complete customization.',
    };
    return descriptions[mode] || '';
  }

  _selectTab(tab) {
    this._currentTab = tab;
    this.requestUpdate();
  }

  _entityChanged(e) {
    this._updateConfig({ entity: e.target.value });
  }

  _modeChanged(e) {
    const mode = e.target.value;
    
    // Get mode preset and create FRESH config with preset values
    const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
    
    // Get all keys that are in mode presets (these will be replaced)
    const presetKeys = new Set(Object.keys(MODE_PRESETS.simple));
    
    // Preserve all fields NOT in mode-presets (metadata, advanced settings, etc.)
    const preservedFields = {};
    for (const key in this.config) {
      // Preserve: entity (handled separately), mode (handled separately), 
      // and any field not in preset keys
      if (key !== 'entity' && key !== 'mode' && !presetKeys.has(key)) {
        preservedFields[key] = this.config[key];
      }
    }
    
    // Create new config: preset values override preset-related settings,
    // but all non-preset fields are preserved
    const newConfig = {
      ...preservedFields, // Preserve all fields not in mode-presets
      entity: this.config.entity,
      mode,
      ...modePreset, // Preset values (playlistDisplay, songsDisplay, etc.)
    };
    
    // Replace config entirely (don't merge with old preset-related properties)
    this.config = newConfig;
    
    // Dispatch event with fresh config
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _valueChanged(e) {
    const key = e.target.id;
    const value = e.target.value;
    this._updateConfig({ [key]: value });
  }

  _checkboxChanged(key, e) {
    this._updateConfig({ [key]: e.target.checked });
  }

  _songActionsParentChanged(e) {
    // When parent checkbox changes, update both children
    const checked = e.target.checked;
    this._updateConfig({
      showSongActions: checked,
      showPlayButton: checked,
      showAddToQueueButton: checked
    });
  }

  _songActionsChildChanged(key, e) {
    // Update the child checkbox
    const updates = { [key]: e.target.checked };

    // Update parent based on children states
    const showPlayButton = key === 'showPlayButton' ? e.target.checked : (this.config.showPlayButton !== false);
    const showAddToQueueButton = key === 'showAddToQueueButton' ? e.target.checked : (this.config.showAddToQueueButton !== false);

    if (showPlayButton && showAddToQueueButton) {
      // Both checked - parent should be checked
      updates.showSongActions = true;
    } else if (!showPlayButton && !showAddToQueueButton) {
      // Both unchecked - parent should be unchecked
      updates.showSongActions = false;
    } else {
      // Mixed state - keep parent checked but we'll show indeterminate
      updates.showSongActions = true;
    }

    this._updateConfig(updates);
  }

  _getSongActionsIndeterminate() {
    const showPlayButton = this.config.showPlayButton !== false;
    const showAddToQueueButton = this.config.showAddToQueueButton !== false;
    return showPlayButton !== showAddToQueueButton;
  }

  _resetToDefaults() {
    if (confirm('Reset all settings to Simple mode defaults?')) {
      // Use same logic as _modeChanged to properly reset to mode preset
      const mode = 'simple';
      const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
      
      // Get all keys that are in mode presets (these will be replaced)
      const presetKeys = new Set(Object.keys(MODE_PRESETS.simple));
      
      // Preserve all fields NOT in mode-presets (metadata, advanced settings, etc.)
      const preservedFields = {};
      for (const key in this.config) {
        // Preserve: entity (handled separately), mode (handled separately), 
        // and any field not in preset keys
        if (key !== 'entity' && key !== 'mode' && !presetKeys.has(key)) {
          preservedFields[key] = this.config[key];
        }
      }
      
      // Create new config with preset values and preserved non-preset fields
      const newConfig = {
        ...preservedFields, // Preserve all fields not in mode-presets
        entity: this.config.entity,
        mode,
        ...modePreset,
      };
      
      // Replace config entirely
      this.config = newConfig;
      
      // Dispatch event with fresh config
      const event = new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  _updateConfig(updates) {
    this.config = { ...this.config, ...updates };

    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

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
        color: var(--primary-text-color);
      }

      .form-group select,
      .form-group input[type='number'] {
        width: 100%;
        padding: 8px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .form-group.checkbox {
        margin-left: 0;
      }

      .form-group.checkbox label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal;
        cursor: pointer;
      }

      .form-group.checkbox input[type='checkbox'] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .hint {
        margin-top: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .preset-info {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 8px;
        margin-top: 16px;
      }

      .preset-info ha-icon {
        --mdc-icon-size: 24px;
        flex-shrink: 0;
      }

      .preset-info p {
        margin: 0;
        line-height: 1.5;
      }

      .tabs {
        display: flex;
        gap: 4px;
        margin: 16px 0;
        border-bottom: 2px solid var(--divider-color);
      }

      .tab {
        padding: 8px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--secondary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: -2px;
      }

      .tab:hover {
        color: var(--primary-text-color);
        background: var(--secondary-background-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-content {
        padding: 16px 0;
      }

      .tab-content h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .reset-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .reset-button:hover {
        opacity: 0.9;
      }

      .reset-button ha-icon {
        --mdc-icon-size: 20px;
      }
    `;
  }
}

customElements.define('xschedule-card-editor', XScheduleCardEditor);
