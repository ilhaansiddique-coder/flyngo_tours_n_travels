import { defineConfig, devices } from '@playwright/test';

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl || new URL(databaseUrl).hostname !== '127.0.0.1' || new URL(databaseUrl).pathname !== '/flyngo_browser_test') {
  throw new Error('Browser tests require the disposable localhost flyngo_browser_test database');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3108',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: '../backend',
      url: 'http://127.0.0.1:4107/api/v1/health',
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        NODE_ENV: 'test', BACKEND_PORT: '4107', BACKEND_HOST: '127.0.0.1', DATABASE_URL: databaseUrl,
        FRONTEND_URL: 'http://127.0.0.1:3108', ADMIN_URL: 'http://127.0.0.1:3108',
        JWT_ACCESS_SECRET: 'release-test-access-secret-do-not-use-in-production',
        JWT_REFRESH_SECRET: 'release-test-refresh-secret-do-not-use-in-production',
        GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '',
        FACEBOOK_APP_ID: 'release-tests', FACEBOOK_APP_SECRET: 'unused-test-secret',
        EMAIL_QUEUE_ENABLED: 'false', RESEND_API_KEY: '', SMTP_HOST: '', SMTP_USER: '',
        SMTP_PASSWORD: '', SMTP_PASS: '', SMS_API_KEY: '', STRIPE_SECRET_KEY: '',
        FIREBASE_PROJECT_ID: '', FIREBASE_CLIENT_EMAIL: '', FIREBASE_PRIVATE_KEY: '',
      },
    },
    {
      command: 'node scripts/start-e2e.mjs',
      url: 'http://127.0.0.1:3108',
      reuseExistingServer: false,
      timeout: 60000,
      env: { NODE_ENV: 'production', PORT: '3108', HOSTNAME: '127.0.0.1', BACKEND_URL: 'http://127.0.0.1:4107' },
    },
  ],
});
