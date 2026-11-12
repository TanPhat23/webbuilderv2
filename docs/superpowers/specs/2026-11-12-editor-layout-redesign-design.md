# Editor layout redesign — design

Date: 2026-11-12 · Status: approved in brainstorming, awaiting spec review

## Goal

Restructure the editor (`/editor/$id`) into a single, de-duplicated layout
(Webflow-style "rail + one panel"): every existing control keeps exactly one
home, the canvas gets more room, and an empty page offers a real starting
point. No feature is removed. Panel *contents* are reused, not rewritten.

## Problems with the current editor

- Two nested shadcn `SidebarProvider`s (`EditorShell.tsx`) produce a double
  left column (icon rail + tabbed panel) and shared, conflicting state.
- "Tools" tab hides Pages / Images / CMS / Snapshots / Workflows; "Settings"
  appears both bottom-left and as a right-panel tab.
- Almost every component tile uses the same generic icon.
- Header: ~8 unlabeled icon toggles in two separate mode groups (Visual/Code
  and Editor/Wireframe), a lone blue Share button.
- Right panel with no selection shows a floating eye button, a context card
  and a shortcuts list — nothing actionable.
- Empty page offers only a small "+ Add section" at the bottom.

## Layout

```
┌───────────────────────────── top bar (44px) ─────────────────────────────┐
│ project / Page ▾   [Design|Wireframe|Code] [📱 ▯ 🖥 1440]   ⚡ 💬 👥 Share Preview Publish │
├────┬──────────────┬──────────────────────────────────┬───────────────────┤
│rail│ panel 240px  │            canvas                │ inspector 260px   │
│ 46 │ (active rail │                                  │ Style · Settings  │
│ px │  item)       │                                  │                   │
└────┴──────────────┴──────────────────────────────────┴───────────────────┘
```

### Top bar — `EditorTopBar`

- Left: project name + page switcher dropdown (replaces `ProjectBreadcrumb`
  and the page search).
- Centre: one segmented control **Design · Wireframe · Code**, then
  `ViewportControls`.
- Right: `EventModeToggle` (icon), comments toggle (icon), presence
  (`CollaboratorIndicator`), Share (`CollaborationButton`), **Preview**
  (link to `/preview/$id`, new tab; replaces "View Live"), **Publish**
  (primary, neutral foreground colour; uses `usePublishProject`, shows
  "Unpublish" state when `project.published`).

Mode mapping (no change to `editorprovider` API):

| Segment   | `editingMode` | `mode`      |
|-----------|---------------|-------------|
| Design    | `visual`      | `editor`    |
| Wireframe | `visual`      | `wireframe` |
| Code      | `code`        | `editor`    |

In Code mode the panel and inspector are hidden (as today).

### Rail + panel

One rail, one panel. Rail items are a data array
(`id, label, icon, shortcut?, component`) rendering existing contents:

| Rail item | Content (existing)            |
|-----------|-------------------------------|
| Insert    | `ElementSelector`             |
| Layers    | layers tree (from `EditorSideBar` "layers" tab) |
| Pages     | Pages section (from "tools")  |
| Assets    | Images section                |
| CMS       | CMS section                   |
| — divider — |                             |
| Workflows | Workflows section             |
| History   | `SnapshotManager`             |
| AI        | `AIChat`                      |
| (bottom) Project settings | link/dialog to project settings |

Clicking the active item collapses the panel; ⌘\ toggles it. Rail items have
tooltips with label + shortcut.

### Inspector — `Inspector` (renamed from `LayoutSideBar`)

- Tabs **Style · Settings** for the selected element (existing `Styles` and
  `Settings` configurations).
- `CssTextareaImporter` (today's "Code" tab) becomes an **Import CSS** action
  inside Style.
- No selection → new `PageProperties` view instead of `SidebarEmptyState`'s
  shortcuts list. It shows only what a `Page` already stores (name, type,
  page-level `Styles` such as background) plus a link to project settings; no
  new persisted fields. `SidebarEmptyState.tsx` is deleted.
- Keyboard shortcuts move to a `?` dialog (`ShortcutsDialog`), opened by `?`
  key or a top-bar menu.
- ⌘. toggles the inspector.

### Canvas

- `EmptyPageStarter`: when the current page has no root elements, the canvas
  shows "Start this page" with: Blank section, 2–3 section templates (from
  `customComps` via `ElementFactory.createElementFromTemplate`), and
  "Generate with AI" (opens the AI rail panel). Hidden in read-only mode.
- `AddSectionDivider` stays for non-empty pages.

### Component icons

`elementCategories.ts` gains a per-type lucide icon map; `ElementSelector`
tiles use it. Every element type gets a distinct icon.

## State — `useEditorChromeStore` (zustand, `persist` to localStorage)

```ts
{ activePanel: RailId; panelOpen: boolean; inspectorOpen: boolean;
  setActivePanel(id): void; togglePanel(): void; toggleInspector(): void }
```

Selecting a rail item sets `activePanel` and opens the panel; selecting the
already-active item closes it. Storage failures fall back to defaults
(`insert`, open, open).

## Files

- New: `editor/layout/EditorLayout.tsx`, `editor/layout/EditorRail.tsx`,
  `editor/layout/railItems.tsx`, `editor/topbar/EditorTopBar.tsx`,
  `editor/topbar/ModeSwitch.tsx`, `editor/topbar/PublishButton.tsx`,
  `sidebar/Inspector.tsx`, `sidebar/PageProperties.tsx`,
  `editor/ShortcutsDialog.tsx`, `editor/EmptyPageStarter.tsx`,
  `store/editor-chrome-store.ts`.
- Replaced/removed: `EditorShell.tsx` (→ `EditorLayout`), `EditorSideBar.tsx`
  (split into rail items), `LayoutSideBar.tsx` (→ `Inspector`),
  `EditorHeader.tsx` + `header/CanvasModeControls.tsx` (→ top bar).
- Removed: `SidebarEmptyState.tsx`.
- Modified: `elementCategories.ts`, `ElementSelector.tsx`, `EditorCanvas.tsx`.

(Paths relative to `src/features/editor/components/` except the store.)

## Out of scope

Canvas iframe style isolation (CSS #2), element-styling unification (#3),
new inspector controls, an "Interactions" tab, drag-to-resize panels,
mobile editor layout.

## Testing

- Unit: chrome store transitions (select / reselect / toggle, persistence
  fallback); mode switch mapping both directions.
- Browser (dev server): each rail item opens its panel; ⌘\ and ⌘. collapse;
  Design/Wireframe/Code switch correctly; empty page shows starter and
  inserting from it works; Publish toggles; mobile/tablet viewports render;
  read-only user sees no starter/insert actions.
- `bun run build` passes.

## Delivery

Three commits on branch `editor-redesign`:
1. Layout shell, rail, chrome store.
2. Top bar + inspector (+ page properties, shortcuts dialog).
3. Empty-page starter + component icons.
