# Open Questions Management Guide

Use one ledger at `qc/open-questions.md`. Never create
`qc/refs/open-questions.md`.

## Canonical Schema

```markdown
| OQ ID | Scope Key | Source Path and Ref | Type | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Status | Decision | Decision Source | Answered At |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
```

Use `GAP`, `AMB`, `CONFLICT`, or `RISK` for Type. Use `High`, `Medium`, or `Low`
for Priority. Use `DESIGN`, `EXPORT`, `EXECUTION`, `REPORT`, or `NONE` for
Blocks From Phase.

Use `OQ-<SCOPE-CODE>-NNN`. Keep every OQ ID unique across the shared ledger and
never reuse an ID for a different decision.

## Status Lifecycle

```text
OPEN -> ANSWERED -> RESOLVED
OPEN -> WAIVED
ANSWERED -> WAIVED
```

- `OPEN`: no decision exists.
- `ANSWERED`: an authorized person gave an explicit decision, but the source
  requirement may not yet contain it.
- `RESOLVED`: the governing source was updated and linked.
- `WAIVED`: an authorized person explicitly accepted the documented risk.

Silence, inactivity, or delivery pressure never changes status.

## Blocking Rules

Use `DESIGN` when the answer is required to define Test Data, Expected Result,
actor, precondition, state, action, permission, or an API contract used as test
intent. Use `EXECUTION` when design is complete but route, auth, fixture,
cleanup, environment, or runtime tools are unverified. Use the earliest affected
phase and list impacted artifacts. If a `DESIGN` blocker invalidates the entire
workflow, set the design gate to `STOP`.

Priority and blocking are different. A Medium OQ may block correct design, and
a High operational risk may block execution without blocking a source-backed
functional case.

## Question Rules

1. Keep one decision per OQ.
2. Cite the exact source path and section or ID.
3. Offer two or three options only when they are proposals, not inferred rules.
4. State the downstream impact of each option.
5. Record the answer exactly enough to preserve the decision.
6. Record who or what supplied the decision and when.

## Impact Propagation

When an answer changes behavior:

1. update the ledger;
2. identify all affected artifacts;
3. mark downstream revisions `STALE` until reviewed;
4. obtain approval before rewriting those artifacts;
5. remove the blocked state only after the new source or explicit decision is
   traceable.
