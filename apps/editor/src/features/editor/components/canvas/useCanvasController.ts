import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import { resolveInsertedElement } from "@/features/editor/lib/dropElement";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { isTypingTarget } from "@/features/editor/components/layout/isTypingTarget";
import {
  clearActiveDragPayload,
  readDropPayload,
} from "@/features/editor/utils/element/dragPayload";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import type { CanvasDropResolution, ManipulationSession } from "./canvasTypes";
import {
  findElement,
  findElementNodeFromTarget,
  hasElementDragPayload,
  isSameDropIndicator,
  isTypingInCanvas,
  setCanvasSelection,
} from "./canvasDom";
import { resolveCanvasDropTarget } from "./canvasHitTest";
import { useAutoScroll } from "./useAutoScroll";
import { useCanvasPickMode } from "./useCanvasPickMode";
import {
  clientToIframeClient,
  isEditableOrBlockedTarget,
  readGeometry,
  useCanvasManipulation,
  type ClientPoint,
  type UseCanvasManipulationResult,
} from "./useCanvasManipulation";

export interface UseCanvasControllerOptions {
  /** The site root (`#wb-site-root`) rendered inside the preview iframe. */
  readonly siteRoot: HTMLElement | null;
  /** Canvas stage that hosts the scaled iframe. */
  readonly stageEl: HTMLElement | null;
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
  readonly canEdit: boolean;
  readonly canCreate: boolean;
  readonly queryClient: QueryClient;
  readonly projectId: string | null;
  readonly pageId?: string | null;
  readonly userId: string | null;
}

/** Handlers to spread onto the element wrapping the site root. */
export interface CanvasSiteHandlers {
  readonly onMouseDownCapture: (event: React.MouseEvent) => void;
  readonly onMouseUpCapture: (event: React.MouseEvent) => void;
  readonly onContextMenuCapture: (event: React.MouseEvent) => void;
  readonly onClickCapture: (event: React.MouseEvent) => void;
  readonly onDoubleClickCapture: (event: React.MouseEvent) => void;
  readonly onPointerDown: (event: React.PointerEvent) => void;
  readonly onMouseOver: (event: React.MouseEvent) => void;
  readonly onMouseLeave: () => void;
  readonly onDoubleClick: (event: React.MouseEvent) => void;
  readonly onContextMenu: (event: React.MouseEvent) => void;
  readonly onDragEnter: (event: React.DragEvent) => void;
  readonly onDragOver: (event: React.DragEvent) => void;
  readonly onDragLeave: (event: React.DragEvent) => void;
  readonly onDrop: (event: React.DragEvent) => void;
  readonly onDragEnd: () => void;
}

/** Handlers to spread onto the stage backdrop around the iframe. */
export interface CanvasStageHandlers {
  readonly onPointerDown: (event: React.PointerEvent) => void;
}

export interface CanvasController {
  readonly picking: boolean;
  readonly session: ManipulationSession;
  /** Sidebar drag-and-drop target: the root, a relative slot, or nothing. */
  readonly drop: CanvasDropResolution;
  readonly startResize: UseCanvasManipulationResult["startResize"];
  readonly startSpacing: UseCanvasManipulationResult["startSpacing"];
  readonly cancel: () => void;
  readonly siteHandlers: CanvasSiteHandlers;
  readonly stageHandlers: CanvasStageHandlers;
}

interface ScreenPoint {
  readonly screenX: number;
  readonly screenY: number;
}

function isSameDrop(a: CanvasDropResolution, b: CanvasDropResolution): boolean {
  if (a === b) return true;
  if (a === null || b === null || a.kind !== b.kind) return false;
  if (a.kind === "root" || b.kind === "root") return true;
  return isSameDropIndicator(a.indicator, b.indicator);
}

function isScreenPointEvent(event: Event): event is Event & ScreenPoint {
  return "screenX" in event && "screenY" in event;
}

const ACTIVATABLE_SELECTOR =
  "button, a[href], summary, select, [role='button'], [role='menuitem'], [role='checkbox'], [role='switch'], [role='tab'], [role='option'], [role='radio'], [role='link']";

/** True for controls that use Space to activate (buttons, menu items, ...). */
function isActivatableTarget(target: EventTarget | null): boolean {
  if (target === null || typeof target !== "object") return false;
  if (!("closest" in target) || typeof target.closest !== "function") return false;
  return (target as Element).closest(ACTIVATABLE_SELECTOR) !== null;
}

function isSpaceKey(event: KeyboardEvent): boolean {
  return event.code === "Space" || event.key === " ";
}

/**
 * The one controller for the editor canvas: click select, Alt+click parent
 * select, backdrop deselect, double-click inline text edit, pick mode,
 * Ctrl/Cmd+wheel zoom, Space+drag pan, resize/spacing/move manipulation, and
 * the sidebar HTML5 drop, all against one drop hit-tester.
 */
export function useCanvasController({
  siteRoot,
  stageEl,
  iframeRef,
  canEdit,
  canCreate,
  queryClient,
  projectId,
  pageId: contextPageId = null,
  userId,
}: UseCanvasControllerOptions): CanvasController {
  const getZoom = useCallback(
    (): number => computeEffectiveZoom(useCanvasViewportStore.getState()),
    [],
  );

  const pick = useCanvasPickMode(siteRoot);
  const manipulation = useCanvasManipulation({
    root: siteRoot,
    canEdit,
    picking: pick.picking,
    getZoom,
    stageEl,
    iframeRef,
  });
  const { session, handleCanvasPointerDown, refreshMove } = manipulation;

  const iframeWin = siteRoot?.ownerDocument.defaultView ?? null;
  const geometry = useCallback(
    () => readGeometry(iframeWin ?? window, iframeRef, getZoom),
    [iframeWin, iframeRef, getZoom],
  );

  // ---- Space + drag pan, Ctrl/Cmd + wheel zoom --------------------------
  const spaceHeldRef = useRef(false);
  const pointerOverCanvasRef = useRef(false);
  const stopPanRef = useRef<(() => void) | null>(null);

  const startPan = useCallback(
    (origin: ScreenPoint): void => {
      stopPanRef.current?.();
      let lastX = origin.screenX;
      let lastY = origin.screenY;
      const wins = new Set<Window>([window]);
      if (iframeWin) wins.add(iframeWin);

      const onMove = (event: Event): void => {
        if (!isScreenPointEvent(event)) return;
        useCanvasViewportStore
          .getState()
          .panBy(event.screenX - lastX, event.screenY - lastY);
        lastX = event.screenX;
        lastY = event.screenY;
      };
      const stop = (): void => {
        for (const win of wins) {
          win.removeEventListener("pointermove", onMove, true);
          win.removeEventListener("pointerup", stop, true);
          win.removeEventListener("pointercancel", stop, true);
          win.removeEventListener("blur", stop);
        }
        if (stopPanRef.current === stop) stopPanRef.current = null;
      };
      for (const win of wins) {
        win.addEventListener("pointermove", onMove, true);
        win.addEventListener("pointerup", stop, true);
        win.addEventListener("pointercancel", stop, true);
        win.addEventListener("blur", stop);
      }
      stopPanRef.current = stop;
    },
    [iframeWin],
  );

  useEffect(() => () => stopPanRef.current?.(), []);

  useEffect(() => {
    const docs = new Set<Document>([document]);
    if (siteRoot) docs.add(siteRoot.ownerDocument);

    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isSpaceKey(event)) return;
      // Space only pans while the pointer is over the canvas, and never takes
      // the key from typing or from activatable chrome (buttons, menu items).
      if (
        !pointerOverCanvasRef.current ||
        isTypingTarget(event.target) ||
        isActivatableTarget(event.target) ||
        useSelectionStore.getState().editingElementId !== undefined
      ) {
        return;
      }
      spaceHeldRef.current = true;
      event.preventDefault();
    };
    const onEnter = (): void => {
      pointerOverCanvasRef.current = true;
    };
    const onLeave = (): void => {
      pointerOverCanvasRef.current = false;
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (isSpaceKey(event)) spaceHeldRef.current = false;
    };
    const onBlur = (): void => {
      spaceHeldRef.current = false;
    };
    const onWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      useCanvasViewportStore.getState().zoomByWheel(event.deltaY);
    };

    const wheelTargets: EventTarget[] = [];
    if (stageEl) wheelTargets.push(stageEl);
    if (siteRoot) wheelTargets.push(siteRoot.ownerDocument);

    for (const doc of docs) {
      doc.addEventListener("keydown", onKeyDown, true);
      doc.addEventListener("keyup", onKeyUp, true);
      doc.defaultView?.addEventListener("blur", onBlur);
    }
    for (const target of wheelTargets) {
      target.addEventListener("wheel", onWheel as EventListener, { passive: false });
    }
    // The iframe document is not inside the stage in DOM terms, so its root
    // element reports hover separately.
    const hoverTargets: EventTarget[] = [];
    if (stageEl) hoverTargets.push(stageEl);
    if (siteRoot) hoverTargets.push(siteRoot.ownerDocument.documentElement);
    for (const target of hoverTargets) {
      target.addEventListener("pointerenter", onEnter);
      target.addEventListener("pointerleave", onLeave);
    }
    return () => {
      spaceHeldRef.current = false;
      pointerOverCanvasRef.current = false;
      for (const target of hoverTargets) {
        target.removeEventListener("pointerenter", onEnter);
        target.removeEventListener("pointerleave", onLeave);
      }
      for (const doc of docs) {
        doc.removeEventListener("keydown", onKeyDown, true);
        doc.removeEventListener("keyup", onKeyUp, true);
        doc.defaultView?.removeEventListener("blur", onBlur);
      }
      for (const target of wheelTargets) {
        target.removeEventListener("wheel", onWheel as EventListener);
      }
    };
  }, [siteRoot, stageEl]);

  // ---- Sidebar HTML5 drag-and-drop --------------------------------------
  const [drop, setDrop] = useState<CanvasDropResolution>(null);
  const dropRef = useRef<CanvasDropResolution>(null);
  const [sidebarPointerY, setSidebarPointerY] = useState<number | null>(null);
  const lastDragPointRef = useRef<ClientPoint | null>(null);

  const updateDrop = useCallback((next: CanvasDropResolution): void => {
    if (isSameDrop(dropRef.current, next)) return;
    dropRef.current = next;
    setDrop(next);
  }, []);

  const resetDrag = useCallback((): void => {
    clearActiveDragPayload();
    lastDragPointRef.current = null;
    setSidebarPointerY(null);
    updateDrop(null);
  }, [updateDrop]);

  const resolveDropAt = useCallback(
    (point: ClientPoint): CanvasDropResolution => {
      if (!siteRoot || !canCreate) return null;
      const iframePoint = clientToIframeClient(point, geometry());
      const { elements, isComponentPage } = useElementStore.getState();
      return resolveCanvasDropTarget({
        siteRoot,
        doc: siteRoot.ownerDocument,
        iframeClientX: iframePoint.x,
        iframeClientY: iframePoint.y,
        elements,
        canCreate,
        isComponentPage,
      });
    },
    [siteRoot, canCreate, geometry],
  );

  const parentPointerY = useCallback(
    (point: ClientPoint): number => {
      const geo = geometry();
      const iframeRealm =
        geo.iframeWin !== null && geo.iframeWin !== window && point.view === geo.iframeWin;
      if (!iframeRealm) return point.clientY;
      const frameTop = geo.frameEl?.getBoundingClientRect().top ?? 0;
      return frameTop + point.clientY * geo.zoom;
    },
    [geometry],
  );

  const onDragOver = (event: React.DragEvent): void => {
    if (!siteRoot || !hasElementDragPayload(event.dataTransfer)) {
      updateDrop(null);
      return;
    }
    if (!canCreate) return;
    const point: ClientPoint = {
      clientX: event.clientX,
      clientY: event.clientY,
      view: event.view,
    };
    lastDragPointRef.current = point;
    setSidebarPointerY(parentPointerY(point));
    const resolution = resolveDropAt(point);
    if (resolution === null) {
      updateDrop(null);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    updateDrop(resolution);
  };

  const onDragLeave = (event: React.DragEvent): void => {
    if (!siteRoot?.contains(event.relatedTarget as Node | null)) {
      lastDragPointRef.current = null;
      setSidebarPointerY(null);
      updateDrop(null);
    }
  };

  const onDrop = (event: React.DragEvent): void => {
    const target =
      dropRef.current ??
      (hasElementDragPayload(event.dataTransfer)
        ? resolveDropAt({ clientX: event.clientX, clientY: event.clientY, view: event.view })
        : null);
    if (!target) {
      resetDrag();
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    try {
      const payload = readDropPayload(event.dataTransfer);
      if (!payload || payload.kind === "move") return;
      if (!canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return;
      }
      const store = useElementStore.getState();
      const anchorId = target.kind === "relative" ? target.indicator.targetId : undefined;
      const pageId =
        (anchorId ? findElement(anchorId)?.pageId : undefined) ||
        store.activePage?.pageId ||
        contextPageId ||
        "";
      const newElement = resolveInsertedElement(
        payload,
        pageId,
        queryClient,
        projectId,
        userId,
      );
      if (!newElement) return;
      if (target.kind === "relative") {
        store.insertElementRelative(
          newElement,
          target.indicator.targetId,
          target.indicator.position,
        );
      } else {
        store.addElement(newElement);
      }
      if (payload.kind !== "template" && findElement(newElement.id)) {
        setCanvasSelection({ selectedElementId: newElement.id });
      }
    } catch (error) {
      console.warn("Failed to handle canvas drop", error);
    } finally {
      resetDrag();
    }
  };

  // ---- Edge auto-scroll while dragging (sidebar drag or element move) ---
  const [movingPointerY, setMovingPointerY] = useState<number | null>(null);
  const isMoving = session.kind === "moving";

  useEffect(() => {
    if (!isMoving) return;
    const wins = new Set<Window>([window]);
    if (iframeWin) wins.add(iframeWin);
    const onMove = (event: Event): void => {
      if (!("clientY" in event) || !("clientX" in event)) return;
      const point = event as Event & ClientPoint;
      setMovingPointerY(
        parentPointerY({
          clientX: point.clientX,
          clientY: point.clientY,
          view: "view" in event ? event.view : undefined,
        }),
      );
    };
    for (const win of wins) win.addEventListener("pointermove", onMove, true);
    return () => {
      for (const win of wins) win.removeEventListener("pointermove", onMove, true);
      setMovingPointerY(null);
    };
  }, [isMoving, iframeWin, parentPointerY]);

  const refreshDropAfterScroll = useCallback((): void => {
    if (isMoving) {
      refreshMove();
      return;
    }
    const point = lastDragPointRef.current;
    if (point) updateDrop(resolveDropAt(point));
  }, [isMoving, refreshMove, resolveDropAt, updateDrop]);

  useAutoScroll(
    iframeRef,
    isMoving ? movingPointerY : sidebarPointerY,
    refreshDropAfterScroll,
  );

  // ---- Pointer, hover, selection ---------------------------------------
  const onPointerDown = (event: React.PointerEvent): void => {
    if (event.button !== 0) return;
    if (spaceHeldRef.current) {
      event.preventDefault();
      startPan(event);
      return;
    }
    if (pick.picking || !canEdit || isEditableOrBlockedTarget(event.target)) return;
    if (!findElementNodeFromTarget(siteRoot, event.target)) {
      // Backdrop: clicking empty canvas clears the selection.
      setCanvasSelection({ selectedElementId: undefined });
      return;
    }
    handleCanvasPointerDown(event);
  };

  const onStagePointerDown = (event: React.PointerEvent): void => {
    if (event.button !== 0) return;
    if (spaceHeldRef.current) {
      event.preventDefault();
      startPan(event);
      return;
    }
    if (canEdit && event.target === event.currentTarget) {
      setCanvasSelection({ selectedElementId: undefined });
    }
  };

  // A press that pick mode swallows (the second press of the double click that
  // completed a pick) must not select the element when it is released.
  const onMouseDownCapture = (event: React.MouseEvent): void => {
    pick.blockPickPointer(event);
    if (event.isPropagationStopped()) manipulation.cancel();
  };

  const onMouseOver = (event: React.MouseEvent): void => {
    if (session.kind !== "idle" || isTypingInCanvas(siteRoot)) return;
    const id = findElementNodeFromTarget(siteRoot, event.target)?.dataset.elementId;
    if (useSelectionStore.getState().hoveredElementId !== id) {
      setCanvasSelection({ hoveredElementId: id });
    }
  };

  const onMouseLeave = (): void => {
    if (session.kind !== "idle" || isTypingInCanvas(siteRoot)) return;
    setCanvasSelection({ hoveredElementId: undefined });
  };

  const onDoubleClick = (event: React.MouseEvent): void => {
    const id = findElementNodeFromTarget(siteRoot, event.target)?.dataset.elementId;
    if (!id) return;
    // Inside the element being edited, double click selects a word natively.
    if (useSelectionStore.getState().editingElementId === id) return;
    event.preventDefault();
    if (!canEdit) {
      showErrorToast(PERMISSION_ERRORS.cannotEdit);
      return;
    }
    const element = findElement(id);
    const editable = element !== undefined && elementUtils.isEditableElement(element);
    setCanvasSelection({
      selectedElementId: id,
      editingElementId: editable ? id : undefined,
    });
  };

  const onContextMenu = (event: React.MouseEvent): void => {
    const shared = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-shared-section-id]",
    );
    const id =
      shared?.dataset.sharedSectionId ??
      findElementNodeFromTarget(siteRoot, event.target)?.dataset.elementId;
    if (!id) {
      event.preventDefault();
      return;
    }
    setCanvasSelection({ selectedElementId: id });
  };

  return {
    picking: pick.picking,
    session,
    drop,
    startResize: manipulation.startResize,
    startSpacing: manipulation.startSpacing,
    cancel: manipulation.cancel,
    siteHandlers: {
      onMouseDownCapture,
      onMouseUpCapture: pick.blockPickPointer,
      onContextMenuCapture: pick.blockPickPointer,
      onClickCapture: pick.handleClickCapture,
      onDoubleClickCapture: pick.handleDoubleClickCapture,
      onPointerDown,
      onMouseOver,
      onMouseLeave,
      onDoubleClick,
      onContextMenu,
      onDragEnter: onDragOver,
      onDragOver,
      onDragLeave,
      onDrop,
      onDragEnd: resetDrag,
    },
    stageHandlers: { onPointerDown: onStagePointerDown },
  };
}
