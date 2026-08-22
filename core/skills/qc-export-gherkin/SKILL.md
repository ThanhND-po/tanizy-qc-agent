---
name: qc-export-gherkin
description: "Convert locked UI-AUTO or BOTH Test Cases into traceable Gherkin feature specifications and a manifest that a separately configured BDD workflow may consume. Use when the user asks to export Gherkin, convert selected TC IDs to .feature files, or prepare BDD specifications. This skill does not create step definitions, Playwright source code, or a runnable suite."
---

# Export Gherkin Specifications

Convert locked Test Cases into behavior-focused `.feature` files without changing test intent or inventing implementation details.

## Capability Boundary

This is a static specification export. It does not install a BDD runner, create
step definitions, map steps to selectors, generate Playwright source code, or
execute tests. If the user asks for runnable automation, state that the current
package does not implement automation authoring and reference deferred
enhancement `QC-AUTO-001`.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`. Save all output below
`qc/automation/gherkin/<scope-key>/`.

## Required Inputs

- Locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- Selected TC IDs, Viewpoint IDs, or explicit `all eligible` scope;
- Canonical `Automation Eligibility` values;
- Locked parent Viewpoint and approved requirement sources referenced by the
  Test Cases;
- Matching Gap Report only when the locked design chain uses `GAP_ANALYSIS`;
- OQ ledger when the locked design chain references OQs.

Export only `UI-AUTO` or `BOTH` cases. Exclude `MANUAL`, `API-AUTO`, `NEEDS_SPEC`, stale cases, and cases affected by an unresolved OQ that blocks from `DESIGN` or `EXPORT`. If the user did not choose a scope, list eligible IDs and wait for confirmation.

Read eligibility only from the canonical `Automation Eligibility` column in the locked Test Case revision. Do not infer it from tags, titles, an obsolete `Automatable` field, or UI-like Steps. If the canonical column is absent or has an unknown value, reject the case as `BLOCKED_SCHEMA` and request a Test Case revision.

## Mapping

| Test Case field | Gherkin output |
|---|---|
| TC ID and title | TC tag and Scenario name |
| Preconditions | `Background` when shared, otherwise `Given` |
| Concrete Test Data | Inline values or `Examples` table |
| Steps | Behavior-level `Given`, `When`, and `Then` |
| Expected Results | Observable `Then` assertions |
| VP and source refs | Tags and source comment |

Use user-facing behavior, not DOM actions. Do not invent selectors, routes, error copy, or step-definition names.

Use a lowercase kebab-case `module-key` from the locked Test Case module. Keep it unique within the scope directory. If selected cases map to more than one module or the module is unclear, propose the file split and obtain approval.

## Workflow

1. Validate TC revision, approval state, source traces, and selected IDs.
2. Reject blocked, stale, or ineligible cases with an exact reason.
3. Draft feature files and a manifest in chat.
4. Show the exact output directory and filenames.
5. Obtain explicit content and path approval.
6. Write feature files plus `<scope-key>-gherkin-manifest.md`.
7. Run the static validation gate.

## Output Example

```text
qc/automation/gherkin/fs-login/
├── login.feature
└── fs-login-gherkin-manifest.md
```

The manifest records Scope Key, Scope Code, Artifact Type, Revision, State,
readiness route, locked source TC revision, exported and rejected TC IDs,
Viewpoint/source coverage, validation state, and runtime blockers. Use the descriptive manifest
filename defined above.

## Static Validation Gate

- Every exported TC ID appears exactly once.
- Every Scenario has at least one observable `Then`.
- Every Scenario traces to a VP and exact source ref.
- No blocked or ineligible TC is exported.
- Feature and manifest filenames follow the approved scope key.
- Gherkin syntax is parseable by an available parser, when one exists.

Mark the result `STATIC_VALID` when these checks pass. Mark `RUNTIME_READY` only after the project verifies its BDD runner, matching step definitions, environment, auth, fixtures, and cleanup. This skill does not
create step definitions or run tests.

## Rules

- Keep source Test Cases and requirements unchanged.
- Keep Gherkin keywords in English and scenario text in the source TC language.
- Do not describe a static feature file as Playwright-runnable without runtime bridge evidence.
