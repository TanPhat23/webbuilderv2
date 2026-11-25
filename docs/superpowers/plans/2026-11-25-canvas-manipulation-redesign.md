# Canvas Direct Manipulation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild canvas resize, margin/padding/gap spacing, and pointer-driven element swapping/reordering from first principles using a single Framer/Figma-style manipulation state machine.

**Architecture:** One unified pointer-driven gesture controller (`useCanvasManipulation`) owns a mutually exclusive `ManipulationSession` discriminated union (`idle | resizing | spacing | moving`) backed by pure, DOM-free math modules (`resizeMath.ts`, `spacingMath.ts`, `dropPosition.ts`). During drag, previews render at 60fps via rAF DOM updates and live overlay chrome (`ResizeChrome.tsx`, `SpacingChrome.tsx`, `CanvasOverlay.tsx`); on release, a single atomic Zustand store mutation commits one undo entry and one WebSocket frame. Sidebar `+ Insert` remains on HTML5 DnD and shares `DropIndicator` + `dropPosition.ts`.

**Tech Stack:** TypeScript (strict, zero `any`), React 19, Zustand, Tailwind CSS, Node `node:test` + `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-25-canvas-manipulation-redesign.md`

## Global Constraints

- Zero `any` Policy: never use `any`; use `unknown` + narrowing, explicit return types on all functions and public APIs, `Readonly<T>` / `Record<K, T>` where appropriate.
- Keep sidebar `+ Insert` on HTML5 DnD (`useCanvasDragDrop.ts`); only on-canvas move/swap switches to Pointer Events.
- Do not break existing `src/features/editor/constants/direction.ts` exports (`directionalClasses`, `getResizeHandles`, `handlesForSize`) tested by `tests/editor-direction-handles.test.ts` and `tests/sizing.test.ts`.
- Every completed gesture commits at most one `updateElement` or `moveElement` call; pressing `Escape` cancels and restores pre-drag inline DOM styles with zero store mutations.
- Verification command: `npx tsc --noEmit && bunx oxlint --quiet src/ && bun run test:unit`.

## Review Focus

1. **Tailwind-styled element with empty inline styles (`p-8`, `mt-4`, `gap-4`)**: Dragging padding/margin/gap must seed from `getComputedStyle(node)` (e.g. `32px`), not `0px`, and restore the original inline `""` on `Escape` — pinned in Task 2 & Task 4 tests.
2. **Dragging fast outside the iframe boundary**: Pointer listeners attached to both the iframe `window` and parent `window` must keep tracking and commit cleanly on `pointerup` outside the iframe — pinned in Task 4 tests.
3. **Click & double-click vs. pointer move threshold**: Moving `≤ 4px` on `pointerdown` → `pointerup` must never enter `moving` state or call `moveElement`, preserving selection and inline text editing — pinned in Task 4 tests.
4. **No-op adjacent-slot reorder**: Dropping an element immediately before its next sibling or immediately after its previous sibling must suppress the drop indicator and avoid a redundant `moveElement` — pinned in Task 3 & Task 4 tests.
5. **Resize of a flex-column element with `height: auto` vs explicit `%`**: Must default to integer `px` (not `%` which collapses in auto-height parents) while preserving `%` when the element already used `%`, and clearing only the dragged axis's flex Fill styles — pinned in Task 1 tests.

---

### Task 1: Pure Resize Math (`resizeMath.ts`)

**Files:**
- Create: `src/features/editor/utils/element/resizeMath.ts`
- Test: `tests/resize-math.test.ts`

**Interfaces:**
- Consumes: `ResponsiveStyles` (`@/types/elements`), `SizeAxis` (`./sizing`)
- Produces:
  - `export type DimensionDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";`
  - `export interface ResizeOrigin { readonly rect: DOMRectReadOnly; readonly parentRect: DOMRectReadOnly; readonly parentWidth: number; readonly parentHeight: number; readonly mainAxis: SizeAxis | null; readonly widthUnit: "px" | "%"; readonly heightUnit: "px" | "%"; }`
  - `export interface ResizePointerInput { readonly clientX: number; readonly clientY: number; readonly shiftKey: boolean; readonly altKey: boolean; }`
  - `export interface ResizePreview { readonly widthPx: number; readonly heightPx: number; readonly widthLabel: string; readonly heightLabel: string; readonly styles: ResponsiveStyles; }`
  - `export function detectLengthUnit(value: string | number | undefined): "px" | "%"`
  - `export function computeResizePreview(direction: DimensionDirection, origin: ResizeOrigin, pointer: ResizePointerInput, currentStyles: ResponsiveStyles | undefined): ResizePreview`
  - `export function resizeCursor(direction: DimensionDirection): string`

- [ ] **Step 1: Write the failing test**

Create `tests/resize-math.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeResizePreview,
  detectLengthUnit,
  resizeCursor,
  type ResizeOrigin,
} from '../src/features/editor/utils/element/resizeMath';

function makeRect(left: number, top: number, width: number, height: number): DOMRectReadOnly {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

function makeOrigin(overrides: Partial<ResizeOrigin> = {}): ResizeOrigin {
  return {
    rect: makeRect(100, 100, 200, 100),
    parentRect: makeRect(0, 0, 1000, 500),
    parentWidth: 1000,
    parentHeight: 500,
    mainAxis: null,
    widthUnit: 'px',
    heightUnit: 'px',
    ...overrides,
  };
}

test('detectLengthUnit preserves % and defaults everything else to px', () => {
  assert.equal(detectLengthUnit('50%'), '%');
  assert.equal(detectLengthUnit('33.33%'), '%');
  assert.equal(detectLengthUnit('200px'), 'px');
  assert.equal(detectLengthUnit('auto'), 'px');
  assert.equal(detectLengthUnit(undefined), 'px');
});

test('east edge resize writes integer px by default and clamps to 20px minimum', () => {
  const origin = makeOrigin();
  const grown = computeResizePreview(
    'e',
    origin,
    { clientX: 350.4, clientY: 150, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(grown.widthPx, 250);
  assert.equal(grown.styles.default?.width, '250px');
  assert.equal(grown.styles.default?.height, undefined);
  assert.equal(grown.widthLabel, '250px');

  const tiny = computeResizePreview(
    'e',
    origin,
    { clientX: 105, clientY: 150, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(tiny.widthPx, 20);
  assert.equal(tiny.styles.default?.width, '20px');
});

test('preserves % unit when axis already used %', () => {
  const origin = makeOrigin({ widthUnit: '%' });
  const res = computeResizePreview(
    'e',
    origin,
    { clientX: 600, clientY: 150, shiftKey: false, altKey: false },
    { default: { width: '20%' } },
  );
  assert.equal(res.styles.default?.width, '50.00%');
  assert.equal(res.widthLabel, '50.00%');
});

test('Shift on edge snaps to 8px increments; Shift on corner locks aspect ratio', () => {
  const origin = makeOrigin();
  const snapped = computeResizePreview(
    'e',
    origin,
    { clientX: 313, clientY: 150, shiftKey: true, altKey: false },
    { default: {} },
  );
  assert.equal(snapped.widthPx, 216);

  const locked = computeResizePreview(
    'se',
    origin,
    { clientX: 400, clientY: 220, shiftKey: true, altKey: false },
    { default: {} },
  );
  // Original aspect ratio is 200:100 (2:1). Width grew by 100 -> 300px, so height becomes 150px.
  assert.equal(locked.widthPx, 300);
  assert.equal(locked.heightPx, 150);
});

test('Alt resizes symmetrically from center and updates absolute offsets', () => {
  const origin = makeOrigin();
  const sym = computeResizePreview(
    'e',
    origin,
    { clientX: 330, clientY: 150, shiftKey: false, altKey: true },
    { default: { position: 'absolute', left: '100px', top: '100px' } },
  );
  // +30px on east with Alt -> +60px total width (260px), left shifts -30px -> 70px
  assert.equal(sym.widthPx, 260);
  assert.equal(sym.styles.default?.left, '70px');
});

test('resizing a flex Fill axis clears Fill on that axis only', () => {
  const origin = makeOrigin({ mainAxis: 'width' });
  const res = computeResizePreview(
    'e',
    origin,
    { clientX: 350, clientY: 150, shiftKey: false, altKey: false },
    { default: { flexGrow: 1, flexBasis: '0px', alignSelf: 'stretch' } },
  );
  assert.equal(res.styles.default?.width, '250px');
  assert.equal(res.styles.default?.flexGrow, undefined);
  assert.equal(res.styles.default?.flexBasis, undefined);
  assert.equal(res.styles.default?.flexShrink, '0');
  assert.equal(res.styles.default?.alignSelf, 'stretch');
  assert.equal(resizeCursor('se'), 'nwse-resize');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/resize-math.test.ts`
Expected: FAIL with module not found (`resizeMath`).

- [ ] **Step 3: Write `src/features/editor/utils/element/resizeMath.ts`**

```ts
import type { ResponsiveStyles } from "@/types/elements";
import type { SizeAxis } from "./sizing";

export type DimensionDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type AxisEdge = -1 | 0 | 1;

interface HandleVector {
  readonly horizontal: AxisEdge;
  readonly vertical: AxisEdge;
  readonly cursor: string;
}

const HANDLE_VECTORS: Readonly<Record<DimensionDirection, HandleVector>> = {
  n: { horizontal: 0, vertical: -1, cursor: "ns-resize" },
  s: { horizontal: 0, vertical: 1, cursor: "ns-resize" },
  e: { horizontal: 1, vertical: 0, cursor: "ew-resize" },
  w: { horizontal: -1, vertical: 0, cursor: "ew-resize" },
  ne: { horizontal: 1, vertical: -1, cursor: "nesw-resize" },
  nw: { horizontal: -1, vertical: -1, cursor: "nwse-resize" },
  se: { horizontal: 1, vertical: 1, cursor: "nwse-resize" },
  sw: { horizontal: -1, vertical: 1, cursor: "nesw-resize" },
};

export interface ResizeOrigin {
  readonly rect: DOMRectReadOnly;
  readonly parentRect: DOMRectReadOnly;
  readonly parentWidth: number;
  readonly parentHeight: number;
  readonly mainAxis: SizeAxis | null;
  readonly widthUnit: "px" | "%";
  readonly heightUnit: "px" | "%";
}

export interface ResizePointerInput {
  readonly clientX: number;
  readonly clientY: number;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

export interface ResizePreview {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly widthLabel: string;
  readonly heightLabel: string;
  readonly styles: ResponsiveStyles;
}

const MIN_SIZE_PX = 20;
const EDGE_SNAP_PX = 8;

export function resizeCursor(direction: DimensionDirection): string {
  return HANDLE_VECTORS[direction].cursor;
}

export function detectLengthUnit(value: string | number | undefined): "px" | "%" {
  return typeof value === "string" && value.trim().endsWith("%") ? "%" : "px";
}

function snapValue(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function formatLength(px: number, unit: "px" | "%", parentTotal: number): string {
  if (unit === "%" && parentTotal > 0) {
    const pct = Math.min(100, Math.max(0, (px / parentTotal) * 100));
    return `${pct.toFixed(2)}%`;
  }
  return `${Math.round(px)}px`;
}

function formatOffset(px: number, unit: "px" | "%", parentTotal: number): string {
  if (unit === "%" && parentTotal > 0) {
    const pct = Math.min(100, Math.max(0, (px / parentTotal) * 100));
    return `${pct.toFixed(2)}%`;
  }
  return `${Math.round(px)}px`;
}

function computeAxis(
  edge: AxisEdge,
  pointer: number,
  start: number,
  size: number,
  parentStart: number,
  symmetric: boolean,
): { size: number; offset: number } {
  if (edge === 0) return { size, offset: start - parentStart };
  const rawDelta = edge === 1 ? pointer - (start + size) : start - pointer;
  const appliedDelta = symmetric ? rawDelta * 2 : rawDelta;
  const nextSize = Math.max(MIN_SIZE_PX, size + appliedDelta);
  const actualDelta = nextSize - size;

  let nextOffset = start - parentStart;
  if (symmetric) {
    nextOffset -= actualDelta / 2;
  } else if (edge === -1) {
    nextOffset -= actualDelta;
  }
  return { size: nextSize, offset: nextOffset };
}

function applyFixedAxis(
  styles: NonNullable<ResponsiveStyles["default"]>,
  axis: SizeAxis,
  value: string,
  mainAxis: SizeAxis | null,
): void {
  styles[axis] = value;
  if (mainAxis === axis && styles.flexGrow !== undefined) {
    delete styles.flexGrow;
    delete styles.flexBasis;
    styles.flexShrink = "0";
  }
  if (mainAxis && mainAxis !== axis && styles.alignSelf === "stretch") {
    delete styles.alignSelf;
  }
}

export function computeResizePreview(
  direction: DimensionDirection,
  origin: ResizeOrigin,
  pointer: ResizePointerInput,
  currentStyles: ResponsiveStyles | undefined,
): ResizePreview {
  const vec = HANDLE_VECTORS[direction];
  const isCorner = vec.horizontal !== 0 && vec.vertical !== 0;

  let x = computeAxis(
    vec.horizontal,
    pointer.clientX,
    origin.rect.left,
    origin.rect.width,
    origin.parentRect.left,
    pointer.altKey,
  );
  let y = computeAxis(
    vec.vertical,
    pointer.clientY,
    origin.rect.top,
    origin.rect.height,
    origin.parentRect.top,
    pointer.altKey,
  );

  if (pointer.shiftKey && !isCorner) {
    if (vec.horizontal !== 0) {
      const snapped = Math.max(MIN_SIZE_PX, snapValue(x.size, EDGE_SNAP_PX));
      const diff = snapped - x.size;
      x = {
        size: snapped,
        offset: pointer.altKey ? x.offset - diff / 2 : vec.horizontal === -1 ? x.offset - diff : x.offset,
      };
    }
    if (vec.vertical !== 0) {
      const snapped = Math.max(MIN_SIZE_PX, snapValue(y.size, EDGE_SNAP_PX));
      const diff = snapped - y.size;
      y = {
        size: snapped,
        offset: pointer.altKey ? y.offset - diff / 2 : vec.vertical === -1 ? y.offset - diff : y.offset,
      };
    }
  } else if (pointer.shiftKey && isCorner && origin.rect.height > 0) {
    const ratio = origin.rect.width / origin.rect.height;
    if (Math.abs(x.size - origin.rect.width) >= Math.abs(y.size - origin.rect.height)) {
      const nextHeight = Math.max(MIN_SIZE_PX, x.size / ratio);
      const diff = nextHeight - origin.rect.height;
      y = {
        size: nextHeight,
        offset: pointer.altKey
          ? origin.rect.top - origin.parentRect.top - diff / 2
          : vec.vertical === -1
            ? origin.rect.top - origin.parentRect.top - diff
            : origin.rect.top - origin.parentRect.top,
      };
    } else {
      const nextWidth = Math.max(MIN_SIZE_PX, y.size * ratio);
      const diff = nextWidth - origin.rect.width;
      x = {
        size: nextWidth,
        offset: pointer.altKey
          ? origin.rect.left - origin.parentRect.left - diff / 2
          : vec.horizontal === -1
            ? origin.rect.left - origin.parentRect.left - diff
            : origin.rect.left - origin.parentRect.left,
      };
    }
  }

  const widthPx = Math.round(x.size);
  const heightPx = Math.round(y.size);
  const widthLabel = formatLength(widthPx, origin.widthUnit, origin.parentWidth);
  const heightLabel = formatLength(heightPx, origin.heightUnit, origin.parentHeight);

  const base = currentStyles ?? { default: {} };
  const nextDefault: NonNullable<ResponsiveStyles["default"]> = { ...base.default };

  if (vec.horizontal !== 0) {
    applyFixedAxis(nextDefault, "width", widthLabel, origin.mainAxis);
  }
  if (vec.vertical !== 0) {
    applyFixedAxis(nextDefault, "height", heightLabel, origin.mainAxis);
  }
  if (nextDefault.position === "absolute") {
    if (vec.horizontal !== 0) {
      nextDefault.left = formatOffset(x.offset, origin.widthUnit, origin.parentWidth);
    }
    if (vec.vertical !== 0) {
      nextDefault.top = formatOffset(y.offset, origin.heightUnit, origin.parentHeight);
    }
  }

  return {
    widthPx,
    heightPx,
    widthLabel,
    heightLabel,
    styles: { ...base, default: nextDefault },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/resize-math.test.ts`
Expected: PASS (5/5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/utils/element/resizeMath.ts tests/resize-math.test.ts
git commit -m "feat(editor): add unit-preserving pure resize math module"
```

---

### Task 2: Pure Spacing Math (`spacingMath.ts`)

**Files:**
- Create: `src/features/editor/utils/element/spacingMath.ts`
- Test: `tests/spacing-math.test.ts`

**Interfaces:**
- Consumes: `ResponsiveStyles` (`@/types/elements`)
- Produces:
  - `export type SpacingSide = "top" | "right" | "bottom" | "left";`
  - `export type SpacingHandleId = \`padding-${SpacingSide}\` | \`margin-${SpacingSide}\` | "gap";`
  - `export type GapAxis = "horizontal" | "vertical";`
  - `export interface ComputedSpacing { readonly padding: Readonly<Record<SpacingSide, number>>; readonly margin: Readonly<Record<SpacingSide, number>>; readonly gap: number; readonly gapAxis: GapAxis; }`
  - `export interface SpacingPreview { readonly kind: "padding" | "margin" | "gap"; readonly activeSides: readonly SpacingSide[]; readonly padding: Readonly<Record<SpacingSide, number>>; readonly margin: Readonly<Record<SpacingSide, number>>; readonly gap: number; readonly label: string; readonly styles: ResponsiveStyles; }`
  - `export function readComputedSpacing(style: Pick<CSSStyleDeclaration, "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "gap" | "rowGap" | "columnGap" | "display" | "flexDirection" | "gridTemplateColumns">): ComputedSpacing`
  - `export function computeSpacingPreview(handle: SpacingHandleId, initial: ComputedSpacing, delta: { readonly dx: number; readonly dy: number; readonly shiftKey: boolean; readonly altKey: boolean }, currentStyles: ResponsiveStyles | undefined): SpacingPreview`
  - `export function spacingCursor(handle: SpacingHandleId, gapAxis: GapAxis): string`

- [ ] **Step 1: Write the failing test**

Create `tests/spacing-math.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSpacingPreview,
  readComputedSpacing,
  spacingCursor,
  type ComputedSpacing,
} from '../src/features/editor/utils/element/spacingMath';

const baseSpacing: ComputedSpacing = {
  padding: { top: 16, right: 20, bottom: 16, left: 20 },
  margin: { top: 8, right: 0, bottom: 8, left: 0 },
  gap: 12,
  gapAxis: 'vertical',
};

test('readComputedSpacing seeds pixel values and detects flex/grid gap axis', () => {
  const row = readComputedSpacing({
    paddingTop: '32px',
    paddingRight: '24px',
    paddingBottom: '32px',
    paddingLeft: '24px',
    marginTop: '12px',
    marginRight: '0px',
    marginBottom: '12px',
    marginLeft: '0px',
    gap: '16px',
    rowGap: '16px',
    columnGap: '16px',
    display: 'flex',
    flexDirection: 'row',
    gridTemplateColumns: 'none',
  });
  assert.equal(row.padding.top, 32);
  assert.equal(row.margin.top, 12);
  assert.equal(row.gap, 16);
  assert.equal(row.gapAxis, 'horizontal');
  assert.equal(spacingCursor('gap', row.gapAxis), 'ew-resize');
});

test('padding drags increase inward and clamp at 0', () => {
  // Dragging down (+dy) on padding-top increases paddingTop
  const topIn = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 10, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(topIn.padding.top, 26);
  assert.equal(topIn.styles.default?.paddingTop, '26px');
  assert.deepEqual(topIn.activeSides, ['top']);

  // Dragging up (-dy) on padding-bottom increases paddingBottom
  const bottomIn = computeSpacingPreview(
    'padding-bottom',
    baseSpacing,
    { dx: 0, dy: -8, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(bottomIn.padding.bottom, 24);

  // Dragging outward past 0 clamps to 0px
  const clamped = computeSpacingPreview(
    'padding-left',
    baseSpacing,
    { dx: -100, dy: 0, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(clamped.padding.left, 0);
  assert.equal(clamped.styles.default?.paddingLeft, '0px');
});

test('margin drags increase outward', () => {
  // Dragging up (-dy) on margin-top increases marginTop
  const topOut = computeSpacingPreview(
    'margin-top',
    baseSpacing,
    { dx: 0, dy: -12, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(topOut.margin.top, 20);
  assert.equal(topOut.styles.default?.marginTop, '20px');

  // Dragging right (+dx) on margin-right increases marginRight
  const rightOut = computeSpacingPreview(
    'margin-right',
    baseSpacing,
    { dx: 14, dy: 0, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(rightOut.margin.right, 14);
});

test('Alt links opposite sides, Alt+Shift links all 4 sides, Shift snaps to 4px', () => {
  const sym = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 10, shiftKey: false, altKey: true },
    { default: {} },
  );
  assert.equal(sym.padding.top, 26);
  assert.equal(sym.padding.bottom, 26);
  assert.equal(sym.styles.default?.paddingTop, '26px');
  assert.equal(sym.styles.default?.paddingBottom, '26px');
  assert.deepEqual(sym.activeSides, ['top', 'bottom']);

  const all = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 7, shiftKey: true, altKey: true },
    { default: {} },
  );
  // 16 + 7 = 23 -> snapped to 4px = 24px across all 4 sides
  assert.equal(all.padding.top, 24);
  assert.equal(all.padding.right, 24);
  assert.equal(all.padding.bottom, 24);
  assert.equal(all.padding.left, 24);
  assert.deepEqual(all.activeSides, ['top', 'right', 'bottom', 'left']);

  const snapped = computeSpacingPreview(
    'margin-bottom',
    baseSpacing,
    { dx: 0, dy: 5, shiftKey: true, altKey: false },
    { default: {} },
  );
  // 8 + 5 = 13 -> snapped to 4px = 12px
  assert.equal(snapped.margin.bottom, 12);
});

test('gap uses vertical dy for column and horizontal dx for row', () => {
  const colGap = computeSpacingPreview(
    'gap',
    { ...baseSpacing, gapAxis: 'vertical' },
    { dx: 40, dy: 8, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(colGap.gap, 20);
  assert.equal(colGap.styles.default?.gap, '20px');

  const rowGap = computeSpacingPreview(
    'gap',
    { ...baseSpacing, gapAxis: 'horizontal' },
    { dx: 10, dy: 40, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(rowGap.gap, 22);
  assert.equal(rowGap.styles.default?.gap, '22px');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/spacing-math.test.ts`
Expected: FAIL with module not found (`spacingMath`).

- [ ] **Step 3: Write `src/features/editor/utils/element/spacingMath.ts`**

```ts
import type { ResponsiveStyles } from "@/types/elements";

export type SpacingSide = "top" | "right" | "bottom" | "left";

export type SpacingHandleId =
  | `padding-${SpacingSide}`
  | `margin-${SpacingSide}`
  | "gap";

export type GapAxis = "horizontal" | "vertical";

export interface ComputedSpacing {
  readonly padding: Readonly<Record<SpacingSide, number>>;
  readonly margin: Readonly<Record<SpacingSide, number>>;
  readonly gap: number;
  readonly gapAxis: GapAxis;
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

const ALL_SIDES: readonly SpacingSide[] = ["top", "right", "bottom", "left"];

const OPPOSITE_SIDE: Readonly<Record<SpacingSide, SpacingSide>> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const PADDING_PROP: Readonly<Record<SpacingSide, "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft">> = {
  top: "paddingTop",
  right: "paddingRight",
  bottom: "paddingBottom",
  left: "paddingLeft",
};

const MARGIN_PROP: Readonly<Record<SpacingSide, "marginTop" | "marginRight" | "marginBottom" | "marginLeft">> = {
  top: "marginTop",
  right: "marginRight",
  bottom: "marginBottom",
  left: "marginLeft",
};

const SIDE_SHORT: Readonly<Record<SpacingSide, string>> = {
  top: "T",
  right: "R",
  bottom: "B",
  left: "L",
};

const SNAP_STEP_PX = 4;

function parsePx(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function isMultiColumnGrid(style: Pick<CSSStyleDeclaration, "display" | "gridTemplateColumns">): boolean {
  if (!style.display.includes("grid")) return false;
  const tracks = (style.gridTemplateColumns ?? "").trim().split(/\s+/).filter((t) => t && t !== "none");
  return tracks.length > 1;
}

export function readComputedSpacing(
  style: Pick<
    CSSStyleDeclaration,
    | "paddingTop"
    | "paddingRight"
    | "paddingBottom"
    | "paddingLeft"
    | "marginTop"
    | "marginRight"
    | "marginBottom"
    | "marginLeft"
    | "gap"
    | "rowGap"
    | "columnGap"
    | "display"
    | "flexDirection"
    | "gridTemplateColumns"
  >,
): ComputedSpacing {
  const horizontal =
    (style.display.includes("flex") && style.flexDirection.startsWith("row")) ||
    isMultiColumnGrid(style);
  const gapAxis: GapAxis = horizontal ? "horizontal" : "vertical";
  const rawGap =
    parsePx(style.gap) ||
    (gapAxis === "horizontal" ? parsePx(style.columnGap) : parsePx(style.rowGap));

  return {
    padding: {
      top: parsePx(style.paddingTop),
      right: parsePx(style.paddingRight),
      bottom: parsePx(style.paddingBottom),
      left: parsePx(style.paddingLeft),
    },
    margin: {
      top: parsePx(style.marginTop),
      right: parsePx(style.marginRight),
      bottom: parsePx(style.marginBottom),
      left: parsePx(style.marginLeft),
    },
    gap: rawGap,
    gapAxis,
  };
}

export function spacingCursor(handle: SpacingHandleId, gapAxis: GapAxis): string {
  if (handle === "gap") return gapAxis === "horizontal" ? "ew-resize" : "ns-resize";
  return handle.endsWith("top") || handle.endsWith("bottom") ? "ns-resize" : "ew-resize";
}

function sideDelta(
  kind: "padding" | "margin",
  side: SpacingSide,
  dx: number,
  dy: number,
): number {
  // Padding increases inward; margin increases outward.
  const inward =
    side === "top" ? dy : side === "bottom" ? -dy : side === "left" ? dx : -dx;
  return kind === "padding" ? inward : -inward;
}

function clampAndSnap(value: number, snap: boolean): number {
  const nonNegative = Math.max(0, Math.round(value));
  return snap ? Math.max(0, Math.round(nonNegative / SNAP_STEP_PX) * SNAP_STEP_PX) : nonNegative;
}

export function computeSpacingPreview(
  handle: SpacingHandleId,
  initial: ComputedSpacing,
  delta: {
    readonly dx: number;
    readonly dy: number;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
  },
  currentStyles: ResponsiveStyles | undefined,
): SpacingPreview {
  const base = currentStyles ?? { default: {} };
  const nextDefault: NonNullable<ResponsiveStyles["default"]> = { ...base.default };

  if (handle === "gap") {
    const raw = initial.gap + (initial.gapAxis === "horizontal" ? delta.dx : delta.dy);
    const gap = clampAndSnap(raw, delta.shiftKey);
    nextDefault.gap = `${gap}px`;
    return {
      kind: "gap",
      activeSides: [],
      padding: initial.padding,
      margin: initial.margin,
      gap,
      label: `Gap ${gap}px`,
      styles: { ...base, default: nextDefault },
    };
  }

  const [kind, side] = handle.split("-") as ["padding" | "margin", SpacingSide];
  const activeSides: readonly SpacingSide[] =
    delta.altKey && delta.shiftKey
      ? ALL_SIDES
      : delta.altKey
        ? [side, OPPOSITE_SIDE[side]]
        : [side];

  const startValue = initial[kind][side];
  const nextValue = clampAndSnap(
    startValue + sideDelta(kind, side, delta.dx, delta.dy),
    delta.shiftKey,
  );

  const nextPadding = { ...initial.padding };
  const nextMargin = { ...initial.margin };
  const targetRecord = kind === "padding" ? nextPadding : nextMargin;
  const propMap = kind === "padding" ? PADDING_PROP : MARGIN_PROP;

  for (const s of activeSides) {
    targetRecord[s] = nextValue;
    nextDefault[propMap[s]] = `${nextValue}px`;
  }

  const title = kind === "padding" ? "Padding" : "Margin";
  const sideTag =
    activeSides.length === 4
      ? "All"
      : activeSides.map((s) => SIDE_SHORT[s]).join("/");

  return {
    kind,
    activeSides,
    padding: nextPadding,
    margin: nextMargin,
    gap: initial.gap,
    label: `${title} ${sideTag} ${nextValue}px`,
    styles: { ...base, default: nextDefault },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/spacing-math.test.ts`
Expected: PASS (5/5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/utils/element/spacingMath.ts tests/spacing-math.test.ts
git commit -m "feat(editor): add computed-seeded pure spacing math module"
```

---

### Task 3: Extended Drop Geometry (`dropPosition.ts`)

**Files:**
- Modify: `src/features/editor/utils/element/dropPosition.ts`
- Create: `tests/drop-position.test.ts`

**Interfaces:**
- Consumes: `DropPosition`, `elementTree` (`@/features/elements/lib/element-tree-helper`), `EditorElement` (`@/types/global.type`)
- Produces:
  - `export function isHorizontalFlow(style: { display: string; flexDirection: string; gridTemplateColumns?: string }): boolean`
  - `export function isNoOpMove(elements: EditorElement[], movingId: string, targetId: string, position: DropPosition): boolean`

- [ ] **Step 1: Write the failing test**

Create `tests/drop-position.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDropPosition,
  isHorizontalFlow,
  isNoOpMove,
} from '../src/features/editor/utils/element/dropPosition';
import type { FrameElement, TextElement } from '../src/types/elements/elements';

const text = (id: string, parentId?: string): TextElement => ({
  id,
  type: 'Text',
  content: id,
  pageId: 'p1',
  parentId,
  styles: {},
  tailwindStyles: '',
});

const frame = (id: string, elements: TextElement[]): FrameElement => ({
  id,
  type: 'Frame',
  content: '',
  pageId: 'p1',
  styles: {},
  tailwindStyles: '',
  elements,
});

test('isHorizontalFlow detects flex-row and multi-column CSS grids', () => {
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'row' }), true);
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'column' }), false);
  assert.equal(
    isHorizontalFlow({ display: 'grid', flexDirection: 'row', gridTemplateColumns: '200px 200px' }),
    true,
  );
  assert.equal(
    isHorizontalFlow({ display: 'grid', flexDirection: 'row', gridTemplateColumns: '400px' }),
    false,
  );
});

test('isNoOpMove identifies moves that leave the element in its exact current slot', () => {
  const tree = [frame('f1', [text('a', 'f1'), text('b', 'f1'), text('c', 'f1')])];
  // Self target
  assert.equal(isNoOpMove(tree, 'b', 'b', 'before'), true);
  // Immediately after previous sibling or before next sibling -> same slot
  assert.equal(isNoOpMove(tree, 'b', 'a', 'after'), true);
  assert.equal(isNoOpMove(tree, 'b', 'c', 'before'), true);
  // Last child dropped "inside" its own parent -> same slot
  assert.equal(isNoOpMove(tree, 'c', 'f1', 'inside'), true);
  // Real moves are not no-ops
  assert.equal(isNoOpMove(tree, 'b', 'a', 'before'), false);
  assert.equal(isNoOpMove(tree, 'b', 'c', 'after'), false);
  assert.equal(isNoOpMove(tree, 'a', 'f1', 'inside'), false);
  assert.equal(computeDropPosition({ left: 0, top: 0, width: 100, height: 100 }, { x: 50, y: 50 }, { isContainer: true, horizontal: false }), 'inside');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/drop-position.test.ts`
Expected: FAIL (`isNoOpMove` not exported).

- [ ] **Step 3: Update `src/features/editor/utils/element/dropPosition.ts`**

Add multi-column grid support to `isHorizontalFlow` and implement `isNoOpMove` using `elementTree.findLocation` and `elementTree.findById`:

```ts
import { elementTree, type DropPosition } from "@/features/elements/lib/element-tree-helper";
import type { EditorElement } from "@/types/global.type";

export type { DropPosition };

export interface DropBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Largest edge band (px) of a container that still means before/after. */
const CONTAINER_EDGE_PX = 12;

export function computeDropPosition(
  box: DropBox,
  point: { x: number; y: number },
  { isContainer, horizontal }: { isContainer: boolean; horizontal: boolean },
): DropPosition {
  const offset = horizontal ? point.x - box.left : point.y - box.top;
  const size = horizontal ? box.width : box.height;

  if (isContainer) {
    const edge = Math.min(CONTAINER_EDGE_PX, size * 0.25);
    if (offset < edge) return "before";
    if (offset > size - edge) return "after";
    return "inside";
  }
  return offset < size / 2 ? "before" : "after";
}

/** True when children of a parent with this computed style flow horizontally. */
export function isHorizontalFlow(style: {
  display: string;
  flexDirection: string;
  gridTemplateColumns?: string;
}): boolean {
  if (style.display.includes("flex") && style.flexDirection.startsWith("row")) {
    return true;
  }
  if (style.display.includes("grid") && style.gridTemplateColumns) {
    const tracks = style.gridTemplateColumns
      .trim()
      .split(/\s+/)
      .filter((t) => t && t !== "none");
    return tracks.length > 1;
  }
  return false;
}

/** True when moving `movingId` to `(targetId, position)` produces no tree change. */
export function isNoOpMove(
  elements: EditorElement[],
  movingId: string,
  targetId: string,
  position: DropPosition,
): boolean {
  if (movingId === targetId) return true;
  const from = elementTree.findLocation(elements, movingId);
  if (!from) return true;

  if (position === "inside") {
    const parent = elementTree.findById(elements, targetId);
    if (!parent || !elementTree.isContainerElement(parent)) return true;
    return from.parentId === targetId && from.index === parent.elements.length - 1;
  }

  const target = elementTree.findLocation(elements, targetId);
  if (!target) return true;
  if (from.parentId !== target.parentId) return false;
  if (position === "before") return from.index === target.index - 1;
  return from.index === target.index + 1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/drop-position.test.ts`
Expected: PASS (2/2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/utils/element/dropPosition.ts tests/drop-position.test.ts
git commit -m "feat(editor): add CSS grid flow detection and no-op move suppression"
```

---

### Task 4: Unified Manipulation State Machine (`useCanvasManipulation.ts`)

**Files:**
- Create: `src/features/editor/components/canvas/useCanvasManipulation.ts`
- Test: `tests/canvas-manipulation.test.ts`

**Interfaces:**
- Consumes: `computeResizePreview`, `detectLengthUnit`, `resizeCursor`, `DimensionDirection`, `ResizePreview` (`resizeMath.ts`); `computeSpacingPreview`, `readComputedSpacing`, `spacingCursor`, `SpacingHandleId`, `SpacingPreview` (`spacingMath.ts`); `computeDropPosition`, `isHorizontalFlow`, `isNoOpMove` (`dropPosition.ts`); `useElementStore`; `findElementNode`, `findElementNodeFromTarget`, `setCanvasSelection`, `DropIndicatorState`
- Produces:
  - `export type ManipulationSession = { readonly kind: "idle" } | { readonly kind: "resizing"; readonly elementId: string; readonly direction: DimensionDirection; readonly preview: ResizePreview } | { readonly kind: "spacing"; readonly elementId: string; readonly handle: SpacingHandleId; readonly preview: SpacingPreview } | { readonly kind: "moving"; readonly elementId: string; readonly elementLabel: string; readonly pointer: { readonly x: number; readonly y: number }; readonly target: DropIndicatorState | null };`
  - `export function useCanvasManipulation(options: { root: HTMLDivElement | null; canEdit: boolean; picking: boolean }): { session: ManipulationSession; startResize: (element: EditorElement, node: HTMLElement, direction: DimensionDirection, event: React.PointerEvent) => void; startSpacing: (element: EditorElement, node: HTMLElement, handle: SpacingHandleId, event: React.PointerEvent) => void; handleCanvasPointerDown: (event: React.PointerEvent) => void; cancel: () => void; }`

- [ ] **Step 1: Write the failing test**

Create `tests/canvas-manipulation.test.ts` covering:
1. Click (`≤ 4px` pointer movement) stays `idle` and never calls `moveElement`.
2. Pointer drag (`> 4px`) enters `moving`, sets `data-dragging="true"`, resolves drop target, and commits one `moveElement` on `pointerup`.
3. `startResize` updates inline DOM styles live, reverts them on `Escape` with zero `updateElement` calls, and commits one `updateElement` on `pointerup`.
4. `startSpacing` seeds from `getComputedStyle`, previews live `SpacingPreview`, reverts on `Escape`, and commits one `updateElement` on `pointerup`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/canvas-manipulation.test.ts`
Expected: FAIL with module not found (`useCanvasManipulation`).

- [ ] **Step 3: Implement `src/features/editor/components/canvas/useCanvasManipulation.ts`**

Key implementation details:
- Track an active cleanup callback in a `ref` (`disposeRef`) so starting any new session or unmounting cleanly tears down all listeners on both `iframeWin` and parent `window`.
- Snapshot the target node's original inline style strings for all managed DOM properties (`width`, `height`, `top`, `left`, `flexGrow`, `flexBasis`, `flexShrink`, `alignSelf`, `gap`, `paddingTop/Right/Bottom/Left`, `marginTop/Right/Bottom/Left`) before mutating; on `Escape`, restore every snapshot value verbatim.
- For `handleCanvasPointerDown`: ignore `event.button !== 0`, `!canEdit`, `picking`, targets inside `[data-canvas-overlay]`, `isContentEditable` targets, and `inert` subtrees. Record `{ elementId, elementLabel, startX, startY }`, wait for `Math.hypot(dx, dy) > 4` before activating `{ kind: "moving" }`.
- During `moving`: use `doc.elementsFromPoint(e.clientX, e.clientY)` to find the topmost `[data-element-id]` outside `[data-canvas-overlay]` and outside `draggedNode.contains(el)`. Compute `DropIndicatorState` via `computeDropPosition` + `isHorizontalFlow`, and suppress via `isNoOpMove`.
- On `pointerup` in `moving`: commit `useElementStore.getState().moveElement(elementId, target.targetId, target.position)` if `target !== null`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test tests/canvas-manipulation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/components/canvas/useCanvasManipulation.ts tests/canvas-manipulation.test.ts
git commit -m "feat(editor): add unified pointer-driven canvas manipulation engine"
```

---

### Task 5: Framer/Figma Overlay Chrome & Canvas Wiring

**Files:**
- Create: `src/features/editor/components/resizehandler/ResizeChrome.tsx`
- Create: `src/features/editor/components/resizehandler/SpacingChrome.tsx`
- Modify: `src/features/editor/components/canvas/CanvasOverlay.tsx`
- Modify: `src/features/editor/components/canvas/CanvasInteractionLayer.tsx`
- Modify: `src/features/editor/components/elements/shared/useCanvasElement.ts`
- Modify: `src/features/editor/components/canvas/useCanvasDragDrop.ts`
- Modify: `tests/editor-canvas-dnd.test.ts`

**Interfaces:**
- `ResizeChrome`: takes `{ rect, element, node, session, canEdit, onStartResize }`; renders 4 invisible 8px edge hit-strips (`n/s/e/w`), 4 crisp corner squares (`nw/ne/sw/se`), and the floating live `W × H` pill HUD when `session.kind === "resizing"`.
- `SpacingChrome`: takes `{ rect, element, node, session, canEdit, showAllSpacing, onStartSpacing }`; renders subtle emerald padding hairline bars inside each edge, amber margin hairline bars outside each edge (when non-zero or `showAllSpacing`), child-gap scrub bar measured from the first two adjacent direct children of flex/grid containers, live translucent bands + value pills driven by `session.preview` (during drag) or `readComputedSpacing(getComputedStyle(node))` (on hover), and the live spacing HUD pill.
- `CanvasOverlay`: receives `session: ManipulationSession`, `onStartResize`, `onStartSpacing`, `sidebarDrop: DropIndicatorState | null`; renders `SelectionBox`, Framer-style `DropIndicator` (2px `#3b82f6` line with 6px circular end-caps for `before`/`after`; dashed emerald highlight + `Inside <Type>` badge for `inside`), and floating cursor badge when `session.kind === "moving"`.
- `useCanvasElement.ts`: removes `draggable: canEdit && !isEditing`.
- `useCanvasDragDrop.ts`: simplified to sidebar HTML5 DnD inserts only (`create` / `template` / `component` / `snapshot`); `handleDragStart` removed (moves are handled by `useCanvasManipulation`).

- [ ] **Step 1: Create `ResizeChrome.tsx` and `SpacingChrome.tsx`**
- [ ] **Step 2: Update `CanvasOverlay.tsx`, `CanvasInteractionLayer.tsx`, `useCanvasElement.ts`, and `useCanvasDragDrop.ts`**
- [ ] **Step 3: Update `tests/editor-canvas-dnd.test.ts` to match sidebar-only `useCanvasDragDrop`**
- [ ] **Step 4: Run typecheck, lint, and tests**

Run: `npx tsc --noEmit && bunx oxlint --quiet src/ && bun run test:unit`
Expected: 0 TS errors, 0 lint errors, all unit tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/components/resizehandler/ResizeChrome.tsx \
        src/features/editor/components/resizehandler/SpacingChrome.tsx \
        src/features/editor/components/canvas/CanvasOverlay.tsx \
        src/features/editor/components/canvas/CanvasInteractionLayer.tsx \
        src/features/editor/components/elements/shared/useCanvasElement.ts \
        src/features/editor/components/canvas/useCanvasDragDrop.ts \
        tests/editor-canvas-dnd.test.ts
git commit -m "feat(editor): wire Framer/Figma resize, spacing, and pointer-move overlay chrome"
```

---

### Task 6: Retire Legacy Resize/Spacing Modules & Final Verification

**Files:**
- Delete: `src/features/editor/components/resizehandler/ResizeHandle.tsx`
- Delete: `src/features/editor/components/resizehandler/ResizeTooltip.tsx`
- Delete: `src/features/editor/components/resizehandler/ResizeContext.ts`
- Delete: `src/features/editor/components/resizehandler/SpacingOverlay.tsx`
- Delete: `src/features/editor/hooks/useResizeHandler.ts`
- Delete: `src/features/editor/utils/element/resizeDrag.ts`
- Delete: `src/features/editor/utils/element/resizeStyles.ts`
- Delete: `tests/editor-logic-resize.test.ts`

- [ ] **Step 1: Verify zero remaining imports of legacy modules**

Run: `grep -rn "ResizeHandle\|ResizeTooltip\|ResizeContext\|SpacingOverlay\|useResizeHandler\|resizeDrag\|resizeStyles" src/ tests/`
Expected: Only the files being deleted appear.

- [ ] **Step 2: Delete legacy files and obsolete test file**
- [ ] **Step 3: Run full verification suite**

Run: `npx tsc --noEmit && bunx oxlint --quiet src/ && bun run test:unit`
Expected: Exit 0, 0 TS errors, 0 lint errors, all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(editor): remove legacy resize and spacing modules"
```
