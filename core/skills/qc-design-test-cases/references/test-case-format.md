# Canonical Test Case Format

Read this reference before drafting a Test Case artifact.
It owns the complete output structure; do not learn formatting from existing project cases.
The template supplies structure and package vocabulary only, never product behavior, approval evidence, test data limits, or coverage targets.

## How to Fill the Template

- Replace every angle-bracket placeholder from the approved intake, locked parent, governing sources, or explicit QC design rationale. Do not leave placeholder rows in a persisted artifact.
- Start with `DRAFT`; set `LOCKED`, Approved By, and Approved At only after the current content, coverage target, exact path, and Lock Gate are approved. Leave approval cells blank while awaiting that approval.
- Preserve an existing approved scope code and TC IDs. A new code uses the shared metadata-only collision check.
- Use the package `Risk` and `Test Priority` definitions in the shared contract, or an explicitly approved project vocabulary. The prefilled rows below mirror those defaults; update only from an approved definition, never from another artifact's example.
- The Automation Eligibility rows below are canonical. Read `automation-eligibility.md` for selection rules; `NEEDS_SPEC` never authorizes a placeholder executable case for a design-blocking gap.
- The shared contract owns lifecycle, readiness route, and validation-state meanings. The prefilled Legend rows mirror that contract so the output can be read without access to installed skills.
- Add the used `TDT-*` meanings from `test-design-techniques.md`, which has more than seven techniques. Explain other controlled vocabularies used by the final artifact and preserve definitions required by its retained history.
- Use natural language for a design rationale or blocked reason instead of inventing a new status enum. `Risk`, Test Priority, and coverage selection are QC judgments subject to draft approval.
- Use relative Markdown links resolved from `qc/test-cases/<scope-key>-test-cases.md` for every existing project-local source and parent. Preserve exact approved external locators as `external, non-portable`.
- Keep the Source Manifest complete enough to verify exact source approval and revision. Link the locked Viewpoint as the immediate parent; do not reload its discovery materials.
- Include all sections below. Use `None` for empty Blocked Scope or exclusions and `N/A` with a reason for a coverage dimension that has no approved denominator; do not create fictitious rows or claim `100%`.
- For included security coverage, use the existing Test Design Basis rows to enumerate paths, processing/output contexts, actors or states, and misuse classes with a finite target or selection rule. Reconcile each item to concrete Steps and an observable oracle, blocker, or approved omission; a label such as `XSS` is not a coverage item set by itself.
- Trace an applicable approved security baseline in the Source Manifest with its exact control refs and revision. Carry inherited security exclusions and their decision refs into Coverage Totals and Blocked Scope and Omissions; approved exclusion permits no security TC rows and requires no placeholder case or security-only blocker.

## Expected Result Presentation

Confirm the presentation before Test Case analysis or drafting, using an explicit project standard, user instruction, or choice already established in the current workstream.
If none exists, ask once: "Dùng một kết quả tổng thể sau toàn bộ Steps (mặc định), hay Expected Result theo các step cần kiểm chứng?"
Wait for the choice or explicit direction to use the default; silence does not approve a draft, write, Lock, or execution.
Do not infer a preference from unrelated historical artifacts or repeatedly ask after the choice is confirmed.

| Presentation | Meaning |
|---|---|
| `CASE_OUTCOME` | Default: one overall Expected Result after the complete Steps with the stated Preconditions and Test Data; it may contain multiple observable conditions serving one primary objective, without step-number matching |
| `STEP_CHECKPOINTS` | Optional: source-backed expectations linked explicitly to the Steps that need verification for one primary objective; not every action requires an expectation |

For `CASE_OUTCOME`, use a coherent outcome description, with concise supporting conditions when needed; do not manufacture separate results for entering data or clicking controls.
A source-backed login example could state: "The authenticated user reaches the Dashboard with the specified welcome message and an active session."
Every condition in such an outcome must be defined by the selected product sources; this example supplies no product requirement.
All stated conditions must be satisfied for the case to pass; one outcome is not a limit of one assertion or observation surface.
Do not combine independent objectives just to keep one field.

The selected presentation never removes a required intermediate observation or changes pass/fail semantics.
If terminal observations cannot demonstrate a required transient state, sequence, timing condition, or other coverage item, explain the coverage impact before drafting and propose a separately scoped case or the optional checkpoint presentation.
Do not silently switch presentation, omit the condition, claim it covered from the final state alone, or force-split a coherent locked leaf Viewpoint.
A failed required condition is not made passing by a later successful outcome.

Record the confirmed presentation immediately before the Test Case Table and retain it in the current workstream handoff; do not add a TC column or change the Artifact Header schema.
The template below shows the default; replace the presentation and row text when checkpoint mode was selected.
For an existing locked artifact without this presentation note, preserve its expectations and trace as written; do not relabel or normalize it during export, execution, or reporting.

## Complete Template

```markdown
# Test Cases: <Scope Key>

## 1. Artifact Header

| Scope Key | Scope Code | Artifact Type | Revision | State | Parent Viewpoint Revision | Readiness Route | Blocking OQs | Approved By | Approved At |
|---|---|---|---|---|---|---|---|---|---|
| <scope-key> | <SCOPE-CODE> | Test Cases | <revision> | DRAFT | <relative parent link and locked revision> | <inherited route> | <exact OQ IDs or NONE> | | |

## 2. Controlled Value Legends

| Vocabulary | Value | Meaning |
|---|---|---|
| Expected Result Presentation | CASE_OUTCOME | Default: one overall Expected Result after the complete Steps with the stated Preconditions and Test Data; it may contain multiple observable conditions serving one primary objective, without step-number matching |
| Expected Result Presentation | STEP_CHECKPOINTS | Optional: source-backed expectations linked explicitly to the Steps that need verification for one primary objective; not every action requires an expectation |
| Automation Eligibility | UI-AUTO | The source-backed intent is deterministic and observable through UI automation |
| Automation Eligibility | API-AUTO | The source-backed intent is deterministic and the complete API contract is available |
| Automation Eligibility | BOTH | The same intent is valid and independently observable through UI and API layers |
| Automation Eligibility | MANUAL | The approved test intent requires human judgment or an unsupported physical/third-party interaction |
| Automation Eligibility | NEEDS_SPEC | Test intent, data, Expected Result, endpoint, or another required contract is missing |
| Risk | High | QC assessment of substantial harm to the selected product objective if the behavior fails; record the basis |
| Risk | Medium | QC assessment of material but bounded harm to the selected product objective; record the basis |
| Risk | Low | QC assessment of limited harm to the selected product objective; record the basis |
| Test Priority | P1 | Highest test priority within the approved scope; justify using risk and test objective |
| Test Priority | P2 | Normal test priority within the approved scope; justify using risk and test objective |
| Test Priority | P3 | Lower test priority within the approved scope; justify using risk and test objective |
| Artifact State | DRAFT | Content is being prepared and has not received lifecycle approval |
| Artifact State | REVIEW_REQUIRED | Draft is ready for user review |
| Artifact State | APPROVED | Content and path were explicitly approved |
| Artifact State | LOCKED | Approved Viewpoint or Test Case revision may be consumed downstream |
| Artifact State | BLOCKED_SPEC | Required behavior or evidence is unresolved |
| Artifact State | STALE | A source, parent revision, or decision changed after approval |
| Readiness Route | GAP_ANALYSIS | Explicitly approved Gap Analysis supplies the current Gap Report and applicable OQs |
| Readiness Route | DIRECT_SOURCE_CHECK | A passing readiness check embedded in the locked Viewpoint permits design without Gap Analysis |
| Validation State | STATIC_VALID | Structure, IDs, links, traceability, and required fields pass static checks |
| Validation State | AUTOMATION_ELIGIBLE | Test intent can be automated without changing its meaning |
| Validation State | RUNTIME_READY | Environment, route, auth, fixture, cleanup, runner, and dependencies are verified, with no unresolved OQ blocking from DESIGN, EXPORT, or EXECUTION |

## 3. Source Manifest

| Source | Section or ID | Approval State | Revision or Hash | Role |
|---|---|---|---|---|
| <exact source link or external locator> | <source refs> | <verified approval> | <revision or hash> | Governing requirement |
| <exact parent Viewpoint link> | <selected leaf IDs> | LOCKED | <locked revision> | Immediate parent |

## 4. Test Design Basis

| Leaf VP ID | Coverage Item | Coverage Target | Denominator or Selection Rule | Test Design Technique | Rationale | TC IDs | Status or Blocked Reason |
|---|---|---|---|---|---|---|---|
| <locked leaf VP link> | <enumerated items> | <proposed measurable target> | <reproducible inclusion rule> | <used TDT IDs> | <risk, priority, and selection basis> | <planned TC IDs> | <source-backed design state or blocker> |

## 5. Test Case Table

Expected Result presentation: CASE_OUTCOME.

| TC ID | Module | Risk | Title | Preconditions | Test Data | Steps | Expected Results | Source Trace | VP ID | Priority | Automation Eligibility | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-<SCOPE-CODE>-001 | <source module> | <risk> | <specific primary objective> | <case-specific initial state> | <concrete synthetic values> | 1. <actor, surface, action> | <source-backed overall outcome after all steps, including its necessary conditions> | <exact source links and refs> | <primary locked leaf link> | <priority> | <eligibility> | <approved tags or blank> |

## 6. Traceability and Coverage Reconciliation

| Requirement Ref | High-Level VP ID | Leaf VP ID | Coverage Item | TC ID | Steps | Expected Results |
|---|---|---|---|---|---|---|
| <exact source ref> | <parent VP link> | <leaf VP link> | <one claimed item> | <TC ID> | <step numbers exercising item> | <exact outcome condition or step-linked checkpoint proving item> |

| Leaf VP ID | Technique ID | Coverage Target | Planned Items | Covered Items | Blocked Items | TC IDs | Reconciliation Rationale |
|---|---|---|---|---|---|---|---|
| <leaf VP link> | <TDT ID> | <approved target> | <count and item set> | <count and item set> | <count and item set> | <TC IDs> | <target reached, omission, or blocker basis> |

## 7. Coverage Totals

| Dimension | Numerator | Denominator | Inclusion Rule | Blocked | Approved Exclusions or Waivers |
|---|---|---|---|---|---|
| <AC, business rule, NFR, impact/regression, high-level VP, leaf VP, or design target> | <covered count> | <declared total> | <source inventory or selection rule> | <count and refs> | <refs and decision basis or None> |

## 8. Blocked Scope and Omissions

| Requirement or Leaf VP Ref | OQ ID or Decision Ref | Missing Evidence or Omission | Coverage Impact | Next Phase |
|---|---|---|---|---|
| <blocked ref> | <existing exact OQ or approved exclusion> | <source-backed reason> | <explicit uncovered items> | <readiness owner> |

## 9. Design Readiness

| Validation State | Evidence or Limitation |
|---|---|
| <state justified by checks> | <structure, traceability, and coverage checks actually completed> |

<State runtime and execution limits; design does not prove runtime readiness or executed results.>

## 10. Review History

| Revision | Date | Change | Reviewer |
|---|---|---|---|
| <revision> | <actual date> | <approved change, target decision, and unresolved return count when applicable> | <actual reviewer when known> |
```

## Table Invariants

The `VP ID` column identifies one primary locked leaf and remains compatible with downstream tools.
Coverage claimed for an item requires both the numbered action Steps and an exact source-backed outcome condition or, in checkpoint mode, an explicit step-linked expectation.
The Traceability table identifies the actual condition text or an unambiguous reference to it; do not require numbered Expected Results in the default presentation.
Keep the canonical `Expected Results` column name for compatibility with existing downstream tools; the plural header does not require multiple step behaviors.
Blocked design items have no executable TC IDs.
Keep Viewpoint mapping, achieved design coverage, and runtime results separate.
Do not add Objective, Fixture ID, Automatable, Auto Type, or mutable execution columns to the canonical Test Case Table.
