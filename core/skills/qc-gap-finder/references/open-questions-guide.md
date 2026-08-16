# Open Questions Management Guide

Use one ledger at `qc/open-questions.md`. Never create
`qc/refs/open-questions.md`.

## Canonical Schema

```markdown
| OQ ID | Scope Key | Source Path and Ref | Finding Class | Question Domain | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Owner | Target Date | Status | Decision | Decision By | Decision Source | Resolved Source Ref | Answered At | Status Updated At |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
```

Use `GAP`, `AMB`, `CONFLICT`, or `RISK` for Finding Class. Use Question Domain
for the business or technical topic, for example `Business Rule`, `File
Contract`, `NFR`, or `UI Contract`. Do not mix those two dimensions. Use
`High`, `Medium`, or `Low` for Priority. Use `DESIGN`, `EXPORT`, `EXECUTION`,
`REPORT`, or `NONE` for Blocks From Phase.

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

## PO to QC Status Mapping

| PO state or event | QC status | Required handling |
|---|---|---|
| Open | `OPEN` | Keep the existing blocker and impacted artifacts |
| Answered | `ANSWERED` | Record Decision, Decision By, Decision Source, and Answered At; do not claim the governing source is updated |
| Deferred | `OPEN` | Keep the blocker based on impact; use `WAIVED` only for explicit authorized risk acceptance |
| Governing source updated | `RESOLVED` | Record the exact Resolved Source Ref and Status Updated At |

Owner and Target Date are optional. Leave them blank or use `OPEN` when they
have not been explicitly assigned. Do not infer ownership, dates, decision
authority, or approval. Proposed Options remain proposals until an explicit
decision is recorded.

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
6. Record Decision By, Decision Source, and Answered At.
7. Set `RESOLVED` only when Resolved Source Ref points to the updated governing
   source.

## Impact Propagation

When an answer changes behavior:

1. update the ledger;
2. identify all affected artifacts;
3. mark downstream revisions `STALE` until reviewed;
4. obtain approval before rewriting those artifacts;
5. remove the blocked state only after the new source or explicit decision is
   traceable.
