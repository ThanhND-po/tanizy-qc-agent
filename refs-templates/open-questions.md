# QC Open Questions

This project-owned ledger is seeded at `qc/open-questions.md`. Installer updates preserve existing content.

## Status Values

- `OPEN`: no decision exists.
- `ANSWERED`: an explicit decision exists, but the governing source may not be updated yet.
- `RESOLVED`: the governing source was updated and linked.
- `WAIVED`: an authorized person explicitly accepted the documented risk.

Silence is not approval. A blocking Open Question prevents downstream work for its affected scope.

Use `OQ-<SCOPE-CODE>-NNN`. Keep IDs unique across this ledger and never reuse an ID for a different decision.

Use `GAP`, `AMB`, `CONFLICT`, or `RISK` for Finding Class. Record the business
or technical topic separately in Question Domain, for example `Business Rule`,
`File Contract`, `NFR`, or `UI Contract`. Proposed Options are proposals, not
decisions.

Owner and Target Date are optional. Leave them blank or use `OPEN` when they
have not been explicitly assigned. Do not infer an owner, deadline, decision,
or approval.

## Ledger

| OQ ID | Scope Key | Source Path and Ref | Finding Class | Question Domain | Question | Proposed Options | Priority | Blocks From Phase | Impacted Artifacts | Owner | Target Date | Status | Decision | Decision By | Decision Source | Resolved Source Ref | Answered At | Status Updated At |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## PO Handoff Mapping

| PO state or event | QC status | Required handling |
|---|---|---|
| Open | `OPEN` | Keep the existing blocker and impacted artifacts |
| Answered | `ANSWERED` | Record Decision, Decision By, Decision Source, and Answered At; keep the governing source update traceable |
| Deferred | `OPEN` | Keep the blocker based on impact; use `WAIVED` only for explicit authorized risk acceptance |
| Governing source updated | `RESOLVED` | Record the exact Resolved Source Ref and Status Updated At |

Silence or inactivity never changes QC status.

## Revision History

| Revision | Date | Change | Updated By | Change Source |
|---|---|---|---|---|
| 1 | | Seed created | Installer | Package template |
