# Tanizy QC Agent

Tanizy QC Agent is a portable Quality Control workflow package for AI coding agents. It picks up where a PO agent (such as [Tanizy PO Agent](https://github.com/ThanhND-po/tanizy-po-agent)) finishes — but only when you say so. The QC Agent is a **standalone Coordinator Actor**: it never runs automatically, never hooks into the PO workflow, and the PO agent never invokes it. You invoke the QC Actor explicitly, confirm the task scope, and the actor dispatches the concrete QC skills.

The Tanizy PO Agent remains a fully independent, public workflow. Users who install it will never be routed to QC, because this package contains no reference to the PO agent and the PO package contains no reference to this one; the only interface between them is the requirement files in the project, which the QC Agent reads but never modifies.

## Supported Tools

- Gemini CLI, Codex, Claude Code, and Antigravity. The installer selects the target adapter with `--target` and keeps the core QC skills portable across all four environments.

## What It Supports

- A Coordinator Actor entry point (`qc-orchestrator`) that reads approved requirement documents, proposes a task list, waits for your confirmation, and dispatches the downstream skills phase by phase.
- Gap finding in requirement documents against testing knowledge, the current system state, and the bug base, with Open Questions managed by status (OPEN / ANSWERED / RESOLVED / WAIVED) so unanswered questions never block materials creation.
- Test Viewpoint design with a mandatory joint review checkpoint: viewpoints are locked only after you confirm or adjust them.
- Test case design where every case traces to a Viewpoint and an Acceptance Criterion, delivered with a traceability matrix.
- Automation eligibility per test case (UI-AUTO / API-AUTO / BOTH / MANUAL) decided by explicit rules, surfaced in the TC table as `Automatable` (Yes/No/Partial) + `Auto Type` (UI/API/Unit/N/A) + `@Tags`.
- Execution status per test case (`NOT_RUN` → `PASS`/`FAIL`/`BLOCKED`/`SKIP`/`ERROR`) with `Test By` and `Test Date`, so the report generator always has results to aggregate.
- Gherkin export (`.feature` files) for UI-automation-eligible test cases.
- Test execution through the Playwright MCP with auto-heal, verified locators, and per-TC reporting (only on request).
- Postman collection v2.1 export for API-automation-eligible test cases.
- **Stakeholder-facing test report generation** (`qc-report-generator`): aggregates execution results into HTML (primary, with charts), DOCX, PPTX, Markdown, XLSX, or CSV reports — covering scope, results, coverage by viewpoint/AC, blocking/accepted/stakeholder-aware issues, confidence statement, and GO/NO-GO recommendation — saved to `qc/reports/`.

## Repository Structure

```text
tanizy-qc-agent/
├── core/skills/              # Canonical skill source of truth
│   ├── qc-orchestrator/      # Coordinator Actor entry point (human-invoked)
│   ├── qc-gap-finder/        # Gap analysis + Open Question management
│   ├── qc-design-viewpoints/ # Viewpoint design + user checkpoint
│   ├── qc-design-test-cases/ # Traceable test case design
│   ├── qc-export-gherkin/    # Gherkin export for Playwright
│   ├── qc-run-playwright/    # Execution via Playwright MCP (on request)
│   ├── qc-export-postman/    # Postman collection export
│   └── qc-report-generator/  # Stakeholder-facing test reports (HTML/PPTX/MD/XLSX/CSV)
├── core/references/material-paths.md # Single canonical global material-paths rule
├── refs-templates/           # Seeded runtime refs: system-context, bug-base, OQ ledger
├── adapters/                 # gemini-cli, codex, claude-code, antigravity entrypoints
├── scripts/install.mjs       # No-dependency installer
├── docs/                     # Install and demo guides
├── package.json
└── LICENSE
```

Do not edit copied skill files inside target projects as the source of truth. Update `core/skills/` in this repository, then reinstall into the target project.

## Install via npm (Recommended)

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project
```

Preview the install first:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --dry-run
```

The same command supports all planned adapters:

```bash
npx @thanhndpo/tanizy-qc-agent --target gemini-cli --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target claude-code --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target antigravity --project /path/to/project
```


### Install One Skill

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-gap-finder
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-design-viewpoints
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-design-test-cases
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-export-gherkin
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-run-playwright
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --skill qc-export-postman
```

Repeat `--skill` to select multiple skills. Selective installation copies only the named skill folders, their `references/material-paths.md` global-rule copy, `qc/material-paths.md`, and the selected target adapter.

## Update to Latest Version

```bash
npx @thanhndpo/tanizy-qc-agent@latest --project /path/to/project --force
```

Update one skill without replacing others:

```bash
npx @thanhndpo/tanizy-qc-agent@latest --project /path/to/project --skill qc-gap-finder --force
```

## Install from Local Clone

```bash
node scripts/install.mjs --target codex --project /path/to/project
node scripts/install.mjs --target codex --project /path/to/project --skill qc-gap-finder
node scripts/install.mjs --target codex --project /path/to/project
```

Add `--force` to overwrite existing files for the selected items. Use `--skip-refs` only when the runtime refs seed is managed elsewhere.

## Working Modes

### Mode 1 — Coordinator Actor (you invoke QC)

In any supported agent session, after requirement documents are approved, invoke the QC Actor explicitly:

```text
Gọi QC Actor review bộ tài liệu này:
- docs/requirements/feature-x-user-story.md
- docs/requirements/feature-x-api-spec.md
System context: qc/refs/system-context.md
Bug base: qc/refs/bug-base.md
Task: chạy gap analysis và viewpoints trước, phần còn lại tôi sẽ xác nhận sau.
```

The `qc-orchestrator` skill proposes the task list, waits for your confirmation, and dispatches the phase skills in order. The PO agent is never involved: it has no reference to QC and QC has no hook into it.

### Mode 2 — Independent use by testers

A tester installs only the skills they need and calls each skill directly:

```text
$qc-gap-finder            # analyze requirement files, manage open questions
$qc-design-viewpoints     # design viewpoints, review checkpoint
$qc-design-test-cases     # traceable test cases + matrix
$qc-export-gherkin        # UI-eligible TCs to .feature
$qc-run-playwright        # execute TCs via Playwright MCP (on request)
$qc-export-postman        # API-eligible TCs to Postman collection
$qc-report-generator      # test report for stakeholders (HTML/PPTX/MD/XLSX/CSV)
```

## Coexistence With Tanizy PO Agent

Install with `--target codex` to place skills under `.agents/skills/`, with `--target gemini-cli` under `skills/`, with `--target claude-code` under `.claude/skills/`, or with `--target antigravity` under `.agents/skills/`. All targets create `qc/material-paths.md`, and the same canonical reference is copied into every installed skill, so `qc-task.md` and `open-questions.md` follow the same global rule as gap and report materials. Both agents read the same requirement files; the read-only intake contract is the only interface between them, and nobody installing the public PO agent is ever routed to QC.

## Important Behavior

- The QC Agent never runs automatically; it starts only when a user explicitly invokes it.
- The agent asks in Vietnamese by default unless the project uses another language.
- The agent does not save generated artifacts until the user approves the content and confirms the path.
- Generated artifacts are saved in the target project, not inside installed skill folders.
- The QC Agent never modifies requirement documents produced by any other agent or workflow.
- Open questions that remain unanswered do not block materials creation; affected items are flagged with their OQ IDs.
- Automation export and test execution only happen on explicit user request.

## License

MIT License. See [LICENSE](LICENSE).
