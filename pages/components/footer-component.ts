import type { Locator, Page } from '@playwright/test';
import BasePage from '../base-page';

export default class FooterComponent extends BasePage {
  readonly root: Locator;
  readonly logo: Locator;
  readonly legalNavigation: Locator;
  readonly copyright: Locator;
  readonly certificationsHeading: Locator;
  readonly certificationsSection: Locator;
  readonly moreAboutUsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByRole('contentinfo');
    this.logo = this.root.getByRole('img', { name: 'IT Labs Logo' });
    this.legalNavigation = this.root.getByRole('navigation', { name: 'Legal' });
    this.copyright = this.root.getByText(/©\s*\d{4}\s+IT Labs/);
    this.certificationsHeading = this.root.getByRole('heading', { name: /Certifications &\s*partnerships/ });
    this.certificationsSection = this.certificationsHeading.locator('..');
    this.moreAboutUsLink = this.root.getByRole('link', { name: 'More about us' });
  }

  columnHeading(name: string): Locator {
    return this.root.getByRole('heading', { level: 2, name, exact: true });
  }

  link(name: string): Locator {
    return this.root.getByRole('link', { name, exact: true });
  }

  legalLink(name: string): Locator {
    return this.legalNavigation.getByRole('link', { name, exact: true });
  }

  socialLink(network: string): Locator {
    return this.root.getByRole('link', { name: `IT Labs on ${network} (opens in a new tab)` });
  }

  certification(name: string): Locator {
    return this.root.getByRole('listitem').filter({ hasText: new RegExp(`^${name.replace(/[/.]/g, '\\$&')}$`) });
  }

  async scrollIntoView(): Promise<void> {
    await this.root.scrollIntoViewIfNeeded();
  }
}
