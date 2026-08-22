---
name: qc-report-generator
description: "Generate a compact stakeholder-facing Markdown, CSV, or HTML test report, and DOCX, PPTX, or XLSX only when compatible generation and verification tools are available, from locked Test Cases and append-only execution records. Use when the user asks for a QC test report, execution summary, coverage report, or release-readiness report after results exist."
---

# Generate a QC Test Report

Summarize tested scope, results, coverage, evidence, and decision limits without fabricating executions or release criteria.

## Capability Boundary

Markdown, CSV, and self-contained HTML can be produced with ordinary text and
file capabilities. DOCX, PPTX, and XLSX require a compatible generation tool
and format-specific reopen or render verification in the current target. This
package provides format rules but does not bundle portable binary report
generators. If the required toolchain is unavailable, stop before writing an
invalid file and offer Markdown or HTML only after user approval. Track a
portable binary-report engine as deferred enhancement `QC-REPORT-001`.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`, then read
`references/executions-log.md`, `references/report-content-spec.md`, and the
selected format reference before drafting.

## Required Inputs

- Locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- One or more run IDs from `qc/executions/<scope-key>-executions.md`;
- Locked Viewpoint revision and exact requirement sources;
- Report audience and requested format;
- Assessment policy for selecting results when a TC has multiple attempts;
- Release criteria and decision authority, only when a release verdict is requested.

If no execution rows exist, stop and report that there are no results to aggregate. `NOT_RUN` is not an execution result.

## Verdict Boundary

Use `GO`, `CONDITIONAL GO`, or `NO-GO` only when approved release criteria and decision authority are available. Cite the criterion supporting the verdict. Otherwise use `UNDETERMINED`, present metrics and risks, and state which stakeholder decision is required.

An accepted bug requires a documented acceptance decision and source. Do not classify a failure as accepted based on age, severity, or silence.

## Workflow

1. Validate source TC revision, selected Run IDs, assessment policy, and execution-log integrity.
2. Reconcile every execution row to a TC, VP, source ref, environment, Result Source, and Evidence Policy. Reconcile supporting evidence when supplied. For a legacy Run without the newer provenance fields, mark them `UNKNOWN` and disclose the confidence limitation instead of rewriting history.
3. Calculate design and execution coverage separately for Viewpoints, ACs, business rules, NFRs, and impact/regression items.
4. Apply the assessment policy and count attempt rows, attempted TCs, assessed TCs, and the selected result statuses separately. Show absolute `PASS`, `FAIL`, `BLOCKED`, `ERROR`, `SKIP`, and derived `NOT_RUN` values. Do not show pass rate without these counts.
5. Use `COMPACT` mode unless the user explicitly requests an audit report, full trace matrix, or detailed appendix. Do not ask for report depth when the request is otherwise clear.
6. Select only visuals that materially clarify a decision or comparison.
7. Draft the compact core and any conditionally required detail in chat.
8. Show the exact output path and version suffix, if needed.
9. Obtain explicit content and path approval.
10. Write `qc/reports/<scope-key>-test-report-<YYYY-MM-DD>[-vN].<ext>`.
11. Validate content, calculations, links, and format rendering.

## Hard Rules

- Lead with numbers and decision limits.
- Keep the complete trace available through linked source artifacts and execution evidence. Do not copy the full matrix into a compact report unless it helps the requested decision.
- Render every project-local link relative to the proposed file under `qc/reports/`, including in a chat draft. Do not emit a project-root-relative path as though it were a report-relative Markdown link.
- Mark unexecuted or blocked scope explicitly. Never infer `PASS`.
- Do not discard a valid result solely because Evidence is blank under the approved Evidence Policy. State the resulting confidence limitation.
- Distinguish design coverage from executed coverage.
- Distinguish `STATIC_VALID`, `AUTOMATION_ELIGIBLE`, and `RUNTIME_READY`.
- Do not render empty sections, redundant tables, or decorative charts.
- Do not update Bug Base or System Context merely because a report is created.
- Do not touch files outside the approved `qc/` write set.

## References

- `references/report-content-spec.md`: compact core, conditional detail, and calculations
- `references/format-guide.md`: format selection and rendering rules
- `references/docx-format.md`: DOCX generation and visual verification
- `references/executions-log.md`: append-only execution schema
- `qc/config/material-paths.md`: shared naming, paths, gates, and traceability
