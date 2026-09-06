CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT auth.uid(),
  requested_role text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','cancelled')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX access_requests_one_pending_scope_idx
  ON public.access_requests(requested_by, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE status = 'pending';

CREATE TABLE public.operational_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_reference text NOT NULL UNIQUE DEFAULT ('CASE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  case_type text NOT NULL CHECK (case_type IN ('client','compliance','complaint','incident','support','third_party','finance','people')),
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','triage','in_progress','waiting_external','review','resolved','closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  territory text NOT NULL DEFAULT 'GROUP' CHECK (territory IN ('UK','DE','INT','GROUP')),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  resolution_summary text,
  resolved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.case_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.operational_cases(id) ON DELETE CASCADE,
  update_type text NOT NULL DEFAULT 'note' CHECK (update_type IN ('note','call','email','meeting','status_change','evidence','decision')),
  body text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.evidence_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.operational_cases(id) ON DELETE SET NULL,
  file_url text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','in_review','approved','rejected','expired')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_due date,
  expires_on date,
  approved_at timestamptz,
  checksum text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  approval_type text NOT NULL,
  description text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.operational_cases(id) ON DELETE SET NULL,
  evidence_id uuid REFERENCES public.evidence_register(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','changes_requested','cancelled')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  approver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.access_requests TO authenticated;
GRANT UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operational_cases, public.case_updates, public.evidence_register, public.approval_requests TO authenticated;
GRANT ALL ON public.access_requests, public.operational_cases, public.case_updates, public.evidence_register, public.approval_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY access_requests_read ON public.access_requests FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY access_requests_insert ON public.access_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());
CREATE POLICY access_requests_update ON public.access_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY access_requests_delete ON public.access_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.operational_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY operational_cases_read ON public.operational_cases FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()));
CREATE POLICY operational_cases_insert ON public.operational_cases FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY operational_cases_update ON public.operational_cases FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY operational_cases_delete ON public.operational_cases FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()));

CREATE POLICY case_updates_read ON public.case_updates FOR SELECT TO authenticated
  USING (public.can_view_operations(auth.uid()) AND EXISTS (SELECT 1 FROM public.operational_cases c WHERE c.id = case_id));
CREATE POLICY case_updates_insert ON public.case_updates FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_operations(auth.uid()) AND created_by = auth.uid());
CREATE POLICY case_updates_update ON public.case_updates FOR UPDATE TO authenticated
  USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY case_updates_delete ON public.case_updates FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()));

CREATE POLICY evidence_register_read ON public.evidence_register FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()));
CREATE POLICY evidence_register_insert ON public.evidence_register FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY evidence_register_update ON public.evidence_register FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY evidence_register_delete ON public.evidence_register FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()));

CREATE POLICY approval_requests_read ON public.approval_requests FOR SELECT TO authenticated USING (public.can_view_operations(auth.uid()));
CREATE POLICY approval_requests_insert ON public.approval_requests FOR INSERT TO authenticated WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY approval_requests_update ON public.approval_requests FOR UPDATE TO authenticated USING (public.can_manage_operations(auth.uid())) WITH CHECK (public.can_manage_operations(auth.uid()));
CREATE POLICY approval_requests_delete ON public.approval_requests FOR DELETE TO authenticated USING (public.can_manage_operations(auth.uid()));

CREATE TRIGGER set_access_requests_updated_at BEFORE UPDATE ON public.access_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_operational_cases_updated_at BEFORE UPDATE ON public.operational_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_evidence_register_updated_at BEFORE UPDATE ON public.evidence_register FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_approval_requests_updated_at BEFORE UPDATE ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_access_requests AFTER INSERT OR UPDATE OR DELETE ON public.access_requests FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();
CREATE TRIGGER audit_operational_cases AFTER INSERT OR UPDATE OR DELETE ON public.operational_cases FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();
CREATE TRIGGER audit_case_updates AFTER INSERT OR UPDATE OR DELETE ON public.case_updates FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();
CREATE TRIGGER audit_evidence_register AFTER INSERT OR UPDATE OR DELETE ON public.evidence_register FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();
CREATE TRIGGER audit_approval_requests AFTER INSERT OR UPDATE OR DELETE ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION public.audit_operations_change();

CREATE INDEX operational_cases_status_due_idx ON public.operational_cases(status, due_date);
CREATE INDEX operational_cases_assignment_idx ON public.operational_cases(assigned_to, project_id);
CREATE INDEX case_updates_case_date_idx ON public.case_updates(case_id, created_at DESC);
CREATE INDEX evidence_register_status_due_idx ON public.evidence_register(status, review_due, expires_on);
CREATE INDEX approval_requests_status_due_idx ON public.approval_requests(status, due_date);