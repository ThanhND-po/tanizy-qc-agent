---
name: qc-gap-finder
description: "Analyze approved requirement sources for applicable gaps, ambiguity, conflicts, risks, and missing testability evidence. Use when the user explicitly asks for QC gap analysis, requirement review from a QC perspective, unclear business rules, Open Questions, or approves a handoff after a direct Viewpoint readiness check fails. This skill is optional before Viewpoint design."
---

# QC Gap Finder

Identify what is stated, what is missing, and what must stop downstream design.
Do not create Test Viewpoints or Test Cases in this skill.

Run this skill only when Gap Analysis is explicitly in the approved phase scope.
Do not treat it as a mandatory prerequisite for Test Viewpoint design.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` and `references/open-questions-guide.md` before drafting.
Read [references/context-templates.md](references/context-templates.md) only when verified context or Bug Base updates are explicitly included in the write set.
Use the approved scope key for both the report and OQ rows.

## Input Preflight

Resolve `qc/` paths from the confirmed project root and `references/` or `scripts/` paths from this loaded skill directory, never from an assumed working directory.
If the project root is unclear, ask for it without filesystem discovery.
If the shared contract or a required package reference/helper is missing or unreadable, stop the affected phase with `BLOCKED_INSTALLATION` in chat, name the exact path, and request repair with the installer; do not search for substitutes or reconstruct the contract from memory.
After loading the contract, apply `Path Resolution and Recovery` to moved or deleted project inputs.

Apply `Input Boundary and Source Discovery` and `Read Scope and Template Sources` in `qc/config/material-paths.md` before reading phase inputs.
Use only the current approved intake, handoff, and the fixed-path checks listed below; never open historical artifacts to learn formatting.
For a missing required locator or content, report `BLOCKED_INPUT` in chat and request the exact input or explicit approval for one bounded search root.
Optional inputs stay optional; reuse confirmed locators and approvals from the current workstream.

## Inputs

| Input | Handling when missing |
|---|---|
| Approved requirement sources | Stop with `BLOCKED_INPUT` and request an exact locator or pasted content |
| Existing OQ ledger | Load relevant rows at `qc/open-questions.md` when present; for a confirmed new ledger, draft from `references/open-questions-guide.md` only after approval. If an expected ledger was moved or deleted, apply Path Resolution and Recovery before creating a replacement |
| System context | Select relevant rows at `qc/refs/system-context.md` when present; otherwise mark current behavior unknown and limit regression claims |
| Bug base | Select relevant rows at `qc/refs/bug-base.md` when present; otherwise mark known-bug coverage unavailable |
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

Do not turn a generic review category into a finding automatically.
Classify a candidate check before recording it:

| Applicability | Meaning |
|---|---|
| `APPLICABLE` | Required by an approved source, standard, test objective, dependency, or verified risk in scope |
| `NOT_APPLICABLE` | The item type or behavior makes the check irrelevant |
| `OUT_OF_SCOPE` | The check could apply, but the approved scope excludes it |

Only absent or unclear `APPLICABLE` evidence may become `GAP`, `AMB`, or `CONFLICT`.
Record the basis for `OUT_OF_SCOPE`; do not relabel it as `NOT_APPLICABLE`.
Review security, accessibility, performance, concurrency, and other quality characteristics only when they are applicable to the approved scope.

For security, reuse the approved inclusion or exclusion and its decision ref; if inclusion is undecided and affects coverage, request a focused scope decision before analyzing that security scope.
An explicit exclusion permits downstream omission of security cases and does not create a security-only Finding, OQ, or blocker.
For included security objectives, an approved project security baseline with exact applicable control refs may supply an oracle even when the feature specification does not repeat it.
Check whether the included actors or untrusted inputs, assets, trust boundaries, processing or output contexts, allowed and forbidden behavior, and observation basis are defined.
Do not treat a broad statement such as `secure input` or `prevent injection` as sufficient evidence for every rendering, query, interpreter, authorization, and disclosure outcome.
Missing included behavior or policy is a design gap; missing environment, fixture, auth, or runtime tooling alone follows the execution-blocker rule below.
The scope decision and baseline locators remain subject to the existing Input Boundary; a security review does not authorize source discovery or live attack execution.

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

Use `EXECUTION`, not `DESIGN`, when test intent is fully defined but route, auth, fixture, cleanup, environment, or runtime tools are unverified.
Use the earliest phase and list exact impacted artifacts when more than one phase is affected.

Non-blocking wording or presentation gaps may remain open, but they cannot be used as assertions.
A user answer counts only when it is explicit and recorded with its decision source.
Silence never resolves an OQ.

## Workflow

1. Confirm Gap Analysis is explicitly requested and record `Readiness Route = GAP_ANALYSIS`.
2. Inventory exact source paths, sections, identifiers, approval states, and in-scope source items. Establish the coverage denominator before assigning a gate. For a new scope code, apply the shared metadata-only collision check; reuse a code already confirmed in the current handoff.
3. Scan applicable validation, boundaries, states, roles, integrations, data ownership, errors, concurrency, security, accessibility, performance, audit, and known regressions.
4. Classify candidate checks as `APPLICABLE`, `NOT_APPLICABLE`, or `OUT_OF_SCOPE` before creating findings.
5. Reuse an existing Finding ID when the same intent recurs. Otherwise assign the next stable `FND-<SCOPE-CODE>-NNN`; never renumber or reuse a retired ID for different intent.
6. Record each finding with source evidence, applicability basis, `Blocks From Phase`, and affected downstream artifacts.
7. Create or update an OQ only when a decision or governing source is required. Keep Finding Class separate from Question Domain, apply the PO to QC status mapping from `references/open-questions-guide.md`, and use `-` as OQ ID for a finding that needs no decision.
8. Assign the scope design gate: `READY` when every in-scope behavior is testable. `PARTIAL` when only a source-backed subset can proceed. `STOP` when no testable workflow exists or a critical conflict invalidates the flow.
9. Reconcile every controlled value with the reader-facing Legends. Because the Finding Class, Applicability, Blocks From Phase, and Design Gate vocabularies each contain seven or fewer canonical values, include each complete vocabulary even when the current report uses only a subset.
10. When no findings exist, keep Findings as `None`, leave the OQ ledger unchanged, and assign `READY` only when the source inventory and coverage denominator prove every in-scope item is testable.
11. Draft the gap report and proposed OQ changes in chat using the reader-facing language confirmed at the Scope Gate.
12. Obtain approval for content and exact paths.
13. Write `qc/gap-reports/<scope-key>-gap-report.md` and only the approved OQ rows.
14. Validate narrative language, relative links, scope key, stable Finding and OQ IDs, coverage totals, and Legend synchronization.

Ask blocking questions first.
Group related questions in one concise review when this is clearer, but keep one decision per OQ row.

## Gap Report Structure

```markdown
# Gap Report: <Scope Key>

## 1. Artifact Header
| Scope Key | Scope Code | Artifact Type | Revision | State | Readiness Route | Approved By | Approved At |

## 2. Decision Summary
Design gate: READY | PARTIAL | STOP

## 3. Legends
### 3.1 Finding Class Legend
| Finding Class | Meaning |
### 3.2 Applicability Legend
| Applicability | Meaning |
### 3.3 Blocks From Phase Legend
| Value | Meaning |
### 3.4 Design Gate Legend
| Design Gate | Meaning |

## 4. Source Manifest
| Source path | Section or ID | Approval state | Revision or hash |

## 5. Findings
| Finding ID | Source Ref | Class | Finding | Applicability Basis | Priority | Blocks From Phase | OQ ID |

## 6. Open Questions Added or Updated
| OQ ID | Finding Class | Question Domain | Question | Owner | Target Date | Status | Blocks From Phase | Impacted Artifacts |

## 7. Source-Backed Scope Allowed to Continue
| Requirement Ref | Evidence | Allowed Next Phase |

## 8. Blocked Coverage
| Requirement Ref | Missing Evidence | Required Answer or Source |

## 9. Coverage Totals
| Dimension | Source Items | Testable | Blocked |
```

Use relative Markdown links for project-local source paths and any impacted artifact that already exists.
For an approved external source, record the exact locator and `external, non-portable` status from the artifact contract.
Keep proposed paths as code until they exist.

If there are no findings, write `None` in the Findings section.
Do not create a placeholder Finding or OQ to prove that the analysis occurred.

When the scope has no testable behavior, report `0/0` and do not create placeholder cases or automation artifacts.

## Reference Integrity

- Keep hypotheses in the gap report or OQ ledger.
- Add System Context only from an approved source or verified runtime evidence.
- System Context cannot override an approved requirement. Route conflicts to the Gap Report and OQ ledger.
- Add Bug Base rows only for verified known defects or observed failures with evidence. The evidence locator may be external.
- Do not create `Bug ID = TBD` from a risk hypothesis.
- Obtain separate approval before changing refs not already in the write set.

## Rules

- Keep requirement documents read-only.
- Write explanatory findings, applicability bases, summaries, questions, allowed scope, blocked coverage, and coverage notes in the Scope Gate language. Preserve exact technical and business terms, IDs, paths, fields, source literals, and controlled values.
- Do not add an artifact-language field to the Gap Report header.
- Do not invent options as decisions. Label proposed options as proposals.
- Do not continue blocked behavior to downstream skills.
- Do not claim Gap Analysis was performed when the readiness route was `DIRECT_SOURCE_CHECK`.
- Do not approve a Gap Report with a controlled value missing from its governing Legend or with `LEGEND_UNDEFINED_VALUE` unresolved.
