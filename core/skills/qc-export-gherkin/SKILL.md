---
name: qc-export-gherkin
description: Convert defined test cases that are eligible for UI automation (UI-AUTO or BOTH) into Gherkin .feature files runnable with Playwright. Use when the user says "xuất Gherkin", "convert TC sang feature", "gherkin cho TC này", or after test cases are designed and a subset is selected.
---
# Gherkin Export — Test Cases to Playwright-Runnable .feature Files

## Purpose

Transform the test cases designed by `qc-design-test-cases` into well-formed Gherkin (`.feature`) files that a Playwright BDD setup can execute. The export is **only for TCs with automation eligibility `UI-AUTO` or `BOTH`**; manual-only TCs are reported but not converted.

## Selection Scope

Accept a scope from the user in one of these forms: a list of TC IDs, a viewpoint ID (all TCs of that VP), a feature code (all `TC-LOG-*`), or "all eligible". If the user gives no scope, list the eligible TCs with counts and ask them to choose.

## Conversion Rules

| TC element | Gherkin mapping |
|---|---|
| Precondition | `Background:` (shared) or first `Given` steps |
| Test data | `Examples:` table under `Scenario Outline`, or inline `Given` with concrete values |
| Numbered steps | `When`/`Then` in order; split at the first verification step |
| Expected result | `Then` assertions (one per verifiable outcome) |
| TC ID, title | `@TC-XXX-NNN` tag and `Scenario:` name |
| Trace refs | `@VP-XX @US-XXX-AC1` tags |
| OQ-flagged TC | Add `@provisional` tag and a comment line noting the OQ |
| Notes column | Comment lines above the scenario |

Step phrasing rules: write steps as user-facing behavior (`Given the user is on the login page`, `When they submit valid credentials`), not DOM actions (`click button`). Keep one assertion per `Then` where practical. Name steps so the same wording can be reused across scenarios (step definition reuse).

## Output Structure

Save into the target project under `specs/` (confirm path with the user):

```text
specs/
├── login.feature          # one feature per module/code, or per viewpoint
├── api-user-mgmt.feature
└── README.md              # index: feature → TC IDs → viewpoint mapping
```

Each feature file starts with:

```gherkin
# Feature: [module name] — source: qc/test-cases.md
@module-xxx @vp-01
Feature: [Feature Name]
  As a [actor]
  I want [capability]
  So that [value]

  Background:
    Given the application is running at <env>
    ...

  @TC-LOG-001 @vp-01 @us-010-ac1
  Scenario: Đăng nhập thành công
    Given ...
    When ...
    Then ...
```

## Validation Gate

Before delivery, check: every exported TC ID appears as a tag exactly once; every scenario has at least one `Then`; no manual-only TC was converted; the README index lists all exported features with TC ranges. Report any TC whose steps cannot be expressed behaviorally (for example pixel checks) back to the user as `NEEDS_REVIEW` rather than forcing a conversion.

## Rules

- This skill only produces specification files; it does not run them (use `qc-run-playwright`) nor write step definitions.
- Do not invent element selectors or implementation details in Gherkin.
- Keep scenario names and step texts in the same language as the source TCs.
- Ask in Vietnamese by default in conversation; Gherkin keywords stay English.
- Save outputs in the target project, not inside skill folders.
