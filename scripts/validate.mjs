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

function validateMarkdownSourceFormatting(path, content) {
  const lines = content.split("\n");
  const protectedLines = new Set();
  let inFrontmatter = lines[0] === "---";
  let fenceMarker = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (inFrontmatter) {
      protectedLines.add(index);
      if (index > 0 && trimmed === "---") inFrontmatter = false;
      continue;
    }

    const fence = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMarker) {
      protectedLines.add(index);
      if (trimmed.startsWith(fenceMarker)) fenceMarker = null;
      continue;
    }
    if (fence) {
      protectedLines.add(index);
      fenceMarker = fence[1];
    }
  }

  const isListItem = (line) => /^ {0,3}(?:[-+*]|\d+[.)])\s+/.test(line);
  const isStandaloneStructure = (line) => {
    const trimmed = line.trim();
    return (
      !trimmed ||
      /^#{1,6}\s/.test(trimmed) ||
      /^\|/.test(trimmed) ||
      /^(?:-{3,}|_{3,}|\*{3,})$/.test(trimmed) ||
      /^<\/?[A-Za-z][^>]*>/.test(trimmed) ||
      /^<!--|^-->/.test(trimmed) ||
      /^\[[^\]]+\]:\s*/.test(trimmed) ||
      /^!\[[^\]]*\]\(/.test(trimmed) ||
      /^(?: {4}|\t)/.test(line)
    );
  };
  const startsNewBlock = (line) =>
    isStandaloneStructure(line) || isListItem(line) || /^ {0,3}>\s?/.test(line);
  const endsSentence = (line) => {
    if (/ {2}$/.test(line) || /<br\s*\/?>\s*$/i.test(line)) return true;
    return /[.!?。！？](?:[`*_~"'’”)}\]]*)$/.test(line.trim());
  };
  const containsMultipleSentences = (line) => {
    const withoutAbbreviations = line
      .trim()
      .replace(/\b(?:e\.g|i\.e)\./gi, (value) => value.replaceAll(".", "∎"));
    return /[.!?。！？](?:[`*_~"'’”)}\]]*)\s+(?=[`*_~"'“‘(\[]*(?:\p{Lu}|\d|`))/u.test(
      withoutAbbreviations,
    );
  };

  for (let index = 0; index < lines.length; index += 1) {
    if (protectedLines.has(index)) continue;
    const line = lines[index];
    if (isListItem(line) || isStandaloneStructure(line)) continue;
    if (containsMultipleSentences(line)) {
      fail(
        `${relative(repoRoot, path)}:${index + 1}: prose contains multiple sentences on one physical line`,
      );
    }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (protectedLines.has(index) || protectedLines.has(index + 1)) continue;

    const current = lines[index];
    const next = lines[index + 1];
    if (!current.trim() || !next.trim()) continue;

    if (isListItem(current)) {
      if (!startsNewBlock(next)) {
        fail(
          `${relative(repoRoot, path)}:${index + 1}: list item is split across physical lines; keep the item on one line`,
        );
      }
      continue;
    }

    if (isStandaloneStructure(current) || startsNewBlock(next)) continue;
    if (!endsSentence(current)) {
      fail(
        `${relative(repoRoot, path)}:${index + 1}: prose is hard-wrapped before the sentence boundary`,
      );
    }
  }
}

const skillsRoot = join(repoRoot, "core", "skills");
const skillNames = readdirSync(skillsRoot)
  .filter((name) => statSync(join(skillsRoot, name)).isDirectory())
  .sort();
const seenNames = new Set();
const skillInputBoundaryRules = [
  "## Input Preflight",
  "Input Boundary and Source Discovery",
  "`BLOCKED_INPUT`",
  "explicitly approve one bounded search root",
  "do not request broader filesystem permission",
  "feature name, module name, scope key, keyword, or prior project knowledge",
];

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
  if (!content.includes("qc/config/material-paths.md")) {
    fail(`${folder}: shared artifact contract reference is missing`);
  }
  for (const rule of skillInputBoundaryRules) {
    if (!content.toLowerCase().includes(rule.toLowerCase())) {
      fail(`${folder}: required Input Boundary preflight rule is missing: ${rule}`);
    }
  }
  if (content.includes("references/material-paths.md")) {
    fail(`${folder}: legacy per-skill artifact contract reference is not allowed`);
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
    if (referenceName === "executions-log.md") {
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
  if (path.endsWith(".md")) validateMarkdownSourceFormatting(path, content);
  validateMarkdownLinks(path, content);
}

const publicExampleDenylist = [
  /\b(?:shinsei|zengin|paypay|earlybill|talentbank|anyjob|ikura|sbi)\b/i,
  /\b(?:REQ-PAY|FS-PAY|TC-ZEX|VP-ZEX|OQ-ZEX|BUG-TOU)\b/i,
  /\b(?:Break Time|timesheets?|payroll|payslips?|attendance|manual transfer|payment settlement|correction request|worker account)\b/i,
  /Firebase App Distribution/i,
];
const publicRepositoryTextFiles = [
  ...publishedTextFiles,
  join(repoRoot, "package.json"),
  join(repoRoot, "scripts", "install.mjs"),
  join(repoRoot, "scripts", "test-install.mjs"),
  join(repoRoot, "scripts", "test-manual-results.mjs"),
];
for (const path of new Set(publicRepositoryTextFiles)) {
  const content = readFileSync(path, "utf8");
  for (const pattern of publicExampleDenylist) {
    const match = content.match(pattern);
    if (match) {
      fail(
        `${relative(repoRoot, path)}: public example contains prohibited customer-specific term ${match[0]}`,
      );
    }
  }
}

const markdownFormattingRules = [
  "Do not hard-wrap prose at a fixed column width.",
  "Keep each prose sentence on one physical line. Start a new physical line only at a sentence boundary or where Markdown structure requires it.",
  "Keep each list item and table row on one physical line unless nested content requires multiple lines.",
  "Preserve fenced code, explicit hard breaks, and syntax whose line breaks are meaningful.",
];
const adapterInputBoundaryRules = [
  "`BLOCKED_INPUT`",
  "explicitly approve one bounded search root",
  "Do not search for missing inputs",
  "Do not request broader filesystem permission",
  "feature name, module name, scope key, keyword, or prior project knowledge",
];
const repositoryInstructions = join(repoRoot, "AGENTS.md");
if (existsSync(repositoryInstructions)) {
  validateMarkdownSourceFormatting(
    repositoryInstructions,
    readFileSync(repositoryInstructions, "utf8"),
  );
}
const repositoryTodo = join(repoRoot, "TO-DO.md");
if (existsSync(repositoryTodo)) {
  validateMarkdownSourceFormatting(repositoryTodo, readFileSync(repositoryTodo, "utf8"));
}
for (const adapterInstruction of [
  join(repoRoot, "adapters", "antigravity", "AGENTS.md"),
  join(repoRoot, "adapters", "claude-code", "CLAUDE.md"),
  join(repoRoot, "adapters", "codex", "AGENTS.md"),
  join(repoRoot, "adapters", "gemini-cli", "GEMINI.md"),
]) {
  const content = readFileSync(adapterInstruction, "utf8");
  for (const rule of markdownFormattingRules) {
    if (!content.includes(rule)) {
      fail(`${relative(repoRoot, adapterInstruction)}: Markdown source formatting rule is missing`);
    }
  }
  for (const rule of adapterInputBoundaryRules) {
    if (!content.toLowerCase().includes(rule.toLowerCase())) {
      fail(`${relative(repoRoot, adapterInstruction)}: Input Boundary rule is missing: ${rule}`);
    }
  }
}

const antigravityRulePath = join(
  repoRoot,
  "adapters",
  "antigravity",
  ".agents",
  "rules",
  "tanizy-qc.md",
);
const antigravityRule = readFileSync(antigravityRulePath, "utf8");
for (const rule of ["`BLOCKED_INPUT`", "not a source locator", "request broader filesystem permission"]) {
  if (!antigravityRule.includes(rule)) {
    fail(`${relative(repoRoot, antigravityRulePath)}: Input Boundary rule is missing: ${rule}`);
  }
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
if (installer.includes('skill, "references", "material-paths.md"')) {
  fail("scripts/install.mjs: per-skill artifact contract copies are not allowed");
}
if (!installer.includes('kind: "retire-managed-file"')) {
  fail("scripts/install.mjs: legacy per-skill artifact contract migration is missing");
}

const packageConfig = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
if (packageConfig.scripts?.["pack:check"]?.includes("add package validation here")) {
  fail("package.json: pack:check is still a placeholder");
}

const testCaseSkill = readFileSync(
  join(skillsRoot, "qc-design-test-cases", "SKILL.md"),
  "utf8",
);
for (const requiredMaterial of [
  join(
    skillsRoot,
    "qc-design-viewpoints",
    "references",
    "viewpoint-discovery-guide.md",
  ),
  join(
    skillsRoot,
    "qc-design-test-cases",
    "references",
    "test-design-techniques.md",
  ),
]) {
  if (!existsSync(requiredMaterial)) {
    fail(`${relative(repoRoot, requiredMaterial)}: required phase-owned material is missing`);
  }
}
for (const retiredMaterial of [
  join(repoRoot, "core", "references", "field-validation-checklist.md"),
  join(repoRoot, "core", "references", "ui-component-checklist.md"),
  join(
    skillsRoot,
    "qc-design-viewpoints",
    "references",
    "viewpoint-catalog.md",
  ),
]) {
  if (existsSync(retiredMaterial)) {
    fail(`${relative(repoRoot, retiredMaterial)}: retired discovery material must not be published`);
  }
}
const testDesignTechniquesReference = "references/test-design-techniques.md";
if (!testCaseSkill.includes(`\`${testDesignTechniquesReference}\``)) {
  fail(`qc-design-test-cases: must use the package-managed ${testDesignTechniquesReference}`);
}
for (const discoveryMaterial of [
  "viewpoint-discovery-guide.md",
  "field-validation-checklist.md",
  "ui-component-checklist.md",
]) {
  if (testCaseSkill.includes(discoveryMaterial)) {
    fail(`qc-design-test-cases: discovery material ${discoveryMaterial} belongs to Viewpoint analysis`);
  }
}
const canonicalTestDesignBasisHeader =
  "| Leaf VP ID | Coverage Item | Coverage Target | Denominator or Selection Rule | Test Design Technique | Rationale | TC IDs | Status or Blocked Reason |";
if (
  !testCaseSkill.includes("## 3. Test Design Basis") ||
  !testCaseSkill.includes(canonicalTestDesignBasisHeader)
) {
  fail("qc-design-test-cases: canonical Test Design Basis schema is missing or changed");
}
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

const materialPaths = readFileSync(
  join(repoRoot, "core", "references", "material-paths.md"),
  "utf8",
);
for (const rule of [
  "## Input Boundary and Source Discovery",
  "A feature name, module name, scope key, keyword, or prior project knowledge is not a source locator",
  "stop with `BLOCKED_INPUT` in chat",
  "Do not request broader filesystem permission",
  "A filesystem permission prompt is not a substitute",
  "ask requirement clarification questions in chat",
]) {
  if (!materialPaths.includes(rule)) {
    fail(`core/references/material-paths.md: canonical Input Boundary rule is missing: ${rule}`);
  }
}
const viewpointSkill = readFileSync(
  join(skillsRoot, "qc-design-viewpoints", "SKILL.md"),
  "utf8",
);
const viewpointDiscoveryReference = "references/viewpoint-discovery-guide.md";
if (viewpointSkill.split(viewpointDiscoveryReference).length - 1 !== 1) {
  fail(`qc-design-viewpoints: must use the package-managed ${viewpointDiscoveryReference}`);
}
for (const legacyChecklist of [
  "field-validation-checklist.md",
  "ui-component-checklist.md",
]) {
  if (viewpointSkill.includes(legacyChecklist)) {
    fail(`qc-design-viewpoints: legacy discovery material ${legacyChecklist} is not allowed`);
  }
}
for (const section of [
  "## 3. Discovery Material Manifest",
  "## 5. Test Target Map",
  "## 7. Viewpoint Breakdown",
  "## 8. Discovery Coverage Map",
]) {
  if (!viewpointSkill.includes(section)) {
    fail(`qc-design-viewpoints: locked schema section ${section} is missing`);
  }
}
const canonicalDiscoveryMaterialHeader =
  "| Material | Locator | Package Revision or File Hash | Role |";
if (!viewpointSkill.includes(canonicalDiscoveryMaterialHeader)) {
  fail("qc-design-viewpoints: Discovery Material Manifest revision schema is missing or changed");
}
for (const route of ["GAP_ANALYSIS", "DIRECT_SOURCE_CHECK"]) {
  if (!materialPaths.includes(`\`${route}\``) || !viewpointSkill.includes(`\`${route}\``)) {
    fail(`Viewpoint readiness contract: ${route} must exist in the shared contract and skill`);
  }
}
if (!viewpointSkill.includes("Gap Analysis = NOT_RUN")) {
  fail("qc-design-viewpoints: direct readiness must record Gap Analysis as NOT_RUN");
}
if (viewpointSkill.includes("If gap analysis is missing")) {
  fail("qc-design-viewpoints: Gap Analysis must not remain a mandatory prerequisite");
}
for (const exportSkill of ["qc-export-gherkin", "qc-export-postman"]) {
  const content = readFileSync(join(skillsRoot, exportSkill, "SKILL.md"), "utf8");
  if (content.includes("Matching gap report and OQ ledger")) {
    fail(`${exportSkill}: Gap Report must be conditional on the locked readiness route`);
  }
}

const readme = readFileSync(join(repoRoot, "README.md"), "utf8");
if ((readme.match(/DIRECT_SOURCE_CHECK/g) ?? []).length < 4) {
  fail("README.md: direct readiness routing must be documented in English and Vietnamese");
}
if ((readme.match(/UNSUPPORTED_AUTOMATION_AUTHORING/g) ?? []).length < 2) {
  fail("README.md: Playwright authoring limitation must be documented in English and Vietnamese");
}

const playwrightSkill = readFileSync(
  join(skillsRoot, "qc-run-playwright", "SKILL.md"),
  "utf8",
);
for (const boundary of [
  "INTERACTIVE_EXECUTION_ONLY",
  "UNSUPPORTED_AUTOMATION_AUTHORING",
  "does not generate Playwright source code",
]) {
  if (!playwrightSkill.includes(boundary)) {
    fail(`qc-run-playwright: capability boundary is missing ${boundary}`);
  }
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
  !bugBaseSeed.includes("BUG-CART-001") ||
  !bugBaseSeed.includes("Shopping Cart") ||
  !bugBaseSeed.includes("illustrative only")
) {
  fail("Bug Base: neutral Shopping Cart example is missing or unsafe");
}
if (
  !systemContextSeed.includes("CON-LOGIN-001") ||
  !systemContextSeed.includes("synthetic test accounts") ||
  !systemContextSeed.includes("replace-with-approved-test-configuration-ref") ||
  !systemContextSeed.includes("illustrative only")
) {
  fail("System Context: neutral Login example is missing or unsafe");
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
if (!manualResultSkill.includes("bundled `scripts/manual-results.mjs`")) {
  fail("qc-record-manual-results: bundled multi-format capability routing is missing");
}
if (manualResultSkill.includes("offer CSV or the separate Markdown form")) {
  fail("qc-record-manual-results: XLSX must not silently fall back to Markdown or CSV");
}
for (const script of ["manual-results.mjs", "manual-results-xlsx.mjs", "xlsx-lite.mjs"]) {
  if (!existsSync(join(skillsRoot, "qc-record-manual-results", "scripts", script))) {
    fail(`qc-record-manual-results: bundled script ${script} is missing`);
  }
}
if (!manualResultFormat.includes("Attempt,TCID,TestTitle,TestResult")) {
  fail("qc-record-manual-results: CSV TestTitle scan field is missing");
}
if (!manualResultFormat.includes("| Selected for Run | Attempt | TC ID | Test Title | Test Result |")) {
  fail("qc-record-manual-results: Markdown Test Title scan field is missing");
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
