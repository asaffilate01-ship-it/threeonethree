
-- 1. Profiles table for user management
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. App roles enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'project_manager', 'viewer', 'finance', 'partner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. Project members (who can view/edit which project)
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'view',
  UNIQUE (project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access" ON public.project_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can view own" ON public.project_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. Subsidiary apps per project
CREATE TABLE public.project_subsidiary_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  notes text,
  status text NOT NULL DEFAULT 'to_do',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_subsidiary_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_subsidiary_apps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Additional APIs per project
CREATE TABLE public.project_apis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  vendor text,
  status text NOT NULL DEFAULT 'to_do',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_apis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_apis FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Compliance items per project
CREATE TABLE public.project_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'to_do',
  cost_gbp numeric,
  expiry_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_compliance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Investments & shareholders
CREATE TABLE public.project_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  investor_name text NOT NULL,
  amount_gbp numeric NOT NULL DEFAULT 0,
  shares_percent numeric,
  notes text,
  invested_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_investments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Overheads per project
CREATE TABLE public.project_overheads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  amount_gbp numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'monthly',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_overheads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_overheads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Subscription tiers per project
CREATE TABLE public.project_subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tier_name text NOT NULL,
  price_gbp numeric,
  billing_period text DEFAULT 'monthly',
  features text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_subscription_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Additional work items per project
CREATE TABLE public.project_additional_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'to_do',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_additional_work ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.project_additional_work FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Add extra columns to costs table for payment tracking
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS paid_by text;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS is_reimbursed boolean DEFAULT false;
ALTER TABLE public.costs ADD COLUMN IF NOT EXISTS reimbursed_to text;

-- 12. Add launch status fields to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS test_domain text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS has_logo boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS email_api_configured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS payment_gateway_configured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS security_owasp_checked boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS audit_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS push_notifications_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS broadcasts_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gdpr_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS terms_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS privacy_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS legals_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS seo_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS og_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS edge_functions_checked boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS security_checked boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS roles_permissions_checked boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS dead_links_checked boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pwa_required boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pwa_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS native_required boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS native_done boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_facebook text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_tiktok text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_instagram text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_youtube text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_x text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS domain_awaiting boolean DEFAULT false;
