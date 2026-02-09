import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import { cn } from "@/lib/utils";
import { EditorElement } from "@/types/global.type";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorPermissions } from "./useEditorPermissions";
import { useElementCreator } from "./useElementCreator";
import { toast } from "sonner";

export function useElementHandler(isReadOnly?: boolean, isLocked?: boolean) {
  const { updateElement, swapElement } = useElementStore();
  const {
    hoveredElement,
    selectedElement,
    setSelectedElement,
    setDraggingElement,
    draggingElement,
    draggedOverElement,
    setDraggedOverElement,
    setHoveredElement,
  } = useSelectionStore();

  const permissions = useEditorPermissions(null);
  const elementCreator = useElementCreator();

  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;
  const canDelete = !isReadOnly && !isLocked && permissions.canDeleteElements;
  const canReorder = !isReadOnly && !isLocked && permissions.canReorderElements;

  const handleDoubleClick = (e: React.MouseEvent, element: EditorElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!permissions.canEditElements) {
      toast.error("Cannot edit elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    if (selectedElement && selectedElement.id === element.id) {
      setSelectedElement(undefined);
      return;
    }

    setSelectedElement(element);
  };

  const handleDrop = (e: React.DragEvent, parentElement: EditorElement) => {
    e.stopPropagation();
    e.preventDefault();

    // Prevent drop if read-only, locked, or no permission
    if (!canDrag && !elementCreator.canCreate && !canReorder) {
      toast.error("Cannot perform this action - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    setSelectedElement(undefined);

    if (draggingElement) {
      // Moving existing element
      if (!canReorder) {
        toast.error("Cannot reorder elements - editor is in read-only mode", {
          duration: 2000,
        });
        return;
      }

      swapElement(draggingElement.id, parentElement.id);
      setDraggedOverElement(undefined);
    } else {
      const newElement = elementCreator.createElementFromDrop(e, parentElement);
      if (newElement) {
        elementCreator.completeElementCreation(newElement);
      }
    }

    setHoveredElement(undefined);
    setDraggingElement(undefined);
  };

  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    e.stopPropagation();

    if (!canDrag) {
      e.preventDefault();
      return;
    }

    setDraggingElement(element);
  };

  const handleDragOver = (e: React.DragEvent, element: EditorElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDrag) {
      return;
    }

    if (
      draggingElement?.id === element.id ||
      draggingElement?.parentId === element.id
    )
      return;
    if (!elementHelper.isContainerElement(element)) return;
    setDraggedOverElement(element);
  };

  const handleDragLeave = (e: React.DragEvent, element: EditorElement) => {
    e.stopPropagation();
    if (draggedOverElement?.id === element.id) {
      setDraggedOverElement(undefined);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggingElement(undefined);
    setDraggedOverElement(undefined);
  };

  const getTailwindStyles = (element: EditorElement) => {
    return cn("", element.tailwindStyles);
  };

  const handleMouseEnter = (e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      document.activeElement &&
      (document.activeElement as HTMLElement).contentEditable === "true"
    ) {
      return;
    }

    if (selectedElement && elementHelper.isEditableElement(selectedElement)) {
      return;
    }

    if (selectedElement && selectedElement.id !== element.id) {
      return;
    }

    setHoveredElement(element);
  };

  const handleMouseLeave = (e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation();

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
  };

  const handleTextChange = (e: React.FocusEvent, element: EditorElement) => {
    e.stopPropagation();
    e.preventDefault();

    if (!elementHelper.isEditableElement(element)) {
      return;
    }

    if (!permissions.canEditElements) {
      toast.error("Cannot edit elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    updateElement(element.id, {
      content: e.currentTarget.textContent || "",
    });
  };

  const getStyles = (element: EditorElement): React.CSSProperties => {
    if (
      !element.styles ||
      typeof element.styles !== "object" ||
      Array.isArray(element.styles)
    ) {
      return {};
    }
    const merged: React.CSSProperties = {};
    const styles = element.styles;
    const breakpoints: (keyof typeof styles)[] = [
      "default",
      "sm",
      "md",
      "lg",
      "xl",
    ];
    breakpoints.forEach((bp) => {
      if (styles[bp]) {
        Object.assign(merged, styles[bp]);
      }
    });
    return merged;
  };

  const getEventHandlers = (element: EditorElement) => {
    const isEditableElement = elementHelper.isEditableElement(element);

    return {
      onDragStart: (e: React.DragEvent) => handleDragStart(e, element),
      onDragLeave: (e: React.DragEvent) => handleDragLeave(e, element),
      onDragEnd: (e: React.DragEvent) => handleDragEnd(e),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, element),
      onDrop: isEditableElement
        ? undefined
        : (e: React.DragEvent) => handleDrop(e, element),
      onDoubleClick: (e: React.MouseEvent) => handleDoubleClick(e, element),
      onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(e, element),
      onMouseLeave: (e: React.MouseEvent) => handleMouseLeave(e, element),
      onBlur: (e: React.FocusEvent) => handleTextChange(e, element),
    };
  };

  const getCommonProps = (element: EditorElement) => {
    const tailwindStyles = getTailwindStyles(element);
    const mergedStyles = getStyles(element);
    const eventHandlers = getEventHandlers(element);

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
  };

  return {
    handleDoubleClick,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleMouseEnter,
    handleMouseLeave,
    getTailwindStyles,
    getCommonProps,
    getStyles,
    // Export permission states for UI purposes
    canDrag,
    canDelete,
    canReorder,
    canCreate: elementCreator.canCreate,
  };
}
