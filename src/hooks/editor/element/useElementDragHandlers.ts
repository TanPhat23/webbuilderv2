import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { EditorElement, ElementType } from "@/types/global.type";
import {
  useDragState,
  useDragActions,
} from "@/globalstore/selectors/selection-selectors";
import {
  useSwapElement,
  useInsertElement,
  useAddElement,
  useElements,
} from "@/globalstore/selectors/element-selectors";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { ElementFactory } from "@/lib/utils/element/create/ElementFactory";
import { customComps } from "@/lib/customcomponents/customComponents";
import { useEditorPermissions } from "@/hooks/editor/useEditorPermissions";
import type { EditorPermissions } from "@/hooks/editor/useEditorPermissions";
import { useElementCreator } from "@/hooks/editor/element/useElementCreator";
import {
  showErrorToast,
  showSuccessToast,
  PERMISSION_ERRORS,
} from "@/lib/utils/errors/errorToast";

/**
 * Options for the `useElementDragHandlers` hook.
 */
export interface UseElementDragHandlersOptions {
  /**
   * Optional override list of elements to operate on. If omitted,
   * the global element store's items will be used.
   */
  elements?: EditorElement[];

  /**
   * Whether the editor is currently in read-only mode.
   */
  isReadOnly?: boolean;

  /**
   * Whether the editor is currently locked.
   */
  isLocked?: boolean;

  /**
   * Optional explicit project id (falls back to router params if not provided).
   */
  projectId?: string | null;
}

/**
 * Hook return shape used by the UI components.
 */
export interface UseElementDragHandlersReturn {
  items: EditorElement[] | undefined;

  // Selection state from the selection store
  draggedOverElement: EditorElement | undefined;
  draggingElement: EditorElement | undefined;

  // Local drag indicator
  isDraggingLocal: string | null;

  // Permission helpers
  canDrag: boolean;
  canCreate: boolean;
  permissions: EditorPermissions;

  // Handlers
  resetDragState: () => void;
  handleHover: (e: React.DragEvent, element: EditorElement) => void;
  handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, element: EditorElement) => void;
  handleReorder: (newOrder: EditorElement[]) => void;
}

/**
 * Extracts drag/drop and reorder logic from the ElementLoader component so it
 * can be easily tested and composed.
 */
export function useElementDragHandlers({
  elements,
  isReadOnly = false,
  isLocked = false,
  projectId = null,
}: UseElementDragHandlersOptions = {}): UseElementDragHandlersReturn {
  const params = useParams();
  const routeId = (params as { id?: string | undefined })?.id;
  const effectiveProjectId = projectId ?? routeId ?? null;

  const permissions = useEditorPermissions(effectiveProjectId);

  const { draggedOverElement, draggingElement } = useDragState();
  const { setDraggingElement, setDraggedOverElement } = useDragActions();

  const allElements = useElements();
  const insertElement = useInsertElement();
  const swapElement = useSwapElement();
  const addElement = useAddElement();

  const elementCreator = useElementCreator();

  const items = useMemo(() => elements ?? allElements, [elements, allElements]);

  const [isDraggingLocal, setIsDraggingLocal] = useState<string | null>(null);

  const canDrag = !isReadOnly && !isLocked && !!permissions?.canEditElements;
  const canCreate =
    !isReadOnly && !isLocked && !!permissions?.canCreateElements;

  const resetDragState = useCallback(() => {
    setDraggedOverElement(undefined);
    setDraggingElement(undefined);
    setIsDraggingLocal(null);
  }, [setDraggedOverElement, setDraggingElement]);

  const handleHover = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canDrag) return;

      // When creating a new element (dragging from palette or an image), only
      // allow hovering over container elements. Existing-element drags (reorder)
      // should still allow hover on any element.
      const isCreating = Boolean(
        e.dataTransfer.getData("elementType") ||
        e.dataTransfer.getData("customComponentName") ||
        e.dataTransfer.getData("application/json"),
      );

      if (isCreating && !elementHelper.isContainerElement(element)) return;

      if (draggedOverElement?.id !== element.id) {
        setDraggedOverElement(element);
      }
    },
    [canDrag, draggedOverElement, setDraggedOverElement],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      if (!canDrag) {
        e.preventDefault();
        return;
      }

      setIsDraggingLocal(element.id);
      setDraggingElement(element);

      // Store the id on the dataTransfer so drop targets can read it
      try {
        e.dataTransfer.setData("elementId", element.id);
        e.dataTransfer.effectAllowed = "move";
      } catch (err) {
        // dataTransfer operations can occasionally throw in some browsers;
        // swallow errors to avoid breaking the UX and keep local state.
        // eslint-disable-next-line no-console
        console.warn("Failed to set drag data:", err);
      }
    },
    [canDrag, setIsDraggingLocal, setDraggingElement],
  );

  const handleDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const handleDrop = useCallback(
    (e: React.DragEvent, element: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canDrag && !canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotPerformAction);
        resetDragState();
        return;
      }

      const elementType = e.dataTransfer.getData("elementType");
      const customElement = e.dataTransfer.getData("customComponentName");
      const draggedElementId = e.dataTransfer.getData("elementId");

      // Swap existing elements (drag & drop between elements)
      if (draggedElementId && draggingElement) {
        if (draggedElementId !== element.id) {
          swapElement(draggedElementId, element.id);
          showSuccessToast("Elements swapped successfully");
        }
        resetDragState();
        return;
      }

      if (elementType) {
        if (!canCreate) {
          showErrorToast(PERMISSION_ERRORS.cannotAdd);
          resetDragState();
          return;
        }

        const isContainer = elementHelper.isContainerElement(element);

        if (isContainer) {
          const newElement = elementCreator.createElementFromDrop(e, element);
          if (newElement) {
            elementCreator.completeElementCreation(newElement);
          }
        } else {
          const newElement = ElementFactory.getInstance().createElement({
            type: elementType as ElementType,
            pageId: element.pageId,
          });
          if (newElement) insertElement(element, newElement);
        }

        resetDragState();
        return;
      }

      // 2) Insert a custom component/template. If the target is a container,
      //    attach the template as a child; otherwise, insert it as a sibling.
      if (customElement) {
        try {
          if (!canCreate) {
            showErrorToast(PERMISSION_ERRORS.cannotAdd);
            resetDragState();
            return;
          }

          const compIndex = parseInt(customElement, 10);
          const customComp = customComps[compIndex];
          const newElement =
            ElementFactory.getInstance().createElementFromTemplate({
              element: customComp,
              pageId: element.pageId,
            });
          if (newElement) {
            if (elementHelper.isContainerElement(element)) {
              newElement.parentId = element.id;
              addElement(newElement);
            } else {
              insertElement(element, newElement);
            }
          }
        } catch (error) {
          // Keep errors silent to avoid interrupting the drag flow.
          // eslint-disable-next-line no-console
          console.warn("Failed to create custom element from template", error);
        }

        resetDragState();
        return;
      }

      resetDragState();
    },
    [
      canDrag,
      canCreate,
      draggingElement,
      insertElement,
      resetDragState,
      swapElement,
      elementCreator,
      addElement,
    ],
  );

  const handleReorder = useCallback(
    (newOrder: EditorElement[]) => {
      if (!canDrag) return;

      const currentIds = items?.map((e) => e.id) || [];
      const newIds = newOrder.map((e) => e.id);

      // Find first mismatch and swap the corresponding elements in the store.
      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] !== newIds[i]) {
          const originalIndex = newIds.indexOf(currentIds[i]);
          if (originalIndex !== -1 && originalIndex !== i) {
            swapElement(currentIds[i], newIds[i]);
            break;
          }
        }
      }
    },
    [canDrag, items, swapElement],
  );

  return {
    items,
    draggedOverElement,
    draggingElement,
    isDraggingLocal,
    canDrag,
    canCreate,
    permissions,
    resetDragState,
    handleHover,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleReorder,
  };
}

export type UseElementDragHandlers = UseElementDragHandlersReturn;

export default useElementDragHandlers;
