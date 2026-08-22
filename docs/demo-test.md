# Demo Tanizy QC Agent

Use three small scenarios to verify direct Viewpoint readiness, explicit Gap
Analysis with no findings, and the spec-first stop path.

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

## 2. Scenario A: Direct-to-Viewpoint Login Scope

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
QC review docs/requirements/fs-login.md. Bỏ qua Gap Analysis, thực hiện Direct Source Check và thiết kế Viewpoints.
```

Expected checkpoints:

1. Scope Gate confirms `scope-key = fs-login`, `scope-code = LOG`, the requested phases, and `Readiness Route = DIRECT_SOURCE_CHECK`.
2. The Gap Analysis phase is `SKIP`; the Viewpoint header records `Gap Analysis = NOT_RUN` and `Parent Gap Revision = NOT_APPLICABLE`.
3. Direct Source Check returns `PASS` and `Design Gate = READY` because each in-scope behavior has a test item, input, observable outcome, and required rule.
4. The agent does not claim `No gaps` and does not create a Gap Report or OQ.
5. The agent drafts Viewpoints in chat.
6. No file is written until content and paths are approved.
7. The locked file is `qc/test-viewpoints/fs-login-viewpoints.md`.

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

## 3. Scenario B: Explicit Gap Analysis With No Findings

Use the same approved Login requirement and invoke:

```text
$qc-gap-finder
Review docs/requirements/fs-login.md và thực hiện Gap Analysis.
```

Expected result:

- `Readiness Route = GAP_ANALYSIS` and `Design Gate = READY`;
- The source inventory and coverage denominator show every in-scope item is testable;
- The Findings section states `None`;
- The OQ ledger remains unchanged;
- No placeholder Finding or OQ is created;
- A Gap Report is written only after its content and exact path are approved.

## 4. Scenario C: Missing Approval Workflow

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

## 5. Automation Export Check

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

## 6. Unsupported Playwright Authoring Check

Invoke:

```text
$qc-run-playwright
Build a reusable Playwright Test suite from the locked Login Test Cases.
```

Expected result:

- The skill returns `UNSUPPORTED_AUTOMATION_AUTHORING`;
- It explains that the current mode is `INTERACTIVE_EXECUTION_ONLY`;
- It does not open a browser, start an Execution Gate, or create
  `playwright.config.*`, `*.spec.ts`, fixtures, Page Objects, or step definitions;
- It references deferred enhancement `QC-AUTO-001`.

## 7. Installer Preservation Check

Customize these project-owned files:

- `qc/config/field-validation-checklist.md`
- `qc/config/ui-component-checklist.md`
- `qc/refs/system-context.md`
- `qc/refs/bug-base.md`
- `qc/open-questions.md`

Run a selective update with `--force`. Confirm all five files remain unchanged
and content outside the managed adapter block is preserved. Confirm
`qc/config/material-paths.md` exists exactly once as the shared contract and no
installed skill contains `references/material-paths.md`. Manual-result,
Playwright, and report skills must still retain `references/executions-log.md`.

For a PO coexistence check, start with an `AGENTS.md` that contains a PO managed block and project-specific instructions. Install QC, modify only the installed QC block to simulate an older package version, then update with `--force`. Confirm the PO block and project instructions remain byte-equivalent and there is exactly one current QC block.

## Acceptance Checklist

| Check | Expected |
|---|---|
| Skill discovery | Target-native root only |
| Runtime artifacts | `qc/` only |
| Scope naming | Same exact scope key across artifacts |
| Approval | Draft and exact paths approved before write |
| Readiness route | Gap Analysis is optional; `NOT_RUN` is never reported as `No gaps` |
| Spec gap | `STOP` or `PARTIAL`, no assumption-based TC |
| Test data | Concrete and source-backed |
| Expected Results | Natural language, observable, matched to Steps |
| Traceability | Source -> VP -> TC -> Run -> Report |
| Readiness | Static, eligibility, and runtime states remain separate |
| Installer update | Project-owned files preserved |
| PO + QC coexistence | PO block preserved; only marked QC block updated |
