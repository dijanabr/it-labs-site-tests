import { test as setup, expect } from '@playwright/test';
import CookieBanner from '../pages/components/cookie-banner';
import { consentStorageStatePaths } from '../test-data/consent';
import { tracking } from '../test-data/tracking';

// Clicks the real Cookiebot banner once per run and saves the resulting browser state, so tests can start
// with consent already given or refused (see the consentState option in test-fixtures.ts).

setup.beforeEach(async ({ context }) => {
  // Accepting consent loads the trackers; keep their hits out of production analytics.
  await context.route((url) => tracking.beaconUrlPatterns.some((pattern) => pattern.test(url.href)), (route) => route.abort());
});

setup('store "accepted" consent state', async ({ page }) => {
  const cookieBanner = new CookieBanner(page);
  await cookieBanner.navigateTo('/');
  await cookieBanner.acceptAll();
  await expect.poll(() => cookieBanner.getConsentCookie()).toBeDefined();
  await page.context().storageState({ path: consentStorageStatePaths.accepted });
});

setup('store "declined" consent state', async ({ page }) => {
  const cookieBanner = new CookieBanner(page);
  await cookieBanner.navigateTo('/');
  await cookieBanner.denyAll();
  await expect.poll(() => cookieBanner.getConsentCookie()).toBeDefined();
  await page.context().storageState({ path: consentStorageStatePaths.declined });
});
