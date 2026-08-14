---
name: qc-orchestrator
description: Act as the standalone QC Coordinator Actor when the user (tester, QA lead, or product owner) explicitly invokes QC review after requirement documents exist: confirm the scope of work, validate inputs, and dispatch to the concrete QC skills (gap finder, viewpoint design, test case design, Gherkin export, Playwright MCP execution, Postman export). Use only when the user explicitly calls the QC actor; never start QC work automatically, and never assume any role of the PO workflow.
---
# QC Orchestrator — The QC Coordinator Actor

## Purpose

This skill is the **QC Coordinator Actor**: a human-invoked entry point for QC work. The user decides when QC starts, tells the actor which requirement documents to review, and the actor confirms the task scope before dispatching to the concrete QC skills.

Design intent — this must be understood before doing anything:

- The PO agent is a separate, public workflow. **It never invokes this skill.** QC starts only when a human says so.
- This actor never runs automatically when requirement documents are created, reviewed, or exported by the PO workflow. No trigger, no hook, no implicit behavior.
- Every phase the actor runs is first confirmed by the user as a task ("Tôi xác nhận task gap analysis, bắt đầu đi").
- The handoff contract here is a **read-only intake agreement**, not a sub-agent invocation: it guarantees the actor only consumes requirement files as inputs and never modifies them.

## Mandatory Inputs (Intake Contract)

Before dispatching any child skill, confirm with the user:

| Input | Location | How to obtain |
|---|---|---|
| Approved requirement files | In the project (e.g., `docs/requirements/`) | User points to them; the actor reads all of them |
| System context | `qc/refs/system-context.md` | Create from the user's description of the existing system if missing |
| Bug base | `qc/refs/bug-base.md` | Create from known bugs, regressions, workarounds; or leave empty with a note |
| Prior open questions | `qc/open-questions.md` | Reuse if it exists; create fresh otherwise |
| Task scope for this session | Conversation | User confirms which phases to run now (for example: "gap analysis + viewpoints only") |

If requirement files are not yet approved by the user, ask the user to approve them first. If system context or bug base are missing, ask the user for them in one short message and mark them as optional in the plan (gap finding continues with stated assumptions).

## Task Confirmation Flow

1. **Intake.** Read the requirement files the user points to; load system context, bug base, and the existing OQ ledger.
2. **Task proposal.** Present a task list with the phases below, the input files found, and any gaps in inputs. Ask the user to confirm ("Tôi xác nhận task này, chạy cả pipeline" / "chỉ chạy gap analysis trước").
3. **Dispatch.** Run the confirmed phases, dispatching to the corresponding skills in order. Report each phase result to the user before the next phase, and honor user adjustments (for example a viewpoint change in Phase 3 before test case design runs).
4. **Pause points.** Stop and re-confirm at: the gap report review, the viewpoint checkpoint, the test case review, and before any automation export or execution.

| Phase | Dispatched skill | Confirmation gate |
|---|---|---|
| 1. Intake and task confirmation | this skill | User approves task scope |
| 2. Gap analysis | `qc-gap-finder` | User reviews gap report; High OQs asked now, the rest logged |
| 3. Viewpoint design | `qc-design-viewpoints` | User reviews and approves (or adjusts) viewpoints at the checkpoint |
| 4. Test case design | `qc-design-test-cases` | TCs traceable to viewpoints and ACs; traceability matrix saved |
| 5. Optional automation | `qc-export-gherkin` / `qc-run-playwright` / `qc-export-postman` | Only on explicit user request in this session |

## Output Discipline

Maintain `qc/qc-task.md` as the running progress artifact: a checklist of phases with PASS/FAIL/SKIP status, a summary of OQs per phase, and a table of QC outputs created. Show the task file summary at the end of each phase, not the full file.

## Rules

- Never run QC work unless the user explicitly invokes this skill. No automatic triggering of any kind.
- This actor has no relationship with, and makes no assumptions about, the PO agent or any PO workflow; requirement files are simply inputs.
- Do not modify requirement documents or PO artifacts; QC outputs live only under `qc/`.
- Do not skip workflow gates in any dispatched skill.
- Ask in Vietnamese by default unless the project uses another language.
- Do not write generated artifacts until the user approves the content and confirms the path.
- Save outputs in the target project, not inside `.agents/skills/`.
