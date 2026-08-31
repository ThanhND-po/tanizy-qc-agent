# Cài Tanizy QC Agent từ local

Chạy installer trực tiếp từ repository này khi không dùng npm registry.

## Preview

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/project \
  --dry-run
```

`--project` phải trỏ tới project root, không trỏ tới `/path/to/project/qc`.
Installer sẽ chặn trường hợp tạo nhầm `qc/.agents/skills/`.

## Install hoặc update

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/project
```

Update package-managed files:

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/project \
  --force
```

`--force` không ghi đè Open Questions, System Context, Bug Base, optional `qc/config/viewpoint-discovery-extension.md`, hai legacy checklist tại `qc/config/field-validation-checklist.md` và `qc/config/ui-component-checklist.md`, hoặc nội dung project nằm ngoài managed QC adapter block.

## Selective install

```bash
node /path/to/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /path/to/project \
  --skill qc-gap-finder \
  --skill qc-design-viewpoints
```

## Flags

| Flag | Ý nghĩa |
|---|---|
| `--target` | `codex`, `gemini-cli`, `claude-code`, hoặc `antigravity` |
| `--project` | Project root |
| `--skill <name>` | Chọn skill, có thể lặp lại |
| `--dry-run` | Validate và hiển thị write plan, không ghi file |
| `--force` | Thay skill folders đã chọn, refresh shared contract tại `qc/config/material-paths.md`, và retire per-skill copy cũ trong các skill đã chọn |
| `--skip-refs` | Không seed runtime refs |

## Material cho Test Viewpoint và Test Case Design

Material được tách theo phase:

- `<skill-root>/qc-design-viewpoints/references/viewpoint-discovery-guide.md` do package quản lý, chỉ dùng để hiểu Test Target, tìm Viewpoint và phân rã thành leaf Viewpoint.
- `qc/config/viewpoint-discovery-extension.md` là file tùy chọn do project sở hữu, chỉ bổ sung project-specific discovery knowledge.
- `<skill-root>/qc-design-test-cases/references/test-design-techniques.md` do package quản lý, chỉ dùng để xác định coverage item, coverage target và Test Design Technique từ locked leaf Viewpoint trước khi thiết kế Test Case.

Discovery guide và extension chỉ là heuristic để tìm câu hỏi cần làm rõ, không phải source của requirement, business rule hoặc Expected Result.

```text
Hiểu Test Target
-> Tìm Viewpoint
-> Phân rã thành leaf Viewpoint
-> LOCK leaf Viewpoint revision
-> Chọn coverage item và coverage target
-> Chọn Test Design Technique
-> Thiết kế Test Case
```

Test Case Design không chạy lại Viewpoint discovery.
Nếu phát hiện thiếu Viewpoint, cần quay lại `qc-design-viewpoints` và tạo revision mới.

## Validation trước khi dùng

Trong repository package:

```bash
npm run validate
npm run test:install
```

Nếu installer báo legacy layout, không xóa ngay.
Clean install không seed `field-validation-checklist.md` hoặc `ui-component-checklist.md`.
Nếu hai file này đã tồn tại, installer chỉ cảnh báo và giữ nguyên, không tự xóa, ghi đè hoặc migrate.
Review project-specific customization, merge discovery rule còn phù hợp vào `qc/config/viewpoint-discovery-extension.md`, sau đó chỉ archive hoặc xóa legacy file khi có phê duyệt riêng.
Cài layout mới, kiểm tra skill discovery và đối chiếu project-owned artifacts trước khi cleanup thủ công.
Dùng [legacy migration mapping](install-codex.md#legacy-layout) để xử lý từng path.

Không rewrite locked Viewpoint dạng flat, Test Case hoặc execution artifact đã có.
Cần tạo và phê duyệt Viewpoint revision mới có hierarchy trước khi thiết kế Test Case mới.
Locked Test Case cũ vẫn được dùng downstream với `VP ID` gốc và report phải công khai giới hạn của legacy flat coverage.

Installer không tự đổi schema của `qc/open-questions.md`, `qc/refs/system-context.md`, hoặc `qc/refs/bug-base.md`.
Khi update package, áp dụng [project-owned reference schema migration](install-codex.md#project-owned-reference-schema-migration) theo từng file và giữ nguyên mọi giá trị chưa được xác minh.
