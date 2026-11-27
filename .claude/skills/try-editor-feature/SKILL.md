---
name: try-editor-feature
description: Use when building or changing an editor feature and you need to see it work in a real browser, or when the editor's login (Clerk) blocks you. Explains the login-free component harness and the signed-in full-stack sandbox, and which to pick.
---

# Trying editor features in a real browser

The real editor sits behind Clerk login. Don't add auth bypasses, and don't ask for passwords. Use one of these two instead.

## Pick one

| Need | Use |
| --- | --- |
| UI behaviour: canvas, menus, panels, stores, keyboard | **Harness**: no login, no backend, starts in seconds |
| Real API or DB data, MCP tools, collaboration, persistence | **Sandbox**: full local stack with a signed-in test user |

Start with the harness. Move to the sandbox only when the feature depends on the server.

## Harness (`tests/harness/`, details in tests/harness/README.md)

1. `bun run harness` starts http://127.0.0.1:3200/. Run it as a background task with a short timeout; never use nohup or &.
2. Open `/?scenario=<name>` (canvas, context-menu, empty-page) with the Playwright MCP or a Playwright script.
3. Read state through `window.__harness` (getElements, getSelection, reset, stores). The site is inside `#preview-iframe`; editor chrome is in the parent document.
4. A new feature usually needs a new scenario: add `tests/harness/scenarios/<name>.tsx` and register it in `scenarios/index.ts`.
5. Stub what surrounds the feature, never the behaviour under test. A console error `harness: unstubbed request to …` means a stub is missing.
6. To keep a check permanently, turn it into a `tests/*.browser.ts` test, using `tests/canvas-stage.browser.ts` as the model.

## Sandbox (`scripts/sandbox/`, details in the "Agent sandbox" section of e2e/README.md)

1. `scripts/sandbox/sandbox.sh up` starts Postgres, Redis, the API, MCP, Vite on 3100 and a signed-in headless browser. It is idempotent and needs docker, plus the Clerk test keys in `.env.test`.
2. `sandbox.sh exec <file.ts>` runs a script whose default export receives `{ page, context, projectId, baseURL, log }`, against the signed-in editor tab. For a one-liner: `sandbox.sh exec -e "await page.getByText('Hero').click(); return page.url()"`. See `scripts/sandbox/examples/`.
3. `sandbox.sh shot <name>`, `canvas` and `console` take a screenshot, read the rendered text or read the browser console. `call <tool> '<json>'` calls an MCP tool.
4. **Always run `sandbox.sh down` when you finish**, even after a failure.

## Machine rules (memory-constrained)

- Run one heavy thing at a time: never the harness and the sandbox together, never parallel test runs.
- Tests: `node --import tsx --test --test-concurrency=1 <files> 2>&1 | tail -30`.
- When you finish, confirm nothing is still listening: `ss -ltnp | grep -E ':(3100|3200)'`.
