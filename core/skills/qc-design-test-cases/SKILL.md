---
name: qc-design-test-cases
description: "Design source-backed Test Cases from locked leaf Test Viewpoints by selecting explicit coverage items, coverage targets, and Test Design Techniques, with concrete Test Data, natural-language Expected Results, automation eligibility, and reproducible traceability. Use after the Viewpoint revision is locked."
---

# Design Traceable Test Cases

Decide how each locked leaf Viewpoint will be verified, then create Test Cases with one specific primary objective whose coverage, Test Data, and Expected Results are supported by approved sources or explicit recorded decisions.

## Phase Boundary

Test Viewpoint design owns Test Target understanding, Viewpoint discovery, and Viewpoint decomposition.
Test Case Design consumes that locked analysis and answers how to verify it.

Do not read or reapply the Viewpoint discovery guide, any project discovery extension, or any legacy discovery checklist in this skill.
The locked Viewpoint revision, including its Test Target Map, Viewpoint Breakdown, Discovery Coverage Map, and material revision, is the immutable discovery handoff.

If the approved source changed, the parent material trace is missing, or a source-backed condition has no locked leaf Viewpoint, stop the affected scope and return it to `qc-design-viewpoints` for a new revision.
Do not discover, add, split, merge, or reprioritize Viewpoints here.

## Primary Objective, Checkpoints, and Diagnosability

One primary test objective per Test Case is this package's authoring convention, not a universal mandatory ISTQB rule.
The objective must identify the source-backed behavior or relationship being tested, the applicable input or state, the trigger, and the outcome to prove.
Do not use a broad objective such as `Verify checkout` to combine otherwise independent validation, permission, state, or calculation objectives.
The objective may be expressed by the Title and existing fields when their combined intent is unambiguous; do not add a mandatory Objective column.

A Test Case may contain multiple Steps and Expected Results when they are coherent checkpoints for one transformation, transaction, interaction, or sequence.
A checkpoint may establish the path to an action, a condition needed to continue the flow, or a direct assertion for the objective.
Sharing a screen, actor, feature, workflow, or setup does not by itself make checkpoints one objective.
An output tuple, the same object's values on multiple observation surfaces, or a source-backed state sequence must not be split mechanically by the number of values, observations, actions, or transitions.

A case is diagnosable when its evidence identifies the failing checkpoint, relevant input or state, expected outcome, and actual outcome.
Diagnosability does not require one possible root cause, one defect classification, or one defect per Test Case.
A checkpoint that was not executed after an earlier failure is not verified and must not be reported as `PASS`.
Use the existing execution contract for evidence and unexecuted scope; do not change the execution result schema in this skill.

Treat different possible root causes, partial failure, downstream blocking, independently executable actions, different data, and `AND` or `OR` in an objective as review signals only.
No single signal automatically requires a split.

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
4. Give every Test Case one specific primary objective. State or make unambiguous its input or initial state, trigger, source-backed outcome, and the behavior or relationship being proved.
5. Design every Test Case so a human can execute it before any automation implementation exists. Automation Eligibility remains separate metadata.
6. Write Preconditions as only the case-specific state or condition that must already exist before the first action, such as an authenticated role or a previously created neutral test object. Do not replace them with a generic statement that an approved fixture exists.
7. Use a fixture with a clear initial state and Test Data that distinguishes the expected behavior from the fault the case is meant to detect.
8. Keep Steps atomic and numbered. Identify the actor or role, action surface, concrete action, and observable checkpoint needed by the test intent.
9. Do not use meta-steps such as confirming Preconditions, preparing the stated Test Data, or observing through an unspecified approved channel as substitutes for executable actions.
10. Require an exact route, selector, query, or observation command only when an approved source or verified runtime evidence provides it. Never invent implementation detail to make a Test Case appear executable.
11. Write Expected Results in natural language as observable outcomes. Number them to match the relevant Steps and keep only case-specific UI, business state, persisted data, file, audit, and side-effect or no-side-effect oracles.
12. Every oracle must trace to an approved source or explicit recorded decision and identify the expected value or state and the observation surface when that surface is source-defined.
13. Do not repeat fixture validation, Preconditions, readiness statements, or generic control-boundary wording in Expected Results.
14. Use concrete synthetic Test Data. The values may be generated, but every business limit, format, status, and validation outcome must trace to a source.
15. Optionally reference an existing approved Fixture Requirement ID inside Preconditions or Test Data when multiple cases, whether manual or automated, share a reusable controlled data state. Do not require a Fixture Catalog, add a canonical Fixture ID column, or create `qc/refs/test-data-spec.md` without separate content and path approval.
16. Cover positive, negative, boundary, state, NFR, migration, compatibility, regression, timing, and interaction intent only when the locked leaf Viewpoint and governing source define the required oracle.
17. Record source-backed omissions and blocked coverage explicitly.

## Test Case Split Decision

Apply this decision in order for each planned case:

1. Identify the coherent condition of the locked leaf Viewpoint and enumerate the coverage items the design intends to claim.
2. Write a specific primary objective with its input or state, trigger, and outcome.
3. Classify each checkpoint as an action path, a continuation condition, a direct assertion for the objective, or a separate test objective.
4. Split independent objectives that are grouped only to reuse setup, or independent scenarios whose combined evidence cannot support a clear verdict for each scenario.
5. Keep checkpoints together when they are needed to prove one source-backed transformation, transaction, interaction, or sequence and the failure evidence remains diagnosable.
6. Reconcile every claimed coverage item after the split or keep decision, and record a design rationale when the decision is not obvious.
7. When the classification at step 3 is ambiguous and neither `split` nor `keep` has clear source-backed justification, present both interpretations to the user with the relevant evidence instead of choosing one silently. State which checkpoints would be grouped and which would be separated under each interpretation, and the coverage impact of each.

Alternative branches usually need separate Test Cases with reproducible initial states so each branch receives a clear verdict.
A sequence with multiple actions remains one case only when the interaction or sequence itself is the source-backed objective, not when the sequence merely bundles independent branches to reduce case count.
Splitting Test Cases does not require splitting their parent leaf when the variants remain part of one coherent condition.
Do not use any review signal as a mandatory automatic split trigger.

## Return-to-Viewpoint Boundary

| Situation | Required behavior |
|---|---|
| A locked leaf bundles independent conditions or risks | Stop only the affected scope, name the bundled conditions and rationale, and return it to `qc-design-viewpoints` for a reviewed revision. Do not repair the locked leaf through child Test Cases. |
| A coherent locked leaf has several partitions, boundaries, branches, or transitions | Continue deriving the needed Test Cases for the coverage target. Do not require a new Viewpoint revision solely because case count, Test Data, or outcomes differ. |
| A source, source-backed fixture fact, or oracle is missing or conflicting | Follow the recorded readiness route for the affected scope. Do not invent behavior or search outside the authorized input boundary. |
| One scope is blocked while another remains design-ready | Preserve the blocker and continue only the unaffected scope allowed by the existing gate. |

The handoff must identify the affected VP ID, the conditions that need review, the evidence or rationale, and the next phase.
Do not introduce a new controlled status such as `TC DESIGN BLOCKED` only for this boundary.
A revised Viewpoint must complete the existing review and explicit Lock approval lifecycle before Test Case Design resumes for the affected scope.
Track the cumulative return count per affected VP ID according to the shared `Cross-Phase Iteration Policy` in `qc/config/material-paths.md`.
After the third return for the same VP ID, stop the affected scope and present the full iteration history, disputed conditions, and each phase's rationale to the user instead of initiating another return.

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
5. Apply the Test Case Split Decision. Return a bundled or stale locked leaf to `qc-design-viewpoints` without changing it, and continue unaffected coherent leaves allowed by the gate.
6. Draft human-executable cases with one specific primary objective, case-specific Preconditions, distinguishing Test Data, numbered Steps, numbered Expected Results, source-backed oracles, trace refs, priority, and automation metadata in the reader-facing language confirmed at the Scope Gate.
7. Reconcile each claimed coverage item to the exact Test Case, Steps, and Expected Results that exercise and assert it.
8. Build traceability matrices and separate coverage totals for AC, business rule, NFR, impact or regression, high-level Viewpoints, leaf Viewpoints, design coverage targets, and execution evidence when available.
9. List blocked source items and leaf Viewpoints with OQ IDs and no TC IDs, and record design omissions or approved exclusions without shrinking the declared denominator to obtain `100%`.
10. Review repeated narrative across Preconditions, Steps, and Expected Results. Treat duplication as a review signal, not an automatic failure; retain repeated text only when it is necessary and specific or factor an approved shared constraint into an artifact-level section without making the rows ambiguous.
11. Reread the canonical definitions and reconcile the reader-facing Legends against the complete artifact. Include all five canonical Automation Eligibility values and every other governed canonical vocabulary with seven or fewer values.
12. Run the Quality Gates below.
13. Present the Test Design Basis, Test Case draft, coverage reconciliation, and exact write set in chat.
14. Obtain explicit content, path, coverage-target, and Lock Gate approval.
15. Write `qc/test-cases/<scope-key>-test-cases.md` with state `LOCKED`.
16. After validation succeeds, recommend exporting the locked Test Case table to an XLSX manual run workbook through `qc-record-manual-results`. State that this is optional and requires separate path approval. Do not create the workbook automatically.

Do not create an execution log during Test Case design.
`qc-record-manual-results` appends it only after the Manual Result Gate, and a runtime execution skill appends it only after an approved Execution Gate.

## File Structure

```markdown
# Test Cases: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Parent Viewpoint Revision | Readiness Route | Blocking OQs | Approved By | Approved At |

## 2. Controlled Value Legends
| Vocabulary | Value | Meaning |

## 3. Source Manifest
| Source | Revision or hash | Role |

## 4. Test Design Basis
| Leaf VP ID | Coverage Item | Coverage Target | Denominator or Selection Rule | Test Design Technique | Rationale | TC IDs | Status or Blocked Reason |

## 5. Test Case Table
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

Every claimed coverage item must map to the Test Case and the specific Steps and Expected Results that exercise and assert it.
A branch mentioned only in a Title, Test Data, or Test Design Basis row is not covered unless the case contains the corresponding action and oracle.
When another Test Case covers the branch, map that TC explicitly rather than inferring cross-case coverage.
Record missing items as omissions, approved exclusions, or blockers under the existing contract with rationale and affected scope.
Do not reduce the denominator merely to report `100%`.
Report Viewpoint-to-TC mapping, achieved design coverage, and runtime execution results as separate dimensions.
Mapping every leaf Viewpoint to at least one TC does not prove that every coverage item was designed or that any case passed at runtime.

## Quality Gates

1. TC IDs are unique and stable.
2. Every TC traces to one locked leaf Viewpoint and one exact source ref.
3. Every in-scope leaf Viewpoint has at least one TC or one explicit blocked reason.
4. Every Test Design Basis row records a coverage item, coverage target, denominator or selection rule, technique, rationale, and mapped TC IDs or blocker.
5. Every TC has one specific primary objective backed by source evidence; a broad feature or workflow name is not sufficient.
6. Every checkpoint serves that objective, and independent objectives are not grouped merely to share setup.
7. Preconditions contain case-specific initial state only and are sufficient for human execution without claiming that an unspecified fixture exists.
8. Test Data distinguishes the expected outcome from the fault the case is intended to detect and identifies the object to observe.
9. Steps are numbered and identify the actor or role, action surface, concrete action, and observable checkpoint without generic meta-wrappers.
10. Expected Results are numbered, semantically matched to Steps, contain only case-specific observable oracles rather than repeated Preconditions or readiness boilerplate, and trace expected values or states to approved evidence.
11. Test Data is concrete and contains no unsupported business value. An optional Fixture Requirement ID resolves to an existing approved test-data source and is not treated as automation-only metadata.
12. A coherent leaf may produce multiple Test Cases; a bundled locked leaf is returned through the existing Viewpoint revision lifecycle for the affected scope only.
13. Every coverage claim maps to supporting actions and oracles. Totals preserve the declared denominator and disclose omissions, exclusions, and blockers.
14. A checkpoint not executed after an earlier failure is not treated as verified or `PASS`, and the failure evidence identifies checkpoint, input or state, expected outcome, and actual outcome without requiring a known root cause.
15. Every row has one canonical automation eligibility value and tags.
16. Blocked items have no fabricated TC.
17. Coverage totals name the approved source-backed numerator and denominator, list blocked and waived or `OUT_OF_SCOPE` items separately, and do not present a bare `100%` as complete product coverage.
18. Viewpoint mapping coverage, achieved design coverage, and execution results remain separate; none is used as proof of another.
19. `STATIC_VALID`, `AUTOMATION_ELIGIBLE`, `RUNTIME_READY`, and `EXECUTED` are reported separately when evidence for those states exists.
20. The readiness route matches the locked parent Viewpoint; a Gap Report is required only for `GAP_ANALYSIS`.
21. The parent Discovery Material Manifest and Coverage Map are present and unchanged; this skill did not rerun discovery.
22. Reader-facing narrative follows the Scope Gate language while exact technical and business terms, IDs, paths, fields, source literals, and controlled values remain unchanged.
23. All relative links resolve.
24. Artifact state is `LOCKED`, with an explicit revision and approver.
25. Every controlled value used in the artifact has exactly one matching Legend definition, every governed canonical vocabulary with seven or fewer values is complete, and no `LEGEND_UNDEFINED_VALUE` remains unresolved.

## Rules

- Do not redesign or rediscover Viewpoints in this skill.
- Do not read Viewpoint discovery material in this skill.
- Do not claim execution readiness from static completeness.
- Do not add an artifact-language field or a Fixture ID column to the Test Case header.
- Do not add a mandatory Objective column or change the execution result schema for this convention.
- Do not use word count, `AND`, `OR`, Expected Result count, possible root causes, data variation, or downstream blocking as an automatic split trigger.
- Keep requirement documents read-only.
