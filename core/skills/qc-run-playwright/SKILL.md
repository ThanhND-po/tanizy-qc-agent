---
name: qc-run-playwright
description: Execute already-defined test cases via the Playwright MCP (browser tools) when explicitly requested by the user: recon the real DOM, verify locators, run the steps, auto-heal failures up to 5 rounds, and report results per TC ID. Use only when the user says "chạy test qua Playwright", "execute TC with playwright mcp", or similar.
---
# Playwright MCP Execution — Run Defined Test Cases Live

## Purpose

Execute test cases that were already designed by `qc-design-test-cases` (or exported by `qc-export-gherkin`) against the real application using the Playwright MCP browser tools available in Codex. This skill executes, it does not redesign: the test intent comes from the TC files, and results are reported per TC ID so the traceability chain stays intact.

## Trigger Condition

This skill runs **only on explicit user request**. Never start browser sessions unprompted.

## Mandatory Inputs

| Input | Source |
|---|---|
| Test cases to run (IDs or scope) | `qc/test-cases/<feature>-test-cases.md` or `specs/*.feature` |
| Application URL | User-provided; never guess |
| Credentials / fixture data | User-provided or from project fixtures/env; never hardcode secrets |
| Playwright MCP tools available in Codex | `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_wait_for`, etc. |

If the MCP browser tools are not available in this session, tell the user and stop; do not attempt a plain browser automation fallback without confirming.

## Execution Steps

1. **Plan.** Build a run plan table: TC ID, title, steps summary, expected
   results, priority. Save it as `qc/qc-task.md` (append section "Playwright
   Run") with per-TC status `PENDING`. Also prepare or update the executions
   log `qc/executions/<feature>-executions.md` (see
   `qc-report-generator`'s `references/executions-log.md`), one row per TC.
2. **Recon the DOM.** For every page touched by the TCs: `browser_navigate` → URL, `browser_resize` 1920×1080, `browser_wait_for` page load, `browser_snapshot` to read the accessibility tree. Collect locators per element — prefer `getByRole`/`getByLabel`/`getByText` over raw selectors. Never guess selectors; verify each locator by performing the interaction.
3. **Run each TC** in order, mapping TC steps to MCP actions one-to-one. After the last `Then` step, assert the expected result via snapshot/text check before marking PASS.
4. **Auto-heal loop (max 5 rounds) on failure.** Rule: read the error → classify → fix → rerun. Classification table:

| Error | Fix |
|---|---|
| Element not found | Resnapshot, use a verified locator |
| Click intercepted | Wait for overlay to clear, retry |
| Timeout | Add a proper wait condition |
| Assertion mismatch | Compare expected vs actual; if the app disagrees with the TC, this is a business-rule conflict → ask the user |
| Login/session missing | Re-login via fixture |
| Test data conflict | Generate unique data (prefix + timestamp) and retry |

5. **Business-rule conflicts and MCP unavailability stop the loop** and ask the user; everything else is fixed silently.
6. **Stability verify.** A TC passes only after **2 consecutive successful runs**.
7. **Cleanup.** Remove debug notes, temporary waits, and any credential
   traces from conversation artifacts. Update `qc/qc-task.md` with final
   per-TC status: `PASS (2/2)`, `FAIL`, `BLOCKED`, or `SKIPPED` with reason.
8. **Record results.** Write every TC result (status, evidence link, bug ID
   if any) into the executions log. Results feed `$qc-report-generator`
   directly — do not rely on chat history alone.
9. **Refs self-update.** For every FAIL/BLOCKED caused by a defect (not a
   locator issue), append a row to `qc/refs/bug-base.md` (Bug ID `TBD` until
   filed, or the filed bug ID) and update `qc/refs/system-context.md` if the
   run revealed unexpected existing behavior. Announce the updates in one
   sentence.

## Result Report Template

Results go to the executions log (`qc/executions/...`), not a standalone
report file. The report below is shown in chat only.

```markdown
# Playwright Run Report — [date]
| TC ID | Title | Result | Rounds | Note |
|---|---|---|---|---|
| TC-LOG-001 | Đăng nhập thành công | PASS (2/2) | 1 | — |
| TC-LOG-002 | Sai password | FAIL | 5 | App hiển thị E02 thay vì E01 → business-rule conflict, cần hỏi user |
## Summary
X PASS / Y FAIL / Z BLOCKED / W SKIPPED
## Locator Collection (reference)
(page, element, action, primary locator, fallback, verified)
```

## Test Data Rules

Generated data uses the format `<prefix>_<tcId>_<timestamp>` so runs stay traceable and non-colliding. Never use real personal information. Sensitive values come from env/fixture only.

## Rules

- Read-only with respect to requirement documents; update only `qc/` artifacts.
- Never guess selectors; every locator is verified on the real DOM.
- Smart waits only; no fixed sleeps unless the user explicitly requires them.
- Do not run state-changing git commands.
- Ask in Vietnamese by default; keep technical terms in English.
- Save outputs in the target project, not inside skill folders, following
  the layout in `references/material-paths.md`.
