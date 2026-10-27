import { test, expect } from '../../fixtures/test-fixtures';
import { keyPages } from '../../test-data/pages';
import { footerNavigation } from '../../test-data/navigation';

for (const sitePage of keyPages) {
  test(`${sitePage.path} fits the screen without horizontal scrolling`, async ({ basePage }) => {
    await basePage.navigateTo(sitePage.path);
    await basePage.scrollToBottom();

    await expect(basePage.mainHeading).toHaveText(sitePage.h1);
    expect(await basePage.getHorizontalOverflow()).toBeLessThanOrEqual(0);
  });
}

test('hero heading and primary CTA are visible above the fold', async ({ homePage }) => {
  await homePage.open();

  await expect(homePage.mainHeading).toBeInViewport();
  await expect(homePage.heroLink(/Get in touch/)).toBeInViewport();
});

test('footer legal links are reachable', async ({ homePage, footer }) => {
  await homePage.open();
  await footer.scrollIntoView();

  for (const link of footerNavigation.legalLinks) {
    await expect(footer.legalLink(link.name)).toBeVisible();
  }
});

test('contact form fields fit the screen and accept input', async ({ contactPage, networkGuard }) => {
  await contactPage.open();
  const viewportWidth = contactPage.page.viewportSize()!.width;

  for (const field of [contactPage.nameInput, contactPage.emailInput, contactPage.messageInput]) {
    await field.scrollIntoViewIfNeeded();
    const box = await field.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth);
  }

  await contactPage.fillValue(contactPage.nameInput, 'Responsive check');
  await expect(contactPage.nameInput).toHaveValue('Responsive check');
  expect(networkGuard.blockedWrites).toEqual([]);
});
