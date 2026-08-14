---
name: qc-design-viewpoints
description: Design Test Viewpoints from approved requirements and gap findings, present them to the user for joint review and adjustment, and lock the viewpoint set before test case design. Use when the user says "thiết kế viewpoint", "QC viewpoint review", or after gap analysis when test angles need to be agreed.
---
# Viewpoint Design — Agree Testing Angles With the User Before Test Cases

## Purpose

A **Test Viewpoint** is a named testing angle that groups related test intent (for example "Login happy flow", "Permission boundaries", "State transition correctness", "Performance threshold"). Viewpoints sit between requirements and test cases: they guarantee the test set covers every required angle, and they give the user a compact checkpoint to review **before** test cases are written.

This skill exists to prevent the common failure of jumping straight from requirements to hundreds of undifferentiated test cases, and to give the user (tester, PO, or QA lead) one place to push back on scope, priority, and test angles.

## Mandatory Inputs

| Input | Source |
|---|---|
| Approved requirement files | Handoff or user-provided |
| Gap report + resolved/assumed OQs | `qc/gap-report-*.md` and `qc/open-questions.md` |
| System context | `qc/refs/system-context.md` |

If gap analysis has not been run for this feature, run `qc-gap-finder` first.

## Viewpoint Catalog (Starting Point)

Derive viewpoints from these angles; keep only those relevant to the feature and add feature-specific ones. Never copy this list blindly.

| Angle | Viewpoint family | Typical trigger |
|---|---|---|
| Functional happy path | Flow correctness | Every feature |
| Alternative / negative | Rejection, error handling | Validations, errors in AC |
| Boundary & data variation | Min/max, formats, empty, special chars | Input fields, limits |
| State & transitions | Status rules, lifecycle | State machine, workflow |
| Permission & role | Access control matrix | Roles in actors list |
| Integration & data flow | Upstream/downstream | Dependencies section |
| Non-functional | Performance, security, accessibility | NFR document present |
| Regression | Known bugs, fragile modules | Bug base entries |

## Execution Steps

1. Read requirements and the gap report. List every AC, use case step, business rule, and NFR statement.
2. Map each requirement element to candidate viewpoints (an AC can map to multiple viewpoints; a viewpoint must cite the refs it covers).
3. Check coverage: every AC and every business rule must appear in at least one viewpoint. Missing coverage means adding a viewpoint, not skipping.
4. Assign each viewpoint a priority (`P1` must test, `P2` should test, `P3` if time allows) with a one-line rationale.
5. Write `qc/test-viewpoints.md` with the template below, version it (`Version 1`), and stop at the **checkpoint**.

## Checkpoint — User Review Is Mandatory

Present the viewpoint table and ask the user to review jointly. Possible adjustments the user may request, and their handling:

| User adjustment | Handling |
|---|---|
| Merge or split viewpoints | Update refs and coverage mapping; bump version |
| Change priority | Update and note reason |
| Drop a viewpoint | Allowed only if no uncovered AC remains; log the waiver |
| Add a viewpoint | Verify which refs it covers, add, re-check coverage |
| "Keep going, viewpoints look fine" | Lock the set; proceed to test case design |

Continue adjusting until the user confirms the viewpoint set. Record the locked version number in `qc/test-viewpoints.md` header and in `qc/qc-task.md`.

## Viewpoint File Template

```markdown
# Test Viewpoints: [Feature] — Version N (Locked)
## 1. Scope
(requirements covered, feature name, date, reviewers)
## 2. Viewpoint Table
| VP ID | Viewpoint | Type | Priority | Covered Refs (AC / VP / rules) | Rationale |
|---|---|---|---|---|---|
| VP-01 | ... | Flow | P1 | US-010 AC1-AC3 | ... |
## 3. Coverage Check
(table: requirement ref → viewpoints covering it; every ref must have ≥1)
## 4. Open Question Impact
(OQs whose answers affect viewpoint scope, with status)
## 5. Review History
(version, date, adjustment, who)
```

## Rules

- Do not write test cases in this skill; only viewpoints, coverage, and review history.
- The viewpoint set is locked only after explicit user confirmation; a lock record is mandatory.
- A viewpoint without covered requirement refs is not allowed.
- Ask in Vietnamese by default; keep IDs and technical terms in English.
- Save outputs in the target project, not inside skill folders.
