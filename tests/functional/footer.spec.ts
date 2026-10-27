import { test, expect } from '../../fixtures/test-fixtures';
import { footerNavigation } from '../../test-data/navigation';
import { getSitePage } from '../../test-data/pages';
import { site } from '../../test-data/site';

test.beforeEach(async ({ homePage, footer }) => {
  await homePage.open();
  await footer.scrollIntoView();
});

test('shows logo, tagline and current copyright year', async ({ footer }) => {
  await expect(footer.logo).toBeVisible();
  await expect(footer.root.getByText(site.tagline)).toBeVisible();
  await expect(footer.copyright).toHaveText(new RegExp(`© ${new Date().getFullYear()} ${site.copyrightHolder}`));
});

for (const column of footerNavigation.columns) {
  test(`"${column.heading}" column lists all its links`, async ({ footer }) => {
    await expect(footer.columnHeading(column.heading)).toBeVisible();

    for (const link of column.links) {
      await expect(footer.link(link.name)).toBeVisible();
      await expect(footer.link(link.name)).toHaveAttribute('href', link.path);
    }
  });
}

test('legal links are present', async ({ footer }) => {
  for (const link of footerNavigation.legalLinks) {
    await expect(footer.legalLink(link.name)).toBeVisible();
    await expect(footer.legalLink(link.name)).toHaveAttribute('href', link.path);
  }
});

test('social links open the right profiles in a new tab', async ({ footer }) => {
  for (const social of footerNavigation.socialLinks) {
    const link = footer.socialLink(social.network);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', social.href);
    await expect(link).toHaveAttribute('target', '_blank');
  }
});

test('certifications and partnerships are listed', async ({ footer }) => {
  await expect(footer.certificationsHeading).toBeVisible();
  for (const certification of footerNavigation.certifications) {
    await expect(footer.certification(certification)).toBeVisible();
  }
  await expect(footer.moreAboutUsLink).toHaveAttribute('href', '/about/');
});

test('legal link navigates to its page', async ({ footer, basePage }) => {
  const privacyPolicy = getSitePage('/privacy-policy/');

  await footer.clickElement(footer.legalLink('Privacy Policy'));

  await expect(basePage.page).toHaveURL(privacyPolicy.path);
  await expect(basePage.mainHeading).toHaveText(privacyPolicy.h1);
});
