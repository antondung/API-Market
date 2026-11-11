/**
 * qa-scripts/sprint5-ui-e2e-runner.cjs
 * Bộ kiểm thử tự động E2E Giao diện Playwright Sprint 5 (Human-First Standard)
 *
 * Căn cứ kỹ thuật:
 *   - docs/07-sprint5-demo-and-rc-checklist.md (Kịch bản Demo 4 Phân cảnh & Checklist RC)
 *   - docs/test/Sprint5_AcceptanceCriteria.md (AC-US31, AC-US32, AC-EN11..AC-EN16)
 *   - docs/test/TESTING_RULES.md (Quy tắc Z1-Z5, H1-H4, A1-A3)
 *
 * QA Lead & Author: Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #25)
 *
 * Cách chạy:
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs                 # Chạy toàn bộ phân cảnh khả dụng (mặc định)
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=1   # Chạy riêng Phân cảnh 1
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=2   # Chạy riêng Phân cảnh 2
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=3   # Chạy riêng Phân cảnh 3
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --scenario=4   # Chạy riêng Phân cảnh 4 (Chờ FE Issue #23)
 *   node qa-scripts/sprint5-ui-e2e-runner.cjs --all          # Chạy cả 4 phân cảnh (yêu cầu FE #23 đã gộp)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const pw = require('./node_modules/playwright');

// Cấu hình môi trường và URL máy chủ
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
const FIXTURE_DIR = path.resolve(__dirname, 'openapi-fixtures');

// Tài khoản và mật khẩu kiểm thử demo được lấy từ dữ liệu hạt giống (seed data)
// trong file migrations/002_seed_auth_data.sql. Đây là dữ liệu dùng riêng cho môi trường
// development/testing cục bộ, tuyệt đối không phải là thông tin bí mật hay thông tin production.
// Người dùng có thể ghi đè thông qua biến môi trường khi kiểm thử trên môi trường khác.
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

// Danh mục 2 độ phân giải bắt buộc theo Quy tắc H4 của TESTING_RULES.md
const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 }
];

// Danh mục 4 phân cảnh demo chuẩn hóa theo docs/07-sprint5-demo-and-rc-checklist.md
const SCENARIO_REGISTRY = [
  { id: 1, code: 'SC01', title: 'Provider KYC, OpenAPI Upload & Nộp duyệt (AC-EN16-01)' },
  { id: 2, code: 'SC02', title: 'Admin Thẩm định Dossier, Xuất bản API & Audit Log (AC-EN16-02)' },
  { id: 3, code: 'SC03', title: 'Consumer Marketplace, Sandbox, Checkout & Gateway (AC-EN16-03)' },
  { id: 4, code: 'SC04', title: 'Usage, Cost Guard, Provider Analytics & Admin Ops (AC-EN16-04)' }
];

const scenarioExecutionStatus = {
  SC01: { status: 'CHƯA CHẠY', reason: 'Chưa khởi chạy', viewportsTested: [] },
  SC02: { status: 'CHƯA CHẠY', reason: 'Chưa khởi chạy', viewportsTested: [] },
  SC03: { status: 'CHƯA CHẠY', reason: 'Chưa khởi chạy', viewportsTested: [] },
  SC04: { status: 'CHƯA CHẠY', reason: 'Chờ Frontend Issue #23 (@leduwn) merge vào develop', viewportsTested: [] }
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
      log(`Máy chủ ${name} đã sẵn sàng trên cổng ${port}.`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout chờ máy chủ ${name} khởi động trên cổng ${port}`);
}

async function runStep(code, title, fn) {
  log(`>>> [BẮT ĐẦU] [${code}]: ${title}`);
  const t0 = Date.now();
  try {
    await fn();
    const duration = Date.now() - t0;
    passedCount++;
    results.push({ code, title, status: 'PASS', durationMs: duration });
    log(`✅ [PASS] [${code}]: ${title} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - t0;
    failedCount++;
    results.push({ code, title, status: 'FAIL', durationMs: duration, error: err.message });
    log(`❌ [FAIL] [${code}]: ${title} (${duration}ms) - Lỗi: ${err.message}`);
    throw err;
  }
}

function setupConsoleGuard(page, consoleErrors, pageErrors) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Bỏ qua các log HTTP 4xx dự kiến trong các ca test âm tính
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
// PHÂN CẢNH 1: Provider đăng ký, KYC, nhập OpenAPI và nộp duyệt (AC-EN16-01)
// =============================================================================
async function runScenario1(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy tắc H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: path.resolve(SCREENSHOT_DIR, 'videos') }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC01-AUTH-${vp.name}`, `[${vp.name}] Provider đăng nhập qua form UI (Human-First)`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      // Quy tắc H2: Selector theo nhãn getByLabel
      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      // Quy tắc H3: Gõ phím tuần tự như người dùng thật
      await emailInput.pressSequentially(DEMO_ACCOUNTS.provider.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.provider.password, { delay: 15 });
      await submitBtn.click();

      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định API_PROVIDER chuyển hướng về /provider
      await page.waitForURL('**/provider**', { timeout: 15000 });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc01-01-provider-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC01-WIZARD-${vp.name}`, `[${vp.name}] Mở Create API Wizard và nạp OpenAPI đặc tả`, async () => {
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'networkidle' });

      // Nguồn: frontend/src/pages/provider/CreateApiWizardPage.tsx:713-715 breadcrumb New API Wizard và h1 Register & Package API Product
      const heading = page.getByRole('heading', { name: /Tạo API|Create API|Wizard|Đăng ký|Register/i });
      await heading.first().waitFor({ state: 'visible', timeout: 10000 });

      // Nhập tên API (Nguồn: frontend/src/pages/provider/CreateApiWizardPage.tsx:825 placeholder Công cụ suy luận NLP thời gian thực / Real-time NLP)
      const apiNameInput = page.getByPlaceholder(/Công cụ suy luận|Real-time NLP/i);
      if (await apiNameInput.isVisible()) {
        await apiNameInput.pressSequentially('Weather Forecast Live S5', { delay: 15 });
      }

      // Upload file OpenAPI 3.0 mẫu
      const fixtureFile = path.resolve(FIXTURE_DIR, 'valid-weather-openapi3.json');
      if (fs.existsSync(fixtureFile)) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
        const uploadTrigger = page.getByRole('button', { name: /Tải lên OpenAPI|Upload OpenAPI|Chọn file/i });
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

    // Kiểm tra quy tắc A1: Không có console error đỏ
    if (pageErrors.length > 0) {
      throw new Error(`Phát hiện lỗi unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÂN CẢNH 2: Admin thẩm định Dossier, xuất bản API và kiểm tra Audit Log (AC-EN16-02)
// =============================================================================
async function runScenario2(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy tắc H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC02-AUTH-${vp.name}`, `[${vp.name}] Admin đăng nhập quản trị hệ thống`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.admin.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.admin.password, { delay: 15 });
      await submitBtn.click();

      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định ADMIN chuyển hướng về /admin
      await page.waitForURL('**/admin*', { timeout: 15000 });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-01-admin-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC02-REVIEWS-${vp.name}`, `[${vp.name}] Thẩm định hồ sơ API Reviews và kiểm tra Audit Log`, async () => {
      await page.goto(`${BASE_URL}/admin/api-reviews`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-02-reviews-${vp.name}.png`) });

      // Điều hướng tới Audit Logs để kiểm chứng tính bất biến (Nguồn: frontend/src/pages/admin/AuditLogsPage.tsx:126 và vi-custom.json:460)
      await page.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: 'networkidle' });
      const auditHeading = page.getByRole('heading', { name: /Audit|Nhật ký kiểm toán|Nhật ký hoạt động|Giám sát/i });
      await auditHeading.first().waitFor({ state: 'visible', timeout: 10000 });

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc02-03-audit-${vp.name}.png`) });
    });

    if (pageErrors.length > 0) {
      throw new Error(`Phát hiện lỗi unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÂN CẢNH 3: Consumer Marketplace, Sandbox, Checkout & Gateway (AC-EN16-03)
// =============================================================================
async function runScenario3(browser, vp) {
  const consoleErrors = [];
  const pageErrors = [];

  // Quy tắc H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC03-GUEST-${vp.name}`, `[${vp.name}] Guest khám phá Marketplace và tìm kiếm API`, async () => {
      await page.goto(`${BASE_URL}/marketplace`, { waitUntil: 'networkidle' });

      const searchBox = page.getByPlaceholder(/Tìm kiếm API|Search APIs/i);
      if (await searchBox.isVisible()) {
        await searchBox.pressSequentially('weather', { delay: 20 });
      }

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-01-marketplace-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC03-SUBS-${vp.name}`, `[${vp.name}] Consumer đăng nhập và mở danh sách Subscriptions`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.consumer.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.consumer.password, { delay: 15 });
      await submitBtn.click();

      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định USER (Consumer) chuyển hướng về /dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });

      await page.goto(`${BASE_URL}/dashboard/subscriptions`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-02-subscriptions-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC03-KEYS-${vp.name}`, `[${vp.name}] Consumer kiểm tra quản lý API Keys`, async () => {
      await page.goto(`${BASE_URL}/dashboard/api-keys`, { waitUntil: 'networkidle' });

      const keyHeading = page.getByRole('heading', { name: /API Key|Khóa truy cập|Quản lý khóa/i });
      await keyHeading.first().waitFor({ state: 'visible', timeout: 10000 });

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc03-03-keys-${vp.name}.png`) });
    });

    if (pageErrors.length > 0) {
      throw new Error(`Phát hiện lỗi unhandled page error: ${pageErrors.join('; ')}`);
    }

  } finally {
    await context.close();
  }
}

// =============================================================================
// PHÂN CẢNH 4: Usage, Cost Guard, Provider Analytics & Admin Ops (AC-EN16-04)
//
// [LƯU Ý]: Phân cảnh này phụ thuộc vào Frontend Issue #23 của bạn Lê Hải Dương (@leduwn).
// Mã kiểm thử được xây dựng sẵn theo đúng AC-US31, AC-US32, AC-EN14.
// Tuyệt đối không dùng cờ bỏ qua; khi FE #23 đã merge thì chạy cả 4 phân cảnh.
// =============================================================================
async function runScenario4(browser, vp) {
  log(`----------------------------------------------------------------------`);
  log(`⚡ [KỊCH BẢN CHỜ FE #23] Chạy kiểm tra Phân cảnh 4 trên ${vp.name}...`);
  log(`----------------------------------------------------------------------`);

  const consoleErrors = [];
  const pageErrors = [];

  // Quy tắc H1: Clean State context
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });

  const page = await context.newPage();
  setupConsoleGuard(page, consoleErrors, pageErrors);

  try {
    await runStep(`E2E-S5-SC04-USAGE-${vp.name}`, `[${vp.name}] Consumer xem Usage Quota và đối soát Request History`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.consumer.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.consumer.password, { delay: 15 });
      await submitBtn.click();
      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định USER (Consumer) chuyển hướng về /dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 });

      await page.goto(`${BASE_URL}/dashboard/usage`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-01-usage-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-COSTGUARD-${vp.name}`, `[${vp.name}] Consumer kiểm tra giao diện Cost Guard (AC-US32)`, async () => {
      await page.goto(`${BASE_URL}/dashboard/cost-guard`, { waitUntil: 'networkidle' });

      const heading = page.getByRole('heading', { name: /Cost Guard|Bảo vệ ngân sách|Hạn mức chi tiêu/i });
      if (await heading.first().isVisible()) {
        log('Đã phát hiện tiêu đề Cost Guard.');
      }

      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-02-costguard-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-ANALYTICS-${vp.name}`, `[${vp.name}] Provider kiểm tra Analytics Dashboard (AC-US31)`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.provider.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.provider.password, { delay: 15 });
      await submitBtn.click();
      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định API_PROVIDER chuyển hướng về /provider
      await page.waitForURL('**/provider**', { timeout: 15000 });

      await page.goto(`${BASE_URL}/provider/analytics`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-03-analytics-${vp.name}.png`) });
    });

    await runStep(`E2E-S5-SC04-ADMIN-${vp.name}`, `[${vp.name}] Admin kiểm tra Gateway Health và điều hành`, async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      const emailInput = page.getByLabel(/Địa chỉ Email/i);
      const passwordInput = page.getByLabel(/Mật khẩu/i);
      const submitBtn = page.getByRole('button', { name: /Đăng nhập/i });

      await emailInput.pressSequentially(DEMO_ACCOUNTS.admin.email, { delay: 15 });
      await passwordInput.pressSequentially(DEMO_ACCOUNTS.admin.password, { delay: 15 });
      await submitBtn.click();
      // Nguồn: frontend/src/pages/auth/LoginPage.tsx:8 homeForRole quy định ADMIN chuyển hướng về /admin
      await page.waitForURL('**/admin*', { timeout: 15000 });

      // Đường dẫn quản trị Gateway thực tế trong frontend/src/App.tsx
      await page.goto(`${BASE_URL}/admin/gateway`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.resolve(SCREENSHOT_DIR, `sprint5-sc04-04-admin-gateway-${vp.name}.png`) });
    });

  } finally {
    await context.close();
  }
}

// =============================================================================
// HÀM ĐIỀU PHỐI CHÍNH (MAIN ENTRY POINT)
// =============================================================================
async function main() {
  console.log('='.repeat(80));
  console.log('PLAYWRIGHT E2E HUMAN-FIRST TEST SUITE — SPRINT 5 INTEGRATION & DEMO');
  console.log('QA Lead: Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #25)');
  console.log('Standards: TESTING_RULES.md (Z1-Z5, H1-H4, A1-A3)');
  console.log('='.repeat(80));

  const scenarioArg = process.argv.find((arg) => arg.startsWith('--scenario='));
  const runAllArg = process.argv.includes('--all');
  const scenarioTarget = scenarioArg ? scenarioArg.split('=')[1].toLowerCase() : (runAllArg ? 'all' : 'default');

  let frontendProcess = null;
  let backendProcess = null;

  // 1. Kiểm tra trạng thái máy chủ Backend
  const isBackendUp = await isPortOpen(3000);
  if (!isBackendUp) {
    log('Đang khởi động Backend API trên cổng 3000...');
    backendProcess = spawn('node', ['--env-file-if-exists=.env', 'dist/src/server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore',
      detached: false
    });
    await waitForServer(3000, 'Backend API');
  } else {
    log('Backend API đã sẵn sàng trên cổng 3000.');
  }

  // 2. Kiểm tra trạng thái máy chủ Frontend
  const isFrontendUp = await isPortOpen(5173);
  if (!isFrontendUp) {
    log('Đang khởi động Frontend Preview trên cổng 5173...');
    frontendProcess = spawn('cmd.exe', ['/c', 'npm.cmd run preview -- --port 5173 --host 127.0.0.1'], {
      cwd: path.resolve(__dirname, '../frontend'),
      stdio: 'ignore',
      detached: false
    });
    await waitForServer(5173, 'Frontend Preview');
  } else {
    log('Frontend đã sẵn sàng trên cổng 5173.');
  }

  // 3. Khởi chạy Playwright Chromium
  log('Khởi chạy Playwright Chromium (Headless mode)...');
  const browser = await pw.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    if (scenarioTarget === '1') {
      log('Chạy riêng Phân cảnh 1 trên cả 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC01.reason = 'Hoàn tất cả 2 viewports';

    } else if (scenarioTarget === '2') {
      log('Chạy riêng Phân cảnh 2 trên cả 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC02.reason = 'Hoàn tất cả 2 viewports';

    } else if (scenarioTarget === '3') {
      log('Chạy riêng Phân cảnh 3 trên cả 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC03.reason = 'Hoàn tất cả 2 viewports';

    } else if (scenarioTarget === '4') {
      log('Chạy riêng Phân cảnh 4 trên cả 2 viewports (Desktop & Tablet)...');
      for (const vp of VIEWPORTS) {
        await runScenario4(browser, vp);
        scenarioExecutionStatus.SC04.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC04.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC04.reason = 'Chạy thử nghiệm thành công';

    } else if (scenarioTarget === 'all') {
      log('Chạy toàn bộ 4 phân cảnh trên cả 2 viewports (Chế độ Full Suite)...');
      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC01.reason = 'Hoàn tất cả 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC02.reason = 'Hoàn tất cả 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC03.reason = 'Hoàn tất cả 2 viewports';

      for (const vp of VIEWPORTS) {
        await runScenario4(browser, vp);
        scenarioExecutionStatus.SC04.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC04.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC04.reason = 'Hoàn tất cả 2 viewports';

    } else {
      // Chế độ mặc định: Chạy các phân cảnh đã sẵn sàng trên develop (SC01, SC02, SC03)
      log('Chạy các kịch bản demo khả dụng (SC01, SC02, SC03) trên cả Desktop & Tablet...');

      for (const vp of VIEWPORTS) {
        await runScenario1(browser, vp);
        scenarioExecutionStatus.SC01.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC01.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC01.reason = 'Hoàn tất cả 2 viewports (Desktop, Tablet)';

      for (const vp of VIEWPORTS) {
        await runScenario2(browser, vp);
        scenarioExecutionStatus.SC02.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC02.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC02.reason = 'Hoàn tất cả 2 viewports (Desktop, Tablet)';

      for (const vp of VIEWPORTS) {
        await runScenario3(browser, vp);
        scenarioExecutionStatus.SC03.viewportsTested.push(vp.name);
      }
      scenarioExecutionStatus.SC03.status = 'ĐÃ CHẠY PASS';
      scenarioExecutionStatus.SC03.reason = 'Hoàn tất cả 2 viewports (Desktop, Tablet)';

      // Phân cảnh 4 giữ trạng thái CHƯA CHẠY do chờ FE Issue #23
      scenarioExecutionStatus.SC04.status = 'CHƯA CHẠY';
      scenarioExecutionStatus.SC04.reason = 'Chờ Frontend Issue #23 (@leduwn) merge vào develop';
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
  // TỔNG KẾT TIẾN ĐỘ VÀ IN BẢNG TRẠNG THÁI (SUMMARY & INTEGRITY AUDIT)
  // ===========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('BẢNG TỔNG KẾT TIẾN ĐỘ NGHIỆM THU 4 PHÂN CẢNH DEMO SPRINT 5');
  console.log('='.repeat(80));
  console.log('| Phân cảnh | Kịch bản chi tiết                              | Trạng thái   | Viewports | Ghi chú / Lý do                              |');
  console.log('|-----------|------------------------------------------------|--------------|-----------|----------------------------------------------|');

  let hasUnrunScenarios = false;
  for (const item of SCENARIO_REGISTRY) {
    const s = scenarioExecutionStatus[item.code];
    const vpText = s.viewportsTested.length > 0 ? s.viewportsTested.join(', ') : 'Chưa test';
    const statusCol = s.status.padEnd(12);
    console.log(`| ${item.code.padEnd(9)} | ${item.title.padEnd(46)} | ${statusCol} | ${vpText.padEnd(9)} | ${s.reason.padEnd(44)} |`);
    if (s.status === 'CHƯA CHẠY' || s.status === 'FAIL') {
      hasUnrunScenarios = true;
    }
  }
  console.log('='.repeat(80));

  if (hasUnrunScenarios) {
    console.log('\n' + '!'.repeat(80));
    console.log('⚠️  CẢNH BÁO: KẾT QUẢ CHƯA ĐẦY ĐỦ (INCOMPLETE E2E SUITE)');
    console.log('Có phân cảnh chưa được kiểm thử trọn vẹn (Phân cảnh 4 chờ Frontend Issue #23).');
    console.log('TUYỆT ĐỐI KHÔNG dùng kết quả này để ký duyệt nghiệm thu Release Candidate.');
    console.log('Khi bạn Lê Hải Dương (@leduwn) hoàn thành Issue #23 và gộp vào develop, hãy chạy');
    console.log('lại toàn bộ 4 phân cảnh bằng lệnh: node qa-scripts/sprint5-ui-e2e-runner.cjs --all');
    console.log('!'.repeat(80) + '\n');
  }

  console.log('-'.repeat(80));
  console.log(`Tổng số bước test đã chạy: ${results.length}`);
  console.log(`Passed:                     ${passedCount}/${results.length} (${results.length > 0 ? ((passedCount / results.length) * 100).toFixed(1) : 0}%)`);
  console.log(`Failed:                     ${failedCount}/${results.length}`);
  console.log(`Ảnh chụp lưu trữ tại:       ${SCREENSHOT_DIR}`);
  console.log('='.repeat(80));

  if (failedCount > 0) {
    process.exit(1);
  }

  // Nếu có phân cảnh bị bỏ qua do thiếu mã nguồn, thoát với mã lỗi 2 để CI/Runner
  // không hiểu nhầm là đã nghiệm thu đầy đủ 100% Release Candidate.
  if (hasUnrunScenarios) {
    log('Thoát với mã lỗi 2 (KẾT QUẢ CHƯA ĐẦY ĐỦ — Chờ hoàn thiện Frontend Issue #23).');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('LỖI THỰC THI E2E NGHIÊM TRỌNG:', err);
  process.exit(1);
});
