import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 45000,
  expect: { timeout: 7000 },
  use: {
    baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure',
    // Most specs exercise features directly, as someone who has finished the story once. guided-run.spec.ts starts fresh.
    storageState: { cookies: [], origins: [{ origin: 'http://127.0.0.1:4173', localStorage: [{ name: 'praashi-keepsake-v1', value: JSON.stringify({ scene: 0, reached: 6, completed: true, narrativeVersion: 2 }) }] }] },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
});
