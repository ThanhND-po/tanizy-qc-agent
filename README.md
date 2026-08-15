# Tanizy QC Agent

Tanizy QC Agent is a portable, explicitly invoked Quality Control workflow for
Codex, Gemini CLI, Claude Code, and Antigravity. It helps a Product Owner, QA
lead, or tester review approved requirements, manage specification gaps, design
traceable Test Viewpoints and Test Cases, prepare automation artifacts, execute
approved UI tests, and report evidence.

QC never starts automatically and never modifies requirement documents.

## Core Behavior

- Apply a spec-first gate before design. Missing actor, state, action, Test Data,
  or Expected Result blocks the affected scope.
- Use `READY`, `PARTIAL`, or `STOP` to separate source-backed work from blocked
  work.
- Treat silence as no decision. Record explicit decisions and their source in
  `qc/open-questions.md`.
- Draft content and exact paths first. Write only after user approval.
- Keep static validity, automation eligibility, and runtime readiness separate.
- Require a dedicated Execution Gate before browser or API actions.
- Preserve full traceability from requirement source to report evidence.

## Skills

| Skill | Responsibility |
|---|---|
| `qc-orchestrator` | Coordinate an approved multi-phase QC workflow |
| `qc-gap-finder` | Find gaps, Open Questions, and the design gate |
| `qc-design-viewpoints` | Design and lock source-backed Test Viewpoints |
| `qc-design-test-cases` | Design concrete, traceable Test Cases and coverage |
| `qc-export-gherkin` | Export eligible UI Test Cases as Gherkin specifications |
| `qc-export-postman` | Export eligible API Test Cases as Postman Collection v2.1 |
| `qc-run-playwright` | Execute locked runtime-ready UI Test Cases |
| `qc-report-generator` | Build evidence-backed stakeholder test reports |

## Source Structure

```text
tanizy-qc-agent/
├── core/
│   ├── skills/                       # canonical skill source
│   └── references/                   # canonical shared contract and checklist
├── refs-templates/                   # project-owned runtime seeds
├── adapters/                         # managed routing blocks per target
├── scripts/
│   ├── install.mjs
│   ├── validate.mjs
│   └── test-install.mjs
├── docs/
├── package.json
└── LICENSE
```

Update `core/` in this repository. Installed skill folders are generated copies,
not sources of truth.

## Target Project Layout

Package-managed skills use each agent's native project-root location. Runtime
QC artifacts use `qc/` only.

```text
project/
├── AGENTS.md, CLAUDE.md, or GEMINI.md  # existing content plus managed QC block
├── .agents/skills/qc-*/                # Codex and Antigravity
├── .claude/skills/qc-*/                # Claude Code
├── skills/qc-*/                        # Gemini CLI
└── qc/
    ├── config/
    │   ├── material-paths.md
    │   └── field-validation-checklist.md  # conditional for Test Case design
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

Never install skills under `qc/.agents/skills/`. Never create
`qc/refs/open-questions.md` or a shared `qc/qc-task.md`.

Read [the artifact contract](core/references/material-paths.md) for the complete
scope-key, naming, approval, readiness, and traceability rules.

## Install

Preview first:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --dry-run
```

Install all skills:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target gemini-cli --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target claude-code --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target antigravity --project /path/to/project
```

Install or update selected skills:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-viewpoints
```

Use `--force` to replace only selected package-managed skill folders, refresh
canonical contract copies across installed QC skills, and update the QC block in
the target adapter. Existing project-owned Open Questions, System Context, Bug
Base, and customized field checklist are always preserved.

Use `--skip-refs` when runtime references are managed separately.

## PO + QC Coexistence

The installer does not own the whole `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
It appends one marked QC block and, with `--force`, replaces only that block.
Existing PO instructions, project rules, and other managed blocks remain
outside QC ownership.

Recommended handoff:

1. PO creates or updates an approved spec.
2. The user explicitly invokes QC and supplies the exact source locator and
   approval state.
3. QC reads the spec without modifying it and applies the spec-first gate.
4. QC writes only separately approved artifacts under `qc/`.
5. Missing business decisions return as Gap Report and Open Questions for PO or
   stakeholder resolution.

The source may be inside the project or at another readable local or canonical
external locator. An external source is not copied into the project without
separate content and path approval. A PO handoff does not inherit QC write,
Lock, Execution, or Release Verdict approval.

The preservation guarantee applies when this QC installer writes the adapter.
Any other installer sharing the root adapter must use its own managed block. If
a legacy PO full `--force` update replaces the whole adapter, run the QC
installer again with `--force` to merge the current QC block back into the
preserved PO file. Prefer selective PO skill updates when no adapter refresh is
needed.

## Local Install

```bash
node scripts/install.mjs --target codex --project /path/to/project --dry-run
node scripts/install.mjs --target codex --project /path/to/project
```

`--project` must point to the project root, not its `qc/` directory. The
installer rejects an accidental nested runtime root.

## Legacy Layout Detection

The installer reports, but never deletes, these legacy paths:

- `qc/.agents/skills/`
- `qc/refs/open-questions.md`
- `qc/qc-task.md`
- `qc/material-paths.md`
- `qc/field-validation-checklist.md`
- `qc/AGENTS.md`

Install and validate the new layout before manually migrating or removing any
legacy file. Existing runtime artifacts may contain project decisions and must
not be deleted automatically. Follow the
[legacy migration mapping](docs/install-codex.md#legacy-layout) one scope at a
time.

## Typical Workflow

```text
1. Invoke $qc-orchestrator or one specific qc-* skill.
2. Confirm approved source files, scope key, stable scope code, and requested phases.
3. Run gap analysis and obtain READY, PARTIAL, or STOP.
4. Review and lock source-backed Test Viewpoints.
5. Review and lock concrete Test Cases and coverage totals.
6. Export or execute only eligible, unblocked cases after the required gate.
7. Generate a report from append-only Run IDs and evidence.
```

If release criteria or decision authority are missing, the report verdict is
`UNDETERMINED`, not an invented GO or NO-GO decision.

## Validation

```bash
npm run validate
npm run test:install
npm run pack:check
```

Validation covers skill frontmatter, naming, local references, installer
destinations, preservation semantics, collision preflight, packaged CLI
execution, force refresh, symlink safeguards, and all four targets.

## License

MIT License. See [LICENSE](LICENSE).
