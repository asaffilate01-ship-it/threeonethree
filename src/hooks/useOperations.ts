/* Supabase generated types are refreshed after the new migration is applied. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { initialOperatingTasks } from '@/data/operatingModel';

export type OperatingTask = {
  id: string;
  title: string;
  description: string | null;
  workstream: string;
  territory: string;
  owner: string | null;
  reviewer: string | null;
  third_party: string | null;
  project_code: string | null;
  status: 'backlog' | 'in_progress' | 'blocked' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  dependency: string | null;
  evidence_url: string | null;
};

const blueprintTasks: OperatingTask[] = initialOperatingTasks.map((task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  workstream: task.workstream,
  territory: task.territory,
  owner: task.owner,
  reviewer: task.reviewer,
  third_party: task.thirdParty,
  project_code: null,
  status: task.status as OperatingTask['status'],
  priority: task.priority as OperatingTask['priority'],
  due_date: task.dueDate,
  dependency: null,
  evidence_url: null,
}));

export function useOperatingTasks() {
  return useQuery({
    queryKey: ['operating-tasks'],
    queryFn: async (): Promise<{ tasks: OperatingTask[]; usingBlueprint: boolean }> => {
      const { data, error } = await (supabase as any)
        .from('operating_tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) return { tasks: blueprintTasks, usingBlueprint: true };
      return { tasks: (data ?? []) as OperatingTask[], usingBlueprint: false };
    },
  });
}

export function useUpdateOperatingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OperatingTask> }) => {
      const { error } = await (supabase as any).from('operating_tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating-tasks'] }),
  });
}

export function useCreateOperatingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<OperatingTask, 'id'>) => {
      const { error } = await (supabase as any).from('operating_tasks').insert({ id: crypto.randomUUID(), ...task });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating-tasks'] }),
  });
}
