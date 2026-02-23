
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.project_stage AS ENUM (
  'idea','inception','started','basic_build','testing','beta','soft_launch','live','scaling','paused'
);

CREATE TYPE public.platform_type AS ENUM (
  'website','saas_web','pwa','native_ios','native_android','api_only','white_label'
);

CREATE TYPE public.surface_type AS ENUM (
  'admin_dashboard','user_app','vendor_app','driver_app','merchant_portal',
  'staff_portal','client_portal','super_admin','public_marketing_site'
);

CREATE TYPE public.integration_category AS ENUM (
  'payments','email','sms','whatsapp','auth','storage','analytics','seo','maps','ai','crm','telephony','other'
);

CREATE TYPE public.task_status AS ENUM (
  'backlog','in_progress','blocked','testing','ready','done','cancelled'
);

CREATE TYPE public.priority_level AS ENUM ('low','medium','high','critical');

-- =========================
-- CORE TABLES
-- =========================
CREATE TABLE public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  short_description   TEXT,
  industry            TEXT,
  audience            TEXT,
  revenue_model       TEXT,
  stage               public.project_stage NOT NULL DEFAULT 'idea',
  launch_target_date  DATE,
  owner               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.project_platforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform    public.platform_type NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_built    BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT,
  UNIQUE(project_id, platform)
);

CREATE TABLE public.project_surfaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  surface       public.surface_type NOT NULL,
  is_required   BOOLEAN NOT NULL DEFAULT TRUE,
  is_built      BOOLEAN NOT NULL DEFAULT FALSE,
  auth_required BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  UNIQUE(project_id, surface)
);

-- =========================
-- DOMAINS / DNS / EMAIL / SSL / HOSTING
-- =========================
CREATE TABLE public.domains (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  domain_name   TEXT NOT NULL,
  registrar     TEXT,
  purchase_date DATE,
  renew_date    DATE,
  annual_cost_gbp NUMERIC(12,2),
  auto_renew    BOOLEAN DEFAULT TRUE,
  status        TEXT DEFAULT 'active',
  notes         TEXT,
  UNIQUE(project_id, domain_name)
);

CREATE TABLE public.dns_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id   UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  name        TEXT NOT NULL,
  value       TEXT NOT NULL,
  ttl         INTEGER DEFAULT 3600,
  is_verified BOOLEAN DEFAULT FALSE,
  notes       TEXT
);

CREATE TABLE public.hosting (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  hosting_type    TEXT,
  environment     TEXT NOT NULL DEFAULT 'production',
  region          TEXT,
  monthly_cost_gbp NUMERIC(12,2),
  annual_cost_gbp  NUMERIC(12,2),
  start_date      DATE,
  notes           TEXT
);

CREATE TABLE public.ssl_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id       UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  provider        TEXT,
  is_free         BOOLEAN DEFAULT TRUE,
  issue_date      DATE,
  expiry_date     DATE,
  annual_cost_gbp NUMERIC(12,2),
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT
);

CREATE TABLE public.email_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  primary_domain  TEXT,
  monthly_cost_gbp NUMERIC(12,2),
  annual_cost_gbp  NUMERIC(12,2),
  spf_configured  BOOLEAN DEFAULT FALSE,
  dkim_configured BOOLEAN DEFAULT FALSE,
  dmarc_configured BOOLEAN DEFAULT FALSE,
  notes           TEXT
);

-- =========================
-- INTEGRATIONS / AI / COSTS
-- =========================
CREATE TABLE public.integrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    public.integration_category NOT NULL,
  vendor      TEXT,
  docs_url    TEXT,
  notes       TEXT,
  UNIQUE(name, vendor)
);

CREATE TABLE public.project_integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_id  UUID NOT NULL REFERENCES public.integrations(id) ON DELETE RESTRICT,
  is_required     BOOLEAN NOT NULL DEFAULT FALSE,
  is_configured   BOOLEAN NOT NULL DEFAULT FALSE,
  is_live         BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_cost_gbp NUMERIC(12,2),
  annual_cost_gbp  NUMERIC(12,2),
  config_notes    TEXT,
  UNIQUE(project_id, integration_id)
);

CREATE TABLE public.ai_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  model             TEXT,
  monthly_budget_gbp NUMERIC(12,2),
  tokens_estimate   BIGINT,
  usage_notes       TEXT
);

CREATE TABLE public.costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  cost_name       TEXT NOT NULL,
  vendor          TEXT,
  cost_type       TEXT,
  monthly_cost_gbp NUMERIC(12,2),
  annual_cost_gbp  NUMERIC(12,2),
  one_off_cost_gbp NUMERIC(12,2),
  start_date      DATE,
  end_date        DATE,
  notes           TEXT
);

-- =========================
-- PROGRESS / CHECKLISTS / TASKS
-- =========================
CREATE TABLE public.checklist_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  stage       public.project_stage,
  description TEXT
);

CREATE TABLE public.checklist_template_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  item_key      TEXT NOT NULL,
  label         TEXT NOT NULL,
  category      TEXT,
  is_critical   BOOLEAN DEFAULT FALSE,
  sort_order    INTEGER DEFAULT 0,
  UNIQUE(template_id, item_key)
);

CREATE TABLE public.project_checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES public.checklist_template_items(id) ON DELETE CASCADE,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  done_at         TIMESTAMPTZ,
  notes           TEXT,
  UNIQUE(project_id, template_item_id)
);

CREATE TABLE public.milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  due_date    DATE,
  completed_at DATE,
  notes       TEXT
);

CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  surface_id    UUID REFERENCES public.project_surfaces(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        public.task_status NOT NULL DEFAULT 'backlog',
  priority      public.priority_level NOT NULL DEFAULT 'medium',
  assigned_to   TEXT,
  due_date      DATE,
  blocked_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.task_links (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id   UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  url       TEXT NOT NULL
);

-- =========================
-- ENABLE RLS ON ALL TABLES
-- =========================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssl_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_links ENABLE ROW LEVEL SECURITY;

-- =========================
-- RLS POLICIES (authenticated users get full access)
-- =========================
CREATE POLICY "Authenticated full access" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.project_platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.project_surfaces FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.domains FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.dns_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.hosting FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.ssl_certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.email_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.project_integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.ai_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.costs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.checklist_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.checklist_template_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.project_checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.task_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================
-- VIEWS
-- =========================
CREATE OR REPLACE VIEW public.v_project_burn AS
SELECT
  p.id,
  p.name,
  COALESCE(SUM(d.annual_cost_gbp),0)/12
  + COALESCE(SUM(h.monthly_cost_gbp),0)
  + COALESCE(SUM(e.monthly_cost_gbp),0)
  + COALESCE(SUM(pi.monthly_cost_gbp),0)
  + COALESCE(SUM(c.monthly_cost_gbp),0) AS est_monthly_burn_gbp
FROM public.projects p
LEFT JOIN public.domains d ON d.project_id = p.id
LEFT JOIN public.hosting h ON h.project_id = p.id
LEFT JOIN public.email_services e ON e.project_id = p.id
LEFT JOIN public.project_integrations pi ON pi.project_id = p.id
LEFT JOIN public.costs c ON c.project_id = p.id
GROUP BY p.id, p.name;

CREATE OR REPLACE VIEW public.v_launch_readiness AS
SELECT
  p.id,
  p.name,
  p.stage,
  COUNT(pci.id) FILTER (WHERE pci.is_done) AS done_items,
  COUNT(pci.id) AS total_items,
  CASE WHEN COUNT(pci.id)=0 THEN 0
       ELSE ROUND(100.0 * COUNT(pci.id) FILTER (WHERE pci.is_done) / COUNT(pci.id), 1)
  END AS readiness_percent
FROM public.projects p
LEFT JOIN public.project_checklist_items pci ON pci.project_id = p.id
GROUP BY p.id, p.name, p.stage;

-- =========================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
