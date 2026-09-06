import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CaseDesk from '@/pages/CaseDesk';
import { NAV_ITEMS } from '@/components/layout/navigation';

vi.mock('@/hooks/useOperationsWorkspace', () => ({
  useOperationsPermission: () => ({ data: { canManage: true, roles: ['admin'] } }),
  useCaseDesk: () => ({
    data: {
      cases: [{ id: 'case-1', case_reference: 'CASE-100', case_type: 'support', title: 'Client cannot complete onboarding', summary: 'Investigate and restore access', status: 'open', priority: 'high', territory: 'UK', project_id: 'project-1', due_date: '2026-09-08', created_at: '', created_by: null, account_id: null, assigned_to: null, resolution_summary: null, resolved_at: null, updated_at: '' }],
      approvals: [{ id: 'approval-1', title: 'Approve production release', approval_type: 'Release sign-off', description: 'Evidence pack complete', status: 'pending', project_id: 'project-1', due_date: '2026-09-09', account_id: null, approver_id: null, case_id: null, created_at: '', decided_at: null, decision_notes: null, evidence_id: null, requested_by: null, updated_at: '' }],
      evidence: [{ id: 'evidence-1', title: 'Security retest', category: 'Security', description: 'No critical findings', status: 'submitted', version: '2.0', project_id: 'project-1', file_url: 'https://example.com/evidence', review_due: '2026-09-09', expires_on: null, account_id: null, approved_at: null, case_id: null, checksum: null, created_at: '', created_by: null, owner_id: null, reviewer_id: null, updated_at: '' }],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useProjectData', () => ({
  useProjects: () => ({ data: [{ id: 'project-1', name: 'Haccora' }] }),
}));

afterEach(cleanup);

describe('case desk', () => {
  it('is discoverable from the workspace navigation', () => {
    expect(NAV_ITEMS.some((item) => item.path === '/case-desk' && item.label === 'Cases & Approvals')).toBe(true);
  });

  it('opens directly on the approval queue from an action-centre link', () => {
    const queryClient = new QueryClient();
    render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={['/case-desk?view=approvals']}><CaseDesk /></MemoryRouter></QueryClientProvider>);
    expect(screen.getByRole('heading', { name: 'Cases, evidence and approvals' })).toBeInTheDocument();
    expect(screen.getByText('Approve production release')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Record decision' })).toBeInTheDocument();
  });
});
