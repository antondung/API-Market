# Sprint 3 — Backend của Nguyễn Như Tùng Dương

Ngày bàn giao bước đầu: 21/10/2026. Theo issue #12. Nhánh `codex/sprint3-marketplace-detail`.

## Phạm vi đã triển khai

- US-16: Marketplace tìm kiếm tên/mô tả, lọc category/tag/provider/Free/Paid, sắp xếp và phân trang.
- US-17: API Detail công khai metadata, trạng thái xác minh Provider, version, endpoint, documentation, pricing đang hoạt động và loại dữ liệu/privacy.
- Chỉ đọc API `Published` của tài khoản Provider đang hoạt động. Tất cả trạng thái còn lại, API không tồn tại và Provider bị khóa trả cùng 404 khi đọc detail.
- Swagger tự tích hợp tại `/docs/` và `/openapi.json` khi chạy backend PostgreSQL.
- Không cần migration mới. Dùng schema 001/003/005 đã merge. Không đưa migration chưa merge của thành viên khác vào nhánh này.

## Hợp đồng cho Hải Dương

Không cần JWT cho hai endpoint công khai. Dùng backend origin đã cấu hình CORS.

```http
GET /api/marketplace/apis?q=weather&category=Weather&tag=forecast&providerId=1&pricing=free&sort=newest&page=1&pageSize=20
GET /api/marketplace/apis/1
```

Các bộ lọc tùy chọn kết hợp AND. `q` là substring không phân biệt hoa/thường trong tên/mô tả; `%` và `_` là ký tự thường, không phải wildcard. Category/tag khớp chính xác. `providerId` là ID bảng `api_providers`, không phải user ID.

`pricing=free` nghĩa là có gói active giá 0; `pricing=paid` nghĩa là có gói active giá >0. Một API có cả Free và Pro có thể khớp cả hai bộ lọc. Không so sánh giá giữa các loại tiền tệ.

`sort=newest` (mặc định): publishedAt giảm dần rồi ID giảm dần; `sort=name`: tên không phân biệt hoa/thường tăng dần rồi ID tăng dần. `page`: 1–10000; `pageSize`: 1–100 (mặc định 20). Trang vượt cuối trả items rỗng, giữ total đúng. Count và page/detail đọc trong cùng snapshot PostgreSQL.

Danh sách trả `{data:{items,total,page,pageSize}}`. Mỗi item có `id,name,description,category,tags,publishedAt,providerId,providerName,providerStatus,hasFreePlan,hasPaidPlan`. ID dạng string.

Detail trả `{data:{...item,versions,endpoints,documentation,plans,legal}}`:

- `versions`: id/version/changelog; thứ tự ID mới nhất trước.
- `endpoints`: id/versionId/method/path/description/parameters/requestSchema/responseExample.
- `documentation`: versionId/source/content (OpenAPI JSON công khai được Provider nhập).
- `plans`: chỉ active; id/name/priceMonthly/currency/quota/rateLimit. Các giá trị số trả JSON number.
- `legal`: dataClassification/processesPersonalData/personalDataTypes/dataProcessingPurpose; null nếu chưa có. Không trả nội dung hợp đồng nội bộ.

Không trả thông tin đăng nhập, email liên hệ xác minh, evidence, domain proof, audit hoặc nhận xét duyệt nội bộ. Không trả base URL riêng thành trường metadata công khai; tài liệu OpenAPI có thể chứa servers do Provider công bố.

Query sai/không hỗ trợ/tham số lặp/NUL trả 400 `VALIDATION_ERROR`; detail ID sai/không công khai trả 404 `NOT_FOUND`. Rate limit công khai 120 request/phút/IP, trả 429 `RATE_LIMITED`; header `Cache-Control: no-store` để không giữ thông tin API/tài khoản vừa bị thu hồi công khai.

## Kiểm thử

`npm test` build TypeScript và chạy toàn bộ unit/HTTP/PostgreSQL trên database tạm. Bộ integration mới `backend/integration/marketplace.test.ts` bao phủ visibility/RBAC dữ liệu, tài khoản bị khóa, AND filters, active pricing, literal search/SQL injection input, stable pagination, detail/version/docs/privacy, validation và Swagger registration. `git diff --check` và repo checker được chạy trước bàn giao.

Không coi unit/integration hoặc CI xanh là bằng chứng đã triển khai staging. QA/FE cần tích hợp và nghiệm thu sau khi PR merge.

Kết quả local: **81/81 test PASS** (76 test hiện có + 5 test integration Marketplace), bao gồm Swagger schema validation. Repo checker đạt, `git diff --check` sạch. Chưa chạy load test hoặc xác nhận staging.

## Phần tiếp theo và phụ thuộc

| Hạng mục issue #12 | Trạng thái | Phối hợp |
|---|---|---|
| US-16 Marketplace | Đã triển khai, chờ review/QA | Hải Dương nối API, Vân kiểm thử |
| US-17 API Detail | Đã triển khai, chờ review/QA | Hải Dương nối API, Vân kiểm thử |
| US-18 Playground Proxy chống SSRF | Chưa triển khai trong PR này | Backend Tùng Dương; cần quy ước route/timeout với Dũng |
| US-19 Sandbox 3–10 lượt | Chưa triển khai | Schema Sandbox trong PR #67 của Danh, chưa merge tại thời điểm viết |
| US-21 API Key hash/create/rotate/revoke | Chưa triển khai | Schema API Key trong PR #67 của Danh |
| US-22 Routing registry | Chưa triển khai | Schema gateway_routes từ Danh; hợp đồng Gateway với Dũng |
| Staging/QA toàn Sprint 3 | Chưa nghiệm thu | Dũng phụ trách deploy; Vân QA |

PR #66 và #67 đều thêm migration mang tiền tố 006 vào danh sách migration backend: cần Danh/Dũng tích hợp danh sách và các test đếm migration khi merge. Marketplace này không sửa schema hoặc phần Admin/Frontend/DevOps của các bạn.

US-18 có thể bắt đầu phần bảo vệ SSRF độc lập; việc Sandbox/Key/Route chưa merge không có nghĩa toàn bộ công việc backend tiếp theo bị chặn. Issue #12 vẫn mở tới khi toàn bộ hạng mục và Definition of Done đạt.
