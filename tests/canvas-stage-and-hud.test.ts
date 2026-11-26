import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, afterEach, beforeEach, test } from "node:test";
import { redirectModules } from "./support/test-stub-modules";
import { $q, $$q, cleanup, React, render } from "./support/sidebar-dom-harness";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

redirectModules({
  "@clerk/tanstack-react-start": "./test-clerk-stub.ts",
  "@clerk/tanstack-react-start/server": "./test-clerk-server-stub.ts",
  "@tanstack/react-start": "./test-start-stub.ts",
  "@tanstack/react-router": "./editor-router-stub.ts",
});

const CANVAS_DIR = "../apps/editor/src/features/editor/components/canvas";
const { SITE_IFRAME_SRCDOC, SiteFrame, computeFrameLayout } = await import(
  `${CANVAS_DIR}/SiteFrame`
);
const { computeClipInset } = await import(`${CANVAS_DIR}/CanvasHud`);
const { projectIframeRectToStage, parentClientToIframeClient } = await import(
  `${CANVAS_DIR}/rectTracker`
);
const { computeBroadcastDocPoint } = await import(
  "../apps/editor/src/features/collaboration/hooks/useCanvasCursorBroadcast"
);
const { projectRemoteCursorToStage } = await import(
  "../apps/editor/src/features/editor/components/editor/RemoteCursorsOverlay"
);
const { SpacingChrome } = await import(
  "../apps/editor/src/features/editor/components/resizehandler/SpacingChrome"
);
const { ResizeChrome } = await import(
  "../apps/editor/src/features/editor/components/resizehandler/ResizeChrome"
);
const { useCanvasViewportStore } = await import(
  "../apps/editor/src/features/editor/store/canvas-viewport-store"
);

const h = React.createElement;
const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const SITE_FRAME_SRC = path.join(
  REPO_ROOT,
  "apps/editor/src/features/editor/components/canvas/SiteFrame.tsx",
);

beforeEach(async () => {
  await cleanup();
  useCanvasViewportStore.getState().resetViewport();
});

afterEach(async () => {
  await cleanup();
});

after(() => {
  useCanvasViewportStore.getState().resetViewport();
});

test("SITE_IFRAME_SRCDOC is a static site-only shell with #wb-site-root and no host document.head access", () => {
  assert.ok(SITE_IFRAME_SRCDOC.includes('id="wb-site-root"'), "mounts #wb-site-root");
  assert.ok(SITE_IFRAME_SRCDOC.includes("margin:0;padding:0"), "resets margin and padding");
  assert.ok(!/<link\b/i.test(SITE_IFRAME_SRCDOC), "no cloned host <link> stylesheets");
  for (const id of ["wb-tailwind-css", "wb-element-styles", "wb-project-css"]) {
    assert.ok(SITE_IFRAME_SRCDOC.includes(`id="${id}"`), `declares #${id}`);
  }
  assert.ok(!SITE_IFRAME_SRCDOC.includes("p-4"), "no wrapper padding class");

  const source = fs.readFileSync(SITE_FRAME_SRC, "utf8");
  assert.ok(!/document\.head/.test(source), "SiteFrame never queries the host document.head");
  assert.ok(!/key=\{[^}]*currentView/.test(source), "SiteFrame never keys the iframe by the view");
});

test("SiteFrame keeps the exact same iframe node when frameWidthPx or preset change", async () => {
  const iframeRef = React.createRef<HTMLIFrameElement>();
  const elements: EditorElement[] = [];
  const r = await render(h(SiteFrame, { iframeRef, elements, onReady: () => {} }));
  const first = $q<HTMLIFrameElement>(r.container, "#preview-iframe");
  assert.equal(first.getAttribute("aria-label"), "editor-preview-iframe");
  assert.equal(first.getAttribute("srcdoc"), SITE_IFRAME_SRCDOC);
  const initialWidth = first.parentElement?.style.width;
  assert.equal(initialWidth, "1440px");

  await React.act(async () => {
    useCanvasViewportStore.getState().scrubFrameWidth(900);
  });
  const afterScrub = $q<HTMLIFrameElement>(r.container, "#preview-iframe");
  assert.equal(afterScrub, first, "scrubbing width keeps the iframe");
  assert.equal(afterScrub.parentElement?.style.width, "900px");

  for (const preset of ["mobile", "tablet", "desktop"] as const) {
    await React.act(async () => {
      useCanvasViewportStore.getState().setPreset(preset);
    });
    assert.equal($q<HTMLIFrameElement>(r.container, "#preview-iframe"), first, `preset ${preset}`);
    assert.equal(first.getAttribute("srcdoc"), SITE_IFRAME_SRCDOC);
  }
  assert.equal($$q(r.container, "iframe").length, 1);
});

test("computeFrameLayout centers the scaled frame under the top gutter and applies pan", () => {
  const layout = computeFrameLayout({
    frameWidthPx: 1440,
    zoomMode: "fit",
    manualZoom: 1,
    stageWidthPx: 784,
    stageHeightPx: 640,
    panX: 10,
    panY: -5,
  });
  assert.equal(layout.zoom, 0.5);
  assert.equal(layout.scaledWidth, 720);
  assert.equal(layout.left, (784 - 720) / 2 + 10);
  assert.equal(layout.top, 40 - 5);
  assert.equal(layout.scaledHeight, 640 - 40 - 32);
  assert.equal(layout.height * layout.zoom, layout.scaledHeight);
});

test("computeClipInset clips the HUD outline layer to the frame rect inside the stage rect", () => {
  const inset = computeClipInset(
    { left: 0, top: 0, width: 900, height: 700 },
    { left: 90, top: 40, width: 720, height: 628 },
  );
  assert.deepEqual(inset, { top: 40, right: 90, bottom: 32, left: 90 });
});

test("collaborator cursors round-trip between users with different scroll and zoom", () => {
  // User A: scrolled 300px at zoom 1. Pointer at iframe client (120, 80).
  const docPoint = computeBroadcastDocPoint(
    { clientX: 120, clientY: 80 },
    { scrollLeft: 0, scrollTop: 300 },
  );
  assert.deepEqual(docPoint, { x: 120, y: 380 });

  // Fractional pointer values are rounded for the wire.
  assert.deepEqual(
    computeBroadcastDocPoint({ clientX: 10.4, clientY: 20.6 }, { scrollLeft: 0.2, scrollTop: 0 }),
    { x: 11, y: 21 },
  );

  // User B: unscrolled, zoom 0.5, frame offset (100, 60) inside the stage.
  const stageRect = { left: 200, top: 50, width: 800, height: 600 };
  const frameRect = { left: 300, top: 110, width: 720, height: 500 };
  const params = { stageRect, frameRect, zoom: 0.5 };
  const stage = projectRemoteCursorToStage(
    docPoint,
    { scrollLeft: 0, scrollTop: 0 },
    params,
  );
  assert.deepEqual(stage, { x: 100 + 120 * 0.5, y: 60 + 380 * 0.5 });

  // Mapping B's stage point back to B's iframe client (and adding B's scroll)
  // recovers A's document point exactly.
  const back = parentClientToIframeClient(
    stage.x + stageRect.left,
    stage.y + stageRect.top,
    frameRect,
    params.zoom,
  );
  assert.deepEqual({ x: back.x, y: back.y }, docPoint);

  // Same cursor seen by a user scrolled to 300 and zoom 1.0 lands on A's viewport point.
  const sameView = projectRemoteCursorToStage(
    docPoint,
    { scrollLeft: 0, scrollTop: 300 },
    { stageRect, frameRect, zoom: 1 },
  );
  assert.deepEqual(sameView, { x: 100 + 120, y: 60 + 80 });
});

test("SpacingChrome scales bands by zoom while pills keep true CSS px and handles stay 1:1", async () => {
  const node = document.createElement("div");
  node.style.paddingTop = "20px";
  node.style.paddingLeft = "40px";
  document.body.appendChild(node);

  const zoom = 0.5;
  const rect = projectIframeRectToStage(
    { left: 100, top: 50, width: 400, height: 200 },
    {
      stageRect: { left: 0, top: 0, width: 900, height: 700 },
      frameRect: { left: 80, top: 40, width: 720, height: 600 },
      zoom,
    },
  );
  assert.deepEqual(rect, { left: 80 + 50, top: 40 + 25, width: 200, height: 100 });

  const element = {
    id: "box",
    type: "Frame",
    content: "",
    pageId: "p",
    styles: { default: { paddingTop: "20px", paddingLeft: "40px" } },
    tailwindStyles: "",
    elements: [],
  } as unknown as EditorElement;

  const r = await render(
    h(SpacingChrome, {
      rect,
      element,
      node,
      zoom,
      session: { kind: "idle" },
      canEdit: true,
      showAllSpacing: true,
      onStartSpacing: () => {},
    }),
  );

  const bands = $$q<HTMLElement>(r.container, ".bg-emerald-500\\/12");
  const top = bands.find((b) => b.style.top === "0px" && b.style.height !== "");
  assert.ok(top, "top padding band");
  assert.equal(top.style.height, "10px", "20 CSS px at zoom 0.5 is 10 screen px");
  assert.equal(top.textContent, "20", "pill shows the true CSS px value");
  const left = bands.find((b) => b.style.left === "0px" && b.style.width !== "");
  assert.ok(left, "left padding band");
  assert.equal(left.style.width, "20px");
  assert.equal(left.textContent, "40");

  const handle = $q<HTMLElement>(r.container, '[data-spacing-handle="padding-top"]');
  assert.ok(handle.className.includes("p-1.5"), "handle hit target is a fixed UI size");
  assert.ok(!handle.style.width && !handle.style.height, "handle is not scaled by zoom");
  node.remove();
});

test("ResizeChrome aligns edge strips and corner handles with the zoom-projected rect", async () => {
  const node = document.createElement("div");
  document.body.appendChild(node);
  const rect = projectIframeRectToStage(
    { left: 0, top: 0, width: 800, height: 400 },
    {
      stageRect: { left: 0, top: 0, width: 900, height: 700 },
      frameRect: { left: 50, top: 40, width: 400, height: 600 },
      zoom: 0.5,
    },
  );
  assert.deepEqual(rect, { left: 50, top: 40, width: 400, height: 200 });
  const element = {
    id: "box",
    type: "Frame",
    content: "",
    pageId: "p",
    styles: { default: {} },
    tailwindStyles: "",
    elements: [],
  } as unknown as EditorElement;
  const started: string[] = [];
  const r = await render(
    h(
      "div",
      { style: { position: "relative", left: rect.left, top: rect.top, width: rect.width, height: rect.height } },
      h(ResizeChrome, {
        rect,
        element,
        node,
        session: { kind: "idle" },
        canEdit: true,
        onStartResize: (_el: EditorElement, _node: HTMLElement, dir: string) => {
          started.push(dir);
        },
      }),
    ),
  );
  const handles = $$q<HTMLElement>(r.container, "[data-resize-handle]");
  assert.equal(handles.length, 8, "four edges and four corners");
  const nw = $q<HTMLElement>(r.container, '[data-resize-handle="nw"]');
  assert.equal(nw.style.top, "-4px");
  assert.equal(nw.style.left, "-4px");
  const east = $q<HTMLElement>(r.container, '[data-resize-handle="e"]');
  assert.equal(east.style.width, "8px", "edge strips stay 8 UI px at any zoom");
  node.remove();
});
