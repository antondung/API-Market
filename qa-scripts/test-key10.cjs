const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function testKey10() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-email').fill('provider@example.com');
  await page.locator('#login-password').fill('Provider@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/provider', { timeout: 10000 });

  // Now try accessing /dashboard/keys
  await page.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });
  console.log('Provider navigated to /dashboard/keys. Result URL:', page.url());
  const bodyText = await page.locator('body').innerText();
  console.log('Provider Page Body Preview:\n', bodyText.slice(0, 300));

  await context.close();
  await browser.close();
}

testKey10().catch(console.error);

