import type { Locator, Page, Response } from '@playwright/test';

export default class BasePage {
  public page: Page;
  readonly mainHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeading = page.getByRole('heading', { level: 1 });
  }

  async navigateTo(url: string): Promise<Response | null> {
    return this.page.goto(url);
  }

  async reloadPage(): Promise<Response | null> {
    return this.page.reload();
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fillValue(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /** Ticks a checkbox or radio through its <label>, for custom-styled inputs whose label covers the input. */
  async checkViaLabel(input: Locator): Promise<void> {
    const id = await input.getAttribute('id');
    await this.clickElement(this.page.locator(`label[for="${id}"]`));
  }

  async hoverElement(locator: Locator): Promise<void> {
    await locator.hover();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getCurrentPath(): string {
    return new URL(this.page.url()).pathname;
  }

  // Scrolls one viewport at a time so lazy-loaded images and scroll-triggered animations get a chance to run.
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async hideElements(selectors: string[]): Promise<void> {
    await this.page.addStyleTag({ content: `${selectors.join(', ')} { visibility: hidden !important; }` });
  }

  async waitForFonts(): Promise<void> {
    await this.page.evaluate(() => document.fonts.ready.then(() => undefined));
  }

  async getMetaContents(nameOrProperty: string): Promise<string[]> {
    return this.page
      .locator(`meta[name="${nameOrProperty}"], meta[property="${nameOrProperty}"]`)
      .evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content') ?? ''));
  }

  async getMetaContent(nameOrProperty: string): Promise<string | null> {
    const contents = await this.getMetaContents(nameOrProperty);
    return contents[0] ?? null;
  }

  async getCanonicalUrl(): Promise<string | null> {
    return this.page.locator('link[rel="canonical"]').getAttribute('href');
  }

  async getHtmlLang(): Promise<string | null> {
    return this.page.locator('html').getAttribute('lang');
  }

  async getStructuredData(): Promise<unknown[]> {
    const blocks = await this.page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.map((block) => JSON.parse(block));
  }

  /** Pixels the document is wider than the viewport; anything above 0 means a horizontal scrollbar. */
  async getHorizontalOverflow(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  }

  async getBrokenImages(): Promise<string[]> {
    return this.page.locator('img').evaluateAll((images) =>
      (images as HTMLImageElement[])
        .filter((image) => image.complete && image.currentSrc !== '' && image.naturalWidth === 0)
        .map((image) => image.currentSrc),
    );
  }

  async getImagesWithoutAlt(): Promise<string[]> {
    return this.page
      .locator('img:not([alt])')
      .evaluateAll((images) => (images as HTMLImageElement[]).map((image) => image.currentSrc || image.src));
  }

  async getInternalLinkHrefs(scope: Locator = this.page.locator('body')): Promise<string[]> {
    const origin = new URL(this.page.url()).origin;
    const hrefs = await scope.locator('a[href]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    return [...new Set(hrefs.filter((href) => href.startsWith(origin)).map((href) => href.split('#')[0]))];
  }
}
