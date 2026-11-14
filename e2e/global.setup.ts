import { clerk } from '@clerk/testing/playwright';
import { expect, test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { clerkTestConfig } from './clerk-test-config';

export const authFile = path.join(import.meta.dirname, '.auth/session.json');

// The Clerk testing token comes from e2e/clerk.global-setup.ts.
setup('authenticate the test user', async ({ page }) => {
  const { email } = clerkTestConfig(process.env);
  await page.goto('/');
  await clerk.signIn({ page, emailAddress: email });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /my projects/i })).toBeVisible({ timeout: 20_000 });
  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
