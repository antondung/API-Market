# Bàn giao backend Sprint 4 — Nguyễn Như Tùng Dương

Ngày thực hiện: 2026-11-04. Phạm vi: [issue #17](https://github.com/antondung/API-Market/issues/17), US-23/24/26/27/29/30. Nhánh `codex/sprint4-backend`, dựa trên schema của Danh tại [PR #91](https://github.com/antondung/API-Market/pull/91), commit `a475d353c1bc9ec4af09d92a934094eabae1ce45`.

## Chức năng và luồng

1. Consumer đăng nhập lấy JWT, chọn plan của API Published và tạo subscription. Free kích hoạt ngay; Paid ở Pending. Giá, tiền tệ, quota và rate được chụp tại thời điểm đăng ký, không lấy giá do client gửi.
2. Checkout có idempotency key theo Consumer; token HMAC gắn payment, chủ sở hữu và hạn 15 phút. `/confirm` chỉ mô phỏng thanh toán sandbox và cần JWT của chủ sở hữu. Webhook nhận raw JSON, xác minh HMAC SHA256 trên `timestamp.rawBody`, cửa sổ 5 phút. Cùng event/outcome được replay an toàn; event mâu thuẫn trả 409. Payment và transaction cập nhật trong một PostgreSQL transaction.
3. Thanh toán thành công kích hoạt kỳ 30 ngày. Đổi gói tạo checkout riêng và chỉ thay entitlement sau settlement thành công; giữ kỳ và quota đã dùng. Hủy mặc định vào cuối kỳ; `immediate:true` chặn Gateway ngay. Nếu kỳ đã dùng quota bị hủy ngay, đăng ký lại cùng API bị chặn 409 `SUBSCRIPTION_PERIOD_LOCKED` đến cuối kỳ, kể cả chọn plan khác. Có thể đổi gói khi subscription còn Active. Checkout khởi tạo thất bại, chưa dùng quota, có thể đăng ký lại.
4. Gateway xác thực API Key, tìm endpoint/route, kiểm tra SafeProxy, khóa subscription, kiểm tra Active/plan/kỳ, gọi Redis Lua để kiểm tra rate và quota nguyên tử, tăng durable `quota_used` và ghi outbox trong cùng transaction, rồi mới forward. Key/provider/API được kiểm tra lại tại thời điểm giữ quota. Không có subscription/hết quota trả 403; rate trả 429; key sai trả 401; Redis lỗi hoặc quá hạn 1 giây trả 503. Không có nhánh cho qua khi Redis không sẵn sàng.
5. Usage writer chạy nền mỗi 250 ms, tối đa 500 bản ghi/lượt, dùng `FOR UPDATE SKIP LOCKED`. Kết quả được hoàn tất sau upstream; insert usage và xóa outbox trong cùng transaction. Retry không nhân đôi log. Request đã được chấp nhận nhưng tiến trình chết được ghi 502 `GATEWAY_INTERRUPTED` sau 1 phút. Các request bị chặn trước reservation không tạo usage tính quota.
6. Consumer xem quota và lịch sử đã lọc dữ liệu; Provider chỉ xem thống kê API thuộc mình. Doanh thu sandbox lấy từ transaction thành công, độc lập số lượt gọi và tách theo tiền tệ. Không trả thông tin định danh Consumer cho Provider.

## Hợp đồng tích hợp cho Hải Dương

JSON thành công có envelope `{ "data": ... }`; lỗi dùng envelope chuẩn hiện có. ID trả dạng chuỗi. Consumer dùng `Authorization: Bearer <accessToken>`; Provider dùng JWT role Provider. Không dùng dữ liệu mô phỏng để thay kết quả các API dưới đây.

| Method | URL | Body / kết quả chính |
|---|---|---|
| POST | `/api/consumer/subscriptions` | `{planId}` → subscription, HTTP 201 |
| GET | `/api/consumer/subscriptions` | `page`, `pageSize` → items,total,page,pageSize |
| GET | `/api/consumer/subscriptions/{id}` | subscription thuộc người gọi |
| POST | `/api/consumer/subscriptions/{id}/checkout` | `{idempotencyKey}` → paymentId,subscriptionId,amount,currency,status,expiresAt,token |
| POST | `/api/consumer/subscriptions/confirm` | `{paymentId,token,outcome:"success" hoặc "failure",eventId}` |
| POST | `/api/consumer/subscriptions/{id}/change-plan` | `{planId,idempotencyKey}` → checkout; dùng confirm để hoàn tất |
| POST | `/api/consumer/subscriptions/{id}/cancel` | `{immediate:false}` mặc định; true để thu hồi ngay |
| GET | `/api/consumer/usage/summary` | subscriptions với quotaUsed/quotaLimit/remainingRequests và daily |
| GET | `/api/consumer/usage/history` | items,total,page,pageSize; không có header/body/credential |
| GET | `/api/provider/analytics/overview` | requests,daily,revenue theo currency,activeSubscribers |

Usage nhận `apiId`, `from`, `to` dạng YYYY-MM-DD, tối đa 365 ngày; history có thêm `status`, `page`, `pageSize`. Mặc định 30 ngày gần nhất. `remainingRequests` là quota số học còn lại của bản ghi; FE phải kiểm tra status và periodEnd để hiển thị khả năng gọi thực tế. Swagger tại `/openapi.json` và `/docs/` đã có đường dẫn và schema request mới.

Webhook máy chủ: POST `/api/consumer/subscriptions/sandbox-webhook`, Content-Type application/json, body `{paymentId,outcome,eventId}`. Header `x-sandbox-timestamp` là Unix seconds; `x-sandbox-signature` là hex HMAC SHA256 của `${timestamp}.${rawBody}`. Không gửi khóa webhook xuống frontend. Chỉ dùng sandbox, không thu thập thẻ hoặc chuyển tiền thật.

## Database, Redis và vận hành cho Danh/Dũng

- Giữ nguyên checksum migration 009 của Danh. 010 thêm snapshot subscription và target checkout; 011 thêm durable usage_outbox; 012 sửa hàm aggregate SQL lỗi GROUP BY trong 009 và xử lý ngày chỉ có doanh thu. Sửa fixture database tạo API Draft đúng trigger thay vì INSERT Published trực tiếp.
- Chạy `npm ci`, `npm run db:migrate`, rồi khởi động backend. `DATABASE_URL` phải là PostgreSQL đã migrate đến 012. Production cần `SANDBOX_WEBHOOK_SECRET` riêng tối thiểu 32 byte và JWT_SECRET hợp lệ; giá trị sandbox trống trong development được derive từ JWT_SECRET. Docker dùng `REDIS_URL=redis://redis:6379`.
- Redis Lua dùng ID và số, không có key thô/JWT/header. Redis quota lấy mức tối thiểu từ PostgreSQL `quota_used`, nên eviction/restart không làm mới quota. Redis tăng trước PostgreSQL commit có thể dẫn tới đếm dư nếu transaction rollback hoặc kết nối mất phản hồi sau khi Lua đã chạy; xử lý bảo thủ, không forward miễn phí. Chưa có reconciliation tự động cho phần đếm dư này.
- Kiến trúc hiện yêu cầu Redis standalone (hai key trong một Lua script), chưa hỗ trợ Redis Cluster. Compose dùng Redis 7. Local Windows kiểm thử bằng Redis 5.0.14.1 tương thích các lệnh đang dùng; CI cài redis-server và chạy integration thật.
- `run_subscription_maintenance()` do schema Danh cung cấp cần được lịch hóa ở staging để materialize trạng thái Expired. Gateway luôn tự kiểm tra current_period_end/expires_at ngay cả khi job chưa chạy. Không tự động thu tiền/gia hạn Paid; kỳ mới cần subscription/checkout mới.
- `/health` là liveness, không chứng minh Redis sẵn sàng. Khi Redis mất kết nối, Auth/CRUD vẫn phục vụ và Gateway fail closed. Cần monitor Redis, usage_outbox tồn đọng và tác vụ aggregate/retention trên staging.
- Endpoint doanh thu mới luôn tách currency. Cột legacy `provider_daily_aggregates.sandbox_revenue` của schema 009 không có chiều tiền tệ; không dùng cột scalar này để hiển thị tổng nhiều currency.
- Production SafeProxy giữ nguyên chống SSRF, giới hạn body, timeout và lọc header. Cấu hình upstream HMAC/hạ tầng của Dũng và kết nối FE của Hải Dương cần kiểm thử tích hợp riêng.

## Bằng chứng kiểm thử

Lệnh tái hiện: `npm test`, `npm run lint`, `./scripts/kiem-tra-kho-ma-nguon.ps1`, `npm run benchmark:gateway`.

`npm test` tự tạo PostgreSQL/Redis tạm trên loopback, tạo schema độc lập, và dọn sau test. Cần PostgreSQL CLI (pg_config/initdb/pg_ctl) và redis-server. Có thể đặt PG_TEST_URL/REDIS_TEST_URL đến dịch vụ **test riêng**, hoặc REDIS_SERVER_BIN đến binary Redis. Không dùng production. Runner không FLUSHALL; Redis namespace theo test.

| Bằng chứng | File |
|---|---|
| Free/Paid, snapshot giá, replay/concurrent checkout, thay đổi gói giữ quota, hủy/đăng ký lại, JWT/ownership/role, raw webhook giả/hết hạn, Swagger validator | `integration/billing.test.ts` |
| Redis Lua concurrency ở slot cuối, 429, mất dữ liệu Redis giữ durable floor, mất kết nối/quá hạn 503 | `test/redis-meter.test.ts` |
| HTTP Gateway với PG/Redis thật, 5 request đồng thời chỉ 1 được forward khi còn 1 quota; usage; cancel/expire; Redis outage | `integration/gateway-metered.test.ts` |
| Outbox rollback, pending, concurrent flush, replay, retry sau lỗi SQL, crash recovery, loại credential, ownership analytics, revenue nhiều currency không có traffic | `integration/usage.test.ts` |
| Nâng schema Sprint 3 qua 009–012, giữ nguyên users/API/version/endpoint/docs/key/session/plan và chạy migrate lại | `integration/sprint4-upgrade.test.ts` |
| Blank Docker sandbox development / thiếu khóa production | `test/sandbox-config.test.ts` |
| Ràng buộc DB, aggregate và maintenance | `integration/sprint4-database.test.ts` |

Kết quả local ngày 2026-11-04: **160/160 test PASS, 0 fail, 0 skip** (97.98 giây); build, lint và kiểm tra kho mã nguồn PASS. Benchmark: application P50 **13.09 ms**, P95 **19.21 ms**, max **23.86 ms**; stored P50 13 ms/P95 19 ms; 110/110 usage được persist (gồm 10 warmup). Benchmark dùng PostgreSQL/Redis thật, 10 warmup + 100 mẫu tuần tự, upstream fixture 2 ms; không đo DNS/TLS/mạng upstream hoặc tải staging. `applicationP95Ms` bao gồm ghi completion; `storedP95Ms` trong usage log dừng trước instrumentation write. Không dùng kết quả local làm cam kết SLA.

## Review và phần còn cần phối hợp

Rà soát riêng phát hiện hai lỗi High (reset quota qua immediate cancel/resubscribe và startup Docker với secret trống); đã sửa, thêm regression và được rà lại bằng đọc code, không còn Critical/High được nhận diện trong lượt đó. Kết luận vẫn cần CI và QA môi trường tích hợp.

PR backend phải vào develop và ghi rõ phụ thuộc PR #91 còn mở. Chưa tuyên bố hoàn thành DoD toàn nhóm: cần maintainer review, CI xanh trên commit cuối, Hải Dương nối UI theo hợp đồng, Dũng/Danh cấu hình môi trường/job, Vân chạy QA tích hợp/staging. Không tự duyệt hoặc merge PR của mình, không tự đóng issue #17 trước các bước nghiệm thu này.

## Bổ sung phân quyền ngày 2026-11-05

Role Matrix `docs/02-role-va-phan-quyen.md` A.2/A.3 xác định Provider có quyền Consumer và quyền bán. Backend hiện cho `Consumer` và `Provider` dùng subscription/payment, key, sandbox/playground, usage/history và báo cáo API; Admin vẫn bị403 ở các API nghiệp vụ mua/dùng. Kiểm tra tài khoản trong transaction và xác thực API Key tại Gateway cũng chấp nhận USER/API_PROVIDER, không chỉ thay guard HTTP. `consumer_id` vẫn là `users.id` của người mua, không phải `api_providers.id`. Ownership, trạng thái user, quyền Admin và workspace Provider riêng được giữ nguyên.

Regression thực PostgreSQL/Redis: Provider mua Free/Paid của API khác, checkout/replay/đổi gói, quản lý/rotate/revoke key và gọi Gateway; sandbox/playground/report; đọc usage của mình; tài khoản khác bị chặn truy cập tài nguyên, Admin và tài khoản bị khóa không được dùng luồng mua. Test: `backend/integration/provider-consumer-access.test.ts`. Trước sửa cả3test mới thất bại403; sau sửa cần đạt cùng full regression/CI. Không cần migration database hoặc thay role/tài khoản của người dùng.
