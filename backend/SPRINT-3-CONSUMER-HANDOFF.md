# Sprint 3 — Sandbox, API Key và Playground

Phụ trách: Nguyễn Như Tùng Dương, issue #12. Bổ sung trên `develop` đã tích hợp Marketplace/Detail và schema #67. Không thay frontend/Gateway HTTP/Report/Profile của các thành viên khác.

## Chạy backend

Dùng PostgreSQL; `npm ci`, cấu hình `.env` theo hướng dẫn dự án, `npm run db:migrate`, `npm run dev`. Các bảng `gateway_routes`, `sandbox_grants`, `api_keys` từ migration 006 phải tồn tại; không có migration mới trong phần này. API vẫn dùng prefix `/api`, Swagger `/docs/`, hợp đồng `/openapi.json`.

Sandbox mặc định 5 lượt/API, hết hạn sau 24 giờ. `SandboxService(pool, maxRequests)` cho phép cấu hình server từ 3 đến 10; không nhận quota/expiry từ client. Route mặc định dùng 5. Không cấp lại hoặc gia hạn grant qua reload, đăng nhập lại hoặc POST lặp. Grant đã hết hạn/vô hiệu hóa vẫn chiếm cặp Consumer/API; cấp lại cần chính sách sản phẩm riêng.

## Hợp đồng cho Hải Dương

Các thao tác dưới đây yêu cầu `Authorization: Bearer <Consumer JWT>`. Sai vai trò trả 403, thiếu/sai token trả 401. Không dùng API Key thay JWT ở các API quản lý này. IDs luôn là string. Response thành công bọc trong `{data: ...}`, lỗi `{error:{code,message,requestId,...}}`. Response không cache.

### Sandbox

`POST /api/consumer/apis/:apiId/sandbox` với `{}`: trả 201 nếu mới cấp, 200 nếu đã tồn tại, không reset quota. `GET` cùng URL đọc grant; 404 nếu chưa cấp hoặc API không công khai/Provider inactive.

```json
{"data":{"id":"1","apiId":"1","maxRequests":5,"usedRequests":2,"remainingRequests":3,"available":true,"expiresAt":"2026-10-27T00:00:00.000Z","revokedAt":null}}
```

Grant hết hạn/revoked/exhausted trả `available:false`, `remainingRequests:0`. Playground trả 403 `SANDBOX_EXHAUSTED` nếu không có grant hợp lệ; FE hiển thị hết lượt và điều hướng Pricing, không tự tăng lượt trong localStorage.

### Playground

`POST /api/marketplace/apis/:id/playground`:

```json
{"endpointId":"12","pathParams":{"city":"Hanoi"},"query":{"unit":"C"},"headers":{"Accept":"application/json"}}
```

`endpointId` lấy từ API Detail của đúng API; `method`/`path` do backend lấy từ registry. Không gửi URL hoặc method tùy ý. Endpoint không thuộc API trả 400 `ENDPOINT_NOT_REGISTERED`. Path parameter không được là dấu chấm/dot-dot, chứa slash, backslash, percent hoặc ký tự điều khiển. Query là dictionary chuỗi, tối đa 30 mục; pathParams tối đa 20 mục. Tổng JSON request chịu giới hạn 16 KiB hiện có. Body JSON tùy chọn chỉ cho method khác GET/HEAD.

Chỉ cho header accept, accept-language, content-type (không phân biệt hoa/thường). Không gửi Authorization, Cookie, Host, X-API-Key hoặc header nội bộ vào dictionary. Khi có body, backend dùng content-type application/json. Nền tảng không tự giữ/gửi credential của upstream.

```json
{"data":{"status":200,"headers":{"content-type":"application/json"},"body":"{\"weather\":\"sunny\"}","bodyEncoding":"utf8","latencyMs":42,"remainingRequests":4}}
```

`status` là HTTP status của upstream, còn HTTP 200 ngoài cùng là proxy thực thi thành công; upstream 4xx/5xx vẫn được trả trong data. `bodyEncoding` là utf8 cho text/JSON/XML chưa nén, base64 cho binary/nội dung còn mã hóa. FE cần escape nội dung hiển thị; không render response như HTML.

Lỗi chính: 403 `SSRF_DETECTED`, 400 `HEADER_NOT_ALLOWED`/`ENDPOINT_NOT_REGISTERED`, 413 `UPSTREAM_RESPONSE_TOO_LARGE`, 502 `UPSTREAM_REDIRECT_BLOCKED`/`UPSTREAM_UNAVAILABLE`, 504 `UPSTREAM_TIMEOUT`. Kiểm tra payload/DNS/IP trước khi tiêu thụ lượt; một lần đã cấp lượt thì lỗi upstream/timeout vẫn tính lượt. Lượt trừ theo PostgreSQL, không dựa vào FE. Rate limit Playground 30 request/phút/Consumer; API Consumer 60/phút/Consumer; public Marketplace limiter hiện có vẫn áp dụng.

### API Key

- `POST /api/consumer/api-keys`: `{"apiId":"1","label":"Weather app"}` → 201, metadata và `key` đầy đủ **một lần**. Hiển thị yêu cầu sao chép ngay.
- `GET /api/consumer/api-keys?page=1&pageSize=20` → `{data:{items,total,page,pageSize}}`, chỉ metadata, không có key/hash.
- `POST /api/consumer/api-keys/:id/rotate` với `{}` → 201 metadata/key mới; key cũ lập tức bị revoke. Rotate key cũ/revoked trả 409.
- `DELETE /api/consumer/api-keys/:id` → 204, gọi lại key của chính mình vẫn 204. Key người khác/không tồn tại trả 404.

Metadata: id, apiId, keyPrefix, label, isActive, lastUsedAt, revokedAt, createdAt. Một key active/Consumer/API. Secret `ak_live_` + 32 random bytes base64url; DB chỉ SHA-256 và prefix ngắn. Key chỉ chứng minh danh tính/phạm vi API; không thay quyền Subscription/Pricing ở Sprint 4.

## Hợp đồng nội bộ cho Dũng

```ts
const registry = new RoutingRegistry(pool);
const keys = new ApiKeyService(pool);
const route = await registry.resolve(apiId);
const identity = await keys.authenticate(rawApiKey, apiId);
```

`resolve()` trả `{id,apiId,upstreamBaseUrl,timeoutMs}`; timeout được cap 10.000 ms. Chỉ API Published, Provider active và route enabled. Bản ghi chưa có được bổ sung từ base_url của API Published khi resolve; route đã disable hoặc cấu hình riêng được giữ nguyên. Không cache trạng thái Published và không có HTTP endpoint công khai cho upstream registry. Khi vận hành đổi base URL của API đã từng có route, Dũng cần cập nhật route có chủ đích trước khi cho dùng lại; resolver không ghi đè cấu hình operator.

`authenticate()` xác thực hash, key active, user active/Consumer, đúng apiId, API Published và Provider active; cập nhật last_used_at và trả `{id,userId,apiId}`. Key cũ/revoked/sai scope trả 401 `INVALID_API_KEY`. Không log secret/hash. Đây là hàm backend, không mở endpoint HTTP để dò key. Kiểm tra lại mỗi request; không cache key sống qua revoke.

Gateway phải kiểm tra entitlement riêng và đi qua cùng `SafeProxy`/chính sách mạng khi forward; không đưa upstreamBaseUrl vào fetch tùy ý. Registry không phải bộ lọc SSRF. Có thể tái sử dụng `SafeProxy.prepare(...)` và `execute(...)`; các dependency DNS/request chỉ nhằm tách transport cho kiểm thử, server dùng mặc định an toàn, không có cờ cho phép private IP.

## Chính sách mạng

Chỉ HTTP(S), không credentials/hash/query trong base URL; mọi DNS answer phải public. Chặn private/loopback/link-local/multicast/special-use IPv4 và chỉ cho IPv6 global unicast ngoài các dải special/documentation/translation. Pin IP được kiểm tra vào socket, giữ hostname/SNI/TLS certificate validation, không follow redirect. Deadline tổng tối đa 10 giây bao gồm DNS/connect/read; buffer response tối đa 2 MiB; response chỉ trả content-type/content-language/cache-control/etag/last-modified.

API demo chạy trên loopback/mạng Docker nội bộ sẽ bị chặn như các host nội bộ khác. Kiểm thử dùng DNS/transport fixture, không nới SSRF để đi qua demo local. Deploy cần endpoint demo công khai phù hợp và egress firewall từ DevOps. Request đã được chấp nhận trước khi revoke/unpublish có thể đang chạy; request mới luôn kiểm tra lại trạng thái, không có cơ chế hủy toàn bộ in-flight request.

## Bàn giao nhóm

Kiểm chứng local ngày 26/10/2026: **108/108 test backend đạt** (90 có sẵn + 18 test mới), TypeScript/build/lint đạt và repo checker không lỗi nền tảng. CI/review GitHub phải xem trên PR của nhánh `codex/sprint3-consumer-backend`, không suy từ kết quả local.

Kiểm thử backend tự động bao gồm PostgreSQL thật và DNS/HTTP transport fixture cho các tình huống SSRF, redirect, timeout, giới hạn byte, quota đồng thời và vòng đời key. Các fixture HTTP mô phỏng request/socket: không coi đây là bằng chứng đã gọi TLS thật, kiểm tra chứng chỉ trên staging hoặc load test. Review độc lập đã xác nhận hai lỗi Unicode đầu vào được sửa và không tìm thấy Critical/Important còn lại trong phạm vi đã xem; điều đó không thay thế QA độc lập và staging.

- Hải Dương: nối các route trên thay dữ liệu mô phỏng; không coi source backend là frontend đã hoàn tất tích hợp.
- Dũng: tích hợp registry/key/safe transport vào Gateway HTTP; triển khai staging và upstream demo public.
- Vân: QA độc lập US-18/19/21/22 và end-to-end trên staging sau tích hợp. Bộ test hiện có không thay thế nghiệm thu staging.
- Tùng Dương: backend Marketplace/Detail/Sandbox/Key/Playground/registry, test và Swagger. Issue #12 chỉ đóng khi review/QA/staging đạt, không chỉ vì code đã triển khai.
