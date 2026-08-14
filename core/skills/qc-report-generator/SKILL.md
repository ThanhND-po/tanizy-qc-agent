---
name: qc-report-generator
description: Generate stakeholder-facing test reports (HTML/PPTX/Markdown/XLSX/CSV) from QC execution results. Invoke via $qc-report-generator after test execution completes.
metadata:
  runtimes: codex
---

# QC Report Generator

Generates a test report summarizing what was tested, results, coverage, and
release recommendation. The report is stakeholder-facing: it must be scannable
in under 60 seconds, trace information precisely, and visualize results with
charts where the format supports them.

## When to Use

Invoke `$qc-report-generator` **after** test execution results exist (from
`qc-run-playwright`, `qc-export-postman`, or manual runs). It can also be
called by `$qc-orchestrator` as the final phase of a QC session.

## Workflow

1. **Scope input** — Ask the user for links/paths to the test case files for
   the Epic / Feature / User Story that was tested (e.g.
   `qc/test-cases/<name>-test-cases.md`). If multiple, ask whether to report
   them as separate sections or separate reports.
2. **Execution input** — Locate execution results:
   - Preferred: `qc/executions/<feature>-executions.md` (see
     `references/executions-log.md`).
   - Fallback: ask the user where results live (MCP run output, manual list)
     and build the executions log first.
   - If nothing exists, stop and tell the user there are no results to report.
3. **Context inputs** — Load viewpoints file (`qc/test-viewpoints/...`),
   requirement docs (for ACs), and optionally `qc/refs/system-context.md` and
   `qc/refs/bug-base.md` (for known/accepted issues).
4. **Format selection** — Ask the user which format; show the menu from
   `references/format-guide.md` (default: HTML). Never ask about chart types.
5. **Generate** — Build the report strictly following
   `references/report-content-spec.md` (8 sections, in order) and the chosen
   format guide.
6. **Self-update** — After generating, append a summary line of new findings
   to `qc/refs/bug-base.md` (new FAIL/BLOCKED defects) if any, and announce
   it to the user in one sentence. Do NOT ask the user to update refs
   manually.
7. **Save** — Write the report to
   `qc/reports/test-report-<feature>-<YYYY-MM-DD>.<ext>`, version-suffixed
   (`-v2`) if that file already exists.

## Hard Rules

- Numbers before prose: every section leads with a table or metric.
- Every result row traces: TC ID → Viewpoint → AC → requirement doc.
- Report BOTH pass rate and absolute FAIL/BLOCK counts; pass rate alone hides
  blockers.
- Uncovered viewpoints/ACs are risks — call them out explicitly.
- The verdict (GO / CONDITIONAL GO / NO-GO) must state its conditions.
- Do not fabricate results: if a viewpoint has no executions, mark it
  "not executed" — never infer PASS.
- Do not touch anything outside `qc/`.

## Dependencies

| Skill | Needed when |
|---|---|
| qc-run-playwright / qc-export-postman | Execution results come from them |
| qc-design-test-cases | To read TC IDs and traces |
| qc-design-viewpoints | To read viewpoint coverage |
| qc-gap-finder | To read ACs and gap findings |

## References

- `references/report-content-spec.md` — mandatory report sections and math
- `references/format-guide.md` — per-format build rules (HTML is primary)
- `references/executions-log.md` — execution log schema
- `references/material-paths.md` — where every material lives
