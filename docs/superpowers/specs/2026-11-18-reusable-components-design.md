# Reusable components (linked instances) — design

Status: approved decisions, ready to implement. Repos: `webbuilderv2` (web), `webbuilder.api.go`, `webbuilder.mcp.go`.

## Decisions (from the product owner)

- **Linked instances**: one master, many instances; editing the master updates every instance.
- **Scope: both.** A *project library* of linked components, plus an *account library* of reusable snapshots.
- **Agents** can list, create/save and insert components through MCP.

## Core idea: a component is a page

A component master is an ordinary `Page` row whose `Type` is `"cp"` (existing types: `"sp"` static, `"dp"` dynamic).
Its single top-level element is the master. Because it is a normal page:

- it is edited in the normal editor (all inspector tools, collaboration, undo, agent `get_page` / `apply_edits` / `set_code` work with no changes);
- no new table or element storage is needed for project components.

An **instance** is a normal element (usually a `Section`, but any element type that can be a root or child) that carries

```ts
settings.component = {
  pageId: string,            // the "cp" page that holds the master
  rootId: string,            // id of the master's top-level element
  overrides?: Record<string, {   // keyed by master node id (v1: content only)
    text?: string; src?: string; alt?: string; href?: string;
  }>;
}
```

and has **no children of its own** in storage. It follows the same resolve-at-load pattern as shared sections
(`src/features/projects/lib/shared-sections.ts`, `resolveSharedSections`, used by `ElementLoader.tsx` and
`preview/lib/preview-data.ts`): at render time the instance is replaced by a deep copy of the master subtree.

### Resolution rules (`resolveComponents`, pure, unit-tested)

- Copy ids deterministically: copy root keeps the instance `id` and `pageId`; every descendant id becomes `${instanceId}~${masterNodeId}` so ids are stable across renders and unique per instance. Overrides are looked up by the **master** node id.
- Apply `overrides` (text → the element's text content field, src/alt on images, href on links/buttons) after copying. Unknown node ids are ignored. Never apply style overrides (v1).
- Nested components (a master that contains instances) resolve recursively with a depth limit of 8 and cycle detection (a component may not contain itself directly or indirectly); on cycle/limit/missing master, resolve to an empty placeholder: nothing on the published site, a visible "Missing component" box in the editor.
- A master page that is deleted ⇒ instances show the placeholder and offer **Detach**. Deleting a master from the UI warns with the usage count (computed from loaded project elements).
- Instances keep the instance's own `styles` for the **root wrapper only** (margin/width/position), merged over the master root styles. Everything below the root comes from the master.

## Web (`webbuilderv2`)

1. **Types + lib**: `src/features/projects/lib/components.ts` (types, `componentSetting(el)`, `resolveComponents(pageElements, projectElements, componentPageIds)`, `detach`, `usageCount`). Run it right after `resolveSharedSections` in `ElementLoader.tsx` and `preview/lib/preview-data.ts`. Add `"cp"` to page-type zod enums/types.
2. **Pages list**: component pages (`Type === "cp"`) must not appear in the page switcher / routes / sitemap / published site / navigation link pickers. Show them in a separate **Components** section of the left panel (list, rename, delete-with-usage-warning, "Open master" which navigates to that page in the editor). Preview/publish must never serve a `cp` page as a route.
3. **Create**:
   - Context menu on an element → **Create component…** (name dialog): create a `cp` page, move a deep copy (new ids) of the selected element subtree to be its root, replace the original with an instance (same position, `settings.component = {pageId, rootId}`). Must be one undoable step as far as the existing history allows; at minimum do not leave the page half-converted if a request fails.
   - Existing **Save element** (`SaveElementDialog.tsx`) becomes **Save to my library** (account snapshot). Fix its endpoint: the API route is `/api/v1/custom-elements` but `API_ENDPOINTS.CUSTOM_ELEMENTS` points to `/customelements`; make the constants match the API.
4. **Insert**: left-panel **Components** tab lists (a) project components (drag to insert an instance) and (b) account library snapshots (drag to insert a plain copy; a **Make project component** action imports it: creates a `cp` page from the snapshot, then inserts an instance). Reuse the existing drag payload mechanism (`customComponentName` / `setMoveDrag` helpers in `useEditor.ts` and `CanvasInteractionLayer.tsx`).
5. **Instance behaviour on canvas**: an instance is selected as one unit; its descendants are not selectable and show no resize/drag handles. Inspector for an instance shows a **Component** panel: name, **Edit component** (go to the master page), **Detach** (replace with a normal copy of the resolved subtree), **Overrides** (for each text/image/link node in the master, show an editable field keyed by master node id), **Reset overrides**. Indicate instances in the Layers panel (icon) and with a subtle canvas badge.
6. **Account library**: list/delete UI for saved snapshots; **Save component to my library** on a project component (snapshots the master root subtree into the `CustomElement` API).
7. **Agent executor** (`src/features/agent/executor.ts`, `editOps.ts`, `AgentHost.tsx`, `readTree.ts`): 
   - `apply_edits` `create` op gains an optional `component: { id: <cp pageId>, overrides? }` to create an instance (validated: page exists and is `cp`; overrides shape/size limits); `update` may set/clear `settings.component.overrides`.
   - New tools: `list_components` (id, name, usage count, root node summary), `create_component` (name, `fromElementId` → same flow as the context menu; or empty), `detach_component` (elementId).
   - `get_page` (readTree) shows instances as nodes with a `component: {id, name, overrides}` field and no children (do not expand them).
8. Tests: `tests/*.test.ts` for resolve (ids, overrides, nesting, cycles, missing master, detach), editOps validation, executor tools. Keep `npx tsc --noEmit` clean and `node --import tsx --test tests/*.test.ts` green.

## API (`webbuilder.api.go`)

- Add page type `"cp"` wherever page types are validated. Make sure listing/sitemap/publish-by-route code that enumerates a project's pages for public serving excludes `cp`, and that `GET pages` for the editor still returns them (clients filter by type). Find every such place; do not assume.
- Verify the existing `/custom-elements` CRUD works end to end for the account library (create from `{name, description, structure, isPublic, version}`; list only the caller's; delete only own). Fix bugs you find; add repository/handler tests. Name uniqueness is currently global (`uniqueIndex` on `CustomElementType.Name` only for types; check `CustomElement.Name`) — names must be unique per user, not global, if that is not already the case (migration via `make migrate-create`, no AutoMigrate).
- No new project-component table. If you find a reason one is needed, stop and explain instead of adding it.

## MCP (`webbuilder.mcp.go`)

- `get_project`: pages listing marks `type` and excludes `cp` pages from `pages`; add `components: [{id, name, usage}]`.
- Tools `list_components`, `create_component`, `detach_component` relayed to the editor tab (same pattern as `create_page` / `open_page` in `internal/agent/tools_tab.go`); `NewElement` in the `apply_edits` schema gains the `component` field. `get_page` DB fallback must render instances the same way as the live one (node with `component`, no expansion).
- Update the server `instructions`: prefer inserting an existing component over rebuilding repeated UI (cards, pricing tiers, testimonials, navbars); create a component the second time a block repeats; edit the master page to change every instance; overrides are for text/images/links only.
- Tests like the existing `tools_tab_test.go` / `tools_read_test.go` (fake tab, scripted replies). `go vet ./...` and `go test ./...` green. Do not run `gofmt -w` on `internal/agent/verify_test.go`.

## Out of scope (v1)

Style overrides per instance, variants, component props beyond content overrides, cross-project linked components, publishing components to the marketplace.

## Acceptance

1. Select a pricing card → Create component → the card becomes an instance; editing the master page updates it.
2. Drag the component into another page ⇒ second instance; change a text override on one only.
3. Published/preview output contains the resolved markup, no `cp` page route exists.
4. Agent: `list_components`, `apply_edits create {component:{id}}`, `create_component fromElementId`, `get_page` shows instance nodes.
5. All three repos' test suites pass.
