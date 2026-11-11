/**
 * useElementInteraction.ts
 *
 * Hook that encapsulates selection, mouse and contentEditable interactions
 * for editor elements. This isolates the UI interaction semantics (double click,
 * hover, editable text changes, style merging, and event handler construction)
 * so element renderers share one implementation. Canvas drag & drop lives in
 * useElementDragHandlers (applied by ElementItem).
 */

import React, { useCallback } from "react";
import { useInteractionSelectionState } from "@/features/editor";
import { useUpdateElement } from "@/features/editor";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import type { ResponsiveStyles } from "@/features/editor";

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

  /** Styles, contentEditable state and interaction handlers for an element's root node. */
  getCommonProps: (element: EditorElement) => Record<string, any>;

  // Permission / UI flags
  canDelete: boolean;
  canEdit: boolean;
  canDrag: boolean;
}

/**
 * useElementInteraction
 *
 * Selection, hover and contentEditable behavior shared by element renderers.
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
      if (
        selectedElement &&
        elementHelper.isEditableElement(selectedElement) &&
        (document.activeElement as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      setHoveredElement(element);
      e.stopPropagation();
    },
    [selectedElement, setHoveredElement],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent, element: EditorElement) => {
      // Don't clear hover while actively typing in a text element
      if (
        selectedElement &&
        elementHelper.isEditableElement(selectedElement) &&
        (document.activeElement as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Only clear if this element is the current hovered one.
      // When moving to a child, the child's mouseenter fires first and
      // updates hoveredElement, so this guard prevents the parent's
      // mouseleave from wiping it.
      if (hoveredElement?.id === element.id) {
        setHoveredElement(undefined);
      }
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

  const getCommonProps = useCallback(
    (element: EditorElement) => ({
      style: getStyles(element),
      draggable: canDrag,
      className: getTailwindStyles(element),
      contentEditable:
        elementHelper.isEditableElement(element) &&
        selectedElement?.id === element.id &&
        permissions.canEditElements,
      suppressContentEditableWarning: true,
      onDoubleClick: (e: React.MouseEvent) => handleDoubleClick(e, element),
      onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(e, element),
      onMouseLeave: (e: React.MouseEvent) => handleMouseLeave(e, element),
      onBlur: (e: React.FocusEvent) => handleTextChange(e, element),
    }),
    [
      canDrag,
      handleDoubleClick,
      handleMouseEnter,
      handleMouseLeave,
      handleTextChange,
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
    getCommonProps,
    canDelete,
    canEdit,
    canDrag,
  };
}

export default useElementInteraction;
