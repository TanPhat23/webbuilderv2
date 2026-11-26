# First-principles editor canvas implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy in-iframe editor canvas portal with an isolated site-only `<iframe />`, a parent-DOM spatial stage (auto-fit scaling, `Ctrl+wheel` zoom, `Space+drag` pan, width scrub handles), a parent-DOM HUD overlay, a standard click-vs-double-click manipulation state machine, unified drop hit-testing, and a shared `@media` element stylesheet pipeline.

**Architecture:** `SiteFrame` mounts one persistent `<iframe id="preview-iframe" />` containing only site elements and three managed `<style>` blocks (`#wb-tailwind-css`, `#wb-element-styles`, `#wb-project-css`) with zero Editor stylesheets. `CanvasStage` and `CanvasHud` live in the parent Editor DOM, projecting iframe `DOMRect` geometry into `1:1` UI coordinates via `rectTracker` (`requestAnimationFrame` DOM updates without 60Hz React state churn) while `canvasViewportStore` synchronizes `frameWidthPx` and `activeBreakpoint` across `ViewportControls`, `Inspector`, and zoom-normalized canvas gestures.

**Tech Stack:** TypeScript 5.9 (`strict`, zero `any`), React 19, Zustand, Tailwind CSS v4 JIT (`@webbuilder/site-runtime`), Bun `1.4.5` workspaces, `node:test` + `tsx`, `oxlint`.

**Spec:** `docs/superpowers/specs/2026-11-26-editor-canvas-first-principles-design.md`

## Global Constraints

- Zero `any` policy across all source and test files; use `unknown` with type predicates, discriminated unions, and explicit return types on all exported functions and hooks.
- Zero Editor host stylesheets (`document.head` `<link>` or `<style>`) may be cloned into `#preview-iframe`, and zero `p-4` wrapper padding may surround `#wb-site-root`.
- `SiteFrame` must never set `key={currentView}` or reload `#preview-iframe` when `frameWidthPx` or `activeBreakpoint` changes.
- All canvas resize and spacing commits must route through `elementUtils.updateElementStyle` against `canvasViewportStore.getState().activeBreakpoint` and clear temporary inline `node.style` properties upon commit or cancel.
- Destructive and clipboard keyboard shortcuts (`Delete`, `Backspace`, `Ctrl+X`, `Ctrl+C`, `Ctrl+V`) must never fire while `editingElementId` is set or `isTypingTarget(event.target)` is true, and must never fall back to `hoveredElementId` when `selectedElementId` is `undefined`.
- Do not stage unrelated working-tree files (`apps/editor/src/app/__root.tsx`, `apps/sites/src/app/__root.tsx`) when committing task units.

## Review Focus

- Malicious or malformed CSS declarations in `element.styles` (`color: "red; } body { display:none } /*"`, `backgroundImage: "url(javascript:alert(1))"`, `</style>` payloads, or `Object.prototype` keys) must be sanitized or dropped by `compileElementStylesCss` without corrupting neighboring rules (pinned in Task 1).
- Pressing `Delete` or `Backspace` inside inline `contentEditable` text or an `<input>`, or pressing `Delete` with `selectedElementId === undefined` while hovering an element, must never delete any element from `ElementStore` (pinned in Task 4).
- Dragging a resize or spacing handle when `effectiveZoom === 0.5` at `activeBreakpoint === "md"` must divide screen deltas by `0.5`, commit to `styles.md` and `tailwindStyles`, and clear temporary inline `node.style` properties so narrower mobile widths (`375px`) are not overridden (pinned in Task 4).
- Switching viewport presets (`desktop` -> `mobile` -> `tablet`) or scrubbing width handles must preserve the exact same `HTMLIFrameElement` instance without remounting and without copying host `document.head` styles (pinned in Task 5 and Task 6).
- Collaborator cursor broadcasts and `RemoteCursorsOverlay` rendering when two users have different scroll offsets and zoom scales must round-trip through unscaled iframe document coordinates (`clientX + scrollLeft`, `clientY + scrollTop`) into stage HUD pixels (`frameLeft + (docX - localScrollLeft) * effectiveZoom`) (pinned in Task 5).

---

### Task 1: Responsive `@media` element stylesheet compiler and site-runtime integration

**Files:**
- Create: `packages/site-runtime/src/elements/lib/compileElementStylesCss.ts`
- Modify: `packages/site-runtime/src/elements/lib/elementhelper.ts`
- Modify: `packages/site-runtime/src/preview/PreviewElementLoader.tsx`
- Modify: `packages/site-runtime/src/preview/SitePageView.tsx`
- Modify: `packages/site-runtime/src/index.ts`
- Test: `tests/compile-element-styles-css.test.ts`

**Interfaces:**
- Consumes: `EditorElement`, `Breakpoint`, `ResponsiveStyles` from `@webbuilder/site-runtime/types/elements`
- Produces:
  - `compileElementStylesCss(elements: readonly EditorElement[]): string` exported from `@webbuilder/site-runtime/elements/lib/compileElementStylesCss` and `@webbuilder/site-runtime`
  - `escapeElementIdSelector(id: string): string` exported from `@webbuilder/site-runtime/elements/lib/compileElementStylesCss`

- [ ] **Step 1: Write the failing test in `tests/compile-element-styles-css.test.ts`**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { compileElementStylesCss } from "@webbuilder/site-runtime/elements/lib/compileElementStylesCss";

function makeElement(
  id: string,
  styles: EditorElement["styles"],
  children?: EditorElement[],
): EditorElement {
  if (children) {
    return {
      id,
      type: "Frame",
      content: "",
      pageId: "p1",
      styles,
      elements: children,
    };
  }
  return {
    id,
    type: "Text",
    content: "Hi",
    pageId: "p1",
    styles,
  };
}

test("emits base and mobile-first min-width media queries in order", () => {
  const css = compileElementStylesCss([
    makeElement("hero-1", {
      default: { width: 320, opacity: 0.8, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
      sm: { width: "600px" },
      md: { paddingTop: 24, zIndex: 10 },
      lg: { width: "960px" },
      xl: { width: "1200px" },
    }),
  ]);

  const defaultIdx = css.indexOf('[data-element-id="hero-1"]{width:320px;opacity:0.8;box-shadow:0 2px 8px rgba(0,0,0,0.12);}');
  const smIdx = css.indexOf("@media (min-width: 640px){[data-element-id=\"hero-1\"]{width:600px;}}");
  const mdIdx = css.indexOf("@media (min-width: 768px){[data-element-id=\"hero-1\"]{padding-top:24px;z-index:10;}}");
  const lgIdx = css.indexOf("@media (min-width: 1024px){[data-element-id=\"hero-1\"]{width:960px;}}");
  const xlIdx = css.indexOf("@media (min-width: 1280px){[data-element-id=\"hero-1\"]{width:1200px;}}");

  assert.ok(defaultIdx >= 0, `missing default rule in: ${css}`);
  assert.ok(defaultIdx < smIdx && smIdx < mdIdx && mdIdx < lgIdx && lgIdx < xlIdx);
});

test("walks nested container children and deduplicates repeated ids", () => {
  const child = makeElement("btn:1", { default: { height: 44 } });
  const root = makeElement("sec-1", { default: { gap: 16 } }, [child]);
  const css = compileElementStylesCss([root]);

  assert.ok(css.includes('[data-element-id="sec-1"]{gap:16px;}'));
  assert.ok(css.includes('[data-element-id="btn\\:1"]{height:44px;}'));
});

test("rejects CSS breakout, style-tag breakout, javascript urls, and prototype keys", () => {
  const protoStyles = Object.create({ injected: "999px" }) as Record<string, unknown>;
  protoStyles.color = "red; } body { display: none } /*";
  protoStyles.backgroundImage = "url(javascript:alert(1))";
  protoStyles.content = "</style><script>alert(1)</script>";
  protoStyles.paddingLeft = "12px";

  const css = compileElementStylesCss([
    makeElement("safe-1", {
      default: protoStyles as NonNullable<EditorElement["styles"]>["default"],
    }),
  ]);

  assert.equal(css, '[data-element-id="safe-1"]{padding-left:12px;}');
  assert.ok(!css.includes("display: none"));
  assert.ok(!css.includes("javascript:"));
  assert.ok(!css.includes("</style"));
  assert.ok(!css.includes("injected"));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/compile-element-styles-css.test.ts`
Expected: FAIL (`Cannot find module '@webbuilder/site-runtime/elements/lib/compileElementStylesCss'`).

- [ ] **Step 3: Create `packages/site-runtime/src/elements/lib/compileElementStylesCss.ts` and wire into `elementhelper.ts`, `PreviewElementLoader.tsx`, `SitePageView.tsx`, and `index.ts`**

Create `packages/site-runtime/src/elements/lib/compileElementStylesCss.ts`:

```ts
import type { CSSProperties } from "react";
import type { Breakpoint, EditorElement } from "../../types/elements";
import { getViewChildren } from "../element-children";

const BREAKPOINT_MEDIA: ReadonlyArray<{
  readonly bp: Breakpoint;
  readonly minWidthPx: number | null;
}> = [
  { bp: "default", minWidthPx: null },
  { bp: "sm", minWidthPx: 640 },
  { bp: "md", minWidthPx: 768 },
  { bp: "lg", minWidthPx: 1024 },
  { bp: "xl", minWidthPx: 1280 },
];

const UNITLESS_NUMBER_PROPS: ReadonlySet<string> = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "scale",
]);

const CAMEL_PROP_RE = /^[a-z][a-zA-Z0-9]*$/;
const UNSAFE_VALUE_RE = /[;{}]|<\/style|javascript\s*:|expression\s*\(/i;

export function escapeElementIdSelector(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

function toKebabProperty(prop: string): string | null {
  if (!CAMEL_PROP_RE.test(prop)) return null;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function formatCssValue(prop: string, raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return null;
    if (raw === 0 || UNITLESS_NUMBER_PROPS.has(prop)) return String(raw);
    return `${raw}px`;
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || UNSAFE_VALUE_RE.test(trimmed)) return null;
  if (/[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

function compileDeclarationBlock(styleMap: CSSProperties | undefined): string {
  if (!styleMap || typeof styleMap !== "object" || Array.isArray(styleMap)) {
    return "";
  }
  const decls: string[] = [];
  for (const key of Object.keys(styleMap)) {
    if (!Object.hasOwn(styleMap, key)) continue;
    const cssProp = toKebabProperty(key);
    if (!cssProp) continue;
    const rawVal = (styleMap as Record<string, unknown>)[key];
    const formatted = formatCssValue(key, rawVal);
    if (formatted === null) continue;
    decls.push(`${cssProp}:${formatted};`);
  }
  return decls.join("");
}

function collectElementsPreOrder(
  elements: readonly EditorElement[],
  out: EditorElement[],
  seenIds: Set<string>,
): void {
  for (const el of elements) {
    if (!seenIds.has(el.id)) {
      seenIds.add(el.id);
      out.push(el);
    }
    const children = getViewChildren(el);
    if (children && children.length > 0) {
      collectElementsPreOrder(children, out, seenIds);
    }
  }
}

export function compileElementStylesCss(
  elements: readonly EditorElement[] | undefined,
): string {
  if (!elements || elements.length === 0) return "";
  const flat: EditorElement[] = [];
  collectElementsPreOrder(elements, flat, new Set<string>());

  const chunks: string[] = [];
  for (const { bp, minWidthPx } of BREAKPOINT_MEDIA) {
    const rules: string[] = [];
    for (const el of flat) {
      const styleMap = el.styles?.[bp];
      const block = compileDeclarationBlock(styleMap);
      if (!block) continue;
      const selector = `[data-element-id="${escapeElementIdSelector(el.id)}"]`;
      rules.push(`${selector}{${block}}`);
    }
    if (rules.length === 0) continue;
    if (minWidthPx === null) {
      chunks.push(rules.join(""));
    } else {
      chunks.push(`@media (min-width: ${minWidthPx}px){${rules.join("")}}`);
    }
  }
  return chunks.join("\n");
}
```

Update `packages/site-runtime/src/elements/lib/elementhelper.ts`:
- Change `getSafeStyles` so it returns `{}` (or only reads `styles.default` when explicitly requested via a separate helper if ever needed; returning `{}` from `getSafeStyles` ensures `PreviewElementLoader`, `ComponentInstanceCanvas`, and `useCanvasElement` never stamp inline styles that override `@media` rules, while keeping `elementUtils.getSafeStyles` callable for backward compatibility).
- Export `compileElementStylesCss` on `elementUtils` and from `packages/site-runtime/src/index.ts`.
- Update `PreviewElementLoader.tsx` line 50 so `style` is omitted when empty (`undefined`), and update `SitePageView.tsx` line 224 so the `<style>` block includes `${compileElementStylesCss(elements)}`:
  `${generatedCss}\n${compileElementStylesCss(elements)}\n${sanitizeProjectCss(project.header?.cssStyles)}\n${revealCss(reveals)}`.

- [ ] **Step 4: Run unit tests and workspace typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/compile-element-styles-css.test.ts tests/compute-tailwind-from-styles.test.ts && bun run --cwd packages/site-runtime typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 1**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add packages/site-runtime/src/elements/lib/compileElementStylesCss.ts \
  packages/site-runtime/src/elements/lib/elementhelper.ts \
  packages/site-runtime/src/preview/PreviewElementLoader.tsx \
  packages/site-runtime/src/preview/SitePageView.tsx \
  packages/site-runtime/src/index.ts \
  tests/compile-element-styles-css.test.ts
git commit -m "feat(site-runtime): compile element responsive styles into media-query CSS"
```

---

### Task 2: Canvas viewport store, camera math, and synchronized breakpoint controls

**Files:**
- Create: `apps/editor/src/features/editor/store/canvas-viewport-store.ts`
- Modify: `apps/editor/src/features/editor/components/editor/header/ViewportControls.tsx`
- Modify: `apps/editor/src/features/editor/components/sidebar/Inspector.tsx`
- Modify: `apps/editor/src/features/editor/hooks/useEditor.ts`
- Modify: `apps/editor/src/features/editor/components/topbar/EditorTopBar.tsx`
- Test: `tests/canvas-viewport-store.test.ts`

**Interfaces:**
- Consumes: `Breakpoint` from `@webbuilder/site-runtime/types/elements`, `Viewport` from `apps/editor/src/features/editor/context/EditorContext.ts`
- Produces:
  - `useCanvasViewportStore` (Zustand store) and pure helpers `computeFitZoom`, `computeEffectiveZoom`, `breakpointForScrubbedWidth`, `minWidthForBreakpoint`, `viewportFromState` in `apps/editor/src/features/editor/store/canvas-viewport-store.ts`:
    ```ts
    export type ViewportPreset = "mobile" | "tablet" | "desktop";
    export type ZoomMode = "fit" | "manual";

    export const STAGE_HORIZONTAL_GUTTER_PX = 64;
    export const STAGE_TOP_GUTTER_PX = 40;
    export const STAGE_BOTTOM_GUTTER_PX = 32;
    export const MIN_FRAME_WIDTH_PX = 320;
    export const MAX_FRAME_WIDTH_PX = 2560;
    export const MIN_ZOOM = 0.25;
    export const MAX_ZOOM = 2.0;

    export interface CanvasViewportStoreState {
      readonly frameWidthPx: number;
      readonly preset: ViewportPreset | "custom";
      readonly activeBreakpoint: Breakpoint;
      readonly zoomMode: ZoomMode;
      readonly manualZoom: number;
      readonly stageWidthPx: number;
      readonly stageHeightPx: number;
      readonly panX: number;
      readonly panY: number;
      setPreset: (preset: ViewportPreset) => void;
      scrubFrameWidth: (widthPx: number) => void;
      setActiveBreakpoint: (bp: Breakpoint) => void;
      setStageBounds: (widthPx: number, heightPx: number) => void;
      zoomByWheel: (deltaY: number) => void;
      setManualZoom: (zoom: number) => void;
      resetZoomToFit: () => void;
      panBy: (dx: number, dy: number) => void;
      resetViewport: () => void;
    }
    ```

- [ ] **Step 1: Write the failing test in `tests/canvas-viewport-store.test.ts`**

```ts
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  computeEffectiveZoom,
  computeFitZoom,
  useCanvasViewportStore,
} from "../apps/editor/src/features/editor/store/canvas-viewport-store";

beforeEach(() => {
  useCanvasViewportStore.getState().resetViewport();
});

test("defaults to 1440px desktop preset with Base (default) activeBreakpoint and fit zoom", () => {
  const s = useCanvasViewportStore.getState();
  assert.equal(s.frameWidthPx, 1440);
  assert.equal(s.preset, "desktop");
  assert.equal(s.activeBreakpoint, "default");
  assert.equal(s.zoomMode, "fit");

  useCanvasViewportStore.getState().setStageBounds(864, 700);
  const zoom = computeEffectiveZoom(useCanvasViewportStore.getState());
  assert.ok(Math.abs(zoom - (864 - 64) / 1440) < 0.0001);
  assert.equal(computeFitZoom(375, 864), 1);
});

test("synchronizes presets, scrubbed widths, and explicit breakpoint pills", () => {
  const store = useCanvasViewportStore.getState();

  store.setPreset("tablet");
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 768);
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "md");

  store.setPreset("mobile");
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 375);
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "default");

  // Selecting LG while at 375px widens frameWidthPx to 1024px so media query applies live
  store.setActiveBreakpoint("lg");
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "lg");
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 1024);

  // Scrubbing width across thresholds updates activeBreakpoint and clamps bounds
  store.scrubFrameWidth(680);
  assert.equal(useCanvasViewportStore.getState().preset, "custom");
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "sm");

  store.scrubFrameWidth(120);
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 320);
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "default");
});

test("supports manual zoom clamping, pan clamping, and resetZoomToFit", () => {
  const store = useCanvasViewportStore.getState();
  store.setStageBounds(1000, 800);
  store.setManualZoom(5);
  assert.equal(useCanvasViewportStore.getState().zoomMode, "manual");
  assert.equal(useCanvasViewportStore.getState().manualZoom, 2);

  store.panBy(200, -150);
  assert.notEqual(useCanvasViewportStore.getState().panX, 0);

  store.resetZoomToFit();
  assert.equal(useCanvasViewportStore.getState().zoomMode, "fit");
  assert.equal(useCanvasViewportStore.getState().panX, 0);
  assert.equal(useCanvasViewportStore.getState().panY, 0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-viewport-store.test.ts`
Expected: FAIL (`Cannot find module '../apps/editor/src/features/editor/store/canvas-viewport-store'`).

- [ ] **Step 3: Implement `canvas-viewport-store.ts` and wire `ViewportControls.tsx`, `Inspector.tsx`, `useEditor.ts`, and `EditorTopBar.tsx`**

Create `apps/editor/src/features/editor/store/canvas-viewport-store.ts`:

```ts
import { create } from "zustand";
import type { Breakpoint } from "@webbuilder/site-runtime/types/elements";
import type { Viewport } from "../context/EditorContext";

export type ViewportPreset = "mobile" | "tablet" | "desktop";
export type ZoomMode = "fit" | "manual";

export const STAGE_HORIZONTAL_GUTTER_PX = 64;
export const STAGE_TOP_GUTTER_PX = 40;
export const STAGE_BOTTOM_GUTTER_PX = 32;
export const MIN_FRAME_WIDTH_PX = 320;
export const MAX_FRAME_WIDTH_PX = 2560;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2.0;

export const PRESET_WIDTHS: Readonly<Record<ViewportPreset, number>> = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
};

const BREAKPOINT_MIN_WIDTH: Readonly<Record<Breakpoint, number | null>> = {
  default: null,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export interface CanvasViewportStoreState {
  readonly frameWidthPx: number;
  readonly preset: ViewportPreset | "custom";
  readonly activeBreakpoint: Breakpoint;
  readonly zoomMode: ZoomMode;
  readonly manualZoom: number;
  readonly stageWidthPx: number;
  readonly stageHeightPx: number;
  readonly panX: number;
  readonly panY: number;
  setPreset: (preset: ViewportPreset) => void;
  scrubFrameWidth: (widthPx: number) => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  setStageBounds: (widthPx: number, heightPx: number) => void;
  zoomByWheel: (deltaY: number) => void;
  setManualZoom: (zoom: number) => void;
  resetZoomToFit: () => void;
  panBy: (dx: number, dy: number) => void;
  resetViewport: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeFitZoom(frameWidthPx: number, stageWidthPx: number): number {
  if (stageWidthPx <= STAGE_HORIZONTAL_GUTTER_PX || frameWidthPx <= 0) return 1;
  const available = stageWidthPx - STAGE_HORIZONTAL_GUTTER_PX;
  return clamp(Math.min(1, available / frameWidthPx), MIN_ZOOM, 1);
}

export function computeEffectiveZoom(
  state: Pick<CanvasViewportStoreState, "zoomMode" | "manualZoom" | "frameWidthPx" | "stageWidthPx">,
): number {
  return state.zoomMode === "manual"
    ? clamp(state.manualZoom, MIN_ZOOM, MAX_ZOOM)
    : computeFitZoom(state.frameWidthPx, state.stageWidthPx);
}

export function minWidthForBreakpoint(bp: Breakpoint): number | null {
  return BREAKPOINT_MIN_WIDTH[bp];
}

export function breakpointForScrubbedWidth(
  widthPx: number,
  currentBp: Breakpoint,
): Breakpoint {
  if (widthPx < 640) return "default";
  if (widthPx < 768) return "sm";
  if (widthPx < 1024) return "md";
  if (widthPx < 1280) return "lg";
  return currentBp === "xl" ? "xl" : "default";
}

export function viewportFromState(
  state: Pick<CanvasViewportStoreState, "preset" | "frameWidthPx">,
): Viewport {
  if (state.preset !== "custom") return state.preset;
  if (state.frameWidthPx < 640) return "mobile";
  if (state.frameWidthPx < 1024) return "tablet";
  return "desktop";
}

const INITIAL_DATA = {
  frameWidthPx: 1440,
  preset: "desktop" as const,
  activeBreakpoint: "default" as Breakpoint,
  zoomMode: "fit" as ZoomMode,
  manualZoom: 1,
  stageWidthPx: 1200,
  stageHeightPx: 800,
  panX: 0,
  panY: 0,
};

export const useCanvasViewportStore = create<CanvasViewportStoreState>((set) => ({
  ...INITIAL_DATA,

  setPreset: (preset) =>
    set({
      preset,
      frameWidthPx: PRESET_WIDTHS[preset],
      activeBreakpoint: preset === "tablet" ? "md" : "default",
      panX: 0,
      panY: 0,
    }),

  scrubFrameWidth: (widthPx) =>
    set((s) => {
      const clamped = Math.round(clamp(widthPx, MIN_FRAME_WIDTH_PX, MAX_FRAME_WIDTH_PX));
      return {
        preset: "custom",
        frameWidthPx: clamped,
        activeBreakpoint: breakpointForScrubbedWidth(clamped, s.activeBreakpoint),
      };
    }),

  setActiveBreakpoint: (bp) =>
    set((s) => {
      const minW = minWidthForBreakpoint(bp);
      const nextWidth = minW !== null && s.frameWidthPx < minW ? minW : s.frameWidthPx;
      const nextPreset = nextWidth === s.frameWidthPx ? s.preset : "custom";
      return {
        activeBreakpoint: bp,
        frameWidthPx: nextWidth,
        preset: nextPreset,
      };
    }),

  setStageBounds: (widthPx, heightPx) =>
    set((s) =>
      s.stageWidthPx === widthPx && s.stageHeightPx === heightPx
        ? s
        : { stageWidthPx: widthPx, stageHeightPx: heightPx },
    ),

  zoomByWheel: (deltaY) =>
    set((s) => {
      const base = computeEffectiveZoom(s);
      const next = clamp(base * Math.exp(-deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM);
      return { zoomMode: "manual", manualZoom: Math.round(next * 1000) / 1000 };
    }),

  setManualZoom: (zoom) =>
    set({
      zoomMode: "manual",
      manualZoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM),
    }),

  resetZoomToFit: () => set({ zoomMode: "fit", panX: 0, panY: 0 }),

  panBy: (dx, dy) =>
    set((s) => {
      const zoom = computeEffectiveZoom(s);
      const maxPanX = Math.max(240, Math.round(s.frameWidthPx * zoom * 0.75));
      const maxPanY = Math.max(240, Math.round(s.stageHeightPx * 0.75));
      return {
        panX: clamp(s.panX + dx, -maxPanX, maxPanX),
        panY: clamp(s.panY + dy, -maxPanY, maxPanY),
      };
    }),

  resetViewport: () => set(INITIAL_DATA),
}));
```

Update callers:
- `ViewportControls.tsx`: Keep optional `currentView` / `setCurrentView` props for backward compatibility, defaulting to `useCanvasViewportStore`. Show live `${frameWidthPx}px` badge, active `activeBreakpoint` label (`Base`, `SM`, `MD`, `LG`, `XL`), and a clickable zoom percentage pill (`${Math.round(effectiveZoom * 100)}%`, resetting `resetZoomToFit()` on click with `aria-label="Reset zoom to fit"`).
- `Inspector.tsx`: Replace `const [breakpoint, setBreakpoint] = useState<Breakpoint>("default")` with `const breakpoint = useCanvasViewportStore((s) => s.activeBreakpoint)` and `const setBreakpoint = useCanvasViewportStore((s) => s.setActiveBreakpoint)`.
- `useEditor.ts`: Derive `currentView` via `useCanvasViewportStore(viewportFromState)` and wire `setCurrentView` to `useCanvasViewportStore.getState().setPreset(...)` so `AiChatPanel.tsx` and `EditorContext` stay synchronized.

- [ ] **Step 4: Run unit tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-viewport-store.test.ts tests/sidebar-style-sections.test.ts && bun run typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 2**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add apps/editor/src/features/editor/store/canvas-viewport-store.ts \
  apps/editor/src/features/editor/components/editor/header/ViewportControls.tsx \
  apps/editor/src/features/editor/components/sidebar/Inspector.tsx \
  apps/editor/src/features/editor/hooks/useEditor.ts \
  apps/editor/src/features/editor/components/topbar/EditorTopBar.tsx \
  tests/canvas-viewport-store.test.ts
git commit -m "feat(editor): add canvasViewportStore with auto-fit zoom and synced breakpoints"
```

---

### Task 3: Unified drop hit-testing, edge auto-scroll, and stage coordinate projection (`rectTracker`)

**Files:**
- Create: `apps/editor/src/features/editor/components/canvas/rectTracker.ts`
- Create: `apps/editor/src/features/editor/components/canvas/canvasHitTest.ts`
- Create: `apps/editor/src/features/editor/components/canvas/useAutoScroll.ts`
- Modify: `apps/editor/src/features/editor/components/canvas/canvasDom.ts`
- Modify: `apps/editor/src/features/editor/components/canvas/canvasTypes.ts`
- Test: `tests/canvas-hit-test.test.ts`

**Interfaces:**
- Consumes: `computeDropPosition`, `isHorizontalFlow`, `isNoOpMove`, `resolveNearestChildSlot` from `apps/editor/src/features/editor/utils/element/dropPosition.ts`
- Produces:
  - `ElementRect` (`{ readonly left: number; readonly top: number; readonly width: number; readonly height: number }`), `StageProjectionParams`, `projectIframeRectToStage`, `parentClientToIframeClient`, `iframeDocPointToStage`, `findElementNode`, and `useStageElementRect` in `rectTracker.ts`
  - `CanvasDropResolution` (`{ readonly kind: "root" } | { readonly kind: "relative"; readonly indicator: DropIndicatorState } | null`) and `resolveCanvasDropTarget` in `canvasHitTest.ts`
  - `computeAutoScrollStep(pointerY: number, frameTop: number, frameHeight: number): number` and `useAutoScroll` in `useAutoScroll.ts`

- [ ] **Step 1: Write the failing test in `tests/canvas-hit-test.test.ts`**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  iframeDocPointToStage,
  parentClientToIframeClient,
  projectIframeRectToStage,
} from "../apps/editor/src/features/editor/components/canvas/rectTracker";
import { computeAutoScrollStep } from "../apps/editor/src/features/editor/components/canvas/useAutoScroll";
import { resolveCanvasDropTarget } from "../apps/editor/src/features/editor/components/canvas/canvasHitTest";

test("projects iframe rects, parent pointers, and document cursor coordinates across zoom", () => {
  const stageRect = { left: 200, top: 60, width: 1000, height: 700 };
  const frameRect = { left: 240, top: 100, width: 720, height: 600 };
  const zoom = 0.5; // 1440px logical width scaled by 0.5 -> 720px screen width

  const hud = projectIframeRectToStage(
    { left: 100, top: 40, width: 400, height: 80 },
    { stageRect, frameRect, zoom },
  );
  assert.deepEqual(hud, { left: 90, top: 60, width: 200, height: 40 });

  const iframePt = parentClientToIframeClient(340, 160, frameRect, zoom);
  assert.deepEqual(iframePt, { x: 200, y: 120 });

  const cursorStage = iframeDocPointToStage(
    200,
    520,
    { scrollLeft: 0, scrollTop: 400 },
    { stageRect, frameRect, zoom },
  );
  assert.deepEqual(cursorStage, { x: 140, y: 100 });
});

test("computeAutoScrollStep scrolls smoothly near top and bottom 48px edges", () => {
  assert.equal(computeAutoScrollStep(300, 100, 500), 0);
  assert.ok(computeAutoScrollStep(110, 100, 500) < 0);
  assert.ok(computeAutoScrollStep(590, 100, 500) > 0);
});

test("resolveCanvasDropTarget handles empty root and below-last-section fallback", () => {
  const emptyDoc = {
    elementsFromPoint: () => [],
  };
  const emptyRes = resolveCanvasDropTarget({
    siteRoot: { children: [] } as unknown as HTMLElement,
    doc: emptyDoc as unknown as Document,
    iframeClientX: 200,
    iframeClientY: 200,
    elements: [],
    canCreate: true,
    isComponentPage: false,
  });
  assert.deepEqual(emptyRes, { kind: "root" });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-hit-test.test.ts`
Expected: FAIL (`Cannot find module '../apps/editor/src/features/editor/components/canvas/rectTracker'`).

- [ ] **Step 3: Implement `rectTracker.ts`, `canvasHitTest.ts`, `useAutoScroll.ts`, and update `canvasDom.ts`**

Create `apps/editor/src/features/editor/components/canvas/rectTracker.ts`:
- Export `ElementRect`, `RectLike`, `StageProjectionParams`, `projectIframeRectToStage`, `parentClientToIframeClient`, `iframeDocPointToStage`, `findElementNode(root, id)`, and `useStageElementRect(siteRoot, stageEl, iframeEl, id)`:
  - Subscribes to capture-phase `scroll` on `siteRoot.ownerDocument`, `ResizeObserver` (`node`, `siteRoot.ownerDocument.documentElement`, `stageEl`), `MutationObserver` on `siteRoot` (`{ subtree: true, childList: true, attributes: true, characterData: true }`), capture-phase `load` on `siteRoot` (images), `siteRoot.ownerDocument.fonts?.ready`, `useElementStore` elements, and `useCanvasViewportStore` (`frameWidthPx`, `zoomMode`, `manualZoom`, `stageWidthPx`, `stageHeightPx`, `panX`, `panY`).
  - Coalesces measurements via `requestAnimationFrame` and exposes `{ node, rect, visibleInFrame }` (where `visibleInFrame` is `inFrameRect.bottom > 0 && inFrameRect.top < iframeEl.clientHeight`).

Create `apps/editor/src/features/editor/components/canvas/canvasHitTest.ts`:
- Export `CanvasDropResolution` and `resolveCanvasDropTarget` handling:
  1. Empty page (`elements.length === 0 && canCreate` -> `{ kind: "root" }`).
  2. `doc.elementsFromPoint(iframeClientX, iframeClientY)` finding the deepest `[data-element-id]` node inside `siteRoot` (excluding `draggedNode` and its subtree, and excluding `[inert]`), computing `before` / `after` / `inside`, and resolving Flex/Grid child slots via `resolveNearestChildSlot` when `position === "inside"` on a non-empty container!
  3. Below-last-element fallback: when `elementsFromPoint` hits `siteRoot` or `body` below the last root element (and `!isComponentPage`), resolves `{ kind: "relative", indicator: { targetId: lastRootId, position: "after", horizontal: false } }`.
  4. Suppresses no-op moves when `movingElementId` is provided via `isNoOpMove`.

Create `apps/editor/src/features/editor/components/canvas/useAutoScroll.ts`:
- `EDGE_ZONE_PX = 48`, `MAX_SCROLL_PX_PER_FRAME = 14`.
- `computeAutoScrollStep(pointerClientY, frameTop, frameHeight)` returns negative step near top edge, positive step near bottom edge, `0` otherwise.
- `useAutoScroll(iframeRef, activePointerParentY, onScrollTick)` runs a `requestAnimationFrame` loop scrolling `iframeRef.current?.contentDocument?.scrollingElement` while active.

Update `apps/editor/src/features/editor/components/canvas/canvasDom.ts`:
- Switch `findElementNode` import from `./useElementRect` to `./rectTracker` and add `editingElementId?: string | undefined` to `setCanvasSelection`.

- [ ] **Step 4: Run unit tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-hit-test.test.ts tests/canvas-interaction-helpers.test.ts && bun run typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 3**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add apps/editor/src/features/editor/components/canvas/rectTracker.ts \
  apps/editor/src/features/editor/components/canvas/canvasHitTest.ts \
  apps/editor/src/features/editor/components/canvas/useAutoScroll.ts \
  apps/editor/src/features/editor/components/canvas/canvasDom.ts \
  apps/editor/src/features/editor/components/canvas/canvasTypes.ts \
  tests/canvas-hit-test.test.ts
git commit -m "feat(canvas): add stage rect projection, unified drop hit-tester, and auto-scroll"
```

---

### Task 4: Selection vs inline text-edit state machine, zoom-aware manipulation, and safe keyboard shortcuts

**Files:**
- Modify: `apps/editor/src/features/editor/store/selection-store.ts`
- Modify: `apps/editor/src/features/editor/store/selectors/selection-selectors.ts`
- Modify: `apps/editor/src/features/editor/components/elements/shared/useCanvasElement.ts`
- Modify: `apps/editor/src/features/editor/components/canvas/useCanvasManipulation.ts`
- Create: `apps/editor/src/features/editor/components/canvas/useCanvasController.ts`
- Modify: `apps/editor/src/features/editor/lib/keyBoardEvents.ts`
- Modify: `apps/editor/src/features/editor/hooks/useEditorShortcuts.ts`
- Modify: `tests/canvas-manipulation.test.ts`
- Test: `tests/canvas-interaction-state.test.ts`
- Test: `tests/editor-shortcuts.test.ts`

**Interfaces:**
- Consumes: `useCanvasViewportStore`, `computeEffectiveZoom`, `resolveCanvasDropTarget`, `parentClientToIframeClient`, `elementUtils.updateElementStyle`
- Produces:
  - `editingElementId: string | undefined` and `setEditingElementId: (id: string | undefined) => void` on `useSelectionStore` (`SelectionStore`) + `useIsEditingElement(id: string): boolean` selector
  - Zoom-aware, breakpoint-aware `useCanvasManipulation` (divides pointer deltas by `getZoom()`, commits via `elementUtils.updateElementStyle` at `activeBreakpoint`, clears inline `node.style` preview properties upon commit and cancel, and aborts cleanly on `window` `blur` / `Escape` / `pointercancel`)
  - `useCanvasController` managing single-click select, `Alt+click` parent select, backdrop deselect, double-click inline text edit (`editingElementId`), pick mode, `Ctrl+wheel` zoom, `Space+drag` pan, and unified HTML5 sidebar drop + pointer move
  - Hardened `ElementKeyboardActions` and `useEditorShortcuts` (bound to `document` + `mountNode?.ownerDocument`, guarded by `editingElementId` + `isTypingTarget`, `Backspace` + `Ctrl/Cmd+Shift+Z`, selection-only destructive/clipboard actions, relative paste, `Escape` step-out hierarchy)

- [ ] **Step 1: Write failing tests in `tests/editor-shortcuts.test.ts` and `tests/canvas-interaction-state.test.ts`**

Create `tests/editor-shortcuts.test.ts` testing:
1. Pressing `Delete` or `Backspace` when `selectedElementId === undefined` and `hoveredElementId === "el-1"` does NOT delete `"el-1"` (pins Review Focus #2).
2. Pressing `Delete` or `Backspace` when `editingElementId === "el-1"` or when focus is inside a `contentEditable` / `<input>` node does NOT delete `"el-1"` (pins Review Focus #2).
3. `Escape` steps out in order: `editingElementId = "child"` -> clears `editingElementId` keeping `selectedElementId = "child"` -> next `Escape` steps up to `selectedElementId = "parent"` -> next `Escape` clears `selectedElementId = undefined`.
4. `pasteElement()` inserts `inside` when a container is selected, `after` when a leaf element is selected, and appends to root when nothing is selected.
5. `Ctrl+Shift+Z` / `Meta+Shift+Z` invokes `redo()`.

Create `tests/canvas-interaction-state.test.ts` testing:
1. Single click (`pointerdown` + `pointerup` within `4px`) on an editable `Heading` selects it (`selectedElementId === "h1"`, `editingElementId === undefined`, `contentEditable` is NOT enabled).
2. Double click on `"h1"` sets `editingElementId === "h1"`, enabling `contentEditable`.
3. Resizing `"box-1"` with `effectiveZoom = 0.5` and `activeBreakpoint = "md"` by `+50px` screen delta writes `width: "<start + 100>px"` into `styles.md` AND updates `tailwindStyles` with `md:w-[...]` via `updateElementStyle`, while clearing `node.style.width` back to `""` on `pointerup` (pins Review Focus #3).

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/editor-shortcuts.test.ts tests/canvas-interaction-state.test.ts`
Expected: FAIL (`editingElementId` / `useCanvasController` not implemented and hover-delete bug present).

- [ ] **Step 3: Implement `selection-store.ts`, `useCanvasElement.ts`, `useCanvasManipulation.ts`, `useCanvasController.ts`, `keyBoardEvents.ts`, and `useEditorShortcuts.ts`**

Key implementation details:
1. `selection-store.ts`:
   - Add `editingElementId: string | undefined` and `setEditingElementId: (id: string | undefined) => void`.
   - Changing `selectedElementId` to a different id or calling `clearSelection()` automatically clears `editingElementId: undefined`.
2. `useCanvasElement.ts`:
   - Change `isEditing` from `canEdit && isSelected && elementUtils.isEditableElement(element)` to:
     `const editingElementId = useSelectionStore((s) => s.editingElementId);`
     `const isEditing = canEdit && editingElementId === element.id && elementUtils.isEditableElement(element);`
   - Remove `...elementUtils.getSafeStyles(element)` from `rootProps.style` (leaving `{ ...style, ...eventsStyle(eventsActive) }`), and add `useEffect` that focuses the DOM node when `isEditing` flips to `true`.
   - On `onBlur`: commit `textContent` if changed and call `useSelectionStore.getState().setEditingElementId(undefined)`.
3. `useCanvasManipulation.ts`:
   - Accept `getZoom: () => number` and `stageEl: HTMLElement | null`, `iframeRef: React.RefObject<HTMLIFrameElement | null>`.
   - Normalize pointer events from either `window` or `iframeWin` into iframe CSS pixel coordinates (`iframeClientX`, `iframeClientY`) using `parentClientToIframeClient` when `event.view === window`, and for resize/spacing divide screen pointer deltas by `zoom` (when `event.view === iframeWin`, note that browsers report `clientX` inside CSS-transformed iframes in unscaled iframe CSS pixels already! Verify both `event.view === window` via `(e.clientX - frameRect.left) / zoom` and `event.view === iframeWin` via `e.clientX` so both realms produce identical unscaled iframe CSS coordinates!).
   - Read `const bp = useCanvasViewportStore.getState().activeBreakpoint` at gesture start; preview on `node.style[prop]` during rAF; on `pointerup` if `moved`:
     - Restore `restoreInlineStyles(node, snapshot)` AND call `elementUtils.updateElementStyle(element, nextBpStyles, bp, useElementStore.getState().updateElement, dropStaleAxisClass)` so `styles[bp]` and `tailwindStyles` update atomically and `node.style` stays clean!
   - On `pointerup` in `handleCanvasPointerDown` when `!active` (movement `<= 4px`):
     - Select `elementId` (`Alt+click` selects `findParentId(elements, elementId) ?? elementId`) and clear `editingElementId: undefined`!
   - Add `win.addEventListener("blur", cancelCurrent)` so switching OS windows mid-drag cancels cleanly.
4. `useCanvasController.ts`:
   - Combines `useCanvasPickMode`, `useCanvasManipulation`, unified HTML5 drag-and-drop (`resolveCanvasDropTarget` + `resolveInsertedElement` + `insertElementRelative` / `addElement`), `useAutoScroll`, double-click to enter `editingElementId`, backdrop click to clear selection, `Ctrl/Meta + wheel` to `zoomByWheel`, and `Space + pointer drag` to `panBy`.
5. `keyBoardEvents.ts` and `useEditorShortcuts.ts`:
   - Replace `getSelectedOrHoveredElement()` in `copyElement`, `cutElement`, `deleteElement`, `bringToFront`, and `sendToBack` with strict selected-element lookup (`elementUtils.findById(ElementStore.getState().elements, SelectionStore.getState().selectedElementId ?? "")`).
   - Update `pasteElement()` to insert `inside` selected container or `after` selected leaf via `insertElementRelative` (falling back to `addElement` when nothing is selected).
   - Add `stepOutSelection()` for `Escape`: if `editingElementId` is set -> clear `editingElementId`; else if `selectedElementId` has a parent in `ElementStore` -> select parent; else -> `clearSelection()`.
   - Update `useEditorShortcuts({ stageRef, mountNode, isReadOnly, isLocked })`: bind to `document` and `mountNode?.ownerDocument`, return immediately when `SelectionStore.getState().editingElementId !== undefined || isTypingTarget(e.target)`, support `Delete` + `Backspace`, and route `(e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z"` to `kb.redo()`.

- [ ] **Step 4: Run unit tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/editor-shortcuts.test.ts tests/canvas-interaction-state.test.ts tests/canvas-manipulation.test.ts && bun run typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 4**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add apps/editor/src/features/editor/store/selection-store.ts \
  apps/editor/src/features/editor/store/selectors/selection-selectors.ts \
  apps/editor/src/features/editor/components/elements/shared/useCanvasElement.ts \
  apps/editor/src/features/editor/components/canvas/useCanvasManipulation.ts \
  apps/editor/src/features/editor/components/canvas/useCanvasController.ts \
  apps/editor/src/features/editor/lib/keyBoardEvents.ts \
  apps/editor/src/features/editor/hooks/useEditorShortcuts.ts \
  tests/canvas-manipulation.test.ts \
  tests/canvas-interaction-state.test.ts \
  tests/editor-shortcuts.test.ts
git commit -m "feat(canvas): implement click-vs-edit state machine, zoom-aware commits, and safe shortcuts"
```

---

### Task 5: Isolated `SiteFrame`, parent-DOM `CanvasHud`, `CanvasStage`, and normalized collaborator/agent overlays

**Files:**
- Create: `apps/editor/src/features/editor/components/canvas/SiteFrame.tsx`
- Create: `apps/editor/src/features/editor/components/canvas/CanvasHud.tsx`
- Create: `apps/editor/src/features/editor/components/canvas/CanvasStage.tsx`
- Modify: `apps/editor/src/features/editor/components/ElementLoader.tsx`
- Modify: `apps/editor/src/features/editor/components/resizehandler/ResizeChrome.tsx`
- Modify: `apps/editor/src/features/editor/components/resizehandler/SpacingChrome.tsx`
- Modify: `apps/editor/src/features/collaboration/hooks/useCanvasCursorBroadcast.ts`
- Modify: `apps/editor/src/features/editor/components/editor/RemoteCursorsOverlay.tsx`
- Modify: `apps/editor/src/features/agent/components/AgentCanvasOverlay.tsx`
- Modify: `apps/editor/src/features/editor/context/EditorContext.ts`
- Modify: `apps/editor/src/providers/editorprovider.tsx`
- Modify: `apps/editor/src/app/_protected/editor.$id/-editor.tsx`
- Test: `tests/canvas-stage-and-hud.test.ts`

**Interfaces:**
- Consumes: `compileElementStylesCss`, `useCanvasViewportStore`, `rectTracker`, `useCanvasController`, `useEditorShortcuts`
- Produces:
  - `SiteFrame` (`apps/editor/src/features/editor/components/canvas/SiteFrame.tsx`): persistent `<iframe id="preview-iframe" aria-label="editor-preview-iframe" />` with static `SITE_IFRAME_SRCDOC`, `#wb-site-root` portal mount, and in-place `<style>` updates (`#wb-tailwind-css`, `#wb-element-styles`, `#wb-project-css`).
  - `CanvasHud` (`apps/editor/src/features/editor/components/canvas/CanvasHud.tsx`): parent-DOM overlay with `OutlineClippedLayer` (`clip-path` matching `frameRect` inside `stageRect`) and unclipped `FloatingChromeLayer` (`ElementLabel`, `ResizeChrome`, `SpacingChrome` scaled by `effectiveZoom` for spacing bands while keeping handles crisp `1:1`, `MovingBadge`, `RemoteCursorsOverlay`, `AgentCanvasOverlay`).
  - `CanvasStage` (`apps/editor/src/features/editor/components/canvas/CanvasStage.tsx`): top-level Design/Code stage with auto-fit/manual zoom transform, symmetric left/right width scrub handles, `EmptyPageStarter`, `AddSectionDivider`, `EditorContextMenu`, and `renderAgentPlaybackHud`.

- [ ] **Step 1: Write the failing test in `tests/canvas-stage-and-hud.test.ts`**

Write tests verifying:
1. `SITE_IFRAME_SRCDOC` contains `#wb-site-root`, `margin:0;padding:0`, and zero host `document.head` queries, and changing `frameWidthPx` or `preset` on `useCanvasViewportStore` preserves the exact same `HTMLIFrameElement` node (pins Review Focus #4).
2. `computeBroadcastDocPoint` and `projectRemoteCursorToStage` round-trip collaborator cursor positions accurately across two users with different `scrollTop` (`0` vs `300`) and different `effectiveZoom` (`1.0` vs `0.5`) (pins Review Focus #5).
3. `SpacingChrome` and `ResizeChrome` align bands and handles with `zoom`-projected `ElementRect` values.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-stage-and-hud.test.ts`
Expected: FAIL (`Cannot find module '../apps/editor/src/features/editor/components/canvas/SiteFrame'`).

- [ ] **Step 3: Implement `SiteFrame.tsx`, `CanvasHud.tsx`, `CanvasStage.tsx`, and update `ElementLoader.tsx`, chrome overlays, collaboration cursors, `AgentCanvasOverlay.tsx`, and `-editor.tsx`**

Key implementation details:
1. `SiteFrame.tsx`:
   - Static `SITE_IFRAME_SRCDOC` with `#wb-site-root { min-height: 100vh; width: 100%; margin: 0; padding: 0; }`.
   - `useLayoutEffect` updates `#wb-tailwind-css`, `#wb-element-styles` (`compileElementStylesCss(resolvedElements)`), and `#wb-project-css` (`projectCssToStyleTag` / `sanitizeProjectCss` + drag/pick cursor rules) in `iframe.contentDocument.head` without touching `srcDoc` after mount.
   - Registers `mountNode` (`#wb-site-root`) with `collab?.setCanvasElement?.(mountNode)`.
2. `ElementLoader.tsx`:
   - Remove `<CanvasInteractionLayer>` wrapper from `RootElementLoader`! `RootElementLoader` now renders pure site elements inside `InteractionHost` (with `EditorFlagsProvider`, `ChildElementLoaderProvider`, and `ResolvedInstancesContext`), keeping `#wb-site-root` 100% free of Editor HUD DOM! Expose `resolved` / `instances` to `CanvasStage` (or hoist `useResolvedElements` in `CanvasStage` and pass down so both `SiteFrame` CSS compilers and `CanvasHud` `ComponentBadge` share one `resolved` computation).
3. `SpacingChrome.tsx` and `ResizeChrome.tsx`:
   - Update `ElementRect` import from `../canvas/useElementRect` to `../canvas/rectTracker`.
   - Pass `zoom: number` to `SpacingChrome` so `padding` / `margin` / `gap` band pixel thickness scales visually by `zoom` (`px * zoom`) while the text pill still displays the true unscaled CSS `px` value (`px`) and handle hit targets remain crisp `1:1` UI pixels!
4. `useCanvasCursorBroadcast.ts` and `RemoteCursorsOverlay.tsx`:
   - In `useCanvasCursorBroadcast.ts`: read `const doc = canvas.ownerDocument; const scroller = doc.scrollingElement ?? doc.documentElement;` and send `docX = Math.round(event.clientX + scroller.scrollLeft)`, `docY = Math.round(event.clientY + scroller.scrollTop)`.
   - In `RemoteCursorsOverlay.tsx`: accept `{ userId, siteRoot, stageEl, iframeEl }` and project each remote `(docX, docY)` via `iframeDocPointToStage` into `CanvasHud` coordinates.
5. `AgentCanvasOverlay.tsx`, `EditorContext.ts`, `editorprovider.tsx`:
   - Update `renderAgentCanvasOverlay` signature to `(siteRoot: HTMLElement, projectRect?: (node: HTMLElement) => ElementRect | null) => ReactNode` so `AgentCanvasOverlay` renders inside `CanvasHud` using `projectRect` while still calling `node.scrollIntoView` inside the iframe when following a local agent.
6. `-editor.tsx`:
   - Replace `PreviewContainer` + `EditorCanvas` with `<CanvasStage />`, keeping `WireframeBoard` and `CodeSplit` working cleanly.

- [ ] **Step 4: Run unit tests and typecheck**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && node --import tsx --test tests/canvas-stage-and-hud.test.ts && bun run typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit Task 5**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add apps/editor/src/features/editor/components/canvas/SiteFrame.tsx \
  apps/editor/src/features/editor/components/canvas/CanvasHud.tsx \
  apps/editor/src/features/editor/components/canvas/CanvasStage.tsx \
  apps/editor/src/features/editor/components/ElementLoader.tsx \
  apps/editor/src/features/editor/components/resizehandler/ResizeChrome.tsx \
  apps/editor/src/features/editor/components/resizehandler/SpacingChrome.tsx \
  apps/editor/src/features/collaboration/hooks/useCanvasCursorBroadcast.ts \
  apps/editor/src/features/editor/components/editor/RemoteCursorsOverlay.tsx \
  apps/editor/src/features/agent/components/AgentCanvasOverlay.tsx \
  apps/editor/src/features/editor/context/EditorContext.ts \
  apps/editor/src/providers/editorprovider.tsx \
  apps/editor/src/app/_protected/editor.$id/-editor.tsx \
  tests/canvas-stage-and-hud.test.ts
git commit -m "feat(canvas): mount isolated SiteFrame with parent-DOM CanvasStage and CanvasHud"
```

---

### Task 6: Migrate remaining test fixtures, delete legacy canvas files, and enforce architectural boundaries

**Files:**
- Delete: `apps/editor/src/features/editor/components/editor/PreviewContainer.tsx`
- Delete: `apps/editor/src/features/editor/components/editor/EditorCanvas.tsx`
- Delete: `apps/editor/src/features/editor/hooks/useIframePreview.ts`
- Delete: `apps/editor/src/features/editor/hooks/useCanvasRootDrop.ts`
- Delete: `apps/editor/src/features/editor/components/canvas/CanvasInteractionLayer.tsx`
- Delete: `apps/editor/src/features/editor/components/canvas/CanvasOverlay.tsx`
- Delete: `apps/editor/src/features/editor/components/canvas/useCanvasDragDrop.ts`
- Delete: `apps/editor/src/features/editor/components/canvas/useElementRect.ts`
- Modify: `tests/editor-hooks-and-canvas.test.ts`
- Modify: `tests/editor-canvas-dnd.test.ts`
- Modify: `tests/fixtures/interactions-pick.tsx`
- Modify: `tests/interactions-pick.browser.ts`
- Modify: `tests/architecture-boundaries.test.ts`

**Interfaces:**
- Consumes: `rectTracker`, `canvasHitTest`, `useCanvasController`, `SiteFrame`, `CanvasStage`
- Produces: Zero remaining imports of deleted legacy canvas modules and a structural invariant in `tests/architecture-boundaries.test.ts` banning Editor host stylesheet cloning into `#preview-iframe`.

- [ ] **Step 1: Add the structural boundary rule in `tests/architecture-boundaries.test.ts` and update `tests/editor-hooks-and-canvas.test.ts`, `tests/editor-canvas-dnd.test.ts`, and `tests/fixtures/interactions-pick.tsx`**

1. In `tests/architecture-boundaries.test.ts`, add Boundary Rule 10 asserting:
   - Legacy canvas files (`PreviewContainer.tsx`, `EditorCanvas.tsx`, `useIframePreview.ts`, `useCanvasRootDrop.ts`, `CanvasInteractionLayer.tsx`, `CanvasOverlay.tsx`, `useCanvasDragDrop.ts`, `useElementRect.ts`) do not exist.
   - `SiteFrame.tsx` never queries `document.head.querySelectorAll` to clone Editor stylesheets into `#preview-iframe`.
2. Migrate `tests/editor-hooks-and-canvas.test.ts` (`useStageElementRect` / `findElementNode` from `rectTracker.ts` and root section creation / drop permission tests via `useCanvasController` / `useEditor`).
3. Migrate `tests/editor-canvas-dnd.test.ts` to test unified sidebar HTML5 drops + Flex/Grid child-slot resolution through `resolveCanvasDropTarget` and `useCanvasController`.
4. Migrate `tests/fixtures/interactions-pick.tsx` and `tests/interactions-pick.browser.ts` from `CanvasInteractionLayer` to `useCanvasPickMode` / `CanvasStage` harness without `window as any` casts.

- [ ] **Step 2: Delete the 8 legacy canvas files**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
rm apps/editor/src/features/editor/components/editor/PreviewContainer.tsx \
  apps/editor/src/features/editor/components/editor/EditorCanvas.tsx \
  apps/editor/src/features/editor/hooks/useIframePreview.ts \
  apps/editor/src/features/editor/hooks/useCanvasRootDrop.ts \
  apps/editor/src/features/editor/components/canvas/CanvasInteractionLayer.tsx \
  apps/editor/src/features/editor/components/canvas/CanvasOverlay.tsx \
  apps/editor/src/features/editor/components/canvas/useCanvasDragDrop.ts \
  apps/editor/src/features/editor/components/canvas/useElementRect.ts
```

- [ ] **Step 3: Run full verification across all workspaces**

Run: `cd /home/ghug/Code/Go/webbuilder/webbuilderv2 && bun run typecheck && bun run lint && bun run test:unit && bun run build:all`
Expected: PASS (`typecheck` 0 errors across all 4 workspaces, `oxlint` 0 errors, all unit tests passing, both `apps/editor` and `apps/sites` production builds green).

- [ ] **Step 4: Commit Task 6**

```bash
cd /home/ghug/Code/Go/webbuilder/webbuilderv2
git add -u apps/editor/src/features/editor \
  && git add tests/architecture-boundaries.test.ts \
    tests/editor-hooks-and-canvas.test.ts \
    tests/editor-canvas-dnd.test.ts \
    tests/fixtures/interactions-pick.tsx \
    tests/interactions-pick.browser.ts
git commit -m "refactor(canvas): remove legacy portal-in-iframe canvas modules and enforce isolation boundary"
```
