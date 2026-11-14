import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { collaborationTestConfig, withClerkKeyFallback } from './e2e/clerk-test-config';

config({ path: '.env.test' });
// Vite reads .env itself; only copy Clerk's keys into the test runner.
const appEnv = config({ path: '.env', processEnv: {}, quiet: true }).parsed ?? {};
withClerkKeyFallback(process.env, appEnv);
const collaboration = collaborationTestConfig(process.env);
if (collaboration) {
  process.env.GO_SERVER_URL = collaboration.apiURL;
  process.env.VITE_GO_SERVER_URL = collaboration.apiURL;
  process.env.VITE_COLLAB_WS_URL = collaboration.apiURL.replace(/^http/, 'ws');
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/clerk.global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 90 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/session.json' },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !collaboration,
    timeout: 120 * 1000,
  },
});
