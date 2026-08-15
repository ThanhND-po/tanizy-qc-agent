---
name: qc-export-postman
description: "Convert locked API-AUTO or BOTH Test Cases with a complete API contract into a traceable Postman Collection v2.1 and manifest. Use when the user asks to export Postman, build a collection from selected TC IDs, or prepare API automation artifacts. This skill exports only and does not execute requests."
---

# Export a Postman Collection

Create an importable Postman Collection v2.1 without inventing API behavior or
including secrets.

## Artifact Contract

Read `references/material-paths.md`. Save output below
`qc/automation/postman/<scope-key>/`.

## Required Inputs

- locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- selected `API-AUTO` or `BOTH` TC IDs;
- source-backed HTTP method, endpoint, auth scheme, headers, payload, response
  shape, and Expected Results;
- matching gap report and OQ ledger.

Reject any stale case, unresolved OQ that blocks from `DESIGN` or `EXPORT`,
missing API contract field, or `NEEDS_SPEC` case. Report missing evidence as
`BLOCKED_SPEC`; do not convert it to `MANUAL` merely because the API contract is
incomplete.

Read eligibility only from the canonical `Automation Eligibility` column. Do
not infer it from tags, titles, obsolete derived fields, or HTTP-like wording.
Treat a missing or unknown canonical value as `BLOCKED_SCHEMA`.

## Mapping

| Test Case field | Postman output |
|---|---|
| TC ID and title | Request name and description |
| VP and source refs | Description trace block |
| Method and endpoint | Request object from the approved API source |
| Headers, auth, payload | Collection variables and request fields |
| Expected Results | `pm.test(...)` assertions |
| Concrete Test Data | Non-secret values or named environment variables |

Leave secret variable values empty and document their names in the manifest.
Never write tokens, passwords, or production personal data into the collection.

## Workflow

1. Validate the TC revision, approval state, eligibility, and selected IDs.
2. Verify the API contract for every request and assertion.
3. Draft the collection structure and rejected-ID summary in chat.
4. Show the exact write set.
5. Obtain explicit content and path approval.
6. Write `<scope-key>.postman_collection.json` and
   `<scope-key>-postman-manifest.md`.
7. Validate JSON structure, traceability, and secret handling.

The manifest records Scope Key, Scope Code, Artifact Type, Revision, State,
locked source TC revision, exported and rejected TC IDs, source coverage,
validation state, secret variable names, and runtime blockers.

## Static Validation Gate

- `info.schema` is Postman Collection v2.1.
- Every exported TC appears exactly once.
- Every request has at least one source-backed assertion.
- No endpoint, payload field, response field, or expected status is invented.
- No secret value is embedded.
- Rejected IDs and reasons appear in the manifest.
- All relative source links resolve.

Mark the collection `STATIC_VALID` after these checks. Mark it `RUNTIME_READY`
only when environment variables, credentials, data fixtures, dependencies, and
cleanup are verified.

## Rules

- Export only. Do not run Postman, Newman, or API requests in this skill.
- Keep requirements and source Test Cases unchanged.
- Ask in Vietnamese by default and retain exact API terms and IDs.
- Use the descriptive manifest filename defined above.
