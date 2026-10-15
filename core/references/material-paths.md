# QC Artifact Contract

Read this contract before creating or updating any QC artifact.
The installer publishes this canonical package source once per target project at `qc/config/material-paths.md`.
Every installed QC skill reads that shared runtime file instead of carrying a duplicate copy.

## Path Resolution and Recovery

`qc/` is relative to the confirmed target project root, not the current terminal directory, package checkout, or user home.
Use the project root already established by the current workstream or host project context; if it is ambiguous, ask for the exact root without listing directories.
`references/` and `scripts/` in a skill are relative to that loaded skill's own directory.
Use its actual absolute path when invoking a helper and resolve project input/output arguments against the confirmed project root.
Installed skills and package references are local copies; moving the complete project with its hidden skill directories preserves these relative relationships.
Recorded external absolute paths, Source Manifest locators, and existing links still require verification after a move.

| Missing or moved material | Required handling |
|---|---|
| Shared contract, required package reference, helper, or selected skill | Report `BLOCKED_INSTALLATION` in chat with the exact failed path; pause the affected phase until installer repair and reread the repaired instructions |
| Required source, locked parent, selected Run, evidence required by policy, or existing artifact being continued | Report `BLOCKED_INPUT` in chat; request the exact new locator or restored content, then verify identity, scope, revision/hash, and approval before continuing |
| Optional System Context, Bug Base, extension, or evidence optional under the approved policy | Disclose absence and the resulting limitation; do not block solely on absence or claim there are no existing behaviors, bugs, or history |
| Expected existing OQ ledger or execution history | Treat known history as missing input; do not seed an empty replacement or reset IDs, decisions, run history, or approvals |
| Confirmed first-time output or new OQ ledger | Draft using this contract and the selected skill's routed format/schema, then apply the normal write gate; no package-checkout seed is needed at runtime |

Do not search alternate folders, legacy copies, package caches, other projects, or historical examples for a substitute.
The Input Boundary still governs any user-approved bounded search.
A moved project input may be read at an exact newly approved locator; record the locator and retain its original identity and lifecycle evidence.
Canonical output paths remain under `qc/`; changing input locators does not authorize a new output layout or a second ledger/history.
If the user moved `qc/` or the installed skill directories themselves, request restoration to the supported layout or an explicitly reviewed migration before writing.
Never silently create a second `qc/` tree at the terminal's current directory.

For package repair, use the same trusted package version or source checkout with the confirmed adapter and project root.
Preview an installer refresh with `--force --skip-refs --dry-run`, then apply the reviewed plan without `--dry-run`.
Use `--skill <name>` for a damaged selected skill; omit it for a full refresh or an intentional version update.
`--skip-refs` avoids recreating absent project-owned seeds; repair restores package files, not lost project data.
Do not run an installer automatically as part of QC design or execution.

## Ownership Boundary

Keep package-managed instructions separate from project-owned artifacts:

| Owner | Location | Update rule |
|---|---|---|
| Package | Target-native skill directory, for example `.agents/skills/qc-*` | Installer may replace only selected skill folders with `--force` |
| Package | Managed QC block in `AGENTS.md` or `CLAUDE.md` | Installer may update only the marked block |
| Package | `qc/config/material-paths.md` | Installer may refresh with `--force` |
| Project | `qc/config/viewpoint-discovery-extension.md`, when provided | Preserve during install and update; extend catalog IDs or target routing without copying the package guide |
| Project | All other files under `qc/` | Preserve during install and update |

Never place installed skills inside `qc/`.
Never write generated QC artifacts inside an installed skill folder.

## Source and PO Handoff Boundary

QC may consume approved requirement sources from the current project, another readable local path, or a canonical external locator supplied by the user.
Record the exact locator, approval state, and revision or hash.
Keep every source read-only.

A PO handoff makes sources available to QC.
It does not imply QC phase scope, artifact write approval, Lock Gate approval, Execution Gate approval, or release authority.
QC starts only after an explicit QC request and applies its own gates.

For a source inside the project, use a relative Markdown link.
For a user-supplied or explicitly approved readable source outside the project, record its exact absolute path or canonical URI and mark it `external, non-portable` in the Source Manifest.
Do not fabricate a project-relative link.
Read the source in place.
Do not copy an external source into the project unless the user separately approves the snapshot content and path.
If the source cannot be read, has no stable revision, or its approval state is unknown, request the missing source evidence.
Under `GAP_ANALYSIS`, classify the affected scope as `PARTIAL` or `STOP`.
Under `DIRECT_SOURCE_CHECK`, return `FAIL` and do not create an affected Viewpoint.

## Input Boundary and Source Discovery

- Treat only user-supplied file paths, attachments, pasted content, canonical URLs, and explicitly approved project artifact locators as authorized requirement, design, execution, or reporting inputs.
- A feature name, module name, scope key, keyword, or prior project knowledge is not a source locator and does not authorize filesystem discovery.
- Before any search for a missing input, require either its exact locator or an explicitly approved bounded search root from the user.
- If a required locator or content is absent, stop with `BLOCKED_INPUT` in chat and ask the user to provide it. Do not run exploratory file listings, filename searches, content searches, or broader workspace scans to discover it.
- Never search parent directories, sibling projects, the broader workspace, the user home directory, or another external location unless the user explicitly authorizes that exact bounded search root.
- Do not request broader filesystem permission to discover a missing input. A filesystem permission prompt is not a substitute for explicit user authorization of the source location and search scope.
- Contract loading means reading the selected skill, its explicitly routed package-managed references, this shared contract, and applicable project instructions or standards at their known locators. Project Viewpoints, Test Cases, task notes, execution logs, and reports are phase inputs or outputs, never format contracts.
- A fixed project artifact path named by the selected skill permits only the phase-specific check described there, for the confirmed scope. It does not authorize browsing its directory, other scopes, or alternative locations. An absent optional input is a disclosed limitation, not `BLOCKED_INPUT`; an absent required input follows the blocking rule above.
- If the user does not know the locator, ask requirement clarification questions in chat. Treat an answer as an explicit user decision only after it is confirmed, and do not infer unstated behavior.

## Read Scope and Template Sources

Before opening a phase input, identify its exact locator and purpose from the approved intake, the current phase handoff, or a fixed-path check explicitly required by the selected skill.
Reuse a locator or approval already established in this workstream; do not ask for it again merely because the phase changed.

| Read purpose | Permitted material | Limit |
|---|---|---|
| Format and controlled values | Selected skill, its routed package references, this contract, and explicit project standards | Never use an old project artifact as an implicit template |
| Design evidence | Approved specs, current locked parent revision, applicable OQs, and verified context for the selected scope | Follow only governing dependency refs needed for the selected intent; a link is not permission to traverse a whole module or wiki |
| Revision or continuation | Exact existing artifact being revised, including history needed to preserve IDs and decisions | The target must already belong to the approved workstream; same scope alone does not authorize every artifact |
| Export, execution, or report | Exact locked designs, selected Runs, approved result sources, and evidence required by that phase | Historical inputs are valid for this purpose, not a style sample for another phase |
| Explicit comparison | User-selected example or cross-scope dependency with a stated purpose | Record its role; never import its business rules, IDs, approvals, or fixture facts into the current scope |

Do not open or search existing Viewpoints, Test Cases, execution logs, or reports, from the same scope or another scope, merely to imitate formatting, wording, legends, priority, or table structure.
This restriction applies even when those files are readable or already listed by a tool.
If a package template or controlled-value definition is missing or contradictory, report the exact contract gap in chat and request only the needed decision; do not hunt for a specimen artifact.
Read only the selected skill's required references and the references relevant to the current mode; do not load every installed skill or every reference directory.

For shared `qc/open-questions.md`, `qc/refs/system-context.md`, and `qc/refs/bug-base.md`, read their schema and legends, then select rows by the confirmed scope, exact referenced IDs, or an explicitly relevant dependency.
The containing file is not permission to consume unrelated scopes as design evidence.
An approved update may read the complete target to preserve existing content; that does not make unrelated rows requirement sources.

### Identifier Collision Check

For a new scope code only, a metadata-only lookup is allowed in `qc/tasks/`, `qc/gap-reports/`, `qc/test-viewpoints/`, `qc/test-cases/`, and `qc/open-questions.md` when present.
Return only Scope Key / Scope Code header fields or exact matching ID and scope cells; do not open matched artifact bodies or use them as examples.
Do not scan executions, evidence, automation, reports, parent directories, or the broader workspace for this check.
If the existing layouts cannot be checked without reading unrelated content, disclose that uniqueness is unverified and request a bounded metadata check or a user-confirmed code.
An already confirmed code inherited from the current locked parent does not require another inventory scan.

## Shared Design Classifications

Use these package defaults for new Viewpoint and Test Case designs unless an explicit project standard or approved scope decision defines another vocabulary.
Do not infer a project convention from historical artifacts or silently relabel an existing locked revision.
Preserve an approved custom or historical value with its recorded definition under the Legend rules below.

| Vocabulary | Value | Meaning |
|---|---|---|
| Risk | `High` | QC assessment of substantial harm to the selected product objective if the behavior fails; record the basis |
| Risk | `Medium` | QC assessment of material but bounded harm to the selected product objective; record the basis |
| Risk | `Low` | QC assessment of limited harm to the selected product objective; record the basis |
| Test Priority | `P1` | Highest test priority within the approved scope; justify using risk and test objective |
| Test Priority | `P2` | Normal test priority within the approved scope; justify using risk and test objective |
| Test Priority | `P3` | Lower test priority within the approved scope; justify using risk and test objective |

Risk and Test Priority are different decisions, with no automatic one-to-one mapping.
Finding and OQ Priority use `High`, `Medium`, and `Low` as defined by `qc-gap-finder`; do not substitute them for Test Priority without an approved project convention.
These classifications are QC judgments, not business rules or release verdicts.

## Artifact Language Scope Gate

- Confirm the reader-facing artifact language as part of the QC Scope Gate. Use Vietnamese by default unless the user explicitly requests another language.
- Treat the selected language as a workflow decision for the current approved scope, not as persistent artifact metadata. Do not add an `Artifact Language` field to an artifact header or canonical table.
- Write explanatory narrative in the selected language. Preserve exact English technical and business terms, IDs, paths, URLs, commands, code, API and database fields, literal UI values, source quotations, and controlled values such as `READY`, `PARTIAL`, `STOP`, `LOCKED`, and `UI-AUTO`.
- Apply the selected language consistently to Gap Report findings and summaries, Open Questions, Viewpoint intent and rationale, Test Case titles and instructions, QC task notes, automation descriptions, execution commentary, and stakeholder reports.
- Preserve user-supplied execution results and source-native literals without silently translating or rewriting them.
- Check narrative language before the Persist Gate or Lock Gate. Do not infer a different language from prior sessions, machine memory, or a user profile.

## Reader-Facing Controlled Value Legends

Every reader-facing artifact must explain the abbreviations, classifications, statuses, gates, levels, eligibility values, verdicts, and other controlled values that a reader needs to interpret that artifact.
Use the artifact-specific canonical definitions from the selected skill and its package-managed references; do not invent or change their meaning, and do not copy an inaccessible package path into the reader-facing explanation.

Apply these rules whenever an artifact is created or revised:

1. Read the complete current artifact being created or revised, not all artifacts in its directory, and collect controlled values from every section governed by each Legend, and reread the canonical definitions before drafting the update.
2. When a canonical vocabulary has seven or fewer values, include the complete canonical vocabulary in its Legend, even when the current revision does not use every value.
3. When a canonical vocabulary has more than seven values, include every value used in the current artifact, every value still needed to interpret retained history, and every value required by the artifact-specific template.
4. Every controlled value used in the governed artifact content must have exactly one matching Legend definition. Reconcile the Legend after adding, changing, or removing content; export-time generation alone is insufficient.
5. A Legend value must come from the canonical vocabulary, an explicitly approved custom definition, or a retained legacy value clearly marked `LEGACY`. Do not infer the meaning of an unknown custom value.
6. When the user supplies a non-canonical value without an approved definition, preserve the supplied content, report `LEGEND_UNDEFINED_VALUE`, and obtain the definition before approving or locking the affected revision.
7. Do not promote an artifact-local custom value into the package-wide canonical vocabulary without separate approval to change the package contract.

For each governed vocabulary, enforce these invariants:

```text
used controlled values ⊆ Legend values

when canonical vocabulary size <= 7:
Legend values = canonical values, plus approved custom or required LEGACY values

when canonical vocabulary size > 7:
used and retained-history values ⊆ Legend values ⊆ canonical values + approved custom or required LEGACY values
```

Use a compact table such as `Value | Meaning` or the artifact-specific Legend schema.
Place the Legend before the first section that depends on it, unless the artifact-specific template requires another location.
Update Review History when a classification change or Legend definition change affects interpretation of retained content.

## Cross-Phase Iteration Policy

When Test Case Design returns an affected VP ID to Viewpoint Design, both phases must track the cumulative return count for that unresolved VP ID in the current workstream.

- After the third return for the same VP ID without a resolved revision that Test Case Design accepts, both phases must stop the affected scope. Carry the unresolved return count across attempted Viewpoint revisions; do not reset it by incrementing a revision.
- Present the full iteration history to the user: each VP ID, the condition or risk under dispute, the rationale from each return, and the Viewpoint revision attempted.
- Do not attempt a fourth Viewpoint revision or Test Case design pass for the same VP ID without explicit user direction.
- The user may resolve the dispute by approving one interpretation, redefining the scope, splitting or merging the leaf with an explicit decision, or waiving the affected scope.
- A scope that is stopped by this policy is not failed or out of scope; it is awaiting human judgment.
- Record the iteration count and stop reason in the handoff message and in the artifact's Review History when the revision is next written.

## Scope Key

Use one `scope-key` for every artifact in the same QC workstream.

1. For one requirement file, use its exact filename stem in lowercase kebab-case. Preserve semantic prefixes such as `epic-`, `fs-`, `req-`, and `cr-`.
2. For several requirement files, propose a parent scope key and obtain user confirmation before writing. Do not infer which source is primary.
3. Record the scope key in each artifact header and exact source paths in its Source Manifest.
4. Confirm one uppercase `scope-code` of 2 to 12 letters or digits for generated IDs. Before approval of a new code, apply the metadata-only Identifier Collision Check above. Preserve the confirmed code across revisions and downstream phases.

Example for `fs-shopping-cart.md`:

```text
scope-key = fs-shopping-cart
```

Do not shorten it to `shopping-cart` in one artifact and retain `fs-` in another.

## Generated Names and IDs

Use these grammars consistently:

| Item | Grammar | Uniqueness |
|---|---|---|
| Finding | `FND-<SCOPE-CODE>-NNN` | Within the shared QC workspace |
| Open Question | `OQ-<SCOPE-CODE>-NNN` | Across `qc/open-questions.md` |
| Viewpoint | `VP-<SCOPE-CODE>-NNN` | Within the scope, stable across revisions |
| Test Case | `TC-<SCOPE-CODE>-NNN` | Within the scope, stable across revisions |
| Run | `RUN-<YYYYMMDD>-<HHMMSS>[-NN]` | Across the executions log |
| Module key | lowercase kebab-case | Within one Gherkin scope directory |

Use three digits for sequence numbers.
Add the two-digit Run suffix only when a timestamp collision exists.
Never reuse a retired ID for different intent.

## Target Project Layout

```text
qc/
├── config/
│   ├── material-paths.md
│   └── viewpoint-discovery-extension.md # optional project-owned additions; never a copy of the package guide
├── refs/
│   ├── system-context.md
│   ├── bug-base.md
│   └── test-data-spec.md              # optional, create only when needed
├── open-questions.md                  # one shared ledger, with Scope Key column
├── tasks/
│   └── <scope-key>-qc-task.md
├── gap-reports/
│   └── <scope-key>-gap-report.md       # only when Gap Analysis is approved
├── test-viewpoints/
│   └── <scope-key>-viewpoints.md
├── test-cases/
│   └── <scope-key>-test-cases.md
├── automation/
│   ├── gherkin/<scope-key>/
│   │   ├── <module-key>.feature
│   │   └── <scope-key>-gherkin-manifest.md
│   └── postman/<scope-key>/
│       ├── <scope-key>.postman_collection.json
│       └── <scope-key>-postman-manifest.md
├── execution-inputs/                  # optional project-local manual result sources
│   └── <scope-key>/
│       └── <run-id-lowercase>-manual-results.<xlsx|csv|md>
├── executions/
│   └── <scope-key>-executions.md
├── evidence/                          # optional when evidence is stored in the project
│   └── <scope-key>/<run-id-lowercase>/
│       └── <tc-id-lowercase>-attempt-<n>-<evidence-key>.<ext>
└── reports/
    └── <scope-key>-test-report-<YYYY-MM-DD>[-vN].<ext>
```

The OQ ledger and verified context stores under `qc/refs/` may contain rows from multiple scopes.
Apply the row-selection boundary above; workstream artifacts remain scope-specific.
Keep task progress in `qc/tasks/`, not in a single `qc/qc-task.md` that later scopes can overwrite.
Do not create `qc/refs/open-questions.md`.

`execution-inputs/` and `evidence/` are optional project-local stores.
A manual result source or evidence item may remain outside the project tree when the user manages it elsewhere.
Record its exact locator, integrity metadata when available, and portability limitation.
Do not copy it into `qc/` without separate approval.

## Naming and Versioning Rules

1. Use lowercase kebab-case for generated Markdown and Gherkin filenames.
2. Use the same scope key across every artifact that exists for the workstream. A direct-to-Viewpoint route does not require a gap artifact.
3. Update living artifacts in place and keep a revision history in the file.
4. Preserve execution history as separate run sections in the executions log.
5. Reports are snapshots. If the same scope and date already exist, append `-v2`, `-v3`, and so on. Never overwrite a prior report silently.
6. Do not use generic generated names such as `README.md`, `output.md`, `test.md`, or `report-final.md`.
7. Preserve uppercase IDs inside artifacts. Lowercase Run IDs and TC IDs only when using them as evidence directory or filename segments.

## Artifact Lifecycle

Give every designed artifact an explicit header with Scope Key, Scope Code, Artifact Type, Revision, State, Source Manifest, Parent Artifacts, Blocking OQs, Approved By, and Approved At.
Use these states consistently:

| State | Meaning |
|---|---|
| `DRAFT` | Content is being prepared and has not received lifecycle approval |
| `REVIEW_REQUIRED` | Draft is ready for user review |
| `APPROVED` | Content and path were explicitly approved |
| `LOCKED` | Approved Viewpoint or Test Case revision may be consumed downstream |
| `BLOCKED_SPEC` | Required behavior or evidence is unresolved |
| `STALE` | A source, parent revision, or decision changed after approval |

For a Gap Report, `State` is lifecycle metadata and does not decide downstream readiness.
Its current revision and `Design Gate = READY | PARTIAL | STOP` control whether Viewpoint design may continue.
For a locked Viewpoint or Test Case, keep applying the phase-specific approval and Lock Gate rules below.

Do not mutate a `LOCKED` design revision with execution results.
Keep result, executor, date, Evidence Policy, evidence locator, and defect history in the append-only execution log.
When approved design content changes, increment its revision and re-run the Lock Gate before downstream use.

A locked Viewpoint revision also freezes its Test Target Map, high-level and leaf Viewpoint Breakdown, Discovery Coverage Map, and the revision or hash of every discovery material used.
Test Case Design consumes that evidence and does not rerun Viewpoint discovery against a newer guide.

## Approval and Write Sequence

Apply this sequence in every QC skill:

1. Read and inventory the approved sources.
2. Propose the scope key and the exact write set.
3. Draft the content in chat and identify unresolved decisions.
4. Obtain explicit approval for the content and exact paths.
5. Write only the approved files.
6. Validate content, links, naming, and traceability, then report the result.

Silence is not approval.
A later phase does not inherit write approval for new paths unless the approved task explicitly included those paths.

## Spec-First Gate

Do not convert missing behavior into an assumption, viewpoint, test case, automation artifact, or execution result.

Select and record one readiness route before Viewpoint design:

| Readiness Route | Use when | Evidence |
|---|---|---|
| `GAP_ANALYSIS` | The user explicitly requests gap analysis, requirement review, or Open Questions, or approves a handoff after a direct check fails | Current Gap Report revision with `Design Gate = READY` or `PARTIAL`, plus applicable OQ rows |
| `DIRECT_SOURCE_CHECK` | The user requests Viewpoint design without Gap Analysis and the approved sources appear complete for the selected scope | Readiness assessment embedded in the Viewpoint artifact |

Gap Analysis is optional.
Do not start `qc-gap-finder` merely because Viewpoint design was requested.
Under `DIRECT_SOURCE_CHECK`, a pass means only that the selected scope has enough source evidence for Viewpoint design.
Record Gap Analysis as `NOT_RUN`, never as `No gaps`, `No findings`, or an equivalent completeness claim.

Classify the design gate per scope:

| Gate | Meaning | Allowed output |
|---|---|---|
| `READY` | All behavior in scope has a testable source | Continue through approved phases |
| `PARTIAL` | Some behavior is source-backed and some is blocked | Continue only for source-backed items after approved `GAP_ANALYSIS`; list blocked coverage |
| `STOP` | No testable workflow exists, or a critical conflict invalidates the flow | No downstream design; write a Gap Report or OQ only when that phase and path are approved |

A source is testable only when it provides, directly or through an explicitly confirmed decision, a Test Objective or business value appropriate to the test level, a named test item, trigger, action, event, or input, an observable expected outcome or test oracle, and the data or rule needed for that outcome.
A clearly labeled QC risk assessment may support prioritization but cannot replace a missing business rule or oracle.
Require actor, permission, precondition, initial state, and state transition only when the behavior depends on them.
Require the relevant API contract for API design.
Require route or endpoint, auth, fixture, cleanup, environment, and runner evidence only for live execution readiness.

`DIRECT_SOURCE_CHECK` has only two outcomes:

- `PASS`: assign `READY` and continue Viewpoint design;
- `FAIL`: assign `STOP` for the attempted scope and do not create an affected Viewpoint. Report the exact missing or conflicting evidence and propose `qc-gap-finder`. Do not start it without explicit approval.

Do not assign `PARTIAL` from a direct check.
Use `GAP_ANALYSIS` when the user wants supported and blocked subsets formally separated.

If the gate is `STOP`, report coverage as `0/0` for the unsupported scope and do not create placeholder cases or empty automation assertions.

## Viewpoint Discovery and Test Design Boundary

`qc-design-viewpoints` owns Test Target understanding, Viewpoint discovery, and Viewpoint decomposition.
It reads the package-managed `references/viewpoint-discovery-guide.md` from its installed skill folder and checks only the fixed project-owned path `qc/config/viewpoint-discovery-extension.md`.
Both are heuristics only and must not be cited as business rules or Expected Results.

The project extension is optional.
When it is absent, continue with the package guide, record `ABSENT`, and give only a non-blocking suggestion that the user may add an extension when reusable project or domain prompts exist.
Do not return `BLOCKED_INPUT`, stop design, search for an alternate location, or ask the user for a locator merely because the optional file is absent.
When it exists, record `PRESENT_APPLICABLE`, `PRESENT_NOT_APPLICABLE`, or `PRESENT_UNCONFIRMED` according to its revision and scope applicability.
Do not lock a Viewpoint artifact while an existing relevant extension is `PRESENT_UNCONFIRMED`.

When the user supplies reusable project or domain discovery knowledge, requests migration from an approved legacy checklist, or source-backed analysis reveals a reusable prompt missing from the package guide, `qc-design-viewpoints` may propose extension content using the package template.
The agent must draft the normalized prompt and provenance in chat, obtain explicit approval for the exact content and canonical write path, write only `qc/config/viewpoint-discovery-extension.md`, then rerun discovery and record its revision or hash and used `EXT-VDG-*` IDs.
An approved external source remains provenance and never becomes an alternate runtime extension path.

The locked Viewpoint artifact must preserve the selected discovery IDs, applicability decisions, mapped leaf VP IDs, and material revision or hash.
Every Test Case traces to one primary locked leaf Viewpoint.

`qc-design-test-cases` owns coverage items, coverage targets, Test Design Techniques, Preconditions, Test Data, Steps, and Expected Results.
It reads `references/test-design-techniques.md` and the locked Viewpoint handoff.
It must not read or reapply the discovery guide, project extension, or legacy field and UI component checklists.
A missing or stale Viewpoint returns to `qc-design-viewpoints` for a new revision.

## Legacy Design Compatibility

Never rewrite an existing locked Viewpoint, Test Case, or execution artifact to simulate the new hierarchy.
A new Test Case design based on a legacy flat Viewpoint artifact requires a separately reviewed Viewpoint revision containing the Test Target Map, high-level and leaf breakdown, Discovery Coverage Map, and Discovery Material Manifest.

Existing locked Test Cases and execution Runs may continue downstream when their original `VP ID` and source trace still resolve.
Preserve that evidence as legacy flat Viewpoint trace.
Do not infer parent-child relationships or relabel historical IDs.
Reports must disclose the legacy limitation and keep legacy flat coverage separate from new high-level and leaf coverage.

## Cross-Artifact Traceability

Use relative Markdown links for artifacts stored in the project and preserve the applicable readiness branch before the common downstream chain:

```text
source requirement
  -> GAP_ANALYSIS -> gap report and applicable OQ -> locked viewpoint
  or
  -> DIRECT_SOURCE_CHECK embedded in the locked viewpoint

locked viewpoint
  -> locked leaf viewpoint and discovery coverage map
  -> test design basis: coverage item, target, technique, and rationale
  -> test case
  -> manual result source or automation artifact, when applicable
  -> execution run
  -> stakeholder report
```

Every artifact header must reference its immediate sources.
Link project-local sources and use the recorded `external, non-portable` locator for an approved external source.
Validate that each project-relative link resolves before delivery.

## Validation States

Keep these states separate:

| State | Evidence required |
|---|---|
| `STATIC_VALID` | Structure, IDs, links, traceability, and required fields pass static checks |
| `AUTOMATION_ELIGIBLE` | Test intent can be automated without changing its meaning |
| `RUNTIME_READY` | Environment, route, auth, fixture, cleanup, runner, and dependencies are verified, with no unresolved OQ blocking from `DESIGN`, `EXPORT`, or `EXECUTION` |

Never describe static validity or automation eligibility as runtime readiness.

## Coverage and Readiness Reporting

- Never present a bare `100%` as complete product or production-risk coverage.
- Name the approved source-backed denominator and show the numerator and denominator together.
- Report blocked and explicitly waived or `OUT_OF_SCOPE` items separately from covered items.
- When the phase has the relevant evidence, report `STATIC_VALID`, `AUTOMATION_ELIGIBLE`, `RUNTIME_READY`, and `EXECUTED` separately.
- Do not turn Automation Eligibility into runtime or execution coverage.
