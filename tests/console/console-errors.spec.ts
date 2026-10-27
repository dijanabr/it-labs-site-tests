import { test, expect } from '../../fixtures/test-fixtures';
import { keyPages } from '../../test-data/pages';

for (const sitePage of keyPages) {
  test(`${sitePage.path} loads without console errors or failed requests`, async ({ basePage, consoleMonitor }) => {
    await basePage.navigateTo(sitePage.path);
    await basePage.scrollToBottom();
    await basePage.page.waitForLoadState('networkidle');

    expect(consoleMonitor.getUnexpectedIssues()).toEqual([]);
  });
}

test.describe('with all cookies accepted', () => {
  // Accepting consent loads GTM and the marketing tags, which is where most script errors come from.
  test.use({ consentState: 'accepted' });

  for (const path of ['/', '/contact/']) {
    test(`${path} loads without console errors once tracking tags run`, async ({ basePage, consoleMonitor }) => {
      await basePage.navigateTo(path);
      await basePage.scrollToBottom();
      await basePage.page.waitForLoadState('networkidle');

      expect(consoleMonitor.getUnexpectedIssues()).toEqual([]);
    });
  }
});
