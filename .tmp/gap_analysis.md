# Gap Analysis: Repo Tester Kit (anhtester/codex-testing-kit) vs Tanizy QC Agent (v0.4.0)

## A. Test Case Table Template (qc-design-test-cases / Bước 6 của rbt-manual-testing)

Kit chuẩn (bước 6 template mapping):
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |

Kit hiện tại (QC Agent):
| TC ID | Title | Precondition | Test Data | Steps | Expected Result | Trace | Priority | Auto | Notes |

Chênh lệch:
- Kit có Module, Risk Level (High/Medium/Low), Test Data cột rõ, Metadata (Automatable Yes/No/Partial, Auto Type UI/API/Unit/N/A, Tags @Smoke...), không có cột Trace (kit dùng traceability matrix riêng file, đúng như QC agent — chấp nhận được).
- Kit KHÔNG có Test Status / Test By / Test Date trong bảng test case; trạng thái thực thi nằm ở executions. => User yêu cầu thêm Test Status/Test By/Test Date là mở rộng hợp lý, cần thiết cho report-generator.

## B. Field-Level Validation (15 field types) + Scenarios chuyên sâu
- Kit yêu cầu TC riêng cho từng field; checklist 15 types; scenarios: double submit, session/network, UTF-8/emoji, A11y keyboard, HTTP status codes.
- QC Agent chưa có checklist này (qc-design-test-cases chỉ nói chung chung boundary/data variation).

## C. Self-Quality Gate (5 tiêu chí)
- Kit: Unique TC ID, 1-to-1 Step-Expected, Concrete Test Data, Field Validation Coverage (1 positive + 2+ negative/boundary per field), Automation Metadata Ready.
- QC Agent đã có quality gates tương đương nhưng thiếu automation metadata + field validation coverage.

## D. Test Status / Test By / Test Date — chỗ đưa vào QC Agent
- Thêm cột `Status` (NOT_RUN tại thiết kế), `Test By`, `Test Date` vào bảng test case (khởi tạo trống/NOT_RUN).
- Executions log đã có Result (PASS/FAIL/BLOCKED/SKIP/ERROR), Executor, Run date — đủ cho report generator.
- Quy tắc ownership: qc-design-test-cases chỉ set NOT_RUN; qc-run-playwright/manual session cập nhật Status + Test By + Test Date; report-generator đọc từ executions log (preferred) + bảng TC.

## E. Execution flow QC Agent hiện tại
- qc-design-test-cases pre-fill executions log với SKIP (cần đổi thành NOT_RUN? — SKIP có nghĩa "không chạy"; kit dùng NOT_RUN cho trạng thái chưa chạy). Đề xuất thêm trạng thái NOT_RUN vào result vocabulary.
