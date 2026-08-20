---
name: qc-record-manual-results
description: "Prepare or import manual QC Test Results through bundled XLSX, CSV, or Markdown artifacts, or through a connected Google Sheet, then normalize approved results into the canonical append-only execution log. Use when a tester wants an editable manual run artifact after Test Cases are locked, provides completed manual results, or needs those results normalized before qc-report-generator."
---

# Record Manual QC Results

Prepare manual execution input or normalize completed human test results without modifying the locked Test Case revision.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`, then read
`references/executions-log.md` and `references/manual-results-format.md` before
proposing or writing an artifact.

## Modes

| Mode | Use | Output |
|---|---|---|
| `PREPARE` | The user wants an editable manual run artifact from locked Test Cases | XLSX by default, CSV or Markdown on request, or Google Sheets when an available connector supports the action |
| `IMPORT` | The user supplies completed manual results | Validated preview, then an approved append-only Run section |

Do not infer that a request to design Test Cases approves either mode. The Test Case skill recommends this handoff, and this skill obtains separate path and content approval.

## Required Inputs

- Locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- Matching locked Viewpoint revision and exact source refs;
- For `PREPARE`, selected TC IDs or `all-unblocked`, one reserved Run ID, output path, and Evidence Policy;
- For `IMPORT`, the known environment, build, tester, time, retry, assessment, cleanup, and Evidence policies;
- For `IMPORT`, one readable XLSX, CSV, Google Sheets URL, or separate manual-run Markdown source.

Use `UNKNOWN` only when the value is genuinely unavailable and the execution contract permits it. Never invent a tester, date, environment, build, result, or evidence locator.

Use `OPTIONAL` as the default Evidence Policy: a result may have blank Evidence, and an exact external locator is preserved when supplied. Override this default only when the user or approved release criteria require evidence for selected or all results.

## Bundled Manual Result Capability

Use the bundled `scripts/manual-results.mjs` as the baseline PREPARE and IMPORT engine for XLSX, CSV, and Markdown on every target. It uses only Node.js built-in modules and travels with this skill, so these formats do not depend on Gemini, Codex, Claude, Antigravity, Microsoft Excel, Python, a connector, or a network-installed spreadsheet library.

Use `scripts/manual-results-xlsx.mjs` only as an XLSX compatibility wrapper. Use a native spreadsheet capability only as an optional enhancement for visual review or advanced edits. Native capability absence must not block artifact creation or cause an automatic format fallback. CSV and the separate Markdown form are explicit user-selected alternatives only.

Run from the installed skill directory or use the absolute script path:

```bash
node scripts/manual-results.mjs prepare \
  --source <locked-test-cases.md> \
  --output <manual-results.xlsx> \
  --run-id <RUN-ID> \
  --selected all-unblocked \
  --evidence-policy OPTIONAL

node scripts/manual-results.mjs import \
  --source <locked-test-cases.md> \
  --input <completed-manual-results.xlsx> \
  --output <import-preview.json>
```

Use `.csv` or `.md` as the PREPARE output and IMPORT input extension for those formats. The utility infers the adapter from the extension; use `--format` only when an explicit format is needed.

The script exits with code `2` when IMPORT writes a preview containing validation errors. Read the preview and report the exact errors instead of silently changing formats. Never create a renamed text file with an `.xlsx` extension and never install a library during the workflow.

For a Google Sheets URL, use an available connected Sheets capability. If the connection or permission is unavailable, request an XLSX or CSV export. Do not claim that the remote sheet was read or updated without connector evidence.

## PREPARE Workflow

1. Validate the locked TC revision, stable IDs, unresolved OQs, and selected manual run scope. Treat `Automation Eligibility` as design metadata, not a manual execution filter. `all-unblocked` selects `UI-AUTO`, `API-AUTO`, `BOTH`, and `MANUAL`; it excludes only `NEEDS_SPEC`.
2. Propose the Run ID, selected TC IDs, source revision, manual result format, and exact output locator.
3. Obtain the Manual Result Gate approval before creating the manual run artifact.
4. Run the bundled PREPARE command for the approved XLSX, CSV, or Markdown format. Environment, build, executor, run time, retry, assessment, and cleanup values may remain editable and blank at this stage; they are required or explicitly resolved only at IMPORT.
5. Include every locked TC for traceability, but select only approved, unblocked cases for the Run. Do not prefill a Result.
6. Put locked `Test Title` immediately after `TC ID` in every format. Derive it from the locked Test Case `Title`; never ask QC to author or approve a separate title.
7. Confirm that the script reports the expected format, source revision, locked TC count, selected TC count, Run ID, output locator, and bundled engine.
8. For XLSX, when a native spreadsheet capability is available, optionally inspect formulas, key ranges, and every sheet visually. State when this optional visual review was not available; do not represent it as a failed XLSX creation.
9. Report the artifact locator and instruct the tester to return the completed file or Sheet URL for `IMPORT`.

Creating a workbook does not create an execution Run. Results exist only after completed rows pass `IMPORT` and are appended to the execution log.

## IMPORT Workflow

1. Read the source without changing it. For canonical XLSX, CSV, or Markdown, run the bundled IMPORT command against the completed artifact and exact locked Test Case source.
2. Reconcile Scope Key, source TC revision, Run ID, TC ID, Attempt, and selected run scope. Derive VP ID and source refs from the locked Test Cases instead of trusting editable input columns.
3. Validate one row per `<Run ID, Attempt, TC ID>`, Result vocabulary, required Actual Result or rationale, tester, time, and cleanup values. Apply explicit Run-level tester and time as row defaults when per-row overrides are blank.
4. Treat blank Result as no attempt row. Never convert blank to `SKIP`, `PASS`, or another execution result. `NOT_RUN` remains report-derived.
5. Apply the approved Evidence Policy. Evidence may be blank. Preserve an external evidence URL, path, or identifier exactly when supplied.
6. Reject or isolate invalid rows. Do not partially append a Run unless the user explicitly approves the exact valid subset as a separate Run scope.
7. Read the generated JSON preview. Present each normalized `testTitle`, counts for accepted rows, blank rows, every Result value, duplicates, unknown TC IDs, changed locked fields, stale revisions, legacy warnings, and missing required metadata.
8. Obtain the Manual Result Gate approval for the normalized content and exact execution-log path.
9. Append one Run section to `qc/executions/<scope-key>-executions.md`. Record the source locator, source integrity, importer, and Evidence Policy.
10. Validate reconciliation and report the Run ID now available to `qc-report-generator`.

## Result Validation

- `PASS` and `FAIL` require an observable Actual Result.
- `BLOCKED` requires a blocker reason.
- `SKIP` requires an approved exclusion rationale.
- `ERROR` requires the manual tool, setup, or observation failure.
- A defect link is optional until a product defect is independently verified.
- Evidence is optional unless the approved Evidence Policy or release criteria require it. Missing evidence reduces confidence but does not erase a valid manual result row.
- A row blocked by unresolved source behavior is not converted to `PASS` or `FAIL`. Route the missing decision back to the OQ ledger and Test Case design.

## Rules

- Keep the locked Test Case revision immutable.
- Preserve every retry as a separate Attempt.
- Do not edit a historical imported Run. Append a correction note or new Run.
- Do not copy an external result or evidence source into `qc/` without explicit approval.
- Ask in Vietnamese by default and retain exact technical terms and IDs.
