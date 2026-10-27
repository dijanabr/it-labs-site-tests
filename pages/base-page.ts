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

  /** Images in the page's horizontal band (not parked off-screen in a carousel) that did not load. */
  async getImagesNotLoaded(): Promise<string[]> {
    return this.page.locator('img').evaluateAll((images) =>
      (images as HTMLImageElement[])
        .filter((image) => {
          const rect = image.getBoundingClientRect();
          const onScreenHorizontally = rect.right > 0 && rect.left < document.documentElement.clientWidth;
          return rect.width > 1 && rect.height > 1 && onScreenHorizontally && getComputedStyle(image).visibility !== 'hidden';
        })
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src || image.dataset.src || image.outerHTML.slice(0, 120)),
    );
  }

  /** Loaded images stretched or squashed: rendered aspect ratio differs from the file's, without object-fit cropping. */
  async getDistortedImages(tolerance = 0.03): Promise<string[]> {
    return this.page.locator('img').evaluateAll(
      (images, maxDeviation) =>
        (images as HTMLImageElement[]).flatMap((image) => {
          const style = getComputedStyle(image);
          if (!image.complete || image.naturalWidth === 0 || !['fill', ''].includes(style.objectFit)) return [];
          const horizontalChrome = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'] as const;
          const verticalChrome = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'] as const;
          const rect = image.getBoundingClientRect();
          const width = rect.width - horizontalChrome.reduce((sum, property) => sum + parseFloat(style[property]), 0);
          const height = rect.height - verticalChrome.reduce((sum, property) => sum + parseFloat(style[property]), 0);
          // Tiny boxes (tracking pixels, icons) round too coarsely to judge.
          if (width < 16 || height < 16) return [];
          const rendered = width / height;
          const natural = image.naturalWidth / image.naturalHeight;
          if (Math.abs(rendered - natural) / natural <= maxDeviation) return [];
          return [`${image.currentSrc || image.src} rendered ${Math.round(width)}x${Math.round(height)}, file ${image.naturalWidth}x${image.naturalHeight}`];
        }),
      tolerance,
    );
  }

  /** Visible elements whose text is wider than their box, i.e. clipped or spilling out (scrollWidth > clientWidth). */
  async getTruncatedElements(selector = 'h1, h2, h3, h4, h5, h6, a'): Promise<string[]> {
    return this.page.locator(selector).evaluateAll((elements) =>
      (elements as HTMLElement[])
        .filter((element) => {
          const style = getComputedStyle(element);
          // Inline boxes report clientWidth 0; screen-reader-only text is clipped to 1px on purpose.
          if (element.clientWidth <= 1 || style.visibility === 'hidden') return false;
          if (element.closest('[aria-hidden="true"], .brxe-carousel, [hidden]')) return false;
          if (element.scrollWidth <= element.clientWidth + 1) return false;
          // Only text counts: decorative children (glows, arrows) may overflow a card on purpose.
          const box = element.getBoundingClientRect();
          const textNodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          while (textNodes.nextNode()) {
            range.selectNodeContents(textNodes.currentNode);
            if ([...range.getClientRects()].some((rect) => rect.width > 0 && (rect.left < box.left - 1 || rect.right > box.right + 1))) return true;
          }
          return false;
        })
        .map((element) => `<${element.tagName.toLowerCase()}> "${element.innerText.trim().slice(0, 60)}" ${element.scrollWidth}px in ${element.clientWidth}px`),
    );
  }

  /** Visible links in scope whose box, once scrolled into view, is not fully inside the viewport. */
  async getLinksOutsideViewport(scope: Locator): Promise<string[]> {
    const viewport = this.page.viewportSize()!;
    const links = scope.getByRole('link');
    const outside: string[] = [];
    for (let index = 0; index < (await links.count()); index++) {
      const link = links.nth(index);
      if (!(await link.isVisible())) continue;
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      if (!box) continue;
      const fitsHorizontally = box.x >= 0 && box.x + box.width <= viewport.width + 0.5;
      const fitsVertically = box.y >= 0 && box.y + box.height <= viewport.height + 0.5;
      if (!fitsHorizontally || !fitsVertically) {
        const name = (await link.innerText()).trim() || (await link.getAttribute('aria-label')) || (await link.getAttribute('href'));
        outside.push(`"${name}" at x=${Math.round(box.x)} y=${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)}`);
      }
    }
    return outside;
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
