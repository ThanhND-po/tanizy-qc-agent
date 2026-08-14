---
name: qc-export-postman
description: Convert defined test cases that are eligible for API automation (API-AUTO or BOTH) into a Postman collection (v2.1) that can be imported and run. Use when the user says "xuất Postman", "tạo Postman collection từ TC", "API tests cho TC này", or after test cases are designed and a subset is selected.
---
# Postman Collection Export — API Test Cases to an Importable Collection

## Purpose

Transform test cases with automation eligibility `API-AUTO` or `BOTH` into a **Postman Collection v2.1** JSON file that imports directly into Postman and can be run with the Collection Runner or Newman. The export preserves the traceability chain: every request carries the TC ID and trace refs.

## Selection Scope

Accept a scope from the user: a list of TC IDs, a viewpoint ID, a feature code, or "all eligible API TCs". If the user gives no scope, list the eligible API TCs with counts and ask them to choose.

## Conversion Rules

Each TC maps to one request:

| TC element | Postman mapping |
|---|---|
| TC ID, title | Request name `TC-XXX-NNN — <title>` |
| Trace refs | Request description header: `Trace: VP-XX, US-XXX ACn` |
| HTTP method, endpoint | From the API spec / requirement; **never invent endpoints** |
| Request body, headers, auth | From the API spec; map to collection-level auth/variables where shared |
| Expected result (status, payload rules) | `Tests` script with `pm.test(...)` assertions (status code, required fields, value rules) |
| Test data / variables | `{{variable}}` references; declare a `variables` block with sensible placeholders |
| OQ-flagged TC | Request name suffix `[OQ-XXX]` plus description note |
| Negative cases | Separate requests in the same folder, tagged `@negative` in the name |

Group requests into folders by viewpoint (or by module when viewpoint is not meaningful). Use collection-level variables for base URL, tokens, and shared data; per-request variables only when unique.

## Information Completeness Gate

A TC is exportable only when the requirement/API spec defines its method, endpoint, and expected response shape. For TCs missing any of these, report them as `NEEDS_REVIEW` in the summary instead of guessing; list exactly which field is missing so the user (or PO agent) can resolve it.

## Output

Save the collection under `postman/` in the target project (confirm path with the user):

```text
postman/
├── <module>.postman_collection.json   # Collection v2.1, importable
└── README.md                          # index: folder → viewpoint → TC IDs, variables list, how to run
```

End the README with a run instruction block:

```bash
newman run <module>.postman_collection.json --env-var baseUrl=https://...
```

## Validation Gate

Before delivery: the JSON validates as Postman Collection v2.1 (correct `info.schema`, request structure, test scripts as strings); every exported TC ID appears exactly once; every request has at least one `pm.test` assertion; `NEEDS_REVIEW` TCs are listed, not silently dropped; no invented endpoints or payload fields exist in the collection.

## Rules

- This skill produces collection files only; it does not execute requests unless the user also asks for a run (then use Newman or the API tools available and report per-TC results).
- Never guess endpoint URLs, methods, or payload schemas from the TC title alone.
- Keep assertion texts in the same language as the source TCs.
- Ask in Vietnamese by default; keep technical terms in English.
- Save outputs in the target project, not inside skill folders.
