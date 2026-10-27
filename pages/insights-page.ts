import type { Locator, Page, Response } from '@playwright/test';
import BasePage from './base-page';

export default class InsightsPage extends BasePage {
  readonly articleTitleLinks: Locator;
  readonly podcastLink: Locator;
  readonly caseStudiesLink: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole('main');
    this.articleTitleLinks = main.getByRole('heading', { level: 2 }).getByRole('link');
    this.podcastLink = main.getByRole('link', { name: 'Listen to the podcast' });
    this.caseStudiesLink = main.getByRole('link', { name: 'Read our case studies' });
  }

  async open(): Promise<Response | null> {
    return this.navigateTo('/insights/');
  }

  /** Opens the article at the given position and returns the title shown on its card. */
  async openArticle(index: number): Promise<string> {
    const link = this.articleTitleLinks.nth(index);
    const title = (await link.innerText()).trim();
    await this.clickElement(link);
    return title;
  }
}
