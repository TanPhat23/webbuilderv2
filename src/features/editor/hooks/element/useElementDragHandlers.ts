import React, { useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import type { EditorElement } from "@/types/global.type";
import {
  useDragState,
  useDragActions,
  useSwapElement,
  useInsertElement,
  useAddElement,
  useSetSelectedElement,
} from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import type { EditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import {
  isCreateDrag,
  readDropPayload,
  setMoveDrag,
} from "@/features/editor/utils/element/dragPayload";
import {
  showErrorToast,
  showSuccessToast,
  PERMISSION_ERRORS,
} from "@/utils/errors/errorToast";

export interface UseElementDragHandlersOptions {
  isReadOnly?: boolean;
  isLocked?: boolean;
  /** Falls back to the `$id` route param. */
  projectId?: string | null;
}

export interface UseElementDragHandlersReturn {
  draggedOverElement: EditorElement | undefined;
  draggingElement: EditorElement | undefined;
  canDrag: boolean;
  permissions: EditorPermissions;
  handleHover: (e: React.DragEvent, element: EditorElement) => void;
  handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, element: EditorElement) => void;
}

/**
 * Canvas drag & drop: dragging an existing element onto another swaps them;
 * dropping a palette element or template onto a container nests it, onto any
 * other element inserts it as a sibling.
 */
export function useElementDragHandlers({
  isReadOnly = false,
  isLocked = false,
  projectId = null,
}: UseElementDragHandlersOptions = {}): UseElementDragHandlersReturn {
  const params = useParams({ strict: false }) as { id?: string };
  const permissions = useEditorPermissions(projectId ?? params.id ?? null);

  const { draggedOverElement, draggingElement } = useDragState();
  const { setDraggingElement, setDraggedOverElement } = useDragActions();
  const setSelectedElement = useSetSelectedElement();
  const insertElement = useInsertElement();
  const swapElement = useSwapElement();
  const addElement = useAddElement();

  const canDrag = !isReadOnly && !isLocked && !!permissions?.canEditElements;
  const canCreate =
    !isReadOnly && !isLocked && !!permissions?.canCreateElements;

  const resetDragState = useCallback(() => {
    setDraggedOverElement(undefined);
    setDraggingElement(undefined);
  }, [setDraggedOverElement, setDraggingElement]);

  const handleHover = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canDrag) return;

      // New elements can only be nested into containers; moves may target any element.
      if (isCreateDrag(e.dataTransfer) && !elementHelper.isContainerElement(element)) {
        return;
      }

      if (draggedOverElement?.id !== element.id) {
        setDraggedOverElement(element);
      }
    },
    [canDrag, draggedOverElement, setDraggedOverElement],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      // Without this, the event bubbles to every ancestor's wrapper and the
      // outermost one becomes the dragged element.
      e.stopPropagation();
      if (!canDrag) {
        e.preventDefault();
        return;
      }

      setDraggingElement(element);
      try {
        setMoveDrag(e.dataTransfer, element.id);
      } catch (err) {
        console.warn("Failed to set drag data:", err);
      }
    },
    [canDrag, setDraggingElement],
  );

  const placeNewElement = useCallback(
    (target: EditorElement, newElement: EditorElement, select: boolean) => {
      if (elementHelper.isContainerElement(target)) {
        newElement.parentId = target.id;
        addElement(newElement);
        if (select) setSelectedElement(newElement);
      } else {
        insertElement(target, newElement);
      }
    },
    [addElement, insertElement, setSelectedElement],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, target: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        if (!canDrag && !canCreate) {
          showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
          return;
        }

        const payload = readDropPayload(e.dataTransfer);
        if (!payload) return;

        if (payload.kind === "move") {
          if (draggingElement && payload.elementId !== target.id) {
            swapElement(payload.elementId, target.id);
            showSuccessToast("Elements swapped successfully");
          }
          return;
        }

        if (!canCreate) {
          showErrorToast(PERMISSION_ERRORS.cannotAdd);
          return;
        }

        const factory = ElementFactory.getInstance();
        if (payload.kind === "create") {
          const newElement = factory.createElement({
            type: payload.elementType,
            pageId: target.pageId,
            parentId: elementHelper.isContainerElement(target)
              ? target.id
              : undefined,
          });
          if (newElement) placeNewElement(target, newElement, true);
          return;
        }

        const template = customComps[payload.index];
        if (!template) return;
        const newElement = factory.createElementFromTemplate({
          element: template,
          pageId: target.pageId,
        });
        if (newElement) placeNewElement(target, newElement, false);
      } catch (error) {
        console.warn("Failed to handle canvas drop", error);
      } finally {
        resetDragState();
      }
    },
    [
      canDrag,
      canCreate,
      draggingElement,
      swapElement,
      placeNewElement,
      resetDragState,
    ],
  );

  return {
    draggedOverElement,
    draggingElement,
    canDrag,
    permissions,
    handleHover,
    handleDragStart,
    handleDragEnd: resetDragState,
    handleDrop,
  };
}

export default useElementDragHandlers;
