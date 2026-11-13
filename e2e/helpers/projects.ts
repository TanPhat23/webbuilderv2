import { test as base, expect, type Page } from '@playwright/test';

/** Marks every project a run creates, so leftovers are easy to find and sweep. */
const RUN_ID = Date.now().toString(36);
export const NAME_PREFIX = 'e2e';

export const uniqueName = (label: string) => `${NAME_PREFIX}-${RUN_ID}-${label}`;

export async function gotoDashboard(page: Page) {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /my projects/i })).toBeVisible({ timeout: 20_000 });
}

export const createDialog = (page: Page) => page.getByRole('dialog');

export async function openCreateDialog(page: Page) {
  const trigger = page.getByRole('button', { name: /create project/i }).first();
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(createDialog(page)).toBeVisible();
}

export const submitCreate = (page: Page) =>
  createDialog(page).getByRole('button', { name: /^create project$/i }).click();

export async function fillCreateForm(page: Page, name: string, description?: string) {
  const dialog = createDialog(page);
  await dialog.getByLabel(/project name/i).fill(name);
  if (description !== undefined) await dialog.getByPlaceholder('Brief description').fill(description);
}

/** The project's card (or list row) on the dashboard, matched by its exact name. */
export const projectCard = (page: Page, name: string) =>
  page.getByRole('heading', { level: 3, name, exact: true });

/** The success toast the app shows once the server has created the project. */
export const createdToast = (page: Page) => page.getByText('Project created successfully!');

/** Deletes a project through the dashboard menu. Returns false if it isn't there. */
export async function deleteProject(page: Page, name: string): Promise<boolean> {
  const heading = projectCard(page, name);
  if (!(await heading.first().isVisible().catch(() => false))) return false;

  const card = heading.first().locator('xpath=ancestor::*[.//button][1]');
  await card.getByRole('button').first().click();
  await page.getByRole('menuitem', { name: /^delete$/i }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: /^delete project$/i }).click();
  await expect(heading).toHaveCount(0, { timeout: 15_000 });
  return true;
}

type Fixtures = {
  /**
   * Create projects through the UI with `trackProject(name)` and they are
   * deleted after the test, pass or fail. Cleanup problems are reported but
   * never fail the test that did the real work.
   */
  trackProject: (name: string) => string;
};

export const test = base.extend<Fixtures>({
  trackProject: async ({ page }, use) => {
    const names: string[] = [];
    await use((name) => {
      names.push(name);
      return name;
    });
    if (names.length === 0) return;
    try {
      await gotoDashboard(page);
      for (const name of names) await deleteProject(page, name);
    } catch (error) {
      console.warn(`e2e cleanup left projects behind (${names.join(', ')}): ${(error as Error).message}`);
    }
  },
});

export { expect };
