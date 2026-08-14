#!/usr/bin/env node
// Tanizy QC Agent installer — installs QC skills and the Codex adapter
// into a target project under the qc/ directory (default) or at root.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));

const targets = new Set(["codex"]);
const placementOptions = new Set(["root", "qc"]);

function usage() {
  console.log(`Usage:
  npx ${packageConfig.name} --project <path> [--skill <name>]... [--placement <root|qc>] [--dry-run] [--force]
Or from a local clone:
  node scripts/install.mjs --project <path> [--skill <name>]... [--placement <root|qc>] [--dry-run] [--force]
Examples:
  npx ${packageConfig.name} --project /path/to/project --dry-run
  npx ${packageConfig.name} --project /path/to/project --placement qc
  node scripts/install.mjs --project /path/to/project --skill qc-gap-finder --skill qc-design-test-cases
  node scripts/install.mjs --project /path/to/project --placement qc --skill qc-run-playwright --force
Options:
  --placement root    Install to PROJECT/.agents/skills and PROJECT/AGENTS.md (root, may conflict with a PO agent)
  --placement qc      Install to PROJECT/qc/.agents/skills and PROJECT/qc/AGENTS.md (default, recommended)
  --dry-run           Print planned copies without writing
  --skip-refs         Skip seeding qc/refs/ runtime templates
  --force             Overwrite existing QC files in the target project
  --version           Print package version`);
}

function optionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function parseArgs(argv) {
  const args = { dryRun: false, force: false, skills: [], placement: "qc", skipRefs: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--skip-refs") {
      args.skipRefs = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--project") {
      args.project = optionValue(argv, i, arg);
      i += 1;
    } else if (arg === "--placement") {
      args.placement = optionValue(argv, i, arg);
      i += 1;
    } else if (arg === "--skill") {
      args.skills.push(optionValue(argv, i, arg));
      i += 1;
    } else if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else if (arg === "-v" || arg === "--version") {
      console.log(packageConfig.version);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function skillDirectories() {
  const skillsRoot = join(repoRoot, "core", "skills");
  return readdirSync(skillsRoot)
    .filter((name) => statSync(join(skillsRoot, name)).isDirectory())
    .sort();
}

function copyPlan(projectRoot, placement, selectedSkills, skipRefs = false) {
  const coreSkills = join(repoRoot, "core", "skills");
  const base = placement === "root" ? projectRoot : join(projectRoot, "qc");
  const plan = [];
  if (selectedSkills.length > 0) {
    for (const skill of selectedSkills) {
      plan.push({ from: join(coreSkills, skill), to: join(base, ".agents", "skills", skill) });
    }
  } else {
    for (const skill of skillDirectories()) {
      plan.push({ from: join(coreSkills, skill), to: join(base, ".agents", "skills", skill) });
    }
  }
  plan.push({ from: join(repoRoot, "adapters", "codex", "AGENTS.md"), to: join(base, "AGENTS.md") });
  if (!skipRefs) {
    const refsSrc = join(repoRoot, "refs-templates");
    for (const tmpl of readdirSync(refsSrc).sort()) {
      plan.push({
        from: join(refsSrc, tmpl),
        to: join(base, "refs", tmpl),
        refsSeed: true,
      });
    }
  }
  return plan;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.project) {
    throw new Error("Missing --project.");
  }
  if (!placementOptions.has(args.placement)) {
    throw new Error("Invalid --placement. Use root or qc.");
  }
  const projectRoot = resolve(args.project);
  if (!existsSync(projectRoot)) {
    throw new Error(`Project path does not exist: ${projectRoot}`);
  }
  const available = skillDirectories();
  const invalid = args.skills.filter((s) => !available.includes(s));
  if (invalid.length > 0) {
    throw new Error(`Unknown skill: ${invalid.join(", ")}. Available: ${available.join(", ")}`);
  }
  args.skills = [...new Set(args.skills)];

  const plan = copyPlan(projectRoot, args.placement, args.skills, args.skipRefs);
  console.log(`QC Agent install target: codex (${args.placement === "root" ? "root" : "qc/"})`);
  console.log(`Project: ${projectRoot}`);
  console.log(`Skills: ${args.skills.length > 0 ? args.skills.join(", ") : "all"}`);
  for (const item of plan) {
    const exists = existsSync(item.to);
    if (item.refsSeed && exists && !args.force) {
      console.log(`Skip (refs seed already present): ${relative(projectRoot, item.to)}`);
      continue;
    }
    console.log(`${args.dryRun ? "Would copy" : "Copy"} ${relative(repoRoot, item.from)} -> ${relative(projectRoot, item.to)}${exists ? " (exists)" : ""}`);
    if (args.dryRun) {
      continue;
    }
    if (exists && !args.force) {
      throw new Error(`Destination exists. Re-run with --force to overwrite: ${item.to}`);
    }
    if (exists) {
      rmSync(item.to, { recursive: true, force: true });
    }
    mkdirSync(dirname(item.to), { recursive: true });
    cpSync(item.from, item.to, { recursive: true, force: true });
  }
  console.log(args.dryRun ? "Dry run complete." : "Install complete.");
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  usage();
  process.exit(1);
});
