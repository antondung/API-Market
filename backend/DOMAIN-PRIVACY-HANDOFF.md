# Bổ sung theo checklist Tùng Dương — 16/10/2026

**Cập nhật nghiệm thu 17/10:** Backend PR #49, frontend PR #52 và QA PR #54 đã merge; Tech Lead đã đóng issue #7/#8/#10. Các đoạn bên dưới mô tả bàn giao ngày 16/10, gồm trạng thái frontend còn mock tại thời điểm đó; frontend hiện đã nối API thật. Trạng thái kiểm chứng hiện hành và các ngoại lệ staging/toolchain xem [SPRINT-2-HANDOFF.md](SPRINT-2-HANDOFF.md).

Đã hoàn thiện phần backend còn thiếu trong ảnh phân công: khai báo dữ liệu cá nhân, xác minh tên miền và tích hợp luồng duyệt từ code Dũng. Chỉ bổ sung backend và contract; frontend do Hải Dương nối API, không sửa UI/mock của thành viên khác.

## Đối chiếu 9 mục

| Mục | Backend/kiểm tra |
|---|---|
| 1. Tạo/sửa/list API | CRUD Draft, ownership, pagination, Verified-only create |
| 2. Endpoint/version | CRUD, kiểm tra version thuộc API, bảo vệ state |
| 3. Upload/đọc mô tả | Multipart JSON/YAML, OpenAPI parse/validate, transaction và documentation |
| 4. Cam kết API thuộc người bán | ownershipDeclaration và distributionRights lưu PostgreSQL cùng legal declaration |
| 5. Dữ liệu cá nhân | processesPersonalData bắt buộc, personalDataTypes và dataProcessingPurpose; kiểm tra consistency |
| 6. Cam kết điều khoản | agreementVersion hiện hành và acceptedAt server, audit acceptance |
| 7. Xác minh domain | DNS TXT challenge thật, mã hash trong DB, owner/API/hostname binding, expiry và rate limit |
| 8. Gửi và duyệt API | Submit/reopen Provider + tích hợp nguyên commit Admin/Audit của Dũng 63e8aea; fix chuyển Under Review bị lặp; test approve/reject/publish/audit |
| 9. Kiểm thử | Unit/HTTP/PostgreSQL, DNS transport tới máy chủ cục bộ kiểm thử, giả lập lỗi DNS/rotation/timeout, rollback audit |

## Migration và tương thích

Chạy `npm run db:migrate` trước startup: CLI thêm migration **005_provider_domain_privacy.sql**, giữ nguyên migration 001–004 của Danh. Migration 005 thêm fields privacy và bảng api_domain_verifications, chạy cùng history/checksum. Rollback ứng dụng phải giữ các cột mới, không xóa dữ liệu chứng minh.

Legal declaration cũ có processesPersonalData = null (chưa khai báo), không tự suy đoán false. Provider phải gửi lại legal declaration rõ ràng trước lần submit tiếp theo. Seed demo của Danh giữ nguyên, chưa có khai báo/domain proof thật; các API demo Submitted/Published là dữ liệu minh họa đã tồn tại, không được coi là đã chứng minh domain.

## Payload pháp lý

```json
{
  "ownershipDeclaration": "Tôi có quyền cung cấp API này",
  "distributionRights": "Cho phép phân phối theo điều khoản đã chấp nhận",
  "dataClassification": "Confidential",
  "agreementVersion": "2026-10",
  "accepted": true,
  "processesPersonalData": true,
  "personalDataTypes": ["Email", "Phone"],
  "dataProcessingPurpose": "Liên hệ hỗ trợ tài khoản"
}
```

Gửi PUT `/api/provider/apis/:id/legal`. Nếu false: personalDataTypes phải là `[]`, bỏ dataProcessingPurpose. Nếu true: bắt buộc ít nhất một loại và mục đích. Enum: FullName, Email, Phone, Geolocation, Financial, Credentials, HealthBiometrics, Other. Không cho gửi acceptedAt; server ghi thời điểm. Phân loại dữ liệu Public/Internal/Confidential/Restricted vẫn là trường riêng, không thay câu hỏi có xử lý dữ liệu cá nhân.

## DNS xác minh tên miền thật

1. Provider tạo Draft API có baseUrl là domain mình kiểm soát.
2. POST `/api/provider/apis/:id/domain-verification/challenge` với `{}`. Nhận recordType TXT, recordName `_apihub-verification.<hostname>` và recordValue ngẫu nhiên `platform-verification=...`, challengeExpiresAt.
3. Thêm chính xác bản ghi TXT ở nhà quản lý DNS của **hostname trong baseUrl**. Nếu baseUrl là api.example.com thì record là `_apihub-verification.api.example.com`; không tự dùng parent domain.
4. POST `/api/provider/apis/:id/domain-verification/verify` với `{}`. Backend dùng DNS resolver thật, nối các chunk trong cùng TXT record và so hash challenge. Chưa thấy bản ghi trả 400 (DNS có thể cần thời gian lan truyền), resolver lỗi trả 503 để retry. Không có HTTP fetch, redirect hoặc truy cập `/.well-known`.
5. GET `/api/provider/apis/:id/domain-verification` để đọc trạng thái; không trả token/hash. TXT proof chứng minh khả năng điều khiển DNS, không thay thế kiểm tra quyền sở hữu pháp lý bởi Admin.

Challenge ngẫu nhiên 256 bit, chỉ lưu SHA-256, hết hạn sau 24h. Tạo challenge mới thay mã và xóa trạng thái verified cũ. Kết quả verified có hiệu lực 7 ngày; hết hạn cần challenge/verify lại. Đổi hostname xóa proof; đổi path trên cùng hostname không cần xác minh lại. API khác cùng hostname vẫn phải có mã riêng. Chặn IP, localhost/internal/test domain và URL chứa credentials. Rate limit 10 yêu cầu challenge/verify mỗi phút/Provider/instance; multi-instance cần limiter dùng chung do DevOps cấu hình.

Submit yêu cầu proof còn hạn cho hostname hiện tại **và** privacy declaration rõ ràng. DNS lookup không giữ DB lock; sau lookup transaction kiểm tra lại owner/state/hostname/challenge/expiry để chống request cũ xác minh challenge mới. Không có tùy chọn request tự đặt verified=true hay bypass production. Dev không sở hữu domain nên dùng fixture DNS trong test, không seed trạng thái thành công cho sản phẩm.

## Tích hợp Admin và frontend

Nhánh Dũng `feature/6-admin-review-audit`, commit 63e8aea đã được merge vào nhánh PR #49 với nguyên provenance. Backend Admin review + AuditService là phần Dũng; Provider gọi audit trong transaction cho create/update/import/legal/submit/reopen/domain. Không lưu mã DNS, nội dung legal hoặc dữ liệu cá nhân trong detail audit. Audit lỗi thì mutation rollback.

Swagger `/docs/`, `/openapi.json` hiện có 30 thao tác Provider và 8 thao tác Admin review/audit (ngoài Auth/Admin user đã có). Dossier Admin gồm privacy legal và domain proof timestamp. Fix tích hợp: request next=Under Review từ Submitted chỉ chuyển một bước, không tạo Under Review → Under Review; gọi lặp trả 409.

Hải Dương cần bỏ `setTimeout`/token ngẫu nhiên ở frontend CreateApiWizardPage và gọi ba endpoint DNS; gửi payload pháp lý mới, hiển thị lỗi 400/409/429/503. Nếu muốn kiểm tra domain trước khi hoàn tất wizard, phải tạo Draft trước và giữ api.id. UI hiện tại vẫn mock; không khẳng định mọi nút frontend đã nối thật. Staging/deploy do Dũng thực hiện, QA nghiệm thu do Vân xác nhận.

## Kiểm chứng

Chạy `npm test`, `npm run lint`, `npm run build`, `./scripts/kiem-tra-kho-ma-nguon.ps1`. Test integration dùng PostgreSQL thật và DNS TXT resolver thật tới DNS UDP fixture cục bộ; không cần quyền thay DNS public, không lệ thuộc Internet. Các test DNS lỗi dùng resolver injection chỉ ở constructor test, production luôn resolver mặc định có timeout/cancel. CI và kết quả test cuối được dẫn trên PR #49/issue #7; review và QA chưa được tự đánh dấu Done.
