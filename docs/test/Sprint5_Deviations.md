# Báo cáo Sai lệch Kỹ thuật Sprint 5 (Sprint 5 Technical Deviations)

> **Dự án:** API-Market Platform
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Thời điểm lập:** 10/11/2026 — **Cập nhật ngày 11/11/2026** (Sau khi toàn bộ PR Sprint 5 hợp nhất vào `develop` và `main`)
> **Trạng thái:** `01 FAIL MỘT PHẦN (DEV-S5-03) & 01 GIỚI HẠN MÔI TRƯỜNG (DEV-S5-05); DEV-S5-01, DEV-S5-02, DEV-S5-04 ĐÃ KHẮC PHỤC HOÀN TOÀN`
> **Căn cứ quy chuẩn:** [`docs/test/TESTING_RULES.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/TESTING_RULES.md), [`docs/test/Sprint5_AcceptanceCriteria.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_AcceptanceCriteria.md), [`docs/test/Sprint5_TestCases.md`](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint5_TestCases.md), [`docs/known-limitations.md`](file:///d:/Downloads/AAAAA/API-Market/docs/known-limitations.md)

---

## BẢNG HIỆN TRẠNG CÁC PULL REQUEST SPRINT 5 (CẬP NHẬT 11/11/2026)

| PR # | Tiêu đề PR | Nhánh nguồn (Head) | Nhánh đích (Base) | Trạng thái (State) | Merge State | Trạng thái CI | Đã merge vào `develop`? |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **#104** | Feature/24 sprint5 database | `feature/24-sprint5-database` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `640db04`, `282eceb`) |
| **#105** | fix(qa): đối chiếu Gateway và runner nghiệm thu Sprint 4 | `codex/sprint4-qa-closeout` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `9e2669b`) |
| **#106** | feat(backend): bàn giao Cost Guard, Analytics và Gateway Sprint 5 | `codex/sprint5-backend` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `4ce5394`) |
| **#108** | docs(qa): Sprint 5 acceptance criteria, test cases và E2E runner (Refs #25) | `test/25-sprint5-qa-closeout` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `9a48d60`) |
| **#109** | feat(frontend): deliver Sprint 5 Cost Guard UI and Provider Analytics (Refs #23) | `feature/23-sprint5-frontend` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `1ff69a3`, `572afb0`) |
| **#110** | release: Sprint 5 - Cost Guard, Provider Analytics, Production Ops va QA closeout | `s5merge` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `1b9edd4`) |
| **#111** | release: Sprint 5 (Cost Guard, Provider Analytics, Production Ops) | `develop` | `main` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE LÊN MAIN** (commit `593b376`) |
| **#112** | fix(sprint5): unblock demo services, patch dependencies and settle open deviations | `fix/sprint5-final` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE** (commit `289e20e`, HEAD develop) |
| **#113** | release: Sprint 5 hotfix (demo services, dependencies, deviations) | `develop` | `main` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE LÊN MAIN** (commit `2193395`, HEAD main) |
| **#115** | fix(demo): pin mock ENTRYPOINT so CMD is an argument, not a module path | `fix/mock-entrypoint` | `develop` | `MERGED` | `Clean` | **CI XANH (SUCCESS)** | **ĐÃ MERGE VÀO DEVELOP** (commit `6584064`, `540da4d`) |

---

## DANH MỤC CÁC SAI LỆCH & KHUYẾN NGHỊ KỸ THUẬT SPRINT 5

---

### DEV-S5-01: Ba container Mock Services (Weather, Currency, Catalog) bị crash liên tục khi khởi động

**Mã tài liệu:** `DEV-S5-01`
**Phân hệ:** Hạ tầng Môi trường & Dịch vụ Demo (`EN-07`, `EN-16`)
**Test Case bị ảnh hưởng:** `TC-DEMO-03` (Thử nghiệm Sandbox & Gọi Gateway Upstream), `TC-CST-03`, `TC-CST-04`, `TC-CST-07`, `TC-CST-08`, `TC-ANL-04`, `TC-ANL-05`, `TC-ANL-07` (Các kịch bản kiểm thử lưu lượng Gateway thực tế qua upstream mock), `TC-SEC-03` (chứng minh chặn 429 qua Gateway), `TC-SEC-05` (chứng minh Gateway headers `[REDACTED]`).
**Mức độ:** **High (Đề xuất của QA, đề nghị Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead / DevOps, Issue #21)**
**Tình trạng:** **ĐÃ KHẮC PHỤC (RESOLVED)** — Đã xác minh thực tế qua PR #115 (commit `6584064` / `540da4d`)

#### 1. Mô tả sự cố
Sau khi PR #112 hợp nhất để sửa lỗi thiếu tệp `gateway-auth.mjs` trong Dockerfile, QA đã tiến hành kiểm chứng độc lập bằng cách build hoàn toàn mới không dùng cache (`--no-cache`) cho service `weather`:
```bash
docker compose --env-file .env.docker --profile demo build --no-cache weather
docker compose --env-file .env.docker --profile demo up -d weather
```
Container `api-market-weather` tiếp tục thoát ngay sau khi khởi động (`Exit code 1`) và rơi vào chu kỳ `Restarting (1)` vô hạn, không thể lắng nghe trên cổng 4011. Hiện tượng tương tự xảy ra với `currency` (4012) và `catalog` (4013).

#### 2. Bằng chứng đã xác minh từ Docker thực tế
- **Inspect cấu hình image vừa build (`Created: 2026-11-11T10:23:29Z`):**
  ```bash
  docker image inspect api-market-weather:latest --format "Entrypoint: {{json .Config.Entrypoint}} | Cmd: {{json .Config.Cmd}}"
  # Output: Entrypoint: ["docker-entrypoint.sh"] | Cmd: ["weather"]
  ```
- **Log container thu thập thực tế sau khi build sạch không cache:**
  ```text
  api-market-weather   | Error: Cannot find module '/app/weather'
  api-market-weather   |     at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
  api-market-weather   |     at defaultResolveImpl (node:internal/modules/cjs/loader:1040:19)
  api-market-weather   |     at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1045:22)
  api-market-weather   |     at Function._load (node:internal/modules/cjs/loader:1216:25)
  api-market-weather   |     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
  api-market-weather   |     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
  api-market-weather   |     at node:internal/main/run_main_module:36:49 {
  api-market-weather   |   code: 'MODULE_NOT_FOUND',
  api-market-weather   |   requireStack: []
  api-market-weather   | }
  ```
- **Cấu hình Compose đã giải quyết (`docker compose --env-file .env.docker --profile demo config`):**
  - Không có `docker-compose.override.yml`, không có biến môi trường nào can thiệp entrypoint.
  - Service `weather` nhận `command: ["weather"]`, hoàn toàn không có chỉ thị `entrypoint`.

#### 3. Đối chiếu với commit `e786a52` (PR #112) và nguyên nhân gốc
- **PR #112 thực sự đã sửa lỗi nào?**
  Qua kiểm tra `git show e786a52 -- mock-services/`, PR #112 thực chất chỉ bổ sung lệnh copy `COPY mock-services/gateway-auth.mjs ./mock-services/gateway-auth.mjs` vào Dockerfile và bổ sung `GATEWAY_UPSTREAM_SECRET` mẫu vào `.env.docker.example`.
- **Lỗi hiện tại có trùng với lỗi trước PR #112 không?**
  - **Khác nhau:** Lỗi trước PR #112 xảy ra khi Node chạy `server.mjs` và không tìm thấy file import `gateway-auth.mjs`.
  - **Lỗi hiện tại:** Xảy ra ngay ở tầng khởi chạy entrypoint của Docker image `node:22-alpine` trước cả khi file `server.mjs` được gọi.
- **Nguyên nhân gốc (kèm vị trí file:dòng):**
  1. [`mock-services/Dockerfile:23`](file:///d:/Downloads/AAAAA/API-Market/mock-services/Dockerfile#L23): Chỉ khai báo `CMD ["weather"]`, hoàn toàn thiếu chỉ thị `ENTRYPOINT`.
  2. [`docker-compose.yml:187, 209, 231`](file:///d:/Downloads/AAAAA/API-Market/docker-compose.yml#L187): Khai báo `command: ["weather"]` (hoặc `currency`, `catalog`).
  3. Entrypoint mặc định của base image `node:22-alpine` là `/usr/local/bin/docker-entrypoint.sh`. Khi nhận đối số là `weather`, script này tự động chạy `exec node "weather"` tại thư mục làm việc `/app`. Vì không có tệp `/app/weather` (code nằm trong `/app/mock-services/server.mjs`), Node runtime ném `MODULE_NOT_FOUND`.

#### 4. Khuyến nghị gửi Tech Lead xem xét (QA không tự ý sửa code ứng dụng)
- **Phương án 1 (Khuyến nghị trong Dockerfile):** Bổ sung `ENTRYPOINT` vào [`mock-services/Dockerfile:23`](file:///d:/Downloads/AAAAA/API-Market/mock-services/Dockerfile#L23):
  ```dockerfile
  ENTRYPOINT ["node", "mock-services/server.mjs"]
  CMD ["weather"]
  ```
- **Phương án 2 (Cấu hình docker-compose):** Điều chỉnh lại `command` trong [`docker-compose.yml:187, 209, 231`](file:///d:/Downloads/AAAAA/API-Market/docker-compose.yml#L187):
  ```yaml
  command: ["node", "mock-services/server.mjs", "weather"]
  ```
- **Tác động kiểm thử ban đầu:** Khi mock container chưa khởi động được, các Test Case cần upstream mock phải chuyển trạng thái sang **KHÔNG THỰC HIỆN ĐƯỢC**. Không nới lỏng assertion để che lỗi.

#### 5. Kết quả xác minh khắc phục thực tế (PR #115)
Tech Lead (@antondung) đã triển khai chính xác Phương án 1 được QA khuyến nghị: bổ sung `ENTRYPOINT ["node", "mock-services/server.mjs"]` và `CMD ["weather"]` vào `mock-services/Dockerfile:22-25` thông qua PR #115 (commit `6584064`, hợp nhất vào `develop` tại commit `540da4d`).
- QA đã rebase nhánh `docs/25-sprint5-final-qa-signoff` lên `540da4d`, cấu hình `.env.docker` bổ sung `GATEWAY_UPSTREAM_SECRET` và build lại toàn bộ services (`docker compose --env-file .env.docker --profile demo up --build -d`).
- Kiểm tra trạng thái runtime thực tế từ Docker daemon: cả 3 mock containers đều ở trạng thái `Up (healthy)`:
  - `api-market-weather` (port 4011): `GET http://127.0.0.1:4011/health` $\to$ `HTTP 200 {"status":"ok","service":"weather"}`
  - `api-market-currency` (port 4012): `GET http://127.0.0.1:4012/health` $\to$ `HTTP 200 {"status":"ok","service":"currency"}`
  - `api-market-catalog` (port 4013): `GET http://127.0.0.1:4013/health` $\to$ `HTTP 200 {"status":"ok","service":"catalog"}`
- Toàn bộ 12 Test Cases phụ thuộc mock services (`TC-DEMO-03`, `TC-CST-03`..`08`, `TC-ANL-04`, `05`, `07`, `TC-SEC-03`, `05`) đã được kích hoạt chạy thật trên runner API và runner UI E2E, đạt 100% PASS (không nới lỏng bất kỳ assertion nào).
- **Kết luận:** Sai lệch `DEV-S5-01` chính thức **ĐÃ KHẮC PHỤC (RESOLVED)**.

---

### DEV-S5-02: Lỗi cú pháp SQL trong file migration seed `016_seed_sprint5_demo.sql` làm đỏ CI PR #104

**Mã tài liệu:** `DEV-S5-02`
**Phân hệ:** Cơ sở dữ liệu & Dữ liệu Mẫu (`US-31`, `EN-15`)
**Test Case bị ảnh hưởng:** `TC-ANL-05` (Doanh thu đa tệ VND/USD), `TC-OPS-02` (Xác thực sao lưu mở rộng), toàn bộ quy trình merge của PR [#104](https://github.com/antondung/API-Market/pull/104) vào `develop`.
**Mức độ:** **Critical (đã được giải quyết)**
**Người phụ trách:** **Võ Trọng Danh (`@danhbuonsv2-svg` — Database Developer, Issue #24)**
**Tình trạng:** **ĐÃ KHẮC PHỤC (RESOLVED)** — Hoàn tất trong PR #104 (commit `282eceb`, `640db04`)

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
  Trong mệnh đề `SELECT`, cột `api_id` xuất hiện ở cả 2 bảng `target t` và `api_plans p`, dẫn tới lỗi ambiguous.
  Đồng thời, CTE `samples` dòng 59–60 dùng `g.sample` nhưng alias bảng chỉ định nghĩa `g(day_offset)`.

#### 3. Kết quả khắc phục thực chứng
- Database Developer và Tech Lead đã sửa đổi trực tiếp trong commit `282eceb` và tích hợp vào `develop` qua PR #104 / PR #110:
  1. [`migrations/016_seed_sprint5_demo.sql:17`](file:///d:/Downloads/AAAAA/API-Market/migrations/016_seed_sprint5_demo.sql#L17): Thêm tiền tố định danh rõ ràng `t.api_id`.
  2. [`migrations/016_seed_sprint5_demo.sql:60`](file:///d:/Downloads/AAAAA/API-Market/migrations/016_seed_sprint5_demo.sql#L60): Khai báo đúng alias `generate_series(0, 2) AS sample_series(sample)` và gọi `sample_series.sample`.
- **Kiểm chứng thực tế:** Migration 016 thực thi thành công từ cơ sở dữ liệu trắng, toàn bộ 7 check CI của PR #108 và PR #110 đều XANH 100%. Trạng thái: **ĐÃ ĐÓNG (RESOLVED)**.

---

### DEV-S5-03: Độ trễ Gateway Overhead P95 vượt ngưỡng cam kết SLA 30ms khi kiểm thử tải đồng thời (c=10, c=25)

**Mã tài liệu:** `DEV-S5-03`
**Phân hệ:** Đo tải & Hiệu năng Gateway (`EN-12`)
**Test Case bị ảnh hưởng:** `TC-PERF-01` (SLA P95 Gateway Overhead).
**Mức độ:** **High (Đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead), Nguyễn Như Tùng Dương (`@Tungdota53` — Backend)**
**Tình trạng:** **FAIL (MỘT PHẦN) / CHẤP NHẬN CÓ ĐIỀU KIỆN** — Đã ghi nhận hạn chế kiến trúc tại [`docs/known-limitations.md`](file:///d:/Downloads/AAAAA/API-Market/docs/known-limitations.md), chờ Tech Lead xác nhận số đo $c=10$

#### 1. Mô tả sự cố
Theo tiêu chuẩn nghiệm thu ban đầu, độ trễ P95 Gateway Overhead được kỳ vọng $< 30$ms ở mọi mức tải. Khi đo kiểm tải cục bộ, độ trễ ở mức đồng thời $c=10$ và $c=25$ vượt ngưỡng này. Trước đây số liệu ban đầu do Dev tự ghi trong HANDOFF.md, QA chưa tự đo đạc độc lập.

#### 2. Kết quả đo thực nghiệm của QA tại phiên ngày 11/11/2026
QA đã chạy đo đạc trực tiếp tải Gateway trên môi trường kiểm thử (Windows + Docker Desktop) với lệnh `npm run loadtest:gateway` và thu được kết quả:
- **Mức tải đơn luồng ($c = 1$):** Overhead P95 = **11ms** ($< 30$ms, **PASS**).
- **Mức tải đồng thời ($c = 10$):** Overhead P95 = **98ms** ($> 60$ms).
- **Mức tải đồng thời ($c = 25$):** Overhead P95 = **162ms** ($> 60$ms).

#### 3. Đối chiếu với số liệu của Tech Lead & Kết luận chính thức
- **Số liệu do Tech Lead công bố tại [`docs/known-limitations.md`](file:///d:/Downloads/AAAAA/API-Market/docs/known-limitations.md):**
  - Đơn luồng $c = 1$: P95 overhead 13–19ms.
  - Đồng thời $c = 10$: P95 overhead 38–59ms.
  - Đồng thời $c = 25$: P95 overhead 84–150ms.
- **Quyết định kiến trúc của Tech Lead:** Ở mức $c = 25$, việc độ trễ tăng cao là **đánh đổi có chủ đích của kiến trúc**: phương thức `GatewayEntitlement.reserve` mở transaction và sử dụng khóa dòng PostgreSQL `FOR UPDATE OF s` để đảm bảo quota không bị vượt (zero quota overdraft) dưới mọi mức tải đồng thời. Các request của cùng một Consumer xếp hàng tuần tự.
- **Kết luận chính thức của QA:** **PASS ở c=1 (P95 11ms < 30ms); c=10 (98ms) và c=25 (162ms) vượt ngưỡng 60ms trên máy QA (Windows + Docker Desktop). Tech Lead đã chấp nhận có điều kiện c=25 theo DEV-S5-03; c=10 lệch so với số đo của Tech Lead (38–59ms), chờ Tech Lead xác nhận.** Tuyệt đối không ghi nhận là "đạt chuẩn phân tầng" một cách chung chung. Không hạ assertion để làm đẹp kết quả.

---

### DEV-S5-04: Chưa thống nhất mã trạng thái HTTP khi Provider truy vấn Analytics của API người khác (TC-ANL-06)

**Mã tài liệu:** `DEV-S5-04`
**Phân hệ:** Provider Analytics & Bảo mật Cách ly Dữ liệu (`US-31`, `EN-11`)
**Test Case bị ảnh hưởng:** `TC-ANL-06` (Bảo mật cách ly dữ liệu: Ngăn Provider A xem Analytics của Provider B).
**Mức độ:** **Medium (Đề xuất của QA, chờ Tech Lead xác nhận)**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — Tech Lead), Nguyễn Như Tùng Dương (`@Tungdota53` — Backend)**
**Tình trạng:** **ĐÃ KHẮC PHỤC (RESOLVED)** — Hoàn tất trong PR #112 (commit `e786a52`), đã chạy thực tế đạt PASS

#### 1. Mô tả sự cố
Khi Provider A đăng nhập và gửi request `GET /api/provider/analytics/overview` nhưng truyền tham số `apiId` thuộc quyền sở hữu của Provider B: ban đầu khi đọc mã nguồn (chưa chạy thực tế), backend trả về HTTP 200 kèm báo cáo rỗng (`requestCount: "0"`), gây nguy cơ rò rỉ không gian định danh (ID space leak).

#### 2. Quyết định chính thức & Kết quả khắc phục thực chứng
- Tech Lead `@antondung` đã chốt phương án chuẩn: **Trả về HTTP 404 NOT_FOUND**.
- **Triển khai code thực tế:**
  1. [`backend/src/usage-analytics.ts:74-81`](file:///d:/Downloads/AAAAA/API-Market/backend/src/usage-analytics.ts#L74-L81): Bổ sung phương thức `ownsApi(user: string, apiId: string)` kiểm tra quyền sở hữu API qua bảng `api_providers`.
  2. [`backend/src/usage-router.ts:47-49`](file:///d:/Downloads/AAAAA/API-Market/backend/src/usage-router.ts#L47-L49): Ném lỗi `new ApiError(404, "NOT_FOUND", "API not found")` nếu không sở hữu API.
  3. [`backend/integration/usage.test.ts:250-252`](file:///d:/Downloads/AAAAA/API-Market/backend/integration/usage.test.ts#L250-L252): Bổ sung test tự động kiểm tra HTTP 404.
- **Xác minh chạy thực tế trong phiên ngày 11/11/2026:**
  - Bộ kiểm thử tích hợp backend chạy đạt 100% (trong `usage.test.ts`).
  - Runner tự động `qa-scripts/sprint5-api-runner.cjs` chạy trực tiếp endpoint qua cổng 3000 đạt **PASS** với mã lỗi chuẩn `HTTP 404 NOT_FOUND` ('API not found'). Trạng thái: **ĐÃ ĐÓNG (RESOLVED)**.

---

### DEV-S5-05: Không đo lường được ngưỡng thời gian khôi phục rollback (< 60 giây) trên môi trường Compose cục bộ (TC-OPS-03)

**Mã tài liệu:** `DEV-S5-05`
**Phân hệ:** Vận hành & Phục hồi Thảm họa (`EN-13`)
**Test Case bị ảnh hưởng:** `TC-OPS-03` (Kế hoạch Rollback tức thì phiên bản ứng dụng và Database < 60 giây).
**Mức độ:** **Medium**
**Người phụ trách:** **Nguyễn Tấn Dũng (`@antondung` — DevOps Lead)**
**Tình trạng:** **GIỚI HẠN MÔI TRƯỜNG (ENVIRONMENTAL LIMITATION)** — Phụ thuộc diễn tập trên Staging/Production Linux

#### 1. Mô tả sự cố
Tiêu chí nghiệm thu `AC-EN13-03` yêu cầu chứng minh container ứng dụng quay về phiên bản cũ và endpoint `/health` phản hồi HTTP 200 trong thời gian $< 60$ giây khi kích hoạt quy trình rollback.

#### 2. Bằng chứng thực tế
- Script vận hành [`deploy.sh rollback`](file:///d:/Downloads/AAAAA/API-Market/deploy.sh) được thiết kế cho môi trường Linux, yêu cầu hạ tầng Registry container và tệp cấu hình `.last_image_tag`.
- Trên máy kiểm thử Windows cục bộ chạy Docker Compose phát triển, không có tệp `.last_image_tag` và không có cơ chế Blue/Green deployment để đo đạc thời gian downtime thực tế.
- Thao tác dry-run kiểm tra cú pháp script `deploy.sh` chạy thành công nhưng không đại diện cho số đo thời gian thực.
- Kịch bản này được bảo lưu kiểm tra trên pipeline CD Production thực tế (`.github/workflows/cd-production.yml`).
