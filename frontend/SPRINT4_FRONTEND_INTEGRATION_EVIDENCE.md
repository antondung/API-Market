# API HUB — SPRINT 4 FRONTEND INTEGRATION EVIDENCE
## Bằng Chứng Kỹ Thuật · Giao Thức Mạng · Xác Thực Tích Hợp

- **Assignee (Issue #18):** Lê Hải Dương (`@leduwn`, Frontend Developer)
- **Git Committer & Operations Lead:** Nguyễn Tấn Dũng (`@antondung`, Frontend Tech Lead & Operations)
- **Nhánh triển khai:** `feature/18-sprint4-frontend-billing`
- **Hệ tham chiếu Backend:** Commit `2c8a873023e071a93097a3d32b17bffbc3e41585` (PR #92)
- **Hệ tham chiếu Database:** Commit `a475d353c1bc9ec4af09d92a934094eabae1ce45` (PR #91)
- **Ngày lập:** 2026-11-05

---

## 1. Kiến Trúc Tuyến Đường & Gateway Reverse Proxy Routing

Hệ thống tuân thủ hợp đồng định tuyến reverse proxy giữa API Gateway và Control Plane:

```
[Consumer Application]
       │
       │ HTTP Request kèm Header: X-API-Key: ak_live_xxx
       ▼
[API Gateway: /api/gateway/:apiId/*rest]
       │
       ├─► 1. Xác thực tính hợp lệ của X-API-Key (SHA-256 hash lookup)
       ├─► 2. Kiểm tra giới hạn tốc độ (Redis Sliding Window: req/phút)
       ├─► 3. Ghi nhận telemetry viễn trắc (usage logs)
       └─► 4. Reverse Proxy tới Upstream Provider Endpoint
```

### Bằng chứng mã nguồn:
- **Bộ sinh mã lệnh (`frontend/src/utils/apiSnippetGenerator.ts`)**:
  ```typescript
  export function buildGatewayPath(apiId: string | number, endpointPath: string): string {
    const cleanApiId = String(apiId).trim();
    const rawPath = (endpointPath || '').trim();
    const normalizedRest = rawPath.replace(/^\/+/, '');
    return normalizedRest ? `/api/gateway/${cleanApiId}/${normalizedRest}` : `/api/gateway/${cleanApiId}`;
  }
  ```
- **Kiểm thử tích hợp (`frontend/src/utils/apiSnippetGenerator.test.ts`)**:
  - `buildGatewayPath('api_sms_99', '/v1/messages/send')` sinh `/api/gateway/api_sms_99/v1/messages/send`.
  - Tự động cắt bỏ `/v1` thừa nếu URL mặc định kết thúc bằng `/v1` khi gọi route Gateway.

---

## 2. Bằng Chứng Giao Thức Mạng & Hợp Đồng Dữ Liệu (Wire Protocol)

### 2.1 Bóc tách vỏ bọc Envelope (`{ data: ... }`)
Toàn bộ các yêu cầu HTTP trong `usageApi.ts` và `billingApi.ts` gọi qua `authenticatedRequest<{ data: T }>()` và bóc tách dữ liệu typed:

```typescript
const res = await authenticatedRequest<{ data: ProviderAnalyticsOverview }>(
  `/api/provider/analytics/overview${query}`,
  { method: 'GET', signal }
);
return res.data;
```

### 2.2 Sinh khóa Idempotency Key An Toàn (CSPRNG Fail-Closed)
- Tuyệt đối không dùng `Math.random()`.
- Sử dụng `crypto.randomUUID()` hoặc `crypto.getRandomValues(new Uint8Array(16))`.
- Ném lỗi chủ đích nếu thiếu nguồn ngẫu nhiên an toàn:
  ```typescript
  export function generateSecureRandomHex(byteLength = 16): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      if (typeof globalThis.crypto.randomUUID === 'function' && byteLength === 16) {
        return globalThis.crypto.randomUUID().replace(/-/g, '');
      }
      if (typeof globalThis.crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(byteLength);
        globalThis.crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      }
    }
    throw new Error('Secure cryptographic random source unavailable');
  }
  ```

### 2.3 Quản lý Token Thanh toán trong Bộ Nhớ (Zero Persistence)
- `PaymentView.token` nhận từ `POST /checkout` chỉ được giữ trong bộ nhớ hàm (closure / React local state).
- Tuyệt đối không lưu vào `localStorage`, `sessionStorage`, hay URL query string.

---

## 3. Bằng Chứng Xử Lý Số Học BigInt & Đa Tiền Tệ (Multi-Currency)

### 3.1 BigInt Quota Safety
Toàn bộ các số đếm lưu lượng và hạn ngạch từ PostgreSQL `BIGINT` được chuyển thành chuỗi và tính toán qua `BigInt` nguyên bản:
```typescript
const totalMonthlyQuotaUsed = (usageSummary?.subscriptions || []).reduce(
  (acc, s) => acc + parseSafeBigInt(s.quotaUsed),
  0n
);
```

### 3.2 Tách biệt Đa Tiền Tệ (Multi-Currency Separation)
Tại `ProviderDashboardPage.tsx`:
```tsx
{revenueItems.map((rev) => (
  <div
    key={rev.currency}
    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold font-code-md text-xl"
  >
    {formatCurrencyAmount(rev.amount, rev.currency)}
  </div>
))}
```
- Hiển thị song song: `25.000.000 VND` và `150,5 USD`.
- Tuyệt đối không cộng dồn số học giữa 2 loại tiền tệ khác nhau.

---

## 4. Nhật Ký Thực Thi Kiểm Thử & Biên Dịch (Execution Logs)

### 4.1 Vitest Suite Run
```
 RUN  v5.0.4 D:/Projects/api-hub/frontend

 Test Files  39 passed (39)
      Tests  509 passed (509)
   Start at  00:07:28
   Duration  57.66s
```

### 4.2 Production Build (`tsc -b && vite build`)
```
vite v8.3.4 building client environment for production...
transforming...
✓ 526 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.37 kB │ gzip:   0.68 kB
dist/assets/index-hWmxDfls.css   47.57 kB │ gzip:   9.06 kB
dist/assets/index-P35sWGjZ.js   491.17 kB │ gzip: 153.38 kB
✓ built in 2.54s
```

### 4.3 Kiểm tra Kho mã nguồn (`scripts/kiem-tra-kho-ma-nguon.ps1`)
```
Kiểm tra thành công: 363 tệp, không có lỗi nền tảng.
```
