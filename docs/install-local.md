# Cài đặt Tanizy QC Agent từ Local (không cần npm registry)

Lỗi `404 Not Found - @thanhndpo/tanizy-qc-agent` xảy ra vì package **chưa được publish** lên npm registry — `npx` chỉ tìm được trên registry. Source code đã đẩy lên GitHub nhưng npm chưa có. Có 3 cách cài từ local, từ đơn giản đến linh hoạt nhất.

## Cách 1 — Chạy trực tiếp từ folder clone (đơn giản nhất)

Trên máy của bạn đã có folder clone từ GitHub:

```bash
cd /Users/thanhnd/thanhnd_product_owner/Project-TalentBank

node /Users/thanhnd/thanhnd_product_owner/tanizy-qc-agent/scripts/install.mjs \
  --target codex \
  --project /Users/thanhnd/thanhnd_product_owner/Project-TalentBank \
  --force
```

(Đường dẫn script ở cột trái phải trỏ đúng vào folder clone của bạn.) Cách này dùng ngay code mới nhất trên branch `main`; sau mỗi `git pull` ở folder clone, mọi project cài lại với `--force` sẽ nhận bản mới.

## Cách 2 — Từ tarball (giống npx nhất)

Nếu bạn muốn trải nghiệm đúng như lệnh `npx` (tự chứa, không phụ thuộc folder clone):

```bash
cd /Users/thanhnd/thanhnd_product_owner/Project-TalentBank

npx --prefix /dev/null -- /path/to/thanhndpo-tanizy-qc-agent-0.5.0.tgz \
  --target codex \
  --project /Users/thanhnd/thanhnd_product_owner/Project-TalentBank \
  --force
```

hoặc đơn giản hơn, chỉ cần chạy script trong tarball đã giải nén:

```bash
tar xzf thanhndpo-tanizy-qc-agent-0.5.0.tgz
node package/scripts/install.mjs \
  --target codex \
  --project /Users/thanhnd/thanhnd_product_owner/Project-TalentBank \
  --force
```

Tarball `thanhndpo-tanizy-qc-agent-0.5.0.tgz` có sẵn trong folder clone (sinh bằng `npm pack`) hoặc bạn pull bản tag `v0.5.0` rồi chạy `npm pack`.

## Cách 3 — Từ git URL trực tiếp

`npx` hỗ trợ cài từ git URL, nhưng vì installer không phải là script chạy được qua `npx git+https`, cách gần nhất là clone nông rồi chạy script:

```bash
git clone --depth 1 https://github.com/ThanhND-po/tanizy-qc-agent.git /tmp/tanizy-qc
node /tmp/tanizy-qc/scripts/install.mjs \
  --target codex \
  --project /Users/thanhnd/thanhnd_product_owner/Project-TalentBank \
  --force
```

## Cú pháp các flag (giống nhau cho cả 3 cách)

| Flag | Công dụng |
|---|---|
| `--target` | `gemini-cli`, `codex`, `claude-code`, `antigravity` (bắt buộc) |
| `--project` | đường dẫn project đích (bắt buộc) |
| `--force` | ghi đè các file skill đã cài từ bản cũ — cần khi upgrade |
| `--skill <name>` | cài chọn lọc 1 skill (lặp được nhiều lần) |
| `--dry-run` | xem plan copy mà chưa thực hiện |
| `--skip-refs` | bỏ qua seed `qc/refs/` nếu project đã có |

## Lưu ý quan trọng

- Khi **chưa publish** lên npm, mỗi lần pull bản mới từ GitHub, bạn cần chạy lại lệnh cài với `--force` trên project đích — skill cài là bản sao tĩnh, không tự cập nhật.
- Nếu sau này bạn muốn dùng đúng `npx @thanhndpo/tanizy-qc-agent` trên mọi máy, publish một lần: `npm login` (với tài khoản có quyền scope `@thanhndpo`), rồi `npm publish` trong folder clone — tôi có thể hỗ trợ bước này khi bạn cần.
