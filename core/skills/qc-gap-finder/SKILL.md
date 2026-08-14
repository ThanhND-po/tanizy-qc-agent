---
name: qc-gap-finder
description: Analyze approved requirement documents to find gaps, ambiguities, and testability issues compared with testing knowledge, the current system state, and the bug base. Ask clarifying questions, log unanswered ones as Open Questions without blocking materials creation. Use when the user says "QC gap analysis", "tìm điểm mờ", "review requirement", or after requirement files are handed off.
---
# Gap Finder — Read Requirements, Find Gaps, Manage Open Questions

## Purpose

Read the requirement documents produced by the PO agent (Epic, User Story, Use Case, API Spec, NFR, or any combination) and identify everything a tester would need to know but the documents do not state. Gaps are compared against three sources of knowledge: testing domain knowledge (boundary values, state transitions, concurrency, error handling, security and performance basics), the current system state (`qc/refs/system-context.md`), and the bug base (`qc/refs/bug-base.md`).

Unanswered questions become managed **Open Questions (OQ)**, not blockers. Materials (viewpoints, test cases) can still be created while OQs remain open.

## Mandatory Inputs

| Input | File | Handling if missing |
|---|---|---|
| Requirement documents | User or handoff points to them | Required; ask for them |
| System context | `qc/refs/system-context.md` | Ask user briefly; continue with stated assumptions |
| Bug base | `qc/refs/bug-base.md` | Ask user briefly; continue and note the risk |
| Prior open questions | `qc/open-questions.md` | Load and merge; avoid duplicate OQs |

## Discovery Coverage (Gap Catalog)

Scan every requirement artifact against the following gap dimensions. Do not ask about all dimensions at once; cluster findings and present them in one pass.

| Dimension | What to look for |
|---|---|
| Ambiguity keywords | "where applicable", "as needed", "similar to", "etc.", "TBD", missing concrete values |
| Validation rules | Missing min/max, format, required/optional, error messages |
| Edge and exception behavior | Empty data, error states, network failure, concurrent access, timeouts |
| State and transitions | Undefined states, missing transition rules, unclear status meanings |
| Data concepts | Ownership, retention, uniqueness, idempotency, migration behavior |
| Business rules | Permission gaps, limits/thresholds, calculation formulas, rounding |
| Consistency | Conflicts between requirements, or between requirement and mockup/design |
| Existing system | How the new feature interacts with current flows, modules, integrations listed in system context |
| Bug base regression | Whether known bugs, workarounds, or fragile areas are affected; whether tests should cover them |
| Non-functional | Performance, scale, security, accessibility, observability expectations missing or unstated |

## Gap Classification

For every gap found, classify it:

| Class | Meaning | Action |
|---|---|---|
| **GAP (missing)** | Behavior not specified at all | Create OQ; design test cases with an explicit ASSUMPTION tag |
| **AMB (ambiguous)** | Specified but vague or contradictory | Create OQ with proposed options; user picks one |
| **RISK (system)** | Existing system state or bug base makes this area fragile | Create OQ flagged as regression risk; ensure viewpoint coverage |
| **OK (assumption safe)** | Minor and safe to assume | Log as assumption in the report, no OQ needed |

## Open Question Management

Manage `qc/open-questions.md` as the OQ ledger. Each entry:

```markdown
| ID | Requirement Ref | Question | Class | Priority | Impact On | Status | Answer |
|----|-----------------|----------|-------|----------|-----------|--------|--------|
| OQ-001 | US-010 AC2 | ... | GAP | High | VP-03, TC range | OPEN | |
```

Rules:

1. **High priority OQs are asked immediately** in the conversation, one question per message, multiple-choice when the decision space is clear.
2. Medium/Low OQs are appended to the ledger and announced once ("X câu hỏi mức Medium/Low đã lưu vào open-questions.md, trả lời sau vẫn tạo materials bình thường").
3. When the user answers, set Status to `ANSWERED`, fill the Answer column, and note which viewpoints/test cases will be updated in the next run.
4. A user may mark an OQ `WAIVED` to accept the risk explicitly; the assumption must then be recorded in the requirement ref file's notes or in the report.
5. Status values: `OPEN`, `ANSWERED`, `RESOLVED` (requirement updated by PO), `WAIVED`.

## Execution Steps

1. Read all requirement files and any mockup/design references.
2. Load `qc/refs/system-context.md`, `qc/refs/bug-base.md`, and the existing OQ ledger.
3. Scan against the Gap Catalog; cluster findings by requirement reference.
4. For each finding, propose a concrete question with options where possible; do not silently assume away any GAP or AMB.
5. Ask High-priority OQs now; log the rest to the ledger.
6. Save the gap analysis report to `qc/gap-report-<feature>.md` using the template structure below.
7. Present a summary to the user and confirm the assumptions that remain before viewpoints are designed.

## Gap Report Template

```markdown
# Gap Report: [Feature]
## 1. Inputs Analyzed
(files, system context version, bug base version)
## 2. Gaps Found
(table: #, Ref, Class, Finding, Proposed Question, Priority)
## 3. Open Questions Log
(table of the OQ ledger rows created in this run)
## 4. Assumptions Carried Into Design
(table: assumption, where used)
## 5. Regression Risks From Bug Base
(table: bug/known issue, affected area, test implication)
```

## Rules

- Do not create test cases in this skill; output is gaps, questions, and the report.
- Do not modify requirement files; all QC notes live under `qc/`.
- Never treat "simple" features as exempt from gap scanning.
- Ask in Vietnamese by default; keep technical terms in English.
- One question per message; prefer multiple choice.
- Save outputs in the target project, not inside skill folders.
