import { useLayoutEffect, useState } from "react";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import { useElementStore } from "@/features/editor/store/element-store";

export interface ElementRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface RectLike {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface StageProjectionParams {
  readonly stageRect: RectLike;
  readonly frameRect: RectLike;
  readonly zoom: number;
}

export interface StageElementSnapshot {
  readonly node: HTMLElement | null;
  readonly rect: ElementRect | null;
  readonly visibleInFrame: boolean;
}

export interface SubscribeStageRectParams {
  readonly siteRoot: HTMLElement | null;
  readonly stageEl: HTMLElement | null;
  readonly iframeEl: HTMLIFrameElement | null;
  readonly id: string | undefined;
}

const EMPTY_SNAPSHOT: StageElementSnapshot = {
  node: null,
  rect: null,
  visibleInFrame: false,
};

function safeZoomValue(zoom: number): number {
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

export function projectIframeRectToStage(
  inFrameRect: RectLike,
  params: StageProjectionParams,
): ElementRect {
  const zoom = safeZoomValue(params.zoom);
  const frameOffsetLeft = params.frameRect.left - params.stageRect.left;
  const frameOffsetTop = params.frameRect.top - params.stageRect.top;
  return {
    left: frameOffsetLeft + inFrameRect.left * zoom,
    top: frameOffsetTop + inFrameRect.top * zoom,
    width: inFrameRect.width * zoom,
    height: inFrameRect.height * zoom,
  };
}

export function parentClientToIframeClient(
  parentClientX: number,
  parentClientY: number,
  frameRect: Pick<RectLike, "left" | "top">,
  zoom: number,
): { readonly x: number; readonly y: number } {
  const safeZoom = safeZoomValue(zoom);
  return {
    x: (parentClientX - frameRect.left) / safeZoom,
    y: (parentClientY - frameRect.top) / safeZoom,
  };
}

/**
 * A wheel/pointer point as stage-local pixels. Events from the editor document
 * report screen pixels; events from the scaled iframe report its own unscaled
 * pixels, which grow from the frame's corner at `zoom` screen px per CSS px.
 */
export function wheelPointToStage(
  point: { readonly clientX: number; readonly clientY: number },
  realm: "parent" | "iframe",
  params: StageProjectionParams,
): { readonly x: number; readonly y: number } {
  if (realm === "parent") {
    return {
      x: point.clientX - params.stageRect.left,
      y: point.clientY - params.stageRect.top,
    };
  }
  const zoom = safeZoomValue(params.zoom);
  return {
    x: params.frameRect.left - params.stageRect.left + point.clientX * zoom,
    y: params.frameRect.top - params.stageRect.top + point.clientY * zoom,
  };
}

export function iframeDocPointToStage(
  docX: number,
  docY: number,
  scroll: { readonly scrollLeft: number; readonly scrollTop: number },
  params: StageProjectionParams,
): { readonly x: number; readonly y: number } {
  const zoom = safeZoomValue(params.zoom);
  const inFrameX = docX - scroll.scrollLeft;
  const inFrameY = docY - scroll.scrollTop;
  return {
    x: params.frameRect.left - params.stageRect.left + inFrameX * zoom,
    y: params.frameRect.top - params.stageRect.top + inFrameY * zoom,
  };
}

function escapeSelectorAttrValue(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}

/** First canvas node rendered for an element id (CMS lists can repeat ids). */
export function findElementNode(
  root: ParentNode | null,
  id: string | undefined,
): HTMLElement | null {
  if (!root || !id) return null;
  return root.querySelector<HTMLElement>(
    `[data-element-id="${escapeSelectorAttrValue(id)}"]`,
  );
}

function isSameRect(a: ElementRect | null, b: ElementRect | null): boolean {
  return (
    a === b ||
    (a !== null &&
      b !== null &&
      a.left === b.left &&
      a.top === b.top &&
      a.width === b.width &&
      a.height === b.height)
  );
}

function isSameSnapshot(a: StageElementSnapshot, b: StageElementSnapshot): boolean {
  return (
    a.node === b.node &&
    a.visibleInFrame === b.visibleInFrame &&
    isSameRect(a.rect, b.rect)
  );
}

export function measureStageElementNode(
  node: HTMLElement,
  stageEl: HTMLElement,
  iframeEl: HTMLIFrameElement,
  zoomOverride?: number,
): { readonly rect: ElementRect; readonly visibleInFrame: boolean } {
  const zoom = safeZoomValue(
    zoomOverride ?? computeEffectiveZoom(useCanvasViewportStore.getState()),
  );
  const stageRect = stageEl.getBoundingClientRect();
  const frameRect = iframeEl.getBoundingClientRect();
  const inFrameRect = node.getBoundingClientRect();
  const rect = projectIframeRectToStage(inFrameRect, {
    stageRect,
    frameRect,
    zoom,
  });
  const viewportHeight =
    iframeEl.clientHeight > 0 ? iframeEl.clientHeight : frameRect.height / zoom;
  const bottom = inFrameRect.top + inFrameRect.height;
  const visibleInFrame = bottom > 0 && inFrameRect.top < viewportHeight;
  return { rect, visibleInFrame };
}

/**
 * Imperative stage-coordinate rect subscription. Coalesces scroll, resize,
 * DOM mutation, image load, font ready, element tree, and viewport camera
 * updates onto `requestAnimationFrame` for zero-churn HUD updates.
 */
export function subscribeStageRect(
  params: SubscribeStageRectParams,
  onChange: (snapshot: StageElementSnapshot) => void,
): () => void {
  const { siteRoot, stageEl, iframeEl, id } = params;
  if (!siteRoot || !stageEl || !iframeEl || !id) {
    onChange(EMPTY_SNAPSHOT);
    return () => {};
  }

  let disposed = false;
  let rafId: number | null = null;
  let lastSnapshot: StageElementSnapshot | null = null;
  let observedNode: HTMLElement | null = null;

  const doc = siteRoot.ownerDocument;
  const iframeWin = doc.defaultView;
  const parentWin =
    stageEl.ownerDocument.defaultView ??
    (typeof window !== "undefined" ? window : null);

  const IframeRO =
    iframeWin?.ResizeObserver ??
    (typeof ResizeObserver !== "undefined" ? ResizeObserver : null);
  const ParentRO =
    parentWin?.ResizeObserver ??
    (typeof ResizeObserver !== "undefined" ? ResizeObserver : null);
  const IframeMO =
    iframeWin?.MutationObserver ??
    (typeof MutationObserver !== "undefined" ? MutationObserver : null);

  let iframeResizeObserver: ResizeObserver | null = null;

  const syncObservedNode = (nextNode: HTMLElement | null): void => {
    if (!iframeResizeObserver || observedNode === nextNode) return;
    if (observedNode) {
      iframeResizeObserver.unobserve(observedNode);
    }
    observedNode = nextNode;
    if (observedNode) {
      iframeResizeObserver.observe(observedNode);
    }
  };

  const measure = (): StageElementSnapshot => {
    const node = findElementNode(siteRoot, id);
    if (!node) return EMPTY_SNAPSHOT;
    const { rect, visibleInFrame } = measureStageElementNode(node, stageEl, iframeEl);
    return { node, rect, visibleInFrame };
  };

  const flush = (): void => {
    if (disposed) return;
    const next = measure();
    syncObservedNode(next.node);
    if (lastSnapshot === null || !isSameSnapshot(lastSnapshot, next)) {
      lastSnapshot = next;
      onChange(next);
    }
  };

  const schedule = (): void => {
    if (disposed || rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      flush();
    });
  };

  if (IframeRO) {
    iframeResizeObserver = new IframeRO(schedule);
    if (doc.documentElement) {
      iframeResizeObserver.observe(doc.documentElement);
    }
    iframeResizeObserver.observe(siteRoot);
  }

  const parentResizeObserver = ParentRO ? new ParentRO(schedule) : null;
  if (parentResizeObserver) {
    parentResizeObserver.observe(stageEl);
    parentResizeObserver.observe(iframeEl);
  }

  const mutationObserver = IframeMO ? new IframeMO(schedule) : null;
  if (mutationObserver) {
    mutationObserver.observe(siteRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  }

  doc.addEventListener("scroll", schedule, { capture: true, passive: true });
  stageEl.ownerDocument.addEventListener("scroll", schedule, {
    capture: true,
    passive: true,
  });
  siteRoot.addEventListener("load", schedule, true);

  if (doc.fonts?.ready) {
    void doc.fonts.ready.then(() => {
      if (!disposed) schedule();
    });
  }

  const unsubElements = useElementStore.subscribe((state, prevState) => {
    if (state.elements !== prevState.elements) {
      schedule();
    }
  });

  const unsubViewport = useCanvasViewportStore.subscribe((state, prevState) => {
    if (
      state.frameWidthPx !== prevState.frameWidthPx ||
      state.zoomMode !== prevState.zoomMode ||
      state.manualZoom !== prevState.manualZoom ||
      state.stageWidthPx !== prevState.stageWidthPx ||
      state.stageHeightPx !== prevState.stageHeightPx ||
      state.panX !== prevState.panX ||
      state.panY !== prevState.panY
    ) {
      schedule();
    }
  });

  flush();

  return (): void => {
    disposed = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    doc.removeEventListener("scroll", schedule, true);
    stageEl.ownerDocument.removeEventListener("scroll", schedule, true);
    siteRoot.removeEventListener("load", schedule, true);
    iframeResizeObserver?.disconnect();
    parentResizeObserver?.disconnect();
    mutationObserver?.disconnect();
    unsubElements();
    unsubViewport();
  };
}

export function useStageElementRect(
  siteRoot: HTMLElement | null,
  stageEl: HTMLElement | null,
  iframeEl: HTMLIFrameElement | null,
  id: string | undefined,
): StageElementSnapshot {
  const [snapshot, setSnapshot] = useState<StageElementSnapshot>(EMPTY_SNAPSHOT);

  useLayoutEffect(() => {
    if (!siteRoot || !stageEl || !iframeEl || !id) {
      return;
    }
    return subscribeStageRect({ siteRoot, stageEl, iframeEl, id }, (next) => {
      setSnapshot((prev) => (isSameSnapshot(prev, next) ? prev : next));
    });
  }, [siteRoot, stageEl, iframeEl, id]);

  if (!siteRoot || !stageEl || !iframeEl || !id) {
    return EMPTY_SNAPSHOT;
  }
  return snapshot;
}
