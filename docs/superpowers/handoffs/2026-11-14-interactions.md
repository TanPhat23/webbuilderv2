# Handoff: interactions redesign (2026-11-14)

The old event workflows are being replaced by **interactions**, which are stored per element, plus page- and project-level **logic** (variables and flows). Plans 1 and 2 are done and committed. Plan 3 is mostly done; removing the old workflows is still to do.

- Spec: `docs/superpowers/specs/2026-11-13-interactions-design.md`
- Plan 1 (core): `docs/superpowers/plans/2026-11-13-interactions-core.md`
- Plans 2 and 3 progress log (what was built and why): `docs/superpowers/plans/2026-11-13-interactions-logic-and-migration.md`

## Repositories and state

| Repo | Branch | Interactions work | Uncommitted changes (all the user's; do not commit) |
|---|---|---|---|
| `~/Code/webbuilderv2` (frontend) | `editor-redesign` | `d00bb2e`…`872caad` (Plan 1), `0031852`…`d79cd5a` (Plans 2 and 3) | `eventworkflows/components/WorkflowEditor.tsx`, `eventworkflows/hooks/useWorkflowCanvas.ts` |
| `~/Code/Go/webbuilder.api.go` | current branch, on top of `b94ce0a` | `5e949ed` DB columns, `306d339` realtime at `/ws` + logic sync, `2c568e2` public page fix, `3f1790a` workflow migration tool | GORM generics/UUIDv7 refactor (`internal/handlers`, `internal/repositories`, `internal/services`, `internal/dto`, `pkg/ids`, `benchmarks`, `docs/gorm-generics-migration.md`); slog/requestid (`cmd/main.go`, `pkg/configs`, `pkg/utils/response.go`, three lines in `cmd/api/main.go`); element-ordering (OrderKey) work copied from realtimev2 (the `"OrderKey"` upsert line in `internal/realtime/repository/element_repository.go`, the helper in `internal/realtime/tests/unit/ws_echo_test.go`, two tests in `realtime_schema_integration_test.go`) |
| `~/Code/Go/webbuilder.realtimev2.go` | — | none; superseded by the API's `internal/realtime` | The user's OrderKey work, plus a dev-only `devUser` edit to `middleware/auth.go` from Plan 1 testing. The early logic files there are obsolete. **Never commit in this repo.** |

Nothing has been pushed. Push or merge only when the user asks.

## Rules

- Playwright and Clerk sign-in are allowed only through `bun run test:e2e:collab`, which uses the dev Clerk instance (`sk_test_` keys only) and a throwaway backend. Run any other Playwright or Clerk sign-in only if the user asks. The user runs the rest themselves (they use Firefox).
- `webbuilder.realtimev2.go/.env` and the API's `.env` point at real databases. For PostgreSQL and Redis, use only throwaway Docker containers on random ports, set explicitly through `WEBBUILDER_TEST_DATABASE_URL`, `WEBBUILDER_TEST_REDIS_ADDR` and `WORKFLOW_MIGRATION_TEST_DATABASE_URL`. A `webbuilder-local-postgres` container holds a local copy used for migration testing. Leave it alone.
- Stage explicit paths, never `git add -A`. The API's uncommitted changes belong to the user.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prefer the Grep tool. If it's unavailable, use grep via Bash.

## Verify

```bash
# frontend
npx tsc --noEmit -p .
npm run -s test:unit                                  # 319 pass
node --import tsx --test tests/logic-panel.browser.ts # headless, no sign-in

# API (from ~/Code/Go/webbuilder.api.go)
go build ./... && go vet ./...
env -u DATABASE_URL -u REDIS_ADDR go test -count=1 ./...   # DB-backed tests skip without the test env vars
```

`tests/interactions-logic-parity.test.ts` checks that `tests/fixtures/logic-parity.json` is identical to the API copy at `internal/realtime/domain/logic/testdata/parity.json`. Set `WEBBUILDER_API_DIR` if the API repo isn't at the default path. Change both copies together.

## Key decisions

- A logic document can be stored if it has **no error-level issues**. Empty step fields and unparseable `{{ }}` templates count as incomplete drafts: they are stored, and only that step fails when it runs. Codegen turns an incomplete step into a comment. The Go and TypeScript validators must agree; the parity fixtures enforce this.
- Logic documents carry a `revision` (`00004_logic_revision.sql`). Clients drop any document older than the one they hold, which covers a sync racing a broadcast.
- `/api/generate-code` rejects interactions that have errors. Codegen whitelists toast kinds, skips unknown events, and strips comment terminators and U+2028/U+2029 from comments. `code` steps use `new Function` by design.
- Realtime now runs inside the API process. Goose owns the schema, and nothing runs DDL at startup.
- In DEV_MODE, the API's realtime uses a fixed identity (`DEV_USER_ID`). There is no `?devUser=` override.

## Open work, in rough priority

1. **Apply migrations** `00002`–`00004` to real databases. This is the user's call; never do it yourself.
2. **Old workflow removal (Plan 3).** The migration tool (`cmd/workflow-migration`) previews by default; its apply mode is local only and needs the editor and realtime offline plus reconciled Redis page caches. The frontend skips migrated links via `migrationCutover.ts`, but the old runtime and editor still exist. Plan the cutover before deleting anything.
3. **`scripts/it-realtime.sh`** still builds `webbuilder.realtimev2.go` and relies on `?devUser=`. Point it at the API's `/ws` and a DEV_MODE identity.
4. **Smaller bugs:**
   - undo can't restore a deleted flow that has an incomplete step (`logic-store.ts`, undo calls `editLogic` without `allowIncomplete`);
   - soft-deleted pages count in logic name checks (`internal/realtime/repository/logic_repository.go`, no `"DeletedAt" IS NULL`);
   - `logic:update` trusts the client's `pageId` (`logic_handlers.go`);
   - `pending` can go negative after a rebind (`logic-store.ts` `bindRemote`/`unbindRemote`).
5. **Multiple API instances:** `Hub.BroadcastProject` only reaches rooms on the local instance. This only matters if the API runs as more than one instance; ask the user.
6. **Two-user live editing** is covered by `bun run test:e2e:collab` (see Follow-up progress). The rest of `bun run test:e2e` is still run by the user.
7. **Deferred events:** timers, paste, contextmenu and resize are not in `ON_EVENTS`.

## Follow-up progress

- The four smaller bugs in item 4 are fixed and covered by regression tests.
- `scripts/it-realtime.sh` now smoke-tests the API's `/ws` in DEV_MODE and runs the multi-client integration suite against a loopback-only test harness with synthetic identities. The suite includes real client providers performing concurrent logic edits, syncing literal nulls, moving a variable, and reconnecting. Both use disposable databases; the harness does not test Clerk.
- The deployment is expected to use a single API instance, so cross-instance broadcasts are not needed for the current deployment.
- The user confirmed there are no workflows. The legacy frontend editor and linked workflow runtime have been removed, as have legacy WebSocket write handlers and REST write routes. Legacy REST reads and database tables remain for the compatibility release. Uncommitted edits from the removed editor are preserved in `2026-11-14-preserved-workflow-edits.patch`.
- Variables and flows can now move between the current page and project as a single authorized PostgreSQL transaction. Both revisions and documents are broadcast together; the Logic panel and store support moves, undo, redo, and rejection rollback. Tests exercise the store, message routing, and the real WebSocket handler with disposable PostgreSQL. The UI remains unverified in a live authenticated editor; the user runs Playwright and Clerk sign-in.
- Literal nulls in object-variable defaults now sync through explicit paths alongside merge patches, including nested values and undo. The API validates these paths and retains the original null-deletes semantics of ordinary merge patches.
- The Logic panel shows loaded references for variables and flows, with element links that select the referenced canvas element. References on unloaded pages are not included.
- `createOperations` in `ops-store.ts` exposes validated interaction and logic edits plus a description of the loaded page. The editor uses the same store operations; describing a different page or a page paired with another project's logic is rejected.
- Fresh verification also passed the API realtime and workflow-migration database tests, and the superseded realtime repository's database/Redis unit tests, using disposable PostgreSQL and Redis containers with explicit test environment variables.
- On disposable PostgreSQL, Goose migrations 00002–00004 were rolled back and reapplied after creating a project; the existing project record remained. Rolling back 00002 drops the new logic columns and their contents.
- An opt-in `e2e/collaboration.spec.ts` prepares a second Clerk test session, creates a temporary project, grants the second existing test user editor access, checks a live logic update and persistence, and cleans up its resources. It requires two test users present in an isolated local backend's database; see `e2e/README.md`. It now runs end to end with `bun run test:e2e:collab` and passes. That script (`scripts/e2e-collab.sh`):
  - starts disposable PostgreSQL and Redis;
  - applies the goose migrations;
  - copies the two Clerk test users (`E2E_EMAIL`, `E2E_COLLAB_EMAIL`, from `.env.test` or `.env`) into `"User"`;
  - runs the API from a scratch directory with an explicit environment;
  - runs Playwright against it, then removes everything.

  Port 3000 must be free. Clerk's testing token is set up in `e2e/clerk.global-setup.ts` so that every worker gets it.
- Getting it to pass fixed `GET /api/v1/projects/:id/pages` in the API. It used to always fail: the service required a published project, then called the repository with an empty user ID. It now passes the user ID through (`project.service.go`, `interface.go`, `project.handler.go`, `test/services/project_test.go`). The fix is uncommitted and sits alongside the user's uncommitted refactor in the same files.
