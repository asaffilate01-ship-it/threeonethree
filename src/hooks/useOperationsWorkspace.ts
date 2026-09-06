import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { hasOperationsWriteAccess } from '@/lib/operationsWorkspace';

export type CrmAccount = Tables<'crm_accounts'> & { projects: { name: string; code: string } | null };
export type CrmContact = Tables<'crm_contacts'>;
export type CrmDeal = Tables<'crm_deals'>;
export type OnboardingCase = Tables<'onboarding_cases'>;
export type OnboardingStep = Tables<'onboarding_steps'>;
export type ComplianceItem = Tables<'compliance_register'> & { projects: { name: string; code: string } | null; crm_accounts: { name: string } | null };
export type ThirdPartyItem = Tables<'third_party_actions'> & { projects: { name: string; code: string } | null };
export type TeamPositionRow = Tables<'team_positions'>;

export type CrmActivity = Tables<'crm_activities'>;

export function useOperationsPermission() {
  return useQuery({
    queryKey: ['operations-permission'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canManage: false, roles: [] as string[] };
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      if (error) throw error;
      const roles = (data ?? []).map((item) => item.role as string);
      return { canManage: hasOperationsWriteAccess(roles), roles };
    },
  });
}

export function useCrmAccountsFull() {
  return useQuery({
    queryKey: ['crm-accounts-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_accounts').select('*, projects(name, code)').order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CrmAccount[];
    },
  });
}

export function useAccountWorkspace(accountId: string | null) {
  return useQuery({
    queryKey: ['crm-account-workspace', accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const [contacts, deals, cases, activities] = await Promise.all([
        supabase.from('crm_contacts').select('*').eq('account_id', accountId!).order('created_at'),
        supabase.from('crm_deals').select('*').eq('account_id', accountId!).order('updated_at', { ascending: false }),
        supabase.from('onboarding_cases').select('*').eq('account_id', accountId!).order('updated_at', { ascending: false }),
        supabase.from('crm_activities').select('*').eq('account_id', accountId!).order('occurred_at', { ascending: false }),
      ]);
      const error = contacts.error || deals.error || cases.error || activities.error;
      if (error) throw error;
      return { contacts: contacts.data as CrmContact[], deals: deals.data as CrmDeal[], cases: cases.data as OnboardingCase[], activities: activities.data as CrmActivity[] };
    },
  });
}

export function useOnboardingSteps(caseId: string | null) {
  return useQuery({
    queryKey: ['onboarding-steps', caseId],
    enabled: !!caseId,
    queryFn: async () => {
      const { data, error } = await supabase.from('onboarding_steps').select('*').eq('onboarding_case_id', caseId!).order('created_at');
      if (error) throw error;
      return data as OnboardingStep[];
    },
  });
}

export function useComplianceRegister() {
  return useQuery({
    queryKey: ['compliance-register'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compliance_register').select('*, projects(name, code), crm_accounts(name)').order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ComplianceItem[];
    },
  });
}

export function useThirdPartyRegister() {
  return useQuery({
    queryKey: ['third-party-register'],
    queryFn: async () => {
      const { data, error } = await supabase.from('third_party_actions').select('*, projects(name, code)').order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ThirdPartyItem[];
    },
  });
}

export function useTeamPositions() {
  return useQuery({
    queryKey: ['team-positions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_positions').select('*').order('department').order('role_title');
      if (error) throw error;
      return data as TeamPositionRow[];
    },
  });
}

export type ActionCentreItem = {
  id: string;
  source: 'Work' | 'Compliance' | 'Third party' | 'CRM';
  title: string;
  context: string;
  date: string | null;
  status: string;
  priority: string;
  link: string;
};

export function useActionCentre() {
  return useQuery({
    queryKey: ['operations-action-centre'],
    queryFn: async () => {
      const [tasks, compliance, partners, accounts] = await Promise.all([
        supabase.from('operating_tasks').select('*').neq('status', 'done'),
        supabase.from('compliance_register').select('*, projects(name, code)').not('status', 'in', '(complete,completed,approved)'),
        supabase.from('third_party_actions').select('*, projects(name, code)').not('status', 'in', '(complete,completed,approved)'),
        supabase.from('crm_accounts').select('*').not('next_action_due', 'is', null),
      ]);
      const error = tasks.error || compliance.error || partners.error || accounts.error;
      if (error) throw error;
      const items: ActionCentreItem[] = [];
      for (const row of tasks.data ?? []) items.push({ id: row.id, source: 'Work', title: row.title, context: `${row.workstream} · ${row.territory}`, date: row.due_date, status: row.status, priority: row.priority, link: '/work-board' });
      for (const row of compliance.data ?? []) items.push({ id: row.id, source: 'Compliance', title: row.requirement, context: `${row.projects?.name ?? row.entity_name ?? row.authority ?? 'Group'} · ${row.territory}`, date: row.due_date ?? row.renewal_date, status: row.status, priority: row.risk_level, link: '/compliance' });
      for (const row of partners.data ?? []) items.push({ id: row.id, source: 'Third party', title: row.organisation, context: `${row.required_deliverable} · ${row.territory}`, date: row.due_date ?? row.renewal_date, status: row.status, priority: row.due_date ? 'high' : 'medium', link: '/partners' });
      for (const row of accounts.data ?? []) items.push({ id: row.id, source: 'CRM', title: row.name, context: row.next_action ?? 'Next action required', date: row.next_action_due, status: row.stage, priority: 'medium', link: '/crm' });
      return items.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    },
  });
}
