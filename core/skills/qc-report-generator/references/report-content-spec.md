# Report Content Specification

Every test report — regardless of format — MUST contain the sections below,
in this order. Keep wording minimal; use tables and badges/colored labels.
The stakeholder must be able to skim the report in under 60 seconds.

## Section Order

### 1. Summary Card
Single screen overview:
| Metric | Value |
|---|---|
| Scope | <Epic / Feature / US + links> |
| Test cases | N designed / M executed |
| PASS | N (x%) |
| FAIL | N |
| BLOCKED | N |
| SKIP / NOT_RUN (never executed) | N |
| Coverage | x% of viewpoints, y% of ACs |
| Blockers | N |
| Verdict | GO / CONDITIONAL GO / NO-GO |

### 2. What Was Tested
Short scope statement + table of tested items with links to their requirement
documents. One row per Epic/Feature/US.

### 3. Result Breakdown
Table: Viewpoint / AC → # cases → PASS / FAIL / BLOCKED.
This table is the traceability spine: every viewpoint designed in
`qc/test-viewpoints/` appears, even if no cases were run for it.

### 4. Coverage Detail
- Coverage matrix: each Viewpoint ID → each AC → case IDs → results.
- Call out **uncovered viewpoints/ACs** explicitly (they are risks, not zeros).

### 5. Issues
Subdivided into exactly these four groups:
| Group | Who must act |
|---|---|
| **Blocking** | Release is blocked until fixed |
| **Failures (new defects)** | Dev triage; each row cites bug ID or new issue to file |
| **Accepted bugs (shippable)** | Documented decision: why safe to release |
| **Stakeholder-aware needed** | Known issues that move to "known issue" only AFTER
  stakeholder has been informed — list what must be communicated |

### 6. Confidence Statement
1–2 sentences: how much of the scope the results cover, what was NOT tested,
and how reliable the verdict is (e.g. "Coverage is sufficient for GO on the
transfer flow; the refund flow was not executed").

### 7. Recommendation
GO / CONDITIONAL GO / NO-GO with the explicit conditions
(e.g. "CONDITIONAL GO — ship after BUG-101 fix is verified").

### 8. Evidence Index
Links to screenshots, logs, run artifacts — table format, max 2 columns
(Test Case ID → Evidence link).

## Formatting Rules

- Numbers first, prose second. Every section leads with a table or metric.
- No paragraphs longer than 3 lines.
- Status values rendered with visual weight per format:
  - HTML: colored badge chips (PASS green, FAIL red, BLOCKED amber).
  - PPTX: colored cells + chart slide.
  - Markdown: `✅ PASS` / `❌ FAIL` / `🚫 BLOCKED` / `⏭ SKIP` / `⚠ ERROR` / `○ NOT_RUN` markers.
- Dates and IDs are machine-readable (YYYY-MM-DD, TC-NNN, VP-NN, AC-N.N).

## Coverage Math

- Viewpoint coverage = executed viewpoints ÷ total viewpoints.
- AC coverage = ACs with ≥1 executed case ÷ total ACs in scope.
- Pass rate = PASS ÷ executed (excluding SKIP/BLOCKED/ERROR/NOT_RUN). Report both
  pass rate and the absolute FAIL count — pass rate alone hides blockers.
- `NOT_RUN` test cases (never executed) are counted as "designed, not run" and
  must never inflate the executed denominator; when reading from TC status
  fields (see executions-log rule 5), the same exclusion applies.
