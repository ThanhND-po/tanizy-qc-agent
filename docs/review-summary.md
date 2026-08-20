# Tanizy QC Agent Review Summary

## Kết luận

Bộ skill cần một contract chung cho naming, output path, spec-first gate, approval và artifact lifecycle. Việc chỉ sửa từng filename riêng lẻ không giải quyết được duplicate file hoặc handoff sai giữa các skill.

## Vấn đề đã xác minh

| Mức | Vấn đề | Tác động |
|---|---|---|
| Critical | 8/8 `SKILL.md` có Markdown nằm trong YAML frontmatter | Skill có thể không parse hoặc không trigger |
| Critical | OQ chưa trả lời vẫn được chuyển thành assumption-based TC | Nghiệp vụ chưa xác nhận có thể thành Expected Result |
| Critical | npm binary thiếu Node shebang | CLI đóng gói chạy như shell script và fail |
| High | Skill có thể nằm ở cả `.agents/skills/` và `qc/.agents/skills/` | Duplicate source, khó xác định bản đang được dùng |
| High | OQ ledger được seed tại `qc/refs/open-questions.md` nhưng skill dùng `qc/open-questions.md` | Hai ledger cùng mục đích |
| High | `qc/qc-task.md` dùng chung cho nhiều scope | Task sau có thể ghi đè task trước |
| High | Gap, Viewpoint và TC không giữ cùng source stem | Relative link và traceability bị lệch |
| High | Gherkin/Postman ghi ngoài `qc/` | Output contract không thống nhất |
| High | `--force` ghi đè adapter, checklist và runtime refs | Có thể mất project rules và QC knowledge |
| High | Export được mô tả là runnable dù chưa có runner, auth hoặc fixture | Static validity bị hiểu nhầm thành runtime readiness |
| High | Report bắt buộc GO/NO-GO khi chưa có release criteria | Agent có thể tự tạo quyết định release |

## Contract đã áp dụng

### 1. Ownership

- Package-managed: target-native `qc-*` skill folders, managed adapter block, và một shared contract tại `qc/config/material-paths.md`.
- Project-owned: Open Questions, System Context, Bug Base, customized field checklist, tasks, designs, runs và reports.
- `--force` chỉ thay package-managed content.

### 2. Scope key

- Một source: dùng exact filename stem.
- Giữ prefix `fs-`, `epic-`, `req-`, `cr-`.
- Nhiều source: user xác nhận parent scope key trước khi write.
- Xác nhận một `scope-code` ổn định cho OQ, VP, TC và Finding IDs.
- Dùng cùng key cho Gap Report, Viewpoints, Test Cases, Executions và Reports.

### 3. Runtime layout

```text
qc/
├── config/
├── refs/
├── open-questions.md
├── tasks/<scope-key>-qc-task.md
├── gap-reports/<scope-key>-gap-report.md
├── test-viewpoints/<scope-key>-viewpoints.md
├── test-cases/<scope-key>-test-cases.md
├── automation/
├── execution-inputs/<scope-key>/<run-id-lowercase>-manual-results.<xlsx|csv|md>
├── executions/<scope-key>-executions.md
├── evidence/<scope-key>/<run-id-lowercase>/
└── reports/<scope-key>-test-report-<date>[-vN].<ext>
```

### 4. Spec-first gate

| Gate | Rule |
|---|---|
| `READY` | Tất cả behavior trong scope có source testable |
| `PARTIAL` | Chỉ tiếp tục phần source-backed, tách blocked coverage |
| `STOP` | Chỉ tạo Gap Report và OQ, không tạo placeholder TC hoặc Oracle |

OQ dùng `Blocks From Phase`: `DESIGN`, `EXPORT`, `EXECUTION`, `REPORT`, hoặc
`NONE`. Thiếu actor, state, Test Data hoặc Expected Result block từ `DESIGN`;
thiếu route, auth, fixture hoặc cleanup chỉ block từ `EXECUTION` khi test intent
đã đủ.

OQ tách Finding Class khỏi Question Domain và giữ riêng ownership, target date,
decision authority, decision source, resolved source. PO Open là QC `OPEN`; PO
Answered là QC `ANSWERED`; PO Deferred vẫn là QC `OPEN` nếu chưa có risk
acceptance được ủy quyền; chỉ source đã cập nhật và được link chính xác mới là
QC `RESOLVED`.

System Context dùng Scope Key, Environment, Source Revision và trạng thái
`ACTIVE`, `STALE`, `SUPERSEDED`. Bug Base dùng một lifecycle table, giữ trace từ
Requirement, TC, Run tới evidence, thời điểm quan sát và trạng thái đóng bug.

### 5. Approval sequence

```text
Inventory source
-> Propose scope key and exact write set
-> Draft in chat
-> User approves content and paths
-> Write
-> Validate
```

Silence không phải approval. Skill con không tự chạy prerequisite phase ngoài
scope đã xác nhận.

### 6. Readiness and execution

- `STATIC_VALID`: structure, IDs, links và traceability pass.
- `AUTOMATION_ELIGIBLE`: test intent có thể automate mà không đổi nghĩa.
- `RUNTIME_READY`: environment, route, auth, fixture, cleanup, runner và
  dependencies đã được verify.

Execution log là append-only theo Run ID, Attempt và TC ID. Retry không được ghi đè lịch sử. Manual result có thể được import từ XLSX, CSV, Google Sheets hoặc Markdown riêng qua `qc-record-manual-results`. Evidence là optional theo Evidence Policy của từng Run. Auto-heal chỉ sửa execution mechanics trong
budget đã được duyệt.

### 7. Release report

Report chỉ dùng GO, CONDITIONAL GO hoặc NO-GO khi có release criteria và decision authority. Nếu thiếu, verdict là `UNDETERMINED`.

Report dùng `COMPACT` mặc định với ba phần: Decision Summary, Findings and Actions, Confidence and Evidence. Chỉ thêm detailed appendix khi user yêu cầu audit, full trace matrix hoặc per-TC detail.

## Installer safeguards

- Chặn `--project` trỏ nhầm vào runtime `qc/` của parent project.
- Preflight toàn bộ collision trước write để tránh partial install.
- Merge QC instructions bằng managed block, không replace toàn bộ adapter.
- Preserve PO block và project instructions; `--force` chỉ refresh QC block.
- Preserve runtime seeds và customized checklist kể cả khi có `--force`.
- Seed OQ đúng tại `qc/open-questions.md`.
- Refresh shared contract và retire legacy per-skill `material-paths.md` copies bằng `--force`.
- Từ chối project root, skill destination hoặc ancestor là symbolic link.
- Cảnh báo legacy layout, không tự xóa file.

## Validation

Chạy trước khi bàn giao hoặc release:

```bash
npm run validate
npm run test:install
npm run pack:check
```

Forward-test phải dùng prompt task thực tế, không đưa sẵn diagnosis hoặc expected
answer cho sub-agent.
