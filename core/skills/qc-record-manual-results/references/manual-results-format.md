# Manual Result Source Format

Use one canonical meaning across XLSX, CSV, Google Sheets, and the separate Markdown form. The source is editable intake. The append-only executions log is the normalized record consumed by reporting.

## XLSX and Google Sheets Structure

Use these sheets in order:

| Sheet | Purpose |
|---|---|
| `Instructions` | Result vocabulary, editable-field legend, Evidence Policy, and import rules |
| `Run Metadata` | Run-level identity, source revision, environment, tester, policies, and source locator |
| `Test Execution` | Locked design context plus editable manual result fields |
| `Validation Summary` | Formula-driven counts and actionable validation warnings |

A hidden helper sheet for validation lists is allowed when the spreadsheet tool requires it. Do not hide required user instructions or validation errors.

## Run Metadata

| Field | Handling |
|---|---|
| Scope Key | Required and locked to the source scope |
| Scope Code | Required and locked to the source scope |
| Run ID | Required; follow the canonical Run grammar |
| Source Test Cases | Exact path or locator, Revision, State, and hash when available |
| Prepared At | Set when the template is generated |
| Run At | Tester enters the actual run start or uses `UNKNOWN` when allowed |
| Environment | Required for import |
| Application Build | Exact build or `UNKNOWN` |
| Execution Method | `MANUAL` |
| Executor | Human tester name or approved team identifier |
| Recorded By | Agent or person importing the source |
| Retry Policy | Exact approved policy |
| Assessment Policy | Exact approved result-selection policy |
| Cleanup Plan | Exact approved plan or `N/A` with reason |
| Evidence Policy | `OPTIONAL` by default; override only from an explicit user rule or approved release criteria |
| Result Source | File path, canonical URL, or external non-portable locator |
| Source Integrity | File hash, Sheet tab and range plus retrieval time, or `UNKNOWN` |

The Run ID may be reserved when the workbook is prepared. `Run At`, not the Run ID timestamp, records the actual execution time. Do not reuse one prepared workbook for several independent Runs without assigning a new Run ID.

## Test Execution Columns

Keep these design columns populated from the locked Test Case artifact:

```text
TC ID, Module, Risk, Priority, Title, Preconditions, Test Data, Steps, Expected Results, VP ID, Source Trace, Automation Eligibility, Tags
```

Use this scan-first order in every manual result artifact:

```text
Selected for Run, Attempt, TC ID, Test Title, Test Result, Actual Result,
Tested By, Tested At, Evidence, Defect, Cleanup, Note
```

`TC ID` and `Test Title` are locked display context. Map `Test Title` from the locked Test Case `Title` and place it immediately after `TC ID`. Keep the remaining XLSX design context after the scan-first fields. Never treat an edited title as execution data.

`Tested By` and `Tested At` are optional per-row overrides. When blank, import the explicit Run-level Executor and Run At values into the canonical attempt row. Do not use blank per-row cells to erase those Run-level values.

`Test Result` maps to canonical `Result`. Use only `PASS`, `FAIL`, `BLOCKED`, `SKIP`, or `ERROR`. Blank means no imported attempt. Never offer `NOT_RUN` in a dropdown.

For a retry, duplicate the TC row and increment Attempt. Do not overwrite the completed prior attempt merely to change its Result.

Use `TRUE` or `FALSE` for `Selected for Run`. Include all locked cases for traceability, but set `FALSE` for cases outside the approved Run or blocked by unresolved source behavior. Do not prefill their Result.

## Workbook UX

- Visually distinguish locked design columns from editable execution columns.
- Protect design cells when the native tool supports protection reliably. The importer must still validate them because protection is not a trust boundary.
- Add a Result dropdown with the canonical values and allow blank.
- Validate Attempt as a positive integer.
- Use typed date-time values and a machine-readable display format.
- Freeze the header and identity columns, enable filters, wrap text-heavy fields, and cap column widths and row heights.
- Use conditional formatting for Result and validation warnings.
- Do not require Evidence cells. State the Run's Evidence Policy visibly.
- Keep source locators as plain text or working hyperlinks when supported.
- Do not add decorative charts. A compact status count is sufficient.

## Bundled Manual Result Engine

The installed skill includes `scripts/manual-results.mjs`, the XLSX compatibility wrapper `scripts/manual-results-xlsx.mjs`, and the local OOXML helper `scripts/xlsx-lite.mjs`. Use the main engine for canonical XLSX, CSV, and Markdown PREPARE and IMPORT on every supported agent target. It requires Node.js only and must remain installable with the skill directory.

PREPARE accepts blank execution metadata so QC can complete it in the workbook. Only Scope Key, Scope Code, Run ID, source identity, source revision, prepared time, execution method, source integrity, and Evidence Policy are populated or reserved when the file is generated. IMPORT enforces the remaining required Run Metadata.

The workbook places the scan-first fields before the remaining locked design context so QC can identify and execute a case without horizontal navigation through all design fields. Column names, not positions, are authoritative for validation, formulas, dropdowns, and import.

New canonical artifacts require Test Title. For a legacy artifact without it, derive the title from the exact locked Test Cases and emit a warning. When an artifact supplies Test Title, reject a mismatch as a changed locked field.

`all-unblocked` means all canonical automation eligibility values except `NEEDS_SPEC`. Do not restrict a manual workbook to `UI-AUTO`; `Automation Eligibility` describes design suitability for automation, not permission to execute manually.

## Validation Summary

Calculate or display at least:

- Locked TC count;
- Selected Run scope count;
- Blank Result count within selected scope;
- `PASS`, `FAIL`, `BLOCKED`, `SKIP`, and `ERROR` counts;
- Invalid Result count;
- Duplicate `<Run ID, Attempt, TC ID>` count;
- Missing Actual Result or rationale count;
- Missing required Run metadata count.

Workbook formulas help the tester but are not authoritative. Recalculate all counts from cell values during import.

## CSV Input

CSV uses one row per Test Case or attempt. Repeat Run metadata on every row because CSV has no separate metadata sheet. New canonical CSV requires these headers:

```text
ScopeKey,ScopeCode,RunID,SourceTestCases,SourceRevision,PreparedAt,RunAt,
Environment,ApplicationBuild,ExecutionMethod,Executor,RetryPolicy,
AssessmentPolicy,CleanupPlan,EvidencePolicy,SourceIntegrity,SelectedForRun,
Attempt,TCID,TestTitle,TestResult,ActualResult,TestedBy,TestedAt,Evidence,
Defect,Cleanup,Note
```

Accept an RFC 4180-compatible UTF-8 CSV with a header row. Detect inconsistent repeated Run metadata as an import error. Blank `TestResult` rows do not create attempts. For legacy CSV without `SelectedForRun`, treat supplied rows as selected and emit a warning.

## Non-Canonical Tabular Sources

An existing XLSX, CSV, or Google Sheet may use different column names. Map it only after presenting the proposed source-to-canonical field mapping. Require an unambiguous source for TC ID and Test Result. Ask for missing Run metadata or record an allowed `UNKNOWN`; do not guess ambiguous status values, dates, testers, environments, or builds.

## Google Sheets Input

Use the XLSX sheet and field contract. Record the canonical Sheet URL, tab names, imported range, and retrieval timestamp. If a stable revision identifier is unavailable, mark Source Integrity accordingly and preserve the normalized execution rows as the immutable import snapshot.

## Separate Markdown Form

Store a project-local form, when approved, at:

```text
qc/execution-inputs/<scope-key>/<run-id-lowercase>-manual-results.md
```

Use the Run Header from `references/executions-log.md`, then one table with the same editable execution fields. Link the locked Test Cases instead of copying the complete design table. Never add manual results to the locked Test Case file.

```markdown
| Selected for Run | Attempt | TC ID | Test Title | Test Result | Actual Result | Tested By | Tested At | Evidence | Defect | Cleanup | Note |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| TRUE | 1 | TC-LOG-001 | Đăng nhập hợp lệ | | | | | | | | |
```

## Spreadsheet Verification

The bundled importer is the mandatory structural verification path for XLSX, CSV, and Markdown. It validates source revision and SHA-256 when available, Test Title and other supplied locked design values, IDs, attempts, metadata, Results, Actual Result or rationale, duplicates, selection state, repeated CSV metadata, and normalized rows.

When a native spreadsheet skill is available, additionally:

1. Inspect key metadata, execution, and summary ranges;
2. Scan for formula and validation errors;
3. Render and visually review every sheet;
4. Verify text is readable, editable columns are clear, and no required content is clipped;
5. Export one final XLSX only after these checks pass.

Native verification is optional and must not replace bundled IMPORT validation. If the native skill imposes a runtime-specific output directory, follow that skill and record the actual locator. Copy the workbook into the project only after separate path approval.
