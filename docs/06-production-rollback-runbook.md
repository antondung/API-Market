# Kế hoạch Triển khai Production, Backup/Restore & Rollback (EN-13)

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 5 — Production Deployment, Reliability & Rollback
> **Phụ trách:** Nguyễn Tấn Dũng (`@antondung` — Issue #21) & Võ Trọng Danh (`@danhbuonsv2-svg` — Issue #24)

---

## 1. Kiến trúc Triển khai Production

Hệ thống production sử dụng `docker-compose.yml` kết hợp `docker-compose.production.yml` và biến môi trường tại `/opt/api-market/.env.production` (tạo từ mẫu `.env.production.example`).

- **Reverse Proxy / TLS ở biên ngoài:** Chỉ mở cổng loopback (`127.0.0.1:3000` cho Backend, `127.0.0.1:5173` cho Frontend nginx). PostgreSQL và Redis không mở port ra host (`!reset []`).
- **Tách biệt Secret:** `JWT_SECRET`, `SANDBOX_WEBHOOK_SECRET`, `GATEWAY_UPSTREAM_SECRET` bắt buộc là 3 chuỗi ngẫu nhiên độc lập $\ge 32$ bytes; kiểm tra tự động qua `scripts/production-preflight.mjs`.
- **Pipeline CD tự động:** `.github/workflows/cd-production.yml` chạy khi push vào `main` hoặc kích hoạt `workflow_dispatch`.

---

## 2. Quy trình Kiểm tra Trước Triển khai (Preflight)

Trên máy chủ production tại `/opt/api-market`:

```bash
node --env-file=.env.production scripts/production-preflight.mjs
```

Script từ chối ngay nếu:
1. Thiếu một trong 3 secret hoặc độ dài $< 32$ bytes.
2. Tái sử dụng chung một secret cho nhiều mục đích.
3. `NODE_ENV` khác `production` hoặc mật khẩu DB $< 16$ ký tự / còn giữ giá trị mẫu `replace-`.
4. `VITE_API_BASE_URL`, `CORS_ORIGINS` hoặc các origin upstream không dùng `https://` thật.

---

## 3. Quy trình Backup & Kiểm chứng Khôi phục Database (Cùng Danh — Issue #24)

### 3.1. Chụp bản sao lưu (Backup)

```bash
# Chụp trực tiếp bằng script chuẩn (định dạng custom -Fc của pg_dump)
node scripts/db-backup-restore.mjs --backup backups/prod-manual.dump --url "$DATABASE_URL"
```

Trong pipeline `.github/workflows/cd-production.yml`, trước mỗi lần cập nhật container, hệ thống tự động chụp `backups/pre-deploy-<UTC-timestamp>.dump`.

### 3.2. Khôi phục từ bản sao lưu (Restore)

```bash
node scripts/db-backup-restore.mjs --restore backups/prod-manual.dump --url "$DATABASE_URL"
```

### 3.3. Kiểm chứng tự động toàn trình Backup $\to$ Restore trên DB tạm

```bash
npm run verify:backup
```

Lệnh này tự khởi tạo cụm PostgreSQL tạm, chạy toàn bộ migration + seed trên DB nguồn (`api_market_src`), chụp `pg_dump -Fc`, khôi phục bằng `pg_restore --clean --if-exists` sang DB đích (`api_market_restored`) và đối soát số lượng bản ghi trên tất cả các bảng cốt lõi.

---

## 4. Kế hoạch Rollback Tức thì (Rollback Plan)

Khi bản phát hành mới gặp sự cố sau khi lên production (health check thất bại, lỗi 5xx tăng đột biến hoặc phát hiện bug P0):

### Bước 1: Quay lui phiên bản Ứng dụng (Container Rollback < 60 giây)

Pipeline `cd-production.yml` luôn lưu SHA của bản chạy ổn định liền trước vào `/opt/api-market/.last_image_tag`.

```bash
cd /opt/api-market
LAST_TAG="$(cat .last_image_tag)"
GHCR_OWNER="antondung/api-market" IMAGE_TAG="$LAST_TAG" \
  docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml --profile frontend up -d --remove-orphans
```

### Bước 2: Quay lui Database (Nếu bản release có migration không tương thích ngược)

```bash
cd /opt/api-market
LATEST_DUMP="$(ls -1t backups/pre-deploy-*.dump | head -n 1)"
set -a && . ./.env.production && set +a
cat "$LATEST_DUMP" | docker exec -i api-market-postgres pg_restore -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-api_market_prod}" --clean --if-exists --no-owner --no-privileges
```

### Bước 3: Xác nhận sau Rollback

```bash
curl -fsS "http://127.0.0.1:${BACKEND_PORT:-3000}/health"
curl -fsS "http://127.0.0.1:${FRONTEND_PORT:-5173}/" >/dev/null
```
