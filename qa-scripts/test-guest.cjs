const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function testGuest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Try accessing /dashboard/keys without logging in
  await page.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });
  console.log('Guest accessed /dashboard/keys. Result URL:', page.url());
  const bodyText = await page.locator('body').innerText();
  console.log('Guest Page Title / Content:\n', bodyText.slice(0, 300));

  await context.close();
  await browser.close();
}

testGuest().catch(console.error);

