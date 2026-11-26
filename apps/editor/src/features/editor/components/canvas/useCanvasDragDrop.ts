import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { CONTAINER_ELEMENT_TYPES } from "@webbuilder/site-runtime/types/elements";
import { resolveInsertedElement } from "@/features/editor/lib/dropElement";
import { useElementStore } from "@/features/editor/store/element-store";
import {
  clearActiveDragPayload,
  readDropPayload,
} from "@/features/editor/utils/element/dragPayload";
import {
  computeDropPosition,
  isHorizontalFlow,
} from "@/features/editor/utils/element/dropPosition";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import type { DropIndicatorState } from "./canvasTypes";
import {
  findElementNodeFromTarget,
  findElement,
  hasElementDragPayload,
  isSameDropIndicator,
  setCanvasSelection,
} from "./canvasDom";

interface UseCanvasDragDropOptions {
  root: HTMLDivElement | null;
  canCreate: boolean;
  queryClient: QueryClient;
  projectId: string | null;
  pageId?: string | null;
  userId: string | null;
}

const CONTAINER_TYPE_SET: ReadonlySet<string> = new Set(CONTAINER_ELEMENT_TYPES);

function computeIndicatorForNode(
  node: HTMLElement,
  clientX: number,
  clientY: number,
): DropIndicatorState {
  const view = node.ownerDocument.defaultView ?? window;
  const parent = (node.closest("[data-component-instance]") ?? node).parentElement;
  const parentStyle = parent ? view.getComputedStyle(parent) : null;
  const horizontal = parentStyle
    ? isHorizontalFlow({
        display: parentStyle.display,
        flexDirection: parentStyle.flexDirection,
        gridTemplateColumns: parentStyle.gridTemplateColumns,
      })
    : false;
  const elementType = node.dataset.elementType;
  const isContainer =
    !node.closest("[data-component-instance]") &&
    elementType !== undefined &&
    CONTAINER_TYPE_SET.has(elementType);
  const position = computeDropPosition(
    node.getBoundingClientRect(),
    { x: clientX, y: clientY },
    { isContainer, horizontal },
  );
  return { targetId: node.dataset.elementId!, position, horizontal };
}

/**
 * Handles HTML5 Drag-and-Drop for sidebar inserts (`create`, `template`,
 * `component`, `snapshot`). On-canvas element moves/swaps are handled via
 * Pointer Events in `useCanvasManipulation`.
 */
export function useCanvasDragDrop({
  root,
  canCreate,
  queryClient,
  projectId,
  pageId: contextPageId = null,
  userId,
}: UseCanvasDragDropOptions): {
  drop: DropIndicatorState | null;
  resetDrag: () => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
} {
  const [drop, setDrop] = useState<DropIndicatorState | null>(null);
  const dropRef = useRef<DropIndicatorState | null>(null);

  const updateDrop = useCallback((next: DropIndicatorState | null): void => {
    if (isSameDropIndicator(dropRef.current, next)) return;
    dropRef.current = next;
    setDrop(next);
  }, []);

  const resetDrag = useCallback((): void => {
    clearActiveDragPayload();
    updateDrop(null);
  }, [updateDrop]);

  type DragResolution =
    | { readonly kind: "invalid" }
    | { readonly kind: "denied" }
    | { readonly kind: "ready"; readonly target: DropIndicatorState };

  const resolveDragTarget = (event: React.DragEvent): DragResolution => {
    const node = findElementNodeFromTarget(root, event.target);
    if (!node || !hasElementDragPayload(event.dataTransfer)) {
      return { kind: "invalid" };
    }
    if (!canCreate) return { kind: "denied" };
    return {
      kind: "ready",
      target: computeIndicatorForNode(node, event.clientX, event.clientY),
    };
  };

  const handleDragOver = (event: React.DragEvent): void => {
    const resolution = resolveDragTarget(event);
    if (resolution.kind === "invalid") {
      updateDrop(null);
      return;
    }
    if (resolution.kind === "denied") return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    updateDrop(resolution.target);
  };

  const handleDragLeave = (event: React.DragEvent): void => {
    if (!root?.contains(event.relatedTarget as Node | null)) updateDrop(null);
  };

  const handleDrop = (event: React.DragEvent): void => {
    const fallback = dropRef.current ? null : resolveDragTarget(event);
    const target =
      dropRef.current ?? (fallback?.kind === "ready" ? fallback.target : null);
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
      const pageId =
        findElement(target.targetId)?.pageId ||
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
      store.insertElementRelative(newElement, target.targetId, target.position);
      if (payload.kind !== "template" && findElement(newElement.id)) {
        setCanvasSelection({ selectedElementId: newElement.id });
      }
    } catch (error) {
      console.warn("Failed to handle canvas drop", error);
    } finally {
      resetDrag();
    }
  };

  return { drop, resetDrag, handleDragOver, handleDragLeave, handleDrop };
}
