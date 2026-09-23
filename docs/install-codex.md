# Install Tanizy QC Agent

## Required Input

Pass the project root to `--project`.
Do not pass the project's `qc/` runtime directory.

```bash
npx @thanhndpo/tanizy-qc-agent \
  --target codex \
  --project /path/to/project \
  --dry-run
```

Review the displayed project root, skill root, runtime root, write actions, and legacy warnings.
Then install:

```bash
npx @thanhndpo/tanizy-qc-agent \
  --target codex \
  --project /path/to/project
```

## Supported Targets

| Target | Skill root | Managed adapter |
|---|---|---|
| `codex` | `.agents/skills/` | QC block in `AGENTS.md` |
| `gemini-cli` | `skills/` | QC block in `GEMINI.md` |
| `claude-code` | `.claude/skills/` | QC block in `CLAUDE.md` |
| `antigravity` | `.agents/skills/` | QC block in `AGENTS.md` plus namespaced rule |

The installer preserves content outside its marked adapter block.

## Existing PO or Project Instructions

The installer appends one block between these markers:

```text
<!-- BEGIN TANIZY QC AGENT MANAGED BLOCK -->
<!-- END TANIZY QC AGENT MANAGED BLOCK -->
```

It does not replace an existing PO block or unmarked project instructions.
`--force` refreshes only the QC block.
Review the dry run and keep PO, project, or other agent instructions outside the QC markers.

PO completion does not trigger QC automatically.
The user must explicitly invoke QC and provide an approved source locator.
QC can read an exact source inside or outside the project, but keeps it read-only and applies independent Scope, Persist, Lock, Manual Result, Execution, and Release Verdict gates.
QC does not discover a missing source from a feature name, module name, scope key, keyword, or prior project knowledge.
Without an exact user-supplied locator or an explicitly approved bounded search root, QC returns `BLOCKED_INPUT` in chat and must not search the filesystem or request broader filesystem permission.
If the user does not know the locator, QC asks requirement clarification questions in chat and does not infer unstated behavior.

This guarantee covers QC installer operations.
Another installer that replaces the whole root adapter can still remove the QC block.
Prefer selective updates for such packages.
After a legacy PO full `--force` update, re-run this QC installer with `--force`; it preserves the resulting PO content and restores one current QC block.

## Selective Install

Repeat `--skill` to choose exact skill folders:

```bash
npx @thanhndpo/tanizy-qc-agent \
  --target codex \
  --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-test-cases
```

Every installed QC skill reads the single package-managed artifact contract at `qc/config/material-paths.md`.
The installer does not create a local `references/material-paths.md` copy in each skill.

Design materials have phase-specific ownership:

| Material | Owner and path | Use |
|---|---|---|
| Viewpoint discovery guide | Package-managed, `<skill-root>/qc-design-viewpoints/references/viewpoint-discovery-guide.md` | Understand the Test Target, discover testing angles, and decompose them into leaf Viewpoints |
| Viewpoint discovery extension | Optional and project-owned, `qc/config/viewpoint-discovery-extension.md` | Add source-backed project or domain discovery knowledge without modifying the package guide |
| Test Design Techniques | Package-managed, `<skill-root>/qc-design-test-cases/references/test-design-techniques.md` | Select coverage items, coverage targets, and techniques from locked leaf Viewpoints before designing Test Cases |

The discovery guide and extension are heuristics.
They can identify questions to ask but never define a requirement, business rule, or Expected Result.
An absent extension does not block Viewpoint design and does not trigger a locator question.
The agent may give a non-blocking suggestion to add reusable project or domain prompts and can draft the extension template when a candidate exists, but it writes the canonical path only after the exact content and path are approved.

The required flow is:

```text
Understand Test Target
-> Discover Viewpoints
-> Decompose into leaf Viewpoints
-> LOCK leaf Viewpoint revision
-> Select coverage item and coverage target
-> Select Test Design Technique
-> Design Test Cases
```

`qc-design-test-cases` does not use the discovery guide or extension to find new Viewpoints.
If Test Case Design exposes a missing Viewpoint, create and approve a new Viewpoint revision first.

## Update

```bash
npx @thanhndpo/tanizy-qc-agent@latest \
  --target codex \
  --project /path/to/project \
  --force
```

`--force` replaces selected package-managed skill folders, refreshes the shared contract, retires legacy per-skill contract copies from earlier package versions in the selected skills, and updates the managed adapter block.
Run a full update to retire every old copy.
It does not overwrite:

- `qc/open-questions.md`
- `qc/refs/system-context.md`
- `qc/refs/bug-base.md`
- `qc/config/viewpoint-discovery-extension.md`
- `qc/config/field-validation-checklist.md`
- `qc/config/ui-component-checklist.md`
- Content outside the marked QC adapter block

The two checklist paths are legacy inputs, not active package seeds.
When either exists, the installer warns but never deletes, overwrites, or silently migrates it.
Review its project-specific discovery rules and merge the relevant content into `qc/config/viewpoint-discovery-extension.md`.
Archive or delete the legacy file only after separate approval.

Existing locked flat Viewpoint, Test Case, and execution artifacts remain immutable.
Create and approve a new hierarchical Viewpoint revision before new Test Case Design.
Existing locked Test Cases may continue downstream with their original `VP ID` trace; reports disclose that legacy parent and leaf coverage cannot be reconstructed.

## Runtime Layout

```text
qc/
├── config/
│   ├── material-paths.md
│   └── viewpoint-discovery-extension.md  # optional, project-owned
├── refs/
├── open-questions.md
├── tasks/
├── gap-reports/                        # optional, only for approved Gap Analysis
├── test-viewpoints/
├── test-cases/
├── automation/
├── execution-inputs/
├── executions/
├── evidence/
└── reports/
```

Use one exact source-derived `scope-key` across all artifact types.
Preserve prefixes such as `fs-`, `epic-`, `req-`, and `cr-`.
Confirm one stable uppercase `scope-code` for generated IDs.

When `qc-record-manual-results` prepares XLSX, Codex should invoke its available native `Spreadsheets` skill and follow that skill's current inspect, render, and export contract.
The QC package defines workbook content and import semantics; it does not bundle or pin the spreadsheet runtime API.

## Legacy Layout

The installer detects but never deletes `qc/.agents/skills/`, duplicate OQ ledgers, shared `qc/qc-task.md`, and earlier config locations.
Validate the new installation before manually migrating any project-owned content.

Use this mapping during migration:

| Legacy path or pattern | Canonical handling |
|---|---|
| `qc/.agents/skills/qc-*` | Install target-native skills at project root; remove the nested copy only after discovery is verified |
| `qc/refs/open-questions.md` | Merge unique decisions into `qc/open-questions.md`; do not overwrite either ledger blindly |
| `qc/qc-task.md` | Split by scope into `qc/tasks/<scope-key>-qc-task.md` |
| `qc/material-paths.md` | Replace with the package-managed `qc/config/material-paths.md` after comparing custom rules |
| `<skill-root>/qc-*/references/material-paths.md` | Retired for each selected skill by `--force`; run a full update to migrate all installed QC skills to `qc/config/material-paths.md` |
| `qc/field-validation-checklist.md` | Preserve it, compare project-specific discovery rules, and merge relevant content into `qc/config/viewpoint-discovery-extension.md` |
| `qc/ui-component-checklist.md` | Preserve it, compare project-specific discovery rules, and merge relevant content into `qc/config/viewpoint-discovery-extension.md` |
| `qc/config/field-validation-checklist.md` | Treat as a preserved legacy checklist; merge relevant customization into `qc/config/viewpoint-discovery-extension.md` |
| `qc/config/ui-component-checklist.md` | Treat as a preserved legacy checklist; merge relevant customization into `qc/config/viewpoint-discovery-extension.md` |
| `qc/AGENTS.md` | Preserve project rules at the root adapter; do not keep a nested adapter |
| Artifact filename missing the source prefix | Rename to the exact source-derived scope key and update every relative link |

### Project-Owned Reference Schema Migration

Installer updates preserve project-owned references, so a package update does not rewrite an existing ledger into the latest schema.
Compare and migrate each file explicitly:

| Existing schema | Migration rule |
|---|---|
| Open Questions `Type` contains `GAP`, `AMB`, `CONFLICT`, or `RISK` | Move it to Finding Class and leave Question Domain blank until the domain is known |
| Open Questions `Type` contains a topic such as Business data, File contract, NFR, or UI contract | Move it to Question Domain; derive Finding Class only from the linked finding or approved source, otherwise keep the row open and request classification |
| Open Questions lacks ownership or decision audit fields | Add Owner, Target Date, Decision By, Resolved Source Ref, and Status Updated At; leave unknown values blank or `OPEN` rather than inventing them |
| System Context lacks Scope Key, Environment, or Source Revision | Add the columns and copy only verified values; use `UNKNOWN` only when the original record proves the value is unavailable |
| Bug Base uses separate active and history tables | Merge matching Bug IDs into one lifecycle row while preserving requirement, TC, Run, evidence, observed, fixed, and closed trace |

Do not automatically change OQ status during migration.
PO Open maps to QC `OPEN`; PO Answered maps to QC `ANSWERED`; PO Deferred remains QC `OPEN` unless there is explicit authorized risk acceptance; only an exact updated governing source allows QC `RESOLVED`.

Migration sequence:

1. Run `--dry-run` against the project root and review all warnings.
2. Install the new layout without deleting legacy files.
3. Inventory and compare project-owned content, especially OQ decisions, System Context, Bug Base, legacy checklist customization, task history, and relative links.
4. Merge relevant project-specific discovery rules from legacy checklists into `qc/config/viewpoint-discovery-extension.md`. Do not move Test Case coverage or technique rules into that extension.
5. Merge or rename one scope at a time, then validate links and traceability.
6. Remove or archive legacy files only after explicit approval and a clean validation result.
