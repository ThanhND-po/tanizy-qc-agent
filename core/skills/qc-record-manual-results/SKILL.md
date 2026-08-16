---
name: qc-record-manual-results
description: "Prepare a manual QC run workbook or import completed manual Test Results from XLSX, CSV, Google Sheets, or a separate Markdown run form into the canonical append-only execution log. Use when a tester wants an editable spreadsheet after Test Cases are locked, provides completed manual results, or needs those results normalized before qc-report-generator."
---

# Record Manual QC Results

Prepare manual execution input or normalize completed human test results without modifying the locked Test Case revision.

## Artifact Contract

Read `references/material-paths.md`, `references/executions-log.md`, and `references/manual-results-format.md` before proposing or writing an artifact.

## Modes

| Mode | Use | Output |
|---|---|---|
| `PREPARE` | The user wants an editable manual run artifact from locked Test Cases | XLSX by default, CSV or Markdown on request, or Google Sheets when an available connector supports the action |
| `IMPORT` | The user supplies completed manual results | Validated preview, then an approved append-only Run section |

Do not infer that a request to design Test Cases approves either mode. The Test Case skill recommends this handoff, and this skill obtains separate path and content approval.

## Required Inputs

- Locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- Matching locked Viewpoint revision and exact source refs;
- Selected TC IDs, or an explicit instruction to prepare all unblocked cases;
- One Run ID and the known environment, build, tester, time, retry, assessment, cleanup, and Evidence policies;
- For `IMPORT`, one readable XLSX, CSV, Google Sheets URL, or separate manual-run Markdown source.

Use `UNKNOWN` only when the value is genuinely unavailable and the execution contract permits it. Never invent a tester, date, environment, build, result, or evidence locator.

Use `OPTIONAL` as the default Evidence Policy: a result may have blank Evidence, and an exact external locator is preserved when supplied. Override this default only when the user or approved release criteria require evidence for selected or all results.

## Spreadsheet Capability

When XLSX is selected, invoke the target's native spreadsheet artifact skill or tool when available and follow its current authoring and verification rules. In Codex, use the available `Spreadsheets` skill. Keep native tool APIs and runtime-specific output directories out of this portable core skill.

If no verified XLSX capability exists, report the blocker and offer CSV or the separate Markdown form. Do not create a renamed text file with an `.xlsx` extension and do not install an unapproved library.

For a Google Sheets URL, use an available connected Sheets capability. If the connection or permission is unavailable, request an XLSX or CSV export. Do not claim that the remote sheet was read or updated without connector evidence.

## PREPARE Workflow

1. Validate the locked TC revision, stable IDs, unresolved OQs, and selected manual run scope.
2. Propose the Run ID, selected TC IDs, source revision, manual result format, and exact output locator.
3. Obtain the Manual Result Gate approval before creating the manual run artifact.
4. Build the workbook or fallback form from the locked design fields. Keep design cells read-only in intent and execution cells clearly editable.
5. Include every locked TC for traceability, but select only approved, unblocked cases for the Run. Do not prefill a Result.
6. Add validation, formulas, and formatting defined in `references/manual-results-format.md` when the format supports them.
7. Inspect formulas and key ranges, then visually verify every XLSX sheet with the native spreadsheet skill before delivery.
8. Report the artifact locator and instruct the tester to return the completed file or Sheet URL for `IMPORT`.

Creating a workbook does not create an execution Run. Results exist only after completed rows pass `IMPORT` and are appended to the execution log.

## IMPORT Workflow

1. Read the source without changing it. Record its exact locator and integrity metadata available at import time.
2. Reconcile Scope Key, source TC revision, Run ID, TC ID, Attempt, and selected run scope. Derive VP ID and source refs from the locked Test Cases instead of trusting editable input columns.
3. Validate one row per `<Run ID, Attempt, TC ID>`, Result vocabulary, required Actual Result or rationale, tester, time, and cleanup values. Apply explicit Run-level tester and time as row defaults when per-row overrides are blank.
4. Treat blank Result as no attempt row. Never convert blank to `SKIP`, `PASS`, or another execution result. `NOT_RUN` remains report-derived.
5. Apply the approved Evidence Policy. Evidence may be blank. Preserve an external evidence URL, path, or identifier exactly when supplied.
6. Reject or isolate invalid rows. Do not partially append a Run unless the user explicitly approves the exact valid subset as a separate Run scope.
7. Present an import preview with counts for accepted rows, blank rows, every Result value, duplicates, unknown TC IDs, stale revisions, and missing required metadata.
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
