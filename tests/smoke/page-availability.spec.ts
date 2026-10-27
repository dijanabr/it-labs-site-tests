import { test, expect } from '../../fixtures/test-fixtures';
import { sitePages, legacyRedirects } from '../../test-data/pages';

// Raw HTTP checks (no browser assets), so every page in the sitemap can be covered cheaply.
const SERVER_ERROR_MARKERS = /<b>(Fatal error|Parse error|Warning|Notice|Deprecated)<\/b>:|There has been a critical error on this website|Error establishing a database connection/;

for (const sitePage of sitePages) {
  test(`${sitePage.path} responds 200 without server errors`, async ({ request }) => {
    const response = await request.get(sitePage.path, { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    const html = await response.text();
    expect(html).not.toMatch(SERVER_ERROR_MARKERS);
    expect(html).toContain('id="brx-header"');
    expect(html).toContain('id="brx-footer"');
  });
}

for (const redirect of legacyRedirects) {
  test(`legacy URL ${redirect.from} redirects to ${redirect.to}`, async ({ request, baseURL }) => {
    const response = await request.get(redirect.from);

    expect(response.status()).toBe(200);
    expect(response.url()).toBe(new URL(redirect.to, baseURL).href);
  });
}
