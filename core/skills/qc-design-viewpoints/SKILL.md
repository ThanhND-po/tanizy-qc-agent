---
name: qc-design-viewpoints
description: "Design and jointly review source-backed Test Viewpoints, coverage, priority, and blocked scope before Test Case design. Use when the user asks to design QC viewpoints, review testing angles, or lock a Viewpoint revision, with either an approved Gap Analysis or a direct source-readiness check."
---

# Design Test Viewpoints

Create a compact, traceable set of testing angles between requirements and Test Cases. Do not create Test Cases in this skill.

## Definitions and Boundary

A Test Viewpoint is a source-backed, risk-oriented statement of what aspect of
a named test item must be covered and why. In this package, it is closest to an
ISTQB test condition, but it is not a Test Case.

A Viewpoint may identify a business rule, boundary, state, role, interaction,
failure mode, or quality characteristic. It must not contain executable Steps,
concrete Test Data, detailed Preconditions, or step-level Expected Results.
Classify the named test item with a context-appropriate type such as UI field,
UI component, flow, API, batch, integration, or non-functional characteristic.
Do not force non-UI items into a UI component taxonomy.

A Test Case is an atomic, reproducible verification derived from one locked
Viewpoint. It contains Preconditions, concrete Test Data, Actions or Steps, and
observable Expected Results. One Viewpoint may produce one or more Test Cases.
Every Test Case must trace to one primary locked Viewpoint.

| Boundary | Test Viewpoint | Test Case |
|---|---|---|
| Primary question | What must be covered, and why? | How is it verified, with which data and expected outcome? |
| Test activity | Test analysis | Test design |
| Required detail | Test item, condition or risk, priority, rationale, source | Preconditions, Test Data, Steps, Expected Results, source, VP ID |
| Directly executable | No | Yes |

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` and
`references/viewpoint-catalog.md`. Use the confirmed scope key across every
artifact that exists for the workstream.

When UI fields or interactive UI components are in scope, also read:

- `qc/config/field-validation-checklist.md` for input and data-entry controls;
- `qc/config/ui-component-checklist.md` for display, navigation, and composite
  components.

Do not require these UI checklists for an API-only, batch-only, or backend-only
scope with no UI test item.

## Required Inputs

- Approved requirement sources with exact paths and refs;
- One approved readiness route: `GAP_ANALYSIS` or `DIRECT_SOURCE_CHECK`;
- `qc/gap-reports/<scope-key>-gap-report.md` only for `GAP_ANALYSIS`;
- `qc/open-questions.md` when it exists or the selected route references OQs;
- Relevant System Context and Bug Base, when available.

## Readiness Routing

Use `GAP_ANALYSIS` when an approved Gap Report already exists or the user
explicitly requests that phase. Require its gate to be `READY` or `PARTIAL`.
Stop when its gate is `STOP` or its revision is stale.

Use `DIRECT_SOURCE_CHECK` when the user requests Viewpoint design without Gap
Analysis. Do not require or create a Gap Report. Check only whether the selected
scope has enough approved evidence for Viewpoint design:

- A named test item;
- A trigger, action, event, or input;
- An observable expected outcome or test oracle;
- The data or rule needed to determine that outcome;
- Actor, permission, precondition, initial state, and state transition when the
  behavior depends on them;
- No unreadable governing source, unresolved conflict, or OQ that blocks from
  `DESIGN`.

The direct check has only `PASS` or `FAIL`. On `PASS`, assign `Design Gate =
READY`, record `Gap Analysis = NOT_RUN`, and continue. This means the source is
sufficient for the selected Viewpoint scope; it does not mean that no gaps
exist. On `FAIL`, do not assign `PARTIAL` or create findings, OQs, a Gap Report,
or affected Viewpoints. Assign `Design Gate = STOP` for the attempted scope,
report coverage as `0/0`, report the exact blocker, and propose `qc-gap-finder`
as a separately approved handoff.

For a `PARTIAL` gate from `GAP_ANALYSIS`, design only the source-backed subset.
List each blocked requirement separately and do not create a provisional
Viewpoint for behavior whose Expected Result is unknown.

Treat unresolved OQs with `Blocks From Phase = DESIGN` as design blockers. An execution-only blocker does not erase source-backed design coverage.

## Workflow

1. Confirm and record the readiness route.
2. For `GAP_ANALYSIS`, validate the approved Gap Report revision and gate. For `DIRECT_SOURCE_CHECK`, perform the bounded readiness check above.
3. Build a source inventory of ACs, business rules, NFRs, state transitions, roles, impact/regression items, and explicit user decisions.
4. Inventory named test items and classify each item type. For UI scope, select the field or UI component checklist that matches each item.
5. Classify every relevant checklist check as `DEFINED`, `SPEC_GAP`, `NOT_APPLICABLE`, or `OUT_OF_SCOPE` using the checklist contract.
6. Derive only source-backed Viewpoints from `DEFINED` checks and relevant catalog families. Do not copy either reference as a generic checklist or create one Viewpoint per bullet automatically.
7. If analysis reveals a new `SPEC_GAP` or conflict that blocks from `DESIGN`, stop the affected scope. Under `GAP_ANALYSIS`, return it to `qc-gap-finder` because the parent report is incomplete or stale. Under `DIRECT_SOURCE_CHECK`, report the blocker and propose that skill. Do not create an OQ or Gap Report in this skill.
8. Require an approved scope decision or waiver for `OUT_OF_SCOPE`; do not treat it as `NOT_APPLICABLE`.
9. Merge checks only when they cover one coherent test condition or risk. Split a Viewpoint when its child Test Cases would require unrelated test items, rules, states, roles, or quality characteristics.
10. Give every Viewpoint a stable `VP-<SCOPE-CODE>-NNN` ID, named test item, item type, coverage intent, type, priority, rationale, and exact source refs.
11. Calculate coverage totals separately for AC, business rule, NFR, and impact/regression dimensions.
12. List blocked items and their existing OQ IDs outside the Viewpoint table when the route is `GAP_ANALYSIS` with a `PARTIAL` gate.
13. Draft the readiness basis, Test Item Inventory, Viewpoint table, and coverage summary in chat.
14. Ask the user to merge, split, reprioritize, add, drop, or approve items.
15. Recalculate coverage after every adjustment.
16. Obtain approval for the locked content and exact path.
17. Write `qc/test-viewpoints/<scope-key>-viewpoints.md` as the locked revision.

Dropping a source-backed Viewpoint requires an explicit waiver and must not be reported as covered.

## File Structure

```markdown
# Test Viewpoints: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Readiness Route | Design Gate | Gap Analysis | Parent Gap Revision | Blocking OQs | Approved By | Approved At |

## 2. Source Manifest
| Source path | Section or ID | Revision or hash |

## 3. Readiness Basis
| Route | Check or Parent Artifact | Result | Notes |

## 4. Test Item Inventory
| Test Item | Item Type | Source Refs | Scope Status | Checklist | Notes |

## 5. Viewpoint Table
| VP ID | Test Item | Item Type | Coverage Intent | Type | Priority | Source Refs | Rationale |

## 6. Coverage
| Dimension | Covered | Total | Blocked | Coverage % |

## 7. Blocked Scope
| Test Item or Requirement Ref | Checklist Check or Missing Behavior | OQ ID | Missing Evidence |

## 8. Review History
| Revision | Date | Change | Reviewer |
```

Use relative Markdown links for project-local sources and every existing project
artifact referenced by the file. For `GAP_ANALYSIS`, link the parent Gap Report
and applicable OQ ledger. For `DIRECT_SOURCE_CHECK`, set `Gap Analysis` and
`Parent Gap Revision` to `NOT_RUN` and `NOT_APPLICABLE`; do not create fake
links. Preserve an approved external source as its exact `external,
non-portable` locator.

Use `IN_SCOPE`, `PARTIAL`, `BLOCKED_SPEC`, or `OUT_OF_SCOPE` for Test Item
Inventory scope status. Use `FIELD`, `UI_COMPONENT`, or `NONE` in its Checklist
column. Keep the check-level `DEFINED`, `SPEC_GAP`, `NOT_APPLICABLE`, and
`OUT_OF_SCOPE` classifications in the working analysis; summarize gaps and
exclusions in Blocked Scope rather than copying the full project checklist into
the locked artifact.

## Quality Gates

- Every Viewpoint has at least one exact source ref.
- The artifact records exactly one readiness route and its evidence.
- `DIRECT_SOURCE_CHECK` is locked only with `PASS`, `READY`, and `Gap Analysis = NOT_RUN`.
- `GAP_ANALYSIS` links an approved `READY` or `PARTIAL` parent revision.
- Every Viewpoint names its test item, item type, and one coherent coverage intent.
- No Viewpoint contains executable Steps, concrete Test Data, or step-level Expected Results.
- Every covered source item maps to at least one Viewpoint.
- Every relevant `DEFINED` checklist check maps to a Viewpoint when UI is in scope.
- Every `SPEC_GAP` check stops the affected design scope, with no provisional Viewpoint.
- Every `OUT_OF_SCOPE` check has an approved scope decision or waiver.
- Blocked items are excluded from the covered numerator.
- Coverage denominators are explicit and reproducible.
- The revision is `LOCKED` only after explicit user approval.
- All relative links resolve.

## Rules

- Keep requirements and gap findings unchanged.
- Do not turn Open Questions into assumed Viewpoints.
- Do not claim `No gaps` when Gap Analysis was not run.
- Write only after the Persist and Lock Gates pass.
