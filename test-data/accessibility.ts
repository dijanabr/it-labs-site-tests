export const accessibilityRules = {
  // WCAG 2.2 level A and AA rules (axe-core tags).
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  // Lower impacts (minor, moderate) are attached to the report but do not fail the test.
  failingImpacts: ['serious', 'critical'],
};
