import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

interface AuthContext {
  userId: string;
  email: string;
  token: string;
}

interface CustomFixtures {
  authenticatedPage: Page;
  authContext: AuthContext;
}

export const test = base.extend<CustomFixtures>({
  authContext: async ({}, use) => {
    const authContext: AuthContext = {
      userId: 'test-user-' + Date.now(),
      email: "chuongtuluan456@gmail.com",
      token: 'test-token-' + Date.now(),
    };
    await use(authContext);
  },

  authenticatedPage: async ({ page, context, authContext }, use) => {
    await page.goto('/sign-in');
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]'));
    const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'));
    const submitButton = page.getByRole('button', { name: /sign in|continue/i }).first();

    if (await emailInput.isVisible()) {
      await emailInput.fill(authContext.email);
      await passwordInput.fill('Hongphat691');
      await submitButton.click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    } else {
      await page.evaluate((token) => {
        localStorage.setItem('auth_token', token);
      }, authContext.token);
      
      await page.goto('/dashboard');
    }

    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect };