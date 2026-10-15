#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { columnName, parseWorksheet, readZip, writeZip } from "../core/skills/qc-record-manual-results/scripts/xlsx-lite.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skillScripts = join(repoRoot, "core", "skills", "qc-record-manual-results", "scripts");
const utility = join(skillScripts, "manual-results.mjs");
const xlsxCompatibilityUtility = join(skillScripts, "manual-results-xlsx.mjs");
const temporaryRoot = mkdtempSync(join(tmpdir(), "tanizy-manual-results-test-"));

function run(args, expectedStatus = 0, executable = utility) {
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expectedStatus,
    `Unexpected utility status.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function prepareArgs(source, output) {
  return [
    "prepare",
    "--source", source,
    "--output", output,
    "--run-id", "RUN-20260816-160000",
    "--run-at", "2026-08-16T16:00:00+07:00",
    "--environment", "staging",
    "--build", "build-123",
    "--executor", "QC Tester",
    "--retry-policy", "No retry",
    "--assessment-policy", "Latest completed attempt",
    "--cleanup-plan", "N/A, no test data created",
  ];
}

function replaceInlineCell(xml, reference, value) {
  const pattern = new RegExp(`(<c r="${reference}"[^>]*><is><t(?: [^>]*)?>)([\\s\\S]*?)(<\\/t><\\/is><\\/c>)`);
  assert.match(xml, pattern, `Expected editable cell ${reference}`);
  return xml.replace(pattern, `$1${value}$3`);
}

function completeXlsx(input, output) {
  const files = readZip(input);
  let executionXml = files.get("xl/worksheets/sheet3.xml").toString("utf8");
  executionXml = replaceInlineCell(executionXml, "E2", "PASS");
  executionXml = replaceInlineCell(executionXml, "F2", "Dashboard displayed and session was created.");
  files.set("xl/worksheets/sheet3.xml", Buffer.from(executionXml, "utf8"));
  writeZip([...files].map(([name, data]) => ({ name, data })), output);
}

function parseTestCsv(text) {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\n") {
      record.push(field.replace(/\r$/, ""));
      if (record.some((value) => value !== "")) records.push(record);
      record = [];
      field = "";
    } else field += character;
  }
  return { headers: records[0], rows: records.slice(1) };
}

function serializeTestCsv(headers, rows) {
  const encode = (value) => /[",\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;
  return `${[headers, ...rows].map((row) => row.map(encode).join(",")).join("\r\n")}\r\n`;
}

const caseOutcome = "The Dashboard displays a welcome message and an active session is established.";

try {
  const source = join(temporaryRoot, "login-test-cases.md");
  writeFileSync(
    source,
    `# Test Cases: login

| Scope Key | Scope Code | Artifact Type | Revision | State |
|---|---|---|---:|---|
| login | LOG | Test Cases | 2 | LOCKED |

| TC ID | Module | Risk | Title | Preconditions | Test Data | Steps | Expected Results | Source Trace | VP ID | Priority | Automation Eligibility | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-LOG-001 | Login | High | Valid login | Logged out | active user | 1. Enter email. 2. Enter password. 3. Submit credentials. | ${caseOutcome} | AC-01 | VP-LOG-001 | P1 | UI-AUTO | @Smoke |
| TC-LOG-002 | Login | High | Undefined SSO | SSO contract missing | N/A | 1. Use SSO. | 1. Approved behavior is required. | OQ-LOG-001 | VP-LOG-002 | P1 | NEEDS_SPEC | @SSO |
`,
    "utf8",
  );

  const prepared = {
    xlsx: join(temporaryRoot, "login-manual-results.xlsx"),
    csv: join(temporaryRoot, "login-manual-results.csv"),
    markdown: join(temporaryRoot, "login-manual-results.md"),
  };
  for (const [format, output] of Object.entries(prepared)) {
    const summary = JSON.parse(run(prepareArgs(source, output)).stdout);
    assert.equal(summary.format, format);
    assert.equal(summary.lockedTcCount, 2);
    assert.equal(summary.selectedTcCount, 1);
  }

  const files = readZip(prepared.xlsx);
  for (const entry of [
    "[Content_Types].xml",
    "xl/workbook.xml",
    "xl/styles.xml",
    "xl/worksheets/sheet1.xml",
    "xl/worksheets/sheet2.xml",
    "xl/worksheets/sheet3.xml",
    "xl/worksheets/sheet4.xml",
  ]) assert.ok(files.has(entry), `Missing XLSX entry: ${entry}`);
  const executionXml = files.get("xl/worksheets/sheet3.xml").toString("utf8");
  const executionRows = parseWorksheet(executionXml);
  assert.deepEqual(executionRows[0].slice(0, 6), [
    "Selected for Run", "Attempt", "TC ID", "Test Title", "Test Result", "Actual Result",
  ]);
  assert.equal(executionRows[1][3], "Valid login");
  assert.equal(executionRows[1][0], "TRUE");
  assert.equal(executionRows[2][0], "FALSE");
  assert.equal(executionRows[1][executionRows[0].indexOf("VP ID")], "VP-LOG-001");
  assert.equal(executionRows[1][executionRows[0].indexOf("Source Trace")], "AC-01");
  assert.equal(executionRows[1][executionRows[0].indexOf("Automation Eligibility")], "UI-AUTO");
  assert.equal(executionRows[1][executionRows[0].indexOf("Expected Results")], caseOutcome);
  assert.match(executionXml, /sqref="E2:E3"/);
  assert.match(executionXml, /E2=&quot;PASS&quot;/);

  const csvText = readFileSync(prepared.csv, "utf8");
  assert.match(csvText, /TCID,TestTitle,TestResult/);
  assert.match(csvText, /TC-LOG-001,Valid login,/);
  assert.match(csvText, /ExpectedResults,VPID,SourceTrace,AutomationEligibility,Tags/);
  assert.equal(parseTestCsv(csvText).rows[0][parseTestCsv(csvText).headers.indexOf("ExpectedResults")], caseOutcome);
  assert.match(csvText, /"N\/A, no test data created"/);
  const markdownText = readFileSync(prepared.markdown, "utf8");
  assert.match(markdownText, /\| TC ID \| Test Title \| Test Result \|/);
  assert.match(markdownText, /\| TC-LOG-001 \| Valid login \|/);
  assert.match(markdownText, /\| Expected Results \| VP ID \| Source Trace \| Automation Eligibility \| Tags \|/);
  assert.ok(markdownText.includes(`| ${caseOutcome} | VP-LOG-001 | AC-01 | UI-AUTO | @Smoke |`));

  for (const [format, input] of Object.entries(prepared)) {
    const preview = JSON.parse(run(["import", "--source", source, "--input", input]).stdout);
    assert.equal(preview.valid, true);
    assert.equal(preview.format, format);
    assert.equal(preview.summary.selectedRows, 1);
    assert.equal(preview.summary.blankSelectedRows, 1);
    assert.equal(preview.summary.acceptedRows, 0);
  }

  const completedXlsx = join(temporaryRoot, "login-completed.xlsx");
  completeXlsx(prepared.xlsx, completedXlsx);

  const parsedCsv = parseTestCsv(csvText);
  const csvResultIndex = parsedCsv.headers.indexOf("TestResult");
  const csvActualIndex = parsedCsv.headers.indexOf("ActualResult");
  parsedCsv.rows[0][csvResultIndex] = "PASS";
  parsedCsv.rows[0][csvActualIndex] = "Dashboard displayed and session was created.";
  const completedCsv = join(temporaryRoot, "login-completed.csv");
  writeFileSync(completedCsv, serializeTestCsv(parsedCsv.headers, parsedCsv.rows), "utf8");

  const completedMarkdown = join(temporaryRoot, "login-completed.md");
  writeFileSync(
    completedMarkdown,
    markdownText.replace(
      "| TRUE | 1 | TC-LOG-001 | Valid login |  |  |",
      "| TRUE | 1 | TC-LOG-001 | Valid login | PASS | Dashboard displayed and session was created. |",
    ),
    "utf8",
  );

  for (const [format, input] of Object.entries({
    xlsx: completedXlsx,
    csv: completedCsv,
    markdown: completedMarkdown,
  })) {
    const preview = JSON.parse(run(["import", "--source", source, "--input", input]).stdout);
    assert.equal(preview.valid, true);
    assert.equal(preview.format, format);
    assert.equal(preview.summary.acceptedRows, 1);
    assert.equal(preview.summary.resultCounts.PASS, 1);
    assert.equal(preview.rows[0].testTitle, "Valid login");
    assert.equal(preview.rows[0].expectedResult, caseOutcome);
    assert.equal(preview.rows[0].testedBy, "QC Tester");
  }

  const compatibilityPreview = JSON.parse(run(
    ["import", "--source", source, "--workbook", completedXlsx],
    0,
    xlsxCompatibilityUtility,
  ).stdout);
  assert.equal(compatibilityPreview.valid, true);
  assert.equal(compatibilityPreview.format, "xlsx");

  const mismatchedCsv = join(temporaryRoot, "login-title-mismatch.csv");
  const mismatchedRows = parsedCsv.rows.map((row) => [...row]);
  mismatchedRows[0][parsedCsv.headers.indexOf("TestTitle")] = "Changed title";
  mismatchedRows[0][parsedCsv.headers.indexOf("SourceTrace")] = "AC-99";
  writeFileSync(mismatchedCsv, serializeTestCsv(parsedCsv.headers, mismatchedRows), "utf8");
  const mismatchPreview = JSON.parse(run(
    ["import", "--source", source, "--input", mismatchedCsv],
    2,
  ).stdout);
  assert.equal(mismatchPreview.valid, false);
  assert.equal(mismatchPreview.summary.validationCounts.changedLockedFields, 2);

  const droppedConditionCsv = join(temporaryRoot, "login-dropped-outcome-condition.csv");
  const droppedConditionRows = parsedCsv.rows.map((row) => [...row]);
  droppedConditionRows[0][parsedCsv.headers.indexOf("ExpectedResults")] = "The Dashboard displays a welcome message.";
  writeFileSync(droppedConditionCsv, serializeTestCsv(parsedCsv.headers, droppedConditionRows));
  const droppedConditionPreview = JSON.parse(run(["import", "--source", source, "--input", droppedConditionCsv], 2).stdout);
  assert.equal(droppedConditionPreview.valid, false);
  assert.equal(droppedConditionPreview.summary.validationCounts.changedLockedFields, 1);

  const mismatchedXlsx = join(temporaryRoot, "login-source-trace-mismatch.xlsx");
  const mismatchedXlsxFiles = readZip(prepared.xlsx);
  let mismatchedExecutionXml = mismatchedXlsxFiles.get("xl/worksheets/sheet3.xml").toString("utf8");
  const sourceTraceColumn = columnName(executionRows[0].indexOf("Source Trace"));
  mismatchedExecutionXml = replaceInlineCell(mismatchedExecutionXml, `${sourceTraceColumn}2`, "AC-99");
  mismatchedXlsxFiles.set("xl/worksheets/sheet3.xml", Buffer.from(mismatchedExecutionXml, "utf8"));
  writeZip([...mismatchedXlsxFiles].map(([name, data]) => ({ name, data })), mismatchedXlsx);
  const mismatchedXlsxPreview = JSON.parse(run(
    ["import", "--source", source, "--input", mismatchedXlsx],
    2,
  ).stdout);
  assert.equal(mismatchedXlsxPreview.summary.validationCounts.changedLockedFields, 1);

  const mismatchedMarkdown = join(temporaryRoot, "login-source-trace-mismatch.md");
  writeFileSync(
    mismatchedMarkdown,
    markdownText.replace("| VP-LOG-001 | AC-01 | UI-AUTO |", "| VP-LOG-001 | AC-99 | UI-AUTO |"),
    "utf8",
  );
  const mismatchedMarkdownPreview = JSON.parse(run(
    ["import", "--source", source, "--input", mismatchedMarkdown],
    2,
  ).stdout);
  assert.equal(mismatchedMarkdownPreview.summary.validationCounts.changedLockedFields, 1);

  const legacyCsv = join(temporaryRoot, "login-legacy.csv");
  const titleIndex = parsedCsv.headers.indexOf("TestTitle");
  const legacyHeaders = parsedCsv.headers.filter((_, index) => index !== titleIndex);
  const legacyRows = parsedCsv.rows.map((row) => row.filter((_, index) => index !== titleIndex));
  writeFileSync(legacyCsv, serializeTestCsv(legacyHeaders, legacyRows), "utf8");
  const legacyPreview = JSON.parse(run(["import", "--source", source, "--input", legacyCsv]).stdout);
  assert.equal(legacyPreview.valid, true);
  assert.equal(legacyPreview.rows[0].testTitle, "Valid login");
  assert.ok(legacyPreview.warnings.some((warning) => warning.includes("no TestTitle")));

  // The optional presentation and legacy numbered expectations must survive
  // preparation/import unchanged, independently of the default outcome format.
  const checkpointOutcome = "1. The entered email remains visible. 3. The Dashboard displays and an active session is established.";
  const checkpointSource = join(temporaryRoot, "login-checkpoint-cases.md");
  writeFileSync(checkpointSource, readFileSync(source, "utf8").replace(caseOutcome, checkpointOutcome));
  for (const extension of ["xlsx", "csv", "md"]) {
    const output = join(temporaryRoot, `checkpoint-run.${extension}`);
    run(prepareArgs(checkpointSource, output));
    let completed;
    if (extension === "xlsx") {
      const checkpointRows = parseWorksheet(readZip(output).get("xl/worksheets/sheet3.xml").toString("utf8"));
      assert.equal(checkpointRows[1][checkpointRows[0].indexOf("Expected Results")], checkpointOutcome);
      completed = join(temporaryRoot, "checkpoint-completed.xlsx");
      completeXlsx(output, completed);
    } else if (extension === "csv") {
      const parsed = parseTestCsv(readFileSync(output, "utf8"));
      assert.equal(parsed.rows[0][parsed.headers.indexOf("ExpectedResults")], checkpointOutcome);
      parsed.rows[0][parsed.headers.indexOf("TestResult")] = "PASS";
      parsed.rows[0][parsed.headers.indexOf("ActualResult")] = "Synthetic checkpoint result.";
      completed = join(temporaryRoot, "checkpoint-completed.csv");
      writeFileSync(completed, serializeTestCsv(parsed.headers, parsed.rows));
    } else {
      const text = readFileSync(output, "utf8");
      assert.ok(text.includes(`| ${checkpointOutcome} |`));
      completed = join(temporaryRoot, "checkpoint-completed.md");
      writeFileSync(completed, text.replace("| TRUE | 1 | TC-LOG-001 | Valid login |  |  |", "| TRUE | 1 | TC-LOG-001 | Valid login | PASS | Synthetic checkpoint result. |"));
    }
    const checkpointPreview = JSON.parse(run(["import", "--source", checkpointSource, "--input", completed]).stdout);
    assert.equal(checkpointPreview.valid, true);
    assert.equal(checkpointPreview.rows[0].expectedResult, checkpointOutcome);
  }

  console.log("Manual result tests passed: XLSX, CSV, and Markdown preserve compound case outcomes and optional checkpoints; changed fields, legacy import, and XLSX compatibility are validated.");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
