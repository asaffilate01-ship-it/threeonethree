-- Next phase: testing controls, CRM activity history and initial operating teams/providers.

-- Internal operations data is restricted to staff roles. Partners do not receive
-- portfolio-wide access, and finance remains read-only outside finance workflows.
CREATE OR REPLACE FUNCTION public.can_manage_operations(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'project_manager');
$$;

CREATE OR REPLACE FUNCTION public.can_view_operations(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'project_manager')
      OR public.has_role(_user_id, 'finance')
      OR public.has_role(_user_id, 'viewer');
$$;

INSERT INTO public.operating_tasks (
  id, title, description, workstream, territory, owner, reviewer,
  third_party, status, priority
) VALUES (
  'setup-15',
  'Testing, UAT and release approval',
  'Complete unit, integration, end-to-end, role/RLS, payment, accessibility, browser, device, native, security, localisation, client UAT and regression evidence before release.',
  'Testing & Release', 'GROUP', 'QA & Release Lead',
  'Portfolio Product Manager and territory UAT owner',
  'Independent security tester and client acceptance owner', 'backlog', 'critical'
)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  workstream = EXCLUDED.workstream,
  owner = EXCLUDED.owner,
  reviewer = EXCLUDED.reviewer,
  third_party = EXCLUDED.third_party,
  priority = EXCLUDED.priority;

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('note','call','email','meeting','visit','demo','document','status_change')),
  subject text NOT NULL,
  detail text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  next_action text,
  next_action_due date,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
CREATE POLICY crm_activities_read ON public.crm_activities FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()));
CREATE POLICY crm_activities_insert ON public.crm_activities FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY crm_activities_update ON public.crm_activities FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY crm_activities_delete ON public.crm_activities FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()));
CREATE TRIGGER set_crm_activities_updated_at BEFORE UPDATE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_crm_activities AFTER INSERT OR UPDATE OR DELETE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();
CREATE INDEX crm_activities_account_date_idx ON public.crm_activities(account_id, occurred_at DESC);
CREATE INDEX crm_activities_next_action_idx ON public.crm_activities(next_action_due) WHERE next_action_due IS NOT NULL;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['team_positions','crm_accounts','crm_contacts','crm_deals','onboarding_cases','onboarding_steps','third_party_actions','compliance_register','marketing_campaigns','operating_tasks']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()))', table_name || '_read', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS operations_audit_log_read ON public.operations_audit_log;
CREATE POLICY operations_audit_log_read ON public.operations_audit_log
  FOR SELECT TO authenticated
  USING (public.can_manage_operations(auth.uid()));

WITH positions(department, role_title, territory, planned_headcount, hiring_phase, engagement, qualification_required) AS (VALUES
  ('Leadership & PMO','Portfolio Operations Director','GROUP',1,'Day one','Employee',NULL),
  ('Leadership & PMO','UK Programme Manager','UK',1,'Day one','Employee',NULL),
  ('Leadership & PMO','Germany Programme Manager','DE',1,'Day one','Employee','German-language operating experience'),
  ('Compliance','UK Compliance Manager','UK',1,'Day one','Employee or contractor','Relevant UK compliance experience'),
  ('Compliance','Germany & EU Compliance Manager','DE',1,'Day one','Employee or contractor','German/EU compliance experience'),
  ('Compliance','Independent Compliance Reviewer','GROUP',1,'First 90 days','Qualified external adviser','Qualification appropriate to the reviewed scope'),
  ('Corporate & Finance','Company Secretarial and Registrations Manager','GROUP',1,'Day one','Employee',NULL),
  ('Corporate & Finance','Management Accountant / Finance Manager','GROUP',1,'Day one','Employee or contractor','Accounting qualification or supervised experience'),
  ('Client Operations','Client Onboarding Manager','GROUP',1,'Day one','Employee',NULL),
  ('Client Operations','Onboarding & Verification Officer','UK',1,'First 90 days','Employee',NULL),
  ('Client Operations','Onboarding & Verification Officer','DE',1,'First 90 days','Employee','German language'),
  ('Partnerships','Third-Party & Integrations Manager','GROUP',1,'Day one','Employee',NULL),
  ('Sales','Head of B2B Sales','GROUP',1,'Day one','Employee',NULL),
  ('Sales','B2B Account Executive','UK',2,'First 90 days','Employee',NULL),
  ('Sales','B2B Account Executive','DE',2,'First 90 days','Employee','German language'),
  ('Sales','Sales Development Representative','GROUP',2,'First 90 days','Employee',NULL),
  ('Sales','Agents & Referral Manager','GROUP',1,'Scale','Employee',NULL),
  ('Marketing','Head of Growth','GROUP',1,'Day one','Employee',NULL),
  ('Marketing','SEO & Performance Marketing Manager','GROUP',1,'First 90 days','Employee',NULL),
  ('Marketing','Content, Social & Lifecycle Manager','UK',1,'First 90 days','Employee',NULL),
  ('Marketing','German Localisation & Content Manager','DE',1,'First 90 days','Employee','Native-level German'),
  ('Product & Engineering','Head of Product & Engineering','GROUP',1,'Day one','Employee',NULL),
  ('Product & Engineering','Portfolio Product Manager','GROUP',2,'Day one','Employee',NULL),
  ('Product & Engineering','Full-Stack Engineer','GROUP',4,'Day one','Employee or contractor',NULL),
  ('Product & Engineering','Mobile / Capacitor Engineer','GROUP',1,'First 90 days','Employee or contractor',NULL),
  ('Testing & Release','QA & Release Lead','GROUP',1,'Day one','Employee or contractor',NULL),
  ('Product & Engineering','QA & Test Automation Engineer','GROUP',2,'Day one','Employee or contractor',NULL),
  ('Testing & Release','UK and German UAT & Localisation Tester','GROUP',2,'First 90 days','Employee or contractor','English and German testing coverage'),
  ('Testing & Release','Independent Security Tester','GROUP',1,'First 90 days','Qualified external adviser','Independent security-testing competence'),
  ('Product & Engineering','DevOps, Security & Data Engineer','GROUP',1,'Day one','Employee or contractor',NULL),
  ('Product & Engineering','Product Designer','GROUP',1,'First 90 days','Employee or contractor',NULL),
  ('Customer Success','Customer Success & Support Specialist','UK',2,'First 90 days','Employee',NULL),
  ('Customer Success','Customer Success & Support Specialist','DE',2,'Scale','Employee','German language'),
  ('People & Administration','People Operations & Recruitment Manager','GROUP',1,'First 90 days','Employee',NULL),
  ('People & Administration','Portfolio Administrator','GROUP',1,'Day one','Employee',NULL)
)
INSERT INTO public.team_positions (department, role_title, territory, planned_headcount, hiring_phase, engagement, qualification_required)
SELECT * FROM positions
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_positions existing
  WHERE existing.role_title = positions.role_title AND existing.territory = positions.territory
);

WITH providers(organisation, category, territory, required_deliverable, external_owner_name, qualification_required, notes) AS (VALUES
  ('Insurance providers and brokers','Insurance','GROUP','Appointment, product terms, eligibility, integration/referral route, training and complaints process',NULL,'Authorised insurance principal, broker or adviser as applicable','May move to qualified in-house ownership later'),
  ('Adyen','Payments','GROUP','Legal entity and merchant approval, platform capabilities, terminals/e-commerce, credentials, webhooks and production sign-off',NULL,'Provider approval and appropriate internal payments competence','Track identifiers; keep secret keys in the vault'),
  ('Swan or selected banking provider','Banking','GROUP','Programme assessment, KYB/KYC, accounts/cards/payments capabilities, API access and production approval',NULL,'Payments/banking compliance advice where required','Do not launch regulated scope before approval'),
  ('Companies House','Government','UK','Incorporation, identity verification, filing access and confirmations',NULL,'ACSP/solicitor/accountant where required',NULL),
  ('HMRC','Government','UK','Corporation Tax, VAT, PAYE, agent authorisation and filing acknowledgements',NULL,'UK accountant or tax adviser where required',NULL),
  ('German notary and registers','Government','DE','Notarial formation, Handelsregister, transparency and trade registrations',NULL,'German notary/lawyer',NULL),
  ('Finanzamt and German payroll authorities','Government','DE','Tax number, VAT, wage tax, payroll and official confirmations',NULL,'German Steuerberater/payroll specialist',NULL),
  ('Councils and sector regulators','Authority','GROUP','Licences, registrations, inspections or written scope confirmation',NULL,'Sector-qualified adviser where required',NULL),
  ('Apple and Google','App distribution','GROUP','Developer verification, signing access, policy review and store approval',NULL,NULL,NULL),
  ('Domain, email, telecom and Meta providers','Communications','GROUP','Domains, DNS/email, telephone/WhatsApp verification, templates and support route',NULL,NULL,'Secrets remain in the vault'),
  ('Trademark offices and attorneys','Intellectual property','GROUP','Clearance, filing, examination, opposition and renewals',NULL,'Trademark attorney',NULL),
  ('Independent testing and security providers','Testing','GROUP','Agreed scope, independent execution, severity-rated findings, retest and final report',NULL,'Independent security-testing competence',NULL)
)
INSERT INTO public.third_party_actions (
  organisation, category, territory, required_deliverable,
  external_owner_name, qualification_required, notes
)
SELECT * FROM providers
WHERE NOT EXISTS (
  SELECT 1 FROM public.third_party_actions existing
  WHERE existing.organisation = providers.organisation AND existing.territory = providers.territory
);
