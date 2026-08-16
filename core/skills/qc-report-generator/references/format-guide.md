# Test Report Format Guide

Use the format requested by the user. If none is specified, present the short comparison below and recommend HTML for fast stakeholder review. Treat CSV as a companion data export, not a standalone stakeholder report. Do not ask the user to choose chart types.

## Comparison

| Format | Best for | Visuals | Required verification |
|---|---|---|---|
| HTML | Fast stakeholder review | Metric cards, result and coverage charts | Open locally, verify layout and links |
| DOCX | Word annotation and circulation | Tables and embedded charts | Reopen and render pages |
| PPTX | Review meeting | One insight per slide | Render all slides |
| Markdown | Detailed engineering review | Tables only | Link and table validation |
| XLSX | Filtering and PMO tracking | Dashboard and conditional formatting | Reopen workbook and inspect formulas/charts |
| CSV | Companion data import/export | None | Parse and reconcile row counts |

HTML, DOCX, PPTX, Markdown, and XLSX use the `COMPACT` core and calculations from `report-content-spec.md`. Add `DETAILED` appendices only when requested. CSV contains normalized result rows. When a stakeholder asks for CSV as a test report, pair it with one of those report formats unless the user explicitly confirms a data-only export.

## HTML

Create one self-contained file with inline CSS and no network dependency. Include:

1. Title, scope, selected Run IDs, environment, and verdict;
2. Summary metrics;
3. Findings and actions;
4. Confidence, available evidence links, and generated-at metadata;
5. A result or coverage visual only when it adds information beyond the tables.

Prefer inline SVG or CSS for charts. Use status labels that remain readable without color.

## DOCX

Follow `docx-format.md`. Reopen the generated file and render it before delivery. If the environment cannot produce a valid document, report the failure and offer Markdown or HTML. Do not deliver a corrupt fallback as DOCX.

## PPTX

Use at most five content slides unless the user requests detail:

1. Title, scope, runs, and verdict;
2. Results and coverage metrics;
3. Failures, blockers, and actions;
4. Confidence and limitations;
5. Recommendation, required decisions, and available evidence links.

Render all slides and inspect text overflow, chart labels, and links.

## XLSX

Use these sheets for the compact workbook:

- `Summary`
- `Issues`
- `Evidence`

Add `Coverage` or `Results` only when the user requests the corresponding detailed appendix. Use formulas for summary metrics and conditional formatting for status. Reopen the workbook and verify formulas and charts.

## Markdown

Use the three compact core sections, compact tables, and text status labels. Do not rely only on emoji or color. Resolve and validate every project-local link from the proposed report file under `qc/reports/`, not from the project root.

## CSV

Use one row per execution attempt, including `BLOCKED`, `ERROR`, and `SKIP`:

```text
RunID,Attempt,TCID,Module,Risk,VPID,SourceRef,Priority,Tags,Result,SelectedForReport,AssessmentPolicy,TestBy,TestDate,SourceLocator,ActualResult,Evidence,Defect,Cleanup,Note
```

Do not create synthetic attempt rows for `NOT_RUN`. Reconcile the CSV row count to the report's attempt-row count. Preserve a blank Evidence field when the approved Evidence Policy permits it.

CSV is a data export and does not replace the stakeholder summary. State this limitation before saving. If the user requests only CSV, deliver only the data export when explicitly confirmed and do not call it a complete test report.

## File Naming

Save reports as:

```text
qc/reports/<scope-key>-test-report-<YYYY-MM-DD>[-vN].<ext>
```

Append `-v2`, `-v3`, and so on when the same scope, date, and extension already exist. Never overwrite an existing report silently.

## Verdict Labels

Support `GO`, `CONDITIONAL GO`, `NO-GO`, and `UNDETERMINED`. Make `UNDETERMINED` visually distinct and explain which release criterion or authority is missing.
