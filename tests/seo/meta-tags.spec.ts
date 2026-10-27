import { test, expect } from '../../fixtures/test-fixtures';
import { sitePages, keyPages } from '../../test-data/pages';
import { seoRules } from '../../test-data/seo';
import { site } from '../../test-data/site';
import { knownIssues } from '../../test-data/known-issues';

test.use({ blockHeavyResources: true });

for (const sitePage of sitePages) {
  test(`${sitePage.path} has the expected title, H1 and meta tags`, async ({ basePage, baseURL }) => {
    const response = await basePage.navigateTo(sitePage.path);
    expect(response?.status()).toBe(200);

    // Soft assertions: report every SEO problem on the page in one run.
    await expect.soft(basePage.page).toHaveTitle(sitePage.title);
    expect.soft(sitePage.title.length).toBeLessThanOrEqual(seoRules.titleMaxLength);
    await expect.soft(basePage.mainHeading).toHaveCount(1);
    await expect.soft(basePage.mainHeading).toHaveText(sitePage.h1);
    expect.soft(await basePage.getHtmlLang()).toBe(site.language);
    expect.soft(await basePage.getCanonicalUrl()).toBe(new URL(sitePage.path, baseURL).href);

    const description = (await basePage.getMetaContent('description')) ?? '';
    expect.soft(description.length, 'meta description length').toBeGreaterThanOrEqual(seoRules.descriptionMinLength);
    expect.soft(description.length, 'meta description length').toBeLessThanOrEqual(seoRules.descriptionMaxLength);

    const robots = (await basePage.getMetaContent('robots')) ?? '';
    expect.soft(robots, 'page must stay indexable').not.toMatch(/noindex/i);

    for (const tag of seoRules.requiredOpenGraphTags) {
      expect.soft(await basePage.getMetaContent(tag), `${tag} present`).toBeTruthy();
    }
  });
}

for (const sitePage of keyPages) {
  test(`${sitePage.path} has valid structured data and alt attributes on all images`, async ({ basePage }) => {
    await basePage.navigateTo(sitePage.path);

    const structuredData = await basePage.getStructuredData();
    expect(structuredData.length).toBeGreaterThan(0);
    expect(await basePage.getImagesWithoutAlt()).toEqual([]);
  });
}

test('homepage structured data describes the organisation and website', async ({ basePage }) => {
  await basePage.navigateTo('/');

  const [yoastGraph] = (await basePage.getStructuredData()) as { '@graph': { '@type': string | string[] }[] }[];
  const types = yoastGraph['@graph'].flatMap((node) => node['@type']);
  expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage']));
});

test('Open Graph tags are not duplicated', async ({ basePage }) => {
  test.fail(knownIssues.duplicateOpenGraphTags.open, knownIssues.duplicateOpenGraphTags.description);
  await basePage.navigateTo('/');

  for (const tag of ['og:url', 'og:title', 'og:type']) {
    expect(await basePage.getMetaContents(tag), tag).toHaveLength(1);
  }
});
