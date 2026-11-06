const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function testSprint2() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('--- TESTING SPRINT 2 ---');
  // Register fresh Provider account
  const freshEmail = `provider_kyc_${Date.now()}@test.com`;
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.locator('button[role="radio"]').nth(1).click();
  await page.locator('#register-name').fill('KYC Tester');
  await page.locator('#register-email').fill(freshEmail);
  await page.locator('#register-password').fill('Provider@123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('text=Đăng ký thành công', { timeout: 10000 });

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-email').fill(freshEmail);
  await page.locator('#login-password').fill('Provider@123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/provider', { timeout: 10000 });

  // Verification page
  await page.goto(`${BASE_URL}/provider/verification`, { waitUntil: 'networkidle' });

  // KYC-1
  const title = await page.locator('h1').innerText();
  const statusBanner = await page.locator('.p-6.rounded-2xl.border').first().innerText();
  const agreementCheckbox = page.locator('input[type="checkbox"]');
  const submitBtn = page.locator('button[type="submit"]');
  console.log('[KYC-1] Title:', title.trim());
  console.log('[KYC-1] Status Banner:', statusBanner.replace(/\s+/g, ' ').trim());
  console.log('[KYC-1] Submit button text:', (await submitBtn.innerText()).replace(/\s+/g, ' ').trim());

  // KYC-5: agreement unchecked -> button is disabled
  const isSubmitDisabled = await submitBtn.isDisabled();
  console.log('[KYC-5] Submit button disabled when agreement unchecked:', isSubmitDisabled);

  // Check agreement
  await agreementCheckbox.check();
  console.log('[KYC-5] Submit button disabled after checking agreement:', await submitBtn.isDisabled());

  const orgInput = page.locator('input[placeholder*="Công ty TNHH"]');
  const emailInput = page.locator('input[type="email"]');
  const urlInput = page.locator('input[type="url"]').first();

  // KYC-2: Empty org name
  await orgInput.fill('');
  await emailInput.fill(freshEmail);
  await urlInput.fill('https://alpha.vn/gpdkkd.pdf');
  await submitBtn.click();
  const orgValidationMsg = await orgInput.evaluate(el => el.validationMessage);
  console.log('[KYC-2] HTML5 validation message on empty org name:', orgValidationMsg);

  // KYC-8: Whitespace org name -> passes HTML5 required, triggers JS setFormError
  await orgInput.fill('     ');
  await emailInput.fill(freshEmail);
  await urlInput.fill('https://alpha.vn/gpdkkd.pdf');
  await submitBtn.click();
  await page.waitForSelector('[role="alert"]', { timeout: 3000 });
  const kyc8_err = await page.locator('[role="alert"]').innerText();
  console.log('[KYC-8] Error for whitespace org name:', kyc8_err.trim());

  // KYC-3: Empty email
  await orgInput.fill('Công ty TNHH Giải pháp Số API Hub');
  await emailInput.fill('');
  await urlInput.fill('https://alpha.vn/gpdkkd.pdf');
  await submitBtn.click();
  const emailValidationMsg = await emailInput.evaluate(el => el.validationMessage);
  console.log('[KYC-3] HTML5 validation message on empty email:', emailValidationMsg);

  // KYC-6: Invalid email syntax (missing @)
  await emailInput.fill('legal_company_domain.com');
  await submitBtn.click();
  const emailSyntaxMsg = await emailInput.evaluate(el => el.validationMessage);
  console.log('[KYC-6] HTML5 validation message on invalid email:', emailSyntaxMsg);

  // KYC-4: Empty URL
  await emailInput.fill('legal@tech.vn');
  await urlInput.fill('');
  await submitBtn.click();
  const urlValidationMsg = await urlInput.evaluate(el => el.validationMessage);
  console.log('[KYC-4] HTML5 validation message on empty URL:', urlValidationMsg);

  // KYC-7: Invalid protocol URL (ftp:// passes HTML5 url, but fails protocol check)
  await urlInput.fill('ftp://myfiles.org/giayphep.pdf');
  await submitBtn.click();
  await page.waitForSelector('[role="alert"]', { timeout: 3000 });
  const kyc7_err = await page.locator('[role="alert"]').innerText();
  console.log('[KYC-7] Error for ftp URL:', kyc7_err.trim());

  // KYC-9: Happy path
  await urlInput.fill('https://alpha.vn/gpdkkd.pdf');
  await page.locator('button:has-text("Thêm liên kết")').click();
  const urlInputs = await page.locator('input[type="url"]').all();
  await urlInputs[1].fill('https://alpha.vn/mst.pdf');
  await submitBtn.click();
  await page.waitForSelector('[role="status"]', { timeout: 10000 });
  const successText = await page.locator('[role="status"]').innerText();
  const statusAfter = await page.locator('.p-6.rounded-2xl.border').first().innerText();
  const orgDisabledAfter = await orgInput.isDisabled();
  console.log('[KYC-9] Success message:', successText.replace(/\s+/g, ' ').trim());
  console.log('[KYC-9] Status banner after submit:', statusAfter.replace(/\s+/g, ' ').trim());
  console.log('[KYC-9] Form locked/disabled:', orgDisabledAfter);

  // KYC-10: Unauthorized access
  const contextConsumer = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageConsumer = await contextConsumer.newPage();
  await pageConsumer.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await pageConsumer.locator('#login-email').fill('user@example.com');
  await pageConsumer.locator('#login-password').fill('User@123');
  await pageConsumer.locator('button[type="submit"]').click();
  await pageConsumer.waitForURL('**/dashboard', { timeout: 10000 });
  await pageConsumer.goto(`${BASE_URL}/provider/verification`, { waitUntil: 'networkidle' });
  console.log('[KYC-10] Consumer redirected URL:', pageConsumer.url());

  await contextConsumer.close();
  await context.close();
  await browser.close();
}

testSprint2().catch(err => {
  console.error('ERROR in testSprint2:', err);
  process.exit(1);
});
