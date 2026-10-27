// Console errors / failed requests that are known, understood and outside the site's control.
// Keep this list short: every entry hides a class of errors from the console-errors spec.
export const consoleAllowlist: { pattern: RegExp; reason: string }[] = [
  { pattern: /ERR_BLOCKED_BY_CLIENT|blocked by client/i, reason: 'Requests intentionally aborted by NetworkGuard' },
  { pattern: /aplo-evnt\.com/, reason: 'Third-party intent pixel answers 400; not owned by the site' },
  { pattern: /px\.ads\.linkedin\.com|snap\.licdn\.com/, reason: 'LinkedIn Insight Tag noise' },
  { pattern: /doubleclick\.net|google\.com\/ccm\//, reason: 'Google Ads conversion endpoints' },
  {
    pattern: /requestStorageAccess: Permission denied.*google\.com\/recaptcha/,
    reason: 'reCAPTCHA iframe asks for third-party storage access; Chrome refuses it in automation',
  },
];
