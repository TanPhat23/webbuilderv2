/**
 * @file e2e/create-project.spec.ts
 *
 * Requirements & Constraints:
 * 1. Authenticated backend requirement:
 *    - These tests interact with protected routes (/dashboard) and server actions that require
 *      an active, authenticated Clerk session and a reachable backend/database instance.
 * 2. Need for test account isolation:
 *    - Dedicated test accounts or isolated user contexts must be used to avoid test cross-talk,
 *      concurrency races, and cluttering production or shared user workspaces.
 * 3. Caution regarding project creation cleanup:
 *    - Notice that dialog dismissal tests only cancel the creation modal without persisting records,
 *      whereas successful creation tests generate permanent database records. Proper teardown or
 *      periodic cleanup of test projects is required to prevent database bloat and query slowdown.
 */

import { test, expect } from '@playwright/test';

test.describe('Create Project', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /my projects/i })).toBeVisible({ timeout: 20000 });
  });

  const openCreateDialog = async (page: any) => {
    const btn = page.getByRole('button', { name: /create project/i }).first();
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  };

  test.describe('Dialog Interactions', () => {
    test('should open create project dialog when clicking create button', async ({ page }) => {
      await openCreateDialog(page);

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /create new project/i })).toBeVisible();
      await expect(page.getByText(/set up a new project/i)).toBeVisible();
    });

    test('should display all required form fields', async ({ page }) => {
      await openCreateDialog(page);

      await expect(page.getByLabel(/project name/i)).toBeVisible();
      await expect(page.getByLabel(/description/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /^create project$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    test('should close dialog when cancel button is clicked', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByRole('button', { name: /cancel/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should reset form after successful project creation', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByLabel(/project name/i).fill('Test Project');
      await page.getByPlaceholder('Brief description').fill('Test Description');
      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: /create project/i }).first().click();

      await expect(page.getByLabel(/project name/i)).toHaveValue('');
      await expect(page.getByLabel(/description/i)).toHaveValue('');
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error when submitting empty name', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByLabel(/project name/i).focus();
      await page.getByLabel(/project name/i).blur();
      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByText('Name is required')).toBeVisible();
    });

    test('should not close dialog when submitting with empty name', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('should enable submit button when name field has value', async ({ page }) => {
      await openCreateDialog(page);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      await dialog.getByLabel(/project name/i).fill('Valid Project Name');

      await expect(dialog.getByRole('button', { name: /^create project$/i })).toBeEnabled();
    });

    test('should close dialog only when name is provided', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByRole('button', { name: /^create project$/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByLabel(/project name/i).fill('Now Valid');
      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Project Creation', () => {
    test('should create project with name only', async ({ page }) => {
      await openCreateDialog(page);
      await page.getByLabel(/project name/i).fill(`Test Project ${Date.now()}`);
      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });

    test('should create project with name and description', async ({ page }) => {
      await openCreateDialog(page);

      await page.getByLabel(/project name/i).fill(`Project ${Date.now()}`);
      await page.getByPlaceholder('Brief description').fill('This is a test project description');
      await page.getByRole('button', { name: /^create project$/i }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });


  });

  test.describe('Input Handling', () => {
    test('should accept special characters in project name', async ({ page }) => {
      const specialName = 'Project #1 - Test & Co. (Beta)';

      await openCreateDialog(page);
      await page.getByLabel(/project name/i).fill(specialName);

      await expect(page.getByLabel(/project name/i)).toHaveValue(specialName);

      await page.getByRole('button', { name: /^create project$/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });

    test('should accept long project names', async ({ page }) => {
      const longName = 'A'.repeat(100);

      await openCreateDialog(page);
      await page.getByLabel(/project name/i).fill(longName);

      await expect(page.getByLabel(/project name/i)).toHaveValue(longName);
      await page.getByRole('button', { name: /cancel/i }).click();
    });

    test('should accept long descriptions', async ({ page }) => {
      const longDescription = 'Lorem ipsum dolor sit amet. '.repeat(5);

      await openCreateDialog(page);
      await page.getByPlaceholder('Brief description').fill(longDescription);

      await expect(page.getByPlaceholder('Brief description')).toHaveValue(longDescription);
      await page.getByRole('button', { name: /cancel/i }).click();
    });

    test('should handle whitespace in project name', async ({ page }) => {
      await openCreateDialog(page);
      await page.getByLabel(/project name/i).fill('   Project Name   ');

      await page.getByRole('button', { name: /^create project$/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });

    test('should handle numeric project names', async ({ page }) => {
      await openCreateDialog(page);
      await page.getByLabel(/project name/i).fill('12345');

      await page.getByRole('button', { name: /^create project$/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Multiple Operations', () => {
    test('should handle creating multiple projects in sequence', async ({ page }) => {
      for (let i = 1; i <= 3; i++) {
        await openCreateDialog(page);

        await page.getByLabel(/project name/i).fill(`Sequential Project ${Date.now()}-${i}`);
        await page.getByRole('button', { name: /^create project$/i }).click();

        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
        await page.waitForLoadState('networkidle');
      }
    });

    test('should maintain empty form when reopening dialog', async ({ page }) => {
      for (let i = 0; i < 2; i++) {
        await openCreateDialog(page);

        await expect(page.getByLabel(/project name/i)).toHaveValue('');
        await expect(page.getByLabel(/description/i)).toHaveValue('');

        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper labels for form inputs', async ({ page }) => {
      await openCreateDialog(page);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      await expect(dialog.getByText(/project name/i)).toBeVisible();
      await expect(dialog.getByText(/description/i)).toBeVisible();
    });

    test('should be navigable with keyboard', async ({ page }) => {
      await openCreateDialog(page);

      const nameInput = page.getByLabel(/project name/i);
      const descriptionInput = page.getByLabel(/description/i);

      await nameInput.focus();
      await expect(nameInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(descriptionInput).toBeFocused();
    });

    test('should have proper button types', async ({ page }) => {
      await openCreateDialog(page);

      await expect(page.getByRole('button', { name: /cancel/i })).toHaveAttribute('type', 'button');
      await expect(page.getByRole('button', { name: /^create project$/i })).toHaveAttribute('type', 'submit');
    });
  });
});