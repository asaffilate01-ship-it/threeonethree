#!/usr/bin/env node
/**
 * Read-only status report for the portfolio design-wave PR register.
 * Needs Node 22+ and GitHub CLI authentication when run online.
 * Does not merge, close, change, comment on or deploy any pull request.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
function flag(name, fallback = "") {
  const key = "--" + name;
  const eq = args.find((v) => v.startsWith(key + "="));
  if (eq) return eq.slice(key.length + 1);
  const index = args.indexOf(key);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")
    ? args[index + 1]
    : fallback;
}
const offline = args.includes("--offline");
const wave = flag("wave", "all");
if (!["1", "2", "all"].includes(wave)) throw new Error("--wave must be 1, 2 or all");
const here = dirname(fileURLToPath(import.meta.url));
const manifestFile = resolve(here, "../docs/portfolio-design-prs.json");
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries)) {
  throw new Error("Expected portfolio-design-prs.json schemaVersion 1");
}
const entries = manifest.entries.filter((entry) => wave === "all" || entry.wave === Number(wave));
const output = resolve(flag("output", "docs/PORTFOLIO_DESIGN_PR_STATUS.md"));
const allowedRepo = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
function githubPr(entry) {
  if (!allowedRepo.test(entry.repo) || !Number.isInteger(entry.pr) || entry.pr < 1) {
    throw new Error("Unsafe repository or PR identifier in design register");
  }
  if (offline) return null;
  try {
    return JSON.parse(execFileSync("gh", [
      "pr", "view", String(entry.pr), "--repo", entry.repo, "--json",
      "state,mergedAt,statusCheckRollup,url,title",
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 25_000, maxBuffer: 2_000_000 }));
  } catch (error) {
    return { readError: (error.code || "UNAVAILABLE").toString().slice(0, 50) };
  }
}
function stateOf(check) {
  const raw = String(check.conclusion || check.state || check.status || "").toUpperCase();
  if (["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED", "STARTUP_FAILURE"].includes(raw)) return "failed";
  if (["SUCCESS", "NEUTRAL", "SKIPPED", "EXPECTED"].includes(raw)) return "passed";
  return "pending";
}
function summarise(result) {
  if (!result) return "Not checked (offline)";
  if (result.readError) return "Unavailable (permissions or network)";
  if (result.mergedAt) return "Merged (release unverified)";
  if (result.state === "CLOSED") return "Closed";
  const checks = Array.isArray(result.statusCheckRollup) ? result.statusCheckRollup : [];
  if (!checks.length) return "No checks reported";
  const statuses = checks.map(stateOf);
  if (statuses.includes("failed")) return "Checks failing";
  if (statuses.includes("pending")) return "Checks pending";
  const names = checks.map((c) => String(c.workflowName || c.name || c.context || ""));
  const advisoryOnly = names.length > 0 && names.every((n) => /design|impeccable|source[- ]?(?:review|scan|audit)/i.test(n));
  return advisoryOnly ? "Advisory audit passed only" : "Reported CI checks passing";
}
function safe(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("\r", " ");
}
const inspected = entries.map((entry) => {
  const status = githubPr(entry);
  return {
    ...entry,
    status: summarise(status),
    checks: (status?.statusCheckRollup || []).map((check) => ({
      name: String(check.workflowName || check.name || check.context || "Unnamed"),
      state: stateOf(check),
    })),
  };
});
const checked = inspected.filter((x) => !x.status.startsWith("Not checked"));
const passing = inspected.filter((x) => x.status === "Reported CI checks passing").length;
const failing = inspected.filter((x) => x.status === "Checks failing").length;
const outputRows = inspected.map((e) => {
  const url = "https://github.com/" + e.repo + "/pull/" + e.pr;
  const ui = e.uiCodeChange ? "Yes (source only)" : "No (guidance)";
  return "| " + safe(e.wave) + " | " + safe(e.brand) + " | [" + safe(e.repo.split("/")[1]) + " #" + e.pr +
    "](" + url + ") | " + ui + " | " + safe(e.status) + " |";
});
const lines = [
  "# Portfolio design PR quality report", "",
  "Generated: " + new Date().toISOString() + " | scope: " + wave + " | " +
    inspected.length + " PRs, " + checked.length + " queried, " + passing +
    " with reported CI success, " + failing + " with reported failures.", "",
  "> This report is read-only and CI-oriented. A successful check does not verify real mobile/desktop layout, product safety, accessibility, a merge or a production deployment. Advisory source scans are not functional testing. Status may change after this snapshot.", "",
  "| Wave | Product | Pull request | Runtime UI code changed in PR | Status at check time |",
  "|---|---|---|---|---|",
  ...outputRows, "",
  "## Release gate", "",
  "1. Triage any failing or inaccessible jobs and compare against existing main-branch CI before attributing them to the PR.",
  "2. Inspect affected pages at 360/390/768/1440px, keyboard, screen reader, 200% zoom, reduced motion, empty/loading/error states and role-guarded flows.",
  "3. Apply genuine UI changes in small, tested PRs. Design guide presence is not an actual redesign.",
  "4. Get human approval for release; never auto-merge or auto-deploy based on this report.", "",
  "This command uses the local GitHub CLI only and consumes no Lovable credits.",
  ""
];
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, lines.join("\n"), "utf8");
console.log("Wrote " + output + " (" + inspected.length + " PRs, " + passing + " reported CI-success, " + failing + " failing)");
