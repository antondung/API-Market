# API-MARKET Sprint 3 Frontend QA - Defect Findings & Remediation Report

**Branch:** `feature/sprint3-frontend-marketplace`
**Date:** 2026-10-25
**Audit Scope:** 18 Phases of Comprehensive Frontend QA

---

## 1. Summary of Identified Defects & Remediations

| ID | Category | Severity | File(s) Affected | Description | Remediation Applied | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Visual / Responsive | High | `frontend/src/pages/marketplace/ApiDetailPage.tsx` | Horizontal overflow on viewports <400px (iPhone SE 320px, Galaxy S20 360px, iPhone Mini 375px, iPhone 14 390px) | Converted quick action container from `flex flex-row` to `flex flex-wrap lg:flex-col gap-3` | VERIFIED PASS (0px overflow on all 10 viewports) |
| **DEF-02** | Accessibility (WCAG 2.2) | High | `MarketplacePage.tsx`<br>`ApiPlaygroundPage.tsx`<br>`TrySandboxPage.tsx`<br>`ApiDetailPage.tsx` | Axe-core flagged `select-name` critical violation on dropdowns lacking accessible labels | Added explicit `id`, `<label htmlFor="...">`, and `aria-label` attributes to all form controls | VERIFIED PASS (0 critical, 0 serious violations across all 5 routes) |
| **DEF-03** | E2E Stability | Medium | `qa-scripts/sprint3-frontend/tests/07-compare-apis.spec.ts` | Strict mode locator collision: `getByText('Không')` matched both legal table cell and footer column heading | Scoped locator to `page.getByRole('cell', { name: /Không/i })` and `page.getByRole('cell', { name: /Có/i })` | VERIFIED PASS (0 collisions) |
| **DEF-04** | E2E Stability | Medium | `qa-scripts/sprint3-frontend/tests/08-navigation-layout.spec.ts` | Strict mode collision on mobile viewports for desktop navbar items | Added responsive branching to verify mobile hamburger button and drawer navigation | VERIFIED PASS across all desktop, tablet, and mobile viewports |
| **DEF-05** | E2E / Invariant | Low | `qa-scripts/sprint3-frontend/tests/12-network-resilience.spec.ts` | Mock route URLs used alphanumeric slugs (`service-down-api`) rejected client-side by numeric ID validator | Updated mock IDs to valid numeric strings (`'500'`, `'502'`, `'503'`) adhering to `/^[1-9][0-9]{0,9}$/` | VERIFIED PASS |
| **DEF-06** | E2E Performance | Low | `qa-scripts/sprint3-frontend/tests/14-performance-resource-budgets.spec.ts` | Locator `getByRole('link', { name: 'Hệ thống 1' })` matched both 'Hệ thống 1' and 'Hệ thống 17' | Added `{ exact: true }` parameter to prevent prefix collisions | VERIFIED PASS |

---

## 2. Detailed Defect Analysis & Source Diff

### DEF-01: Mobile Viewport Horizontal Overflow on API Detail Page
- **Symptoms:** At 320x568 (iPhone SE), `scrollWidth` measured 412px, exceeding `window.innerWidth` (320px) by 92px.
- **Root Cause:** In [frontend/src/pages/marketplace/ApiDetailPage.tsx](frontend/src/pages/marketplace/ApiDetailPage.tsx), the Quick Action button group used `flex flex-row` with 3 non-shrinkable buttons ("Test in Playground", "Try Sandbox", "Compare API"). On viewports below 400px, the combined minimum width pushed the parent container wider than the viewport.
- **Diff Applied:**
```diff
- <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0">
+ <div className="flex flex-wrap lg:flex-col gap-3 flex-shrink-0">
```
- **Result:** Fully resolved across all 10 responsive viewports (320px to 1920px). `scrollWidth === window.innerWidth` across all tested viewports.

---

### DEF-02: Axe-Core Critical Form Control Violations (`select-name`)
- **Symptoms:** Automated axe-core WCAG 2.2 AA audit reported critical `select-name` violations on 4 pages:
  1. `/marketplace`: Page size selector (`<select value={urlPageSize}>`)
  2. `/api/:id/playground`: Endpoint selector dropdown
  3. `/api/:id/try-sandbox`: Step 1 endpoint selector dropdown
  4. `/api/:id` (Modal): Report violation category selector dropdown
- **Root Cause:** Form `<select>` controls were rendered without `<label htmlFor="...">` bindings or explicit `aria-label` attributes.
- **Remediation:**
  - Added `aria-label={t('Số mục mỗi trang') || 'Số mục mỗi trang'}` in [MarketplacePage.tsx](frontend/src/pages/marketplace/MarketplacePage.tsx#L529).
  - Added `id="playground-endpoint-select"` and `aria-label={t('Select Endpoint') || 'Select Endpoint'}` in [ApiPlaygroundPage.tsx](frontend/src/pages/marketplace/ApiPlaygroundPage.tsx#L254).
  - Added `id="sandbox-endpoint-select"` and `aria-label={t('Chọn Endpoint kiểm thử') || 'Chọn Endpoint kiểm thử'}` in [TrySandboxPage.tsx](frontend/src/pages/marketplace/TrySandboxPage.tsx#L173).
  - Added `id="report-category-select"` and `aria-label={t('Danh mục vi phạm') || 'Danh mục vi phạm'}` in [ApiDetailPage.tsx](frontend/src/pages/marketplace/ApiDetailPage.tsx#L542).
- **Result:** 0 Critical and 0 Serious violations on all audited pages.

---

### DEF-03: Playwright Strict Mode Collisions in Comparison & Navigation
- **Symptoms:** Tests failed when selecting text elements like `'Không'` or `'Khám phá API'` due to duplicate DOM matches in footer links and navigation menus.
- **Root Cause:** Unscoped text selectors (`page.getByText('Không')`) resolved to both the 3-state legal table cell and the footer heading `"Không gian làm việc"`.
- **Remediation:** Scoped assertions to explicit semantic containers:
```typescript
await expect(page.getByRole('cell', { name: /Không/i })).toBeVisible();
await expect(page.getByRole('cell', { name: /Có/i })).toBeVisible();
```
- **Result:** Reliable, deterministic E2E assertions with 100% pass rate.

---

## 3. Honest Sprint 4 Backend Boundary Verifications

In strict accordance with audit guidelines, features pending Sprint 4 backend integration are verified as honest disabled states, with zero synthetic successes:

1. **Live Subscriptions (`/checkout`):**
   - Verified that subscription activation button is visibly marked as disabled awaiting Sprint 4 gateway integration.
   - Verified that zero fake mutations or simulated payment completions are executed.
2. **Proxy Live Upstream Execution (`/api/:id/try-sandbox`):**
   - Verified that sandbox live test execution is honestly disabled with an explicit indicator that upstream execution requires Sprint 4 backend proxy.
3. **CSPRNG Key Issuance (`/consumer/api-keys`):**
   - Verified that no client-side pseudo-random keys are generated or stored in browser storage.
4. **Annual Payment Billing Discount (`/pricing`):**
   - Verified that annual billing toggle button is disabled with notice awaiting Sprint 4 billing engine.
   - Verified exact monthly price is rendered without artificial discounts.
