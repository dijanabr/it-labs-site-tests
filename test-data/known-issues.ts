// Issues found on production when the suite was written (2026-10-27). Tests covering them are marked
// with test.fail(), so the run stays green while the issue exists. Once it is fixed, Playwright reports
// an "unexpected pass": flip the flag to false here and the test turns into a normal guard.
export const knownIssues = {
  duplicateOpenGraphTags: {
    open: true,
    description: 'Yoast and Bricks both output og:url / og:title / og:type, so every page has two conflicting sets',
  },
  robotsTxtMissingSitemap: {
    open: true,
    description: 'robots.txt has no "Sitemap:" directive pointing at /sitemap_index.xml',
  },
  httpWwwNotRedirecting: {
    open: true,
    description: 'http://www.it-labs.com refuses connections on port 80 instead of redirecting to https',
  },
  unclassifiedCookies: {
    open: true,
    description: 'Cookiebot lists 6 "Unclassified" cookies, which consent categories cannot block',
  },
  sitemapListsRedirects: {
    open: true,
    description: 'page-sitemap.xml lists URLs that 301-redirect',
    urls: ['/corporate/', '/development-solutions/', '/security-services-3/'],
  },
};
