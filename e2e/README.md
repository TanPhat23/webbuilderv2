# End-to-end tests

Playwright runs the tests against the local app and the configured backend. Install the Chromium browser with `bunx playwright install chromium` if needed.

Set `E2E_EMAIL` and `E2E_PASSWORD` in the ignored `.env.test` file or the environment. The setup project signs in through Clerk and saves a browser session in `e2e/.auth/session.json`. Use a dedicated test account: project creation tests write data to that account.

Run `bun run test:e2e` for the suite, `bun run test:e2e:ui` for the interactive runner, or `bun run test:e2e:report` to view the latest report. The configuration starts the Vite development server on port 3000 unless an existing server is already listening there. The backend and authentication service must be available.

The tests in `create-project.spec.ts` cover the dashboard's project creation dialog. `sanity.spec.ts` checks basic navigation and unauthenticated access.
