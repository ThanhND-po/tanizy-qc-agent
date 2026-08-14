# Installing Tanizy QC Agent

Tanizy QC Agent supports four targets: Gemini CLI, Codex, Claude Code, and Antigravity. The target controls the adapter entrypoint and skill directory; the QC workflow itself remains shared.

## Install via npm

```bash
npx @thanhndpo/tanizy-qc-agent --target gemini-cli --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target claude-code --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target antigravity --project /path/to/project
```

Preview an installation with `--dry-run` before writing files:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --dry-run
```

## Install selected skills

Repeat `--skill` to install only the requested workflows:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-test-cases
```

Selective installation also copies the global `material-paths.md` reference into every selected skill and into `qc/material-paths.md`, so the rule applies consistently to `qc-task.md`, `open-questions.md`, gap reports, test materials, executions, and stakeholder reports.

## Install from a local clone

```bash
node scripts/install.mjs --target codex --project /path/to/project
node scripts/install.mjs --target gemini-cli --project /path/to/project --skill qc-gap-finder
```

Use `--force` to overwrite existing adapter or skill files. Runtime reference seeds under `qc/refs/` are preserved by default; use `--skip-refs` to omit them.

## Target layout

| Target | Adapter entrypoint | Skill directory |
|---|---|---|
| `gemini-cli` | `GEMINI.md` | `skills/` |
| `codex` | `AGENTS.md` | `.agents/skills/` |
| `claude-code` | `CLAUDE.md` | `.claude/skills/` |
| `antigravity` | `AGENTS.md` plus `.agents/rules/tanizy-qc.md` | `.agents/skills/` |

Every target also receives `qc/material-paths.md`, which is generated from `core/references/material-paths.md`. Each installed skill receives a copy at `references/material-paths.md` because skills must be self-contained when read directly.

## After install

Open the target project in the selected agent. QC starts only after explicit user invocation. The adapter routes requests to the matching `qc-*` skill and requires the global material path rule before any QC artifact is created or updated. The agent does not modify requirement documents and does not start automatically.

For Codex, the normal explicit invocation is `$qc-orchestrator`. For direct workflow use, invoke `$qc-gap-finder`, `$qc-design-viewpoints`, `$qc-design-test-cases`, `$qc-export-gherkin`, `$qc-run-playwright`, `$qc-export-postman`, or `$qc-report-generator` as appropriate.

## Manual adapter copy

Manual copying is supported when npm installation is not available. Copy the target adapter entrypoint and the corresponding core skills to the target-specific locations shown above. Also copy `core/references/material-paths.md` to `qc/material-paths.md` and to each installed skill's `references/material-paths.md`. The installer is recommended because it keeps these copies synchronized.

## Updating

```bash
npx @thanhndpo/tanizy-qc-agent@latest --target codex --project /path/to/project --force
npx @thanhndpo/tanizy-qc-agent@latest --target claude-code --project /path/to/project --skill qc-gap-finder --force
```

Do not edit copied skill files as the source of truth. Update `core/skills/` or `core/references/material-paths.md` in this repository, then reinstall.

## Legacy Codex placement

Versions before the multi-target installer used `--placement root|qc`. That option is no longer supported. Use `--target codex` for the standard Codex layout, or choose another target explicitly.

## Material layout

All QC artifacts live under `qc/` and follow the rules in `qc/material-paths.md`. The OQ ledger and runtime refs are shared, while gap reports, viewpoints, test cases, executions, and reports use their dedicated directories.

> Never create a second divergent `material-paths.md` as a source of truth. The package has one canonical source, and installed copies are generated artifacts.
