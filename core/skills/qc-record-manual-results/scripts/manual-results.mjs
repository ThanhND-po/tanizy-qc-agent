#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  columnName,
  decodeXml,
  escapeXml,
  parseWorksheet,
  readZip,
  sharedStringsFromXml,
  worksheetXml,
  writeZip,
} from "./xlsx-lite.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const resultValues = ["PASS", "FAIL", "BLOCKED", "SKIP", "ERROR"];
const designHeaders = [
  "TC ID",
  "Module",
  "Risk",
  "Priority",
  "Title",
  "Preconditions",
  "Test Data",
  "Steps",
  "Expected Results",
  "VP ID",
  "Source Trace",
  "Automation Eligibility",
  "Tags",
];
const executionHeaders = [
  "Selected for Run",
  "Attempt",
  "TC ID",
  "Test Title",
  "Test Result",
  "Actual Result",
  "Tested By",
  "Tested At",
  "Evidence",
  "Defect",
  "Cleanup",
  "Note",
];
const workbookHeaders = [
  ...executionHeaders,
  ...designHeaders.filter((header) => !["TC ID", "Title"].includes(header)),
];
const csvHeaders = [
  "ScopeKey",
  "ScopeCode",
  "RunID",
  "SourceTestCases",
  "SourceRevision",
  "PreparedAt",
  "RunAt",
  "Environment",
  "ApplicationBuild",
  "ExecutionMethod",
  "Executor",
  "RetryPolicy",
  "AssessmentPolicy",
  "CleanupPlan",
  "EvidencePolicy",
  "SourceIntegrity",
  "SelectedForRun",
  "Attempt",
  "TCID",
  "TestTitle",
  "TestResult",
  "ActualResult",
  "TestedBy",
  "TestedAt",
  "Evidence",
  "Defect",
  "Cleanup",
  "Note",
];

function fail(message, exitCode = 1) {
  console.error(`Error: ${message}`);
  process.exit(exitCode);
}

function usage() {
  console.log(`Tanizy manual QC result utility

Usage:
  node ${scriptPath} prepare --source <locked-test-cases.md> --output <manual-results.xlsx|csv|md> --run-id <RUN-ID> [options]
  node ${scriptPath} import --source <locked-test-cases.md> --input <completed.xlsx|csv|md> [--output <preview.json>]

Prepare options:
  --format <xlsx|csv|markdown>                    Optional, otherwise inferred from output
  --selected <all-unblocked|all|TC-001,TC-002>  Default: all-unblocked
  --environment <value>                           Optional workbook prefill
  --build <value>                                 Optional workbook prefill
  --executor <value>                              Optional workbook prefill
  --run-at <ISO-8601|UNKNOWN>                     Optional workbook prefill
  --retry-policy <value>                          Optional workbook prefill
  --assessment-policy <value>                     Optional workbook prefill
  --cleanup-plan <value>                          Optional workbook prefill
  --evidence-policy <OPTIONAL|required-rule>      Default: OPTIONAL

Import compatibility:
  --workbook <completed.xlsx>                    Alias for --input

The utility uses only Node.js built-in modules. It does not require a native
spreadsheet skill, Microsoft Excel, Python, or a network-installed library.`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h") return { command: "help" };
  if (!new Set(["prepare", "import"]).has(command)) fail(`Unknown command: ${command}`);
  const args = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) fail(`Unexpected argument: ${item}`);
    const key = item.slice(2).replaceAll("-", "_");
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) fail(`Missing value for ${item}.`);
    args[key] = value;
    index += 1;
  }
  return args;
}

function splitMarkdownRow(line) {
  const content = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let current = "";
  let escaped = false;
  for (const character of content) {
    if (escaped) {
      current += character;
      escaped = false;
    } else if (character === "\\") {
      current += character;
      escaped = true;
    } else if (character === "|") {
      cells.push(current.trim());
      current = "";
    } else current += character;
  }
  cells.push(current.trim());
  return cells;
}

function findMarkdownTable(lines, requiredHeaders) {
  for (let index = 0; index < lines.length - 2; index += 1) {
    if (!lines[index].trim().startsWith("|")) continue;
    const headers = splitMarkdownRow(lines[index]);
    if (!requiredHeaders.every((header) => headers.includes(header))) continue;
    const rows = [];
    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const line = lines[rowIndex];
      if (!line.trim().startsWith("|")) break;
      const values = splitMarkdownRow(line);
      const row = Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex] ?? ""]));
      rows.push(row);
    }
    return { headers, rows };
  }
  return null;
}

function cleanMarkdown(value) {
  return String(value ?? "")
    .replace(/<a\b[^>]*><\/a>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\\|/g, "|")
    .trim();
}

function sourceHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function parseTestCases(path) {
  if (!existsSync(path)) fail(`Source Test Cases file does not exist: ${path}`);
  const markdown = readFileSync(path, "utf8");
  const lines = markdown.split(/\r?\n/);
  const artifact = findMarkdownTable(lines, ["Scope Key", "Scope Code", "Revision", "State"]);
  if (!artifact?.rows.length) fail("Source Test Cases artifact header was not found.");
  const metadata = Object.fromEntries(Object.entries(artifact.rows[0]).map(([key, value]) => [key, cleanMarkdown(value)]));
  if (metadata.State !== "LOCKED") fail(`Source Test Cases must be LOCKED, found: ${metadata.State || "blank"}.`);
  const table = findMarkdownTable(lines, designHeaders);
  if (!table?.rows.length) fail("Canonical Test Case table was not found or has no rows.");
  const ids = new Set();
  const cases = table.rows.map((sourceRow) => {
    const row = Object.fromEntries(designHeaders.map((header) => [header, cleanMarkdown(sourceRow[header])]));
    if (!row["TC ID"]) fail("A Test Case row has a blank TC ID.");
    if (ids.has(row["TC ID"])) fail(`Duplicate TC ID in source: ${row["TC ID"]}.`);
    ids.add(row["TC ID"]);
    return row;
  });
  return {
    path: resolve(path),
    hash: sourceHash(path),
    scopeKey: metadata["Scope Key"],
    scopeCode: metadata["Scope Code"],
    revision: metadata.Revision,
    state: metadata.State,
    cases,
  };
}

function cell(value, style = 0, type = "string") {
  return { value, style, type };
}

function formula(value, style = 0) {
  return { formula: value, value: 0, style };
}

function selectCases(cases, selection) {
  if (!selection || selection === "all-unblocked") {
    return new Set(cases.filter((item) => item["Automation Eligibility"] !== "NEEDS_SPEC").map((item) => item["TC ID"]));
  }
  if (selection === "all") return new Set(cases.map((item) => item["TC ID"]));
  const requested = selection.split(",").map((item) => item.trim()).filter(Boolean);
  const available = new Set(cases.map((item) => item["TC ID"]));
  const unknown = requested.filter((id) => !available.has(id));
  if (unknown.length) fail(`Unknown selected TC IDs: ${unknown.join(", ")}.`);
  return new Set(requested);
}

function validateRunId(runId) {
  if (!/^RUN-\d{8}-\d{6}(?:-\d{2})?$/.test(runId)) {
    fail(`Run ID must match RUN-<YYYYMMDD>-<HHMMSS>[-NN], found: ${runId}.`);
  }
}

function normalizeFormat(value) {
  const format = String(value ?? "").toLowerCase();
  if (format === "md") return "markdown";
  if (["xlsx", "csv", "markdown"].includes(format)) return format;
  return null;
}

function formatFromPath(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".xlsx") return "xlsx";
  if (extension === ".csv") return "csv";
  if ([".md", ".markdown"].includes(extension)) return "markdown";
  return null;
}

function resolveFormat(path, requested) {
  const explicit = requested ? normalizeFormat(requested) : null;
  if (requested && !explicit) fail(`Unsupported format: ${requested}. Use xlsx, csv, or markdown.`);
  const inferred = formatFromPath(path);
  if (!explicit && !inferred) fail(`Cannot infer format from path: ${path}. Use --format xlsx, csv, or markdown.`);
  if (explicit && inferred && explicit !== inferred) {
    fail(`Format ${explicit} does not match output extension ${extname(path)}.`);
  }
  return explicit ?? inferred;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3"><font><sz val="11"/><name val="Aptos"/><family val="2"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos Display"/></font><font><b/><color rgb="FF203864"/><sz val="16"/><name val="Aptos Display"/></font></fonts>
  <fills count="8"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7E6E6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE2F0D9"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCE4D6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9EAF7"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9E1F2"/></left><right style="thin"><color rgb="FFD9E1F2"/></right><top style="thin"><color rgb="FFD9E1F2"/></top><bottom style="thin"><color rgb="FFD9E1F2"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="1" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="5"><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFC6EFCE"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFFFEB9C"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFDDEBF7"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><fill><patternFill patternType="solid"><fgColor rgb="FFF4B084"/><bgColor indexed="64"/></patternFill></fill></dxf></dxfs>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
}

function buildRunModel(source, args) {
  const selected = selectCases(source.cases, args.selected);
  const preparedAt = new Date().toISOString();
  const sourceIdentity = `${source.path}; Revision ${source.revision}; State ${source.state}`;
  const metadataPairs = [
    ["Scope Key", source.scopeKey, "Locked"],
    ["Scope Code", source.scopeCode, "Locked"],
    ["Run ID", args.run_id, "Reserved for this workbook"],
    ["Source Test Cases", sourceIdentity, "Locked"],
    ["Source Revision", source.revision, "Locked"],
    ["Prepared At", preparedAt, "Generated automatically"],
    ["Run At", args.run_at ?? "", "Required at IMPORT, ISO-8601 or approved UNKNOWN"],
    ["Environment", args.environment ?? "", "Required at IMPORT"],
    ["Application Build", args.build ?? "", "Required at IMPORT, exact value or UNKNOWN"],
    ["Execution Method", "MANUAL", "Locked"],
    ["Executor", args.executor ?? "", "Required at IMPORT"],
    ["Recorded By", "", "Filled during IMPORT"],
    ["Retry Policy", args.retry_policy ?? "", "Required at IMPORT"],
    ["Assessment Policy", args.assessment_policy ?? "", "Required at IMPORT"],
    ["Cleanup Plan", args.cleanup_plan ?? "", "Required at IMPORT"],
    ["Evidence Policy", args.evidence_policy ?? "OPTIONAL", "Evidence remains optional unless this rule says otherwise"],
    ["Result Source", "", "Completed workbook locator, filled during IMPORT"],
    ["Source Integrity", `SHA-256 ${source.hash}`, "Locked"],
  ];
  const metadata = Object.fromEntries(metadataPairs.map(([field, value]) => [field, value]));
  const rows = source.cases.map((testCase) => ({
    "Selected for Run": selected.has(testCase["TC ID"]) ? "TRUE" : "FALSE",
    Attempt: "1",
    "TC ID": testCase["TC ID"],
    "Test Title": testCase.Title,
    "Test Result": "",
    "Actual Result": "",
    "Tested By": "",
    "Tested At": "",
    Evidence: "",
    Defect: "",
    Cleanup: "",
    Note: "",
    ...testCase,
  }));
  return { selected, selectedCount: selected.size, preparedAt, metadataPairs, metadata, rows };
}

function buildWorkbook(source, args) {
  const model = buildRunModel(source, args);
  const { metadataPairs } = model;

  const instructions = [
    [cell("Manual QC Run Workbook", 4)],
    [cell("Purpose", 5), cell("Enter manual Test Results here, then return this XLSX for IMPORT. Creating this workbook does not create an execution Run.", 8)],
    [cell("Editable fields", 5), cell(executionHeaders.filter((header) => !["TC ID", "Test Title"].includes(header)).join(", "), 2)],
    [cell("Locked context", 5), cell(["TC ID", "Test Title", ...designHeaders.filter((header) => !["TC ID", "Title"].includes(header))].join(", "), 3)],
    [cell("Result values", 5), cell(resultValues.join(", "), 8)],
    [cell("Blank Result", 5), cell("No attempt is imported. Blank is never converted to SKIP, PASS, or NOT_RUN.", 8)],
    [cell("Actual Result", 5), cell("Required for every nonblank Test Result. For BLOCKED, SKIP, or ERROR, enter the reason.", 8)],
    [cell("Evidence", 5), cell(`Policy: ${args.evidence_policy ?? "OPTIONAL"}. Evidence may be blank unless an approved rule explicitly requires it.`, 8)],
    [cell("Retry", 5), cell("Duplicate the Test Case row and increment Attempt. Do not overwrite a prior completed attempt.", 8)],
    [cell("Selection", 5), cell("Selected for Run controls planned scope. Automation Eligibility does not prevent manual execution. NEEDS_SPEC is unselected by default.", 8)],
    [cell("Import", 5), cell("Run the bundled utility in IMPORT mode. The importer revalidates IDs, source integrity, metadata, Results, and design context.", 8)],
  ];
  const metadataRows = [
    [cell("Field", 1), cell("Value", 1), cell("Rule", 1)],
    ...metadataPairs.map(([field, value, rule]) => [cell(field, 3), cell(value, ["Run At", "Environment", "Application Build", "Executor", "Retry Policy", "Assessment Policy", "Cleanup Plan", "Evidence Policy"].includes(field) ? 2 : 3), cell(rule, 8)]),
  ];
  const executionRows = [
    workbookHeaders.map((header, index) => cell(header, index < executionHeaders.length ? 1 : 5)),
    ...model.rows.map((values) => workbookHeaders.map((header, index) => cell(
      values[header],
      index < executionHeaders.length && !["TC ID", "Test Title"].includes(header) ? 2 : 3,
      header === "Attempt" ? "number" : "string",
    ))),
  ];
  const lastExecutionRow = executionRows.length;
  const resultColumn = columnName(workbookHeaders.indexOf("Test Result"));
  const selectedColumn = columnName(workbookHeaders.indexOf("Selected for Run"));
  const actualColumn = columnName(workbookHeaders.indexOf("Actual Result"));
  const tcColumn = columnName(workbookHeaders.indexOf("TC ID"));
  const attemptColumn = columnName(workbookHeaders.indexOf("Attempt"));
  const summaryMetrics = [
    ["Locked TC count", source.cases.length, "Source Test Cases"],
    ["Selected Run scope count", `COUNTIF('Test Execution'!${selectedColumn}2:${selectedColumn}${lastExecutionRow},\"TRUE\")`, "Selected for Run = TRUE"],
    ["Blank Result count", `COUNTIFS('Test Execution'!${selectedColumn}2:${selectedColumn}${lastExecutionRow},\"TRUE\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"\")`, "Within selected scope"],
    ...resultValues.map((result) => [`${result} count`, `COUNTIF('Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"${result}\")`, "All entered rows"]),
    ["Invalid Result count", `COUNTIFS('Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>PASS\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>FAIL\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>BLOCKED\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>SKIP\",'Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>ERROR\")`, "Must be zero"],
    ["Missing Actual Result count", `COUNTIFS('Test Execution'!${resultColumn}2:${resultColumn}${lastExecutionRow},\"<>\",'Test Execution'!${actualColumn}2:${actualColumn}${lastExecutionRow},\"\")`, "Must be zero"],
    ["Duplicate TC and Attempt count", `SUMPRODUCT((COUNTIFS('Test Execution'!${tcColumn}2:${tcColumn}${lastExecutionRow},'Test Execution'!${tcColumn}2:${tcColumn}${lastExecutionRow},'Test Execution'!${attemptColumn}2:${attemptColumn}${lastExecutionRow},'Test Execution'!${attemptColumn}2:${attemptColumn}${lastExecutionRow})>1)*1)`, "Must be zero"],
  ];
  const summaryRows = [
    [cell("Validation Summary", 4)],
    [cell("Metric", 1), cell("Value", 1), cell("Rule", 1)],
    ...summaryMetrics.map(([name, value, rule]) => [cell(name, 3), typeof value === "number" ? cell(value, 8, "number") : formula(value, 8), cell(rule, 8)]),
    [],
    [cell("Authoritative validation", 5), cell("Workbook formulas are guidance. IMPORT recalculates validation from cell values.", 8)],
  ];

  const sheets = [
    {
      name: "Instructions",
      xml: worksheetXml({ rows: instructions, widths: [24, 100], freeze: { rows: 1, columns: 0 } }),
    },
    {
      name: "Run Metadata",
      xml: worksheetXml({ rows: metadataRows, widths: [24, 80, 56], freeze: { rows: 1, columns: 1 }, autoFilter: `A1:C${metadataRows.length}` }),
    },
    {
      name: "Test Execution",
      xml: worksheetXml({
        rows: executionRows,
        widths: [15, 9, 18, 42, 15, 36, 18, 23, 30, 24, 26, 28, 24, 12, 10, 38, 32, 50, 50, 18, 42, 22, 24],
        freeze: { rows: 1, columns: 3 },
        autoFilter: `A1:${columnName(workbookHeaders.length - 1)}${lastExecutionRow}`,
        dataValidations: [
          { type: "list", range: `${selectedColumn}2:${selectedColumn}${lastExecutionRow}`, formula1: '"TRUE,FALSE"', error: "Use TRUE or FALSE." },
          { type: "whole", range: `${attemptColumn}2:${attemptColumn}${lastExecutionRow}`, formula1: "1", formula2: "999", error: "Attempt must be a positive integer." },
          { type: "list", range: `${resultColumn}2:${resultColumn}${lastExecutionRow}`, formula1: `"${resultValues.join(",")}"`, error: `Use ${resultValues.join(", ")} or blank.` },
        ],
        conditionalFormatting: resultValues.map((result, index) => ({
          range: `${resultColumn}2:${resultColumn}${lastExecutionRow}`,
          formula: `${resultColumn}2=\"${result}\"`,
          dxfId: index,
          priority: index + 1,
        })),
      }),
    },
    {
      name: "Validation Summary",
      xml: worksheetXml({ rows: summaryRows, widths: [34, 20, 54], freeze: { rows: 2, columns: 0 } }),
    },
  ];
  return { sheets, selectedCount: model.selectedCount, preparedAt: model.preparedAt };
}

function packageWorkbook(workbook, outputPath) {
  const sheetOverrides = workbook.sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  const sheetDefinitions = workbook.sheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
  const sheetRelations = workbook.sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
  const entries = [
    { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetOverrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
    { name: "docProps/core.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Tanizy QC Agent</dc:creator><cp:lastModifiedBy>Tanizy QC Agent</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>` },
    { name: "docProps/app.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Tanizy QC Agent</Application></Properties>` },
    { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheetDefinitions}</sheets><calcPr calcId="191029" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelations}<Relationship Id="rId${workbook.sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: "xl/styles.xml", data: stylesXml() },
    ...workbook.sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: sheet.xml })),
  ];
  mkdirSync(dirname(outputPath), { recursive: true });
  writeZip(entries, outputPath);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsv(text) {
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
  if (quoted) fail("Invalid CSV: unterminated quoted field.");
  record.push(field.replace(/\r$/, ""));
  if (record.some((value) => value !== "")) records.push(record);
  return records;
}

function csvRowFromModel(model, row) {
  return {
    ScopeKey: model.metadata["Scope Key"],
    ScopeCode: model.metadata["Scope Code"],
    RunID: model.metadata["Run ID"],
    SourceTestCases: model.metadata["Source Test Cases"],
    SourceRevision: model.metadata["Source Revision"],
    PreparedAt: model.metadata["Prepared At"],
    RunAt: model.metadata["Run At"],
    Environment: model.metadata.Environment,
    ApplicationBuild: model.metadata["Application Build"],
    ExecutionMethod: model.metadata["Execution Method"],
    Executor: model.metadata.Executor,
    RetryPolicy: model.metadata["Retry Policy"],
    AssessmentPolicy: model.metadata["Assessment Policy"],
    CleanupPlan: model.metadata["Cleanup Plan"],
    EvidencePolicy: model.metadata["Evidence Policy"],
    SourceIntegrity: model.metadata["Source Integrity"],
    SelectedForRun: row["Selected for Run"],
    Attempt: row.Attempt,
    TCID: row["TC ID"],
    TestTitle: row["Test Title"],
    TestResult: row["Test Result"],
    ActualResult: row["Actual Result"],
    TestedBy: row["Tested By"],
    TestedAt: row["Tested At"],
    Evidence: row.Evidence,
    Defect: row.Defect,
    Cleanup: row.Cleanup,
    Note: row.Note,
  };
}

function buildCsv(source, args) {
  const model = buildRunModel(source, args);
  const lines = [csvHeaders.join(",")];
  for (const row of model.rows) {
    const values = csvRowFromModel(model, row);
    lines.push(csvHeaders.map((header) => csvCell(values[header])).join(","));
  }
  return { content: `${lines.join("\r\n")}\r\n`, selectedCount: model.selectedCount, preparedAt: model.preparedAt };
}

function markdownCell(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, "<br>");
}

function markdownTable(headers, rows) {
  const header = `| ${headers.map(markdownCell).join(" | ")} |`;
  const separator = `|${headers.map((item) => item === "Attempt" ? "---:" : "---").join("|")}|`;
  const body = rows.map((row) => `| ${headers.map((item) => markdownCell(row[item])).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}

function buildMarkdown(source, args) {
  const model = buildRunModel(source, args);
  const headers = executionHeaders;
  const metadataRows = model.metadataPairs.map(([field, value]) => ({ Field: field, Value: value }));
  const content = `# Manual QC Results: ${source.scopeKey}

## Run Metadata

${markdownTable(["Field", "Value"], metadataRows)}

## Test Execution

Locked design context remains in ${markdownCell(source.path)}. Test Title is copied from the locked Test Cases for scanability and is not editable.

${markdownTable(headers, model.rows)}
`;
  return { content, selectedCount: model.selectedCount, preparedAt: model.preparedAt };
}

function writeTextArtifact(outputPath, artifact) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, artifact.content, "utf8");
}

function readWorkbook(path) {
  if (!existsSync(path)) fail(`Workbook does not exist: ${path}`);
  const files = readZip(path);
  const workbookXml = files.get("xl/workbook.xml")?.toString("utf8");
  const relsXml = files.get("xl/_rels/workbook.xml.rels")?.toString("utf8");
  if (!workbookXml || !relsXml) fail("Invalid XLSX: workbook metadata is missing.");
  const relationships = new Map(
    [...relsXml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g)].map((match) => [match[1], match[2]]),
  );
  const sharedStrings = sharedStringsFromXml(files.get("xl/sharedStrings.xml")?.toString("utf8"));
  const sheets = new Map();
  for (const match of workbookXml.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/>/g)) {
    const name = decodeXml(match[1]);
    const target = relationships.get(match[2]);
    if (!target) continue;
    const normalizedTarget = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
    const data = files.get(normalizedTarget);
    if (data) sheets.set(name, parseWorksheet(data.toString("utf8"), sharedStrings));
  }
  return sheets;
}

function rowsToObjects(rows) {
  const headers = (rows[0] ?? []).map((value) => String(value ?? "").trim());
  const objects = rows.slice(1).filter((row) => row?.some((value) => String(value ?? "").trim())).map((row, rowOffset) => ({
      __row: rowOffset + 2,
      ...Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()])),
    }));
  return { headers, rows: objects };
}

function metadataFromRows(rows) {
  const result = {};
  for (const row of rows.slice(1)) {
    const field = String(row?.[0] ?? "").trim();
    if (field) result[field] = String(row?.[1] ?? "").trim();
  }
  return result;
}

function importXlsx(source, inputPath) {
  const sheets = readWorkbook(inputPath);
  const missingSheets = ["Instructions", "Run Metadata", "Test Execution", "Validation Summary"].filter((name) => !sheets.has(name));
  if (missingSheets.length) fail(`Workbook is missing required sheets: ${missingSheets.join(", ")}.`);
  const metadata = metadataFromRows(sheets.get("Run Metadata"));
  const parsed = rowsToObjects(sheets.get("Test Execution"));
  const warnings = [];
  let titleProvided = parsed.headers.includes("Test Title");
  if (!titleProvided && parsed.headers.includes("Title")) {
    for (const row of parsed.rows) row["Test Title"] = row.Title;
    titleProvided = true;
    warnings.push("Legacy XLSX uses Title instead of Test Title; the importer mapped it to the locked Test Case title.");
  } else if (!titleProvided) {
    warnings.push("Legacy XLSX has no Test Title; titles were derived from the locked Test Cases.");
  }
  const lockedFields = [
    ...(titleProvided ? [["Test Title", "Title"]] : []),
    ...designHeaders
      .filter((header) => !["TC ID", "Title"].includes(header) && parsed.headers.includes(header))
      .map((header) => [header, header]),
  ];
  return validateImport(source, inputPath, "xlsx", metadata, parsed.rows, lockedFields, warnings, []);
}

function metadataFromCsv(row) {
  return {
    "Scope Key": row.ScopeKey,
    "Scope Code": row.ScopeCode,
    "Run ID": row.RunID,
    "Source Test Cases": row.SourceTestCases,
    "Source Revision": row.SourceRevision,
    "Prepared At": row.PreparedAt,
    "Run At": row.RunAt,
    Environment: row.Environment,
    "Application Build": row.ApplicationBuild,
    "Execution Method": row.ExecutionMethod,
    Executor: row.Executor,
    "Retry Policy": row.RetryPolicy,
    "Assessment Policy": row.AssessmentPolicy,
    "Cleanup Plan": row.CleanupPlan,
    "Evidence Policy": row.EvidencePolicy,
    "Source Integrity": row.SourceIntegrity,
  };
}

function importCsv(source, inputPath) {
  const records = parseCsv(readFileSync(inputPath, "utf8"));
  if (records.length < 2) fail("CSV must include a header and at least one Test Case row.");
  const headers = records[0].map((header) => header.trim());
  headers[0] = headers[0].replace(/^\uFEFF/, "");
  for (const required of ["RunID", "Attempt", "TCID", "TestResult"]) {
    if (!headers.includes(required)) fail(`CSV is missing required header: ${required}.`);
  }
  const rawRows = records.slice(1).map((record, index) => ({
    __row: index + 2,
    ...Object.fromEntries(headers.map((header, columnIndex) => [header, String(record[columnIndex] ?? "").trim()])),
  }));
  const metadata = metadataFromCsv(rawRows[0]);
  const warnings = [];
  const titleProvided = headers.includes("TestTitle");
  if (!titleProvided) warnings.push("Legacy CSV has no TestTitle; titles were derived from the locked Test Cases.");
  if (!headers.includes("SelectedForRun")) {
    warnings.push("Legacy CSV has no SelectedForRun; every row was treated as selected.");
  }
  const metadataErrors = [];
  const repeatedFields = [
    "ScopeKey", "ScopeCode", "RunID", "SourceTestCases", "SourceRevision",
    "RunAt", "Environment", "ApplicationBuild", "ExecutionMethod", "Executor",
    "RetryPolicy", "AssessmentPolicy", "CleanupPlan", "EvidencePolicy", "SourceIntegrity",
  ];
  for (const row of rawRows.slice(1)) {
    for (const field of repeatedFields.filter((item) => headers.includes(item))) {
      if (row[field] !== rawRows[0][field]) {
        metadataErrors.push({ row: row.__row, tcId: row.TCID || null, issue: `Inconsistent repeated Run Metadata: ${field}.` });
      }
    }
  }
  const execution = rawRows.map((row) => ({
    __row: row.__row,
    "Selected for Run": headers.includes("SelectedForRun") ? row.SelectedForRun : "TRUE",
    Attempt: row.Attempt,
    "TC ID": row.TCID,
    "Test Title": row.TestTitle ?? "",
    "Test Result": row.TestResult,
    "Actual Result": row.ActualResult,
    "Tested By": row.TestedBy,
    "Tested At": row.TestedAt,
    Evidence: row.Evidence,
    Defect: row.Defect,
    Cleanup: row.Cleanup,
    Note: row.Note,
  }));
  return validateImport(
    source,
    inputPath,
    "csv",
    metadata,
    execution,
    titleProvided ? [["Test Title", "Title"]] : [],
    warnings,
    metadataErrors,
  );
}

function importMarkdown(source, inputPath) {
  const lines = readFileSync(inputPath, "utf8").split(/\r?\n/);
  const metadataTable = findMarkdownTable(lines, ["Field", "Value"]);
  if (!metadataTable?.rows.length) fail("Markdown manual result source is missing the Run Metadata table.");
  const executionTable = findMarkdownTable(lines, ["Attempt", "TC ID", "Test Result"]);
  if (!executionTable?.rows.length) fail("Markdown manual result source is missing the Test Execution table.");
  const metadata = Object.fromEntries(metadataTable.rows.map((row) => [cleanMarkdown(row.Field), cleanMarkdown(row.Value)]));
  const titleProvided = executionTable.headers.includes("Test Title");
  const selectedProvided = executionTable.headers.includes("Selected for Run");
  const warnings = [];
  if (!titleProvided) warnings.push("Legacy Markdown has no Test Title; titles were derived from the locked Test Cases.");
  if (!selectedProvided) warnings.push("Legacy Markdown has no Selected for Run; every row was treated as selected.");
  const execution = executionTable.rows.map((row, index) => ({
    __row: index + 2,
    "Selected for Run": selectedProvided ? cleanMarkdown(row["Selected for Run"]) : "TRUE",
    Attempt: cleanMarkdown(row.Attempt),
    "TC ID": cleanMarkdown(row["TC ID"]),
    "Test Title": cleanMarkdown(row["Test Title"]),
    "Test Result": cleanMarkdown(row["Test Result"]),
    "Actual Result": cleanMarkdown(row["Actual Result"]),
    "Tested By": cleanMarkdown(row["Tested By"]),
    "Tested At": cleanMarkdown(row["Tested At"]),
    Evidence: cleanMarkdown(row.Evidence),
    Defect: cleanMarkdown(row.Defect),
    Cleanup: cleanMarkdown(row.Cleanup),
    Note: cleanMarkdown(row.Note),
  }));
  return validateImport(
    source,
    inputPath,
    "markdown",
    metadata,
    execution,
    titleProvided ? [["Test Title", "Title"]] : [],
    warnings,
    [],
  );
}

function validateImport(source, inputPath, format, metadata, execution, lockedFields, warnings, formatErrors) {
  const sourceById = new Map(source.cases.map((item) => [item["TC ID"], item]));
  const requiredMetadata = ["Run ID", "Run At", "Environment", "Application Build", "Executor", "Retry Policy", "Assessment Policy", "Cleanup Plan", "Evidence Policy"];
  const missingMetadata = requiredMetadata.filter((field) => !metadata[field]);
  const expectedIntegrity = `SHA-256 ${source.hash}`;
  const integrityMissing = !metadata["Source Integrity"];
  if (integrityMissing) warnings.push(`Legacy ${format.toUpperCase()} has no Source Integrity; stale-source validation used Revision only.`);
  const staleRevision = metadata["Source Revision"] !== source.revision || (!integrityMissing && metadata["Source Integrity"] !== expectedIntegrity);
  const counts = Object.fromEntries(resultValues.map((result) => [result, 0]));
  const errors = [...formatErrors];
  const normalizedRows = [];
  const seen = new Map();
  const validationCounts = {
    invalidSelectionValues: 0,
    invalidResults: 0,
    resultsOutsideSelectedScope: 0,
    unknownTcIds: 0,
    invalidAttempts: 0,
    duplicateKeys: 0,
    missingActualResults: 0,
    changedLockedFields: 0,
    inconsistentRunMetadata: formatErrors.length,
  };
  let blankRows = 0;
  let selectedRows = 0;

  for (const row of execution) {
    const selection = String(row["Selected for Run"] ?? "").toUpperCase();
    const selected = selection === "TRUE";
    const result = String(row["Test Result"] ?? "").toUpperCase();
    const rowErrors = [];
    if (!new Set(["TRUE", "FALSE"]).has(selection)) {
      validationCounts.invalidSelectionValues += 1;
      rowErrors.push(`Selected for Run must be TRUE or FALSE: ${row["Selected for Run"] || "blank"}.`);
    }
    const testCase = sourceById.get(row["TC ID"]);
    if (!testCase) {
      validationCounts.unknownTcIds += 1;
      rowErrors.push(`Unknown TC ID: ${row["TC ID"] || "blank"}.`);
    } else {
      for (const [inputField, sourceField] of lockedFields) {
        if (String(row[inputField] ?? "") !== String(testCase[sourceField] ?? "")) {
          validationCounts.changedLockedFields += 1;
          rowErrors.push(`Locked design field changed: ${inputField}.`);
        }
      }
    }
    if (selected) selectedRows += 1;
    if (!result) {
      if (selected) blankRows += 1;
      for (const issue of rowErrors) errors.push({ row: row.__row, tcId: row["TC ID"], issue });
      continue;
    }
    if (!resultValues.includes(result)) {
      validationCounts.invalidResults += 1;
      rowErrors.push(`Invalid Test Result: ${result}.`);
    }
    if (!selected) {
      validationCounts.resultsOutsideSelectedScope += 1;
      rowErrors.push("Result is present while Selected for Run is not TRUE.");
    }
    const attempt = Number(row.Attempt);
    if (!Number.isInteger(attempt) || attempt < 1) {
      validationCounts.invalidAttempts += 1;
      rowErrors.push(`Attempt must be a positive integer: ${row.Attempt || "blank"}.`);
    }
    if (!row["Actual Result"]) {
      validationCounts.missingActualResults += 1;
      rowErrors.push(`${result || "Nonblank Result"} requires Actual Result or rationale.`);
    }
    const key = `${metadata["Run ID"]}|${attempt}|${row["TC ID"]}`;
    if (seen.has(key)) {
      validationCounts.duplicateKeys += 1;
      rowErrors.push(`Duplicate Run ID, Attempt, and TC ID with row ${seen.get(key)}.`);
    }
    else seen.set(key, row.__row);
    if (resultValues.includes(result)) counts[result] += 1;
    const normalized = {
      runId: metadata["Run ID"],
      attempt,
      tcId: row["TC ID"],
      testTitle: testCase?.Title ?? "",
      vpId: testCase?.["VP ID"] ?? "",
      sourceRef: testCase?.["Source Trace"] ?? "",
      result,
      expectedResult: testCase?.["Expected Results"] ?? "",
      actualResult: row["Actual Result"],
      testedBy: row["Tested By"] || metadata.Executor,
      testedAt: row["Tested At"] || metadata["Run At"],
      sourceLocator: resolve(inputPath),
      evidence: row.Evidence,
      defect: row.Defect,
      cleanup: row.Cleanup || metadata["Cleanup Plan"],
      note: row.Note,
      sourceRow: row.__row,
      errors: rowErrors,
    };
    normalizedRows.push(normalized);
    for (const issue of rowErrors) errors.push({ row: row.__row, tcId: row["TC ID"], issue });
  }
  if (missingMetadata.length) errors.push({ row: null, tcId: null, issue: `Missing required Run Metadata: ${missingMetadata.join(", ")}.` });
  if (metadata["Run ID"] && !/^RUN-\d{8}-\d{6}(?:-\d{2})?$/.test(metadata["Run ID"])) {
    errors.push({ row: null, tcId: null, issue: `Run ID must match RUN-<YYYYMMDD>-<HHMMSS>[-NN], found: ${metadata["Run ID"]}.` });
  }
  if (staleRevision) errors.push({ row: null, tcId: null, issue: "Source Test Cases revision or SHA-256 does not match the locked source." });
  if (metadata["Scope Key"] !== source.scopeKey || metadata["Scope Code"] !== source.scopeCode) {
    errors.push({ row: null, tcId: null, issue: "Scope Key or Scope Code does not match the locked source." });
  }
  return {
    valid: errors.length === 0,
    format,
    source: { path: source.path, revision: source.revision, sha256: source.hash },
    input: resolve(inputPath),
    runMetadata: metadata,
    summary: {
      lockedTcCount: source.cases.length,
      workbookRowCount: execution.length,
      selectedRows,
      acceptedRows: normalizedRows.filter((row) => row.errors.length === 0).length,
      blankSelectedRows: blankRows,
      resultCounts: counts,
      errorCount: errors.length,
      missingMetadata,
      staleRevision,
      validationCounts,
    },
    warnings,
    errors,
    rows: normalizedRows,
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.command === "help") {
    usage();
    return;
  }
  if (!args.source) fail("--source is required.");
  const source = parseTestCases(resolve(args.source));
  if (args.command === "prepare") {
    if (!args.output) fail("--output is required for prepare.");
    if (!args.run_id) fail("--run-id is required for prepare.");
    validateRunId(args.run_id);
    const output = resolve(args.output);
    const format = resolveFormat(output, args.format);
    let artifact;
    let engine;
    if (format === "xlsx") {
      artifact = buildWorkbook(source, args);
      packageWorkbook(artifact, output);
      engine = "tanizy-bundled-ooxml";
    } else {
      artifact = format === "csv" ? buildCsv(source, args) : buildMarkdown(source, args);
      writeTextArtifact(output, artifact);
      engine = format === "csv" ? "tanizy-bundled-csv" : "tanizy-bundled-markdown";
    }
    console.log(JSON.stringify({
      mode: "PREPARE",
      format,
      output,
      runId: args.run_id,
      source: source.path,
      sourceRevision: source.revision,
      lockedTcCount: source.cases.length,
      selectedTcCount: artifact.selectedCount,
      preparedAt: artifact.preparedAt,
      engine,
    }, null, 2));
    return;
  }
  const inputArgument = args.input ?? args.workbook;
  if (!inputArgument) fail("--input is required for import. --workbook remains an XLSX compatibility alias.");
  const input = resolve(inputArgument);
  if (!existsSync(input)) fail(`Manual result input does not exist: ${input}`);
  const format = resolveFormat(input, args.format);
  const preview = format === "xlsx"
    ? importXlsx(source, input)
    : format === "csv"
      ? importCsv(source, input)
      : importMarkdown(source, input);
  const json = `${JSON.stringify(preview, null, 2)}\n`;
  if (args.output) {
    const output = resolve(args.output);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, json, "utf8");
    console.log(JSON.stringify({ mode: "IMPORT", preview: output, valid: preview.valid, summary: preview.summary }, null, 2));
  } else process.stdout.write(json);
  if (!preview.valid) process.exitCode = 2;
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(scriptPath)
) main();
