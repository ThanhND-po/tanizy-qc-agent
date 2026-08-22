---
name: qc-gap-finder
description: "Analyze approved requirement sources for applicable gaps, ambiguity, conflicts, risks, and missing testability evidence. Use when the user explicitly asks for QC gap analysis, requirement review from a QC perspective, unclear business rules, Open Questions, or approves a handoff after a direct Viewpoint readiness check fails. This skill is optional before Viewpoint design."
---

# QC Gap Finder

Identify what is stated, what is missing, and what must stop downstream design. Do not create Test Viewpoints or Test Cases in this skill.

Run this skill only when Gap Analysis is explicitly in the approved phase
scope. Do not treat it as a mandatory prerequisite for Test Viewpoint design.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` and
`references/open-questions-guide.md` before drafting. Use the approved scope key
for both the report and OQ rows.

## Inputs

| Input | Handling when missing |
|---|---|
| Approved requirement sources | Stop and request exact source paths |
| Existing OQ ledger | Load `qc/open-questions.md`; create from the installed seed only after approval |
| System context | Mark current behavior unknown and limit regression claims |
| Bug base | Mark known-bug coverage unavailable |
| Mockup, API, or technical sources cited by requirements | Verify a cited source only when it governs behavior in the approved scope; create a gap only when the missing source is needed for testability |

## Finding Classes

| Class | Meaning |
|---|---|
| `GAP` | Required behavior or evidence is absent |
| `AMB` | Wording allows more than one behavior |
| `CONFLICT` | Sources state incompatible behavior |
| `RISK` | A verified dependency, known bug, or current-state fact creates test risk |

Do not classify an unstated behavior as a safe assumption.

## Applicability

Do not turn a generic review category into a finding automatically. Classify a
candidate check before recording it:

| Applicability | Meaning |
|---|---|
| `APPLICABLE` | Required by an approved source, standard, test objective, dependency, or verified risk in scope |
| `NOT_APPLICABLE` | The item type or behavior makes the check irrelevant |
| `OUT_OF_SCOPE` | The check could apply, but the approved scope excludes it |

Only absent or unclear `APPLICABLE` evidence may become `GAP`, `AMB`, or
`CONFLICT`. Record the basis for `OUT_OF_SCOPE`; do not relabel it as
`NOT_APPLICABLE`. Review security, accessibility, performance, concurrency, and
other quality characteristics only when they are applicable to the approved
scope.

## Blocking Decision

Assign the earliest affected phase in `Blocks From Phase`:

| Value | Use when unresolved evidence first prevents |
|---|---|
| `DESIGN` | A source-backed Viewpoint or Test Case |
| `EXPORT` | A faithful Gherkin or Postman artifact |
| `EXECUTION` | A safe, reproducible live run |
| `REPORT` | A requested report claim or release verdict |
| `NONE` | No approved phase is blocked |

Use `DESIGN` when an applicable unresolved finding affects any of these:

- Actor or permission;
- Precondition, initial state, action, or state transition;
- Observable Expected Result or error behavior;
- Test Data rule, threshold, format, or character set;
- API method, endpoint, request/response contract for API design;
- Conflict that makes the intended workflow indeterminate.

Use `EXECUTION`, not `DESIGN`, when test intent is fully defined but route, auth, fixture, cleanup, environment, or runtime tools are unverified. Use the earliest phase and list exact impacted artifacts when more than one phase is affected.

Non-blocking wording or presentation gaps may remain open, but they cannot be used as assertions. A user answer counts only when it is explicit and recorded with its decision source. Silence never resolves an OQ.

## Workflow

1. Confirm Gap Analysis is explicitly requested and record `Readiness Route = GAP_ANALYSIS`.
2. Inventory exact source paths, sections, identifiers, approval states, and in-scope source items. Establish the coverage denominator before assigning a gate. Verify the confirmed scope code is not assigned to another scope.
3. Scan applicable validation, boundaries, states, roles, integrations, data ownership, errors, concurrency, security, accessibility, performance, audit, and known regressions.
4. Classify candidate checks as `APPLICABLE`, `NOT_APPLICABLE`, or `OUT_OF_SCOPE` before creating findings.
5. Reuse an existing Finding ID when the same intent recurs. Otherwise assign the next stable `FND-<SCOPE-CODE>-NNN`; never renumber or reuse a retired ID for different intent.
6. Record each finding with source evidence, applicability basis, `Blocks From Phase`, and affected downstream artifacts.
7. Create or update an OQ only when a decision or governing source is required. Keep Finding Class separate from Question Domain, apply the PO to QC status mapping from `references/open-questions-guide.md`, and use `-` as OQ ID for a finding that needs no decision.
8. Assign the scope design gate: `READY` when every in-scope behavior is testable. `PARTIAL` when only a source-backed subset can proceed. `STOP` when no testable workflow exists or a critical conflict invalidates the flow.
9. When no findings exist, keep Findings as `None`, leave the OQ ledger unchanged, and assign `READY` only when the source inventory and coverage denominator prove every in-scope item is testable.
10. Draft the gap report and proposed OQ changes in chat.
11. Obtain approval for content and exact paths.
12. Write `qc/gap-reports/<scope-key>-gap-report.md` and only the approved OQ rows.
13. Validate relative links, scope key, stable Finding and OQ IDs, and coverage totals.

Ask blocking questions first. Group related questions in one concise review when this is clearer, but keep one decision per OQ row.

## Gap Report Structure

```markdown
# Gap Report: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Readiness Route | Approved By | Approved At |

## 2. Decision Summary
Design gate: READY | PARTIAL | STOP

## 3. Source Manifest
| Source path | Section or ID | Approval state | Revision or hash |

## 4. Findings
| Finding ID | Source Ref | Class | Finding | Applicability Basis | Priority | Blocks From Phase | OQ ID |

## 5. Open Questions Added or Updated
| OQ ID | Finding Class | Question Domain | Question | Owner | Target Date | Status | Blocks From Phase | Impacted Artifacts |

## 6. Source-Backed Scope Allowed to Continue
| Requirement Ref | Evidence | Allowed Next Phase |

## 7. Blocked Coverage
| Requirement Ref | Missing Evidence | Required Answer or Source |

## 8. Coverage Totals
| Dimension | Source Items | Testable | Blocked |
```

Use relative Markdown links for project-local source paths and any impacted artifact that already exists. For an approved external source, record the exact locator and `external, non-portable` status from the artifact contract. Keep proposed paths as code until they exist.

If there are no findings, write `None` in the Findings section. Do not create a
placeholder Finding or OQ to prove that the analysis occurred.

When the scope has no testable behavior, report `0/0` and do not create placeholder cases or automation artifacts.

## Reference Integrity

- Keep hypotheses in the gap report or OQ ledger.
- Add System Context only from an approved source or verified runtime evidence.
- System Context cannot override an approved requirement. Route conflicts to
  the Gap Report and OQ ledger.
- Add Bug Base rows only for verified known defects or observed failures with
  evidence. The evidence locator may be external.
- Do not create `Bug ID = TBD` from a risk hypothesis.
- Obtain separate approval before changing refs not already in the write set.

## Rules

- Keep requirement documents read-only.
- Do not invent options as decisions. Label proposed options as proposals.
- Do not continue blocked behavior to downstream skills.
- Do not claim Gap Analysis was performed when the readiness route was `DIRECT_SOURCE_CHECK`.
