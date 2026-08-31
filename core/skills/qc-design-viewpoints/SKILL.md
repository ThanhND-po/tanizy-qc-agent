---
name: qc-design-viewpoints
description: "Understand the test target, discover and decompose source-backed Test Viewpoints, review coverage and priority, and lock leaf Viewpoints before Test Case design. Use when the user asks to analyze testing angles, design QC viewpoints, or lock a Viewpoint revision, with either an approved Gap Analysis or a direct source-readiness check."
---

# Design Test Viewpoints

Model the test target, discover the relevant testing lenses, and decompose them into a compact, traceable set of leaf Viewpoints.
Do not design Test Cases in this skill.

## Definitions and Phase Boundary

Test Analysis answers **what must be tested and why**.
Its inputs are the approved Test Basis, Test Objective, and relevant product risks.
Its output in this package is a locked hierarchy of Test Viewpoints, with leaf Viewpoints acting as source-backed test conditions.

A Test Target Model describes the feature or business value, test level, stakeholders or users, test objects, test items, lifecycle impact, data, versions, integrations, environments, and product risks that bound the analysis.
It separates where the feature exists from the lenses used to examine it.

A high-level Viewpoint names one relevant lens or coverage area, such as function, data, boundary, state, timing, interaction, user, environment, integration, migration, compatibility, regression, or a quality characteristic.
A leaf Viewpoint decomposes that lens into one specific, traceable condition or risk for a named test item.

A leaf Viewpoint must state what needs to be demonstrated.
It must not choose a coverage target, Test Design Technique, representative Test Data, concrete execution setup, numbered Steps, or step-level Expected Results.
Those belong to Test Case Design.

A Test Case answers **how the locked leaf Viewpoint will be verified**.
It may contain Preconditions, concrete Test Data, Actions or Steps, and observable Expected Results.
One leaf Viewpoint may produce one or more Test Cases.
Every Test Case must trace to one primary locked leaf Viewpoint.

| Boundary | Test Viewpoint | Test Case |
|---|---|---|
| Primary question | What must be covered, and why? | How is it verified, with which coverage, data, and expected outcome? |
| Test activity | Test Analysis | Test Design |
| Required detail | Target, test item, lens, condition or risk, priority, rationale, source or risk basis | Coverage item, coverage target, technique, Preconditions, Test Data, Steps, Expected Results, source, leaf VP ID |
| Directly executable | No | Yes |

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` and the package-managed `references/viewpoint-discovery-guide.md`.
When the project provides `qc/config/viewpoint-discovery-extension.md`, read it after the canonical guide, confirm its revision for the selected scope, and treat it only as a project-specific extension.

The guide and extension are discovery heuristics, not requirement or design sources.
They may identify questions to ask but cannot define a business rule, limit, error, state transition, Expected Result, or scope decision.
Only an approved source or explicit recorded decision can provide that evidence.

Record the exact guide locator and its package revision or file hash in the locked artifact.
Record the extension locator and revision or hash when it is used.
The optional extension must not copy the canonical guide wholesale.

Use the confirmed scope key across every artifact that exists for the workstream.

## Input Preflight

Apply the shared `Input Boundary and Source Discovery` contract before reading phase inputs.
If any required source locator or content is missing, stop with `BLOCKED_INPUT` in chat and ask the user to provide it or explicitly approve one bounded search root.
Do not search the current project, parent directories, sibling projects, the broader workspace, the user home directory, or an external location to discover missing input, and do not request broader filesystem permission for that purpose.
A feature name, module name, scope key, keyword, or prior project knowledge is context only, not a locator.
If the user does not know the locator, ask requirement clarification questions in chat and do not infer unstated behavior.

## Required Inputs

- Approved requirement sources with exact paths and refs;
- One approved readiness route: `GAP_ANALYSIS` or `DIRECT_SOURCE_CHECK`;
- `qc/gap-reports/<scope-key>-gap-report.md` only for `GAP_ANALYSIS`;
- `qc/open-questions.md` when it exists or the selected route references OQs;
- Relevant System Context and Bug Base, when available;
- Explicit product or test objectives when they are not already in an approved source.

## Readiness Routing

Use `GAP_ANALYSIS` when an approved Gap Report already exists or the user explicitly requests that phase.
Require its gate to be `READY` or `PARTIAL`.
Stop when its gate is `STOP` or its revision is stale.

Use `DIRECT_SOURCE_CHECK` when the user requests Viewpoint design without Gap Analysis.
Do not require or create a Gap Report.
Check only whether the selected scope has enough approved evidence for Viewpoint design:

- A named test item;
- A confirmed Test Objective or business value appropriate to the selected test level;
- A trigger, action, event, or input;
- An observable expected outcome or test oracle;
- The data or rule needed to determine that outcome;
- Actor, permission, precondition, initial state, and state transition when the behavior depends on them;
- A product-risk basis sufficient to prioritize the analysis, either from an approved source or a clearly labeled `QC_RISK_ASSESSMENT`;
- No unreadable governing source, unresolved conflict, or OQ that blocks from `DESIGN`.

The direct check has only `PASS` or `FAIL`.
On `PASS`, assign `Design Gate = READY`, record `Gap Analysis = NOT_RUN`, and continue.
This means the source is sufficient for the selected Viewpoint scope; it does not mean that no gaps exist.
On `FAIL`, do not assign `PARTIAL` or create findings, OQs, a Gap Report, or affected Viewpoints.
Assign `Design Gate = STOP` for the attempted scope, report coverage as `0/0`, report the exact blocker, and propose `qc-gap-finder` as a separately approved handoff.

For a `PARTIAL` gate from `GAP_ANALYSIS`, design only the source-backed subset.
List each blocked requirement separately and do not create a provisional Viewpoint for behavior whose test oracle is unknown.

Treat unresolved OQs with `Blocks From Phase = DESIGN` as design blockers.
An execution-only blocker does not erase source-backed design coverage.

## Workflow

1. Confirm and record the readiness route.
2. For `GAP_ANALYSIS`, validate the approved Gap Report revision and gate. For `DIRECT_SOURCE_CHECK`, perform the bounded readiness check above.
3. Build a source inventory of ACs, business rules, NFRs, state transitions, roles, impact or regression items, and explicit user decisions.
4. Build the Test Target Map. Separate feature and business value, product risks, test level, stakeholders or users, test objects, named test items, lifecycle impact, data, versions, integrations, and environments. Mark a QC risk assessment as `QC_RISK_ASSESSMENT`; do not present it as a sourced business rule.
5. Inventory named test items and classify each item type, parent object, and scope status. Do not force non-UI items into a UI taxonomy.
6. Use the discovery guide to select only relevant catalog IDs and item-type routes. Apply a project extension only when it exists, its revision is confirmed for the scope, and its provenance is recorded. Do not copy the guide as a generic checklist.
7. Classify every selected discovery prompt as `DEFINED`, `SPEC_GAP`, `NOT_APPLICABLE`, or `OUT_OF_SCOPE` using the guide contract.
8. Derive source-backed high-level Viewpoints from `DEFINED` prompts, Test Objectives, and supported product risks. Decompose each one into leaf Viewpoints that state one condition or risk for one named test item.
9. If analysis reveals a new `SPEC_GAP` or conflict that blocks from `DESIGN`, stop the affected scope. Under `GAP_ANALYSIS`, return it to `qc-gap-finder` because the parent report is incomplete or stale. Under `DIRECT_SOURCE_CHECK`, report the blocker and propose that skill. Do not create an OQ or Gap Report in this skill.
10. Require an approved scope decision or waiver for `OUT_OF_SCOPE`; do not treat it as `NOT_APPLICABLE`.
11. Merge prompts only when they express one coherent condition or risk. Split a leaf Viewpoint when its child Test Cases would require unrelated test items, rules, states, roles, or quality characteristics.
12. Give every Viewpoint a stable `VP-<SCOPE-CODE>-NNN` ID. Set `Parent VP ID = NONE` and `Level = HIGH_LEVEL` for a root Viewpoint. Set `Level = LEAF` and reference exactly one high-level parent for a leaf Viewpoint.
13. Build the Discovery Coverage Map from each selected guide or extension ID to its applicability decision and mapped leaf VP IDs. Preserve the material revision or hash used for this analysis.
14. Calculate coverage totals separately for AC, business rule, NFR, impact or regression, selected discovery prompts, and leaf Viewpoints.
15. List blocked items and their existing OQ IDs outside the Viewpoint table when the route is `GAP_ANALYSIS` with a `PARTIAL` gate.
16. Draft the readiness basis, Test Target Map, Test Item Inventory, Viewpoint Breakdown, Discovery Coverage Map, and coverage summary in chat.
17. Ask the user to merge, split, reprioritize, add, drop, or approve items.
18. Recalculate coverage after every adjustment. Viewpoint discovery and decomposition may iterate until the revision is approved.
19. Obtain approval for the locked content and exact path.
20. Write `qc/test-viewpoints/<scope-key>-viewpoints.md` as the locked revision.

Dropping a source-backed Viewpoint requires an explicit waiver and must not be reported as covered.
A new angle found after lock requires a new Viewpoint revision; do not mutate the locked revision through Test Case Design.

## File Structure

```markdown
# Test Viewpoints: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Readiness Route | Design Gate | Gap Analysis | Parent Gap Revision | Blocking OQs | Approved By | Approved At |

## 2. Source Manifest
| Source path | Section or ID | Revision or hash |

## 3. Discovery Material Manifest
| Material | Locator | Package Revision or File Hash | Role |

## 4. Readiness Basis
| Route | Check or Parent Artifact | Result | Notes |

## 5. Test Target Map
| Aspect | Confirmed Detail | Basis or Source | Status |

## 6. Test Item Inventory
| Test Item | Item Type | Parent Object | Source Refs | Scope Status | Applicable Guide IDs | Notes |

## 7. Viewpoint Breakdown
| VP ID | Parent VP ID | Level | Test Item | Item Type | Lens | Coverage Intent | Priority | Source, Objective, or Risk Trace | Rationale |

## 8. Discovery Coverage Map
| Guide or Extension ID | Test Item | Classification | Leaf VP IDs | Evidence or Exclusion Basis |

## 9. Coverage
| Dimension | Covered | Total | Blocked | Coverage % |

## 10. Blocked Scope
| Test Item or Requirement Ref | Guide ID or Missing Behavior | OQ ID | Missing Evidence |

## 11. Review History
| Revision | Date | Change | Reviewer |
```

Use relative Markdown links for project-local sources and every existing project artifact referenced by the file.
For `GAP_ANALYSIS`, link the parent Gap Report and applicable OQ ledger.
For `DIRECT_SOURCE_CHECK`, set `Gap Analysis` and `Parent Gap Revision` to `NOT_RUN` and `NOT_APPLICABLE`; do not create fake links.
Preserve an approved external source as its exact `external, non-portable` locator.

Use `IN_SCOPE`, `PARTIAL`, `BLOCKED_SPEC`, or `OUT_OF_SCOPE` for Test Item Inventory scope status.
Keep the selected prompt classifications in the locked Discovery Coverage Map so downstream phases can reproduce the handoff without running discovery again.
Do not copy unused catalog sections into the artifact.

## Quality Gates

- The Test Target Map distinguishes business value, target objects or items, users or stakeholders, impact boundaries, and product risks applicable to the scope.
- Every Viewpoint has at least one exact source, objective, or supported risk trace. The discovery guide is never used as the business source.
- Every leaf Viewpoint has an exact approved source or explicit recorded decision for its test oracle. A QC risk assessment may justify scope or priority but cannot replace that evidence.
- The artifact records exactly one readiness route and its evidence.
- `DIRECT_SOURCE_CHECK` is locked only with `PASS`, `READY`, and `Gap Analysis = NOT_RUN`.
- `GAP_ANALYSIS` links an approved `READY` or `PARTIAL` parent revision.
- The Discovery Material Manifest records the canonical guide revision or hash and any project extension used.
- Every high-level Viewpoint has at least one leaf child.
- Every leaf Viewpoint names one test item, one parent, one lens, and one coherent condition or risk.
- No leaf Viewpoint contains a coverage target, selected Test Design Technique, representative Test Data, numbered Steps, or step-level Expected Results.
- Every covered source item maps to at least one leaf Viewpoint.
- Every selected `DEFINED` discovery prompt maps to at least one leaf Viewpoint.
- Every `SPEC_GAP` prompt stops the affected design scope, with no provisional Viewpoint.
- Every `OUT_OF_SCOPE` prompt has an approved scope decision or waiver.
- Blocked items are excluded from the covered numerator.
- Coverage denominators are explicit and reproducible.
- The revision is `LOCKED` only after explicit user approval.
- All relative links resolve.

## Rules

- Keep requirements and gap findings unchanged.
- Do not turn Open Questions into assumed Viewpoints.
- Do not claim `No gaps` when Gap Analysis was not run.
- Do not create Test Cases, choose coverage targets, or apply Test Design Techniques in this skill.
- Write only after the Persist and Lock Gates pass.
