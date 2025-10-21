import { html, fixture, expect } from '@open-wc/testing';
import '../src/xschedule-card-editor.js';
import { createMockHass, createMockCardConfig } from './helpers/mock-hass.js';

describe('XScheduleCardEditor', () => {
  let element;
  let mockHass;

  beforeEach(async () => {
    mockHass = createMockHass();
  });

  describe('Initialization', () => {
    it('renders editor with config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element).to.exist;
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('renders without config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      await element.updateComplete;

      // Should render empty when no config
      expect(element).to.exist;
    });
  });

  describe('Entity Selection', () => {
    it('has entity selection dropdown', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      const entitySelect = element.shadowRoot.querySelector('select#entity');
      expect(entitySelect).to.exist;
    });

    it('stores entity in config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({ entity: 'media_player.test' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.entity).to.equal('media_player.test');
    });
  });

  describe('Mode Selection', () => {
    it('has mode selector', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      const modeSelect = element.shadowRoot.querySelector('select#mode');
      expect(modeSelect).to.exist;
    });

    it('shows selected mode', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({ mode: 'custom' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('custom');
    });
  });

  describe('Display Mode Configuration', () => {
    it('has playlist display config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
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

    it('has songs display config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        songsDisplay: 'collapsed',
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.songsDisplay).to.equal('collapsed');
    });

    it('has queue display config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        queueDisplay: 'hidden',
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.queueDisplay).to.equal('hidden');
    });
  });

  describe('Custom Mode Options', () => {
    it('supports custom mode', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({ mode: 'custom' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('custom');
    });

    it('supports simple mode', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({ mode: 'simple' });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.mode).to.equal('simple');
    });
  });

  describe('Boolean Options', () => {
    it('stores boolean config values', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({
        mode: 'custom',
        hidePlaylistName: true,
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.hidePlaylistName).to.be.true;
    });

    it('supports progress bar config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig({
        showProgressBar: false,
      });
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.showProgressBar).to.be.false;
    });
  });

  describe('Config Updates', () => {
    it('maintains config state', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config = createMockCardConfig();
      element.setConfig(config);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config).to.exist;
      expect(element.config.entity).to.equal('media_player.xschedule');
    });

    it('can update config', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      const config1 = createMockCardConfig({ name: 'Name 1' });
      element.setConfig(config1);
      element.hass = mockHass;

      await element.updateComplete;

      expect(element.config.name).to.equal('Name 1');

      const config2 = createMockCardConfig({ name: 'Name 2' });
      element.setConfig(config2);

      await element.updateComplete;

      expect(element.config.name).to.equal('Name 2');
    });
  });

  describe('Tab Navigation', () => {
    it('initializes with default tab', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      expect(element._currentTab).to.equal('general');
    });

    it('can track current tab', async () => {
      element = await fixture(html`
        <xschedule-card-editor></xschedule-card-editor>
      `);

      element._currentTab = 'display';

      await element.updateComplete;

      expect(element._currentTab).to.equal('display');
    });
  });
});
