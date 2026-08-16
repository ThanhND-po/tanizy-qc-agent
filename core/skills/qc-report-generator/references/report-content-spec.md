# Test Report Content Specification

Use `COMPACT` mode by default. A stakeholder report should expose the decision, risk, and evidence without copying every source matrix into the main body.

Use `DETAILED` mode only when the user explicitly requests an audit report, full trace matrix, or detailed appendix. Detailed mode keeps the compact core and adds only the relevant appendices.

## COMPACT Core

Keep these three sections in order.

Place the Report Basis once in the title or header block: scope key, locked Viewpoint and Test Case revisions, selected Run IDs, environment, application build, Assessment Policy, and generated-at timestamp. Mark an unknown value explicitly. Do not repeat this metadata in later sections.

### 1. Decision Summary

Use one table:

| Item | Required content |
|---|---|
| Design | Designed TC count and design coverage by available source dimension |
| Execution | Attempt rows, attempted TCs, assessed TCs, and execution coverage |
| Results | Absolute `PASS`, `FAIL`, `BLOCKED`, `ERROR`, `SKIP`, and `NOT_RUN`; pass rate |
| Verdict | `GO`, `CONDITIONAL GO`, `NO-GO`, or `UNDETERMINED`, with cited criterion or missing authority |
| Required decision | The exact stakeholder decision, or `None` when no decision is needed |

Do not expand zero-value dimensions into separate rows unless they reveal a coverage gap.

### 2. Findings and Actions

Use one row per item that requires attention:

| Type | Item and impact | Evidence | Owner or decision needed |
|---|---|---|---|
| Failure, blocker, coverage gap, accepted bug, or communication | | | |

Include only groups that exist in the selected scope. When there are no failures, blockers, or coverage gaps, state that in one line instead of showing an empty table. Use `Not supplied under Evidence Policy` when supporting
Evidence is blank. An accepted bug requires the explicit decision, authority, date, and conditions.

End this section with one short recommendation. Cite release criteria for `GO`, `CONDITIONAL GO`, or `NO-GO`. Otherwise keep the verdict `UNDETERMINED` and state the decision required.

### 3. Confidence and Evidence

State in a short paragraph:

- What the selected runs prove;
- What remains untested or runtime-unverified;
- What Evidence Policy was used and how much supporting evidence is available;
- How those limits affect confidence.

Then link the locked requirement/Viewpoint/Test Case revisions, selected execution log sections, and available evidence for failures or blockers. Blank Evidence under the approved policy is a disclosed confidence limitation, not a reason to omit the result. One aggregate execution-log link is enough for passing cases in `COMPACT` mode when the full TC -> VP -> source trace remains resolvable there.

## DETAILED Appendices

Add an appendix only when it answers the user's request:

| Appendix | Include when |
|---|---|
| Coverage matrix | The user requests AC, BR, NFR, Viewpoint, or regression-level traceability |
| Result details | The user requests per-TC results or retry history |
| Full evidence index | The user requests one evidence row per TC and Run ID |
| Decision record | Accepted risks, accepted bugs, or release conditions need audit history |

Do not add a detailed appendix merely because data exists. Keep unexecuted and blocked source items visible in any included coverage matrix.

## Calculation Rules

- Apply the stated Assessment Policy to select one report status per TC while preserving every attempt row in the execution log.
- Place every locked TC in exactly one mutually exclusive report bucket: `PASS`, `FAIL`, `BLOCKED`, `ERROR`, `SKIP`, or `NOT_RUN`. The bucket counts must sum to the designed TC count.
- `Attempted TCs` = distinct locked TCs with at least one execution row in the selected runs.
- `Assessed TCs` = distinct locked TCs whose selected result is `PASS` or `FAIL`.
- Pass rate = `PASS / (PASS + FAIL)`. Show `N/A` when the denominator is zero.
- Design coverage = source items with at least one approved TC divided by total source items in scope.
- Execution coverage = source items with at least one assessed execution (`PASS` or `FAIL`) divided by total source items in scope.
- When an authoritative source denominator is unavailable, show coverage as `N/A` and state the missing inventory. Do not invent `0/0` or a percentage.
- Report absolute `BLOCKED`, `ERROR`, `SKIP`, and `NOT_RUN` counts next to rates.
- Derive `NOT_RUN` as locked Test Cases with no execution row in the selected runs. A TC with only `BLOCKED`, `ERROR`, or `SKIP` attempts is not also `NOT_RUN`.
- State the Assessment Policy in the report.

## Formatting Rules

- Lead with metrics, then short explanations.
- Keep dates and IDs machine-readable.
- Use exact links and identifiers.
- Avoid paragraphs longer than three lines where a table is clearer.
- Omit empty sections, duplicate summaries, and charts that repeat a table.
