
-- Recreate views with security_invoker so they respect RLS on underlying tables

DROP VIEW IF EXISTS public.v_launch_readiness;
CREATE VIEW public.v_launch_readiness
WITH (security_invoker = on) AS
SELECT p.id,
    p.name,
    p.stage,
    count(pci.id) FILTER (WHERE pci.is_done) AS done_items,
    count(pci.id) AS total_items,
    CASE
        WHEN (count(pci.id) = 0) THEN 0::numeric
        ELSE round((100.0 * count(pci.id) FILTER (WHERE pci.is_done)::numeric) / count(pci.id)::numeric, 1)
    END AS readiness_percent
FROM projects p
LEFT JOIN project_checklist_items pci ON pci.project_id = p.id
GROUP BY p.id, p.name, p.stage;

DROP VIEW IF EXISTS public.v_project_burn;
CREATE VIEW public.v_project_burn
WITH (security_invoker = on) AS
SELECT p.id,
    p.name,
    (COALESCE(sum(d.annual_cost_gbp), 0::numeric) / 12::numeric
     + COALESCE(sum(h.monthly_cost_gbp), 0::numeric)
     + COALESCE(sum(e.monthly_cost_gbp), 0::numeric)
     + COALESCE(sum(pi.monthly_cost_gbp), 0::numeric)
     + COALESCE(sum(c.monthly_cost_gbp), 0::numeric)) AS est_monthly_burn_gbp
FROM projects p
LEFT JOIN domains d ON d.project_id = p.id
LEFT JOIN hosting h ON h.project_id = p.id
LEFT JOIN email_services e ON e.project_id = p.id
LEFT JOIN project_integrations pi ON pi.project_id = p.id
LEFT JOIN costs c ON c.project_id = p.id
GROUP BY p.id, p.name;

-- Fix dns_records: tie to project through domain
DROP POLICY IF EXISTS "Authenticated full access" ON public.dns_records;
CREATE POLICY "View dns records" ON public.dns_records FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = dns_records.domain_id
  AND can_view_project(auth.uid(), d.project_id)
));
CREATE POLICY "Edit dns records" ON public.dns_records FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = dns_records.domain_id
  AND can_edit_project(auth.uid(), d.project_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = dns_records.domain_id
  AND can_edit_project(auth.uid(), d.project_id)
));

-- Fix ssl_certificates: tie to project through domain
DROP POLICY IF EXISTS "Authenticated full access" ON public.ssl_certificates;
CREATE POLICY "View ssl certificates" ON public.ssl_certificates FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = ssl_certificates.domain_id
  AND can_view_project(auth.uid(), d.project_id)
));
CREATE POLICY "Edit ssl certificates" ON public.ssl_certificates FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = ssl_certificates.domain_id
  AND can_edit_project(auth.uid(), d.project_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.domains d WHERE d.id = ssl_certificates.domain_id
  AND can_edit_project(auth.uid(), d.project_id)
));

-- Fix task_links: tie to project through task
DROP POLICY IF EXISTS "Authenticated full access" ON public.task_links;
CREATE POLICY "View task links" ON public.task_links FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tasks t WHERE t.id = task_links.task_id
  AND can_view_project(auth.uid(), t.project_id)
));
CREATE POLICY "Edit task links" ON public.task_links FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tasks t WHERE t.id = task_links.task_id
  AND can_edit_project(auth.uid(), t.project_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tasks t WHERE t.id = task_links.task_id
  AND can_edit_project(auth.uid(), t.project_id)
));

-- checklist_templates and checklist_template_items are shared reference data (not project-specific)
-- They are templates, not project data, so read access is fine. But restrict writes to admins only.
DROP POLICY IF EXISTS "Authenticated full access" ON public.checklist_templates;
CREATE POLICY "Anyone can view templates" ON public.checklist_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage templates" ON public.checklist_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated full access" ON public.checklist_template_items;
CREATE POLICY "Anyone can view template items" ON public.checklist_template_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage template items" ON public.checklist_template_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- integrations table is a shared catalog (not project-specific), similar to templates
DROP POLICY IF EXISTS "Authenticated full access" ON public.integrations;
CREATE POLICY "Anyone can view integrations" ON public.integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage integrations" ON public.integrations FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
