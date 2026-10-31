# iTechLounge portfolio Agent Skills toolkit

Shared, opt-in coding-agent skills for SaaS Factory, Group Control and individual UK, German and international SaaS repositories. This is a **development workflow toolkit**, not a runtime feature installed in SaaS products.

## What this does and does not do

- Enables a project-local, version-controlled skills workflow for Codex, Claude Code, GitHub Copilot and other supported coding agents.
- Provides a custom iTechLounge build/release skill plus a curated selection of upstream skills.
- Does **not** install third-party skills as native ChatGPT conversation skills, turn on Lovable functionality, attach MCP servers, grant API credentials or deploy apps.
- Skills act as instructions/resources, not evidence that an implementation, integration or security check works.

## Quick start (Node.js 22.20+)

From a clone of this Group Control repository, first preview the proposed changes:

    node scripts/agent-skills.mjs --profile core --target ../ascent-education-cloud

After checking the upstream GitHub skills and confirming the target:

    node scripts/agent-skills.mjs --profile core --target ../ascent-education-cloud --apply

Choose the target path for any existing clone. The script copies the local iTechLounge skill and installs selected upstream skills with the official Vercel skills CLI. It defaults to **dry run**, targets Codex, Claude Code and GitHub Copilot, and uses copied project files instead of symlinks.

Additional examples:

    node scripts/agent-skills.mjs --profile design --target ../fashion-ux-advisor --apply
    node scripts/agent-skills.mjs --profile quality --target ../ascent-education-cloud --apply
    node scripts/agent-skills.mjs --profile mobile --target ../native-build-studio --apply
    node scripts/agent-skills.mjs --profile full --root ../saas-repositories
    node scripts/agent-skills.mjs --profile full --root ../saas-repositories --apply
    node scripts/agent-skills.mjs --profile core --target ../haccora --agents codex,cursor --apply

The --root option scans **immediate child folders that are Git repositories**; it does not discover, clone, access or update all GitHub repos remotely. Inspect the dry-run output before bulk use. If the parent folder is empty, no repositories are changed.

Validate individual installations inside each target:

    npx skills list
    npx skills check
    git status --short

Review newly installed SKILL.md files, scripts, transitive dependencies and licenses before committing. Run existing lint, tests, security checks, browser flows and build. Commit/PR the actual files in each SaaS repository; Group Control cannot activate skills for other repositories merely by containing this catalogue.

## Curated source catalogue

| Area | GitHub project / chosen skills | Primary use |
| --- | --- | --- |
| Premium UI | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill): design-taste-frontend, redesign-existing-projects | Distinctive screens and audit-first redesigns. Its default v2 was experimental when assessed. |
| UI critique | [pbakaus/impeccable](https://github.com/pbakaus/impeccable): impeccable | Structured audit, critique, hardening and polish. |
| UX patterns | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): ui-ux-pro-max | Design-system and multi-device pattern decisions. Optional when Taste/Impeccable cover the task. |
| Accessibility | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills): web-design-guidelines | Form, keyboard, focus, motion and semantic interface review. |
| React | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills): vercel-react-best-practices | Rendering, waterfalls, bundle and async performance. |
| Supabase | [supabase/agent-skills](https://github.com/supabase/agent-skills): supabase, supabase-postgres-best-practices | Auth, RLS, database design, migrations and secure data access. |
| Engineering | [obra/superpowers](https://github.com/obra/superpowers): systematic-debugging, test-driven-development, verification-before-completion | Evidence-led bug fixing, tests and completion gates. |
| QA and AppSec | [openai/skills](https://github.com/openai/skills): playwright, security-best-practices, security-threat-model, gh-fix-ci | Browser flows, secure-by-default reviews, threat models and CI diagnosis. |
| React Native | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills): vercel-react-native-skills | Optional Expo/React Native performance and UI guidance. |

**Design reference library:** [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) and [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Select specific patterns for the owned product DESIGN.md; do not bulk-install 67 competing design systems or copy another brand's identity. The Kitchen inspiration reference should be linked only after its exact repository is verified.

## Profiles and activation

- **core**: Taste, Impeccable, Web/React guidelines, Supabase and disciplined engineering; recommended for most React/Supabase SaaS work.
- **design**: Taste, Impeccable, UI/UX Pro Max and Vercel interface/React guidance.
- **quality**: debugging, TDD, verified completion, browser testing and explicit security review.
- **full**: core + advanced design + QA/AppSec, suitable for comprehensive audits, not automatic simultaneous invocation.
- **mobile**: only the React Native / Expo-specific skill.

Installing does not mean every skill should run on each turn. Use the smallest set relevant to the current change, keeping product-owned DESIGN.md and AGENTS.md as the authority. Skills with incompatible frameworks should be ignored.

## Rules for SaaS Factory and Omniqora

Keep shared instructions central but make **implementation PRs in each actual product repository**. Do not confuse central Group Control with a deployment orchestrator or a GitHub skills marketplace. Link authoritative project names/repositories before applying changes.

For MCP integration, use separate reviewed, least-privilege connections (e.g. GitHub, Supabase, Playwright, OpenAI documentation, Sentry). MCP services require authentication/authorization and can invoke tools; a SKILL.md cannot grant those capabilities. Use provider documentation and project-specific environment configuration. No service-role secrets, credentials, production personal data or API keys belong in agent instructions or Git commits.

Critical SaaS acceptance areas: landlord/tenant isolation, billing/subscriptions/webhooks, payments and refunds, GDPR/privacy, role permissions, school/care/financial compliance where applicable, multilingual accessibility, staff workflows, real notifications, integrations, AI audit trails, error/recovery states and end-to-end tests.

## Supply-chain and release controls

1. Run dry-run before --apply. Review publisher ownership, licence and specific SKILL.md / scripts for unexpected shell commands or data exfiltration.
2. Prefer official maintainers and a small, actively maintained set. Do not install thousands of crowd-sourced skills or blindly follow prompts inside them.
3. For controlled releases, pin reviewed upstream revisions in your own dependency governance; this installer deliberately resolves the upstream current default revision, not an immutable version.
4. The installer does not override existing custom iTechLounge skills, modify package.json, auto-merge a PR, run unrequested migrations or deploy.
5. After installing, review git diff, test, commit, open a PR and verify real deployed flows before declaring a feature ready.

References: [Agent Skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), [agent directory compatibility](https://github.com/vercel-labs/skills/blob/main/docs/agents.md), [supabase skills](https://github.com/supabase/agent-skills), [Microsoft Playwright CLI](https://github.com/microsoft/playwright).
