# Automation Eligibility Guide

Classify automation potential without claiming runtime readiness. Preserve one
canonical eligibility value in every Test Case row.

## Canonical Values

| Eligibility | Use when |
|---|---|
| `UI-AUTO` | The source-backed intent is deterministic and observable through UI automation |
| `API-AUTO` | The source-backed intent is deterministic and the complete API contract is available |
| `BOTH` | The same intent is valid and independently observable through UI and API layers |
| `MANUAL` | The approved test intent requires human judgment or an unsupported physical/third-party interaction |
| `NEEDS_SPEC` | Test intent, data, Expected Result, endpoint, or another required contract is missing |

Do not use `MANUAL` to hide an incomplete specification. Use `NEEDS_SPEC` and
link the blocking OQ.

## Eligibility Rules

1. Require an observable, source-backed Expected Result.
2. Mark `UI-AUTO` only when the UI behavior can be asserted programmatically.
   Stable locators are runtime-readiness evidence, not a reason to invent UI
   behavior.
3. Mark `API-AUTO` only when method, endpoint, auth, payload, response shape,
   and relevant status/error behavior are defined.
4. Mark `BOTH` only when both paths test the same intent without losing an
   assertion.
5. Mark subjective visual quality, physical hardware, CAPTCHA, and exploratory
   testing as `MANUAL` when that intent is explicitly in scope.
6. Mark source gaps as `NEEDS_SPEC` and stop the affected downstream export.

Do not add derived `Automatable` or `Auto Type` columns. They repeat the same
decision and may become inconsistent with `Automation Eligibility`.

## Downstream Routing

| Eligibility | Allowed next step |
|---|---|
| `UI-AUTO`, `BOTH` | `qc-export-gherkin`; Playwright only after Execution Gate |
| `API-AUTO`, `BOTH` | `qc-export-postman`; execution requires a separate approved run workflow |
| `MANUAL` | Manual execution record |
| `NEEDS_SPEC` | Gap report and Open Question only |

`STATIC_VALID`, `AUTOMATION_ELIGIBLE`, and `RUNTIME_READY` are separate states.
Eligibility alone never proves that a test can run in the current environment.
