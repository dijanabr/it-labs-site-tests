import type { Locator, Page, Response } from '@playwright/test';
import BasePage from './base-page';

export default class CookieDeclarationPage extends BasePage {
  readonly declaration: Locator;
  readonly cookieTables: Locator;
  readonly changeConsentLink: Locator;

  constructor(page: Page) {
    super(page);
    // Markup injected by Cookiebot's cd.js (Cookiebot class names, not Bricks ids).
    this.declaration = page.locator('div.CookieDeclaration');
    this.cookieTables = this.declaration.getByRole('table');
    this.changeConsentLink = this.declaration.getByRole('link', { name: 'Change your consent' });
  }

  async open(): Promise<Response | null> {
    return this.navigateTo('/cookie-declaration/');
  }

  categoryHeader(category: string): Locator {
    // Cookiebot pads the header text with trailing whitespace.
    return this.declaration.getByText(new RegExp(`^${category} \\(\\d+\\)\\s*$`));
  }

  async getCookieCount(category: string): Promise<number> {
    const text = await this.categoryHeader(category).innerText();
    return Number(text.match(/\((\d+)\)/)![1]);
  }
}
