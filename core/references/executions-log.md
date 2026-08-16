# Append-Only Executions Log

Store execution history at
`qc/executions/<scope-key>-executions.md`. Append a new run section. Never
replace a prior run or collapse several attempts into one row.

## Run Header

```markdown
## Run: RUN-20260814-153000

| Field | Value |
|---|---|
| Scope Key | fs-login |
| Source Test Cases | [fs-login-test-cases.md](../test-cases/fs-login-test-cases.md), Revision 2, LOCKED |
| Run At | 2026-08-14T15:30:00+07:00 |
| Environment | staging |
| Application Build | commit or version, or UNKNOWN |
| Execution Method | MANUAL or PLAYWRIGHT |
| Executor | codex (Playwright) |
| Recorded By | importer or runner identity |
| Approved By | user or authority |
| Retry Policy | exact approved policy |
| Assessment Policy | exact approved rule for selecting attempts |
| Cleanup Plan | exact approved plan |
| Evidence Policy | OPTIONAL by default, or exact approved override |
| Result Source | native runner, file path, canonical URL, or external locator |
| Source Integrity | hash, Sheet tab/range and retrieval time, runner reference, or UNKNOWN |
```

## Attempt Rows

```markdown
| Run ID | Attempt | TC ID | VP ID | Source Ref | Result | Expected Result | Actual Result | Tested By | Tested At | Source Locator | Evidence | Defect | Cleanup | Note |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RUN-20260814-153000 | 1 | TC-LOG-001 | VP-LOG-001 | [AC-01](../../requirements/login.md#ac-01) | PASS | Dashboard and session are created | Dashboard shown; session cookie present | codex | 2026-08-14T15:35:00+07:00 | native runner | [screenshot](../evidence/fs-login/run-20260814-153000/tc-log-001-attempt-1-dashboard.png) | | PASS | |
```

Use one row per `<Run ID, Attempt, TC ID>`. Use relative Markdown links for the source ref, evidence, and defect when the target is stored in the project.
Preserve an approved external locator exactly and mark it non-portable when applicable.

`Source Locator` identifies the runner event or manual input row used to create the attempt, for example an XLSX sheet and row, CSV row, or Google Sheets tab and range. It is required for imported manual results and is separate from optional supporting Evidence.

## Result Vocabulary

| Result | Meaning |
|---|---|
| `PASS` | Executed and actual behavior matched all Expected Results |
| `FAIL` | Executed and product behavior contradicted an Expected Result |
| `BLOCKED` | Test intent could not execute because an external prerequisite was unavailable |
| `SKIP` | Intentionally excluded from this approved run scope |
| `ERROR` | Runner, manual tool, setup, or observation mechanism failed before product behavior could be assessed |

Use `SKIP`, never `SKIPPED`.

## Summary Per Run

Record the approved Assessment Policy before calculating a summary. It must say which attempt is assessed for each TC.
For example, a specifically approved attempt or the latest completed attempt. Do not silently count every retry as a separate Test Case result.

Include:

- Total attempt rows;
- Distinct selected Test Cases;
- Assessed Test Cases, `PASS + FAIL`;
- Separate `BLOCKED`, `SKIP`, and `ERROR` counts;
- Absolute `PASS` and `FAIL` counts under the Assessment Policy;
- Rows with and without supporting Evidence under the Evidence Policy.

Calculate pass rate as:

```text
PASS / (PASS + FAIL)
```

State the denominator. Do not hide blocked or error counts. If there are no
PASS or FAIL results, show pass rate as `N/A`.

## Rules

1. Preserve full trace: TC ID, VP ID, source ref, and source TC revision.
2. Record environment and build, or explicitly use `UNKNOWN` when permitted.
3. Record an exact Evidence Policy for every Run. Use `OPTIONAL` by default. Evidence may be blank when that policy permits it. Missing evidence lowers confidence but does not invalidate an otherwise complete manual result.
4. Require an observable Actual Result for `PASS` and `FAIL`, a blocker reason for `BLOCKED`, an exclusion rationale for `SKIP`, and an error description for `ERROR`.
5. Record every retry as a new attempt.
6. Do not edit historical actual results after delivery. Append a correction note with its author and timestamp.
7. Keep the locked Test Case revision immutable. Derive latest result, executor, date, evidence, and defects from this log.

Existing historical Run sections that predate the Tested By, Tested At, Source Locator, or Evidence Policy fields remain valid. Do not rewrite them merely to match the current schema. Mark unavailable legacy metadata as a report confidence limitation.

## Run Footer

After all selected Test Cases finish, append a footer with run-level cleanup, unresolved side effects, final attempt count, assessed case count, supporting evidence availability, and end time. Attempt rows record per-case cleanup when applicable. Never edit an earlier row to retrofit run-level cleanup.
