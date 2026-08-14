# Context Templates — System Context and Bug Base

These are the recommended formats for the two context files that make gap finding significantly more precise. Create them once per project and update when the system or bug base changes.

## `qc/refs/system-context.md`

```markdown
# System Context: [Project]
## 1. Product Overview
(one paragraph: what the system does, main modules)
## 2. Existing Modules and Current Behavior
| Module | Current behavior | Notes |
|---|---|---|
## 3. Key Technical Constraints
(auth mechanism, hosting, browser support, integrations, rate limits)
## 4. Known Fragile Areas
(modules with frequent defects, flaky flows, areas under active refactoring)
## 5. Data Environment Notes
(seed data available, test account roles, data retention quirks)
## 6. Last Updated
(date, who)
```

## `qc/refs/bug-base.md`

```markdown
# Bug Base: [Project]
| Bug Ref | Area | Description | Current State | Regression Implication |
|---|---|---|---|---|
| BUG-101 | Login | ... | Fixed in v1.2, workaround in v1.1 | Re-test login after auth changes |
```

Guidance for the Regression Implication column: state which future features should add regression cases for this bug, and whether a workaround still exists that tests must not accidentally verify as correct behavior.
