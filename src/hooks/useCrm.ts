/* Supabase generated types are refreshed after the new migration is applied. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { crmBlueprint, CrmBlueprintAccount } from '@/data/crmBlueprint';

export function useCrmAccounts() {
  return useQuery({
    queryKey: ['crm-accounts'],
    queryFn: async (): Promise<{ accounts: CrmBlueprintAccount[]; usingBlueprint: boolean }> => {
      const { data, error } = await (supabase as any).from('crm_accounts').select('*, projects(name, code)').order('created_at');
      if (error) return { accounts: crmBlueprint, usingBlueprint: true };
      return {
        accounts: (data ?? []).map((row: any) => ({
          id: row.id,
          name: row.name,
          project: row.projects?.name ?? 'Group / unassigned',
          projectCode: row.projects?.code ?? null,
          territory: row.territory,
          type: `${row.account_type.charAt(0).toUpperCase()}${row.account_type.slice(1)}`,
          stage: row.stage,
          volume: row.volume_label ?? '1 account',
          owner: row.owner_label ?? 'Unassigned',
          nextAction: row.next_action ?? 'Set next action',
        })),
        usingBlueprint: false,
      };
    },
  });
}

export function useUpdateCrmAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await (supabase as any).from('crm_accounts').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-accounts'] }),
  });
}
