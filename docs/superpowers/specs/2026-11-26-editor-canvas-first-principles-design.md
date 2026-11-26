# First-principles editor canvas redesign

**Date** 2026-11-26
**Repo** `webbuilderv2` (`apps/editor`, `packages/site-runtime`, `tests`)
**Status** Approved design, pending written spec review

## 1. Purpose and scope

Redesign the WebBuilder visual editor canvas from first principles around a single-frame spatial stage, a clean site-only iframe, a parent-DOM HUD overlay, a standard direct-manipulation state machine, and a real `@media` responsive style pipeline shared with `apps/sites`.

### Goals

- Isolate user site rendering inside a persistent `<iframe />` containing zero Editor application CSS and zero artificial wrapper padding (`p-4`), never remounting the iframe when switching widths.
- Render all Editor chrome (`SelectionBox`, `HoverBox`, `ElementLabel`, `ResizeChrome`, `SpacingChrome`, `DropIndicator`, `RemoteCursorsOverlay`, width scrub handles, and zoom controls) in the parent Editor DOM so top-of-page badges never clip and handle hit targets remain `1:1` UI pixels at every zoom scale.
- Provide an auto-fit spatial stage (`1440px` desktop scaled to fit between sidebars, `Ctrl+wheel` zoom, `Space+drag` pan, and symmetric left/right width handles) synchronized with active Tailwind responsive breakpoints (`default`, `sm`, `md`, `lg`, `xl`).
- Fix the canvas interaction grammar so single click selects, backdrop click deselects, `Alt+click` selects the parent container, and double click enters inline `contentEditable` text editing.
- Unify sidebar HTML5 drag-and-drop and on-canvas pointer moves onto a single hit-testing and Flex/Grid child-slot engine with edge auto-scrolling.
- Replace unconditional inline breakpoint flattening (`getSafeStyles`) with a deterministic `@media` stylesheet compiler (`compileElementStylesCss`) shared by the Editor iframe and `SitePageView` in `apps/sites`.
- Enforce strict TypeScript safety (zero `any`, explicit return types, discriminated unions) and preserve zero-React-re-render 60fps pointer manipulation.

### Non-goals

- Rendering multiple breakpoint artboards simultaneously on an infinite multi-frame board.
- Changing `WireframeBoard`, `@webbuilder/site-runtime` element React views, Yjs/WebSocket wire protocols, or Go backend endpoints.
- Multi-element marquee or Shift+click group selection transforms.

---

## 2. Architecture and module boundaries

```
Editor (-editor.tsx)
└── CanvasStage (parent DOM, owns zoom/pan/fit + width scrubbers + backdrop click)
    ├── SiteFrame (persistent <iframe>, CSS transform scale(zoom), site-only styles)
    │   └── #wb-site-root (portal target, natural vertical document scroll)
    │       └── ElementLoader -> InteractionHost -> ElementRenderer tree
    └── CanvasHud (parent DOM above iframe, 1:1 UI pixels)
        ├── OutlineClippedLayer (HoverBox, SelectionBox border, SpacingBands, DropIndicator, ComponentBadges)
        └── FloatingChromeLayer (ElementLabel, ResizeChrome handles, SpacingChrome handles, MovingBadge, RemoteCursorsOverlay, AgentOverlay)
```

| Module | Responsibility |
| --- | --- |
| `apps/editor/src/features/editor/store/canvas-viewport-store.ts` | Owns `frameWidthPx`, `zoomMode`, `zoom`, `panX`, `panY`, `activeBreakpoint`, preset actions, width scrubbing, and width-to-breakpoint synchronization. |
| `apps/editor/src/features/editor/components/canvas/CanvasStage.tsx` | Measures stage container bounds, applies auto-fit or manual zoom/pan transforms, renders symmetric left/right width handles, `EmptyPageStarter`, `AddSectionDivider`, `SiteFrame`, and `CanvasHud`. |
| `apps/editor/src/features/editor/components/canvas/SiteFrame.tsx` | Mounts one persistent `<iframe />` (`#preview-iframe`), injects `#wb-tailwind-css`, `#wb-element-styles`, and `#wb-project-css`, and portals `ElementLoader` into `#wb-site-root`. |
| `apps/editor/src/features/editor/components/canvas/rectTracker.ts` | Tracks iframe element rects and projects them into stage coordinates in `requestAnimationFrame` without React state churn. |
| `apps/editor/src/features/editor/components/canvas/CanvasHud.tsx` | Renders hover/selection outlines, `ElementLabel`, `ResizeChrome`, `SpacingChrome`, `DropIndicator`, `ComponentBadge`, and `RemoteCursorsOverlay` in the parent DOM. |
| `apps/editor/src/features/editor/components/canvas/canvasHitTest.ts` | Single hit-testing and Flex/Grid child-slot resolver shared by sidebar HTML5 drops and on-canvas pointer moves, plus empty-page root drop fallback. |
| `apps/editor/src/features/editor/components/canvas/useAutoScroll.ts` | Scrolls `iframe.contentDocument.scrollingElement` smoothly in `requestAnimationFrame` when dragging within `48px` of top or bottom visible frame edges. |
| `apps/editor/src/features/editor/components/canvas/useCanvasController.ts` | Dual-window (`window` + `iframe.contentWindow`) pointer, wheel, pan, click, double-click, pick-mode, HTML5 DnD, and resize/spacing/move session state machine. |
| `apps/editor/src/features/editor/hooks/useEditorShortcuts.ts` | Dual-document keyboard shortcut listener bound to `mountNode?.ownerDocument` and `document`, guarded against active inline text editing and form inputs. |
| `packages/site-runtime/src/elements/lib/compileElementStylesCss.ts` | Pure compiler turning `EditorElement.styles` (`default`, `sm`, `md`, `lg`, `xl`) into scoped `[data-element-id="..."]` and `@media (min-width: ...)` CSS rules. |

---

## 3. Stage camera, viewport presets, and breakpoint synchronization

### State model (`canvasViewportStore`)

```ts
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";
export type ViewportPreset = "mobile" | "tablet" | "desktop";
export type ZoomMode = "fit" | "manual";

export interface CanvasViewportState {
  readonly frameWidthPx: number;
  readonly preset: ViewportPreset | "custom";
  readonly activeBreakpoint: Breakpoint;
  readonly zoomMode: ZoomMode;
  readonly manualZoom: number;
  readonly stageWidthPx: number;
  readonly stageHeightPx: number;
  readonly panX: number;
  readonly panY: number;
}
```

### Constants and equations

- **Preset widths** `mobile = 375`, `tablet = 768`, `desktop = 1440`. Clamped range for custom scrubbing is `320` to `2560`.
- **Stage gutters** `horizontalGutterPx = 64` (leaves room for symmetric width handles on left and right), `topGutterPx = 40` (guarantees `ElementLabel` above an element at `y = 0` never clips), `bottomGutterPx = 32`.
- **Effective zoom**
  - In `"fit"` mode `fitZoom = Math.min(1, Math.max(0.25, (stageWidthPx - horizontalGutterPx) / frameWidthPx))`. A `1440px` desktop frame inside an `860px` stage renders at `1440px` CSS layout width scaled by `0.5528`, while `375px` mobile renders at `1.0`.
  - In `"manual"` mode `effectiveZoom = clamp(manualZoom, 0.25, 2.0)`.
- **Zoom and pan gestures**
  - `Ctrl+wheel` or `Meta+wheel` (inside either parent stage or iframe) switches `zoomMode` to `"manual"` and adjusts `manualZoom` around cursor anchor (`step = exp(-deltaY * 0.0015)`). Clicking the zoom percentage pill in the header resets `zoomMode` to `"fit"` and zeroes `panX` and `panY`.
  - Holding `Space` + primary-button drag pans `panX` and `panY` (clamped so at least `25%` of the frame remains visible).
  - Symmetric width scrub handles sit `12px` outside the left and right edges of the scaled frame; dragging either handle by `dx` changes `frameWidthPx` by `round((dx * 2) / effectiveZoom)` (mirrored from center), switching `preset` to `"custom"`.

### Width and `activeBreakpoint` synchronization rules

1. **Initial state and Desktop preset (`1440px`)** sets `frameWidthPx = 1440`, `preset = "desktop"`, and `activeBreakpoint = "default"` (`Base`, all widths) so primary desktop authoring writes base styles compatible with all existing projects and templates.
2. **Preset buttons in `ViewportControls`**
   - `Mobile` sets `frameWidthPx = 375`, `preset = "mobile"`, `activeBreakpoint = "default"`.
   - `Tablet` sets `frameWidthPx = 768`, `preset = "tablet"`, `activeBreakpoint = "md"`.
   - `Desktop` sets `frameWidthPx = 1440`, `preset = "desktop"`, `activeBreakpoint = "default"`.
3. **Scrubbing width handles** updates `activeBreakpoint` across Tailwind thresholds (`< 640` -> `"default"`, `640..767` -> `"sm"`, `768..1023` -> `"md"`, `1024..1279` -> `"lg"`, `>= 1280` -> `"default"` unless `"xl"` was already active).
4. **Clicking a breakpoint pill (`Base`, `SM`, `MD`, `LG`, `XL`)** in `Inspector` or header sets `activeBreakpoint` directly. If `activeBreakpoint` has a `minWidth` (`sm = 640`, `md = 768`, `lg = 1024`, `xl = 1280`) and `frameWidthPx < minWidth`, `frameWidthPx` widens to `minWidth` so the `@media` styles being edited take visual effect immediately.

---

## 4. Site-only iframe and coordinate projection

### `SiteFrame` isolation

- Renders a single `<iframe id="preview-iframe" />` with no `key` prop tied to viewport preset or width. Changing `frameWidthPx` updates the iframe's CSS `width` (`${frameWidthPx}px`) and wrapper scale transform without reloading the document or remounting React state.
- `srcDoc` is a minimal static shell containing `<meta charset="utf-8" />`, `<meta name="viewport" content="width=device-width, initial-scale=1" />`, base reset `html, body { margin: 0; padding: 0; min-height: 100%; overflow-x: hidden; }`, and `<div id="wb-site-root"></div>`.
- Three style elements in `iframe.contentDocument.head` are updated in place via `textContent` inside `useLayoutEffect`:
  1. `<style id="wb-tailwind-css">` from `useProjectTailwindCss(resolvedElements)`.
  2. `<style id="wb-element-styles">` from `compileElementStylesCss(resolvedElements)`.
  3. `<style id="wb-project-css">` from `sanitizeProjectCss(project?.header?.cssStyles)` (plus `CANVAS_INTERACTION_CSS` for `[data-dragging="true"] { opacity: 0.35; }` and `[data-picking] * { cursor: crosshair !important; }`).
- Zero `<link rel="stylesheet">` or `<style>` nodes from the Editor host document are copied into the iframe.

### Coordinate equations and `RectTracker`

Let `stageRect` be `stageEl.getBoundingClientRect()` and `frameRect` be `iframeEl.getBoundingClientRect()` in parent window coordinates (note `frameRect.width === frameWidthPx * effectiveZoom`).

- **Iframe rect -> Stage HUD rect** for an element `node` inside `iframe.contentDocument`:
  ```ts
  const r = node.getBoundingClientRect(); // relative to iframe client viewport
  const hudRect = {
    left: frameRect.left - stageRect.left + r.left * effectiveZoom,
    top: frameRect.top - stageRect.top + r.top * effectiveZoom,
    width: r.width * effectiveZoom,
    height: r.height * effectiveZoom,
  };
  ```
- **Parent pointer event -> Iframe client coordinates**:
  ```ts
  const iframeClientX = (parentClientX - frameRect.left) / effectiveZoom;
  const iframeClientY = (parentClientY - frameRect.top) / effectiveZoom;
  ```
- **Iframe pointer event -> Stage HUD coordinates**:
  ```ts
  const stageX = frameRect.left - stageRect.left + iframeClientX * effectiveZoom;
  const stageY = frameRect.top - stageRect.top + iframeClientY * effectiveZoom;
  ```
- **Zero-React-churn updates** `RectTracker` coalesces notifications from capture-phase `scroll` on `iframe.contentDocument`, `ResizeObserver` (`node`, `iframe.contentDocument.documentElement`, `stageEl`), `MutationObserver` on `#wb-site-root` (childList/attributes/characterData), `load` capture on images/fonts, and `canvasViewportStore` into a single `requestAnimationFrame` callback that writes `transform` and `width`/`height` directly to registered overlay DOM refs.
- **Clipping** `OutlineClippedLayer` applies a `clip-path` matching `frameRect` inside `stageRect` so outlines of scrolled-off elements do not bleed outside the page frame, while `FloatingChromeLayer` leaves `topGutterPx` unclipped so `ElementLabel` above `r.top === 0` renders in full; once `r.bottom <= 0` or `r.top >= iframeEl.clientHeight`, `SelectionBox` hides until scrolled back into view.

---

## 5. Interaction state machine, drop engine, shortcuts, and cursors

### Selection vs inline text editing (`selection-store.ts`)

`SelectionStoreState` adds `editingElementId: string | undefined` alongside `selectedElementId` and `hoveredElementId`, plus `setEditingElementId(id: string | undefined)`.

1. **Idle hover** `pointermove` over the iframe updates `hoveredElementId` (unless a drag/resize/spacing session is active or `editingElementId` is set).
2. **Primary `pointerdown` on an element**
   - If `pickStore` has an active pick callback, capture-phase click resolves `pick(id)` and blocks all default/selection handlers.
   - If `eventMode` is enabled and the element is interactive (or inside an interactive ancestor), native click passes through to `InteractionHost`.
   - If `editingElementId === hitId`, native caret placement and drag-selection inside `contentEditable` proceed untouched.
   - Otherwise records `{ hitId, startIframeX, startIframeY }` without toggling `contentEditable`.
3. **Pointer release (`<= 4px` screen movement)**
   - Sets `selectedElementId = hitId` and `editingElementId = undefined` (`Alt+click` walks up to `parentId` when `selectedElementId === hitId` or directly selects the parent container).
   - Clicking `CanvasStage` outside `SiteFrame` or clicking empty space inside `#wb-site-root` sets `selectedElementId = undefined` and `editingElementId = undefined`.
4. **Double click on an element**
   - If `canEdit` and `elementUtils.isEditableElement(element)`, sets `selectedElementId = hitId` and `editingElementId = hitId`. `useCanvasElement` sets `contentEditable` only when `editingElementId === element.id`, focuses the node, and places the caret at the click point (`caretPositionFromPoint` / `caretRangeFromPoint`).
   - Blur or `Escape` commits `textContent` (if changed) via `updateElement(id, { content })` and resets `editingElementId = undefined` while keeping `selectedElementId = hitId`.
5. **Pointer drag (`> 4px` screen movement)**
   - Transitions into `moving` session (`useCanvasManipulation`), setting `data-dragging="true"` on the source DOM node.
   - Resize and spacing handle drags convert screen pointer deltas into CSS layout pixels by dividing by `effectiveZoom` (`dxCss = dxScreen / effectiveZoom`, `dyCss = dyScreen / effectiveZoom`).
   - Live dimension and spacing HUD pills subscribe to a lightweight session ref/external store (`useSyncExternalStore` on session transitions `idle <-> resizing/spacing/moving` plus imperative text/band ref updates per frame) rather than calling React `setState` at 60Hz.

### Unified drop hit-testing and auto-scroll

- `resolveCanvasDropTarget(iframeDoc, iframeClientX, iframeClientY, options)` handles both sidebar HTML5 `dragover`/`drop` events (received on either `CanvasStage` or `iframe.contentDocument`) and on-canvas pointer `moving` sessions:
  - When `elements.length === 0` (and `canCreate`), returns `{ kind: "root" }` so dropping anywhere on an empty page inserts cleanly at root.
  - Otherwise uses `iframeDoc.elementsFromPoint(iframeClientX, iframeClientY)` to find the deepest valid `[data-element-id]` candidate (excluding `draggedNode` and its descendants), computes `before` / `after` / `inside`, and when `inside` a non-empty container resolves the nearest Flex/Grid child slot via `resolveNearestChildSlot`.
  - When pointer is below the last top-level section in `#wb-site-root`, resolves `after` the last root element (unless `isComponentPage` already has a root).
- `useAutoScroll` runs a `requestAnimationFrame` loop whenever a sidebar drag or pointer `moving` session is within `48px` of the top or bottom of `frameRect`, scrolling `iframeDoc.scrollingElement` up to `14px/frame` scaled proportionally to edge proximity and re-running hit-testing each frame.
- Legacy `useCanvasRootDrop.ts` is deleted once `useCanvasController` owns root and element drops uniformly.

### Safe keyboard and clipboard controller

- `useEditorShortcuts` attaches keydown listeners to `document` and `mountNode?.ownerDocument` (re-binding automatically whenever `mountNode` changes).
- Immediately returns without action when `editingElementId !== undefined` or `isTypingTarget(event.target)` is true (protecting `contentEditable`, `<input>`, `<textarea>`, `<select>`, and Monaco).
- Removes `getSelectedOrHoveredElement()` fallback from destructive and clipboard actions (`copy`, `cut`, `delete`, `bringToFront`, `sendToBack`); all operate strictly on `selectedElementId`.
- Binds both `Delete` and `Backspace` to `deleteElement()`, `Ctrl/Cmd+Shift+Z` and `Ctrl+Y` to `redo()`, `Ctrl/Cmd+Z` to `undo()`, and `Escape` to step out (`editingElementId -> clear editing`, else `selectedElementId -> parentId ?? undefined`).
- `pasteElement()` inserts `inside` the selected element if it is a container, or `after` the selected element if it is a leaf (falling back to root `addElement` only when nothing is selected).

### Normalized `RemoteCursorsOverlay`

- Outgoing collaborator cursor positions convert pointer events into iframe document coordinates (`docX = iframeClientX + scrollLeft`, `docY = iframeClientY + scrollTop`).
- `RemoteCursorsOverlay` renders inside `CanvasHud` (`FloatingChromeLayer`) at `left = frameLeft + (docX - scrollLeft) * effectiveZoom`, `top = frameTop + (docY - scrollTop) * effectiveZoom`, keeping collaborator pointers aligned across differing zoom scales and sidebar widths.

---

## 6. Responsive `@media` element CSS pipeline

### `compileElementStylesCss` (`packages/site-runtime/src/elements/lib/compileElementStylesCss.ts`)

- Walks the resolved `EditorElement` tree (including nested container children and resolved component instances) in deterministic pre-order.
- Converts camelCase `CSSProperties` keys to kebab-case CSS property names, rejecting custom/invalid property names and stripping `;`, `{`, `}`, `</style`, and `url(javascript:...)` payloads to prevent CSS Breakout / XSS. Numeric values on length properties append `px` matching React's unitless number table (`opacity`, `zIndex`, `fontWeight`, `lineHeight`, `flexGrow`, `flexShrink`, `order`, `zoom`, `scale` remain unitless).
- Emits rules ordered mobile-first so media queries cascade identically to Tailwind:
  1. Base block `[data-element-id="<CSS.escape(id)>"] { ... }` for `styles.default`.
  2. `@media (min-width: 640px)` for `styles.sm`.
  3. `@media (min-width: 768px)` for `styles.md`.
  4. `@media (min-width: 1024px)` for `styles.lg`.
  5. `@media (min-width: 1280px)` for `styles.xl`.
- Both `SiteFrame` (Editor) and `SitePageView` (`apps/sites` / `@webbuilder/site-runtime`) inject this stylesheet.
- `elementUtils.getSafeStyles(element)` is retired from DOM `style={{}}` rendering in `useCanvasElement`, `PreviewElementLoader`, and `ComponentInstanceCanvas` (kept only as a deprecated pure helper or removed after updating all 3 internal call sites), leaving inline `node.style` clean for temporary rAF drag previews.

### Responsive commit flow on canvas manipulation

- `startResize` and `startSpacing` read `activeBreakpoint` from `canvasViewportStore.getState().activeBreakpoint` at gesture start and seed initial styles from `element.styles?.[activeBreakpoint]` merged over rendered `getComputedStyle(node)`.
- During rAF frames, `node.style[prop]` previews the change directly at 60fps (`1,0,0,0` inline specificity overrides `#wb-element-styles` and Tailwind classes cleanly).
- On `pointerup`, if moved:
  1. Commits via `elementUtils.updateElementStyle(element, nextBreakpointStyles, activeBreakpoint, updateElement, dropStaleAxisClass)` (single undo entry, single Yjs/WS `element:update` frame, synchronized `tailwindStyles`).
  2. Restores `node.style` inline snapshot in `useLayoutEffect` / synchronous cleanup right as `#wb-element-styles` flushes so inline styles never linger to mask narrower or wider breakpoints.
- On `Escape`, `pointercancel`, or `window` `blur`, restores `node.style` immediately and writes nothing to `ElementStore`.

---

## 7. Files created, modified, and deleted

### Created
- `packages/site-runtime/src/elements/lib/compileElementStylesCss.ts`
- `apps/editor/src/features/editor/store/canvas-viewport-store.ts`
- `apps/editor/src/features/editor/components/canvas/CanvasStage.tsx`
- `apps/editor/src/features/editor/components/canvas/SiteFrame.tsx`
- `apps/editor/src/features/editor/components/canvas/CanvasHud.tsx`
- `apps/editor/src/features/editor/components/canvas/rectTracker.ts`
- `apps/editor/src/features/editor/components/canvas/canvasHitTest.ts`
- `apps/editor/src/features/editor/components/canvas/useAutoScroll.ts`
- `apps/editor/src/features/editor/components/canvas/useCanvasController.ts`

### Modified
- `packages/site-runtime/src/elements/lib/elementhelper.ts` & `packages/site-runtime/src/index.ts` (export `compileElementStylesCss`, stop inline multi-breakpoint flattening)
- `packages/site-runtime/src/preview/PreviewElementLoader.tsx` & `packages/site-runtime/src/preview/SitePageView.tsx` (inject `compileElementStylesCss` in site runtime, remove inline `getSafeStyles` clobbering)
- `apps/editor/src/app/_protected/editor.$id/-editor.tsx` (mount `CanvasStage` in Design and Code split views)
- `apps/editor/src/features/editor/components/editor/header/ViewportControls.tsx` (bind presets, custom width readout, and zoom-to-fit pill to `canvasViewportStore`)
- `apps/editor/src/features/editor/components/sidebar/Inspector.tsx` (bind `BreakpointButtons` and `StyleTab` to `canvasViewportStore.activeBreakpoint`)
- `apps/editor/src/features/editor/store/selection-store.ts` & `apps/editor/src/features/editor/components/elements/shared/useCanvasElement.ts` (separate `editingElementId` from `selectedElementId`)
- `apps/editor/src/features/editor/components/canvas/useCanvasManipulation.ts`, `resizeMath.ts`, `spacingMath.ts` (zoom-divided deltas, `activeBreakpoint` commits via `updateElementStyle`, zero-60Hz React re-renders)
- `apps/editor/src/features/editor/hooks/useEditorShortcuts.ts` & `apps/editor/src/features/editor/lib/keyBoardEvents.ts` (dual-document mount lifecycle, typing guard, `Backspace` + `Ctrl+Shift+Z`, selection-only actions, relative paste, `Escape` hierarchy)
- `apps/editor/src/features/editor/components/editor/RemoteCursorsOverlay.tsx` (document-space coordinates projected into `CanvasHud`)

### Deleted after caller migration
- `apps/editor/src/features/editor/components/editor/PreviewContainer.tsx`
- `apps/editor/src/features/editor/components/editor/EditorCanvas.tsx`
- `apps/editor/src/features/editor/hooks/useIframePreview.ts`
- `apps/editor/src/features/editor/hooks/useCanvasRootDrop.ts`
- `apps/editor/src/features/editor/components/canvas/CanvasInteractionLayer.tsx`
- `apps/editor/src/features/editor/components/canvas/CanvasOverlay.tsx`
- `apps/editor/src/features/editor/components/canvas/useCanvasDragDrop.ts`
- `apps/editor/src/features/editor/components/canvas/useElementRect.ts`

---

## 8. Verification plan

1. **Unit tests (`tests/`, `bun run test:unit`)**
   - `tests/compile-element-styles-css.test.ts` verifies `default`, `sm`, `md`, `lg`, `xl` media query ordering, unitless vs `px` numeric formatting, nested/component tree traversal, and CSS-injection sanitization.
   - `tests/canvas-viewport-store.test.ts` verifies auto-fit zoom math, manual zoom clamping, preset transitions, symmetric handle width scrubbing, and bidirectional `frameWidthPx <-> activeBreakpoint` rules.
   - `tests/canvas-hit-test.test.ts` verifies parity between sidebar HTML5 drops and pointer moves across empty root, Flex row/col, multi-column Grid child slots, and below-last-section drops.
   - `tests/canvas-interaction-state.test.ts` verifies single-click selection (`editingElementId === undefined`), `Alt+click` parent selection, double-click inline text edit activation/commit, `Escape` step-out hierarchy, and zoom-scaled resize/spacing commits via `updateElementStyle` at `activeBreakpoint`.
   - `tests/editor-shortcuts.test.ts` verifies typing guards (`Delete`/`Backspace` inside `contentEditable` never deletes element), no hover-delete when unselected, `Ctrl+Shift+Z` redo, and relative paste placement.
   - `tests/architecture-boundaries.test.ts` adds a structural assertion verifying `SiteFrame` never queries or clones host `document.head` stylesheets.
2. **Static gates** `bun run typecheck` (0 errors across all 4 workspaces, zero `any`) and `bun run lint` (`oxlint` 0 warnings/errors).
3. **Live browser verification** launch Editor dev server, verify `1440px` auto-fit scaling, width handle scrubbing, single-click select vs double-click text edit, top-of-page `ElementLabel` visibility without clipping, and responsive `MD`/`Base` resize parity with `apps/sites`.
