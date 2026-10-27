export const tracking = {
  gtmContainerId: 'GTM-MBJ4NSZ',
  ga4MeasurementId: 'G-BS4W7E634Q',
  // Anything matching these must NOT be requested before consent or after "Deny".
  trackerUrlPatterns: [
    /googletagmanager\.com\/gtm\.js/,
    /googletagmanager\.com\/gtag\/js/,
    /google-analytics\.com/,
    /analytics\.google\.com/,
    /doubleclick\.net/,
    /google\.com\/ccm\//,
    /snap\.licdn\.com/,
    /px\.ads\.linkedin\.com/,
    /aplo-evnt\.com/,
  ],
  // Data-collection hits. NetworkGuard aborts these so regression runs never pollute production analytics,
  // while tests can still assert that the tags tried to send them.
  beaconUrlPatterns: [
    /google-analytics\.com\/.*collect/,
    /analytics\.google\.com\/.*collect/,
    /doubleclick\.net\/.*collect/,
    /google\.com\/ccm\/collect/,
    /px\.ads\.linkedin\.com/,
    /aplo-evnt\.com/,
  ],
};
