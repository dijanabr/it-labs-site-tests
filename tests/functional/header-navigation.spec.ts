import { test, expect } from '../../fixtures/test-fixtures';
import { headerNavigation } from '../../test-data/navigation';
import { getSitePage } from '../../test-data/pages';

test.beforeEach(async ({ homePage }) => {
  await homePage.open();
});

test('logo, top-level menu and CTA are visible on desktop', async ({ header }) => {
  await expect(header.logoLink).toBeVisible();
  await expect(header.openMenuButton).toBeHidden();

  for (const dropdown of headerNavigation.dropdowns) {
    await expect(header.dropdownLabel(dropdown.label)).toBeVisible();
  }
  for (const link of headerNavigation.topLinks) {
    await expect(header.menuLink(link.name)).toBeVisible();
    await expect(header.menuLink(link.name)).toHaveAttribute('href', new RegExp(`${link.path}$`));
  }
  await expect(header.ctaLink).toBeVisible();
  await expect(header.ctaLink).toHaveAttribute('href', headerNavigation.cta.path);
});

for (const dropdown of headerNavigation.dropdowns) {
  test(`"${dropdown.label}" dropdown lists all its links`, async ({ header }) => {
    const toggle = header.dropdownToggle(dropdown.label);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await header.openDropdown(dropdown.label);

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    for (const group of dropdown.groups) {
      if (group.heading) await expect(header.dropdownItem(dropdown.label).getByText(group.heading, { exact: true })).toBeVisible();
      for (const link of group.links) {
        await expect(header.menuLink(link.name)).toBeVisible();
        await expect(header.menuLink(link.name)).toHaveAttribute('href', link.path);
      }
    }
  });
}

test('dropdown opens on hover', async ({ header }) => {
  await header.hoverElement(header.dropdownLabel('What we do'));

  await expect(header.menuLink('AI Auditing')).toBeVisible();
});

test('mega menu link navigates to its page', async ({ header, basePage }) => {
  const devOps = getSitePage('/devops-services/');

  await header.openDropdown('What we do');
  await header.clickElement(header.menuLink('DevOps'));

  await expect(basePage.page).toHaveURL(devOps.path);
  await expect(basePage.mainHeading).toHaveText(devOps.h1);
});

test('"Let\'s talk" CTA opens the contact page', async ({ header, contactPage }) => {
  await header.clickElement(header.ctaLink);

  await expect(contactPage.page).toHaveURL(headerNavigation.cta.path);
  await expect(contactPage.form).toBeVisible();
});

test('logo returns to the homepage from an inner page', async ({ header, homePage }) => {
  await header.navigateTo('/about/');
  await header.clickElement(header.logoLink);

  await expect(homePage.page).toHaveURL('/');
  await expect(homePage.heroSection).toBeVisible();
});

test('header links stay on the site under test', async ({ header, baseURL }) => {
  // Catches hard-coded production URLs that would leak visitors off a staging site.
  const hrefs = await header.navigation.getByRole('link').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));

  for (const href of hrefs) {
    expect(new URL(href).origin, href).toBe(new URL(baseURL!).origin);
  }
});
