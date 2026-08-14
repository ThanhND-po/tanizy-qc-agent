# Installing Tanizy QC Agent for Codex

QC agent skills install under the `qc/` directory by default (`qc/.agents/skills/` and `qc/AGENTS.md`). This keeps them next to the project while coexisting with a Tanizy PO Agent installed at the root, which is the recommended placement when both agents are used in the same project.

## Install via npm (Recommended)

```bash
npx @thanhndpo/tanizy-qc-agent --project /path/to/project --dry-run   # preview
npx @thanhndpo/tanizy-qc-agent --project /path/to/project              # install to qc/
npx @thanhndpo/tanizy-qc-agent --project /path/to/project --placement root  # install to project root
```

## Install from Local Clone

```bash
node scripts/install.mjs --project /path/to/project --dry-run
node scripts/install.mjs --project /path/to/project
node scripts/install.mjs --project /path/to/project --placement root
```

## Install One Skill

A selective install changes only `qc/.agents/skills/<skill-name>` and does not copy or overwrite `AGENTS.md`:

```bash
node scripts/install.mjs --project /path/to/project --skill qc-gap-finder
node scripts/install.mjs --project /path/to/project --skill qc-design-test-cases --skill qc-run-playwright
```

Use `--force` only when you intentionally want to overwrite existing QC files in the target project:

```bash
node scripts/install.mjs --project /path/to/project --skill qc-gap-finder --force
```

## Manual Copy

macOS / Linux:

```bash
mkdir -p /path/to/project/qc/.agents/skills
cp -R core/skills/* /path/to/project/qc/.agents/skills/
cp adapters/codex/AGENTS.md /path/to/project/qc/AGENTS.md
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force C:\path\to\project\qc\.agents\skills
Copy-Item -Recurse core/skills/* C:\path\to\project\qc\.agents\skills\
Copy-Item adapters/codex/AGENTS.md C:\path\to\project\qc\AGENTS.md
```

## After Install

Open the project in Codex. `qc/AGENTS.md` provides routing rules for the QC skills, and installed skills live in `qc/.agents/skills/`. The installer automatically seeds the runtime context files (`qc/refs/system-context.md`, `qc/refs/bug-base.md`, `qc/refs/open-questions.md`); existing refs files are never overwritten unless `--force` is passed (use `--skip-refs` to skip seeding entirely).

## Material Layout (v0.4.0+)

QC materials live in per-feature subfolders, never in the `qc/` root:

| Material | Path |
|---|---|
| Gap reports | `qc/gap-reports/<feature>-gap-report.md` |
| Viewpoints | `qc/test-viewpoints/<feature>-viewpoints.md` |
| Test cases | `qc/test-cases/<feature>-test-cases.md` |
| Executions log | `qc/executions/<feature>-executions.md` |
| Test reports | `qc/reports/test-report-<feature>-<YYYY-MM-DD>.<ext>` |
| Shared refs | `qc/refs/*` (system context, bug base, OQ ledger) |

If you are upgrading from v0.3.x and already have `gap-report-*.md` or `qc/test-viewpoints.md` / `qc/test-cases.md` at the old locations, the agent tolerates them during transition but new materials follow the layout above.

## Updating the Codex Adapter

After upgrading, also refresh `qc/AGENTS.md` (copy `adapters/codex/AGENTS.md` over it) so the new `$qc-report-generator` routing entry is active. Reinstalling always copies the latest adapter automatically.
