import { test, expect } from '../../fixtures/test-fixtures';

// Requests are made one at a time to keep the load on production low.
for (const path of ['/', '/about/', '/insights/']) {
  test(`every internal link on ${path} resolves`, async ({ basePage, request }) => {
    await basePage.navigateTo(path);
    const hrefs = await basePage.getInternalLinkHrefs();
    expect(hrefs.length).toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of hrefs) {
      const response = await request.get(href);
      if (response.status() >= 400) broken.push(`${href} -> ${response.status()}`);
    }
    expect(broken).toEqual([]);
  });
}
