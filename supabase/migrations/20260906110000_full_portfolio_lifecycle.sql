-- Full portfolio, downstream-client and back-office operating lifecycle.

ALTER TABLE public.crm_accounts
  ADD COLUMN IF NOT EXISTS parent_account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_kind text NOT NULL DEFAULT 'direct' CHECK (client_kind IN ('direct','sub_client','branch','franchisee','merchant','venue','partner_client')),
  ADD COLUMN IF NOT EXISTS service_status text NOT NULL DEFAULT 'prospect' CHECK (service_status IN ('prospect','trial','onboarding','live','paused','offboarded'));

CREATE INDEX IF NOT EXISTS crm_accounts_parent_idx ON public.crm_accounts(parent_account_id, project_id);

CREATE TABLE public.project_profiles (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  slogan text,
  service_summary text,
  business_plan text,
  target_customers text,
  payer_model text,
  pricing_summary text,
  primary_territory text NOT NULL DEFAULT 'INT' CHECK (primary_territory IN ('UK','DE','INT','GROUP')),
  legal_name text,
  trademark_status text NOT NULL DEFAULT 'not_checked',
  ui_ux_status text NOT NULL DEFAULT 'not_started',
  features_status text NOT NULL DEFAULT 'not_started',
  launch_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE public.project_lifecycle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workstream text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','blocked','ready_for_review','approved','not_applicable')),
  approval_required boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'not_requested' CHECK (approval_status IN ('not_requested','pending','approved','rejected','changes_requested','not_required')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  evidence_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  UNIQUE(project_id, title)
);

CREATE TABLE public.client_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  parent_site_id uuid REFERENCES public.client_sites(id) ON DELETE SET NULL,
  site_name text NOT NULL,
  site_type text NOT NULL DEFAULT 'branch',
  trading_name text,
  legal_name text,
  territory text NOT NULL DEFAULT 'UK' CHECK (territory IN ('UK','DE','INT')),
  address text,
  postcode text,
  manager_name text,
  manager_email text,
  manager_phone text,
  external_reference text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','onboarding','trial','live','paused','closed')),
  target_go_live date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE public.client_onboarding_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.client_sites(id) ON DELETE CASCADE,
  workstream text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','blocked','waiting_client','waiting_third_party','ready_for_review','approved','not_applicable')),
  approval_required boolean NOT NULL DEFAULT false,
  approval_status text NOT NULL DEFAULT 'not_required' CHECK (approval_status IN ('not_requested','pending','approved','rejected','changes_requested','not_required')),
  compliance_risk text NOT NULL DEFAULT 'medium' CHECK (compliance_risk IN ('low','medium','high','critical')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  next_review_date date,
  evidence_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  UNIQUE NULLS NOT DISTINCT (account_id, site_id, title)
);

CREATE TABLE public.back_office_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_area text NOT NULL CHECK (function_area IN ('administration','finance','hr')),
  title text NOT NULL,
  description text,
  entity_name text,
  territory text NOT NULL DEFAULT 'GROUP' CHECK (territory IN ('UK','DE','INT','GROUP')),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','waiting_external','review','complete','blocked','not_applicable')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  recurrence text,
  amount numeric(14,2),
  currency text NOT NULL DEFAULT 'GBP',
  confidential boolean NOT NULL DEFAULT false,
  evidence_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

ALTER TABLE public.approval_requests
  ADD COLUMN IF NOT EXISTS lifecycle_item_id uuid REFERENCES public.project_lifecycle_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_onboarding_item_id uuid REFERENCES public.client_onboarding_items(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.can_view_back_office(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'project_manager')
      OR public.has_role(_user_id, 'finance');
$$;

GRANT SELECT, INSERT, UPDATE ON public.project_profiles, public.project_lifecycle_items, public.client_sites, public.client_onboarding_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.back_office_items TO authenticated;
GRANT ALL ON public.project_profiles, public.project_lifecycle_items, public.client_sites, public.client_onboarding_items, public.back_office_items TO service_role;

ALTER TABLE public.project_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_lifecycle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.back_office_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['project_profiles','project_lifecycle_items','client_sites','client_onboarding_items']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()))', table_name || '_insert', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()))', table_name || '_update', table_name);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', 'set_' || table_name || '_updated_at', table_name);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change()', 'audit_' || table_name, table_name);
  END LOOP;
END $$;

CREATE POLICY back_office_items_read ON public.back_office_items FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'project_manager')
  OR (public.has_role(auth.uid(), 'finance') AND function_area = 'finance')
);
CREATE POLICY back_office_items_insert ON public.back_office_items FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY back_office_items_update ON public.back_office_items FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE TRIGGER set_back_office_items_updated_at BEFORE UPDATE ON public.back_office_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_back_office_items AFTER INSERT OR UPDATE ON public.back_office_items FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();

INSERT INTO public.project_profiles(project_id, brand_name, service_summary, primary_territory)
SELECT id, name, short_description, CASE WHEN territory = 'DE' THEN 'DE' WHEN territory = 'UK' THEN 'UK' ELSE 'INT' END
FROM public.projects
ON CONFLICT (project_id) DO NOTHING;

WITH template(workstream, title, description, approval_required, priority) AS (VALUES
  ('Strategy','Project details and business plan','Plain-English proposition, customer, payer, pricing, territory, delivery model, risks and milestones',true,'critical'),
  ('Brand','Brand name, slogan and identity','Approved name, slogan, colours, typography and brand rules',true,'high'),
  ('Brand','Logo and graphics pack','Master vector/raster logo, transparent variants, favicon, social and app-store graphics',true,'high'),
  ('Product','UI and UX approval','Desktop, mobile, accessibility and key journey approval',true,'critical'),
  ('Product','Features and functionality approval','Approved scope, roles, permissions, acceptance criteria and deferred features',true,'critical'),
  ('Product','Application or SaaS build','Complete web application, dashboards, data persistence and production configuration',true,'critical'),
  ('Product','Native mobile build','Capacitor or native configuration, permissions, signing and device acceptance',true,'high'),
  ('Testing','Quality and release testing','Unit, integration, E2E, role/RLS, accessibility, browser, device and regression evidence',true,'critical'),
  ('Testing','Security and privacy testing','OWASP review, dependency checks, secrets, RLS, file controls, monitoring and retest',true,'critical'),
  ('Legal','Legal entity and trading names','Approved legal owner, company registration and trading-name record',true,'critical'),
  ('Legal','Domains and DNS','Name clearance, registration, ownership, DNS, SSL and renewal controls',true,'high'),
  ('Legal','Trademark clearance and filing','Search, classes, filing territories, objections and renewal diary',true,'high'),
  ('Compliance','Product compliance classification','Applicable laws, regulators, permissions, policies, records and review cycle',true,'critical'),
  ('Compliance','Terms, privacy and consent','Terms, privacy, cookies, marketing consent, retention and DSAR controls',true,'critical'),
  ('Marketing','Online marketing plan','SEO, content, PPC, directories, analytics, conversion and territory launch plan',true,'high'),
  ('Marketing','Social media setup and plan','Accounts, handles, access, creative calendar, approvals and response process',true,'medium'),
  ('Marketing','Direct and field marketing plan','Visits, calls, mail, events, agents, partnerships and referral activity',true,'high'),
  ('Sales','Sales process and targets','ICP, lead sources, stages, scripts, demos, proposals, targets and handover',true,'high'),
  ('Sales','Cross-selling plan','Eligible portfolio services, consent, ownership, timing and referral attribution',true,'medium'),
  ('Client Operations','Client onboarding design','Contract, KYB/KYC, configuration, migration, training, acceptance and go-live',true,'critical'),
  ('Client Operations','Client compliance onboarding','Risk assessment, evidence, approval, exceptions and periodic review',true,'critical'),
  ('Integrations','Third-party connections and APIs','Provider owner, contract, credentials, sandbox, webhooks, testing and production approval',true,'critical'),
  ('Communications','Email setup','Mailboxes, sender domains, SPF, DKIM, DMARC, templates, consent and support routing',true,'high'),
  ('Communications','Phone and WhatsApp setup','Numbers, ownership, verification, routing, recording/consent and templates',true,'high'),
  ('Finance','Pricing, billing and finance controls','Pricing approval, tax, invoicing, payments, reconciliation, refunds and reporting',true,'critical'),
  ('Administration','Operating administration','Registers, filing calendar, document control, suppliers, insurance and renewals',true,'high'),
  ('People','HR and staffing plan','Roles, hiring, contracts, right-to-work, payroll, onboarding, training and access removal',true,'high')
)
INSERT INTO public.project_lifecycle_items(project_id, workstream, title, description, approval_required, approval_status, priority)
SELECT p.id, t.workstream, t.title, t.description, t.approval_required, CASE WHEN t.approval_required THEN 'not_requested' ELSE 'not_required' END, t.priority
FROM public.projects p CROSS JOIN template t
ON CONFLICT (project_id, title) DO NOTHING;

WITH template(workstream, title, description, approval_required, compliance_risk) AS (VALUES
  ('Commercial','Signed agreement and approved pricing','Contracting entity, service, payer, trial, price, term and cancellation recorded',true,'high'),
  ('Identity','Business and owner verification','Legal name, registration, beneficial owners and authorised representative verified',true,'high'),
  ('Compliance','Risk and regulatory assessment','Service-specific compliance, licences, sanctions and prohibited activity assessed',true,'critical'),
  ('Compliance','Privacy, consent and data processing','Controller/processor roles, DPA, consent, retention and data flows agreed',true,'high'),
  ('Configuration','Account and branch configuration','Users, roles, locations, products, permissions and settings configured',false,'medium'),
  ('Data','Import and migration','Source, mapping, authority, validation, reconciliation and deletion agreed',true,'high'),
  ('Integrations','Payments and third-party connections','Merchant/provider IDs, credentials, endpoints, webhooks and test evidence',true,'critical'),
  ('Communications','Email, phone and WhatsApp','Addresses, numbers, sender verification, routing and templates approved',false,'medium'),
  ('Training','Staff training and acceptance','Owners, managers and staff trained with attendance and acceptance evidence',false,'medium'),
  ('Testing','Client UAT and go-live test','Roles, workflows, payments, notifications, reports and mobile devices accepted',true,'critical'),
  ('Go Live','Go-live approval','All critical blockers closed, support contacts confirmed and launch approved',true,'critical'),
  ('Service','Support, review and renewal','SLA, adoption, incidents, compliance review and renewal tracked',false,'medium'),
  ('Growth','Cross-selling and referrals','Eligible portfolio services, permission, timing, owner and referral attribution',false,'low')
)
INSERT INTO public.client_onboarding_items(account_id, workstream, title, description, approval_required, approval_status, compliance_risk)
SELECT a.id, t.workstream, t.title, t.description, t.approval_required, CASE WHEN t.approval_required THEN 'not_requested' ELSE 'not_required' END, t.compliance_risk
FROM public.crm_accounts a CROSS JOIN template t
ON CONFLICT (account_id, site_id, title) DO NOTHING;

INSERT INTO public.back_office_items(function_area, title, description, territory, priority, confidential, recurrence) VALUES
  ('administration','Company and statutory filing calendar','Companies House, German registers, licences, insurance, domains, trademarks and renewals','GROUP','critical',false,'Monthly review'),
  ('administration','Portfolio document and access register','Document owners, versions, signatures, system access and leaver removal','GROUP','high',true,'Monthly review'),
  ('finance','Bookkeeping, management accounts and cash forecast','Transactions, reconciliations, debtor/creditor control, runway and management reporting','GROUP','critical',true,'Monthly'),
  ('finance','Tax, VAT, PAYE and payroll calendar','UK and German registrations, filings, liabilities, approvals and payment evidence','GROUP','critical',true,'Monthly review'),
  ('finance','Client billing and payment reconciliation','Trials, subscriptions, invoices, provider settlements, refunds and failed payments','GROUP','critical',true,'Weekly'),
  ('hr','Recruitment and workforce plan','Approved roles, headcount, budget, candidates, checks and offer approvals','GROUP','high',true,'Weekly'),
  ('hr','Employee and contractor onboarding','Contract, identity, right-to-work, payroll, policies, equipment, training and least-privilege access','GROUP','critical',true,'Per starter'),
  ('hr','Training, performance and offboarding','Mandatory training, objectives, reviews, absence, equipment return and immediate access removal','GROUP','high',true,'Monthly review')
ON CONFLICT DO NOTHING;

CREATE INDEX project_lifecycle_status_idx ON public.project_lifecycle_items(project_id, status, approval_status);
CREATE INDEX client_sites_account_idx ON public.client_sites(account_id, status);
CREATE INDEX client_onboarding_status_idx ON public.client_onboarding_items(account_id, site_id, status);
CREATE INDEX back_office_due_idx ON public.back_office_items(function_area, status, due_date);
