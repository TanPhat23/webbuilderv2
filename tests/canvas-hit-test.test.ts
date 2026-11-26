import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { redirectModules } from "./support/test-stub-modules";
import { act, cleanup, React, render } from "./support/sidebar-dom-harness";
import type {
  FrameElement,
  SectionElement,
  TextElement,
} from "@webbuilder/site-runtime/types/elements/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

redirectModules({
  "@clerk/tanstack-react-start": "./test-clerk-stub.ts",
  "@clerk/tanstack-react-start/server": "./test-clerk-server-stub.ts",
  "@tanstack/react-start": "./test-start-stub.ts",
  "@tanstack/react-router": "./editor-router-stub.ts",
});

import {
  findElementNode,
  iframeDocPointToStage,
  parentClientToIframeClient,
  projectIframeRectToStage,
  subscribeStageRect,
  useStageElementRect,
  type StageElementSnapshot,
} from "../apps/editor/src/features/editor/components/canvas/rectTracker";
import {
  computeAutoScrollStep,
  EDGE_ZONE_PX,
  MAX_SCROLL_PX_PER_FRAME,
  useAutoScroll,
} from "../apps/editor/src/features/editor/components/canvas/useAutoScroll";
import { resolveCanvasDropTarget } from "../apps/editor/src/features/editor/components/canvas/canvasHitTest";
import { useCanvasViewportStore } from "../apps/editor/src/features/editor/store/canvas-viewport-store";

const h = React.createElement;

afterEach(async () => {
  await cleanup();
  useCanvasViewportStore.getState().resetViewport();
});

after(cleanup);

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
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

function makeText(id: string, parentId?: string): TextElement {
  return {
    id,
    type: "Text",
    content: id,
    pageId: "page-1",
    parentId,
    styles: { default: {} },
    tailwindStyles: "",
  };
}

function makeFrame(id: string, children: EditorElement[] = [], parentId?: string): FrameElement {
  return {
    id,
    type: "Frame",
    content: "",
    pageId: "page-1",
    parentId,
    styles: { default: {} },
    tailwindStyles: "",
    elements: children,
  };
}

function makeSection(id: string, children: EditorElement[] = []): SectionElement {
  return {
    id,
    type: "Section",
    content: "",
    pageId: "page-1",
    styles: { default: {} },
    tailwindStyles: "",
    elements: children,
  };
}

function createCanvasDom(): {
  readonly doc: Document;
  readonly siteRoot: HTMLDivElement;
  readonly setPointStack: (resolver: (x: number, y: number) => Element[]) => void;
  readonly dispose: () => void;
} {
  const host = document.createElement("div");
  const siteRoot = document.createElement("div");
  siteRoot.id = "wb-site-root";
  host.appendChild(siteRoot);
  document.body.appendChild(host);

  const doc = siteRoot.ownerDocument;
  const prevEfp = doc.elementsFromPoint;

  const setPointStack = (resolver: (x: number, y: number) => Element[]): void => {
    doc.elementsFromPoint = resolver;
  };

  const dispose = (): void => {
    doc.elementsFromPoint = prevEfp;
    host.remove();
  };

  return { doc, siteRoot, setPointStack, dispose };
}

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

  // Round-trip consistency at 1.5x zoom with non-zero scrollLeft & scrollTop
  const zoomedParams = {
    stageRect: { left: 100, top: 50, width: 1200, height: 800 },
    frameRect: { left: 160, top: 90, width: 900, height: 600 },
    zoom: 1.5,
  };
  const ptInFrame = parentClientToIframeClient(460, 240, zoomedParams.frameRect, zoomedParams.zoom);
  assert.deepEqual(ptInFrame, { x: 200, y: 100 });

  const stageFromDoc = iframeDocPointToStage(
    230,
    350,
    { scrollLeft: 30, scrollTop: 250 },
    zoomedParams,
  );
  assert.deepEqual(stageFromDoc, { x: 360, y: 190 });
});

test("findElementNode and useStageElementRect track stage-projected rects and frame visibility", async () => {
  useCanvasViewportStore.getState().setManualZoom(0.5);

  const stageEl = document.createElement("div");
  const iframeEl = document.createElement("iframe");
  const siteRoot = document.createElement("div");
  const targetNode = document.createElement("div");
  targetNode.setAttribute("data-element-id", "hero:1");
  siteRoot.appendChild(targetNode);
  stageEl.appendChild(iframeEl);
  document.body.appendChild(stageEl);

  stageEl.getBoundingClientRect = () => makeRect(200, 60, 1000, 700);
  iframeEl.getBoundingClientRect = () => makeRect(240, 100, 720, 600);
  Object.defineProperty(iframeEl, "clientHeight", { configurable: true, value: 1200 });

  let inFrameTop = 40;
  targetNode.getBoundingClientRect = () => makeRect(100, inFrameTop, 400, 80);

  assert.equal(findElementNode(siteRoot, "hero:1"), targetNode);
  assert.equal(findElementNode(siteRoot, "missing"), null);
  assert.equal(findElementNode(null, "hero:1"), null);

  const probeRef: { current: StageElementSnapshot | null } = { current: null };

  function Probe({ elementId }: { readonly elementId: string | undefined }): null {
    probeRef.current = useStageElementRect(siteRoot, stageEl, iframeEl, elementId);
    return null;
  }

  const view = await render(h(Probe, { elementId: "hero:1" }));
  assert.equal(probeRef.current?.node, targetNode);
  assert.deepEqual(probeRef.current?.rect, { left: 90, top: 60, width: 200, height: 40 });
  assert.equal(probeRef.current?.visibleInFrame, true);

  // Scroll element above top of iframe viewport (bottom = -10 <= 0)
  inFrameTop = -90;
  await act(async () => {
    siteRoot.ownerDocument.dispatchEvent(new Event("scroll"));
    await new Promise((r) => setTimeout(r, 10));
  });
  assert.deepEqual(probeRef.current?.rect, { left: 90, top: -5, width: 200, height: 40 });
  assert.equal(probeRef.current?.visibleInFrame, false);

  // Update viewport zoom to 1.0 -> re-projects rect automatically
  inFrameTop = 100;
  await act(async () => {
    useCanvasViewportStore.getState().setManualZoom(1);
    await new Promise((r) => setTimeout(r, 10));
  });
  assert.deepEqual(probeRef.current?.rect, { left: 140, top: 140, width: 400, height: 80 });
  assert.equal(probeRef.current?.visibleInFrame, true);

  // Imperative subscribeStageRect emits initial snapshot and cleans up cleanly
  const snapshots: StageElementSnapshot[] = [];
  const unsubscribe = subscribeStageRect(
    { siteRoot, stageEl, iframeEl, id: "hero:1" },
    (snap) => {
      snapshots.push(snap);
    },
  );
  assert.equal(snapshots.length, 1);
  assert.deepEqual(snapshots[0]?.rect, { left: 140, top: 140, width: 400, height: 80 });
  unsubscribe();

  await view.unmount();
  stageEl.remove();
});

test("computeAutoScrollStep and useAutoScroll scroll smoothly near top and bottom 48px edges", async () => {
  assert.equal(EDGE_ZONE_PX, 48);
  assert.equal(MAX_SCROLL_PX_PER_FRAME, 14);

  // Dead zone in middle and exact boundaries return +0
  assert.equal(computeAutoScrollStep(300, 100, 500), 0);
  assert.equal(computeAutoScrollStep(148, 100, 500), 0);
  assert.equal(computeAutoScrollStep(552, 100, 500), 0);

  // Top edge ramps negatively and caps at -MAX_SCROLL_PX_PER_FRAME
  const nearTop = computeAutoScrollStep(130, 100, 500);
  const veryTop = computeAutoScrollStep(110, 100, 500);
  assert.ok(nearTop < 0);
  assert.ok(veryTop < nearTop);
  assert.equal(computeAutoScrollStep(100, 100, 500), -MAX_SCROLL_PX_PER_FRAME);
  assert.equal(computeAutoScrollStep(80, 100, 500), -MAX_SCROLL_PX_PER_FRAME);

  // Bottom edge ramps positively and caps at +MAX_SCROLL_PX_PER_FRAME
  const nearBottom = computeAutoScrollStep(570, 100, 500);
  const veryBottom = computeAutoScrollStep(590, 100, 500);
  assert.ok(nearBottom > 0);
  assert.ok(veryBottom > nearBottom);
  assert.equal(computeAutoScrollStep(600, 100, 500), MAX_SCROLL_PX_PER_FRAME);

  // Hook scrolls iframe scrollingElement on rAF ticks
  const scroller = document.createElement("div");
  scroller.scrollTop = 100;
  Object.defineProperty(scroller, "scrollHeight", { configurable: true, value: 2000 });
  Object.defineProperty(scroller, "clientHeight", { configurable: true, value: 500 });

  const fakeIframe = document.createElement("iframe");
  fakeIframe.getBoundingClientRect = () => makeRect(0, 100, 800, 500);
  Object.defineProperty(fakeIframe, "contentDocument", {
    configurable: true,
    value: { scrollingElement: scroller },
  });

  const iframeRef: React.RefObject<HTMLIFrameElement | null> = { current: fakeIframe };
  let ticks = 0;

  function AutoScrollHarness({ pointerY }: { readonly pointerY: number | null }): null {
    useAutoScroll(iframeRef, pointerY, () => {
      ticks += 1;
    });
    return null;
  }

  const mounted = await render(h(AutoScrollHarness, { pointerY: 590 }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 25));
  });
  assert.ok(scroller.scrollTop > 100);
  assert.ok(ticks >= 2, "loop keeps running across multiple frames");

  const pausedScrollTop = scroller.scrollTop;
  await mounted.rerender(h(AutoScrollHarness, { pointerY: null }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
  assert.equal(scroller.scrollTop, pausedScrollTop);
});

test("resolveCanvasDropTarget handles empty root, permissions, below-last-section fallback, and component-page root restriction", () => {
  const { doc, siteRoot, setPointStack, dispose } = createCanvasDom();
  try {
    setPointStack(() => [siteRoot, doc.body]);

    // 1. Empty page with canCreate -> root drop
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 200,
        iframeClientY: 200,
        elements: [],
        canCreate: true,
        isComponentPage: false,
      }),
      { kind: "root" },
    );

    // 2. Empty page without canCreate -> null
    assert.equal(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 200,
        iframeClientY: 200,
        elements: [],
        canCreate: false,
        isComponentPage: false,
      }),
      null,
    );

    // Populate two root sections
    const sec1 = makeSection("sec-1");
    const sec2 = makeSection("sec-2");
    const sec1Node = doc.createElement("section");
    sec1Node.setAttribute("data-element-id", "sec-1");
    sec1Node.setAttribute("data-element-type", "Section");
    sec1Node.getBoundingClientRect = () => makeRect(0, 0, 1000, 200);

    const sec2Node = doc.createElement("section");
    sec2Node.setAttribute("data-element-id", "sec-2");
    sec2Node.setAttribute("data-element-type", "Section");
    sec2Node.getBoundingClientRect = () => makeRect(0, 200, 1000, 200);

    siteRoot.append(sec1Node, sec2Node);

    // 3. Below-last-section fallback when elementsFromPoint hits only siteRoot/body
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 400,
        iframeClientY: 460,
        elements: [sec1, sec2],
        canCreate: true,
        isComponentPage: false,
      }),
      {
        kind: "relative",
        indicator: { targetId: "sec-2", position: "after", horizontal: false },
      },
    );

    // Above last section bottom without hitting any element -> null
    assert.equal(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 400,
        iframeClientY: 150,
        elements: [sec1, sec2],
        canCreate: true,
        isComponentPage: false,
      }),
      null,
    );

    // 4. Component page blocks below-last-section root sibling fallback AND root edge siblings
    assert.equal(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 400,
        iframeClientY: 460,
        elements: [sec1],
        canCreate: true,
        isComponentPage: true,
      }),
      null,
    );

    setPointStack(() => [sec1Node, siteRoot]);
    // Top edge of component master root cannot insert sibling before root
    assert.equal(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 400,
        iframeClientY: 8,
        elements: [sec1],
        canCreate: true,
        isComponentPage: true,
      }),
      null,
    );
    // Interior of component master root allows dropping inside
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 400,
        iframeClientY: 100,
        elements: [sec1],
        canCreate: true,
        isComponentPage: true,
      }),
      {
        kind: "relative",
        indicator: { targetId: "sec-1", position: "inside", horizontal: false },
      },
    );
  } finally {
    dispose();
  }
});

test("resolveCanvasDropTarget resolves Flex/Grid child slots for both sidebar DnD and pointer move, skips overlays/inert, and suppresses no-op moves", () => {
  const { doc, siteRoot, setPointStack, dispose } = createCanvasDom();
  try {
    const c1 = makeText("card-1", "row-1");
    const c2 = makeText("card-2", "row-1");
    const c3 = makeText("card-3", "row-1");
    const row = makeFrame("row-1", [c1, c2, c3]);

    const rowNode = doc.createElement("div");
    rowNode.setAttribute("data-element-id", "row-1");
    rowNode.setAttribute("data-element-type", "Frame");
    rowNode.style.display = "flex";
    rowNode.style.flexDirection = "row";
    rowNode.getBoundingClientRect = () => makeRect(0, 0, 600, 200);

    const card1Node = doc.createElement("div");
    card1Node.setAttribute("data-element-id", "card-1");
    card1Node.setAttribute("data-element-type", "Text");
    card1Node.getBoundingClientRect = () => makeRect(20, 40, 100, 120);

    const card2Node = doc.createElement("div");
    card2Node.setAttribute("data-element-id", "card-2");
    card2Node.setAttribute("data-element-type", "Text");
    card2Node.getBoundingClientRect = () => makeRect(150, 40, 100, 120);

    const card3Node = doc.createElement("div");
    card3Node.setAttribute("data-element-id", "card-3");
    card3Node.setAttribute("data-element-type", "Text");
    card3Node.getBoundingClientRect = () => makeRect(280, 40, 100, 120);

    rowNode.append(card1Node, card2Node, card3Node);

    const overlayNode = doc.createElement("div");
    overlayNode.setAttribute("data-canvas-overlay", "true");
    const inertWrapper = doc.createElement("div");
    inertWrapper.setAttribute("inert", "");
    const inertGhost = doc.createElement("div");
    inertGhost.setAttribute("data-element-id", "ghost-id");
    inertWrapper.appendChild(inertGhost);

    siteRoot.append(rowNode, overlayNode, inertWrapper);

    // Pointer in the gap at x=142, y=100 (closer to card-2 left=150 than card-1 right=120)
    // Stack has overlay, inert ghost, and dragged card3Node on top of rowNode -> all skipped!
    setPointStack(() => [overlayNode, inertGhost, rowNode, siteRoot]);

    // A) Sidebar DnD (no movingElementId) snaps to nearest horizontal child slot
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 142,
        iframeClientY: 100,
        elements: [row],
        canCreate: true,
        isComponentPage: false,
      }),
      {
        kind: "relative",
        indicator: { targetId: "card-2", position: "before", horizontal: true },
      },
    );

    // B) Pointer move of card-3 into the gap between card-1 and card-2 -> valid move before card-2
    setPointStack(() => [card3Node, rowNode, siteRoot]);
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 142,
        iframeClientY: 100,
        elements: [row],
        canCreate: false,
        isComponentPage: false,
        movingElementId: "card-3",
        draggedNode: card3Node,
      }),
      {
        kind: "relative",
        indicator: { targetId: "card-2", position: "before", horizontal: true },
      },
    );

    // C) No-op move suppression: moving card-1 to "before card-2" is a no-op!
    setPointStack(() => [card1Node, rowNode, siteRoot]);
    assert.equal(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 142,
        iframeClientY: 100,
        elements: [row],
        isComponentPage: false,
        movingElementId: "card-1",
        draggedNode: card1Node,
      }),
      null,
    );

    // D) Component-instance boundary resolves to outer instance id and never drops "inside"
    const instWrapper = doc.createElement("div");
    instWrapper.setAttribute("data-component-instance", "comp-inst");
    const instRoot = doc.createElement("div");
    instRoot.setAttribute("data-element-id", "comp-inst");
    instRoot.setAttribute("data-element-type", "Frame");
    instRoot.getBoundingClientRect = () => makeRect(0, 220, 600, 100);
    const innerSpan = doc.createElement("span");
    innerSpan.setAttribute("data-element-id", "inner-master-child");
    instRoot.appendChild(innerSpan);
    instWrapper.appendChild(instRoot);
    siteRoot.appendChild(instWrapper);

    const compModel = makeFrame("comp-inst");
    setPointStack(() => [innerSpan, instRoot, siteRoot]);
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 300,
        iframeClientY: 290,
        elements: [row, compModel],
        canCreate: true,
        isComponentPage: false,
      }),
      {
        kind: "relative",
        indicator: { targetId: "comp-inst", position: "after", horizontal: false },
      },
    );
    // E) Multi-column CSS Grid container resolves horizontal child slots
    const g1 = makeText("grid-1", "grid-box");
    const g2 = makeText("grid-2", "grid-box");
    const gridModel = makeFrame("grid-box", [g1, g2]);
    const gridNode = doc.createElement("div");
    gridNode.setAttribute("data-element-id", "grid-box");
    gridNode.setAttribute("data-element-type", "Frame");
    gridNode.style.display = "grid";
    gridNode.style.gridTemplateColumns = "200px 200px";
    gridNode.getBoundingClientRect = () => makeRect(0, 340, 500, 160);

    const grid1Node = doc.createElement("div");
    grid1Node.setAttribute("data-element-id", "grid-1");
    grid1Node.getBoundingClientRect = () => makeRect(20, 380, 180, 80);

    const grid2Node = doc.createElement("div");
    grid2Node.setAttribute("data-element-id", "grid-2");
    grid2Node.getBoundingClientRect = () => makeRect(240, 380, 180, 80);

    gridNode.append(grid1Node, grid2Node);
    siteRoot.appendChild(gridNode);

    setPointStack(() => [gridNode, siteRoot]);
    assert.deepEqual(
      resolveCanvasDropTarget({
        siteRoot,
        doc,
        iframeClientX: 210,
        iframeClientY: 420,
        elements: [row, compModel, gridModel],
        canCreate: true,
        isComponentPage: false,
      }),
      {
        kind: "relative",
        indicator: { targetId: "grid-1", position: "after", horizontal: true },
      },
    );
  } finally {
    dispose();
  }
});
