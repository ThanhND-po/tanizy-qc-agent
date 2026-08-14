# Task State (cho context recovery)

## Repo làm việc
- QC Agent: /home/ubuntu/tanizy-qc-agent (remote: github.com/ThanhND-po/tanizy-qc-agent, main, HEAD=4bae442 v0.4.0)
- PO Agent baseline: /home/ubuntu/tanizy-po-agent
- Repo Tester Kit: /home/ubuntu/codex-testing-kit (anhtester/codex-testing-kit, skill .agents/skills/rbt-manual-testing/SKILL.md)
- Gap analysis: /home/ubuntu/tanizy-qc-agent/.tmp/gap_analysis.md

## User yêu cầu (đã xác nhận plan, có 2 điều chỉnh)
1. Field-Level Validation Checklist phải là file checklist riêng lưu trữ tại target project (customizable per project), installer sao vào `qc/field-validation-checklist.md`; skill chỉ tham chiếu. Đã tạo `core/references/field-validation-checklist.md` (bám 15 field types + scenarios của kit).
2. User CHƯA review đợt 1 (global material-paths + adapter đa nền tảng) => khi xong đợt 2, gửi diff/output FULL của cả hai đợt để user review TRƯỚC KHI commit/push. KHÔNG commit/push.

## Đợt 1 (hoàn tất trong sandbox, chưa commit)
- core/references/material-paths.md = canonical duy nhất; xóa 2 bản duplicate trong qc-gap-finder và qc-report-generator references.
- Installer scripts/install.mjs viết lại: --target gemini-cli|codex|claude-code|antigravity, --project, --skill, --dry-run, --force, --skip-refs. gemini-cli: skills/ + GEMINI.md; codex: .agents/skills/ + AGENTS.md; claude-code: .claude/skills/ + CLAUDE.md; antigravity: .agents/skills/ + AGENTS.md + .agents/rules/tanizy-qc.md. Copy material-paths vào mỗi skill references/ + qc/material-paths.md; seed qc/refs/.
- Adapter codex AGENTS.md ngắn gọn (global rules + skill routing); antigravity rule tanizy-qc.md có.
- 8 SKILL.md có phần "Global Material Path Rule" sau frontmatter line 1.
- README.md + docs/install-codex.md + package.json (keywords 4 target) đã cập nhật. Test smoke 4 target OK.

## Đợt 2 (đang làm) — File cần sửa
1. core/skills/qc-design-test-cases/SKILL.md:
   - Template bảng mới: | TC ID | Module | Risk Level | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Automatable | Auto Type | Tags | Status | Test By | Test Date |
   - Status mới sinh = NOT_RUN; Test By/Test Date trống. Ownership: skill này chỉ set NOT_RUN, không ghi Test By/Test Date.
   - Module + Risk Level (High/Medium/Low per module trước khi sinh TC). Map Auto cũ (UI-AUTO/API-AUTO/BOTH/MANUAL) → Automatable Yes/No/Partial + Auto Type UI/API/Unit/N/A.
   - Tham chiếu qc/field-validation-checklist.md (15 field types, scenarios chuyên sâu), rule 1 TC riêng per field, mỗi field ≥1 positive + 2+ negative/boundary.
   - Self-Quality Gate 6 tiêu chí (thêm Automation Metadata Ready 100%).
   - Pre-fill executions log đổi SKIP → NOT_RUN.
2. core/skills/qc-run-playwright/SKILL.md: cập nhật Status + Test By + Test Date vào bảng TC khi ghi kết quả (đồng thời vẫn ghi executions log).
3. core/skills/qc-report-generator/references/executions-log.md: thêm NOT_RUN vào Result Vocabulary (không tính pass rate); đọc fallback từ cột Status trong bảng TC.
4. qc-design-viewpoints, qc-gap-finder: sửa nhẹ tham chiếu bảng TC nếu có.
5. Installer: thêm copy core/references/field-validation-checklist.md → qc/field-validation-checklist.md (replaceOnForce).
6. material-paths.md (canonical): thêm dòng qc/field-validation-checklist.md (customizable).

## Template kit (rbt-manual-testing bước 6)
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
- Automatable: Yes/No/Partial; Auto Type: UI/API/Unit/N/A; Tags: @Smoke @Regression @CriticalPath @Security @Boundary
- Self-Quality Gate 5 tiêu chí kit: Unique TC ID, 1-to-1 Step-Expected, Concrete Test Data, Field Validation Coverage (1 pos + 2+ neg/boundary per field), Automation Metadata Ready
- QC Agent template cũ: | TC ID | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Auto | Notes | (Trace giữ lại vì QC Agent dùng traceability matrix + trace inline là đặc trưng của user; user chỉ đồng ý plan giữ Trace)
- User đã approve plan mục C: không động adapter/material-paths/instaler core; đợt 1 vẫn cần hiển thị diff cho user xem lại.

## TRẠNG THÁI MỚI NHẤT (15:10)
- Đợt 2 HOÀN TẤT: SKILL.md design-test-cases (template mới 16 cột, ownership status, field-validation section tham chiếu qc/field-validation-checklist.md, quality gates 6 tiêu chí, pre-fill NOT_RUN); qc-run-playwright bước 9 update Status/Test By/Test Date vào bảng TC; executions-log.md thêm NOT_RUN + rule 5 fallback; report-content-spec + format-guide đồng bộ NOT_RUN + CSV header mới; automation-eligibility.md thêm Output Column Mapping; demo-test.md cập nhật CLI --target và kỳ vọng mới; README dòng metadata; docs/review-summary.md viết xong; diff đầy đủ: /home/ubuntu/tanizy-qc-agent-rev2.diff (1257 dòng)
- KHÓNG commit/push (user cần review trước). Plan: gửi user 2 file đính kèm (review-summary.md + diff), chờ duyệt rồi commit+push main.
- Smoke test đợt 2: OK (checklist install, status rules, NOT_RUN, npm pack dry-run chứa đủ file)

## Executions log hiện tại (qc-report-generator/references/executions-log.md)
Header: | # | TC ID | Title | Trace (Viewpoint / AC) | Result | Evidence / Bug link | Note |
Vocabulary: PASS/FAIL/BLOCKED/SKIP/ERROR; Summary line; Executor + Run date trong header file.
qc-run-playwright: ghi executions log + update qc/qc-task.md status PASS (2/2)/FAIL/BLOCKED/SKIPPED; locator verified; refs self-update bug-base.
