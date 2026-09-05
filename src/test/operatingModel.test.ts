import { describe, expect, it } from 'vitest';
import { operatingWorkstreams, portfolioProjects, teamPositions, thirdPartyActions } from '@/data/operatingModel';

describe('portfolio operating model', () => {
  it('contains the reconciled portfolio plus named additional projects', () => {
    expect(portfolioProjects).toHaveLength(104);
    expect(new Set(portfolioProjects.map((project) => project.code)).size).toBe(104);
    expect(portfolioProjects.map((project) => project.code)).toEqual(expect.arrayContaining([
      'kalethon', 'auvaneone', 'uzvoya', 'insure360', 'domureva', 'regulos', 'fanzeno',
    ]));
  });

  it('has separate UK and Germany compliance ownership plus independent review', () => {
    const roles = teamPositions.map((position) => position.role);
    expect(roles).toEqual(expect.arrayContaining([
      'UK Compliance Manager',
      'Germany & EU Compliance Manager',
      'Independent Compliance Reviewer',
    ]));
  });

  it('tracks external deliverables and evidence for every third-party group', () => {
    expect(thirdPartyActions.length).toBeGreaterThanOrEqual(10);
    for (const action of thirdPartyActions) {
      expect(action.internalOwner).toBeTruthy();
      expect(action.requiredFromThirdParty).toBeTruthy();
      expect(action.evidence).toBeTruthy();
      expect(action.escalation).toBeTruthy();
    }
  });

  it('has an explicit testing, UAT and release-control workstream', () => {
    expect(teamPositions.map((position) => position.role)).toEqual(expect.arrayContaining([
      'QA & Release Lead',
      'UK and German UAT & Localisation Tester',
      'Independent Security Tester',
    ]));
    expect(operatingWorkstreams.some((item) => item.title === 'Testing, UAT and release approval')).toBe(true);
  });
});
