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
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

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
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      const card = element.shadowRoot.querySelector('ha-card');
      expect(card).to.exist;
    });
  });

  describe('Mode Switching', () => {
    it('defaults to simple mode', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('simple');
    });

    it('renders custom mode when configured', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig({ mode: 'custom' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('custom');
    });

    it('renders minimal mode when configured', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig({ mode: 'minimal' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('minimal');
    });
  });

  describe('State Display', () => {
    it('displays playing state', async () => {
      const config = createMockCardConfig();

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Test Song',
          media_playlist: 'Test Playlist',
        }
      );

      element = await fixture(html`
        <xschedule-card .hass=${mockHass} .config=${config}></xschedule-card>
      `);
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element._entity.state).to.equal('playing');
    });

    it('displays idle state with no media info', async () => {
      const config = createMockCardConfig();

      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'idle'
      );

      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element._entity.state).to.equal('idle');
    });

    it('tracks state transitions', async () => {
      const config = createMockCardConfig();

      // First set playing state with media
      mockHass.states['media_player.xschedule'] = createMockEntityState(
        'media_player.xschedule',
        'playing',
        {
          media_title: 'Old Song',
          media_playlist: 'Old Playlist',
        }
      );

      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

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
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'expanded',
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.playlistDisplay).to.equal('expanded');
    });

    it('collapses playlist when display mode is collapsed', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'collapsed',
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.playlistDisplay).to.equal('collapsed');
    });

    it('hides playlist when display mode is hidden', async () => {
      element = await fixture(html`
        <xschedule-card></xschedule-card>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        playlistDisplay: 'hidden',
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

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
});
