import { describe, expect, it } from 'vitest';
import { CLIENT_ONBOARDING_TEMPLATE, PROJECT_LIFECYCLE_TEMPLATE, lifecycleProgress } from '@/data/lifecycleTemplates';

describe('portfolio lifecycle templates', () => {
  it('covers the required project launch workstreams', () => {
    const streams = new Set(PROJECT_LIFECYCLE_TEMPLATE.map(([stream]) => stream));
    for (const required of ['Strategy', 'Brand', 'Product', 'Testing', 'Legal', 'Compliance', 'Marketing', 'Sales', 'Client Operations', 'Integrations', 'Communications', 'Finance', 'Administration', 'People']) {
      expect(streams.has(required)).toBe(true);
    }
  });

  it('gives every client and branch commercial, compliance, technical and growth onboarding', () => {
    const streams = new Set(CLIENT_ONBOARDING_TEMPLATE.map(([stream]) => stream));
    for (const required of ['Commercial', 'Identity', 'Compliance', 'Configuration', 'Integrations', 'Communications', 'Training', 'Testing', 'Go Live', 'Service', 'Growth']) {
      expect(streams.has(required)).toBe(true);
    }
  });

  it('only counts approved or not-applicable gates as complete', () => {
    expect(lifecycleProgress([{ status: 'approved' }, { status: 'not_applicable' }, { status: 'in_progress' }, { status: 'blocked' }])).toBe(50);
    expect(lifecycleProgress([])).toBe(0);
  });
});
