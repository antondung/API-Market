# Bá»˜ TEST CASES KIá»‚M THá»¬ TOÃ€N DIá»†N SPRINT 5 (FULL TEST SUITE)

## Dá»° ÃN: Ná»€N Táº¢NG API MARKETPLACE & MANAGEMENT
### QUY CHUáº¨N: IAN SOMMERVILLE â€” SOFTWARE TESTING (CH. 9) & TESTING_RULES.MD (PHá»¤ Lá»¤C B)

> **TÃ i liá»‡u QA Lead:** Tráº§n HÃ  Tháº£o VÃ¢n (`@vuonghathaovan-gif` â€” Issue #25)
> **CÄƒn cá»© ká»¹ thuáº­t:** `docs/test/Sprint5_AcceptanceCriteria.md`, `docs/test/TESTING_RULES.md`, `docs/07-sprint5-demo-and-rc-checklist.md`, `docs/06-production-rollback-runbook.md`, `backend/SPRINT-5-HANDOFF.md`, `backend/SPRINT-5-DATABASE-HANDOFF.md`.
> **ChÃ­nh sÃ¡ch kiá»ƒm thá»­:** TuÃ¢n thá»§ tuyá»‡t Ä‘á»‘i quy táº¯c **Z1â€“Z5** (khÃ´ng pass áº£o, khÃ´ng force:true, khÃ´ng bÆ¡m storage), **H1â€“H4** (clean state, selector ngÆ°á»i dÃ¹ng, gÃµ phÃ­m tuáº§n tá»±, Ä‘a viewport 1280x720 vÃ  768x1024), **A1â€“A3** (0 console error, pháº§n tá»­ trong viewport, ngÆ°á»i dÃ¹ng thÆ°á»ng lÃ m láº¡i Ä‘Æ°á»£c).
> **Ghi chÃº vá» tráº¡ng thÃ¡i:** **100% Test Cases hiá»‡n táº¡i á»Ÿ tráº¡ng thÃ¡i "ChÆ°a cháº¡y"**; KHÃ”NG tá»± Ã½ ghi Pass/Fail khi chÆ°a cháº¡y thá»±c táº¿. CÃ¡c phá»¥ thuá»™c ká»¹ thuáº­t (FE #23, BE PR #106, DB PR #104, PR #105) Ä‘Æ°á»£c ghi rÃµ rÃ ng trong tá»«ng ca kiá»ƒm thá»­.

---

## 1. Báº¢NG Tá»”NG QUAN PHÃ‚N Bá»” 42 TEST CASES SPRINT 5

| PhÃ¢n há»‡ / NhÃ³m chá»©c nÄƒng | MÃ£ User Story / Epic | Sá»‘ lÆ°á»£ng TC | Critical | High | Medium | Phá»¥ thuá»™c chÃ­nh |
|---|---|:---:|:---:|:---:|:---:|---|
| **1. Provider Analytics** | `US-31` | 7 | 2 | 2 | 3 | BE PR #106, DB PR #104, FE #23 |
| **2. Cost Guard** | `US-32` | 9 | 2 | 5 | 2 | BE PR #106, FE #23 |
| **3. Security Testing** | `EN-11` | 7 | 5 | 2 | 0 | Äá»™c láº­p (`develop`) / BE PR #106 |
| **4. Performance & Load SLA** | `EN-12` | 2 | 2 | 0 | 0 | PR #103, BE PR #106 (Rá»§i ro SLA) |
| **5. Deploy, Backup & Rollback**| `EN-13` | 3 | 1 | 2 | 0 | PR #103, DB PR #104 |
| **6. UX, Responsive & A11y** | `EN-14` | 5 | 1 | 3 | 1 | FE Issue #23 (@leduwn) |
| **7. Regression & Quality Gate** | `EN-15` | 4 | 4 | 0 | 0 | TÃ­ch há»£p develop, Staging Ä‘Ã³ng bÄƒng |
| **8. Ká»‹ch báº£n Demo 4 PhÃ¢n cáº£nh** | `EN-16` | 4 | 2 | 2 | 0 | ToÃ n bá»™ há»‡ thá»‘ng, PR #105, FE #23 |
| **9. Tá»“n Ä‘á»ng Sprint 4 (Bug Fix)**| `US-23` (BUG-S4-01) | 1 | 0 | 1 | 0 | PR #105 (@Tungdota53) |
| **Tá»”NG Cá»˜NG SPRINT 5** | **9 PhÃ¢n há»‡** | **42** | **19** | **17** | **6** | **100% ChÆ°a cháº¡y** |

### 1.1. PhÃ¢n bá»‘ theo Tráº¡ng thÃ¡i phá»¥ thuá»™c Ká»¹ thuáº­t
- **Äá»™c láº­p / Sáºµn sÃ ng trÃªn develop:** **10 TCs** (`TC-SEC-01`, `TC-SEC-02`, `TC-SEC-04`, `TC-SEC-06`, `TC-SEC-07`, `TC-PERF-02`, `TC-OPS-01`, `TC-OPS-03`, `TC-DEMO-01`, `TC-DEMO-02`).
- **Chá» Backend PR #106 (@Tungdota53):** **12 TCs** (Cost Guard API: `TC-CST-02`, `03`, `07`, `08`, `09`; Analytics API: `TC-ANL-01`, `02`, `03`, `06`; Chá»‘ng xoay Key: `TC-SEC-03`; Khá»­ dá»¯ liá»‡u nháº¡y cáº£m Log: `TC-SEC-05`; Load test SLA: `TC-PERF-01`).
- **Chá» Frontend Issue #23 (@leduwn):** **12 TCs** (ToÃ n bá»™ UX/Responsive: `TC-UX-01`..`05`; UI Cost Guard: `TC-CST-01`, `04`, `05`, `06`; UI Provider Analytics: `TC-ANL-04`, `07`; Demo PhÃ¢n cáº£nh 4: `TC-DEMO-04`). *(Ghi chÃº: Khung trang UI CostGuardPage vÃ  AnalyticsHealthPage Ä‘Ã£ cÃ³ sáºµn trÃªn `develop`, nhÆ°ng Ä‘ang dÃ¹ng dá»¯ liá»‡u mock/hardcoded, chá» FE #23 ná»‘i API tháº­t)*.
- **Chá» Database PR #104 (@danhbuonsv2-svg):** **2 TCs** (Doanh thu Ä‘a tá»‡: `TC-ANL-05`; Backup verify má»Ÿ rá»™ng: `TC-OPS-02`).
- **Chá» Bug Fix PR #105 (@Tungdota53):** **2 TCs** (`TC-OVH-06-RETEST` vÃ  Demo PhÃ¢n cáº£nh 3: `TC-DEMO-03`).
- **Chá» TÃ­ch há»£p toÃ n diá»‡n & Staging Ä‘Ã³ng bÄƒng (Quality Gate):** **4 TCs** (`TC-REG-01`, `TC-REG-02`, `TC-UAT-01`, `TC-UAT-02`).
- **Tá»”NG Cá»˜NG:** $10 + 12 + 12 + 2 + 2 + 4 = \mathbf{42\text{ TCs}}$ (100% Khá»›p).

---

## 2. DANH Má»¤C 42 TEST CASES CHI TIáº¾T (CHUáº¨N 9 Cá»˜T IAN SOMMERVILLE)

---

### PHáº¦N 1: US-31 â€” PROVIDER ANALYTICS (7 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[ANL-01]** | Láº¥y dá»¯ liá»‡u tá»•ng quan Analytics theo API há»£p lá»‡ | US-31<br>`AC-US31-01` | Provider Ä‘Ã£ Ä‘Äƒng nháº­p; API thuá»™c quyá»n sá»Ÿ há»¯u cá»§a Provider Ä‘Ã£ cÃ³ lÆ°á»£t gá»i phÃ¡t sinh | 1. ÄÄƒng nháº­p Provider (`provider@example.com` / `Provider@123`).<br>2. Gá»­i request `GET /api/provider/analytics/overview?apiId=3&from=2026-11-01&to=2026-11-10`.<br>3. Má»Ÿ F12 Network quan sÃ¡t HTTP status vÃ  cáº¥u trÃºc JSON tráº£ vá». | URL: `/api/provider/analytics/overview`<br>`apiId: 3`<br>From: `2026-11-01`<br>To: `2026-11-10` | - HTTP 200 OK.<br>- JSON chá»©a: `requestCount > 0`, `errorCount >= 0`, `errorRatePercent` (lÃ m trÃ²n hoáº·c kiá»ƒu float8).<br>- Dá»¯ liá»‡u tá»•ng há»£p Ä‘Ãºng trong khoáº£ng ngÃ y UTC chá»‰ Ä‘á»‹nh. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[ANL-02]** | Lá»c dá»¯ liá»‡u Analytics chi tiáº¿t theo tá»«ng Endpoint | US-31<br>`AC-US31-01` | API cÃ³ nhiá»u endpoint khÃ¡c nhau Ä‘Ã£ nháº­n lÆ°u lÆ°á»£ng | 1. Gá»­i request `GET /api/provider/analytics/overview?apiId=3&endpointId=8&from=2026-11-01&to=2026-11-10`.<br>2. Kiá»ƒm tra chá»‰ sá»‘ `requests`, `errorRate` so vá»›i khi khÃ´ng truyá»n `endpointId`.<br>3. Kiá»ƒm tra trÆ°á»ng `activeSubscribers` vÃ  doanh thu giá»¯ nguyÃªn má»©c toÃ n API. | `apiId: 3`<br>`endpointId: 8` | - HTTP 200 OK.<br>- Chá»‰ sá»‘ `requests` $\le$ tá»•ng requests toÃ n API.<br>- LÆ°u lÆ°á»£ng Ä‘Æ°á»£c lá»c chÃ­nh xÃ¡c cho riÃªng endpoint 8. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[ANL-03]** | Thá»‘ng kÃª phÃ¢n vá»‹ Ä‘á»™ trá»… P50, P95, P99 vÃ  Gateway Overhead | US-31<br>`AC-US31-02` | API cÃ³ tá»‘i thiá»ƒu 20 requests thá»±c táº¿ Ä‘Æ°á»£c ghi nháº­n | 1. Gá»i `GET /api/provider/analytics/overview` cho API má»¥c tiÃªu.<br>2. Kiá»ƒm tra cÃ¡c trÆ°á»ng: `p50LatencyMs`, `p95LatencyMs`, `p99LatencyMs`, `p50OverheadMs`, `p95OverheadMs`, `p99OverheadMs`.<br>3. So sÃ¡nh tÆ°Æ¡ng quan toÃ¡n há»c giá»¯a cÃ¡c phÃ¢n vá»‹. | `apiId: 3` | - CÃ¡c trÆ°á»ng phÃ¢n vá»‹ lÃ  sá»‘ nguyÃªn/thá»±c dÆ°Æ¡ng (ms).<br>- Thá»a mÃ£n: $P50 \le P95 \le P99$ cho cáº£ latency vÃ  overhead.<br>- Khi khÃ´ng cÃ³ máº«u Ä‘o (0 requests), cÃ¡c trÆ°á»ng tráº£ vá» `null`. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[ANL-04]** | Danh sÃ¡ch Top 10 Endpoints theo khá»‘i lÆ°á»£ng truy cáº­p | US-31<br>`AC-US31-03` | API cÃ³ nhiá»u endpoint Ä‘Æ°á»£c gá»i vá»›i táº§n suáº¥t khÃ¡c nhau | 1. Gá»i API Analytics Overview.<br>2. Kiá»ƒm tra máº£ng `topEndpoints` trong response.<br>3. Kiá»ƒm tra sá»‘ lÆ°á»£ng pháº§n tá»­ vÃ  thá»© tá»± sáº¯p xáº¿p trÃªn UI. | `apiId: 3` | - Máº£ng chá»©a tá»‘i Ä‘a 10 pháº§n tá»­.<br>- Sáº¯p xáº¿p giáº£m dáº§n theo `requestCount`.<br>- Má»—i pháº§n tá»­ cÃ³ Ä‘á»§ `method`, `pathPattern`, `requestCount`, `errorRatePercent`, `p95LatencyMs`. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[ANL-05]** | PhÃ¢n tÃ¡ch doanh thu Ä‘á»™c láº­p theo loáº¡i tiá»n tá»‡ (VND vÃ  USD) | US-31<br>`AC-US31-04` | API cÃ³ phÃ¡t sinh giao dá»‹ch thanh toÃ¡n á»Ÿ cáº£ gÃ³i VND vÃ  gÃ³i USD | 1. Gá»i API Analytics Overview hoáº·c truy váº¥n trá»±c tiáº¿p báº£ng aggregate.<br>2. Kiá»ƒm tra sá»‘ liá»‡u doanh thu tráº£ vá». | `apiId: 3` | - Doanh thu tÃ¡ch riÃªng theo trÆ°á»ng tiá»n tá»‡ (vÃ­ dá»¥: `{ "VND": 1500000, "USD": 45 }`).<br>- Tuyá»‡t Ä‘á»‘i khÃ´ng cá»™ng gá»™p láº«n sá»‘ tiá»n VND vÃ  USD thÃ nh má»™t sá»‘ duy nháº¥t. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: DB PR #104) |
| **[ANL-06]** | Báº£o máº­t cÃ¡ch ly dá»¯ liá»‡u: NgÄƒn Provider A xem Analytics cá»§a Provider B | US-31<br>`AC-US31-04` | TÃ i khoáº£n Provider A cá»‘ tÃ¬nh truyá»n `apiId` thuá»™c quyá»n sá»Ÿ há»¯u cá»§a Provider B | 1. ÄÄƒng nháº­p Provider A (`provider@example.com`).<br>2. Gá»­i request `GET /api/provider/analytics/overview?apiId=999` (API cá»§a ngÆ°á»i khÃ¡c).<br>3. Quan sÃ¡t mÃ£ pháº£n há»“i HTTP vÃ  dá»¯ liá»‡u tráº£ vá». | Token: Provider A<br>`apiId`: Cá»§a Provider B | - TÃ­nh báº¥t biáº¿n: Há»‡ thá»‘ng tuyá»‡t Ä‘á»‘i cÃ¡ch ly dá»¯ liá»‡u, khÃ´ng tráº£ báº¥t ká»³ dá»¯ liá»‡u lÆ°u lÆ°á»£ng hay doanh thu nÃ o cá»§a Provider B.<br>- Tráº¡ng thÃ¡i tráº£ vá»: Hiá»‡n táº¡i code backend PR #106 tráº£ vá» HTTP 200 kÃ¨m dá»¯ liá»‡u rá»—ng (`requestCount: "0"`, `topEndpoints: []`, `revenue: []`). MÃ£ HTTP cuá»‘i cÃ¹ng (403 Forbidden vs 200 OK rá»—ng) Ä‘ang **CHÆ¯A XÃC NHáº¬N â€” cáº§n Tech Lead chá»‘t**.<br>- Tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘á»ƒ lá»™ dá»¯ liá»‡u lÆ°u lÆ°á»£ng hay doanh thu cá»§a bÃªn thá»© ba. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[ANL-07]** | **Äá»‘i soÃ¡t 4 táº§ng Analytics:** UI Dashboard $\leftrightarrow$ API JSON $\leftrightarrow$ PostgreSQL $\leftrightarrow$ Redis | US-31<br>`AC-US31-01`<br>`AC-US31-04` | Há»‡ thá»‘ng Ä‘ang cháº¡y Ä‘áº§y Ä‘á»§ DB, Redis, Backend, Frontend. Thá»±c hiá»‡n 5 requests qua Gateway | 1. Thá»±c hiá»‡n 5 requests qua Gateway cho API 3.<br>2. Xem sá»‘ liá»‡u trÃªn UI `http://localhost:5173/provider/analytics`.<br>3. So khá»›p vá»›i API `GET /api/provider/analytics/overview?apiId=3`.<br>4. Cháº¡y cÃ¢u truy váº¥n SQL Ä‘á»c kiá»ƒm chá»©ng:<br>`SELECT SUM(request_count) FROM provider_daily_aggregates WHERE api_id = 3;`<br>`SELECT COUNT(*) FROM usage_logs WHERE api_id = 3;` | 5 Gateway requests | - Sá»‘ request trÃªn UI = Sá»‘ request trong API JSON = Sá»‘ báº£n ghi Ä‘áº¿m Ä‘Æ°á»£c trong `usage_logs` vÃ  báº£ng aggregate PostgreSQL.<br>- Khá»›p 100% giá»¯a 4 táº§ng, khÃ´ng cÃ³ sai lá»‡ch. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |

---

### PHáº¦N 2: US-32 â€” COST GUARD (9 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[CST-01]** | Thiáº¿t láº­p ngÃ¢n sÃ¡ch thÃ¡ng vÃ  cháº¿ Ä‘á»™ ngáº¯t cá»©ng thÃ nh cÃ´ng | US-32<br>`AC-US32-01` | Consumer Ä‘Ã£ Ä‘Äƒng nháº­p (`user@example.com`) | 1. Gá»­i request `PUT /api/consumer/cost-guard` kÃ¨m body JSON.<br>2. Kiá»ƒm tra mÃ£ pháº£n há»“i HTTP.<br>3. Cháº¡y truy váº¥n Ä‘á»c DB kiá»ƒm chá»©ng:<br>`SELECT * FROM cost_guard_budgets WHERE consumer_id = 2;` | `{"currency":"USD", "monthlyBudget":"30.00", "hardCutoff":true}` | - HTTP 200 OK.<br>- Báº£n ghi Ä‘Æ°á»£c lÆ°u chÃ­nh xÃ¡c trong `cost_guard_budgets` vá»›i `monthly_budget = 30.00`, `hard_cutoff = true`. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[CST-02]** | Ã‰p lá»—i dá»¯ liá»‡u ngÃ¢n sÃ¡ch khÃ´ng há»£p lá»‡ (ngÃ¢n sÃ¡ch $\le 0$, thiáº¿u auth) | US-32<br>`AC-US32-01` | Gá»­i request can thiá»‡p API | 1. Gá»­i `PUT /api/consumer/cost-guard` vá»›i `monthlyBudget: "-10.00"`.<br>2. Gá»­i request khÃ´ng kÃ¨m header Authorization.<br>3. Quan sÃ¡t pháº£n há»“i. | Case 1: `monthlyBudget: -10`<br>Case 2: No Auth Header | - Case 1: HTTP 400 Bad Request (`INVALID_BUDGET_AMOUNT`).<br>- Case 2: HTTP 401 Unauthorized.<br>- KhÃ´ng lÃ m sai lá»‡ch báº£n ghi DB. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[CST-03]** | TÃ­nh chi phÃ­ tÃ­ch lÅ©y theo snapshot giÃ¡ tá»«ng request | US-32<br>`AC-US32-02` | Consumer Ä‘Ã£ Ä‘Äƒng kÃ½ gÃ³i cÆ°á»›c tráº£ phÃ­ cÃ³ giÃ¡ vÃ  háº¡n ngáº¡ch xÃ¡c Ä‘á»‹nh | 1. Thá»±c hiá»‡n gá»i 1 request qua Gateway thÃ nh cÃ´ng HTTP 200.<br>2. Kiá»ƒm tra cá»™t `estimated_cost` trong báº£ng `usage_outbox` vÃ  `usage_logs` báº±ng SQL:<br>`SELECT cost_currency, estimated_cost FROM usage_logs WHERE consumer_id = 2 ORDER BY id DESC LIMIT 1;` | GÃ³i Pro: Price = 30 USD, Quota = 1000 requests | - Cá»™t `estimated_cost` lÆ°u Ä‘Ãºng giÃ¡ trá»‹: $\frac{30}{1000} = 0.030000000000$.<br>- `cost_currency` = 'USD'.<br>- GiÃ¡ trá»‹ khÃ´ng bá»‹ lÃ m trÃ²n thÃ nh 0. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[CST-04]** | **Äá»‘i soÃ¡t 4 táº§ng Cost Guard:** UI $\leftrightarrow$ API JSON $\leftrightarrow$ PostgreSQL $\leftrightarrow$ Redis | US-32<br>`AC-US32-02` | Thiáº¿t láº­p ngÃ¢n sÃ¡ch 10 USD. Gá»i 10 requests qua Gateway | 1. Cáº¥u hÃ¬nh ngÃ¢n sÃ¡ch 10 USD.<br>2. Gá»i 10 requests qua Gateway.<br>3. Má»Ÿ UI `http://localhost:5173/dashboard/cost-guard`.<br>4. Gá»i API `GET /api/consumer/cost-guard`.<br>5. Cháº¡y SQL Ä‘á»c kiá»ƒm chá»©ng:<br>`SELECT SUM(estimated_cost) FROM usage_logs WHERE consumer_id = 2;`<br>`SELECT SUM(estimated_cost) FROM usage_outbox WHERE consumer_id = 2;` | NgÃ¢n sÃ¡ch: 10 USD<br>10 requests | - Chi phÃ­ Æ°á»›c tÃ­nh trÃªn UI = Chi phÃ­ trong API JSON = Tá»•ng `estimated_cost` trong `usage_logs` + `usage_outbox`.<br>- Sá»‘ liá»‡u khá»›p chÃ­nh xÃ¡c tuyá»‡t Ä‘á»‘i. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[CST-05]** | KÃ­ch hoáº¡t ngÆ°á»¡ng cáº£nh bÃ¡o chi tiÃªu 50% vÃ  80% | US-32<br>`AC-US32-03` | Thiáº¿t láº­p ngÃ¢n sÃ¡ch 1.00 USD (má»—i request 0.10 USD). Báº­t `hardCutoff = false` | 1. Gá»i 5 requests Ä‘á»ƒ Ä‘áº¡t chi phÃ­ 0.50 USD (50%).<br>2. Gá»i `GET /api/consumer/cost-guard` vÃ  kiá»ƒm tra UI.<br>3. Gá»i thÃªm 3 requests Ä‘á»ƒ Ä‘áº¡t 0.80 USD (80%).<br>4. Gá»i láº¡i API vÃ  kiá»ƒm tra UI. | NgÃ¢n sÃ¡ch: 1.00 USD<br>Láº§n 1: 5 reqs (50%)<br>Láº§n 2: 8 reqs (80%) | - Láº§n 1: `reachedThresholds = [50]`, UI hiá»ƒn thá»‹ huy hiá»‡u vÃ ng cáº£nh bÃ¡o má»©c 1.<br>- Láº§n 2: `reachedThresholds = [50, 80]`, UI hiá»ƒn thá»‹ huy hiá»‡u cam cáº£nh bÃ¡o má»©c 2.<br>- Gateway váº«n cho phÃ©p request Ä‘i qua bÃ¬nh thÆ°á»ng. | ChÆ°a cháº¡y | Desktop 1280x720<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[CST-06]** | Cáº£nh bÃ¡o khi cháº¡m 100% ngÃ¢n sÃ¡ch á»Ÿ cháº¿ Ä‘á»™ chá»‰ cáº£nh bÃ¡o (`hardCutoff = false`) | US-32<br>`AC-US32-03`<br>`AC-US32-04` | NgÃ¢n sÃ¡ch 1.00 USD, `hardCutoff = false`. ÄÃ£ tiÃªu thá»¥ Ä‘á»§ 1.00 USD | 1. Gá»i request thá»© 11 qua Gateway khi chi phÃ­ Ä‘Ã£ cháº¡m/vÆ°á»£t 1.00 USD.<br>2. Kiá»ƒm tra pháº£n há»“i Gateway.<br>3. Kiá»ƒm tra pháº£n há»“i API Cost Guard. | NgÃ¢n sÃ¡ch: 1.00 USD<br>`hardCutoff: false`<br>Chi phÃ­ $\ge$ 1.00 USD | - Gateway váº«n tráº£ HTTP 200 OK (khÃ´ng bá»‹ cháº·n vÃ¬ `hardCutoff = false`).<br>- API Cost Guard tráº£ `reachedThresholds = [50, 80, 100]`, `spentPercent >= 100`, `estimatedSpend >= monthlyBudget`.<br>- UI hiá»ƒn thá»‹ cáº£nh bÃ¡o Ä‘á» ngÃ¢n sÃ¡ch Ä‘Ã£ cáº¡n. | ChÆ°a cháº¡y | Desktop 1280x720<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[CST-07]** | Cháº·n Gateway `429 BUDGET_EXHAUSTED` khi báº­t `hardCutoff = true` vÃ  cháº¡m tráº§n | US-32<br>`AC-US32-04` | Thiáº¿t láº­p ngÃ¢n sÃ¡ch 1.00 USD, báº­t `hardCutoff = true`. Chi phÃ­ hiá»‡n táº¡i Ä‘áº¡t 1.00 USD | 1. Gá»­i request tráº£ phÃ­ tiáº¿p theo qua Gateway kÃ¨m API Key há»£p lá»‡.<br>2. Quan sÃ¡t HTTP status code vÃ  body JSON tráº£ vá».<br>3. Kiá»ƒm tra log upstream mock service. | Header: `x-api-key`<br>Target: Route tráº£ phÃ­ | - Gateway tá»« chá»‘i vá»›i HTTP 429 Too Many Requests.<br>- MÃ£ lá»—i JSON: `error.code === 'BUDGET_EXHAUSTED'` (chá»‰ assert mÃ£ lá»—i, khÃ´ng assert chuá»—i message `'Monthly spending budget reached'` vÃ¬ chuá»—i nÃ y chÆ°a cÃ³ trong yÃªu cáº§u gá»‘c).<br>- Upstream hoÃ n toÃ n khÃ´ng bá»‹ gá»i. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[CST-08]** | Miá»…n trá»« Cost Guard cho gÃ³i Free (0 USD) vÃ  lÆ°á»£t dÃ¹ng thá»­ Sandbox | US-32<br>`AC-US32-04` | NgÃ¢n sÃ¡ch cháº¡m 100% vÃ  Ä‘ang bá»‹ ngáº¯t cá»©ng (`hardCutoff = true`) | 1. DÃ¹ng API Key cá»§a gÃ³i Free gá»i qua Gateway.<br>2. DÃ¹ng token sandbox gá»i qua Playground.<br>3. Quan sÃ¡t káº¿t quáº£ xá»­ lÃ½. | Request gÃ³i Free / Sandbox | - Request gÃ³i Free tráº£ vá» HTTP 200 OK bÃ¬nh thÆ°á»ng.<br>- Request Sandbox hoáº¡t Ä‘á»™ng theo háº¡n má»©c 5 lÆ°á»£t.<br>- KhÃ´ng bá»‹ cháº·n bá»Ÿi lá»—i `BUDGET_EXHAUSTED`. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[CST-09]** | TÆ°Æ¡ng thÃ­ch ngÆ°á»£c: Äáº¿m riÃªng cÃ¡c request cÅ© khÃ´ng cÃ³ giÃ¡ (`unpricedRequests`) | US-32<br>`AC-US32-05` | CÆ¡ sá»Ÿ dá»¯ liá»‡u cÃ³ cÃ¡c báº£n ghi `usage_logs` cÅ© tá»« Sprint 4 cÃ³ `estimated_cost IS NULL` | 1. Gá»i `GET /api/consumer/cost-guard`.<br>2. Kiá»ƒm tra trÆ°á»ng `unpricedRequests` trong response JSON.<br>3. Cháº¡y cÃ¢u lá»‡nh SQL kiá»ƒm chá»©ng:<br>`SELECT COUNT(*) FROM usage_logs WHERE consumer_id = 2 AND estimated_cost IS NULL;` | Dá»¯ liá»‡u Sprint 4 | - TrÆ°á»ng `unpricedRequests` tráº£ vá» sá»‘ lÆ°á»£ng chÃ­nh xÃ¡c khá»›p vá»›i sá»‘ báº£n ghi NULL trong DB.<br>- KhÃ´ng bá»‹ gá»™p vÃ o chi phÃ­ tÃ­nh sai lá»‡ch. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |

---

### PHáº¦N 3: EN-11 â€” SECURITY TESTING & ACCESS CONTROL (7 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[SEC-01]** | Chá»‘ng SSRF: Cháº·n cáº¥u hÃ¬nh Upstream Base URL trá» vá» `localhost` / RFC1918 | EN-11<br>`AC-EN11-01` | Provider Ä‘ang á»Ÿ mÃ n hÃ¬nh táº¡o/chá»‰nh sá»­a API | 1. Nháº­p URL `http://127.0.0.1:4000` hoáº·c `http://localhost:3000` vÃ o Ã´ Upstream Base URL.<br>2. Báº¥m "Tiáº¿p tá»¥c" hoáº·c ná»™p duyá»‡t.<br>3. Thá»­ láº¡i vá»›i IP private `http://192.168.1.1` vÃ  cloud metadata `http://169.254.169.254`. | URL ná»™i bá»™ cáº¥m | - Há»‡ thá»‘ng tá»« chá»‘i ngay láº­p tá»©c.<br>- BÃ¡o lá»—i validation: `SSRF_DETECTED` (Upstream destination is not allowed) hoáº·c `DOMAIN_NOT_SUPPORTED` (Use an HTTP(S) base URL with a publicly delegated DNS hostname and no credentials).<br>- KhÃ´ng cho phÃ©p lÆ°u vÃ o cÆ¡ sá»Ÿ dá»¯ liá»‡u. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[SEC-02]** | Chá»‘ng SSRF: Cháº·n ká»¹ thuáº­t DNS Rebinding vÃ  redirect sang IP ná»™i bá»™ | EN-11<br>`AC-EN11-01` | Upstream URL cÃ³ tÃªn miá»n phÃ¢n giáº£i ra cáº£ IP public vÃ  IP private | 1. Cáº¥u hÃ¬nh domain thá»­ nghiá»‡m phÃ¢n giáº£i IP há»—n há»£p qua SafeProxy.<br>2. Gá»­i request qua Gateway proxy.<br>3. Quan sÃ¡t pháº£n há»“i kiá»ƒm tra DNS pinning. | Domain DNS rebinding | - SafeProxy phÃ¡t hiá»‡n IP phÃ¢n giáº£i chá»©a IP ná»™i bá»™ vÃ  tá»« chá»‘i káº¿t ná»‘i.<br>- Tráº£ vá» HTTP 403 `SSRF_DETECTED` ('Upstream destination is not allowed'). | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[SEC-03]** | Chá»‘ng lÃ¡ch Rate Limit / Quota báº±ng ká»¹ thuáº­t táº¡o má»›i vÃ  xoay API Key | EN-11<br>`AC-EN11-02` | Consumer Ä‘Ã£ dÃ¹ng háº¿t 10 req/s rate limit hoáº·c quota thÃ¡ng; yÃªu cáº§u tÃ­ch há»£p Backend PR #106 (`rateScope`) | 1. TiÃªu thá»¥ háº¿t rate limit/quota vá»›i API Key 1.<br>2. VÃ o UI táº¡o tiáº¿p API Key 2 cho cÃ¹ng tÃ i khoáº£n vÃ  gÃ³i cÆ°á»›c Ä‘Ã³.<br>3. Gá»­i request ngay láº­p tá»©c báº±ng API Key 2. | Key 1 (cÅ©), Key 2 (má»›i) | - Request báº±ng Key 2 váº«n bá»‹ cháº·n chÃ­nh xÃ¡c vá»›i HTTP 429 (`RATE_LIMITED` hoáº·c `QUOTA_EXHAUSTED`).<br>- KhÃ´ng lÃ¡ch Ä‘Æ°á»£c bá»™ Ä‘áº¿m Redis do rateScope gáº¯n theo consumerId vÃ  apiId. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[SEC-04]** | Báº£o máº­t API Key: MÃ£ hÃ³a má»™t chiá»u trong DB vÃ  chá»‰ hiá»‡n Ä‘áº§y Ä‘á»§ 1 láº§n | EN-11<br>`AC-EN11-03` | Consumer táº¡o má»›i API Key trÃªn giao diá»‡n | 1. Táº¡o API Key má»›i táº¡i `http://localhost:5173/dashboard/api-keys`.<br>2. Kiá»ƒm tra modal hiá»ƒn thá»‹ chuá»—i key Ä‘áº§y Ä‘á»§.<br>3. Táº£i láº¡i trang (F5).<br>4. Cháº¡y SQL Ä‘á»c kiá»ƒm chá»©ng:<br>`SELECT key_hash, key_prefix FROM api_keys ORDER BY id DESC LIMIT 1;` | Táº¡o key má»›i | - Modal hiá»‡n key Ä‘áº§y Ä‘á»§ Ä‘Ãºng 1 láº§n duy nháº¥t kÃ¨m nÃºt Copy.<br>- Táº£i láº¡i trang chá»‰ cÃ²n tháº¥y dáº¡ng che `ak_live_XXXX...`.<br>- DB tuyá»‡t Ä‘á»‘i khÃ´ng chá»©a chuá»—i thÃ´, chá»‰ lÆ°u `key_hash`. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[SEC-05]** | Khá»­ dá»¯ liá»‡u nháº¡y cáº£m trong há»‡ thá»‘ng Log vÃ  Gateway Headers (`[REDACTED]`) | EN-11<br>`AC-EN11-04` | YÃªu cáº§u tÃ­ch há»£p Backend PR #106. Gá»­i request qua Gateway cÃ³ chá»©a headers nháº¡y cáº£m | 1. Gá»­i request qua Gateway kÃ¨m header `Authorization: Bearer my-secret-token` vÃ  `Cookie: session=secret123`.<br>2. Kiá»ƒm tra log stdout cá»§a há»‡ thá»‘ng vÃ  response headers:<br>- Gateway chá»‰ cho phÃ©p cÃ¡c header whitelist (`accept`, `accept-language`, `content-type`).<br>- CÃ¡c header nháº¡y cáº£m Authorization, Cookie, X-API-Key Ä‘á»u bá»‹ loáº¡i bá» hoáº·c che má» thÃ nh `[REDACTED]`.<br>3. Kiá»ƒm tra báº£ng `usage_logs`: chá»‰ lÆ°u metrics, khÃ´ng lÆ°u trá»¯ thÃ´ng tin nháº¡y cáº£m. | Header nháº¡y cáº£m | - Header nháº¡y cáº£m khÃ´ng bá»‹ chuyá»ƒn tiáº¿p sang Upstream vÃ  khÃ´ng rÃ² rá»‰ ra log container.<br>- Token vÃ  password khÃ´ng xuáº¥t hiá»‡n dáº¡ng rÃµ trong báº¥t ká»³ log nÃ o. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[SEC-06]** | Ma tráº­n phÃ¢n quyá»n 3 vai trÃ² (RBAC): Chá»‘ng leo thang Ä‘áº·c quyá»n | EN-11<br>`AC-EN11-05` | ÄÄƒng nháº­p tÃ i khoáº£n Consumer thÆ°á»ng (`user@example.com`) | 1. DÃ¹ng token cá»§a Consumer truy cáº­p route Admin: `GET /api/admin/users`.<br>2. Thá»­ gá»i API sá»­a tráº¡ng thÃ¡i API cá»§a Provider: `PATCH /api/provider/apis/3`.<br>3. Quan sÃ¡t HTTP status. | Token Consumer | - ToÃ n bá»™ cÃ¡c request trÃ¡i quyá»n nháº­n HTTP 403 Forbidden.<br>- Error code: `FORBIDDEN`.<br>- KhÃ´ng truy cáº­p hay can thiá»‡p Ä‘Æ°á»£c dá»¯ liá»‡u quáº£n trá»‹. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[SEC-07]** | Quáº£n lÃ½ phiÃªn lÃ m viá»‡c: Thu há»“i Refresh Token khi Ä‘á»•i máº­t kháº©u / Ä‘Äƒng xuáº¥t | EN-11<br>`AC-EN11-05` | NgÆ°á»i dÃ¹ng Ä‘ang cÃ³ phiÃªn Ä‘Äƒng nháº­p trÃªn trÃ¬nh duyá»‡t | 1. Thá»±c hiá»‡n Ä‘á»•i máº­t kháº©u táº¡i trang Profile hoáº·c gá»i `POST /api/auth/change-password`.<br>2. DÃ¹ng Refresh Token cÅ© gá»­i yÃªu cáº§u `POST /api/auth/refresh`.<br>3. Quan sÃ¡t káº¿t quáº£. | Refresh Token cÅ© | - YÃªu cáº§u lÃ m má»›i token báº±ng token cÅ© bá»‹ tá»« chá»‘i vá»›i HTTP 401 Unauthorized.<br>- Báº¯t buá»™c Ä‘Äƒng nháº­p láº¡i vá»›i máº­t kháº©u má»›i. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |

---

### PHáº¦N 4: EN-12 â€” PERFORMANCE BENCHMARK & GATEWAY LOAD TESTING (2 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[PERF-01]** | Äo táº£i Gateway Ä‘a luá»“ng (c=1, 10, 25) vÃ  kiá»ƒm chá»©ng SLA P95 Overhead < 30ms | EN-12<br>`AC-EN12-01` | MÃ´i trÆ°á»ng test cÃ³ PostgreSQL vÃ  Redis sáº¡ch. ÄÃ£ build backend má»›i nháº¥t | 1. Cháº¡y lá»‡nh Ä‘o táº£i: `npm run loadtest:gateway`.<br>2. Quan sÃ¡t káº¿t quáº£ in ra cho 3 má»©c Ä‘á»“ng thá»i: `c=1`, `c=10`, `c=25`.<br>3. Kiá»ƒm tra mÃ£ thoÃ¡t (exit code) vÃ  tá»•ng sá»‘ báº£n ghi outbox/usage logs.<br>4. **LÆ°u Ã½:** Ghi nháº­n rá»§i ro P95 Ä‘áº¡t 38ms/44ms táº¡i c=10/25 á»Ÿ báº£n Ä‘o local. | Concurrency: 1, 10, 25<br>20 warm-up, 200 samples/tier | - SLA Ká»³ vá»ng: P95 Overhead $< 30\text{ms}$ á»Ÿ cáº£ 3 má»©c.<br>- Tá»· lá»‡ lá»—i: 0/620 (0%).<br>- LÆ°u Ä‘á»§ 620/620 báº£n ghi `usage_logs`.<br>- Náº¿u P95 $\ge 30\text{ms}$: BÃ¡o cá» `SLA_MISSED` vÃ  ghi nháº­n sai lá»‡ch, tuyá»‡t Ä‘á»‘i khÃ´ng sá»­a test (Z4). | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: BE PR #106) |
| **[PERF-02]** | Kiá»ƒm chá»©ng tÃ­nh nguyÃªn tá»­ Quota (Atomic Lua) dÆ°á»›i táº£i 100 requests tranh cháº¥p 50 lÆ°á»£t | EN-12<br>`AC-EN12-02` | Subscription cÃ²n Ä‘Ãºng 50 lÆ°á»£t quota kháº£ dá»¥ng trong chu ká»³ | 1. DÃ¹ng cÃ´ng cá»¥ test táº£i hoáº·c k6 gá»­i Ä‘á»“ng thá»i 100 requests cÃ¹ng lÃºc qua Gateway.<br>2. Äáº¿m sá»‘ lÆ°á»£ng pháº£n há»“i HTTP 200 vÃ  HTTP 429.<br>3. Kiá»ƒm tra bá»™ Ä‘áº¿m Redis vÃ  cháº¡y SQL kiá»ƒm chá»©ng:<br>`SELECT quota_used, quota_limit FROM subscriptions WHERE id = :id;` | 100 requests / 0ms<br>Quota cÃ²n: 50 | - ÄÃºng 50 requests thÃ nh cÃ´ng HTTP 200 OK.<br>- ÄÃºng 50 requests cÃ²n láº¡i nháº­n HTTP 429 `QUOTA_EXCEEDED`.<br>- Counter Redis vÃ  PostgreSQL ghi nháº­n chÃ­nh xÃ¡c 50 lÆ°á»£t, khÃ´ng bá»‹ Ã¢m. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>Critical<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |

---

### PHáº¦N 5: EN-13 â€” PRODUCTION DEPLOYMENT, BACKUP/RESTORE & ROLLBACK (3 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[OPS-01]** | Kiá»ƒm chá»©ng Production Preflight tá»« chá»‘i cáº¥u hÃ¬nh secret yáº¿u hoáº·c khÃ´ng an toÃ n | EN-13<br>`AC-EN13-01` | Äang á»Ÿ thÆ° má»¥c gá»‘c repo | 1. Thiáº¿t láº­p file `.env.test` vá»›i secret ngáº¯n $< 32$ kÃ½ tá»±.<br>2. Cháº¡y `node --env-file=.env.test scripts/production-preflight.mjs`.<br>3. Thá»­ trÆ°á»ng há»£p tÃ¡i sá»­ dá»¥ng chung 1 chuá»—i secret.<br>4. Thá»­ trÆ°á»ng há»£p URL khÃ´ng dÃ¹ng `https://`. | Cáº¥u hÃ¬nh vi pháº¡m | - Script tá»« chá»‘i ngay láº­p tá»©c vá»›i exit code 1.<br>- In thÃ´ng bÃ¡o lá»—i chá»‰ rÃµ nguyÃªn nhÃ¢n (secret ngáº¯n, trÃ¹ng secret, thiáº¿u HTTPS). | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[OPS-02]** | Kiá»ƒm chá»©ng tá»± Ä‘á»™ng toÃ n trÃ¬nh Sao lÆ°u & Phá»¥c há»“i Database (`verify:backup`) | EN-13<br>`AC-EN13-02` | ÄÃ£ cáº¥u hÃ¬nh PostgreSQL cháº¡y cá»¥c bá»™ | 1. Cháº¡y lá»‡nh: `npm run verify:backup`.<br>2. Quan sÃ¡t quÃ¡ trÃ¬nh: khá»Ÿi táº¡o DB nguá»“n `api_market_src`, cháº¡y migration + seed, xuáº¥t `pg_dump -Fc`, phá»¥c há»“i sang `api_market_restored` báº±ng `pg_restore`.<br>3. Kiá»ƒm tra báº£ng Ä‘á»‘i soÃ¡t sá»‘ lÆ°á»£ng báº£n ghi in ra á»Ÿ cuá»‘i. | `npm run verify:backup` | - ToÃ n bá»™ cÃ¡c báº£ng cá»‘t lÃµi (ká»ƒ cáº£ báº£ng Sprint 5) khá»›p sá»‘ lÆ°á»£ng 100% (Ä‘á»™ lá»‡ch 0 báº£n ghi).<br>- Script thoÃ¡t vá»›i mÃ£ lá»—i 0. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: DB PR #104) |
| **[OPS-03]** | Káº¿ hoáº¡ch Rollback tá»©c thÃ¬ phiÃªn báº£n á»©ng dá»¥ng vÃ  Database (< 60 giÃ¢y) | EN-13<br>`AC-EN13-03` | CÃ³ báº£n sao lÆ°u pre-deploy dump vÃ  file lÆ°u tag `.last_image_tag` | 1. Giáº£ láº­p phiÃªn báº£n má»›i gáº·p sá»± cá»‘.<br>2. Thá»±c hiá»‡n lá»‡nh rollback container theo `docs/06-production-rollback-runbook.md` má»¥c 4.<br>3. Thá»±c hiá»‡n phá»¥c há»“i database tá»« báº£n dump pre-deploy.<br>4. Kiá»ƒm tra sá»©c khá»e `curl http://localhost:3000/health`. | File `.last_image_tag`<br>`pre-deploy.dump` | - Container á»©ng dá»¥ng quay vá» phiÃªn báº£n cÅ© trong thá»i gian $< 60$ giÃ¢y.<br>- Endpoint `/health` tráº£ lá»i HTTP 200 OK.<br>- Dá»¯ liá»‡u toÃ n váº¹n, khÃ´ng phÃ¡t sinh lá»—i 500. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |

---

### PHáº¦N 6: EN-14 â€” UX, RESPONSIVE & ACCESSIBILITY (5 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[UX-01]** | Kiá»ƒm tra bá»‘ cá»¥c hiá»ƒn thá»‹ Ä‘a Ä‘á»™ phÃ¢n giáº£i trÃªn Desktop ($1280 \times 720\text{ px}$) | EN-14<br>`AC-EN14-01` | Khá»Ÿi Ä‘á»™ng Frontend trÃªn cá»•ng 5173 | 1. Má»Ÿ Playwright vá»›i viewport $1280 \times 720$.<br>2. Duyá»‡t qua láº§n lÆ°á»£t: Marketplace, Detail, Playground, Checkout, Usage, Cost Guard, Provider Analytics, Admin.<br>3. Chá»¥p áº£nh mÃ n hÃ¬nh kiá»ƒm tra bá»‘ cá»¥c. | Viewport: `1280x720` | - Bá»‘ cá»¥c cÃ¢n Ä‘á»‘i, thanh Ä‘iá»u hÆ°á»›ng má»Ÿ Ä‘áº§y Ä‘á»§.<br>- KhÃ´ng trÃ n ngang, khÃ´ng vá»¡ layout.<br>- Báº£ng dá»¯ liá»‡u hiá»ƒn thá»‹ rÃµ rÃ ng. | ChÆ°a cháº¡y | Desktop 1280x720<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[UX-02]** | Kiá»ƒm tra bá»‘ cá»¥c hiá»ƒn thá»‹ Ä‘a Ä‘á»™ phÃ¢n giáº£i trÃªn Tablet ($768 \times 1024\text{ px}$) | EN-14<br>`AC-EN14-01` | Khá»Ÿi Ä‘á»™ng Frontend trÃªn cá»•ng 5173 | 1. Má»Ÿ Playwright vá»›i viewport $768 \times 1024$.<br>2. Duyá»‡t qua cÃ¡c mÃ n hÃ¬nh tÆ°Æ¡ng tá»± nhÆ° [UX-01].<br>3. Kiá»ƒm tra thanh menu mobile/drawer vÃ  cÃ¡c card thá»‘ng kÃª. | Viewport: `768x1024` | - Menu chuyá»ƒn sang dáº¡ng hamburger/drawer an toÃ n.<br>- Báº£ng dá»¯ liá»‡u cÃ³ cuá»™n ngang ná»™i bá»™ hoáº·c chuyá»ƒn dáº¡ng tháº» card.<br>- KhÃ´ng trÃ n vá»¡ khung hÃ¬nh chÃ­nh. | ChÆ°a cháº¡y | Tablet 768x1024<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[UX-03]** | **TiÃªu chuáº©n Console sáº¡ch tuyá»‡t Ä‘á»‘i (Rule A1):** Zero Console Errors | EN-14<br>`AC-EN14-02` | Playwright láº¯ng nghe sá»± kiá»‡n `console` vÃ  `pageerror` | 1. Äiá»u hÆ°á»›ng qua táº¥t cáº£ cÃ¡c trang chÃ­nh vÃ  thá»±c hiá»‡n thao tÃ¡c form.<br>2. Thu tháº­p toÃ n bá»™ log console trong suá»‘t phiÃªn cháº¡y.<br>3. Kiá»ƒm tra danh sÃ¡ch lá»—i Ä‘á». | ToÃ n bá»™ luá»“ng UI | - Máº£ng `consoleErrors` vÃ  `pageErrors` rá»—ng hoÃ n toÃ n (0 lá»—i).<br>- KhÃ´ng cÃ³ lá»—i React warning (missing key, invalid prop). | ChÆ°a cháº¡y | Cáº£ 2 viewports<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[UX-04]** | Äáº§y Ä‘á»§ tráº¡ng thÃ¡i Loading, Empty vÃ  Error States trÃªn cÃ¡c mÃ n hÃ¬nh má»›i | EN-14<br>`AC-EN14-03` | TÃ i khoáº£n má»›i táº¡o chÆ°a cÃ³ dá»¯ liá»‡u giao dá»‹ch / API | 1. VÃ o mÃ n hÃ¬nh Cost Guard cá»§a tÃ i khoáº£n chÆ°a thiáº¿t láº­p ngÃ¢n sÃ¡ch $\to$ Kiá»ƒm tra Empty State.<br>2. Ngáº¯t káº¿t ná»‘i backend API $\to$ Kiá»ƒm tra Error State vÃ  nÃºt "Thá»­ láº¡i".<br>3. LÃ m má»›i trang vá»›i máº¡ng cháº­m $\to$ Kiá»ƒm tra Skeleton Loading. | Máº¡ng bÃ¬nh thÆ°á»ng / Máº¡ng lá»—i | - Empty state hiá»ƒn thá»‹ minh há»a vÃ  nÃºt kÃªu gá»i hÃ nh Ä‘á»™ng.<br>- Error state bÃ¡o lá»—i rÃµ rÃ ng kÃ¨m nÃºt thá»­ láº¡i, khÃ´ng crash tráº¯ng trang.<br>- Loading state hiá»ƒn thá»‹ hiá»‡u á»©ng skeleton mÆ°á»£t mÃ . | ChÆ°a cháº¡y | Cáº£ 2 viewports<br>Medium<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |
| **[UX-05]** | Kiá»ƒm tra kháº£ nÄƒng tÆ°Æ¡ng tÃ¡c: Pháº§n tá»­ khÃ´ng bá»‹ che Ä‘Ã¨ (TiÃªu chÃ­ A2â€“A3) | EN-14<br>`AC-EN14-04` | CÃ¡c mÃ n hÃ¬nh cÃ³ modal hoáº·c menu dropdown (Táº¡o API, Checkout, Tháº©m Ä‘á»‹nh) | 1. Má»Ÿ modal táº¡o API Key hoáº·c modal xÃ¡c nháº­n Ä‘Ã¬nh chá»‰.<br>2. Kiá»ƒm tra nÃºt báº¥m chÃ­nh vÃ  nÃºt Ä‘Ã³ng modal.<br>3. Thao tÃ¡c nháº¥p chuá»™t vÃ  gÃµ phÃ­m. | Chuá»™t vÃ  bÃ n phÃ­m tháº­t | - NÃºt báº¥m vÃ  Ã´ nháº­p náº±m trá»n trong viewport nhÃ¬n tháº¥y Ä‘Æ°á»£c.<br>- KhÃ´ng bá»‹ overlay hay pháº§n tá»­ khÃ¡c Ä‘Ã¨ lÃªn (khÃ´ng cáº§n dÃ¹ng `{ force: true }`).<br>- NgÆ°á»i dÃ¹ng bÃ¬nh thÆ°á»ng thao tÃ¡c trÆ¡n tru báº±ng chuá»™t/phÃ­m. | ChÆ°a cháº¡y | Cáº£ 2 viewports<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |

---

### PHáº¦N 7: EN-15 â€” REGRESSION TESTING & QUALITY GATE (4 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[REG-01]** | Cháº¡y toÃ n bá»™ Backend Integration Tests vÃ  xÃ¡c thá»±c Swagger OpenAPI | EN-15<br>`AC-EN15-01` | MÃ´i trÆ°á»ng test cÃ³ DB PostgreSQL vÃ  Redis | 1. Cháº¡y lá»‡nh: `npm test`.<br>2. Quan sÃ¡t káº¿t quáº£ cháº¡y qua táº¥t cáº£ cÃ¡c test suites (Auth, Provider, Gateway, Usage, Cost Guard, Analytics). | `npm test` | - Tá»‘i thiá»ƒu 180/180 tests PASS (100%).<br>- 0 failed, 0 skipped.<br>- OpenAPI Swagger há»£p lá»‡ khÃ´ng cÃ³ lá»—i cÃº phÃ¡p. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>Critical<br>Chá» tÃ­ch há»£p develop |
| **[REG-02]** | Cháº¡y toÃ n bá»™ Frontend Vitest Unit & Component Suite | EN-15<br>`AC-EN15-01` | Äang á»Ÿ thÆ° má»¥c `frontend/` | 1. Cháº¡y lá»‡nh: `cd frontend && npm test && npm run build`.<br>2. Quan sÃ¡t káº¿t quáº£ thá»±c thi Vitest vÃ  build Vite. | `vitest run` | - Tá»‘i thiá»ƒu 550/550 tests PASS (100%).<br>- Build hoÃ n táº¥t thÃ nh cÃ´ng 0 lá»—i TypeScript (`tsc -b`). | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (CLI)<br>Critical<br>Chá» tÃ­ch há»£p develop |
| **[UAT-01]** | Nghiá»‡m thu ngÆ°á»i dÃ¹ng (UAT) trá»n váº¹n theo 3 vai trÃ² (Consumer, Provider, Admin) | EN-15<br>`AC-EN15-02` | MÃ´i trÆ°á»ng Staging Ä‘Ã³ng bÄƒng sáº¡ch cÃ³ seed demo | 1. Cháº¡y láº§n lÆ°á»£t cÃ¡c ká»‹ch báº£n ngÆ°á»i dÃ¹ng tháº­t theo ká»‹ch báº£n demo.<br>2. ÄÃ¡nh giÃ¡ tÃ­nh há»¯u Ã­ch, tÃ­nh dá»… dÃ¹ng vÃ  Ä‘á»™ chÃ­nh xÃ¡c cá»§a sá»‘ liá»‡u.<br>3. Ghi nháº­n pháº£n há»“i vÃ  phÃ¡t hiá»‡n lá»—i náº¿u cÃ³. | 3 vai trÃ² ngÆ°á»i dÃ¹ng | - ToÃ n bá»™ cÃ¡c thao tÃ¡c nghiá»‡p vá»¥ cá»‘t lÃµi hoÃ n thÃ nh trÃ´i cháº£y.<br>- KhÃ´ng cÃ³ lá»—i cháº·n luá»“ng nghiá»‡p vá»¥.<br>- NgÆ°á»i dÃ¹ng nghiá»‡m thu kÃ½ biÃªn báº£n Ä‘á»“ng Ã½. | ChÆ°a cháº¡y | Cáº£ 2 viewports<br>Critical<br>Chá» Staging Ä‘Ã³ng bÄƒng |
| **[UAT-02]** | Kiá»ƒm tra Ä‘iá»u kiá»‡n Ä‘Ã³ng Sprint vÃ  KÃ½ duyá»‡t Release Candidate (RC Sign-off) | EN-15<br>`AC-EN15-03` | ToÃ n bá»™ cÃ¡c háº¡ng má»¥c cÃ´ng viá»‡c Sprint 5 Ä‘Ã£ hoÃ n táº¥t | 1. QuÃ©t danh sÃ¡ch issue bug: xÃ¡c nháº­n 0 bug Critical/High cÃ²n má»Ÿ.<br>2. Kiá»ƒm tra hoÃ n thÃ nh Test Report Sprint 5 vÃ  User Guide 3 vai trÃ².<br>3. Tech Lead vÃ  QA Lead cÃ¹ng rÃ  soÃ¡t vÃ  Ä‘Ã¡nh dáº¥u Checklist RC táº¡i `docs/07-sprint5-demo-and-rc-checklist.md`. | ToÃ n bá»™ báº±ng chá»©ng | - Äá»§ Ä‘iá»u kiá»‡n kÃ½ duyá»‡t Release Candidate (GO).<br>- ToÃ n bá»™ 7 má»¥c trong checklist RC Ä‘Æ°á»£c Ä‘Ã¡nh dáº¥u hoÃ n thÃ nh. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng<br>Critical<br>Tá»•ng há»£p cuá»‘i sprint |

---

### PHáº¦N 8: EN-16 â€” Ká»ŠCH Báº¢N DEMO END-TO-END 4 PHÃ‚N Cáº¢NH (4 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[DEMO-01]** | **Demo PhÃ¢n cáº£nh 1:** Provider Ä‘Äƒng kÃ½, KYC, upload OpenAPI vÃ  ná»™p duyá»‡t | EN-16<br>`AC-EN16-01` | Háº¡ táº§ng Ä‘Ã£ khá»Ÿi Ä‘á»™ng (`docker compose up`). TÃ i khoáº£n Provider sáºµn sÃ ng | 1. ÄÄƒng nháº­p Provider ná»™p há»“ sÆ¡ KYC.<br>2. Admin duyá»‡t KYC sang `Verified`.<br>3. Provider táº¡o API má»›i, upload `valid-weather-openapi3.json`.<br>4. Cáº¥u hÃ¬nh gÃ³i Free & Pro, xÃ¡c minh DNS TXT $\to$ Báº¥m Submit for Review. | Ká»‹ch báº£n PhÃ¢n cáº£nh 1 trong `docs/07` | - API tá»± Ä‘á»™ng sinh 7 khá»‘i tÃ i liá»‡u OpenAPI.<br>- Chuyá»ƒn tráº¡ng thÃ¡i sang `Submitted`.<br>- Thá»i gian hoÃ n thÃ nh $\le 3$ phÃºt, khÃ´ng thao tÃ¡c sá»­a tay. | ChÆ°a cháº¡y | Desktop 1280x720<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[DEMO-02]** | **Demo PhÃ¢n cáº£nh 2:** Admin tháº©m Ä‘á»‹nh Dossier, xuáº¥t báº£n API vÃ  giÃ¡m sÃ¡t Audit Log | EN-16<br>`AC-EN16-02` | CÃ³ API á»Ÿ tráº¡ng thÃ¡i `Submitted` tá»« PhÃ¢n cáº£nh 1 | 1. Admin vÃ o API Reviews, kiá»ƒm tra Dossier (cáº£nh bÃ¡o báº£o máº­t, DNS).<br>2. Chuyá»ƒn tráº¡ng thÃ¡i: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.<br>3. Má»Ÿ Audit Logs xÃ¡c nháº­n váº¿t ghi. | Ká»‹ch báº£n PhÃ¢n cáº£nh 2 trong `docs/07` | - API xuáº¥t hiá»‡n cÃ´ng khai trÃªn Marketplace.<br>- Má»i bÆ°á»›c chuyá»ƒn tráº¡ng thÃ¡i Ä‘Æ°á»£c ghi váº¿t báº¥t biáº¿n trong Audit Log.<br>- Thá»i gian $\le 2$ phÃºt. | ChÆ°a cháº¡y | Desktop 1280x720<br>High<br>ChÆ°a cháº¡y (Sáºµn sÃ ng trÃªn develop) |
| **[DEMO-03]** | **Demo PhÃ¢n cáº£nh 3:** Consumer khÃ¡m phÃ¡ Marketplace, thá»­ Sandbox, mua gÃ³i & gá»i Gateway | EN-16<br>`AC-EN16-03` | API Weather Ä‘Ã£ Published. TÃ i khoáº£n Consumer sáºµn sÃ ng | 1. Guest xem Marketplace, tÃ¬m API.<br>2. ÄÄƒng nháº­p Consumer, gá»i thá»­ Playground quÃ¡ 5 lÆ°á»£t $\to$ Cháº·n 403 `SANDBOX_EXHAUSTED`.<br>3. Mua gÃ³i Pro qua Sandbox Checkout $\to$ KÃ­ch hoáº¡t `Active`.<br>4. Táº¡o key, láº¥y mÃ£ Code Gen, gá»­i request qua Gateway cá»•ng 3000. | Ká»‹ch báº£n PhÃ¢n cáº£nh 3 trong `docs/07` | - Cháº·n Ä‘Ãºng sau 5 lÆ°á»£t sandbox.<br>- Thanh toÃ¡n sandbox kÃ­ch hoáº¡t gÃ³i ngay.<br>- Gá»i Gateway nháº­n HTTP 200, cÃ³ header `x-gateway-overhead-ms`, quota trá»« nguyÃªn tá»­.<br>- Thá»i gian $\le 5$ phÃºt. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: PR #105) |
| **[DEMO-04]** | **Demo PhÃ¢n cáº£nh 4:** Usage, Cost Guard, Provider Analytics & ÄÃ¬nh chá»‰ vi pháº¡m | EN-16<br>`AC-EN16-04` | Consumer vá»«a gá»i Gateway á»Ÿ PhÃ¢n cáº£nh 3 | 1. Consumer vÃ o Usage Ä‘á»‘i soÃ¡t sá»‘ liá»‡u, xem Cost Guard cáº£nh bÃ¡o ngÃ¢n sÃ¡ch.<br>2. Provider vÃ o Analytics xem biá»ƒu Ä‘á»“ lÆ°u lÆ°á»£ng, top endpoint, doanh thu.<br>3. Admin xem Operations Health táº¡i `/admin/gateway`, thá»±c hiá»‡n Suspend API $\to$ Gateway cháº·n tá»©c thÃ¬ $\to$ Restore láº¡i. | Ká»‹ch báº£n PhÃ¢n cáº£nh 4 trong `docs/07` | - Äá»‘i soÃ¡t sá»‘ liá»‡u Usage vÃ  Cost Guard khá»›p 100%.<br>- Analytics hiá»ƒn thá»‹ biá»ƒu Ä‘á»“ vÃ  doanh thu chÃ­nh xÃ¡c.<br>- Gateway cháº·n vÃ  má»Ÿ tá»©c thÃ¬ khi Admin Suspend/Restore.<br>- Thá»i gian $\le 3$ phÃºt. | ChÆ°a cháº¡y | Desktop 1280x720<br>Critical<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: FE #23) |

---

### PHáº¦N 9: Tá»’N Äá»ŒNG SPRINT 4 â€” THEO DÃ•I Sá»¬A Lá»–I (1 TEST CASE)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tÃ¡c chi tiáº¿t & CÃ¢u truy váº¥n kiá»ƒm chá»©ng) | Test Data (Dá»¯ liá»‡u vÃ o) | Expected Output (Ká»³ vá»ng) | Actual Output | Viewport / Má»©c Æ°u tiÃªn / Tráº¡ng thÃ¡i |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[OVH-06-RETEST]** | Kiá»ƒm tra pháº£n há»“i Gateway Ä‘Ã­nh kÃ¨m header `X-Gateway-Overhead-Ms` (Kháº¯c phá»¥c BUG-S4-01 / DEV-S4-02) | US-23<br>`AC-S4-17`<br>(Refs #105) | NhÃ¡nh sá»­a lá»—i PR #105 (`codex/sprint4-qa-closeout`) Ä‘Æ°á»£c merge vÃ o `develop` | 1. Gá»­i request há»£p lá»‡ qua Gateway báº±ng cURL hoáº·c Playwright:<br>`fetch('http://localhost:3000/api/gateway/3/v1/products', { headers: { 'x-api-key': 'ak_live_...' } })`.<br>2. Kiá»ƒm tra toÃ n bá»™ response headers tráº£ vá» client.<br>3. So sÃ¡nh giÃ¡ trá»‹ header vá»›i sá»‘ ghi vÃ o cá»™t `gateway_overhead_ms` trong `usage_logs`. | Request há»£p lá»‡ qua Gateway | - Response cÃ³ header `x-gateway-overhead-ms`.<br>- GiÃ¡ trá»‹ header lÃ  sá»‘ nguyÃªn/thá»±c dÆ°Æ¡ng (ms) khá»›p chÃ­nh xÃ¡c vá»›i sá»‘ ghi trong database.<br>- Kháº¯c phá»¥c hoÃ n toÃ n `BUG-S4-01`. | ChÆ°a cháº¡y | KhÃ´ng Ã¡p dá»¥ng (API)<br>High<br>ChÆ°a cháº¡y (Phá»¥ thuá»™c: PR #105) |

---

## 3. HÆ¯á»šNG DáºªN THá»°C THI KIá»‚M THá»¬ Äá»I SOÃT 4 Táº¦NG (FOUR-TIER RECONCILIATION)

### 3.1. Äá»‘i soÃ¡t Cost Guard (TC-CST-04)
1. **Táº§ng 1 â€” UI:** Äá»c sá»‘ liá»‡u hiá»ƒn thá»‹ trÃªn mÃ n hÃ¬nh `http://localhost:5173/dashboard/cost-guard` (NgÃ¢n sÃ¡ch thÃ¡ng, Sá»‘ tiá»n Ä‘Ã£ dÃ¹ng, Pháº§n trÄƒm Ä‘Ã£ dÃ¹ng, Tráº¡ng thÃ¡i cáº£nh bÃ¡o).
2. **Táº§ng 2 â€” API JSON:** Gá»i `GET /api/consumer/cost-guard` vÃ  trÃ­ch xuáº¥t:
   ```json
   {
     "monthlyBudget": "30.00",
     "currency": "USD",
     "hardCutoff": true,
     "estimatedSpend": "0.60",
     "spentPercent": 2.0,
     "reachedThresholds": []
   }
   ```
3. **Táº§ng 3 â€” PostgreSQL:** Cháº¡y cÃ¢u lá»‡nh SQL CHá»ˆ Äá»ŒC (Read-Only) Ä‘á»ƒ Ä‘á»‘i soÃ¡t chi phÃ­:
   ```sql
   -- Äá»c cáº¥u hÃ¬nh ngÃ¢n sÃ¡ch
   SELECT consumer_id, currency, monthly_budget, hard_cutoff
   FROM cost_guard_budgets
   WHERE consumer_id = 2;

   -- TÃ­nh tá»•ng chi phÃ­ tá»« usage_logs Ä‘Ã£ flush trong thÃ¡ng UTC
   SELECT cost_currency, SUM(estimated_cost) AS total_logged_cost
   FROM usage_logs
   WHERE consumer_id = 2
     AND occurred_at >= date_trunc('month', CURRENT_TIMESTAMP)
   GROUP BY cost_currency;

   -- TÃ­nh tá»•ng chi phÃ­ tá»« usage_outbox Ä‘ang chá» flush
   SELECT cost_currency, SUM(estimated_cost) AS total_outbox_cost
   FROM usage_outbox
   WHERE consumer_id = 2
     AND occurred_at >= date_trunc('month', CURRENT_TIMESTAMP)
   GROUP BY cost_currency;
   ```
4. **Táº§ng 4 â€” Redis:** Kiá»ƒm tra counter quota liÃªn quan:
   ```bash
   redis-cli GET quota:<subscription_id>:<current_month_period>
   ```
$\to$ **Äiá»u kiá»‡n PASS:** Sá»‘ tiá»n trÃªn UI = `estimatedSpend` trÃªn API = $(\text{total\_logged\_cost} + \text{total\_outbox\_cost})$.

---

### 3.2. Äá»‘i soÃ¡t Provider Analytics (TC-ANL-07)
1. **Táº§ng 1 â€” UI:** Äá»c sá»‘ lÆ°á»£ng `Total Requests`, `Error Rate`, `Revenue` trÃªn `http://localhost:5173/provider/analytics`.
2. **Táº§ng 2 â€” API JSON:** Gá»i `GET /api/provider/analytics/overview?apiId=3&from=2026-11-01&to=2026-11-10`.
3. **Táº§ng 3 â€” PostgreSQL:** Cháº¡y cÃ¢u lá»‡nh SQL CHá»ˆ Äá»ŒC kiá»ƒm chá»©ng:
   ```sql
   -- Äáº¿m tá»•ng request tá»« báº£ng aggregate
   SELECT SUM(request_count) AS total_agg_requests,
          SUM(error_count) AS total_agg_errors
   FROM provider_daily_aggregates
   WHERE api_id = 3 AND usage_date BETWEEN '2026-11-01' AND '2026-11-10';

   -- Äáº¿m thá»±c táº¿ tá»« báº£ng log chi tiáº¿t
   SELECT COUNT(*) AS total_real_requests,
          COUNT(*) FILTER (WHERE status_code >= 400) AS total_real_errors
   FROM usage_logs
   WHERE api_id = 3 AND occurred_at::date BETWEEN '2026-11-01' AND '2026-11-10';

   -- Äá»c doanh thu phÃ¢n tÃ¡ch theo loáº¡i tiá»n
   SELECT currency, SUM(amount) AS total_revenue
   FROM provider_revenue_daily_aggregates
   WHERE api_id = 3 AND usage_date BETWEEN '2026-11-01' AND '2026-11-10'
   GROUP BY currency;
   ```
$\to$ **Äiá»u kiá»‡n PASS:** Khá»›p 100% giá»¯a sá»‘ liá»‡u tá»•ng há»£p trong DB, API vÃ  giao diá»‡n UI.
