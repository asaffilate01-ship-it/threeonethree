import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type Domain = Tables<'domains'>;
export type ProjectPlatform = Tables<'project_platforms'>;
export type ProjectSurface = Tables<'project_surfaces'>;
export type ChecklistTemplateItem = Tables<'checklist_template_items'>;
export type ProjectChecklistItem = Tables<'project_checklist_items'>;

export interface ProjectWithRelations extends Project {
  domains: Domain[];
  project_platforms: ProjectPlatform[];
  project_surfaces: ProjectSurface[];
  project_checklist_items: (ProjectChecklistItem & {
    checklist_template_items: ChecklistTemplateItem | null;
  })[];
  tasks: Task[];
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectWithRelations(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          domains(*),
          project_platforms(*),
          project_surfaces(*),
          project_checklist_items(*, checklist_template_items(*)),
          tasks(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ProjectWithRelations;
    },
    enabled: !!id,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(code, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLaunchReadiness() {
  return useQuery({
    queryKey: ['launch-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_launch_readiness')
        .select('*')
        .order('readiness_percent', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectBurn() {
  return useQuery({
    queryKey: ['project-burn'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_project_burn')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*, projects(name, code)')
        .order('domain_name');
      if (error) throw error;
      return data;
    },
  });
}
