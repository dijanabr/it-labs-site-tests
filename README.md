# IT Labs website regression suite

Playwright + TypeScript regression tests for <https://www.it-labs.com> (WordPress + Bricks Builder, Cookiebot, GTM).
Run it against every release to confirm nothing broke: pages, navigation, contact form, console errors, SEO,
consent/tracking, accessibility, security headers, responsive layout and visuals, in Chromium, Firefox and WebKit.

## Quick start

```bash
npm install
npm run install:browsers      # Chromium + Firefox + WebKit
cp .env.example .env          # optional: BASE_URL, RUN_SUBMIT, QA_EMAIL
npm test                      # desktop (3 browsers) + mobile/tablet regression (no visual)
npm run test:visual           # visual comparison against the committed baselines
npm run report                # open the HTML report
```

Point the suite at another environment (e.g. staging) with `BASE_URL` in `.env`.
Production-only host-redirect tests skip themselves when `BASE_URL` is not production.

| Script | What it runs |
| --- | --- |
| `npm test` | `desktop-chrome`, `desktop-firefox`, `desktop-webkit`, `mobile-chrome`, `mobile-safari`, `tablet` |
| `npm run test:smoke` | Fast HTTP availability check of every page (~45 s) |
| `npm run test:desktop` | Desktop Chrome: functional, SEO, console, links, tracking, accessibility, security headers |
| `npm run test:cross-browser` | Functional tests in Firefox and WebKit (desktop, 1440x900) |
| `npm run test:responsive` | Mobile/tablet layout, viewport fit and hamburger menu (Pixel 7, iPhone 14, iPad Mini) |
| `npm run test:a11y` | axe-core scans of key pages and the open header dropdowns (desktop + tablet) |
| `npm run test:security` | HTTP security response headers |
| `npm run test:submit` | Real contact-form submissions (`@submit`); skipped unless `RUN_SUBMIT=true` |
| `npm run test:visual` | Full-page and header/footer screenshots: desktop Chrome/Firefox/WebKit, mobile, tablet |
| `npm run test:visual:update` | Re-create visual baselines after an **approved** design change |
| `npm run test:all` | Everything |
| `npm run typecheck` | `tsc --noEmit` |

### Projects

| Project | Device | Runs |
| --- | --- | --- |
| `setup` | Desktop Chrome | Stores "accepted" / "declined" Cookiebot states in `.auth/` (dependency of all others) |
| `desktop-chrome` | Desktop Chrome 1440x900 | everything except `responsive/` and `visual/` |
| `desktop-firefox`, `desktop-webkit` | Firefox / Safari 1440x900 | `functional/` |
| `mobile-chrome`, `mobile-safari` | Pixel 7 / iPhone 14 | `responsive/` |
| `tablet` | iPad Mini | `responsive/` + `accessibility/navigation-menus` |
| `visual-desktop`, `visual-firefox`, `visual-webkit`, `visual-mobile`, `visual-tablet` | as above | `visual/` (opt-in) |

## Production safety

- **2 workers max**, no retries locally / 2 on CI. Link checks run one request at a time.
- **Nothing is written to the site by default.** `utils/network-guard.ts` is installed for every test and aborts
  any non-GET request to the site host; tests assert it never had to.
- **Contact form submits are mocked.** `ContactPage.mockSubmitResponse()` answers the Bricks AJAX call
  (`POST /wp-admin/admin-ajax.php`, `action=bricks_form_submit`) with a canned JSON reply via `page.route`.
  A page route takes precedence over NetworkGuard's context route, so the request never leaves the browser.
- **Real submissions are opt-in** (`@submit`, `RUN_SUBMIT=true` in `.env`, run on `desktop-chrome` only).
  They use the name `QA TEST - please ignore` and the inbox in `QA_EMAIL`:
  - `functional/contact-form` sends one real message through the UI (`NetworkGuard.allowWrites()` lets that one URL
    through for that one page) and checks the request carries a reCAPTCHA token;
  - `api/contact-form-endpoint` posts directly to the endpoint with an empty and a fake reCAPTCHA token and
    expects the server to refuse both. `page.request` is not subject to browser routing, which is the
    NetworkGuard bypass for that file only.
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
  base-page.ts              BasePage: navigation, scrolling, meta tags, overflow/viewport/truncation/image checks
  home-page.ts, contact-page.ts, insights-page.ts, not-found-page.ts, cookie-declaration-page.ts
  components/               header-component.ts, footer-component.ts, cookie-banner.ts
test-data/                  everything the tests assert against (pages, nav, form data, tracking IDs, known issues)
utils/                      network-guard.ts, console-monitor.ts, accessibility-scan.ts (axe), multipart.ts
tests/
  smoke/                    HTTP 200 for every sitemap page, legacy redirects
  functional/               header, footer, home, contact form (validation + mocked/real submit), insights, 404
  api/                      contact-form endpoint rejects invalid reCAPTCHA tokens (@submit)
  seo/                      title/H1/meta/canonical/OG per page, structured data, robots.txt, sitemap, host redirects
  console/                  console errors, JS exceptions, failed first-party requests
  links/                    internal links on key pages resolve
  tracking/                 Cookiebot banner, consent mode, GTM/GA4 only after consent, cookie declaration
  accessibility/            axe-core WCAG 2.2 A/AA: fails on serious/critical, full results attached to the report
  security/                 security response headers
  responsive/               runs on mobile-chrome, mobile-safari, tablet only
  visual/                   runs on the visual-* projects only
snapshots/                  visual baselines ({project}/{name}-{platform}.png)
```

### Conventions

- Page objects extend `BasePage` (default export), file names kebab-case, classes PascalCase. No `test.step`.
- Selectors: roles, labels and visible text first; Cookiebot's own ids (`#CybotCookiebotDialog`) and Bricks' fixed
  ids/classes (`#brx-header`, the form's `.message` reply) where needed. Generated Bricks ids (`#brxe-xxxxxx`) are not used.
- Tests contain no hard-coded content. Titles, H1s, menu links and form labels come from `test-data/`.
- Pick the starting consent with `test.use({ consentState: 'accepted' | 'declined' | 'none' })`.

## Maintaining the suite

- **Content changed on purpose** (new title/H1/menu item): update `test-data/pages.ts` / `navigation.ts`.
  Example: the 404 page H1 changed from "Whoops, that page is gone" to "This page doesn’t exist" (2026-10-27).
- **New page published:** the sitemap test adds a *warning* annotation listing pages not in `test-data/pages.ts`.
- **Design changed on purpose:** review the diff in the HTML report, then `npm run test:visual:update` and commit
  the new baselines. Baselines are OS-specific (`-win32`); generate separate ones on CI (Linux).
  A full-page baseline wider than its viewport means horizontal overflow: don't approve it.
- **New third-party console noise:** add it to `test-data/console-allowlist.ts` with a reason, only if it is
  outside the site's control.
- **Accessibility:** rules and failing impacts are in `test-data/accessibility.ts`. Open the `axe-*` attachment
  in the HTML report for the full list, including minor/moderate findings.

## Known issues (found 2026-10-27)

Tracked in `test-data/known-issues.ts`. Their tests are marked `test.fail()`, so the run stays green while the
issue exists. When an issue is fixed, Playwright reports an *unexpected pass*: set `open: false` there.

| Issue | Test |
| --- | --- |
| Duplicate `og:url` / `og:title` / `og:type` on every page (Yoast **and** Bricks emit them) | seo/meta-tags |
| `robots.txt` has no `Sitemap:` directive | seo/sitemap-and-redirects |
| `http://www.it-labs.com` refuses connections on port 80 (no redirect to https) | seo/sitemap-and-redirects |
| `page-sitemap.xml` lists 3 URLs that 301 (`/corporate/` is a 2-hop chain via `/itl_way/`) | seo/sitemap-and-redirects |
| Cookiebot reports 6 **Unclassified** cookies | tracking/consent-and-tracking |
| No `Content-Security-Policy` | security/security-headers |
| No `X-Frame-Options` / CSP `frame-ancestors` (page can be framed) | security/security-headers |
| No `X-Content-Type-Options: nosniff` | security/security-headers |
| No `Referrer-Policy` | security/security-headers |
| No `Permissions-Policy` | security/security-headers |
| HSTS `max-age=63072000` without `includeSubDomains` | security/security-headers |
| `Server: nginx/1.24.0 (Ubuntu)` discloses the version | security/security-headers |

Fixed on the live site and now guarded by normal tests: `noindex, nofollow` meta robots (seo/meta-tags),
tracking requests before consent and after "Deny" (tracking/consent-and-tracking), mobile horizontal overflow
(responsive/layout), contact form `maxlength` on every text field (functional/contact-form; set by an inline
script after load, so the test checks the rendered DOM).

Also observed, not covered by a test:
- Contact form message label is cut off: "Tell us about your project. Even one sentence helps in".
- The header "Careers" link is an absolute production URL (`https://www.it-labs.com/careers/`) while every other
  menu link is relative; it will leave a staging site. (`header links stay on the site under test` catches this on staging.)

## Next steps

- **Accessibility, label-in-name findings** (`tests/accessibility`, axe rule `label-content-name-mismatch`, serious).
  Review them with the site team: the footer social links show "in" / "YT" / "IG" but are named "IT Labs on LinkedIn
  (opens in a new tab)" etc., and the homepage case-study CTAs show "Read the case study" but are named
  "Read the Anthology case study" etc. Then decide whether to fix them or track them in `known-issues.ts`.
- **Capabilities section on service pages** (e.g. `/ai-platform-scaling/`, `/software-development/`): verify mobile
  vs tablet. On mobile the three-column layout is kept, so the section heading overflows its ~97px column and
  capability titles overlap their descriptions. On tablet only the section heading overflows (240px in 216px).
  Found by `responsive/viewport-fit` ("headings and links are not truncated").
- **Stats component padding:** add a test for it.
- **Run the suite folder by folder and project by project** (one spec folder, one project, `--workers=1`).
  The full run has not been completed since the new tests were added. The production server was slow on
  2026-10-27 (images at ~70–300 KB/s), so pages with large images (`/`, `/case-studies/`) timed out on `load`.
- **Regenerate the visual baselines** (`npm run test:visual:update`) once the server responds normally. Then check that every
  baseline is as wide as its viewport. The current baselines are outdated (captured before the site fixes):
  mobile `home` is 554px and mobile `ai-platform-scaling` is 413px on a 412px viewport.
  `visual-firefox`, `visual-webkit` and `visual-tablet` have no baselines yet.
