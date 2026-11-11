# Báo cáo Sai lệch Kỹ thuật Sprint 5 (Sprint 5 Technical Deviations)

> **Dự án:** API-Market Platform
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Thời điểm lập:** 10/11/2026 (Cập nhật sau đợt quét thực chứng & kiểm thử sớm)
> **Trạng thái:** `Open / Theo dõi kỹ thuật qua DEV-S5`
> **Căn cứ quy chuẩn:** [`docs/test/TESTING_RULES.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/TESTING_RULES.md), [`docs/test/Sprint5_AcceptanceCriteria.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_AcceptanceCriteria.md), [`docs/test/Sprint5_TestCases.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_TestCases.md)

---

## BẢNG HIỆN TRẠNG CÁC PULL REQUEST SPRINT 5 (TÍNH ĐẾN 10/11/2026)

| PR # | Tiêu đề PR | Nhánh nguồn (Head) | Nhánh đích (Base) | Trạng thái (State) | Merge State | Trạng thái CI | Đã merge vào `develop`? |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **#104** | Feature/24 sprint5 database | `feature/24-sprint5-database` | `develop` | `OPEN` | `BLOCKED` | **CI ĐỎ (FAILURE)** | **CHƯA** |
| **#105** | fix(qa): đối chiếu Gateway và runner nghiệm thu Sprint 4 | `codex/sprint4-qa-closeout` | `develop` | `OPEN` | `BLOCKED (chờ approval)` | **CI XANH (SUCCESS)** | **CHƯA** |
| **#106** | feat(backend): bàn giao Cost Guard, Analytics và Gateway Sprint 5 | `codex/sprint5-backend` | `develop` | `OPEN` | `BLOCKED (chờ approval)` | **CI XANH (SUCCESS)** | **CHƯA** |
| **#108** | docs(qa): Sprint 5 acceptance criteria, test cases và E2E runner (Refs #25) | `test/25-sprint5-qa-closeout` | `develop` | `OPEN` | `BLOCKED (chờ approval)` | **CI XANH (SUCCESS)** | **CHƯA** |
| **#109** | feat(frontend): deliver Sprint 5 Cost Guard UI and Provider Analytics (Refs #23) | `feature/23-sprint5-frontend` | `develop` | `OPEN` | `BLOCKED (DRAFT)` | **CI XANH (SUCCESS)** | **CHƯA** |

---

## DANH MỤC CÁC SAI LỆCH & KHUYẾN NGHỊ KỸ THUẬT SPRINT 5

---

### DEV-S5-01: Ba container Mock Services (Weather, Currency, Catalog) bị crash liên tục khi khởi động

**Mã tài liệu:** `DEV-S5-01`
**Phân hệ:** Hạ tầng Môi trường & Dịch vụ Demo (`EN-07`, `EN-16`)
**Test Case bị ảnh hưởng:** `TC-DEMO-03` (Thử nghiệm Sandbox & Gọi Gateway Upstream), `TC-CST-08` (Ngắt cước khi chạm ngân sách hardCutoff qua Upstream thật), các kịch bản kiểm thử lưu lượng Gateway thực tế.
**Mức độ:** **High (đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead / DevOps, Issue #21)**
**Tình trạng:** `Open / Chờ cập nhật cấu hình Dockerfile`

#### 1. Mô tả sự cố
Khi khởi động hệ thống với profile demo bằng lệnh:
```bash
docker compose --env-file .env.docker --profile frontend --profile demo up -d
```
Ba container dịch vụ mock gồm `api-market-weather`, `api-market-currency`, và `api-market-catalog` khởi động nhưng lập tức thoát với `Exit code 1` và chuyển sang trạng thái `Restarting (1)` chu kỳ liên tục, không thể lắng nghe trên các cổng 4011, 4012, 4013.

#### 2. Bằng chứng đã xác minh
- **Log container thu thập thực tế:**
  ```text
  api-market-weather   | Error: Cannot find module '/app/weather'
  api-market-weather   |     at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
  api-market-weather   |   code: 'MODULE_NOT_FOUND',
  api-market-weather   |   requireStack: []
  ```
  *(Lỗi tương tự xuất hiện trên container `currency` với `/app/currency` và `catalog` với `/app/catalog`).*
- **Cấu trúc image đã kiểm chứng:**
  Lệnh kiểm tra `docker run --rm --entrypoint ls api-market-weather /app` cho thấy trong thư mục `/app` chỉ có thư mục con `mock-services` (chứa `server.mjs`, `weather`, `currency`, `catalog`). Không tồn tại tệp thực thi nào có đường dẫn `/app/weather`.
- **Cấu hình Dockerfile hiện tại ([mock-services/Dockerfile:22](file:///d:/Downloads/AAAAA/API-Market/mock-services/Dockerfile#L22)):**
  Khai báo `CMD ["weather"]`, hoàn toàn không có chỉ thị `ENTRYPOINT`.

#### 3. Nghi ngờ, chưa xác minh
- Nghi ngờ cơ chế khởi chạy mặc định của base image `node:22-alpine` sử dụng entrypoint `docker-entrypoint.sh`. Khi `docker-compose.yml` truyền tham số `command: ["weather"]`, script entrypoint của Node tự động gắn tiền tố `node` phía trước đối số, khiến lệnh thực thi trở thành `node weather` ngay tại thư mục làm việc `/app`.

#### 4. Gợi ý để dev xem xét
- Xem xét bổ sung chỉ thị `ENTRYPOINT` vào [`mock-services/Dockerfile`](file:///d:/Downloads/AAAAA/API-Market/mock-services/Dockerfile):
  ```dockerfile
  ENTRYPOINT ["node", "mock-services/server.mjs"]
  ```
- Hoặc xem xét điều chỉnh tham số `command` cho 3 services trong [`docker-compose.yml`](file:///d:/Downloads/AAAAA/API-Market/docker-compose.yml):
  ```yaml
  command: ["node", "mock-services/server.mjs", "weather"]
  ```
- Thử build lại với `--no-cache` và khởi động lại container để xác nhận trạng thái `healthy`.

---

### DEV-S5-02: Lỗi cú pháp SQL trong file migration seed `016_seed_sprint5_demo.sql` làm đỏ CI PR #104

**Mã tài liệu:** `DEV-S5-02`
**Phân hệ:** Cơ sở dữ liệu & Dữ liệu Mẫu (`US-31`, `EN-15`)
**Test Case bị ảnh hưởng:** `TC-ANL-05` (Doanh thu đa tệ VND/USD), `TC-OPS-02` (Xác thực sao lưu mở rộng), toàn bộ quy trình merge của PR [#104](https://github.com/antondung/API-Market/pull/104) vào `develop`.
**Mức độ:** **Critical (đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Võ Trọng Danh (`@danhbuonsv2-svg` — Database Developer, Issue #24)**
**Tình trạng:** `Open / Chờ Database Developer sửa migration và push lại`

#### 1. Mô tả sự cố
Nhánh `feature/24-sprint5-database` (PR [#104](https://github.com/antondung/API-Market/pull/104)) khi chạy kiểm thử tự động trên CI của GitHub Actions bị thất bại đồng loạt ở 4 jobs (`Node.js`, `API E2E Sprint 2`, `Frontend Browser E2E Sprint 2`, `Kiem tra nen tang`) do lỗi thực thi câu lệnh SQL seed.

#### 2. Bằng chứng đã xác minh
- **Thông tin đối chiếu CI Run:**
  - Run ID: `42543222245`
  - Thời điểm chạy: `2026-11-09T01:00:38Z` (08:00:38 +07:00 ngày 09/11/2026)
  - Commit SHA đầu nhánh: `640db04df35496c3c4e86b2ace2c3946fa15c166`
- **Log CI thực tế ghi nhận:**
  ```text
  API E2E Sprint 2: 2026-11-09 01:01:08.539 UTC [84] ERROR: column reference "api_id" is ambiguous at character 628
  Node.js: error: 'column reference "api_id" is ambiguous' code: '42702'
  ```
- **Đối chiếu mã nguồn dòng 12–18 trong `migrations/016_seed_sprint5_demo.sql`:**
  ```sql
  WITH target AS (
      SELECT u.id AS consumer_id, a.id AS api_id, p.id AS plan_id
      FROM users u
      JOIN apis a ON a.name = 'Product Catalog API' AND a.status = 'Published'
      JOIN api_plans p ON p.api_id = a.id AND p.name = 'Basic'
      WHERE u.email_normalized = 'user@example.com'
  )
  INSERT INTO subscriptions
      (consumer_id, plan_id, api_id, ...)
  SELECT consumer_id, plan_id, api_id, ...
  FROM target t JOIN api_plans p ON p.id = t.plan_id
  ```
  Trong mệnh đề `SELECT`, cột `api_id` xuất hiện ở cả 2 bảng `target t` và `api_plans p`, dẫn tới lỗi ambiguous.

#### 3. Nghi ngờ, chưa xác minh
- Nghi ngờ tại dòng 59–60 CTE `samples`:
  ```sql
  samples AS (
      SELECT d.*, g.day_offset, g.sample,
             (CURRENT_DATE - g.day_offset + make_interval(hours => 8 + g.sample * 3))::timestamptz occurred_at
      FROM demo d CROSS JOIN generate_series(0, 13) AS g(day_offset)
      CROSS JOIN generate_series(0, 2) AS sample
  )
  ```
  Bảng `generate_series(0, 13) AS g(day_offset)` chỉ có duy nhất cột `day_offset`. Việc truy vấn `g.sample` hai lần có thể khiến PostgreSQL báo lỗi `column g.sample does not exist` ngay sau khi lỗi `api_id` được khắc phục.

#### 4. Gợi ý để dev xem xét
- Xem xét thêm tiền tố bảng rõ ràng `t.api_id` ở dòng 17.
- Xem xét đổi alias CTE tạo sample: `generate_series(0, 2) AS s(sample)` và dùng `s.sample`.
- Chạy thử migration trên database mới bằng lệnh `docker compose run --rm migrate --seed` để bảo đảm seed chạy thông suốt trước khi push commit.

---

### DEV-S5-03: Độ trễ Gateway Overhead P95 vượt ngưỡng cam kết SLA 30ms khi kiểm thử tải đồng thời (c=10, c=25)

**Mã tài liệu:** `DEV-S5-03`
**Phân hệ:** Đo tải & Hiệu năng Gateway (`EN-12`)
**Test Case bị ảnh hưởng:** `TC-PERF-01` (SLA P95 Gateway Overhead < 30ms).
**Mức độ:** **High (đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead), Nguyễn Như Tùng Dương (`@Tungdota53` — Backend)**
**Tình trạng:** `Open / Chờ đo đạc trên Staging và quyết định từ Tech Lead`

#### 1. Mô tả sự cố
Theo tiêu chuẩn nghiệm thu tại [`docs/07-sprint5-demo-and-rc-checklist.md:66`](file:///d:/Downloads/AAAAA/API-Market/docs/07-sprint5-demo-and-rc-checklist.md#L66) và [`docs/test/Sprint5_AcceptanceCriteria.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_AcceptanceCriteria.md), độ trễ P95 Gateway Overhead phải đạt ngưỡng $< 30$ms. Tuy nhiên, kết quả đo kiểm thử tải cục bộ của Backend bàn giao tại PR [#106](https://github.com/antondung/API-Market/pull/106) ghi nhận mức overhead vượt ngưỡng khi tải đồng thời tăng lên.

#### 2. Bằng chứng đã xác minh
- **Nguồn số liệu:** Số liệu do dev tự ghi trong HANDOFF.md ([`backend/SPRINT-5-HANDOFF.md`](file:///d:/Downloads/AAAAA/API-Market/backend/SPRINT-5-HANDOFF.md#L45-L55)), QA chưa tự đo.
- **Số liệu bàn giao trong HANDOFF.md:**
  - Mức đồng thời $c=1$: P95 = **7ms** (Đạt chuẩn $< 30$ms).
  - Mức đồng thời $c=10$: P95 = **38ms** (Vượt ngưỡng 30ms).
  - Mức đồng thời $c=25$: P95 = **44ms** (Vượt ngưỡng 30ms).
- **Hành vi runner đo tải:** Lệnh `npm run loadtest:gateway` tự động đối soát và trả về trạng thái `SLA_MISSED` kèm exit code 1 khi có bất kỳ mức tải nào vượt 30ms.

#### 3. Nghi ngờ, chưa xác minh
- Nghi ngờ việc đo kiểm tải cục bộ trên máy phát triển cá nhân chịu tác động từ tài nguyên CPU chia sẻ, Docker Desktop virtualization overhead và tiến trình ghi ổ cứng đồng thời, chưa phản ánh đúng năng lực xử lý của hạ tầng staging/production chuyên dụng.

#### 4. Gợi ý để dev xem xét
- **Hướng 1 (Đo lại trên Staging):** Triển khai phiên bản backend lên máy chủ Staging có tài nguyên độc lập để chạy lại `npm run loadtest:gateway`.
- **Hướng 2 (Deviation Report có điều kiện):** Nếu sau khi tối ưu hóa trên Staging số đo vẫn ở mức 35–45ms do chi phí tuần tự hóa khóa quota Redis của cùng subscription, Tech Lead xem xét ký chấp thuận nghiệm thu có điều kiện dựa trên hồ sơ sai lệch kỹ thuật này.

---

### DEV-S5-04: Chưa thống nhất mã trạng thái HTTP khi Provider truy vấn Analytics của API người khác (TC-ANL-06)

**Mã tài liệu:** `DEV-S5-04`
**Phân hệ:** Provider Analytics & Bảo mật Cách ly Dữ liệu (`US-31`, `EN-11`)
**Test Case bị ảnh hưởng:** `TC-ANL-06` (Bảo mật cách ly dữ liệu: Ngăn Provider A xem Analytics của Provider B).
**Mức độ:** **Medium (đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead), Nguyễn Như Tùng Dương (`@Tungdota53` — Backend)**
**Tình trạng:** `Open / Đã đăng câu hỏi trên PR #108, chờ Tech Lead quyết định`

#### 1. Mô tả sự cố
Khi Provider A đăng nhập và gửi request `GET /api/provider/analytics/overview` nhưng truyền tham số `apiId` thuộc quyền sở hữu của Provider B:
- Yêu cầu đặc tả gốc (`backend/SPRINT-5-HANDOFF.md`) chỉ nêu: "chỉ tổng hợp API thuộc tài khoản" và "cô lập dữ liệu", chưa quy định rõ trả về mã HTTP `200` kèm dữ liệu rỗng hay mã lỗi `403 Forbidden`.

#### 2. Bằng chứng đã xác minh
- **Căn cứ xác minh:** Bằng chứng dựa trên việc đọc code backend (`backend/src/usage-analytics.ts:77`), QA chưa chạy thực tế với backend.
- **Code hiện tại trong PR #106 (`backend/src/usage-analytics.ts:77`):**
  Hệ thống lọc theo `provider_id` của tài khoản đăng nhập. Khi không có bản ghi nào khớp, backend trả về HTTP `200 OK` kèm `requestCount: "0"`, `errorCount: "0"`, và mảng rỗng `topEndpoints: []`. Không rò rỉ dữ liệu của Provider B.

#### 3. Nghi ngờ, chưa xác minh
- Phương án trả HTTP 200 dữ liệu rỗng tuân thủ triết lý bảo mật "Security by Obscurity" (ngăn kẻ tấn công dò quét xem một `apiId` ngẫu nhiên có tồn tại trong hệ thống hay không).
- Tuy nhiên, một số chuẩn REST API chặt chẽ lại ưu tiên trả HTTP 403 Forbidden để client nhận biết rõ ràng lỗi vượt quyền.

#### 4. Gợi ý để dev xem xét
- Tech Lead chốt lựa chọn một trong hai phương án:
  - **Phương án A:** Giữ HTTP `200` + dữ liệu rỗng (Bảo vệ thông tin tồn tại của ID).
  - **Phương án B:** Trả HTTP `403 Forbidden` với mã lỗi `FORBIDDEN`.
- QA sẽ đồng bộ kết quả mong đợi trong tài liệu kiểm thử theo phương án được chọn.

---

### DEV-S5-05: Không đo lường được ngưỡng thời gian khôi phục rollback (< 60 giây) trên môi trường Compose cục bộ (TC-OPS-03)

**Mã tài liệu:** `DEV-S5-05`
**Phân hệ:** Vận hành & Phục hồi Thảm họa (`EN-13`)
**Test Case bị ảnh hưởng:** `TC-OPS-03` (Kế hoạch Rollback tức thì phiên bản ứng dụng và Database < 60 giây).
**Mức độ:** **Medium (đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — DevOps Lead)**
**Tình trạng:** `KHÔNG THỰC HIỆN ĐƯỢC trên local / Chờ staging diễn tập`

#### 1. Mô tả sự cố
Tiêu chí nghiệm thu `AC-EN13-03` yêu cầu chứng minh container ứng dụng quay về phiên bản cũ và endpoint `/health` phản hồi HTTP 200 trong thời gian $< 60$ giây khi kích hoạt quy trình rollback.

#### 2. Bằng chứng đã xác minh
- Script vận hành [`deploy.sh rollback`](file:///d:/Downloads/AAAAA/API-Market/deploy.sh) được thiết kế cho môi trường Linux, yêu cầu hạ tầng Registry container và tệp cấu hình `.last_image_tag`.
- Trên máy kiểm thử Windows cục bộ chạy Docker Compose phát triển, không có tệp `.last_image_tag` và không có cơ chế Blue/Green deployment để đo đạc thời gian downtime thực tế.
- Thao tác dry-run kiểm tra cú pháp script `deploy.sh` chạy thành công nhưng không đại diện cho số đo thời gian thực.

#### 3. Nghi ngờ, chưa xác minh
- Nghi ngờ quy trình rollback hoàn toàn có thể hoàn tất dưới 60 giây khi triển khai trên máy chủ Linux có lưu sẵn cache image của phiên bản trước.

#### 4. Gợi ý để dev xem xét
- Thiết lập kịch bản diễn tập khôi phục trên môi trường Linux Staging trước khi phát hành phiên bản Production Release Candidate để đo đạc số liệu thời gian thực chứng.
