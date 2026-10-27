import { test, expect } from '../../fixtures/test-fixtures';
import { visualPages } from '../../test-data/visual';

// Create or refresh the baselines with `npm run test:visual:update` after reviewing an intended design change.

for (const visualPage of visualPages) {
  test(`${visualPage.name} page matches the baseline`, async ({ basePage }) => {
    await basePage.navigateTo(visualPage.path);
    // Trigger lazy images and scroll-reveal animations, then go back to a stable starting position.
    await basePage.scrollToBottom();
    await basePage.page.waitForLoadState('networkidle');
    await basePage.scrollToTop();
    await basePage.waitForFonts();
    if (visualPage.hidden) await basePage.hideElements(visualPage.hidden);

    await expect(basePage.page).toHaveScreenshot(`${visualPage.name}.png`, {
      fullPage: true,
      mask: visualPage.masks.map((selector) => basePage.page.locator(selector)),
    });
  });
}

test('header matches the baseline', async ({ header }) => {
  await header.navigateTo('/about/');
  await header.waitForFonts();

  await expect(header.root).toHaveScreenshot('header.png');
});

test('footer matches the baseline', async ({ footer }) => {
  await footer.navigateTo('/about/');
  await footer.scrollIntoView();
  await footer.waitForFonts();

  await expect(footer.root).toHaveScreenshot('footer.png');
});
