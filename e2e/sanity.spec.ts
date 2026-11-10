import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Sanity Check', () => {
  test('server is reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL('about:blank');
  });

  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // test('sign-in page is accessible', async ({ page }) => {
  //   await page.goto('/sign-in');
  //   await page.waitForLoadState('networkidle');
  //   await expect(page).toHaveURL(/sign-in/);
  // });

  test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sign-in/);
  });
});