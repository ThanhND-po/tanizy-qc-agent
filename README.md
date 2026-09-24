# Tanizy QC Agent

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

## English

Tanizy QC Agent is a portable, explicitly invoked Quality Control workflow for Codex, Gemini CLI, Claude Code, and Antigravity.
It helps a Product Owner, QA lead, or tester review approved requirements, manage specification gaps, design traceable Test Viewpoints and Test Cases, prepare automation artifacts, execute approved UI tests, record manual test results, and report outcomes with optional evidence.

QC never starts automatically and never modifies requirement documents.

### Core Behavior

- Apply a spec-first gate before design. Require a named test item, trigger or input, observable outcome, and relevant data or rule. Require actor, state, and preconditions only when the behavior depends on them.
- Allow either explicit Gap Analysis or a bounded Direct Source Check before Viewpoint design. Direct readiness does not mean that no gaps exist.
- Use `READY`, `PARTIAL`, or `STOP` to separate source-backed work from blocked work.
- Treat silence as no decision. Record explicit decisions and their source in `qc/open-questions.md`.
- Treat a Test Viewpoint as a source-backed test condition, not an executable Test Case. Understand the Test Target, discover and decompose Viewpoints, then lock source-backed leaf Viewpoints before Test Case Design starts.
- Keep Test Analysis and Test Case Design separate. `qc-design-viewpoints` owns discovery materials. `qc-design-test-cases` selects coverage items, coverage targets, and Test Design Techniques from the locked leaf Viewpoints; it does not run Viewpoint discovery again.
- Draft content and exact paths first. Write only after user approval.
- Keep static validity, automation eligibility, and runtime readiness separate.
- Report approved source-backed coverage with its numerator and denominator, and keep blocked, waived, runtime-ready, and executed scope separate. Never present a bare `100%` as complete product coverage.
- Require a dedicated Execution Gate before browser or API actions.
- Preserve full traceability from requirement source to report results and available evidence.

### Artifact Language Scope Gate

Confirm the reader-facing artifact language at the QC Scope Gate.
Use Vietnamese by default unless the user explicitly requests another language, and keep exact English technical and business terms, IDs, paths, fields, literals, and controlled values.
The language is a workflow decision for the current scope, not artifact metadata.
Do not add an artifact-language field to generated headers or infer a different language from prior sessions, machine memory, or a user profile.

### Test Case Authoring Quality

- Design every Test Case so a human can execute it before automation implementation exists.
- Treat one primary test objective per Test Case as a package authoring convention, while allowing multiple source-backed checkpoints for one transformation, transaction, interaction, output tuple, or state sequence.
- Split independent objectives that share only setup or workflow proximity. Do not split mechanically because data, outcomes, possible root causes, checkpoints, or transitions differ.
- Use Preconditions only for case-specific initial state. An existing approved Fixture Requirement ID may be referenced in Preconditions or Test Data for either manual or automated cases, but no Fixture Catalog or Fixture ID column is mandatory.
- Write Steps with an actor or role, action surface, concrete action, and observable checkpoint. Do not substitute generic preparation or observation wrappers for executable actions.
- Keep Expected Results limited to case-specific observable oracles, persisted state, audit evidence, and side effects.
- Reconcile every coverage claim to the Test Case actions and oracles that exercise it. Keep Viewpoint mapping, achieved design coverage, and runtime results separate.
- Review repeated Preconditions, Steps, and Expected Results before Lock, while allowing repetition that remains necessary and specific.
- Keep `UI-AUTO` as Automation Eligibility. It does not mean that the Test Case is runtime-ready or executed.

### Skills

| Skill | Responsibility |
|---|---|
| `qc-orchestrator` | Coordinate an approved multi-phase QC workflow |
| `qc-gap-finder` | Find gaps, Open Questions, and the design gate |
| `qc-design-viewpoints` | Understand the Test Target, discover and decompose testing angles, and lock source-backed leaf Test Viewpoints |
| `qc-design-test-cases` | Select coverage items, coverage targets, and Test Design Techniques from locked leaf Viewpoints, then design concrete, traceable Test Cases |
| `qc-export-gherkin` | Export eligible UI Test Cases as Gherkin specifications |
| `qc-export-postman` | Export eligible API Test Cases as Postman Collection v2.1 |
| `qc-record-manual-results` | Prepare and import XLSX, CSV, or Markdown manual runs, plus connected Google Sheets results |
| `qc-run-playwright` | Execute locked runtime-ready UI Test Cases |
| `qc-report-generator` | Build execution-backed stakeholder reports with optional evidence |

### Usage Routing

Use `qc-orchestrator` only when you explicitly want multiple QC phases to run as one gated workflow.
For a single task, invoke the specific skill directly.
A skill does not start a missing prerequisite phase automatically.
It stops and proposes the required handoff instead.

#### Route Map

```text
Approved requirement source
├── GAP_ANALYSIS -> qc-gap-finder -> Gap Report ┐
└── DIRECT_SOURCE_CHECK -------------------------┤
                                                ▼
                                     qc-design-viewpoints
                           Understand Test Target -> Discover -> Decompose
                                                │
                                      LOCKED leaf Viewpoints
                                                │
                                     qc-design-test-cases
              Coverage item -> Target -> Technique -> Primary objective -> TC
                          Actions and oracles -> Coverage reconciliation
                                       ├── qc-export-gherkin
                                       ├── qc-export-postman
                                       ├── qc-record-manual-results -> qc/executions/<scope-key>
                                       └── qc-run-playwright        -> qc/executions/<scope-key>

qc/executions/<scope-key> -> qc-report-generator
```

`qc-report-generator` may consume one or more approved manual or automated Run IDs.
Export and execution branches are optional and require explicit scope.
Gap Analysis is also optional.
If `DIRECT_SOURCE_CHECK` passes, record Gap Analysis as `NOT_RUN`, not as `No gaps`.
For `GAP_ANALYSIS`, downstream readiness depends on a current Gap Report revision with `Design Gate = READY` or `PARTIAL`, not on the Gap Report artifact state.

#### Routing Guide

| Your objective | Invoke | Required input or gate | Example prompt |
|---|---|---|---|
| Run several QC phases as one controlled workflow | `qc-orchestrator` | Approved source locator, requested phases, scope key, scope code, reader-facing language, and write set | `Use $qc-orchestrator to review the approved requirement at <path>. Run gap analysis, Viewpoint design, and Test Case design only.` |
| Find missing, ambiguous, or conflicting specification behavior | `qc-gap-finder` | Approved requirement source | `Use $qc-gap-finder to review <path> and identify specification gaps and Open Questions.` |
| Design testing angles after Gap Analysis | `qc-design-viewpoints` | Approved sources, current Gap Report with `Design Gate = READY` or `PARTIAL`, applicable Open Questions, the package discovery guide, and any approved project extension | `Use $qc-design-viewpoints to understand the Test Target, decompose source-backed leaf Viewpoints, and lock them for <scope-key> using the current Gap Report and its Design Gate.` |
| Design testing angles without Gap Analysis | `qc-design-viewpoints` | Approved sources, `DIRECT_SOURCE_CHECK`, the package discovery guide, and any approved project extension; the skill stops if design evidence is missing or conflicting | `Use $qc-design-viewpoints to run a Direct Source Check, understand the Test Target, and lock source-backed leaf Viewpoints for <scope-key> without Gap Analysis.` |
| Design concrete and reproducible Test Cases | `qc-design-test-cases` | Locked leaf Viewpoint revision, matching source artifacts, and the package Test Design Techniques material | `Use $qc-design-test-cases to define coverage items and targets, select techniques, and design Test Cases from the locked leaf Viewpoints for <scope-key>.` |
| Export UI Test Cases as Gherkin | `qc-export-gherkin` | Locked eligible UI Test Cases and approved export path | `Use $qc-export-gherkin to export the eligible locked UI Test Cases for <scope-key>.` |
| Export API Test Cases as Postman | `qc-export-postman` | Locked eligible API Test Cases plus endpoint and auth contracts | `Use $qc-export-postman to export the eligible locked API Test Cases for <scope-key>.` |
| Prepare a manual workbook or import completed manual results | `qc-record-manual-results` | Locked Test Cases for `PREPARE`; approved completed source and destination for `IMPORT` | `Use $qc-record-manual-results in PREPARE mode for the locked Test Cases in <scope-key>.` |
| Execute approved UI Test Cases with Playwright | `qc-run-playwright` | Locked runtime-ready Test Cases and approved Execution Gate | `Use $qc-run-playwright to execute <TC IDs> in <environment> with the approved fixtures and cleanup.` |
| Generate an execution-backed test report | `qc-report-generator` | Locked Test Cases and Viewpoints, one or more Run IDs, audience, format, and assessment policy; release criteria and decision authority only for a release verdict | `Use $qc-report-generator to create a <format> report for audience <audience> from Run IDs <IDs> in <scope-key>.` |

The placeholders `<path>`, `<scope-key>`, `<TC IDs>`, `<environment>`, `<IDs>`, `<format>`, and `<audience>` must be replaced with exact project values.
Approval for one phase does not imply approval for the next phase.

#### Current Capability Boundaries

| Skill | Current usable scope | Not implemented in this package |
|---|---|---|
| `qc-export-gherkin` | Produce traceable, static `.feature` specifications | BDD runner, step definitions, selectors, Playwright source code, and execution |
| `qc-export-postman` | Produce a static Collection v2.1 and manifest when the complete API contract exists | Environment provisioning, secrets, Newman execution, CI, and a bundled deterministic generator or schema validator |
| `qc-run-playwright` | Interactively execute locked Test Cases when a compatible browser automation tool and every Execution Gate input are available | Creating or maintaining `*.spec.ts`, Playwright config, fixtures, Page Objects, BDD bindings, or a reusable CI suite |
| `qc-report-generator` | Produce Markdown, CSV, or self-contained HTML with ordinary file capabilities | Portable DOCX, PPTX, and XLSX generation without a compatible target-specific generation and rendering tool |

A Manual QC does not need automation coding knowledge to request an approved interactive run, but must still provide or approve the environment, role, Test Data, side effects, retry, cleanup, and Evidence Policy.
A request to build a reusable Playwright automation suite is currently unsupported and must return `UNSUPPORTED_AUTOMATION_AUTHORING`, not a placeholder script.
Track this future work as `QC-AUTO-001`.
Related deferred items are `QC-EXPORT-001` and `QC-REPORT-001`.

### Source Structure

```text
tanizy-qc-agent/
├── core/
│   ├── skills/                       # canonical skill source and skill-owned materials
│   └── references/                   # canonical shared artifact contract
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

Update `core/` in this repository.
Installed skill folders are generated copies, not sources of truth.

### Target Project Layout

Package-managed skills use each agent's native project-root location.
Runtime QC artifacts use `qc/` only.

```text
project/
├── AGENTS.md, CLAUDE.md, or GEMINI.md  # existing content plus managed QC block
├── .agents/skills/qc-*/                # Codex and Antigravity
├── .claude/skills/qc-*/                # Claude Code
├── skills/qc-*/                        # Gemini CLI
└── qc/
    ├── config/
    │   ├── material-paths.md                 # one shared package-managed contract
    │   └── viewpoint-discovery-extension.md  # optional, project-owned discovery rules
    ├── refs/
    ├── open-questions.md
    ├── tasks/
    ├── gap-reports/                    # optional, only for approved Gap Analysis
    ├── test-viewpoints/
    ├── test-cases/
    ├── automation/
    ├── execution-inputs/
    ├── executions/
    ├── evidence/
    └── reports/
```

The package-managed discovery guide exists only at `<skill-root>/qc-design-viewpoints/references/viewpoint-discovery-guide.md`.
The package-managed Test Design Techniques material exists only at `<skill-root>/qc-design-test-cases/references/test-design-techniques.md`.
The optional `qc/config/viewpoint-discovery-extension.md` supplements Viewpoint discovery with project-specific knowledge.
It does not define Test Case coverage or techniques.
The guide and extension are discovery heuristics, not requirement, business-rule, or Expected Result sources.
If the extension is absent, Viewpoint design continues with the package guide and may give a non-blocking suggestion to add reusable project or domain prompts later; it does not ask for a locator or return `BLOCKED_INPUT` solely because the optional file is missing.
When an extension candidate exists, the agent can draft the required manifest, prompt rows, and provenance, but writes the canonical project file only after approval of the exact content and path.

Never install skills under `qc/.agents/skills/`.
Never create `qc/refs/open-questions.md` or a shared `qc/qc-task.md`.

Read [the artifact contract](core/references/material-paths.md) for the complete scope-key, naming, approval, readiness, and traceability rules.

### Install

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

Use `--force` to replace only selected package-managed skill folders, refresh the single shared contract at `qc/config/material-paths.md`, retire legacy per-skill copies of that contract in the selected QC skills, and update the QC block in the target adapter.
A full update retires all old copies.
Existing project-owned Open Questions, System Context, Bug Base, the optional Viewpoint discovery extension, and legacy field or UI component checklists are always preserved.
The installer warns when it finds either legacy checklist; it never deletes or overwrites them.
Review their project-specific customization and merge relevant discovery rules into `qc/config/viewpoint-discovery-extension.md`.

Existing locked flat Viewpoint, Test Case, and execution artifacts are not rewritten.
Create and approve a new hierarchical Viewpoint revision before new Test Case Design.
Existing locked Test Cases may continue to export, execute, and report with their original `VP ID` trace, disclosed as legacy flat coverage.

Use `--skip-refs` when runtime references are managed separately.

### PO + QC Coexistence

Use [Tanizy PO Agent](https://github.com/ThanhND-po/tanizy-po-agent) as the companion package for discovery, approved requirement artifacts, diagrams, mockups, and meeting memos.

The installer does not own the whole `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
It appends one marked QC block and, with `--force`, replaces only that block.
Existing PO instructions, project rules, and other managed blocks remain outside QC ownership.

Recommended handoff:

1. PO creates or updates an approved spec.
2. The user explicitly invokes QC and supplies the exact source locator and approval state.
3. QC reads the spec without modifying it and applies the spec-first gate.
4. QC writes only separately approved artifacts under `qc/`.
5. Missing business decisions return as Gap Report and Open Questions for PO or stakeholder resolution.

PO Open maps to QC `OPEN`.
PO Answered maps to QC `ANSWERED` until the governing source is updated.
PO Deferred remains QC `OPEN` unless an authorized person explicitly accepts the documented risk.
QC uses `RESOLVED` only with the exact updated source reference.
Silence never changes status.

The source may be inside the project or at another readable local or canonical external locator.
QC reads that source only when the user supplies its exact locator or explicitly approves one bounded search root.
A feature name, module name, scope key, keyword, or prior project knowledge does not authorize source discovery.
When a required input is missing, QC returns `BLOCKED_INPUT` in chat instead of searching the project, broader workspace, parent or sibling directories, the user home directory, or requesting broader filesystem permission.
If the user does not know the locator, QC asks requirement clarification questions in chat and does not infer unstated behavior.
An external source is not copied into the project without separate content and path approval.
A PO handoff does not inherit QC write, Lock, Manual Result, Execution, or Release Verdict approval.

The preservation guarantee applies when every package sharing the root adapter uses its own managed block.
Current Tanizy PO installers preserve the QC block and project-owned instructions.
If an older PO installer replaces the whole adapter, update PO first, then run the QC installer with `--force` to restore the current QC block.
Prefer selective skill updates when no adapter refresh is needed.

### Local Install

```bash
node scripts/install.mjs --target codex --project /path/to/project --dry-run
node scripts/install.mjs --target codex --project /path/to/project
```

`--project` must point to the project root, not its `qc/` directory.
The installer rejects an accidental nested runtime root.

### Legacy Layout Detection

The installer reports, but never deletes, these legacy paths:

- `qc/.agents/skills/`
- `qc/refs/open-questions.md`
- `qc/qc-task.md`
- `qc/material-paths.md`
- `qc/field-validation-checklist.md`
- `qc/ui-component-checklist.md`
- `qc/config/field-validation-checklist.md`
- `qc/config/ui-component-checklist.md`
- `qc/AGENTS.md`

Install and validate the new layout before manually migrating or removing any legacy file.
Existing runtime artifacts may contain project decisions and must not be deleted automatically.
Follow the [legacy migration mapping](docs/install-codex.md#legacy-layout) one scope at a time.

### Typical Workflow

```text
1. Invoke $qc-orchestrator or one specific qc-* skill.
2. Confirm approved source files, scope key, stable scope code, requested phases, and reader-facing artifact language.
3. Select `GAP_ANALYSIS` or `DIRECT_SOURCE_CHECK` as the Viewpoint readiness route.
4. Obtain `READY`, `PARTIAL`, or `STOP` from Gap Analysis, or `PASS` and
   `READY` from the Direct Source Check.
5. Understand the Test Target, including business value, product risk, test
   objects, test items, users, states, interactions, and impact boundaries.
6. Use the package discovery guide and any approved project extension to
   discover and decompose Viewpoints, then review and lock source-backed leaf
   Viewpoints.
7. From the locked leaf Viewpoints, define coverage items and coverage targets,
   select suitable Test Design Techniques, design Test Cases with one primary
   objective and coherent checkpoints, then reconcile every claim to actions
   and oracles before review and Lock. Do not run Viewpoint discovery again in
   this phase.
8. Offer an optional XLSX manual run export through `qc-record-manual-results`.
9. Import completed manual results, or execute eligible cases through an
   approved runtime skill.
10. Generate a report from append-only Run IDs and the approved Evidence Policy.
```

For XLSX, CSV, and Markdown creation and import, `qc-record-manual-results` uses its bundled Node.js scripts on every target.
Every format places locked Test Title immediately after TC ID for fast scanning.
Every format also preserves the locked design context, including Preconditions, Test Data, Steps, Expected Results, `VP ID`, `Source Trace`, and `Automation Eligibility`, and IMPORT rejects changed supplied values.
This baseline does not depend on a model-specific spreadsheet skill, Microsoft Excel, Python, a connector, or a network-installed library.
A target's native spreadsheet capability may additionally inspect, render, or enhance an XLSX workbook.
CSV and Markdown are used only when the user explicitly selects them.

If release criteria or decision authority are missing, the report verdict is `UNDETERMINED`, not an invented GO or NO-GO decision.

### Validation

```bash
npm run validate
npm run test:install
npm run pack:check
```

Validation covers skill frontmatter, naming, local references, installer destinations, preservation semantics, collision preflight, packaged CLI execution, force refresh, symlink safeguards, and all four targets.

### License

MIT License.
See [LICENSE](LICENSE).

[Tiếng Việt](#tiếng-việt)

---

## Tiếng Việt

Tanizy QC Agent là một workflow Quality Control portable, chỉ được kích hoạt khi có yêu cầu rõ ràng, dành cho Codex, Gemini CLI, Claude Code và Antigravity.
Workflow hỗ trợ Product Owner, QA lead hoặc tester review requirement đã được phê duyệt, quản lý specification gap, thiết kế Test Viewpoint và Test Case có traceability, chuẩn bị automation artifact, thực thi UI test đã được phê duyệt, ghi nhận kết quả manual test và báo cáo kết quả kèm evidence tùy chọn.

QC không tự động bắt đầu và không chỉnh sửa requirement document.

### Hành vi cốt lõi

- Áp dụng spec-first gate trước khi thiết kế. Source phải có test item, trigger hoặc input, observable outcome và data hoặc rule liên quan. Chỉ bắt buộc actor, state và precondition khi behavior phụ thuộc vào các yếu tố đó.
- Cho phép chọn Gap Analysis rõ ràng hoặc Direct Source Check có giới hạn trước khi thiết kế Viewpoint. Direct readiness không có nghĩa là requirement không còn gap.
- Dùng `READY`, `PARTIAL` hoặc `STOP` để tách phần có source rõ ràng khỏi phần đang bị block.
- Không xem việc không phản hồi là một quyết định. Ghi lại quyết định rõ ràng và source của quyết định trong `qc/open-questions.md`.
- Xem Test Viewpoint là test condition có source trace, không phải Test Case có thể thực thi. Cần hiểu Test Target, tìm và phân rã Viewpoint, sau đó lock các leaf Viewpoint có source trace trước khi bắt đầu Test Case Design.
- Tách biệt Test Analysis và Test Case Design. `qc-design-viewpoints` sở hữu material discovery. `qc-design-test-cases` chọn coverage item, coverage target và Test Design Technique từ locked leaf Viewpoint, không chạy lại Viewpoint discovery.
- Draft nội dung và exact path trước. Chỉ ghi file sau khi người dùng phê duyệt.
- Tách biệt static validity, automation eligibility và runtime readiness.
- Báo approved source-backed coverage kèm numerator và denominator, đồng thời tách riêng blocked, waived, runtime-ready và executed scope. Không dùng `100%` đơn lẻ như complete product coverage.
- Yêu cầu Execution Gate riêng trước khi thực hiện browser hoặc API action.
- Duy trì đầy đủ traceability từ requirement source đến report result và evidence hiện có.

### Artifact Language Scope Gate

Xác nhận ngôn ngữ cho nội dung diễn giải tại QC Scope Gate.
Mặc định sử dụng tiếng Việt trừ khi người dùng yêu cầu rõ ngôn ngữ khác, đồng thời giữ nguyên English technical và business terms, IDs, paths, fields, literals và controlled values.
Language là quyết định workflow của scope hiện tại, không phải metadata của artifact.
Không thêm artifact-language field vào generated header và không suy ra language khác từ prior session, machine memory hoặc user profile.

### Chất lượng nội dung Test Case

- Thiết kế mọi Test Case để human có thể thực hiện trước khi có automation implementation.
- Xem one primary test objective per Test Case là authoring convention của package, đồng thời cho phép nhiều source-backed checkpoint cùng chứng minh một transformation, transaction, interaction, output tuple hoặc state sequence.
- Tách các objective độc lập chỉ đang dùng chung setup hoặc gần nhau trong workflow. Không split máy móc chỉ vì data, outcome, possible root cause, checkpoint hoặc transition khác nhau.
- Chỉ dùng Preconditions cho case-specific initial state. Có thể tham chiếu Fixture Requirement ID đã được phê duyệt trong Preconditions hoặc Test Data cho cả manual và automated case, nhưng không bắt buộc Fixture Catalog hoặc cột Fixture ID.
- Steps phải có actor hoặc role, action surface, hành động cụ thể và observable checkpoint. Không dùng generic preparation hoặc observation wrapper thay cho executable action.
- Expected Results chỉ giữ case-specific observable oracle, persisted state, audit evidence và side effect.
- Đối soát mọi coverage claim với Test Case action và oracle thực sự exercise item đó. Tách riêng Viewpoint mapping, achieved design coverage và runtime result.
- Review Preconditions, Steps và Expected Results bị lặp trước Lock Gate, nhưng vẫn cho phép nội dung lặp khi cần thiết và cụ thể.
- Giữ `UI-AUTO` làm Automation Eligibility. Giá trị này không có nghĩa Test Case đã runtime-ready hoặc executed.

### Danh sách skill

| Skill | Trách nhiệm |
|---|---|
| `qc-orchestrator` | Điều phối QC workflow nhiều phase đã được phê duyệt |
| `qc-gap-finder` | Tìm specification gap, Open Question và xác định design gate |
| `qc-design-viewpoints` | Hiểu Test Target, tìm và phân rã góc kiểm thử, sau đó lock leaf Test Viewpoint có source trace |
| `qc-design-test-cases` | Chọn coverage item, coverage target và Test Design Technique từ locked leaf Viewpoint, sau đó thiết kế Test Case cụ thể, có traceability |
| `qc-export-gherkin` | Export UI Test Case đủ điều kiện thành Gherkin specification |
| `qc-export-postman` | Export API Test Case đủ điều kiện thành Postman Collection v2.1 |
| `qc-record-manual-results` | Chuẩn bị và import manual run từ XLSX, CSV hoặc Markdown, cùng kết quả từ Google Sheets đã kết nối |
| `qc-run-playwright` | Thực thi locked runtime-ready UI Test Case |
| `qc-report-generator` | Tạo stakeholder report từ execution result và evidence tùy chọn |

### Hướng dẫn chọn skill

Chỉ dùng `qc-orchestrator` khi bạn yêu cầu rõ nhiều QC phase trong cùng một workflow có gate.
Nếu chỉ có một đầu việc, hãy gọi trực tiếp skill tương ứng.
Skill không tự chạy phase prerequisite còn thiếu.
Skill sẽ dừng và đề xuất handoff tới phase cần thiết.

#### Sơ đồ route

```text
Requirement source đã được phê duyệt
├── GAP_ANALYSIS -> qc-gap-finder -> Gap Report ┐
└── DIRECT_SOURCE_CHECK -------------------------┤
                                                ▼
                                     qc-design-viewpoints
                              Hiểu Test Target -> Tìm -> Phân rã
                                                │
                                      LOCKED leaf Viewpoint
                                                │
                                     qc-design-test-cases
              Coverage item -> Target -> Technique -> Primary objective -> TC
                          Action và oracle -> Coverage reconciliation
                                       ├── qc-export-gherkin
                                       ├── qc-export-postman
                                       ├── qc-record-manual-results -> qc/executions/<scope-key>
                                       └── qc-run-playwright        -> qc/executions/<scope-key>

qc/executions/<scope-key> -> qc-report-generator
```

`qc-report-generator` có thể sử dụng một hoặc nhiều Run ID từ kết quả manual hoặc automated đã được phê duyệt.
Các nhánh export và execution là tùy chọn và phải được yêu cầu rõ trong scope.
Gap Analysis cũng là phase tùy chọn.
Nếu `DIRECT_SOURCE_CHECK` pass, phải ghi Gap Analysis là `NOT_RUN`, không được ghi `No gaps`.
Với `GAP_ANALYSIS`, downstream readiness phụ thuộc vào current Gap Report revision có `Design Gate = READY` hoặc `PARTIAL`, không phụ thuộc vào artifact state của Gap Report.

#### Bảng chọn skill

| Mục tiêu | Skill cần gọi | Input hoặc gate bắt buộc | Prompt mẫu |
|---|---|---|---|
| Thực hiện nhiều QC phase trong một workflow có kiểm soát | `qc-orchestrator` | Requirement source đã được phê duyệt, danh sách phase, scope key, scope code, reader-facing language và write set | `Dùng $qc-orchestrator để review requirement đã được phê duyệt tại <path>. Chỉ thực hiện Gap Analysis, thiết kế Test Viewpoint và thiết kế Test Case.` |
| Tìm behavior còn thiếu, chưa rõ hoặc mâu thuẫn trong specification | `qc-gap-finder` | Requirement source đã được phê duyệt | `Dùng $qc-gap-finder để review <path>, xác định specification gap và tạo Open Question.` |
| Thiết kế các góc kiểm thử sau Gap Analysis | `qc-design-viewpoints` | Source đã được phê duyệt, current Gap Report có `Design Gate = READY` hoặc `PARTIAL`, Open Question liên quan, package discovery guide và project extension đã được phê duyệt nếu có | `Dùng $qc-design-viewpoints để hiểu Test Target, phân rã và lock leaf Viewpoint có source trace cho <scope-key> dựa trên current Gap Report và Design Gate của file.` |
| Thiết kế các góc kiểm thử không chạy Gap Analysis | `qc-design-viewpoints` | Source đã được phê duyệt, `DIRECT_SOURCE_CHECK`, package discovery guide và project extension đã được phê duyệt nếu có; skill sẽ dừng nếu thiếu hoặc mâu thuẫn design evidence | `Dùng $qc-design-viewpoints để thực hiện Direct Source Check, hiểu Test Target và lock leaf Viewpoint có source trace cho <scope-key> mà không chạy Gap Analysis.` |
| Thiết kế Test Case cụ thể và có thể tái thực hiện | `qc-design-test-cases` | Locked leaf Viewpoint revision, các source artifact tương ứng và package Test Design Techniques material | `Dùng $qc-design-test-cases để xác định coverage item và target, chọn technique và thiết kế Test Case từ locked leaf Viewpoint của <scope-key>.` |
| Export UI Test Case sang Gherkin | `qc-export-gherkin` | Locked UI Test Case đủ điều kiện và export path đã được phê duyệt | `Dùng $qc-export-gherkin để export các locked UI Test Case đủ điều kiện của <scope-key>.` |
| Export API Test Case sang Postman | `qc-export-postman` | Locked API Test Case đủ điều kiện, endpoint contract và auth contract | `Dùng $qc-export-postman để export các locked API Test Case đủ điều kiện của <scope-key>.` |
| Chuẩn bị workbook manual hoặc import kết quả manual đã thực hiện | `qc-record-manual-results` | Locked Test Case cho `PREPARE`; completed result source và destination đã được phê duyệt cho `IMPORT` | `Dùng $qc-record-manual-results ở PREPARE mode cho locked Test Case của <scope-key>.` |
| Thực thi UI Test Case đã được phê duyệt bằng Playwright | `qc-run-playwright` | Locked runtime-ready Test Case và Execution Gate đã được phê duyệt | `Dùng $qc-run-playwright để thực thi <TC IDs> trên <environment> với fixture và cleanup đã được phê duyệt.` |
| Tạo Test Report từ execution evidence | `qc-report-generator` | Locked Test Case và Viewpoint, một hoặc nhiều Run ID, audience, format và assessment policy; chỉ cần release criteria và decision authority khi yêu cầu release verdict | `Dùng $qc-report-generator để tạo report định dạng <format> cho <audience> từ các Run ID <IDs> thuộc <scope-key>.` |

Các placeholder `<path>`, `<scope-key>`, `<TC IDs>`, `<environment>`, `<IDs>`, `<format>` và `<audience>` phải được thay bằng giá trị chính xác của project.
Phê duyệt một phase không có nghĩa là đã phê duyệt phase tiếp theo.

#### Giới hạn capability hiện tại

| Skill | Scope hiện có thể sử dụng | Chưa được triển khai trong package |
|---|---|---|
| `qc-export-gherkin` | Tạo `.feature` specification tĩnh, có traceability | BDD runner, step definition, selector, Playwright source code và execution |
| `qc-export-postman` | Tạo Collection v2.1 và manifest tĩnh khi có đầy đủ API contract | Provision environment, secret, chạy Newman, CI và bundled deterministic generator hoặc schema validator |
| `qc-run-playwright` | Thực thi tương tác locked Test Case khi có browser automation tool tương thích và đủ input của Execution Gate | Tạo hoặc maintain `*.spec.ts`, Playwright config, fixture, Page Object, BDD binding hoặc reusable CI suite |
| `qc-report-generator` | Tạo Markdown, CSV hoặc self-contained HTML bằng file capability thông thường | Tạo DOCX, PPTX và XLSX portable khi target không có generation và rendering tool tương thích |

Manual QC không cần biết code automation để yêu cầu một interactive run đã được phê duyệt, nhưng vẫn phải cung cấp hoặc phê duyệt environment, role, Test Data, side effect, retry, cleanup và Evidence Policy.
Yêu cầu build reusable Playwright automation suite hiện chưa được hỗ trợ và phải trả về `UNSUPPORTED_AUTOMATION_AUTHORING`, không được tạo placeholder script.
Ghi nhận enhancement tương lai này bằng `QC-AUTO-001`.
Hai nội dung deferred liên quan là `QC-EXPORT-001` và `QC-REPORT-001`.

### Cấu trúc source

```text
tanizy-qc-agent/
├── core/
│   ├── skills/                       # source chính thức của skill và material riêng của skill
│   └── references/                   # shared artifact contract chính thức
├── refs-templates/                   # runtime seed thuộc quyền sở hữu của project
├── adapters/                         # managed routing block theo từng target
├── scripts/
│   ├── install.mjs
│   ├── validate.mjs
│   └── test-install.mjs
├── docs/
├── package.json
└── LICENSE
```

Chỉ cập nhật `core/` trong repository này.
Các installed skill folder là bản được generate, không phải source of truth.

### Cấu trúc target project

Package-managed skill sử dụng project-root location tương ứng của từng agent.
Runtime QC artifact chỉ được lưu trong `qc/`.

```text
project/
├── AGENTS.md, CLAUDE.md, hoặc GEMINI.md  # nội dung hiện có và managed QC block
├── .agents/skills/qc-*/                  # Codex và Antigravity
├── .claude/skills/qc-*/                  # Claude Code
├── skills/qc-*/                          # Gemini CLI
└── qc/
    ├── config/
    │   ├── material-paths.md                 # một shared package-managed contract
    │   └── viewpoint-discovery-extension.md  # tùy chọn, project-owned discovery rule
    ├── refs/
    ├── open-questions.md
    ├── tasks/
    ├── gap-reports/                    # tùy chọn, chỉ dùng khi Gap Analysis được phê duyệt
    ├── test-viewpoints/
    ├── test-cases/
    ├── automation/
    ├── execution-inputs/
    ├── executions/
    ├── evidence/
    └── reports/
```

Package-managed discovery guide chỉ tồn tại tại `<skill-root>/qc-design-viewpoints/references/viewpoint-discovery-guide.md`.
Package-managed Test Design Techniques material chỉ tồn tại tại `<skill-root>/qc-design-test-cases/references/test-design-techniques.md`.
File `qc/config/viewpoint-discovery-extension.md` là tùy chọn, dùng để bổ sung project-specific knowledge cho Viewpoint discovery.
File này không định nghĩa coverage hoặc technique của Test Case.
Guide và extension chỉ là discovery heuristic, không phải source của requirement, business rule hoặc Expected Result.
Nếu extension chưa tồn tại, Viewpoint design tiếp tục dùng package guide và chỉ có thể đưa ra gợi ý không blocking để bổ sung reusable project hoặc domain prompt sau; Agent không hỏi locator hoặc trả `BLOCKED_INPUT` chỉ vì thiếu optional file này.
Khi có extension candidate, Agent có thể draft manifest, prompt row và provenance theo format quy định, nhưng chỉ ghi canonical project file sau khi exact content và path được phê duyệt.

Không cài đặt skill trong `qc/.agents/skills/`.
Không tạo `qc/refs/open-questions.md` hoặc file dùng chung `qc/qc-task.md`.

Đọc [artifact contract](core/references/material-paths.md) để biết đầy đủ quy tắc về scope-key, naming, approval, readiness và traceability.

### Cài đặt

Preview trước:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project --dry-run
```

Cài đặt toàn bộ skill:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target gemini-cli --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target claude-code --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target antigravity --project /path/to/project
```

Cài đặt hoặc cập nhật một số skill được chọn:

```bash
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-viewpoints
```

Dùng `--force` để chỉ thay thế các package-managed skill folder đã chọn, refresh shared contract tại `qc/config/material-paths.md`, retire các bản contract cũ nằm trong từng QC skill đã chọn và cập nhật QC block trong target adapter.
Full update sẽ retire toàn bộ bản cũ.
Open Questions, System Context, Bug Base, optional Viewpoint discovery extension và legacy field hoặc UI component checklist do project sở hữu luôn được bảo toàn.
Installer cảnh báo khi phát hiện legacy checklist, không tự xóa hoặc ghi đè.
Cần review project-specific customization và merge discovery rule còn phù hợp vào `qc/config/viewpoint-discovery-extension.md`.

Không rewrite locked Viewpoint dạng flat, Test Case hoặc execution artifact đã có.
Cần tạo và phê duyệt Viewpoint revision mới có hierarchy trước khi thiết kế Test Case mới.
Locked Test Case hiện có vẫn có thể export, execute và report với `VP ID` gốc, đồng thời phải ghi rõ đây là legacy flat coverage.

Dùng `--skip-refs` khi runtime reference được quản lý riêng.

### PO và QC cùng tồn tại

Dùng [Tanizy PO Agent](https://github.com/ThanhND-po/tanizy-po-agent) làm companion package cho discovery, approved requirement artifact, diagram, mockup và meeting memo.

Installer không sở hữu toàn bộ `AGENTS.md`, `CLAUDE.md` hoặc `GEMINI.md`.
Installer append một QC block có marker và khi dùng `--force`, chỉ thay thế block đó.
PO instruction, project rule và managed block hiện có vẫn nằm ngoài quyền sở hữu của QC.

Handoff được đề xuất:

1. PO tạo hoặc cập nhật spec đã được phê duyệt.
2. Người dùng gọi QC rõ ràng, đồng thời cung cấp exact source locator và trạng thái phê duyệt.
3. QC đọc spec, không chỉnh sửa spec và áp dụng spec-first gate.
4. QC chỉ ghi các artifact đã được phê duyệt riêng trong `qc/`.
5. Business decision còn thiếu được đưa vào Gap Report và Open Questions để PO hoặc stakeholder xử lý.

PO Open được map thành QC `OPEN`.
PO Answered được map thành QC `ANSWERED` cho đến khi governing source được cập nhật.
PO Deferred vẫn là QC `OPEN`, trừ khi người có thẩm quyền chấp nhận rõ documented risk.
QC chỉ dùng `RESOLVED` khi có exact updated source reference.
Việc không phản hồi không làm thay đổi status.

Source có thể nằm trong project, tại một local path có thể đọc hoặc canonical external locator.
QC chỉ đọc source đó khi người dùng cung cấp exact locator hoặc phê duyệt rõ một bounded search root.
Tên feature, module, scope key, keyword hoặc prior project knowledge không phải là quyền cho phép source discovery.
Khi thiếu input bắt buộc, QC trả về `BLOCKED_INPUT` trên chat thay vì search trong project, broader workspace, parent hoặc sibling directory, user home directory hoặc xin broader filesystem permission.
Nếu người dùng không biết locator, QC đặt câu hỏi làm rõ requirement trên chat và không suy luận behavior chưa được nêu.
External source không được copy vào project nếu chưa có phê duyệt riêng cho content và path.
PO handoff không kế thừa quyền phê duyệt QC write, Lock, Manual Result, Execution hoặc Release Verdict.

Cam kết preservation áp dụng khi mỗi package dùng chung root adapter có managed block riêng.
Tanizy PO installer hiện tại bảo toàn QC block và project-owned instruction.
Nếu PO installer cũ thay thế toàn bộ adapter, hãy cập nhật PO trước, sau đó chạy QC installer với `--force` để khôi phục QC block hiện tại.
Ưu tiên selective skill update khi không cần refresh adapter.

### Cài đặt local

```bash
node scripts/install.mjs --target codex --project /path/to/project --dry-run
node scripts/install.mjs --target codex --project /path/to/project
```

`--project` phải trỏ tới project root, không phải thư mục `qc/`.
Installer sẽ từ chối runtime root vô tình được đặt lồng nhau.

### Phát hiện legacy layout

Installer báo cáo nhưng không xóa các legacy path sau:

- `qc/.agents/skills/`
- `qc/refs/open-questions.md`
- `qc/qc-task.md`
- `qc/material-paths.md`
- `qc/field-validation-checklist.md`
- `qc/ui-component-checklist.md`
- `qc/config/field-validation-checklist.md`
- `qc/config/ui-component-checklist.md`
- `qc/AGENTS.md`

Cài đặt và validate layout mới trước khi migrate hoặc xóa legacy file bằng tay.
Runtime artifact hiện có có thể chứa project decision và không được tự động xóa.
Thực hiện theo [legacy migration mapping](docs/install-codex.md#legacy-layout) cho từng scope.

### Workflow thông thường

```text
1. Gọi $qc-orchestrator hoặc một skill qc-* cụ thể.
2. Xác nhận approved source file, scope key, stable scope code, các phase được yêu cầu và reader-facing artifact language.
3. Chọn `GAP_ANALYSIS` hoặc `DIRECT_SOURCE_CHECK` làm Viewpoint readiness route.
4. Nhận `READY`, `PARTIAL` hoặc `STOP` từ Gap Analysis, hoặc nhận `PASS` và
   `READY` từ Direct Source Check.
5. Hiểu Test Target, gồm business value, product risk, test object, test item,
   user, state, interaction và impact boundary.
6. Dùng package discovery guide và project extension đã được phê duyệt nếu có
   để tìm, phân rã Viewpoint, sau đó review và lock leaf Viewpoint có source
   trace.
7. Từ locked leaf Viewpoint, xác định coverage item và coverage target, chọn
   Test Design Technique phù hợp, thiết kế Test Case với một primary objective
   và các coherent checkpoint, sau đó đối soát từng claim với action và oracle
   trước khi review và Lock. Không chạy lại Viewpoint discovery trong phase
   này.
8. Đề xuất export XLSX manual run tùy chọn qua `qc-record-manual-results`.
9. Import manual result đã hoàn thành hoặc thực thi Test Case đủ điều kiện qua
   runtime skill đã được phê duyệt.
10. Tạo report từ append-only Run ID và Evidence Policy đã được phê duyệt.
```

Khi tạo và import XLSX, CSV hoặc Markdown, `qc-record-manual-results` sử dụng bundled Node.js script trên mọi target.
Mọi format đặt locked Test Title ngay sau TC ID để dễ scan.
Mọi format cũng giữ locked design context, gồm Preconditions, Test Data, Steps, Expected Results, `VP ID`, `Source Trace` và `Automation Eligibility`; IMPORT sẽ reject supplied value đã bị thay đổi.
Baseline này không phụ thuộc vào spreadsheet skill riêng của model, Microsoft Excel, Python, connector hoặc thư viện cần cài qua network.
Spreadsheet capability native của target có thể được dùng thêm để inspect, render hoặc cải thiện XLSX workbook.
Chỉ dùng CSV và Markdown khi người dùng chọn rõ các format này.

Nếu thiếu release criteria hoặc decision authority, report verdict phải là `UNDETERMINED`, không được tự tạo quyết định GO hoặc NO-GO.

### Validation

```bash
npm run validate
npm run test:install
npm run pack:check
```

Validation bao gồm skill frontmatter, naming, local reference, installer destination, preservation semantics, collision preflight, packaged CLI execution, force refresh, symlink safeguard và toàn bộ bốn target.

### License

MIT License.
Xem [LICENSE](LICENSE).

[English](#english)
