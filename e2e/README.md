# End-to-end tests

The suite uses Firefox, a Clerk development instance and the configured backend. Install the browser with `bunx playwright install firefox` if needed.

Create a dedicated, existing test user in the development Clerk instance. The user must not require MFA or session tasks. A `+clerk_test` email suppresses Clerk's test-user emails. Set these values in the ignored `.env.test` file or in the environment; the two Clerk keys and the test-user emails (`E2E_EMAIL`, `E2E_COLLAB_EMAIL`) can instead come from the app's `.env` when absent from both:

```dotenv
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
E2E_EMAIL=e2e+clerk_test@example.com
```

Use the matching development instance in the app and API. The setup rejects live Clerk keys, obtains a Clerk testing token and signs in with `@clerk/testing`, then saves the session in the ignored `e2e/.auth/session.json`. No test-user password is needed. See [Clerk's authenticated Playwright guide](https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows).

Run `bun run test:e2e` for the suite, `bun run test:e2e:ui` for the interactive runner, or `bun run test:e2e:report` to view the latest report. The configuration starts Vite on port 3000 unless an existing server is listening there. Start the backend separately and point it at an isolated test database: project creation tests write and delete real project records. Both the backend and Clerk must be available.

The tests in `create-project.spec.ts` cover the dashboard's project creation dialog, including validation, persistence, and a failing server. Projects are named `e2e-<run>-<label>` and deleted after each test through `helpers/projects.ts`; if a run crashes, delete leftover `e2e-…` projects by hand. `sanity.spec.ts` checks basic navigation and unauthenticated access.

For the live two-user editor check, run `bun run test:e2e:collab`. It starts throwaway PostgreSQL and Redis, applies the API's migrations, copies both Clerk test users (`E2E_EMAIL`, `E2E_COLLAB_EMAIL`) into that database, starts the API from `GO_API_DIR` (default `~/Code/Go/webbuilder.api.go`) with an explicit environment so its `.env` is never read, runs the test and removes everything. Port 3000 must be free. It needs docker, go, psql, node and bunx; extra arguments go to Playwright (for example `--headed`).

To run it by hand instead, start the API on a loopback address using an isolated test database. Both dedicated Clerk test users must already exist in that database. Set `E2E_COLLAB_EMAIL` to the second user's email and `E2E_TEST_API_URL` to the local API origin, for example `http://127.0.0.1:8080`. Run:

```bash
E2E_COLLAB=1 bunx playwright test e2e/collaboration.spec.ts
```

The test creates a uniquely named temporary project and adds the second user as an editor, checks a live logic edit and reload, then removes the collaborator and soft-deletes the project. It never deletes either test user. The current collaborator API requires the test project to be published, so use only an isolated local backend and database. If interrupted, remove any leftover `e2e_…` projects from the test database. This test is skipped in ordinary suite runs unless `E2E_COLLAB=1` is set; when enabled, missing or unsafe configuration fails rather than silently skipping. The runner starts its own Vite server to ensure its API and WebSocket URLs point at the configured local API.
