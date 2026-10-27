import type { Page, Request } from '@playwright/test';
import { test, expect } from '../../fixtures/test-fixtures';
import { tracking } from '../../test-data/tracking';
import { cookieDeclaration } from '../../test-data/consent';
import { knownIssues } from '../../test-data/known-issues';

function isTracker(request: Request): boolean {
  return tracking.trackerUrlPatterns.some((pattern) => pattern.test(request.url()));
}

function recordTrackerRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (isTracker(request)) urls.push(request.url());
  });
  return urls;
}

async function isGtmContainerLoaded(page: Page): Promise<boolean> {
  return page.evaluate((containerId) => Boolean(window.google_tag_manager?.[containerId]), tracking.gtmContainerId);
}

async function getConsentModeCommands(page: Page): Promise<{ command: string; state: Record<string, string> }[]> {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((args) => args[0] === 'consent')
      .map((args) => ({ command: args[1] as string, state: args[2] as Record<string, string> })),
  );
}

test.describe('first visit, no consent given yet', () => {
  test.use({ consentState: 'none' });

  test('cookie banner offers "Allow all" and "Deny"', async ({ homePage, cookieBanner }) => {
    await homePage.open();

    await expect(cookieBanner.dialog).toBeVisible();
    await expect(cookieBanner.allowAllButton).toBeVisible();
    await expect(cookieBanner.denyButton).toBeVisible();
  });

  test('no tracking tags load and Google consent mode defaults to denied', async ({ homePage, cookieBanner }) => {
    const trackerRequests = recordTrackerRequests(homePage.page);

    await homePage.open();
    await expect(cookieBanner.dialog).toBeVisible();
    await homePage.page.waitForLoadState('networkidle');

    expect(trackerRequests).toEqual([]);
    expect(await isGtmContainerLoaded(homePage.page)).toBe(false);
    const defaults = (await getConsentModeCommands(homePage.page)).find((entry) => entry.command === 'default');
    expect(defaults?.state).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });

  test('"Deny" hides the banner and keeps tracking off after reload', async ({ homePage, cookieBanner }) => {
    await homePage.open();
    await cookieBanner.denyAll();

    expect(await cookieBanner.getConsent()).toMatchObject({ necessary: true, preferences: false, statistics: false, marketing: false });
    expect(await cookieBanner.getConsentCookie()).toBeDefined();

    const trackerRequests = recordTrackerRequests(homePage.page);
    await homePage.reloadPage();
    await homePage.page.waitForLoadState('networkidle');

    await expect(cookieBanner.dialog).toBeHidden();
    expect(trackerRequests).toEqual([]);
    expect(await isGtmContainerLoaded(homePage.page)).toBe(false);
  });

  test('"Allow all" grants consent and starts GTM and GA4', async ({ homePage, cookieBanner, networkGuard }) => {
    await homePage.open();
    const ga4Hit = homePage.page.waitForRequest((request) => request.url().includes(`tid=${tracking.ga4MeasurementId}`));

    await cookieBanner.acceptAll();

    expect(await cookieBanner.getConsent()).toMatchObject({ necessary: true, preferences: true, statistics: true, marketing: true });
    await expect.poll(() => isGtmContainerLoaded(homePage.page)).toBe(true);
    await ga4Hit;
    const update = (await getConsentModeCommands(homePage.page)).findLast((entry) => entry.command === 'update');
    expect(update?.state).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted' });
    expect(networkGuard.blockedBeacons.length, 'analytics hits are aborted, never sent').toBeGreaterThan(0);
  });
});

test.describe('returning visitor who accepted cookies', () => {
  test.use({ consentState: 'accepted' });

  test('banner stays hidden and tags load straight away', async ({ homePage, cookieBanner }) => {
    await homePage.open();

    await expect.poll(() => isGtmContainerLoaded(homePage.page)).toBe(true);
    await expect(cookieBanner.dialog).toBeHidden();
    expect(await cookieBanner.getConsent()).toMatchObject({ statistics: true, marketing: true });
  });
});

test.describe('returning visitor who denied cookies', () => {
  test.use({ consentState: 'declined' });

  test('banner stays hidden and no tags load', async ({ homePage, cookieBanner }) => {
    const trackerRequests = recordTrackerRequests(homePage.page);

    await homePage.open();
    await homePage.page.waitForLoadState('networkidle');

    await expect(cookieBanner.dialog).toBeHidden();
    expect(trackerRequests).toEqual([]);
  });
});

test('cookie declaration page lists the cookies by category', async ({ cookieDeclarationPage }) => {
  await cookieDeclarationPage.open();

  await expect(cookieDeclarationPage.declaration).toBeVisible();
  await expect(cookieDeclarationPage.changeConsentLink).toBeVisible();
  for (const category of cookieDeclaration.categories) {
    await expect(cookieDeclarationPage.categoryHeader(category)).toBeVisible();
  }
  expect(await cookieDeclarationPage.cookieTables.count()).toBeGreaterThanOrEqual(cookieDeclaration.categories.length);
});

test('no cookies are left unclassified in Cookiebot', async ({ cookieDeclarationPage }) => {
  test.fail(knownIssues.unclassifiedCookies.open, knownIssues.unclassifiedCookies.description);
  await cookieDeclarationPage.open();
  await expect(cookieDeclarationPage.categoryHeader('Necessary')).toBeVisible();

  // Unclassified cookies cannot be blocked by consent category, so they must stay at zero.
  await expect(cookieDeclarationPage.categoryHeader('Unclassified')).toHaveCount(0);
});
