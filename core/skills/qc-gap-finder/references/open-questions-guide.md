# Open Questions Management Guide

## Ledger Format (`qc/open-questions.md`)

```markdown
# Open Questions Ledger: [Project]
| ID | Requirement Ref | Question | Class | Priority | Impact On | Status | Answer | Answered Date |
|----|-----------------|----------|-------|----------|-----------|--------|--------|---------------|
| OQ-001 | US-010 AC2 | ... | GAP | High | VP-03, TC-LOG-002 | OPEN | | |
```

## Status Lifecycle

```
OPEN → ANSWERED → RESOLVED   (requirement updated by the PO agent)
OPEN → ANSWERED → WAIVED     (user accepts the risk; assumption recorded)
OPEN → WAIVED                (user waives directly)
```

## Priority Rules

- **High:** blocks correct test design or creates real delivery risk; must be asked in conversation immediately. Examples: missing rejection behavior for a security rule, undefined state transition, contradictory business rules.
- **Medium:** affects test completeness but a safe assumption exists; ask when convenient, otherwise log. Examples: unspecified error message wording, default sort order.
- **Low:** cosmetic or covered by a broad existing case; log only. Examples: tooltip wording, exact placeholder text.

## Question Crafting Rules

1. One question per OQ; do not bundle.
2. Propose 2-3 concrete options whenever the decision space is clear; open-ended only when it cannot be constrained.
3. State the testing impact of each option ("Nếu chọn A, tôi sẽ thiết kế 3 TC cho VP boundary; nếu chọn B thì 1 TC").
4. Never answer a GAP or AMB yourself; mark your assumption and let the user confirm it.

## Impact Propagation

When an OQ is answered, the answer must flow back into materials: viewpoints that reference the OQ are adjusted and re-versioned, and affected TCs are updated with the new behavior. The ledger's `Impact On` column tells the agent which files to touch. TCs that remain dependent on unanswered OQs keep the `[OQ-XXX]` flag in their title.
