import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProjectProfile = Tables<"project_profiles">;
export type ProjectLifecycleItem = Tables<"project_lifecycle_items">;
export type ClientAccount = Tables<"crm_accounts">;
export type ClientSite = Tables<"client_sites">;
export type ClientOnboardingItem = Tables<"client_onboarding_items">;
export type BackOfficeItem = Tables<"back_office_items">;

export function useProjectLifecycle(projectId: string | null) {
  return useQuery({
    queryKey: ["project-lifecycle", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const [profile, items] = await Promise.all([
        supabase
          .from("project_profiles")
          .select("*")
          .eq("project_id", projectId!)
          .maybeSingle(),
        supabase
          .from("project_lifecycle_items")
          .select("*")
          .eq("project_id", projectId!)
          .is("archived_at", null)
          .order("workstream")
          .order("title"),
      ]);
      const error = profile.error || items.error;
      if (error) throw error;
      return {
        profile: profile.data as ProjectProfile | null,
        items: (items.data ?? []) as ProjectLifecycleItem[],
      };
    },
  });
}

export function useClientNetwork(projectId: string | null) {
  return useQuery({
    queryKey: ["client-network", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const accountsResult = await supabase
        .from("crm_accounts")
        .select("*")
        .eq("project_id", projectId!)
        .order("name");
      if (accountsResult.error) throw accountsResult.error;
      const accounts = (accountsResult.data ?? []) as ClientAccount[];
      const accountIds = accounts.map((account) => account.id);
      if (!accountIds.length)
        return {
          accounts,
          sites: [] as ClientSite[],
          onboarding: [] as ClientOnboardingItem[],
        };
      const [sites, onboarding] = await Promise.all([
        supabase
          .from("client_sites")
          .select("*")
          .in("account_id", accountIds)
          .is("archived_at", null)
          .order("site_name"),
        supabase
          .from("client_onboarding_items")
          .select("*")
          .in("account_id", accountIds)
          .is("archived_at", null)
          .order("workstream")
          .order("title"),
      ]);
      const error = sites.error || onboarding.error;
      if (error) throw error;
      return {
        accounts,
        sites: (sites.data ?? []) as ClientSite[],
        onboarding: (onboarding.data ?? []) as ClientOnboardingItem[],
      };
    },
  });
}

export function useBackOffice() {
  return useQuery({
    queryKey: ["back-office"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("back_office_items")
        .select("*")
        .is("archived_at", null)
        .order("priority")
        .order("due_date");
      if (error) throw error;
      return (data ?? []) as BackOfficeItem[];
    },
  });
}
