# Bug Base

<!--
TEMPLATE — Seeded by the Tanizy QC Agent installer as an empty runtime
artifact. The QC Agent compares gaps and test design against known defects so
that:
- Regression-prone areas get extra test coverage.
- Workarounds in the current system are not mistaken for intended behavior.
- Already-known bugs are not re-reported as new gaps.

Who fills it: the AGENT, automatically, after each phase:
- qc-gap-finder appends regression-prone areas found during analysis.
- qc-run-playwright / qc-export-postman append defects found during runs
  (Bug ID = filed bug ID, or TBD until filed).
- qc-report-generator appends unresolved FAIL/BLOCKED findings after reports.
The user only confirms sensitive items; manual entry is never required.

Rules:
- One row per bug/fragile area; keep rows short.
- Only log bugs that are still RELEVANT (open, pending fix, or
  fixed-but-regression-prone).
- When a bug is fixed and stable, move it to the history section instead of
  deleting it.
-->

## Open / Pending Bugs

| # | Bug ID | Mô tả ngắn | Mức | Workaround | QC impact |
|---|--------|------------|-----|------------|-----------|
| 1 | | | | | |
| 2 | | | | | |

## Fixed but Regression-Prone

| # | Bug ID | Đã fix version | Vì sao dễ tái diễn | Coverage cần thêm |
|---|--------|----------------|--------------------|--------------------|
| 1 | | | | |

## History (fixed, stable)

| # | Bug ID | Mô tả ngắn | Fix version | Date |
|---|--------|------------|-------------|------|
| 1 | | | | |

## Notes

- Seed version: 2.0 — tables narrowed; agent self-updates enabled.
