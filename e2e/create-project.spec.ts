/**
 * Dashboard "Create Project" flow.
 *
 * Needs a signed-in Clerk session (see global.setup.ts) and a reachable
 * backend. Use a dedicated test account: these tests create real projects.
 * Every project is named `e2e-<run>-<label>` and removed after its test, so a
 * crashed run leaves only clearly marked leftovers.
 *
 * Creation goes through a TanStack server function, not a URL the browser
 * calls directly, so success is judged by what the user sees: the success
 * toast, the dialog closing, and the project card persisting after a reload.
 */
import {
  test,
  expect,
  createDialog,
  createdToast,
  fillCreateForm,
  gotoDashboard,
  openCreateDialog,
  projectCard,
  submitCreate,
  uniqueName,
} from './helpers/projects';

test.beforeEach(async ({ page }) => {
  await gotoDashboard(page);
});

test.describe('dialog', () => {
  test('opens with its fields and actions', async ({ page }) => {
    await openCreateDialog(page);
    const dialog = createDialog(page);

    await expect(dialog.getByRole('heading', { name: /create new project/i })).toBeVisible();
    await expect(dialog.getByLabel(/project name/i)).toBeVisible();
    await expect(dialog.getByLabel(/description/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^create project$/i })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: /cancel/i })).toHaveAttribute('type', 'button');
    await expect(dialog.getByRole('button', { name: /^create project$/i })).toHaveAttribute('type', 'submit');
  });

  test('cancel and Escape close it without creating anything', async ({ page }) => {
    const name = uniqueName('cancelled');

    await openCreateDialog(page);
    await fillCreateForm(page, name);
    await createDialog(page).getByRole('button', { name: /cancel/i }).click();
    await expect(createDialog(page)).toBeHidden();

    await openCreateDialog(page);
    await page.keyboard.press('Escape');
    await expect(createDialog(page)).toBeHidden();

    await expect(projectCard(page, name)).toHaveCount(0);
  });

  test('moves focus from name to description with Tab', async ({ page }) => {
    await openCreateDialog(page);
    const dialog = createDialog(page);

    await dialog.getByLabel(/project name/i).focus();
    await page.keyboard.press('Tab');
    await expect(dialog.getByLabel(/description/i)).toBeFocused();
  });

  test('submits from the keyboard with Enter', async ({ page, trackProject }) => {
    const name = trackProject(uniqueName('enter'));

    await openCreateDialog(page);
    await fillCreateForm(page, name);
    await page.keyboard.press('Enter');

    await expect(createdToast(page)).toBeVisible();
    await expect(createDialog(page)).toBeHidden();
  });
});

test.describe('validation', () => {
  test('an empty name is rejected and the dialog stays open', async ({ page }) => {
    await openCreateDialog(page);
    await submitCreate(page);

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(createDialog(page)).toBeVisible();
    await expect(createdToast(page)).toBeHidden();
  });

  test('fixing the name lets the same dialog submit', async ({ page, trackProject }) => {
    const name = trackProject(uniqueName('fixed'));

    await openCreateDialog(page);
    await submitCreate(page);
    await expect(page.getByText('Name is required')).toBeVisible();

    await fillCreateForm(page, name);
    await submitCreate(page);

    await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText('Name is required')).toBeHidden();
    await expect(projectCard(page, name)).toBeVisible();
  });
});

test.describe('creating', () => {
  test('a project with only a name appears on the dashboard and survives a reload', async ({
    page,
    trackProject,
  }) => {
    const name = trackProject(uniqueName('name-only'));

    await openCreateDialog(page);
    await fillCreateForm(page, name);
    await submitCreate(page);

    await expect(createdToast(page)).toBeVisible();
    await expect(createDialog(page)).toBeHidden();
    await expect(projectCard(page, name)).toBeVisible();

    await page.reload();
    await expect(projectCard(page, name)).toBeVisible({ timeout: 20_000 });
  });

  test('a description is saved with the project', async ({ page, trackProject }) => {
    const name = trackProject(uniqueName('with-description'));
    const description = 'Created by the e2e suite';

    await openCreateDialog(page);
    await fillCreateForm(page, name, description);
    await submitCreate(page);

    await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });
    await expect(projectCard(page, name)).toBeVisible();
    await expect(page.getByText(description).first()).toBeVisible();
  });

  test('the form is empty again after a successful create', async ({ page, trackProject }) => {
    const name = trackProject(uniqueName('reset'));

    await openCreateDialog(page);
    await fillCreateForm(page, name, 'to be cleared');
    await submitCreate(page);
    await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });

    await openCreateDialog(page);
    await expect(createDialog(page).getByLabel(/project name/i)).toHaveValue('');
    await expect(createDialog(page).getByLabel(/description/i)).toHaveValue('');
  });

  test('can create several projects in a row', async ({ page, trackProject }) => {
    const names = [1, 2, 3].map((n) => trackProject(uniqueName(`seq-${n}`)));

    for (const name of names) {
      await openCreateDialog(page);
      await fillCreateForm(page, name);
      await submitCreate(page);
      await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });
      await expect(projectCard(page, name)).toBeVisible();
    }
  });

  for (const [label, name] of [
    ['special characters', `${uniqueName('special')} #1 - Test & Co. (Beta) <b>`],
    ['non-ASCII text', `${uniqueName('unicode')} プロジェクト ✓`],
    ['digits', uniqueName('12345')],
    ['a long name', `${uniqueName('long')}-${'A'.repeat(80)}`],
  ] as const) {
    test(`accepts a name with ${label}`, async ({ page, trackProject }) => {
      trackProject(name);

      await openCreateDialog(page);
      await fillCreateForm(page, name);
      await expect(createDialog(page).getByLabel(/project name/i)).toHaveValue(name);
      await submitCreate(page);

      await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });
      await expect(projectCard(page, name)).toBeVisible();
    });
  }
});

test.describe('when the server fails', () => {
  test('keeps the dialog and what was typed, shows an error, creates nothing', async ({ page }) => {
    const name = uniqueName('server-error');
    const description = 'must not be lost';

    // Fail only the create request that carries our unique name; everything
    // else (auth, project list) goes through untouched.
    await page.route('**/_serverFn/**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST' && (request.postData() ?? '').includes(name)) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' });
      } else {
        await route.continue();
      }
    });

    await openCreateDialog(page);
    await fillCreateForm(page, name, description);
    await submitCreate(page);

    await expect(page.getByText(/failed to create project/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(createdToast(page)).toBeHidden();

    // Nothing is lost, and the button is usable again for a retry.
    const dialog = createDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/project name/i)).toHaveValue(name);
    await expect(dialog.getByPlaceholder('Brief description')).toHaveValue(description);
    await expect(dialog.getByRole('button', { name: /^create project$/i })).toBeEnabled();

    await dialog.getByRole('button', { name: /cancel/i }).click();
    await expect(projectCard(page, name)).toHaveCount(0);
  });

  test('a retry after a failure succeeds', async ({ page, trackProject }) => {
    const name = trackProject(uniqueName('retry'));
    let failed = false;

    await page.route('**/_serverFn/**', async (route) => {
      const request = route.request();
      if (!failed && request.method() === 'POST' && (request.postData() ?? '').includes(name)) {
        failed = true;
        await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' });
      } else {
        await route.continue();
      }
    });

    await openCreateDialog(page);
    await fillCreateForm(page, name);
    await submitCreate(page);
    await expect(page.getByText(/failed to create project/i).first()).toBeVisible({ timeout: 15_000 });

    await submitCreate(page);
    await expect(createDialog(page)).toBeHidden({ timeout: 15_000 });
    await expect(projectCard(page, name)).toBeVisible();
  });
});
