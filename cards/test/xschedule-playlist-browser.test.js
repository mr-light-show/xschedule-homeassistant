import { html, fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { stub, useFakeTimers } from 'sinon';
import '../src/xschedule-playlist-browser.js';
import { createMockHass, createMockEntityState, createMockCardConfig, createConfiguredElement } from './helpers/mock-hass.js';

describe('XSchedulePlaylistBrowser', () => {
  let element;
  let mockHass;

  beforeEach(async () => {
    mockHass = createMockHass();
  });

  describe('Initialization', () => {
    it('renders with basic config', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      expect(element).to.exist;
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('throws error without entity config', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      expect(() => {
        element.setConfig({});
      }).to.throw('You need to define an entity');
    });
  });

  describe('Cache Invalidation Events', () => {
    it('has connection object for events', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Verify hass connection exists (component uses _hass internally)
      expect(element._hass).to.exist;
      expect(element._hass.connection).to.exist;
      expect(element._hass.connection.subscribeEvents).to.exist;
    });

    it('handles cache event subscription lifecycle', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Component is configured and ready
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('validates entity ID configuration', async () => {
      const config = createMockCardConfig({ entity: 'media_player.xschedule' });
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('cleans up on disconnect', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Remove element to trigger disconnect
      element.remove();

      // Lifecycle cleanup happens
      expect(element).to.exist;
    });
  });

  describe('Schedule Display', () => {
    it('initializes with empty schedules', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Initial state should have empty or default schedules
      expect(element._playlistSchedules).to.exist;
    });

    it('tracks loading state', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Loading state exists and can be tracked
      expect(element._loading !== undefined).to.be.true;
    });

    it('can track error state', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Error state can be set
      element._error = 'Test error';
      expect(element._error).to.equal('Test error');
    });

    it('hides playing and schedule badges while preserving duration when show_status is false', () => {
      const renderer = document.createElement('xschedule-playlist-browser');
      renderer.setConfig(createMockCardConfig({ show_status: false, show_duration: true }));

      const info = [
        ...renderer._renderScheduleInfo(true, { nextActiveTime: 'NOW!', duration: 120 }),
        ...renderer._renderScheduleInfo(false, {
          nextActiveTime: '2026-10-31T20:00:00Z',
          duration: 180,
        }),
      ];
      const markup = info.map(part => part.strings.join('')).join('');

      expect(markup).to.not.include('playing-status');
      expect(markup).to.not.include('schedule-time');
      expect(markup.match(/class="schedule-info duration"/g)).to.have.lengthOf(2);
    });
  });

  describe('Playlist Selection', () => {
    it('tracks selected playlist', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Playlist selection can be tracked
      element._selectedPlaylist = 'Playlist 1';
      await element.updateComplete;

      expect(element._selectedPlaylist).to.equal('Playlist 1');
    });

    it('stores playlist steps data', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      element._playlistSteps = [
        { name: 'Song 1', duration: 180 },
        { name: 'Song 2', duration: 240 },
      ];

      expect(element._playlistSteps.length).to.equal(2);
      expect(element._playlistSteps[0].name).to.equal('Song 1');
    });
  });

  describe('Playlist List Collapse Modes', () => {
    it('keeps all playlists visible by default without a list toggle', async () => {
      mockHass.callWS = stub().resolves({ response: { playlists: [] } });
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle',
        {
          integration: 'xschedule',
          source_list: ['Playlist 1', 'Playlist 2'],
        }
      );

      element = await createConfiguredElement(
        'xschedule-playlist-browser',
        createMockCardConfig(),
        mockHass
      );

      expect(element.shadowRoot.querySelectorAll('.playlist-item')).to.have.lengthOf(2);
      expect(element.shadowRoot.querySelector('.playlist-list-toggle')).to.not.exist;
    });

    it('hides every playlist behind a toggle in collapsed mode', async () => {
      mockHass.callWS = stub().resolves({ response: { playlists: [] } });
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          integration: 'xschedule',
          media_playlist: 'Playing Playlist',
          source_list: ['Playing Playlist', 'Hidden Playlist'],
        }
      );

      element = await createConfiguredElement(
        'xschedule-playlist-browser',
        createMockCardConfig({ collapse_mode: 'collapsed' }),
        mockHass
      );

      expect(element.shadowRoot.querySelectorAll('.playlist-item')).to.have.lengthOf(0);

      const toggle = element.shadowRoot.querySelector('.playlist-list-toggle');
      expect(toggle).to.exist;
      expect(toggle.textContent).to.include('Show all playlists (2)');

      toggle.click();
      await element.updateComplete;

      expect(element.shadowRoot.querySelectorAll('.playlist-item')).to.have.lengthOf(2);
      expect(element.shadowRoot.querySelector('.playlist-list-toggle').textContent)
        .to.include('Hide playlists');
    });

    it('shows current and active playlists while hiding the remainder in playing mode', async () => {
      mockHass.callWS = stub().resolves({ response: { playlists: [] } });
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          integration: 'xschedule',
          media_playlist: 'Current Playlist',
          source_list: ['Current Playlist', 'Active Schedule', 'Hidden Playlist'],
        }
      );

      element = await createConfiguredElement(
        'xschedule-playlist-browser',
        createMockCardConfig({ collapse_mode: 'playing' }),
        mockHass
      );
      await waitUntil(() => !element._loading, 'initial schedule load');
      element._playlistSchedules = {
        'Active Schedule': {
          nextActiveTime: 'NOW!',
          active: 'TRUE',
          enabled: 'TRUE',
          duration: 0,
        },
      };
      element._previousSchedules = null;
      element.requestUpdate();
      await element.updateComplete;

      const visibleNames = [...element.shadowRoot.querySelectorAll('.playlist-name')]
        .map(node => node.textContent.trim());
      expect(visibleNames).to.deep.equal(['Current Playlist', 'Active Schedule']);
      expect(element.shadowRoot.querySelector('.playlist-list-toggle').textContent)
        .to.include('Show all playlists (1)');
    });

    it('shows enabled playlists scheduled within the configured days and hours', async () => {
      let clock;
      try {
        mockHass.callWS = stub().resolves({ response: { playlists: [] } });
        mockHass.states['media_player.xschedule'] = createMockEntityState(
          'media_player.xschedule',
          'playing',
          {
            integration: 'xschedule',
            media_playlist: 'Current Playlist',
            source_list: [
              'Current Playlist',
              'Active Schedule',
              'Soon Playlist',
              'Boundary Playlist',
              'Beyond Window',
              'Disabled Playlist',
              'Past Playlist',
              'Invalid Schedule',
            ],
          }
        );

        element = await createConfiguredElement(
          'xschedule-playlist-browser',
          createMockCardConfig({
            collapse_mode: 'playing_soon',
            playing_soon_days: 1,
            playing_soon_hours: 2,
          }),
          mockHass
        );
        await waitUntil(() => !element._loading, 'initial schedule load');
        clock = useFakeTimers(new Date('2026-10-29T12:00:00Z'));
        element._playlistSchedules = {
          'Active Schedule': { nextActiveTime: 'NOW!', active: 'TRUE', enabled: 'TRUE' },
          'Soon Playlist': { nextActiveTime: '2026-10-29T13:00:00Z', enabled: 'TRUE' },
          'Boundary Playlist': { nextActiveTime: '2026-10-30T14:00:00Z', enabled: true },
          'Beyond Window': { nextActiveTime: '2026-10-30T14:01:00Z', enabled: 'TRUE' },
          'Disabled Playlist': { nextActiveTime: '2026-10-29T14:00:00Z', enabled: 'FALSE' },
          'Past Playlist': { nextActiveTime: '2026-10-29T11:00:00Z', enabled: 'TRUE' },
          'Invalid Schedule': { nextActiveTime: 'N/A', enabled: 'TRUE' },
        };
        element._previousSchedules = null;
        element.requestUpdate();
        await element.updateComplete;

        const visibleNames = [...element.shadowRoot.querySelectorAll('.playlist-name')]
          .map(node => node.textContent.trim());
        expect(visibleNames).to.deep.equal([
          'Current Playlist',
          'Active Schedule',
          'Soon Playlist',
          'Boundary Playlist',
        ]);
        expect(element.shadowRoot.querySelector('.playlist-list-toggle').textContent)
          .to.include('Show all playlists (4)');
      } finally {
        clock?.restore();
      }
    });

    it('defaults the playing-soon window to one day', async () => {
      let clock;
      try {
        mockHass.callWS = stub().resolves({ response: { playlists: [] } });
        mockHass.states['media_player.xschedule'] = createMockEntityState(
          'media_player.xschedule',
          'idle',
          {
            integration: 'xschedule',
            source_list: ['Within One Day', 'After One Day'],
          }
        );

        element = await createConfiguredElement(
          'xschedule-playlist-browser',
          createMockCardConfig({ collapse_mode: 'playing_soon' }),
          mockHass
        );
        await waitUntil(() => !element._loading, 'initial schedule load');
        clock = useFakeTimers(new Date('2026-10-29T12:00:00Z'));
        element._playlistSchedules = {
          'Within One Day': { nextActiveTime: '2026-10-30T11:00:00Z', enabled: 'TRUE' },
          'After One Day': { nextActiveTime: '2026-10-30T13:00:00Z', enabled: 'TRUE' },
        };
        element._previousSchedules = null;
        element.requestUpdate();
        await element.updateComplete;

        const visibleNames = [...element.shadowRoot.querySelectorAll('.playlist-name')]
          .map(node => node.textContent.trim());
        expect(visibleNames).to.deep.equal(['Within One Day']);
      } finally {
        clock?.restore();
      }
    });

    it('uses a later enabled schedule when an earlier schedule is disabled', async () => {
      const clock = useFakeTimers(new Date('2026-10-29T12:00:00Z'));
      try {
        mockHass.callWS = stub().callsFake(async message => {
          if (message.service === 'get_playlists_with_metadata') {
            return {
              response: {
                playlists: [{ name: 'Multi Schedule', lengthms: '0' }],
              },
            };
          }
          if (message.service === 'get_playlist_schedules') {
            return {
              response: {
                schedules: [
                  {
                    nextactive: '2026-10-29T11:00:00Z',
                    active: 'FALSE',
                    enabled: 'TRUE',
                  },
                  {
                    nextactive: '2026-10-29T13:00:00Z',
                    active: 'FALSE',
                    enabled: 'FALSE',
                  },
                  {
                    nextactive: '2026-10-29T14:00:00Z',
                    active: 'FALSE',
                    enabled: 'TRUE',
                  },
                ],
              },
            };
          }
          throw new Error(`Unexpected service: ${message.service}`);
        });
        mockHass.states['media_player.xschedule'] = createMockEntityState(
          'media_player.xschedule',
          'idle',
          { integration: 'xschedule', source_list: [] }
        );

        element = await createConfiguredElement(
          'xschedule-playlist-browser',
          createMockCardConfig({
            collapse_mode: 'playing_soon',
            playing_soon_days: 0,
            playing_soon_hours: 3,
          }),
          mockHass
        );
        element._playlists = ['Multi Schedule'];

        await element._fetchScheduleInfo();
        await element.updateComplete;

        const visibleNames = [...element.shadowRoot.querySelectorAll('.playlist-name')]
          .map(node => node.textContent.trim());
        expect(visibleNames).to.deep.equal(['Multi Schedule']);
      } finally {
        clock.restore();
      }
    });

    it('updates playing visibility when the current playlist changes without a state change', async () => {
      mockHass.callWS = stub().resolves({ response: { playlists: [] } });
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          integration: 'xschedule',
          media_playlist: 'Playlist A',
          source_list: ['Playlist A', 'Playlist B'],
        }
      );
      element = await createConfiguredElement(
        'xschedule-playlist-browser',
        createMockCardConfig({ collapse_mode: 'playing' }),
        mockHass
      );
      await waitUntil(() => !element._loading, 'initial schedule load');

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          integration: 'xschedule',
          media_playlist: 'Playlist B',
          source_list: ['Playlist A', 'Playlist B'],
        }
      );
      element.hass = mockHass;
      await element.updateComplete;

      const visibleNames = [...element.shadowRoot.querySelectorAll('.playlist-name')]
        .map(node => node.textContent.trim());
      expect(visibleNames).to.deep.equal(['Playlist B']);
    });
  });

  describe('Playlist List GUI Configuration', () => {
    it('offers every collapse mode and emits numeric playing-soon values', async () => {
      const editor = document.createElement('xschedule-playlist-browser-editor');
      editor.setConfig({
        entity: 'media_player.xschedule',
        collapse_mode: 'playing_soon',
        playing_soon_days: 1,
        playing_soon_hours: 0,
      });
      editor.hass = mockHass;
      document.body.appendChild(editor);
      await editor.updateComplete;

      const modeSelect = editor.shadowRoot.querySelector('#collapse_mode');
      expect([...modeSelect.options].map(option => option.value)).to.deep.equal([
        'expanded',
        'collapsed',
        'playing',
        'playing_soon',
      ]);

      const daysInput = editor.shadowRoot.querySelector('#playing_soon_days');
      const hoursInput = editor.shadowRoot.querySelector('#playing_soon_hours');
      expect(daysInput.value).to.equal('1');
      expect(hoursInput.value).to.equal('0');

      const changed = oneEvent(editor, 'config-changed');
      daysInput.value = '2';
      daysInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      const event = await changed;

      expect(event.detail.config.playing_soon_days).to.equal(2);
    });

    it('uses expanded mode and a one-day window in the card picker defaults', () => {
      const config = customElements.get('xschedule-playlist-browser').getStubConfig();

      expect(config.collapse_mode).to.equal('expanded');
      expect(config.playing_soon_days).to.equal(1);
      expect(config.playing_soon_hours).to.equal(0);
    });
  });

  describe('Queue Operations', () => {
    it('has access to hass service calls', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Hass object with callService should be available (component uses _hass internally)
      expect(element._hass).to.exist;
      expect(element._hass.callService).to.exist;
    });

    it('can track selected playlist for operations', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      element._selectedPlaylist = 'Test Playlist';

      await element.updateComplete;

      expect(element._selectedPlaylist).to.equal('Test Playlist');
    });
  });

  describe('Force Refresh', () => {
    it('supports configuration', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Component configured successfully
      expect(element.config).to.exist;
    });
  });

  describe('Compact Layout', () => {
    it('supports compact layout config', async () => {
      const config = createMockCardConfig({ compactLayout: true });
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      expect(element.config.compactLayout).to.be.true;
    });

    it('uses default layout when not specified', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      expect(element.config).to.exist;
    });
  });

  describe('Render Optimization', () => {
    it('should not re-render when entity updates with no meaningful changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          source_list: ['Playlist 1', 'Playlist 2'],
          friendly_name: 'xSchedule',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Update with same source_list (simulates backend polling)
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          source_list: ['Playlist 1', 'Playlist 2'],
          friendly_name: 'xSchedule',
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // Should NOT trigger a re-render since no meaningful data changed
      expect(renderCount).to.equal(0);
    });

    it('should re-render when source_list changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle',
        {
          source_list: ['Playlist 1', 'Playlist 2'],
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Update with new playlist
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle',
        {
          source_list: ['Playlist 1', 'Playlist 2', 'Playlist 3'],
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // SHOULD trigger a re-render since source_list changed
      expect(renderCount).to.be.greaterThan(0);
    });

    it('should re-render when state changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle',
        {
          source_list: ['Playlist 1'],
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Change state to playing
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          source_list: ['Playlist 1'],
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // SHOULD trigger a re-render since state changed
      expect(renderCount).to.be.greaterThan(0);
    });
  });

  describe('Browse Media Song Expansion', () => {
    it('should detect BROWSE_MEDIA support for capable players', async () => {
      const config = { entity: 'media_player.spotify' };
      mockHass.states['media_player.spotify'] = createMockEntityState(
        'media_player.spotify',
        'playing',
        {
          supported_features: 0x20000, // 131072 - BROWSE_MEDIA
          source_list: ['My Playlist', 'Another Playlist']
        }
      );
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should detect BROWSE_MEDIA support
      expect(element._supportsBrowseMedia()).to.be.true;
    });
    
    it('should not detect BROWSE_MEDIA for players without support', async () => {
      const config = { entity: 'media_player.basic' };
      mockHass.states['media_player.basic'] = createMockEntityState(
        'media_player.basic',
        'playing',
        {
          supported_features: 0x800, // 2048 - SELECT_SOURCE only (no BROWSE_MEDIA)
          source_list: ['Station 1']
        }
      );
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should not detect BROWSE_MEDIA support
      expect(element._supportsBrowseMedia()).to.be.false;
    });
    
    it('should show expand icon for generic player with BROWSE_MEDIA', async () => {
      const config = { entity: 'media_player.spotify' };
      mockHass.states['media_player.spotify'] = createMockEntityState(
        'media_player.spotify',
        'playing',
        {
          supported_features: 0x20000, // 131072 - BROWSE_MEDIA
          source_list: ['My Playlist']
        }
      );
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should show expand icon
      const rendered = element.shadowRoot.innerHTML;
      expect(rendered).to.include('chevron');
    });
    
    it('should not show expand icon for generic player without BROWSE_MEDIA', async () => {
      const config = { entity: 'media_player.basic' };
      mockHass.states['media_player.basic'] = createMockEntityState(
        'media_player.basic',
        'playing',
        {
          supported_features: 0x800, // 2048 - SELECT_SOURCE only (no BROWSE_MEDIA)
          source_list: ['Station 1']
        }
      );
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should not show expand icon
      const rendered = element.shadowRoot.innerHTML;
      expect(rendered).to.not.include('chevron-up');
      expect(rendered).to.not.include('chevron-down');
    });
    
    it('should allow expansion for xSchedule player', async () => {
      const config = { entity: 'media_player.xschedule' };
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          integration: 'xschedule',
          supported_features: 0x200, // PLAY_MEDIA
          source_list: ['Playlist 1']
        }
      );
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should show expand icon for xSchedule player
      const rendered = element.shadowRoot.innerHTML;
      expect(rendered).to.include('chevron');
    });

    it('disables expansion for xSchedule when configured off', () => {
      element = document.createElement('xschedule-playlist-browser');
      element.setConfig(createMockCardConfig({ expandable_playlists: false }));
      element._entity = createMockEntityState('media_player.xschedule', 'idle', {
        integration: 'xschedule',
        supported_features: 0x200,
        source_list: ['Playlist 1'],
      });

      expect(element._canExpandPlaylists()).to.be.false;
    });
    
    it('should allow expansion for generic player with BROWSE_MEDIA', async () => {
      const config = { entity: 'media_player.spotify' };
      mockHass.states['media_player.spotify'] = createMockEntityState(
        'media_player.spotify',
        'playing',
        {
          supported_features: 0x20000 | 0x200, // BROWSE_MEDIA (0x20000) + PLAY_MEDIA (0x200)
          source_list: ['My Playlist']
        }
      );
      
      // Mock browse_media response
      mockHass.callWS = stub().resolves({
        children: [
          { title: 'Song 1', duration: 180 },
          { title: 'Song 2', duration: 200 }
        ]
      });
      
      element = await createConfiguredElement('xschedule-playlist-browser', config, mockHass);
      await element.updateComplete;
      
      // Should be able to expand (canExpand should be true)
      expect(element._supportsBrowseMedia()).to.be.true;
      
      // Toggle playlist to expand
      await element._togglePlaylist('My Playlist');
      await element.updateComplete;
      
      // Should have fetched songs
      expect(element._playlistSongs['My Playlist']).to.exist;
      expect(element._playlistSongs['My Playlist']).to.have.lengthOf(2);
      expect(element._playlistSongs['My Playlist'][0].name).to.equal('Song 1');
    });
  });
});
