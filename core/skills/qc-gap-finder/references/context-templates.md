# Verified Context Schemas

Use these schemas only for verified current-state facts and known defects.
Keep hypotheses in the gap report or Open Questions ledger.

## System Context

Location: `qc/refs/system-context.md`

```markdown
| Context ID | Module | Verified Current Behavior or Constraint | Source | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|
```

An empty table means current behavior is unknown. It does not mean the feature
is greenfield.

## Bug Base

Location: `qc/refs/bug-base.md`

```markdown
| Bug ID | Module | Summary | Status | Environment | Evidence | Observed At | Regression Implication |
|---|---|---|---|---|---|---|---|
```

Add a row only for a verified existing bug or an observed execution failure
classified as a product defect. Do not add `TBD` bugs from risk hypotheses.
