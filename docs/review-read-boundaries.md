# Read Boundaries and Template Ownership Review

Review date: 2026-10-15.
Baseline: package `0.8.7`, commit `3eefcb9687925795c5e447b041bacab1c46bfd5f`.
Prepared update: `0.8.8`.
Scope: all nine skill entrypoints, both shared references, every skill-owned reference, all three supported adapters and the supplemental Antigravity rule, runtime seeds, installer, and package validation/test scripts.

## Evidence and Limits

The supplied screenshot shows an agent reading the first 100 lines of an older Test Case from a different scope while preparing new Test Cases.
It does not prove that every old artifact was read, establish the exact model version, or reveal the agent's internal reason for choosing that file.
The accompanying agent explanation is self-report, not an independent causal trace.
During this review the installed Test Case skill matched the baseline source byte for byte, with SHA-256 `d19328d381e5ab0f9dfa2b3dfe1c02d5658649a99e7662eef9296d933d4fc7e5`.
This establishes the files inspected now, not every reference loaded in the earlier session.

## Assessment of the Reported Explanation

| Claim | Assessment | Evidence or qualification |
|---|---|---|
| The agent opened an older cross-scope Test Case | Supported | Visible in the supplied tool activity screenshot |
| It did so specifically to imitate format | Not independently verified | Plausible self-report, but no read-decision trace proves motivation |
| The skill lacks a complete canonical template | Supported | The baseline entrypoint has partial section headers and one TC row, with traceability described separately |
| A full template with every Legend and table is missing | Supported with qualification | The output skeleton is incomplete, but TC/Basis column headers, all five eligibility definitions, and shared lifecycle/readiness meanings already exist; those gaps do not require an old TC to resolve |
| Looking up priority conventions could resolve uncertainty | A real contract gap, but not read authorization | The TC example uses High and P1 without a complete named vocabulary or meanings; the correct response is a focused contract question rather than unrelated artifact discovery |
| The input rule restricts only missing requirements | Incorrect | It explicitly covers requirement, design, execution, and reporting inputs |
| The contract-loading exception leaves room for confusion | Supported with qualification | It calls a fixed project artifact path contract loading, but does not authorize arbitrary old cases; the missing distinction can still encourage misuse |
| Two text changes would guarantee complete prevention | Unsupported | Instructions and a template reduce ambiguity but do not enforce filesystem access or prove model compliance |

There is no meaningful truth percentage for this mixture of observable actions, code claims, self-report, and proposed guarantees.
The relevant causal conclusion is narrower: incomplete routing and an overly broad exception can encourage a read that the existing input boundary already intends to prevent.
The screenshot does not establish that the package required that read.

## Findings and Changes

| Finding | Baseline issue | Change in 0.8.8 |
|---|---|---|
| F01 | Project artifacts can be mistaken for contract/style material | Shared contract separates contract loading, phase evidence, current-target revision, historical run inputs, and explicit comparisons |
| F02 | Scope-code uniqueness asks for existing artifacts without a read limit | New-code checks are metadata-only in named QC stores; inherited confirmed codes require no repeated scan |
| F03 | A partial TC skeleton and undefined Risk/Test Priority encourage example hunting | Required complete format reference, prefilled Legends, shared classification defaults, and explicit project-override handling |
| F04 | Nine preflights repeat the same long boundary text; validator requires those repetitions | Short enforcement cues point to one canonical contract, and validation follows those owners |
| F05 | Technique guide duplicates the split policy and uses parallel Coverage Design Map columns | Split policy stays in the entrypoint; the format reference owns planning/output schemas and reconciliation tables |
| F06 | Context schemas exist without an explicit load trigger in gap-finder | Load the context reference only for approved context/ref updates |
| F07 | Manual Markdown instructions conflict over copying locked design context | Canonical Markdown keeps locked context after scan-first fields, matching the bundled engine |
| F08 | Viewpoint route can be selected merely because a Gap Report exists | Route must be approved and the current report supplied; existence alone is insufficient |
| F09 | Return-count scope can be interpreted as resetting with each revision | Unresolved VP return count continues across attempted revisions |
| F10 | Report format routing is vague and Verdict meanings lack a complete table | Common format guide is explicit, DOCX reference is conditional, and Verdict meanings are defined without inventing release criteria |
| F11 | Unassigned owner/date may be filled with OPEN | Those fields stay blank; OPEN remains an OQ Status; guide and new-install seed are synchronized |
| F13 | System Context lists three Status values without reader-facing definitions | Add matching Status meanings to the context schema guide and new-install seed |
| F12 | Shared source instructions sit under iteration policy; only OQ is called shared despite multi-scope context stores | Restore source guidance to its own boundary and explicitly limit shared-store reads by relevant rows |

Risk and Test Priority defaults apply to new designs only.
No locked project artifacts, existing custom definitions, execution schemas, or historical IDs are migrated by this change.
Missing required phase evidence still returns `BLOCKED_INPUT`; missing optional context does not become a new gate.
Explicit relevant cross-scope dependencies, approved comparison requests, current-target revisions, and selected historical Runs remain valid inputs for their stated purpose.

## Reference Ownership After Review

| Canonical owner | Responsibility | Routing or duplication decision |
|---|---|---|
| `core/references/material-paths.md` | Read boundaries, shared classification defaults, naming, lifecycle, gates, language, and iteration policy | One shared runtime copy, with short skill and adapter enforcement cues |
| `core/references/executions-log.md` | Run/attempt schema, Result meanings, assessment, evidence, and immutable history | Installer-generated copies for the three consuming skills remain intentional and derive from this single source |
| `qc-design-test-cases/references/test-case-format.md` | Complete TC output, canonical TC/Basis tables, eligibility meanings, and traceability/reconciliation layout | Mandatory before drafting; prefilled shared vocabulary meanings are checked against their shared owner |
| `qc-design-test-cases/references/test-design-techniques.md` | Technique selection, coverage construction, and technique-specific constraints | Links to the split policy and format schemas instead of restating them |
| `qc-design-test-cases/references/automation-eligibility.md` | Eligibility decision rules and downstream routing | Links to canonical meanings instead of keeping a second definition table |
| `qc-design-viewpoints/references/viewpoint-discovery-guide.md` | Prompt catalog, discovery classifications, and optional extension lifecycle | Retained as analysis-only heuristic; never loaded again by Test Case Design |
| `qc-gap-finder/references/open-questions-guide.md` | OQ schema, lifecycle, decision mapping, and blocking | Remains phase-specific; no borrowed priority or ownership conventions |
| `qc-gap-finder/references/context-templates.md` | Verified System Context and Bug Base update schemas | Conditional read for approved updates; runtime seeds intentionally reproduce these schemas |
| `qc-record-manual-results/references/manual-results-format.md` | Editable run inputs and import contract | Corrected to match the actual engine; source design remains immutable |
| `qc-report-generator/references/report-content-spec.md` | Report content, metrics, derived NOT_RUN, and Verdict definitions | Always loaded for reports; source logs retain execution Result ownership |
| `qc-report-generator/references/format-guide.md` | Format selection and verification | Always loaded for report format handling |
| `qc-report-generator/references/docx-format.md` | DOCX production and visual checks | Loaded only for DOCX |

Deliberate gate reminders and reader-facing vocabulary snapshots are retained where they prevent misrouting or make artifacts understandable outside the installed package.
This review does not delete domain prompt families merely because they discuss similar risks in different item types.
It also does not expand unsupported automation authoring, report toolchains, or execution authority.

## Verification and Release Limits

Baseline `npm run pack:check` passed before changes.
The updated checks validate reference routes, full Legends, canonical-owner consistency, equal table widths, selective installation of the template, and compatibility of a filled template with the bundled XLSX, CSV, and Markdown preparation engine.
Installer coverage includes all three supported targets, packaged CLI use, force refresh, managed blocks, project-owned preservation, and symlink safeguards.
These checks establish package integrity and integration compatibility; they do not evaluate an LLM's tool choices.

The source checkout rubric at `tests/read-boundaries/rubric.md` defines observable scenarios for fresh design, missing template/input, current-target revision, explicit dependency, new-code lookup, optional absence, and an undefined project value.
Prepare an isolated workspace from a source checkout with:

```bash
npm run test:read-boundaries -- --prepare-eval /absolute/new/evaluation-directory
```

It contains the installed TC skill, exact approved synthetic inputs, 100 cross-scope decoys, one retired same-scope artifact, and `evaluation-request.md`.
The generator rejects an existing directory and never installs into a real project.
The synthetic template-integration artifacts in that workspace are not authorized design inputs for the model request.
Give the evaluated agent only that request and workspace, not the test script, rubric, or expected answer.
Record model behavior as `NOT_RUN` until an actual target session and complete tool trace have been reviewed.
Repeat on each relevant host/model, including the host used for the reported incident, before claiming measured behavioral improvement.

No instruction-only change guarantees that an agent will never read an unauthorized example.
Where strict enforcement is required, restrict read tools to the approved input set and package references, with a separate metadata-only path for collision checks.
That host-level enforcement is outside this portable instruction package.
