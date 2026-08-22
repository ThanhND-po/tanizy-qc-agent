---
name: qc-orchestrator
description: "Coordinate an explicitly requested QC review across requirement gap analysis, Test Viewpoints, traceable test cases, automation export, live execution, and stakeholder reporting. Use when a tester, QA lead, or Product Owner says 'gọi QC', 'QC Actor', 'QC review', or asks to run several qc-* skills as one gated workflow. Never start implicitly."
---

# QC Orchestrator

Act as the standalone QC Coordinator. Coordinate approved QC phases without modifying requirement documents or assuming authority from another workflow.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md` before proposing or
writing any artifact. Use one confirmed `scope-key` and the exact paths defined
there.

## Mandatory Intake

Confirm these inputs before dispatching a phase:

| Input | Handling |
|---|---|
| Approved requirement sources | Required. Accept exact readable project, external local, or canonical URI locators; record approval state and revision or hash |
| QC phase scope | Required. List only phases requested for this session |
| Viewpoint readiness route | Required when Viewpoint design is requested: `GAP_ANALYSIS` or `DIRECT_SOURCE_CHECK` |
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
- When Gap Analysis is approved, route missing business decisions through the
  Gap Report and OQ ledger without patching the source spec. Under a direct
  Viewpoint route, stop and propose that handoff instead of creating those
  artifacts automatically.

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

Silence is not approval. Do not add a prerequisite phase automatically. Gap
Analysis is not a prerequisite for Viewpoint design when
`DIRECT_SOURCE_CHECK` passes. If another prerequisite is missing, stop and
propose the required handoff.

## Phase Routing

| Phase | Skill | Exit evidence |
|---|---|---|
| 1. Gap analysis, optional | `qc-gap-finder` | Gap report, applicable OQ updates, design gate |
| 2. Viewpoint design | `qc-design-viewpoints` | Readiness evidence and locked source-backed Viewpoint revision |
| 3. Test case design | `qc-design-test-cases` | Approved TCs and coverage totals |
| 4. Gherkin export | `qc-export-gherkin` | Static-valid Gherkin manifest |
| 5. Postman export | `qc-export-postman` | Static-valid collection manifest |
| 6A. Manual result capture | `qc-record-manual-results` | Prepared manual run source or append-only imported Run |
| 6B. Playwright execution | `qc-run-playwright` | Append-only execution Run |
| 7. Test report | `qc-report-generator` | Approved report, verdict or `UNDETERMINED` |

Report each phase result and wait at the next required gate. After Test Cases are locked, recommend an optional XLSX manual run export through `qc-record-manual-results`, but do not create it without separate approval.
Automation export, manual result capture, live execution, and report generation require explicit inclusion in the current session scope.

Playwright automation authoring is not an implemented phase. Do not route a
request to build, generate, scaffold, or maintain Playwright test code to
`qc-run-playwright`; that skill supports interactive execution only. Report the
current limitation as `UNSUPPORTED_AUTOMATION_AUTHORING` and reference deferred
enhancement `QC-AUTO-001`.

## Spec-First Routing

Select the readiness route from `qc/config/material-paths.md` before dispatching
Viewpoint design:

- `GAP_ANALYSIS`: dispatch `qc-gap-finder` only when explicitly requested.
  Continue with its `READY` or `PARTIAL` gate.
- `DIRECT_SOURCE_CHECK`: dispatch `qc-design-viewpoints` directly. Record the
  Gap Analysis phase as `SKIP` and Gap Analysis as `NOT_RUN`. A passing direct
  check produces `READY`; it does not prove that no gaps exist.

Use the resulting design gate:

- `READY`: continue through approved phases.
- `PARTIAL`: continue only for source-backed items and carry blocked coverage;
  this result is available only from approved `GAP_ANALYSIS`.
- `STOP`: do not dispatch downstream design. Create or update a Gap Report and
  OQ ledger only when that phase and write set are explicitly approved.

If `DIRECT_SOURCE_CHECK` fails, report the exact blocker and propose
`qc-gap-finder`. Do not run it automatically and do not create a partial
Viewpoint revision.

Never dispatch a blocked item to Viewpoint design, Test Case design, export, or execution.

## Task Progress

After the Persist Gate, maintain `qc/tasks/<scope-key>-qc-task.md`. Include:

- Source manifest and approved phase scope;
- Readiness route and its evidence;
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
