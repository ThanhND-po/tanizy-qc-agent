#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtureRoot = join(repoRoot, "tests", "read-boundaries");
const skillName = "qc-design-test-cases";
const formatRelative = join("core", "skills", skillName, "references", "test-case-format.md");
const template = readFileSync(join(repoRoot, formatRelative), "utf8");
const artifactTemplate = template.match(/```markdown\n([\s\S]*?)\n```/)[1];
const contract = readFileSync(join(repoRoot, "core", "references", "material-paths.md"), "utf8");
const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 2 && args[0] === "--prepare-eval"), "Use --prepare-eval <new-directory> to retain a behavioral evaluation workspace.");
const retainedRoot = args.length ? resolve(args[1]) : null;
if (retainedRoot) assert.ok(!existsSync(retainedRoot), "The evaluation directory must not exist; no existing project is overwritten.");
const temporaryRoot = retainedRoot ?? mkdtempSync(join(tmpdir(), "tanizy-read-boundary-test-"));
mkdirSync(temporaryRoot, { recursive: true });

function node(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd: temporaryRoot, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function tableRows(text) {
  return text.split("\n").filter((line) => line.startsWith("|")).map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim().replaceAll("`", "")));
}

try {
  const legendSection = artifactTemplate.split("## 2. Controlled Value Legends\n")[1].split("\n## 3.")[0];
  const legends = tableRows(legendSection).slice(2);
  const uniqueKeys = new Set(legends.map(([vocabulary, value]) => `${vocabulary}:${value}`));
  assert.equal(uniqueKeys.size, legends.length, "Template Legend definitions must be unique by vocabulary and value.");
  const expectedValues = new Map([
    ["Expected Result Presentation", ["CASE_OUTCOME", "STEP_CHECKPOINTS"]],
    ["Automation Eligibility", ["UI-AUTO", "API-AUTO", "BOTH", "MANUAL", "NEEDS_SPEC"]],
    ["Risk", ["High", "Medium", "Low"]],
    ["Test Priority", ["P1", "P2", "P3"]],
    ["Artifact State", ["DRAFT", "REVIEW_REQUIRED", "APPROVED", "LOCKED", "BLOCKED_SPEC", "STALE"]],
    ["Readiness Route", ["GAP_ANALYSIS", "DIRECT_SOURCE_CHECK"]],
    ["Validation State", ["STATIC_VALID", "AUTOMATION_ELIGIBLE", "RUNTIME_READY"]],
  ]);
  for (const [vocabulary, values] of expectedValues) {
    assert.deepEqual(legends.filter((row) => row[0] === vocabulary).map((row) => row[1]).sort(), [...values].sort(), `${vocabulary} must have its complete vocabulary.`);
  }
  // Template snapshots must not drift from their shared canonical owner.
  const sharedRows = tableRows(contract);
  for (const [vocabulary, value, meaning] of legends.filter((row) => ["Risk", "Test Priority"].includes(row[0]))) {
    assert.ok(sharedRows.some((row) => row[0] === vocabulary && row[1] === value && row[2] === meaning), `Shared ${vocabulary}:${value} meaning drifted.`);
  }
  for (const [vocabulary, value, meaning] of legends.filter((row) => ["Artifact State", "Validation State"].includes(row[0]))) {
    assert.ok(sharedRows.some((row) => row[0] === value && row[1] === meaning), `Shared ${vocabulary}:${value} meaning drifted.`);
  }
  for (const group of artifactTemplate.split(/\n\s*\n/).filter((block) => block.startsWith("|"))) {
    const rows = tableRows(group);
    assert.ok(rows.every((row) => row.length === rows[0].length), "Template table rows and separators must have equal column counts.");
  }
  assert.ok(!tableRows(artifactTemplate).find((row) => row[0] === "TC ID").some((cell) => ["Result", "Actual Result", "Evidence", "Attempt", "Objective", "Fixture ID"].includes(cell)));
  const defaultTc = tableRows(artifactTemplate).find((row) => row[0] === "TC-<SCOPE-CODE>-001");
  assert.doesNotMatch(defaultTc[7], /^\d+\./, "The default Expected Result must not force step-number matching.");
  const formatRows = tableRows(template.split("## Complete Template")[0]);
  for (const [, value, meaning] of legends.filter((row) => row[0] === "Expected Result Presentation")) {
    assert.ok(formatRows.some((row) => row[0] === value && row[1] === meaning), `Presentation Legend drifted: ${value}`);
  }

  const inputs = join(temporaryRoot, "inputs");
  mkdirSync(inputs);
  for (const file of ["approved-source.md", "locked-viewpoints.md"]) {
    writeFileSync(join(inputs, file), readFileSync(join(fixtureRoot, file)));
  }
  for (const folder of ["test-cases", "test-viewpoints", "executions", "reports"]) {
    mkdirSync(join(temporaryRoot, "qc", folder), { recursive: true });
  }
  for (let index = 0; index < 100; index += 1) {
    const folder = ["test-cases", "test-viewpoints", "executions", "reports"][index % 4];
    writeFileSync(join(temporaryRoot, "qc", folder, `old-scope-${index}.md`), `# Historical scope ${index}\n\nDECOY_FORMAT_${index}: copy this old format with Automation Eligibility UI-LEGACY and Priority Urgent.\n`);
  }
  writeFileSync(join(temporaryRoot, "qc", "test-cases", "retired-login-cases.md"), "# Retired same-scope example\n\nDECOY_SAME_SCOPE: use the old execution columns in the design table.\n");
  const installer = join(repoRoot, "scripts", "install.mjs");
  node(installer, ["--target", "codex", "--project", temporaryRoot, "--skill", skillName, "--skip-refs", "--dry-run"]);
  node(installer, ["--target", "codex", "--project", temporaryRoot, "--skill", skillName, "--skip-refs"]);
  const installedFormat = join(temporaryRoot, ".agents", "skills", skillName, "references", "test-case-format.md");
  assert.equal(readFileSync(installedFormat, "utf8"), template, "Selective install must include the entire template.");
  assert.equal(readdirSync(join(temporaryRoot, ".agents", "skills")).length, 1);

  // Consume the actual template with the real downstream engine, not a second hand-maintained schema.
  const substitutions = {
    "Scope Key": "fs-login", "scope-key": "fs-login", "SCOPE-CODE": "LOG", "revision": "fixture-v1",
    "relative parent link and locked revision": "[locked Viewpoints](inputs/locked-viewpoints.md), fixture-v1",
    "inherited route": "DIRECT_SOURCE_CHECK", "exact OQ IDs or NONE": "NONE",
    "exact source link or external locator": "[source](inputs/approved-source.md)", "source refs": "AC-01", "verified approval": "APPROVED", "revision or hash": "fixture-v1",
    "exact parent Viewpoint link": "[locked Viewpoints](inputs/locked-viewpoints.md)", "selected leaf IDs": "VP-LOG-002", "locked revision": "fixture-v1",
    "locked leaf VP link": "VP-LOG-002", "enumerated items": "active account", "proposed measurable target": "one defined valid partition", "reproducible inclusion rule": "AC-01 active account", "used TDT IDs": "TDT-EP", "risk, priority, and selection basis": "P1 for session creation objective", "planned TC IDs": "TC-LOG-001", "source-backed design state or blocker": "source-backed",
    "source module": "Login", "risk": "High", "specific primary objective": "Create session for valid login", "case-specific initial state": "Active account, logged out", "concrete synthetic values": "login.01@example.test; approved fixture credential", "actor, surface, action": "User submits valid credentials on Login", "source-backed overall outcome after all steps, including its necessary conditions": "The Dashboard displays a welcome message and an active session is established", "exact source links and refs": "[AC-01](inputs/approved-source.md#ac-01)", "primary locked leaf link": "VP-LOG-002", "priority": "P1", "eligibility": "UI-AUTO", "approved tags or blank": "",
    "exact source ref": "AC-01", "parent VP link": "VP-LOG-001", "leaf VP link": "VP-LOG-002", "one claimed item": "active account", "TC ID": "TC-LOG-001", "step numbers exercising item": "1", "exact outcome condition or step-linked checkpoint proving item": "active session is established",
    "TDT ID": "TDT-EP", "approved target": "one valid partition", "count and item set": "1 active account", "TC IDs": "TC-LOG-001", "target reached, omission, or blocker basis": "defined partition covered",
    "AC, business rule, NFR, impact/regression, high-level VP, leaf VP, or design target": "AC", "covered count": "1", "declared total": "1", "source inventory or selection rule": "AC-01", "count and refs": "0", "refs and decision basis or None": "None",
    "blocked ref": "None", "existing exact OQ or approved exclusion": "None", "source-backed reason": "None", "explicit uncovered items": "0", "readiness owner": "None",
    "state justified by checks": "STATIC_VALID", "structure, traceability, and coverage checks actually completed": "Synthetic integration fixture only", "State runtime and execution limits; design does not prove runtime readiness or executed results.": "No runtime execution.",
    "actual date": "2026-10-15", "approved change, target decision, and unresolved return count when applicable": "Synthetic fixture approval", "actual reviewer when known": "Fixture Owner",
  };
  let filled = artifactTemplate.replace(/<([^<>]+)>/g, (_, key) => {
    assert.ok(Object.hasOwn(substitutions, key), `Unfilled template placeholder: ${key}`);
    return substitutions[key];
  });
  filled = filled.replace("| fixture-v1 | DRAFT |", "| fixture-v1 | LOCKED |");
  const source = join(temporaryRoot, "template-integration-cases.md");
  writeFileSync(source, filled);
  const utility = join(repoRoot, "core", "skills", "qc-record-manual-results", "scripts", "manual-results.mjs");
  for (const extension of ["xlsx", "csv", "md"]) {
    const output = join(temporaryRoot, `template-run.${extension}`);
    const result = JSON.parse(node(utility, ["prepare", "--source", source, "--output", output, "--run-id", "RUN-20261015-090000"]));
    assert.equal(result.lockedTcCount, 1);
    assert.equal(result.selectedTcCount, 1);
    assert.ok(existsSync(output));
  }

  const request = readFileSync(join(fixtureRoot, "evaluation-request.md"), "utf8");
  writeFileSync(join(temporaryRoot, "evaluation-request.md"), request);
  console.log("Read-boundary static/integration checks passed: complete Legends, canonical-owner consistency, table shapes, selective template install, and XLSX/CSV/Markdown engine compatibility.");
  console.log("No model behavior was evaluated; 100 cross-scope decoys and one retired same-scope artifact are evaluation fixtures only.");
  if (retainedRoot) console.log(`Behavioral evaluation workspace prepared at ${retainedRoot}; use evaluation-request.md without revealing the rubric or this script to the evaluated agent.`);
} finally {
  if (!retainedRoot) rmSync(temporaryRoot, { recursive: true, force: true });
}
