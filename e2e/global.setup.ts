import { test as setup } from '@playwright/test';
import path from 'path';

export const authFile = path.join(import.meta.dirname, '.auth/session.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="identifier"]').fill(process.env.E2E_EMAIL!);
  await page.getByRole('button', { name: /continue/i }).click();

  await page.locator('input[name="password"]').waitFor({ state: 'visible' });
  await page.locator('input[name="password"]').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /continue/i }).click();

  await page.waitForLoadState('networkidle');

  await page.getByRole('link', { name: /dashboard/i }).waitFor({ state: 'visible', timeout: 20000 });

  await page.context().storageState({ path: authFile });
});