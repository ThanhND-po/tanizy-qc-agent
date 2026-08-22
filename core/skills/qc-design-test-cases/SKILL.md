---
name: qc-design-test-cases
description: "Design source-backed Test Cases from a locked Test Viewpoint revision, with concrete Test Data, natural-language Expected Results, automation eligibility, and reproducible traceability and coverage totals. Use when the user asks to design, generate, review, or complete QC Test Cases after Viewpoints are locked."
---

# Design Traceable Test Cases

Create atomic Test Cases whose Test Data and Expected Results are supported by approved sources or explicit recorded decisions.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` and
`references/automation-eligibility.md`. When UI items are in scope, also read:

- `qc/config/field-validation-checklist.md` for input and data-entry controls;
- `qc/config/ui-component-checklist.md` for display, navigation, and composite
  components.

Use these checklists to reconcile the locked Viewpoint coverage. Do not use
them to bypass or redesign the locked parent revision.

## Required Inputs

- Approved requirement sources;
- Locked `qc/test-viewpoints/<scope-key>-viewpoints.md` revision with its
  readiness route and evidence;
- Matching Gap Report only when the Viewpoint uses `GAP_ANALYSIS`;
- `qc/open-questions.md` when it exists or the locked Viewpoint references OQs;
- Relevant System Context, Bug Base, and Test Data spec when available.

Stop if the Viewpoint revision is not locked. For a `PARTIAL` design gate, create cases only for unblocked Viewpoints. Never create a placeholder or provisional executable case for an OQ with `Blocks From Phase = DESIGN`.

## Test Case IDs

Use `TC-<SCOPE-CODE>-NNN`. Confirm the scope code once and preserve existing IDs across revisions. Never renumber an existing TC to close a gap.

## Source-Backed Design Rules

1. Keep Steps atomic and numbered.
2. Write Expected Results in natural language as observable outcomes. Number them to match the relevant Steps.
3. Use concrete synthetic Test Data. The values may be generated, but every business limit, format, status, and validation outcome must trace to a source.
4. Reconcile relevant checklist checks against the locked Viewpoint revision. Derive Test Cases only from `DEFINED` checks already mapped to a locked Viewpoint.
5. Cover happy, negative, boundary, state, NFR, and regression angles only when the expected behavior is defined.
6. Record source-backed omissions and blocked coverage explicitly.

If reconciliation finds a source-backed `DEFINED` angle without a locked
Viewpoint, stop the affected scope and hand it back to `qc-design-viewpoints`
for a new revision. If it finds a `SPEC_GAP`, stop the affected scope and return
it to the readiness owner. Use `qc-gap-finder` when the route is `GAP_ANALYSIS`;
otherwise propose Gap Analysis as a separate phase. Do not create an OQ, Gap
Report, or invented Test Case in this skill. Do not treat `OUT_OF_SCOPE` as
`NOT_APPLICABLE`.

## Automation and Readiness

Keep one canonical `Automation Eligibility` value in every row:

- `UI-AUTO`
- `API-AUTO`
- `BOTH`
- `MANUAL`
- `NEEDS_SPEC`

Do not add parallel `Automatable` or `Auto Type` columns. They duplicate the canonical value and can drift. Do not collapse `BOTH` into a UI-only decision.
Record readiness separately:

- `STATIC_VALID`
- `AUTOMATION_ELIGIBLE`
- `RUNTIME_READY`

Design normally establishes only `STATIC_VALID`. Missing endpoint, route, locator, fixture, auth, cleanup, or runner evidence prevents `RUNTIME_READY`.

## Workflow

1. Inventory locked Viewpoints and exact source refs.
2. Confirm the shared scope code and intended coverage dimensions.
3. Reconcile relevant field and UI component checklist checks against locked Viewpoints when UI items are in scope.
4. Return any source-backed angle without a locked Viewpoint to `qc-design-viewpoints`; do not continue that affected scope.
5. Draft cases with concrete Test Data, numbered Steps, numbered Expected Results, trace refs, priority, and automation metadata.
6. Build traceability matrices and coverage totals for AC, business rule, NFR, impact/regression, and Viewpoints.
7. List blocked source items with OQ IDs and no TC IDs.
8. Run the Quality Gates below.
9. Present the draft and exact write set in chat.
10. Obtain explicit content, path, and Lock Gate approval.
11. Write `qc/test-cases/<scope-key>-test-cases.md` with state `LOCKED`.
12. After validation succeeds, recommend exporting the locked Test Case table to an XLSX manual run workbook through `qc-record-manual-results`. State that this is optional and requires separate path approval. Do not create the workbook automatically.

Do not create an execution log during Test Case design.
`qc-record-manual-results` appends it only after the Manual Result Gate, and a
runtime execution skill appends it only after an approved Execution Gate.

## File Structure

```markdown
# Test Cases: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Parent Viewpoint Revision | Readiness Route | Blocking OQs | Approved By | Approved At |

## 2. Source Manifest
| Source | Revision or hash | Role |

## 3. Test Case Table
```

Use relative Markdown links for project-local sources in the Source Manifest and trace columns. Preserve an approved external source as its exact `external, non-portable` locator. The locked Viewpoint revision is an immediate parent artifact.

## Design-Only Test Case Table

```markdown
| TC ID | Module | Risk | Title | Preconditions | Test Data | Steps | Expected Results | Source Trace | VP ID | Priority | Automation Eligibility | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-LOG-001 | Login | High | Đăng nhập hợp lệ | User active, logged out | email `qc.login.01@example.test`; password from approved fixture | 1. Mở Login. 2. Nhập fixture. 3. Submit. | 1. Login hiển thị. 2. Giá trị được nhận. 3. Dashboard hiển thị và session được tạo. | [AC-01](../../requirements/login.md#ac-01) | [VP-LOG-001](../test-viewpoints/fs-login-viewpoints.md#vp-log-001) | P1 | UI-AUTO | @Smoke |
```

Keep all mutable execution fields out of the locked design table, including Attempt, Selected for Run, Test Result, Actual Result, executor, execution date, evidence, defect, cleanup, and execution note. Derive them from the append-only executions log without modifying the approved Test Case revision.

`Automation Eligibility` is design metadata, not an execution result. Preserve
it in the canonical table.

## Manual Execution Handoff

After the Test Cases reach `LOCKED` and all quality gates pass, recommend this
next action in Vietnamese:

```text
Test Cases đã được LOCKED. Đề xuất export Test Case table sang XLSX để QC nhập kết quả manual, sau đó import bằng qc-record-manual-results. Bạn có muốn tôi chuẩn bị workbook không?
```

When `qc-record-manual-results` is installed and the user approves, hand off the locked revision and selected scope to that skill in `PREPARE` mode. If it is not installed, state the selective-install limitation. Do not add result columns to the Markdown Test Case artifact as a fallback.

## Traceability and Coverage

Include:

- Requirement ref to TC IDs;
- Viewpoint ID to TC IDs;
- Blocked requirement ref to OQ ID;
- Coverage totals with explicit numerator and denominator;
- Design readiness summary, distinct from runtime readiness.

## Quality Gates

1. TC IDs are unique and stable.
2. Every TC traces to one locked Viewpoint and one exact source ref.
3. Steps and Expected Results are numbered and semantically matched.
4. Test Data is concrete and contains no unsupported business value.
5. Every row has one canonical automation eligibility value and tags.
6. Blocked items have no fabricated TC.
7. Coverage totals reconcile with the source inventory and Viewpoint revision.
8. The readiness route matches the locked parent Viewpoint; a Gap Report is required only for `GAP_ANALYSIS`.
9. All relative links resolve.
10. Artifact state is `LOCKED`, with an explicit revision and approver.

## Rules

- Do not redesign Viewpoints in this skill.
- Do not claim execution readiness from static completeness.
- Keep requirement documents read-only.
