import React from "react";
import type { EditorElement } from "@/types/global.type";
import ResizeHandler from "@/features/editor/components/resizehandler/ResizeHandler";
import EditorContextMenu from "@/features/editor/components/EditorContextMenu";
import ElementDropIndicator from "./ElementDropIndicator";
import ElementRenderer from "../ElementRenderer";
import { cn } from "@/lib/utils";
import { CollaboratorRole } from "@/features/collaboration";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import { useDragContext } from "@/features/editor/components/context/DragContext";

interface ElementItemProps {
  element: EditorElement;
  data?: Record<string, unknown>;
}

/**
 * Canvas wrapper for one element: drag source and drop target, resize
 * handles, and the context menu (omitted for viewers).
 */
function ElementItem({ element, data }: ElementItemProps) {
  const body = <ElementRenderer element={element} data={data} />;
  const { isReadOnly, isLocked, permissionsRole, iframeRef } = useEditorFlags();
  const {
    canDrag,
    draggingElement,
    draggedOverElement,
    handleDragStart,
    handleDragEnd,
    handleHover,
    handleDrop,
  } = useDragContext();

  const isBeingDragged = draggingElement?.id === element.id;
  const isDropTarget = draggedOverElement?.id === element.id && !isBeingDragged;

  const onDragOver = (e: React.DragEvent) => handleHover(e, element);
  const onDrop = (e: React.DragEvent) => handleDrop(e, element);

  return (
    // A plain div on purpose: framer-motion's motion.div treats onDragStart /
    // onDragEnd as its own gesture props and never attaches the native ones.
    <div
      className={cn(
        "relative",
        isBeingDragged && "opacity-50 z-50",
        isDropTarget && "ring-2 ring-blue-500 ring-offset-2 rounded-lg",
      )}
      draggable={canDrag}
      onDragStart={(e) => handleDragStart(e, element)}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ cursor: canDrag ? "grab" : "default" }}
    >
      <ResizeHandler
        element={element}
        isReadOnly={isReadOnly}
        isLocked={isLocked}
        iframeRef={iframeRef}
      >
        {permissionsRole === CollaboratorRole.VIEWER ? (
          body
        ) : (
          <EditorContextMenu
            element={element}
            isReadOnly={isReadOnly}
            isLocked={isLocked}
          >
            {body}
          </EditorContextMenu>
        )}

        <ElementDropIndicator
          isDropTarget={isDropTarget}
          draggingElement={draggingElement}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      </ResizeHandler>
    </div>
  );
}

export default React.memo(ElementItem);
