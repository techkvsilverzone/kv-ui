/**
 * Build-target + runtime platform helpers.
 *
 * `VITE_APP_TARGET=mobile` is set by the Capacitor build (see package.json
 * `build:mobile`). It strips admin-only surfaces from the bundle and switches
 * auth to a Bearer-token flow (the web build stays cookie-based).
 *
 * `isNativeRuntime()` is a defensive secondary check: even on a web build, if
 * the code somehow runs inside a Capacitor WebView we still want native
 * behaviour. Capacitor injects `window.Capacitor` at runtime.
 */
export const IS_MOBILE_BUILD = import.meta.env.VITE_APP_TARGET === 'mobile';

export const isNativeRuntime = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
};

/** True when the app should use the mobile (Bearer-token, no-admin) behaviour. */
export const isMobileApp = (): boolean => IS_MOBILE_BUILD || isNativeRuntime();

export const TOKEN_STORAGE_KEY = 'kv-silver-token';
