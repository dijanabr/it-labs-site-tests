import { test, expect } from '../../fixtures/test-fixtures';
import { notFoundPage as notFound } from '../../test-data/pages';

test('unknown URL returns a real 404 with a helpful page', async ({ notFoundPage, footer }) => {
  const response = await notFoundPage.open();

  expect(response?.status()).toBe(404);
  await expect(notFoundPage.page).toHaveTitle(notFound.title);
  await expect(notFoundPage.mainHeading).toHaveText(notFound.h1);
  await expect(notFoundPage.searchInput).toBeVisible();
  await expect(footer.root).toBeVisible();
});

test('search from the 404 page shows results', async ({ notFoundPage }) => {
  await notFoundPage.open();

  await notFoundPage.search('cloud');

  await expect(notFoundPage.page).toHaveURL(/[?&]s=cloud/);
});
