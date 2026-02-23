import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type Domain = Tables<'domains'>;
export type ProjectPlatform = Tables<'project_platforms'>;
export type ProjectSurface = Tables<'project_surfaces'>;
export type ChecklistTemplateItem = Tables<'checklist_template_items'>;
export type ProjectChecklistItem = Tables<'project_checklist_items'>;
export type Hosting = Tables<'hosting'>;
export type EmailService = Tables<'email_services'>;
export type SslCertificate = Tables<'ssl_certificates'>;
export type Cost = Tables<'costs'>;
export type Integration = Tables<'integrations'>;
export type ProjectIntegration = Tables<'project_integrations'>;

export interface ProjectWithRelations extends Project {
  domains: Domain[];
  project_platforms: ProjectPlatform[];
  project_surfaces: ProjectSurface[];
  project_checklist_items: (ProjectChecklistItem & {
    checklist_template_items: ChecklistTemplateItem | null;
  })[];
  tasks: Task[];
  hosting: Hosting[];
  email_services: EmailService[];
  costs: Cost[];
  project_integrations: (ProjectIntegration & {
    integrations: Integration | null;
  })[];
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
          tasks(*),
          hosting(*),
          email_services(*),
          costs(*),
          project_integrations(*, integrations(*))
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

export function useHosting() {
  return useQuery({
    queryKey: ['hosting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting')
        .select('*, projects(name, code)')
        .order('provider');
      if (error) throw error;
      return data;
    },
  });
}

export function useEmailServices() {
  return useQuery({
    queryKey: ['email-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_services')
        .select('*, projects(name, code)')
        .order('provider');
      if (error) throw error;
      return data;
    },
  });
}

export function useSslCertificates() {
  return useQuery({
    queryKey: ['ssl-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ssl_certificates')
        .select('*, domains(domain_name, projects(name, code))')
        .order('expiry_date');
      if (error) throw error;
      return data;
    },
  });
}

export function useCosts() {
  return useQuery({
    queryKey: ['costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('costs')
        .select('*, projects(name, code)')
        .order('cost_name');
      if (error) throw error;
      return data;
    },
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*, project_integrations(*, projects(name, code))')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectIntegrations() {
  return useQuery({
    queryKey: ['project-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_integrations')
        .select('*, integrations(*), projects(name, code)')
        .order('is_live', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from('project_checklist_items')
        .update({ is_done, done_at: is_done ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['launch-readiness'] });
    },
  });
}
