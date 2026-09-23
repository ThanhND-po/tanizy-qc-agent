# Demo Tanizy QC Agent

Use four small scenarios to verify Input Boundary, direct Viewpoint readiness, explicit Gap Analysis with no findings, and the spec-first stop path.

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
- `viewpoint-discovery-guide.md` exists only under the installed `qc-design-viewpoints/references/` directory;
- `test-design-techniques.md` exists only under the installed `qc-design-test-cases/references/` directory;
- A clean install does not seed `field-validation-checklist.md` or `ui-component-checklist.md` under `qc/config/`;
- The existing `AGENTS.md` content remains outside the managed QC block.

## 2. Scenario: Missing Source Locator

Invoke a design skill with only a feature name:

```text
$qc-design-viewpoints
Thiết kế Viewpoint cho luồng Checkout.
```

Expected result:

- The skill returns `BLOCKED_INPUT` in chat before requirement or artifact discovery;
- The skill asks for an exact source locator, pasted requirement content, attachment, canonical URL, or explicit authorization for one bounded search root;
- The skill does not list or search the current project for a likely requirement source;
- The skill does not search parent directories, sibling projects, the broader workspace, the user home directory, or external locations;
- The skill does not request broader filesystem permission;
- If the user does not know the locator, the skill asks requirement clarification questions in chat and does not infer unstated behavior;
- No QC artifact is drafted, written, or locked.

## 3. Scenario A: Direct-to-Viewpoint Login Scope

Create an approved requirement with explicit behavior:

```markdown
# Login

## Test Objective and Product Risk

Active registered users can access the Dashboard through an authenticated
session. Invalid credentials must not create a session or grant access.

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
5. The agent records the Test Target, including business value, product risk, test objects, test items, actors, states, interactions, and impact boundary.
6. The agent uses the package-managed Viewpoint discovery guide and the optional project extension only in this phase to discover and decompose source-backed Viewpoints.
7. The agent drafts leaf Viewpoints and their parent trace in chat.
8. No file is written until content and paths are approved.
9. The locked file is `qc/test-viewpoints/fs-login-viewpoints.md`, and Test Cases may trace only to its locked leaf Viewpoints.

Continue with Test Case design only after the Viewpoint revision is locked.
Expected Test Case characteristics:

- Concrete synthetic Test Data;
- Numbered Steps and natural-language Expected Results;
- Exact source trace to AC-01 or AC-02;
- Explicit coverage items, coverage targets, selected Test Design Techniques, and rationale;
- Canonical Automation Eligibility;
- Separate design and runtime readiness;
- Coverage totals with explicit denominators.

The Test Case phase reads `test-design-techniques.md`.
It does not re-read the Viewpoint discovery guide, the optional discovery extension, or either legacy field/UI checklist to discover new Viewpoints.
A newly detected Viewpoint gap returns to `qc-design-viewpoints` for a new revision.

Expected path:

```text
qc/test-cases/fs-login-test-cases.md
```

## 4. Scenario B: Explicit Gap Analysis With No Findings

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

## 5. Scenario C: Missing Coupon Rules

Create a source that says only:

```markdown
Customers can apply a coupon during checkout.
```

Invoke:

```text
$qc-gap-finder
Review docs/requirements/req-apply-coupon.md và chuẩn bị cho Test Case design.
```

Expected result:

- Design gate is `STOP`;
- Gap report requests coupon eligibility, valid, invalid, and expired code behavior, stacking rules, discount calculation, applicable items, rejection outcomes, and the correct governing source;
- Unsupported coverage is `0/0`;
- OQs with `Blocks From Phase = DESIGN` are recorded in `qc/open-questions.md`;
- No Viewpoint, Test Case, Gherkin, Postman, or execution artifact is created.

## 6. Automation Export Check

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

The manifest may state `STATIC_VALID`.
It must not state `RUNTIME_READY` unless the BDD runner, step definitions, environment, auth, fixtures, and cleanup are verified.

## 7. Unsupported Playwright Authoring Check

Invoke:

```text
$qc-run-playwright
Build a reusable Playwright Test suite from the locked Login Test Cases.
```

Expected result:

- The skill returns `UNSUPPORTED_AUTOMATION_AUTHORING`;
- It explains that the current mode is `INTERACTIVE_EXECUTION_ONLY`;
- It does not open a browser, start an Execution Gate, or create `playwright.config.*`, `*.spec.ts`, fixtures, Page Objects, or step definitions;
- It references deferred enhancement `QC-AUTO-001`.

## 8. Installer Preservation and Material Ownership Check

Customize these active project-owned files:

- `qc/config/viewpoint-discovery-extension.md`
- `qc/refs/system-context.md`
- `qc/refs/bug-base.md`
- `qc/open-questions.md`

Also create legacy files with recognizable sentinel content:

- `qc/config/field-validation-checklist.md`
- `qc/config/ui-component-checklist.md`

Run a selective update with `--force`.
Confirm all six files remain unchanged, the installer warns about both legacy checklists, and content outside the managed adapter block is preserved.
Confirm `qc/config/material-paths.md` exists exactly once as the shared contract and no installed skill contains `references/material-paths.md`.
Confirm the package discovery guide exists only under `qc-design-viewpoints`, while Test Design Techniques exist only under `qc-design-test-cases`.
The installer must not automatically delete or migrate legacy checklist content.
The user reviews relevant project-specific discovery rules and merges them into `qc/config/viewpoint-discovery-extension.md` before separately approving archival or deletion.
Manual-result, Playwright, and report skills must still retain `references/executions-log.md`.

### Optional extension lifecycle check

Run these three scenarios for `qc-design-viewpoints`:

1. Leave `qc/config/viewpoint-discovery-extension.md` absent. Confirm the skill records `ABSENT`, continues with the package guide, does not return `BLOCKED_INPUT`, and does not ask for an extension locator. It may give a non-blocking suggestion that the user can add reusable project or domain prompts later.
2. Create an extension whose manifest clearly applies to the selected scope. Confirm the skill reads it only from the canonical path, records `PRESENT_APPLICABLE`, preserves its revision or hash, and maps only the `EXT-VDG-*` IDs actually used. Change the scope so the manifest no longer applies and confirm `PRESENT_NOT_APPLICABLE` is recorded without applying its prompts.
3. Supply an approved external checklist containing a reusable discovery prompt that the package guide does not represent. Confirm the skill drafts normalized extension content and provenance in chat, obtains explicit approval for the content and `qc/config/viewpoint-discovery-extension.md`, writes nothing before approval, then reruns discovery and records the resulting revision or hash and used IDs after the approved write.

If an existing extension has an unconfirmed revision or unclear scope applicability, confirm the skill records `PRESENT_UNCONFIRMED` and does not lock the Viewpoint artifact until the user confirms, excludes, or approves an update.

For a PO coexistence check, start with an `AGENTS.md` that contains a PO managed block and project-specific instructions.
Install QC, modify only the installed QC block to simulate an older package version, then update with `--force`.
Confirm the PO block and project instructions remain byte-equivalent and there is exactly one current QC block.

## Acceptance Checklist

| Check | Expected |
|---|---|
| Skill discovery | Target-native root only |
| Runtime artifacts | `qc/` only |
| Scope naming | Same exact scope key across artifacts |
| Approval | Draft and exact paths approved before write |
| Input Boundary | Missing locator returns `BLOCKED_INPUT`; no filesystem discovery or broader permission request |
| Readiness route | Gap Analysis is optional; `NOT_RUN` is never reported as `No gaps` |
| Spec gap | `STOP` or `PARTIAL`, no assumption-based TC |
| Viewpoint flow | Understand Test Target -> Discover -> Decompose -> lock leaf Viewpoints |
| Test Case flow | Locked leaf Viewpoints -> coverage item -> coverage target -> technique -> Test Case |
| Material ownership | Discovery guide and optional extension are Viewpoint-only; techniques are Test Case-only |
| Legacy design | Existing locked flat Viewpoints, Test Cases, and Runs are not rewritten; new TC design requires a new hierarchical Viewpoint revision |
| Test data | Concrete and source-backed |
| Expected Results | Natural language, observable, matched to Steps |
| Traceability | Source -> VP -> TC -> Run -> Report |
| Readiness | Static, eligibility, and runtime states remain separate |
| Installer update | Project-owned files preserved |
| PO + QC coexistence | PO block preserved; only marked QC block updated |
