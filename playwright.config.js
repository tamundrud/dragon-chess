import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'on',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'phone-360-portrait', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } } },
    { name: 'phone-390-portrait', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', viewport: { width: 390, height: 844 } } },
    { name: 'phone-landscape', use: { ...devices['Pixel 5'], viewport: { width: 800, height: 360 } } },
    { name: 'tablet', use: { ...devices['iPad Mini'], defaultBrowserType: 'chromium', viewport: { width: 768, height: 1024 } } },
  ],
});
