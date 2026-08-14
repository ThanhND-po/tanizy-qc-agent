# Automation Eligibility Guide

Decide the `Auto` column of each test case with these rules. When in doubt between two classes, choose the more conservative one and note the reason in the TC's Notes column.

## Classification Rules

| Eligibility | Criteria | Examples |
|---|---|---|
| `UI-AUTO` | Deterministic UI steps, stable elements, observable assertions, no subjective checks | Login, CRUD forms, list verification, state transition flows |
| `API-AUTO` | Behavior fully verifiable through API responses; no UI dependency | Search API result rules, calculation endpoints, webhooks, bulk endpoints |
| `BOTH` | Meets both sets of criteria | Standard CRUD with both API and UI flows documented |
| `MANUAL` | Visual/subjective checks, third-party popups (payment gateway, SSO redirect, CAPTCHA), mobile gesture, accessibility visual review, exploratory flows | Payment page redirect, email layout, drag-and-drop polish |

## Additional Constraints

1. A TC is `UI-AUTO` only if every expected result is a state or text that can be asserted programmatically. "The page looks correct" is not automatable.
2. A TC is `API-AUTO` only if the method, endpoint, and expected response shape are defined in the requirement or API spec. Missing endpoint → keep `MANUAL` and flag `NEEDS_REVIEW`.
3. Setup cost matters: if a TC requires a complex one-time UI setup that the API can provide, mark `API-AUTO` with a note describing the setup via API.
4. Group TCs with the same setup into one automation story where possible; the Notes column should record shared preconditions.

## Downstream Mapping

| Auto value | Export destination | Skill |
|---|---|---|
| `UI-AUTO`, `BOTH` | Gherkin `.feature` | `qc-export-gherkin` |
| `API-AUTO`, `BOTH` | Postman collection | `qc-export-postman` |
| `UI-AUTO`, `BOTH` | Playwright MCP execution | `qc-run-playwright` |
