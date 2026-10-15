# Automation Eligibility Guide

Classify automation potential without claiming runtime readiness.
Preserve one canonical eligibility value in every Test Case row.

## Canonical Values

Use the five Automation Eligibility definitions in the [canonical Test Case template](test-case-format.md#complete-template).
That reference owns the vocabulary and reader-facing Legend; this guide owns selection and downstream routing.
Do not use `MANUAL` to hide an incomplete specification.
Use `NEEDS_SPEC` for the blocker and link the existing blocking OQ when the readiness route provides one.
A design-blocking gap has no placeholder executable Test Case.

## Eligibility Rules

1. Require an observable, source-backed Expected Result.
2. Mark `UI-AUTO` only when the UI behavior can be asserted programmatically. Stable locators are runtime-readiness evidence, not a reason to invent UI behavior.
3. Mark `API-AUTO` only when method, endpoint, auth, payload, response shape, and relevant status/error behavior are defined.
4. Mark `BOTH` only when both paths test the same intent without losing an assertion.
5. Mark subjective visual quality, physical hardware, CAPTCHA, and exploratory testing as `MANUAL` when that intent is explicitly in scope.
6. Mark source gaps as `NEEDS_SPEC` and stop the affected downstream export.

Do not add derived `Automatable` or `Auto Type` columns.
They repeat the same decision and may become inconsistent with `Automation Eligibility`.

## Downstream Routing

| Eligibility | Allowed next step |
|---|---|
| `UI-AUTO`, `BOTH` | `qc-export-gherkin`; Playwright only after Execution Gate |
| `API-AUTO`, `BOTH` | `qc-export-postman`; execution requires a separate approved run workflow |
| `MANUAL` | Manual execution record |
| `NEEDS_SPEC` | Stop the affected design or export. Return to `qc-gap-finder` when the design route is `GAP_ANALYSIS`; otherwise propose Gap Analysis as a separate approved phase |

`STATIC_VALID`, `AUTOMATION_ELIGIBLE`, and `RUNTIME_READY` are separate states.
Eligibility alone never proves that a test can run in the current environment.
Do not rename `UI-AUTO` to `UI-AUTO-CANDIDATE` or introduce another candidate value.
Every eligible Test Case must remain human-executable before automation implementation exists.
