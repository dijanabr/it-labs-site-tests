import type { Locator, Page, Response } from '@playwright/test';
import BasePage from './base-page';
import { notFoundPage } from '../test-data/pages';

export default class NotFoundPage extends BasePage {
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByRole('main').getByRole('searchbox', { name: 'Search' });
  }

  async open(): Promise<Response | null> {
    return this.navigateTo(notFoundPage.path);
  }

  async search(term: string): Promise<void> {
    await this.fillValue(this.searchInput, term);
    await this.searchInput.press('Enter');
  }
}
