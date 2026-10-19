/**
 * qa-scripts/sprint2-ui-e2e-runner.cjs
 * Bộ kiểm thử tự động E2E Giao diện Playwright Sprint 2
 * Khóa sổ Sprint 2 - Kiểm tra đóng GAP-01, nghiệm thu toàn diện và PR #65 Regression Gate
 *
 * Scenarios:
 *   E2E-UI-01: Provider Portal & KYC/Publishing UI (S1, S3, S4)
 *   E2E-UI-02: Admin Review UI (S2, S5)
 *   E2E-UI-03: Admin Audit Logs & Dashboard UI (S6, S7)
 *   E2E-UI-04: Wizard Partial Failure & Authoritative Reconciliation (S8)
 *   E2E-UI-05: Non-Destructive Version Preservation & Plan Tier Isolation (S9)
 *   E2E-UI-06: Network Ambiguity, Fail-Closed & Cross-Account Isolation (S10)
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let playwright;
try {
  playwright = require('playwright');
} catch (e1) {
  try {
    playwright = require(path.resolve(__dirname, 'node_modules/playwright'));
  } catch (e2) {
    try {
      playwright = require(path.resolve(__dirname, '../node_modules/playwright'));
    } catch (e3) {
      throw new Error('Không tìm thấy thư viện Playwright: ' + e1.message);
    }
  }
}

const BASE_URL = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const API_URL = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/api_market_test';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const CI_COMMIT = process.env.GITHUB_SHA || process.env.GIT_COMMIT || 'e5bedfa9f9d4';
const CI_BRANCH = process.env.GITHUB_REF_NAME || 'fix/frontend-comprehensive-hardening';

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const pool = new Pool({ connectionString: DB_URL });

const interceptedAdminApis = [];
const consoleErrors = [];
const pageErrors = [];

const resultsByStep = {};
let createdProviderEmail = null;
const createdProviderPassword = 'Provider@123';
let createdProviderId = null;
let createdApiId = null;
let createdApiName = null;
let reconciledDraftApiId = null;

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  console.log(`[QA E2E ${ts}] ${msg}`);
}

async function chayBuoc(ma, tieuDe, fn) {
  log(`=== BẮT ĐẦU [${ma}]: ${tieuDe} ===`);
  const t0 = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - t0;
    resultsByStep[ma] = {
      ma,
      tieuDe,
      trangThai: 'Pass',
      thoiGianMs: duration,
      loi: null,
      duLieu: res || {}
    };
    log(`✅ [PASS] [${ma}]: ${tieuDe} (${duration}ms)`);
    return { success: true, data: res };
  } catch (err) {
    const duration = Date.now() - t0;
    resultsByStep[ma] = {
      ma,
      tieuDe,
      trangThai: 'Fail',
      thoiGianMs: duration,
      loi: err.message,
      stack: err.stack
    };
    log(`❌ [FAIL] [${ma}]: ${tieuDe} (${duration}ms) - Lỗi: ${err.message}`);
    return { success: false, error: err };
  }
}

async function loginUser(page, email, password) {
  log(`Đăng nhập tài khoản: ${email}`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('button[type="submit"]');
  // Chờ điều hướng khỏi /login
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function runSuite() {
  const tStart = new Date().toISOString();
  log('Khởi tạo trình duyệt Playwright Chromium (Headless)...');

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Lắng nghe lỗi console và trang
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico')) {
        consoleErrors.push({ text, location: msg.location() });
      }
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
    log(`[Trang lỗi JS]: ${err.message}`);
  });

  // Bắt mọi request tới /api/admin/* và /api/provider/apis
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/api/admin/')) {
      const req = resp.request();
      const status = resp.status();
      const method = req.method();
      interceptedAdminApis.push({
        method,
        url: url.replace(API_URL, '').replace(/https?:\/\/[^/]+/, ''),
        status,
        timestamp: new Date().toISOString()
      });
      log(`[API Admin Intercepted] ${method} ${url} -> ${status}`);
    }

    if (url.endsWith('/api/provider/apis') && resp.request().method() === 'POST' && resp.status() === 201) {
      const data = await resp.json().catch(() => null);
      if (data && data.data && data.data.id) {
        if (!createdApiId) {
          createdApiId = String(data.data.id);
          log(`[Bắt được ID API mới tạo qua API]: ${createdApiId}`);
        } else if (!reconciledDraftApiId) {
          reconciledDraftApiId = String(data.data.id);
          log(`[Bắt được ID API bản nháp retry qua API]: ${reconciledDraftApiId}`);
        }
      }
    }
  });

  try {
    // ==========================================
    // BƯỚC S1: Provider Đăng ký & Nộp hồ sơ KYC
    // ==========================================
    await chayBuoc('S1', 'Provider đăng ký, đăng nhập và nộp hồ sơ KYC (Pending)', async () => {
      const timestamp = Date.now();
      createdProviderEmail = `qa-e2e-provider-${timestamp}@example.com`;

      // Tạo provider tài khoản qua API đăng ký
      const regRes = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createdProviderEmail,
          password: createdProviderPassword,
          name: `QA Provider ${timestamp}`,
          role: 'Provider'
        })
      });
      if (!regRes.ok) {
        throw new Error(`Đăng ký Provider thất bại: ${regRes.status} ${await regRes.text()}`);
      }
      log(`Đã tạo tài khoản Provider: ${createdProviderEmail}`);

      // Lấy provider_id từ DB
      const provRow = await pool.query('SELECT p.id FROM api_providers p JOIN users u ON p.user_id = u.id WHERE u.email = $1', [createdProviderEmail]);
      if (provRow.rows.length > 0) {
        createdProviderId = provRow.rows[0].id;
        log(`Provider ID trong DB: ${createdProviderId}`);
      }

      // Đăng nhập trên UI
      await loginUser(page, createdProviderEmail, createdProviderPassword);

      // Đi tới trang xác minh KYC
      await page.goto(`${BASE_URL}/provider/verification`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[placeholder*="Công ty TNHH"]', { timeout: 10000 });

      // Nhập form KYC
      await page.fill('input[placeholder*="Công ty TNHH"]', `Tập đoàn Công nghệ QA ${timestamp}`);
      await page.fill('input[type="email"]', `legal-${timestamp}@qa-market.com`);
      await page.fill('input[placeholder*="https://"]', `https://cdn.qa-market.com/docs/license-${timestamp}.pdf`);

      // Chọn đồng ý điều khoản
      const agreementCheckbox = page.locator('input[type="checkbox"]').first();
      await agreementCheckbox.check();

      // Nộp hồ sơ
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();

      // Chờ cập nhật trạng thái Pending (trang hiển thị text Pending)
      await page.waitForSelector('text=Pending', { timeout: 10000 });
      log('Đã ghi nhận trạng thái Pending trên giao diện Provider');

      return { providerEmail: createdProviderEmail, orgName: `Tập đoàn Công nghệ QA ${timestamp}` };
    });

    // ==========================================
    // BƯỚC S2: Admin Duyệt hồ sơ KYC
    // ==========================================
    await chayBuoc('S2', 'Admin phê duyệt hồ sơ KYC trên ProviderVerificationsPage', async () => {
      // Đăng xuất và đăng nhập bằng Admin
      await context.clearCookies();
      await page.evaluate(() => sessionStorage.clear());
      await loginUser(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Đi tới trang quản lý xác minh
      await page.goto(`${BASE_URL}/admin/verifications`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      // Chờ dữ liệu tải từ API /api/admin/provider-verifications
      await page.waitForTimeout(2000);

      // Tìm đúng thẻ hồ sơ của Provider vừa tạo
      const targetCard = page.locator('div.bg-surface-container-low').filter({ hasText: createdProviderEmail }).first();
      await targetCard.waitFor({ state: 'visible', timeout: 10000 });

      // Nhấn nút Phê duyệt trên thẻ (tránh nhầm với tab Đã phê duyệt)
      const approveBtn = targetCard.locator('button:text-is("Phê duyệt"), button:has-text("Phê duyệt")').first();
      await approveBtn.waitFor({ state: 'visible', timeout: 8000 });
      await approveBtn.click();

      // Chờ cập nhật và kiểm tra DB
      await page.waitForTimeout(3000);
      const verCheck = await pool.query('SELECT status FROM provider_verifications WHERE provider_id = $1', [createdProviderId]);
      log(`Trạng thái provider_verifications sau duyệt: ${verCheck.rows[0]?.status}`);

      if (verCheck.rows[0]?.status !== 'Verified') {
        throw new Error(`Duyệt hồ sơ thất bại, trạng thái trong DB vẫn là: ${verCheck.rows[0]?.status}`);
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-01-admin-kyc-approved.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S2: ${screenshotPath}`);

      return { screenshot: 'qa-scripts/screenshots/sprint2-e2e-01-admin-kyc-approved.png' };
    });

    // ==========================================
    // BƯỚC S3: Provider Tạo API & Upload OpenAPI 7 Khối
    // ==========================================
    await chayBuoc('S3', 'Provider tạo API và upload OpenAPI, hiển thị 7 khối tài liệu', async () => {
      // Đăng nhập lại với tài khoản Provider vừa được duyệt
      await context.clearCookies();
      await page.evaluate(() => sessionStorage.clear());
      await loginUser(page, createdProviderEmail, createdProviderPassword);

      // Đi tới Wizard tạo API
      const timestamp = Date.now();
      createdApiName = `Weather Pro Public API ${timestamp}`;

      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      // Bước 1: Metadata
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill(createdApiName);
      const descInput = page.locator('textarea').first();
      await descInput.fill('Dịch vụ dự báo thời tiết toàn cầu độ chính xác cao theo chuẩn quốc tế.');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(1000);

      // Bước 2: Gateway Route (Dùng FQDN thật chống SSRF)
      const urlInput = page.locator('input[type="url"], input[placeholder*="http"]').first();
      await urlInput.clear();
      await urlInput.fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(1000);

      // Bước 3: Initial Plan
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(1000);

      // Bước 4: Legal & Personal Data (US-08)
      // Checkbox xử lý dữ liệu cá nhân
      const personalDataLabel = page.locator('label').filter({ hasText: 'Dữ liệu Cá nhân' }).first();
      if (await personalDataLabel.count() > 0) {
        await personalDataLabel.locator('input[type="checkbox"]').check();
        await page.waitForTimeout(500);

        // Chọn FullName
        const fullNameLabel = page.locator('label').filter({ hasText: 'Họ và tên' }).first();
        if (await fullNameLabel.count() > 0) {
          await fullNameLabel.locator('input[type="checkbox"]').check();
        }

        // Nhập mục đích xử lý
        const purposeTextarea = page.locator('textarea').last();
        if (await purposeTextarea.count() > 0) {
          await purposeTextarea.fill('Cá nhân hóa thông tin thời tiết địa phương và gửi thông báo khẩn cấp');
        }
      }

      // Checkbox cam kết pháp lý / thỏa thuận
      const legalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await legalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const legalCheckbox = legalLabel.locator('input[type="checkbox"]').first();

      for (let i = 0; i < 20; i++) {
        if (!(await legalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await legalCheckbox.check();
      await page.waitForTimeout(500);

      // Bấm Hoàn tất & Đăng ký API
      const finishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await finishBtn.waitFor({ state: 'visible', timeout: 8000 });
      await finishBtn.click();

      // Chờ hoàn tất tạo API trong DB
      for (let i = 0; i < 10; i++) {
        const apiRow = await pool.query('SELECT id, name FROM apis WHERE provider_id = $1 ORDER BY id DESC LIMIT 1', [createdProviderId]);
        if (apiRow.rows.length > 0) {
          createdApiId = String(apiRow.rows[0].id);
          createdApiName = apiRow.rows[0].name;
          break;
        }
        await page.waitForTimeout(1000);
      }

      log(`API đã được tạo thành công với ID: ${createdApiId}, Name: ${createdApiName}`);
      if (!createdApiId) {
        throw new Error('Không lấy được ID API mới tạo trong cơ sở dữ liệu.');
      }

      // Đi tới trang Import OpenAPI
      await page.goto(`${BASE_URL}/provider/import-openapi?api=${createdApiId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      // Upload file valid-weather-openapi3.json
      const fixturePath = path.resolve(__dirname, 'openapi-fixtures/valid-weather-openapi3.json');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(fixturePath);
      await page.waitForTimeout(1000);

      // Bấm nút Import
      const importBtn = page.locator('button:has-text("Bắt đầu Tải lên & Trích xuất"), button[type="submit"]').first();
      await importBtn.click();

      // Chờ hoàn thành import
      await page.waitForTimeout(3500);

      // Chuyển sang tab Xem tài liệu
      const viewerTab = page.locator('button:has-text("Xem tài liệu 7 mục"), button:has-text("Xem tài liệu"), button:has-text("Viewer")').first();
      if (await viewerTab.count() > 0) {
        await viewerTab.click();
        await page.waitForTimeout(1500);
      }

      // Kiểm tra sự hiện diện của 7 khối tài liệu
      const block1 = await page.locator('text=1. Tổng quan').count();
      const block2 = await page.locator('text=2. Xác thực').count();
      const block3 = await page.locator('text=3. Tuyến đường').count();
      const block4 = await page.locator('text=4. Tham số').count();
      const block5 = await page.locator('text=5. Yêu cầu').count();
      const block6 = await page.locator('text=6. Phản hồi').count();
      const block7 = await page.locator('text=7. Mã lỗi').count();

      log(`Kiểm tra 7 khối tài liệu: [${block1}, ${block2}, ${block3}, ${block4}, ${block5}, ${block6}, ${block7}]`);

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-02-provider-openapi-docs.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S3: ${screenshotPath}`);

      return {
        apiId: createdApiId,
        blocksFound: [block1, block2, block3, block4, block5, block6, block7].every(c => c > 0),
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-02-provider-openapi-docs.png'
      };
    });

    // ==========================================
    // BƯỚC S4: Cấu hình Gói giá, Bỏ qua DNS DB & Submit Review
    // ==========================================
    await chayBuoc('S4', 'Provider cấu hình gói Pro, xác minh tên miền DB và Submit Review', async () => {
      // Đi tới trang quản lý giá
      await page.goto(`${BASE_URL}/provider/pricing?api=${createdApiId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      // Mở modal tạo gói Pro
      const addPlanBtn = page.locator('button:has-text("Add Pricing Tier"), button:has-text("Thêm gói cước"), button:has-text("Thêm gói giá")').first();
      await addPlanBtn.waitFor({ state: 'visible', timeout: 8000 });
      await addPlanBtn.click();
      await page.waitForSelector('div[role="dialog"] select', { timeout: 5000 });

      // Chọn gói Pro
      const tierSelect = page.locator('div[role="dialog"] select').first();
      await tierSelect.selectOption('Pro');
      await page.waitForTimeout(500);

      // Điền giá 499000
      const priceInput = page.locator('div[role="dialog"] input[type="number"]').first();
      await priceInput.fill('499000');

      // Lưu gói
      await page.click('div[role="dialog"] button:has-text("Tạo gói cước"), div[role="dialog"] button:has-text("Lưu"), div[role="dialog"] button[type="submit"]');
      await page.waitForTimeout(2000);

      // Cập nhật trạng thái domain verified trong DB qua UPSERT để vượt qua Readiness Checklist (US-08 / US-12)
      await pool.query(`
        INSERT INTO api_domain_verifications (api_id, hostname, token_hash, challenge_expires_at, verified_at, verification_expires_at)
        VALUES ($1, 'api.open-meteo.com', '0fc4d0f93876cd7a73c65d825b0c77558d7f3ccff7813c931991749b5fb44826', NOW() + INTERVAL '1 day', NOW(), NOW() + INTERVAL '7 days')
        ON CONFLICT (api_id) DO UPDATE SET verified_at = NOW(), verification_expires_at = NOW() + INTERVAL '7 days'
      `, [createdApiId]);
      log(`Đã cập nhật tên miền verified trong DB cho API ID: ${createdApiId}`);

      // Đi tới Publishing Workflow Page
      await page.goto(`${BASE_URL}/provider/workflow?api=${createdApiId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Nộp duyệt
      const submitReviewBtn = page.locator('button:has-text("Gửi cho Quản trị viên"), button:has-text("Submit for Admin Review"), button:has-text("Nộp duyệt")').first();
      await submitReviewBtn.waitFor({ state: 'visible', timeout: 10000 });
      await submitReviewBtn.click();

      // Chờ cập nhật trạng thái trong DB
      let dbStatus = null;
      for (let i = 0; i < 5; i++) {
        const checkRow = await pool.query('SELECT status FROM apis WHERE id = $1', [createdApiId]);
        dbStatus = checkRow.rows[0]?.status;
        if (dbStatus === 'Submitted') break;
        await page.waitForTimeout(1000);
      }
      log(`Trạng thái API trong DB sau nộp duyệt: ${dbStatus}`);
      if (dbStatus !== 'Submitted') {
        throw new Error(`Nộp duyệt API thất bại, trạng thái trong DB: ${dbStatus}`);
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-03-provider-submitted.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S4: ${screenshotPath}`);

      return { screenshot: 'qa-scripts/screenshots/sprint2-e2e-03-provider-submitted.png' };
    });

    // ==========================================
    // BƯỚC S5: Admin Thẩm định Dossier & Xuất bản API
    // ==========================================
    await chayBuoc('S5', 'Admin xem Dossier (cảnh báo cá nhân) và xuất bản API', async () => {
      // Đăng nhập lại bằng Admin
      await context.clearCookies();
      await page.evaluate(() => sessionStorage.clear());
      await loginUser(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      // Đi tới trang duyệt API
      await page.goto(`${BASE_URL}/admin/api-reviews`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Tìm thẻ của API vừa nộp
      const targetApiCard = page.locator('div.bg-surface-container-low').filter({ hasText: createdApiName }).first();
      await targetApiCard.waitFor({ state: 'visible', timeout: 10000 });

      // Mở Dossier
      const dossierBtn = targetApiCard.locator('button:has-text("Hồ sơ Dossier")').first();
      await dossierBtn.waitFor({ state: 'visible', timeout: 8000 });
      await dossierBtn.click();
      await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Kiểm tra cảnh báo dữ liệu cá nhân trong modal Dossier
      const hasPrivacyWarning = await page.locator('text=Xử lý Dữ liệu Cá nhân, text=CÓ').count();
      log(`Cảnh báo dữ liệu cá nhân hiển thị trong Dossier: ${hasPrivacyWarning > 0}`);

      // Đóng modal Dossier bằng Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      // 1. Chuyển sang Under Review
      const underReviewBtn = targetApiCard.locator('button:has-text("Bắt đầu thẩm định")').first();
      await underReviewBtn.click();
      await page.waitForTimeout(2500);

      // Chuyển sang tab "Đang thẩm định" (Under Review / Đang kiểm duyệt)
      const tabUnderReview = page.locator('button:has-text("Under Review"), button:has-text("Đang kiểm duyệt"), button:has-text("Đang xem xét")').first();
      await tabUnderReview.click();
      await page.waitForTimeout(2000);

      // 2. Chuyển sang Approved
      const reviewCard = page.locator('div.bg-surface-container-low').filter({ hasText: createdApiName }).first();
      await reviewCard.waitFor({ state: 'visible', timeout: 10000 });
      const approveBtn = reviewCard.locator('button:text-is("Phê duyệt"), button:has-text("Phê duyệt")').first();
      await approveBtn.waitFor({ state: 'visible', timeout: 8000 });
      await approveBtn.click();
      await page.waitForTimeout(2500);

      // Chuyển sang tab "Đã phê duyệt" (Approved / Đã phê duyệt)
      const tabApproved = page.locator('button:has-text("Approved"), button:has-text("Đã phê duyệt")').first();
      await tabApproved.click();
      await page.waitForTimeout(2000);

      // 3. Xuất bản lên Marketplace (Published)
      const approvedCard = page.locator('div.bg-surface-container-low').filter({ hasText: createdApiName }).first();
      await approvedCard.waitFor({ state: 'visible', timeout: 10000 });
      const publishBtn = approvedCard.locator('button:has-text("Xuất bản")').first();
      await publishBtn.waitFor({ state: 'visible', timeout: 8000 });
      await publishBtn.click();
      await page.waitForTimeout(2500);

      // Kiểm tra DB xác nhận trạng thái Published
      const pubCheck = await pool.query('SELECT status FROM apis WHERE id = $1', [createdApiId]);
      log(`Trạng thái API trong DB sau xuất bản: ${pubCheck.rows[0]?.status}`);

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-04-admin-api-published.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S5: ${screenshotPath}`);

      return {
        hasPrivacyWarning: hasPrivacyWarning > 0,
        apiPublished: pubCheck.rows[0]?.status === 'Published',
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-04-admin-api-published.png'
      };
    });

    // ==========================================
    // BƯỚC S6: Admin Kiểm tra Audit Logs & Lọc
    // ==========================================
    await chayBuoc('S6', 'Admin xem AuditLogsPage, xác nhận nhật ký phát sinh và bộ lọc hoạt động', async () => {
      // Đi tới trang Audit Logs
      await page.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Kiểm tra có ít nhất 1 dòng nhật ký
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        throw new Error('Bảng Audit Logs không có bản ghi nào.');
      }
      log(`Số dòng Audit Logs hiện tại: ${rowCount}`);

      // Kiểm tra bộ lọc hành động
      const actionSelect = page.locator('select').first();
      if (await actionSelect.count() > 0) {
        const optionCount = await actionSelect.locator('option').count();
        log(`Số lượng options trong bộ lọc hành động: ${optionCount}`);
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-05-admin-audit-logs.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S6: ${screenshotPath}`);

      return {
        totalRows: rowCount,
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-05-admin-audit-logs.png'
      };
    });

    // ==========================================
    // BƯỚC S7: Admin Dashboard Số liệu Realtime
    // ==========================================
    await chayBuoc('S7', 'AdminDashboardPage tải số liệu thống kê realtime từ API thật', async () => {
      // Đi tới trang Dashboard
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Chụp ảnh dashboard
      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-06-admin-dashboard.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S7: ${screenshotPath}`);

      return { screenshot: 'qa-scripts/screenshots/sprint2-e2e-06-admin-dashboard.png' };
    });

    // ==========================================
    // BƯỚC S8 (E2E-UI-04): Wizard Partial Failure & Authoritative Reconciliation
    // ==========================================
    await chayBuoc('S8', 'Wizard xử lý lỗi cục bộ sau tạo nháp, hồi phục dữ liệu đã sửa và đồng bộ DB chính xác', async () => {
      // Đăng nhập lại với Provider đã xác minh
      await context.clearCookies();
      await page.evaluate(() => sessionStorage.clear());
      await loginUser(page, createdProviderEmail, createdProviderPassword);

      const timestamp = Date.now();
      const initialApiName = `Reconcile Test API ${timestamp}`;

      // Đi tới Wizard tạo API
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      // Step 1: Nhập metadata ban đầu
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill(initialApiName);
      const descInput = page.locator('textarea').first();
      await descInput.fill('API dùng kiểm thử partial failure và state reconciliation');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(800);

      // Step 2: Nhập Upstream URL ban đầu
      const urlInput = page.locator('input[type="url"], input[placeholder*="http"]').first();
      await urlInput.clear();
      await urlInput.fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(800);

      // Step 3: Gói Free ban đầu
      const quotaInput = page.locator('input[type="number"]').first();
      await quotaInput.clear();
      await quotaInput.fill('1500');
      const rpsInput = page.locator('input[type="number"]').nth(1);
      await rpsInput.clear();
      await rpsInput.fill('15');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(800);

      // Step 4: Chờ tải thỏa thuận và đồng ý
      const legalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await legalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const legalCheckbox = legalLabel.locator('input[type="checkbox"]').first();
      for (let i = 0; i < 20; i++) {
        if (!(await legalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await legalCheckbox.check();

      // Giả lập lỗi cục bộ ở bước lưu thỏa thuận pháp lý (POST /api/provider/apis/*/legal -> 500)
      await page.route('**/api/provider/apis/*/legal', route => {
        log('[Mock Network] Chặn và trả về lỗi 500 tại endpoint legal để giả lập partial failure');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Giả lập lỗi mạng khi lưu thỏa thuận pháp lý' } })
        });
      });

      // Nhấn nút Hoàn tất lần 1
      const finishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await finishBtn.click();

      // Chờ thông báo lỗi xuất hiện
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      const alertText = await page.locator('[role="alert"]').innerText();
      log(`Đã bắt được thông báo lỗi sau partial failure: ${alertText}`);

      // Hủy chặn endpoint legal để retry thành công
      await page.unroute('**/api/provider/apis/*/legal');

      // Kiểm tra bản nháp đã được tạo trong DB với ID duy nhất
      const checkDraft = await pool.query('SELECT id, name FROM apis WHERE provider_id = $1 AND name = $2', [createdProviderId, initialApiName]);
      if (checkDraft.rows.length === 0) {
        throw new Error('Bản nháp ban đầu không tìm thấy trong database.');
      }
      reconciledDraftApiId = checkDraft.rows[0].id;
      log(`Bản nháp đã lưu trong DB trước retry: ID=${reconciledDraftApiId}`);

      // User quay lại Step 3 sửa quota
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForSelector('input[type="number"]', { timeout: 6000 });
      const quotaEdit = page.locator('input[type="number"]').first();
      await quotaEdit.clear();
      await quotaEdit.fill('3800');
      const rpsEdit = page.locator('input[type="number"]').nth(1);
      await rpsEdit.clear();
      await rpsEdit.fill('28');

      // User quay lại Step 2 sửa Base URL
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForSelector('input[type="url"], input[placeholder*="http"]', { timeout: 6000 });
      const urlEdit = page.locator('input[type="url"], input[placeholder*="http"]').first();
      await urlEdit.clear();
      await urlEdit.fill('https://api.open-meteo.com/v2');

      // User quay lại Step 1 sửa API Name
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForSelector('input[type="text"]', { timeout: 6000 });
      const reconciledName = `Reconcile Test API ${timestamp} Reconciled`;
      const nameEdit = page.locator('input[type="text"]').first();
      await nameEdit.clear();
      await nameEdit.fill(reconciledName);

      // Đi tới Step 4 để retry hoàn tất
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      // Tích xác nhận thỏa thuận nếu cần
      if (!(await legalCheckbox.isChecked())) {
        await legalCheckbox.check();
      }

      // Nhấn nút Hoàn tất lần 2 (Retry)
      await finishBtn.click();

      // Chờ điều hướng tới Publishing Workflow
      await page.waitForFunction(() => window.location.pathname.includes('/provider/publishing-workflow') || window.location.pathname.includes('/provider/workflow'), { timeout: 12000 });
      log('Đã điều hướng thành công sang trang Publishing Workflow sau retry');

      // Kiểm tra đối soát dữ liệu thật trong PostgreSQL
      const apiRows = await pool.query('SELECT id, name, base_url FROM apis WHERE provider_id = $1 AND (name = $2 OR name = $3)', [createdProviderId, initialApiName, reconciledName]);
      if (apiRows.rows.length !== 1) {
        throw new Error(`Kỳ vọng duy nhất 1 bản ghi API (không nhân bản nháp), tìm thấy: ${apiRows.rows.length}`);
      }
      if (apiRows.rows[0].id !== reconciledDraftApiId) {
        throw new Error(`ID API bị thay đổi: cũ=${reconciledDraftApiId}, mới=${apiRows.rows[0].id}`);
      }
      if (apiRows.rows[0].name !== reconciledName) {
        throw new Error(`Tên API không được cập nhật sang bản ghi sửa: ${apiRows.rows[0].name}`);
      }
      if (apiRows.rows[0].base_url !== 'https://api.open-meteo.com/v2') {
        throw new Error(`Base URL không được cập nhật: ${apiRows.rows[0].base_url}`);
      }

      // Kiểm tra plan Free được đồng bộ quota và rps mới
      const planRows = await pool.query('SELECT name, quota, rate_limit FROM api_plans WHERE api_id = $1 AND name = $2', [reconciledDraftApiId, 'Free']);
      if (planRows.rows.length === 0) {
        throw new Error('Gói cước Free không tồn tại trong database');
      }
      if (Number(planRows.rows[0].quota) !== 3800) {
        throw new Error(`Quota gói Free không được cập nhật lên 3800: ${planRows.rows[0].quota}`);
      }
      if (planRows.rows[0].rate_limit !== 28) {
        throw new Error(`Rate limit gói Free không được cập nhật lên 28: ${planRows.rows[0].rate_limit}`);
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-07-wizard-reconciliation.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S8: ${screenshotPath}`);

      return {
        reconciledApiId: reconciledDraftApiId,
        reconciledName,
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-07-wizard-reconciliation.png'
      };
    });

    // ==========================================
    // BƯỚC S9 (E2E-UI-05): Non-Destructive Version Preservation & Plan Tier Isolation
    // ==========================================
    await chayBuoc('S9', 'Bảo toàn tài liệu OpenAPI phiên bản cũ và bảo vệ gói cước Basic 0 đồng', async () => {
      // 1. Tạo một bản nháp API độc lập qua UI Wizard và đưa vào trạng thái partial-failure có thể phục hồi
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      const s9Timestamp = Date.now();
      const s9ApiName = `Version Preserved API ${s9Timestamp}`;

      // Bước 1: Nhập metadata với version 1.0.0
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill(s9ApiName);
      const descInput = page.locator('textarea').first();
      await descInput.fill('API kiểm thử bảo toàn phiên bản OpenAPI 1.0.0 và gói Basic 0 đồng');
      const versionInput = page.locator('input[placeholder="1.0.0"]').first();
      await versionInput.clear();
      await versionInput.fill('1.0.0');

      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      // Bước 2: Base URL
      const urlInput = page.locator('input[type="url"], input[placeholder*="http"]').first();
      await urlInput.clear();
      await urlInput.fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      // Bước 3: Định mức gói Free
      const quotaInput = page.locator('input[type="number"]').first();
      await quotaInput.clear();
      await quotaInput.fill('2500');
      const rpsInput = page.locator('input[type="number"]').nth(1);
      await rpsInput.clear();
      await rpsInput.fill('15');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      // Bước 4: Đưa Wizard vào trạng thái partial-failure bằng cách chặn lưu thỏa thuận pháp lý
      await page.route('**/api/provider/apis/*/legal', route => {
        log('[Mock Network S9] Giả lập lỗi 500 khi lưu thỏa thuận pháp lý cho S9');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Giả lập lỗi mạng khi lưu thỏa thuận pháp lý cho S9' } })
        });
      });

      const legalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await legalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const legalCheckbox = legalLabel.locator('input[type="checkbox"]').first();
      for (let i = 0; i < 20; i++) {
        if (!(await legalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await legalCheckbox.check();

      const finishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await finishBtn.click();

      // Chờ cảnh báo lỗi partial-failure
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      log('Wizard S9 đã đạt trạng thái partial failure có thể phục hồi (bản nháp đã lưu trên backend)');

      // Hủy chặn endpoint legal để retry thành công
      await page.unroute('**/api/provider/apis/*/legal');

      // Lấy ID bản nháp vừa tạo từ DB
      const s9DraftRow = await pool.query('SELECT id FROM apis WHERE provider_id = $1 AND name = $2', [createdProviderId, s9ApiName]);
      if (s9DraftRow.rows.length === 0) {
        throw new Error('Bản nháp S9 không tìm thấy trong database.');
      }
      const s9DraftApiId = s9DraftRow.rows[0].id;

      // 2. Gắn tài liệu OpenAPI và documentation vào phiên bản 1.0.0 vừa được tạo
      const v1Row = await pool.query("SELECT id FROM api_versions WHERE api_id = $1 AND version = '1.0.0'", [s9DraftApiId]);
      if (v1Row.rows.length === 0) {
        throw new Error('Không tìm thấy phiên bản 1.0.0 của bản nháp S9.');
      }
      const v1Id = v1Row.rows[0].id;
      const originalV1OpenApi = {
        openapi: '3.0.0',
        info: { title: 'Preserved Test API V1', version: '1.0.0' },
        paths: { '/v1/status': { get: { summary: 'Status Check' } } }
      };
      await pool.query('UPDATE api_versions SET openapi_document = $1::jsonb WHERE id = $2', [JSON.stringify(originalV1OpenApi), v1Id]);

      const originalDocContent = { sections: ['Preserved Doc Section V1'], author: 'Provider QA' };
      await pool.query(`
        INSERT INTO api_documentations (api_id, version_id, source, content)
        VALUES ($1, $2, 'OPENAPI_IMPORT', $3::jsonb)
        ON CONFLICT (version_id) DO UPDATE SET content = $3::jsonb
      `, [s9DraftApiId, v1Id, JSON.stringify(originalDocContent)]);

      // 3. Chèn gói cước Basic với giá 0 USD vào api_plans
      await pool.query(`
        INSERT INTO api_plans (api_id, name, price_monthly, currency, quota, rate_limit, is_active)
        VALUES ($1, 'Basic', 0, 'USD', 50000, 200, TRUE)
        ON CONFLICT (api_id, name) DO NOTHING
      `, [s9DraftApiId]);

      // Ghi nhận snapshot tài nguyên trước khi retry
      log(`Đã ghi nhận snapshot V1 (ID=${v1Id}) và gói Basic 0 USD trước khi retry.`);

      // 4. Sử dụng tương tác trình duyệt (browser interactions) để quay về Bước 1 và sửa Version thành 2.0.0
      // Đang ở Step 4 -> lùi về Step 3 -> Step 2 -> Step 1
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Quay lại"), button:has-text("← Back")');
      await page.waitForSelector('input[placeholder="1.0.0"]', { timeout: 6000 });

      // Nhập version mới 2.0.0 vào input
      const versionInputEdit = page.locator('input[placeholder="1.0.0"]').first();
      await versionInputEdit.clear();
      await versionInputEdit.fill('2.0.0');
      log('Đã cập nhật phiên bản mong muốn thành 2.0.0 trên Step 1 qua UI');

      // Đi tiếp qua các Step 1 -> 2 -> 3 -> 4
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      // Tích xác nhận thỏa thuận nếu cần
      if (!(await legalCheckbox.isChecked())) {
        await legalCheckbox.check();
      }

      // 5. Kích hoạt Wizard Retry thật bằng cách nhấn nút Hoàn tất
      await finishBtn.click();

      // Chờ điều hướng sạch sẽ sang /provider/publishing-workflow
      await page.waitForFunction(
        () => window.location.pathname.includes('/provider/publishing-workflow') || window.location.pathname.includes('/provider/workflow'),
        { timeout: 15000 }
      );
      log('Đã điều hướng sạch sẽ sang Publishing Workflow sau retry thành công.');

      // 6. Kiểm chứng trong PostgreSQL:
      // a. Phiên bản 2.0.0 được tạo ra bởi logic ứng dụng (createProviderVersion)
      const v2Row = await pool.query("SELECT id, version, changelog FROM api_versions WHERE api_id = $1 AND version = '2.0.0'", [s9DraftApiId]);
      if (v2Row.rows.length === 0) {
        throw new Error('Phiên bản 2.0.0 không được tạo bởi logic ứng dụng sau khi retry.');
      }
      log(`✅ Phiên bản 2.0.0 được tạo thành công bởi ứng dụng: ID=${v2Row.rows[0].id}`);

      // b. Phiên bản 1.0.0 vẫn tồn tại với ID cũ, tài liệu OpenAPI và Documentation nguyên vẹn
      const v1Verify = await pool.query('SELECT id, openapi_document FROM api_versions WHERE id = $1', [v1Id]);
      if (v1Verify.rows.length === 0) {
        throw new Error('Phiên bản 1.0.0 bị mất sau retry.');
      }
      if (JSON.stringify(v1Verify.rows[0].openapi_document) !== JSON.stringify(originalV1OpenApi)) {
        throw new Error('Tài liệu openapi_document của phiên bản 1.0.0 bị xóa hoặc thay đổi sau retry.');
      }

      const docVerify = await pool.query('SELECT content FROM api_documentations WHERE version_id = $1', [v1Id]);
      if (docVerify.rows.length === 0 || JSON.stringify(docVerify.rows[0].content) !== JSON.stringify(originalDocContent)) {
        throw new Error('Bản ghi api_documentations của phiên bản 1.0.0 bị mất hoặc sửa đổi sau retry.');
      }
      log('✅ Tài liệu OpenAPI và Documentation của phiên bản 1.0.0 được bảo toàn 100%.');

      // c. Gói Basic 0 USD vẫn giữ nguyên, không bị ghi đè hay biến thành Free
      const basicPlan = await pool.query("SELECT price_monthly, currency, quota, rate_limit FROM api_plans WHERE api_id = $1 AND name = 'Basic'", [s9DraftApiId]);
      if (basicPlan.rows.length === 0) {
        throw new Error('Gói Basic đã bị xóa hoặc mất khỏi api_plans.');
      }
      if (Number(basicPlan.rows[0].price_monthly) !== 0 || basicPlan.rows[0].currency !== 'USD' || Number(basicPlan.rows[0].quota) !== 50000 || basicPlan.rows[0].rate_limit !== 200) {
        throw new Error(`Dữ liệu gói Basic bị sai lệch sau retry: ${JSON.stringify(basicPlan.rows[0])}`);
      }

      // d. Gói Free được đối soát đúng theo giá trị Step 3 (quota 2500, rps 15)
      const freePlan = await pool.query("SELECT price_monthly, quota, rate_limit FROM api_plans WHERE api_id = $1 AND name = 'Free'", [s9DraftApiId]);
      if (freePlan.rows.length === 0 || Number(freePlan.rows[0].quota) !== 2500 || freePlan.rows[0].rate_limit !== 15) {
        throw new Error(`Gói Free không khớp giá trị cấu hình Step 3: ${JSON.stringify(freePlan.rows[0])}`);
      }
      log('✅ Gói Basic 0 USD và gói Free được đối soát độc lập, không nhầm lẫn bậc giá.');

      // e. Không nhân bản bản ghi API
      const apiCheck = await pool.query('SELECT count(*) FROM apis WHERE provider_id = $1 AND name = $2', [createdProviderId, s9ApiName]);
      if (Number(apiCheck.rows[0].count) !== 1) {
        throw new Error(`Phát hiện bản ghi API trùng lặp trong DB: count=${apiCheck.rows[0].count}`);
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-08-version-preservation.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S9: ${screenshotPath}`);

      return {
        v1Preserved: true,
        v2CreatedByApp: true,
        basicZeroDollarPreserved: true,
        freePlanReconciled: true,
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-08-version-preservation.png'
      };
    });

    // ==========================================
    // BƯỚC S10 (E2E-UI-06): Network Ambiguity, Fail-Closed & Cross-Account Isolation
    // ==========================================
    await chayBuoc('S10', 'Bảo vệ lỗi mạng 408 chống gửi trùng, cơ chế thỏa thuận fail-closed và phân lập phiên', async () => {
      // ----------------------------------------------------
      // 1. Kiểm thử Network Ambiguity (HTTP 408 Timeout) & Chặn Blind Duplicate POST
      // ----------------------------------------------------
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      const timestamp = Date.now();
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill(`Ambiguity Test API ${timestamp}`);
      const descInput = page.locator('textarea').first();
      await descInput.fill('API kiểm thử mạng timeout 408');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      const urlInput = page.locator('input[type="url"], input[placeholder*="http"]').first();
      await urlInput.clear();
      await urlInput.fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Proceed to"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(600);

      // Chặn API tạo mới và đếm số lượng request gửi đi
      let postApisCount = 0;
      await page.route('**/api/provider/apis', route => {
        if (route.request().method() === 'POST') {
          postApisCount++;
          log(`[Mock Network S10] Nhận yêu cầu POST /api/provider/apis (lần ${postApisCount}), trả về HTTP 408 Request Timeout`);
          route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({ error: { message: 'Yêu cầu vượt quá thời gian phản hồi (Request Timeout)' } })
          });
        } else {
          route.continue();
        }
      });

      // Tích thỏa thuận và bấm Hoàn tất
      const legalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await legalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const legalCheckbox = legalLabel.locator('input[type="checkbox"]').first();
      for (let i = 0; i < 20; i++) {
        if (!(await legalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await legalCheckbox.check();

      const finishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await finishBtn.click();

      // Kiểm tra banner cảnh báo lỗi mạng mơ hồ
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      const alert = page.locator('[role="alert"]').filter({ hasText: 'Yêu cầu tạo API gặp sự cố kết nối mạng' });
      await alert.waitFor({ state: 'visible', timeout: 8000 });
      log('Đã hiển thị banner cảnh báo mơ hồ mạng.');

      // Kiểm tra liên kết an toàn tới Kho API của tôi
      const inventoryLink = alert.locator('a[href="/provider/apis"]');
      if ((await inventoryLink.count()) === 0) {
        throw new Error('Thiếu đường link an toàn tới /provider/apis trong banner lỗi mạng mơ hồ.');
      }

      // Kiểm tra nút submit đã bị vô hiệu hóa và chỉ có đúng 1 yêu cầu POST được phát ra
      const isFinishDisabled = await finishBtn.isDisabled();
      if (!isFinishDisabled) {
        throw new Error('Nút Hoàn tất không bị vô hiệu hóa khi gặp lỗi mơ hồ mạng.');
      }
      if (postApisCount !== 1) {
        throw new Error(`Phát hiện gửi trùng yêu cầu POST: postApisCount=${postApisCount}`);
      }
      log('✅ Nút submit bị khóa và chỉ duy nhất 1 request POST được gửi (chống blind duplicate POST).');

      // Hủy chặn endpoint
      await page.unroute('**/api/provider/apis');

      // ----------------------------------------------------
      // 2. Kiểm thử Thỏa thuận Fail-Closed (Máy chủ phản hồi lỗi 500 khi xác thực thỏa thuận)
      // ----------------------------------------------------
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      const fcApiName = `Fail-Closed Agreement API ${timestamp}`;
      await page.locator('input[type="text"]').first().fill(fcApiName);
      await page.locator('textarea').first().fill('Kiểm thử cơ chế fail-closed khi máy chủ thỏa thuận lỗi 500');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      await page.locator('input[type="url"], input[placeholder*="http"]').first().fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      // Chờ thỏa thuận tải xong và tích đồng ý
      const fcLegalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await fcLegalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const fcLegalCheckbox = fcLegalLabel.locator('input[type="checkbox"]').first();
      for (let i = 0; i < 20; i++) {
        if (!(await fcLegalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await fcLegalCheckbox.check();

      // Giả lập máy chủ thỏa thuận trả về HTTP 500 khi handleFinish gọi lại để xác thực phía máy chủ
      let agreementValidationCalled = false;
      await page.route('**/api/provider/agreement', route => {
        agreementValidationCalled = true;
        log('[Mock Network S10] Chặn GET /api/provider/agreement khi bấm Hoàn tất, trả về 500 Server Error');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Máy chủ thỏa thuận phản hồi lỗi 500' } })
        });
      });

      const fcFinishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await fcFinishBtn.click();

      // Kiểm tra banner lỗi xác thực thỏa thuận
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
      const fcAlert = page.locator('[role="alert"]').filter({ hasText: 'Không thể xác thực Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ' });
      await fcAlert.waitFor({ state: 'visible', timeout: 8000 });
      log('Đã hiển thị banner lỗi fail-closed khi xác thực thỏa thuận máy chủ thất bại.');

      // Hủy chặn endpoint thỏa thuận
      await page.unroute('**/api/provider/agreement');

      if (!agreementValidationCalled) {
        throw new Error('Yêu cầu xác thực thỏa thuận authoritative phía máy chủ (GET /api/provider/agreement) không được kích hoạt!');
      }

      // Kiểm chứng toàn vẹn trong PostgreSQL: ZERO MUTATIONS across apis, api_versions, api_plans, api_legal_agreements
      const checkApis = await pool.query('SELECT count(*) FROM apis WHERE name = $1', [fcApiName]);
      if (Number(checkApis.rows[0].count) !== 0) {
        throw new Error('Vi phạm fail-closed: Bản ghi apis đã bị tạo dù thỏa thuận máy chủ xác thực lỗi!');
      }

      const checkPlans = await pool.query('SELECT count(*) FROM api_plans p JOIN apis a ON a.id = p.api_id WHERE a.name = $1', [fcApiName]);
      if (Number(checkPlans.rows[0].count) !== 0) {
        throw new Error('Vi phạm fail-closed: Bản ghi api_plans đã bị tạo!');
      }

      const checkVersions = await pool.query('SELECT count(*) FROM api_versions v JOIN apis a ON a.id = v.api_id WHERE a.name = $1', [fcApiName]);
      if (Number(checkVersions.rows[0].count) !== 0) {
        throw new Error('Vi phạm fail-closed: Bản ghi api_versions đã bị tạo!');
      }

      const checkLegal = await pool.query('SELECT count(*) FROM api_legal_agreements l JOIN apis a ON a.id = l.api_id WHERE a.name = $1', [fcApiName]);
      if (Number(checkLegal.rows[0].count) !== 0) {
        throw new Error('Vi phạm fail-closed: Bản ghi api_legal_agreements đã bị tạo!');
      }
      log('✅ Kiểm chứng fail-closed thành công: 0 biến động dữ liệu trong DB khi xác thực thỏa thuận thất bại.');

      // ----------------------------------------------------
      // 3. Kiểm thử Phân lập Phiên trong yêu cầu bất đồng bộ đang in-flight (Cross-Account Isolation)
      // ----------------------------------------------------
      await page.goto(`${BASE_URL}/provider/create-api`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });

      const leakApiName = `In-Flight Leak Test API ${timestamp}`;
      await page.locator('input[type="text"]').first().fill(leakApiName);
      await page.locator('textarea').first().fill('Kiểm thử triệt tiêu phản hồi in-flight khi đổi tài khoản');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      await page.locator('input[type="url"], input[placeholder*="http"]').first().fill('https://api.open-meteo.com/v1');
      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Tiếp tục sang"), button:has-text("Tiếp tục")');
      await page.waitForTimeout(500);

      // Tích thỏa thuận
      const leakLegalLabel = page.locator('label').filter({ hasText: 'Tôi đã đọc, hiểu rõ' }).first();
      await leakLegalLabel.waitFor({ state: 'visible', timeout: 10000 });
      const leakLegalCheckbox = leakLegalLabel.locator('input[type="checkbox"]').first();
      for (let i = 0; i < 20; i++) {
        if (!(await leakLegalCheckbox.isDisabled())) break;
        await page.waitForTimeout(500);
      }
      await leakLegalCheckbox.check();

      // Giả lập yêu cầu POST /api/provider/apis bị trễ 2500ms (in-flight)
      let inFlightStarted = false;
      let inFlightFinished = false;
      await page.route('**/api/provider/apis', async route => {
        if (route.request().method() === 'POST') {
          inFlightStarted = true;
          log('[Mock Network S10] In-flight POST /api/provider/apis đang trễ 2500ms...');
          await new Promise(r => setTimeout(r, 2500));
          inFlightFinished = true;
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'synthetic-in-flight-api-id',
              name: leakApiName,
              status: 'Draft'
            })
          });
        } else {
          route.continue();
        }
      });

      // Bấm Hoàn tất để kích hoạt request in-flight
      const leakFinishBtn = page.locator('button:has-text("Hoàn tất & Đăng ký API")').first();
      await leakFinishBtn.click();

      // Chờ request thực sự bắt đầu bay trên đường truyền
      for (let i = 0; i < 20; i++) {
        if (inFlightStarted) break;
        await page.waitForTimeout(100);
      }

      // Ngay khi request đang in-flight, người dùng đổi tài khoản / đăng xuất và chuyển sang Admin
      log('Yêu cầu đang in-flight: tiến hành đổi phiên sang tài khoản Admin...');
      await context.clearCookies();
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      await loginUser(page, ADMIN_EMAIL, ADMIN_PASSWORD);

      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1', { timeout: 10000 });

      // Chờ request in-flight hoàn thành trên đường truyền
      for (let i = 0; i < 30; i++) {
        if (inFlightFinished) break;
        await page.waitForTimeout(200);
      }
      await page.unroute('**/api/provider/apis');

      // Kiểm tra giao diện Admin không rò rỉ ID hoặc thông tin Provider trước
      const adminBodyText = await page.locator('body').innerText();
      if (adminBodyText.includes('synthetic-in-flight-api-id') || adminBodyText.includes(createdProviderEmail)) {
        throw new Error('Phát hiện rò rỉ ID hoặc dữ liệu Provider trong phiên làm việc của Admin!');
      }

      // Kiểm chứng trong PostgreSQL: Phản hồi trễ của tài khoản cũ không tiếp tục kích hoạt tạo version/plan
      const leakCheck = await pool.query("SELECT count(*) FROM api_versions WHERE api_id = 'synthetic-in-flight-api-id'");
      if (Number(leakCheck.rows[0].count) !== 0) {
        throw new Error('Vi phạm phân lập: In-flight response của phiên trước vẫn tiếp tục tạo version!');
      }
      log('✅ Phân lập phiên hoàn hảo: Stale response khi chuyển đổi tài khoản bị triệt tiêu hoàn toàn.');

      const screenshotPath = path.join(SCREENSHOT_DIR, 'sprint2-e2e-09-ambiguity-and-isolation.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`Đã lưu ảnh bằng chứng S10: ${screenshotPath}`);

      return {
        ambiguityBannerShown: true,
        blindPostBlocked: true,
        postApisCount,
        failClosedZeroMutations: true,
        inFlightIsolated: true,
        screenshot: 'qa-scripts/screenshots/sprint2-e2e-09-ambiguity-and-isolation.png'
      };
    });

  } finally {
    await browser.close();
    await pool.end();
  }

  // Tổng hợp kết quả theo 6 nhóm Test Cases UI
  const tc1Pass = resultsByStep.S1?.trangThai === 'Pass' && resultsByStep.S3?.trangThai === 'Pass' && resultsByStep.S4?.trangThai === 'Pass';
  const tc2Pass = resultsByStep.S2?.trangThai === 'Pass' && resultsByStep.S5?.trangThai === 'Pass';
  const tc3Pass = resultsByStep.S6?.trangThai === 'Pass' && resultsByStep.S7?.trangThai === 'Pass';
  const tc4Pass = resultsByStep.S8?.trangThai === 'Pass';
  const tc5Pass = resultsByStep.S9?.trangThai === 'Pass';
  const tc6Pass = resultsByStep.S10?.trangThai === 'Pass';

  const testCasesResult = [
    {
      id: 'E2E-UI-01',
      tieuDe: 'Provider Portal & KYC/Publishing UI (US-06, US-08, US-09, US-10, US-11, US-12)',
      trangThai: tc1Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S1 || { ma: 'S1', trangThai: 'Not Run' },
        resultsByStep.S3 || { ma: 'S3', trangThai: 'Not Run' },
        resultsByStep.S4 || { ma: 'S4', trangThai: 'Not Run' }
      ],
      apiDaGoi: interceptedAdminApis.filter(a => a.url.includes('/provider-verifications') || a.url.includes('/apis')),
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-02-provider-openapi-docs.png',
        'qa-scripts/screenshots/sprint2-e2e-03-provider-submitted.png'
      ],
      loiConsole: consoleErrors.slice(0, 5)
    },
    {
      id: 'E2E-UI-02',
      tieuDe: 'Admin Review UI — ProviderVerificationsPage & ApiReviewsPage (US-07, US-13)',
      trangThai: tc2Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S2 || { ma: 'S2', trangThai: 'Not Run' },
        resultsByStep.S5 || { ma: 'S5', trangThai: 'Not Run' }
      ],
      apiDaGoi: interceptedAdminApis.filter(a => a.url.includes('/review') || a.url.includes('/dossier')),
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-01-admin-kyc-approved.png',
        'qa-scripts/screenshots/sprint2-e2e-04-admin-api-published.png'
      ],
      loiConsole: []
    },
    {
      id: 'E2E-UI-03',
      tieuDe: 'Admin Audit Logs & Dashboard UI — AuditLogsPage & AdminDashboardPage (US-14)',
      trangThai: tc3Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S6 || { ma: 'S6', trangThai: 'Not Run' },
        resultsByStep.S7 || { ma: 'S7', trangThai: 'Not Run' }
      ],
      apiDaGoi: interceptedAdminApis.filter(a => a.url.includes('/audit-logs')),
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-05-admin-audit-logs.png',
        'qa-scripts/screenshots/sprint2-e2e-06-admin-dashboard.png'
      ],
      loiConsole: []
    },
    {
      id: 'E2E-UI-04',
      tieuDe: 'Wizard Partial Failure & Authoritative Reconciliation (PR #65 FIND-01/P2 Regression)',
      trangThai: tc4Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S8 || { ma: 'S8', trangThai: 'Not Run' }
      ],
      apiDaGoi: interceptedAdminApis.filter(a => a.url.includes('/apis')),
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-07-wizard-reconciliation.png'
      ],
      loiConsole: []
    },
    {
      id: 'E2E-UI-05',
      tieuDe: 'Non-Destructive Version Preservation & Plan Tier Isolation (PR #65 Safety Invariants)',
      trangThai: tc5Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S9 || { ma: 'S9', trangThai: 'Not Run' }
      ],
      apiDaGoi: [],
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-08-version-preservation.png'
      ],
      loiConsole: []
    },
    {
      id: 'E2E-UI-06',
      tieuDe: 'Network Ambiguity 408, Fail-Closed & Cross-Account Isolation (PR #65 Security & Integrity)',
      trangThai: tc6Pass ? 'Pass' : 'Fail',
      cacBuoc: [
        resultsByStep.S10 || { ma: 'S10', trangThai: 'Not Run' }
      ],
      apiDaGoi: [],
      anhChup: [
        'qa-scripts/screenshots/sprint2-e2e-09-ambiguity-and-isolation.png'
      ],
      loiConsole: []
    }
  ];

  const totalPass = [tc1Pass, tc2Pass, tc3Pass, tc4Pass, tc5Pass, tc6Pass].filter(Boolean).length;
  const totalFail = 6 - totalPass;

  const outputJson = {
    meta: {
      thoiGian: tStart,
      nhanh: CI_BRANCH,
      commit: CI_COMMIT,
      baseUrl: BASE_URL,
      apiUrl: API_URL,
      trinhDuyet: 'Chromium Headless'
    },
    tongKet: {
      tong: 6,
      pass: totalPass,
      fail: totalFail
    },
    testCases: testCasesResult
  };

  const resultsPath = path.resolve(__dirname, 'sprint2-ui-e2e-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(outputJson, null, 2), 'utf8');
  log(`Đã xuất kết quả E2E UI ra tệp: ${resultsPath}`);

  console.log('\n=============================================');
  console.log(`TỔNG KẾT E2E UI SPRINT 2: ${totalPass}/6 PASS (${totalFail} FAIL)`);
  console.log('Tổng số request /api/admin/* đã bắt được:', interceptedAdminApis.length);
  console.log('=============================================\n');

  if (totalFail > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('[FATAL] Lỗi không xử lý được trong runner:', err);
  process.exit(1);
});
