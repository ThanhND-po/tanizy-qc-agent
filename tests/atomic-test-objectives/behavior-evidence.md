# Behavior Evidence: Atomic Test Objectives

## Run Metadata

| Field | Value |
|---|---|
| Run date | 2026-09-24 |
| Evaluated target | Installed Codex sandbox, read-only |
| Agent runtime | Codex CLI `0.154.0-alpha.6.2` |
| Model | `gpt-5.6-sol`, high reasoning |
| Session ID | `01a0d297-f48e-7df2-ac8d-b942cc065d3c` |
| Skill source and installed SHA-256 | `afcfd7779a6f116f52972895ecab5da684b66774aaa2d2090730dceca3b26b94` |
| Technique guide source and installed SHA-256 | `ba395e3dceded35cfed453acfeb0a794b5884bf41217600917e78b4140f35eb8` |
| Approved source SHA-256 | `b063664a5e6426622a6051aed867c5218d8257b41221cf332783ebbaea30e5cd` |
| Locked Viewpoint fixture SHA-256 | `fa07c2f3ca0ea6ea13e8942a8aa9fcb6d08700f1794096eb39832fe22ac0a356` |
| Existing case and evidence fixture SHA-256 | `71ba2fc959bfecc57e124f316267bd49f40703e4ed778e8b1a343ddbac407c24` |
| Raw output location | `/private/tmp/atomic-test-objectives-agent-output.md` |
| Raw output SHA-256 | `e933ff199718fdb995191a8b8388a19d27a64ae9f40d63a99b3d88055551503f` |
| Raw output size | 128 lines, 973 words |
| Mutation boundary | No files written or modified by the evaluated agent |

The evaluated prompt supplied only the exact source, locked Viewpoint, and existing evidence locators plus the requested review shape.
The prompt did not expose `rubric.md`, suspected defects, proposed corrections, or expected verdicts.

## Scenario Verdicts

| Scenario | Expected behavior | Actual behavior | Verdict |
|---|---|---|---|
| A | Stop the bundled required-code and expired-coupon leaf and return only the affected scope to Viewpoint Design. | Identified both independent conditions, returned `VP-ATO-002` to `qc-design-viewpoints`, and created no child case repair. | PASS |
| B1 | Keep one coherent same-cart transformation case with multiple checkpoints and a bounded claim. | Kept one Test Case with `100 -> 90`, discount `10`, the same cart, and Cart Details consistency checkpoints. | PASS |
| B2 | Do not invent eligibility or observation facts; use the existing readiness route. | Returned `DIRECT_SOURCE_CHECK = FAIL` and `STOP` for `VP-ATO-004`, with no fabricated Test Case. | PASS |
| C | Use separate valid and expired branch cases without splitting the coherent leaf. | Kept `VP-ATO-005` and derived two cases with fresh initial state and branch-specific oracles. | PASS |
| D | Use distinct `4`, `5`, and `6` cases while keeping one threshold leaf. | Kept `VP-ATO-006`, derived three cases, and reported absent, absent, and present warning outcomes. | PASS |
| E | Keep the source-backed state sequence in one case. | Kept one `Draft -> Submitted -> Confirmed` case for the same checkout with observable state checkpoints. | PASS |
| F | Keep discount and total as one output tuple. | Kept one case with discount `10` and total `90`, and used checkpoint evidence for diagnosability. | PASS |
| G | Detect that the draft covers only valid and reconcile the two-item denominator honestly. | Changed current achieved design coverage from `2/2` to `1/2` and proposed a separately mapped expired case without shrinking the denominator. | PASS |
| H | Report the failed checkpoint and downstream unexecuted checkpoint without a mechanical split. | Reported checkpoint 2 as `FAIL`, checkpoint 3 as `NOT_EXECUTED`, retained one coherent case, and did not require a known root cause. | PASS |
| I | Stop the bundled permission and coupon-validation leaf and return only the affected scope. | Identified the independent rules, returned `VP-ATO-013` to `qc-design-viewpoints`, and introduced no new controlled status. | PASS |

## Overall Verdict

Behavior evaluation result: `PASS`, 10 of 10 scenarios.
The run distinguished Viewpoint mapping, achieved design coverage, and execution outcome; preserved existing IDs; did not add an Objective column; and did not modify locked fixtures.
This verdict is behavioral evidence for the recorded prompt, skill revision, model, and fixture revisions only.
It is reported separately from static contract checks, installer checks, and runtime product testing.
