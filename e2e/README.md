# E2E Tests Guide

This directory contains end-to-end tests for the WebBuilder application using Playwright.

## Quick Start

### 1. Install Playwright Browsers

```bash
bunx playwright install
```

Or with npm:
```bash
npx playwright install
```

### 2. Run Tests

```bash
bun run test:e2e
```

## Running Tests

### Run all tests
```bash
bun run test:e2e
```

### Run tests in UI mode (interactive dashboard)
```bash
bun run test:e2e:ui
```

### Run tests in debug mode (step-by-step)
```bash
bun run test:e2e:debug
```

### View test report
```bash
bun run test:e2e:report
```

### Run specific test file
```bash
bunx playwright test e2e/create-project.spec.ts
```

### Run specific test
```bash
bunx playwright test e2e/create-project.spec.ts -g "should create project"
```

### Run in specific browser
```bash
bunx playwright test --project=chromium
bunx playwright test --project=firefox
bunx playwright test --project=webkit
```

### Run in headed mode (see browser)
```bash
bunx playwright test --headed
```

### Run with custom timeout
```bash
bunx playwright test --timeout=60000
```

## Test Files

### create-project.spec.ts
Main test suite covering:
- Dialog opening and closing
- Form validation
- Project creation
- Input handling (special characters, long names)
- Accessibility
- Multiple operations

### create-project.helper.spec.ts
Example tests using the `CreateProjectHelper` class for cleaner, more maintainable tests.

## Helper Class

The `CreateProjectHelper` class provides convenient methods for interacting with the create project dialog:

```typescript
import { CreateProjectHelper } from './helpers/create-project.helper';

test('example', async ({ page }) => {
  const helper = new CreateProjectHelper(page);
  
  await helper.openDialog();
  await helper.fillProjectName('My Project');
  await helper.fillDescription('Description');
  await helper.submitForm();
});
```

### Available Methods

- `openDialog()` - Opens the create project dialog
- `closeDialog()` - Closes the dialog with cancel button
- `fillProjectName(name)` - Fills the project name field
- `fillDescription(desc)` - Fills the description field
- `clearProjectName()` - Clears the project name field
- `clearDescription()` - Clears the description field
- `submitForm()` - Submits the form
- `createProject(name, desc?)` - Complete flow to create a project
- `isDialogVisible()` - Check if dialog is visible
- `isDialogHidden()` - Check if dialog is hidden
- `getProjectNameValue()` - Get current project name value
- `getDescriptionValue()` - Get current description value
- `isSubmitButtonDisabled()` - Check if submit button is disabled
- `isSubmitButtonEnabled()` - Check if submit button is enabled
- `focusProjectNameInput()` - Focus the name input
- `blurProjectNameInput()` - Blur the name input
- `pressEscapeKey()` - Press Escape key
- `navigateToProjectName()` - Navigate to project name field
- `navigateToDescription()` - Navigate to description field
- `navigateToSubmitButton()` - Navigate to submit button

## Configuration

Configuration is in `playwright.config.ts`:

- **baseURL**: http://localhost:5173
- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 30 seconds per test
- **Expect timeout**: 5 seconds
- **Traces**: Recorded on first retry
- **Screenshots**: Only on failure
- **Videos**: Retained on failure

## Troubleshooting

### ENOSPC: Too many file watchers

This error occurs on Linux when the system hits the file watcher limit.

**Solution 1: Increase file watcher limit (temporary)**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Solution 2: Exclude directories from watching**
Add to your `playwright.config.ts`:
```typescript
webServer: {
  command: 'npm run dev',
  env: {
    VITE_CHOKIDAR_USEPOLLING: 'true',
  },
},
```

**Solution 3: Kill existing processes**
```bash
pkill -f "node.*vite"
pkill -f "npm run dev"
```

**Solution 4: Use polling instead of watching**
```bash
VITE_CHOKIDAR_USEPOLLING=true bun run test:e2e
```

### Tests timeout waiting for server

Increase the webServer timeout in `playwright.config.ts`:
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 300 * 1000, // 5 minutes
},
```

### Dialog/Elements not found

1. Check if selectors have changed in the UI
2. Use debug mode: `bun run test:e2e:debug`
3. Inspect HTML: Use Playwright Inspector
4. Update selectors based on new HTML structure

### Authentication issues

If tests fail at authentication:

1. Check if you're already logged in on localhost:5173
2. Clear browser storage: `bunx playwright test --tracing on`
3. Check browser console for errors
4. Verify auth endpoints are working

### Flaky tests (intermittent failures)

1. Increase timeout: `test.setTimeout(60000)`
2. Use proper wait conditions instead of `page.waitForTimeout()`
3. Ensure `waitForLoadState('networkidle')` after navigation
4. Check for race conditions in async code

## Writing Tests

### Best Practices

1. **Use semantic locators**
   ```typescript
   // ✅ Good
   page.getByRole('button', { name: /create/i })
   page.getByLabel(/project name/i)
   
   // ❌ Avoid
   page.locator('.btn-create')
   page.locator('input[data-id="name"]')
   ```

2. **Wait properly**
   ```typescript
   // ✅ Good
   await page.waitForLoadState('networkidle')
   await page.getByRole('dialog').waitFor({ state: 'visible' })
   
   // ❌ Avoid
   await page.waitForTimeout(2000)
   ```

3. **Isolate tests**
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state before each test
     await page.goto('/dashboard')
   })
   ```

4. **Use fixtures**
   ```typescript
   import { test } from './fixtures'
   
   test('my test', async ({ authenticatedPage }) => {
     // Page is already authenticated
   })
   ```

5. **Clean test names**
   ```typescript
   // ✅ Good - describes what is tested
   test('should create project with name and description')
   
   // ❌ Avoid - vague
   test('create project test')
   ```

### Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/dashboard')
  })

  test.describe('Sub-feature', () => {
    test('should do something', async ({ page }) => {
      // Test implementation
      await page.click('button')
      await expect(page.locator('text=Success')).toBeVisible()
    })
  })
})
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Playwright browsers
  run: bunx playwright install --with-deps

- name: Run E2E tests
  run: bun run test:e2e
```

### Environment variables for CI

Create `.env.test`:
```
BASE_URL=http://localhost:5173
CI=true
```

## Debugging

### Using Playwright Inspector

```bash
bun run test:e2e:debug
```

This opens an interactive debugger where you can:
- Step through tests
- Inspect elements
- Run JavaScript in console
- View network requests

### View traces

Traces are automatically saved on failure. View them:
```bash
bunx playwright show-trace test-results/trace.zip
```

### Screenshots and videos

Located in `test-results/` directory after test failure.

## Performance Tips

1. Run tests in parallel (default in non-CI environments)
2. Use `test.only()` during development
3. Minimize network requests
4. Use fixtures for shared setup
5. Run in headless mode (faster than headed)

## Maintenance

### Update Playwright

```bash
bun update @playwright/test
bunx playwright install
```

### Update selectors

When UI changes break tests:
1. Use debug mode to find new selectors
2. Update locators in tests
3. Consider using data-testid for stability

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)