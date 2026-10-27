# IT Labs website regression suite

Playwright + TypeScript regression tests for <https://www.it-labs.com> (WordPress + Bricks Builder, Cookiebot, GTM).
Run it against every release to confirm nothing broke: pages, navigation, contact form, console errors, SEO,
consent/tracking, responsive layout and visuals.

## Quick start

```bash
npm install
npm run install:browsers      # Chromium + WebKit
npm test                      # desktop + mobile/tablet regression (no visual)
npm run test:visual           # visual comparison against the committed baselines
npm run report                # open the HTML report
```

Point the suite at another environment (e.g. staging) with `BASE_URL` in `.env` (see `.env.example`).
Production-only host-redirect tests skip themselves when `BASE_URL` is not production.

| Script | What it runs |
| --- | --- |
| `npm test` | `desktop-chrome`, `mobile-chrome`, `mobile-safari`, `tablet` |
| `npm run test:smoke` | Fast HTTP availability check of every page (~45 s) |
| `npm run test:desktop` | Desktop functional, SEO, console, links, tracking |
| `npm run test:responsive` | Mobile/tablet layout and hamburger menu (Pixel 7, iPhone 14, iPad Mini) |
| `npm run test:visual` | Full-page and header/footer screenshots, desktop + mobile |
| `npm run test:visual:update` | Re-create visual baselines after an **approved** design change |
| `npm run test:all` | Everything |
| `npm run typecheck` | `tsc --noEmit` |

## Production safety

- **2 workers max**, 1 retry locally / 2 on CI. Link checks run one request at a time.
- **Nothing is ever written to the site.** `utils/network-guard.ts` is installed for every test and aborts
  any non-GET request to the site host. Contact-form tests only use invalid data and additionally assert that
  no request was attempted.
- **No analytics pollution.** GA4 / Google Ads / LinkedIn beacons are aborted, so tests can see the tags
  *try* to fire without the hits reaching production reports.
- Default browser state is "cookies **declined**", so tracking tags don't run unless a test opts in.
- **User agent:** the site's AWS load balancer returns **403 to `HeadlessChrome`**. Every project sends its device's
  normal browser UA plus the token `ITLabsRegression/1.0`. Ask ops to allowlist/filter on that token if the WAF rules change.

## Structure

```
playwright.config.ts        projects, workers, UA, reporters
fixtures/
  test-fixtures.ts          extended `test`: page objects, consentState option, NetworkGuard, ConsoleMonitor
  consent.setup.ts          clicks the real Cookiebot banner once per run -> .auth/consent-*.json
pages/
  base-page.ts              BasePage: navigateTo, reloadPage, clickElement, fillValue, getTitle, scrollToBottom, ...
  home-page.ts, contact-page.ts, insights-page.ts, not-found-page.ts, cookie-declaration-page.ts
  components/               header-component.ts, footer-component.ts, cookie-banner.ts
test-data/                  everything the tests assert against (pages, nav, form data, tracking IDs, known issues)
utils/                      network-guard.ts, console-monitor.ts
tests/
  smoke/                    HTTP 200 for every sitemap page, legacy redirects
  functional/               header, footer, home, contact form, insights, 404
  seo/                      title/H1/meta/canonical/OG per page, structured data, robots.txt, sitemap, host redirects
  console/                  console errors, JS exceptions, failed first-party requests
  links/                    internal links on key pages resolve
  tracking/                 Cookiebot banner, consent mode, GTM/GA4 only after consent, cookie declaration
  responsive/               runs on mobile-chrome, mobile-safari, tablet only
  visual/                   runs on visual-desktop, visual-mobile only
snapshots/                  visual baselines ({project}/{name}-{platform}.png)
```

### Conventions

- Page objects extend `BasePage` (default export), file names kebab-case, classes PascalCase. No `test.step`.
- Selectors: roles, labels and visible text first; Cookiebot's own ids (`#CybotCookiebotDialog`) where needed.
  Generated Bricks ids (`#brxe-xxxxxx`) are not used.
- Tests contain no hard-coded content. Titles, H1s, menu links and form labels come from `test-data/`.
- Pick the starting consent with `test.use({ consentState: 'accepted' | 'declined' | 'none' })`.

## Maintaining the suite

- **Content changed on purpose** (new title/H1/menu item): update `test-data/pages.ts` / `navigation.ts`.
- **New page published:** the sitemap test adds a *warning* annotation listing pages not in `test-data/pages.ts`.
- **Design changed on purpose:** review the diff in the HTML report, then `npm run test:visual:update` and commit
  the new baselines. Baselines are OS-specific (`-win32`); generate separate ones on CI (Linux).
- **New third-party console noise:** add it to `test-data/console-allowlist.ts` with a reason, only if it is
  outside the site's control.

## Known issues (found 2026-10-27)

Tracked in `test-data/known-issues.ts`. Their tests are marked `test.fail()`, so the run stays green while the
issue exists. When an issue is fixed, Playwright reports an *unexpected pass*: set `open: false` there.

| Issue | Test |
| --- | --- |
| Duplicate `og:url` / `og:title` / `og:type` on every page (Yoast **and** Bricks emit them) | seo/meta-tags |
| `robots.txt` has no `Sitemap:` directive | seo/sitemap-and-redirects |
| `http://www.it-labs.com` refuses connections on port 80 (no redirect to https; HSTS lacks `includeSubDomains`/`preload`) | seo/sitemap-and-redirects |
| `page-sitemap.xml` lists 3 URLs that 301 (`/corporate/` is a 2-hop chain via `/itl_way/`) | seo/sitemap-and-redirects |
| Cookiebot reports 6 **Unclassified** cookies | tracking/consent-and-tracking |

Also observed, not covered by a test:
- Contact form message label is cut off: "Tell us about your project. Even one sentence helps in".
- The header "Careers" link is an absolute production URL (`https://www.it-labs.com/careers/`) while every other
  menu link is relative; it will leave a staging site. (`header links stay on the site under test` catches this on staging.)
