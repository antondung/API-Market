const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-email').fill('user@example.com');
  await page.locator('#login-password').fill('User@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  await page.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });
  const cards = await page.locator('[data-testid="animated-card"], .rounded-2xl.border').allInnerTexts();
  console.log('Cards count:', cards.length);
  for (let i = 0; i < cards.length; i++) {
    console.log(`--- Card ${i} ---:\n`, cards[i]);
  }

  await context.close();
  await browser.close();
}

diagnose().catch(console.error);
