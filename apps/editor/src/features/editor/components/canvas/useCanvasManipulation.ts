import type React from "react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import type { Breakpoint, ResponsiveStyles } from "@webbuilder/site-runtime/types/elements";
import { useCanvasViewportStore } from "@/features/editor/store/canvas-viewport-store";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { isClimbModifier, resolveClickSelection } from "@/features/editor/utils/element/clickSelection";
import {
  computeResizePreview,
  detectLengthUnit,
  resizeCursor,
  type DimensionDirection,
  type ResizeOrigin,
  type ResizePreview,
} from "@/features/editor/utils/element/resizeMath";
import {
  computeSpacingPreview,
  readComputedSpacing,
  spacingCursor,
  type SpacingHandleId,
  type SpacingPreview,
} from "@/features/editor/utils/element/spacingMath";
import { isSizeClass, type SizeAxis } from "@/features/editor/utils/element/sizing";
import type { DropIndicatorState, ManipulationSession } from "./canvasTypes";
import { findElementNodeFromTarget, setCanvasSelection } from "./canvasDom";
import { resolveCanvasDropTarget } from "./canvasHitTest";
import { parentClientToIframeClient } from "./rectTracker";

export type { ManipulationSession };

export interface UseCanvasManipulationOptions {
  /** The site root (`#wb-site-root`) the canvas manipulates. */
  readonly root: HTMLElement | null;
  readonly canEdit: boolean;
  readonly picking: boolean;
  /** Effective canvas zoom; defaults to 1 (unscaled canvas). */
  readonly getZoom?: () => number;
  /** Canvas stage element hosting the (scaled) iframe. */
  readonly stageEl?: HTMLElement | null;
  /** The preview iframe; its screen rect anchors parent-space pointers. */
  readonly iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export interface UseCanvasManipulationResult {
  readonly session: ManipulationSession;
  readonly startResize: (
    element: EditorElement,
    node: HTMLElement,
    direction: DimensionDirection,
    event: React.PointerEvent,
  ) => void;
  readonly startSpacing: (
    element: EditorElement,
    node: HTMLElement,
    handle: SpacingHandleId,
    event: React.PointerEvent,
  ) => void;
  readonly handleCanvasPointerDown: (event: React.PointerEvent) => void;
  /** Re-runs drop hit-testing at the last pointer position (after auto-scroll). */
  readonly refreshMove: () => void;
  readonly cancel: () => void;
}

const IDLE_SESSION: ManipulationSession = { kind: "idle" };
/** Click-vs-drag slop, in screen pixels. */
const MOVE_THRESHOLD_PX = 4;

const MANAGED_STYLE_PROPS = [
  "width",
  "height",
  "top",
  "left",
  "flexGrow",
  "flexBasis",
  "flexShrink",
  "alignSelf",
  "gap",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
] as const;

type ManagedStyleProp = (typeof MANAGED_STYLE_PROPS)[number];
type InlineStyleSnapshot = Record<ManagedStyleProp, string>;

function snapshotInlineStyles(node: HTMLElement): InlineStyleSnapshot {
  const snapshot: Partial<InlineStyleSnapshot> = {};
  for (const prop of MANAGED_STYLE_PROPS) {
    snapshot[prop] = node.style[prop];
  }
  return snapshot as InlineStyleSnapshot;
}

function restoreInlineStyles(node: HTMLElement, snapshot: InlineStyleSnapshot): void {
  for (const prop of MANAGED_STYLE_PROPS) {
    node.style[prop] = snapshot[prop];
  }
}

function applyPreviewStylesToNode(
  node: HTMLElement,
  styles: ResponsiveStyles,
  managedProps: readonly ManagedStyleProp[],
): void {
  const def = styles.default;
  if (!def) return;
  for (const prop of managedProps) {
    const val = def[prop];
    node.style[prop] = val === undefined ? "" : String(val);
  }
}

const RESIZE_STYLE_PROPS: readonly ManagedStyleProp[] = [
  "width",
  "height",
  "top",
  "left",
  "flexGrow",
  "flexBasis",
  "flexShrink",
  "alignSelf",
];

const SPACING_STYLE_PROPS: readonly ManagedStyleProp[] = [
  "gap",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
];

interface NormalizedPointer {
  readonly clientX: number;
  readonly clientY: number;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

function isPointerLikeEvent(event: Event): event is PointerEvent {
  return "clientX" in event && "clientY" in event;
}

export interface ClientPoint {
  readonly clientX: number;
  readonly clientY: number;
  /** The window the event was dispatched in (`event.view`). */
  readonly view?: unknown;
}

export interface IframeGeometry {
  readonly iframeWin: Window | null;
  readonly frameEl: Element | null;
  readonly zoom: number;
}

/**
 * Maps a pointer to unscaled iframe CSS pixels. Browsers already report
 * `clientX/Y` inside a CSS-scaled iframe in its own unscaled pixels, so events
 * dispatched in the iframe realm pass through; events from the parent realm
 * are screen pixels and are projected through the frame rect and zoom.
 */
export function clientToIframeClient(
  point: ClientPoint,
  geometry: IframeGeometry,
): { readonly x: number; readonly y: number } {
  const { iframeWin, frameEl, zoom } = geometry;
  if (iframeWin !== null && iframeWin !== window && point.view === iframeWin) {
    return { x: point.clientX, y: point.clientY };
  }
  const frameRect = frameEl?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return parentClientToIframeClient(point.clientX, point.clientY, frameRect, zoom);
}

export function readGeometry(
  iframeWin: Window,
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined,
  getZoom: (() => number) | undefined,
): IframeGeometry {
  const frameElement = iframeWin.frameElement;
  return {
    iframeWin,
    frameEl: iframeRef?.current ?? (frameElement instanceof Element ? frameElement : null),
    zoom: getZoom?.() ?? 1,
  };
}

function normalizePointerEvent(
  event: PointerEvent,
  geometry: IframeGeometry,
): NormalizedPointer {
  const { x, y } = clientToIframeClient(event, geometry);
  return {
    clientX: x,
    clientY: y,
    shiftKey: Boolean(event.shiftKey),
    altKey: Boolean(event.altKey),
  };
}

interface FrameScheduler {
  readonly schedule: () => void;
  readonly cancel: () => void;
}

function createFrameScheduler(callback: () => void): FrameScheduler {
  let rafId: number | null = null;
  return {
    schedule: () => {
      if (rafId !== null) return;
      let ranSync = false;
      const id = requestAnimationFrame(() => {
        ranSync = true;
        rafId = null;
        callback();
      });
      if (!ranSync) rafId = id;
    },
    cancel: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

function lockInteractionCursor(doc: Document, cursor: string): () => void {
  const prevCursor = doc.body.style.cursor;
  const prevSelect = doc.body.style.userSelect;
  doc.body.style.cursor = cursor;
  doc.body.style.userSelect = "none";
  return () => {
    doc.body.style.cursor = prevCursor;
    doc.body.style.userSelect = prevSelect;
  };
}

function attachDualWindowListeners(
  iframeWin: Window,
  handlers: {
    readonly onMove: (e: PointerEvent) => void;
    readonly onUp: (e: PointerEvent) => void;
    /** Pointer cancelled or window lost focus mid-gesture: abort cleanly. */
    readonly onCancel: () => void;
    readonly onKeyDown: (e: KeyboardEvent) => void;
  },
): () => void {
  const moveListener = (e: Event): void => {
    if (isPointerLikeEvent(e)) handlers.onMove(e);
  };
  const upListener = (e: Event): void => {
    if (isPointerLikeEvent(e)) handlers.onUp(e);
  };
  const cancelListener = (): void => handlers.onCancel();
  const targets: Window[] = iframeWin === window ? [iframeWin] : [iframeWin, window];

  // Moving focus between the parent and the iframe blurs the losing window
  // right after pointerdown. Only abort once, a frame later, neither realm
  // has focus (the user really left the page).
  let blurFrame: number | null = null;
  const blurListener = (): void => {
    if (blurFrame !== null) return;
    let ranSync = false;
    const id = requestAnimationFrame(() => {
      ranSync = true;
      blurFrame = null;
      if (!targets.some((win) => win.document.hasFocus())) handlers.onCancel();
    });
    if (!ranSync) blurFrame = id;
  };
  const keyListener = (e: Event): void => {
    if (e instanceof KeyboardEvent || "key" in e) {
      handlers.onKeyDown(e as KeyboardEvent);
    }
  };

  for (const win of targets) {
    win.addEventListener("pointermove", moveListener, true);
    win.addEventListener("pointerup", upListener, true);
    win.addEventListener("pointercancel", cancelListener, true);
    win.addEventListener("blur", blurListener);
    win.addEventListener("keydown", keyListener, true);
  }
  return () => {
    if (blurFrame !== null) {
      cancelAnimationFrame(blurFrame);
      blurFrame = null;
    }
    for (const win of targets) {
      win.removeEventListener("pointermove", moveListener, true);
      win.removeEventListener("pointerup", upListener, true);
      win.removeEventListener("pointercancel", cancelListener, true);
      win.removeEventListener("blur", blurListener);
      win.removeEventListener("keydown", keyListener, true);
    }
  };
}

function detectParentMainAxis(node: HTMLElement, view: Window): SizeAxis | null {
  const parent = node.parentElement;
  if (!parent) return null;
  const cs = view.getComputedStyle(parent);
  if (!cs.display.includes("flex")) return null;
  return cs.flexDirection.startsWith("column") ? "height" : "width";
}

export function isEditableOrBlockedTarget(target: EventTarget | null): boolean {
  if (target === null || typeof target !== "object") return false;
  const el =
    "closest" in target && typeof target.closest === "function"
      ? (target as Element)
      : "parentElement" in target &&
          target.parentElement !== null &&
          typeof target.parentElement === "object" &&
          "closest" in target.parentElement
        ? (target.parentElement as Element)
        : null;
  if (!el) return false;
  if (el.closest("[data-canvas-overlay]")) return true;
  if (el.closest("[inert]")) return true;
  if ("isContentEditable" in el && (el as HTMLElement).isContentEditable) return true;
  return false;
}

/** Style set a gesture previews against: the breakpoint's styles over what it inherits. */
function effectiveStylesAt(
  styles: ResponsiveStyles | undefined,
  breakpoint: Breakpoint,
): CSSProperties {
  const own = styles?.[breakpoint] ?? {};
  return breakpoint === "default" ? own : { ...styles?.default, ...own };
}

/**
 * Folds a previewed style set back into one breakpoint's own styles: managed
 * props the preview cleared are removed, changed or already-owned ones are
 * written, and inherited values the gesture left alone stay inherited.
 */
function toBreakpointStyles(
  own: CSSProperties,
  effective: CSSProperties,
  previewed: CSSProperties | undefined,
  managedProps: readonly ManagedStyleProp[],
): CSSProperties {
  const next: Record<string, unknown> = { ...own };
  for (const prop of managedProps) {
    const value = previewed?.[prop];
    if (value === undefined) {
      delete next[prop];
    } else if (prop in own || value !== effective[prop]) {
      next[prop] = value;
    }
  }
  return next as unknown as CSSProperties;
}

function commitBreakpointStyles(
  element: EditorElement,
  breakpoint: Breakpoint,
  styles: CSSProperties,
  dropClass?: (cls: string) => boolean,
): void {
  elementUtils.updateElementStyle(
    element,
    styles,
    breakpoint,
    useElementStore.getState().updateElement,
    dropClass,
  );
}

function resolveMoveTarget(
  root: HTMLElement,
  draggedNode: HTMLElement,
  movingId: string,
  clientX: number,
  clientY: number,
): DropIndicatorState | null {
  const { elements, isComponentPage } = useElementStore.getState();
  const resolution = resolveCanvasDropTarget({
    siteRoot: root,
    doc: root.ownerDocument,
    iframeClientX: clientX,
    iframeClientY: clientY,
    elements,
    isComponentPage,
    movingElementId: movingId,
    draggedNode,
  });
  return resolution?.kind === "relative" ? resolution.indicator : null;
}

export function useCanvasManipulation({
  root,
  canEdit,
  picking,
  getZoom,
  iframeRef,
}: UseCanvasManipulationOptions): UseCanvasManipulationResult {
  const [session, setSession] = useState<ManipulationSession>(IDLE_SESSION);
  const disposeRef = useRef<(() => void) | null>(null);
  const refreshMoveRef = useRef<(() => void) | null>(null);
  const refreshMove = useCallback((): void => {
    refreshMoveRef.current?.();
  }, []);

  const teardown = useCallback((): void => {
    const fn = disposeRef.current;
    disposeRef.current = null;
    if (fn) fn();
  }, []);

  const cancel = useCallback((): void => {
    teardown();
    setSession(IDLE_SESSION);
  }, [teardown]);

  useEffect(() => teardown, [teardown]);

  const startResize = useCallback(
    (
      element: EditorElement,
      node: HTMLElement,
      direction: DimensionDirection,
      event: React.PointerEvent,
    ): void => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      teardown();

      const doc = node.ownerDocument;
      const view = doc.defaultView ?? window;
      const geometry = (): IframeGeometry => readGeometry(view, iframeRef, getZoom);
      const bp = useCanvasViewportStore.getState().activeBreakpoint;
      const ownStyles = element.styles?.[bp] ?? {};
      const effective = effectiveStylesAt(element.styles, bp);
      const previewBase: ResponsiveStyles = { ...element.styles, default: effective };

      const rect = node.getBoundingClientRect();
      const parentEl = node.parentElement ?? root ?? doc.body;
      const parentRect = parentEl.getBoundingClientRect();
      const origin: ResizeOrigin = {
        rect,
        parentRect,
        parentWidth: parentRect.width,
        parentHeight: parentRect.height,
        mainAxis: detectParentMainAxis(node, view),
        widthUnit: detectLengthUnit(effective.width),
        heightUnit: detectLengthUnit(effective.height),
      };

      const start = clientToIframeClient(event, geometry());
      const snapshot = snapshotInlineStyles(node);
      let latestPreview: ResizePreview = computeResizePreview(
        direction,
        origin,
        {
          clientX: start.x,
          clientY: start.y,
          shiftKey: Boolean(event.shiftKey),
          altKey: Boolean(event.altKey),
        },
        previewBase,
      );
      let moved = false;
      let pendingPointer: NormalizedPointer | null = null;

      setSession({
        kind: "resizing",
        elementId: element.id,
        direction,
        preview: latestPreview,
      });

      const unlockCursor = lockInteractionCursor(doc, resizeCursor(direction));

      const flushFrame = (): void => {
        if (!pendingPointer) return;
        const pt = pendingPointer;
        pendingPointer = null;
        moved = true;
        latestPreview = computeResizePreview(direction, origin, pt, previewBase);
        applyPreviewStylesToNode(node, latestPreview.styles, RESIZE_STYLE_PROPS);
        setSession({
          kind: "resizing",
          elementId: element.id,
          direction,
          preview: latestPreview,
        });
      };

      const frame = createFrameScheduler(flushFrame);
      let finished = false;
      // The preview only ever lives on node.style; both commit and cancel
      // restore it, so the committed styles are the single source of truth.
      const cleanup = (): void => {
        if (finished) return;
        finished = true;
        frame.cancel();
        removeListeners();
        unlockCursor();
        restoreInlineStyles(node, snapshot);
        if (disposeRef.current === cancelCurrent) disposeRef.current = null;
      };

      const cancelCurrent = (): void => {
        cleanup();
        setSession(IDLE_SESSION);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, geometry());
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (moved) {
            pendingPointer = normalizePointerEvent(e, geometry());
            flushFrame();
          }
          cleanup();
          setSession(IDLE_SESSION);
          if (moved) {
            const resizesWidth = direction.includes("e") || direction.includes("w");
            const resizesHeight = direction.includes("n") || direction.includes("s");
            commitBreakpointStyles(
              element,
              bp,
              toBreakpointStyles(
                ownStyles,
                effective,
                latestPreview.styles.default,
                RESIZE_STYLE_PROPS,
              ),
              (cls) =>
                (resizesWidth && isSizeClass(cls, "width", bp)) ||
                (resizesHeight && isSizeClass(cls, "height", bp)),
            );
          }
        },
        onCancel: cancelCurrent,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
    },
    [canEdit, root, teardown, iframeRef, getZoom],
  );

  const startSpacing = useCallback(
    (
      element: EditorElement,
      node: HTMLElement,
      handle: SpacingHandleId,
      event: React.PointerEvent,
    ): void => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      teardown();

      const doc = node.ownerDocument;
      const view = doc.defaultView ?? window;
      const geometry = (): IframeGeometry => readGeometry(view, iframeRef, getZoom);
      const bp = useCanvasViewportStore.getState().activeBreakpoint;
      const ownStyles = element.styles?.[bp] ?? {};
      const effective = effectiveStylesAt(element.styles, bp);
      const previewBase: ResponsiveStyles = { ...element.styles, default: effective };

      const initial = readComputedSpacing(view.getComputedStyle(node));
      const start = clientToIframeClient(event, geometry());
      const snapshot = snapshotInlineStyles(node);

      let latestPreview: SpacingPreview = computeSpacingPreview(
        handle,
        initial,
        {
          dx: 0,
          dy: 0,
          shiftKey: Boolean(event.shiftKey),
          altKey: Boolean(event.altKey),
        },
        previewBase,
      );
      let moved = false;
      let pendingPointer: NormalizedPointer | null = null;

      setSession({
        kind: "spacing",
        elementId: element.id,
        handle,
        preview: latestPreview,
      });

      const unlockCursor = lockInteractionCursor(
        doc,
        spacingCursor(handle, initial.gapAxis),
      );

      const flushFrame = (): void => {
        if (!pendingPointer) return;
        const pt = pendingPointer;
        pendingPointer = null;
        moved = true;
        latestPreview = computeSpacingPreview(
          handle,
          initial,
          {
            dx: pt.clientX - start.x,
            dy: pt.clientY - start.y,
            shiftKey: pt.shiftKey,
            altKey: pt.altKey,
          },
          previewBase,
        );
        applyPreviewStylesToNode(node, latestPreview.styles, SPACING_STYLE_PROPS);
        setSession({
          kind: "spacing",
          elementId: element.id,
          handle,
          preview: latestPreview,
        });
      };

      const frame = createFrameScheduler(flushFrame);
      let finished = false;
      const cleanup = (): void => {
        if (finished) return;
        finished = true;
        frame.cancel();
        removeListeners();
        unlockCursor();
        restoreInlineStyles(node, snapshot);
        if (disposeRef.current === cancelCurrent) disposeRef.current = null;
      };

      const cancelCurrent = (): void => {
        cleanup();
        setSession(IDLE_SESSION);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, geometry());
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (moved) {
            pendingPointer = normalizePointerEvent(e, geometry());
            flushFrame();
          }
          cleanup();
          setSession(IDLE_SESSION);
          if (moved) {
            commitBreakpointStyles(
              element,
              bp,
              toBreakpointStyles(
                ownStyles,
                effective,
                latestPreview.styles.default,
                SPACING_STYLE_PROPS,
              ),
            );
          }
        },
        onCancel: cancelCurrent,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
    },
    [canEdit, teardown, iframeRef, getZoom],
  );

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent): void => {
      if (!root || !canEdit || picking || event.button !== 0) return;
      if (isEditableOrBlockedTarget(event.target)) return;
      const node = findElementNodeFromTarget(root, event.target);
      if (!node) return;
      const elementId = node.dataset.elementId;
      if (!elementId) return;

      teardown();

      const elementLabel = node.dataset.elementType ?? "Element";
      const doc = root.ownerDocument;
      const view = doc.defaultView ?? window;
      const geometry = (): IframeGeometry => readGeometry(view, iframeRef, getZoom);
      const start = clientToIframeClient(event, geometry());
      const altClick = Boolean(event.altKey);
      const modClick = isClimbModifier(event);

      let active = false;
      let unlockCursor: (() => void) | null = null;
      let latestTarget: DropIndicatorState | null = null;
      let pendingPointer: NormalizedPointer | null = null;
      let lastPoint: NormalizedPointer | null = null;
      let finished = false;

      const updateMovePreview = (pt: NormalizedPointer): void => {
        const target = resolveMoveTarget(root, node, elementId, pt.clientX, pt.clientY);
        latestTarget = target;
        const rootRect = root.getBoundingClientRect();
        setSession({
          kind: "moving",
          elementId,
          elementLabel,
          pointer: {
            x: pt.clientX - rootRect.left,
            y: pt.clientY - rootRect.top,
          },
          target,
        });
      };

      const flushFrame = (): void => {
        if (!pendingPointer) return;
        const pt = pendingPointer;
        pendingPointer = null;
        lastPoint = pt;
        if (!active) {
          const screenDistance =
            Math.hypot(pt.clientX - start.x, pt.clientY - start.y) * geometry().zoom;
          if (screenDistance <= MOVE_THRESHOLD_PX) return;
          active = true;
          node.setAttribute("data-dragging", "true");
          setCanvasSelection({ draggingElementId: elementId, hoveredElementId: undefined });
          unlockCursor = lockInteractionCursor(doc, "grabbing");
        }
        updateMovePreview(pt);
      };

      const frame = createFrameScheduler(flushFrame);
      const cleanup = (): void => {
        if (finished) return;
        finished = true;
        frame.cancel();
        removeListeners();
        if (unlockCursor) {
          unlockCursor();
          unlockCursor = null;
        }
        if (active) {
          node.removeAttribute("data-dragging");
          setCanvasSelection({ draggingElementId: undefined });
        }
        if (disposeRef.current === cancelCurrent) disposeRef.current = null;
        if (refreshMoveRef.current === refreshCurrent) refreshMoveRef.current = null;
      };

      const cancelCurrent = (): void => {
        cleanup();
        setSession(IDLE_SESSION);
      };

      const refreshCurrent = (): void => {
        if (active && lastPoint !== null) updateMovePreview(lastPoint);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, geometry());
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (active) {
            updateMovePreview(normalizePointerEvent(e, geometry()));
          }
          const wasDrag = active;
          const commitTarget = wasDrag ? latestTarget : null;
          cleanup();
          setSession(IDLE_SESSION);
          if (!wasDrag) {
            // A click (within the slop): select, Alt+click the parent, or
            // Ctrl/Cmd+click to climb to the selection's parent.
            setCanvasSelection({
              selectedElementId: resolveClickSelection(
                useElementStore.getState().elements,
                {
                  clickedId: elementId,
                  selectedId: useSelectionStore.getState().selectedElementId,
                  alt: altClick,
                  mod: modClick,
                },
              ),
              editingElementId: undefined,
            });
            return;
          }
          if (commitTarget !== null) {
            useElementStore
              .getState()
              .moveElement(elementId, commitTarget.targetId, commitTarget.position);
          }
        },
        onCancel: cancelCurrent,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape" && active) {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
      refreshMoveRef.current = refreshCurrent;
    },
    [root, canEdit, picking, teardown, iframeRef, getZoom],
  );

  return {
    session,
    startResize,
    startSpacing,
    handleCanvasPointerDown,
    refreshMove,
    cancel,
  };
}
