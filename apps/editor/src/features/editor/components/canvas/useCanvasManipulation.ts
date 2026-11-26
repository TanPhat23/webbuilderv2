import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { CONTAINER_ELEMENT_TYPES, type ResponsiveStyles } from "@webbuilder/site-runtime/types/elements";
import { useElementStore } from "@/features/editor/store/element-store";
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
import {
  computeDropPosition,
  isHorizontalFlow,
  isNoOpMove,
  resolveNearestChildSlot,
  type ChildDropCandidate,
} from "@/features/editor/utils/element/dropPosition";
import type { SizeAxis } from "@/features/editor/utils/element/sizing";
import type { DropIndicatorState, ManipulationSession } from "./canvasTypes";
import { findElementNodeFromTarget, setCanvasSelection } from "./canvasDom";

export type { ManipulationSession };

export interface UseCanvasManipulationOptions {
  readonly root: HTMLDivElement | null;
  readonly canEdit: boolean;
  readonly picking: boolean;
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
  readonly cancel: () => void;
}

const IDLE_SESSION: ManipulationSession = { kind: "idle" };
const MOVE_THRESHOLD_PX = 4;
const CONTAINER_TYPE_SET: ReadonlySet<string> = new Set(CONTAINER_ELEMENT_TYPES);

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

function normalizePointerEvent(
  event: PointerEvent,
  iframeWin: Window,
): NormalizedPointer {
  let clientX = event.clientX;
  let clientY = event.clientY;
  if (
    iframeWin !== window &&
    event.view === window &&
    iframeWin.frameElement instanceof Element
  ) {
    const frameRect = iframeWin.frameElement.getBoundingClientRect();
    clientX -= frameRect.left;
    clientY -= frameRect.top;
  }
  return {
    clientX,
    clientY,
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
    readonly onKeyDown: (e: KeyboardEvent) => void;
  },
): () => void {
  const moveListener = (e: Event): void => {
    if (isPointerLikeEvent(e)) handlers.onMove(e);
  };
  const upListener = (e: Event): void => {
    if (isPointerLikeEvent(e)) handlers.onUp(e);
  };
  const keyListener = (e: Event): void => {
    if (e instanceof KeyboardEvent || "key" in e) {
      handlers.onKeyDown(e as KeyboardEvent);
    }
  };

  const targets: Window[] = iframeWin === window ? [iframeWin] : [iframeWin, window];
  for (const win of targets) {
    win.addEventListener("pointermove", moveListener, true);
    win.addEventListener("pointerup", upListener, true);
    win.addEventListener("pointercancel", upListener, true);
    win.addEventListener("keydown", keyListener, true);
  }
  return () => {
    for (const win of targets) {
      win.removeEventListener("pointermove", moveListener, true);
      win.removeEventListener("pointerup", upListener, true);
      win.removeEventListener("pointercancel", upListener, true);
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

function isEditableOrBlockedTarget(target: EventTarget | null): boolean {
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

function hitTestDropTarget(
  root: HTMLDivElement,
  draggedNode: HTMLElement,
  movingId: string,
  clientX: number,
  clientY: number,
): DropIndicatorState | null {
  const doc = root.ownerDocument;
  const view = doc.defaultView ?? window;
  if (typeof doc.elementsFromPoint !== "function") return null;

  const stack = doc.elementsFromPoint(clientX, clientY);
  let candidate: HTMLElement | null = null;
  for (const el of stack) {
    if (el.closest("[data-canvas-overlay]")) continue;
    const resolved = findElementNodeFromTarget(root, el);
    if (!resolved) continue;
    if (resolved === draggedNode || draggedNode.contains(resolved)) continue;
    candidate = resolved;
    break;
  }

  if (!candidate) return null;
  const targetId = candidate.dataset.elementId;
  if (!targetId) return null;

  const parent = (candidate.closest("[data-component-instance]") ?? candidate).parentElement;
  const parentStyle = parent ? view.getComputedStyle(parent) : null;
  const horizontal = parentStyle
    ? isHorizontalFlow({
        display: parentStyle.display,
        flexDirection: parentStyle.flexDirection,
        gridTemplateColumns: parentStyle.gridTemplateColumns,
      })
    : false;
  const elementType = candidate.dataset.elementType;
  const isContainer =
    !candidate.closest("[data-component-instance]") &&
    elementType !== undefined &&
    CONTAINER_TYPE_SET.has(elementType);

  const position = computeDropPosition(
    candidate.getBoundingClientRect(),
    { x: clientX, y: clientY },
    { isContainer, horizontal },
  );

  let resolvedTargetId = targetId;
  let resolvedPosition = position;
  let resolvedHorizontal = horizontal;

  if (position === "inside" && isContainer) {
    const childCandidates: ChildDropCandidate[] = [];
    for (const child of Array.from(candidate.children)) {
      const childId = child.getAttribute("data-element-id");
      if (!childId || child === draggedNode || draggedNode.contains(child)) continue;
      childCandidates.push({ id: childId, box: child.getBoundingClientRect() });
    }
    if (childCandidates.length > 0) {
      const containerStyle = view.getComputedStyle(candidate);
      const containerHorizontal = isHorizontalFlow({
        display: containerStyle.display,
        flexDirection: containerStyle.flexDirection,
        gridTemplateColumns: containerStyle.gridTemplateColumns,
      });
      const slot = resolveNearestChildSlot(
        childCandidates,
        { x: clientX, y: clientY },
        containerHorizontal,
      );
      if (slot) {
        resolvedTargetId = slot.targetId;
        resolvedPosition = slot.position;
        resolvedHorizontal = containerHorizontal;
      }
    }
  }

  if (
    isNoOpMove(
      useElementStore.getState().elements,
      movingId,
      resolvedTargetId,
      resolvedPosition,
    )
  ) {
    return null;
  }

  return {
    targetId: resolvedTargetId,
    position: resolvedPosition,
    horizontal: resolvedHorizontal,
  };
}

export function useCanvasManipulation({
  root,
  canEdit,
  picking,
}: UseCanvasManipulationOptions): UseCanvasManipulationResult {
  const [session, setSession] = useState<ManipulationSession>(IDLE_SESSION);
  const disposeRef = useRef<(() => void) | null>(null);

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
      const rect = node.getBoundingClientRect();
      const parentEl = node.parentElement ?? root ?? doc.body;
      const parentRect = parentEl.getBoundingClientRect();
      const origin: ResizeOrigin = {
        rect,
        parentRect,
        parentWidth: parentRect.width,
        parentHeight: parentRect.height,
        mainAxis: detectParentMainAxis(node, view),
        widthUnit: detectLengthUnit(element.styles?.default?.width),
        heightUnit: detectLengthUnit(element.styles?.default?.height),
      };

      const snapshot = snapshotInlineStyles(node);
      let latestPreview: ResizePreview = computeResizePreview(
        direction,
        origin,
        {
          clientX: event.clientX,
          clientY: event.clientY,
          shiftKey: Boolean(event.shiftKey),
          altKey: Boolean(event.altKey),
        },
        element.styles,
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
        latestPreview = computeResizePreview(direction, origin, pt, element.styles);
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
      const cleanup = (restoreDom: boolean): void => {
        if (finished) return;
        finished = true;
        frame.cancel();
        removeListeners();
        unlockCursor();
        if (restoreDom) restoreInlineStyles(node, snapshot);
        if (disposeRef.current === cancelCurrent) disposeRef.current = null;
      };

      const cancelCurrent = (): void => {
        cleanup(true);
        setSession(IDLE_SESSION);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, view);
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (moved) {
            pendingPointer = normalizePointerEvent(e, view);
            flushFrame();
          }
          cleanup(false);
          setSession(IDLE_SESSION);
          if (moved) {
            useElementStore
              .getState()
              .updateElement(element.id, { styles: latestPreview.styles });
          }
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
    },
    [canEdit, root, teardown],
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
      const initial = readComputedSpacing(view.getComputedStyle(node));
      const startX = event.clientX;
      const startY = event.clientY;
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
        element.styles,
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
            dx: pt.clientX - startX,
            dy: pt.clientY - startY,
            shiftKey: pt.shiftKey,
            altKey: pt.altKey,
          },
          element.styles,
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
      const cleanup = (restoreDom: boolean): void => {
        if (finished) return;
        finished = true;
        frame.cancel();
        removeListeners();
        unlockCursor();
        if (restoreDom) restoreInlineStyles(node, snapshot);
        if (disposeRef.current === cancelCurrent) disposeRef.current = null;
      };

      const cancelCurrent = (): void => {
        cleanup(true);
        setSession(IDLE_SESSION);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, view);
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (moved) {
            pendingPointer = normalizePointerEvent(e, view);
            flushFrame();
          }
          cleanup(false);
          setSession(IDLE_SESSION);
          if (moved) {
            useElementStore
              .getState()
              .updateElement(element.id, { styles: latestPreview.styles });
          }
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
    },
    [canEdit, teardown],
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
      const startX = event.clientX;
      const startY = event.clientY;

      let active = false;
      let unlockCursor: (() => void) | null = null;
      let latestTarget: DropIndicatorState | null = null;
      let pendingPointer: NormalizedPointer | null = null;
      let finished = false;

      const updateMovePreview = (pt: NormalizedPointer): void => {
        const target = hitTestDropTarget(root, node, elementId, pt.clientX, pt.clientY);
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
        if (!active) {
          if (Math.hypot(pt.clientX - startX, pt.clientY - startY) <= MOVE_THRESHOLD_PX) {
            return;
          }
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
      };

      const cancelCurrent = (): void => {
        cleanup();
        setSession(IDLE_SESSION);
      };

      const removeListeners = attachDualWindowListeners(view, {
        onMove: (e: PointerEvent) => {
          pendingPointer = normalizePointerEvent(e, view);
          frame.schedule();
        },
        onUp: (e: PointerEvent) => {
          if (pendingPointer !== null) {
            flushFrame();
          } else if (active) {
            updateMovePreview(normalizePointerEvent(e, view));
          }
          const commitTarget = active ? latestTarget : null;
          cleanup();
          setSession(IDLE_SESSION);
          if (commitTarget !== null) {
            useElementStore
              .getState()
              .moveElement(elementId, commitTarget.targetId, commitTarget.position);
          }
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Escape" && active) {
            e.preventDefault();
            cancelCurrent();
          }
        },
      });

      disposeRef.current = cancelCurrent;
    },
    [root, canEdit, picking, teardown],
  );

  return {
    session,
    startResize,
    startSpacing,
    handleCanvasPointerDown,
    cancel,
  };
}
