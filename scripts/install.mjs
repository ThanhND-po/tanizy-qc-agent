// Tanizy QC Agent installer for Gemini CLI, Codex, Claude Code, and Antigravity.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));
const targets = new Set(["gemini-cli", "codex", "claude-code", "antigravity"]);
const aliases = new Map([["gemini", "gemini-cli"], ["claude", "claude-code"]]);

function optionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) throw new Error(`Missing value for ${option}.`);
  return value;
}

function usage() {
  console.log(`Usage:\n  npx ${packageConfig.name} --target <gemini-cli|codex|claude-code|antigravity> --project <path> [--skill <name>]... [--dry-run] [--force]\n\nExamples:\n  npx ${packageConfig.name} --target gemini-cli --project /path/to/project\n  npx ${packageConfig.name} --target codex --project /path/to/project --skill qc-gap-finder\n  npx ${packageConfig.name} --target claude-code --project /path/to/project --skill qc-design-test-cases\n  npx ${packageConfig.name} --target antigravity --project /path/to/project`);
}

function parseArgs(argv) {
  const args = { dryRun: false, force: false, skills: [], skipRefs: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--skip-refs") args.skipRefs = true;
    else if (arg === "--target") { args.target = optionValue(argv, i, arg); i += 1; }
    else if (arg === "--project") { args.project = optionValue(argv, i, arg); i += 1; }
    else if (arg === "--skill") { args.skills.push(optionValue(argv, i, arg)); i += 1; }
    else if (arg === "-h" || arg === "--help") args.help = true;
    else if (arg === "-v" || arg === "--version") { console.log(packageConfig.version); process.exit(0); }
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.target && aliases.has(args.target)) args.target = aliases.get(args.target);
  return args;
}

function skillDirectories() {
  const root = join(repoRoot, "core", "skills");
  return readdirSync(root).filter((name) => statSync(join(root, name)).isDirectory()).sort();
}
function skillDestinationRoot(target, projectRoot) {
  if (target === "gemini-cli") return join(projectRoot, "skills");
  if (target === "claude-code") return join(projectRoot, ".claude", "skills");
  return join(projectRoot, ".agents", "skills");
}
function adapterFiles(target, projectRoot) {
  const adapter = join(repoRoot, "adapters", target);
  const files = [{ from: join(adapter, target === "gemini-cli" ? "GEMINI.md" : target === "claude-code" ? "CLAUDE.md" : "AGENTS.md"), to: join(projectRoot, target === "gemini-cli" ? "GEMINI.md" : target === "claude-code" ? "CLAUDE.md" : "AGENTS.md") }];
  if (target === "antigravity") files.push({ from: join(adapter, ".agents", "rules"), to: join(projectRoot, ".agents", "rules") });
  return files;
}
function copyPlan(target, projectRoot, selectedSkills, skipRefs) {
  const sourceSkills = join(repoRoot, "core", "skills");
  const destination = skillDestinationRoot(target, projectRoot);
  const names = selectedSkills.length ? selectedSkills : skillDirectories();
  const plan = names.map((skill) => ({ from: join(sourceSkills, skill), to: join(destination, skill), replaceOnForce: true }));
  for (const skill of names) plan.push({ from: join(repoRoot, "core", "references", "material-paths.md"), to: join(destination, skill, "references", "material-paths.md"), replaceOnForce: true });
  plan.push({ from: join(repoRoot, "core", "references", "material-paths.md"), to: join(projectRoot, "qc", "material-paths.md"), replaceOnForce: true });
  plan.push({ from: join(repoRoot, "core", "references", "field-validation-checklist.md"), to: join(projectRoot, "qc", "field-validation-checklist.md"), replaceOnForce: true });
  plan.push(...adapterFiles(target, projectRoot));
  if (!skipRefs) for (const tmpl of readdirSync(join(repoRoot, "refs-templates")).sort()) plan.push({ from: join(repoRoot, "refs-templates", tmpl), to: join(projectRoot, "qc", "refs", tmpl), seed: true });
  return plan;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }
  if (!args.target || !targets.has(args.target)) throw new Error("Missing or invalid --target. Use gemini-cli, codex, claude-code, or antigravity.");
  if (!args.project) throw new Error("Missing --project.");
  const projectRoot = resolve(args.project);
  if (!existsSync(projectRoot)) throw new Error(`Project path does not exist: ${projectRoot}`);
  const available = skillDirectories();
  const invalid = args.skills.filter((skill) => !available.includes(skill));
  if (invalid.length) throw new Error(`Unknown skill: ${invalid.join(", ")}. Available skills: ${available.join(", ")}`);
  args.skills = [...new Set(args.skills)];
  const plan = copyPlan(args.target, projectRoot, args.skills, args.skipRefs);
  console.log(`Tanizy QC Agent install target: ${args.target}`);
  console.log(`Project: ${projectRoot}`);
  console.log(`Skills: ${args.skills.length ? args.skills.join(", ") : "all"}`);
  for (const item of plan) {
    const exists = existsSync(item.to);
    if (item.seed && exists && !args.force) { console.log(`Skip (refs seed already present): ${relative(projectRoot, item.to)}`); continue; }
    console.log(`${args.dryRun ? "Would copy" : "Copy"} ${relative(repoRoot, item.from)} -> ${relative(projectRoot, item.to)}${exists ? " (exists)" : ""}`);
    if (args.dryRun) continue;
    if (exists && !args.force) throw new Error(`Destination exists. Re-run with --force to overwrite: ${item.to}`);
    if (exists && item.replaceOnForce) rmSync(item.to, { recursive: true, force: true });
    mkdirSync(dirname(item.to), { recursive: true });
    cpSync(item.from, item.to, { recursive: true, force: true });
  }
  console.log(args.dryRun ? "Dry run complete." : "Install complete.");
}
main().catch((error) => { console.error(`Error: ${error.message}`); usage(); process.exit(1); });
