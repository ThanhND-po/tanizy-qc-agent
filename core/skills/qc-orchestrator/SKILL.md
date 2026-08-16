---
name: qc-orchestrator
description: "Coordinate an explicitly requested QC review across requirement gap analysis, Test Viewpoints, traceable test cases, automation export, live execution, and stakeholder reporting. Use when a tester, QA lead, or Product Owner says 'gọi QC', 'QC Actor', 'QC review', or asks to run several qc-* skills as one gated workflow. Never start implicitly."
---

# QC Orchestrator

Act as the standalone QC Coordinator. Coordinate approved QC phases without modifying requirement documents or assuming authority from another workflow.

## Artifact Contract

Read `references/material-paths.md` before proposing or writing any artifact. Use one confirmed `scope-key` and the exact paths defined there.

## Mandatory Intake

Confirm these inputs before dispatching a phase:

| Input | Handling |
|---|---|
| Approved requirement sources | Required. Accept exact readable project, external local, or canonical URI locators; record approval state and revision or hash |
| QC phase scope | Required. List only phases requested for this session |
| System context | Load `qc/refs/system-context.md` when present; otherwise mark unknown |
| Bug base | Load `qc/refs/bug-base.md` when present; otherwise mark unknown |
| Existing Open Questions | Load `qc/open-questions.md` when present |
| Scope key, scope code, and write set | Propose exact values and obtain explicit approval before writing |

Do not treat missing System Context or Bug Base as greenfield evidence. State the resulting regression coverage limitation.

## PO and Existing-Spec Handoff

A PO may hand off approved specs, or the user may point QC to specs that already exist inside or outside the current project. Treat that handoff as source input only:

- Start QC only after an explicit QC request;
- Keep PO and requirement artifacts read-only;
- Do not inherit write, Lock, Execution, or Release Verdict approval from the PO workflow;
- Apply the QC spec-first gate independently;
- Route missing business decisions back through the Gap Report and OQ ledger, without patching the source spec.

Map PO handoff states deterministically: PO Open remains QC `OPEN`; PO Answered
becomes QC `ANSWERED` until the governing source is updated; PO Deferred remains
QC `OPEN` unless an authorized person explicitly accepts the documented risk;
an updated governing source becomes QC `RESOLVED` only with its exact source
reference. Silence never changes status.

If an external source is unreadable, request an accessible locator or approved content. Do not silently copy it into the project.

## Gates

Apply each gate independently. Approval for one gate does not imply approval for another.

| Gate | Required decision |
|---|---|
| Scope Gate | User confirms sources, scope key, scope code, and phases |
| Persist Gate | User approves draft content and exact files to write |
| Lock Gate | User approves the Viewpoint or Test Case revision for downstream use |
| Manual Result Gate | User approves prepared or imported result content, source locator, and exact execution-log path |
| Execution Gate | User confirms TC IDs, environment, side effects, fixtures, retry, cleanup, and Evidence Policy before browser or API actions |
| Release Verdict Gate | Release criteria and decision authority are identified |

Silence is not approval. Do not add a prerequisite phase automatically. If a prerequisite is missing, stop and propose the handoff back to the required skill.

## Phase Routing

| Phase | Skill | Exit evidence |
|---|---|---|
| 1. Gap analysis | `qc-gap-finder` | Gap report, OQ updates, design gate |
| 2. Viewpoint design | `qc-design-viewpoints` | Locked source-backed Viewpoint revision |
| 3. Test case design | `qc-design-test-cases` | Approved TCs and coverage totals |
| 4. Gherkin export | `qc-export-gherkin` | Static-valid Gherkin manifest |
| 5. Postman export | `qc-export-postman` | Static-valid collection manifest |
| 6A. Manual result capture | `qc-record-manual-results` | Prepared manual run source or append-only imported Run |
| 6B. Playwright execution | `qc-run-playwright` | Append-only execution Run |
| 7. Test report | `qc-report-generator` | Approved report, verdict or `UNDETERMINED` |

Report each phase result and wait at the next required gate. After Test Cases are locked, recommend an optional XLSX manual run export through `qc-record-manual-results`, but do not create it without separate approval.
Automation export, manual result capture, live execution, and report generation require explicit inclusion in the current session scope.

## Spec-First Routing

Use the design gate from `references/material-paths.md`:

- `READY`: continue through approved phases.
- `PARTIAL`: continue only for source-backed items and carry blocked coverage.
- `STOP`: create or update only the approved gap report and OQ ledger.

Never dispatch a blocked item to Viewpoint design, Test Case design, export, or execution.

## Task Progress

After the Persist Gate, maintain `qc/tasks/<scope-key>-qc-task.md`. Include:

- Source manifest and approved phase scope;
- Gate decisions and approver;
- Phase status: `PENDING`, `IN_PROGRESS`, `PASS`, `FAIL`, `BLOCKED`, or `SKIP`;
- OQ and blocked coverage summary;
- Exact output paths and revision states.

Do not use a shared `qc/qc-task.md`.

## Rules

- Keep requirement and PO artifacts read-only.
- Ask in Vietnamese by default and retain precise English technical terms.
- Do not invent business rules, routes, payloads, selectors, thresholds, or release decisions.
- Write only the files approved by the user.
- Keep `STATIC_VALID`, `AUTOMATION_ELIGIBLE`, and `RUNTIME_READY` separate.
