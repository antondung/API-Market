# Sprint 5 Database handoff — Issue #24

## Bàn giao

- Migration production `015_sprint5_analytics_performance.sql`: index cho luồng nóng, aggregate Provider theo latency và doanh thu tách theo currency.
- Seed demo `016_seed_sprint5_demo.sql`: đủ Admin, Provider, Consumer; API Published, gói Basic, subscription, 14 ngày usage, payment và transaction doanh thu.
- Query dùng cho US-31/US-32: `cost_guard_daily`, `provider_analytics_daily`, `provider_revenue_daily`.
- Pre-demo gate: `validate_sprint5_integrity()` và `npm run db:integrity`.
- Backup/restore verification đã mở rộng đối soát các bảng billing, usage và aggregate Sprint 5.

## Triển khai production

1. Tạo backup theo `docs/06-production-rollback-runbook.md`.
2. Chạy `npm run db:migrate` với `NODE_ENV=production`; tuyệt đối không dùng `db:seed`.
3. Chạy `npm run db:integrity`.
4. Làm mới aggregate theo cửa sổ gần nhất:

   ```sql
   SELECT refresh_usage_aggregates(CURRENT_DATE - 1, CURRENT_DATE);
   ```

5. Kiểm tra ba query trong `migrations/sprint5-query-audit.md` trên staging.

## Rollback

Migration 015 chỉ thêm index, cột, bảng và hàm nên phiên bản ứng dụng cũ vẫn hoạt động. Khi rollback ứng dụng, có thể giữ nguyên schema. Chỉ phục hồi bản backup nếu dữ liệu đã bị ghi sai; không xóa cột/bảng trong sự cố vì thao tác đó làm rollback khó phục hồi.

Seed 016 chỉ được migration runner đưa vào khi `demoSeed=true`; runner chặn seed khi `NODE_ENV=production`.

## Kiểm thử

```bash
npm run build
TARGET_TEST=sprint5-database node scripts/run-tests.mjs
npm run verify:backup
```

Integration test xác minh migration lặp an toàn, production không có demo seed, demo seed không nhân đôi, bốn index chính tồn tại và toàn bộ invariant bằng 0.
