import { test, expect } from '../../fixtures/test-fixtures';
import { headerNavigation } from '../../test-data/navigation';
import { scanAccessibility } from '../../utils/accessibility-scan';

// Runs on desktop-chrome (mega menu) and tablet (dropdowns inside the hamburger menu).

for (const dropdown of headerNavigation.dropdowns) {
  test(`open "${dropdown.label}" dropdown has no serious or critical accessibility violations`, async ({ header }, testInfo) => {
    await header.navigateTo('/');
    if (await header.openMenuButton.isVisible()) await header.openMobileMenu();

    await header.openDropdown(dropdown.label);
    await expect(header.dropdownToggle(dropdown.label)).toHaveAttribute('aria-expanded', 'true');

    expect(await scanAccessibility(header.page, testInfo, { name: `${dropdown.label} dropdown`, include: '#brx-header' })).toEqual([]);
  });
}
