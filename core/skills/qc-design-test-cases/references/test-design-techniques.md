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

Use the canonical Test Design Basis schema in [test-case-format.md](test-case-format.md#complete-template) for both planning and final output.
Do not maintain a second Coverage Design Map with synonymous columns.

One leaf Viewpoint may need multiple techniques.
One coherent leaf Viewpoint may produce multiple Test Cases, and one coverage target may map to multiple Test Cases.
One Test Case may cover multiple coverage items only when they serve the same primary objective and its Preconditions, Test Data, Steps, Expected Results, and failure evidence remain diagnosable.
Different data points, outcomes, branches, or child case counts do not by themselves require splitting the parent leaf.

## Objective and Checkpoint Contract

Apply [Primary Objective, Checkpoints, and Diagnosability](../SKILL.md#primary-objective-checkpoints-and-diagnosability) and [Test Case Split Decision](../SKILL.md#test-case-split-decision) from the skill entrypoint.
Those sections own the split/keep policy; technique selection cannot override them.
A `Verify that ...` sentence is a useful heuristic for clarifying intent, not a semantic validator or a required schema field.

## Expected Result Presentation and Evidence

Apply [Expected Result Presentation](test-case-format.md#expected-result-presentation) before analysis or drafting.
The format reference owns the two presentations, their intake, and coverage safeguards.
The default is one case-level outcome after all Steps with the stated Preconditions and Test Data; several observable conditions may establish that one outcome.
Choose techniques and coverage targets independently of presentation; do not turn the number of Steps, conditions, or assertions into an automatic split rule.

The following sources explain the rationale and its limits; they are supporting methodology references, not product requirements or mandatory runtime reads.
Do not browse them to fill a missing product oracle or override approved project standards.

| Source | Relevant evidence | Limit |
|---|---|---|
| [ISTQB Glossary: test case](https://glossary.istqb.org/en_US/term/test-case?exact_matches_first=true) | Defines a Test Case through preconditions, inputs, actions where applicable, expected results, and postconditions | The definition does not prescribe one assertion per case or a result for every action |
| [ISTQB CTAL-TA v4.0, section 1.3.2, page 19](https://istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN.pdf#page=19) | Emphasizes clarity, completeness, precision, conciseness, and granularity corresponding to test basis and conditions; its calculation example has a discount and final total in one expected result | Supports coherent multi-condition outcomes and context-sensitive granularity; it does not mandate this package's default presentation |
| [BrowserStack: How to write Test Cases](https://www.browserstack.com/guide/how-to-write-test-cases) | Its login example describes the expected outcome after the action sequence; its tooling description supports both text-based and steps-based templates | A practical example and vendor guide, not a universal test-documentation standard |

`CASE_OUTCOME` as the default and `STEP_CHECKPOINTS` as the selectable alternative are package authoring conventions.
Neither is claimed to be a mandatory global QA standard.
Keep required intermediate evidence explicit when the final outcome alone cannot establish the selected coverage item.

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

Separate boundary points into different Test Cases when independent results are needed for each variation.
Do not split the coherent parent leaf merely because the target selects multiple boundary values.

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

A source-backed transition sequence may remain one Test Case when the sequence itself is the primary objective and each checkpoint is observable.

Do not reuse a status meaning from another module or lifecycle merely because the numeric code is the same.

### `TDT-SC`, Scenario and Use-Flow Design

1. Anchor the scenario to the locked business value and named actor.
2. Identify the main flow plus source-defined alternative, rejection, cancel, retry, interruption, and recovery flows.
3. Mark system boundaries and observable checkpoints.
4. Keep each Test Case diagnosable. Split independent objectives even when they occur in one long user journey, but do not split a source-backed interaction or recovery sequence merely because an earlier failure can block a later checkpoint.
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

## Test Case Derivation

Apply the entrypoint's [Source-Backed Design Rules](../SKILL.md#source-backed-design-rules) after choosing the technique and target.
Use the [canonical template](test-case-format.md#complete-template); do not duplicate the authoring workflow here.

## Coverage Reconciliation

After drafting, use the Coverage Reconciliation table in [test-case-format.md](test-case-format.md#complete-template).

- Count only coverage items with complete, source-backed cases in the numerator.
- Map each claimed item to the exact Test Case, action, and oracle that exercise and assert it.
- A branch named only in a Title, Test Data, or Coverage Design Map is not covered without its corresponding action and oracle.
- Map coverage to another Test Case explicitly when that case supplies the action and oracle; do not infer cross-case coverage.
- Keep `SPEC_GAP`, design-blocking OQ, and unresolved conflict items out of the covered numerator.
- Keep `NOT_APPLICABLE` and approved `OUT_OF_SCOPE` items out of the denominator.
- Record any approved risk-based omission or waiver explicitly.
- Report Viewpoint, requirement, business-rule, NFR, and impact or regression coverage separately when required by the parent artifact.
- Keep Viewpoint-to-TC mapping, achieved design coverage, and runtime execution results separate.
- Do not claim `100%` unless the denominator and inclusion rule are explicit and every item reconciles.
- Do not shrink the denominator merely to obtain `100%`.

## Exit Check

Test Case Design is ready for review only when:

- Every case traces to one locked leaf Viewpoint and exact source evidence.
- Every case has one specific primary objective, and every checkpoint is necessary for that objective rather than grouped only to share setup.
- Every selected technique has an explicit coverage item, target, denominator or selection rule, and rationale.
- Concrete data contains no unsupported business value and distinguishes the expected outcome from the fault the case is intended to detect.
- Steps are numbered; Expected Results use the confirmed presentation, with one overall outcome by default and multiple same-objective conditions when needed. Step-linked expectations are required only for the selected checkpoint presentation.
- Outcome conditions and any required intermediate evidence are observable and source-backed; presentation does not remove coverage obligations.
- Every claimed coverage item maps to a supporting action and oracle, with omissions, exclusions, and blockers disclosed against the declared denominator.
- A coherent leaf may produce multiple Test Cases, while a bundled locked leaf returns to `qc-design-viewpoints` for an approved revision of the affected scope.
- Failure evidence identifies checkpoint, input or state, expected outcome, and actual outcome; a later unexecuted checkpoint is not reported as verified or `PASS`.
- Every excluded or blocked item has the correct status and traceable reason.
- Coverage totals reconcile with the locked parent and Coverage Design Map.
- Automation eligibility remains separate from static and runtime readiness.
- No Viewpoint was silently added, removed, merged, split, or reinterpreted.

Technique coverage demonstrates the agreed design scope.
It does not prove that the cases are executable in the current environment or that the system has passed testing.
