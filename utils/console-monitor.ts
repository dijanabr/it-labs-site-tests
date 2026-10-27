import type { Page } from '@playwright/test';
import type NetworkGuard from './network-guard';
import { consoleAllowlist } from '../test-data/console-allowlist';

export interface PageIssue {
  kind: 'console-error' | 'page-error' | 'http-error' | 'request-failed';
  message: string;
  url?: string;
}

// Requests cancelled by the browser itself (navigation away, lazy media) are not site problems.
const CANCELLED_REQUEST = /ERR_ABORTED|cancelled|Load request cancelled/i;

/** Collects console errors, uncaught exceptions and failed first-party requests for one page. */
export default class ConsoleMonitor {
  private readonly issues: PageIssue[] = [];
  private readonly siteHost: string;

  constructor(
    page: Page,
    baseURL: string,
    private readonly networkGuard: NetworkGuard,
  ) {
    this.siteHost = new URL(baseURL).host;

    page.on('console', (message) => {
      if (message.type() === 'error') {
        this.issues.push({ kind: 'console-error', message: message.text(), url: message.location().url });
      }
    });
    page.on('pageerror', (error) => {
      this.issues.push({ kind: 'page-error', message: `${error.name}: ${error.message}` });
    });
    page.on('response', (response) => {
      if (response.status() >= 400 && this.isFirstParty(response.url())) {
        this.issues.push({ kind: 'http-error', message: `HTTP ${response.status()}`, url: response.url() });
      }
    });
    page.on('requestfailed', (request) => {
      const errorText = request.failure()?.errorText ?? 'unknown error';
      if (this.isFirstParty(request.url()) && !CANCELLED_REQUEST.test(errorText)) {
        this.issues.push({ kind: 'request-failed', message: errorText, url: request.url() });
      }
    });
  }

  getUnexpectedIssues(): PageIssue[] {
    return this.issues.filter((issue) => {
      if (issue.url && this.networkGuard.isBlocked(issue.url)) return false;
      const haystack = `${issue.message} ${issue.url ?? ''}`;
      return !consoleAllowlist.some(({ pattern }) => pattern.test(haystack));
    });
  }

  private isFirstParty(url: string): boolean {
    try {
      return new URL(url).host === this.siteHost;
    } catch {
      return false;
    }
  }
}
