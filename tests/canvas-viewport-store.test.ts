import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { redirectModules } from "./support/test-stub-modules";
import {
  act,
  byLabel,
  byText,
  cleanup,
  click,
  flush,
  React,
  render,
} from "./support/sidebar-dom-harness";
import type { FrameElement } from "@webbuilder/site-runtime/types/elements/elements";

redirectModules({
  "@clerk/tanstack-react-start": "./test-clerk-stub.ts",
  "@tanstack/react-router": "./editor-router-stub.ts",
});

const {
  breakpointForScrubbedWidth,
  computeEffectiveZoom,
  computeFitZoom,
  minWidthForBreakpoint,
  useCanvasViewportStore,
  viewportFromState,
} = await import("../apps/editor/src/features/editor/store/canvas-viewport-store");
const { EditorContext } = await import("../apps/editor/src/features/editor/context/EditorContext");
const { useEditor } = await import("../apps/editor/src/features/editor/hooks/useEditor");
const { useElementStore } = await import("../apps/editor/src/features/editor/store/element-store");
const { useSelectionStore } = await import("../apps/editor/src/features/editor/store/selection-store");
const { editorValue, withEditor } = await import("./support/sidebar-fixtures");
const { default: ViewportControls } = await import(
  "../apps/editor/src/features/editor/components/editor/header/ViewportControls"
);
const { default: Inspector } = await import(
  "../apps/editor/src/features/editor/components/sidebar/Inspector"
);

const h = React.createElement;

function makeFrame(id: string): FrameElement {
  return {
    id,
    type: "Frame",
    content: "",
    pageId: "page-1",
    styles: {},
    tailwindStyles: "",
    elements: [],
  };
}

beforeEach(async () => {
  await cleanup();
  useCanvasViewportStore.getState().resetViewport();
  useElementStore.getState().setElements([], true);
  useSelectionStore.getState().setSelectedElement(undefined);
});

after(cleanup);

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

test("camera math helpers cover edge cases and viewport mapping", () => {
  assert.equal(computeFitZoom(1440, 64), 1);
  assert.equal(computeFitZoom(0, 1000), 1);
  assert.equal(computeFitZoom(2560, 120), 0.25);

  assert.equal(minWidthForBreakpoint("default"), null);
  assert.equal(minWidthForBreakpoint("sm"), 640);
  assert.equal(minWidthForBreakpoint("md"), 768);
  assert.equal(minWidthForBreakpoint("lg"), 1024);
  assert.equal(minWidthForBreakpoint("xl"), 1280);

  assert.equal(breakpointForScrubbedWidth(1300, "default"), "default");
  assert.equal(breakpointForScrubbedWidth(1300, "xl"), "xl");
  assert.equal(breakpointForScrubbedWidth(900, "default"), "md");
  assert.equal(breakpointForScrubbedWidth(1100, "default"), "lg");

  assert.equal(viewportFromState({ preset: "mobile", frameWidthPx: 1440 }), "mobile");
  assert.equal(viewportFromState({ preset: "custom", frameWidthPx: 500 }), "mobile");
  assert.equal(viewportFromState({ preset: "custom", frameWidthPx: 800 }), "tablet");
  assert.equal(viewportFromState({ preset: "custom", frameWidthPx: 1200 }), "desktop");
});

test("ViewportControls and Inspector synchronize breakpoints, presets, and zoom reset", async () => {
  const frame = makeFrame("frame-sync-1");
  useElementStore.getState().setElements([frame], true);
  useSelectionStore.getState().setSelectedElement(frame);
  useCanvasViewportStore.getState().setStageBounds(864, 700);

  const legacyCalls: string[] = [];
  const r = await render(
    withEditor(
      editorValue(),
      h(
        "div",
        null,
        h(ViewportControls, { setCurrentView: (v) => legacyCalls.push(v) }),
        h(Inspector),
      ),
      EditorContext,
    ),
  );
  await flush(10);

  // Initial state: 1440px, Base, 56% fit zoom ((864 - 64) / 1440 = 0.5555...)
  const widthBadge = byLabel(r.container, "Active viewport width: 1440px");
  assert.match(widthBadge.textContent ?? "", /1440px/);
  assert.match(widthBadge.textContent ?? "", /Base/);

  const zoomPill = byLabel(r.container, "Reset zoom to fit");
  assert.equal(zoomPill.textContent?.trim(), "56%");

  // Manual zoom updates zoom pill; clicking zoom pill resets to fit
  await act(() => {
    useCanvasViewportStore.getState().setManualZoom(1.5);
    useCanvasViewportStore.getState().panBy(80, 40);
  });
  assert.equal(zoomPill.textContent?.trim(), "150%");

  await click(zoomPill);
  assert.equal(useCanvasViewportStore.getState().zoomMode, "fit");
  assert.equal(useCanvasViewportStore.getState().panX, 0);
  assert.equal(zoomPill.textContent?.trim(), "56%");

  // Clicking Mobile preset updates store, legacy callback, width badge, and Inspector BreakpointButtons
  await click(byLabel(r.container, "Mobile"));
  assert.deepEqual(legacyCalls, ["mobile"]);
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 375);
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "default");
  assert.equal(byText(r.container, "Base", '[role="radio"]').getAttribute("aria-checked"), "true");

  // Clicking LG in Inspector widens frameWidthPx to 1024px and updates ViewportControls badge
  await click(byText(r.container, "LG", '[role="radio"]'));
  assert.equal(useCanvasViewportStore.getState().activeBreakpoint, "lg");
  assert.equal(useCanvasViewportStore.getState().frameWidthPx, 1024);
  const updatedBadge = byLabel(r.container, "Active viewport width: 1024px");
  assert.match(updatedBadge.textContent ?? "", /1024px/);
  assert.match(updatedBadge.textContent ?? "", /LG/);

  // Clicking Tablet preset updates Inspector BreakpointButtons to MD
  await click(byLabel(r.container, "Tablet"));
  assert.equal(byText(r.container, "MD", '[role="radio"]').getAttribute("aria-checked"), "true");
});

test("useEditor currentView and setCurrentView stay synchronized with useCanvasViewportStore", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let editorResult: ReturnType<typeof useEditor> | undefined;

  function Probe(): null {
    editorResult = useEditor("proj-1", "page-1");
    return null;
  }

  try {
    await render(h(QueryClientProvider, { client }, h(Probe)));
    assert.equal(editorResult?.currentView, "desktop");

    await act(() => {
      editorResult?.setCurrentView("tablet");
    });
    assert.equal(useCanvasViewportStore.getState().preset, "tablet");
    assert.equal(useCanvasViewportStore.getState().frameWidthPx, 768);
    assert.equal(editorResult?.currentView, "tablet");

    await act(() => {
      editorResult?.setCurrentView((prev) => (prev === "tablet" ? "mobile" : "desktop"));
    });
    assert.equal(useCanvasViewportStore.getState().preset, "mobile");
    assert.equal(useCanvasViewportStore.getState().frameWidthPx, 375);
    assert.equal(editorResult?.currentView, "mobile");
  } finally {
    await cleanup();
    client.clear();
    globalThis.fetch = realFetch;
  }
});
