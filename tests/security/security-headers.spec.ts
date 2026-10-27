import { test, expect } from '../../fixtures/test-fixtures';
import type { APIRequestContext } from '@playwright/test';
import { knownIssues } from '../../test-data/known-issues';

// Response headers of a regular HTML page. All of these were missing or weak on 2026-10-27; each test turns
// into a normal guard once its known issue is closed.

async function getPageHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  return response.headers();
}

test('Content-Security-Policy is set', async ({ request }) => {
  test.fail(knownIssues.missingContentSecurityPolicy.open, knownIssues.missingContentSecurityPolicy.description);

  const headers = await getPageHeaders(request);
  expect(headers['content-security-policy']).toMatch(/\S/);
});

test('page cannot be framed by other sites (X-Frame-Options or frame-ancestors)', async ({ request }) => {
  test.fail(knownIssues.missingFrameProtection.open, knownIssues.missingFrameProtection.description);

  const headers = await getPageHeaders(request);
  const frameOptions = headers['x-frame-options'] ?? '';
  const frameAncestors = (headers['content-security-policy'] ?? '').match(/frame-ancestors\s+([^;]+)/)?.[1] ?? '';
  expect(/^(DENY|SAMEORIGIN)$/i.test(frameOptions) || /'none'|'self'/.test(frameAncestors), `X-Frame-Options "${frameOptions}", frame-ancestors "${frameAncestors}"`).toBe(true);
});

test('X-Content-Type-Options is nosniff', async ({ request }) => {
  test.fail(knownIssues.missingContentTypeOptions.open, knownIssues.missingContentTypeOptions.description);

  const headers = await getPageHeaders(request);
  expect(headers['x-content-type-options']).toBe('nosniff');
});

test('Referrer-Policy is set', async ({ request }) => {
  test.fail(knownIssues.missingReferrerPolicy.open, knownIssues.missingReferrerPolicy.description);

  const headers = await getPageHeaders(request);
  expect(headers['referrer-policy']).toMatch(/^(no-referrer|same-origin|strict-origin|strict-origin-when-cross-origin|origin-when-cross-origin|origin)$/);
});

test('Permissions-Policy is set', async ({ request }) => {
  test.fail(knownIssues.missingPermissionsPolicy.open, knownIssues.missingPermissionsPolicy.description);

  const headers = await getPageHeaders(request);
  expect(headers['permissions-policy']).toMatch(/\S/);
});

test('Strict-Transport-Security covers subdomains for at least a year', async ({ request }) => {
  test.fail(knownIssues.hstsWithoutIncludeSubDomains.open, knownIssues.hstsWithoutIncludeSubDomains.description);

  const hsts = (await getPageHeaders(request))['strict-transport-security'] ?? '';
  expect(Number(hsts.match(/max-age=(\d+)/)?.[1] ?? 0), hsts).toBeGreaterThanOrEqual(31_536_000);
  expect(hsts).toMatch(/includeSubDomains/i);
});

test('Server header does not reveal the software version', async ({ request }) => {
  test.fail(knownIssues.serverVersionDisclosed.open, knownIssues.serverVersionDisclosed.description);

  const server = (await getPageHeaders(request))['server'] ?? '';
  expect(server, `Server: ${server}`).not.toMatch(/\d/);
});
