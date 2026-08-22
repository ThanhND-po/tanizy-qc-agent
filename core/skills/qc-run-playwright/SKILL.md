---
name: qc-run-playwright
description: "Execute locked, runtime-ready UI Test Cases interactively with available Playwright browser tools after an explicit Execution Gate. Use only when the user asks to run specific TC IDs and confirms the environment, side effects, auth, fixtures, retry, and cleanup. This skill does not generate Playwright source code or build a reusable automation suite."
---

# Run Test Cases With Playwright

Execute approved test intent against the real application. Do not redesign a TC or change its Expected Result during execution.

## Capability Boundary

Use this skill in `INTERACTIVE_EXECUTION_ONLY` mode. It drives an available
browser automation tool to execute locked Test Case steps and append results.
It does not:

- Install or configure `@playwright/test`;
- Create `playwright.config.*`, `*.spec.ts`, `*.spec.js`, fixtures, Page Objects,
  helper libraries, or BDD step definitions;
- Convert a Gherkin feature into runnable automation;
- Build or maintain a reusable suite, CI job, trace viewer integration, or test
  reporting pipeline;
- Teach a Manual QC how to maintain Playwright code.

When the user asks to build, generate, scaffold, or maintain Playwright test
code, report `UNSUPPORTED_AUTOMATION_AUTHORING` and explain this package's
current boundary. Do not reinterpret the request as live execution and do not
create placeholder automation files. Record the need as deferred enhancement
`QC-AUTO-001` when project documentation is in the approved write set.

## Artifact Contract

Read the shared contract at `qc/config/material-paths.md`. Treat
`qc/executions/<scope-key>-executions.md` as an append-only run history.

## Required Inputs

| Input | Requirement |
|---|---|
| Source Test Cases | `LOCKED` revision with selected `UI-AUTO` or `BOTH` IDs |
| Design state | `STATIC_VALID`, no stale parent or unresolved OQ blocking from `DESIGN`, `EXPORT`, or `EXECUTION` |
| Application target | Exact URL and environment classification |
| Auth and roles | Approved account or fixture source; no hardcoded secrets |
| Data lifecycle | Fixture setup, allowed side effects, reset, and cleanup |
| Runtime tools | A browser automation tool with page inspection and interaction capabilities is available in the current session; record its exact identity as Result Source |
| Retry policy | User-approved retry budget for this run |
| Assessment policy | User-approved rule for selecting a result when retries exist |
| Evidence policy | `OPTIONAL` by default, or a user-approved or release-criteria override; external locators are allowed |
| Write set | Execution log, any approved evidence paths, and separately approved ref updates |

If any required input is absent, report the preflight as `BLOCKED` in chat and do not open a browser or write a run section. Record a `BLOCKED` attempt only when the Execution Gate passed and an approved runtime prerequisite later became unavailable. A Gherkin file is supplementary unless the project has separately verified its BDD runner and step bindings. The presence of a `.feature` file does not satisfy the runtime-tool requirement.

## Execution Gate

Before the first browser action, present:

- Run ID and selected TC IDs;
- Environment and application build or commit when known;
- Roles, fixtures, and Test Data sources;
- State-changing actions and cleanup plan;
- Retry budget, assessment policy, Evidence Policy, and permitted repairs;
- Exact files and any evidence directories to update.

Start only after explicit approval.

## Workflow

1. Append a new run header with Run ID, timestamp, environment, build, executor, source TC revision, approved retry, assessment, and Evidence policies, plus the native runner as Result Source.
2. Recon each page with the real accessibility tree. Prefer role, label, and visible text locators. Verify each locator before using it.
3. Execute each selected TC step in order, record the observable Actual Result, and capture supporting evidence according to the approved Evidence Policy.
4. Run the approved per-case cleanup, when applicable, and capture its result.
5. Append one row per `<Run ID, Attempt, TC ID>` using the canonical result values: `PASS`, `FAIL`, `BLOCKED`, `SKIP`, or `ERROR`.
6. Run suite-level cleanup and append the Run Footer. Do not edit earlier rows to add the footer result.
7. Derive latest status from the log when needed. Do not modify the locked Test Case revision with result, executor, date, evidence, or defect data.
8. Report the run summary, failures, blockers, cleanup state, and evidence availability.

## Repair Boundary

Allow automatic repair only for execution mechanics already covered by the approved retry policy:

- Refresh a locator after a new snapshot;
- Replace a fixed sleep with a state-based wait;
- Recover an expired session through the approved login fixture.

Stop and request a new gate before changing Test Data, Steps, Expected Results, environment, role, side effects, or cleanup. Never silently generate different business data. Do not repeat a non-idempotent TC merely to obtain two passes.

## Execution Log Shape

Follow this skill's `references/executions-log.md`. Each attempt must include Run ID, Attempt, TC ID, Result, Actual Result, Tested By, Tested At, Source Locator, and cleanup state. Evidence and a verified defect link are optional unless the approved policy requires them.

When project-local evidence is approved, store it under `qc/evidence/<scope-key>/<run-id-lowercase>/` using
`<tc-id-lowercase>-attempt-<n>-<evidence-key>.<ext>`. Preserve uppercase IDs in the execution log. Do not overwrite evidence from an earlier attempt. Preserve an approved external evidence locator without copying it into the project.

## Reference Updates

- Add a Bug Base row only for an observed product defect with evidence.
- Add System Context only for verified current behavior.
- Include these paths in the pre-approved write set, or ask before updating.
- Keep locator failures and automation errors out of the product Bug Base.

## Rules

- Run only on explicit user request and only after the Execution Gate.
- Do not describe interactive browser execution as a generated or reusable Playwright Test suite.
- Keep requirement documents read-only.
- Do not expose credentials or personal data in chat or artifacts.
