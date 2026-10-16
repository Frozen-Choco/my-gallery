import {afterEach, beforeEach, expect, it, vi} from 'vitest';

const settings = vi.hoisted(() => ({measurementId: 'G-TEST12345'}));
vi.mock('../analytics.config.json', () => ({default: settings}));
const calls = () => (window.dataLayer ?? []).map(entry => Array.from(entry as IArguments));
const events = () => calls().filter(entry => entry[0] === 'event');

beforeEach(() => {
  vi.resetModules();
  settings.measurementId = 'G-TEST12345';
  vi.stubEnv('PROD', true);
  vi.stubGlobal('location', {hostname:'frozen-choco.github.io', origin:'https://frozen-choco.github.io'});
});
afterEach(() => {
  delete window.dataLayer; delete window.gtag;
  localStorage.removeItem('gallery-analytics-disabled');
  document.querySelectorAll('script[src*="googletagmanager.com"]').forEach(script => script.remove());
  vi.unstubAllEnvs();
});

it('respects the browser opt-out before loading Google or sending later events', async () => {
  const {trackPage, trackDetail} = await import('../analytics');
  localStorage.setItem('gallery-analytics-disabled', '1');
  trackPage('styles', 'デザインスタイル');
  expect(calls()).toEqual([]);
  localStorage.removeItem('gallery-analytics-disabled');
  trackPage('styles', 'デザインスタイル');
  expect(events().length).toBe(1);
  localStorage.setItem('gallery-analytics-disabled', '1');
  trackDetail('styles', 'minimal');
  expect(events().length).toBe(1);
});

it('does not load Google or queue events without an ID, in development, or on a preview host', async () => {
  const {trackPage, trackDetail, trackDownload} = await import('../analytics');
  settings.measurementId = '';
  trackPage('styles', 'デザインスタイル');
  settings.measurementId = 'G-TEST12345'; vi.stubEnv('PROD', false);
  trackDetail('models', 'apple');
  vi.stubEnv('PROD', true); vi.stubGlobal('location', {hostname:'localhost'});
  trackDownload('apple', 'glb');
  expect(calls()).toEqual([]);
  expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
});

it('counts a category once across repeated effects and tracks returning visits with a virtual referrer', async () => {
  const {trackPage} = await import('../analytics');
  trackPage('styles', 'デザインスタイル');
  trackPage('styles', 'デザインスタイル');
  trackPage('models', '3Dモデル');
  trackPage('styles', 'デザインスタイル');
  expect(document.querySelectorAll('script[src*="googletagmanager.com"]').length).toBe(1);
  expect(calls().filter(call => call[0] === 'config')).toEqual([['config','G-TEST12345',{
    send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false,
  }]]);
  expect(events().length).toBe(3);
  expect(events()[1]).toEqual(['event','page_view',{
    page_location:'https://frozen-choco.github.io/my-gallery/models',
    page_title:'3Dモデル | 冷凍チョコ ギャラリー',
    page_referrer:'https://frozen-choco.github.io/my-gallery/styles',
  }]);
});

it('queues model IDs and file formats without depending on the external script loading', async () => {
  const {trackPage, trackDetail, trackDownload} = await import('../analytics');
  trackPage('models', '3Dモデル');
  trackDetail('models', 'red_apple');
  trackDownload('red_apple', 'glb');
  trackDownload('red_apple', 'blend');
  expect(events().slice(1)).toEqual([
    ['event','select_content',{content_type:'models',item_id:'red_apple'}],
    ['event','model_download',{content_type:'models',item_id:'red_apple',file_format:'glb'}],
    ['event','model_download',{content_type:'models',item_id:'red_apple',file_format:'blend'}],
  ]);
});
