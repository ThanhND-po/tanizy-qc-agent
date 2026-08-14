# System Context

<!--
TEMPLATE — This file is seeded by the Tanizy QC Agent installer as an empty
runtime artifact. The QC Agent (gap-finder, viewpoints, test-case design) uses
this file to compare new requirements against the CURRENT state of the existing
system, so findings do not duplicate behavior the system already implements.

How to fill it (one short session is enough):
1. Ask the PO agent or the user: "What does the current system already do
   regarding this feature/module?"
2. Record current behavior, constraints, and known workarounds below.
3. Note the version/date so the QC Agent can detect stale context.

How the AGENT maintains it (user does not need to edit manually):
- qc-gap-finder appends newly discovered current-system facts after each
  analysis (new behavior, constraints, workarounds), with source and date.
- qc-run-playwright / qc-export-postman append unexpected existing behavior
  discovered during runs.
- The agent announces each update in one sentence; the user only confirms
  sensitive entries.

Rules:
- Keep entries factual and sourced (which doc/feature/version).
- When a requirement changes implemented behavior, update the affected row
  instead of deleting the history (the QC Agent needs both states).
- A section left empty means "no known current behavior" — the QC Agent may
  treat it as a greenfield area.
-->

## Module: [Tên module / feature đang QC]

| # | Hiện trạng hệ thống | Nguồn (doc/feature/version) | Cập nhật lần cuối |
|---|---|---|---|
| 1 | | | |
| 2 | | | |

## Constraints & Workarounds đã biết

- <!-- Ví dụ: "Approval chỉ hỗ trợ single-round; batch chưa làm" -->

## Notes

- Seed version: 2.0 — agent self-update rules added.
