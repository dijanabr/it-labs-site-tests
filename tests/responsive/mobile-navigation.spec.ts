import { test, expect } from '../../fixtures/test-fixtures';
import { headerNavigation } from '../../test-data/navigation';
import { getSitePage } from '../../test-data/pages';

// Runs on the mobile-chrome, mobile-safari and tablet projects (all below the 991px menu breakpoint).

test.beforeEach(async ({ homePage }) => {
  await homePage.open();
});

test('desktop menu is replaced by the hamburger button', async ({ header }) => {
  await expect(header.logoLink).toBeVisible();
  await expect(header.openMenuButton).toBeVisible();
  await expect(header.menuLink('About')).toBeHidden();
});

test('hamburger menu opens and closes', async ({ header }) => {
  await header.openMobileMenu();

  await expect(header.openMenuButton).toHaveAttribute('aria-expanded', 'true');
  for (const link of headerNavigation.topLinks) {
    await expect(header.menuLink(link.name)).toBeVisible();
  }
  await expect(header.ctaLink).toBeVisible();

  await header.closeMobileMenu();

  await expect(header.menuLink('About')).toBeHidden();
});

test('dropdown inside the mobile menu expands and navigates', async ({ header, basePage }) => {
  const cloud = getSitePage('/cloud-strategy/');

  await header.openMobileMenu();
  await header.openDropdown('What we do');
  await header.clickElement(header.menuLink('Cloud & Platform Engineering'));

  await expect(basePage.page).toHaveURL(cloud.path);
  await expect(basePage.mainHeading).toHaveText(cloud.h1);
});
