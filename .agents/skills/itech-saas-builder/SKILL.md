---
name: itech-saas-builder
description: Use for iTechLounge portfolio SaaS audits, feature builds, UI/UX redesign, Lovable/GitHub readiness, Supabase migrations, AI/MCP integration and multi-tenant releases. Prioritise truthful implementation, isolation, tests and repeatable delivery.
---

# iTechLounge SaaS production skill

Use this as an orchestration guide, not a substitute for source code, product requirements, privacy reviews, or project-specific AGENTS.md / DESIGN.md / PRODUCT.md.

## Start with evidence

1. Identify the exact repository, product name, country, tenant model, stack, main branch and active PRs. Never infer a brand's repository from a similar name.
2. Read README, AGENTS.md, product specification, DESIGN.md, package scripts, migrations, auth/RLS, routes, tests, environment-variable examples and CI status.
3. Classify each requested feature: implemented, wired to production data, mocked, incomplete, untested, blocked or not started. Cite files and test outputs.
4. Compare the existing contract to the requested change. Preserve published behaviour, stable IDs, data, user roles, workflows, repo history and Lovable connections.

## Select skills deliberately

- Existing screen redesign: design-taste-frontend or redesign-existing-projects; then impeccable for critique/polish; verify with web-design-guidelines.
- Complex SaaS information architecture: ui-ux-pro-max for patterns, then preserve the project's own DESIGN.md as visual authority. Awesome Design is a reference collection, not a theme to impose.
- React/Next.js performance: vercel-react-best-practices. Apply only compatible rules to the actual framework.
- Supabase schema, Auth, Edge Functions, policies or SQL: supabase and supabase-postgres-best-practices before edits.
- Bugs or significant features: systematic-debugging, test-driven-development and verification-before-completion.
- Browser journeys / security: playwright, security-best-practices and security-threat-model when explicitly relevant.
- Mobile work: vercel-react-native-skills only when the project uses React Native/Expo.
- AI integration: use actual provider SDK documentation, structured schemas, permissions, budgets, audit logging and human review. Skills are not MCP connections.

## Multi-tenant and commercial invariants

- Separate landlord/superadmin, operator/tenant, staff, provider and end-user roles wherever required; test denial as well as permission.
- Tenant data isolation is enforced server-side by verified membership and RLS or equivalent, not client UI filters alone.
- Never expose service-role keys, raw payment credentials, private employment/education/medical records, or production secrets in browser bundles or commits.
- Payment, subscription, voucher, refund and commission state must be server-authoritative, idempotent and reconciled. No fake settled state.
- Preserve jurisdiction-specific consent, privacy, accessibility, tax and regulated-service requirements; flag matters for qualified review.
- Never claim that an external API, MCP server, AI agent or data pipeline is connected until a real authenticated round trip has been tested.
- AI outputs are suggestions. Require permission checks, tool allowlists, resource limits, redaction and human approval for irreversible or sensitive actions.

## Delivery workflow

1. Inventory and risk-rank gaps using the existing code and requirements.
2. Choose the smallest coherent delivery slice; document dependencies and expected acceptance outcomes.
3. Implement in a branch. Use reversible migrations, deny-by-default RLS, typed validation, input bounds and robust error/empty/loading states.
4. Prefer component reuse and accessible layouts at 360/390, 768 and 1440 pixels. Check keyboard focus, screen-reader semantics, contrast, reduced motion and 200% zoom.
5. Run repo-provided lint, type checks, unit tests and production build; exercise critical flows with browser checks where possible.
6. Inspect security-sensitive paths: signup, auth refresh, authorization, tenant switching, checkout, webhooks, notifications, uploads, admin tasks and audit logs.
7. Record changed files, test commands/results, migrations, environment variables, provider approvals, remaining blockers and rollback plan.
8. Commit and open a PR with a concrete diff. Merge or deploy only when requested/authorized and the available checks support it.

## Definition of done

Never call a feature live solely because a page exists, a PR was opened, a migration file was committed, or a mock passed. Distinguish: coded -> tested -> merged -> migrated -> configured -> deployed -> browser-verified -> accepted. Report the highest evidenced state and blockers clearly.

## Cross-project usage

Copy this skill to a target repo using scripts/agent-skills.mjs from Group Control and install reviewed upstream source skills. The target repository's own instructions take precedence for its domain and architecture. Do not synchronize databases, secrets or source code between tenants/projects merely to share skills.
