---
name: qc-design-viewpoints
description: "Design and jointly review source-backed Test Viewpoints, coverage, priority, and blocked scope before Test Case design. Use when the user asks to design QC viewpoints, review testing angles, or lock a Viewpoint revision after an approved gap analysis."
---

# Design Test Viewpoints

Create a compact, traceable set of testing angles between requirements and Test
Cases. Do not create Test Cases in this skill.

## Artifact Contract

Read `references/material-paths.md` and
`references/viewpoint-catalog.md`. Use the same confirmed scope key as the gap
report.

## Required Inputs

- approved requirement sources with exact paths and refs;
- `qc/gap-reports/<scope-key>-gap-report.md`;
- `qc/open-questions.md`;
- relevant System Context and Bug Base, when available.

If gap analysis is missing, or its gate is `STOP`, stop and hand the task back
to `qc-gap-finder`. Do not start an unapproved prerequisite phase.

For a `PARTIAL` gate, design only the source-backed subset. List each blocked
requirement separately and do not create a provisional Viewpoint for behavior
whose Expected Result is unknown.

Treat unresolved OQs with `Blocks From Phase = DESIGN` as design blockers. An
execution-only blocker does not erase source-backed design coverage.

## Workflow

1. Build a source inventory of ACs, business rules, NFRs, state transitions,
   roles, impact/regression items, and explicit user decisions.
2. Derive only relevant Viewpoints from the catalog. Do not copy the catalog as
   a generic checklist.
3. Give every Viewpoint a stable `VP-<SCOPE-CODE>-NNN` ID, type, priority,
   rationale, and exact source refs.
4. Calculate coverage totals separately for AC, business rule, NFR, and
   impact/regression dimensions.
5. List blocked items and their OQ IDs outside the Viewpoint table.
6. Draft the full Viewpoint table and coverage summary in chat.
7. Ask the user to merge, split, reprioritize, add, drop, or approve items.
8. Recalculate coverage after every adjustment.
9. Obtain approval for the locked content and exact path.
10. Write `qc/test-viewpoints/<scope-key>-viewpoints.md` as the locked revision.

Dropping a source-backed Viewpoint requires an explicit waiver and must not be
reported as covered.

## File Structure

```markdown
# Test Viewpoints: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Parent Gap Revision | Blocking OQs | Approved By | Approved At |

## 2. Source Manifest
| Source path | Section or ID | Revision or hash |

## 3. Viewpoint Table
| VP ID | Viewpoint | Type | Priority | Source Refs | Rationale |

## 4. Coverage
| Dimension | Covered | Total | Blocked | Coverage % |

## 5. Blocked Scope
| Requirement Ref | OQ ID | Missing Evidence |

## 6. Review History
| Revision | Date | Change | Reviewer |
```

Use relative Markdown links for project-local sources, the gap report, OQ
ledger, and every existing project artifact referenced by the file. Preserve an
approved external source as its exact `external, non-portable` locator.

## Quality Gates

- Every Viewpoint has at least one exact source ref.
- Every covered source item maps to at least one Viewpoint.
- Blocked items are excluded from the covered numerator.
- Coverage denominators are explicit and reproducible.
- The revision is `LOCKED` only after explicit user approval.
- All relative links resolve.

## Rules

- Keep requirements and gap findings unchanged.
- Do not turn Open Questions into assumed Viewpoints.
- Ask in Vietnamese by default and retain exact IDs and technical terms.
- Write only after the Persist and Lock Gates pass.
