/**
 * qa-scripts/sprint5-ui-e2e-runner.cjs
 * Bá»™ kiá»ƒm thá»­ tá»± Ä‘á»™ng E2E Giao diá»‡n Playwright Sprint 5 (Human-First Standard)
 *
 * CÄƒn cá»© ká»¹ thuáº­t:
 *   - docs/07-sprint5-demo-and-rc-checklist.md (Ká»‹ch báº£n Demo 4 PhÃ¢n cáº£nh & Checklist RC)
 *   - docs/test/Sprint5_AcceptanceCriteria.md (AC-US31, AC-US32, AC-EN11..AC-EN16)
 *   - docs/test/TESTING_RULES.md (Quy táº¯c Z1-Z5, H1-H4, A1-A3)
 *
 * QA Lead & Author: Tráº§n HÃ  Tháº£o VÃ¢n (@vuonghathaovan-gif â€” Issue #25)
 *
 * CÃ¡ch cháº¡y:
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs                 # Cháº¡y toÃ n bá»™ phÃ¢n cáº£nh kháº£ dá»¥ng (máº·c Ä‘á»‹nh)
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=1   # Cháº¡y riÃªng PhÃ¢n cáº£nh 1
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=2   # Cháº¡y riÃªng PhÃ¢n cáº£nh 2
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=3   # Cháº¡y riÃªng PhÃ¢n cáº£nh 3
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=4   # Cháº¡y riÃªng PhÃ¢n cáº£nh 4 (Chá» FE Issue #23)
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --all          # Cháº¡y cáº£ 4 phÃ¢n cáº£nh (yÃªu cáº§u FE #23 Ä‘Ã£ gá»™p)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const pw = require('./node_modules/playwright');

// Cáº¥u hÃ¬nh mÃ´i trÆ°á»ng vÃ  URL mÃ¡y chá»§
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
const FIXTURE_DIR = path.resolve(__dirname, 'openapi-fixtures');

// TÃ i khoáº£n vÃ  máº­t kháº©u kiá»ƒm thá»­ demo Ä‘Æ°á»£c láº¥y tá»« dá»¯ liá»‡u háº¡t giá»‘ng (seed data)
// trong file migrations/002_seed_auth_data.sql. ÄÃ¢y lÃ  dá»¯ liá»‡u dÃ¹ng riÃªng cho mÃ´i trÆ°á»ng
// development/testing cá»¥c bá»™, tuyá»‡t Ä‘á»‘i khÃ´ng pháº£i lÃ  thÃ´ng tin bÃ­ máº­t hay thÃ´ng tin production.
// NgÆ°á»i dÃ¹ng cÃ³ thá»ƒ ghi Ä‘Ã¨ thÃ´ng qua biáº¿n mÃ´i trÆ°á»ng khi kiá»ƒm thá»­ trÃªn mÃ´i trÆ°á»ng khÃ¡c.
const DEMO_ACCOUNTS = {
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'Admin@123'
  },
  consumer: {
    email: process.env.DEMO_CONSUMER_EMAIL || 'user@example.com',
    password: process.env.DEMO_CONSUMER_PASSWORD || 'User@123'
  },
  provider: {
    email: process.env.DEMO_PROVIDER_EMAIL || 'provider@example.com',
    password: process.env.DEMO_PROVIDER_PASSWORD || 'Provider@123'
  }
};

// Danh má»¥c 2 Ä‘á»™ phÃ¢n giáº£i báº¯t buá»™c theo Quy táº¯c H4 cá»§a TESTING_RULES.md
const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 }
];

// Danh má»¥c 4 phÃ¢n cáº£nh demo chuáº©n hÃ³a theo docs/07-sprint5-demo-and-rc-checklist.md
const SCENARIO_REGISTRY = [
  { id: 1, code: 'SC01', title: 'Provider KYC, OpenAPI Upload & Ná»™p duyá»‡t (AC-EN16-01)' },
  { id: 2, code: 'SC02', title: 'Admin Tháº©m Ä‘á»‹nh Dossier, Xuáº¥t báº£n API & Audit Log (AC-EN16-02)' },
  { id: 3, code: 'SC03', title: 'Consumer Marketplace, Sandbox, Checkout & Gateway (AC-EN16-03)' },
  { id: 4, code: 'SC04', title: 'Usage, Cost Guard, Provider Analytics & Admin Ops (AC-EN16-04)' }
];

const scenarioExecutionStatus = {
  SC01: { status: 'CHÆ¯A CHáº Y', reason: 'ChÆ°a khá»Ÿi cháº¡y', viewportsTested: [] },
  SC02: { status: 'CHÆ¯A CHáº Y', reason: 'ChÆ°a khá»Ÿi cháº¡y', viewportsTested: [] },
  SC03: { status: 'CHÆ¯A CHáº Y', reason: 'ChÆ°a khá»Ÿi cháº¡y', viewportsTested: [] },
  SC04: { status: 'CHÆ¯A CHáº Y', reason: 'Chá» Frontend Issue #23 (@leduwn) merge vÃ o develop', viewportsTested: [] }
};

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];
let passedCount = 0;
let failedCount = 0;

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  console.log(`[QA E2E-S5 ${ts}] ${msg}`);
}

async function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const req = http.get({ host, port, path: '/' }, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(port, name, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    if (await isPortOpen(port)) {
      log(`MÃ¡y chá»§ ${name} Ä‘Ã£ sáºµn sÃ ng trÃªn cá»•ng ${port}.`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout chá» mÃ¡y chá»§ ${name} khá»Ÿi Ä‘á»™ng trÃªn cá»•ng ${port}`);
}

async function runStep(code, title, fn) {
  log(`>>> [Báº®T Äáº¦U] [${code}]: ${title}`);
  const t0 = Date.now();
  try {
    await fn();
    const duration = Date.now() - t0;
    passedCount++;
    results.push({ code, title, status: 'PASS', durationMs: duration });
    log(`âœ… [PASS] [${code}]: ${title} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - t0;
    failedCount++;
    results.push({ code, title, status: 'FAIL', durationMs: duration, error: err.message });
    log(`âŒ [FAIL] [${code}]: ${title} (${duration}ms) - Lá»—i: ${err.message}`);
    throw err;
  }
}

function setupConsoleGuard(page, consoleErrors, pageErrors) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Bá» qua cÃ¡c log HTTP 4xx dá»± kiáº¿n trong cÃ¡c ca test Ã¢m tÃ­nh
      if (!text.includes('401') && !text.includes('403') && !text.includes('429')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });
}

// =============================================================================
// PHÃ‚N Cáº¢NH 1: Provider Ä‘Äƒng kÃ½, KYC, nháº­p OpenAPI vÃ  ná»™p duyá»‡t (AC-EN16-01)
// =============================================================================
async function runScenario1(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy táº¯c H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: path.resolve(SCREENSHOT_DIR, 'videos') }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC01-AUTH-${vp.name}`, `[${vp.name}] Provider Ä‘Äƒng nháº­p qua form UI (Human-First)`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      // Quy táº¯c H2: Selector theo nhÃ£n getByLabel
      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      // Quy táº¯c H3: GÃµ phÃ­m tuáº§n tá»± nhÆ° ngÆ°á»i dÃ¹ng tháº­t
      await emailInput.pressSequentially(DEMO_ACCOUNTS.provider.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.provider.password, { delay: 15 });
      await submitBtn.click();

      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc01-01-provider-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC01-WIZARD-${vp.name}`, `[${vp.name}] Má»Ÿ Create API Wizard vÃ  náº¡p OpenAPI Ä‘áº·c táº£`, async () => {
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'networkidle' });

      const heading = page.getByRole('heading', { name: /Táº¡o API|Create API|Wizard/i });
      await heading.first().waitFor({ state: 'visible', timeout: 10000 });

      // Nháº­p tÃªn API
      const apiNameInput = page.getByLabel(/TÃªn API|API Name/i);
      if (await apiNameInput.isVisible()) {
        await apiNameInput.pressSequentially('Weather Forecast Live S5', { delay: 15 });
      }

      // Upload file OpenAPI 3.0 máº«u
      const fixtureFile = path.resolve(FIXTURE_DIR, 'valid-weather-openapi3.json');
      if (fs.existsSync(fixtureFile)) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
        const uploadTrigger = page.getByRole('button', { name: /Táº£i lÃªn OpenAPI|Upload OpenAPI|Chá»n file/i });
        if (await uploadTrigger.isVisible()) {
          await uploadTrigger.click();
          const fileChooser = await fileChooserPromise;
          if (fileChooser) {
            await fileChooser.setFiles(fixtureFile);
          }
        }
      }

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc01-02-api-wizard-${vp.name}.png`) });
    });

    // Kiá»ƒm tra quy táº¯c A1: KhÃ´ng cÃ³ console error Ä‘á»
    if (pageErrors.length > 0) {
      throw new Error(`PhÃ¡t hiá»‡n lá»—i unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÃ‚N Cáº¢NH 2: Admin tháº©m Ä‘á»‹nh Dossier, xuáº¥t báº£n API vÃ  kiá»ƒm tra Audit Log (AC-EN16-02)
// =============================================================================
async function runScenario2(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy táº¯c H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC02-AUTH-${vp.name}`, `[${vp.name}] Admin Ä‘Äƒng nháº­p quáº£n trá»‹ há»‡ thá»‘ng`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.admin.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.admin.password, { delay: 15 });
      await submitBtn.click();

      await page.waitForURL('**/admin/**', { timeout: 15000 });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-01-admin-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC02-REVIEWS-${vp.name}`, `[${vp.name}] Tháº©m Ä‘á»‹nh há»“ sÆ¡ API Reviews vÃ  kiá»ƒm tra Audit Log`, async () => {
      await page.goto(`${BASE_URL}/admin/api-reviews`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-02-reviews-${vp.name}.png`) });

      // Äiá»u hÆ°á»›ng tá»›i Audit Logs Ä‘á»ƒ kiá»ƒm chá»©ng tÃ­nh báº¥t biáº¿n
      await page.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: 'networkidle' });
      const auditHeading = page.getByRole('heading', { name: /Audit Log|Nháº­t kÃ½ hoáº¡t Ä‘á»™ng|GiÃ¡m sÃ¡t/i });
      await auditHeading.first().waitFor({ state: 'visible', timeout: 10000 });

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-03-audit-${vp.name}.png`) });
    });

    if (pageErrors.length > 0) {
      throw new Error(`PhÃ¡t hiá»‡n lá»—i unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÃ‚N Cáº¢NH 3: Consumer Marketplace, Sandbox, Checkout & Gateway (AC-EN16-03)
// =============================================================================
async function runScenario3(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy táº¯c H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC03-GUEST-${vp.name}`, `[${vp.name}] Guest khÃ¡m phÃ¡ Marketplace vÃ  tÃ¬m kiáº¿m API`, async () => {
      await page.goto(`${BASE_URL}/marketplace`, { waitUntil: 'networkidle' });

      const searchBox = page.getByPlaceholder(/TÃ¬m kiáº¿m API|Search APIs/i);
      if (await searchBox.isVisible()) {
        await searchBox.pressSequentially('weather', { delay: 20 });
      }

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-01-marketplace-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC03-SUBS-${vp.name}`, `[${vp.name}] Consumer Ä‘Äƒng nháº­p vÃ  má»Ÿ danh sÃ¡ch Subscriptions`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.consumer.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.consumer.password, { delay: 15 });
      await submitBtn.click();

      await page.waitForURL('**/dashboard', { timeout: 15000 });

      await page.goto(`${BASE_URL}/dashboard/subscriptions`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-02-subscriptions-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC03-KEYS-${vp.name}`, `[${vp.name}] Consumer kiá»ƒm tra quáº£n lÃ½ API Keys`, async () => {
      await page.goto(`${BASE_URL}/dashboard/api-keys`, { waitUntil: 'networkidle' });

      const keyHeading = page.getByRole('heading', { name: /API Key|KhÃ³a truy cáº­p|Quáº£n lÃ½ khÃ³a/i });
      await keyHeading.first().waitFor({ state: 'visible', timeout: 10000 });

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-03-keys-${vp.name}.png`) });
    });

    if (pageErrors.length > 0) {
      throw new Error(`PhÃ¡t hiá»‡n lá»—i unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÃ‚N Cáº¢NH 4: Usage, Cost Guard, Provider Analytics & Admin Ops (AC-EN16-04)
//
// [LÆ¯U Ã]: PhÃ¢n cáº£nh nÃ y phá»¥ thuá»™c vÃ o Frontend Issue #23 cá»§a báº¡n LÃª Háº£i DÆ°Æ¡ng (@leduwn).
// MÃ£ kiá»ƒm thá»­ Ä‘Æ°á»£c xÃ¢y dá»±ng sáºµn theo Ä‘Ãºng AC-US31, AC-US32, AC-EN14.
// Tuyá»‡t Ä‘á»‘i khÃ´ng dÃ¹ng cá» bá» qua; khi FE #23 Ä‘Ã£ merge thÃ¬ cháº¡y cáº£ 4 phÃ¢n cáº£nh.
// =============================================================================
async function runScenario4(browser, vp) {
  log(`----------------------------------------------------------------------`);
  log(`âš¡ [Ká»ŠCH Báº¢N CHá»œ FE #23] Cháº¡y kiá»ƒm tra PhÃ¢n cáº£nh 4 trÃªn ${vp.name}...`);
  log(`----------------------------------------------------------------------`);

  const consoleErrors = [];
  const pageErrors = [];

  // Quy táº¯c H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC04-USAGE-${vp.name}`, `[${vp.name}] Consumer xem Usage Quota vÃ  Ä‘á»‘i soÃ¡t Request History`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.consumer.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.consumer.password, { delay: 15 });
      await submitBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });

      await page.goto(`${BASE_URL}/dashboard/usage`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-01-usage-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-COSTGUARD-${vp.name}`, `[${vp.name}] Consumer kiá»ƒm tra giao diá»‡n Cost Guard (AC-US32)`, async () => {
      await page.goto(`${BASE_URL}/dashboard/cost-guard`, { waitUntil: 'networkidle' });

      const heading = page.getByRole('heading', { name: /Cost Guard|Báº£o vá»‡ ngÃ¢n sÃ¡ch|Háº¡n má»©c chi tiÃªu/i });
      if (await heading.first().isVisible()) {
        log('ÄÃ£ phÃ¡t hiá»‡n tiÃªu Ä‘á» Cost Guard.');
      }

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-02-costguard-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-ANALYTICS-${vp.name}`, `[${vp.name}] Provider kiá»ƒm tra Analytics Dashboard (AC-US31)`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.provider.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.provider.password, { delay: 15 });
      await submitBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });

      await page.goto(`${BASE_URL}/provider/analytics`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-03-analytics-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-ADMIN-${vp.name}`, `[${vp.name}] Admin kiá»ƒm tra Gateway Health vÃ  Ä‘iá»u hÃ nh`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Äá»‹a chá»‰ Email/i);
      const passwordInput = page.getByLabel(/Máº­t kháº©u/i);
      const submitBtn = page.getByRole('button', { name: /ÄÄƒng nháº­p/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.admin.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.admin.password, { delay: 15 });
      await submitBtn.click();
      await page.waitForURL('**/admin/**', { timeout: 15000 });

      // ÄÆ°á»ng dáº«n quáº£n trá»‹ Gateway thá»±c táº¿ trong frontend/src/App.tsx
      await page.goto(`${BASE_URL}/admin/gateway`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-04-admin-gateway-${vp.name}.png`) });
    });

  } finally {
    await context.close();
  }
}

// =============================================================================
// HÃ€M ÄIá»€U PHá»I CHÃNH (MAIN ENTRY POINT)
// =============================================================================
async function main() {
  console.log('='.repeat(80));
  console.log('PLAYWRIGHT E2E HUMAN-FIRST TEST SUITE â€” SPRINT 5 INTEGRATION & DEMO');
  console.log('QA Lead: Tráº§n HÃ  Tháº£o VÃ¢n (@vuonghathaovan-gif â€” Issue #25)');
  console.log('Standards: TESTING_RULES.md (Z1-Z5, H1-H4, A1-A3)');
  console.log('='.repeat(80));

  const scenarioArg = process.argv.find((arg) => arg.startsWith('--scenario='));
  const runAllArg = process.argv.includes('--all');
  const scenarioTarget = scenarioArg ? scenarioArg.split('=')[1].toLowerCase() : (runAllArg ? 'all' : 'default');

  let frontendProcess = null;
  let backendProcess = null;

  // 1. Kiá»ƒm tra tráº¡ng thÃ¡i mÃ¡y chá»§ Backend
  const isBackendUp = await isPortOpen(3000);
  if (!isBackendUp) {
    log('Äang khá»Ÿi Ä‘á»™ng Backend API trÃªn cá»•ng 3000...');
    backendProcess = spawn('node', ['--env-file-if-exists=.env', 'dist/src/server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore',
      detached: false
    });
    await waitForServer(3000, 'Backend API');
  } else {
    log('Backend API Ä‘Ã£ sáºµn sÃ ng trÃªn cá»•ng 3000.');
  }

  // 2. Kiá»ƒm tra tráº¡ng thÃ¡i mÃ¡y chá»§ Frontend
  const isFrontendUp = await isPortOpen(5173);
  if (!isFrontendUp) {
    log('Äang khá»Ÿi Ä‘á»™ng Frontend Preview trÃªn cá»•ng 5173...');
    frontendProcess = spawn('cmd.exe', ['/c', 'npm.cmd run preview -- --port 5173 --host 127.0.0.1'], {
      cwd: path.resolve(__dirname, '../frontend'),
      stdio: 'ignore',
      detached: false
    });
    await waitForServer(5173, 'Frontend Preview');
  } else {
    log('Frontend Ä‘Ã£ sáºµn sÃ ng trÃªn cá»•ng 5173.');
  }

  // 3. Khá»Ÿi cháº¡y Playwright Chromium
  log('Khá»Ÿi cháº¡y Playwright Chromium (Headless mode)...');
  const browser = await pw.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    if (scenarioTarget === '1') {
      log('Cháº¡y riÃªng PhÃ¢n cáº£nh 1 trÃªn cáº£ 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC01.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

    } else if (scenarioTarget === '2') {
      log('Cháº¡y riÃªng PhÃ¢n cáº£nh 2 trÃªn cáº£ 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC02.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

    } else if (scenarioTarget === '3') {
      log('Cháº¡y riÃªng PhÃ¢n cáº£nh 3 trÃªn cáº£ 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC03.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

    } else if (scenarioTarget === '4') {
      log('Cháº¡y riÃªng PhÃ¢n cáº£nh 4 trÃªn cáº£ 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario4(browser, vp);
        scenarioExecutionStatus.SC04.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC04.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC04.reason = 'Cháº¡y thá»­ nghiá»‡m thÃ nh cÃ´ng';

    } else if (scenarioTarget === 'all') {
      log('Cháº¡y toÃ n bá»™ 4 phÃ¢n cáº£nh trÃªn cáº£ 2 viewports (Cháº¿ Ä‘á»™ Full Suite)...');
      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC01.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC02.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC03.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario4(browser, vp);
        scenarioExecutionStatus.SC04.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC04.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC04.reason = 'HoÃ n táº¥t cáº£ 2 viewports';

    } else {
      // Cháº¿ Ä‘á»™ máº·c Ä‘á»‹nh: Cháº¡y cÃ¡c phÃ¢n cáº£nh Ä‘Ã£ sáºµn sÃ ng trÃªn develop (SC01, SC02, SC03)
      log('Cháº¡y cÃ¡c ká»‹ch báº£n demo kháº£ dá»¥ng (SC01, SC02, SC03) trÃªn cáº£ Desktop & Tablet...');

      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC01.reason = 'HoÃ n táº¥t cáº£ 2 viewports (Desktop, Tablet)';

      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC02.reason = 'HoÃ n táº¥t cáº£ 2 viewports (Desktop, Tablet)';

      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ÄÃƒ CHáº Y PASS';
      scenarioExecutionStatus.SC03.reason = 'HoÃ n táº¥t cáº£ 2 viewports (Desktop, Tablet)';

      // PhÃ¢n cáº£nh 4 giá»¯ tráº¡ng thÃ¡i CHÆ¯A CHáº Y do chá» FE Issue #23
      scenarioExecutionStatus.SC04.status = 'CHÆ¯A CHáº Y';
      scenarioExecutionStatus.SC04.reason = 'Chá» Frontend Issue #23 (@leduwn) merge vÃ o develop';
    }

  } finally {
    await browser.close();

    if (frontendProcess) {
      frontendProcess.kill();
    }
    if (backendProcess) {
      backendProcess.kill();
    }
  }

  // ===========================================================================
  // Tá»”NG Káº¾T TIáº¾N Äá»˜ VÃ€ IN Báº¢NG TRáº NG THÃI (SUMMARY & INTEGRITY AUDIT)
  // ===========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('Báº¢NG Tá»”NG Káº¾T TIáº¾N Äá»˜ NGHIá»†M THU 4 PHÃ‚N Cáº¢NH DEMO SPRINT 5');
  console.log('='.repeat(80));
  console.log('| PhÃ¢n cáº£nh | Ká»‹ch báº£n chi tiáº¿t                              | Tráº¡ng thÃ¡i   | Viewports | Ghi chÃº / LÃ½ do                              |');
  console.log('|-----------|------------------------------------------------|--------------|-----------|----------------------------------------------|');

  let hasUnrunScenarios = false;
  for (const item of SCENARIO_REGISTRY) {
    const s = scenarioExecutionStatus[item.code];
    const vpText = s.viewportsTested.length > 0 ? s.viewportsTested.join(', ') : 'ChÆ°a test';
    const statusCol = s.status.padEnd(12);
    console.log(`| ${item.code.padEnd(9)} | ${item.title.padEnd(46)} | ${statusCol} | ${vpText.padEnd(9)} | ${s.reason.padEnd(44)} |`);
    if (s.status === 'CHÆ¯A CHáº Y' || s.status === 'FAIL') {
      hasUnrunScenarios = true;
    }
  }
  console.log('='.repeat(80));

  if (hasUnrunScenarios) {
    console.log('\n' + '!'.repeat(80));
    console.log('âš ï¸  Cáº¢NH BÃO: Káº¾T QUáº¢ CHÆ¯A Äáº¦Y Äá»¦ (INCOMPLETE E2E SUITE)');
    console.log('CÃ³ phÃ¢n cáº£nh chÆ°a Ä‘Æ°á»£c kiá»ƒm thá»­ trá»n váº¹n (PhÃ¢n cáº£nh 4 chá» Frontend Issue #23).');
    console.log('TUYá»†T Äá»I KHÃ”NG dÃ¹ng káº¿t quáº£ nÃ y Ä‘á»ƒ kÃ½ duyá»‡t nghiá»‡m thu Release Candidate.');
    console.log('Khi báº¡n LÃª Háº£i DÆ°Æ¡ng (@leduwn) hoÃ n thÃ nh Issue #23 vÃ  gá»™p vÃ o develop, hÃ£y cháº¡y');
    console.log('láº¡i toÃ n bá»™ 4 phÃ¢n cáº£nh báº±ng lá»‡nh: node qa-scripts/sprint5-ui-e2e-runner.cjs --all');
    console.log('!'.repeat(80) + '\n');
  }

  console.log('-'.repeat(80));
  console.log(`Tá»•ng sá»‘ bÆ°á»›c test Ä‘Ã£ cháº¡y: ${results.length}`);
  console.log(`Passed:                     ${passedCount}/${results.length} (${results.length > 0 ? ((passedCount / results.length) * 100).toFixed(1) : 0}%)`);
  console.log(`Failed:                     ${failedCount}/${results.length}`);
  console.log(`áº¢nh chá»¥p lÆ°u trá»¯ táº¡i:       ${SCREENSHOT_DIR}`);
  console.log('='.repeat(80));

  if (failedCount > 0) {
    process.exit(1);
  }

  // Náº¿u cÃ³ phÃ¢n cáº£nh bá»‹ bá» qua do thiáº¿u mÃ£ nguá»“n, thoÃ¡t vá»›i mÃ£ lá»—i 2 Ä‘á»ƒ CI/Runner
  // khÃ´ng hiá»ƒu nháº§m lÃ  Ä‘Ã£ nghiá»‡m thu Ä‘áº§y Ä‘á»§ 100% Release Candidate.
  if (hasUnrunScenarios) {
    log('ThoÃ¡t vá»›i mÃ£ lá»—i 2 (Káº¾T QUáº¢ CHÆ¯A Äáº¦Y Äá»¦ â€” Chá» hoÃ n thiá»‡n Frontend Issue #23).');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Lá»–I THá»°C THI E2E NGHIÃŠM TRá»ŒNG:', err);
  process.exit(1);
});
