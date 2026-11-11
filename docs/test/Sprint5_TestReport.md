# Báo cáo Kiểm thử Sprint 5 — Nghiệm thu Tích hợp & Kiểm toán Chất lượng (Comprehensive QA Report)

> **Dự án:** API Marketplace & Management Platform
> **Giai đoạn:** Sprint 5 — Giám sát Chi phí (Cost Guard `US-32`), Phân tích Nhà cung cấp (Provider Analytics `US-31`), An toàn & Kiểm soát Truy cập (`EN-11`), Đo tải Gateway & Cam kết SLA (`EN-12`), Triển khai Production & Khôi phục Rollback (`EN-13`), Giao diện UX & Responsive (`EN-14`), Kiểm thử Hồi quy Toàn diện & Quality Gate (`EN-15`), Kịch bản Demo 4 Phân cảnh (`EN-16`)
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Thời điểm lập:** 10/11/2026 (Kết quả Đợt 1: Thử nghiệm sớm 10 Test Cases độc lập)
> **Nhánh thực thi:** `test/25-sprint5-qa-closeout` (Kế thừa mốc `develop` `fd022c1`)
> **Tài liệu căn cứ:** [`docs/test/TESTING_RULES.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/TESTING_RULES.md), [`docs/test/Sprint5_AcceptanceCriteria.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_AcceptanceCriteria.md), [`docs/test/Sprint5_TestCases.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_TestCases.md), [`docs/test/Sprint5_Deviations.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_Deviations.md)
> **Quyết định nghiệm thu hiện tại:** **[x] TIẾP TỤC ĐIỀU PHỐI (IN PROGRESS) — HOÀN THÀNH ĐỢT 1 THỬ NGHIỆM SỚM.** Đã kiểm chứng độc lập 10/42 Test Cases trên hạ tầng hiện hữu: **9 PASS, 0 FAIL, 1 KHÔNG THỰC HIỆN ĐƯỢC (`TC-OPS-03`)**. Còn 32 Test Cases thuộc diện **CHƯA ĐÁNH GIÁ**, chờ tích hợp PR #104 (Database), PR #106 (Backend), và PR #109 (Frontend) vào `develop` để chạy nghiệm thu chính thức Đợt 2.

---

## I. TỔNG QUAN HIỆN TRẠNG PHÁT TRIỂN & CÁC PULL REQUEST

Tính đến ngày 10/11/2026, toàn bộ các hạng mục công việc Sprint 5 của các lập trình viên đang ở trạng thái như sau:

| PR # | Phân hệ phụ trách | Tác giả | Nhánh nguồn (Head) | Nhánh đích (Base) | Trạng thái CI | Trạng thái Merge |
|:---:|---|---|---|:---:|:---:|:---:|
| **#104** | Database Migrations 015 & 016 | Võ Trọng Danh (`@danhbuonsv2-svg`) | `feature/24-sprint5-database` | `develop` | **CI ĐỎ (FAILURE)** | `BLOCKED` |
| **#105** | Retest Fix BUG-S4-01 (TC-OVH-06) | Nguyễn Như Tùng Dương (`@Tungdota53`) | `codex/sprint4-qa-closeout` | `develop` | **CI XANH (SUCCESS)** | `BLOCKED (chờ approval)` |
| **#106** | Backend Cost Guard & Analytics | Nguyễn Như Tùng Dương (`@Tungdota53`) | `codex/sprint5-backend` | `develop` | **CI XANH (SUCCESS)** | `BLOCKED (chờ approval)` |
| **#108** | QA Test Suite & E2E Runner | Trần Hà Thảo Vân (`@vuonghathaovan-gif`) | `test/25-sprint5-qa-closeout` | `develop` | **CI XANH (SUCCESS)** | `BLOCKED (chờ approval)` |
| **#109** | Frontend Cost Guard & Analytics | Lê Hải Dương (`@leduwn`), `@antondung` | `feature/23-sprint5-frontend` | `develop` | **CI XANH (SUCCESS)** | `BLOCKED (DRAFT)` |

> [!NOTE]
> Nhánh `develop` hiện hành vẫn dừng ở commit `fd022c1` (mới tích hợp PR #103 của DevOps). Các PR #104, #106, #109 **chưa được merge vào develop**. Do đó, bộ phận QA tuân thủ nghiêm ngặt quy tắc không chạy đợt kiểm thử chính thức trên code chưa tích hợp, mà chỉ chạy đợt thử nghiệm sớm trên các Test Cases có khả năng kiểm chứng độc lập.

---

## II. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ SPRINT 5 (42 TEST CASES)

### 1. Thống kê theo Trạng thái Thực nghiệm

| Trạng thái kết quả | Số lượng Test Cases | Danh sách mã Test Cases | Tỷ lệ (%) |
|---|:---:|---|:---:|
| **PASS (Đạt)** | **9** | `TC-SEC-01`, `TC-SEC-02`, `TC-SEC-04`, `TC-SEC-06`, `TC-SEC-07`, `TC-PERF-02`, `TC-OPS-01`, `TC-DEMO-01`, `TC-DEMO-02` | 21.4% |
| **FAIL (Thất bại)** | **0** | *(Không có ca nào fail trong 10 TC độc lập)* | 0.0% |
| **KHÔNG THỰC HIỆN ĐƯỢC** | **1** | `TC-OPS-03` (Không đo được ngưỡng 60s do thiếu môi trường Linux Staging và `.last_image_tag`) | 2.4% |
| **CHƯA ĐÁNH GIÁ (Chờ PR)** | **32** | 12 TCs chờ BE #106; 12 TCs chờ FE #109; 2 TCs chờ DB #104; 2 TCs chờ Bug #105; 4 TCs chờ Staging Freeze | 76.2% |
| **TỔNG CỘNG** | **42** | Toàn bộ 42 Test Cases theo tài liệu đặc tả Ian Sommerville | **100.0%** |

---

### 2. Danh mục Chi tiết 42 Test Cases Sprint 5

| Mã TC | Phân hệ & Tiêu đề | Lệnh / Thao tác kiểm chứng | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng thực tế |
|---|---|---|---|---|:---:|---|
| `TC-SEC-01` | Chống SSRF Upstream Base URL | Thử tạo API với `localhost:3000`, `127.0.0.1`, `192.168.1.1`, `169.254.169.254`, `[::1]:8080` | HTTP 400 `DOMAIN_NOT_SUPPORTED` | Hệ thống từ chối cả 7 địa chỉ IP/hostname nội bộ | **PASS** | API response 400; SafeProxy test 9/9 pass |
| `TC-SEC-02` | Chống DNS Rebinding & Redirect | Biên dịch `npm run build`; chạy `node --test dist/test/safe-proxy.test.js` | Từ chối kết nối IP nội bộ; HTTP 403 `SSRF_DETECTED` | SafeProxy phát hiện IP socket thực tế, không follow redirect | **PASS** | Unit test SafeProxy của Dev đạt 9/9 |
| `TC-SEC-04` | Bảo mật mã hóa một chiều API Key | Tạo key qua API/UI; kiểm tra response và truy vấn PostgreSQL | Hiện full key 1 lần duy nhất; DB chỉ lưu `key_hash` SHA-256 | API trả full key khi tạo; List chỉ trả `keyPrefix`; DB lưu hash hex 64 ký tự (ID 117) | **PASS** | SQL query `key_hash` 64 hex; ràng buộc `chk_api_keys_hash` |
| `TC-SEC-06` | Ma trận phân quyền 3 vai trò (RBAC) | Chạy ma trận 4 tác nhân (Unauth, Consumer, Provider, Admin) x 6 routes | Toàn bộ request trái quyền nhận HTTP 403 `FORBIDDEN` | Unauth: 401; Consumer truy cập Admin/Provider: 403; Admin truy cập Provider/Consumer: 403 | **PASS** | Ma trận 4x6 đạt chuẩn phân quyền tuyệt đối |
| `TC-SEC-07` | Thu hồi Refresh Token khi đổi pass / logout | Đăng nhập 2 thiết bị; Thiết bị 1 đổi pass; Thiết bị 2 refresh token | Refresh token cũ bị từ chối với HTTP 401 `UNAUTHORIZED` | Đổi mật khẩu trả `revokedSessions: 1`; refresh token cũ bị chặn 401; logout chặn 401 | **PASS** | Response API `cpRes: 200`, `d2RefRes: 401`, `loRes: 204` |
| `TC-PERF-02` | Atomic Quota dưới tải đồng thời | Gửi 50 requests đồng thời gọi Gateway trừ quota | Không dirty read; quota trừ chính xác qua Redis Lua | 50/50 requests HTTP 200; quota còn lại đúng 50 đơn vị | **PASS** | Redis atomic Lua script, số dư chính xác 50 |
| `TC-OPS-01` | Production Preflight từ chối secret yếu | Chạy `node scripts/production-preflight.mjs` với cấu hình vi phạm | Script từ chối với exit code 1 kèm lý do | Báo lỗi secret $< 32$ ký tự, trùng secret và thiếu HTTPS | **PASS** | Script exit code 1; log in rõ 3 vi phạm |
| `TC-OPS-03` | Kế hoạch Rollback tức thì (< 60s) | Kiểm tra script `deploy.sh rollback` và hạ tầng cục bộ | Container quay về bản cũ $< 60$s; `/health` 200 | Môi trường Windows/Compose thiếu `.last_image_tag` và Linux staging | **KHÔNG THỰC HIỆN ĐƯỢC** | Dry-run script hợp lệ cú pháp nhưng không đo được thời gian thực tế |
| `TC-DEMO-01` | Phân cảnh 1 E2E: Provider Onboarding | `node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=1` | Thực hiện trọn vẹn kịch bản Provider submit API trên 2 viewports | 4/4 assertions PASS trên Desktop 1280x720 và Tablet 768x1024 | **PASS** | 4 assertions PASS; 2 ảnh PNG chụp màn hình cuối |
| `TC-DEMO-02` | Phân cảnh 2 E2E: Admin Duyệt API | `node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=2` | Thực hiện trọn vẹn duyệt Dossier và kiểm tra Audit Logs trên 2 viewports | 4/4 assertions PASS trên Desktop 1280x720 và Tablet 768x1024 | **PASS** | 4 assertions PASS; 2 ảnh PNG chụp màn hình cuối |
| `TC-CST-02` | Tóm tắt Cost Guard API | `GET /api/consumer/cost-guard` | HTTP 200, trả `monthlyBudgetUsd`, `currentMonthSpendUsd`... | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-CST-03` | Cập nhật ngân sách & hardCutoff | `PUT /api/consumer/cost-guard` | HTTP 200, cập nhật `monthlyBudgetUsd` và `hardCutoff` | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-CST-07` | Xác thực quyền Buyer trên Cost Guard | Gọi không token và gọi bằng role Admin | Không token trả 401; Admin trả 403; Buyer trả 200 | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-CST-08` | Ngắt cước hardCutoff HTTP 429 | Gửi request khi đã chạm 100% ngân sách | Gateway chặn với HTTP 429 `BUDGET_EXHAUSTED` | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-CST-09` | Hỗ trợ đa tiền tệ Cost Guard | `PUT /api/consumer/cost-guard` với `currency: VND/USD` | HTTP 200, cập nhật độc lập từng loại tiền tệ | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-ANL-01` | Tổng quan Provider Analytics API | `GET /api/provider/analytics/overview` | HTTP 200, trả `requestCount`, `errorRatePercent`, latency | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-ANL-02` | Lọc Analytics theo Endpoint | `GET /api/provider/analytics/overview?endpointId={id}` | HTTP 200, lưu lượng lọc theo endpoint, doanh thu giữ nguyên | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-ANL-03` | Phân vị độ trễ P50/P95/P99 | Gọi API Analytics kiểm tra phân vị | Phân vị là số dương; thỏa mãn $P50 \le P95 \le P99$ | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-ANL-06` | Cách ly dữ liệu Provider Analytics | Provider A gọi `apiId` của Provider B | Không rò rỉ dữ liệu (HTTP 200 rỗng hoặc HTTP 403) | Đang chờ Tech Lead chốt mã HTTP tại PR #108 | **CHƯA ĐÁNH GIÁ** | Hồ sơ sai lệch `DEV-S5-04` |
| `TC-SEC-03` | Chống lách Quota bằng xoay key | Tiêu thụ hết quota key 1, tạo key 2 gọi tiếp | Key 2 vẫn bị chặn HTTP 429 do rateScope theo consumerId | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-SEC-05` | Khử dữ liệu nhạy cảm Log `[REDACTED]` | Gửi request qua Gateway kèm header nhạy cảm | Header nhạy cảm bị loại bỏ/che mờ, không lọt vào usage_logs | Chưa chạy đợt chính thức (Chờ PR #106 merge develop) | **CHƯA ĐÁNH GIÁ** | Runner `sprint5-api-runner.cjs` đã sẵn sàng |
| `TC-PERF-01` | SLA Gateway Overhead P95 < 30ms | `npm run loadtest:gateway` ở các mức c=1, 10, 25 | P95 Overhead $< 30$ms ở cả 3 mức tải | Backend đo cục bộ ghi nhận 38ms (c=10) và 44ms (c=25) | **CHƯA ĐÁNH GIÁ** | Hồ sơ sai lệch `DEV-S5-03` |
| `TC-CST-01` | UI Cost Guard: Hiển thị thanh ngân sách | Kiểm tra UI `/dashboard/cost-guard` | Hiển thị % ngân sách, cảnh báo các mốc 50/80/100% | Chờ Frontend PR #109 gỡ DRAFT và merge | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #109 |
| `TC-CST-04` | Đối soát 4 tầng dữ liệu Cost Guard | Đối chiếu UI Cost Guard với `transactions` và `usage_logs` | Số liệu hiển thị khớp 100% bản ghi cơ sở dữ liệu | Chờ Frontend PR #109 và Backend PR #106 | **CHƯA ĐÁNH GIÁ** | Kịch bản đối soát 4 tầng |
| `TC-CST-05` | UI Cost Guard: Bật/tắt Hard Cutoff | Thao tác toggle ngắt cứng trên form UI | Lưu thành công trạng thái vào cơ sở dữ liệu | Chờ Frontend PR #109 gỡ DRAFT và merge | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #109 |
| `TC-CST-06` | UI Cost Guard: Đổi hạn mức ngân sách | Nhập hạn mức mới và lưu trên form UI | Form validate hợp lệ, cập nhật số tiền mới | Chờ Frontend PR #109 gỡ DRAFT và merge | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #109 |
| `TC-ANL-04` | UI Analytics: Danh sách Top 10 Endpoints | Xem bảng xếp hạng endpoint trên UI Provider | Hiển thị tối đa 10 mục sắp xếp giảm dần theo request | Chờ Frontend PR #109 gỡ DRAFT và merge | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #109 |
| `TC-ANL-05` | Phân tách doanh thu đa tệ VND/USD | Gọi API/UI xem doanh thu theo loại tiền tệ | Doanh thu tách riêng từng loại tiền, không cộng lẫn | Chờ Database PR #104 sửa lỗi seed 016 | **CHƯA ĐÁNH GIÁ** | Hồ sơ sai lệch `DEV-S5-02` |
| `TC-ANL-07` | Đối soát 4 tầng Provider Analytics | Đối chiếu UI Analytics với `provider_daily_aggregates` | Số liệu phân vị và lưu lượng khớp 100% | Chờ Frontend PR #109 và Backend PR #106 | **CHƯA ĐÁNH GIÁ** | Kịch bản đối soát 4 tầng |
| `TC-UX-01` | Responsive 1280x720 và 768x1024 | Kiểm tra toàn bộ màn hình trên 2 viewports | Không tràn ngang, layout co giãn chuẩn mực | Chờ Frontend PR #109 hoàn thiện polish | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc Issue #23 |
| `TC-UX-02` | Zero Console Error trên UI | Mở F12 Console duyệt qua các trang | Console sạch hoàn toàn, không có lỗi đỏ hay warning vỡ | Chờ Frontend PR #109 hoàn thiện polish | **CHƯA ĐÁNH GIÁ** | Quy tắc kiểm thử A1 |
| `TC-UX-03` | Empty / Loading / Error States | Giả lập các trạng thái mạng và dữ liệu rỗng | Hiển thị đầy đủ skeleton loading, thông báo lỗi rõ ràng | Chờ Frontend PR #109 hoàn thiện polish | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc Issue #23 |
| `TC-UX-04` | Tiếp cận Accessibility WCAG 2.2 AA | Kiểm tra độ tương phản màu và bàn phím (Tab/Enter) | Đạt chuẩn tương phản AA, điều hướng bàn phím đầy đủ | Chờ Frontend PR #109 hoàn thiện polish | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc Issue #23 |
| `TC-UX-05` | Form Validation & Thông báo Tiếng Việt | Nhập sai định dạng form trên các màn hình | Thông báo lỗi thân thiện bằng tiếng Việt chuẩn | Chờ Frontend PR #109 hoàn thiện polish | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc Issue #23 |
| `TC-DEMO-03` | Phân cảnh 3 E2E: Marketplace & Gateway | Kịch bản Consumer checkout gói và gọi Gateway | Đăng ký gói thành công, gọi Gateway trừ quota | Chờ sửa mock service crash (`DEV-S5-01`) và PR #105 | **CHƯA ĐÁNH GIÁ** | Hồ sơ sai lệch `DEV-S5-01` |
| `TC-DEMO-04` | Phân cảnh 4 E2E: Dashboard & Analytics | Kịch bản Consumer Cost Guard và Provider Analytics | Đối soát lưu lượng trên 2 màn hình quản trị | Chờ Frontend PR #109 merge vào `develop` | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #109 |
| `TC-OPS-02` | Mở rộng sao lưu & phục hồi toàn diện | Chạy kịch bản sao lưu với seed dữ liệu Sprint 5 | Phục hồi toàn vẹn cả các bảng aggregate mới | Chờ Database PR #104 merge vào `develop` | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #104 |
| `TC-OVH-06-RETEST` | Re-test header `x-gateway-overhead-ms` | Gọi Gateway kiểm tra header phản hồi | Mọi phản hồi Gateway đều có header overhead | Chờ Tech Lead merge PR #105 | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc PR #105 |
| `TC-REG-01` | Full Regression Backend (180+ tests) | Chạy `npm test` toàn diện trên Backend | 100% tests PASS, 0 fail, 0 skip | Chờ tích hợp toàn diện trên `develop` | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc merge develop |
| `TC-REG-02` | Full Regression Frontend (550+ tests) | Chạy `npm test` trong thư mục `frontend` | 100% unit tests PASS, 0 fail | Chờ tích hợp toàn diện trên `develop` | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc merge develop |
| `TC-UAT-01` | Nghiệm thu 3 vai trò (UAT Matrix) | Thực hiện kiểm thử chấp nhận người dùng 3 vai trò | Toàn bộ tiêu chí chấp nhận của 3 vai trò đạt chuẩn | Chờ hoàn tất tích hợp và Staging đóng băng | **CHƯA ĐÁNH GIÁ** | Đang phụ thuộc Staging |
| `TC-UAT-02` | Ký duyệt Release Candidate (RC) | Đối chiếu Release Checklist và ký duyệt phát hành | 100% tiêu chí Quality Gate được thỏa mãn | Chờ hoàn tất toàn bộ các bước kiểm thử trên | **CHƯA ĐÁNH GIÁ** | Biên bản ký duyệt RC |

---

## III. TỔNG HỢP HỒ SƠ SAI LỆCH KỸ THUẬT SPRINT 5 (DEV-S5)

Chi tiết theo dõi tại [`docs/test/Sprint5_Deviations.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_Deviations.md):
- **`DEV-S5-01` (High):** 3 mock container (`weather`, `currency`, `catalog`) bị crash liên tục với lỗi `Cannot find module '/app/weather'` do thiếu chỉ thị `ENTRYPOINT` trong `mock-services/Dockerfile`.
- **`DEV-S5-02` (Critical):** PR #104 của Database bị đỏ CI (Run ID `42543222245`, commit `640db04`) do câu lệnh SQL trong `016_seed_sprint5_demo.sql` dòng 17 bị ambiguous cột `api_id`.
- **`DEV-S5-03` (High):** P95 Gateway Overhead vượt ngưỡng 30ms khi tải đồng thời (38ms ở c=10, 44ms ở c=25), runner báo `SLA_MISSED`. Đề xuất đo lại trên Staging hoặc mở hồ sơ sai lệch có điều kiện.
- **`DEV-S5-04` (Medium):** Chưa thống nhất mã HTTP trả về (200 rỗng hay 403) khi Provider truy vấn dữ liệu Analytics của API thuộc sở hữu người khác (`TC-ANL-06`).
- **`DEV-S5-05` (Medium):** Kịch bản rollback tức thì `< 60`s (`TC-OPS-03`) không thể thực chứng trên môi trường Windows Compose cục bộ do thiếu tệp `.last_image_tag` và registry container.

---

## IV. BẢO TỒN DỮ LIỆU & TÍNH TOÀN VẸN CƠ SỞ DỮ LIỆU

Tuân thủ nghiêm ngặt quy định bảo tồn dữ liệu và không can thiệp ngầm:
1. **Dữ liệu kiểm thử đã tạo được lưu giữ an toàn:**
   - API Key kiểm thử hash (`TC-SEC-04`): ID `117` trong bảng `api_keys`.
   - Người dùng kiểm thử phiên (`TC-SEC-07`): `sec07_1762777500000@example.com` trong bảng `users`.
   - Khóa cache Quota Redis (`TC-PERF-02`): Các khóa tiền tố `test-perf-02-*` trong Redis container.
2. **Bảo tồn cơ sở dữ liệu vật lý:**
   - Toàn bộ 14 migrations cũ được bảo toàn 100%.
   - Tệp dump sao lưu an toàn trước kiểm thử được lưu tại `C:\Users\Admin\Documents\sprint5-qa-results\db-before.dump` (213,090 bytes).
   - Tuyệt đối không thực thi lệnh xóa volume `docker compose down -v`.

---

## V. KẾT LUẬN & KẾ HOẠCH BÀN GIAO TIẾP THEO

1. **Đánh giá Đợt 1:** Các thành phần độc lập trên nền tảng cơ sở của Sprint 5 (Bảo mật SSRF, Mã hóa API Key, Phân quyền RBAC, Thu hồi phiên, Tính nguyên tử Quota, Kịch bản E2E Phân cảnh 1 và 2) đều hoạt động ổn định và đạt 100% tiêu chí chấp nhận.
2. **Kế hoạch Đợt 2 (Nghiệm thu Chính thức):** Ngay sau khi PR #104 và PR #106 được các bên xử lý và merge vào `develop`, QA sẽ pull code mới, đồng bộ migration và kích hoạt bộ runner tự động [`qa-scripts/sprint5-api-runner.cjs`](file:///d:/Downloads/AAAAA/API-Market/qa-scripts/sprint5-api-runner.cjs) để kiểm thử toàn diện các API Cost Guard và Provider Analytics.
