import type { Locator, Page } from '@playwright/test';
import BasePage from '../base-page';

export default class HeaderComponent extends BasePage {
  readonly root: Locator;
  readonly logoLink: Locator;
  readonly navigation: Locator;
  readonly ctaLink: Locator;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByRole('banner');
    this.logoLink = this.root.getByRole('link', { name: 'IT Labs Logo' });
    this.navigation = this.root.getByRole('navigation', { name: 'Menu' });
    this.ctaLink = this.navigation.getByRole('link', { name: /Let's talk/ });
    this.openMenuButton = this.root.getByRole('button', { name: 'Open', exact: true });
    this.closeMenuButton = this.root.getByRole('button', { name: 'Close', exact: true });
  }

  dropdownItem(label: string): Locator {
    return this.navigation.getByRole('listitem').filter({ has: this.page.getByText(label, { exact: true }) });
  }

  dropdownToggle(label: string): Locator {
    return this.dropdownItem(label).getByRole('button', { name: 'Toggle dropdown' });
  }

  dropdownLabel(label: string): Locator {
    return this.navigation.getByText(label, { exact: true });
  }

  menuLink(name: string | RegExp): Locator {
    return this.navigation.getByRole('link', { name, exact: typeof name === 'string' });
  }

  async openDropdown(label: string): Promise<void> {
    await this.clickElement(this.dropdownToggle(label));
  }

  async openMobileMenu(): Promise<void> {
    await this.clickElement(this.openMenuButton);
  }

  async closeMobileMenu(): Promise<void> {
    await this.clickElement(this.closeMenuButton);
  }
}
