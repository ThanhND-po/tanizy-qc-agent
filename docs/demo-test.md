# Demo Tanizy QC Agent

Use two small scenarios to verify both the normal path and the spec-first stop
path.

## 1. Install Into a Temporary Project

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/demo-project \
  --dry-run

node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/demo-project
```

Confirm:

- Skills exist at `.agents/skills/qc-*`;
- No skills exist at `qc/.agents/skills/`;
- The shared OQ ledger is `qc/open-questions.md`;
- No `qc/refs/open-questions.md` exists;
- Config files exist under `qc/config/`;
- The existing `AGENTS.md` content remains outside the managed QC block.

## 2. Scenario A: Source-Backed Login Scope

Create an approved requirement with explicit behavior:

```markdown
# Login

## AC-01

An active user submits a registered email and valid password. The system opens the Dashboard and creates an authenticated session.

## AC-02

When the password is invalid, the system remains on Login and displays error code `AUTH-001`.
```

Invoke:

```text
$qc-orchestrator
QC review docs/requirements/fs-login.md. Chạy gap analysis và Viewpoints trước.
```

Expected checkpoints:

1. Scope Gate confirms `scope-key = fs-login`, `scope-code = LOG`, and the requested phases.
2. Gap analysis returns `READY` or identifies exact non-blocking gaps.
3. The agent drafts Viewpoints in chat.
4. No file is written until content and paths are approved.
5. The locked file is `qc/test-viewpoints/fs-login-viewpoints.md`.

Continue with Test Case design only after the Viewpoint revision is locked.
Expected Test Case characteristics:

- Concrete synthetic Test Data;
- Numbered Steps and natural-language Expected Results;
- Exact source trace to AC-01 or AC-02;
- Canonical Automation Eligibility;
- Separate design and runtime readiness;
- Coverage totals with explicit denominators.

Expected path:

```text
qc/test-cases/fs-login-test-cases.md
```

## 3. Scenario B: Missing Approval Workflow

Create a source that says only:

```markdown
Managers can approve timesheets.
```

Invoke:

```text
$qc-gap-finder
Review docs/requirements/req-approve-timesheet.md và chuẩn bị cho Test Case design.
```

Expected result:

- Design gate is `STOP`;
- Gap report requests actor permissions, preconditions, initial state, action, expected outcome, Test Data rules, and the correct governing source;
- Unsupported coverage is `0/0`;
- OQs with `Blocks From Phase = DESIGN` are recorded in `qc/open-questions.md`;
- No Viewpoint, Test Case, Gherkin, Postman, or execution artifact is created.

## 4. Automation Export Check

For approved eligible TCs:

```text
$qc-export-gherkin
Export TC-LOG-001 after showing the exact write set.
```

Expected path:

```text
qc/automation/gherkin/fs-login/
├── login.feature
└── fs-login-gherkin-manifest.md
```

The manifest may state `STATIC_VALID`. It must not state `RUNTIME_READY` unless the BDD runner, step definitions, environment, auth, fixtures, and cleanup are verified.

## 5. Installer Preservation Check

Customize these project-owned files:

- `qc/config/field-validation-checklist.md`
- `qc/refs/system-context.md`
- `qc/refs/bug-base.md`
- `qc/open-questions.md`

Run a selective update with `--force`. Confirm all four files remain unchanged and content outside the managed adapter block is preserved. Confirm every updated skill still contains `references/material-paths.md`; manual-result, Playwright, and report skills must also retain `references/executions-log.md`.

For a PO coexistence check, start with an `AGENTS.md` that contains a PO managed block and project-specific instructions. Install QC, modify only the installed QC block to simulate an older package version, then update with `--force`. Confirm the PO block and project instructions remain byte-equivalent and there is exactly one current QC block.

## Acceptance Checklist

| Check | Expected |
|---|---|
| Skill discovery | Target-native root only |
| Runtime artifacts | `qc/` only |
| Scope naming | Same exact scope key across artifacts |
| Approval | Draft and exact paths approved before write |
| Spec gap | `STOP` or `PARTIAL`, no assumption-based TC |
| Test data | Concrete and source-backed |
| Expected Results | Natural language, observable, matched to Steps |
| Traceability | Source -> VP -> TC -> Run -> Report |
| Readiness | Static, eligibility, and runtime states remain separate |
| Installer update | Project-owned files preserved |
| PO + QC coexistence | PO block preserved; only marked QC block updated |
