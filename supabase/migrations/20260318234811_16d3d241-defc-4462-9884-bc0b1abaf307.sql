
-- Security definer functions for project access checks
CREATE OR REPLACE FUNCTION public.can_view_project(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = _project_id AND owner = (
      SELECT display_name FROM public.profiles WHERE id = _user_id
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.project_members WHERE user_id = _user_id AND project_id = _project_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_project(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = _project_id AND owner = (
      SELECT display_name FROM public.profiles WHERE id = _user_id
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.project_members WHERE user_id = _user_id AND project_id = _project_id AND access_level = 'edit'
  )
$$;

-- Drop existing permissive policies on projects
DROP POLICY IF EXISTS "Authenticated full access" ON public.projects;

-- New RLS policies on projects
CREATE POLICY "Users can view assigned projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), id));

CREATE POLICY "Users can edit assigned projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.can_edit_project(auth.uid(), id))
  WITH CHECK (public.can_edit_project(auth.uid(), id));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update child tables to inherit project access
-- Tasks
DROP POLICY IF EXISTS "Authenticated full access" ON public.tasks;
CREATE POLICY "View tasks for accessible projects" ON public.tasks FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit tasks for editable projects" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));
CREATE POLICY "Update tasks for editable projects" ON public.tasks FOR UPDATE TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id));
CREATE POLICY "Delete tasks for editable projects" ON public.tasks FOR DELETE TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id));

-- Costs
DROP POLICY IF EXISTS "Authenticated full access" ON public.costs;
CREATE POLICY "View costs" ON public.costs FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit costs" ON public.costs FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Domains
DROP POLICY IF EXISTS "Authenticated full access" ON public.domains;
CREATE POLICY "View domains" ON public.domains FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit domains" ON public.domains FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Hosting
DROP POLICY IF EXISTS "Authenticated full access" ON public.hosting;
CREATE POLICY "View hosting" ON public.hosting FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit hosting" ON public.hosting FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Email services
DROP POLICY IF EXISTS "Authenticated full access" ON public.email_services;
CREATE POLICY "View email services" ON public.email_services FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit email services" ON public.email_services FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project platforms
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_platforms;
CREATE POLICY "View platforms" ON public.project_platforms FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit platforms" ON public.project_platforms FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project surfaces
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_surfaces;
CREATE POLICY "View surfaces" ON public.project_surfaces FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit surfaces" ON public.project_surfaces FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project checklist items
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_checklist_items;
CREATE POLICY "View checklist" ON public.project_checklist_items FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit checklist" ON public.project_checklist_items FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project integrations
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_integrations;
CREATE POLICY "View integrations" ON public.project_integrations FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit integrations" ON public.project_integrations FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Subsidiary apps
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_subsidiary_apps;
CREATE POLICY "View subsidiary apps" ON public.project_subsidiary_apps FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit subsidiary apps" ON public.project_subsidiary_apps FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project APIs
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_apis;
CREATE POLICY "View APIs" ON public.project_apis FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit APIs" ON public.project_apis FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project compliance
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_compliance;
CREATE POLICY "View compliance" ON public.project_compliance FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit compliance" ON public.project_compliance FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project investments
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_investments;
CREATE POLICY "View investments" ON public.project_investments FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit investments" ON public.project_investments FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project overheads
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_overheads;
CREATE POLICY "View overheads" ON public.project_overheads FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit overheads" ON public.project_overheads FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project subscription tiers
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_subscription_tiers;
CREATE POLICY "View tiers" ON public.project_subscription_tiers FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit tiers" ON public.project_subscription_tiers FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project additional work
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_additional_work;
CREATE POLICY "View additional work" ON public.project_additional_work FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit additional work" ON public.project_additional_work FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Project settings
DROP POLICY IF EXISTS "Authenticated full access" ON public.project_settings;
CREATE POLICY "View settings" ON public.project_settings FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit settings" ON public.project_settings FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Milestones
DROP POLICY IF EXISTS "Authenticated full access" ON public.milestones;
CREATE POLICY "View milestones" ON public.milestones FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit milestones" ON public.milestones FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- AI profiles
DROP POLICY IF EXISTS "Authenticated full access" ON public.ai_profiles;
CREATE POLICY "View AI profiles" ON public.ai_profiles FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit AI profiles" ON public.ai_profiles FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- QA issues
DROP POLICY IF EXISTS "Authenticated full access" ON public.qa_issues;
CREATE POLICY "View QA issues" ON public.qa_issues FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit QA issues" ON public.qa_issues FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));
