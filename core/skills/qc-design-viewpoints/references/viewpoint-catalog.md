# Viewpoint Catalog Reference

This catalog lists viewpoint families that `qc-design-viewpoints` derives from. It is a starting point, not a checklist to copy: keep only viewpoints relevant to the feature, and add feature-specific ones where the requirement describes angles not covered here.

## Functional Angles

| Family | Viewpoints | Typical Triggers in Requirements |
|---|---|---|
| Flow correctness | Happy path end-to-end per use case | Every use case / user story |
| Alternative flow | Each alternate path defined in the use case | "Alternative path" sections |
| Negative / rejection | Each validation rule, each error code | Validation table, error behavior ACs |
| Data boundary | Min/max, format, empty, whitespace, special characters, duplicates | Numeric limits, format rules |
| Input validation | Requiredness, normalization, cross-field rules, validation timing and error behavior | Form rules, field definitions, UI design |
| UI component interaction | State, content mapping, controls, navigation and failure behavior of a named component | Screen specification, UI design, component behavior ACs |
| State machine | Each valid transition; each invalid transition attempt | Status lists, workflow diagrams |
| Permission | Each role x action combination; unauthorized access attempts | Actor/role tables |
| Search / filter / sort | Each filterable column, empty results, pagination boundaries | List pages, search ACs |
| Bulk / batch | Partial success, limit per batch, idempotency | Batch import/export features |
| Notification / output | Each notification trigger, email content, export format | Notification rules, export ACs |

## Non-Functional Angles

| Family | Viewpoints | Typical Triggers |
|---|---|---|
| Performance | Response time threshold, concurrent users | NFR document |
| Security | AuthN, authorization, injection surfaces, sensitive data exposure | NFR, auth flows |
| Accessibility | Keyboard navigation, screen reader labels | NFR, UI guidelines |
| Compatibility | Browser/device matrix | NFR |
| Observability | Logs, audit trail, metrics for key actions | NFR, compliance requirements |

## System and Regression Angles

| Family | Viewpoints | Typical Triggers |
|---|---|---|
| Integration | Upstream producer failures, downstream consumer tolerance | Dependency matrix |
| Migration / coexistence | Old and new behavior coexist during rollout | Migration notes |
| Known bug regression | Re-test known bugs in affected areas plus neighbors | Bug base entries |

## Viewpoint Anatomy

Every viewpoint must state: a stable ID (`VP-<SCOPE-CODE>-NNN`), a named
test item and item type, one coherent coverage intent, a type (functional /
non-functional / regression), a priority (P1 must, P2 should, P3 if time), the
requirement refs it covers, and a one-line rationale. A viewpoint without
covered refs is invalid and must be merged or dropped.

Do not use a Viewpoint as an abstract Test Case. Keep concrete Preconditions,
Test Data, Steps, and Expected Results in `qc-design-test-cases`.
