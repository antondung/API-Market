const path = require('path');
const { chromium } = require(path.resolve(__dirname, 'node_modules/playwright'));

const BASE_URL = 'http://localhost:5173';

async function testRevoke() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-email').fill('user@example.com');
  await page.locator('#login-password').fill('User@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  await page.goto(`${BASE_URL}/dashboard/keys`, { waitUntil: 'networkidle' });

  // Find the Revoke button on Card 1 (API ID 7)
  const revokeBtn = page.locator('button:has-text("Thu hồi")').first();
  await revokeBtn.click();
  await page.waitForSelector('text=Xác nhận Thu Hồi', { timeout: 5000 });
  const revokeModalTitle = await page.locator('h3:has-text("Xác nhận Thu Hồi")').innerText();
  const warningText = await page.locator('.p-3\\.5.rounded-xl.bg-error\\/10').innerText();
  console.log('[Key-9] Revoke confirmation modal title:', revokeModalTitle.trim());
  console.log('[Key-9] Warning text in revoke modal:', warningText.replace(/\s+/g, ' ').trim());

  await page.locator('button:has-text("Xác nhận Thu Hồi")').click();
  await page.waitForTimeout(2000);

  // Read Card 1 text after revoke
  const cards = await page.locator('[data-testid="animated-card"], .rounded-2xl.border').allInnerTexts();
  console.log('[Key-9] Card 1 after revoke:\n', cards[1]);

  await context.close();
  await browser.close();
}

testRevoke().catch(console.error);

