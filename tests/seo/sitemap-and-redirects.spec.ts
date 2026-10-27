import { test, expect } from '../../fixtures/test-fixtures';
import type { APIRequestContext } from '@playwright/test';
import { sitePages } from '../../test-data/pages';
import { seoRules } from '../../test-data/seo';
import { site } from '../../test-data/site';
import { knownIssues } from '../../test-data/known-issues';

async function getSitemapPaths(request: APIRequestContext, sitemapPath: string): Promise<string[]> {
  const response = await request.get(sitemapPath);
  expect(response.status(), `${sitemapPath} status`).toBe(200);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
}

test('robots.txt is reachable and does not block the site', async ({ request }) => {
  const response = await request.get(seoRules.robotsTxtPath);
  expect(response.status()).toBe(200);

  const robots = await response.text();
  expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  for (const path of seoRules.robotsDisallowed) {
    expect(robots).toContain(`Disallow: ${path}`);
  }
});

test('robots.txt points crawlers at the sitemap', async ({ request }) => {
  test.fail(knownIssues.robotsTxtMissingSitemap.open, knownIssues.robotsTxtMissingSitemap.description);

  const robots = await (await request.get(seoRules.robotsTxtPath)).text();
  expect(robots).toMatch(/^Sitemap:\s*https:\/\/\S+sitemap_index\.xml/m);
});

test('sitemap index lists the page and post sitemaps', async ({ request }) => {
  const childSitemaps = await getSitemapPaths(request, seoRules.sitemapIndexPath);
  expect(childSitemaps).toEqual(expect.arrayContaining(seoRules.childSitemaps));
});

test('every page in the test data is still listed in the page sitemap', async ({ request }) => {
  const sitemapPaths = await getSitemapPaths(request, seoRules.pageSitemapPath);
  const missing = sitePages.map((sitePage) => sitePage.path).filter((path) => !sitemapPaths.includes(path));
  expect(missing, 'pages removed from the sitemap').toEqual([]);

  const untracked = sitemapPaths.filter(
    (path) => !sitePages.some((sitePage) => sitePage.path === path) && !knownIssues.sitemapListsRedirects.urls.includes(path),
  );
  if (untracked.length > 0) {
    test.info().annotations.push({ type: 'warning', description: `New pages not covered by test-data/pages.ts: ${untracked.join(', ')}` });
  }
});

test('page sitemap contains no new redirecting or broken URLs', async ({ request }) => {
  const sitemapPaths = await getSitemapPaths(request, seoRules.pageSitemapPath);
  const notOk: string[] = [];
  for (const path of sitemapPaths.filter((candidate) => !knownIssues.sitemapListsRedirects.urls.includes(candidate))) {
    const response = await request.get(path, { maxRedirects: 0 });
    if (response.status() !== 200) notOk.push(`${path} -> ${response.status()}`);
  }
  expect(notOk).toEqual([]);
});

test('page sitemap no longer lists the known redirecting URLs', async ({ request }) => {
  test.fail(knownIssues.sitemapListsRedirects.open, knownIssues.sitemapListsRedirects.description);

  const sitemapPaths = await getSitemapPaths(request, seoRules.pageSitemapPath);
  expect(sitemapPaths.filter((path) => knownIssues.sitemapListsRedirects.urls.includes(path))).toEqual([]);
});

test.describe('canonical host redirects', () => {
  // These only make sense against the production hostnames.
  test.skip(({ baseURL }) => baseURL !== site.productionUrl, 'Production host redirects');

  test('apex domain redirects to https://www', async ({ request }) => {
    const response = await request.get(`${site.apexUrl}/about/`);
    expect(response.status()).toBe(200);
    expect(response.url()).toBe(`${site.productionUrl}/about/`);
  });

  test('plain http on the apex domain redirects to https://www', async ({ request }) => {
    const response = await request.get('http://it-labs.com/about/');
    expect(response.url()).toBe(`${site.productionUrl}/about/`);
  });

  test('plain http on www redirects to https', async ({ request }) => {
    test.fail(knownIssues.httpWwwNotRedirecting.open, knownIssues.httpWwwNotRedirecting.description);

    const response = await request.get('http://www.it-labs.com/about/', { timeout: 15_000 });
    expect(response.url()).toBe(`${site.productionUrl}/about/`);
  });

  test('URLs without a trailing slash redirect to the canonical form', async ({ request, baseURL }) => {
    const response = await request.get('/about', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe(`${baseURL}/about/`);
  });
});
