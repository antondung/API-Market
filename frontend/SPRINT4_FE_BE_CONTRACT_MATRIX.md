# API HUB — SPRINT 4 FE–BE CONTRACT MATRIX
## Contract Foundation · Subscription · Checkout Sandbox · Usage & Analytics

- **Document Version:** 1.0.0
- **Date:** 2026-11-04
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Base Commit:** `origin/develop` (`f6b83abdcbf57d8a5de1eee0202fe3b1cf0a1392`)
- **Backend Reference Commit:** `2c8a873023e071a93097a3d32b17bffbc3e41585` (PR #92)
- **Database Reference Commit:** `a475d353c1bc9ec4af09d92a934094eabae1ce45` (PR #91)
- **Handoff Document:** `backend/SPRINT-4-HANDOFF.md` & `backend/src/sprint4-contract.ts`

---

## 1. Baseline & Integration Status

| Component | Repository Reference / SHA | Branch / PR | CI Status | Merge Status | Integration Readiness |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Database Schema** | `a475d353c1bc9ec4af09d92a934094eabae1ce45` | PR #91 (`origin/feature/19-sprint4-database`) | ❌ Failing (Fixture status trigger) | OPEN | Blocked by fixture trigger (BLOCKER-02) |
| **Backend API** | `2c8a873023e071a93097a3d32b17bffbc3e41585` | PR #92 (`origin/codex/sprint4-backend`) | ✅ SUCCESS | OPEN | Pinned contract ready for FE alignment |
| **Frontend Control** | `feature/18-sprint4-frontend-billing` | Issue #18 (Draft PR) | Pending local suite | DRAFT | Aligned to Backend PR #92 specification |

*Note: Frontend tests against mock contracts and isolated integration stubs; no claim of live end-to-end integration is made until PR #91 and PR #92 are merged into `develop`.*

---

## 2. API Contract Endpoints Matrix

All endpoints require Bearer JWT authentication via `authenticatedRequest()` unless explicitly marked public. All responses follow the standard envelope `{ data: T }`.

| # | HTTP Method | Endpoint Path | Role Required | Request Body / Query | Success Status | Response Body Envelope (`data`) | Error Codes | Frontend Service | UI Consumer |
| :- | :--- | :--- | :--- | :--- | :- | :--- | :--- | :--- | :--- |
| **1** | `POST` | `/api/consumer/subscriptions` | `Consumer` | JSON: `{ planId: string }` | `201 Created` | `SubscriptionView` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN<br>`404` PLAN_NOT_FOUND<br>`409` SUBSCRIPTION_ALREADY_EXISTS<br>`409` SUBSCRIPTION_PERIOD_LOCKED | `billingApi.subscribe` | `CheckoutPage` |
| **2** | `GET` | `/api/consumer/subscriptions` | `Consumer` | Query: `page?: number`, `pageSize?: number` | `200 OK` | `{ items: SubscriptionView[], total: number, page: number, pageSize: number }` | `401` UNAUTHORIZED<br>`403` FORBIDDEN | `billingApi.listSubscriptions` | `MySubscriptionsPage` |
| **3** | `GET` | `/api/consumer/subscriptions/{id}` | `Consumer` | Path: `id: string` | `200 OK` | `SubscriptionView` | `401` UNAUTHORIZED<br>`403` FORBIDDEN<br>`404` NOT_FOUND | `billingApi.getSubscription` | `CheckoutPage`, `MySubscriptionsPage` |
| **4** | `POST` | `/api/consumer/subscriptions/{id}/cancel` | `Consumer` | Path: `id: string`<br>JSON: `{ immediate?: boolean }` (default `false`) | `200 OK` | `SubscriptionView` | `401` UNAUTHORIZED<br>`403` FORBIDDEN<br>`404` NOT_FOUND<br>`409` INVALID_STATE | `billingApi.cancelSubscription` | `MySubscriptionsPage` |
| **5** | `POST` | `/api/consumer/subscriptions/{id}/checkout` | `Consumer` | Path: `id: string`<br>JSON: `{ idempotencyKey: string }` | `201 Created` / `200 OK` (replay) | `PaymentView` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN<br>`404` NOT_FOUND<br>`409` INVALID_STATE<br>`409` IDEMPOTENCY_CONFLICT<br>`409` CHECKOUT_PENDING | `billingApi.createCheckout` | `CheckoutPage` |
| **6** | `POST` | `/api/consumer/subscriptions/{id}/change-plan` | `Consumer` | Path: `id: string`<br>JSON: `{ planId: string, idempotencyKey: string }` | `201 Created` | `PaymentView` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN<br>`404` NOT_FOUND<br>`409` INVALID_PLAN<br>`409` INVALID_STATE<br>`409` IDEMPOTENCY_CONFLICT<br>`409` CHECKOUT_PENDING | `billingApi.changePlan` | `MySubscriptionsPage` |
| **7** | `POST` | `/api/consumer/subscriptions/confirm` | `Consumer` | JSON: `{ paymentId: string, token: string, outcome: 'success' \| 'failure', eventId: string }` | `200 OK` | `{ paymentId: string, status: 'Succeeded' \| 'Failed', duplicate: boolean }` | `400` VALIDATION_ERROR<br>`401` INVALID_SANDBOX_TOKEN<br>`403` FORBIDDEN<br>`404` NOT_FOUND<br>`409` CHECKOUT_EXPIRED<br>`409` PAYMENT_ALREADY_SETTLED<br>`409` SUBSCRIPTION_UNAVAILABLE<br>`409` WEBHOOK_CONFLICT | `billingApi.confirmSandboxPayment` | `CheckoutPage` |
| **8** | `GET` | `/api/consumer/usage/summary` | `Consumer` | Query: `apiId?`, `status?`, `from?`, `to?`, `page?`, `pageSize?` | `200 OK` | `{ subscriptions: UsageSubscriptionSummary[], daily: DailyUsageSummary[] }` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN | `usageApi.getConsumerUsageSummary` | `UsageQuotaPage`, `ConsumerDashboardPage` |
| **9** | `GET` | `/api/consumer/usage/history` | `Consumer` | Query: `apiId?`, `status?`, `from?`, `to?`, `page?`, `pageSize?` | `200 OK` | `{ items: UsageHistoryItem[], total: number, page: number, pageSize: number }` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN | `usageApi.getConsumerUsageHistory` | `RequestHistoryPage` |
| **10** | `GET` | `/api/provider/analytics/overview` | `Provider` | Query: `apiId?`, `status?`, `from?`, `to?`, `page?`, `pageSize?` | `200 OK` | `{ requests: ProviderAnalyticsRequests, daily: ProviderAnalyticsDaily[], revenue: ProviderAnalyticsRevenue[], activeSubscribers: string }` | `400` VALIDATION_ERROR<br>`401` UNAUTHORIZED<br>`403` FORBIDDEN | `usageApi.getProviderAnalyticsOverview` | `ProviderDashboardPage` |

---

## 3. Lifecycle State Machines & Flows

### 3.1 Free Plan Lifecycle
```
[User clicks Subscribe Free]
       │
       ▼
POST /api/consumer/subscriptions { planId }
       │
       ▼ (Backend price_monthly == 0 check)
Returns 201 Created with status = 'Active'
       │
       ▼
Frontend refetches subscription / redirects to /consumer/subscriptions
(NO payment record created, NO sandbox confirmation needed)
```

### 3.2 Paid Plan Lifecycle (Sandbox Simulation)
```
[User selects Paid Plan & accepts Terms]
       │
       ▼
POST /api/consumer/subscriptions { planId }
       │
       ▼
Returns 201 Created with status = 'Pending'
       │
       ▼
POST /api/consumer/subscriptions/{id}/checkout { idempotencyKey }
       │
       ▼
Returns 201 Created with { paymentId, amount, currency, status: 'Pending', expiresAt, token }
       │
       ▼
[User chooses Sandbox Outcome: "Success" or "Failure"]
       │
       ▼
POST /api/consumer/subscriptions/confirm { paymentId, token, outcome, eventId }
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼ (outcome = "success")           ▼ (outcome = "failure" on new sub)▼ (outcome = "failure" on change-plan)
Returns 200 { status: 'Succeeded' }    Returns 200 { status: 'Failed' }  Returns 200 { status: 'Failed' }
Subscription becomes 'Active'          Subscription becomes 'Canceled'   Existing plan/quota preserved
Entitlement valid for 30 days          Pending payment marked Failed     Pending payment marked Failed
```

### 3.3 Plan Change Lifecycle
- Initiated from `MySubscriptionsPage` via `POST /api/consumer/subscriptions/{id}/change-plan`.
- Target plan must belong to the exact same `api_id` and be different from current `plan_id`.
- Current subscription must be in `Active` status.
- Settlement preserves current quota used (`quota_used`), and only updates `plan_id`, `quota_limit`, `rate_limit_per_minute`, `price_amount`, `price_currency`.
- Quota is **never** reset locally before payment confirmation succeeds.

### 3.4 Cancellation Lifecycle
- **Standard (`immediate: false`):**
  - Sets `cancel_at_period_end = true`.
  - Subscription status remains `Active` until `current_period_end`.
  - Consumer continues to have API Gateway access until expiration.
- **Immediate (`immediate: true`):**
  - Sets `cancel_at_period_end = true`, `status = 'Canceled'`, `canceled_at = NOW()`.
  - Pending payments are updated to `Failed` (`SUBSCRIPTION_CANCELED`).
  - **Immediately revokes API Gateway access**. UI explicitly displays warning before confirmation.

---

## 4. Data Types and Precision Guarantees

1. **BIGINT IDs & Quota:**
   - PostgreSQL `BIGINT` values exceed `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991).
   - In frontend TypeScript, all `BIGINT` quantities (`id`, `quotaLimit`, `quotaUsed`, `remainingRequests`, `requestCount`) are typed and handled as `string` values.
   - Display formatting uses safe string parsing / `BigInt(str).toLocaleString()` with fallback.
2. **NUMERIC(14,2) Currencies:**
   - Money values (`amount`, `priceAmount`, `revenue.amount`) are stored and transmitted as formatted string decimals (e.g. `"750000.00"`).
   - Display formatting is currency-aware (VND formatting vs USD/EUR formatting).
3. **Status Enum Alignment:**
   - `SubscriptionStatus`: `'Pending' | 'Active' | 'Past Due' | 'Suspended' | 'Canceled' | 'Expired'`.
   - Single-l `Canceled` matches database check constraint `chk_subscriptions_status`.
   - `PaymentStatus`: `'Pending' | 'Succeeded' | 'Failed' | 'Refunded'`.

---

## 5. Security & Isolation Invariants

1. **Secret & Token Leak Prevention:**
   - `token` from `PaymentView` is strictly held in component memory during sandbox simulation.
   - `token` is **never** written to `localStorage`, `sessionStorage`, cookies, query parameters, or console logs.
   - Idempotency keys (`idempotencyKey`) and event IDs (`eventId`) are generated using standard UUID v4 or random hex, scoped per user session.
2. **Account & Role Isolation:**
   - Billing and subscription endpoints require `Consumer` role (`USER` in DB).
   - Provider analytics endpoints require `Provider` role.
   - The backend enforces `consumer_id = user.id` in every SQL query with row-level locks (`FOR UPDATE`). Attempting to access another user's subscription returns 404 NOT_FOUND.
3. **No Fake Card / Real PSP Commitment:**
   - The sandbox checkout clearly identifies itself as a test simulation.
   - No credit card inputs (PAN, CVV, Expiration) are collected.
   - No Visa/Mastercard/VNPay/MoMo logos or merchant agreements are presented as live PSPs.

---

## 6. Architectural Discrepancies & Blockers

### BLOCKER-01: Rate Limit Unit Mismatch (P1)
- **Frontend Provider View:** `frontend/src/pages/provider/PricingManagementPage.tsx` defines and displays rate limits in **RPS (Requests Per Second)**.
- **Backend Sprint 4 Implementation:** `subscriptions.rate_limit_per_minute` and `RedisMeter` calculate and enforce limits in **RPM (Requests Per Minute)** with Redis TTL of 120s (`EXPIRE key 120`).
- **Impact:** A rate limit entered as `10` in frontend would mean 10 req/s to a provider, but 10 req/min in gateway enforcement (60x stricter).
- **Action Required:** Tech Lead / Backend lead must decide whether `api_plans.rate_limit` represents RPS or RPM, and whether gateway snapshot stores RPM or converts from RPS.

### BLOCKER-02: PR #91 Database Schema CI Failure (P1)
- **Issue:** CI run on PR #91 fails with `status trigger rejected` on fixture inserting `Published` API directly.
- **Backend Fix:** PR #92 added `DISABLE TRIGGER USER` / `ENABLE TRIGGER USER` around fixture setup.
- **Action Required:** Database engineer must backport fixture trigger bypass or status workflow to PR #91 so CI turns green.

### BLOCKER-03: Backend PR #92 Unmerged Dependency (P2)
- **Status:** Backend PR #92 is OPEN with CI SUCCESS, but not yet merged into `origin/develop`.
- **Frontend Posture:** Frontend implements against exact SHA `2c8a873023e071a93097a3d32b17bffbc3e41585`. All UI and service unit tests run in mock isolation; end-to-end integration remains in draft pending PR merge.
