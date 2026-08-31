# Test Viewpoint Discovery Guide

This package-managed guide supports Test Analysis in `qc-design-viewpoints`:

```text
Feature and business value
-> understand the Test Target
-> discover high-level Viewpoints
-> decompose them into leaf Viewpoints
-> review and lock the Viewpoint revision
```

Use the guide to ask relevant questions, not to supply answers.
It is a discovery heuristic and is never a requirement, business-rule, design, or test oracle source.
Only an approved source or explicit recorded decision may define expected behavior.

Do not copy every prompt into the Viewpoint artifact.
Apply only the catalog items relevant to the confirmed scope and named test items.
When an approved source describes a reusable project or domain risk that the catalog does not cover, propose an extension ID and obtain approval before adding it to the optional project extension.
Do not invent an untracked prompt silently.

This reference is owned by the package.
Do not customize it in place.
Record project-specific additions in the extension path declared by `qc/config/material-paths.md`, when that optional file exists.

## Activity Boundary

A Test Viewpoint answers what aspect of a named test item must be covered and why.
A leaf Viewpoint remains a test condition, not an executable Test Case.

| Test Analysis, in this guide | Test Case Design, outside this guide |
|---|---|
| Understand product value, target, actors, impact, risk, and context | Select concrete Preconditions and Test Data |
| Discover and decompose coverage angles | Select a Test Design Technique |
| Identify missing or conflicting source evidence | Write numbered Steps and observable Expected Results |
| Produce source-backed leaf Viewpoints | Decide and justify a measurable coverage target |

Do not select representative Test Data, executable Steps, or step-level Expected Results in a Viewpoint merely because they may be useful later.
Preserve the governing rule in the source trace and derive its concrete design values during Test Case Design.

## Catalog ID Contract

Every package prompt has a stable ID.
Preserve an ID when wording is clarified without changing its intent.
Add a new ID when the discovery intent changes.
Never reuse a retired ID for a different meaning.

- `VDG-COM-*`: common lens applied across item types;
- `VDG-INP-*`: input or data-entry item;
- `VDG-UI-*`: display, navigation, feedback, or composite UI item;
- `VDG-API-*`: API item;
- `VDG-BAT-*`: batch, scheduled job, import, or export item;
- `VDG-INT-*`: integration or dependency boundary;
- `VDG-DAT-*`: stored, transformed, queried, or reported data;
- `VDG-MIG-*`: migration, version coexistence, or rollout item.

Project extensions must use `EXT-VDG-<PROJECT-CODE>-NNN` IDs so they cannot collide with package IDs.

## Classification Contract

First inventory every named test item in the approved scope.
Then route each item to the relevant catalog sections and classify every applicable discovery prompt with exactly one status.

### Test Item Inventory

| Test Item | Item Type | Parent Object | Source Refs | Scope Status | Applicable Guide IDs | Notes |
|---|---|---|---|---|---|---|

Use a context-appropriate item type.
Do not force an API, batch, integration, data, or migration item into a UI taxonomy.

### Discovery Status

| Status | Meaning | Required handling |
|---|---|---|
| `DEFINED` | The discovery angle is relevant and approved evidence defines the behavior or risk needed for a test oracle | Derive or map it to one or more source-backed leaf Viewpoints |
| `SPEC_GAP` | The angle is relevant, but its rule, scope, or observable outcome is missing, ambiguous, or conflicting | Stop the affected design scope. Follow the readiness route. Do not create a provisional Viewpoint or Test Case |
| `NOT_APPLICABLE` | The angle does not apply to this item type, mode, or product context | Record the reason when it is not self-evident and exclude it from the denominator |
| `OUT_OF_SCOPE` | The angle could apply, but an approved Scope Gate excludes it | Record the approved scope decision or waiver. Do not treat it as covered or as `NOT_APPLICABLE` |

Record the working classification in a Discovery Coverage Map.
Record each material locator and revision or hash once in the artifact's Discovery Material Manifest:

| Guide or Extension ID | Test Item | Classification | Leaf VP IDs | Evidence or Exclusion Basis |
|---|---|---|---|---|

One prompt may map to multiple leaf Viewpoints.
Multiple prompts may map to one leaf Viewpoint only when they express one coherent condition or risk.
Never generate one Viewpoint per prompt automatically.

Under `GAP_ANALYSIS`, map a new `SPEC_GAP` to the applicable existing Finding or OQ, or return the stale analysis to `qc-gap-finder`.
Under `DIRECT_SOURCE_CHECK`, report the exact blocker and propose Gap Analysis as a separate phase.
This guide does not authorize creating or resolving Findings, OQs, rules, or expected outcomes.

## Optional Project Extension Contract

Use `qc/config/viewpoint-discovery-extension.md` only when the project has reusable discovery prompts that are not represented by this guide.
Do not copy the package catalog into the extension and do not redefine a package `VDG-*` ID.

Recommended structure:

```markdown
# Viewpoint Discovery Extension

## Extension Manifest
| Project or Domain | Revision | Maintainer | Basis or Rationale |

## Discovery Prompts
| Extension ID | Item Type or Context | Lens | Discovery Prompt | Companion VDG IDs | Notes |
```

Use `EXT-VDG-<PROJECT-CODE>-NNN` for every extension row.
An extension prompt may identify a domain-specific question or routing rule, but it remains a heuristic.
It must not contain an assumed business rule, limit, state mapping, Expected Result, coverage target, Test Design Technique, or concrete Test Data.
Record the extension revision or file hash in the locked Discovery Material Manifest when any extension ID is used.

## Test Target Map

Build a Test Target Map before brainstorming Viewpoints.

| Target dimension | Questions to answer from approved evidence |
|---|---|
| Feature | What capability or change is being introduced? |
| Business value | Which user or business outcome makes the change valuable? |
| Product risk | What user, business, financial, legal, or operational harm may occur if it fails? |
| Actors | Who initiates, observes, approves, receives, or is restricted by the behavior? |
| Test objects | Which systems, applications, services, jobs, stores, or versions participate? |
| Test items | Which named fields, components, APIs, flows, rules, data objects, or transitions are in scope? |
| Impact boundary | Which upstream, downstream, adjacent, old-version, new-version, and reporting areas may be affected? |
| Operating context | Which device, browser, locale, timezone, network, tenant, environment, or deployment condition matters? |
| Source boundary | Which approved sources govern the selected scope, and which evidence remains missing? |

Do not reduce a product-level target to isolated UI controls.
For example, a Discount Code field connected to Order Total has UI, persistence, version coexistence, calculation, downstream, migration, and regression risks when approved sources place those items in scope.

## Common Lenses

Apply these lenses to every relevant test item before using type-specific routing.
Each row is a discovery prompt, not a requirement.

| Catalog ID | Lens | Discovery prompts |
|---|---|---|
| `VDG-COM-FUNCTION` | Function and flow | What user or system outcome is produced? What main, alternative, rejection, cancel, retry, and recovery flows exist? |
| `VDG-COM-DATA` | Input and data | What data is received, displayed, stored, transformed, returned, or deleted? Which source defines its format and integrity? |
| `VDG-COM-BOUNDARY` | Boundary and combinations | Which approved limits, partitions, empty values, duplicates, combinations, and first or last conditions change behavior? |
| `VDG-COM-STATE` | State and lifecycle | Which initial, intermediate, terminal, valid, invalid, stale, and restored states or transitions matter? |
| `VDG-COM-TIMING` | Timing and sequence | Which order, delay, timeout, expiry, scheduling, retry interval, simultaneous event, and before or after condition matters? |
| `VDG-COM-INTERACTION` | Interaction | How do users, components, services, jobs, and data objects affect one another? What happens on repetition, interruption, or partial completion? |
| `VDG-COM-USER` | User, role, and permission | Which actor, role, ownership, tenant, authorization, visibility, and human-error condition changes access or outcome? |
| `VDG-COM-ENVIRONMENT` | Environment and compatibility | Which device, browser, OS, app version, locale, timezone, network, infrastructure, or configuration changes the risk? |
| `VDG-COM-INTEGRATION` | Integration | What crosses a system boundary? How are unavailable, delayed, duplicated, reordered, malformed, or partial responses handled? |
| `VDG-COM-MIGRATION` | Migration and coexistence | How do legacy and new data, clients, contracts, schemas, and behaviors coexist before, during, and after rollout? |
| `VDG-COM-REGRESSION` | Impact and regression | Which existing flows, calculations, consumers, reports, bugs, and neighboring functions can be affected? |
| `VDG-COM-NFR` | Quality characteristics | Which source-backed performance, security, privacy, accessibility, reliability, usability, compatibility, observability, recovery, or compliance risks apply? |

## Item-Type Routing

Use all relevant routes for a mixed item.
For example, an autocomplete can need the input, UI, API, and integration routes.
A migration-backed batch can need the batch, data, integration, and migration routes.

| Item type or context | Required route | Common companion routes |
|---|---|---|
| Input or data-entry control | Input | UI, API, data |
| Display, navigation, feedback, or composite UI | UI | Input, API, integration |
| API endpoint, request, response, callback, or event | API | Integration, data, migration |
| Batch, scheduled job, import, or export | Batch | Data, integration, migration |
| External or internal dependency boundary | Integration | API, batch, data |
| Database object, persisted value, transformation, query, or report | Data | API, batch, migration |
| Schema, data, client, contract, or version transition | Migration | Data, integration, regression |

### Input and Data-Entry Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-INP-STATE` | Control state | Visibility, enabled, disabled, read-only, editable, default, prefilled, required, optional, and conditionally required behavior |
| `VDG-INP-VALIDATION` | Validation lifecycle | Trigger, order, copy, placement, focus, announcement, persistence, clearing, client or server parity, and multiple-error behavior |
| `VDG-INP-TEXT` | Text and character handling | Length unit, empty, whitespace, line break, allowed characters, Unicode, CJK, Vietnamese, emoji, Japanese IME, width, case, and normalization |
| `VDG-INP-NUMBER` | Numeric value | Minimum, maximum, zero, negative, precision, scale, rounding, overflow, sign, separator, currency, and percentage representation |
| `VDG-INP-DATETIME` | Date and time | Calendar validity, range, leap date, locale, timezone, daylight-saving change, input, display, storage, and API representation |
| `VDG-INP-CHOICE` | Selection control | Default, placeholder, option availability, single or multiple selection, combination rules, dynamic loading, dependent fields, and custom values |
| `VDG-INP-FILE` | File input | Extension, MIME and signature, size and count, empty or corrupted file, filename, progress, cancel, retry, scanning, storage, and access |
| `VDG-INP-METHOD` | Input method | Typing, paste, drag, autofill, suggestion, mobile keyboard, pointer, touch, keyboard, IME composition, and assistive technology |
| `VDG-INP-PERSISTENCE` | Value persistence | Refresh, navigation, retry, draft, failed submission, session expiry, stored value, masking, privacy, and audit behavior |

### UI Component Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-UI-CONTENT` | Content mapping | Presence, value, label, metadata, order, grouping, count, truncation, placeholder, conditional display, and stale content |
| `VDG-UI-STATE` | Component state | Default, enabled, disabled, selected, active, focused, loading, empty, error, unavailable, and partial states |
| `VDG-UI-ACTION` | Action and navigation | Primary, secondary, cancel, confirm, retry, repeated activation, destination, deep link, browser history, refresh, and state restoration |
| `VDG-UI-COMPOSITE` | Composite interaction | Nested controls, selection, expansion, sort, filter, pagination, infinite scroll, overlays, stacking, focus restoration, and conflicting activation |
| `VDG-UI-FEEDBACK` | Feedback and recovery | Loading, skeleton, timeout, error, partial data, retry, fallback, duplicate message, dismissal, persistence, and repeated failure |
| `VDG-UI-ACCESS` | Accessibility | Name, role, state, focus order, keyboard, announcement, contrast, zoom, reduced motion, caption, and alternative text when governed by source |
| `VDG-UI-RESPONSIVE` | Presentation context | Viewport, orientation, touch target, text expansion, overflow, reflow, image behavior, locale, and bidirectional layout |
| `VDG-UI-SECURITY` | UI trust boundary | Authorization, sensitive-data visibility, masking, safe external navigation, privacy, analytics, and audit behavior |

Classify a segmented control by behavior.
Route it through Input when it chooses a submitted value and through UI when it changes the current view.
Use both when the approved design gives it both responsibilities.

### API Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-API-CONTRACT` | Request and response contract | Method or event, path or topic, auth, headers, parameters, payload, response, schema, optionality, compatibility, and content type |
| `VDG-API-VALIDATION` | Contract validation | Missing, null, empty, malformed, duplicate, unknown, unsupported, out-of-range, and cross-field input |
| `VDG-API-RESULT` | Result mapping | Success, rejection, error code, partial result, warning, pagination, ordering, and downstream status or state mapping |
| `VDG-API-IDEMPOTENCY` | Repetition and identity | Idempotency key, duplicate request, retry, replay, resource identity, correlation, and exactly-once or at-least-once expectations |
| `VDG-API-AUTH` | Access and data exposure | Authentication, authorization, ownership, tenant isolation, token state, sensitive field, and error disclosure |
| `VDG-API-FAILURE` | Dependency and recovery | Timeout, unavailable dependency, malformed dependency response, rate limit, cancellation, retry, circuit behavior, and recovery |
| `VDG-API-OBSERVE` | Observability | Trace, correlation ID, audit event, log, metric, alert, and sensitive-data handling when defined |

### Batch, Scheduled Job, Import, and Export Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-BAT-TRIGGER` | Trigger and schedule | Manual or scheduled trigger, timezone, cutoff, missed run, duplicate trigger, overlap, dependency readiness, and calendar boundary |
| `VDG-BAT-SCOPE` | Selection and volume | Eligibility, filtering, ordering, empty set, maximum volume, paging, partition, late-arriving data, and changed data during the run |
| `VDG-BAT-PROCESS` | Processing | Per-record rule, cross-record rule, partial success, error threshold, skip, retry, restart, checkpoint, idempotency, and concurrency |
| `VDG-BAT-OUTPUT` | Output contract | Filename, format, encoding, delimiter, record count, ordering, checksum, destination, access, and downstream consumption |
| `VDG-BAT-RECOVERY` | Failure and recovery | Interruption, dependency failure, rerun, resume, rollback, duplicate prevention, cleanup, notification, and operator action |
| `VDG-BAT-OBSERVE` | Operational evidence | Run status, processed and failed count, error detail, audit, logs, metrics, alerting, and retention when defined |

### Integration Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-INT-BOUNDARY` | Ownership and contract | Producer, consumer, responsibility, protocol, schema, version, authentication, trust boundary, and source of truth |
| `VDG-INT-SEQUENCE` | Interaction sequence | Call or event order, synchronous or asynchronous flow, callback, acknowledgement, correlation, duplication, reordering, and eventual consistency |
| `VDG-INT-FAILURE` | Failure behavior | Timeout, refusal, unavailable system, malformed or partial response, retry, fallback, dead letter, compensation, and recovery |
| `VDG-INT-COMPAT` | Compatibility | Old and new consumer or provider, additive or breaking schema change, optional field, version negotiation, and rollout order |
| `VDG-INT-SECURITY` | Boundary security | Credential, transport, authorization, signature, replay prevention, sensitive data, tenant isolation, and audit when defined |
| `VDG-INT-OBSERVE` | Cross-system evidence | Correlation, trace, status mapping, reconciled totals, logs, metrics, alerts, and support diagnostics |

### Data Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-DAT-MODEL` | Data model | Field meaning, type, optionality, default, relation, uniqueness, ownership, source of truth, and schema version |
| `VDG-DAT-LIFECYCLE` | Lifecycle | Create, read, update, delete, archive, retention, restore, purge, soft delete, and history behavior |
| `VDG-DAT-INTEGRITY` | Integrity | Constraint, duplication, orphan, transaction, atomicity, precision, rounding, concurrency, and consistency across stores |
| `VDG-DAT-TRANSFORM` | Transformation | Mapping, calculation, aggregation, normalization, timezone, encoding, precision, missing value, and order of operations |
| `VDG-DAT-QUERY` | Retrieval and reporting | Filter, sort, join, pagination, total, historical snapshot, permission, stale read, and displayed or exported parity |
| `VDG-DAT-SECURITY` | Data protection | Classification, access, masking, encryption, privacy, tenant boundary, audit, retention, and deletion when defined |
| `VDG-DAT-RECOVERY` | Resilience | Backup, restore, replication, reconciliation, partial write, interrupted transaction, and recovery point when defined |

### Migration, Coexistence, and Rollout Route

| Catalog ID | Discovery area | Prompts |
|---|---|---|
| `VDG-MIG-POPULATION` | Population | Existing and new records, complete and incomplete legacy data, volume, invalid legacy state, tenant segment, and exclusion |
| `VDG-MIG-MAPPING` | Mapping | Old-to-new field and state mapping, default, conversion, precision, timezone, encoding, unmapped value, and loss prevention |
| `VDG-MIG-EXECUTION` | Migration execution | Precondition, order, batch size, checkpoint, restart, rerun, rollback, freeze window, concurrent change, and downtime |
| `VDG-MIG-COEXIST` | Version coexistence | Old and new clients, old and new contracts, read and write compatibility, feature flag, mixed-version interaction, and rollout order |
| `VDG-MIG-VERIFY` | Verification | Record and aggregate reconciliation, rejected record, audit, monitoring, and business outcome validation |
| `VDG-MIG-REGRESSION` | Post-change impact | Existing display, edit, calculation, search, report, integration, downstream consumer, and known-bug behavior |
| `VDG-MIG-RECOVERY` | Failure and recovery | Partial migration, retry, rollback, restore, duplicate prevention, operator action, communication, and retained evidence |

## Viewpoint Breakdown: From High-Level to Leaf

Brainstorm broad risk areas first, then decompose them until each leaf states one coherent source-backed condition or risk for one named test item.

```text
High-level Viewpoint
-> affected test object or area
-> named test item
-> relevant rule, state, actor, boundary, interaction, or quality risk
-> source-backed leaf Viewpoint
```

Example decomposition, provided only to show granularity:

```text
Migration and coexistence
-> Client version compatibility
-> Discount Code and Order Total display
-> saved cart created before or after the pricing update
-> leaf VP: display compatibility for the approved saved-cart and client-version combinations
```

The example does not define which combinations are supported or what must be displayed.
Those answers must come from the feature's approved sources.

Use a parent-child working table during analysis:

| Parent VP | Test Object or Area | Test Item | Leaf condition or risk | Catalog IDs | Source Refs | Leaf VP ID |
|---|---|---|---|---|---|---|

A leaf Viewpoint is ready to propose only when all of the following are true:

- It names one test item and its context-appropriate item type.
- It states one coherent coverage intent, condition, or risk.
- It has an exact approved source ref and a one-line product-risk rationale.
- Its expected behavior can be determined from the source during Test Case Design.
- It contains no executable Steps, concrete Test Data, or step-level Expected Results.
- It can be traced to its parent Viewpoint and applicable catalog IDs.
- It is not blocked by a `SPEC_GAP`, unresolved conflict, or design-blocking OQ.

Split a candidate when its future cases would verify unrelated test items, rules, states, roles, integrations, or quality characteristics.
Merge catalog prompts only when they support the same coherent condition and product risk.

## Discovery Completion Check

Before asking the user to lock the Viewpoint revision, confirm:

- The Test Target Map and named Test Item Inventory are complete for the approved scope.
- Every in-scope item has been routed to applicable common and item-type catalog sections.
- Every applicable catalog ID is classified under the single Classification Contract.
- Every `DEFINED` item maps to at least one proposed leaf Viewpoint.
- Every leaf Viewpoint has a parent, exact source trace, stable VP ID, priority, and rationale.
- Every `SPEC_GAP` has stopped its affected design scope and followed the selected readiness route.
- Every `OUT_OF_SCOPE` item cites an approved scope decision or waiver.
- `NOT_APPLICABLE` and `OUT_OF_SCOPE` items are excluded from covered counts.
- The artifact records the guide revision or source hash so discovery can be reproduced.

Discovery completion does not prove that no gaps exist outside the confirmed scope.
Locking leaf Viewpoints authorizes Test Case Design only for those locked items.
