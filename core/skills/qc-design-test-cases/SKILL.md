---
name: qc-design-test-cases
description: "Design source-backed Test Cases from locked leaf Test Viewpoints by selecting explicit coverage items, coverage targets, and Test Design Techniques, with concrete Test Data, natural-language Expected Results, automation eligibility, and reproducible traceability. Use after the Viewpoint revision is locked."
---

# Design Traceable Test Cases

Decide how each locked leaf Viewpoint will be verified, then create atomic Test Cases whose coverage, Test Data, and Expected Results are supported by approved sources or explicit recorded decisions.

## Phase Boundary

Test Viewpoint design owns Test Target understanding, Viewpoint discovery, and Viewpoint decomposition.
Test Case Design consumes that locked analysis and answers how to verify it.

Do not read or reapply the Viewpoint discovery guide, any project discovery extension, or any legacy discovery checklist in this skill.
The locked Viewpoint revision, including its Test Target Map, Viewpoint Breakdown, Discovery Coverage Map, and material revision, is the immutable discovery handoff.

If the approved source changed, the parent material trace is missing, or a source-backed condition has no locked leaf Viewpoint, stop the affected scope and return it to `qc-design-viewpoints` for a new revision.
Do not discover, add, split, merge, or reprioritize Viewpoints here.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`, `references/test-design-techniques.md`, and `references/automation-eligibility.md`.

Use the technique guide to choose how to cover a locked leaf Viewpoint.
It is a design heuristic, not a requirement source.
It cannot define a business limit, rule, state transition, Expected Result, numeric coverage target, or accepted risk.
Record a design rationale for every selected technique and target.

## Input Preflight

Apply the shared `Input Boundary and Source Discovery` contract before reading phase inputs.
If any required source or artifact locator or content is missing, stop with `BLOCKED_INPUT` in chat and ask the user to provide it or explicitly approve one bounded search root.
Do not search the current project, parent directories, sibling projects, the broader workspace, the user home directory, or an external location to discover missing input, and do not request broader filesystem permission for that purpose.
A feature name, module name, scope key, keyword, or prior project knowledge is context only, not a locator.
If the user does not know the locator, ask requirement clarification questions in chat and do not infer unstated behavior.

## Required Inputs

- Approved requirement sources;
- Locked `qc/test-viewpoints/<scope-key>-viewpoints.md` revision with its readiness route and evidence;
- A complete Test Target Map, Viewpoint Breakdown, Discovery Coverage Map, and Discovery Material Manifest in that locked revision;
- Matching Gap Report only when the Viewpoint uses `GAP_ANALYSIS`;
- `qc/open-questions.md` when it exists or the locked Viewpoint references OQs;
- Relevant System Context, Bug Base, and Test Data spec when available.

Stop if the Viewpoint revision is not locked, contains an unmapped `DEFINED` discovery prompt, or lacks a leaf Viewpoint for the selected design scope.
For a `PARTIAL` design gate, create cases only for unblocked leaf Viewpoints.
Never create a placeholder or provisional executable case for an OQ with `Blocks From Phase = DESIGN`.

## Test Case IDs

Use `TC-<SCOPE-CODE>-NNN`.
Confirm the scope code once and preserve existing IDs across revisions.
Never renumber an existing TC to close a gap.

## Source-Backed Design Rules

1. Design from a locked `LEAF` Viewpoint, not directly from a `HIGH_LEVEL` parent. Every Test Case traces to one primary leaf VP ID.
2. For each leaf Viewpoint, define the coverage item, coverage target, denominator or selection rule, selected Test Design Technique, and rationale before drafting Test Cases.
3. A coverage target may be proposed as a QC design decision, but it must be explicit and approved with the Test Case draft. Do not present an unsupported percentage, sampling rate, or combination count as a requirement.
4. Keep Steps atomic and numbered.
5. Write Expected Results in natural language as observable outcomes. Number them to match the relevant Steps.
6. Use concrete synthetic Test Data. The values may be generated, but every business limit, format, status, and validation outcome must trace to a source.
7. Cover positive, negative, boundary, state, NFR, migration, compatibility, regression, timing, and interaction intent only when the locked leaf Viewpoint and governing source define the required oracle.
8. Record source-backed omissions and blocked coverage explicitly.

If design exposes a source revision mismatch, a missing locked condition, or a new product impact, stop the affected scope.
Return it to `qc-design-viewpoints` for a new locked revision.
If the evidence itself is missing or conflicting, return it to the readiness owner.
Use `qc-gap-finder` when the route is `GAP_ANALYSIS`; otherwise propose Gap Analysis as a separate phase.
Do not create an OQ, Gap Report, assumed Viewpoint, or invented Test Case in this skill.
Do not treat `OUT_OF_SCOPE` as `NOT_APPLICABLE`.

## Automation and Readiness

Keep one canonical `Automation Eligibility` value in every row:

- `UI-AUTO`
- `API-AUTO`
- `BOTH`
- `MANUAL`
- `NEEDS_SPEC`

Do not add parallel `Automatable` or `Auto Type` columns.
They duplicate the canonical value and can drift.
Do not collapse `BOTH` into a UI-only decision.

Record readiness separately:

- `STATIC_VALID`
- `AUTOMATION_ELIGIBLE`
- `RUNTIME_READY`

Design normally establishes only `STATIC_VALID`.
Missing endpoint, route, locator, fixture, auth, cleanup, or runner evidence prevents `RUNTIME_READY`.

## Workflow

1. Inventory locked high-level and leaf Viewpoints, parent relationships, exact source refs, Test Target Map, Discovery Coverage Map, and material revision.
2. Confirm the shared scope code and intended coverage dimensions.
3. Verify that the current approved source revisions match the locked parent manifest. This is a staleness check, not Viewpoint rediscovery.
4. For every in-scope leaf Viewpoint, choose the coverage item, coverage target, denominator or selection rule, and appropriate technique from `references/test-design-techniques.md`. Record the rationale and any constraint that limits coverage.
5. Return any missing or stale leaf coverage to `qc-design-viewpoints`; do not continue that affected scope.
6. Draft cases with concrete Test Data, numbered Steps, numbered Expected Results, trace refs, priority, and automation metadata.
7. Build traceability matrices and coverage totals for AC, business rule, NFR, impact or regression, high-level Viewpoints, leaf Viewpoints, and design coverage targets.
8. List blocked source items and leaf Viewpoints with OQ IDs and no TC IDs.
9. Run the Quality Gates below.
10. Present the Test Design Basis, Test Case draft, and exact write set in chat.
11. Obtain explicit content, path, coverage-target, and Lock Gate approval.
12. Write `qc/test-cases/<scope-key>-test-cases.md` with state `LOCKED`.
13. After validation succeeds, recommend exporting the locked Test Case table to an XLSX manual run workbook through `qc-record-manual-results`. State that this is optional and requires separate path approval. Do not create the workbook automatically.

Do not create an execution log during Test Case design.
`qc-record-manual-results` appends it only after the Manual Result Gate, and a runtime execution skill appends it only after an approved Execution Gate.

## File Structure

```markdown
# Test Cases: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Parent Viewpoint Revision | Readiness Route | Blocking OQs | Approved By | Approved At |

## 2. Source Manifest
| Source | Revision or hash | Role |

## 3. Test Design Basis
| Leaf VP ID | Coverage Item | Coverage Target | Denominator or Selection Rule | Test Design Technique | Rationale | TC IDs | Status or Blocked Reason |

## 4. Test Case Table
```

Use relative Markdown links for project-local sources in the Source Manifest and trace columns.
Preserve an approved external source as its exact `external, non-portable` locator.
The locked Viewpoint revision is an immediate parent artifact.

## Design-Only Test Case Table

```markdown
| TC ID | Module | Risk | Title | Preconditions | Test Data | Steps | Expected Results | Source Trace | VP ID | Priority | Automation Eligibility | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-LOG-001 | Login | High | Đăng nhập hợp lệ | User active, logged out | email `qc.login.01@example.test`; password from approved fixture | 1. Mở Login. 2. Nhập fixture. 3. Submit. | 1. Login hiển thị. 2. Giá trị được nhận. 3. Dashboard hiển thị và session được tạo. | [AC-01](../../requirements/login.md#ac-01) | [VP-LOG-002](../test-viewpoints/fs-login-viewpoints.md#vp-log-002) | P1 | UI-AUTO | @Smoke |
```

Keep all mutable execution fields out of the locked design table, including Attempt, Selected for Run, Test Result, Actual Result, executor, execution date, evidence, defect, cleanup, and execution note.
Derive them from the append-only executions log without modifying the approved Test Case revision.

`Automation Eligibility` is design metadata, not an execution result.
Preserve it in the canonical table.

The canonical `VP ID` column remains backward-compatible with downstream execution tooling.
Its value must identify the primary locked `LEAF` Viewpoint, never a `HIGH_LEVEL` parent.

## Manual Execution Handoff

After the Test Cases reach `LOCKED` and all quality gates pass, recommend this next action in Vietnamese:

```text
Test Cases đã được LOCKED. Đề xuất export Test Case table sang XLSX để QC nhập kết quả manual, sau đó import bằng qc-record-manual-results. Bạn có muốn tôi chuẩn bị workbook không?
```

When `qc-record-manual-results` is installed and the user approves, hand off the locked revision and selected scope to that skill in `PREPARE` mode.
If it is not installed, state the selective-install limitation.
Do not add result columns to the Markdown Test Case artifact as a fallback.

## Traceability and Coverage

Include:

- Requirement ref to TC IDs;
- High-level VP ID to leaf VP IDs;
- Leaf VP ID to TC IDs;
- Design Basis row to TC IDs;
- Blocked requirement or leaf VP ref to OQ ID;
- Coverage totals with explicit numerator and denominator;
- Design readiness summary, distinct from runtime readiness.

## Quality Gates

1. TC IDs are unique and stable.
2. Every TC traces to one locked leaf Viewpoint and one exact source ref.
3. Every in-scope leaf Viewpoint has at least one TC or one explicit blocked reason.
4. Every Test Design Basis row records a coverage item, coverage target, denominator or selection rule, technique, rationale, and mapped TC IDs or blocker.
5. Steps and Expected Results are numbered and semantically matched.
6. Test Data is concrete and contains no unsupported business value.
7. Every row has one canonical automation eligibility value and tags.
8. Blocked items have no fabricated TC.
9. Coverage totals reconcile with the source inventory, locked Viewpoint revision, and approved coverage targets.
10. The readiness route matches the locked parent Viewpoint; a Gap Report is required only for `GAP_ANALYSIS`.
11. The parent Discovery Material Manifest and Coverage Map are present and unchanged; this skill did not rerun discovery.
12. All relative links resolve.
13. Artifact state is `LOCKED`, with an explicit revision and approver.

## Rules

- Do not redesign or rediscover Viewpoints in this skill.
- Do not read Viewpoint discovery material in this skill.
- Do not claim execution readiness from static completeness.
- Keep requirement documents read-only.
