# Sprint 4 — Nguyễn Tấn Dũng / issue #16

## Phạm vi đã triển khai

Dựa trên backend Tùng Dương ở PR #92 (`2c8a873`) và schema Danh ở PR #91. Nhánh riêng `codex/sprint4-dung`; không sửa hoặc merge hai PR phụ thuộc.

- **US-23:** Gateway và Playground dùng SafeProxy có chữ ký HMAC SHA256 do server tạo. Canonical gồm method, URL origin, path/query nguyên trạng, timestamp, nonce và SHA256 body. Client không thể truyền header chữ ký của mình qua whitelist. Demo upstream có verifier, chặn request thiếu/sai/chỉnh sửa/hết hạn/phát lại chữ ký. Secret upstream độc lập JWT/payment; production bắt buộc cấu hình khóa riêng >=32 byte. Không ghi hoặc trả secret trong API/health/log.
- **US-25:** OperationsWorker chạy ngay khi server khởi động và mỗi60giây; không chồng lượt trong process và PostgreSQL advisory transaction lock ngăn nhiều replica chạy đồng thời. Mỗi lượt xử lý tối đa20batch ×500 cho expiry/reset, tạo trước partition2tháng, refresh aggregate hôm qua/hôm nay và lưu heartbeat. Migration013 sửa expiry theo cả current_period_end và expires_at, gồm Suspended; reset chỉ subscription Active còn kỳ hợp lệ. Redis quota key dùng quota_reset_at mới nên tự chuyển bộ đếm, không FLUSHALL và không giảm quota dựa trên usage chưa flush. Shutdown chờ worker đang chạy.
- **US-28:** Admin dùng JWT và role Admin để xem/lọc subscription và payment sandbox, xem metadata key, Suspend subscription hoặc Revoke key với lý do bắt buộc. Mỗi thay đổi enforcement và Audit Log nằm cùng transaction; retry no-op không tạo audit lặp. Không trả plaintext/hash key, checkout token, idempotency key hoặc thông tin ký webhook. Consumer/Provider bị403. Gateway kiểm tra lại trạng thái cho các request mới; request đã được reserve/đang chạy có thể hoàn tất.
- **Admin FE:** thay AppContext/mock ledger bằng API thật, có tải/lỗi/rỗng/lọc/phân trang, bắt buộc reason, reload sau thao tác và chọn key theo subscription. Gateway Operations đọc dependency checks và heartbeat thật, refresh30giây; lỗi fetch xóa trạng thái khỏe cũ, không tự nhận production-ready.
- **EN-10:** integration HTTP local gồm Marketplace → Paid Subscribe → sandbox confirm/replay → API Key → upstream HTTP có chữ ký → Usage; thêm kiểm tra Admin revoke/suspend và worker. Có smoke script chạy cùng luồng trên staging bằng tài khoản test riêng.

## API mới

Tất cả dưới `/api/admin`, Bearer JWT Admin, thành công envelope `{data:...}`, lỗi chuẩn của backend; Swagger `/openapi.json` và `/docs/` đã cập nhật.

| Method | Path | Contract |
|---|---|---|
| GET | `/subscriptions` | page/pageSize,status,consumerId,apiId; items,total,page,pageSize |
| GET | `/payments` | page/pageSize,paymentStatus,consumerId,apiId,status (subscription); cùng envelope phân trang |
| GET | `/subscriptions/{id}/keys` | chỉ id,isActive,revokedAt,lastUsedAt; key theo cặp Consumer/API của subscription |
| POST | `/subscriptions/{id}/suspend` | `{reason}` dài1–2000, Active/Past Due → Suspended; terminal trả409 |
| POST | `/api-keys/{id}/revoke` | `{reason}`; is_active=false, revoked_at; idempotent |
| GET | `/operations` | checkedAt,controlPlane,postgres,redis,gateway,worker heartbeat; timeout probe1giây |

Health trạng thái `gateway:ready` chỉ xác nhận PostgreSQL và Redis phản hồi, **không** xác nhận tất cả route/upstream đều khỏe hay đã đạt SLA. Worker online khi success dưới180giây và không có lỗi mới hơn. `/health` cũ là liveness. Có thể xem audit qua trang/API Audit Log hiện có.

## Bảo vệ upstream

Gateway cấu hình master `GATEWAY_UPSTREAM_SECRET`; mỗi upstream chỉ nhận leaf key riêng suy ra bằng HMAC SHA256 trên `upstream-origin-v1:<origin>`. Cấp key bằng `node --env-file=.env.staging scripts/upstream-key.mjs https://upstream.example`; lưu output vào secret manager của upstream, không gửi vào chat/Git/log CI. Upstream thật cấu hình `UPSTREAM_GATEWAY_KEY` và origin chính xác mà Gateway gọi; không nhận master. Ba demo do nhóm kiểm soát có thể tự derive từ master trong môi trường local/Compose. Verifier mẫu: `mock-services/gateway-auth.mjs`; tích hợp middleware tương đương tại mọi upstream thật, không chỉ Gateway. Endpoint nghiệp vụ demo yêu cầu chữ ký; `/health` không yêu cầu chữ ký. Việc chỉ bật signer ở Gateway không thể ngăn upstream của bên thứ ba vẫn chấp nhận request công khai.

Nonce cache mẫu tối đa10000 entry/instance, cửa sổ timestamp60giây, nhớ nonce120giây, từ chối khi đầy. Upstream nhiều replica phải thay cache bằng Redis `SET NX EX` dùng chung hoặc bảo vệ mạng/mTLS. Dùng HTTPS cho upstream staging/public, đồng bộ clock; không đưa secret xuống frontend. Key được tách theo origin: Provider có leaf key của mình không thể ký cho origin của Provider khác. Các API cùng origin dùng cùng leaf key và cần nằm trong cùng miền tin cậy; master chỉ lưu tại Gateway.

Chạy demo local: đặt `GATEWAY_UPSTREAM_SECRET` trong `.env`, đặt `MOCK_PUBLIC_ORIGIN` trùng public origin được Gateway gọi (demo tự derive leaf key từ master local) rồi `npm run demo:weather` (hoặc currency/catalog). Setup mới sinh secret riêng và demo script đọc `.env`; setup không ghi đè `.env` có sẵn. Với file cũ phải thêm cấu hình. Không set secret thì demo upstream từ chối khởi động. Không nới SSRF: các hostname/IP private trong Compose vẫn bị SafeProxy chặn; staging phải dùng upstream public đã bảo vệ, hoặc thiết kế allowlist nội bộ riêng được review sau. Test local dùng transport adapter riêng cho loopback, không có production bypass.

## Triển khai staging và smoke test

1. Cần Docker Compose>=2.24.4, host/SSH hoặc nền tảng deploy, domain/TLS cho frontend/backend/upstream, tài khoản Admin/Consumer QA riêng, API Published + Paid plan. Repo chưa có GitHub Environment/CI deploy staging được cấu hình ở thời điểm kiểm tra; chưa có target deploy được cung cấp trong lượt này.
2. Copy `.env.staging.example` thành `.env.staging` (đã ignore), thay mọi placeholder, đặt ba secret khác nhau và DB password mạnh. Đặt VITE_API_BASE_URL/CORS_ORIGINS thành origin HTTPS thật. Không commit file thật. Trên host: `node --env-file=.env.staging scripts/staging-preflight.mjs`.
3. Backup PostgreSQL và kiểm tra version/constraint trước migration. Build: `docker compose --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml --profile frontend build`. Apply: cùng prefix, `up -d`; migrate service chạy checksum001–013 trước backend. Không chạy demo seed trên production/staging có dữ liệu thật.
4. Override staging không publish PostgreSQL/Redis/demo, backend/frontend chỉ bind loopback. Cấu hình TLS reverse proxy ngoài stack trên host, chuyển `api-staging...` đến127.0.0.1:3000 và frontend đến127.0.0.1:5173. Hạn chế truy cập host, backup volume, cấu hình upstream verifier đúng origin. Đọc `/api/admin/operations` bằng JWT Admin, không công khai metrics có metadata quản trị.
5. Dùng Consumer **mới dành riêng cho smoke** để tránh409 existing subscription. Export `STAGING_BASE_URL`, `STAGING_CONSUMER_EMAIL`, `STAGING_CONSUMER_PASSWORD`, `STAGING_ADMIN_EMAIL`, `STAGING_ADMIN_PASSWORD`, `STAGING_API_ID`, `STAGING_PLAN_ID`, `STAGING_API_PATH` và `STAGING_QUERY` (JSON, ví dụ city=Hanoi). Chạy `node scripts/sprint4-staging-smoke.mjs`. Script tạo giao dịch sandbox và key thật trong database test; verifies replay, usage, Admin enforcement và health; thu hồi key cuối test. Subscription Suspended được giữ để audit, cleanup Admin riêng sau nghiệm thu. Không chạy bằng tài khoản cá nhân hoặc database production.
6. Lưu commit/image tag, cấu hình domain (không secret), output smoke, kết quả QA Vân, thời gian heartbeat và log deploy vào biên bản staging. Nếu fail, giữ feature freeze ở Pending.

Không có bằng chứng deploy thực tế trong lượt này. Không gọi localhost/CI là staging. CI Compose config chỉ validate cấu hình, không thay image build/rollout trên host thật. Docker runtime local chưa được chạy vì máy không có Docker CLI.

## Kiểm thử và nghiệm thu

`npm test`: backend dùng PostgreSQL/Redis thật, bao gồm HMAC và operations mới. `npm run lint`; `npm run build --prefix frontend`; `npm test --prefix frontend -- --no-file-parallelism`; repo checker. Frontend test cần Node>=22.19 (máy mặc định22.14 không đáp ứng undici/jsdom hiện có, đã dùng Node24 cho Vitest).

Bằng chứng cụ thể: `backend/integration/operations.test.ts`, `backend/test/upstream-signing.test.ts`, `frontend/src/pages/admin/Sprint4Operations.test.tsx`, regression monitoring offline ở `IntegrationConnections.test.tsx`. Có audit failure rollback, worker maintenance rollback/error heartbeat, replica lock, expired current_period_end khi expires_atNULL, reset không lặp, unauthorized/role/validation, forged/replayed/tampered signatures và gọi upstream trực tiếp401.

Kết quả local 2026-11-04: **167/167 backend PASS** (65.50giây,0fail/skip); **360/360 frontend PASS**,33file (Node24); backend lint/build, frontend build và repo checker PASS. Frontend lint exit0 có warning (gồm set-state-in-effect tại màn hình monitoring); không nhận là không có warning. Sau đó bổ sung regression malformed INTEGER ID (trước sửa abc gây lỗi BigInt/500); unit RED→GREEN và8/8 focused operations/HMAC/validation PASS. Full suite CI sẽ được xác nhận trong PR trên commit cuối. Review maintainer và QA staging vẫn cần; chưa đóng issue #16. Feature freeze ngày09/11 là quyết định phát hành của Tech Lead, không tuyên bố trước khi có biên bản nghiệm thu.
