import { test, expect } from '../../fixtures/test-fixtures';
import { getSitePage } from '../../test-data/pages';

const insights = getSitePage('/insights/');

test.beforeEach(async ({ insightsPage }) => {
  await insightsPage.open();
});

test('lists articles with titles and links', async ({ insightsPage }) => {
  await expect(insightsPage.mainHeading).toHaveText(insights.h1);
  expect(await insightsPage.articleTitleLinks.count()).toBeGreaterThanOrEqual(6);

  for (const href of await insightsPage.articleTitleLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    expect(href).toMatch(/^https?:\/\/[^/]+\/[\w-]+\/$/);
  }
});

test('opening the newest article shows its content', async ({ insightsPage }) => {
  const title = await insightsPage.openArticle(0);

  await expect(insightsPage.mainHeading).toHaveText(title);
  await expect(insightsPage.page).toHaveTitle(/IT Labs/);
});

test('links to the podcast and case studies', async ({ insightsPage }) => {
  await expect(insightsPage.podcastLink).toHaveAttribute('href', '/podcasts/');
  await expect(insightsPage.caseStudiesLink).toHaveAttribute('href', '/case-studies/');
});
