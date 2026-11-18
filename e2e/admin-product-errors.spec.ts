import { readFileSync } from 'fs';
import { expect, test, type Page, type Route } from '@playwright/test';

// The admin product form must say what is missing or wrong, never fail silently
// (owner's video, 2026-11-18: "Creating…" then nothing). The API is faked per test.

const CORS = { 'access-control-allow-origin': 'http://localhost:8080', 'access-control-allow-credentials': 'true' };
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
// 1×1 PNG
const PHOTO = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

type SaveReply = (route: Route) => Promise<void>;

async function openAddProduct(page: Page, onSave: SaveReply) {
  await page.addInitScript(() =>
    localStorage.setItem('kv-silver-user', JSON.stringify({ _id: '1', name: 'Admin', email: 'a@x.in', role: 'admin', isAdmin: true })),
  );
  await page.route(/localhost:5000\/api\/v1\//, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace('/api/v1', '');
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...CORS, 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,PUT,DELETE' } });
    if (req.method() === 'POST' && path === '/admin/products') return onSave(route);
    const json = (body: unknown) => route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/users/me') return json({ _id: '1', name: 'Admin', email: 'a@x.in', role: 'admin', isAdmin: true });
    if (path === '/admin/rate-status') return json({ blocked: false, staleMetals: [], checkedAt: new Date().toISOString() });
    if (path === '/admin/silver-rates' || path === '/admin/gold-rates')
      return json([{ id: 'r', date: today, rateDate: today, ratePerGram: 190, ratePerKg: 190000, purity: '999', createdAt: new Date().toISOString() }]);
    if (path === '/products/categories') return json({ status: 'success', data: [{ name: 'Puja Items', subcategories: [] }] });
    return json(req.method() === 'GET' ? [] : {});
  });
  await page.goto('/admin');
  await page.getByRole('tab', { name: /products/i }).click();
  await page.getByRole('button', { name: 'Add Product' }).click();
}

async function fillValidProduct(page: Page) {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Product Name').fill('Kamachi Vilakku');
  await dialog.locator('input[type=file]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: PHOTO });
  await dialog.getByRole('combobox').filter({ hasText: 'Select a category' }).click();
  await page.getByRole('option', { name: 'Puja Items' }).click();
  await dialog.getByLabel('Weight (e.g. 45g)').fill('19.8');
}

test('pressing Create on an empty form lists what is missing', async ({ page }) => {
  await openAddProduct(page, (r) => r.abort());
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Create Product' }).click();

  await expect(dialog.getByText('Enter the product name')).toBeVisible();
  await expect(dialog.getByText('Add at least one product photo')).toBeVisible();
  await expect(dialog.getByText('Choose a category')).toBeVisible();
  await expect(dialog.getByText('Enter the weight in grams, e.g. 19.8')).toBeVisible();
  await expect(page.getByText('Please fix the highlighted fields')).toBeVisible();
  if (process.env.SHOT) { await page.waitForTimeout(800); await page.screenshot({ path: process.env.SHOT }); } // visual review

  // A size row without a weight is named too.
  await fillValidProduct(page);
  await dialog.getByRole('button', { name: 'Add Size' }).click();
  await dialog.getByLabel('Size label 1').fill('3 Inch');
  await dialog.getByRole('button', { name: 'Create Product' }).click();
  await expect(dialog.getByText('Size "3 Inch" needs a weight in grams, e.g. 20g')).toBeVisible();
  await expect(dialog.getByText('Enter the product name')).toHaveCount(0);
});

test('a too-large rejection says so', async ({ page }) => {
  await openAddProduct(page, (r) => r.fulfill({ status: 413, headers: CORS, contentType: 'text/html', body: '<html>413 Request Entity Too Large</html>' }));
  await fillValidProduct(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Create Product' }).click();
  await expect(page.getByText("Couldn't create the product")).toBeVisible();
  await expect(page.getByText(/too large to upload/)).toBeVisible();
});

test("the server's reason shows under the field it names", async ({ page }) => {
  await openAddProduct(page, (r) =>
    r.fulfill({ status: 400, headers: CORS, contentType: 'application/json', body: JSON.stringify({ status: 'error', statusCode: 400, message: 'weight must be a positive number', field: 'weight' }) }),
  );
  await fillValidProduct(page);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Create Product' }).click();
  await expect(dialog.getByRole('alert').filter({ hasText: 'weight must be a positive number' })).toBeVisible();
});

// Optional: BIG_PHOTO=/path/to/phone.jpg npx playwright test admin-product-errors
test('a phone-sized photo is shrunk before upload', async ({ page }) => {
  test.skip(!process.env.BIG_PHOTO, 'set BIG_PHOTO to a large JPEG to run');
  let sentChars = 0;
  await openAddProduct(page, async (r) => {
    sentChars = (r.request().postData() ?? '').length;
    await r.fulfill({ status: 201, headers: CORS, contentType: 'application/json', body: '{}' });
  });
  await fillValidProduct(page);
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[type=file]').setInputFiles({ name: 'big.jpg', mimeType: 'image/jpeg', buffer: readFileSync(process.env.BIG_PHOTO!) });
  await expect(dialog.locator('img[alt="Product image 2"]')).toBeVisible();
  await dialog.getByRole('button', { name: 'Create Product' }).click();
  await expect(page.getByText('Product Created')).toBeVisible();
  console.log(`original ${readFileSync(process.env.BIG_PHOTO!).length} bytes → request ${sentChars} chars`);
  expect(sentChars).toBeLessThan(700_000);
});
