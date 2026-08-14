---
## Global Material Path Rule

Before creating or updating any artifact, read `references/material-paths.md`. This is a global rule for every QC skill, including the runtime `qc-task.md` and `open-questions.md` files; the installer populates this reference from the package canonical source.

name: qc-design-test-cases
description: Design test cases from locked viewpoints and requirement ACs with mandatory traceability (each TC cites its Viewpoint and AC IDs), and produce the traceability matrix. Use when the user says "thiết kế test case", "sinh TC", "QC test cases", or after viewpoints are locked.
---
# Test Case Design — Traceable Test Cases From Locked Viewpoints

## Purpose

Produce a structured test case set where **every test case traces to a locked Viewpoint (VP) and the underlying AC or requirement ref**. Traceability is built in at creation time: the TC row itself carries the trace column, and a separate traceability matrix cross-checks the set at the end. This makes the set reviewable by the user and importable into downstream tools (spreadsheets, TMS, or the automation export skills).

## Mandatory Inputs

| Input | Source |
|---|---|
| Approved requirement files | Handoff or user-provided |
| Locked viewpoints | `qc/test-viewpoints/<feature>-viewpoints.md` (locked version) |
| Gap report + open question ledger | `qc/gap-reports/<feature>-gap-report.md`, `qc/open-questions.md` |
| System context, bug base | `qc/refs/system-context.md`, `qc/refs/bug-base.md` |

If viewpoints are not yet locked, run `qc-design-viewpoints` first. A viewpoint that is still under review may only be used with a clear `DRAFT` note in every derived TC.

## Test Case ID Convention

`TC-XXX-NNN` where `XXX` is a stable feature/module code (for example `TC-LOG-001` for login, `TC-API-012` for API suite) and `NNN` is sequential. Keep the same code per feature so IDs remain stable across revisions. Use `TC-GEN-` for generic/shared cases.

## Field-Level Validation (Customizable Checklist)

When the viewpoint touches a form or screen with input fields, list **every input field** and generate validation test cases **per field** using the project's checklist file, which the installer seeds as `qc/field-validation-checklist.md` (see `references/material-paths.md`). Each project owns this file and may customize or extend it; the skill references it, never embeds it.

Rules:

1. Never merge validation for multiple fields into a single test case.
2. Every input field receives at least **1 positive** and **2+ negative/boundary** validation cases, unless the project team agrees otherwise.
3. Apply the **Scenarios Chuyên Sâu & Non-Functional** checklist from the same file: double submit / race condition, session & network resilience, localization & UTF-8 / emoji, keyboard accessibility, and HTTP status codes for API cases.

## Coverage Requirements Per Viewpoint

Each viewpoint generates cases covering:

1. **Happy path** — the main success flow (always).
2. **Alternative / negative paths** — invalid inputs, rejection rules, error messages (always, unless the AC genuinely has no rejection case).
3. **Boundary / data variation** — min/max, empty, special characters, formats, duplicates (when the AC or business rule has numeric/format constraints).
4. **State transition cases** — every valid and invalid transition from the state matrix (when the feature has statuses/workflow).
5. **Regression items** — from the bug base, for viewpoints flagged as regression risk (when bug base has relevant entries).

Skip a category only with an explicit note, never silently.

## Execution Steps

1. Read the locked viewpoints and the requirement files they reference.
2. For each viewpoint, design the required case categories. For each case write: ID, title, precondition, test data, steps (numbered), expected result, trace refs, priority, automation eligibility.
3. Mark **Automation eligibility** per TC with one of: `UI-AUTO` (automatable via Playwright), `API-AUTO` (automatable via API), `BOTH`, or `MANUAL`. Decide by these rules: deterministic UI steps with stable elements → `UI-AUTO`; CRUD/read-only flows exposed by API with verifiable payload → `API-AUTO`; UI-only interactions, visual checks, third-party popups, CAPTCHA, or heavy setup → `MANUAL`. Do not mark `UI-AUTO` when the flow contains visual or subjective checks. These eligibility values feed the `Automatable` / `Auto Type` columns in the output table.
4. Assign a **Risk Level** per module before generating cases: `High` (core flows, payment, auth, data loss risk), `Medium` (important flows with moderate blast radius), `Low` (cosmetic / low-impact flows). State the rationale briefly in the matrix section.
5. Flag TCs that depend on still-open OQs with `[OQ-XXX]` in the title and a note; they are delivered but visibly provisional.
6. Generate the traceability matrix cross-checking VP/AC coverage.
7. Save to `qc/test-cases/<feature>-test-cases.md` (traceability matrix included
   as a section at the end of the same file; see
   `references/material-paths.md`), present the summary, and ask the user to
   confirm the save path.
8. If execution results are being recorded in the same session, also create
   `qc/executions/<feature>-executions.md` with the executions log schema
   (`qc-report-generator`'s `references/executions-log.md`), pre-filling one
   row per TC with Result `NOT_RUN` — so runs only need to update results.

## Test Case Status Fields (Ownership Rules)

Each TC row carries three execution-status fields:

| Field | Values | Who writes it |
|---|---|---|
| Status | `NOT_RUN` at design time; later `PASS`, `FAIL`, `BLOCKED`, `SKIP`, `ERROR` | Design skill sets `NOT_RUN` only; `$qc-run-playwright`, `$qc-export-postman`, or a manual session sets the result |
| Test By | Agent name / tester identity | Execution skill or manual tester |
| Test Date | `YYYY-MM-DD` of the last execution | Execution skill or manual tester |

This skill must **never** set Test By or Test Date, and must never change a Status that is not `NOT_RUN`/empty. Results live in the executions log; the status fields on the TC table are the single-row convenience view used by `$qc-report-generator` when an executions log is absent.

## Test Case Table Template

```markdown
| TC ID | Module | Risk Level | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Automatable | Auto Type | Tags | Status | Test By | Test Date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-LOG-001 | Login | High | Đăng nhập thành công | User exists, logged out | email: test_khachhang_01@domain.com, pass: P@ssw0rd! | 1. Open login 2. Enter creds 3. Submit | Dashboard shown, session active | VP-01, US-010 AC1 | P1 | Yes | UI | @Smoke | NOT_RUN | | |
| TC-LOG-002 | Login | High | Đăng nhập sai password | User exists | email: test_khachhang_01@domain.com, pass: Wrong123 | ... | Error message E01 shown, not locked | VP-01, US-010 AC2 | P1 | Yes | UI | @Regression | NOT_RUN | | [OQ-003] nếu lock policy thay đổi |
```

Column mapping and rules:

- **Module**: the module / sub-module from the decomposition (or viewpoints grouping).
- **Risk Level**: `High` / `Medium` / `Low` from step 4 above.
- **Test Data**: concrete values, never placeholders (see `references/material-paths.md` test data rules; `qc/refs/test-data-spec.md` if created).
- **Automatable**: `Yes` / `No` / `Partial` — derive from the automation eligibility: `UI-AUTO` or `API-AUTO` → `Yes`; `BOTH` → `Yes`; `MANUAL` → `No`; cases with a manual-only visual check inside an otherwise automatable flow → `Partial`.
- **Auto Type**: `UI` / `API` / `Unit` / `N/A` — `UI-AUTO` → `UI`; `API-AUTO` → `API`; `BOTH` → `UI` (default); `MANUAL` → `N/A`.
- **Tags**: `@Smoke`, `@Regression`, `@CriticalPath`, `@Security`, `@Boundary`; at least one tag per TC.
- **Status / Test By / Test Date**: see the ownership table above.

## Traceability Matrix Template

```markdown
# Traceability Matrix: [Feature]
## Requirement Ref → Test Cases
| Ref (AC / rule / NFR) | Covering TCs | Uncovered? |
|---|---|---|
| US-010 AC1 | TC-LOG-001, TC-LOG-004 | No |
## Viewpoint → Test Cases
| VP ID | Covering TCs | Case Count |
|---|---|---|
| VP-01 | TC-LOG-001..006 | 6 |
## Open Questions → Provisional TCs
| OQ ID | Affected TCs |
|---|---|
```

## Quality Gates (Before Delivery)

1. **Unique TC ID** — no duplicate IDs and IDs follow the project convention.
2. **1-to-1 Step-Expected matching** — numbered steps match numbered expected results.
3. **Trace coverage** — every TC has at least one trace ref (VP and an AC/rule/NFR), and every AC in scope appears in the matrix at least once.
4. **Concrete test data** — no placeholder or vague values in any TC.
5. **Field validation coverage** — when forms are in scope, every input field has ≥1 positive and 2+ negative/boundary cases, per `qc/field-validation-checklist.md`.
6. **Automation metadata ready** — 100% of TCs have `Automatable`, `Auto Type`, and at least one `@Tag` set, and Status is `NOT_RUN`.

OQ-dependent TCs are flagged, not hidden.

## Rules

- Do not redesign viewpoints in this skill; if gaps are found in the viewpoint set, send the user back to `qc-design-viewpoints`.
- Keep steps atomic and verifiable; expected results must be observable outcomes, not "it works".
- Test data references must be concrete or reference a generated data set (use `qc/refs/test-data-spec.md` if created).
- Ask in Vietnamese by default; keep IDs and technical terms in English.
- Save outputs in the target project, not inside skill folders, following
  the layout in `references/material-paths.md`.
