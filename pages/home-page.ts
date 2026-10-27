import type { Locator, Page, Response } from '@playwright/test';
import BasePage from './base-page';
import { homePageContent } from '../test-data/home-page';

export default class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly heroSlides: Locator;
  readonly clientLogosSection: Locator;
  readonly clientLogos: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.getByRole('region', { name: 'Introduction' });
    this.heroSlides = this.heroSection.getByRole('img');
    this.clientLogosSection = page.getByRole('main').locator('section').filter({ hasText: homePageContent.clientLogosLabel });
    this.clientLogos = this.clientLogosSection.getByRole('img');
  }

  async open(): Promise<Response | null> {
    return this.navigateTo('/');
  }

  heroLink(name: string | RegExp): Locator {
    return this.heroSection.getByRole('link', { name });
  }

  heroStat(value: string, label: string): Locator {
    return this.heroSection.getByText(value, { exact: true }).locator('..').filter({ hasText: label });
  }

  sectionHeading(name: string): Locator {
    return this.page.getByRole('main').getByRole('heading', { level: 2, name, exact: true });
  }
}
