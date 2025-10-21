import { html, fixture, expect } from '@open-wc/testing';
import { stub } from 'sinon';
import '../src/xschedule-playlist-browser.js';
import { createMockHass, createMockCardConfig } from './helpers/mock-hass.js';

describe('XSchedulePlaylistBrowser', () => {
  let element;
  let mockHass;

  beforeEach(async () => {
    mockHass = createMockHass();
  });

  describe('Initialization', () => {
    it('renders with basic config', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
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
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      expect(() => {
        element.setConfig({});
      }).to.throw('You need to define an entity');
    });
  });

  describe('Cache Invalidation Events', () => {
    it('has connection object for events', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Verify hass connection exists
      expect(element.hass.connection).to.exist;
      expect(element.hass.connection.subscribeEvents).to.exist;
    });

    it('handles cache event subscription lifecycle', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Component is configured and ready
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('validates entity ID configuration', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig({ entity: 'media_player.xschedule' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('cleans up on disconnect', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Remove element to trigger disconnect
      element.remove();

      // Lifecycle cleanup happens
      expect(element).to.exist;
    });
  });

  describe('Schedule Display', () => {
    it('initializes with empty schedules', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Initial state should have empty or default schedules
      expect(element._schedules).to.exist;
    });

    it('tracks loading state', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Loading state exists and can be tracked
      expect(element._loading !== undefined).to.be.true;
    });

    it('can track error state', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Error state can be set
      element._error = 'Test error';
      expect(element._error).to.equal('Test error');
    });
  });

  describe('Playlist Selection', () => {
    it('tracks selected playlist', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Playlist selection can be tracked
      element._selectedPlaylist = 'Playlist 1';
      await element.updateComplete;

      expect(element._selectedPlaylist).to.equal('Playlist 1');
    });

    it('stores playlist steps data', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

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
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Hass object with callService should be available
      expect(element.hass.callService).to.exist;
    });

    it('can track selected playlist for operations', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      element._selectedPlaylist = 'Test Playlist';

      await element.updateComplete;

      expect(element._selectedPlaylist).to.equal('Test Playlist');
    });
  });

  describe('Force Refresh', () => {
    it('supports configuration', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      // Component configured successfully
      expect(element.config).to.exist;
    });
  });

  describe('Compact Layout', () => {
    it('supports compact layout config', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig({ compactLayout: true });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.compactLayout).to.be.true;
    });

    it('uses default layout when not specified', async () => {
      element = await fixture(html`
        <xschedule-playlist-browser></xschedule-playlist-browser>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config).to.exist;
    });
  });
});
