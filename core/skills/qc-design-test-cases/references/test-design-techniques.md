# Test Design Techniques Guide

Use this package-managed guide only after a Test Viewpoint revision is `LOCKED`.
It supports Test Case Design:

```text
locked leaf Viewpoint
-> define coverage item
-> define measurable coverage target and rationale
-> select an appropriate Test Design Technique
-> derive atomic Test Cases
-> reconcile achieved coverage with the target
```

This guide does not discover, add, merge, split, or reinterpret Viewpoints.
It does not supply business rules, limits, states, role permissions, expected results, performance thresholds, or supported combinations.
Obtain those from the locked Viewpoint and its approved source trace.

If Test Case Design reveals a source-backed angle without a locked leaf Viewpoint, stop only the affected scope and return it to `qc-design-viewpoints`.
If a rule or oracle is missing, follow the readiness route recorded by the locked parent.
Do not invent a Test Case, provisional Viewpoint, Finding, or OQ.

## Design Entry Gate

Start only when all conditions are met:

- The parent Viewpoint artifact is `LOCKED` with an exact revision.
- The selected VP ID is a leaf Viewpoint, not a broad parent or brainstorming node.
- The Viewpoint names a test item, one coherent coverage intent, exact source refs, and a rationale.
- No `SPEC_GAP`, design-blocking OQ, or unresolved source conflict blocks the selected scope.
- The approved source defines enough behavior to produce an observable Expected Result.

Keep the parent revision immutable during this activity.
A new discovery or source change requires a separately reviewed Viewpoint revision.

## Coverage Contract

Define the following three elements before writing Test Cases for each leaf Viewpoint.

| Element | Meaning | Example forms |
|---|---|---|
| Coverage item | The enumerable or classifiable thing exercised by the cases | Equivalence partitions, boundary points, rules, state transitions, scenarios, roles, timing windows, migration combinations |
| Coverage target | The measurable amount or subset intended for this revision | Every approved state transition, each supported role x action pair, all defined boundary points, an approved risk-based subset of combinations |
| Rationale | Why that target is sufficient for the product risk and scope | Financial calculation risk, contractual compatibility, high-use flow, low-risk equivalent variants, approved waiver |

Do not write arbitrary percentages such as `20% of other forms` or `100%` without defining the denominator, selection rule, and source-backed or approved rationale.
A target is reproducible only when another reviewer can derive the same included and excluded items.

Record a working Coverage Design Map:

| Leaf VP ID | Coverage item | Coverage target | Denominator or selection rule | Technique IDs | Rationale | Planned TC IDs | Exclusions or blockers |
|---|---|---|---|---|---|---|---|

One leaf Viewpoint may need multiple techniques.
One Test Case may cover multiple coverage items only when its Preconditions, Test Data, Steps, and Expected Results remain atomic and failures remain diagnosable.

## Technique Selection

Use the smallest set of techniques that makes the declared coverage target explicit and reproducible.

| Technique ID | Technique | Use when | Typical coverage items |
|---|---|---|---|
| `TDT-EP` | Equivalence Partitioning | Defined input or output classes are expected to behave alike | Valid, invalid, empty, missing, authorized, unauthorized, legacy, new partitions |
| `TDT-BVA` | Boundary Value Analysis | Behavior changes at an ordered limit or immediately around it | Minimum, maximum, just below, at, just above, first, last, cutoff |
| `TDT-DT` | Decision Table | Outcomes depend on combinations of conditions or rules | Condition combinations, actions, exclusions, precedence, conflicts |
| `TDT-ST` | State Transition | Behavior depends on current state and an event | Valid transitions, invalid attempts, terminal states, repeated events |
| `TDT-SC` | Scenario and Use-Flow | Value or risk spans a sequence across actors, components, or systems | Main, alternative, rejection, cancel, retry, recovery, end-to-end flows |
| `TDT-RM` | Role and Permission Matrix | Access or outcome varies by actor, role, owner, or tenant | Role x action, owner x object, permitted and denied visibility |
| `TDT-TM` | Timing and Sequence Analysis | Order, delay, timeout, expiry, scheduling, or version timing changes behavior | Before, at, after, reordered, delayed, expired, overlapping events |
| `TDT-CC` | Classification Tree or Pairwise Combination | Several independent factors create too many combinations for exhaustive coverage | Representative valid combinations, pair coverage, risk-weighted combinations |
| `TDT-CO` | Concurrency and Interleaving | Simultaneous or repeated actions can change integrity or state | Same record updates, duplicate submit, race order, lock conflict, retry overlap |
| `TDT-MG` | Migration and Coexistence Matrix | Old and new data, clients, contracts, schemas, or rollout stages interact | Data age x app version, source schema x target schema, before/during/after rollout |
| `TDT-NFR` | Quality Characteristic Design | A source defines a measurable non-functional risk or oracle | Performance workload, accessibility checks, security misuse, recovery, compatibility |

Experience-based error guessing or exploratory charters may supplement these techniques when the risk and scope are explicit.
They do not replace traceable coverage of locked Viewpoints and approved sources.

## Technique Rules

### `TDT-EP`, Equivalence Partitioning

1. Identify the source-defined characteristic that divides behavior.
2. List mutually understandable partitions, including invalid partitions only when the expected rejection is defined.
3. Define which partitions are included in the target.
4. Choose a representative concrete value for each included partition.
5. Do not assume two values are equivalent when the source, storage, locale, or downstream processing can distinguish them.

### `TDT-BVA`, Boundary Value Analysis

1. Identify the source-defined ordered domain and exact boundary.
2. State the boundary model, such as two-value or three-value coverage.
3. Select only valid concrete values for the data type and unit.
4. Trace the expected result at every selected point to the governing rule.
5. Include temporal, count, size, page, sequence, and lifecycle boundaries when those are the locked risk, not only numeric field limits.

### `TDT-DT`, Decision Table

1. List source-defined conditions and actions.
2. Normalize condition meanings without changing the business rule.
3. Enumerate meaningful rule columns and mark impossible combinations with a source or approved constraint.
4. Resolve precedence only from approved evidence.
5. Map every included rule column to at least one Test Case.

Do not simplify a decision table by dropping a combination whose outcome is unknown.
Treat the missing outcome as a blocker.

### `TDT-ST`, State Transition

1. List source-defined states, events, guards, actions, and outcomes.
2. Establish the approved initial state for each case.
3. Define the target for valid transitions, invalid transition attempts, repeated events, and terminal-state behavior.
4. Cover transition sequences when history affects the outcome.
5. Keep state names and numeric values exactly as defined by their own domain.

Do not reuse a status meaning from another module or lifecycle merely because the numeric code is the same.

### `TDT-SC`, Scenario and Use-Flow Design

1. Anchor the scenario to the locked business value and named actor.
2. Identify the main flow plus source-defined alternative, rejection, cancel, retry, interruption, and recovery flows.
3. Mark system boundaries and observable checkpoints.
4. Keep each Test Case diagnosable. Split unrelated failures even if they occur in one long user journey.
5. Do not use scenario coverage as a substitute for detailed rule, boundary, or state coverage when those are separate locked Viewpoints.

### `TDT-RM`, Role and Permission Matrix

1. List approved actors, roles, ownership, tenant, and object scope.
2. Cross them with relevant actions and visibility.
3. Identify permitted, denied, hidden, and cross-tenant outcomes only when governed by source.
4. Define whether UI prevention, API rejection, data isolation, or audit evidence is part of the oracle.
5. Map each included matrix cell to a case or an explicit approved exclusion.

### `TDT-TM`, Timing and Sequence Analysis

1. Identify the source-defined event, clock, ordering rule, timeout, expiry, cutoff, schedule, or before and after condition.
2. Define timing windows and clock authority without inventing tolerance.
3. Select before, at, and after points when the exact boundary is defined.
4. Cover reordered, delayed, repeated, interrupted, or missed events when in scope.
5. Record timezone, clock control, and deterministic setup needed by the case.

### `TDT-CC`, Combination Design

1. List factors and source-defined levels.
2. Remove impossible combinations only with a traceable constraint.
3. Use exhaustive coverage when required by the risk or approved target.
4. For pairwise or risk-based reduction, record the algorithm or selection rule, uncovered combinations, and rationale.
5. Add high-risk combinations explicitly even when the generated set omits them.

### `TDT-CO`, Concurrency and Interleaving

1. Identify actors or processes operating on the same resource or business state.
2. Enumerate relevant interleavings, duplicate events, lock states, and retry order.
3. Define synchronization points so the case is reproducible.
4. Assert source-backed integrity, state, user feedback, and recovery outcomes.
5. Separate a concurrency design from load or performance testing unless both quality risks are locked.

### `TDT-MG`, Migration and Coexistence Matrix

1. List source-defined dimensions such as record origin, schema version, app or API version, migration stage, feature flag, and read or write path.
2. Build a matrix of supported, rejected, converted, and excluded combinations.
3. Cover mapping, reconciliation, failure, retry, rollback, and downstream impact only where the locked Viewpoints require them.
4. Define pre-migration, in-progress, and post-migration evidence separately.
5. Preserve immutable source fixtures when they represent legacy data. Do not rewrite them to resemble new records.

Example coverage structure for a version coexistence risk:

| Record origin | Client version | Operation | Expected rule source | Included? | TC ID |
|---|---|---|---|---|---|
| Legacy | Old | Read | `<source ref>` | `<yes/no>` | `<TC ID>` |
| Legacy | New | Read | `<source ref>` | `<yes/no>` | `<TC ID>` |
| New | Old | Read | `<source ref>` | `<yes/no>` | `<TC ID>` |
| New | New | Read | `<source ref>` | `<yes/no>` | `<TC ID>` |

The table is a design structure, not a rule.
Do not assume all four combinations are supported or share the same Expected Result.

### `TDT-NFR`, Quality Characteristic Design

Select a technique appropriate to the locked quality risk and measurable oracle.

| Quality characteristic | Design considerations when source-backed |
|---|---|
| Performance and capacity | Workload model, data volume, concurrency, duration, percentile, threshold, warm-up, environment, and repeat count |
| Security and privacy | Threat or misuse case, actor, asset, trust boundary, attack surface, allowed and denied outcome, disclosure, and audit |
| Accessibility | Applicable standard and level, keyboard path, name, role, state, focus, announcement, contrast, zoom, motion, and assistive technology |
| Reliability and recovery | Failure injection, interruption point, retry, fallback, data integrity, recovery time, recovery point, and retained evidence |
| Compatibility | Approved browser, device, OS, app, API, locale, timezone, and configuration matrix |
| Observability and audit | Event trigger, required fields, correlation, ordering, retention, access, alert, and sensitive-data exclusion |

Do not invent a threshold, supported platform matrix, security control, or accessibility conformance level from this guide.

## Concrete Test Data

- Use synthetic values unless an approved fixture is required.
- Trace every business limit, format, status, mapping, and expected outcome to a source.
- State the unit, timezone, locale, encoding, version, and initial state when they affect interpretation.
- Keep data minimal enough that the tested condition and failure cause remain clear.
- Preserve leading zeros, character width, precision, legacy representation, and byte or character counting rules when applicable.
- Do not turn a discovery prompt into an expected rejection without an approved oracle.

## Atomic Test Case Derivation

For each planned case:

1. Assign one stable `TC-<SCOPE-CODE>-NNN` ID without renumbering existing cases.
2. Trace it to one primary locked leaf VP ID and at least one exact approved source ref.
3. State reproducible Preconditions and concrete Test Data.
4. Number Steps in execution order.
5. Number observable Expected Results to match the relevant Steps.
6. Assign priority, tags, and one canonical Automation Eligibility value.
7. Keep mutable execution evidence and runtime claims out of the design artifact.

A case may cite secondary Viewpoints, but one primary leaf VP owns its coverage.
If no locked leaf Viewpoint owns the intent, stop and return the affected scope to Test Analysis.

## Coverage Reconciliation

After drafting cases, reconcile planned and achieved coverage:

| Leaf VP ID | Technique ID | Coverage target | Planned items | Covered items | Blocked items | TC IDs | Result |
|---|---|---|---|---|---|---|---|

- Count only coverage items with complete, source-backed cases in the numerator.
- Keep `SPEC_GAP`, design-blocking OQ, and unresolved conflict items out of the covered numerator.
- Keep `NOT_APPLICABLE` and approved `OUT_OF_SCOPE` items out of the denominator.
- Record any approved risk-based omission or waiver explicitly.
- Report Viewpoint, requirement, business-rule, NFR, and impact or regression coverage separately when required by the parent artifact.
- Do not claim `100%` unless the denominator and inclusion rule are explicit and every item reconciles.

## Exit Check

Test Case Design is ready for review only when:

- Every case traces to one locked leaf Viewpoint and exact source evidence.
- Every selected technique has an explicit coverage item, target, denominator or selection rule, and rationale.
- Concrete data contains no unsupported business value.
- Steps and Expected Results are numbered, observable, and semantically matched.
- Every excluded or blocked item has the correct status and traceable reason.
- Coverage totals reconcile with the locked parent and Coverage Design Map.
- Automation eligibility remains separate from static and runtime readiness.
- No Viewpoint was silently added, removed, merged, split, or reinterpreted.

Technique coverage demonstrates the agreed design scope.
It does not prove that the cases are executable in the current environment or that the system has passed testing.
