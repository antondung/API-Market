# Sprint 5 â€” TiÃªu chÃ­ Cháº¥p nháº­n (Acceptance Criteria) & Ma tráº­n RBAC

> **Dá»± Ã¡n:** API Marketplace & Management Platform
> **TÃ i liá»‡u QA Lead:** Tráº§n HÃ  Tháº£o VÃ¢n (`@vuonghathaovan-gif` â€” Issue #25)
> **CÄƒn cá»© ká»¹ thuáº­t:** `docs/07-sprint5-demo-and-rc-checklist.md`, `docs/06-production-rollback-runbook.md`, `backend/SPRINT-5-HANDOFF.md`, `backend/SPRINT-5-DATABASE-HANDOFF.md`, `docs/test/TESTING_RULES.md`, `docs/01-kien-truc-he-thong.md`, `docs/02-role-va-phan-quyen.md`.
> **ChÃ­nh sÃ¡ch:** **Feature Freeze toÃ n há»‡ thá»‘ng (tá»« 09/11/2026)** â€” KhÃ´ng nháº­n tÃ­nh nÄƒng má»›i, chá»‰ hoÃ n thiá»‡n cÃ¡c má»¥c Should (`US-31`, `US-32`), cá»§ng cá»‘ báº£o máº­t (`EN-11`), Ä‘o táº£i & tá»‘i Æ°u (`EN-12`), Ä‘Ã³ng gÃ³i triá»ƒn khai & rollback (`EN-13`), hoÃ n thiá»‡n UX/Responsive (`EN-14`), kiá»ƒm thá»­ há»“i quy & nghiá»‡m thu (`EN-15`), vÃ  ká»‹ch báº£n demo (`EN-16`).
> **Quy chuáº©n cháº¥t lÆ°á»£ng:** TuÃ¢n thá»§ quy táº¯c **Z1â€“Z5** (khÃ´ng pass áº£o, khÃ´ng sleep cá»©ng, khÃ´ng bypass access control), **H1â€“H4** (clean state, human selector, pressSequentially, viewports 1280x720 vÃ  768x1024), **A1â€“A3** (0 lá»—i console Ä‘á», pháº§n tá»­ trong viewport, ngÆ°á»i dÃ¹ng thao tÃ¡c láº¡i Ä‘Æ°á»£c).

---

## 1. Báº¢NG Tá»”NG QUAN PHáº M VI SPRINT 5 (SCOPE OVERVIEW)

| PhÃ¢n há»‡ / Epic | MÃ£ User Story | Ná»™i dung cá»‘t lÃµi | Phá»¥ trÃ¡ch chÃ­nh | Sá»‘ lÆ°á»£ng AC | Má»©c Æ°u tiÃªn | Phá»¥ thuá»™c ká»¹ thuáº­t |
|---|---|---|---|:---:|:---:|---|
| **Provider Analytics** | `US-31` | PhÃ¢n tÃ­ch lÆ°u lÆ°á»£ng API & Endpoint, tá»· lá»‡ lá»—i 4xx/5xx, P50/P95/P99 latency & overhead, doanh thu VND/USD | Danh (DB), TÃ¹ng DÆ°Æ¡ng (BE), Háº£i DÆ°Æ¡ng (FE) | 4 AC | **Should-Have** | Chá» FE #23; BE PR #106; DB PR #104 |
| **Cost Guard** | `US-32` | NgÃ¢n sÃ¡ch thÃ¡ng, cáº£nh bÃ¡o 50%/80%/100%, ngáº¯t cá»©ng `hardCutoff` 429, miá»…n trá»« Free & Sandbox | TÃ¹ng DÆ°Æ¡ng (BE), Háº£i DÆ°Æ¡ng (FE), Danh (DB) | 5 AC | **Should-Have** | Chá» FE #23; BE PR #106; DB PR #104 |
| **Báº£o máº­t & Kiá»ƒm soÃ¡t truy cáº­p** | `EN-11` | Chá»‘ng SSRF Upstream, DNS rebinding, chá»‘ng lÃ¡ch rate limit xoay key, mÃ£ hÃ³a API Key, khá»­ dá»¯ liá»‡u nháº¡y cáº£m | TÃ¹ng DÆ°Æ¡ng (BE), Tháº£o VÃ¢n (QA) | 5 AC | **Must-Have** | Sáºµn sÃ ng trÃªn `develop` / Chá» BE PR #106 |
| **Táº£i Gateway & SLA** | `EN-12` | Äo táº£i c=1, 10, 25; SLA P95 Overhead < 30ms; Atomic Quota (Lua script) | Táº¥n DÅ©ng (TL), TÃ¹ng DÆ°Æ¡ng (BE), Danh (DB) | 2 AC | **Must-Have** | Sáºµn sÃ ng (`develop` / PR #103); Rá»§i ro SLA BE PR #106 |
| **Triá»ƒn khai, Sao lÆ°u & Rollback** | `EN-13` | Production Preflight, tá»± Ä‘á»™ng hÃ³a sao lÆ°u & phá»¥c há»“i database, quy trÃ¬nh rollback < 60s | Táº¥n DÅ©ng (TL), Danh (DB) | 3 AC | **Must-Have** | Sáºµn sÃ ng (`develop` / PR #103); Chá» DB PR #104 |
| **UX, Responsive & A11y** | `EN-14` | Giao diá»‡n chuáº©n 1280x720 & 768x1024, Zero Console Error, Empty/Error/Loading states | Háº£i DÆ°Æ¡ng (FE), Tháº£o VÃ¢n (QA) | 4 AC | **Must-Have** | Chá» FE Issue #23 (@leduwn) |
| **Há»“i quy & Nghiá»‡m thu** | `EN-15` | Full regression 180+ tests BE, 550+ tests FE, UAT 3 vai trÃ², KÃ½ duyá»‡t Release Candidate | Tháº£o VÃ¢n (QA), Táº¥n DÅ©ng (TL) | 3 AC | **Must-Have** | Chá» tÃ­ch há»£p toÃ n diá»‡n develop & Staging Ä‘Ã³ng bÄƒng |
| **Ká»‹ch báº£n Demo 4 PhÃ¢n cáº£nh** | `EN-16` | Demo trá»n váº¹n 12-15 phÃºt 4 phÃ¢n cáº£nh xuyÃªn suá»‘t 3 vai trÃ² khÃ´ng sá»­a tay | Cáº£ nhÃ³m (Äiá»u phá»‘i: Táº¥n DÅ©ng, Tháº£o VÃ¢n) | 4 AC | **Must-Have** | PhÃ¢n cáº£nh 1-2: Sáºµn sÃ ng; PhÃ¢n cáº£nh 3: PR #105; PhÃ¢n cáº£nh 4: FE #23 |

---

## 2. TIÃŠU CHÃ CHáº¤P NHáº¬N CHI TIáº¾T (ACCEPTANCE CRITERIA)

---

### PHÃ‚N Há»† 1: US-31 â€” PROVIDER ANALYTICS DASHBOARD (PHÃ‚N TÃCH NHÃ€ CUNG Cáº¤P)
- **TÃ¡c nhÃ¢n:** `API_PROVIDER` (xem dashboard cá»§a chÃ­nh mÃ¬nh), `ADMIN` (giÃ¡m sÃ¡t tá»•ng thá»ƒ).
- **Há»£p Ä‘á»“ng API & Schema:**
  - `GET /api/provider/analytics/overview?apiId={id}&endpointId={id}&from={date}&to={date}`
  - Giao diá»‡n Frontend: Route `/provider/analytics` (táº¡i `frontend/src/App.tsx:164` trá» tá»›i `AnalyticsHealthPage.tsx`, commit `e9b5a45`; hiá»‡n táº¡i UI Ä‘Ã£ cÃ³ sáºµn nhÆ°ng dÃ¹ng dá»¯ liá»‡u cá»¥c bá»™/mock qua `AppContext`, Ä‘ang chá» FE Issue #23 ná»‘i API thá»±c táº¿).
  - Báº£ng cÆ¡ sá»Ÿ dá»¯ liá»‡u: `provider_daily_aggregates`, `provider_revenue_daily_aggregates`, `usage_logs`.

#### `AC-US31-01`: Tá»•ng há»£p lÆ°u lÆ°á»£ng vÃ  tá»· lá»‡ lá»—i phÃ¢n tÃ¡ch theo API vÃ  Endpoint
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi Provider gá»­i yÃªu cáº§u `GET /api/provider/analytics/overview` vá»›i tham sá»‘ `apiId` há»£p lá»‡ thuá»™c quyá»n sá»Ÿ há»¯u cá»§a mÃ¬nh vÃ  khoáº£ng thá»i gian `from` $\to$ `to` (chuáº©n UTC `YYYY-MM-DD`, tÃ­nh cáº£ ngÃ y cuá»‘i):
     - Há»‡ thá»‘ng tráº£ vá» HTTP `200 OK`.
     - Pháº£n há»“i chá»©a cÃ¡c trÆ°á»ng: `requests` (hoáº·c `requestCount`), `errorCount` (tá»•ng lá»—i 4xx vÃ  5xx), `errorRatePercent` (tá»· lá»‡ pháº§n trÄƒm lá»—i tÃ­nh báº±ng $\frac{\text{errorCount}}{\text{requests}} \times 100$, kiá»ƒu float8).
  2. Khi lá»c bá»• sung `endpointId`:
     - LÆ°u lÆ°á»£ng vÃ  chá»‰ sá»‘ Ä‘á»™ trá»… chá»‰ tÃ­nh cho riÃªng endpoint Ä‘Ã³.
     - Sá»‘ liá»‡u doanh thu sandbox vÃ  sá»‘ thuÃª bao hoáº¡t Ä‘á»™ng (`activeSubscribers`) giá»¯ nguyÃªn pháº¡m vi toÃ n API.
  3. Khi khÃ´ng cÃ³ request nÃ o trong khoáº£ng thá»i gian Ä‘Ã£ chá»n:
     - `requestCount = "0"`, `errorCount = "0"`, `errorRatePercent = 0`, khÃ´ng gÃ¢y lá»—i chia cho 0 (`division by zero`).
- **Nguá»“n yÃªu cáº§u:** Issue #22 (nhiá»‡m vá»¥ US-31), `backend/SPRINT-5-HANDOFF.md` má»¥c "Provider Analytics Â· US-31".
- **Nguá»“n triá»ƒn khai:** `backend/src/usage-analytics.ts` dÃ²ng 77-118 (`origin/codex/sprint5-backend`, PR #106).
- **Vai trÃ² liÃªn quan:** `API_PROVIDER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** ÄÃ£ cÃ³ trong Backend PR #106, Database PR #104 (`migrations/015_sprint5_analytics_performance.sql`); Chá» Frontend Issue #23.

#### `AC-US31-02`: Thá»‘ng kÃª phÃ¢n vá»‹ Ä‘á»™ trá»… vÃ  Gateway Overhead (P50, P95, P99)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Pháº£n há»“i Analytics pháº£i chá»©a Ä‘áº§y Ä‘á»§ Ä‘á»™ trá»… á»©ng dá»¥ng (`latency`) vÃ  Ä‘á»™ trá»… do Gateway cá»™ng thÃªm (`overhead`) táº¡i 3 phÃ¢n vá»‹: P50 (trung vá»‹), P95 vÃ  P99 (Ä‘Æ¡n vá»‹: mili-giÃ¢y, `ms`):
     - CÃ¡c trÆ°á»ng cá»¥ thá»ƒ: `p50LatencyMs`, `p50OverheadMs`, `p95LatencyMs`, `p95OverheadMs`, `p99LatencyMs`, `p99OverheadMs`.
  2. TrÆ°á»ng há»£p thiáº¿u máº«u Ä‘o (sá»‘ lÆ°á»£ng request trong ká»³ $< 1$): CÃ¡c trÆ°á»ng phÃ¢n vá»‹ P50/P95/P99 tráº£ vá» giÃ¡ trá»‹ `null` má»™t cÃ¡ch an toÃ n, giao diá»‡n hiá»ƒn thá»‹ tráº¡ng thÃ¡i "ChÆ°a Ä‘á»§ dá»¯ liá»‡u Ä‘o lÆ°á»ng".
  3. GiÃ¡ trá»‹ phÃ¢n vá»‹ overhead pháº£i thá»a mÃ£n tÃ­nh Ä‘Æ¡n Ä‘iá»‡u toÃ¡n há»c: $\text{P50} \le \text{P95} \le \text{P99}$.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (body vÃ  comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-31.
- **Nguá»“n triá»ƒn khai:** `backend/src/usage-analytics.ts` dÃ²ng 34 (`percentile_disc` trong PR #106).
- **Vai trÃ² liÃªn quan:** `API_PROVIDER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p BE PR #106 vÃ  FE Issue #23.

#### `AC-US31-03`: Báº£ng xáº¿p háº¡ng Top 10 Endpoint theo khá»‘i lÆ°á»£ng truy cáº­p
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Danh sÃ¡ch `topEndpoints` trong pháº£n há»“i tráº£ vá» tá»‘i Ä‘a 10 báº£n ghi, sáº¯p xáº¿p theo thá»© tá»± giáº£m dáº§n cá»§a sá»‘ lÆ°á»£t gá»i (`requestCount`).
  2. Má»—i má»¥c trong danh sÃ¡ch chá»©a: `method`, `pathPattern`, `requestCount`, `errorRatePercent`, `p95LatencyMs`.
  3. Náº¿u API cÃ³ Ã­t hÆ¡n 10 endpoint, danh sÃ¡ch tráº£ vá» Ä‘Ãºng sá»‘ endpoint thá»±c táº¿, khÃ´ng sinh dá»¯ liá»‡u rÃ¡c.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-31.
- **Nguá»“n triá»ƒn khai:** `backend/src/usage-analytics.ts` dÃ²ng 123 (`LIMIT 10` trong PR #106).
- **Vai trÃ² liÃªn quan:** `API_PROVIDER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p BE PR #106 vÃ  FE Issue #23.

#### `AC-US31-04`: Báº£o máº­t cÃ¡ch ly dá»¯ liá»‡u vÃ  phÃ¢n tÃ¡ch doanh thu Ä‘a tá»‡
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. **Báº£o máº­t cÃ¡ch ly dá»¯ liá»‡u (Data Isolation):**
     - Há»‡ thá»‘ng tuyá»‡t Ä‘á»‘i khÃ´ng tráº£ báº¥t ká»³ dá»¯ liá»‡u lÆ°u lÆ°á»£ng hay doanh thu nÃ o cá»§a provider khÃ¡c khi Provider A truy váº¥n `apiId` thuá»™c sá»Ÿ há»¯u cá»§a Provider B.
     - **MÃ£ pháº£n há»“i HTTP:** **CHÆ¯A XÃC NHáº¬N â€” cáº§n Tech Lead chá»‘t** (hiá»‡n táº¡i mÃ£ nguá»“n backend PR #106 táº¡i `backend/src/usage-analytics.ts:77` cÃ¡ch ly báº±ng má»‡nh Ä‘á» `WHERE a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1)`, nÃªn khi Provider A gá»i `apiId` cá»§a Provider B, há»‡ thá»‘ng tráº£ vá» HTTP `200 OK` kÃ¨m `requestCount: "0"` vÃ  máº£ng rá»—ng; yÃªu cáº§u gá»‘c chÆ°a quy Ä‘á»‹nh cá»¥ thá»ƒ cÃ³ chuyá»ƒn sang `403 Forbidden` (`FORBIDDEN_RESOURCE`) hay giá»¯ `200 OK` dá»¯ liá»‡u rá»—ng. Xem chi tiáº¿t táº¡i má»¥c CÃ¢u há»i má»Ÿ).
  2. **Doanh thu phÃ¢n tÃ¡ch Ä‘á»™c láº­p:** Doanh thu tráº£ vá» tÃ¡ch biá»‡t theo loáº¡i tiá»n tá»‡ (VND vÃ  USD). Tuyá»‡t Ä‘á»‘i khÃ´ng cá»™ng gá»™p láº«n sá»‘ tiá»n khÃ¡c loáº¡i tiá»n tá»‡.
- **Nguá»“n yÃªu cáº§u:** Issue #22, `backend/SPRINT-5-HANDOFF.md` má»¥c US-31 & EN-11, `backend/SPRINT-5-DATABASE-HANDOFF.md`.
- **Nguá»“n triá»ƒn khai:** `backend/src/usage-analytics.ts:77` (PR #106), `migrations/015_sprint5_analytics_performance.sql:20` (PR #104).
- **Vai trÃ² liÃªn quan:** `API_PROVIDER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Database PR #104 vÃ  Backend PR #106.

---

### PHÃ‚N Há»† 2: US-32 â€” COST GUARD (Báº¢O Vá»† CHI PHÃ NGÆ¯á»œI DÃ™NG)
- **TÃ¡c nhÃ¢n:** `CONSUMER` (hoáº·c Buyer Provider mua API).
- **Há»£p Ä‘á»“ng API & Schema:**
  - `GET /api/consumer/cost-guard`
  - `PUT /api/consumer/cost-guard`
  - Body PUT: `{"currency":"USD", "monthlyBudget":"30.00", "hardCutoff":true}` hoáº·c `{"monthlyBudgetUsd":"30.00", "hardCutoff":true}`.
  - Giao diá»‡n Frontend: Route `/dashboard/cost-guard` (táº¡i `frontend/src/App.tsx:138` trá» tá»›i `CostGuardPage.tsx`, commit `27307ca`; hiá»‡n táº¡i UI Ä‘Ã£ cÃ³ sáºµn nhÆ°ng Ä‘ang dÃ¹ng dá»¯ liá»‡u mock/cá»¥c bá»™ `spentUsd = 0`, chá» FE Issue #23 ná»‘i API thá»±c táº¿).
  - Báº£ng cÆ¡ sá»Ÿ dá»¯ liá»‡u: `cost_guard_budgets` (`consumer_id`, `currency`, `monthly_budget`, `hard_cutoff`).

#### `AC-US32-01`: Cáº¥u hÃ¬nh ngÃ¢n sÃ¡ch thÃ¡ng vÃ  cháº¿ Ä‘á»™ ngáº¯t cá»©ng (`hardCutoff`)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Consumer gá»­i yÃªu cáº§u `PUT /api/consumer/cost-guard` vá»›i `currency`, `monthlyBudget` $> 0$ vÃ  cá» boolean `hardCutoff`:
     - Há»‡ thá»‘ng lÆ°u cáº¥u hÃ¬nh vÃ o báº£ng `cost_guard_budgets` theo cáº·p khÃ³a chÃ­nh `(consumer_id, currency)`.
     - Tráº£ vá» HTTP `200 OK` kÃ¨m cáº¥u hÃ¬nh vá»«a cáº­p nháº­t.
  2. Náº¿u `monthlyBudget` $\le 0$ hoáº·c khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng sá»‘: Há»‡ thá»‘ng tá»« chá»‘i vá»›i HTTP `400 Bad Request` (`INVALID_BUDGET_AMOUNT`).
  3. Náº¿u khÃ´ng cÃ³ token xÃ¡c thá»±c hoáº·c sai token: Tá»« chá»‘i vá»›i HTTP `401 Unauthorized`.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (body vÃ  comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-32.
- **Nguá»“n triá»ƒn khai:** `backend/src/cost-guard.ts` dÃ²ng 7-9 (`origin/codex/sprint5-backend`, PR #106), `migrations/017_sprint5_cost_guard.sql:3`.
- **Vai trÃ² liÃªn quan:** `CONSUMER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p Backend PR #106 vÃ  Frontend Issue #23.

#### `AC-US32-02`: TÃ­nh toÃ¡n chi phÃ­ tÃ­ch lÅ©y theo snapshot giÃ¡ tá»«ng request
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi Gateway tiáº¿p nháº­n má»™t request tráº£ phÃ­, chi phÃ­ Æ°á»›c tÃ­nh Ä‘Æ°á»£c tÃ­nh toÃ¡n theo snapshot: $\text{estimatedCost} = \frac{\text{priceMonthly}}{\text{quota}}$, lÆ°u vÃ o cá»™t `estimated_cost` vÃ  `cost_currency` trong `usage_outbox` vÃ  `usage_logs`.
  2. Tá»•ng chi phÃ­ trong ká»³ Ä‘Æ°á»£c tá»•ng há»£p trÃªn cÃ¹ng má»™t snapshot PostgreSQL tá»« cáº£ 2 nguá»“n: báº£n ghi Ä‘Ã£ flush (`usage_logs`) vÃ  báº£n ghi Ä‘ang chá» chuyá»ƒn (`usage_outbox`), khÃ´ng Ä‘á»ƒ lá»t giao dá»‹ch Ä‘ang xá»­ lÃ½ dá»Ÿ.
  3. CÃ¡c khoáº£n phÃ­ Sandbox (`settledSandboxCharges`) hiá»ƒn thá»‹ riÃªng, tuyá»‡t Ä‘á»‘i khÃ´ng cá»™ng Ä‘Ãºp 2 láº§n cÃ¹ng má»™t khoáº£n.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-32.
- **Nguá»“n triá»ƒn khai:** `migrations/017_sprint5_cost_guard.sql:13-16`, `backend/src/cost-guard.ts:50-70` (PR #106).
- **Vai trÃ² liÃªn quan:** `CONSUMER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p Backend PR #106 vÃ  Database PR #104.

#### `AC-US32-03`: NgÆ°á»¡ng cáº£nh bÃ¡o chi tiÃªu tá»± Ä‘á»™ng (50%, 80%, 100%)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. `GET /api/consumer/cost-guard` tráº£ vá» máº£ng `reachedThresholds` chá»©a cÃ¡c ngÆ°á»¡ng chi tiÃªu Ä‘Ã£ cháº¡m hoáº·c vÆ°á»£t qua trong táº­p cá»‘ Ä‘á»‹nh `[50, 80, 100]`.
  2. Khi chi phÃ­ $< 50\%$ ngÃ¢n sÃ¡ch: `reachedThresholds = []`, giao diá»‡n hiá»ƒn thá»‹ tráº¡ng thÃ¡i an toÃ n.
  3. Khi chi phÃ­ $\ge 50\%$ vÃ  $< 80\%$: `reachedThresholds = [50]`, giao diá»‡n hiá»ƒn thá»‹ huy hiá»‡u vÃ ng cáº£nh bÃ¡o má»©c 1.
  4. Khi chi phÃ­ $\ge 80\%$ vÃ  $< 100\%$: `reachedThresholds = [50, 80]`, giao diá»‡n hiá»ƒn thá»‹ huy hiá»‡u cam cáº£nh bÃ¡o má»©c 2.
  5. Khi chi phÃ­ $\ge 100\%$ vÃ  `hardCutoff = false`: `reachedThresholds = [50, 80, 100]`, Gateway váº«n cho phÃ©p request Ä‘i qua bÃ¬nh thÆ°á»ng nhÆ°ng giao diá»‡n cáº£nh bÃ¡o Ä‘á» ngÃ¢n sÃ¡ch Ä‘Ã£ cáº¡n.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (body vÃ  comment), Issue #25 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-32.
- **Nguá»“n triá»ƒn khai:** `backend/src/cost-guard.ts` dÃ²ng 83 (PR #106).
- **Vai trÃ² liÃªn quan:** `CONSUMER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p Backend PR #106 vÃ  Frontend Issue #23.

#### `AC-US32-04`: Ngáº¯t cá»©ng dá»‹ch vá»¥ Gateway khi cháº¡m tráº§n ngÃ¢n sÃ¡ch (`hardCutoff = true`)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi Consumer báº­t `hardCutoff = true` vÃ  tá»•ng chi phÃ­ Ä‘Ã£ cháº¡m hoáº·c dá»± kiáº¿n vÆ°á»£t 100% ngÃ¢n sÃ¡ch thÃ¡ng:
     - Má»i request tráº£ phÃ­ tiáº¿p theo qua Gateway gá»­i kÃ¨m API Key cá»§a Consumer bá»‹ tá»« chá»‘i ngay láº­p tá»©c vá»›i HTTP `429 Too Many Requests`.
     - MÃ£ lá»—i JSON: `error.code: "BUDGET_EXHAUSTED"`.
     - *(LÆ°u Ã½: Chuá»—i message `'Monthly spending budget reached'` lÃ  chi tiáº¿t triá»ƒn khai táº¡i `backend/src/cost-guard.ts:41`, chÆ°a cÃ³ yÃªu cáº§u gá»‘c xÃ¡c nháº­n â€” kiá»ƒm thá»­ chá»‰ assert mÃ£ lá»—i `BUDGET_EXHAUSTED`).*
     - Upstream service tuyá»‡t Ä‘á»‘i khÃ´ng bá»‹ gá»i (báº£o vá»‡ nguá»“n tiá»n cá»§a ngÆ°á»i dÃ¹ng).
  2. Miá»…n trá»« Cost Guard:
     - CÃ¡c gÃ³i cÆ°á»›c miá»…n phÃ­ (Free Plan, 0 USD) váº«n hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng theo quota vÃ  rate limit riÃªng, khÃ´ng bá»‹ áº£nh hÆ°á»Ÿng bá»Ÿi cá» ngáº¯t cá»©ng.
     - LÆ°á»£t dÃ¹ng thá»­ Sandbox (háº¡n má»©c 5 lÆ°á»£t) khÃ´ng bá»‹ cháº·n bá»Ÿi Cost Guard.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-32.
- **Nguá»“n triá»ƒn khai:** `backend/src/cost-guard.ts` dÃ²ng 41 (PR #106).
- **Vai trÃ² liÃªn quan:** `CONSUMER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p Backend PR #106.

#### `AC-US32-05`: Xá»­ lÃ½ dá»¯ liá»‡u lá»‹ch sá»­ thiáº¿u giÃ¡ (`unpricedRequests`)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. CÃ¡c báº£n ghi `usage_logs` cÅ© Ä‘Æ°á»£c táº¡o trÆ°á»›c Sprint 5 cÃ³ `estimated_cost IS NULL` Ä‘Æ°á»£c Ä‘áº¿m riÃªng trong trÆ°á»ng `unpricedRequests`.
  2. Há»‡ thá»‘ng khÃ´ng tá»± Ã½ gÃ¡n giÃ¡ trá»‹ máº·c Ä‘á»‹nh cho dá»¯ liá»‡u cÅ©, khÃ´ng lÃ m sai lá»‡ch tÃ­nh toÃ¡n chi phÃ­ hiá»‡n táº¡i.
- **Nguá»“n yÃªu cáº§u:** `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 dÃ²ng 48.
- **Nguá»“n triá»ƒn khai:** `backend/src/cost-guard.ts` dÃ²ng 104 (PR #106).
- **Vai trÃ² liÃªn quan:** `CONSUMER`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p Backend PR #106.

---

### PHÃ‚N Há»† 3: EN-11 â€” Báº¢O Máº¬T & KIá»‚M SOÃT TRUY Cáº¬P (SECURITY & ACCESS CONTROL)

#### `AC-EN11-01`: Chá»‘ng táº¥n cÃ´ng SSRF & DNS Rebinding trÃªn Upstream Gateway
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi Provider cáº¥u hÃ¬nh Upstream Base URL trá» tá»›i Ä‘á»‹a chá»‰ ná»™i bá»™ cáº¥m (RFC 1918, `localhost`, `127.0.0.1`, loopback `::1`, link-local `169.254.169.254` hoáº·c dáº£i multicast/broadcast):
     - Há»‡ thá»‘ng tá»« chá»‘i ngay tá»« bÆ°á»›c validation vá»›i mÃ£ lá»—i `SSRF_DETECTED` hoáº·c `DOMAIN_NOT_SUPPORTED`.
  2. Khi gá»­i request qua SafeProxy:
     - Proxy thá»±c hiá»‡n DNS pinning vÃ  tá»« chá»‘i náº¿u IP phÃ¢n giáº£i thuá»™c dáº£i IP ná»™i bá»™ private (`DOMAIN_RESOLVES_TO_PRIVATE_IP` hoáº·c `SSRF_DETECTED`).
     - SafeProxy tá»« chá»‘i chuyá»ƒn hÆ°á»›ng (redirect) sang host ná»™i bá»™, giá»›i háº¡n kÃ­ch thÆ°á»›c pháº£n há»“i tá»‘i Ä‘a 2MB vÃ  Ã¡p dá»¥ng timeout nghiÃªm ngáº·t.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 9; Issue #22, #25; `backend/SPRINT-5-HANDOFF.md` má»¥c EN-11.
- **Nguá»“n triá»ƒn khai:** `backend/src/safe-proxy.ts:23`, `backend/src/provider-dns.ts:34` (Ä‘Ã£ cÃ³ trÃªn `origin/develop`, commit `dbb4763`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

#### `AC-EN11-02`: Chá»‘ng lÃ¡ch Rate Limit & Quota báº±ng ká»¹ thuáº­t xoay khÃ³a API Key
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Bá»™ Ä‘áº¿m Rate Limit vÃ  Quota trÃªn Redis Ä‘Æ°á»£c gáº¯n theo Ä‘á»‹nh danh ngÆ°á»i mua (`consumerId` vÃ  `apiId`), thÃ´ng qua biáº¿n `rateScope`.
  2. Khi Consumer Ä‘Ã£ dÃ¹ng háº¿t háº¡n ngáº¡ch cá»§a API Key 1, viá»‡c táº¡o thÃªm API Key 2 vÃ  gá»­i request tiáº¿p tá»¥c bá»‹ cháº·n chÃ­nh xÃ¡c vá»›i HTTP `429 RATE_LIMITED` hoáº·c `QUOTA_EXHAUSTED`.
- **Nguá»“n yÃªu cáº§u:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c EN-11 ("Xoay API key: VÃ¡ cÃ¡ch lÃ¡ch rate limit báº±ng khÃ³a má»›i").
- **Nguá»“n triá»ƒn khai:** `backend/src/redis-meter.ts:62` (`rateScope = i.consumerId ? 'c:' + i.consumerId + ':' + i.apiId : i.apiKeyId` trong PR #106, commit `4ce5394`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Backend PR #106 (@Tungdota53).

#### `AC-EN11-03`: Báº£o vá»‡ vÃ  che má» khÃ³a API Key
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi táº¡o khÃ³a má»›i: API Key dáº¡ng rÃµ chá»‰ hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ Ä‘Ãºng 1 láº§n duy nháº¥t trong modal táº¡o khÃ³a.
  2. Sau khi Ä‘Ã³ng modal hoáº·c táº£i láº¡i trang: Giao diá»‡n chá»‰ hiá»ƒn thá»‹ tiá»n tá»‘ che má» `ak_live_XXXX...`.
  3. CÆ¡ sá»Ÿ dá»¯ liá»‡u tuyá»‡t Ä‘á»‘i khÃ´ng lÆ°u API Key dáº¡ng rÃµ; chá»‰ lÆ°u `key_hash` (SHA256 má»™t chiá»u) vÃ  `key_prefix`.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 9; Issue #22, #23.
- **Nguá»“n triá»ƒn khai:** `backend/src/consumer-service.ts:77, 113` (Ä‘Ã£ cÃ³ trÃªn `origin/develop`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

#### `AC-EN11-04`: Khá»­ dá»¯ liá»‡u nháº¡y cáº£m trong há»‡ thá»‘ng Log vÃ  Gateway Headers
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. **Gateway Header Whitelist:** Gateway chá»‰ chuyá»ƒn tiáº¿p cÃ¡c header náº±m trong danh sÃ¡ch an toÃ n (`ALLOWED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-type']`). Má»i header khÃ¡c (Authorization, Cookie, X-Internal-Actor) Ä‘á»u bá»‹ loáº¡i bá» trÆ°á»›c khi chuyá»ƒn sang Upstream.
  2. **Express Request Logger:** Middleware chá»‰ log metadata tá»‘i thiá»ƒu (`requestId`, `method`, `route`, `status`, `durationMs`); tuyá»‡t Ä‘á»‘i khÃ´ng log headers, bodies hoáº·c query params nháº¡y cáº£m.
  3. **Khá»­ dá»¯ liá»‡u nháº¡y cáº£m:** Báº¥t ká»³ credential, token hoáº·c secret nÃ o náº¿u xuáº¥t hiá»‡n trong log container Ä‘á»u pháº£i Ä‘Æ°á»£c khá»­ thÃ nh chuá»—i `[REDACTED]`.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 9; Issue #20, #22; `backend/SPRINT-5-HANDOFF.md` má»¥c EN-11.
- **Nguá»“n triá»ƒn khai:** `backend/src/gateway-service.ts:31-33`, `backend/src/app.ts:85-88` (Ä‘Ã£ cÃ³ trÃªn `develop`); kiá»ƒm tra khá»­ log nháº¡y cáº£m [REDACTED] náº±m trong bá»™ test PR #106.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Backend PR #106 (@Tungdota53).

#### `AC-EN11-05`: Ma tráº­n phÃ¢n quyá»n 3 vai trÃ² (RBAC) & Thu há»“i phiÃªn lÃ m viá»‡c
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Há»‡ thá»‘ng thá»±c thi phÃ¢n quyá»n nghiÃªm ngáº·t 3 vai trÃ²: `CONSUMER`, `API_PROVIDER`, `ADMIN`. Má»i hÃ nh vi truy cáº­p chÃ©o quyá»n Ä‘á»u bá»‹ tá»« chá»‘i vá»›i HTTP `403 Forbidden` (`FORBIDDEN`).
  2. Khi ngÆ°á»i dÃ¹ng Ä‘á»•i máº­t kháº©u hoáº·c Ä‘Äƒng xuáº¥t: ToÃ n bá»™ Refresh Token cÅ© bá»‹ thu há»“i ngay láº­p tá»©c, vÃ´ hiá»‡u hÃ³a phiÃªn Ä‘Äƒng nháº­p cÅ© trÃªn cÃ¡c thiáº¿t bá»‹ khÃ¡c.
- **Nguá»“n yÃªu cáº§u:** `docs/02-role-va-phan-quyen.md`; Issue #21, #25.
- **Nguá»“n triá»ƒn khai:** `backend/src/auth.ts:160-170` (Ä‘Ã£ cÃ³ trÃªn `origin/develop`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

---

### PHÃ‚N Há»† 4: EN-12 â€” Táº¢I GATEWAY & CAM Káº¾T SLA (LOAD TESTING & PERFORMANCE)

#### `AC-EN12-01`: Benchmark táº£i Ä‘a luá»“ng vÃ  kiá»ƒm chá»©ng SLA P95 Overhead < 30ms
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Cháº¡y lá»‡nh kiá»ƒm thá»­ táº£i Gateway tá»± Ä‘á»™ng: `npm run loadtest:gateway`.
  2. Thá»±c hiá»‡n Ä‘o qua 3 má»©c Ä‘á»“ng thá»i: `c = 1`, `c = 10`, `c = 25` (20 warm-up, 200 samples/tier, tá»•ng cá»™ng 620 requests).
  3. SLA Ká»³ vá»ng: P95 Gateway Overhead $< 30\text{ ms}$ á»Ÿ cáº£ 3 má»©c táº£i. Tá»· lá»‡ lá»—i cho phÃ©p: 0/620 (0%). Äá»‘i soÃ¡t ghi Ä‘á»§ 620/620 báº£n ghi `usage_logs`.
  4. Náº¿u P95 Overhead $\ge 30\text{ ms}$: Runner tráº£ mÃ£ lá»—i `SLA_MISSED` vÃ  exit code 1. *(LÆ°u Ã½: Ghi nháº­n rá»§i ro P95 Ä‘áº¡t 38ms/44ms táº¡i c=10/25 á»Ÿ báº£n Ä‘o local cá»§a TÃ¹ng DÆ°Æ¡ng; cáº§n Ä‘o kiá»ƒm láº¡i trÃªn staging Ä‘Ã³ng bÄƒng)*.
- **Nguá»“n yÃªu cáº§u:** `docs/07-sprint5-demo-and-rc-checklist.md:66`; Issue #21, #22 (comment); `backend/SPRINT-5-HANDOFF.md` má»¥c EN-12.
- **Nguá»“n triá»ƒn khai:** `backend/src/gateway-loadtest.ts:165, 173` (PR #103 Ä‘Ã£ merge).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Backend PR #106 (Rá»§i ro SLA).

#### `AC-EN12-02`: TÃ­nh nguyÃªn tá»­ cá»§a Quota dÆ°á»›i Ä‘iá»u kiá»‡n táº£i tranh cháº¥p (Atomic Lua Script)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. DÆ°á»›i táº£i 100 requests Ä‘á»“ng thá»i tranh cháº¥p 50 lÆ°á»£t quota cÃ²n láº¡i trong cÃ¹ng má»™t thá»i Ä‘iá»ƒm:
     - ÄÃºng 50 requests Ä‘áº§u tiÃªn nháº­n HTTP `200 OK`.
     - ÄÃºng 50 requests tiáº¿p theo nháº­n HTTP `429 Too Many Requests` (`QUOTA_EXCEEDED`).
     - Bá»™ Ä‘áº¿m Redis vÃ  báº£n ghi PostgreSQL khá»›p chÃ­nh xÃ¡c 50 lÆ°á»£t, tuyá»‡t Ä‘á»‘i khÃ´ng bá»‹ Ã¢m háº¡n ngáº¡ch (negative quota) vÃ  khÃ´ng cÃ³ race condition.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 10; Issue #22; `backend/SPRINT-5-HANDOFF.md` má»¥c EN-11.
- **Nguá»“n triá»ƒn khai:** `backend/src/redis-meter.ts:23-45` (Ä‘Ã£ cÃ³ trÃªn `origin/develop`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

---

### PHÃ‚N Há»† 5: EN-13 â€” TRIá»‚N KHAI, SAO LÆ¯U & ROLLBACK PRODUCTION

#### `AC-EN13-01`: Production Preflight & Kiá»ƒm tra cáº¥u hÃ¬nh an toÃ n
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Cháº¡y lá»‡nh: `npm run preflight:prod` hoáº·c `node scripts/production-preflight.mjs`.
  2. Script tá»« chá»‘i khá»Ÿi Ä‘á»™ng (fail-closed, exit code 1) náº¿u:
     - Äá»™ dÃ i JWT Secret $< 32$ kÃ½ tá»±.
     - CÃ¡c secret JWT, Sandbox, Upstream bá»‹ dÃ¹ng trÃ¹ng láº·p nhau.
     - CORS Origin hoáº·c Base URL khÃ´ng dÃ¹ng giao thá»©c báº£o máº­t `https://` (trÃªn production).
- **Nguá»“n yÃªu cáº§u:** Issue #21 (Nhiá»‡m vá»¥ EN-13), `docs/06-production-rollback-runbook.md`.
- **Nguá»“n triá»ƒn khai:** `scripts/production-preflight.mjs` (Ä‘Ã£ cÃ³ trÃªn `origin/develop` qua PR #103, commit `5c86628`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

#### `AC-EN13-02`: Quy trÃ¬nh tá»± Ä‘á»™ng hÃ³a Sao lÆ°u & Phá»¥c há»“i Database (`verify:backup`)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Cháº¡y lá»‡nh: `npm run verify:backup`.
  2. Quy trÃ¬nh tá»± Ä‘á»™ng thá»±c hiá»‡n: Khá»Ÿi táº¡o DB nguá»“n `api_market_src`, Ã¡p dá»¥ng toÃ n bá»™ migration vÃ  seed, xuáº¥t báº£n dump `pg_dump -Fc`, táº¡o DB phá»¥c há»“i `api_market_restored` vÃ  náº¡p láº¡i báº±ng `pg_restore`.
  3. Báº£ng Ä‘á»‘i soÃ¡t sá»‘ lÆ°á»£ng báº£n ghi in ra á»Ÿ cuá»‘i pháº£i khá»›p 100% giá»¯a DB nguá»“n vÃ  DB phá»¥c há»“i (Ä‘á»™ lá»‡ch 0 báº£n ghi) trÃªn toÃ n bá»™ cÃ¡c báº£ng cá»‘t lÃµi vÃ  báº£ng má»›i cá»§a Sprint 5.
- **Nguá»“n yÃªu cáº§u:** Issue #21, #24; `backend/SPRINT-5-DATABASE-HANDOFF.md`.
- **Nguá»“n triá»ƒn khai:** `scripts/db-backup-restore.mjs` (PR #103 Ä‘Ã£ merge).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Database PR #104 (bá»• sung báº£ng Sprint 5).

#### `AC-EN13-03`: Kháº£ nÄƒng Rollback á»©ng dá»¥ng & Database dÆ°á»›i 60 giÃ¢y
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khi phiÃªn báº£n má»›i gáº·p sá»± cá»‘: QuÃ¡ trÃ¬nh rollback container vá» tag áº£nh trÆ°á»›c Ä‘Ã³ (lÆ°u trong `.last_image_tag`) vÃ  trá» láº¡i database diá»…n ra trong thá»i gian $< 60$ giÃ¢y theo Ä‘Ãºng hÆ°á»›ng dáº«n táº¡i `docs/06-production-rollback-runbook.md`.
  2. Endpoint `/health` pháº£n há»“i HTTP `200 OK`, toÃ n váº¹n dá»¯ liá»‡u, khÃ´ng phÃ¡t sinh lá»—i 500.
- **Nguá»“n yÃªu cáº§u:** `docs/06-production-rollback-runbook.md` má»¥c 1 & má»¥c 4.3; Issue #21.
- **Nguá»“n triá»ƒn khai:** `docs/06-production-rollback-runbook.md`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

---

### PHÃ‚N Há»† 6: EN-14 â€” UX, RESPONSIVE & ACCESSIBILITY

#### `AC-EN14-01`: ÄÃ¡p á»©ng hiá»ƒn thá»‹ Ä‘a Ä‘á»™ phÃ¢n giáº£i (Desktop & Tablet)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. ToÃ n bá»™ cÃ¡c mÃ n hÃ¬nh chÃ­nh (Marketplace, Detail, Playground, Checkout, Usage, Cost Guard, Provider Analytics, Admin Gateway) hiá»ƒn thá»‹ hoÃ n chá»‰nh, khÃ´ng trÃ n khung hÃ¬nh, khÃ´ng vá»¡ layout trÃªn 2 Ä‘á»™ phÃ¢n giáº£i chuáº©n:
     - Desktop: $1280 \times 720\text{ px}$.
     - Tablet: $768 \times 1024\text{ px}$.
  2. TrÃªn mÃ n hÃ¬nh Tablet $768 \times 1024$: Thanh Ä‘iá»u hÆ°á»›ng chuyá»ƒn sang menu drawer/hamburger an toÃ n; cÃ¡c báº£ng dá»¯ liá»‡u cÃ³ thanh cuá»™n ngang ná»™i bá»™ hoáº·c chuyá»ƒn sang dáº¡ng tháº» card.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 7 (Quy táº¯c H4); Issue #23, #25.
- **Nguá»“n triá»ƒn khai:** Frontend components (`frontend/src/`).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Frontend Issue #23 (@leduwn).

#### `AC-EN14-02`: TiÃªu chuáº©n Console sáº¡ch tuyá»‡t Ä‘á»‘i (Zero Console Errors â€” Rule A1)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Trong suá»‘t quÃ¡ trÃ¬nh duyá»‡t qua toÃ n bá»™ cÃ¡c luá»“ng giao diá»‡n ngÆ°á»i dÃ¹ng vÃ  tÆ°Æ¡ng tÃ¡c form:
     - Console trÃ¬nh duyá»‡t khÃ´ng xuáº¥t hiá»‡n báº¥t ká»³ lá»—i Ä‘á» nÃ o (`console.error`, uncaught exception, network failed 500).
     - KhÃ´ng cÃ³ React key warning (`Each child in a list should have a unique 'key' prop`).
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 0.1 & Phá»¥ lá»¥c A (TiÃªu chÃ­ A1); Issue #23, #25.
- **Nguá»“n triá»ƒn khai:** ToÃ n bá»™ Frontend codebase.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Frontend Issue #23 (@leduwn).

#### `AC-EN14-03`: Äáº§y Ä‘á»§ tráº¡ng thÃ¡i Loading, Empty vÃ  Error States
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Má»i mÃ n hÃ¬nh cÃ³ táº£i dá»¯ liá»‡u báº¥t Ä‘á»“ng bá»™ (Cost Guard, Provider Analytics, Usage, Admin Ops) pháº£i cÃ³ Ä‘á»§ 3 tráº¡ng thÃ¡i giao diá»‡n:
     - **Loading State:** Hiá»ƒn thá»‹ Skeleton loading hoáº·c Spinner mÆ°á»£t mÃ , khÃ´ng giáº­t layout.
     - **Empty State:** Khi ngÆ°á»i dÃ¹ng má»›i chÆ°a cÃ³ dá»¯ liá»‡u, hiá»ƒn thá»‹ hÃ¬nh minh há»a vÃ  nÃºt kÃªu gá»i hÃ nh Ä‘á»™ng (Call-to-Action) thÃ¢n thiá»‡n, khÃ´ng Ä‘á»ƒ mÃ n hÃ¬nh tráº¯ng trá»‘ng trÆ¡n.
     - **Error State:** Khi API backend lá»—i hoáº·c máº¥t káº¿t ná»‘i máº¡ng, hiá»ƒn thá»‹ thÃ´ng bÃ¡o lá»—i rÃµ rÃ ng vÃ  nÃºt "Thá»­ láº¡i", khÃ´ng crash á»©ng dá»¥ng.
- **Nguá»“n yÃªu cáº§u:** `docs/03-quy-trinh-lam-viec.md` má»¥c 1.2; Issue #23.
- **Nguá»“n triá»ƒn khai:** Frontend components.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Frontend Issue #23 (@leduwn).

#### `AC-EN14-04`: Kháº£ nÄƒng tÆ°Æ¡ng tÃ¡c tá»± nhiÃªn (TiÃªu chÃ­ A2â€“A3, khÃ´ng dÃ¹ng force:true)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. ToÃ n bá»™ cÃ¡c nÃºt báº¥m, Ã´ nháº­p liá»‡u vÃ  modal pháº£i náº±m trá»n trong viewport nhÃ¬n tháº¥y Ä‘Æ°á»£c, khÃ´ng bá»‹ che khuáº¥t bá»Ÿi header, footer hay overlay (thá»a mÃ£n tiÃªu chÃ­ A2).
  2. NgÆ°á»i dÃ¹ng bÃ¬nh thÆ°á»ng cÃ³ thá»ƒ thá»±c hiá»‡n láº¡i toÃ n bá»™ thao tÃ¡c báº±ng chuá»™t vÃ  bÃ n phÃ­m (tiÃªu chÃ­ A3).
  3. Bá»™ test E2E tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘Æ°á»£c sá»­ dá»¥ng cá» `{ force: true }` hay kÃ­ch hoáº¡t sá»± kiá»‡n ngáº§m `dispatchEvent` Ä‘á»ƒ lÃ¡ch qua pháº§n tá»­ bá»‹ che.
- **Nguá»“n yÃªu cáº§u:** `docs/test/TESTING_RULES.md` má»¥c 7 (Quy táº¯c Z1, Z2, TiÃªu chÃ­ A2, A3); Issue #23, #25.
- **Nguá»“n triá»ƒn khai:** Frontend UI layout.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Frontend Issue #23 (@leduwn).

---

### PHÃ‚N Há»† 7: EN-15 â€” Há»’I QUY TOÃ€N DIá»†N & KÃ DUYá»†T RELEASE CANDIDATE

#### `AC-EN15-01`: VÆ°á»£t qua toÃ n bá»™ Integration Tests Backend vÃ  Unit Tests Frontend
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Cháº¡y `npm test`: 100% test suites Backend (Auth, Provider, Review, Gateway, Metering, Usage, Cost Guard, Analytics) Ä‘áº¡t tráº¡ng thÃ¡i PASS (dá»± kiáº¿n tá»‘i thiá»ƒu 180+ tests), 0 skipped, 0 failed.
  2. Cháº¡y `cd frontend && npm test`: 100% unit/component tests Vitest Ä‘áº¡t tráº¡ng thÃ¡i PASS (dá»± kiáº¿n tá»‘i thiá»ƒu 550+ tests).
  3. Lá»‡nh `npm run build` á»Ÿ cáº£ frontend vÃ  backend hoÃ n táº¥t vá»›i mÃ£ lá»—i 0, khÃ´ng cÃ³ lá»—i TypeScript (`npx tsc -b`).
- **Nguá»“n yÃªu cáº§u:** `docs/03-quy-trinh-lam-viec.md` má»¥c 2; Issue #21, #25.
- **Nguá»“n triá»ƒn khai:** Backend & Frontend test suites.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» tÃ­ch há»£p develop.

#### `AC-EN15-02`: Nghiá»‡m thu ngÆ°á»i dÃ¹ng (UAT) trá»n váº¹n theo 3 vai trÃ²
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Thá»±c hiá»‡n UAT thá»±c táº¿ trÃªn mÃ´i trÆ°á»ng staging sáº¡ch theo 3 vai trÃ² ngÆ°á»i dÃ¹ng: `CONSUMER`, `API_PROVIDER`, `ADMIN`.
  2. NgÆ°á»i dÃ¹ng thá»±c hiá»‡n Ä‘áº§y Ä‘á»§ cÃ¡c luá»“ng nghiá»‡p vá»¥ cá»‘t lÃµi khÃ´ng gáº·p báº¥t ká»³ lá»—i cháº·n (blocker) nÃ o.
  3. NgÆ°á»i dÃ¹ng nghiá»‡m thu xÃ¡c nháº­n tÃ­nh há»¯u Ã­ch, chÃ­nh xÃ¡c cá»§a sá»‘ liá»‡u vÃ  kÃ½ biÃªn báº£n UAT.
- **Nguá»“n yÃªu cáº§u:** Issue #25 (Nhiá»‡m vá»¥ EN-15), `docs/07-sprint5-demo-and-rc-checklist.md`.
- **Nguá»“n triá»ƒn khai:** MÃ´i trÆ°á»ng Staging Ä‘Ã³ng bÄƒng.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Staging Ä‘Ã³ng bÄƒng.

#### `AC-EN15-03`: Äiá»u kiá»‡n Ä‘Ã³ng Sprint vÃ  KÃ½ duyá»‡t Release Candidate (RC Sign-off)
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. XÃ¡c nháº­n **0 bug má»©c Critical / High** cÃ²n má»Ÿ trÃªn toÃ n dá»± Ã¡n.
  2. ÄÃ£ hoÃ n thÃ nh bá»™ tÃ i liá»‡u bÃ n giao: **Sprint 5 Test Report**, **User Guide cho 3 vai trÃ²** (Consumer, Provider, Admin).
  3. Tech Lead (`@antondung`) vÃ  QA Lead (`@vuonghathaovan-gif`) cÃ¹ng rÃ  soÃ¡t vÃ  Ä‘Ã¡nh dáº¥u hoÃ n táº¥t toÃ n bá»™ 7 má»¥c trong Checklist Release Candidate táº¡i `docs/07-sprint5-demo-and-rc-checklist.md:60-68`.
- **Nguá»“n yÃªu cáº§u:** Issue #21, #25; `docs/07-sprint5-demo-and-rc-checklist.md`.
- **Nguá»“n triá»ƒn khai:** ToÃ n bá»™ há»“ sÆ¡ nghiá»‡m thu Sprint 5.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Tá»•ng há»£p cuá»‘i sprint.

---

### PHÃ‚N Há»† 8: EN-16 â€” Ká»ŠCH Báº¢N DEMO END-TO-END 4 PHÃ‚N Cáº¢NH

#### `AC-EN16-01`: PhÃ¢n cáº£nh 1 â€” Provider Ä‘Äƒng kÃ½, KYC, nháº­p OpenAPI vÃ  ná»™p duyá»‡t
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Khá»Ÿi Ä‘á»™ng háº¡ táº§ng sáº¡ch báº±ng `docker compose --env-file .env.docker --profile frontend --profile demo up --build -d` vÃ  náº¡p seed `docker compose --env-file .env.docker run --rm migrate --seed`.
  2. Provider Ä‘Äƒng nháº­p ná»™p há»“ sÆ¡ KYC $\to$ Admin duyá»‡t KYC thÃ nh `Verified`.
  3. Provider táº¡o API má»›i báº±ng cÃ¡ch upload `valid-weather-openapi3.json`, há»‡ thá»‘ng tá»± sinh 7 khá»‘i tÃ i liá»‡u, cáº¥u hÃ¬nh gÃ³i cÆ°á»›c Free & Pro, xÃ¡c minh DNS TXT $\to$ Báº¥m Submit for Review (`Submitted`). Thá»i gian hoÃ n táº¥t $\le 3$ phÃºt.
- **Nguá»“n yÃªu cáº§u:** `docs/07-sprint5-demo-and-rc-checklist.md` dÃ²ng 25-31; Issue #21, #25.
- **Nguá»“n triá»ƒn khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 1). ToÃ n bá»™ seed data (`002_seed_auth_data.sql`), API backend vÃ  UI pages Ä‘Ã£ cÃ³ sáºµn trÃªn `origin/develop`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

#### `AC-EN16-02`: PhÃ¢n cáº£nh 2 â€” Admin tháº©m Ä‘á»‹nh Dossier, xuáº¥t báº£n API vÃ  giÃ¡m sÃ¡t Audit Log
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Admin má»Ÿ API Reviews, kiá»ƒm tra Dossier (cáº£nh bÃ¡o báº£o máº­t dá»¯ liá»‡u cÃ¡ nhÃ¢n, tráº¡ng thÃ¡i DNS TXT).
  2. Chuyá»ƒn tráº¡ng thÃ¡i API tuáº§n tá»±: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.
  3. Má»Ÿ Audit Logs xÃ¡c nháº­n má»i bÆ°á»›c chuyá»ƒn tráº¡ng thÃ¡i Ä‘á»u Ä‘Æ°á»£c ghi nháº­n báº¥t biáº¿n trong cÆ¡ sá»Ÿ dá»¯ liá»‡u. Thá»i gian hoÃ n táº¥t $\le 2$ phÃºt.
- **Nguá»“n yÃªu cáº§u:** `docs/07-sprint5-demo-and-rc-checklist.md` dÃ²ng 32-36; Issue #21, #25.
- **Nguá»“n triá»ƒn khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 2). API backend vÃ  UI pages (`ApiReviewsPage`, `AuditLogsPage`) Ä‘Ã£ cÃ³ sáºµn trÃªn `origin/develop`.
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Sáºµn sÃ ng trÃªn `develop`.

#### `AC-EN16-03`: PhÃ¢n cáº£nh 3 â€” Consumer khÃ¡m phÃ¡ Marketplace, thá»­ Sandbox, Ä‘Äƒng kÃ½ gÃ³i & gá»i Gateway
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. KhÃ¡ch vÃ£ng lai tÃ¬m kiáº¿m API Weather trÃªn Marketplace, xem tÃ i liá»‡u OpenAPI cÃ´ng khai vÃ  báº£ng giÃ¡.
  2. ÄÄƒng nháº­p Consumer, gá»i thá»­ Playground quÃ¡ 5 lÆ°á»£t $\to$ nháº­n thÃ´ng bÃ¡o cháº·n `403 SANDBOX_EXHAUSTED`.
  3. ÄÄƒng kÃ½ gÃ³i Pro qua cá»•ng Payment Sandbox (xÃ¡c nháº­n webhook HMAC há»£p lá»‡, kÃ­ch hoáº¡t `Active`).
  4. Táº¡o API Key `ak_live_...`, sao chÃ©p mÃ£ code generator vÃ  gá»i Gateway tháº­t cá»•ng 3000: nháº­n HTTP 200, pháº£n há»“i cÃ³ header `x-gateway-overhead-ms` vÃ  quota trá»« nguyÃªn tá»­. Thá»i gian $\le 5$ phÃºt.
- **Nguá»“n yÃªu cáº§u:** `docs/07-sprint5-demo-and-rc-checklist.md` dÃ²ng 37-47; Issue #21, #25.
- **Nguá»“n triá»ƒn khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 3).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Bug Fix PR #105 (header `x-gateway-overhead-ms`).

#### `AC-EN16-04`: PhÃ¢n cáº£nh 4 â€” Usage Dashboard, Cost Guard, Provider Analytics & Xá»­ lÃ½ vi pháº¡m
- **PhÃ¡t biá»ƒu kiá»ƒm chá»©ng:**
  1. Consumer má»Ÿ Usage & Quota Ä‘á»‘i soÃ¡t sá»‘ lÆ°á»£t gá»i vá»«a thá»±c hiá»‡n; má»Ÿ Cost Guard xem ngÃ¢n sÃ¡ch vÃ  cÃ¡c má»‘c cáº£nh bÃ¡o.
  2. Provider má»Ÿ Analytics xem biá»ƒu Ä‘á»“ lÆ°u lÆ°á»£ng, top endpoint, tá»· lá»‡ lá»—i vÃ  doanh thu.
  3. Admin má»Ÿ Operations Health táº¡i `/admin/gateway`, thá»±c hiá»‡n Suspend API $\to$ Gateway cháº·n tá»©c thÃ¬ $\to$ Restore láº¡i. Thá»i gian $\le 3$ phÃºt.
- **Nguá»“n yÃªu cáº§u:** `docs/07-sprint5-demo-and-rc-checklist.md` dÃ²ng 48-57; Issue #21, #25, #23.
- **Nguá»“n triá»ƒn khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 4).
- **Tráº¡ng thÃ¡i phá»¥ thuá»™c:** Chá» Frontend Issue #23 (@leduwn).

---

## 3. MA TRáº¬N PHÃ‚N QUYá»€N RBAC 3 VAI TRÃ’ (SPRINT 5 ENFORCEMENT)

| Chá»©c nÄƒng / Endpoint API | KhÃ¡ch vÃ£ng lai (Guest) | Consumer (`CONSUMER`) | Provider (`API_PROVIDER`) | Quáº£n trá»‹ viÃªn (`ADMIN`) | CÆ¡ cháº¿ kiá»ƒm soÃ¡t & MÃ£ lá»—i |
|---|:---:|:---:|:---:|:---:|---|
| **Xem Marketplace & API Detail** | Cho phÃ©p | Cho phÃ©p | Cho phÃ©p | Cho phÃ©p | Public Read-Only |
| **Thá»­ Playground (Sandbox)** | Cháº·n 401 | 5 lÆ°á»£t / phiÃªn | 5 lÆ°á»£t / phiÃªn | Cho phÃ©p | Giá»›i háº¡n Redis, háº¿t lÆ°á»£t tráº£ 403 `SANDBOX_EXHAUSTED` |
| **ÄÄƒng kÃ½ gÃ³i cÆ°á»›c tráº£ phÃ­** | Cháº·n 401 | Cho phÃ©p | Cho phÃ©p | Cho phÃ©p | Buyer Role (`CONSUMER` / `API_PROVIDER`) |
| **Cáº¥u hÃ¬nh Cost Guard (`/api/consumer/cost-guard`)** | Cháº·n 401 | Cho phÃ©p | Cho phÃ©p | Cháº·n 403 | JWT Buyer; cháº·n 403 `FORBIDDEN` náº¿u sai quyá»n |
| **Xem Analytics API (`/api/provider/analytics/overview`)** | Cháº·n 401 | Cháº·n 403 | Chá»‰ API sá»Ÿ há»¯u | Cho phÃ©p | JWT Provider; cÃ¡ch ly theo `provider_id` |
| **Tháº©m Ä‘á»‹nh & Xuáº¥t báº£n API** | Cháº·n 401 | Cháº·n 403 | Cháº·n 403 | Cho phÃ©p | Role `ADMIN`, ghi Audit Log báº¥t biáº¿n |
| **ÄÃ¬nh chá»‰ API vi pháº¡m (Suspend / Restore)** | Cháº·n 401 | Cháº·n 403 | Cháº·n 403 | Cho phÃ©p | Role `ADMIN`, Gateway Ä‘á»“ng bá»™ tá»©c thÃ¬ |
| **Xem Operations Health (`/admin/gateway`)** | Cháº·n 401 | Cháº·n 403 | Cháº·n 403 | Cho phÃ©p | Role `ADMIN`, cháº·n 403 náº¿u cá»‘ truy cáº­p |

---

## 4. Báº¢NG TRUY Váº¾T GIÃ TRá»Š: NGUá»’N YÃŠU Cáº¦U VS NGUá»’N TRIá»‚N KHAI

| GiÃ¡ trá»‹ / Tham sá»‘ | Xuáº¥t hiá»‡n táº¡i | Nguá»“n yÃªu cáº§u (Issue / Docs / Handoff) | Nguá»“n triá»ƒn khai (Code, NhÃ¡nh, File:DÃ²ng) | ÄÃ¡nh giÃ¡ xÃ¡c nháº­n |
|---|---|---|---|:---:|
| **P95 overhead < 30ms** | AC-EN12-01<br>TC-PERF-01 | `docs/07-sprint5-demo-and-rc-checklist.md:66`; Issue #21, #22, #25 (comment) | `backend/src/gateway-loadtest.ts:173` (`origin/develop`, PR #103) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Concurrency 1 / 10 / 25** | AC-EN12-01<br>TC-PERF-01 | Issue #22 (comment); `backend/SPRINT-5-HANDOFF.md` má»¥c EN-12 | `backend/src/gateway-loadtest.ts:165` (`origin/develop`, PR #103) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **429 BUDGET_EXHAUSTED** | AC-US32-04<br>TC-CST-07 | `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 dÃ²ng 44 | `backend/src/cost-guard.ts:41` (`origin/codex/sprint5-backend`, PR #106) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **ThÃ´ng bÃ¡o lá»—i ngÃ¢n sÃ¡ch** | AC-US32-04<br>TC-CST-07 | **CHÆ¯A CÃ“ TRONG YÃŠU Cáº¦U Gá»C** (yÃªu cáº§u chá»‰ nÃªu mÃ£ `BUDGET_EXHAUSTED`) | `backend/src/cost-guard.ts:41` (`'Monthly spending budget reached'`) | **[CHÆ¯A CÃ“ YÃŠU Cáº¦U Gá»C XÃC NHáº¬N]**<br>TC chá»‰ assert mÃ£ `BUDGET_EXHAUSTED` |
| **NgÆ°á»¡ng 50% / 80% / 100%** | AC-US32-03<br>TC-CST-05, 06 | Issue #22 (body vÃ  comment), Issue #25, `backend/SPRINT-5-HANDOFF.md` | `backend/src/cost-guard.ts:83` (`origin/codex/sprint5-backend`, PR #106) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **hardCutoff** | AC-US32-01<br>TC-CST-01, 07 | Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 | `migrations/017_sprint5_cost_guard.sql:6`, `backend/src/cost-guard.ts:40` | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **unpricedRequests** | AC-US32-05<br>TC-CST-09 | `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 dÃ²ng 48 | `backend/src/cost-guard.ts:104` (`origin/codex/sprint5-backend`, PR #106) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Rollback < 60 giÃ¢y** | AC-EN13-03<br>TC-OPS-03 | `docs/06-production-rollback-runbook.md` má»¥c 1, 4.3; Issue #21 | `docs/06-production-rollback-runbook.md` (`origin/develop`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Top 10 Endpoints** | AC-US31-03<br>TC-ANL-04 | Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-31 | `backend/src/usage-analytics.ts:123` (`LIMIT 10` trong PR #106) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **P50 / P95 / P99** | AC-US31-02<br>TC-ANL-03 | Issue #22 (body vÃ  comment), `backend/SPRINT-5-HANDOFF.md` má»¥c US-31 | `backend/src/usage-analytics.ts:34` (`origin/codex/sprint5-backend`, PR #106) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Báº£ng cost_guard_budgets** | AC-US32-01<br>TC-CST-01..04 | Issue #22, `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 | `migrations/017_sprint5_cost_guard.sql:3` (`origin/codex/sprint5-backend`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Báº£ng aggregate Analytics** | AC-US31-04<br>TC-ANL-05..07 | Issue #22, Issue #24, `backend/SPRINT-5-DATABASE-HANDOFF.md` | `migrations/015_sprint5_analytics_performance.sql:17, 20` (`origin/feature/24-sprint5-database`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Cá»™t estimated_cost** | AC-US32-02<br>TC-CST-03 | `backend/SPRINT-5-HANDOFF.md` má»¥c US-32 dÃ²ng 41 | `migrations/017_sprint5_cost_guard.sql:13-16` (`origin/codex/sprint5-backend`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Header Whitelist Gateway** | AC-EN11-04<br>TC-SEC-05 | `docs/test/TESTING_RULES.md` má»¥c 9; `backend/SPRINT-5-HANDOFF.md` má»¥c EN-11 | `backend/src/gateway-service.ts:31-33` (`origin/develop`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Header x-gateway-overhead-ms**| AC-S4-17<br>TC-OVH-06 | `docs/test/Sprint4_AcceptanceCriteria.md` (AC-S4-17); Issue #22, #105 | `backend/src/gateway-service.ts:146` (`origin/codex/sprint4-qa-closeout`, PR #105) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **MÃ£ lá»—i SSRF** | AC-EN11-01<br>TC-SEC-01, 02 | `docs/test/TESTING_RULES.md` má»¥c 9; Issue #22, #25 | `backend/src/safe-proxy.ts:23`, `backend/src/provider-dns.ts:34` (`origin/develop`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **Route /admin/gateway** | AC-EN16-04<br>TC-DEMO-04 | `docs/07-sprint5-demo-and-rc-checklist.md:55` ("Operations Health") | `frontend/src/App.tsx:185` (`origin/develop`, commit `27307ca`) | **[XÃC NHáº¬N]** Äáº§y Ä‘á»§ 2 nguá»“n |
| **MÃ£ HTTP cÃ¡ch ly Provider** | AC-US31-04<br>TC-ANL-06 | `backend/SPRINT-5-HANDOFF.md` ("chá»‰ tá»•ng há»£p API thuá»™c tÃ i khoáº£n", "cÃ´ láº­p dá»¯ liá»‡u"). KHÃ”NG quy Ä‘á»‹nh mÃ£ HTTP. | `backend/src/usage-analytics.ts:77` (tráº£ 200 kÃ¨m máº£ng rá»—ng) | **[CHÆ¯A CÃ“ YÃŠU Cáº¦U Gá»C XÃC NHáº¬N]**<br>Cáº§n Tech Lead chá»‘t (403 vs 200 rá»—ng) |

---

## 5. Rá»¦I RO Ká»¸ THUáº¬T & CÃ‚U Há»ŽI Má»ž Cáº¦N TECH LEAD / DEV CHá»T

1. **[Má»Ÿ â€” Cáº§n Tech Lead chá»‘t mÃ£ HTTP cÃ¡ch ly Provider (AC-US31-04, TC-ANL-06)]:**
   - YÃªu cáº§u gá»‘c táº¡i `SPRINT-5-HANDOFF.md` chá»‰ quy Ä‘á»‹nh: *"chá»‰ tá»•ng há»£p API thuá»™c tÃ i khoáº£n"* vÃ  *"cÃ´ láº­p dá»¯ liá»‡u"*, khÃ´ng chá»‰ Ä‘á»‹nh mÃ£ HTTP.
   - MÃ£ nguá»“n triá»ƒn khai hiá»‡n táº¡i cá»§a Tungdota53 (`backend/src/usage-analytics.ts:77`) dÃ¹ng query:
     `a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1) AND ($4::integer IS NULL OR a.id=$4)`
     nÃªn khi Provider A truy váº¥n `apiId` cá»§a Provider B, há»‡ thá»‘ng tráº£ vá» HTTP `200 OK` kÃ¨m `requestCount: "0"` vÃ  máº£ng `topEndpoints: []`.
   - **CÃ¢u há»i cho Tech Lead (@antondung):** Dá»± Ã¡n muá»‘n giá»¯ hÃ nh vi HTTP 200 kÃ¨m dá»¯ liá»‡u rá»—ng (an toÃ n, khÃ´ng lá»™ sá»± tá»“n táº¡i cá»§a API ID ngÆ°á»i khÃ¡c) hay muá»‘n nÃ©m HTTP 403 Forbidden (`FORBIDDEN_RESOURCE`)?
2. **[Rá»§i ro SLA Load Test c=10 vÃ  c=25 (AC-EN12-01, TC-PERF-01)]:**
   - Káº¿t quáº£ Ä‘o thá»­ nghiá»‡m cá»¥c bá»™ cá»§a Tungdota53 ghi nháº­n P95 overhead Ä‘áº¡t 38ms (á»Ÿ c=10) vÃ  44ms (á»Ÿ c=25), vÆ°á»£t ngÆ°á»¡ng SLA thiáº¿t káº¿ (< 30ms).
   - QA giá»¯ nguyÃªn assertion $< 30\text{ ms}$ theo Quy táº¯c Z4. Khi cháº¡y trÃªn Staging, náº¿u váº«n vÆ°á»£t ngÆ°á»¡ng sáº½ kÃ­ch hoáº¡t cá» `SLA_MISSED` vÃ  má»Ÿ Deviation Report.
3. **[Frontend Issue #23 chÆ°a tÃ­ch há»£p API tháº­t]:**
   - CÃ¡c trang `CostGuardPage.tsx` vÃ  `AnalyticsHealthPage.tsx` Ä‘Ã£ cÃ³ khung hiá»ƒn thá»‹ trÃªn `develop` nhÆ°ng Ä‘ang dÃ¹ng dá»¯ liá»‡u mock/hardcoded cá»¥c bá»™. ToÃ n bá»™ 12 ca kiá»ƒm thá»­ UI liÃªn quan Ä‘ang bá»‹ cháº·n chá» PR hoÃ n thiá»‡n tá»« báº¡n LÃª Háº£i DÆ°Æ¡ng (@leduwn).

---

## 6. MA TRáº¬N TRUY Váº¾T 42 TEST CASES (TRACEABILITY MATRIX)

| MÃ£ AC | Thuá»™c Epic / Story | Issue liÃªn quan | File nguá»“n kiá»ƒm chá»©ng | Test Cases liÃªn káº¿t | Tráº¡ng thÃ¡i ká»¹ thuáº­t |
|---|---|:---:|---|---|:---:|
| `AC-US31-01` | US-31 | #22, #24, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-01`, `TC-ANL-02`, `TC-ANL-07` | Chá» BE PR #106, FE #23 |
| `AC-US31-02` | US-31 | #22, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-03` | Chá» BE PR #106, FE #23 |
| `AC-US31-03` | US-31 | #22, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-04` | Chá» BE PR #106, FE #23 |
| `AC-US31-04` | US-31 | #22, #24 | `backend/SPRINT-5-DATABASE-HANDOFF.md` | `TC-ANL-05`, `TC-ANL-06` | Chá» DB PR #104, BE PR #106 |
| `AC-US32-01` | US-32 | #22, #25, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-01`, `TC-CST-02` | Chá» BE PR #106, FE #23 |
| `AC-US32-02` | US-32 | #22, #24 | `migrations/017_sprint5_cost_guard.sql` | `TC-CST-03`, `TC-CST-04` | Chá» BE PR #106, FE #23 |
| `AC-US32-03` | US-32 | #23, #25 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-05`, `TC-CST-06` | Chá» BE PR #106, FE #23 |
| `AC-US32-04` | US-32 | #22, #25 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-07`, `TC-CST-08` | Chá» BE PR #106 |
| `AC-US32-05` | US-32 | #22 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-09` | Chá» BE PR #106 |
| `AC-EN11-01` | EN-11 | #22, #25 | `docs/test/TESTING_RULES.md` má»¥c 9 | `TC-SEC-01`, `TC-SEC-02` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN11-02` | EN-11 | #22 | `backend/SPRINT-5-HANDOFF.md` | `TC-SEC-03` | Chá» BE PR #106 |
| `AC-EN11-03` | EN-11 | #22, #23 | `docs/test/TESTING_RULES.md` má»¥c 9 | `TC-SEC-04` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN11-04` | EN-11 | #20, #22 | `docs/test/TESTING_RULES.md` má»¥c 9 | `TC-SEC-05` | Chá» BE PR #106 |
| `AC-EN11-05` | EN-11 | #21, #25 | `docs/02-role-va-phan-quyen.md` | `TC-SEC-06`, `TC-SEC-07` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN12-01` | EN-12 | #21, #22 | `backend/src/gateway-loadtest.ts` | `TC-PERF-01` | Chá» BE PR #106 (Rá»§i ro SLA) |
| `AC-EN12-02` | EN-12 | #22 | `docs/test/TESTING_RULES.md` má»¥c 10 | `TC-PERF-02` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN13-01` | EN-13 | #21 | `scripts/production-preflight.mjs` | `TC-OPS-01` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN13-02` | EN-13 | #21, #24 | `scripts/db-backup-restore.mjs` | `TC-OPS-02` | Chá» DB PR #104 |
| `AC-EN13-03` | EN-13 | #21 | `docs/06-production-rollback-runbook.md` | `TC-OPS-03` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN14-01` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` má»¥c 7 | `TC-UX-01`, `TC-UX-02` | Chá» FE #23 |
| `AC-EN14-02` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` má»¥c 0.1 | `TC-UX-03` | Chá» FE #23 |
| `AC-EN14-03` | EN-14 | #23 | `docs/03-quy-trinh-lam-viec.md` | `TC-UX-04` | Chá» FE #23 |
| `AC-EN14-04` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` tiÃªu chÃ­ A2-A3 | `TC-UX-05` | Chá» FE #23 |
| `AC-EN15-01` | EN-15 | #25, #21 | `docs/03-quy-trinh-lam-viec.md` | `TC-REG-01`, `TC-REG-02` | Chá» tÃ­ch há»£p develop |
| `AC-EN15-02` | EN-15 | #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-UAT-01` | Chá» Staging Ä‘Ã³ng bÄƒng |
| `AC-EN15-03` | EN-15 | #25, #21 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-UAT-02` | Tá»•ng há»£p cuá»‘i sprint |
| `AC-EN16-01` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-01` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN16-02` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-02` | Sáºµn sÃ ng trÃªn `develop` |
| `AC-EN16-03` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-03` | Chá» PR #105 |
| `AC-EN16-04` | EN-16 | #21, #25, #23 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-04` | Chá» FE #23 |
| `AC-S4-17` | US-23 (Bug S4) | #105, #22 | `docs/test/Sprint4_AcceptanceCriteria.md` | `TC-OVH-06-RETEST` | Chá» PR #105 |
