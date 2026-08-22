# QC Artifact Contract

Read this contract before creating or updating any QC artifact. The installer
publishes this canonical package source once per target project at
`qc/config/material-paths.md`. Every installed QC skill reads that shared runtime
file instead of carrying a duplicate copy.

## Ownership Boundary

Keep package-managed instructions separate from project-owned artifacts:

| Owner | Location | Update rule |
|---|---|---|
| Package | Target-native skill directory, for example `.agents/skills/qc-*` | Installer may replace only selected skill folders with `--force` |
| Package | Managed QC block in `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` | Installer may update only the marked block |
| Package | `qc/config/material-paths.md` | Installer may refresh with `--force` |
| Project | All other files under `qc/` | Preserve during install and update |

Never place installed skills inside `qc/`. Never write generated QC artifacts inside an installed skill folder.

## Source and PO Handoff Boundary

QC may consume approved requirement sources from the current project, another readable local path, or a canonical external locator supplied by the user. Record the exact locator, approval state, and revision or hash. Keep every
source read-only.

A PO handoff makes sources available to QC. It does not imply QC phase scope, artifact write approval, Lock Gate approval, Execution Gate approval, or release authority. QC starts only after an explicit QC request and applies its own gates.

For a source inside the project, use a relative Markdown link. For a readable
source outside the project, record its exact absolute path or canonical URI and
mark it `external, non-portable` in the Source Manifest. Do not fabricate a
project-relative link. Read the source in place. Do not copy an external source
into the project unless the user separately approves the snapshot content and
path. If the source cannot be read, has no stable revision, or its approval
state is unknown, request the missing source evidence. Under `GAP_ANALYSIS`,
classify the affected scope as `PARTIAL` or `STOP`. Under
`DIRECT_SOURCE_CHECK`, return `FAIL` and do not create an affected Viewpoint.

## Scope Key

Use one `scope-key` for every artifact in the same QC workstream.

1. For one requirement file, use its exact filename stem in lowercase kebab-case. Preserve semantic prefixes such as `epic-`, `fs-`, `req-`, and `cr-`.
2. For several requirement files, propose a parent scope key and obtain user confirmation before writing. Do not infer which source is primary.
3. Record the scope key and every source path in each artifact header.
4. Confirm one uppercase `scope-code` of 2 to 12 letters or digits for generated IDs. Before approval, verify that another scope does not already use it in existing artifacts or the OQ ledger. Preserve it across revisions.

Example for `fs-shinsei-manual-transfer.md`:

```text
scope-key = fs-shinsei-manual-transfer
```

Do not shorten it to `shinsei-manual-transfer` in one artifact and retain
`fs-` in another.

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

Use three digits for sequence numbers. Add the two-digit Run suffix only when a timestamp collision exists. Never reuse a retired ID for different intent.

## Target Project Layout

```text
qc/
├── config/
│   ├── material-paths.md
│   ├── field-validation-checklist.md   # when Viewpoint or Test Case design is installed or project-provided
│   └── ui-component-checklist.md       # when Viewpoint or Test Case design is installed or project-provided
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

Only `open-questions.md` is shared across scopes. Keep task progress in `qc/tasks/`, not in a single `qc/qc-task.md` that later scopes can overwrite. Do not create `qc/refs/open-questions.md`.

`execution-inputs/` and `evidence/` are optional project-local stores. A manual result source or evidence item may remain outside the project tree when the user manages it elsewhere. Record its exact locator, integrity metadata when available, and portability limitation. Do not copy it into `qc/` without separate approval.

## Naming and Versioning Rules

1. Use lowercase kebab-case for generated Markdown and Gherkin filenames.
2. Use the same scope key across every artifact that exists for the workstream. A direct-to-Viewpoint route does not require a gap artifact.
3. Update living artifacts in place and keep a revision history in the file.
4. Preserve execution history as separate run sections in the executions log.
5. Reports are snapshots. If the same scope and date already exist, append `-v2`, `-v3`, and so on. Never overwrite a prior report silently.
6. Do not use generic generated names such as `README.md`, `output.md`, `test.md`, or `report-final.md`.
7. Preserve uppercase IDs inside artifacts. Lowercase Run IDs and TC IDs only when using them as evidence directory or filename segments.

## Artifact Lifecycle

Give every designed artifact an explicit header with Scope Key, Scope Code, Artifact Type, Revision, State, Source Manifest, Parent Artifacts, Blocking OQs, Approved By, and Approved At. Use these states consistently:

| State | Meaning |
|---|---|
| `DRAFT` | Content is being prepared and is not approved for downstream use |
| `REVIEW_REQUIRED` | Draft is ready for user review |
| `APPROVED` | Content and path were explicitly approved |
| `LOCKED` | Approved Viewpoint or Test Case revision may be consumed downstream |
| `BLOCKED_SPEC` | Required behavior or evidence is unresolved |
| `STALE` | A source, parent revision, or decision changed after approval |

Do not mutate a `LOCKED` design revision with execution results. Keep result, executor, date, Evidence Policy, evidence locator, and defect history in the append-only execution log.
When approved design content changes, increment its revision and re-run the Lock Gate before downstream use.

## Approval and Write Sequence

Apply this sequence in every QC skill:

1. Read and inventory the approved sources.
2. Propose the scope key and the exact write set.
3. Draft the content in chat and identify unresolved decisions.
4. Obtain explicit approval for the content and exact paths.
5. Write only the approved files.
6. Validate content, links, naming, and traceability, then report the result.

Silence is not approval. A later phase does not inherit write approval for new paths unless the approved task explicitly included those paths.

## Spec-First Gate

Do not convert missing behavior into an assumption, viewpoint, test case, automation artifact, or execution result.

Select and record one readiness route before Viewpoint design:

| Readiness Route | Use when | Evidence |
|---|---|---|
| `GAP_ANALYSIS` | The user explicitly requests gap analysis, requirement review, or Open Questions, or approves a handoff after a direct check fails | Approved Gap Report revision and applicable OQ rows |
| `DIRECT_SOURCE_CHECK` | The user requests Viewpoint design without Gap Analysis and the approved sources appear complete for the selected scope | Readiness assessment embedded in the Viewpoint artifact |

Gap Analysis is optional. Do not start `qc-gap-finder` merely because Viewpoint
design was requested. Under `DIRECT_SOURCE_CHECK`, a pass means only that the
selected scope has enough source evidence for Viewpoint design. Record Gap
Analysis as `NOT_RUN`, never as `No gaps`, `No findings`, or an equivalent
completeness claim.

Classify the design gate per scope:

| Gate | Meaning | Allowed output |
|---|---|---|
| `READY` | All behavior in scope has a testable source | Continue through approved phases |
| `PARTIAL` | Some behavior is source-backed and some is blocked | Continue only for source-backed items after approved `GAP_ANALYSIS`; list blocked coverage |
| `STOP` | No testable workflow exists, or a critical conflict invalidates the flow | No downstream design; write a Gap Report or OQ only when that phase and path are approved |

A source is testable only when it provides, directly or through an explicitly
confirmed decision, a named test item, trigger, action, event, or input, an
observable expected outcome or test oracle, and the data or rule needed for
that outcome. Require actor, permission, precondition, initial state, and state
transition only when the behavior depends on them. Require the relevant API
contract for API design. Require route or endpoint, auth, fixture, cleanup,
environment, and runner evidence only for live execution readiness.

`DIRECT_SOURCE_CHECK` has only two outcomes:

- `PASS`: assign `READY` and continue Viewpoint design;
- `FAIL`: assign `STOP` for the attempted scope and do not create an affected
  Viewpoint. Report the exact missing or conflicting evidence and propose
  `qc-gap-finder`. Do not start it without explicit approval.

Do not assign `PARTIAL` from a direct check. Use `GAP_ANALYSIS` when the user
wants supported and blocked subsets formally separated.

If the gate is `STOP`, report coverage as `0/0` for the unsupported scope and do not create placeholder cases or empty automation assertions.

## Cross-Artifact Traceability

Use relative Markdown links for artifacts stored in the project and preserve
the applicable readiness branch before the common downstream chain:

```text
source requirement
  -> GAP_ANALYSIS -> gap report and applicable OQ -> locked viewpoint
  or
  -> DIRECT_SOURCE_CHECK embedded in the locked viewpoint

locked viewpoint
  -> test case
  -> manual result source or automation artifact, when applicable
  -> execution run
  -> stakeholder report
```

Every artifact header must reference its immediate sources. Link project-local sources and use the recorded `external, non-portable` locator for an approved external source. Validate that each project-relative link resolves before delivery.

## Validation States

Keep these states separate:

| State | Evidence required |
|---|---|
| `STATIC_VALID` | Structure, IDs, links, traceability, and required fields pass static checks |
| `AUTOMATION_ELIGIBLE` | Test intent can be automated without changing its meaning |
| `RUNTIME_READY` | Environment, route, auth, fixture, cleanup, runner, and dependencies are verified, with no unresolved OQ blocking from `DESIGN`, `EXPORT`, or `EXECUTION` |

Never describe static validity or automation eligibility as runtime readiness.
