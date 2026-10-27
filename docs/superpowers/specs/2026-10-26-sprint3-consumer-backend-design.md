# Sprint 3 — phần backend Nguyễn Như Tùng Dương

Nguồn: issue #12; schema #67 đã merge; hợp đồng Marketplace #69; AC trong PR QA #76 là tham chiếu chưa merge. Người dùng đã chọn triển khai luôn và giao quyết định chi tiết theo dự án.

## Phạm vi và lựa chọn

Giữ Node.js/TypeScript/Express/PostgreSQL, tái sử dụng AuthService, schema 006 và Marketplace. Triển khai nội bộ trong backend hiện có để không tạo thêm service vận hành. Phương án phụ thuộc hoàn toàn Gateway của Dũng sẽ chặn US-18 khi Gateway chưa có; phương án proxy tùy ý URL không đáp ứng SSRF. Chọn proxy an toàn có thể dùng chung ở Gateway, không viết thay Report/Moderation/Profile/Gateway HTTP của Dũng hoặc frontend Hải Dương.

## Hợp đồng

- Consumer đăng nhập: GET/POST `/api/consumer/apis/:apiId/sandbox`, một grant duy nhất, 5 lượt/24 giờ; reload/POST lặp không gia hạn/reset, grant cũ hết hạn vẫn tồn tại. Cấu hình server 3–10 lượt, không nhận quota từ client.
- POST `/api/marketplace/apis/:id/playground`: Consumer JWT, endpointId bắt buộc, pathParams/query/headers/body JSON; không nhận URL/method tùy ý. Endpoint và route phải thuộc API Published của Provider active. Chuẩn bị/kiểm tra SSRF trước khi trừ một lượt; request đã được cấp lượt vẫn bị tính nếu upstream lỗi. Không giữ transaction DB trong lúc chờ mạng.
- API Key: GET/POST `/api/consumer/api-keys`, POST `/:id/rotate`, DELETE `/:id`; chỉ key của Consumer hiện tại. Create/rotate trả secret một lần, các response khác không trả hash/secret. CSPRNG 256 bit, SHA-256, khóa cũ bị revoke nguyên tử khi rotate. Một key active/User/API theo schema. Key dùng cho API Published, không thay entitlement Subscription ở Sprint 4.
- `RoutingRegistry.resolve(apiId)` trả route đã enable, chỉ API Published/Provider active; bổ sung bản ghi thiếu từ base_url khi resolve, không bật lại route bị disable. Không có HTTP public cho đọc upstream registry.
- `ApiKeyService.authenticate(secret, apiId)` dành cho Gateway Dũng: kiểm tra key/owner/API còn hoạt động và cập nhật last_used_at; không có endpoint verify công khai.

## An toàn mạng

Chỉ HTTP(S), không credentials/hash/query trong upstream base URL. Kiểm tra toàn bộ DNS A/AAAA, từ chối mọi địa chỉ không public; pin IP đã kiểm tra vào socket bằng custom lookup, giữ hostname cho TLS. Không theo redirect. Deadline tổng tối đa 10 giây bao gồm DNS/connect/read, response tối đa 2 MiB; body request chịu giới hạn 16 KiB hiện có. Bảo vệ path traversal và không cho đổi host qua pathParams/query. Chỉ chuyển tiếp accept/accept-language/content-type, không chuyển Authorization/Cookie/X-API-Key/header nội bộ; response chỉ cho các header công khai được chọn. Không log header/body/key/hash hoặc chi tiết DNS/upstream error.

## Kiểm thử và nghiệm thu

Test PostgreSQL thật cho Sandbox concurrent, quota không reset, expiry, API visibility/owner disable; key hash/one-time/ownership/atomic rotate/revoke/lastUsed. Unit + HTTP transport test cho SSRF IPv4/IPv6/mixed DNS/rebinding/redirect/timeout/body limit/path/header. DNS/transport ngoài test không có cờ bypass private-IP. Test fixture mạng cục bộ được đặt tại test, không thêm cấu hình nới SSRF cho production. Swagger được validate toàn bộ. Chạy full backend, CI API/browser E2E trước bàn giao.

Staging/deploy của Dũng và QA độc lập của Vân là điều kiện bàn giao nhóm; không tự đánh dấu đã đạt nếu chưa có bằng chứng. Không sửa báo cáo cá nhân ngoài repository và không đưa báo cáo đó lên Git.
