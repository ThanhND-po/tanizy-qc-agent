# Review Summary — Tanizy QC Agent (Hai đợt thay đổi)

Tài liệu này tổng hợp toàn bộ thay đổi đang nằm trong sandbox tại `/home/ubuntu/tanizy-qc-agent`, bao gồm **đợt 1** (global `material-paths.md` + adapter đa nền tảng — bạn chưa kịp review) và **đợt 2** (test case metadata trạng thái + field validation checklist). Theo thỏa thuận, **không có commit hay push nào được thực hiện**; bạn review xong nội dung dưới đây (hoặc file `tanizy-qc-agent-rev2.diff` đính kèm), tôi mới commit và push lên GitHub để bạn `git pull` về local worktree.

## Đợt 1 — Global Material Paths và Hệ Adapter Đa Nền Tảng

### Vấn đề `material-paths.md` duplicate

Trước đây, file quy tắc đường dẫn material tồn tại ở hai bản sao: `core/skills/qc-gap-finder/references/material-paths.md` và `core/skills/qc-report-generator/references/material-paths.md`. Các skill còn lại, bao gồm nhóm export/execution và các runtime artifact `qc-task.md`/`open-questions.md`, không có reference để tuân thủ — đúng như nhận định của bạn rằng đây phải là **global rule**.

Giải pháp: một **canonical source duy nhất** tại `core/references/material-paths.md` (đã xóa hai bản duplicate). Installer sao file này vào hai nơi:

| Phạm vi | Vị trí tại target project |
|---|---|
| Runtime QC (root `qc/`) | `qc/material-paths.md` |
| Mỗi skill được cài | `<skill-dir>/references/material-paths.md` |

Mọi SKILL.md có phần "Global Material Path Rule" ngay sau frontmatter, yêu cầu đọc reference trước khi tạo/cập nhật bất kỳ artifact nào — áp dụng cho cả `qc-task.md` và `open-questions.md`.

### Hệ adapter (4 targets theo plan của PO Agent)

Installer được viết lại hoàn toàn, hỗ trợ đúng CLI contract:

```bash
npx @thanhndpo/tanizy-qc-agent --target gemini-cli --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target codex --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target claude-code --project /path/to/project
npx @thanhndpo/tanizy-qc-agent --target antigravity --project /path/to/project
```

Kèm selective installation `--skill <name>...` (có thể lặp nhiều lần), `--dry-run`, `--force`, `--skip-refs`.

| Target | Adapter entrypoint | Skill directory |
|---|---|---|
| `gemini-cli` | `GEMINI.md` | `skills/` |
| `codex` | `AGENTS.md` | `.agents/skills/` |
| `claude-code` | `CLAUDE.md` | `.claude/skills/` |
| `antigravity` | `AGENTS.md` + `.agents/rules/tanizy-qc.md` | `.agents/skills/` |

Adapter của mỗi nền tảng chỉ chứa routing rules ngắn gọn; toàn bộ rule chi tiết nằm trong SKILL.md.

## Đợt 2 — Test Case Metadata Trạng Thái và Field Validation Checklist

### Bảng test case mới (tham chiếu Repo Tester Kit `$rbt-manual-testing`)

Template trong `qc-design-test-cases/SKILL.md` chuyển từ:

```
| TC ID | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Auto | Notes |
```

thành:

```
| TC ID | Module | Risk Level | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Automatable | Auto Type | Tags | Status | Test By | Test Date |
```

Các cột mới và quy tắc tương ứng:

| Cột | Giá trị | Quy tắc |
|---|---|---|
| Module | theo decomposition | mỗi TC thuộc đúng module |
| Risk Level | High / Medium / Low | đánh giá per module **trước khi** sinh TC, có nêu lý do ngắn |
| Automatable | Yes / No / Partial | map từ eligibility: UI-AUTO/API-AUTO/BOTH → Yes; MANUAL → No |
| Auto Type | UI / API / Unit / N/A | map: UI-AUTO → UI, API-AUTO → API, BOTH → UI (mặc định), MANUAL → N/A |
| Tags | @Smoke, @Regression, @CriticalPath, @Security, @Boundary | ít nhất một tag mỗi TC |
| Status | NOT_RUN → PASS/FAIL/BLOCKED/SKIP/ERROR | design skill chỉ được set `NOT_RUN` |
| Test By | agent name / tester | chỉ do execution skill hoặc tester thủ công ghi |
| Test Date | YYYY-MM-DD | chỉ do execution skill hoặc tester thủ công ghi |

Cột **Trace** được giữ nguyên (đặc trưng traceability VP/AC của quy trình Tanizy). Logic eligibility UI-AUTO/API-AUTO/BOTH/MANUAL vẫn tồn tại và được map sang cặp `Automatable`/`Auto Type` qua bảng mapping mới trong `automation-eligibility.md`.

### Ownership trạng thái (giải quyết vấn đề report-generator không có kết quả)

- `qc-design-test-cases`: mỗi TC mới sinh khởi tạo `Status = NOT_RUN`, `Test By`/`Test Date` trống; bị cấm ghi hai cột sau hoặc đổi Status đã có.
- `qc-run-playwright`: thêm bước 9 — sau khi ghi executions log, cập nhật `Status`/`Test By`/`Test Date` lên đúng dòng TC trong file test-cases nguồn. Manual tester (hoặc agent ghi hộ) cũng điền tương tự.
- `qc-report-generator`: rule mới — executions log vẫn là nguồn ưu tiên; **khi log vắng**, đọc trực tiếp ba cột trạng thái từ bảng TC để tính metrics. `NOT_RUN` luôn bị loại khỏi mẫu số pass rate, không bao giờ "thổi phồng" kết quả.
- `executions-log.md`: thêm `NOT_RUN` vào Result Vocabulary; pre-fill của design skill đổi từ `SKIP` thành `NOT_RUN` (ngữ nghĩa đúng hơn: tồn tại nhưng chưa thực thi).
- `report-content-spec.md` và `format-guide.md`: đồng bộ `NOT_RUN` vào bảng metrics, markers Markdown (`○ NOT_RUN`), donut chart, và CSV export header đầy đủ cột metadata mới.
- `qc-orchestrator`: quality gates của design skill nâng từ 5 lên **6 tiêu chí** bám Repo Tester Kit (Unique TC ID, 1-to-1 Step-Expected, Trace coverage, Concrete test data, Field validation coverage, Automation metadata ready).

### Field-Level Validation Checklist — file tùy chỉnh per project (theo điều chỉnh của bạn)

Thay vì gộp checklist vào SKILL.md, checklist được đặt làm **file tham chiếu riêng**:

- Canonical: `core/references/field-validation-checklist.md` (nội dung bám 15 field types + scenarios chuyên sâu của Repo Tester Kit).
- Installer seed vào target project tại `qc/field-validation-checklist.md` (ghi đè khi `--force`), mỗi project **tự do tùy chỉnh** — thêm/xóa hạng mục theo business rules riêng.
- Skill chỉ **tham chiếu** file này (`references/material-paths.md` đã liệt kê trong layout), kèm quy tắc cứng: không gộp validation nhiều field vào 1 TC; mỗi field ≥ 1 positive + 2+ negative/boundary cases; áp dụng scenarios chuyên sâu (double submit, session/network resilience, UTF-8/emoji, A11y, HTTP status codes) từ cùng file.

## Phạm vi không động tới

Adapter đã làm ở đợt 1, layout `material-paths.md`, `report-content-spec` 8 sections, `refs-templates`, cơ chế installer core — các phần còn lại giữ nguyên. Các tham chiếu `UI-AUTO`... trong mô tả skill vẫn hợp lệ vì eligibility là input nội bộ.

## Xác minh đã thực hiện

- `node --check scripts/install.mjs`: OK
- `git diff --check`: OK
- Smoke install 4 targets (gemini-cli/codex/claude-code/antigravity): entrypoint adapter tồn tại, skill directory đúng mapping, `qc/material-paths.md` và `qc/field-validation-checklist.md` được tạo, bản copy reference trong mỗi skill khớp canonical (`diff` byte-identical)
- `npm pack --dry-run`: package chứa đủ 4 adapter, canonical material reference, checklist, installer mới
- Chọn lọc `--skill` và `--help` hiển thị đủ 4 target: OK

## Việc bạn cần làm sau khi duyệt

Tôi sẽ commit + push lên `main` (vì các thay đổi trước chưa được commit). Bạn về local chạy:

```bash
git pull
# Nếu project target đã cài bản cũ, cài lại:
npx @thanhndpo/tanizy-qc-agent --target <target> --project /path/to/project --force
```

Cờ `--force` cần thiết trên project đã cài để cập nhật các file đã thay đổi (installer báo rõ từng file trước khi ghi đè).

## Bổ sung — DOCX Output Format (yêu cầu sau cùng của bạn)

DOCX được thêm làm **format lựa chọn thứ 2, ngay sau HTML**. Quy ước đặt trong file tham chiếu riêng `core/skills/qc-report-generator/references/docx-format.md` và được liệt kê trong `format-guide.md` + `SKILL.md`:

- **Toolchain**: `python-docx` hoặc `pandoc`; bắt buộc verify file mở lại thành công (roundtrip/LibreOffice headless) trước khi lưu.
- **Chống lỗi font**: UTF-8 mọi nơi, font Calibri với fallback `w:eastAsia`, cấm symbol fonts legacy; status marker bằng text có màu (không dùng Wingdings/Symbol).
- **Màu chuẩn**: bảng fill/text cho PASS/FAIL/BLOCKED/SKIP/NOT_RUN và ba verdict GO/CONDITIONAL GO/NO-GO.
- **Ảnh/chart**: PNG (DejaVu Sans label để không mất glyph tiếng Việt) hoặc native shapes; embed width cố định; chỉ local paths (evidence screenshot là thumbnail hoặc link); cấm URL remote.
- **Bảng**: header row bold + lặp lại across pages, style Table Grid, column width cố định, status cell đổ màu.
- **Cấu trúc**: giống layout HTML (title block → metrics → breakdown → coverage → issues 4 nhóm → confidence → recommendation → evidence index).
- **Degradation**: nếu môi trường không tạo docx sạch → xuống cấp graceful + báo user một câu.

Đã xác minh: `npm pack --dry-run` chứa `docx-format.md`; cài lại 4 target vẫn sạch (`npm pack` OK); `node --check` OK.
