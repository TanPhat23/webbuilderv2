/**
 * useElementInteraction.ts
 *
 * Hook that encapsulates selection, mouse and contentEditable interactions
 * for editor elements. This isolates the UI interaction semantics (double click,
 * hover, editable text changes, style merging, and event handler construction)
 * so they can be composed with drag/drop behavior (which lives in
 * useElementDnD).
 */

import React, { useCallback } from "react";
import { useInteractionSelectionState } from "@/features/editor";
import { useUpdateElement } from "@/features/editor";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import {
  showErrorToast,
  PERMISSION_ERRORS,
} from "@/utils/errors/errorToast";
import type { ResponsiveStyles } from "@/features/editor";

/**
 * Handlers from a DnD implementation that can be merged into the event set.
 * `useElementDnD` (or other DnD systems) can provide these to `getEventHandlers`.
 */
export type DnDHandlers = {
  onDragStart?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
};

export interface UseElementInteractionOptions {
  isReadOnly?: boolean;
  isLocked?: boolean;
  projectId?: string | null;
}

export interface UseElementInteractionReturn {
  // Interaction handlers
  handleDoubleClick: (e: React.MouseEvent, element: EditorElement) => void;
  handleMouseEnter: (e: React.MouseEvent, element: EditorElement) => void;
  handleMouseLeave: (e: React.MouseEvent, element: EditorElement) => void;
  handleTextChange: (e: React.FocusEvent, element: EditorElement) => void;

  // Utilities
  getTailwindStyles: (element: EditorElement) => string;
  getStyles: (element: EditorElement) => React.CSSProperties;

  /**
   * Returns the interaction-focused event handlers for an element.
   * Accepts an optional `dndHandlers` object that the caller (e.g. a DnD
   * hook) can provide to merge drag/drop handlers in a single object.
   */
  getEventHandlers: (
    element: EditorElement,
    dndHandlers?: DnDHandlers,
  ) => {
    onDragStart?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
  };

  /**
   * Convenience helper to get the common props for an element (styles,
   * contentEditable state and merged event handlers). Accepts an optional
   * `dndHandlers` to include DnD-related events in the returned props.
   */
  getCommonProps: (
    element: EditorElement,
    dndHandlers?: DnDHandlers,
  ) => Record<string, any>;

  // Permission / UI flags
  canDelete: boolean;
  canEdit: boolean;
  canDrag: boolean;
}

/**
 * useElementInteraction
 *
 * Extracts selection / mouse / contentEditable operations from the legacy
 * `useElementHandler` to make them composable and testable.
 */
export function useElementInteraction({
  isReadOnly = false,
  isLocked = false,
  projectId = null,
}: UseElementInteractionOptions = {}): UseElementInteractionReturn {
  const updateElement = useUpdateElement();
  const {
    hoveredElement,
    selectedElement,
    setSelectedElement,
    setHoveredElement,
  } = useInteractionSelectionState();

  const permissions = useEditorPermissions(projectId ?? null);

  const canDelete = !isReadOnly && !isLocked && permissions.canDeleteElements;
  const canEdit = !isReadOnly && !isLocked && permissions.canEditElements;
  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, element: EditorElement) => {
      e.preventDefault();
      e.stopPropagation();

      if (!permissions.canEditElements) {
        showErrorToast(PERMISSION_ERRORS.cannotEdit);
        return;
      }

      if (selectedElement && selectedElement.id === element.id) {
        setSelectedElement(undefined);
        return;
      }

      setSelectedElement(element);
    },
    [permissions, selectedElement, setSelectedElement],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, element: EditorElement) => {
      e.stopPropagation();
      e.preventDefault();

      // If the user is actively editing content elsewhere, don't change hover
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).contentEditable === "true"
      ) {
        return;
      }

      // Avoid changing hover if there is an active editable selection
      if (selectedElement && elementHelper.isEditableElement(selectedElement)) {
        return;
      }

      // If a different element is selected, don't change hover to this one.
      if (selectedElement && selectedElement.id !== element.id) {
        return;
      }

      setHoveredElement(element);
    },
    [selectedElement, setHoveredElement],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent, element: EditorElement) => {
      e.stopPropagation();

      // Don't clear hover if the selected element is a text editor
      if (selectedElement && elementHelper.isEditableElement(selectedElement)) {
        return;
      }

      if (
        (document.activeElement &&
          (document.activeElement as HTMLElement).contentEditable === "true") ||
        (hoveredElement && hoveredElement.id !== element.id) ||
        (selectedElement && selectedElement.id === element.id)
      ) {
        return;
      }
      setHoveredElement(undefined);
    },
    [hoveredElement, selectedElement, setHoveredElement],
  );

  const handleTextChange = useCallback(
    (e: React.FocusEvent, element: EditorElement) => {
      e.stopPropagation();
      e.preventDefault();

      if (!elementHelper.isEditableElement(element)) {
        return;
      }

      if (!permissions.canEditElements) {
        showErrorToast(PERMISSION_ERRORS.cannotEdit);
        return;
      }

      updateElement(element.id, {
        content: e.currentTarget.textContent || "",
      });
    },
    [permissions, updateElement],
  );

  const getTailwindStyles = useCallback((element: EditorElement) => {
    return cn("", element.tailwindStyles);
  }, []);

  const getStyles = useCallback(
    (element: EditorElement): React.CSSProperties => {
      if (
        !element.styles ||
        typeof element.styles !== "object" ||
        Array.isArray(element.styles)
      ) {
        return {};
      }
      const merged: React.CSSProperties = {};
      const styles = element.styles as ResponsiveStyles;
      const breakpoints = ["default", "sm", "md", "lg", "xl"] as const;
      for (const bp of breakpoints) {
        if (styles[bp]) {
          Object.assign(merged, styles[bp]);
        }
      }
      return merged;
    },
    [],
  );

  const getEventHandlers = useCallback(
    (element: EditorElement, dndHandlers: DnDHandlers = {}) => {
      const isEditableElement = elementHelper.isEditableElement(element);

      return {
        onDragStart: (e: React.DragEvent) => dndHandlers.onDragStart?.(e),
        onDragLeave: (e: React.DragEvent) => dndHandlers.onDragLeave?.(e),
        onDragEnd: (e: React.DragEvent) => dndHandlers.onDragEnd?.(e),
        onDragOver: (e: React.DragEvent) => dndHandlers.onDragOver?.(e),
        // Do not allow drop on editable elements
        onDrop: isEditableElement
          ? undefined
          : (e: React.DragEvent) => dndHandlers.onDrop?.(e),
        onDoubleClick: (e: React.MouseEvent) => handleDoubleClick(e, element),
        onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(e, element),
        onMouseLeave: (e: React.MouseEvent) => handleMouseLeave(e, element),
        onBlur: (e: React.FocusEvent) => handleTextChange(e, element),
      };
    },
    [handleDoubleClick, handleMouseEnter, handleMouseLeave, handleTextChange],
  );

  const getCommonProps = useCallback(
    (element: EditorElement, dndHandlers?: DnDHandlers) => {
      const tailwindStyles = getTailwindStyles(element);
      const mergedStyles = getStyles(element);
      const eventHandlers = getEventHandlers(element, dndHandlers);

      return {
        style: mergedStyles,
        draggable: canDrag,
        className: tailwindStyles,
        contentEditable:
          elementHelper.isEditableElement(element) &&
          selectedElement?.id === element.id &&
          permissions.canEditElements,
        suppressContentEditableWarning: true,
        ...eventHandlers,
      };
    },
    [
      canDrag,
      getEventHandlers,
      getStyles,
      getTailwindStyles,
      permissions,
      selectedElement,
    ],
  );

  return {
    handleDoubleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleTextChange,
    getTailwindStyles,
    getStyles,
    getEventHandlers,
    getCommonProps,
    canDelete,
    canEdit,
    canDrag,
  };
}

export default useElementInteraction;
