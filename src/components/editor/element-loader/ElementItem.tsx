import React from "react";
import { motion } from "framer-motion";
import type { EditorElement } from "@/types/global.type";
import ResizeHandler from "@/components/editor/resizehandler/ResizeHandler";
import EditorContextMenu from "@/components/editor/EditorContextMenu";
import ElementDropIndicator from "./ElementDropIndicator";
import { cn } from "@/lib/utils";
import { CollaboratorRole } from "@/interfaces/collaboration.interface";

interface ElementItemProps {
  element: EditorElement;
  data?: any;
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;

  // Render function for element body (keeps this file render-agnostic).
  renderElement: (element: EditorElement) => React.ReactNode;

  // Permissions & drag state / handlers coming from the hook or parent.
  canDrag: boolean;
  isDraggingLocal: string | null;
  draggingElement?: EditorElement | undefined;
  draggedOverElement?: EditorElement | undefined;

  handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
  handleDragEnd: () => void;
  handleHover: (e: React.DragEvent, element: EditorElement) => void;
  handleDrop: (e: React.DragEvent, element: EditorElement) => void;

  permissionsRole?: CollaboratorRole | null;
}

/**
 * Renders a single editor element with:
 * - ResizeHandler wrapper
 * - EditorContextMenu (unless viewer)
 * - Drag & drop markup (draggable + drop indicator)
 *
 * Kept small and focused to make the parent component (ElementLoader) concise
 * and to make the unit easier to test.
 */
function ElementItem({
  element,
  data,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
  renderElement,
  canDrag,
  isDraggingLocal,
  draggingElement,
  draggedOverElement,
  handleDragStart,
  handleDragEnd,
  handleHover,
  handleDrop,
  permissionsRole,
}: ElementItemProps) {
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
