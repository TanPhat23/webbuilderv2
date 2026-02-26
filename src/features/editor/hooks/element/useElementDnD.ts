/**
 * useElementDnD.ts
 *
 * Hook that encapsulates element drag & drop behavior (move/swap, insert via drop)
 * Extracted from the larger `useElementHandler` so this logic can be composed
 * independently and tested in isolation.
 */

import { useCallback } from "react";
import type { EditorElement } from "@/types/global.type";
import { useFullDragContext } from "@/features/editor";
import { useSwapElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useElementCreator } from "./useElementCreator";
import {
  showErrorToast,
  PERMISSION_ERRORS,
} from "@/utils/errors/errorToast";

export interface UseElementDnDOptions {
  /**
   * Optional explicit project id to scope permission checks. When omitted,
   * the permissions hook will fall back to route params.
   */
  projectId?: string | null;

  /**
   * Whether the editor is currently in read-only mode.
   */
  isReadOnly?: boolean;

  /**
   * Whether the editor is currently locked.
   */
  isLocked?: boolean;
}

export interface UseElementDnDReturn {
  // Event handlers
  handleDrop: (e: React.DragEvent, parentElement: EditorElement) => void;
  handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
  handleDragOver: (e: React.DragEvent, element: EditorElement) => void;
  handleDragLeave: (e: React.DragEvent, element: EditorElement) => void;
  handleDragEnd: (e: React.DragEvent) => void;

  // Permission booleans useful to UI components
  canDrag: boolean;
  canReorder: boolean;
  canCreate: boolean;
}

/**
 * useElementDnD
 *
 * Encapsulates the drag & drop semantics used by editor components.
 *
 * Notes:
 * - Keeps toasts and permission checks consistent with prior implementation.
 * - Uses selection / element stores to perform swaps and set selection state.
 */
export function useElementDnD({
  projectId = null,
  isReadOnly = false,
  isLocked = false,
}: UseElementDnDOptions = {}): UseElementDnDReturn {
  const permissions = useEditorPermissions(projectId);
  const elementCreator = useElementCreator();
  const swapElement = useSwapElement();

  const {
    selectedElement,
    setSelectedElement,
    setDraggingElement,
    draggingElement,
    draggedOverElement,
    setDraggedOverElement,
    setHoveredElement,
  } = useFullDragContext();

  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;
  const canReorder = !isReadOnly && !isLocked && permissions.canReorderElements;

  /**
   * handleDrop
   *
   * Handles both:
   *  - swapping existing elements (draggingElement present)
   *  - inserting a new element (via elementCreator.createElementFromDrop)
   */
  const handleDrop = useCallback(
    (e: React.DragEvent, parentElement: EditorElement) => {
      e.stopPropagation();
      e.preventDefault();

      // Guard: cannot drop if all operations are disallowed.
      if (!canDrag && !elementCreator.canCreate && !canReorder) {
        showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
        return;
      }

      // Clear selection (we're performing a structural operation).
      setSelectedElement(undefined);

      // 1) Existing element is being moved — perform swap
      if (draggingElement) {
        if (!canReorder) {
          showErrorToast(PERMISSION_ERRORS.cannotReorder);
          return;
        }

        swapElement(draggingElement.id, parentElement.id);
        setDraggedOverElement(undefined);
      } else {
        // 2) Create a new element from drop payload (type or image)
        const newElement = elementCreator.createElementFromDrop(
          e,
          parentElement,
        );
        if (newElement) {
          elementCreator.completeElementCreation(newElement);
        }
      }

      setHoveredElement(undefined);
      setDraggingElement(undefined);
    },
    [
      canDrag,
      canReorder,
      elementCreator,
      draggingElement,
      setDraggedOverElement,
      setDraggingElement,
      setHoveredElement,
      setSelectedElement,
      swapElement,
    ],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.stopPropagation();

      if (!canDrag) {
        e.preventDefault();
        return;
      }

      setDraggingElement(element);
    },
    [canDrag, setDraggingElement],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canDrag) {
        return;
      }

      // Prevent suggesting drop targets when dragging over self or own parent.
      if (
        draggingElement?.id === element.id ||
        draggingElement?.parentId === element.id
      )
        return;

      // Only container elements can accept drops (for insertion).
      if (!elementHelper.isContainerElement(element)) return;

      setDraggedOverElement(element);
    },
    [canDrag, draggingElement, setDraggedOverElement],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.stopPropagation();
      if (draggedOverElement?.id === element.id) {
        setDraggedOverElement(undefined);
      }
    },
    [draggedOverElement, setDraggedOverElement],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.stopPropagation();
      setDraggingElement(undefined);
      setDraggedOverElement(undefined);
    },
    [setDraggedOverElement, setDraggingElement],
  );

  return {
    handleDrop,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    canDrag,
    canReorder,
    canCreate: elementCreator.canCreate,
  };
}

export default useElementDnD;
