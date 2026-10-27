import { test, expect } from '../../fixtures/test-fixtures';
import { homePageContent } from '../../test-data/home-page';

test.beforeEach(async ({ homePage }) => {
  await homePage.open();
});

test('hero shows heading, calls to action and stats', async ({ homePage }) => {
  await expect(homePage.heroSection).toBeVisible();
  await expect(homePage.mainHeading).toHaveText(homePageContent.heroHeading);

  for (const cta of homePageContent.heroCtas) {
    await expect(homePage.heroLink(cta.name)).toBeVisible();
    await expect(homePage.heroLink(cta.name)).toHaveAttribute('href', cta.path);
  }
  for (const stat of homePageContent.heroStats) {
    await expect(homePage.heroStat(stat.value, stat.label)).toBeVisible();
  }
});

test('hero slider has images with alt text', async ({ homePage }) => {
  const slideCount = await homePage.heroSlides.count();
  expect(slideCount).toBeGreaterThan(0);

  for (let index = 0; index < slideCount; index++) {
    await expect(homePage.heroSlides.nth(index)).toHaveAttribute('alt', /\S/);
  }
});

test('all main sections are rendered', async ({ homePage }) => {
  for (const heading of homePageContent.sectionHeadings) {
    await expect(homePage.sectionHeading(heading)).toBeAttached();
  }
});

test('client logo carousel shows labelled logos', async ({ homePage }) => {
  await expect(homePage.clientLogosSection.getByText(homePageContent.clientLogosLabel)).toBeVisible();
  expect(await homePage.clientLogos.count()).toBeGreaterThanOrEqual(homePageContent.minimumClientLogos);
  await expect(homePage.clientLogos.first()).toHaveAttribute('alt', /\S/);
});

test('no broken images after scrolling the whole page', async ({ homePage }) => {
  await homePage.scrollToBottom();
  await homePage.page.waitForLoadState('networkidle');

  expect(await homePage.getBrokenImages()).toEqual([]);
});

test('"Get in touch" opens the contact page', async ({ homePage, contactPage }) => {
  await homePage.clickElement(homePage.heroLink(/Get in touch/));

  await expect(contactPage.page).toHaveURL('/contact/');
  await expect(contactPage.form).toBeVisible();
});

test('"See our work" opens the case studies page', async ({ homePage }) => {
  await homePage.clickElement(homePage.heroLink('See our work'));

  await expect(homePage.page).toHaveURL('/case-studies/');
});
