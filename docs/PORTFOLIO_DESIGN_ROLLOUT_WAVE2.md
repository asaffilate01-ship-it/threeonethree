# Portfolio design upgrade: Wave 2 (31 October 2026)

## Objective

Extend brand-aware UI craft and the *Taste Skill + Impeccable + Awesome DESIGN.md* workflow to another **23 SaaS/website repositories** under the linked GitHub account. The earlier wave targeted 21, for **44 repository PRs recorded across both waves**.

All PRs were created on distinct `design/portfolio-craft-wave2-2026-10-31` branches for this wave and target `main`. The GitHub register records **proposed PRs, not deployments or merges**.

## Real code work versus preparation

**Runtime UI source changes included in Wave 2:**
- **Omniqora:** Add a skip-to-content link, honour reduced-motion scrolling and correct 404 identity/keyboard focus.
- **LessonAhead:** Add skip-to-content and accessible mobile menu toggle semantics, expanded state and focus.
- **iTechLounge:** Replace unsupported example performance/revenue figures with a clearly labelled fictional project-site preview and project process, improve primary CTAs.
- **PracticeCraft:** Replace blank/inaccessible authentication-loading states with announced branded loading status, without bypassing guards.

For the other **19 projects**, the PRs currently add `DESIGN.md`, `PRODUCT.md`, additive `AGENTS.md` and an advisory `.github/workflows/design-quality.yml`. These are **not** live UI redesigns. Use them as the authority for the next screen-by-screen work.

## Wave 2 pull requests

| Product | PR | Scope |
|---|---|---|
| Omniqora | [seamless-comms-suite #219](https://github.com/asaffilate01-ship-it/seamless-comms-suite/pull/219) | UI code + design guidance |
| LessonAhead | [nectar-design-lab #36](https://github.com/asaffilate01-ship-it/nectar-design-lab/pull/36) | UI code + design guidance |
| iTechLounge | [digital-creations-hub #2](https://github.com/asaffilate01-ship-it/digital-creations-hub/pull/2) | UI code + design guidance |
| PracticeCraft | [practicecraft-hub #5](https://github.com/asaffilate01-ship-it/practicecraft-hub/pull/5) | UI code + design guidance |
| Kiezio | [kiezio #9](https://github.com/asaffilate01-ship-it/kiezio/pull/9) | Design guidance and CI baseline |
| TaxNuvia | [your-accountant-finder #62](https://github.com/asaffilate01-ship-it/your-accountant-finder/pull/62) | Design guidance and CI baseline |
| SharedBricks | [propluxe-world #11](https://github.com/asaffilate01-ship-it/propluxe-world/pull/11) | Design guidance and CI baseline |
| MotorEsq | [all-road-aid #5](https://github.com/asaffilate01-ship-it/all-road-aid/pull/5) | Design guidance and CI baseline |
| AutoSouq | [autosouq #14](https://github.com/asaffilate01-ship-it/autosouq/pull/14) | Design guidance and CI baseline |
| FleetPulse / DDelivery 3PL | [ddelivery3pl #3](https://github.com/asaffilate01-ship-it/ddelivery3pl/pull/3) | Design guidance and CI baseline |
| TaxCenda | [usataxlounge #2](https://github.com/asaffilate01-ship-it/usataxlounge/pull/2) | Design guidance and CI baseline |
| Premisora | [premisora-compliance-hub #1](https://github.com/asaffilate01-ship-it/premisora-compliance-hub/pull/1) | Design guidance and CI baseline |
| HMOFlow | [hmo-buddy-pro #1](https://github.com/asaffilate01-ship-it/hmo-buddy-pro/pull/1) | Design guidance and CI baseline |
| Product Pass Pro | [pass-product-ready #1](https://github.com/asaffilate01-ship-it/pass-product-ready/pull/1) | Design guidance and CI baseline |
| Rettio | [rettio #1](https://github.com/asaffilate01-ship-it/rettio/pull/1) | Design guidance and CI baseline |
| TraderOS | [jobflow-tradehub #12](https://github.com/asaffilate01-ship-it/jobflow-tradehub/pull/12) | Design guidance and CI baseline |
| Group Control | [threeonethree #2](https://github.com/asaffilate01-ship-it/threeonethree/pull/2) | Design guidance and CI baseline |
| BeraterMarkt | [professional-accountant-link #1](https://github.com/asaffilate01-ship-it/professional-accountant-link/pull/1) | Design guidance and CI baseline |
| ZorynCom | [zoryn-com-chat #17](https://github.com/asaffilate01-ship-it/zoryn-com-chat/pull/17) | Design guidance and CI baseline |
| Viazeno | [transfer-compare #2](https://github.com/asaffilate01-ship-it/transfer-compare/pull/2) | Design guidance and CI baseline |
| Schonova | [delightful-dash-suite #2](https://github.com/asaffilate01-ship-it/delightful-dash-suite/pull/2) | Design guidance and CI baseline |
| NearCura | [nearcura-care-connect #1](https://github.com/asaffilate01-ship-it/nearcura-care-connect/pull/1) | Design guidance and CI baseline |
| Food Safety Hub | [food-safety-hub #1](https://github.com/asaffilate01-ship-it/food-safety-hub/pull/1) | Design guidance and CI baseline |

## Tooling: read-only audit of all 44 PRs

`docs/portfolio-design-prs.json` is the structured manifest of both waves. It includes the actual repository name (which can differ from its product brand) and whether a PR contains runtime UI code.

`scripts/design-pr-status.mjs` reads the manifest. It invokes GitHub CLI **only to read** pull-request checks and state, then generates a Markdown report; it never merges, deploys, closes or comments on anything. Requires Node 22+ and GitHub CLI with access to the repositories.

```sh
# Local preview: no GitHub API requests
node scripts/design-pr-status.mjs --offline --wave 2

# Live PR CI inspection after 'gh auth login'
node scripts/design-pr-status.mjs --wave all --output docs/PORTFOLIO_DESIGN_PR_STATUS.md
```

For a repository-level design-source inventory, see the earlier [Native App Factory PR #2](https://github.com/asaffilate01-ship-it/native-build-studio/pull/2) and `scripts/portfolio-design-inventory.mjs` in that branch.

## Verification snapshot and blockers

GitHub's PR checks are not the same as visual, keyboard or production acceptance. At the time of review:
- **Omniqora PR #219:** its reported integration and advisory design checks were successful.
- **TraderOS PR #12:** existing CI and advisory design checks reported success.
- **PracticeCraft PR #5:** tests, typechecking, lint/security and build steps passed in the inspected CI job, but the **production dependency audit** step failed. It must be resolved or assessed before merge.
- **LessonAhead, iTechLounge, Kiezio** and several other PRs: checks reported failures. Some unsuccessful runs had no recorded steps, so their root cause cannot be determined from the available run details.
- **Other successful advisory scans** only indicate that the source-scanning workflow completed, not a clean visual or functional release.

Do not merge just because GitHub says a branch is technically mergeable. Compare failing checks with base-branch history and collect real screenshots/test evidence.

## Next implementation order

1. **Resolve CI and build/runner blockers**, especially failing production/security checks and any checkout/setup failures. The advisory detector uses `continue-on-error` deliberately while a baseline is established.
2. **Public conversion and trust:** iTechLounge, TaxNuvia, BeraterMarkt, Kiezio, NearCura, Schonova, Rettio and Viazeno. Give each an original visual identity and evidence-based copy, not one cloned style.
3. **High-frequency user workflows:** PracticeCraft client workflow, Omniqora conversations/agent approvals, LessonAhead booking/diary, TraderOS quote/job dispatch and ZorynCom POS/KDS.
4. **Regulated/financial workflows:** Product Pass Pro, Premisora, Food Safety Hub, HMOFlow, TaxCenda and SharedBricks. Preserve material status, data source, permissions and legal disclosures.
5. **Mobile and operator operations:** FleetPulse, MotorEsq and AutoSouq. Focus driver/vendor/admin role navigation, maps, confirmation/error states and offline/low-bandwidth paths.

For each changed route, check actual 360/390/768/1440px browser output, keyboard navigation, focus, 200% zoom, light/dark contrast as used, reduced-motion, loading/empty/error states and authenticated permissions. Run all existing project-specific tests/builds and record the results in the PR.

## Source repositories

- [Taste Skill](https://github.com/Leonxlnx/taste-skill): distinct visual direction and responsive design-agent skill.
- [Impeccable](https://github.com/pbakaus/impeccable): critique/audit/harden/polish and deterministic source detector, not a replacement for product testing.
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md): inspiration for documenting design decisions without copying another brand.

All changes in this initiative use GitHub-native commits and pull requests. **No Lovable credits were used.**
