# Agent instructions

Protect canonical database and repo history.

## Brand-specific UI implementation
Read `PRODUCT.md` and `DESIGN.md` before frontend changes; preserve all existing product, data and Lovable safeguards. Supported agent setup: `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend` and `npx impeccable install`. Awesome DESIGN.md is a reference library only. Avoid fake status, force push or access bypass, and run existing tests/build plus real keyboard/mobile QA. The source scan is advisory.

## Portfolio-wide coding-agent skills

For Group Control and when planning reusable SaaS build workflows, read [docs/AGENT_SKILLS_STACK.md](docs/AGENT_SKILLS_STACK.md) and the custom [itech-saas-builder skill](.agents/skills/itech-saas-builder/SKILL.md). The opt-in installer at `scripts/agent-skills.mjs` previews an approved per-project skills set; `--apply` is required for actual installation. Central instructions do not automatically activate in other repositories or in the ChatGPT conversation. Review third-party skill scripts and project diffs before committing, and do not confuse skill files with working MCP integrations.
