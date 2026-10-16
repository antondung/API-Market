# Sprint 2 Provider Frontend Implementation Checklist

Dự án: **API-Market**  
Nhánh: `codex/sprint2-provider-fe`  
Phụ trách: **Lê Hải Dương** (@leduwn)  
Baseline commit: `3a4d644fcf2fc4c41b874e65b7583cc610a77031`  
Backend contract: PR #49 (`origin/codex/issue-7-provider-foundation:backend/provider-sprint2.openapi.json`)

---

## Bảng kiểm nội bộ hiện trạng (Phases 0 - 11)

| Task | UI thành phần | API hợp đồng (PR #49) | Chức năng hoàn thiện | Test suite | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| **Provider Verification (US-06)** | `ProviderVerificationPage.tsx` | GET `/api/provider/verification`, POST `/api/provider/verification` | Đấu nối backend API thực tế. Quản lý 4 trạng thái (`Draft`/`Unverified`, `Pending`, `Verified`, `Rejected`). Hiển thị `rejectReason`, khóa form khi Pending/Verified, mở khóa resubmit khi Rejected. Form validation. | `ProviderVerificationPage.test.tsx` (7 tests) | **Hoàn thành (100%)** |
| **API Inventory & Creation (US-09)** | `MyApisInventoryPage.tsx`, `CreateApiWizardPage.tsx` | GET `/api/provider/apis`, POST `/api/provider/apis`, GET/PUT/DELETE `/api/provider/apis/:id` | Bảng danh mục API phân trang, tìm kiếm, lọc danh mục. Chặn tạo API nếu provider chưa Verified kèm modal chuyển hướng. Tạo API mới, cập nhật, xóa bản nháp (Draft). | `MyApisInventoryPage.test.tsx` (4 tests) | **Hoàn thành (100%)** |
| **Endpoint & Version Management (US-09)** | `EndpointManagementPage.tsx` | GET/POST `/api/provider/apis/:id/versions`, GET/POST/PUT/DELETE `/api/provider/apis/:id/endpoints` | Quản lý danh sách phiên bản API. Quản lý endpoints: Method, Path, mô tả, params (path/query/header/body), requestSchema JSON, responseExample JSON. Cảnh báo mất đồng bộ tài liệu khi sửa manual. | `EndpointManagementPage.test.tsx` (5 tests) | **Hoàn thành (100%)** |
| **OpenAPI 3.0 Import (US-10)** | `OpenApiImportPage.tsx` | POST `/api/provider/apis/:id/import-openapi` (multipart/form-data) | Kéo thả / chọn file `.json` hoặc `.yaml`/`.yml` (giới hạn <= 1MB). Gửi multipart upload thực tế lên server. Xử lý phản hồi `versionId` và `endpointCount`. | `OpenApiImportPage.test.tsx` (3 tests) | **Hoàn thành (100%)** |
| **Documentation Viewer 7 Mục (US-10)** | `DocumentationViewer.tsx` | GET `/api/provider/apis/:id/documentation` | Hiển thị 7 khối tài liệu chuẩn hóa: 1. Tổng quan (Overview), 2. Xác thực (Auth), 3. Endpoints, 4. Tham số (Params), 5. Cấu trúc Request Body, 6. Mã phản hồi (Responses), 7. Bảng mã lỗi (Errors). Thoát ký tự an toàn chống XSS. | Tích hợp trong `OpenApiImportPage.test.tsx` | **Hoàn thành (100%)** |
| **Pricing Plans Management (US-11)** | `PricingManagementPage.tsx` | GET/POST `/api/provider/apis/:id/plans`, PUT/DELETE `/api/provider/apis/:id/plans/:pid` | Bảng giá 3 gói Free/Basic/Pro. Ràng buộc gói Free bắt buộc `priceMonthly === 0`. Ràng buộc quota >= 1, rateLimit >= 1. Chuyển đổi đơn vị tiền tệ VND/USD. Modal xác nhận xóa gói cước. | `PricingManagementPage.test.tsx` (3 tests) | **Hoàn thành (100%)** |
| **Legal & Agreement (US-08)** | `CreateApiWizardPage.tsx`, `PublishingWorkflowPage.tsx` | GET `/api/provider/agreement`, GET/PUT `/api/provider/apis/:id/legal` | Tải phiên bản thỏa thuận nhà cung cấp mới nhất từ backend. Checkbox cam kết chủ động. Phân loại dữ liệu `DataClassification` (Public/Internal/Confidential/Restricted). Bắt buộc hoàn tất trước khi nộp duyệt. | `PublishingWorkflowPage.test.tsx`, `providerApi.test.ts` | **Hoàn thành (100%)** |
| **Domain Checking (US-08)** | `CreateApiWizardPage.tsx`, `providerApi.ts` | Thuộc tính `baseUrl` trong Provider API schema | Kiểm tra định dạng cú pháp URL hợp lệ (HTTP/HTTPS URL format), ngăn chặn URL giả mạo hoặc protocol không an toàn. | `providerApi.test.ts` | **Hoàn thành (100%)** |
| **Publishing Workflow & Status (US-12)** | `PublishingWorkflowPage.tsx` | GET `/api/provider/apis/:id/publish-status`, POST `/api/provider/apis/:id/submit-review` | Thanh tiến trình trực quan 5 giai đoạn: `Draft` -> `Submitted` -> `UnderReview` -> `Approved` -> `Published`. Xử lý trạng thái `Rejected`. Kiểm tra 4 điều kiện sẵn sàng (Readiness Checklist) và nút nộp duyệt cho admin. | `PublishingWorkflowPage.test.tsx` (3 tests) | **Hoàn thành (100%)** |

---

## Tiến độ theo từng hạng mục

- [x] Provider Verification (US-06)
- [x] API Create/Edit (US-09)
- [x] Endpoint & Version Management (US-09)
- [x] OpenAPI 3.0 Import (US-10)
- [x] Documentation Viewer 7 Mục (US-10)
- [x] Pricing Plan Management (US-11)
- [x] Ownership Declaration (US-08)
- [x] Personal Data & Data Classification Declaration (US-08)
- [x] Domain Syntax Validation (US-08)
- [x] Provider Agreement Versioning (US-08)
- [x] Submission Readiness & Workflow Tracking (US-12)
- [x] UI/UX, Responsive (375px - 1440px), Themes, i18n & Test Coverage

---

## Chi tiết Kết quả Kiểm thử (Test Suites Summary)

Toàn bộ **13 files kiểm thử** với tổng cộng **86 unit/component tests** đạt tỷ lệ thành công **100%**:

```text
 ✓ src/test/AuthContext.test.tsx (7 tests)
 ✓ src/test/ProtectedRoute.test.tsx (6 tests)
 ✓ src/test/adminUsersApi.test.ts (7 tests)
 ✓ src/test/SessionSimulatorPage.test.tsx (3 tests)
 ✓ src/test/UserManagementPage.test.tsx (8 tests)
 ✓ src/test/authApi.test.ts (11 tests)
 ✓ src/test/providerApi.test.ts (19 tests)
 ✓ src/test/ProviderVerificationPage.test.tsx (7 tests)
 ✓ src/test/EndpointManagementPage.test.tsx (5 tests)
 ✓ src/test/OpenApiImportPage.test.tsx (3 tests)
 ✓ src/test/PricingManagementPage.test.tsx (3 tests)
 ✓ src/test/PublishingWorkflowPage.test.tsx (3 tests)
 ✓ src/test/MyApisInventoryPage.test.tsx (4 tests)

 Test Files  13 passed (13)
      Tests  86 passed (86)
```

---

## Kiểm tra Đóng gói Sản phẩm (Production Build Check)

- Lệnh thực thi: `npm run build` (`tsc -b && vite build`)
- Trạng thái: **Thành công (0 lỗi biên dịch TypeScript, 0 lỗi đóng gói Vite)**
- Thời gian build: ~9.4s
- Bundle output:
  - `dist/index.html`: 0.89 kB
  - `dist/assets/*.css`: 35.84 kB
  - `dist/assets/*.js`: 473.18 kB (gồm đầy đủ các pages, components và logic Provider Portal)
