import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { EditorElement } from "@/types/global.type";
import { CONTAINER_ELEMENT_TYPES } from "@/types/elements";
import { resolveInsertedElement } from "@/features/editor/lib/dropElement";
import { useElementStore } from "@/features/editor/store/element-store";
import {
  readDropPayload,
  setMoveDrag,
} from "@/features/editor/utils/element/dragPayload";
import {
  computeDropPosition,
  isHorizontalFlow,
} from "@/features/editor/utils/element/dropPosition";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import type { DropIndicatorState } from "./CanvasOverlay";
import { findElementNode } from "./useElementRect";
import {
  elementNodeFrom,
  findElement,
  hasElementDragData,
  isSameDropIndicator,
  setCanvasSelection,
} from "./canvasDom";

interface UseCanvasDragDropOptions {
  root: HTMLDivElement | null;
  canEdit: boolean;
  canCreate: boolean;
  queryClient: QueryClient;
  projectId: string | null;
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
  const horizontal = parentStyle ? isHorizontalFlow(parentStyle) : false;
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

export function useCanvasDragDrop({
  root,
  canEdit,
  canCreate,
  queryClient,
  projectId,
  userId,
}: UseCanvasDragDropOptions): {
  drop: DropIndicatorState | null;
  resetDrag: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
} {
  const [drop, setDrop] = useState<DropIndicatorState | null>(null);
  const dropRef = useRef<DropIndicatorState | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  const updateDrop = useCallback((next: DropIndicatorState | null): void => {
    if (isSameDropIndicator(dropRef.current, next)) return;
    dropRef.current = next;
    setDrop(next);
  }, []);

  const resetDrag = useCallback((): void => {
    if (draggingIdRef.current) {
      findElementNode(root, draggingIdRef.current)?.removeAttribute("data-dragging");
    }
    draggingIdRef.current = null;
    updateDrop(null);
    setCanvasSelection({ draggingElementId: undefined });
  }, [root, updateDrop]);

  const onDragStart = (event: React.DragEvent): void => {
    const node = elementNodeFrom(root, event.target);
    if (!node || !node.draggable) return;
    event.stopPropagation();
    if (!canEdit) {
      event.preventDefault();
      return;
    }
    const id = node.dataset.elementId!;
    setMoveDrag(event.dataTransfer, id);
    draggingIdRef.current = id;
    node.setAttribute("data-dragging", "true");
    setCanvasSelection({ draggingElementId: id, hoveredElementId: undefined });
  };

  const onDragOver = (event: React.DragEvent): void => {
    const node = elementNodeFrom(root, event.target);
    if (!node || !hasElementDragData(event.dataTransfer)) {
      updateDrop(null);
      return;
    }
    const isMove = draggingIdRef.current !== null;
    if (isMove ? !canEdit : !canCreate) return;

    event.preventDefault();
    event.stopPropagation();

    if (isMove && findElementNode(root, draggingIdRef.current!)?.contains(node)) {
      event.dataTransfer.dropEffect = "none";
      updateDrop(null);
      return;
    }

    event.dataTransfer.dropEffect = isMove ? "move" : "copy";
    updateDrop(computeIndicatorForNode(node, event.clientX, event.clientY));
  };

  const onDragLeave = (event: React.DragEvent): void => {
    if (!root?.contains(event.relatedTarget as Node | null)) updateDrop(null);
  };

  const onDrop = (event: React.DragEvent): void => {
    const target = dropRef.current;
    if (!target) {
      resetDrag();
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    try {
      const payload = readDropPayload(event.dataTransfer);
      if (!payload) return;
      const store = useElementStore.getState();

      if (payload.kind === "move") {
        if (!canEdit) {
          showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
          return;
        }
        store.moveElement(payload.elementId, target.targetId, target.position);
        return;
      }

      if (!canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return;
      }
      const pageId =
        findElement(target.targetId)?.pageId ?? store.activePage?.pageId ?? "";
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

  return { drop, resetDrag, onDragStart, onDragOver, onDragLeave, onDrop };
}
