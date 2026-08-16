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

`--force` không ghi đè Open Questions, System Context, Bug Base, checklist đã
customize hoặc nội dung project nằm ngoài managed QC adapter block.

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
| `--force` | Thay skill folders đã chọn và refresh canonical contract copies |
| `--skip-refs` | Không seed runtime refs |

## Validation trước khi dùng

Trong repository package:

```bash
npm run validate
npm run test:install
```

Nếu installer báo legacy layout, không xóa ngay. Cài layout mới, kiểm tra skill discovery và đối chiếu project-owned artifacts trước khi cleanup thủ công. Dùng [legacy migration mapping](install-codex.md#legacy-layout) để xử lý từng path.

Installer không tự đổi schema của `qc/open-questions.md`,
`qc/refs/system-context.md`, hoặc `qc/refs/bug-base.md`. Khi update package, áp
dụng [project-owned reference schema migration](install-codex.md#project-owned-reference-schema-migration)
theo từng file và giữ nguyên mọi giá trị chưa được xác minh.
