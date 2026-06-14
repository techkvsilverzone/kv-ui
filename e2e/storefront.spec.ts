import { test, expect } from '@playwright/test';

/**
 * Storefront smoke tests. These exercise UI shells and client-side behaviour that
 * doesn't depend on backend data, so they're stable without a seeded API:
 *  - basic rendering + navigation
 *  - the Shop search regression (B1)
 *  - login form validation (B4)
 *  - empty cart state
 */
test.describe('storefront smoke', () => {
  test('home page renders with correct title and nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/KV Silver Zone/i);
    await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
  });

  test('shop search input accepts text without crashing (B1 regression)', async ({ page }) => {
    await page.goto('/shop');
    // The shop page has its own "Search products..." field (distinct from the navbar one).
    const search = page.getByPlaceholder('Search products...').last();
    await search.fill('ring');
    await expect(search).toHaveValue('ring');
    // The page must still be interactive (no uncaught ReferenceError took it down).
    await expect(page.getByRole('heading', { name: /shop silver/i })).toBeVisible();
  });

  test('login form shows a validation error on empty submit (B4 regression)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/required|valid email/i).first()).toBeVisible();
    // Should not have navigated away from /login.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('empty cart shows the empty state', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test('unauthenticated user is redirected from a protected route (I6)', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login$/);
  });
});
