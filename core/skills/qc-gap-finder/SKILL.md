---
name: qc-gap-finder
description: "Analyze approved requirement sources for gaps, ambiguity, conflicts, risks, and missing testability evidence. Use when the user asks for QC gap analysis, requirement review from a QC perspective, unclear business rules, Open Questions, or a spec-first readiness decision before Viewpoint or Test Case design."
---

# QC Gap Finder

Identify what is stated, what is missing, and what must stop downstream design. Do not create Test Viewpoints or Test Cases in this skill.

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
| Mockup, API, or technical sources cited by requirements | Verify the cited files exist; otherwise create a gap |

## Finding Classes

| Class | Meaning |
|---|---|
| `GAP` | Required behavior or evidence is absent |
| `AMB` | Wording allows more than one behavior |
| `CONFLICT` | Sources state incompatible behavior |
| `RISK` | A verified dependency, known bug, or current-state fact creates test risk |

Do not classify an unstated behavior as a safe assumption.

## Blocking Decision

Assign the earliest affected phase in `Blocks From Phase`:

| Value | Use when unresolved evidence first prevents |
|---|---|
| `DESIGN` | A source-backed Viewpoint or Test Case |
| `EXPORT` | A faithful Gherkin or Postman artifact |
| `EXECUTION` | A safe, reproducible live run |
| `REPORT` | A requested report claim or release verdict |
| `NONE` | No approved phase is blocked |

Use `DESIGN` when an unresolved finding affects any of these:

- Actor or permission;
- Precondition, initial state, action, or state transition;
- Observable Expected Result or error behavior;
- Test Data rule, threshold, format, or character set;
- API method, endpoint, request/response contract for API design;
- Conflict that makes the intended workflow indeterminate.

Use `EXECUTION`, not `DESIGN`, when test intent is fully defined but route, auth, fixture, cleanup, environment, or runtime tools are unverified. Use the earliest phase and list exact impacted artifacts when more than one phase is affected.

Non-blocking wording or presentation gaps may remain open, but they cannot be used as assertions. A user answer counts only when it is explicit and recorded with its decision source. Silence never resolves an OQ.

## Workflow

1. Inventory exact source paths, sections, identifiers, and approval states. Verify the confirmed scope code is not assigned to another scope.
2. Scan validation, boundaries, states, roles, integrations, data ownership, errors, concurrency, security, accessibility, performance, audit, and known regressions.
3. Record each finding as `FND-<SCOPE-CODE>-NNN`, with source evidence, `Blocks From Phase`, and affected downstream artifacts.
4. Create or update OQ rows using the canonical schema. Keep Finding Class
   separate from Question Domain, and apply the PO to QC status mapping from
   `references/open-questions-guide.md`.
5. Assign the scope design gate: `READY` when every in-scope behavior is testable. `PARTIAL` when only a source-backed subset can proceed. `STOP` when no testable workflow exists or a critical conflict invalidates the flow.
6. Draft the gap report and proposed OQ changes in chat.
7. Obtain approval for content and exact paths.
8. Write `qc/gap-reports/<scope-key>-gap-report.md` and approved OQ rows.
9. Validate relative links, scope key, OQ IDs, and coverage totals.

Ask blocking questions first. Group related questions in one concise review when this is clearer, but keep one decision per OQ row.

## Gap Report Structure

```markdown
# Gap Report: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Approved By | Approved At |

## 2. Decision Summary
Design gate: READY | PARTIAL | STOP

## 3. Source Manifest
| Source path | Section or ID | Approval state | Revision or hash |

## 4. Findings
| Finding ID | Source Ref | Class | Finding | Priority | Blocks From Phase | OQ ID |

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
