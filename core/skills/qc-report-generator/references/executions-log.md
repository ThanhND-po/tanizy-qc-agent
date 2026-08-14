# Executions Log Format

The report generator aggregates results from executions log files. Skills
`qc-run-playwright`, `qc-export-postman`, and any manual testing session
write results here before a report is generated.

## File Location

`qc/executions/<feature|sprint>-executions.md` — create the file (and the
`executions/` folder) if it does not exist when recording results.

## Format

```markdown
# Executions — <Feature / Epic name>

- Source test cases: [qc/test-cases/<name>-test-cases.md](../test-cases/<name>-test-cases.md)
- Run date: YYYY-MM-DD
- Environment: <env description>
- Executor: <agent name / tester>

| # | TC ID | Title | Trace (Viewpoint / AC) | Result | Evidence / Bug link | Note |
|---|-------|-------|------------------------|--------|---------------------|------|
| 1 | TC-001 | | VP-02 / AC-2.1 | PASS | screenshot URL | |
| 2 | TC-002 | | VP-05 / AC-4.3 | FAIL | BUG-101: title + link | |
| 3 | TC-003 | | VP-07 | BLOCKED | blocker: BUG-102 | |
| 4 | TC-004 | | VP-07 / AC-5.0 | SKIP | | out of scope this run |
| 5 | TC-005 | | VP-08 / AC-6.2 | NOT_RUN | | created, never executed |

## Summary
- Total: 4 | PASS: 1 | FAIL: 1 | BLOCKED: 1 | SKIP: 1 | Pass rate: 50% of executed
```

## Result Vocabulary (strict)

| Status | Meaning | Included in pass rate |
|---|---|---|
| NOT_RUN | Test case exists but has never been executed | No |
| PASS | Executed, actual = expected | Yes |
| FAIL | Executed, actual ≠ expected | No |
| BLOCKED | Cannot execute (dependency/env defect) | No |
| SKIP | Not executed (out of scope / duplicate) | No |
| ERROR | Automation failure, rerun needed | No |

## Rules

1. One row per Test Case ID — never aggregate several cases into one row.
2. The **Trace** column is mandatory: VP-ID from the viewpoints file and/or
   AC number from the requirement, so the report can compute coverage.
3. If no executions log exists when the report skill is invoked, the workflow
   asks the user where results live (playwright/postman MCP run output, a
   manual test list, or another location) and builds the log first.
4. Bugs found get an entry in the summary table and (for FAIL) the bug ID is
   referenced; the agent also appends the finding to `qc/refs/bug-base.md`
   (see agent self-update rule).
5. **Status fallback.** When no executions log exists, the report reads each
   TC's `Status`, `Test By`, and `Test Date` columns directly from the test
   cases file (`qc/test-cases/...`) and computes metrics from those values.
   Test cases still at `NOT_RUN` are counted as not executed and never inflate
   the pass rate.
6. When results come from manual testing, the tester (or the agent recording
   for them) fills `Test By` and `Test Date` on the corresponding TC rows in
   the test cases file so the fallback view stays accurate.
