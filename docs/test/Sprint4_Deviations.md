# Báo cáo Sai lệch Kỹ thuật Sprint 4 (Sprint 4 Technical Deviations)

**Dự án:** API-Market Platform
**QA Lead & Author:** Tran Ha Thao Van (@vuonghathaovan-gif)
**Ngày cập nhật:** 2026-11-05
**Trạng thái:** `FAIL / Open (Theo dõi kỹ thuật qua DEV-S4)`

---

# DEV-S4-01: Không nhất quán mã lỗi Fail-Closed khi sự cố Redis (503 QUOTA vs RATE_LIMIT)

**Mã tài liệu:** `DEV-S4-01`
**Phân hệ:** EP08 — API Gateway Enforcement & Fail-Closed Resilience
**Test Case liên quan:** `TC-GW-15` (Trạng thái kiểm thử: `FAIL`)

### 1. Tóm tắt Sai lệch (Summary)
Trong quá trình đối soát nghiệm thu chéo giữa Tài liệu Tiêu chí Chấp nhận ([docs/test/Sprint4_AcceptanceCriteria.md:233](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_AcceptanceCriteria.md#L233)), Runbook vận hành ([migrations/sprint4-redis-postgres-runbook.md:28-29](file:///d:/Downloads/AAAAA/API-Market/migrations/sprint4-redis-postgres-runbook.md#L28-L29)) và mã nguồn thực tế tầng Backend ([backend/src/redis-meter.ts](file:///d:/Downloads/AAAAA/API-Market/backend/src/redis-meter.ts)), bộ phận QA phát hiện sự không nhất quán về mã lỗi (Error Code) trong kịch bản xử lý sự cố hạ tầng Redis (Fail-Closed).

### 2. Chi tiết Sai lệch (Deviation Details)
- **Hành vi kỳ vọng (Expected Behavior theo AC & Runbook):**
  - Khi Redis gặp sự cố (timeout hoặc mất kết nối):
    - **Bước Rate Limit:** Với API trả phí, Gateway áp dụng Fail-Closed trả về HTTP `503 Service Unavailable` kèm mã lỗi riêng: `{ "code": "RATE_LIMIT_UNAVAILABLE" }`.
    - **Bước Quota:** Không đọc/ghi được bộ đếm hạn ngạch, Gateway áp dụng Fail-Closed trả về HTTP `503 Service Unavailable` kèm mã lỗi: `{ "code": "QUOTA_UNAVAILABLE" }`.
- **Hành vi thực tế trong mã nguồn (Actual Implementation in Code):**
  - Tại [backend/src/redis-meter.ts:59-70](file:///d:/Downloads/AAAAA/API-Market/backend/src/redis-meter.ts#L59-L70), dev đã gom cả 2 bước kiểm tra Rate Limit và trừ Quota vào **chung một Lua script nguyên tử duy nhất** trên Redis nhằm tối ưu độ trễ P95 (chỉ 1 network trip).
  - Khi Redis bị ngắt kết nối hoặc timeout, khối `try...catch` tại [backend/src/redis-meter.ts:79-84](file:///d:/Downloads/AAAAA/API-Market/backend/src/redis-meter.ts#L79-L84) chỉ ném duy nhất mã lỗi `QUOTA_UNAVAILABLE`:
    ```typescript
    } catch {
      throw new ApiError(
        503,
        "QUOTA_UNAVAILABLE",
        "Redis metering unavailable",
      );
    }
    ```
  - Chuỗi `RATE_LIMIT_UNAVAILABLE` hoàn toàn **chưa có trong mã nguồn code backend**.

### 3. Đánh giá Độ bao phủ Kiểm thử (Test Coverage Analysis)
- Test hiện tại tại [backend/test/redis-meter.test.ts:60-79](file:///d:/Downloads/AAAAA/API-Market/backend/test/redis-meter.test.ts#L60-L79) **chỉ bao phủ trường hợp Redis bị treo (stalled response) vượt quá deadline 20ms**.
- **Chưa bao phủ trường hợp mất kết nối vật lý (Connection Refused / `ECONNREFUSED` / Socket Error)** khi tiến trình Redis sập đột ngột trước khi gọi eval.

### 4. Đề xuất Hướng xử lý (Proposed Solutions)
Nhóm phát triển và QA thống nhất lựa chọn một trong hai phương án sau:
- **Phương án A: Sửa Code Backend để phân tách mã lỗi (Code Remediation):**
  - Tách nhẹ bước kiểm tra hoặc gắn cờ phân biệt lỗi Rate Limit vs Quota; bổ sung unit test mô phỏng socket disconnect (`ECONNREFUSED`).
  - *Đánh giá:* Khớp 100% với AC ban đầu nhưng tăng độ phức tạp và có thể tăng độ trễ mạng.
- **Phương án B: Thống nhất cập nhật Tiêu chí Chấp nhận (AC Update):**
  - Cập nhật dòng 233 của `Sprint4_AcceptanceCriteria.md` và Runbook: chuẩn hóa mã lỗi trả về khi Redis gặp sự cố là `503 QUOTA_UNAVAILABLE` cho thiết kế Lua script gộp nguyên tử.
  - *Đánh giá:* Giữ nguyên hiệu năng tối ưu của Gateway, không làm xáo trộn 168 tests backend đang pass. Quyết định lựa chọn thuộc về nhóm.

---

# DEV-S4-02: Thiếu Response Header độ trễ phía Client (X-Gateway-Overhead-Ms)

**Mã tài liệu:** `DEV-S4-02`
**Phân hệ:** EP08 / US-23 — Gateway Overhead Measurement & Latency Telemetry Headers
**Test Case liên quan:** `TC-OVH-06` (Trạng thái kiểm thử: `FAIL`)

### 1. Tóm tắt Sai lệch (Summary)
Trong quá trình điều tra mã nguồn Gateway tại [backend/src/gateway-router.ts](file:///d:/Downloads/AAAAA/API-Market/backend/src/gateway-router.ts), [backend/src/gateway-service.ts](file:///d:/Downloads/AAAAA/API-Market/backend/src/gateway-service.ts) và [backend/src/safe-proxy.ts](file:///d:/Downloads/AAAAA/API-Market/backend/src/safe-proxy.ts), bộ phận QA phát hiện hệ thống Gateway hiện tại **không đính kèm header phản hồi độ trễ (`X-Gateway-Overhead-Ms` hoặc `X-Response-Time`)** trả về cho Client như đặc tả trong Tiêu chí Chấp nhận và Test Case.

### 2. Chi tiết Sai lệch (Deviation Details)
- **Hành vi kỳ vọng (Expected Behavior theo AC & TestCases):**
  - Theo [docs/test/Sprint4_AcceptanceCriteria.md:316](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_AcceptanceCriteria.md#L316) (`AC-S4-17`) và [docs/test/Sprint4_TestCases.md:120](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_TestCases.md#L120) (`TC-OVH-06`):
    - Khi Client (cURL / Postman / Consumer) gửi request qua Gateway trong môi trường test/staging, response HTTP trả về phải bao gồm header đo lường độ trễ: `X-Gateway-Overhead-Ms` hoặc `X-Response-Time` để hỗ trợ đối soát hiệu năng minh bạch.
- **Hành vi thực tế trong mã nguồn (Actual Implementation in Code):**
  - Tại [backend/src/gateway-router.ts:28, 46-50](file:///d:/Downloads/AAAAA/API-Market/backend/src/gateway-router.ts#L28), Gateway chỉ gán:
    1. `Cache-Control: no-store`
    2. `X-Request-Id` (tại `backend/src/app.ts:81`)
    3. Chuyển tiếp các upstream presentation headers (`content-type`, `content-language`, `cache-control`, `etag`, `last-modified`).
  - Giá trị `gateway_overhead_ms` chỉ được tính toán và lưu nội bộ vào cơ sở dữ liệu (`usage_outbox` và `usage_logs` tại [backend/src/gateway-service.ts:134](file:///d:/Downloads/AAAAA/API-Market/backend/src/gateway-service.ts#L134) và `usage-service.ts:65`).
  - **Hoàn toàn không có logic `res.setHeader('X-Gateway-Overhead-Ms', ...)` hay `res.setHeader('X-Response-Time', ...)` trong mã nguồn Gateway.**

### 3. Đánh giá Độ bao phủ Kiểm thử (Test Coverage Analysis)
- `qa-scripts/sprint4-full-runner.cjs:142-150` chỉ kiểm tra tĩnh chuỗi `gateway_overhead_ms` trong DDL Migration 009 và `gateway-benchmark.ts`, không có assertion kiểm tra response header của HTTP client cho `TC-OVH-06`.
- Không có bất kỳ test integration nào trong `backend/integration/gateway.test.ts` hay `gateway-metered.test.ts` kiểm tra header này trên response trả về cho client.

### 4. Đề xuất Hướng xử lý (Proposed Solutions)
Nhóm phát triển và QA thống nhất lựa chọn một trong ba phương án sau (quyết định cuối cùng thuộc về toàn đội ngũ, tuyệt đối không chọn hộ hướng):
- **Phương án A: Bổ sung Header vào Gateway Router (Code Enhancement):**
  - Tại [backend/src/gateway-router.ts](file:///d:/Downloads/AAAAA/API-Market/backend/src/gateway-router.ts), bổ sung logic đo đạc và gán header phản hồi:
    ```typescript
    res.setHeader('X-Gateway-Overhead-Ms', String(result.overheadMs ?? 0));
    res.setHeader('X-Response-Time', `${result.latencyMs}ms`);
    ```
  - Bổ sung test case integration trong `gateway-metered.test.ts` để kiểm tra sự tồn tại của 2 headers này.
  - *Đánh giá:* Đáp ứng đúng kỳ vọng giám sát minh bạch phía client theo `AC-S4-17`.
- **Phương án B: Điều chỉnh Tiêu chí Chấp nhận & Test Case (Scope Realignment):**
  - Sửa `AC-S4-17` và Test Case `TC-OVH-06` thành chỉ yêu cầu đo lường, tính toán và lưu vết chỉ số `gateway_overhead_ms` nội bộ vào database (`usage_logs`) để phục vụ báo cáo SLA P95 nội bộ và dashboard quản trị, loại bỏ yêu cầu xuất public header ra client.
  - *Đánh giá:* Giảm tải rò rỉ thông tin hạ tầng nội bộ ra ngoài client public, không cần sửa đổi router Gateway.
- **Phương án C: Điều chỉnh Test Case OVH-06 theo đúng độ co giãn của AC (TC Realignment to AC Flexibility):**
  - **Cơ sở kỹ thuật:** Đối soát trực tiếp tại `docs/test/Sprint4_AcceptanceCriteria.md:312-317` (`AC-S4-17`), tiêu chí chỉ quy định: *"Header trả về cho client có thể bao gồm header giám sát: `X-Gateway-Overhead-Ms: <value>` (nếu ở môi trường test/staging)"*. Cụm từ "có thể bao gồm" mang tính tùy chọn (optional). Việc Test Case `TC-OVH-06` đặt điều kiện tiên quyết bắt buộc phải có header là đặt tiêu chuẩn kiểm thử chặt hơn cả Tiêu chí Chấp nhận (AC).
  - **Đề xuất:** Cập nhật trạng thái `TC-OVH-06` trong tài liệu kiểm thử thành `"Not Implemented / Optional"` (hoặc `"Desirable"`), không tính vào điều kiện chặn nghiệm thu (Release Blocker) của Sprint 4.
  - *Đánh giá:* Phản ánh chính xác thực tế kỹ thuật và tinh thần của AC, không yêu cầu thay đổi mã nguồn backend hay sửa đổi AC.

### 5. Phân công Trách nhiệm & Theo dõi (Ownership & Tracking)
- **Tác giả phụ trách module (`backend/src/gateway-router.ts`):** **Nguyễn Tấn Dũng** (`@antondung`).
- **QA Lead theo dõi nghiệm thu:** Trần Hà Thảo Vân (`@vuonghathaovan-gif`).
- **Hành động tiếp theo:** Đội ngũ kỹ thuật họp thống nhất lựa chọn giữa Phương án A, B hoặc C trước khi chốt bản Release.

---

# DEV-S4-04: Không nhất quán mã lỗi khi API Key sai phạm vi API (API_KEY_SCOPE_MISMATCH vs INVALID_API_KEY)

**Mã tài liệu:** `DEV-S4-04`
**Phân hệ:** EP08 / US-23 — API Gateway Enforcement & Scope Binding
**Test Case liên quan:** `TC-GW-04` (Trạng thái kiểm thử: `FAIL`)
**Người phụ trách module (`backend/src/consumer-service.ts`):** **Nguyễn Như Tùng Dương** (theo `git log consumer-service.ts`)

### 1. Tóm tắt Sai lệch (Summary)
Trong quá trình kiểm thử thực nghiệm tại runtime ([qa-scripts/test-runtime-gaps.cjs:205](file:///d:/Downloads/AAAAA/API-Market/qa-scripts/test-runtime-gaps.cjs#L205)) và đối soát tài liệu Tiêu chí Chấp nhận ([docs/test/Sprint4_AcceptanceCriteria.md:176](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_AcceptanceCriteria.md#L176)), bộ phận QA phát hiện mã nguồn Backend tại `backend/src/consumer-service.ts:113-117` trả về mã lỗi chung `INVALID_API_KEY` thay vì mã lỗi định danh riêng `API_KEY_SCOPE_MISMATCH` khi Consumer dùng Key hợp lệ của API A gọi sang endpoint của API B.

### 2. Chi tiết Sai lệch (Deviation Details)
- **Hành vi kỳ vọng (Expected Behavior theo AC-S4-06:176 & TC-GW-04):**
  - Tại [docs/test/Sprint4_AcceptanceCriteria.md:170, 176](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_AcceptanceCriteria.md#L170):
    - *Trường hợp 4: Key thuộc sở hữu của Consumer hợp lệ nhưng được dùng để gọi vào một `api_id` khác với API đã cấp key (sai phạm vi).*
    - Gateway phải từ chối với HTTP `401 Unauthorized` kèm body JSON:
      ```json
      { "code": "API_KEY_SCOPE_MISMATCH", "message": "API key is not authorized for this API" }
      ```
  - Tại [docs/test/Sprint4_TestCases.md:83](file:///d:/Downloads/AAAAA/API-Market/docs/test/Sprint4_TestCases.md#L83) (`TC-GW-04`):
    - Kỳ vọng: HTTP 401 Unauthorized, Body: `code: "API_KEY_SCOPE_MISMATCH"`, chặn hành vi dùng chung key chéo API.
- **Hành vi thực tế trong mã nguồn (Actual Implementation in Code):**
  - Tại [backend/src/consumer-service.ts:111-118](file:///d:/Downloads/AAAAA/API-Market/backend/src/consumer-service.ts#L111):
    ```typescript
    const result = await this.pool.query(`UPDATE api_keys k SET last_used_at=NOW()
      FROM users u, roles r, apis a, api_providers p, users pu
      WHERE k.key_hash=$1 AND k.api_id=$2 AND k.is_active AND k.revoked_at IS NULL
        AND u.id=k.user_id AND u.is_active AND r.id=u.role_id AND r.name='USER'
        AND a.id=k.api_id AND a.status='Published' AND p.id=a.provider_id AND pu.id=p.user_id AND pu.is_active
      RETURNING k.id::text, k.user_id::text AS "userId", k.api_id::text AS "apiId"`, [secretHash(key), apiId]);
    if (!result.rows[0]) throw denied();
    ```
    với `denied = () => new ApiError(401, 'INVALID_API_KEY', 'Invalid API key');`.
  - Khi caller dùng Key của API A gọi sang API B, câu lệnh SQL lọc đồng thời `k.key_hash=$1 AND k.api_id=$2` trả về 0 dòng, kích hoạt `throw denied()` ném mã `401 INVALID_API_KEY`. Mã lỗi `API_KEY_SCOPE_MISMATCH` hoàn toàn chưa tồn tại trong mã nguồn backend.

### 3. Đánh giá Độ bao phủ Kiểm thử (Test Coverage Analysis)
- Đã được chứng minh bằng kiểm thử runtime thực tế trong `qa-scripts/test-runtime-gaps.cjs:205`: tạo API Key hợp lệ cho API ID 3, gửi HTTP request tới Gateway route của API ID 7, nhận phản hồi thực tế:
  `HTTP 401 Unauthorized`, Body: `{"error":{"code":"INVALID_API_KEY","message":"Invalid API key"}}`.
- Toàn bộ test suite tích hợp trong `backend/integration/` chưa có test case nào kiểm tra hành vi scope mismatch.

### 4. Đề xuất Hướng xử lý (Proposed Solutions)
Nhóm phát triển và QA thống nhất lựa chọn một trong hai phương án sau (quyết định cuối cùng thuộc về toàn đội ngũ, tuyệt đối không chọn hộ hướng):
- **Phương án A: Sửa Code Backend để phân tách mã lỗi (Code Remediation):**
  - Tách quá trình xác thực thành 2 bước truy vấn: Bước 1 tìm key theo `key_hash` và kiểm tra trạng thái hoạt động; Bước 2 so sánh `key.api_id === target_api_id`. Nếu key hợp lệ nhưng sai API, ném `new ApiError(401, 'API_KEY_SCOPE_MISMATCH', 'API key is not authorized for this API')`.
  - Bổ sung integration test trong `backend/integration/gateway.test.ts`.
  - *Đánh giá:* Khớp 100% với AC-S4-06 dòng 176 ban đầu; giúp lập trình viên tích hợp nhận biết rõ nguyên nhân lỗi do cấu hình nhầm key hay do key bị hỏng.
- **Phương án B: Điều chỉnh Tiêu chí Chấp nhận & Test Case (Scope Realignment / Security by Obscurity):**
  - Cập nhật dòng 176 của `Sprint4_AcceptanceCriteria.md` và `Sprint4_TestCases.md`: thống nhất chỉ trả về mã lỗi chung `401 INVALID_API_KEY`.
  - *Đánh giá:* Tuân thủ khuyến nghị bảo mật OWASP API Security (ngăn chặn kẻ tấn công dò quét xem một API key ngẫu nhiên có tồn tại hợp lệ ở một API khác trong hệ thống hay không). Không yêu cầu sửa code backend.

### 5. Phân công Trách nhiệm & Theo dõi (Ownership & Tracking)
- **Tác giả phụ trách module (`backend/src/consumer-service.ts`):** **Nguyễn Như Tùng Dương**.
- **QA Lead theo dõi nghiệm thu:** Trần Hà Thảo Vân (`@vuonghathaovan-gif`).
- **Hành động tiếp theo:** Đội ngũ kỹ thuật họp thống nhất lựa chọn giữa Phương án A hoặc B trước khi đóng Sprint 4.
