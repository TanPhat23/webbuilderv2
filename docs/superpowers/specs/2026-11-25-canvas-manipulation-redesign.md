# Canvas Direct Manipulation Redesign (Resize, Spacing, and Pointer Reorder)

**Date:** 2026-11-25
**Repo:** `webbuilderv2`
**Status:** Approved design — pending spec review

## 1. Intent & Constraints

Redesign the three canvas direct-manipulation systems in the WebBuilder editor—**resize**, **margin / padding / gap spacing**, and **on-canvas swapping / reordering**—from first principles using a Framer / Figma-style interaction model.

### Goals
- Replace bulky/conflicting handles and HTML5 canvas dragging with a single, smooth, pointer-driven manipulation engine.
- Preserve units (`px` vs `%`), seed spacing from actual rendered `getComputedStyle`, and give live 60fps visual feedback without re-rendering the entire canvas tree on every frame.
- Keep **sidebar `+ Insert` drag-and-drop** on HTML5 DnD while moving **on-canvas element reordering / swapping** to Pointer Events.
- Maintain strict TypeScript safety (zero `any`, explicit return types, discriminated unions) and commit exactly one undoable store operation (`updateElement` or `moveElement`) per completed gesture.

### Non-Goals
- Replacing HTML5 DnD in the `+ Insert` / Components / Templates sidebars.
- Changing wire protocols (`element:update`, `element:move`, `element:create`) or backend persistence.
- Adding multi-select bounding-box transforms (out of scope for this redesign).

---

## 2. Unified Gesture State Machine (`useCanvasManipulation`)

All canvas direct manipulation runs through one hook owned by `CanvasInteractionLayer`, exposing a mutually exclusive discriminated union:

```ts
export interface Point {
  readonly x: number;
  readonly y: number;
}

export type DimensionDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type SpacingSide = "top" | "right" | "bottom" | "left";

export type SpacingHandleId =
  | `padding-${SpacingSide}`
  | `margin-${SpacingSide}`
  | "gap";

export interface ResizePreview {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly widthLabel: string;
  readonly heightLabel: string;
  readonly styles: ResponsiveStyles;
}

export interface SpacingPreview {
  readonly kind: "padding" | "margin" | "gap";
  readonly activeSides: readonly SpacingSide[];
  readonly padding: Readonly<Record<SpacingSide, number>>;
  readonly margin: Readonly<Record<SpacingSide, number>>;
  readonly gap: number;
  readonly label: string;
  readonly styles: ResponsiveStyles;
}

export type ManipulationSession =
  | { readonly kind: "idle" }
  | {
      readonly kind: "resizing";
      readonly elementId: string;
      readonly direction: DimensionDirection;
      readonly preview: ResizePreview;
    }
  | {
      readonly kind: "spacing";
      readonly elementId: string;
      readonly handle: SpacingHandleId;
      readonly preview: SpacingPreview;
    }
  | {
      readonly kind: "moving";
      readonly elementId: string;
      readonly elementLabel: string;
      readonly pointer: Point;
      readonly target: DropIndicatorState | null;
    };
```

### Cross-Iframe Pointer Lifecycle & Cancellation
- Every active session attaches `pointermove` and `pointerup` / `pointercancel` to both the iframe `window` (`root.ownerDocument.defaultView`) and the parent `window`, and calls `setPointerCapture` on the initiating target when supported. Fast drags that leave the iframe boundary continue smoothly without stalling.
- Pressing `Escape` on either the iframe or parent `window` cancels the active session immediately: any inline DOM preview styles written during `resizing` or `spacing` are restored to their pre-drag inline values, `data-dragging` is cleared for `moving`, and no store or WebSocket mutation occurs.
- During `resizing` and `spacing`, DOM previews are applied on `requestAnimationFrame` while `session.preview` updates the overlay HUD and bands. On `pointerup`, a single `store.updateElement(elementId, { styles })` commits the change (one undo step, one `element:update` frame).

---

## 3. Resize System (`resizeMath.ts` + `ResizeChrome.tsx`)

### Pure Math (`src/features/editor/utils/element/resizeMath.ts`)
- **Initial snapshot**: Captures `rect = target.getBoundingClientRect()`, `parentRect`, `parentClientSize`, `mainAxis` (from parent `getComputedStyle` if flex), and the element's existing inline `width` / `height` unit (`"%"` if the existing inline style ends with `"%"`, otherwise `"px"`).
- **Unit preservation**: Writes integer `px` by default; preserves `%` (clamped `0..100`, 2 decimals) only if the axis was already explicitly `%`. Minimum rendered dimension is `20px`.
- **Modifiers**:
  - `Shift` on edge handles (`n`, `s`, `e`, `w`): snaps rendered pixels to `8px` increments.
  - `Shift` on corner handles (`ne`, `nw`, `se`, `sw`): locks aspect ratio (`rect.width / rect.height`).
  - `Alt`: symmetric resize from center (doubles axis delta; updates `left` / `top` on `position: absolute` elements so the center remains anchored).
- **Flex Fill clearing**: Dragging an axis that was Fill (`flexGrow` on the flex main axis, or `alignSelf: "stretch"` on the cross axis) clears only that axis's Fill properties and sets `flexShrink: "0"` on the main axis, leaving the perpendicular axis untouched.

### Visual Chrome (`src/features/editor/components/resizehandler/ResizeChrome.tsx`)
- **4 invisible edge hit-strips** (`n`, `s`, `e`, `w`, `8px` thick centered on each border) with appropriate resize cursors (`ns-resize`, `ew-resize`). Hidden on edges shorter than `32px`.
- **4 crisp corner handles** (`nw`, `ne`, `sw`, `se`, `8×8px` white-filled rounded squares with `1.5px` `#3b82f6` border and subtle hover scale). Elements smaller than `24px × 24px` show only `se`.
- **Live Dimension HUD**: While `session.kind === "resizing"`, all inactive handles fade out (`opacity-0 pointer-events-none`) and a compact pill (`320 × 180` or `50% × 240px`) floats `8px` below the bottom edge of the box.

---

## 4. Margin, Padding & Gap System (`spacingMath.ts` + `SpacingChrome.tsx`)

### Pure Math (`src/features/editor/utils/element/spacingMath.ts`)
- **Computed-style seeding**: Reads rendered `paddingTop/Right/Bottom/Left`, `marginTop/Right/Bottom/Left`, and `rowGap`/`columnGap` via `getComputedStyle(target)` so elements styled with Tailwind classes (`p-8`, `mt-4`, `gap-4`) start dragging from their true rendered pixel values.
- **Intuitive sign conventions** (all clamped to `>= 0`):
  - **Padding** (drag *inward* to increase): `top: +dy`, `bottom: -dy`, `left: +dx`, `right: -dx`.
  - **Margin** (drag *outward* to increase): `top: -dy`, `bottom: +dy`, `left: -dx`, `right: +dx`.
  - **Gap**: detects container axis (`row` vs `column` from `getComputedStyle(target)`); uses `+dx` for horizontal containers and `+dy` for vertical containers.
- **Modifiers**:
  - `Alt`: links opposite sides (`top + bottom` or `left + right`).
  - `Alt + Shift`: links all 4 sides uniformly.
  - `Shift` (alone): snaps to `4px` increments.

### Visual Chrome (`src/features/editor/components/resizehandler/SpacingChrome.tsx`)
- **Padding hairline bars**: On selected elements (`≥ 36px` along the relevant axis), 4 subtle emerald (`#10b981`) pill bars sit `6px` inside each edge at low opacity until hovered. Hovering reveals the translucent emerald inset band and pixel pill; dragging updates all affected bands and pills live at 60fps from `session.preview`.
- **Margin hairline bars**: 4 subtle amber/orange (`#f97316`) pill bars sit `6px` outside each edge when the element has non-zero computed margin, when holding `Alt`, or when the spacing toggle on `ElementLabel` is active.
- **Child-gap scrub bar**: On selected flex/grid containers with `≥ 2` visible direct child elements, measures the actual gap rectangle between the first two adjacent children (via `getBoundingClientRect()`). Places a subtle pink/magenta (`#ec4899`) hairline pill inside that gap rather than blocking the container center. Hovering/dragging highlights all adjacent child gaps with translucent bands and a live pixel pill.
- **Live Spacing HUD**: While `session.kind === "spacing"`, unrelated handles hide and a floating pill displays the active metric (e.g., `Padding Top: 24px`, `Padding T/B: 24px`, `Gap: 16px`).

---

## 5. Pointer-Driven Swapping & Reordering

### Gesture Lifecycle
- Remove `draggable={canEdit && !isEditing}` from `useCanvasElement.ts` so canvas elements no longer trigger native HTML5 drags.
- `CanvasInteractionLayer` listens for `onPointerDown` on `[data-canvas-root]`:
  - Ignores non-primary buttons, events inside `[data-canvas-overlay]`, `isEditing` text nodes, `isPicking` mode, `canEdit === false`, and elements inside `inert` shared sections.
  - Records `{ elementId, elementLabel, startX, startY, pointerId }`.
  - Moving `≤ 4px` before `pointerup` leaves normal click selection and double-click text editing completely unaffected.
  - Moving `> 4px` transitions `session` to `{ kind: "moving", elementId, elementLabel, pointer, target }`, sets `data-dragging="true"` on the source node (`opacity: 0.35; pointer-events: none`), and renders a compact floating pill near the cursor.
- On `pointerup`: if `session.target` is non-null, commits `store.moveElement(elementId, target.targetId, target.position)` (one undo step, one `element:move` WS message).

### Hit-Testing & Shared Drop Geometry (`dropPosition.ts`)
- Uses `root.ownerDocument.elementsFromPoint(clientX, clientY)` to find the topmost `[data-element-id]` node outside `[data-canvas-overlay]` and outside the dragged node's subtree (`!draggedNode.contains(candidate)`).
- Extends `isHorizontalFlow` in `dropPosition.ts` to detect both `flex-row` and multi-column `grid` containers (`gridTemplateColumns` with `> 1` track).
- **No-op suppression**: Computes whether inserting `elementId` at `(targetId, position)` produces the exact same parent and index; if so, returns `null` so no misleading drop indicator is shown.
- **Framer-style `DropIndicator`** (shared by both pointer-driven move and sidebar HTML5 insert):
  - `before` / `after`: `2px` `#3b82f6` line with `6px` circular end-caps along the insertion edge.
  - `inside`: dashed `#10b981` container highlight with subtle tint and a compact corner badge (`Inside Frame`, `Inside Section`, etc.).

---

## 6. Module Boundaries & Cleanup

| Module | Responsibility |
| --- | --- |
| `src/features/editor/utils/element/resizeMath.ts` | Pure resize math (unit preservation, snap, aspect-lock, symmetric, Fill clearing). |
| `src/features/editor/utils/element/spacingMath.ts` | Pure padding/margin/gap math (inward/outward signs, modifiers, snap, computed seeding). |
| `src/features/editor/utils/element/dropPosition.ts` | Pure drop position, flex/grid horizontal flow, and no-op sibling-slot detection. |
| `src/features/editor/components/canvas/useCanvasManipulation.ts` | Unified `ManipulationSession` state machine, cross-iframe pointer capture, rAF DOM preview, Escape cancel, atomic commit. |
| `src/features/editor/components/canvas/useCanvasDragDrop.ts` | Sidebar HTML5 DnD inserts only (`create` / `template` / `component` / `snapshot`). |
| `src/features/editor/components/resizehandler/ResizeChrome.tsx` | Invisible edge hit-strips, crisp corner handles, live dimension pill HUD. |
| `src/features/editor/components/resizehandler/SpacingChrome.tsx` | Padding/margin hairline bars, live translucent bands + value pills, child-gap scrub bar. |
| `src/features/editor/components/canvas/CanvasOverlay.tsx` | Hosts `SelectionBox` (with `ResizeChrome` + `SpacingChrome`), Framer-style `DropIndicator`, and floating move pill. |

Legacy files to remove once all imports are migrated:
- `src/features/editor/components/resizehandler/ResizeHandle.tsx`
- `src/features/editor/components/resizehandler/ResizeTooltip.tsx`
- `src/features/editor/components/resizehandler/ResizeContext.ts`
- `src/features/editor/components/resizehandler/SpacingOverlay.tsx`
- `src/features/editor/hooks/useResizeHandler.ts`
- `src/features/editor/utils/element/resizeDrag.ts`
- `src/features/editor/utils/element/resizeStyles.ts`

---

## 7. Verification Plan
- **Unit tests (`tests/`)**:
  - `tests/resize-math.test.ts`: `px` default vs `%` preservation, `Shift` 8px edge snap & corner aspect lock, `Alt` symmetric center resize (including `position: absolute`), flex Fill clearing, `20px` minimum clamp.
  - `tests/spacing-math.test.ts`: computed-style seeding, inward padding & outward margin signs, row vs column gap axis, `Alt` opposite sides, `Alt+Shift` all 4 sides, `Shift` 4px snap, `>= 0` clamp.
  - `tests/drop-position.test.ts`: flex-row, flex-col, multi-column CSS grid, container edge bands, and no-op adjacent-slot suppression.
  - `tests/canvas-manipulation.test.ts`: click vs 4px drag threshold, Escape-to-cancel reverting inline DOM preview without store writes, atomic single commit on `pointerup`, mutual exclusion between handle drags and element move.
- **Existing suites**: `npx tsc --noEmit`, `bunx oxlint --quiet src/`, and full `bun run test:unit`.
