import { test as base, expect } from '@playwright/test';
import BasePage from '../pages/base-page';
import HomePage from '../pages/home-page';
import ContactPage from '../pages/contact-page';
import InsightsPage from '../pages/insights-page';
import NotFoundPage from '../pages/not-found-page';
import CookieDeclarationPage from '../pages/cookie-declaration-page';
import HeaderComponent from '../pages/components/header-component';
import FooterComponent from '../pages/components/footer-component';
import CookieBanner from '../pages/components/cookie-banner';
import NetworkGuard from '../utils/network-guard';
import ConsoleMonitor from '../utils/console-monitor';
import { consentStorageStatePaths, type ConsentState } from '../test-data/consent';

type TestOptions = {
  /** Cookie-consent state the browser starts with. Default 'declined': no banner and no trackers firing. */
  consentState: ConsentState;
  /** Abort images, media and fonts (for DOM-only checks such as SEO metadata). */
  blockHeavyResources: boolean;
};

type TestFixtures = {
  basePage: BasePage;
  homePage: HomePage;
  contactPage: ContactPage;
  insightsPage: InsightsPage;
  notFoundPage: NotFoundPage;
  cookieDeclarationPage: CookieDeclarationPage;
  header: HeaderComponent;
  footer: FooterComponent;
  cookieBanner: CookieBanner;
  networkGuard: NetworkGuard;
  consoleMonitor: ConsoleMonitor;
};

export const test = base.extend<TestOptions & TestFixtures>({
  consentState: ['declined', { option: true }],
  blockHeavyResources: [false, { option: true }],

  storageState: async ({ consentState }, use) => {
    await use(consentState === 'none' ? undefined : consentStorageStatePaths[consentState]);
  },

  networkGuard: [
    async ({ context, baseURL, blockHeavyResources }, use) => {
      const networkGuard = new NetworkGuard(context, baseURL!);
      await networkGuard.enable({ blockHeavyResources });
      await use(networkGuard);
    },
    { auto: true },
  ],

  consoleMonitor: async ({ page, baseURL, networkGuard }, use) => {
    await use(new ConsoleMonitor(page, baseURL!, networkGuard));
  },

  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  insightsPage: async ({ page }, use) => {
    await use(new InsightsPage(page));
  },
  notFoundPage: async ({ page }, use) => {
    await use(new NotFoundPage(page));
  },
  cookieDeclarationPage: async ({ page }, use) => {
    await use(new CookieDeclarationPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  footer: async ({ page }, use) => {
    await use(new FooterComponent(page));
  },
  cookieBanner: async ({ page }, use) => {
    await use(new CookieBanner(page));
  },
});

export { expect };
