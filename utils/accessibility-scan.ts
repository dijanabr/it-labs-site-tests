import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { accessibilityRules } from '../test-data/accessibility';

export interface AccessibilityViolation {
  rule: string;
  impact: string;
  help: string;
  elements: string[];
}

/**
 * Runs axe-core on the page (or only inside `include`), attaches the full results to the test report and
 * returns the violations whose impact should fail the test.
 */
export async function scanAccessibility(page: Page, testInfo: TestInfo, options: { name: string; include?: string }): Promise<AccessibilityViolation[]> {
  let builder = new AxeBuilder({ page }).withTags(accessibilityRules.tags);
  if (options.include) builder = builder.include(options.include);
  const results = await builder.analyze();

  await testInfo.attach(`axe-${options.name}`, { body: JSON.stringify(results, null, 2), contentType: 'application/json' });

  return results.violations
    .filter((violation) => accessibilityRules.failingImpacts.includes(violation.impact ?? ''))
    .map((violation) => ({
      rule: violation.id,
      impact: violation.impact!,
      help: violation.help,
      elements: violation.nodes.map((node) => node.target.join(' ')),
    }));
}
