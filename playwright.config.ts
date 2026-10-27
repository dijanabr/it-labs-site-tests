import { defineConfig, devices, type PlaywrightTestOptions } from '@playwright/test';
import 'dotenv/config';
import { site } from './test-data/site';

const baseURL = process.env.BASE_URL ?? site.productionUrl;

type DeviceDescriptor = (typeof devices)[string];

// The site's AWS load balancer answers 403 to "HeadlessChrome" user agents. Every project therefore sends
// its device's regular browser UA plus a token that makes regression traffic easy to recognise in server logs.
function withRegressionUserAgent(device: DeviceDescriptor): Partial<PlaywrightTestOptions> & DeviceDescriptor {
  return { ...device, userAgent: `${device.userAgent} ${site.regressionUserAgentToken}` };
}

const desktop = { ...withRegressionUserAgent(devices['Desktop Chrome']), viewport: { width: 1440, height: 900 } };

export default defineConfig({
  testDir: './tests',
  snapshotDir: './snapshots',
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{arg}-{platform}{ext}',
  outputDir: './test-results',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Production site: keep the load low.
  workers: 2,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'en-US',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Clicks through the real Cookiebot banner once per run and stores "accepted" / "declined" consent states.
    { name: 'setup', testDir: './fixtures', testMatch: /consent\.setup\.ts/, use: desktop },

    {
      name: 'desktop-chrome',
      testIgnore: [/responsive\//, /visual\//],
      dependencies: ['setup'],
      use: desktop,
    },
    {
      name: 'mobile-chrome',
      testMatch: /responsive\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: withRegressionUserAgent(devices['Pixel 7']),
    },
    {
      name: 'mobile-safari',
      testMatch: /responsive\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: withRegressionUserAgent(devices['iPhone 14']),
    },
    {
      name: 'tablet',
      testMatch: /responsive\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: withRegressionUserAgent(devices['iPad Mini']),
    },

    // Visual baselines are opt-in (npm run test:visual) because they need an approved baseline first.
    { name: 'visual-desktop', testMatch: /visual\/.*\.spec\.ts/, dependencies: ['setup'], use: desktop },
    {
      name: 'visual-mobile',
      testMatch: /visual\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: withRegressionUserAgent(devices['Pixel 7']),
    },
  ],
});
