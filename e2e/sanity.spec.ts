import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Sanity Check', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1, name: /compose visually/i })).toBeVisible();
  });

  test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sign-in/);
  });
});