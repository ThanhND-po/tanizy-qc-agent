# Output Format Guide

When the user invokes the skill, ask which format they want. Present the
options as a short menu (default: HTML). All formats contain the same content
(see report-content-spec.md); only presentation differs.

## Format Comparison

| Format | Audience | Charts | Tool needed | Token cost |
|---|---|---|---|---|
| **HTML** (default) | SM / PO / stakeholders | Donut + bar charts (inline SVG/JS) | Browser, none | Low |
| PPTX | Review meetings | Charts as slide graphics | PowerPoint | Medium |
| Markdown | Dev / QC detail reading | None (text tables) | Any editor | Lowest |
| XLSX | PMO / tracking | Charts on a dashboard sheet | Excel | Low |
| CSV | Data import only | None | Any | Lowest |

## HTML (primary, highest design effort)

Single self-contained file (inline CSS, no external assets). Structure:
1. Header band: title, scope, verdict badge (GO = green, CONDITIONAL = amber,
   NO-GO = red), run date.
2. Summary card row: 6 metric tiles (cases, pass rate, coverage, blocked,
   new defects, verdict).
3. Donut chart: PASS / FAIL / BLOCKED / SKIP distribution.
4. Bar chart: coverage by viewpoint (each viewpoint → % covered).
5. Tables per content spec sections 2–8; status cells use colored chips.
6. Footer: generated-by and evidence-index links.
Use CSS only; if a chart library is not available, render charts as inline
SVG — do not depend on network-loaded scripts (stakeholders may open offline).

## PPTX

1 slide per insight, max 8 slides:
1. Title + verdict
2. Summary metrics
3. Donut: result distribution
4. Bar: coverage by viewpoint
5. What was tested (table)
6. Result breakdown (table)
7. Issues & stakeholder-aware list
8. Recommendation + confidence
Keep text ≤ 24 words per slide; charts as native shapes where possible.

## XLSX

Sheets: `Summary` (metrics + small charts), `Coverage` (viewpoint×AC matrix
with color scales), `Results` (raw per-case rows), `Issues` (4-group table),
`Evidence` (index). Use conditional formatting: green/amber/red fills on
status columns.

## Markdown

Text tables with ✅/❌/🚫/⏭/⚠ markers, badge-style header block, coverage
matrix as a grid table. No charts.

## CSV

`TC ID,Title,Trace,Result,Evidence,BugID,Note` — data export only; warn the
user it carries no visual summary.

## Rules

- Never ask the user to pick a chart type — the generator chooses the minimum
  set that conveys the verdict (donut + one bar chart is the standard).
- File naming: `test-report-<feature>-<YYYY-MM-DD>.<ext>` in `qc/reports/`.
- If an output file already exists for the same feature + date, append a
  version suffix `-v2`, `-v3` instead of overwriting.
