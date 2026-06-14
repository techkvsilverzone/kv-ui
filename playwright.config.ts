import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e config. Tests live in ./e2e (outside src/, so vitest ignores them).
 * Run: `npm run test:e2e` (starts the dev server automatically).
 * First run only: `npx playwright install chromium` to download the browser.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
