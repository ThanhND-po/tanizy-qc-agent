# Install Tanizy QC Agent

## Required Input

Pass the project root to `--project`. Do not pass the project's `qc/` runtime
directory.

```bash
npx @thanhndpo/tanizy-qc-agent \
  --target codex \
  --project /path/to/project \
  --dry-run
```

Review the displayed project root, skill root, runtime root, write actions, and
legacy warnings. Then install:

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
`--force` refreshes only the QC block. Review the dry run and keep PO, project,
or other agent instructions outside the QC markers.

PO completion does not trigger QC automatically. The user must explicitly
invoke QC and provide an approved source locator. QC can read an exact source
inside or outside the project, but keeps it read-only and applies independent
Scope, Persist, Lock, Execution, and Release Verdict gates.

This guarantee covers QC installer operations. Another installer that replaces
the whole root adapter can still remove the QC block. Prefer selective updates
for such packages. After a legacy PO full `--force` update, re-run this QC
installer with `--force`; it preserves the resulting PO content and restores
one current QC block.

## Selective Install

Repeat `--skill` to choose exact skill folders:

```bash
npx @thanhndpo/tanizy-qc-agent \
  --target codex \
  --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-test-cases
```

The canonical artifact contract is refreshed across installed QC skills during
an approved `--force` update so local copies do not diverge.

## Update

```bash
npx @thanhndpo/tanizy-qc-agent@latest \
  --target codex \
  --project /path/to/project \
  --force
```

`--force` replaces selected package-managed skill folders, canonical contract
copies, and the managed adapter block. It does not overwrite:

- `qc/open-questions.md`
- `qc/refs/system-context.md`
- `qc/refs/bug-base.md`
- `qc/config/field-validation-checklist.md`
- content outside the marked QC adapter block

## Runtime Layout

```text
qc/
├── config/
├── refs/
├── open-questions.md
├── tasks/
├── gap-reports/
├── test-viewpoints/
├── test-cases/
├── automation/
├── executions/
├── evidence/
└── reports/
```

Use one exact source-derived `scope-key` across all artifact types. Preserve
prefixes such as `fs-`, `epic-`, `req-`, and `cr-`. Confirm one stable uppercase
`scope-code` for generated IDs.

## Legacy Layout

The installer detects but never deletes `qc/.agents/skills/`, duplicate OQ
ledgers, shared `qc/qc-task.md`, and earlier config locations. Validate the new
installation before manually migrating any project-owned content.

Use this mapping during migration:

| Legacy path or pattern | Canonical handling |
|---|---|
| `qc/.agents/skills/qc-*` | Install target-native skills at project root; remove the nested copy only after discovery is verified |
| `qc/refs/open-questions.md` | Merge unique decisions into `qc/open-questions.md`; do not overwrite either ledger blindly |
| `qc/qc-task.md` | Split by scope into `qc/tasks/<scope-key>-qc-task.md` |
| `qc/material-paths.md` | Replace with the package-managed `qc/config/material-paths.md` after comparing custom rules |
| `qc/field-validation-checklist.md` | Move project customization to `qc/config/field-validation-checklist.md` |
| `qc/AGENTS.md` | Preserve project rules at the root adapter; do not keep a nested adapter |
| Artifact filename missing the source prefix | Rename to the exact source-derived scope key and update every relative link |

Migration sequence:

1. Run `--dry-run` against the project root and review all warnings.
2. Install the new layout without deleting legacy files.
3. Inventory and compare project-owned content, especially OQ decisions,
   checklist customization, task history, and relative links.
4. Merge or rename one scope at a time, then validate links and traceability.
5. Remove or archive legacy files only after explicit approval and a clean
   validation result.
