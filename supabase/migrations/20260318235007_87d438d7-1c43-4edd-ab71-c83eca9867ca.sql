
-- Update delivery_type check to include app_with_landing
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_delivery_type_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_delivery_type_check CHECK (delivery_type IN ('saas_only', 'saas_and_app', 'app_only', 'app_with_landing'));

-- Add multi-country flag
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_multi_country boolean DEFAULT false;

-- Project countries table
CREATE TABLE public.project_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  country_name text NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, country_code)
);
ALTER TABLE public.project_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View countries" ON public.project_countries FOR SELECT TO authenticated
  USING (public.can_view_project(auth.uid(), project_id));
CREATE POLICY "Edit countries" ON public.project_countries FOR ALL TO authenticated
  USING (public.can_edit_project(auth.uid(), project_id))
  WITH CHECK (public.can_edit_project(auth.uid(), project_id));

-- Add country to subscription tiers
ALTER TABLE public.project_subscription_tiers ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES project_countries(id) ON DELETE SET NULL;
ALTER TABLE public.project_subscription_tiers ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GBP';
ALTER TABLE public.project_subscription_tiers ADD COLUMN IF NOT EXISTS country_name text;
