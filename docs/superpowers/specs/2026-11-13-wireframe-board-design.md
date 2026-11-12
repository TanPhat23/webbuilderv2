# Wireframe board

Date: 2026-11-13 · Branch: `editor-redesign` · Status: approved direction

## Goal

Turn Wireframe mode into a board that shows every page of the project side by
side as low-fidelity sketches drawn from the real elements. The open page can
be restructured on the board (add, reorder, duplicate, delete sections). The
mode lives inside the new editor layout instead of replacing it.

## Why

Today's wireframe mode (`WireframeView` → `WireframeManager`,
`WireframeSidebar`, `WireframeCanvas`) is half-built:

- The block library is mock data. Every block creates the same empty Section,
  and it passes the block's *name* as `parentId`.
- "Convert to Design" has no handler.
- "Clear All" deletes every real element on the page with no confirmation.
- It replaces the whole editor with its own header and an old shadcn
  `Sidebar`, so there's no top bar, rail, page switcher or Publish.
- It shows one page as a list of rows labelled "Preview".

## Non-goals

- Editing more than one page at a time. The collaboration connection is
  page-scoped, so only the open page is editable.
- A separate wireframe draft or a "convert" step. The board is a view of the
  real page data.
- Free pan/zoom, connectors between pages, or sitemap hierarchy.
- Styling. The inspector is hidden in Wireframe.
- Changes to the Go API.

## Behaviour

### Frame

Wireframe renders inside `EditorLayout`:

- The top bar, mode switch (Design / Wireframe / Code) and rail stay.
- The inspector is hidden.
- The canvas area shows the board instead of the iframe canvas.
- `editorprovider` no longer swaps the whole layout for `WireframeView`.

In Wireframe the **Insert** rail item shows a **Sections** library instead of
the element list. The other rail panels (Layers, Pages, Assets, CMS,
Workflows, History, AI) are unchanged.

### Board

- A horizontally scrolling row holds one column per page, in the order of the
  project's page list, with a "+ New page" tile at the end. The tile opens the
  existing create-page dialog and is hidden without `canCreatePages`.
- Each column has a header with the page name, a CMS badge for dynamic pages
  (`Type === "dp"`) and the section count. Below it is a frame containing one
  sketch per top-level element.
- The open page:
  - has a highlighted frame and an "Editing" badge;
  - reads the live elements from the element store, so it reflects unsaved
    and collaborative edits;
  - is scrolled into view when Wireframe opens.
- Other pages:
  - are dimmed and show "Click to edit";
  - read from `GET /api/v1/elements/:projectId` (`elementService.getElements`,
    which exists but is unused), grouped by `pageId`;
  - are fetched when Wireframe is entered and refetched when the open page
    changes;
  - on click, navigate to `/editor/$id?page=<pageId>` while the mode stays
    Wireframe.
- States:
  - loading: skeleton columns;
  - fetch error: other pages show "Couldn't load this page" with a Retry
    button, and the open page still works because it doesn't depend on the
    request;
  - a page with no elements shows "Empty page".

### Sketches

A pure function turns an element tree into a sketch tree, and a small
renderer draws it in neutral greys only:

| Element | Drawn as |
|---|---|
| Heading | thick bar (width from text length, clamped) |
| Text, Span, Label, Blockquote, Code | 1–3 thin lines from text length |
| Button, Link | pill (Link: a short underlined line) |
| Image, Video, IFrame, Carousel | crossed box, fixed aspect |
| Input, Textarea, Select, Checkbox, Radio | outlined field |
| Icon | small square |
| Separator, Progress | hairline / thin bar |
| Containers (Section, Frame, Form, List, Nav, Header, Footer, …) | box whose children are laid out in a row or column |

Container direction comes from the element's base styles
(`styles.default.display` / `flexDirection`). Flex with `row` (or the default
flex direction) and grid lay out as a row; everything else is a column. Grid
with N columns wraps at N.

Limits keep sketches small:

- Nesting is drawn to depth 4. Deeper content becomes a single "…" block.
- A container shows at most 6 children, plus a "+N" block.

No text content is rendered, apart from the section's name in its label.

### Editing the open page

Controls appear on hover or selection, and only for the open page:

- **Select:** click a section. This sets the shared selected element, so the
  same element is selected when you switch to Design.
- **Open in Design:** double-click a section. The mode switches to Design with
  that element selected.
- **Reorder:** drag by the handle, or use the move up/down buttons
  (`moveElement` before/after a sibling).
- **Duplicate:** inserts a deep copy with fresh ids directly after the section.
- **Delete:** removes the section. There's no confirmation, because undo
  restores it.
- **Add:**
  - a `+` appears between sections, and at the top and bottom, on hover. It
    opens a small picker (Blank section plus the template categories) and
    inserts at that position.
  - dragging a tile from the Sections panel onto the open page inserts at the
    drop position, with a drop indicator line. A drop onto another page is
    ignored.

Permissions: add needs `canCreateElements`, delete needs `canDeleteElements`,
and reorder needs `canReorderElements`. When the editor is read-only or locked,
no controls render and the board is view-only.

"Clear All" and "Convert to Design" are removed.

### Sections library

The library is built from the existing `customComps` templates, grouped by
their source folder: Navigation (navbar), Header, Hero & landing (landing-page
sections), Sidebar, Form, Footer. Site templates (whole pages) are excluded.

Each tile shows a mini sketch produced by the same sketch function, plus the
template name. Clicking a tile appends the section to the open page. Tiles are
draggable onto the board.

## Architecture

New folder `src/features/editor/components/wireframe/` (replacing its current
contents):

- `sketchModel.ts`: pure, no React.
  - `toSketch(element, depth?)` returns a `SketchNode`
    (`{ kind, dir?, cols?, lines?, width?, children? }`);
  - `groupByPage(elements)` returns a `Map<pageId, EditorElement[]>` of
    top-level elements. It accepts both nested trees and flat lists with
    `parentId`;
  - `cloneWithNewIds` and `dropTarget`. The template groups are a static
    `sectionTemplateGroups` export in `lib/customcomponents/customComponents.ts`.
- `Sketch.tsx`: renders a `SketchNode`.
- `useBoardPages.ts`: combines `useProjectPages`, the live elements for the
  open page, and a react-query fetch of all project elements for the others.
- `WireframeBoard.tsx`: the board, page columns, and loading/error/empty states.
- `PageColumn.tsx`: header and frame; either editable or click-to-open.
- `SectionBlock.tsx`: one sketch with its toolbar, drag handle and selection.
- `InsertPoint.tsx`: the `+` between sections and its picker.
- `SectionsLibrary.tsx`: the Sections panel.
- `sectionActions.ts`: `insertTemplateAt`, `insertBlankAt`, `duplicateSection`
  and `moveSection`, built on `ElementFactory`,
  `insertElementRelative`/`addElement` and `moveElement`.

Wiring:

- `providers/editorprovider.tsx` always renders `EditorLayout` and no longer
  renders `WireframeView`.
- `EditorLayout` hides the inspector when `mode === "wireframe"`.
- The route component (`-editor.tsx`) renders `WireframeBoard` in place of the
  canvas when `mode === "wireframe"`.
- `railItems.tsx`: the Insert item renders `SectionsLibrary` in Wireframe.

Deleted: `editor/WireframeView.tsx`, `wireframe/WireframeManager.tsx`,
`wireframe/WireframeSidebar.tsx`, and the old `wireframe/WireframeCanvas.tsx`.

## Edge cases

- **Stale other pages:** the fetch is the saved state. It is refetched on
  entering Wireframe and on page switch, and there is no polling.
- **Open page not yet synced:** the open column shows a skeleton until
  `collab.isSynced` (the same gate as the empty-page starter), so an empty
  column is never shown for a page that has content.
- **Many pages:** columns have a fixed width (240px) and render lazily while
  off-screen via `content-visibility: auto`.
- **Very long pages:** each frame grows with its content, and the board
  scrolls vertically as a whole.
- **Unknown element types** (custom elements) are drawn as a plain box.

## Testing

`tests/sketch-model.test.ts` (node:test) covers:

- `toSketch` for a heading, a short and a long text, a button, an image, an
  input, and an unknown type.
- Container direction: flex row, flex column, block, and grid with 3 columns.
- The depth limit (a "…" node at depth 4) and the child limit ("+N").
- `groupByPage` with a nested tree, with a flat list using `parentId`, and
  with elements spread over two pages.
- `cloneWithNewIds` (fresh ids, re-parented children) and `dropTarget` (gap to
  move, no-ops).

Manual browser check:

- the board with 1, 3 and many pages;
- click-to-open stays in Wireframe;
- add from `+` and by drag;
- reorder, duplicate and delete, then undo;
- double-click opens Design with the element selected;
- a read-only role sees no controls;
- other pages show their saved state after a refetch.
