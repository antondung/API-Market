import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface A11yAuditOptions {
  includeTags?: string[];
  excludeRules?: string[];
  scopeSelector?: string;
}

export interface FormattedA11yViolation {
  id: string;
  impact: string | null | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary?: string;
  }>;
}

export interface A11yAuditResult {
  url: string;
  violationsCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  violations: FormattedA11yViolation[];
}

export async function runA11yAudit(page: Page, options: A11yAuditOptions = {}): Promise<A11yAuditResult> {
  const tags = options.includeTags ?? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

  let builder = new AxeBuilder({ page }).withTags(tags);

  if (options.excludeRules && options.excludeRules.length > 0) {
    builder = builder.disableRules(options.excludeRules);
  }

  if (options.scopeSelector) {
    builder = builder.include(options.scopeSelector);
  }

  const results = await builder.analyze();

  const formattedViolations: FormattedA11yViolation[] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map((n) => ({
      target: n.target as string[],
      html: n.html,
      failureSummary: n.failureSummary,
    })),
  }));

  const criticalCount = formattedViolations.filter((v) => v.impact === 'critical').length;
  const seriousCount = formattedViolations.filter((v) => v.impact === 'serious').length;
  const moderateCount = formattedViolations.filter((v) => v.impact === 'moderate').length;
  const minorCount = formattedViolations.filter((v) => v.impact === 'minor').length;

  return {
    url: page.url(),
    violationsCount: formattedViolations.length,
    criticalCount,
    seriousCount,
    moderateCount,
    minorCount,
    violations: formattedViolations,
  };
}
