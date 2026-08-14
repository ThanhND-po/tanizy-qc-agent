# Demo Scenario — Test QC Agent trên máy tính

Kịch bản test 15 phút bằng một feature nhỏ: **Login với rate limit**. Mục tiêu là xác nhận toàn bộ pipeline QC hoạt động từ gap finder đến export.

## Bước 0: Cài đặt

```bash
mkdir -p ~/demo-project && cd ~/demo-project
git init
node /path/to/tanizy-qc-agent/scripts/install.mjs --project . --dry-run
node /path/to/tanizy-qc-agent/scripts/install.mjs --project .
```

Kiểm tra kết quả:

```text
demo-project/
├── qc/
│   ├── AGENTS.md
│   ├── .agents/skills/qc-*/
│   └── refs/          (tạo thủ công sau)
```

## Bước 1: Chuẩn bị input (5 phút)

Tạo một user story giả làm tài liệu requirement:

```bash
mkdir -p docs/requirements qc/refs
```

Nội dung `docs/requirements/login-user-story.md`:

```markdown
# User Story: US-010 - Đăng nhập hệ thống
As a registered user, I want to log in with email and password so that I can access my account.

## Acceptance Criteria
- AC1: User nhập đúng email/password được chuyển vào Dashboard.
- AC2: Sai password hiển thị thông báo lỗi, tài khoản không bị lock.
- AC3: Email bắt buộc đúng format, password tối thiểu 8 ký tự.
- AC4: Sau khi đăng nhập, session hết hạn sau một khoảng thời gian.

## Non-functional
- Màn hình đăng nhập phải tải dưới 2 giây.
```

Nội dung `qc/refs/system-context.md` (giả lập trạng thái hệ thống):

```markdown
# System Context
- Hệ thống hiện dùng JWT, session hiện tại chưa có cơ chế refresh token.
- Module login đã tồn tại, chưa có rate limit.
- Tích hợp SSO Google đang trong kế hoạch (chưa triển khai).
```

Nội dung `qc/refs/bug-base.md`:

```markdown
# Bug Base
| Bug Ref | Area | Description | State | Regression Implication |
|---|---|---|---|---|
| BUG-101 | Login | Sai password đôi khi không hiện message E01 | Fixed v1.2 | Re-test AC2 mỗi khi đổi flow login |
```

## Bước 2: Chạy pipeline trong Codex (10 phút)

Mở dự án bằng Codex. Kịch bản chính là **Actor mode**: bạn gọi QC Actor một lần, Actor đề xuất task, bạn xác nhận, rồi Actor điều phối. Sau đó thử thêm **standalone mode** với từng skill riêng lẻ.

### Actor mode — gọi một lần, Actor điều phối

1. **Gọi QC Actor và xác nhận task:**
   ```text
   Gọi QC Actor review bộ tài liệu docs/requirements/login-user-story.md,
   system-context và bug-base ở qc/refs/. Task: chạy gap analysis và viewpoints trước.
   ```
   Kỳ vọng: Actor đọc đầu vào, trình task list, hỏi bạn xác nhận. Sau khi xác nhận, Actor dispatch gap analysis: tìm ra các gap (ví dụ AC2 mâu thuẫn với rate limit chưa định nghĩa, AC4 khoảng thời gian session chưa rõ, không có AC cho "account lockout" dù bug base ám chỉ), tạo `qc/open-questions.md` với OQ-001.. và file `qc/gap-reports/login-gap-report.md`. Câu hỏi mức High được hỏi ngay; câu trả lời được ghi vào ledger.

2. **Viewpoint (Actor tiếp tục dispatch, có checkpoint):**
   ```text
   $qc-design-viewpoints — design viewpoint cho US-010
   ```
   Kỳ vọng: agent trình bảng viewpoint (VP-01 happy flow, VP-02 rejection, VP-03 boundary data, VP-04 regression từ BUG-101...), **dừng để bạn review** và điều chỉnh (thử merge 2 viewpoint hoặc đổi priority), rồi chốt phiên bản locked trong `qc/test-viewpoints/login-viewpoints.md`.

3. **Test case (Actor dispatch tiếp):**
   ```text
   $qc-design-test-cases
   ```
   Kỳ vọng: `qc/test-cases/login-test-cases.md` với TC-LOG-001... có cột Trace (VP + AC), cột Auto (UI-AUTO/API-AUTO/MANUAL), TC phụ thuộc OQ được gắn cờ `[OQ-xxx]`; matrix cuối file cho thấy AC1-AC4 đều có TC cover; file `qc/executions/login-executions.md` được tạo sẵn một hàng/TC với Result `SKIP`.

4. **Export Gherkin (bạn yêu cầu thêm):**
   ```text
   $qc-export-gherkin --scope TC-LOG-001-TC-LOG-003
   ```
   Kỳ vọng: thư mục `specs/` chứa `.feature` có tag `@TC-LOG-001 @vp-01 @us-010-ac1` và README index.

5. **Export Postman (bạn yêu cầu thêm):**
   ```text
   $qc-export-postman
   ```
   Kỳ vọng: nếu TC nào có eligibility API-AUTO/BOTH và đủ endpoint → `postman/*.postman_collection.json` import được vào Postman; nếu không đủ → báo NEEDS_REVIEW thay vì đoán.

6. **Playwright MCP (tuỳ chọn, cần có app thật):**
   ```text
   $qc-run-playwright --scope TC-LOG-001
   ```
   Kỳ vọng: agent hỏi URL + credential, recon DOM qua browser MCP, chạy TC, ghi kết quả vào `qc/executions/login-executions.md`, tự append vào `qc/refs/bug-base.md` nếu có defect, báo kết quả PASS/FAIL kèm số vòng auto-heal.

7. **Test report (chọn format):**
   ```text
   $qc-report-generator — test cases ở qc/test-cases/login-test-cases.md
   ```
   Kỳ vọng: workflow hỏi format (HTML/PPTX/MD/XLSX/CSV); chọn HTML; agent tạo
   `qc/reports/test-report-login-<date>.html` với summary card, donut + bar
   chart, coverage theo VP/AC, 4 nhóm issues, confidence statement và
   GO/CONDITIONAL/NO-GO.

### Standalone mode — tester gọi từng skill riêng

Thử chỉ cài 1 skill để xác nhận chế độ standalone:

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs --project ~/demo-project2 --skill qc-export-gherkin
```

Mở `~/demo-project2` trong Codex, tạo một file TC mẫu rồi gọi `$qc-export-gherkin` — chỉ skill này được cài và vẫn hoạt động độc lập.

## Checklist xác nhận

| # | Điểm kiểm tra | Kết quả kỳ vọng |
|---|---|---|
| 1 | Cài vào `qc/` không xung đột PO agent ở root | AGENTS.md PO vẫn nguyên |
| 2 | Gap finder tạo OQ ledger | `qc/open-questions.md` có OQ-001+ |
| 3 | Viewpoint dừng ở checkpoint | Agent hỏi trước khi chốt |
| 4 | TC có trace | Mỗi TC có cột Trace tới VP và AC |
| 5 | Gherkin tag đủ | Tag `@TC-XXX` trên mọi scenario |
| 6 | OQ chưa trả lời không chặn delivery | TC vẫn sinh kèm cờ `[OQ-xxx]` |
