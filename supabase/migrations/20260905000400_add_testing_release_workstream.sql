-- Add explicit testing and release-control work after the initial CRM rollout.

INSERT INTO public.operating_tasks (
  id, title, description, workstream, territory, owner, reviewer,
  third_party, status, priority
) VALUES (
  'setup-15',
  'Testing, UAT and release approval',
  'Complete unit, integration, end-to-end, role/RLS, payment, accessibility, browser, device, native, security, localisation, client UAT and regression evidence before release.',
  'Testing & Release',
  'GROUP',
  'QA & Release Lead',
  'Portfolio Product Manager and territory UAT owner',
  'Independent security tester and client acceptance owner',
  'backlog',
  'critical'
)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  workstream = EXCLUDED.workstream,
  owner = EXCLUDED.owner,
  reviewer = EXCLUDED.reviewer,
  third_party = EXCLUDED.third_party,
  priority = EXCLUDED.priority;

