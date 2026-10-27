import path from 'node:path';

export type ConsentState = 'accepted' | 'declined' | 'none';

const authDir = path.join(__dirname, '..', '.auth');

// Written by fixtures/consent.setup.ts; 'none' starts with no cookies so the Cookiebot banner shows.
export const consentStorageStatePaths: Record<Exclude<ConsentState, 'none'>, string> = {
  accepted: path.join(authDir, 'consent-accepted.json'),
  declined: path.join(authDir, 'consent-declined.json'),
};

export const cookiebot = {
  consentCookieName: 'CookieConsent',
  bannerTexts: { allowAll: 'Allow all', deny: 'Deny' },
};

export const cookieDeclaration = {
  categories: ['Necessary', 'Statistics', 'Marketing'],
};
