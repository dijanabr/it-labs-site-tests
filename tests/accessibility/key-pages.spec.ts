import { test, expect } from '../../fixtures/test-fixtures';
import { keyPages } from '../../test-data/pages';
import { scanAccessibility } from '../../utils/accessibility-scan';

for (const sitePage of keyPages) {
  test(`${sitePage.path} has no serious or critical accessibility violations`, async ({ basePage }, testInfo) => {
    await basePage.navigateTo(sitePage.path);
    // Scroll-reveal sections start transparent; scanning them before they appear reports false contrast errors.
    await basePage.scrollToBottom();
    await basePage.page.waitForLoadState('networkidle');

    expect(await scanAccessibility(basePage.page, testInfo, { name: sitePage.path })).toEqual([]);
  });
}
