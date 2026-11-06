const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function testSprint3() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const page = await context.newPage();

  console.log('--- TESTING SPRINT 3 ---');

  // Login as Consumer
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-email').fill('user@example.com');
  await page.locator('#login-password').fill('User@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Navigate to /dashboard/keys
  await page.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });

  // [Key-1] Open Create Modal
  const openModalBtn = page.locator('button:has-text("Tạo API Key mới")').first();
  await openModalBtn.click();
  await page.waitForSelector('text=Tạo API Key Mới', { state: 'visible' });
  const modalTitle = await page.locator('h3:has-text("Tạo API Key Mới")').innerText();
  const apiIdLabel = await page.locator('label:has-text("API ID")').innerText();
  const labelLabel = await page.locator('label:has-text("Tên gợi nhớ")').innerText();
  const submitBtn = page.locator('button[type="submit"]:has-text("Tạo Khóa")');
  const isSubmitDisabledInitially = await submitBtn.isDisabled();

  console.log('[Key-1] Modal Title:', modalTitle.trim());
  console.log('[Key-1] API ID Label:', apiIdLabel.trim());
  console.log('[Key-1] Key Label Label:', labelLabel.trim());
  console.log('[Key-1] Submit button disabled initially:', isSubmitDisabledInitially);

  // [Key-2] Empty API ID
  await page.locator('input[placeholder*="Production Backend Cluster"]').fill('My Dev Key');
  const isSubmitDisabledWhenEmpty = await submitBtn.isDisabled();
  console.log('[Key-2] Submit button disabled when API ID empty:', isSubmitDisabledWhenEmpty);

  // [Key-3] Input '0'
  const apiIdInput = page.locator('input[placeholder="e.g. 1"]');
  await apiIdInput.fill('0');
  const isPatternValidZero = await apiIdInput.evaluate(el => el.checkValidity());
  const zeroValidationMsg = await apiIdInput.evaluate(el => el.validationMessage);
  console.log('[Key-3] Pattern valid for 0:', isPatternValidZero);
  console.log('[Key-3] Validation message for 0:', zeroValidationMsg);

  // [Key-4] Input 'abc'
  await apiIdInput.fill('abc');
  const isPatternValidAbc = await apiIdInput.evaluate(el => el.checkValidity());
  const abcValidationMsg = await apiIdInput.evaluate(el => el.validationMessage);
  console.log('[Key-4] Pattern valid for abc:', isPatternValidAbc);
  console.log('[Key-4] Validation message for abc:', abcValidationMsg);

  // [Key-5] Input non-existent API ID: 999999
  await apiIdInput.fill('999999');
  await submitBtn.click();
  await page.waitForSelector('.text-error.text-body-xs', { timeout: 5000 });
  const k5_err = await page.locator('.text-error.text-body-xs').innerText();
  console.log('[Key-5] Server error for non-existent API 999999:', k5_err.trim());

  // [Key-6] Conflict test: API 3 already has an active key
  await apiIdInput.fill('3');
  await page.locator('input[placeholder*="Production Backend Cluster"]').fill('Duplicate Key Test');
  await submitBtn.click();
  await page.waitForSelector('.text-error.text-body-xs:has-text("hoạt động đã tồn tại")', { timeout: 5000 });
  const k6_err = await page.locator('.text-error.text-body-xs').innerText();
  console.log('[Key-6] Conflict error message (duplicate active key):', k6_err.trim());
  await page.locator('button:has-text("Hủy")').click();

  // [Key-7] & [Key-8] Valid creation with Published API ID = 7 (QA Weather Core API v1.1 - no active keys)
  await page.locator('button:has-text("Tạo API Key mới")').first().click();
  await page.locator('input[placeholder="e.g. 1"]').fill('7');
  await page.locator('input[placeholder*="Production Backend Cluster"]').fill('Production Cluster Key');
  await page.locator('button[type="submit"]:has-text("Tạo Khóa")').click();

  // Verify One-time Secret Modal [Key-7]
  await page.waitForSelector('text=Khóa API Của Bạn Đã Sẵn Sàng', { timeout: 10000 });
  const secretTitle = await page.locator('h3:has-text("Khóa API Của Bạn Đã Sẵn Sàng")').innerText();
  const warningText = await page.locator('.p-3\\.5.rounded-xl.bg-amber-500\\/10').innerText();
  const secretKey = await page.locator('code.break-all').innerText();
  console.log('[Key-7] Secret modal title:', secretTitle.trim());
  console.log('[Key-7] Warning text:', warningText.replace(/\s+/g, ' ').trim());
  console.log('[Key-7] Raw Secret Key prefix:', secretKey.slice(0, 15) + '...');

  // [Key-8] Copy secret key and close
  const copyBtn = page.locator('button:has-text("Sao chép")');
  await copyBtn.click();
  await page.waitForSelector('button:has-text("Đã chép!")', { timeout: 5000 });
  const copiedLabel = await page.locator('button:has-text("Đã chép!")').innerText();
  console.log('[Key-8] Copy button label after click:', copiedLabel.trim());

  await page.locator('button:has-text("Tôi đã lưu khóa an toàn")').click();
  await page.waitForSelector('text=Hoạt động', { timeout: 5000 });
  const activeBadge = await page.locator('.font-bold:has-text("Hoạt động")').first().innerText();
  console.log('[Key-8] Active badge in table:', activeBadge.trim());

  // [Key-9] Revoke key
  const revokeBtn = page.locator('button:has-text("Thu hồi")').first();
  await revokeBtn.click();
  await page.waitForSelector('text=Xác nhận Thu Hồi', { timeout: 5000 });
  const revokeModalTitle = await page.locator('h3:has-text("Xác nhận Thu Hồi")').innerText();
  console.log('[Key-9] Revoke confirmation modal title:', revokeModalTitle.trim());
  await page.locator('button:has-text("Xác nhận Thu Hồi")').click();
  await page.waitForSelector('text=Đã thu hồi', { timeout: 5000 });
  const revokedBadge = await page.locator('span:has-text("Đã thu hồi")').first().innerText();
  console.log('[Key-9] Revoked badge in table:', revokedBadge.trim());

  // [Key-10] Unauthorized access by Provider
  const contextProv = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageProv = await contextProv.newPage();
  await pageProv.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await pageProv.locator('#login-email').fill('provider@example.com');
  await pageProv.locator('#login-password').fill('Provider@123');
  await pageProv.locator('button[type="submit"]').click();
  await pageProv.waitForURL('**/provider', { timeout: 10000 });
  // Try accessing /dashboard/keys
  await pageProv.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });
  console.log('[Key-10] Provider URL after navigating to /dashboard/keys:', pageProv.url());
  const provPageText = await pageProv.locator('body').innerText();
  const provHasRestrictedMsg = provPageText.includes('Chỉ tài khoản Consumer mới có quyền') || pageProv.url().includes('/403') || pageProv.url().includes('/provider');
  console.log('[Key-10] Provider sees restricted message or redirected:', provHasRestrictedMsg);

  await contextProv.close();
  await context.close();
  await browser.close();
}

testSprint3().catch(err => {
  console.error('ERROR in testSprint3:', err);
  process.exit(1);
});
