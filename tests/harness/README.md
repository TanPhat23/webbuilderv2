# Editor component harness

A login-free page that mounts real editor components in a real browser. There is no Clerk, backend or network, so an agent can try a UI feature, drive it and read the state back.

```sh
bun run harness        # http://127.0.0.1:3200/  (loopback only, strict port)
```

The index page lists the scenarios. Open one with `/?scenario=<name>`. Scenarios: `canvas`, `context-menu`, `empty-page`. The canvas ones also take `&w=800&h=700` to size the stage host.

The server never reads `.env` files (`envDir: false`, no config file). Any request that is not a same-origin GET for a vite module (cross-origin fetch, XHR, beacon, or a server function without a stub) fails and logs `harness: unstubbed request to <url>` to the console.

## Driving it (Playwright or the Playwright MCP)

Navigate to `http://127.0.0.1:3200/?scenario=context-menu`, then use `window.__harness`:

| | |
| --- | --- |
| `scenario` | the scenario name |
| `getElements()` | the element tree from the element store |
| `getSelection()` | `{ selectedElementId, editingElementId, hoveredElementId }` |
| `reset()` | re-seeds the scenario's stores without reloading |
| `stores` | the raw zustand stores (`elements`, `selection`, `viewport`) for anything else |

The site renders inside `#preview-iframe`, so use `page.frameLocator('#preview-iframe').locator('[data-element-id="text-1"]')`. Editor chrome (selection box, menus, handles) is in the parent document. Read `console.error` output: stub gaps show up there.

`tests/canvas-stage.browser.ts` is a worked example (`node --import tsx --test --test-concurrency=1 tests/canvas-stage.browser.ts`). It builds the server from the same `createHarnessConfig`.

## The stub rule

Stub the surroundings, never the behaviour under test. Auth, server functions, realtime transport and permission lookups are stubbed in `harness.config.ts` (`harnessStubs`, files in `stubs/`). Stores, components, hooks and menus under test are the real ones. If a scenario needs a stub for the thing it exercises, it is not testing that thing.

## Adding a scenario

1. Create `scenarios/<name>.tsx` exporting a `Scenario` (`scenario.ts`): `{ name, description, seed(), render() }`.
   - `seed()` calls `seedEditor({ elements, project?, pages?, selectedElementId? })` from `seed.ts`. It resets the element, selection, viewport and chrome stores and the project query cache.
   - `render()` returns the real component. The shell already provides react-query, `EditorContext` (full permissions), `AIChatProvider` and a memory router.
2. Add it to the array in `scenarios/index.ts`.
3. Reusable trees live in `trees.ts`. If a new component needs a module that reaches the network, add a stub to `harnessStubs` rather than editing the component.
