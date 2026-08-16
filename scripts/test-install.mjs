#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const installer = join(repoRoot, "scripts", "install.mjs");
const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const managedBlockStart = "<!-- BEGIN TANIZY QC AGENT MANAGED BLOCK -->";
const managedBlockEnd = "<!-- END TANIZY QC AGENT MANAGED BLOCK -->";
const canonicalOqHeader =
  "| OQ ID | Scope Key | Source Path and Ref | Finding Class | Question Domain | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Owner | Target Date | Status | Decision | Decision By | Decision Source | Resolved Source Ref | Answered At | Status Updated At |";
const canonicalContextHeader =
  "| Context ID | Scope Key | Module | Environment | Verified Current Behavior or Constraint | Source | Source Revision | Verified At | Verified By | Status |";
const canonicalConstraintHeader =
  "| Constraint ID | Scope Key | Module | Environment | Constraint | Source | Source Revision | Verified At | Verified By | Status |";
const canonicalBugHeader =
  "| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |";
const skillNames = readdirSync(join(repoRoot, "core", "skills"))
  .filter((name) => statSync(join(repoRoot, "core", "skills", name)).isDirectory())
  .sort();
const temporaryRoot = mkdtempSync(join(tmpdir(), "tanizy-qc-install-test-"));

function project(name) {
  const root = join(temporaryRoot, name);
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "package.json"), "{}\n", "utf8");
  return root;
}

function runNode(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expectedStatus,
    `Unexpected installer status.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function skillRoot(target, root) {
  if (target === "gemini-cli") return join(root, "skills");
  if (target === "claude-code") return join(root, ".claude", "skills");
  return join(root, ".agents", "skills");
}

function adapterPath(target, root) {
  if (target === "gemini-cli") return join(root, "GEMINI.md");
  if (target === "claude-code") return join(root, "CLAUDE.md");
  return join(root, "AGENTS.md");
}

function contentOutsideQcBlock(content) {
  const start = content.indexOf(managedBlockStart);
  const end = content.indexOf(managedBlockEnd);
  assert.ok(start >= 0 && end > start, "Expected one complete QC managed block");
  return `${content.slice(0, start)}${content.slice(end + managedBlockEnd.length)}`;
}

try {
  for (const target of ["gemini-cli", "codex", "claude-code", "antigravity"]) {
    const root = project(`full-${target}`);
    runNode(["--target", target, "--project", root]);

    for (const skill of skillNames) {
      assert.ok(existsSync(join(skillRoot(target, root), skill, "SKILL.md")));
      assert.ok(existsSync(join(skillRoot(target, root), skill, "references", "material-paths.md")));
      if (["qc-record-manual-results", "qc-run-playwright", "qc-report-generator"].includes(skill)) {
        assert.ok(existsSync(join(skillRoot(target, root), skill, "references", "executions-log.md")));
      }
    }
    assert.ok(existsSync(join(root, "qc", "config", "material-paths.md")));
    assert.ok(existsSync(join(root, "qc", "config", "field-validation-checklist.md")));
    assert.ok(existsSync(join(root, "qc", "open-questions.md")));
    assert.ok(!existsSync(join(root, "qc", "refs", "open-questions.md")));
    assert.ok(!existsSync(join(root, "qc", ".agents", "skills")));
    assert.ok(
      readFileSync(join(root, "qc", "open-questions.md"), "utf8").includes(
        canonicalOqHeader,
      ),
    );
    const installedSystemContext = readFileSync(
      join(root, "qc", "refs", "system-context.md"),
      "utf8",
    );
    assert.ok(installedSystemContext.includes(canonicalContextHeader));
    assert.ok(installedSystemContext.includes(canonicalConstraintHeader));
    assert.ok(
      readFileSync(join(root, "qc", "refs", "bug-base.md"), "utf8").includes(
        canonicalBugHeader,
      ),
    );
    const adapter = readFileSync(adapterPath(target, root), "utf8");
    assert.match(adapter, /BEGIN TANIZY QC AGENT MANAGED BLOCK/);
    if (target === "antigravity") {
      assert.ok(existsSync(join(root, ".agents", "rules", "tanizy-qc.md")));
    }
  }

  const selective = project("selective");
  runNode([
    "--target",
    "codex",
    "--project",
    selective,
    "--skill",
    "qc-gap-finder",
  ]);
  assert.deepEqual(readdirSync(join(selective, ".agents", "skills")), ["qc-gap-finder"]);
  assert.ok(!existsSync(join(selective, "qc", "config", "field-validation-checklist.md")));
  assert.doesNotMatch(readFileSync(join(selective, "AGENTS.md"), "utf8"), /qc-design-viewpoints/);

  const selectiveManual = project("selective-manual-results");
  runNode([
    "--target",
    "codex",
    "--project",
    selectiveManual,
    "--skill",
    "qc-record-manual-results",
  ]);
  assert.deepEqual(
    readdirSync(join(selectiveManual, ".agents", "skills")),
    ["qc-record-manual-results"],
  );
  assert.ok(
    existsSync(
      join(
        selectiveManual,
        ".agents",
        "skills",
        "qc-record-manual-results",
        "references",
        "executions-log.md",
      ),
    ),
  );

  const adapterPreserve = project("adapter-preserve");
  const adapterPreservePath = join(adapterPreserve, "AGENTS.md");
  writeFileSync(
    adapterPreservePath,
    "# Tanizy QC Agent for Codex\n\n## Skill Routing\n\nKeep this unmarked project content.\n",
    "utf8",
  );
  runNode([
    "--target",
    "codex",
    "--project",
    adapterPreserve,
    "--skill",
    "qc-gap-finder",
  ]);
  assert.match(readFileSync(adapterPreservePath, "utf8"), /Keep this unmarked project content\./);
  assert.match(readFileSync(adapterPreservePath, "utf8"), /BEGIN TANIZY QC AGENT MANAGED BLOCK/);

  const malformedAdapters = [
    ["missing-end", `${managedBlockStart}\nIncomplete block.\n`],
    [
      "duplicate-block",
      `${managedBlockStart}\nFirst.\n${managedBlockEnd}\n${managedBlockStart}\nSecond.\n${managedBlockEnd}\n`,
    ],
    ["reversed-markers", `${managedBlockEnd}\n${managedBlockStart}\n`],
  ];
  for (const [name, malformedContent] of malformedAdapters) {
    const malformedProject = project(`malformed-${name}`);
    const malformedPath = join(malformedProject, "AGENTS.md");
    writeFileSync(malformedPath, malformedContent, "utf8");
    const malformedResult = runNode(
      [
        "--target",
        "codex",
        "--project",
        malformedProject,
        "--skill",
        "qc-gap-finder",
      ],
      1,
    );
    assert.match(malformedResult.stderr, /zero or one complete Tanizy QC managed block/);
    assert.equal(readFileSync(malformedPath, "utf8"), malformedContent);
    assert.ok(!existsSync(join(malformedProject, ".agents", "skills", "qc-gap-finder")));
    assert.ok(!existsSync(join(malformedProject, "qc", "config", "material-paths.md")));
  }

  const poCoexistence = project("po-coexistence");
  const poAdapterPath = join(poCoexistence, "AGENTS.md");
  const poManagedBlock = [
    "<!-- BEGIN TANIZY PO AGENT MANAGED BLOCK -->",
    "## Product Owner Agent",
    "Preserve approved specs and explicit business decisions.",
    "<!-- END TANIZY PO AGENT MANAGED BLOCK -->",
  ].join("\n");
  const projectInstructions = "## Project Instructions\nKeep local release rules.";
  const originalPoContent = `# Project Agents\n\n${poManagedBlock}\n\n${projectInstructions}\n`;
  const poSkillRoot = join(
    poCoexistence,
    ".agents",
    "skills",
    "writing-requirements",
  );
  const poSkillPath = join(poSkillRoot, "SKILL.md");
  const poSkillContent = "# Writing Requirements\n\nPO skill sentinel.\n";
  mkdirSync(poSkillRoot, { recursive: true });
  writeFileSync(poSkillPath, poSkillContent, "utf8");
  writeFileSync(poAdapterPath, originalPoContent, "utf8");
  runNode([
    "--target",
    "codex",
    "--project",
    poCoexistence,
    "--skill",
    "qc-gap-finder",
  ]);
  const afterQcInstall = readFileSync(poAdapterPath, "utf8");
  assert.ok(afterQcInstall.startsWith(originalPoContent));
  assert.ok(afterQcInstall.includes(poManagedBlock));
  assert.ok(afterQcInstall.includes(projectInstructions));
  assert.equal(
    afterQcInstall.match(/BEGIN TANIZY QC AGENT MANAGED BLOCK/g)?.length,
    1,
  );

  const poFooter = "## PO Footer\nKeep this content after the QC block.\n";
  const staleQcAdapter = `${afterQcInstall}${poFooter}`.replace(
    "Use Tanizy QC Agent only when the user explicitly requests QC work.",
    "Legacy QC routing text.",
  );
  writeFileSync(poAdapterPath, staleQcAdapter, "utf8");
  runNode(
    [
      "--target",
      "codex",
      "--project",
      poCoexistence,
      "--skill",
      "qc-gap-finder",
    ],
    1,
  );
  assert.equal(readFileSync(poAdapterPath, "utf8"), staleQcAdapter);

  runNode([
    "--target",
    "codex",
    "--project",
    poCoexistence,
    "--skill",
    "qc-gap-finder",
    "--force",
  ]);
  const afterQcForce = readFileSync(poAdapterPath, "utf8");
  assert.equal(contentOutsideQcBlock(afterQcForce), contentOutsideQcBlock(staleQcAdapter));
  assert.ok(afterQcForce.startsWith(originalPoContent));
  assert.ok(afterQcForce.includes(poManagedBlock));
  assert.ok(afterQcForce.includes(projectInstructions));
  assert.ok(afterQcForce.endsWith(poFooter));
  assert.doesNotMatch(afterQcForce, /Legacy QC routing text/);
  assert.match(
    afterQcForce,
    /Use Tanizy QC Agent only when the user explicitly requests QC work\./,
  );
  assert.equal(
    afterQcForce.match(/BEGIN TANIZY QC AGENT MANAGED BLOCK/g)?.length,
    1,
  );
  assert.equal(readFileSync(poSkillPath, "utf8"), poSkillContent);

  runNode(["--target", "codex", "--project", poCoexistence, "--force"]);
  const afterFullQcForce = readFileSync(poAdapterPath, "utf8");
  assert.equal(contentOutsideQcBlock(afterFullQcForce), contentOutsideQcBlock(staleQcAdapter));
  assert.equal(readFileSync(poSkillPath, "utf8"), poSkillContent);
  assert.equal(
    afterFullQcForce.match(/BEGIN TANIZY QC AGENT MANAGED BLOCK/g)?.length,
    1,
  );

  writeFileSync(poAdapterPath, originalPoContent, "utf8");
  runNode([
    "--target",
    "codex",
    "--project",
    poCoexistence,
    "--skill",
    "qc-gap-finder",
    "--force",
  ]);
  const afterExternalOverwriteRecovery = readFileSync(poAdapterPath, "utf8");
  assert.ok(afterExternalOverwriteRecovery.startsWith(originalPoContent));
  assert.ok(afterExternalOverwriteRecovery.includes(poManagedBlock));
  assert.equal(
    afterExternalOverwriteRecovery.match(/BEGIN TANIZY QC AGENT MANAGED BLOCK/g)?.length,
    1,
  );

  const preserve = project("preserve");
  runNode(["--target", "codex", "--project", preserve]);
  const checklist = join(preserve, "qc", "config", "field-validation-checklist.md");
  const systemContext = join(preserve, "qc", "refs", "system-context.md");
  const bugBase = join(preserve, "qc", "refs", "bug-base.md");
  const openQuestions = join(preserve, "qc", "open-questions.md");
  const adapter = join(preserve, "AGENTS.md");
  const legacySystemContext =
    "| Context ID | Module | Verified Current Behavior or Constraint | Source | Verified At | Verified By | Status |\n";
  const legacyBugBase =
    "| Bug ID | Module | Summary | Status | Environment | Evidence | Observed At | Regression Implication |\n";
  const legacyOpenQuestions =
    "| OQ ID | Scope Key | Source Path and Ref | Type | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Status | Decision | Decision Source | Answered At |\n";
  writeFileSync(checklist, "CUSTOM CHECKLIST\n", "utf8");
  writeFileSync(systemContext, legacySystemContext, "utf8");
  writeFileSync(bugBase, legacyBugBase, "utf8");
  writeFileSync(openQuestions, legacyOpenQuestions, "utf8");
  writeFileSync(adapter, `# Project Rules\n\nKeep me.\n\n${readFileSync(adapter, "utf8")}`, "utf8");
  const unselectedSkill = readFileSync(
    join(preserve, ".agents", "skills", "qc-design-viewpoints", "SKILL.md"),
    "utf8",
  );
  runNode([
    "--target",
    "codex",
    "--project",
    preserve,
    "--skill",
    "qc-gap-finder",
    "--force",
  ]);
  assert.equal(readFileSync(checklist, "utf8"), "CUSTOM CHECKLIST\n");
  assert.equal(readFileSync(systemContext, "utf8"), legacySystemContext);
  assert.equal(readFileSync(bugBase, "utf8"), legacyBugBase);
  assert.equal(readFileSync(openQuestions, "utf8"), legacyOpenQuestions);
  assert.match(readFileSync(adapter, "utf8"), /^# Project Rules\n\nKeep me\./);
  assert.equal(
    readFileSync(join(preserve, ".agents", "skills", "qc-design-viewpoints", "SKILL.md"), "utf8"),
    unselectedSkill,
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-gap-finder", "references", "material-paths.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-record-manual-results", "references", "executions-log.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-run-playwright", "references", "executions-log.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-report-generator", "references", "executions-log.md"),
    ),
  );

  runNode(["--target", "codex", "--project", preserve, "--force"]);
  for (const skill of skillNames) {
    assert.ok(existsSync(join(preserve, ".agents", "skills", skill, "references", "material-paths.md")));
  }
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-record-manual-results", "references", "executions-log.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-run-playwright", "references", "executions-log.md"),
    ),
  );
  assert.ok(
    existsSync(
      join(preserve, ".agents", "skills", "qc-report-generator", "references", "executions-log.md"),
    ),
  );
  assert.equal(readFileSync(checklist, "utf8"), "CUSTOM CHECKLIST\n");
  assert.equal(readFileSync(systemContext, "utf8"), legacySystemContext);
  assert.equal(readFileSync(bugBase, "utf8"), legacyBugBase);
  assert.equal(readFileSync(openQuestions, "utf8"), legacyOpenQuestions);

  const atomic = project("atomic");
  const lateCollision = join(atomic, ".agents", "skills", "qc-report-generator");
  mkdirSync(lateCollision, { recursive: true });
  writeFileSync(join(lateCollision, "KEEP"), "keep\n", "utf8");
  runNode(["--target", "codex", "--project", atomic], 1);
  assert.ok(existsSync(join(lateCollision, "KEEP")));
  assert.ok(!existsSync(join(atomic, ".agents", "skills", "qc-design-test-cases")));
  assert.ok(!existsSync(join(atomic, "qc", "config", "material-paths.md")));

  const parent = project("nested-parent");
  const nestedQc = join(parent, "qc");
  mkdirSync(nestedQc);
  const nestedResult = runNode(["--target", "codex", "--project", nestedQc], 1);
  assert.match(nestedResult.stderr, /runtime qc\/ directory/);
  assert.ok(!existsSync(join(nestedQc, ".agents")));

  const symlinkProject = project("symlink-destination");
  const externalSkill = join(temporaryRoot, "external-skill");
  mkdirSync(externalSkill);
  const symlinkSkillRoot = join(symlinkProject, ".agents", "skills");
  mkdirSync(symlinkSkillRoot, { recursive: true });
  symlinkSync(externalSkill, join(symlinkSkillRoot, "qc-gap-finder"), "dir");
  const symlinkResult = runNode(
    ["--target", "codex", "--project", symlinkProject, "--skill", "qc-orchestrator", "--force"],
    1,
  );
  assert.match(symlinkResult.stderr, /symbolic-link skill destination/);
  assert.ok(!existsSync(join(externalSkill, "references", "material-paths.md")));

  const packRoot = join(temporaryRoot, "pack");
  const extractRoot = join(temporaryRoot, "extract");
  mkdirSync(packRoot);
  mkdirSync(extractRoot);
  const packed = spawnSync("npm", ["pack", "--json", "--pack-destination", packRoot], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: join(temporaryRoot, "npm-cache"),
    },
  });
  assert.equal(packed.status, 0, packed.stderr);
  const packData = JSON.parse(packed.stdout);
  const tarball = join(packRoot, packData[0].filename);
  const extracted = spawnSync("tar", ["-xzf", tarball, "-C", extractRoot], {
    encoding: "utf8",
  });
  assert.equal(extracted.status, 0, extracted.stderr);
  const packagedBin = join(extractRoot, "package", "scripts", "install.mjs");
  assert.notEqual(statSync(packagedBin).mode & 0o111, 0, "Packaged CLI is not executable");
  assert.ok(existsSync(join(extractRoot, "package", "docs", "install-codex.md")));
  const version = spawnSync(packagedBin, ["--version"], { encoding: "utf8" });
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), packageConfig.version);
  const help = spawnSync(packagedBin, ["--help"], { encoding: "utf8" });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--skip-refs/);
  const packagedProject = project("packaged-cli");
  const packagedDryRun = spawnSync(
    packagedBin,
    ["--target", "codex", "--project", packagedProject, "--dry-run"],
    { encoding: "utf8" },
  );
  assert.equal(packagedDryRun.status, 0, packagedDryRun.stderr);
  assert.match(packagedDryRun.stdout, /Dry run complete\. No files were written\./);

  console.log(
    `Installer tests passed: 4 targets, selective routing, PO coexistence, malformed-block preflight, force refresh, preservation, collision preflight, nested-root and symlink guards, packaged CLI.`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
