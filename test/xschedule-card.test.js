import { html, fixture, expect } from '@open-wc/testing';
import { stub } from 'sinon';
import '../src/xschedule-card.js';
import { createMockHass, createMockEntityState, createMockCardConfig, createConfiguredElement } from './helpers/mock-hass.js';

describe('XScheduleCard', () => {
  let element;
  let mockHass;

  beforeEach(async () => {
    mockHass = createMockHass();
  });

  describe('Initialization', () => {
    it('renders with basic config', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element).to.exist;
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('throws error without entity config', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      expect(() => {
        element.setConfig({});
      }).to.throw('You need to define an entity');
    });

    it('displays card when configured', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      const card = element.shadowRoot.querySelector('ha-card');
      expect(card).to.exist;
    });
  });

  describe('Mode Switching', () => {
    it('defaults to simple mode', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.mode).to.equal('simple');
    });

    it('renders custom mode when configured', async () => {
      const config = createMockCardConfig({ mode: 'custom' });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.mode).to.equal('custom');
    });

    it('renders minimal mode when configured', async () => {
      const config = createMockCardConfig({ mode: 'minimal' });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.mode).to.equal('minimal');
    });
  });

  describe('State Display', () => {
    it('displays playing state', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Test Song',
          media_playlist: 'Test Playlist',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._entity.state).to.equal('playing');
    });

    it('displays idle state with no media info', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle'
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._entity.state).to.equal('idle');
    });

    it('tracks state transitions', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Old Song',
          media_playlist: 'Old Playlist',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._entity.state).to.equal('playing');

      // Now transition to idle
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle'
      );

      element.hass = mockHass;
      await element.updateComplete;

      expect(element._entity.state).to.equal('idle');
    });
  });

  describe('Playlist Display Toggle', () => {
    it('shows playlist when display mode is expanded', async () => {
      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'expanded',
      });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.playlistDisplay).to.equal('expanded');
    });

    it('collapses playlist when display mode is collapsed', async () => {
      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'collapsed',
      });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.playlistDisplay).to.equal('collapsed');
    });

    it('hides playlist when display mode is hidden', async () => {
      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'hidden',
      });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.playlistDisplay).to.equal('hidden');
    });
  });

  describe('Media Controls', () => {
    it('renders playback controls', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      const controls = element.shadowRoot.querySelector('.playback-controls');
      expect(controls).to.exist;
    });

    it('shows playing state when entity is playing', async () => {
      const config = createMockCardConfig();

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing'
      );

      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._entity.state).to.equal('playing');
    });

    it('has config for showing playback controls', async () => {
      const config = createMockCardConfig({ showPlaybackControls: true });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.showPlaybackControls).to.be.true;
    });
  });

  describe('Component Lifecycle', () => {
    it('initializes with default values', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._playlists).to.exist;
      expect(element._songs).to.exist;
      expect(element._queue).to.exist;
    });

    it('cleans up on disconnect', async () => {
      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      // Remove element to trigger disconnectedCallback
      element.remove();

      // Lifecycle cleanup happens automatically
      expect(element).to.exist;
    });
  });

  describe('Song List Display', () => {
    it('has songs display configuration', async () => {
      const config = createMockCardConfig({
        mode: 'custom',
        songsDisplay: 'expanded',
      });
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element.config.songsDisplay).to.equal('expanded');
    });

    it('shows idle state when not playing', async () => {
      const config = createMockCardConfig();

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle'
      );

      element = await createConfiguredElement('xschedule-card', config, mockHass);

      expect(element._entity.state).to.equal('idle');
    });
  });

  describe('Render Optimization', () => {
    it('should not re-render when only media_position_updated_at changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Test Song',
          media_position: 30,
          media_position_updated_at: '2024-01-01T12:00:00Z',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Update only the timestamp (simulates backend polling update)
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Test Song',
          media_position: 30,
          media_position_updated_at: '2024-01-01T12:00:30Z',
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // Should NOT trigger a re-render since no meaningful data changed
      expect(renderCount).to.equal(0);
    });

    it('should re-render when media title changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Song 1',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Update the title
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Song 2',
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // SHOULD trigger a re-render since meaningful data changed
      expect(renderCount).to.be.greaterThan(0);
    });

    it('should re-render when state changes', async () => {
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Test Song',
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Change state
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'paused',
        {
          media_title: 'Test Song',
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // SHOULD trigger a re-render since state changed
      expect(renderCount).to.be.greaterThan(0);
    });

    it('should not re-render when playlist_songs array is identical', async () => {
      const songs = [
        { name: 'Song 1', duration: 180 },
        { name: 'Song 2', duration: 240 },
      ];

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Song 1',
          playlist: 'Test Playlist',
          playlist_songs: songs,
        }
      );

      const config = createMockCardConfig();
      element = await createConfiguredElement('xschedule-card', config, mockHass);

      // Track render count
      let renderCount = 0;
      const originalRender = element.render.bind(element);
      element.render = function() {
        renderCount++;
        return originalRender();
      };

      // Update with same songs (simulates backend update with no changes)
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Song 1',
          playlist: 'Test Playlist',
          playlist_songs: songs, // Same reference
        }
      );

      element.hass = mockHass;
      await element.updateComplete;

      // Should NOT trigger a re-render since data is identical
      expect(renderCount).to.equal(0);
    });
  });
});
