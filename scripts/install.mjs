#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const targets = new Set(["gemini-cli", "codex", "claude-code", "antigravity"]);
const aliases = new Map([
  ["gemini", "gemini-cli"],
  ["claude", "claude-code"],
]);
const managedBlockStart = "<!-- BEGIN TANIZY QC AGENT MANAGED BLOCK -->";
const managedBlockEnd = "<!-- END TANIZY QC AGENT MANAGED BLOCK -->";

function optionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function usage() {
  console.log(`Usage:
  npx ${packageConfig.name} --target <gemini-cli|codex|claude-code|antigravity> --project <project-root> [options]

Options:
  --skill <name>   Install or update one skill. Repeat for multiple skills.
  --dry-run        Validate and print the complete write plan without writing.
  --force          Replace selected package-managed skill files and managed blocks.
  --skip-refs      Do not seed project-owned runtime refs.
  --help           Show this help.
  --version        Show the package version.

Examples:
  npx ${packageConfig.name} --target codex --project /path/to/project --dry-run
  npx ${packageConfig.name} --target codex --project /path/to/project --skill qc-gap-finder
  npx ${packageConfig.name} --target claude-code --project /path/to/project --skill qc-design-test-cases --force`);
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    help: false,
    skills: [],
    skipRefs: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--skip-refs") args.skipRefs = true;
    else if (arg === "--target") {
      args.target = optionValue(argv, index, arg);
      index += 1;
    } else if (arg === "--project") {
      args.project = optionValue(argv, index, arg);
      index += 1;
    } else if (arg === "--skill") {
      args.skills.push(optionValue(argv, index, arg));
      index += 1;
    } else if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else if (arg === "-v" || arg === "--version") {
      console.log(packageConfig.version);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (args.target && aliases.has(args.target)) {
    args.target = aliases.get(args.target);
  }
  args.skills = [...new Set(args.skills)];
  return args;
}

function skillDirectories() {
  const root = join(repoRoot, "core", "skills");
  return readdirSync(root)
    .filter((name) => statSync(join(root, name)).isDirectory())
    .sort();
}

function skillDestinationRoot(target, projectRoot) {
  if (target === "gemini-cli") return join(projectRoot, "skills");
  if (target === "claude-code") return join(projectRoot, ".claude", "skills");
  return join(projectRoot, ".agents", "skills");
}

function adapterSpec(target, projectRoot) {
  const adapterRoot = join(repoRoot, "adapters", target);
  if (target === "gemini-cli") {
    return { from: join(adapterRoot, "GEMINI.md"), to: join(projectRoot, "GEMINI.md") };
  }
  if (target === "claude-code") {
    return { from: join(adapterRoot, "CLAUDE.md"), to: join(projectRoot, "CLAUDE.md") };
  }
  return { from: join(adapterRoot, "AGENTS.md"), to: join(projectRoot, "AGENTS.md") };
}

function isInside(parent, candidate) {
  const rel = relative(resolve(parent), resolve(candidate));
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function assertSafeManagedPath(expectedRoot, candidate) {
  if (!isInside(expectedRoot, candidate)) {
    throw new Error(`Unsafe destination outside managed root: ${candidate}`);
  }
  if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic link: ${candidate}`);
  }
}

function assertSafeProjectDestination(projectRoot, candidate) {
  if (!isInside(projectRoot, candidate)) {
    throw new Error(`Unsafe destination outside project root: ${candidate}`);
  }

  let cursor = resolve(projectRoot);
  if (lstatSync(cursor).isSymbolicLink()) {
    throw new Error(`Refusing to use a symbolic-link project root: ${cursor}`);
  }

  const rel = relative(cursor, resolve(candidate));
  for (const part of rel.split(/[\\/]+/).filter(Boolean)) {
    cursor = join(cursor, part);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) {
      throw new Error(`Refusing to write through symbolic link: ${cursor}`);
    }
  }
}

function hasProjectMarker(path) {
  return existsSync(join(path, ".git")) || existsSync(join(path, "package.json"));
}

function validateProjectRoot(projectRoot) {
  if (!existsSync(projectRoot)) {
    throw new Error(`Project path does not exist: ${projectRoot}`);
  }
  if (!statSync(projectRoot).isDirectory()) {
    throw new Error(`Project path is not a directory: ${projectRoot}`);
  }
  if (lstatSync(projectRoot).isSymbolicLink()) {
    throw new Error(`Refusing to use a symbolic-link project root: ${projectRoot}`);
  }

  const parent = dirname(projectRoot);
  if (
    basename(projectRoot).toLowerCase() === "qc" &&
    !hasProjectMarker(projectRoot) &&
    hasProjectMarker(parent)
  ) {
    throw new Error(
      `--project points to a runtime qc/ directory. Use the project root instead: ${parent}`,
    );
  }
}

function installedQcSkills(destinationRoot, available) {
  if (!existsSync(destinationRoot)) return [];
  const installed = [];
  for (const name of readdirSync(destinationRoot).filter((item) => available.includes(item))) {
    const path = join(destinationRoot, name);
    if (lstatSync(path).isSymbolicLink()) {
      throw new Error(`Refusing symbolic-link skill destination: ${path}`);
    }
    if (lstatSync(path).isDirectory()) installed.push(name);
  }
  return installed.sort();
}

function copyPlan(target, projectRoot, requestedSkills, skipRefs) {
  const available = skillDirectories();
  const selected = requestedSkills.length ? requestedSkills : available;
  const sourceSkills = join(repoRoot, "core", "skills");
  const destinationRoot = skillDestinationRoot(target, projectRoot);
  assertSafeProjectDestination(projectRoot, destinationRoot);
  const canonicalContract = join(repoRoot, "core", "references", "material-paths.md");
  const plan = [];

  for (const skill of selected) {
    plan.push({
      kind: "replace-directory",
      from: join(sourceSkills, skill),
      to: join(destinationRoot, skill),
      managedRoot: destinationRoot,
    });
  }

  const installedOrSelectedSkills = [...new Set([
    ...selected,
    ...installedQcSkills(destinationRoot, available),
  ])].sort();

  for (const skill of selected) {
    const legacyContractCopy = join(
      destinationRoot,
      skill,
      "references",
      "material-paths.md",
    );
    if (existsSync(legacyContractCopy)) {
      plan.push({
        kind: "retire-managed-file",
        to: legacyContractCopy,
        managedRoot: join(destinationRoot, skill),
      });
    }
  }

  const executionLogSkills = installedOrSelectedSkills.filter((skill) =>
    ["qc-record-manual-results", "qc-run-playwright", "qc-report-generator"].includes(skill),
  );
  for (const skill of executionLogSkills) {
    plan.push({
      kind: "managed-file",
      from: join(repoRoot, "core", "references", "executions-log.md"),
      to: join(destinationRoot, skill, "references", "executions-log.md"),
      managedRoot: join(destinationRoot, skill),
      refreshAfterParentReplace: selected.includes(skill),
    });
  }

  plan.push({
    kind: "managed-file",
    from: canonicalContract,
    to: join(projectRoot, "qc", "config", "material-paths.md"),
    managedRoot: join(projectRoot, "qc", "config"),
  });

  if (
    selected.includes("qc-design-viewpoints") ||
    selected.includes("qc-design-test-cases")
  ) {
    plan.push(
      {
        kind: "seed-file",
        from: join(repoRoot, "core", "references", "field-validation-checklist.md"),
        to: join(projectRoot, "qc", "config", "field-validation-checklist.md"),
      },
      {
        kind: "seed-file",
        from: join(repoRoot, "core", "references", "ui-component-checklist.md"),
        to: join(projectRoot, "qc", "config", "ui-component-checklist.md"),
      },
    );
  }

  const adapter = adapterSpec(target, projectRoot);
  plan.push({ kind: "managed-block", ...adapter });

  if (target === "antigravity") {
    plan.push({
      kind: "managed-file",
      from: join(repoRoot, "adapters", "antigravity", ".agents", "rules", "tanizy-qc.md"),
      to: join(projectRoot, ".agents", "rules", "tanizy-qc.md"),
      managedRoot: join(projectRoot, ".agents", "rules"),
    });
  }

  if (!skipRefs) {
    plan.push(
      {
        kind: "seed-file",
        from: join(repoRoot, "refs-templates", "open-questions.md"),
        to: join(projectRoot, "qc", "open-questions.md"),
      },
      {
        kind: "seed-file",
        from: join(repoRoot, "refs-templates", "bug-base.md"),
        to: join(projectRoot, "qc", "refs", "bug-base.md"),
      },
      {
        kind: "seed-file",
        from: join(repoRoot, "refs-templates", "system-context.md"),
        to: join(projectRoot, "qc", "refs", "system-context.md"),
      },
    );
  }

  return { available, destinationRoot, plan, selected };
}

function fileContent(path) {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

function managedBlockContent(template) {
  return `${managedBlockStart}\n${template.trim()}\n${managedBlockEnd}`;
}

function renderManagedBlock(existing, template) {
  const block = managedBlockContent(template);
  const start = existing.indexOf(managedBlockStart);
  const end = existing.indexOf(managedBlockEnd);
  const startCount = existing.split(managedBlockStart).length - 1;
  const endCount = existing.split(managedBlockEnd).length - 1;

  if (startCount !== endCount || startCount > 1 || (start >= 0 && end < start)) {
    throw new Error("Adapter must contain zero or one complete Tanizy QC managed block.");
  }
  if (start >= 0) {
    const suffixStart = end + managedBlockEnd.length;
    return `${existing.slice(0, start)}${block}${existing.slice(suffixStart)}`;
  }
  if (!existing.trim()) return `${block}\n`;
  if (existing.trim() === template.trim()) return `${block}\n`;
  const separator = existing.endsWith("\n\n") ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${separator}${block}\n`;
}

function inspectOperation(item, force) {
  if (item.kind === "seed-file") {
    if (!existsSync(item.to)) return "create";
    if (!lstatSync(item.to).isFile()) {
      throw new Error(`Expected a project-owned file at seed destination: ${item.to}`);
    }
    return "preserve";
  }

  if (item.kind === "managed-block") {
    if (!existsSync(item.to)) return "create";
    if (lstatSync(item.to).isSymbolicLink()) {
      throw new Error(`Refusing to modify symbolic link: ${item.to}`);
    }
    const current = readFileSync(item.to, "utf8");
    const next = renderManagedBlock(current, fileContent(item.from));
    if (current === next) return "unchanged";
    if (current.includes(managedBlockStart) && !force) return "conflict";
    return current.includes(managedBlockStart) ? "update" : "merge";
  }

  assertSafeManagedPath(item.managedRoot, item.to);
  if (item.kind === "retire-managed-file") {
    if (!existsSync(item.to)) return "absent";
    if (!lstatSync(item.to).isFile()) {
      throw new Error(`Expected a legacy managed file destination: ${item.to}`);
    }
    return force ? "remove" : "conflict";
  }
  if (!existsSync(item.to)) return "create";

  const destinationEntry = lstatSync(item.to);
  if (item.kind === "managed-file" && !destinationEntry.isFile()) {
    throw new Error(`Expected a managed file destination: ${item.to}`);
  }
  if (item.kind === "replace-directory" && !destinationEntry.isDirectory()) {
    throw new Error(`Expected a managed skill directory: ${item.to}`);
  }

  if (item.refreshAfterParentReplace && force) return "replace";

  if (item.kind === "managed-file") {
    if (fileContent(item.from) === fileContent(item.to)) return "unchanged";
  }
  return force ? "replace" : "conflict";
}

function preflight(projectRoot, plan, force) {
  const inspected = plan.map((item) => {
    assertSafeProjectDestination(projectRoot, item.to);
    return { ...item, action: inspectOperation(item, force) };
  });
  const conflicts = inspected.filter((item) => item.action === "conflict");
  if (conflicts.length) {
    const paths = conflicts.map((item) => `- ${item.to}`).join("\n");
    throw new Error(`Package-managed destinations already exist or differ:\n${paths}\nRe-run with --force after reviewing the dry run.`);
  }
  return inspected;
}

function applyOperation(projectRoot, item) {
  if (["absent", "preserve", "unchanged"].includes(item.action)) return;

  assertSafeProjectDestination(projectRoot, item.to);

  if (item.kind === "managed-block") {
    const current = existsSync(item.to) ? readFileSync(item.to, "utf8") : "";
    const next = renderManagedBlock(current, fileContent(item.from));
    mkdirSync(dirname(item.to), { recursive: true });
    writeFileSync(item.to, next, "utf8");
    return;
  }

  if (item.action === "remove") {
    assertSafeManagedPath(item.managedRoot, item.to);
    rmSync(item.to, { force: true });
    const parent = dirname(item.to);
    if (existsSync(parent) && readdirSync(parent).length === 0) {
      rmdirSync(parent);
    }
    return;
  }

  if (item.action === "replace") {
    assertSafeManagedPath(item.managedRoot, item.to);
    rmSync(item.to, { recursive: true, force: true });
  }
  mkdirSync(dirname(item.to), { recursive: true });
  cpSync(item.from, item.to, { recursive: true, force: false });
}

function legacyFindings(projectRoot) {
  const candidates = [
    ["Nested legacy skill root", join(projectRoot, "qc", ".agents", "skills")],
    ["Duplicate legacy OQ ledger", join(projectRoot, "qc", "refs", "open-questions.md")],
    ["Shared legacy task file", join(projectRoot, "qc", "qc-task.md")],
    ["Legacy runtime contract path", join(projectRoot, "qc", "material-paths.md")],
    ["Legacy checklist path", join(projectRoot, "qc", "field-validation-checklist.md")],
    ["Legacy nested adapter", join(projectRoot, "qc", "AGENTS.md")],
  ];
  return candidates.filter(([, path]) => existsSync(path));
}

function printPlan(projectRoot, target, selected, inspected, findings, dryRun) {
  console.log(`Tanizy QC Agent ${packageConfig.version}`);
  console.log(`Target: ${target}`);
  console.log(`Project root: ${projectRoot}`);
  console.log(`Runtime root: ${join(projectRoot, "qc")}`);
  console.log(`Skills: ${selected.join(", ")}`);

  for (const item of inspected) {
    console.log(`${dryRun ? "Plan" : "Apply"} [${item.action}] ${relative(projectRoot, item.to)}`);
  }

  if (findings.length) {
    console.warn("Legacy layout detected. No legacy file will be deleted automatically:");
    for (const [label, path] of findings) {
      console.warn(`- ${label}: ${relative(projectRoot, path)}`);
    }
    console.warn("Review and migrate these paths after validating the new installation.");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.target || !targets.has(args.target)) {
    throw new Error("Missing or invalid --target. Use gemini-cli, codex, claude-code, or antigravity.");
  }
  if (!args.project) throw new Error("Missing --project.");

  const projectRoot = resolve(args.project);
  validateProjectRoot(projectRoot);
  const { available, plan, selected } = copyPlan(
    args.target,
    projectRoot,
    args.skills,
    args.skipRefs,
  );
  const invalid = args.skills.filter((skill) => !available.includes(skill));
  if (invalid.length) {
    throw new Error(`Unknown skill: ${invalid.join(", ")}. Available skills: ${available.join(", ")}`);
  }

  const inspected = preflight(projectRoot, plan, args.force);
  const findings = legacyFindings(projectRoot);
  printPlan(projectRoot, args.target, selected, inspected, findings, args.dryRun);

  if (args.dryRun) {
    console.log("Dry run complete. No files were written.");
    return;
  }

  for (const item of inspected) applyOperation(projectRoot, item);
  console.log("Install complete.");
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
