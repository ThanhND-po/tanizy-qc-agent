# System Context

This project-owned reference stores verified current behavior and constraints.
Installer updates preserve existing content.

An empty table means current behavior is unknown. It does not mean the scope is
greenfield.

System Context cannot override an approved PO requirement. Route a conflict to
the Gap Report and Open Questions ledger. Use `CTX-<SCOPE-CODE>-NNN` for Context
ID and `CON-<SCOPE-CODE>-NNN` for Constraint ID. Status is `ACTIVE`, `STALE`, or
`SUPERSEDED`.

## Verified Context

| Context ID | Scope Key | Module | Environment | Verified Current Behavior or Constraint | Source | Source Revision | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|---|---|---|

## Known Environment Constraints

| Constraint ID | Scope Key | Module | Environment | Constraint | Source | Source Revision | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|---|---|---|

## Example

The row below is illustrative only. Do not treat it as verified project context. Replace every placeholder with the approved source and verification metadata before copying it into Known Environment Constraints.

| Constraint ID | Scope Key | Module | Environment | Constraint | Source | Source Revision | Verified At | Verified By | Status |
|---|---|---|---|---|---|---|---|---|---|
| CON-TIME-001 | `replace-with-scope-key` | Shared date-time handling | All | Mọi thao tác ghi giá trị thời gian vào DB từ đơn vị giờ trở đi phải lưu bằng UTC+0 dưới dạng `timestamptz`. FE phải truyền timezone trong request để BE xử lý. Khi nhận lại `timestamptz`, FE phải convert về giờ local trước khi hiển thị. | `replace-with-approved-architecture-or-API-ref` | `replace-with-source-revision` | `YYYY-MM-DDTHH:mm:ssZ` | `replace-with-verifier` | ACTIVE |

## Revision History

| Revision | Date | Change | Updated By | Change Source |
|---|---|---|---|---|
| 1 | | Seed created | Installer | Package template |
