# Bàn giao Backend Sprint 2 — Nguyễn Như Tùng Dương

Ngày cập nhật: 14/10/2026. Issue #7, PR #49 vào develop. Phạm vi: US-06, US-08, US-09, US-10, US-11, US-12 và test backend liên quan.

## Code và tài nguyên nhóm

| Thành viên | Kết quả kiểm tra GitHub ngày 14/10 |
|---|---|
| Danh | Đã push schema, seed, ERD và OpenAPI demo tại nhánh feature/9-provider-database, commit 8af8805. Chưa có PR/merge vào develop. Backend dùng nguyên file SQL 003/004 và ba file demo JSON từ commit này; không sửa SQL của Danh. |
| Dũng | Chưa thấy code/bàn giao Sprint 2 mới; issue #6 còn mở, chưa có comment. Admin duyệt Provider/API, Audit Log dùng chung và staging thuộc phần Dũng. |
| Hải Dương | Frontend Sprint 1 và màn hình Provider dùng dữ liệu mock có trên develop; chưa thấy API client Provider Sprint 2 được bàn giao ở issue #8. |
| Vân | Test report Sprint 1 đã có; chưa thấy acceptance/test report Sprint 2 bàn giao ở issue #10. |

## Đã triển khai

- HTTP `/api/provider` có JWT, role Provider, ownership và lỗi chuẩn; Admin/Consumer không tự thao tác thay Provider. GET API khác owner trả 404 để không lộ tài nguyên.
- Xác minh Provider: GET/POST `/verification`. Hồ sơ mới Pending; chặn gửi trùng Pending/Verified, Rejected được gửi hồ sơ mới. Backend dùng hồ sơ mới nhất để quyết định Verified; không tự viết endpoint Admin approve/reject.
- API Draft: list có page/pageSize, create chỉ cho Verified, get/update/delete thuộc owner và chỉ edit/delete Draft. IDs là PostgreSQL integer nhưng trả dạng string; không nhận owner/status từ client.
- Version: list/create/update/delete; endpoint list/create/update/delete có versionId, method/path, parameters/requestSchema/responseExample; chặn versionId của API khác. Xóa version cascade nội dung theo schema.
- Pricing Free/Basic/Pro: list/create/update/delete; giá không âm, tối đa hai số thập phân theo NUMERIC(14,2), Free giá 0, quota/rate limit dương. Currency mã ba chữ cái; quota theo tháng, rateLimit theo giây theo contract đề xuất để nhóm xác nhận.
- Pháp lý: quyền sở hữu/phân phối, Data Classification, agreement version. Chỉ accept agreement đang active/effective; acceptedAt ghi bằng thời gian server, không cho client gửi. Agreement chưa cấu hình hoặc đổi version trả 409.
- Import multipart JSON/YAML, max 1 MiB, một file và versionId. Swagger 2.0/OpenAPI 3.0.x; parse parameters/request body/responses/security, giải local refs, sinh documentation. Cấm URL/file external refs, circular refs, alias đệ quy, tài liệu quá sâu/phức tạp, duplicate operationId, thiếu path parameter; tối đa 1000 operations. Không fetch baseUrl hoặc evidence URL.
- Import thay endpoints và documentation trong cùng transaction; rollback giữ dữ liệu cũ nếu ghi lỗi. Manual endpoint/version edit vô hiệu docs import để yêu cầu import lại trước gửi duyệt.
- Gửi duyệt: Draft → Submitted khi Provider mới nhất Verified, có metadata, endpoint + documentation cùng version, pricing và pháp lý đã accept agreement hiện hành. Ownership/state/content checks và write nằm trong transaction; lock Provider/API chống hai submission cùng thành công hoặc ghi tiếp vào Submitted. Rejected → Draft qua `/reopen`.
- Workflow policy hỗ trợ Submitted → Under Review → Approved → Published hoặc Rejected để Dũng tích hợp; endpoint Admin và Audit Log dùng chung do Dũng thực hiện. Trigger trạng thái của Danh giữ nguyên.
- Swagger chạy thật `/docs/`, OpenAPI `/openapi.json` gồm Auth và 27 thao tác Provider khi server dùng PostgreSQL. Contract riêng `provider-sprint2.openapi.json` sinh từ provider-contract.ts, có request/response schemas.

## Chạy và nhận API

```powershell
npm ci
# Cấu hình .env: AUTH_STORE=postgres, DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm run db:migrate
npm run dev
```

Migration CLI áp dụng 001 + 003 mặc định, giữ history/checksum/advisory lock. 002 + 004 chỉ chạy explicit `npm run db:seed` ở development; bị chặn production. Server không tự migrate/seed và kiểm tra schema Provider khi startup. Database Auth đã có phải migrate 003 trước khi chạy server mới.

Seed demo chỉ dùng DB development dành riêng cho demo. Nếu đã có agreement active khác, seed 004 của Danh trả conflict; backend không tự tắt agreement hoặc ghi đè dữ liệu hiện có. Migration SQL đã tạo trực tiếp không có history cần được quản lý bởi nhóm DB, không chạy lại CREATE TABLE trên schema hiện có.

Ví dụ import sau khi tạo Draft API và version:

```powershell
curl.exe -H "Authorization: Bearer <access-token>" -F "versionId=<version-id>" -F "file=@mock-services/weather/openapi.json" http://127.0.0.1:3000/api/provider/apis/<api-id>/import-openapi
```

CLI parse độc lập: `npm run provider:import -- mock-services/weather/openapi.json`. Không ghi database hoặc gọi network. Chỉ mở Swagger ở máy chạy backend; chưa có URL staging public được bàn giao.

## Kiểm tra

59 test backend pass: 37 unit/HTTP và 22 integration PostgreSQL thật (11 test Provider mới). Kiểm tra CRUD/ownership/version binding, Pending/Rejected/Verified, import cả ba demo Danh, multipart lỗi/quá lớn, rollback bằng lỗi DB cố ý, docs tồn tại sau reconnect, agreement server timestamp/current version, điều kiện gửi duyệt, submission cạnh tranh, freeze Submitted, reopen Rejected, migration/seed rerun. Test Admin chỉ mô phỏng cập nhật SQL trong fixture, không triển khai module Admin sản phẩm.

Đợt rà soát đã sửa multipart bị cắt trả 400 thay vì 500; chặn NUL trong input/JSONB import; xóa cached OpenAPI khi sửa nội dung; yêu cầu documentation cho mọi endpoint ở mọi version trước gửi duyệt. Parser giới hạn graph sau dereference trước validate/serialize để chặn local refs phóng đại dữ liệu. reviewedBy trả ID string đúng contract. Test hồi quy tái hiện lỗi và xác nhận bản sửa; schema Danh giữ nguyên.

`npm test`, `npm run lint`, `npm run build`, `scripts/kiem-tra-kho-ma-nguon.ps1` và `git diff --check` dùng để kiểm tra lại. Runner tạo PostgreSQL tạm hoặc dùng PG_TEST_URL cho DB test riêng; bootstrap pgcrypto trước khi các file test chạy song song. Kết quả CI đúng commit bàn giao được dẫn trong PR #49 và issue #7.

## Các bước còn cần nghiệm thu

1. Danh mở PR schema hoặc nhóm chấp nhận dependency commit 8af8805; bản này mang theo nguyên SQL và demo JSON để backend/test chạy được, không đưa thay đổi Docker của Danh vào phạm vi PR.
2. Dũng nối Admin approval/review/publish, Audit Log và deploy staging; cấu hình agreement production riêng. Tùng Dương bàn giao state policy và schema mapping.
3. Hải Dương nối API client với prefix `/api/provider`, payload/versionId, response camelCase và trạng thái Submitted/Under Review (frontend cũ dùng PENDING_REVIEW cần mapping).
4. Vân kiểm thử acceptance/role matrix và luồng tích hợp Provider → Admin → Publish; Tùng Dương sửa bug backend phát sinh.

Phần backend của Tùng Dương đã triển khai và kiểm thử; chưa tuyên bố toàn bộ Sprint 2 đạt DoD vì staging, tích hợp frontend/Admin, review và QA vẫn chờ. Issue #7 giữ mở. OpenAPI 3.1 import chưa hỗ trợ; contract mô tả API của hệ thống dùng OpenAPI 3.1. Evidence/baseUrl chỉ lưu dưới dạng URL; chưa triển khai lưu trữ file hồ sơ. Không thực hiện phần của Danh, Hải Dương, Dũng hoặc Vân thay họ.
