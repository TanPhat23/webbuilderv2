import { clerk } from '@clerk/testing/playwright';
import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { collaborationTestConfig } from './clerk-test-config';
import { createCollaborationFixture } from './helpers/collaboration-fixture';

test.skip(process.env.E2E_COLLAB !== '1', 'Set E2E_COLLAB=1 and configure two test users and an isolated local API.');

async function openLogic(page: Page) {
  const rail = page.getByRole('navigation', { name: 'Editor panels' });
  const logic = rail.getByRole('button', { name: 'Logic', exact: true });
  await expect(logic).toBeVisible();
  // A click that lands while the editor is still loading can be undone when it
  // restores its panel state, so retry until the panel is really open.
  await expect(async () => {
    if (await logic.getAttribute('aria-pressed') !== 'true') await logic.click();
    await expect(page.getByLabel('New variable name')).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
}

test('two signed-in editors see and persist each other’s logic changes', async ({ page, browser, baseURL }) => {
  const config = collaborationTestConfig(process.env);
  if (!config || !baseURL) throw new Error('Collaboration configuration and baseURL are required.');
  let secondContext: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  const name = `e2e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  let fixture: Awaited<ReturnType<typeof createCollaborationFixture>> | undefined;
  try {
    await page.goto(new URL('/dashboard', baseURL).href);
    const request = async (method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<unknown> => {
      const tokenResponse = await page.request.get(new URL('/api/gettoken', baseURL).href);
      if (!tokenResponse.ok()) throw new Error(`Could not obtain test session token (${tokenResponse.status()}).`);
      const { tokenJWT } = await tokenResponse.json() as { tokenJWT?: string };
      if (!tokenJWT) throw new Error('Test session returned no token.');
      const response = await page.request.fetch(new URL(path, config.apiURL).href, {
        method, headers: { Authorization: `Bearer ${tokenJWT}` }, ...(body === undefined ? {} : { data: body }),
      });
      if (!response.ok()) throw new Error(`Test API ${method} ${path.split('?')[0]} failed (${response.status()}).`);
      return response.status() === 204 ? undefined : response.json();
    };
    fixture = await createCollaborationFixture(request, name, config.email, randomUUID());
    const editorURL = new URL(fixture.editorPath, baseURL).href;
    // Start signed out: browser.newContext() otherwise inherits the owner's storageState from the project config.
    secondContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const second = await secondContext.newPage();
    await second.goto(new URL('/', baseURL).href);
    await clerk.signIn({ page: second, emailAddress: config.email });
    await Promise.all([page.goto(editorURL), second.goto(editorURL)]);
    await Promise.all([openLogic(page), openLogic(second)]);

    const newVariable = page.getByLabel('New variable name');
    await newVariable.fill(name);
    await newVariable.locator('..').getByRole('button', { name: 'Add', exact: true }).click();
    const ownerDefault = page.getByLabel(`${name} default`);
    const collaboratorDefault = second.getByLabel(`${name} default`);
    await expect(ownerDefault).toBeVisible();
    await expect(collaboratorDefault).toBeVisible({ timeout: 20_000 });
    await collaboratorDefault.fill('from collaborator');
    await collaboratorDefault.blur();
    await expect(ownerDefault).toHaveValue('from collaborator', { timeout: 20_000 });
    await page.reload();
    await openLogic(page);
    await expect(page.getByLabel(`${name} default`)).toHaveValue('from collaborator', { timeout: 20_000 });
  } finally {
    try {
      await fixture?.cleanup();
    } finally {
      await secondContext?.close();
    }
  }
});
