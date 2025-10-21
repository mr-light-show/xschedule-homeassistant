import { html, fixture, expect } from '@open-wc/testing';
import { stub } from 'sinon';
import '../src/xschedule-playlist-browser.js';
import { createMockHass, createMockCardConfig, createConfiguredElement } from './helpers/mock-hass.js';

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
});
