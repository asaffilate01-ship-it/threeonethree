-- Portfolio operations CRM: staff, client onboarding, compliance, third parties,
-- marketing and auditable work management for UK, Germany and international work.

CREATE OR REPLACE FUNCTION public.can_manage_operations(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'project_manager')
      OR public.has_role(_user_id, 'finance');
$$;

CREATE TABLE public.team_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  role_title text NOT NULL,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT','GROUP')),
  planned_headcount integer NOT NULL DEFAULT 1 CHECK (planned_headcount > 0),
  filled_headcount integer NOT NULL DEFAULT 0 CHECK (filled_headcount >= 0),
  hiring_phase text NOT NULL DEFAULT 'Day one',
  engagement text NOT NULL DEFAULT 'Employee',
  qualification_required text,
  responsibilities text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'planned',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('prospect','client','partner','agent','adviser','authority','provider')),
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT','GROUP')),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'lead',
  legal_name text,
  company_number text,
  tax_identifier text,
  website text,
  phone text,
  email text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_label text,
  volume_label text,
  next_action text,
  next_action_due date,
  risk_rating text CHECK (risk_rating IS NULL OR risk_rating IN ('low','medium','high','prohibited')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  job_title text,
  email text,
  phone text,
  is_decision_maker boolean NOT NULL DEFAULT false,
  lawful_contact_basis text,
  do_not_contact boolean NOT NULL DEFAULT false,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'qualified',
  value numeric(14,2),
  currency text NOT NULL DEFAULT 'GBP',
  probability integer CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  trial_start_date date,
  trial_end_date date,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  loss_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT')),
  status text NOT NULL DEFAULT 'not_started',
  risk_rating text CHECK (risk_rating IS NULL OR risk_rating IN ('low','medium','high','prohibited')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_go_live date,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_case_id uuid NOT NULL REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  evidence_url text,
  exception_reason text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.third_party_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  organisation text NOT NULL,
  category text NOT NULL,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT','GROUP')),
  required_deliverable text NOT NULL,
  internal_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  external_owner_name text,
  status text NOT NULL DEFAULT 'not_started',
  due_date date,
  renewal_date date,
  dependency text,
  evidence_url text,
  escalation_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  can_be_brought_in_house boolean NOT NULL DEFAULT true,
  qualification_required text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.compliance_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  entity_name text,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT','GROUP')),
  authority text,
  requirement text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  preparer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  external_adviser text,
  due_date date,
  renewal_date date,
  evidence_url text,
  legal_basis_or_scope text,
  exception_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (project_id IS NOT NULL OR account_id IS NOT NULL OR entity_name IS NOT NULL)
);

CREATE TABLE public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT')),
  audience_side text NOT NULL CHECK (audience_side IN ('business','user','both-distinct-journeys')),
  channel text NOT NULL,
  objective text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  budget numeric(14,2),
  currency text NOT NULL DEFAULT 'GBP',
  leads integer NOT NULL DEFAULT 0,
  meetings integer NOT NULL DEFAULT 0,
  trials integer NOT NULL DEFAULT 0,
  customers integer NOT NULL DEFAULT 0,
  spend numeric(14,2) NOT NULL DEFAULT 0,
  next_action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.operating_tasks (
  id text PRIMARY KEY,
  project_code text REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  workstream text NOT NULL,
  territory text NOT NULL CHECK (territory IN ('UK','DE','INT','GROUP')),
  owner text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer text,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  third_party text,
  third_party_action_id uuid REFERENCES public.third_party_actions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog','in_progress','blocked','review','done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  due_date date,
  dependency text,
  evidence_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.operations_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  row_id text NOT NULL,
  action text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.audit_operations_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.operations_audit_log(table_name, row_id, action, old_data, new_data)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id::text, OLD.id::text), TG_OP,
          CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
          CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['team_positions','crm_accounts','crm_contacts','crm_deals','onboarding_cases','onboarding_steps','third_party_actions','compliance_register','marketing_campaigns','operating_tasks']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()))', table_name || '_insert', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()))', table_name || '_update', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()))', table_name || '_delete', table_name);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', 'set_' || table_name || '_updated_at', table_name);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change()', 'audit_' || table_name, table_name);
  END LOOP;
END $$;

ALTER TABLE public.operations_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_audit_log_read ON public.operations_audit_log FOR SELECT TO authenticated USING (public.can_manage_operations(auth.uid()));

INSERT INTO public.operating_tasks (id, title, description, workstream, territory, owner, reviewer, third_party, status, priority) VALUES
  ('setup-1', 'UK company formation and identity verification', 'Incorporation, registered office, directors, PSCs and verified identities recorded', 'Corporate & Finance', 'UK', 'Company Secretarial and Registrations Manager', 'UK solicitor or accountant', 'Companies House / authorised corporate service provider', 'in_progress', 'critical'),
  ('setup-2', 'HMRC registrations and finance setup', 'Corporation Tax, UTR, VAT assessment/registration, PAYE and filing calendar', 'Corporate & Finance', 'UK', 'Company Secretarial and Registrations Manager', 'UK accountant or tax adviser', 'HMRC', 'in_progress', 'critical'),
  ('setup-3', 'German entity and tax registrations', 'Formation, beneficial-owner filings, tax number, VAT, payroll and trade registrations evidenced', 'Corporate & Finance', 'DE', 'Germany Programme Manager', 'German lawyer, notary and Steuerberater', 'Notary, Handelsregister, Gewerbeamt, Finanzamt, IHK/HWK', 'in_progress', 'critical'),
  ('setup-4', 'Product compliance classification', 'Classify every product by service, payer, data, geography, regulated activity and required controls', 'Compliance', 'GROUP', 'Territory Compliance Manager', 'Independent Compliance Reviewer', NULL, 'backlog', 'critical'),
  ('setup-5', 'B2B client compliance assessment', 'Create a risk-rated client file, approvals and periodic review date', 'Compliance', 'GROUP', 'Territory Compliance Manager', 'Independent Compliance Reviewer', NULL, 'backlog', 'critical'),
  ('setup-6', 'Client onboarding and implementation', 'Contract, KYB, configuration, import, training, testing, acceptance and go-live', 'Client Operations', 'GROUP', 'Client Onboarding Manager', 'Customer acceptance owner', NULL, 'backlog', 'critical'),
  ('setup-7', 'Provider and authority onboarding', 'Application, agreement, credentials, certification, test and production approvals and renewal', 'Partnerships', 'GROUP', 'Third-Party & Integrations Manager', 'Compliance and Product owners', 'Provider or authority', 'backlog', 'critical'),
  ('setup-8', 'Finish application and SaaS readiness', 'Roadmap, acceptance, security, privacy, QA, support and release evidence', 'Product & Engineering', 'GROUP', 'Portfolio Product Manager', 'Head of Product & Engineering', NULL, 'backlog', 'high'),
  ('setup-9', 'Native application delivery', 'Capacitor builds, signing, permissions, store assets, privacy declarations and releases', 'Product & Engineering', 'GROUP', 'Mobile / Capacitor Engineer', 'QA & Test Automation Engineer', 'Apple App Store / Google Play', 'backlog', 'high'),
  ('setup-10', 'Domains, email, phone and WhatsApp setup', 'Ownership, renewals, DNS, SPF/DKIM/DMARC, mailboxes, numbers, templates and access', 'People & Administration', 'GROUP', 'Portfolio Administrator', 'DevOps, Security & Data Engineer', 'Registrar, email, telecom and Meta providers', 'backlog', 'high'),
  ('setup-11', 'Trademark and intellectual-property management', 'Clearance, classes, applications, objections, renewals and evidence', 'Corporate & Finance', 'GROUP', 'Company Secretarial and Registrations Manager', 'Trademark attorney', 'UKIPO / EUIPO / DPMA', 'backlog', 'high'),
  ('setup-12', 'SEO and market launch', 'SEO, content, analytics, direct outreach, visits, calls, referrals and agents plan', 'Marketing', 'GROUP', 'Head of Growth', 'Portfolio Product Manager', NULL, 'backlog', 'high'),
  ('setup-13', 'Sales pipeline and handover', 'Qualification, demo, proposal, decision, contract and onboarding handover', 'Sales', 'GROUP', 'Head of B2B Sales', 'Client Onboarding Manager', NULL, 'backlog', 'high'),
  ('setup-14', 'Service support and renewal', 'SLA, support cases, adoption, risks, renewal and references', 'Customer Success', 'GROUP', 'Customer Success & Support Specialist', 'Client Onboarding Manager', NULL, 'backlog', 'high')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX operating_tasks_status_idx ON public.operating_tasks(status, priority);
CREATE INDEX operating_tasks_project_idx ON public.operating_tasks(project_code);
CREATE INDEX crm_accounts_project_idx ON public.crm_accounts(project_id, stage);
CREATE INDEX onboarding_cases_account_idx ON public.onboarding_cases(account_id, status);
CREATE INDEX compliance_register_due_idx ON public.compliance_register(status, due_date, renewal_date);
CREATE INDEX third_party_actions_due_idx ON public.third_party_actions(status, due_date, renewal_date);
