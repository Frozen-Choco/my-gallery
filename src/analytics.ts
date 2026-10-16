import config from './analytics.config.json';
import type {Page, SitePage} from './types';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let previousPage: string | undefined;

function initialize() {
  if (!import.meta.env.PROD || location.hostname !== 'frozen-choco.github.io' || !/^G-[A-Z0-9]+$/.test(config.measurementId)) return false;
  try {if (localStorage.getItem('gallery-analytics-disabled') === '1') return false;} catch {return false;}
  if (initialized) return true;
  window.dataLayer ??= [];
  window.gtag ??= function (..._args: unknown[]) {window.dataLayer!.push(arguments);};
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.append(script);
  initialized = true;
  return true;
}

export function trackPage(page: SitePage, title: string) {
  if (!initialize()) return;
  // Virtual paths keep hash-based categories distinct in GA4's standard reports.
  const url = `${location.origin}/my-gallery/${page}`;
  if (url === previousPage) return;
  window.gtag!('set', {page_location: url, page_title: `${title} | 冷凍チョコ ギャラリー`});
  window.gtag!('event', 'page_view', {
    page_location: url,
    page_title: `${title} | 冷凍チョコ ギャラリー`,
    page_referrer: previousPage ?? document.referrer,
  });
  previousPage = url;
}

export function trackDetail(page: Page, itemId: string) {
  if (!initialize()) return;
  window.gtag!('event', 'select_content', {content_type: page, item_id: itemId});
}

export function trackDownload(itemId: string, format: 'glb' | 'blend') {
  if (!initialize()) return;
  // A custom name distinguishes these clicks from GA4's automatic file_download.
  window.gtag!('event', 'model_download', {content_type: 'models', item_id: itemId, file_format: format});
}
