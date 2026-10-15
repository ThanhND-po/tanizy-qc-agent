---
name: qc-export-gherkin
description: "Convert locked UI-AUTO or BOTH Test Cases into traceable Gherkin feature specifications and a manifest that a separately configured BDD workflow may consume. Use when the user asks to export Gherkin, convert selected TC IDs to .feature files, or prepare BDD specifications. This skill does not create step definitions, Playwright source code, or a runnable suite."
---

# Export Gherkin Specifications

Convert locked Test Cases into behavior-focused `.feature` files without changing test intent or inventing implementation details.

## Capability Boundary

This is a static specification export.
It does not install a BDD runner, create step definitions, map steps to selectors, generate Playwright source code, or execute tests.
If the user asks for runnable automation, state that the current package does not implement automation authoring and reference deferred enhancement `QC-AUTO-001`.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`.
Save all output below `qc/automation/gherkin/<scope-key>/`.

## Input Preflight

Resolve `qc/` paths from the confirmed project root and `references/` or `scripts/` paths from this loaded skill directory, never from an assumed working directory.
If the project root is unclear, ask for it without filesystem discovery.
If the shared contract or a required package reference/helper is missing or unreadable, stop the affected phase with `BLOCKED_INSTALLATION` in chat, name the exact path, and request repair with the installer; do not search for substitutes or reconstruct the contract from memory.
After loading the contract, apply `Path Resolution and Recovery` to moved or deleted project inputs.

Apply `Input Boundary and Source Discovery` and `Read Scope and Template Sources` in `qc/config/material-paths.md` before reading phase inputs.
Use only the current approved intake, handoff, and the fixed-path checks listed below; never open historical artifacts to learn formatting.
For a missing required locator or content, report `BLOCKED_INPUT` in chat and request the exact input or explicit approval for one bounded search root.
Optional inputs stay optional; reuse confirmed locators and approvals from the current workstream.

## Required Inputs

- Locked `qc/test-cases/<scope-key>-test-cases.md` revision;
- Selected TC IDs, locked leaf Viewpoint IDs, or explicit `all eligible` scope;
- Canonical `Automation Eligibility` values;
- Locked parent Viewpoint and approved requirement sources referenced by the Test Cases;
- Matching Gap Report only when the locked design chain uses `GAP_ANALYSIS`;
- OQ ledger when the locked design chain references OQs.

Export only `UI-AUTO` or `BOTH` cases.
Exclude `MANUAL`, `API-AUTO`, `NEEDS_SPEC`, stale cases, and cases affected by an unresolved OQ that blocks from `DESIGN` or `EXPORT`.
If the user did not choose a scope, list eligible IDs and wait for confirmation.

A high-level Viewpoint ID is not a direct export scope.
If the user supplies one, list its descendant leaf VP IDs and eligible TC IDs, then obtain explicit scope confirmation before export.

For a locked legacy flat Viewpoint revision with no `Level` or parent mapping, accept selected TC IDs or `all eligible` only.
Preserve the original VP trace and do not infer which legacy IDs are parents or leaves.

Read eligibility only from the canonical `Automation Eligibility` column in the locked Test Case revision.
Do not infer it from tags, titles, an obsolete `Automatable` field, or UI-like Steps.
If the canonical column is absent or has an unknown value, reject the case as `BLOCKED_SCHEMA` and request a Test Case revision.

## Mapping

| Test Case field | Gherkin output |
|---|---|
| TC ID and title | TC tag and Scenario name |
| Preconditions | `Background` when shared, otherwise `Given` |
| Concrete Test Data | Inline values or `Examples` table |
| Steps | Behavior-level `Given`, `When`, and `Then` |
| Expected Results | Observable `Then` and supporting `And` conditions for the same Scenario; preserve all required outcome conditions |
| VP and source refs | Tags and source comment |

Use user-facing behavior, not DOM actions.
Do not invent selectors, routes, error copy, or step-definition names.

Use a lowercase kebab-case `module-key` from the locked Test Case module.
Keep it unique within the scope directory.
If selected cases map to more than one module or the module is unclear, propose the file split and obtain approval.

Consume the locked Expected Results without changing their presentation or intent, including legacy cases with no presentation note.
An unnumbered overall outcome may contain multiple source-backed conditions; preserve all of them without adding an expectation for every action or splitting the TC by assertion count.
Preserve any explicitly required intermediate checkpoints and their observation timing; do not move a transient check to the end of the sequence.
Do not ask the user to reselect a presentation during export or rewrite the locked source.

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

The manifest records Scope Key, Scope Code, Artifact Type, Revision, State, readiness route, locked source TC revision, exported and rejected TC IDs, Viewpoint/source coverage, validation state, runtime blockers, and a synchronized Controlled Value Legend.
Reread the canonical definitions and reconcile the complete manifest before approval.
Include the complete vocabulary for every governed set with seven or fewer values and never leave `LEGEND_UNDEFINED_VALUE` unresolved.
Use the descriptive manifest filename defined above.

## Static Validation Gate

- Every exported TC ID appears exactly once.
- Every Scenario has at least one observable `Then`.
- Every Scenario traces to a locked leaf VP and exact source ref.
- No blocked or ineligible TC is exported.
- Feature and manifest filenames follow the approved scope key.
- Gherkin syntax is parseable by an available parser, when one exists.
- Every controlled value used in the manifest has exactly one matching Legend definition.

Mark the result `STATIC_VALID` when these checks pass.
Mark `RUNTIME_READY` only after the project verifies its BDD runner, matching step definitions, environment, auth, fixtures, and cleanup.
This skill does not create step definitions or run tests.

## Rules

- Keep source Test Cases and requirements unchanged.
- Keep Gherkin keywords in English and scenario text in the source TC language. Use the current Scope Gate language for new manifest explanations without translating locked Test Case content.
- Do not add an artifact-language field to the feature or manifest header.
- Do not describe a static feature file as Playwright-runnable without runtime bridge evidence.
