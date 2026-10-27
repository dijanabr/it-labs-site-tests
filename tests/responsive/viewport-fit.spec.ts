import { test, expect } from '../../fixtures/test-fixtures';
import { keyPages } from '../../test-data/pages';
import { headerNavigation } from '../../test-data/navigation';

// Runs on mobile-chrome, mobile-safari and tablet. Complements layout.spec.ts (page-level overflow) with
// element-level checks: nothing the visitor needs may be cut off or pushed outside the screen.

for (const sitePage of keyPages) {
  test(`${sitePage.path}: header, footer and certification links fit inside the viewport`, async ({ basePage, header, footer }) => {
    await basePage.navigateTo(sitePage.path);

    expect.soft(await basePage.getLinksOutsideViewport(header.root), 'header links (menu closed)').toEqual([]);

    await header.openMobileMenu();
    for (const dropdown of headerNavigation.dropdowns) {
      await header.openDropdown(dropdown.label);
    }
    expect.soft(await basePage.getLinksOutsideViewport(header.navigation), 'header links (menu and dropdowns open)').toEqual([]);
    await header.closeMobileMenu();

    await footer.scrollIntoView();
    expect.soft(await basePage.getLinksOutsideViewport(footer.root), 'footer links').toEqual([]);
    expect.soft(await basePage.getLinksOutsideViewport(footer.certificationsSection), '"Certifications & partnerships" links').toEqual([]);
    const certificationsBox = (await footer.certificationsSection.boundingBox())!;
    expect.soft(certificationsBox.x + certificationsBox.width, '"Certifications & partnerships" right edge').toBeLessThanOrEqual(basePage.page.viewportSize()!.width);
  });

  test(`${sitePage.path}: headings and links are not truncated`, async ({ basePage }) => {
    await basePage.navigateTo(sitePage.path);
    await basePage.scrollToBottom();

    expect(await basePage.getTruncatedElements()).toEqual([]);
  });

  test(`${sitePage.path}: images load and keep their aspect ratio`, async ({ basePage }) => {
    await basePage.navigateTo(sitePage.path);
    await basePage.scrollToBottom();
    await basePage.page.waitForLoadState('networkidle');

    expect.soft(await basePage.getImagesNotLoaded(), 'images not loaded').toEqual([]);
    expect.soft(await basePage.getDistortedImages(), 'images stretched or squashed').toEqual([]);
  });
}

test.describe('first visit, cookie banner showing', () => {
  test.use({ consentState: 'none' });

  for (const sitePage of keyPages) {
    test(`${sitePage.path}: Cookiebot dialog fits the viewport`, async ({ cookieBanner }) => {
      await cookieBanner.navigateTo(sitePage.path);
      await expect(cookieBanner.dialog).toBeVisible();
      const viewport = cookieBanner.page.viewportSize()!;

      const box = (await cookieBanner.dialog.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      await expect(cookieBanner.allowAllButton).toBeInViewport({ ratio: 1 });
      await expect(cookieBanner.denyButton).toBeInViewport({ ratio: 1 });
    });
  }
});
