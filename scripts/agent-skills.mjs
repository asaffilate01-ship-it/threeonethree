#!/usr/bin/env node
/**
 * Opt-in, review-first installer for iTechLounge SaaS coding-agent skills.
 * Requirements: Node.js >=22.20, Git and a working npx.
 * Never edits production credentials, migrations, application logic or deployments.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PACKS = [
  { source: "Leonxlnx/taste-skill", skills: ["design-taste-frontend", "redesign-existing-projects"], profiles: ["core", "design", "full"] },
  { source: "pbakaus/impeccable", skills: ["impeccable"], profiles: ["core", "design", "full"] },
  { source: "nextlevelbuilder/ui-ux-pro-max-skill", skills: ["ui-ux-pro-max"], profiles: ["design", "full"] },
  { source: "vercel-labs/agent-skills", skills: ["web-design-guidelines", "vercel-react-best-practices"], profiles: ["core", "design", "full"] },
  { source: "supabase/agent-skills", skills: ["supabase", "supabase-postgres-best-practices"], profiles: ["core", "full"] },
  { source: "obra/superpowers", skills: ["systematic-debugging", "test-driven-development", "verification-before-completion"], profiles: ["core", "quality", "full"] },
  { source: "openai/skills", skills: ["playwright", "security-best-practices", "security-threat-model", "gh-fix-ci"], profiles: ["quality", "full"] },
  { source: "vercel-labs/agent-skills", skills: ["vercel-react-native-skills"], profiles: ["mobile"] }
];

const ALLOWED_PROFILES = new Set(["core", "design", "quality", "full", "mobile"]);
const ALLOWED_AGENTS = new Set(["codex", "claude-code", "github-copilot", "cursor", "gemini-cli", "opencode", "universal"]);

const args = process.argv.slice(2);
const argument = (flag) => {
  const at = args.indexOf(flag);
  if (at === -1) return undefined;
  if (!args[at + 1] || args[at + 1].startsWith("--")) throw new Error("Expected a value after " + flag);
  return args[at + 1];
};
const help = [
  "Usage: node scripts/agent-skills.mjs [--profile core|design|quality|full|mobile]",
  "  [--target PATH | --root PARENT_FOLDER] [--agents codex,claude-code,github-copilot] [--apply]",
  "",
  "By default only PRINTS the plan. --apply copies the local build skill and",
  "runs the reviewed upstream installs. --root scans immediate Git repository folders.",
  "Review third-party SKILL.md and scripts before running --apply.",
].join("\n");

if (args.includes("--help") || args.includes("-h")) {
  console.log(help);
  process.exit(0);
}

const profile = argument("--profile") || "core";
if (!ALLOWED_PROFILES.has(profile)) throw new Error("Unknown profile: " + profile);
const agents = [...new Set((argument("--agents") || "codex,claude-code,github-copilot").split(",").map((a) => a.trim()))];
if (agents.some((a) => !ALLOWED_AGENTS.has(a))) throw new Error("Unsupported --agents value");
const apply = args.includes("--apply");
const root = argument("--root");
const target = argument("--target");
if (root && target) throw new Error("Use --root or --target, not both");

const projects = root
  ? readdirSync(resolve(root), { withFileTypes: true })
      .filter((item) => item.isDirectory() && existsSync(join(resolve(root), item.name, ".git")))
      .map((item) => join(resolve(root), item.name))
  : [resolve(target || ".")];

const localSkill = fileURLToPath(new URL("../.agents/skills/itech-saas-builder/SKILL.md", import.meta.url));
const selected = PACKS.filter((pack) => pack.profiles.includes(profile));
console.log("iTechLounge SaaS Skills | profile=" + profile + " | mode=" + (apply ? "APPLY" : "DRY RUN"));
console.log("Agents: " + agents.join(", ") + ". Sources: " + selected.length + ". Repositories: " + projects.length);
if (!apply) console.log("Review the GitHub sources in docs/AGENT_SKILLS_STACK.md before applying.");

for (const project of projects) {
  if (!existsSync(project) || ![".git", "package.json", "pyproject.toml"].some((f) => existsSync(join(project, f)))) {
    console.warn("SKIP: not an accessible project folder: " + project);
    continue;
  }
  console.log("\nProject: " + project);
  if (existsSync(localSkill)) {
    const destinations = [".agents/skills/itech-saas-builder/SKILL.md"];
    if (agents.includes("claude-code")) destinations.push(".claude/skills/itech-saas-builder/SKILL.md");
    for (const relativePath of destinations) {
      const destination = join(project, relativePath);
      const unchanged = existsSync(destination) && readFileSync(destination, "utf8") === readFileSync(localSkill, "utf8");
      if (unchanged) continue;
      if (existsSync(destination)) {
        console.warn("SKIP existing local custom skill (review manually): " + relativePath);
      } else if (!apply) {
        console.log("  WOULD COPY " + relativePath);
      } else {
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(localSkill, destination);
        console.log("  COPIED " + relativePath);
      }
    }
  } else {
    console.warn("Custom skill missing beside this installer; upstream installs still available.");
  }

  for (const pack of selected) {
    const installArgs = [
      "--yes", "skills", "add", pack.source, "--copy", "-y",
      ...pack.skills.flatMap((s) => ["--skill", s]),
      ...agents.flatMap((a) => ["--agent", a])
    ];
    console.log("  " + (apply ? "INSTALL " : "WOULD INSTALL ") + pack.source + " [" + pack.skills.join(", ") + "]");
    if (!apply) continue;
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    const result = spawnSync(command, installArgs, {
      cwd: project,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, DISABLE_TELEMETRY: "1" }
    });
    if (result.error || result.status !== 0) {
      console.error("Install failed in " + project + " for " + pack.source, result.error || result.status);
      process.exit(1);
    }
  }
}

console.log("\nDone. Verify installed skills, review changed files, run tests and commit each project deliberately.");
console.log("Skills do not install MCP servers, grant credentials, deploy builds or change ChatGPT's built-in skills.");
