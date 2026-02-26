import React from "react";
import { motion } from "framer-motion";
import type { EditorElement } from "@/types/global.type";
import ResizeHandler from "@/features/editor/components/resizehandler/ResizeHandler";
import EditorContextMenu from "@/features/editor/components/EditorContextMenu";
import ElementDropIndicator from "./ElementDropIndicator";
import { cn } from "@/lib/utils";
import { CollaboratorRole } from "@/features/collaboration";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import { useDragContext } from "@/features/editor/components/context/DragContext";

interface ElementItemProps {
  element: EditorElement;
  data?: Record<string, unknown>;

  /** Render function for element body (keeps this file render-agnostic). */
  renderElement: (element: EditorElement) => React.ReactNode;
}

/**
 * Renders a single editor element with:
 * - ResizeHandler wrapper
 * - EditorContextMenu (unless viewer)
 * - Drag & drop markup (draggable + drop indicator)
 *
 * Editor flags (`isReadOnly`, `isLocked`, `permissionsRole`, `iframeRef`) and
 * drag state/handlers are consumed from context providers set up by
 * `ElementLoader`, eliminating the need for explicit prop drilling.
 *
 * @see {@link EditorFlagsProvider} — provides isReadOnly, isLocked, permissionsRole, iframeRef
 * @see {@link DragProvider} — provides canDrag, isDraggingLocal, draggingElement, draggedOverElement, handlers
 */
function ElementItem({ element, data, renderElement }: ElementItemProps) {
  const { isReadOnly, isLocked, permissionsRole, iframeRef } = useEditorFlags();
  const {
    canDrag,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleDragStart,
    handleDragEnd,
    handleHover,
    handleDrop,
  } = useDragContext();

  const isBeingDragged = isDraggingLocal === element.id;
  const isDropTarget = draggedOverElement?.id === element.id && !isBeingDragged;

  return (
    <motion.div
      className={cn(
        "relative",
        isBeingDragged && "opacity-50 z-50",
        isDropTarget && "ring-2 ring-blue-500 ring-offset-2 rounded-lg",
      )}
      draggable={canDrag}
      onDragStart={(e) =>
        handleDragStart(e as unknown as React.DragEvent, element)
      }
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleHover(e as React.DragEvent, element)}
      onDrop={(e) => handleDrop(e as React.DragEvent, element)}
      style={{ cursor: canDrag ? "grab" : "default" }}
    >
      <ResizeHandler
        element={element}
        isReadOnly={isReadOnly}
        isLocked={isLocked}
        iframeRef={iframeRef}
      >
        {permissionsRole === CollaboratorRole.VIEWER ? (
          renderElement(element)
        ) : (
          <EditorContextMenu
            element={element}
            isReadOnly={isReadOnly}
            isLocked={isLocked}
          >
            {renderElement(element)}
          </EditorContextMenu>
        )}

        <ElementDropIndicator
          isDropTarget={isDropTarget}
          draggingElement={draggingElement}
          onDragOver={(e) =>
            handleHover(e as unknown as React.DragEvent, element)
          }
          onDrop={(e) => handleDrop(e as unknown as React.DragEvent, element)}
        />
      </ResizeHandler>
    </motion.div>
  );
}

export default React.memo(ElementItem);
