---
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
3. Mark **Automation eligibility** per TC with one of: `UI-AUTO` (automatable via Playwright), `API-AUTO` (automatable via API), `BOTH`, or `MANUAL`. Decide by these rules: deterministic UI steps with stable elements → `UI-AUTO`; CRUD/read-only flows exposed by API with verifiable payload → `API-AUTO`; UI-only interactions, visual checks, third-party popups, CAPTCHA, or heavy setup → `MANUAL`. Do not mark `UI-AUTO` when the flow contains visual or subjective checks.
4. Flag TCs that depend on still-open OQs with `[OQ-XXX]` in the title and a note; they are delivered but visibly provisional.
5. Generate the traceability matrix cross-checking VP/AC coverage.
6. Save to `qc/test-cases/<feature>-test-cases.md` (traceability matrix included
   as a section at the end of the same file; see
   `references/material-paths.md`), present the summary, and ask the user to
   confirm the save path.
7. If execution results are being recorded in the same session, also create
   `qc/executions/<feature>-executions.md` with the executions log schema
   (`qc-report-generator`'s `references/executions-log.md`), pre-filling one
   row per TC with Result `SKIP` — so runs only need to update results.

## Test Case Table Template

```markdown
| TC ID | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Auto | Notes |
|---|---|---|---|---|---|---|---|---|---|
| TC-LOG-001 | Đăng nhập thành công | User exists, logged out | valid email/pass | 1. Open login 2. Enter creds 3. Submit | Dashboard shown, session active | VP-01, US-010 AC1 | P1 | UI-AUTO | |
| TC-LOG-002 | Đăng nhập sai password | User exists | wrong pass | ... | Error message E01 shown, not locked | VP-01, US-010 AC2 | P1 | UI-AUTO | [OQ-003] nếu lock policy thay đổi |
```

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

- Every TC has at least one trace ref (VP and an AC/rule/NFR).
- Every AC in the scope appears in the matrix at least once.
- No TC has empty steps or empty expected result.
- OQ-dependent TCs are flagged, not hidden.
- Automation eligibility is set for every TC and justified where ambiguous.

## Rules

- Do not redesign viewpoints in this skill; if gaps are found in the viewpoint set, send the user back to `qc-design-viewpoints`.
- Keep steps atomic and verifiable; expected results must be observable outcomes, not "it works".
- Test data references must be concrete or reference a generated data set (use `qc/refs/test-data-spec.md` if created).
- Ask in Vietnamese by default; keep IDs and technical terms in English.
- Save outputs in the target project, not inside skill folders, following
  the layout in `references/material-paths.md`.
