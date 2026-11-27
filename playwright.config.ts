import { defineConfig } from '@playwright/test'

const url = 'http://127.0.0.1:4317'

export default defineConfig({
  testDir: './visual',
  testMatch: '**/*.visual.ts',
  outputDir: './test-results/visual',
  snapshotPathTemplate: '{testDir}/snapshots/{projectName}/{arg}{ext}',
  updateSnapshots: 'none',
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: url,
    browserName: 'chromium',
    colorScheme: 'light',
    deviceScaleFactor: 1,
    locale: 'ru-RU',
    reducedMotion: 'reduce',
    timezoneId: 'Europe/Moscow',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1360, height: 960 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4317 --strictPort',
    url,
  },
})
