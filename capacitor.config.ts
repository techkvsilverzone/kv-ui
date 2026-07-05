import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the Vite build (the `dist/` folder) into a native Android
 * shell that ships only the customer experience. Produce that build with
 * `npm run build:mobile` (sets VITE_APP_TARGET=mobile to drop the admin panel),
 * then `npx cap sync` to copy it into the native project.
 *
 * NOTE: the bundled app cannot reach `localhost` — set VITE_API_URL to a
 * reachable server before `build:mobile` (the Android emulator sees the host
 * machine as http://10.0.2.2:<port>).
 */
const config: CapacitorConfig = {
  appId: 'com.kvsilverzone.app',
  appName: 'KV Silver Zone',
  webDir: 'dist',
};

export default config;
