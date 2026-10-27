import type { BrowserContext } from '@playwright/test';
import { tracking } from '../test-data/tracking';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const HEAVY_RESOURCE_TYPES = new Set(['image', 'media', 'font']);

/**
 * Production safety net, installed for every test by the fixtures:
 * - aborts every write request (POST/PUT/...) to the site, so no form, comment or AJAX action can create data;
 * - aborts analytics/ads beacons, so regression runs never show up in production analytics;
 * - optionally aborts images/media/fonts for DOM-only checks (SEO) to keep load low.
 */
export default class NetworkGuard {
  readonly blockedWrites: string[] = [];
  readonly blockedBeacons: string[] = [];
  private readonly blockedUrls = new Set<string>();
  private readonly siteHost: string;

  constructor(
    private readonly context: BrowserContext,
    baseURL: string,
  ) {
    this.siteHost = new URL(baseURL).host;
  }

  async enable(options: { blockHeavyResources: boolean }): Promise<void> {
    // Handlers registered later run first, so heavy resources are checked before beacons and writes.
    await this.context.route(
      (url) => url.host === this.siteHost,
      async (route) => {
        const request = route.request();
        if (SAFE_METHODS.has(request.method())) return route.fallback();
        this.blockedWrites.push(`${request.method()} ${request.url()}`);
        this.blockedUrls.add(request.url());
        await route.abort('blockedbyclient');
      },
    );

    await this.context.route(
      (url) => tracking.beaconUrlPatterns.some((pattern) => pattern.test(url.href)),
      async (route) => {
        this.blockedBeacons.push(route.request().url());
        this.blockedUrls.add(route.request().url());
        await route.abort('blockedbyclient');
      },
    );

    if (options.blockHeavyResources) {
      await this.context.route('**/*', async (route) => {
        if (!HEAVY_RESOURCE_TYPES.has(route.request().resourceType())) return route.fallback();
        this.blockedUrls.add(route.request().url());
        await route.abort('blockedbyclient');
      });
    }
  }

  isBlocked(url: string): boolean {
    return this.blockedUrls.has(url);
  }
}
