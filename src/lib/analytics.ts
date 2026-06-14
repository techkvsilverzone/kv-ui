/**
 * Analytics + error monitoring, gated entirely on env vars so the app runs untouched
 * when no keys are configured (local dev, preview).
 *   VITE_SENTRY_DSN — enables Sentry error monitoring (disabled when blank)
 *   VITE_GA4_ID     — enables Google Analytics 4 page/event tracking
 *
 * Sentry is loaded lazily (dynamic import) only when a DSN is present, so when it's
 * disabled the SDK isn't initialised or shipped in the main bundle. Re-enable it by
 * simply setting VITE_SENTRY_DSN — no code change needed.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaReady = false;

const initSentry = async () => {
  if (!SENTRY_DSN) return;
  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
};

const initGA4 = () => {
  if (!GA4_ID || typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  // We send page_view manually on route change for an SPA.
  window.gtag('config', GA4_ID, { send_page_view: false });
  gaReady = true;
};

/** Call once on app startup (before render). */
export const initMonitoring = () => {
  void initSentry();
  initGA4();
};

/** Record an SPA page view (GA4). No-op when GA isn't configured. */
export const trackPageview = (path: string) => {
  if (!gaReady || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href });
};
