# Sprint 3 Frontend-Backend Integration Report

Date: 2026-10-27
Branch: `feature/sprint3-frontend-marketplace`
Scope: Full Frontend Connection to Sprint 3 Backend Contracts

---

## 1. Executive Summary

All three core Sprint 3 Backend contracts have been integrated and verified in the frontend application:
1. Consumer API Key Management (`ApiKeysPage.tsx` connected to `/api/consumer/api-keys`).
2. Authoritative Sandbox Grants & Quota Lifecycle (`TrySandboxPage.tsx` connected to `/api/consumer/apis/:apiId/sandbox`).
3. Interactive Playground Gateway Execution (`ApiPlaygroundPage.tsx` connected to `/api/marketplace/apis/:id/playground`).

Zero mock credentials exist in client code, and zero plaintext secrets are persisted to client storage.

---

## 2. Integration Status of Sprint 3 Backend Contracts

### 2.1 Consumer API Keys Contract
- API Base: `/api/consumer/api-keys`
- Client Service: `frontend/src/services/consumerApi.ts`
- Handled Endpoints:
  * `GET /api/consumer/api-keys`: Lists keys with pagination (`page`, `pageSize`, `total`, `items`).
  * `POST /api/consumer/api-keys`: Creates new key for specified `apiId` and `label`. Returns one-time plaintext key and metadata.
  * `POST /api/consumer/api-keys/:id/rotate`: Revokes existing key immediately and returns newly minted key.
  * `DELETE /api/consumer/api-keys/:id`: Permanently revokes key with audit tracking.
- Zero Plaintext Secret Principle Compliance:
  * Plaintext key (`ak_live_...`) is received from server in memory only.
  * Modal displays the key with explicit copy-to-clipboard action and warning: "Lưu ý an toàn: Khóa này chỉ hiển thị một lần duy nhất."
  * Once dismissed, the secret is purged from React state.
  * `localStorage`, `sessionStorage`, cookies, and URL query strings NEVER store the plaintext key or prefix.
  * Only server-stored SHA-256 hashes are used for verification.

### 2.2 Authoritative Sandbox Grant & Quota Contract
- API Base: `/api/consumer/apis/:apiId/sandbox`
- Client Service: `frontend/src/services/consumerApi.ts`
- Contract Attributes:
  * `id`: string
  * `apiId`: string
  * `maxRequests`: number (default: 5)
  * `usedRequests`: number
  * `remainingRequests`: number
  * `available`: boolean
  * `expiresAt`: ISO 8601 string (24 hours from creation)
  * `revokedAt`: ISO 8601 string | null
- UI Behavior & Guarantees:
  * State is strictly authoritative: frontend displays numbers directly from backend response.
  * No optimistic client-side quota resets: calling POST on an existing grant returns the existing active grant without resetting request counts.
  * Status badges clearly differentiate:
    - Active Grant: `remainingRequests > 0` and `expiresAt > now`.
    - Exhausted: `remainingRequests === 0`.
    - Expired: `expiresAt <= now`.
    - Revoked: `revokedAt !== null`.
  * Step 3 execution displays remaining requests and guides the user to Playground.

### 2.3 Interactive Playground Gateway Contract
- API Endpoint: `POST /api/marketplace/apis/:id/playground`
- Client Service: `frontend/src/services/consumerApi.ts`
- Authentication: Authenticated via Consumer session JWT (`Authorization: Bearer <token>`).
- Request Payload:
  ```json
  {
    "endpointId": "ep-123",
    "pathParams": { "userId": "12" },
    "query": { "includeDetails": "true" },
    "headers": { "content-type": "application/json" },
    "body": { "query": "demo" }
  }
  ```
- Response Payload:
  ```json
  {
    "status": 200,
    "headers": { "content-type": "application/json" },
    "body": "{\"result\": \"success\"}",
    "bodyEncoding": "utf8",
    "latencyMs": 45,
    "remainingRequests": 4
  }
  ```
- Error Isolation:
  * Upstream HTTP error codes (e.g. 400, 404, 500, 502) returned by the provider backend are cleanly displayed in the response panel.
  * Platform errors (e.g. 401 unauthenticated, 403 non-consumer, 429 quota exhausted) are trapped and mapped to user-friendly alerts.
  * After each run, the authoritative `remainingRequests` returned by the server updates the local grant indicator.

---

## 3. Hardened Snippet Generation

Code snippet generator (`frontend/src/utils/apiSnippetGenerator.ts`) complies with rigorous security rules:
1. Shell Injection Prevention:
   - Header values, URLs, and JSON payloads wrapped in POSIX single-quotes (`'...'`).
   - Inner single-quotes escaped via `'\''`.
2. Header CRLF Injection Prevention:
   - Header keys and values stripped of `\r`, `\n`, and non-printable control characters.
3. Secret Exposure Prevention:
   - Snippets default to placeholder token `YOUR_API_KEY`.
   - Real entered API key is only placed into snippets upon explicit opt-in click ("Chèn API Key thật").
   - Opt-in state automatically resets upon session invalidation or endpoint switching.

---

## 4. Test Verification Summary

| Test Layer | Suite / Target | Total Tests | Pass Status | Duration |
|---|---|---|---|---|
| Backend Unit Tests | `backend/test/gateway-unit.test.ts` | 2 tests | 100% PASS | ~8ms |
| Frontend Unit / Vitest | `frontend/src/**/*.test.tsx` | 302 tests (30 files) | 100% PASS | 54.3s |
| Playwright Smoke Suite | `sprint3-frontend/run-smoke.ps1` | 13 tests | 100% PASS | 1.1m |
| Playwright Functional Suite | `sprint3-frontend/run-functional.ps1` | 47 tests | 100% PASS | 1.7m |
| Playwright Accessibility Suite | `sprint3-frontend/run-a11y.ps1` | 7 tests | 100% PASS | 23.8s |
| Playwright Visual / Responsive Suite | `sprint3-frontend/run-visual.ps1` | 31 tests | 100% PASS | 1.1m |
| Playwright Full QA Suite | `sprint3-frontend/run-full.ps1` | 101 tests | 100% PASS | 4.0m |
| Repository Quality Check | `scripts/kiem-tra-kho-ma-nguon.ps1` | 324 files | 100% PASS | ~3s |
| Production Frontend Build | `npm run build` in `frontend/` | 522 modules | 100% PASS | 1.35s |
| Backend TypeScript Build | `npm run build` in root | Root project | 100% PASS | ~1.5s |
