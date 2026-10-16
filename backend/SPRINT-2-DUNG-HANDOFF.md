# Bàn giao Admin Review + Audit Log — Sprint 2

- Thành viên: Nguyễn Tấn Dũng — GitHub: @antondung
- Dự án: API Market
- Issue: [#6](https://github.com/antondung/API-Market/issues/6)
- Nhánh: `feature/6-admin-review-audit`
- Nền tảng: nhánh `codex/issue-7-provider-foundation` của Tùng Dương (PR #49) + schema 003/004 của Danh

## 1. Phạm vi đã làm

Issue #6 gồm 5 việc. Trạng thái:

| # | Nhiệm vụ | Trạng thái |
|---|---|---|
| 1 | Admin duyệt Provider (danh sách chờ, xem hồ sơ, Approve/Reject kèm lý do) [US-07] | Hoàn thành |
| 2 | Admin duyệt API (xem đủ hồ sơ, Approve/Reject/Publish theo luồng trạng thái) [US-13] | Hoàn thành |
| 3 | Audit Log dùng chung (service + API xem, lọc) [US-14] | Hoàn thành |
| 4 | Tích hợp luồng Provider → Admin → Publish | Hoàn thành |
| 5 | CD deploy staging + 3 API demo trên staging [EN-07, EN-08] | **Chưa làm** — xem mục 6 |

## 2. API đã bàn giao

Tất cả nằm dưới `/api/admin`, yêu cầu JWT và role **Admin**.

### Duyệt Provider

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/admin/provider-verifications?status=Pending` | Danh sách chờ duyệt (lọc theo `Pending`, `Verified`, `Rejected`) |
| GET | `/api/admin/provider-verifications/:providerId` | Xem hồ sơ xác minh mới nhất của Provider |
| POST | `/api/admin/provider-verifications/:providerId/review` | `{ decision: "Verified" \| "Rejected", reason? }` |

Chỉ xét hồ sơ **mới nhất** của mỗi Provider. Hồ sơ đã duyệt không duyệt lại được (trả `409`). Từ chối bắt buộc có lý do (trả `400`).

### Duyệt API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/admin/apis?status=Submitted` | Danh sách API theo trạng thái |
| GET | `/api/admin/apis/:id/dossier` | Hồ sơ đầy đủ để ra quyết định |
| POST | `/api/admin/apis/:id/review` | `{ next: "Under Review" \| "Approved" \| "Rejected" \| "Published", reason? }` |

`dossier` trả về: thông tin API, Provider kèm trạng thái xác minh, versions, endpoints, plans, legal declaration, documentation và lịch sử review. Đây là dữ liệu Admin cần kiểm tra trước khi duyệt.

### Audit Log [US-14]

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/admin/audit-logs` | Xem, lọc theo `actorId`, `action`, `targetType`, `targetId`, `from`, `to`, `page`, `pageSize` |
| GET | `/api/admin/audit-logs/actions` | Danh sách tên hành động đã ghi, để FE dựng bộ lọc |

## 3. Quy tắc nghiệp vụ quan trọng

### Luồng trạng thái API

Database trigger trong `migrations/003` chỉ cho phép **chuyển một bước**:

```
Draft → Submitted → Under Review → Approved → Published
                         ↓
                      Rejected → Draft (Provider reopen)
```

Vì vậy khi Admin bấm **Approved**, service tự chạy hai bước `Submitted → Under Review → Approved` trong cùng một transaction. Admin không cần bấm "Under Review" thủ công.

### Mỗi thao tác duyệt ghi 2 nơi

1. Bảng `api_reviews` — lịch sử chuyển trạng thái, có `reason`.
2. Bảng `audit_logs` — ai làm, vai trò gì, tác động lên đối tượng nào, chi tiết JSON.

Cả hai nằm trong **cùng transaction** với việc đổi trạng thái. Nếu ghi log lỗi thì trạng thái cũng rollback.

Ghi chú: một lần Admin bấm Approved tạo **2 dòng `api_reviews`** nhưng **1 dòng `audit_logs`**, vì đó là một hành động của Admin. Chi tiết JSON có trường `steps` liệt kê các bước đã chạy.

### Audit Log dùng chung

`AuditService.write(client, entry)` nhận `Pool` hoặc `PoolClient`, nên Provider flow của Tùng Dương có thể gọi trong transaction của mình:

```ts
await audit.write(client, {
  actorId, actorRole: 'API_PROVIDER',
  action: 'api.submitted',
  targetType: 'api', targetId: String(apiId),
  detail: { name: api.name }, ip,
});
```

Ledger hiện có sẵn một entry mẫu từ seed: `DEMO_DATA_SEEDED`.

## 4. File đã thêm và sửa

| File | Trạng thái | Nội dung |
|---|---|---|
| `backend/src/audit-service.ts` | Mới | Ghi và truy vấn audit log, dùng chung cho Admin và Provider |
| `backend/src/admin-review-service.ts` | Mới | Nghiệp vụ duyệt Provider, duyệt API, gom dossier |
| `backend/src/admin-review-router.ts` | Mới | HTTP `/api/admin/*`, validate bằng zod |
| `backend/integration/admin-review.test.ts` | Mới | 9 test tích hợp trên PostgreSQL thật |
| `backend/src/app.ts` | Sửa | Mount router Admin, thêm `review`/`audit` vào `AppOptions` |
| `backend/src/server.ts` | Sửa | Khởi tạo `AuditService` và `AdminReviewService` khi dùng PostgreSQL |

## 5. Kết quả kiểm tra

```
ℹ tests 67
ℹ pass 67
ℹ fail 0
```

Trong đó **9 test mới** cho Admin review:

1. Duyệt Provider ghi audit log và mở khoá tạo API.
2. Từ chối Provider bắt buộc có lý do, và chặn tạo API.
3. Hồ sơ đã duyệt không duyệt lại được.
4. API đi đúng `Submitted → Under Review → Approved → Published`.
5. Từ chối API bắt buộc lý do, Provider reopen được về Draft.
6. Chặn publish API chưa Approved.
7. Consumer/Provider bị chặn khỏi toàn bộ API Admin.
8. Audit log lọc, phân trang, và liệt kê danh sách action.
9. Kiểm tra khoảng thời gian không hợp lệ trả `400`.

Kiểm tra thủ công trên server thật đã chạy:

| Bước | Kết quả |
|---|---|
| Provider gửi hồ sơ → Admin xem hàng chờ | Hàng chờ hiện đúng 1 hồ sơ |
| Admin từ chối không lý do | `400 REASON_REQUIRED` |
| Admin duyệt | `200`, `reviewedBy=1` |
| Duyệt lần hai | `409 VERIFICATION_ALREADY_REVIEWED` |
| Duyệt API: xem dossier | Đủ api, provider, versions, endpoints, plans, legal, docs |
| Publish khi chưa Approved | `409 INVALID_TRANSITION` |
| Approve rồi Publish | `200`, có `approvedAt` và `publishedAt` |
| Audit trail | 2 entry, đúng action và target |
| Consumer gọi API Admin | `403` ở cả 4 endpoint |

## 6. Việc chưa làm và lý do

Hai mục sau **chưa hoàn thành** và cần nhóm quyết định:

| Mục | Lý do | Đề xuất |
|---|---|---|
| CD tự động deploy staging [EN-08] | Chưa có môi trường staging, chưa có máy chủ đích | Làm khi có hạ tầng; hiện chỉ chạy CI |
| 3 API demo lên staging [EN-07] | Ba file OpenAPI demo đã có trong `mock-services/` nhưng chưa có staging để deploy | Cần thống nhất staging trước |

Repo hiện chỉ có CI kiểm tra tự động. Chưa có môi trường staging công khai.

## 7. Điểm cần nhóm chốt

1. **Trạng thái "Under Review" có cần Admin bấm riêng không?** Hiện tại Approve tự chạy qua bước này. Nếu muốn Admin bấm riêng thì cần sửa lại.
2. **Ai ghi audit cho Provider?** Service đã sẵn sàng, nhưng Tùng Dương cần thêm lời gọi vào `provider-service.ts`.
3. **Provider Agreement và version:** hiện chỉ nhận agreement `is_active`. Cần thống nhất khi đổi version.
4. **Địa chỉ IP trong audit:** hiện lưu `null` khi request đến từ localhost để tránh ghi địa chỉ nội bộ vô nghĩa. Khi lên staging cần bật `trust proxy` đúng cách.

## 8. Cách chạy

```powershell
npm ci
# .env cần: AUTH_STORE=postgres, DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm run db:migrate
npm run db:seed
npm run dev
```

Swagger tại `/docs/`. Server chỉ chạy module Admin khi `AUTH_STORE=postgres`.

## 9. Bàn giao cho các thành viên

| Thành viên | Cần làm gì |
|---|---|
| **Hải Dương** (FE) | Nối trang Admin vào 8 endpoint ở mục 2. Bỏ dữ liệu mẫu ở `UserManagementPage`, `ProviderVerificationsPage`, `ApiReviewsPage`, `AuditLogsPage` |
| **Tùng Dương** (BE) | Gọi `AuditService.write` trong các bước `submit-review`, `reopen`, import OpenAPI và tạo/sửa API để ledgers đầy đủ |
| **Vân** (QA) | Test theo mục 3 và 5. Chú ý: duyệt hai lần, từ chối thiếu lý do, publish sai thứ tự, phân quyền Admin |
| **Danh** (DB) | Schema 003 đã đủ dùng, không cần đổi. Xác nhận trigger `enforce_api_status_transition` giữ nguyên |
