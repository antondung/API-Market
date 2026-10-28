# API-MARKET FRONTEND — POST-MERGE AUDIT & REMEDIATION REPORT

- **Target Branch**: `fix/frontend-sprint3-postmerge-stability`
- **Base Branch**: `origin/develop` (Baseline sau PR #86 merge: `ea1f41a61dc50b56d0d95cdb891ac4fb79645ca6`)
- **Previous PR**: PR #86 (Merged at `ea1f41a61dc50b56d0d95cdb891ac4fb79645ca6`)
- **Current Scope**: Follow-up hardening commit `cdbf3a7`
- **Status**: Ready for Human Review (`PR_OPEN_AWAITING_HUMAN_REVIEW`)
- **Date**: 2026-10-28

---

## 1. Executive Summary

Sau khi PR #85 và PR #82 được hợp nhất vào `develop`, một đợt kiểm định toàn diện (Comprehensive Audit) cùng đợt bổ sung hiệu chỉnh độc lập (Independent Correction) đã được thực hiện để đánh giá độ ổn định, tính toàn vẹn dữ liệu và độ an toàn của toàn bộ phân hệ Frontend.

Đợt kiểm định và hiệu chỉnh đã xử lý triệt để:
1. **Khắc phục 13 Vitest failures gây đỏ CI Frontend** tại `ApiPlaygroundPage.test.tsx` do điểm mốc thời gian cứng (`2026-10-28T00:00:00.000Z`) bị hết hạn theo lịch hệ thống thực tế.
2. **Khắc phục triệt để lỗi Concurrency / Sequence Reuse trong TrySandboxPage**:
   - Sử dụng bộ đếm monotonic request generation `claimGenerationRef` (không bao giờ reset về 0) kết hợp `activeRequestIdRef`.
   - Invalidate yêu cầu cũ khi chuyển đổi API hoặc session mà không làm trùng sequence ID.
   - Thêm 6 deferred-promise regression test cases độc lập cho tất cả các kịch bản cạnh tranh promise.
3. **Khắc phục và mở rộng PlayGround Path Parameters & Active Abort**:
   - Mở rộng regex `/\{([A-Za-z_][A-Za-z0-9_.-]*)\}/g` hỗ trợ kebab-case và dấu chấm.
   - Phân tách và thay thế toàn bộ placeholders xuất hiện nhiều lần (`split().join(encodeURIComponent(val))`).
   - Phủ test reviewer case `GET /weather/{city-name}/{file.name}` với metadata `parameters: []`, kiểm tra payload thực tế gửi sang proxy executor.
   - Bổ sung guard active abort (`err?.name === 'AbortError' || err?.code === 'ABORTED'`) ngăn hiểu nhầm là lỗi kết nối/timeout.
4. **Kiểm tra Quota Reconciliation State Machine**:
   - Khóa nút Send Request khi quá trình đối soát đang pending hoặc thất bại.
   - Chỉ mở lại Send button khi retry đối soát thành công và quota > 0.
   - Không tự động gửi lại request upstream.
5. **Đồng bộ định tuyến và bộ giám sát thời gian thực**:
   - Đường dẫn đăng nhập chuẩn hóa về `/api/${id}/try-sandbox`.
   - Bộ đếm thời gian thực `isGrantExpiredByTimer` cập nhật trạng thái hết hạn ngay lập tức khi deadline trôi qua.
6. **Kiểm tra và khoanh vùng tính toàn vẹn dữ liệu (Anti-Illusion Policy)**:
   - Các màn hình quản trị legacy (`ReportsModerationPage.tsx`, `SubscriptionMonitoringPage.tsx`, `AnalyticsHealthPage.tsx`, `SubscribersPage.tsx`) gắn badge Preview Mode và disable action buttons trong khi Backend PR #81 và PR #78 chưa được hợp nhất.

---

## 2. Remediation Matrix

| STT | Phân hệ / Tệp | Vấn đề / Lỗi | Nguyên nhân gốc rễ | Giải pháp kỹ thuật | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| 1 | `ApiPlaygroundPage.test.tsx` | 13 test cases thất bại (Red CI) | Fixture `expiresAt` bị cố định ở `2026-10-28T00:00:00.000Z`, khiến kiểm tra `grantStatus === 'EXPIRED'` kích hoạt trên ngày thực tế | Chuyển đổi toàn bộ mock active grants sang helper tương đối `getFutureExpiry()` (`Date.now() + 86400000`). Giữ nguyên test case hết hạn quá khứ cố ý | **ĐÃ KHẮC PHỤC (100% PASS)** |
| 2 | `ApiPlaygroundPage.tsx` | P2: Client Timeout / Network Error (Status 0) không kích hoạt đối soát hạn ngạch | Lớp client `apiRequest` ném `ApiError(0, 'TIMEOUT')` hoặc `ApiError(0, 'NETWORK_ERROR')`, nhưng điều kiện `isAmbiguousError` chỉ bắt `502`, `504` hoặc `undefined` | Mở rộng `isAmbiguousError` bắt thêm `err instanceof ApiError && err.status === 0 && (err.code === 'TIMEOUT' \|\| err.code === 'NETWORK_ERROR')`. Khóa Send button khi đối soát | **ĐÃ KHẮC PHỤC (Có Regression Tests)** |
| 3 | `ApiPlaygroundPage.tsx` | P2: Thiếu tương thích tham số URL dạng kebab-case (`{city-name}`) và chấm (`{file.ext}`) | Regex `/\{([A-Za-z_][A-Za-z0-9_]*)\}/g` chỉ nhận ký tự gạch dưới và chữ số, bỏ sót dấu gạch ngang và dấu chấm | Nâng cấp regex thành `/\{([A-Za-z_][A-Za-z0-9_.-]*)\}/g` và dùng `split().join(encodeURIComponent(val))` để thay thế an toàn tất cả các lần xuất hiện | **ĐÃ KHẮC PHỤC (Có Regression Tests)** |
| 4 | `ApiPlaygroundPage.tsx` | Chủ động abort yêu cầu bị nhầm lẫn với lỗi mạng | Catch block chưa kiểm tra `err.code === 'ABORTED'` đối với `ApiError` | Thêm guard `controller.signal.aborted \|\| err?.name === 'AbortError' \|\| (err instanceof ApiError && err.code === 'ABORTED')` thoát sớm | **ĐÃ KHẮC PHỤC (Có Regression Tests)** |
| 5 | `TrySandboxPage.tsx` | P2: Concurrency & Sequence collision khi đổi API/session | `activeClaimSeqRef.current` reset về 0 khi switch API/logout, dẫn đến tái sử dụng sequence ID giữa request A và B | Tách biệt `claimGenerationRef` (monotonic counter, không bao giờ reset) và `activeRequestIdRef` (chỉ định request hiện hành). Thêm `isCurrent` guard và double-click lock | **ĐÃ KHẮC PHỤC (Có 6 Deferred Tests)** |
| 6 | `TrySandboxPage.tsx` | Chuyển hướng đăng nhập sai đường dẫn `/sandbox` | `navigate('/login', { state: { from: '/api/:id/sandbox' } })` trỏ vào route không tồn tại trong production | Cập nhật cả `handleClaimGrant` và thẻ `<Link to="/login">` về đúng `/api/${id}/try-sandbox` | **ĐÃ KHẮC PHỤC** |
| 7 | `TrySandboxPage.tsx` | Hạn ngạch hết hạn không tự động cập nhật UI | `isGrantExpired` dùng `useMemo` tĩnh chỉ tính toán khi `grant` thay đổi | Thêm `isGrantExpiredByTimer` với `setTimeout` và cleanup tự động chuyển trạng thái khi đến giờ hết hạn | **ĐÃ KHẮC PHỤC** |
| 8 | `ReportsModerationPage.tsx` | Mutation giả lập vào bộ nhớ AppContext khi Backend PR #81 chưa merge | Nút "Suspend API & Resolve" gọi `updateApiStatus` và `resolveReport` trên AppContext, tạo cảm giác đã đình chỉ API thật | Gắn badge Preview Mode, hiển thị banner cảnh báo Chờ Backend PR #81, disable toàn bộ nút hành động và gỡ mutation giả lập | **ĐÃ BẢO VỆ (Có Test xác minh)** |
| 9 | `SubscriptionMonitoringPage.tsx` | Thu hồi Gateway Data Plane giả lập khi PR #78 chưa merge | Thao tác "Suspend" chỉ cập nhật AppContext nhưng thông báo có hiệu lực tức thì trên Gateway Data Plane | Gắn badge Preview Mode, hiển thị thông báo phụ thuộc PR #78 và vô hiệu hóa nút Suspend trực tiếp | **ĐÃ BẢO VỆ** |
| 10 | `AnalyticsHealthPage.tsx` & `SubscribersPage.tsx` | Chưa đánh dấu ranh giới dữ liệu mô phỏng | Hiển thị số liệu latency và danh sách subscriber từ simulator mà không có chỉ dẫn minh bạch | Bổ sung banner chỉ dẫn Telemetry Preview & Sandbox Ledger Read-only | **ĐÃ BẢO VỆ** |

---

## 3. Verification & Test Evidence

### 3.1. Vitest Unit & Component Suite
```
 RUN  v5.0.4 D:/Projects/api-hub/frontend

 Test Files  32 passed (32)
      Tests  347 passed (347)
   Start at  16:37:49
   Duration  44.58s
```
- Phủ 6 test scenarios deferred-promise tại `TrySandboxPage.test.tsx` (20/20 PASS).
- Phủ reviewer case `GET /weather/{city-name}/{file.name}`, repeated placeholders, active abort tại `ApiPlaygroundPage.test.tsx` (32/32 PASS).

### 3.2. Playwright E2E Suite
- **Smoke Suite (All 7 Browser Projects)**: 98 passed (4.1m).
  - Chromium: 14 passed
  - Firefox: 14 passed
  - WebKit: 14 passed
  - Mobile Chrome: 14 passed
  - Tablet Chrome: 14 passed
  - Reduced Motion: 14 passed
  - Dark Theme: 14 passed
- **Full Suite on Chromium (109 Tests)**: 109 passed.
  - 01-marketplace: 10 passed
  - 02-api-detail: 6 passed
  - 03-api-playground: 6 passed
  - 04-try-sandbox: 4 passed
  - 05-pricing: 8 passed
  - 06-checkout: 4 passed
  - 07-compare-apis: 5 passed
  - 08-navigation-layout: 4 passed
  - 09-responsive-viewports: 31 passed
  - 10-motion-animation: 4 passed
  - 11-accessibility-wcag: 7 passed
  - 12-network-resilience: 4 passed
  - 13-security-data-integrity: 4 passed
  - 14-performance-resource-budgets: 4 passed
  - 15-consumer-api-keys: 8 passed

### 3.3. TypeScript Compilation & Vite Production Build
```
> tsc -b && vite build
✓ 522 modules transformed.
dist/index.html                                       1.37 kB │ gzip:   0.67 kB
dist/assets/index-XST7ysFw.css                       45.16 kB │ gzip:   8.60 kB
dist/assets/ApiPlaygroundPage-CG7mnweV.js            34.07 kB │ gzip:   8.94 kB
dist/assets/TrySandboxPage-B6sJBdIb.js               25.64 kB │ gzip:   6.91 kB
dist/assets/index-D4PfL85G.js                       490.73 kB │ gzip: 153.25 kB
✓ built in 1.96s
```
0 compilation errors.

### 3.4. Code Quality & Repository Compliance
- `oxlint`: 0 syntax / lint errors.
- `powershell -NoProfile -File .\scripts\kiem-tra-kho-ma-nguon.ps1`: Kiểm tra thành công 550 tệp, không có lỗi nền tảng.

---

## 4. Independent QA Verdict
- **Reviewer**: Agent C (Independent QA Reviewer)
- **Verdict**: **PASS**
- **Rationale**: Kiểm tra trực tiếp mã nguồn xác nhận:
  1. Sequence collision / reuse được loại trừ hoàn toàn nhờ monotonic `claimGenerationRef`.
  2. In-flight request được hủy an toàn mà không reset sequence counter.
  3. Cả 6 kịch bản promise cạnh tranh đều sử dụng deferred promises chính xác, không dùng sleep tùy ý.
  4. Payload `pathParams` được kiểm tra trực tiếp qua service mock.
  5. Active abort được loại khỏi điều kiện kích hoạt đối soát hạn ngạch.

---

## 5. Reviewer Guidance & Sign-off Gate

- **Chi nhánh PR**: `fix/frontend-sprint3-postmerge-stability` -> `develop`
- **Quan hệ PR**: PR #86 đã được merge vào `develop` (`ea1f41a`). PR mới này chỉ chứa các commit hiệu chỉnh bổ sung tiếp nối (`cdbf3a7` và cập nhật tài liệu), không tạo nhánh phụ.
- **Trạng thái**: Chờ người phê duyệt đánh giá độc lập (`PR_OPEN_AWAITING_HUMAN_REVIEW`).
- **Cam kết**: Tuyệt đối không tự phê duyệt (no self-approval), không tự merge (no auto-merge), tôn trọng quy trình thẩm định kỹ thuật của dự án API-Market.
