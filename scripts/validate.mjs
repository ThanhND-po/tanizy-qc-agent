#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const failures = [];
const checkedLinks = [];

function fail(message) {
  failures.push(message);
}

function filesUnder(root) {
  const output = [];
  for (const name of readdirSync(root).sort()) {
    const path = join(root, name);
    if (statSync(path).isDirectory()) output.push(...filesUnder(path));
    else output.push(path);
  }
  return output;
}

function parseFrontmatter(path) {
  const content = readFileSync(path, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${relative(repoRoot, path)}: invalid frontmatter delimiters`);
    return { content, data: {} };
  }

  const data = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z_]+):\s*(.+)$/);
    if (!field) {
      fail(`${relative(repoRoot, path)}: invalid frontmatter line: ${line}`);
      continue;
    }
    const [, key, rawValue] = field;
    if (Object.hasOwn(data, key)) fail(`${relative(repoRoot, path)}: duplicate ${key}`);
    let value = rawValue.trim();
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value);
      } catch {
        fail(`${relative(repoRoot, path)}: invalid quoted value for ${key}`);
      }
    }
    data[key] = value;
  }
  return { content, data };
}

function validateMarkdownLinks(path, content) {
  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  const outsideFencedExamples = content.replace(/```[\s\S]*?```/g, "");
  for (const match of outsideFencedExamples.matchAll(regex)) {
    const target = match[1].split("#", 1)[0];
    if (!target || /^(https?:|mailto:)/.test(target) || target.includes("<")) continue;
    const resolved = resolve(join(path, ".."), target);
    checkedLinks.push([path, target]);
    if (!existsSync(resolved)) {
      fail(`${relative(repoRoot, path)}: broken relative link ${target}`);
    }
  }
}

const skillsRoot = join(repoRoot, "core", "skills");
const skillNames = readdirSync(skillsRoot)
  .filter((name) => statSync(join(skillsRoot, name)).isDirectory())
  .sort();
const seenNames = new Set();

for (const folder of skillNames) {
  const skillPath = join(skillsRoot, folder, "SKILL.md");
  if (!existsSync(skillPath)) {
    fail(`${folder}: SKILL.md is missing`);
    continue;
  }

  const { content, data } = parseFrontmatter(skillPath);
  const keys = Object.keys(data).sort();
  if (keys.join(",") !== "description,name") {
    fail(`${folder}: frontmatter must contain only name and description`);
  }
  if (data.name !== folder) fail(`${folder}: frontmatter name must match folder`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name ?? "")) {
    fail(`${folder}: invalid skill name`);
  }
  if ((data.name ?? "").length > 64) fail(`${folder}: skill name exceeds 64 characters`);
  if (seenNames.has(data.name)) fail(`${folder}: duplicate skill name ${data.name}`);
  seenNames.add(data.name);
  if (!(data.description ?? "").includes("Use ")) {
    fail(`${folder}: description must state when to use the skill`);
  }
  if (!content.includes("references/material-paths.md")) {
    fail(`${folder}: artifact contract reference is missing`);
  }
  if (content.split("\n").length > 500) fail(`${folder}: SKILL.md exceeds 500 lines`);
  if (/`(?:specs|postman)\//.test(content)) {
    fail(`${folder}: output path escapes the qc/ artifact root`);
  }
  if (content.includes("README.md")) {
    fail(`${folder}: generated output must use a descriptive manifest name`);
  }

  for (const match of content.matchAll(/`references\/([^`]+)`/g)) {
    const referenceName = match[1];
    if (["material-paths.md", "executions-log.md"].includes(referenceName)) {
      const sharedReference = join(repoRoot, "core", "references", referenceName);
      if (!existsSync(sharedReference)) {
        fail(`${folder}: missing shared reference core/references/${referenceName}`);
      }
      continue;
    }
    const referencePath = join(skillsRoot, folder, "references", referenceName);
    if (!existsSync(referencePath)) {
      fail(`${folder}: missing local reference references/${referenceName}`);
    }
  }

  const agentsPath = join(skillsRoot, folder, "agents");
  if (existsSync(agentsPath)) {
    fail(`${folder}: the child agents directory is intentionally excluded from this package`);
  }

  validateMarkdownLinks(skillPath, content);
}

const publishedTextRoots = [
  join(repoRoot, "core"),
  join(repoRoot, "adapters"),
  join(repoRoot, "docs"),
  join(repoRoot, "refs-templates"),
];
const publishedTextFiles = [join(repoRoot, "README.md")];
for (const root of publishedTextRoots) {
  publishedTextFiles.push(...filesUnder(root).filter((path) => /\.(md|yaml)$/.test(path)));
}
for (const path of publishedTextFiles) {
  const content = readFileSync(path, "utf8");
  if (content.includes("—")) fail(`${relative(repoRoot, path)}: em dash is not allowed`);
  validateMarkdownLinks(path, content);
}

const installerPath = join(repoRoot, "scripts", "install.mjs");
const installer = readFileSync(installerPath, "utf8");
if (!installer.startsWith("#!/usr/bin/env node\n")) fail("scripts/install.mjs: missing Node shebang");
if ((statSync(installerPath).mode & 0o111) === 0) fail("scripts/install.mjs: file is not executable");
if (!installer.includes('join(projectRoot, "qc", "open-questions.md")')) {
  fail("scripts/install.mjs: Open Questions seed destination is incorrect");
}
if (!installer.includes('join(projectRoot, "qc", "config", "material-paths.md")')) {
  fail("scripts/install.mjs: runtime artifact contract destination is incorrect");
}

const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
if (packageConfig.scripts?.["pack:check"]?.includes("add package validation here")) {
  fail("package.json: pack:check is still a placeholder");
}

const testCaseSkill = readFileSync(
  join(skillsRoot, "qc-design-test-cases", "SKILL.md"),
  "utf8",
);
const canonicalTcHeader =
  "| TC ID | Module | Risk | Title | Preconditions | Test Data | Steps | Expected Results | Source Trace | VP ID | Priority | Automation Eligibility | Tags |";
if (!testCaseSkill.includes(canonicalTcHeader)) {
  fail("qc-design-test-cases: canonical Test Case table header is missing or changed");
}
if (
  /^\| TC ID \|.*(?:Automatable|Auto Type|Status|Attempt|Selected for Run|Test Result|Actual Result|Executor|Test By|Test Date|Evidence|Defect|Cleanup)/m.test(
    testCaseSkill,
  )
) {
  fail("qc-design-test-cases: duplicate automation or mutable execution columns are not allowed");
}
if (!testCaseSkill.includes("recommend exporting the locked Test Case table")) {
  fail("qc-design-test-cases: manual XLSX handoff recommendation is missing");
}

const oqGuide = readFileSync(
  join(skillsRoot, "qc-gap-finder", "references", "open-questions-guide.md"),
  "utf8",
);
const oqSeed = readFileSync(join(repoRoot, "refs-templates", "open-questions.md"), "utf8");
const canonicalOqHeader =
  "| OQ ID | Scope Key | Source Path and Ref | Finding Class | Question Domain | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Owner | Target Date | Status | Decision | Decision By | Decision Source | Resolved Source Ref | Answered At | Status Updated At |";
const oqHeader = oqGuide.split("\n").find((line) => line.startsWith("| OQ ID |"));
const oqSeedHeader = oqSeed.split("\n").find((line) => line.startsWith("| OQ ID |"));
if (oqHeader !== canonicalOqHeader || oqSeedHeader !== canonicalOqHeader) {
  fail("Open Questions guide and seed must use the same canonical schema");
}
for (const value of ["GAP", "AMB", "CONFLICT", "RISK", "High", "Medium", "Low", "DESIGN", "EXPORT", "EXECUTION", "REPORT", "NONE"]) {
  if (!oqGuide.includes(`\`${value}\``)) {
    fail(`Open Questions guide: controlled value ${value} is missing`);
  }
}
const poToQcStatusCases = new Map([
  ["Open", "OPEN"],
  ["Answered", "ANSWERED"],
  ["Deferred", "OPEN"],
  ["Governing source updated", "RESOLVED"],
]);
for (const [poState, qcStatus] of poToQcStatusCases) {
  if (!oqGuide.includes(`| ${poState} | \`${qcStatus}\` |`)) {
    fail(`Open Questions guide: PO ${poState} must map to QC ${qcStatus}`);
  }
}
if (!oqGuide.includes("Silence, inactivity, or delivery pressure never changes status.")) {
  fail("Open Questions guide: silence must not change OQ status");
}

const contextGuide = readFileSync(
  join(skillsRoot, "qc-gap-finder", "references", "context-templates.md"),
  "utf8",
);
const systemContextSeed = readFileSync(
  join(repoRoot, "refs-templates", "system-context.md"),
  "utf8",
);
const bugBaseSeed = readFileSync(join(repoRoot, "refs-templates", "bug-base.md"), "utf8");
const canonicalContextHeader =
  "| Context ID | Scope Key | Module | Environment | Verified Current Behavior or Constraint | Source | Source Revision | Verified At | Verified By | Status |";
const canonicalConstraintHeader =
  "| Constraint ID | Scope Key | Module | Environment | Constraint | Source | Source Revision | Verified At | Verified By | Status |";
const canonicalBugHeader =
  "| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |";
for (const [label, header, seed] of [
  ["System Context", canonicalContextHeader, systemContextSeed],
  ["Environment Constraint", canonicalConstraintHeader, systemContextSeed],
  ["Bug Base", canonicalBugHeader, bugBaseSeed],
]) {
  if (!contextGuide.includes(header) || !seed.includes(header)) {
    fail(`${label} guide and seed must use the same canonical schema`);
  }
}
for (const status of ["ACTIVE", "STALE", "SUPERSEDED"]) {
  if (!contextGuide.includes(`\`${status}\``)) {
    fail(`System Context: controlled status ${status} is missing`);
  }
}
for (const status of ["OPEN", "IN_PROGRESS", "FIXED", "VERIFIED", "CLOSED", "REOPENED"]) {
  if (!contextGuide.includes(`\`${status}\``)) {
    fail(`Bug Base: controlled status ${status} is missing`);
  }
}
if (!contextGuide.includes("cannot override an approved PO requirement")) {
  fail("System Context: approved PO requirements must remain authoritative");
}
if (!contextGuide.includes("Evidence is required for Bug Base promotion")) {
  fail("Bug Base: evidence requirement is missing");
}
if (
  !bugBaseSeed.includes("BUG-TOU-001") ||
  !bugBaseSeed.includes("Firebase App Distribution") ||
  !bugBaseSeed.includes("illustrative only")
) {
  fail("Bug Base: Android cache and ToU example is missing or unsafe");
}
if (
  !systemContextSeed.includes("CON-TIME-001") ||
  !systemContextSeed.includes("UTC+0") ||
  !systemContextSeed.includes("`timestamptz`") ||
  !systemContextSeed.includes("FE phải truyền timezone") ||
  !systemContextSeed.includes("illustrative only")
) {
  fail("System Context: UTC and local-time conversion example is missing or unsafe");
}

const executionContract = readFileSync(
  join(repoRoot, "core", "references", "executions-log.md"),
  "utf8",
);
if (!executionContract.includes("Assessment Policy")) {
  fail("core/references/executions-log.md: Assessment Policy is required");
}
if (/Update Test Case `(?:Status|Test By|Test Date)`/.test(executionContract)) {
  fail("core/references/executions-log.md: locked Test Cases must remain immutable");
}
if (!executionContract.includes("Evidence may be blank")) {
  fail("core/references/executions-log.md: optional Evidence Policy is missing");
}
if (!executionContract.includes("Source Locator")) {
  fail("core/references/executions-log.md: manual result provenance is missing");
}

const manualResultSkill = readFileSync(
  join(skillsRoot, "qc-record-manual-results", "SKILL.md"),
  "utf8",
);
const manualResultFormat = readFileSync(
  join(skillsRoot, "qc-record-manual-results", "references", "manual-results-format.md"),
  "utf8",
);
if (!manualResultSkill.includes("## PREPARE Workflow") || !manualResultSkill.includes("## IMPORT Workflow")) {
  fail("qc-record-manual-results: PREPARE and IMPORT workflows are required");
}
if (!manualResultSkill.includes("native spreadsheet artifact skill")) {
  fail("qc-record-manual-results: target-native XLSX capability routing is missing");
}
for (const sheet of ["Instructions", "Run Metadata", "Test Execution", "Validation Summary"]) {
  if (!manualResultFormat.includes(`\`${sheet}\``)) {
    fail(`qc-record-manual-results: workbook sheet ${sheet} is missing`);
  }
}

const reportSkill = readFileSync(
  join(skillsRoot, "qc-report-generator", "SKILL.md"),
  "utf8",
);
const reportContentSpec = readFileSync(
  join(skillsRoot, "qc-report-generator", "references", "report-content-spec.md"),
  "utf8",
);
if (!reportSkill.includes("Use `COMPACT` mode") || !reportContentSpec.includes("## COMPACT Core")) {
  fail("qc-report-generator: COMPACT must remain the default report mode");
}
if (!reportSkill.includes("relative to the proposed file under")) {
  fail("qc-report-generator: report links must resolve from the final artifact path");
}
if (!reportContentSpec.includes("## DETAILED Appendices")) {
  fail("qc-report-generator: optional DETAILED appendices contract is missing");
}
if (/same eight sections|eight content sections/i.test(`${reportSkill}\n${reportContentSpec}`)) {
  fail("qc-report-generator: every report must not be forced into eight sections");
}
if (!reportContentSpec.includes("with no execution row in the selected")) {
  fail("qc-report-generator: NOT_RUN must exclude attempted BLOCKED, ERROR, and SKIP cases");
}
if (!reportContentSpec.includes("exactly one mutually exclusive report bucket")) {
  fail("qc-report-generator: TC-level result buckets must remain mutually exclusive");
}
const reportFormatGuide = readFileSync(
  join(skillsRoot, "qc-report-generator", "references", "format-guide.md"),
  "utf8",
);
if (!reportFormatGuide.includes("Use one row per execution attempt")) {
  fail("qc-report-generator: CSV must preserve every execution attempt");
}

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue(s):`);
  for (const issue of failures) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Validation passed: ${skillNames.length} skills, ${publishedTextFiles.length} published text files, ${checkedLinks.length} relative links.`,
);
