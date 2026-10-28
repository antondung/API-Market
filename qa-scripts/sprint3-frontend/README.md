# API-MARKET Sprint 3 Frontend QA Test Suite

Automated E2E, visual regression, accessibility (WCAG 2.2 AA), animation, network resilience, security, and performance test suite for API-MARKET Sprint 3 Frontend Marketplace.

---

## 1. Directory Structure

```
qa-scripts/sprint3-frontend/
├── fixtures/
│   └── mockData.ts               # Authoritative mock catalog, detail, endpoints, pricing, reviews
├── helpers/
│   └── routeInterceptors.ts       # Route interception & mock handlers without shadowing
├── tests/
│   ├── 01-marketplace.spec.ts    # Phase 3: Catalog, search, filters, pagination, race conditions
│   ├── 02-api-detail.spec.ts     # Phase 4: API detail, versions, tabs, 404/429/500 handlers
│   ├── 03-api-playground.spec.ts # Phase 5: Playground, POSIX snippet generator, key masking
│   ├── 04-try-sandbox.spec.ts    # Phase 5: Guided sandbox wizard, Sprint 4 disabled upstream
│   ├── 05-pricing.spec.ts        # Phase 6: Monthly fee integrity, grounded matrix, 429/500 retry
│   ├── 06-checkout.spec.ts       # Phase 6: Checkout gateway, login redirect, honest disabled pay
│   ├── 07-compare-apis.spec.ts   # Phase 7: 2-API compare, self-compare guard, 3-state legal
│   ├── 08-navigation-layout.spec.ts # Phase 8: Desktop navbar, SPA transitions, i18n switcher
│   ├── 09-responsive-viewports.spec.ts # Phase 8: 10 viewports x 3 pages overflow checks
│   ├── 10-motion-animation.spec.ts # Phase 9: Stagger grid, tab sliding pill, reduced-motion
│   ├── 11-accessibility-wcag.spec.ts # Phase 11: Axe-core audit, keyboard journey, modal traps
│   ├── 12-network-resilience.spec.ts # Phase 12: Offline recovery, 503 errors, malformed HTML
│   ├── 13-security-data-integrity.spec.ts # Phase 13: Secret masking, anti-SSRF, memory wipe
│   └── 14-performance-resource-budgets.spec.ts # Phase 10: CLS < 0.05, code splitting, leak check
├── playwright.config.ts          # Playwright config with Vite preview webServer & 7 projects
├── run-smoke.ps1                 # Smoke test runner (@smoke)
├── run-functional.ps1            # Functional test runner (Phases 1-8)
├── run-visual.ps1                # Responsive & visual test runner (Phase 8/9)
├── run-a11y.ps1                  # Accessibility WCAG 2.2 test runner (Phase 11)
├── run-full.ps1                  # Full comprehensive test runner (101 tests)
├── TEST_MATRIX.md                # Complete 18-phase execution matrix
└── FINDINGS.md                   # Audit defect findings & remediation report
```

---

## 2. Quick Start & Execution Commands

### Prerequisites
- Node.js v20+
- Installed dependencies in `frontend/` and `qa-scripts/`
- Production build built via `npm --prefix ../frontend run build`

### PowerShell Runners (Recommended)
From `qa-scripts/`:

```powershell
# 1. Run smoke tests (13 tests on Chromium)
.\sprint3-frontend\run-smoke.ps1

# 2. Run functional suites (Phases 1 to 8)
.\sprint3-frontend\run-functional.ps1

# 3. Run visual and responsive matrix (10 viewports x 3 routes)
.\sprint3-frontend\run-visual.ps1

# 4. Run WCAG 2.2 AA accessibility audit
.\sprint3-frontend\run-a11y.ps1

# 5. Run full test suite (101 tests)
.\sprint3-frontend\run-full.ps1 -Project chromium
```

### npm Script Shortcuts
From `qa-scripts/`:

```bash
npm run qa:sprint3:smoke
npm run qa:sprint3:functional
npm run qa:sprint3:visual
npm run qa:sprint3:a11y
npm run qa:sprint3:full
```

### Cross-Browser Testing
```bash
# Run smoke tests across Chromium, Firefox, and WebKit
npx playwright test --grep "@smoke" --project=chromium --project=firefox --project=webkit --config=sprint3-frontend/playwright.config.ts

# Run on mobile and tablet projects
npx playwright test --project=mobile-chromium --project=tablet-chromium --config=sprint3-frontend/playwright.config.ts

# Run reduced motion and dark theme tests
npx playwright test --project=reduced-motion --project=dark-theme --config=sprint3-frontend/playwright.config.ts
```

---

## 3. Key Invariants Enforced

1. **Client-Side Numeric ID Invariant:** Validates `/^[1-9][0-9]{0,9}$/` and `<= 2147483647`. Strings like `service-down-api` are rejected with 404 client-side before dispatching network requests.
2. **Three-State Legal Invariant:** Data processing and cross-border transfer metadata strictly render:
   - `true` -> "Có" (Checkmark badge)
   - `false` -> "Không" (Cross badge)
   - `null` / `undefined` -> "Chưa công bố" (Neutral badge)
3. **Honest Sprint 4 Disabled States:**
   - Subscriptions awaiting Sprint 4 gateway are rendered with disabled buttons.
   - Upstream proxy execution in Sandbox is honestly marked unavailable.
   - Annual billing discounts (20%) are not artificially displayed until backend billing engine ships.
4. **Zero Horizontal Overflow:** Guaranteed `scrollWidth <= window.innerWidth` across all 10 responsive viewport breakpoints (320px to 1920px).
5. **Zero Critical/Serious WCAG 2.2 Violations:** Guaranteed through automated axe-core audits across all core marketplace pages.
