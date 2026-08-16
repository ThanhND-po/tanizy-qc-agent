# Verified Context Schemas

Use these schemas only for verified current-state facts and known defects.
Keep hypotheses in the gap report or Open Questions ledger.

## System Context

Location: `qc/refs/system-context.md`

```markdown
| Context ID | Scope Key | Module | Environment | Verified Current Behavior or Constraint | Source | Source Revision | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|---|---|---|
```

An empty table means current behavior is unknown. It does not mean the feature
is greenfield. Use `CTX-<SCOPE-CODE>-NNN`. Status is `ACTIVE`, `STALE`, or
`SUPERSEDED`.

Known environment constraints use this schema in the same file:

```markdown
| Constraint ID | Scope Key | Module | Environment | Constraint | Source | Source Revision | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|---|---|---|
```

Use `CON-<SCOPE-CODE>-NNN`. System Context records verified current state, but
cannot override an approved PO requirement. Route a conflict to the Gap Report
and Open Questions ledger.

## Bug Base

Location: `qc/refs/bug-base.md`

```markdown
| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
```

Add a row only for a verified existing bug or an observed execution failure
classified as a product defect. Evidence is required for Bug Base promotion,
but may be an exact external path, URL, or evidence ID. Do not add `TBD` bugs
from risk hypotheses or invent a customer tracker ID. Use `OPEN`,
`IN_PROGRESS`, `FIXED`, `VERIFIED`, `CLOSED`, or `REOPENED` for Status. Preserve
closed rows in the same lifecycle table so requirement, TC, Run, evidence, and
regression trace remain available.
