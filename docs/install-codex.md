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

Open the project in Codex. `qc/AGENTS.md` provides routing rules for the QC skills, and installed skills live in `qc/.agents/skills/`. Before the first run, create the context files the gap finder uses: `qc/refs/system-context.md` and `qc/refs/bug-base.md` (templates are described in the `qc-gap-finder` skill references).
