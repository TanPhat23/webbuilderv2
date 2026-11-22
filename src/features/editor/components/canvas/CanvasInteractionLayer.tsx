import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CollaboratorRole } from "@/types/collaboration";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import EditorContextMenu from "@/features/editor/components/EditorContextMenu";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import { CanvasOverlay } from "./CanvasOverlay";
import {
  elementNodeFrom,
  isTypingInCanvas,
  setCanvasSelection,
} from "./canvasDom";
import { useCanvasPickMode } from "./useCanvasPickMode";
import { useCanvasDragDrop } from "./useCanvasDragDrop";

const CANVAS_CSS = `
[data-canvas-root] [draggable="true"] { cursor: grab; }
[data-canvas-root] [data-component-instance] iframe { pointer-events: none; }
[data-canvas-root] [data-dragging="true"] { opacity: 0.5; }
[data-canvas-root][data-picking] *, [data-canvas-root][data-picking] { cursor: crosshair !important; }
`;

export function CanvasInteractionLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canEdit, canCreate, isReadOnly, isLocked, permissionsRole } =
    useEditorFlags();
  const queryClient = useQueryClient();
  const { projectId, userId } = useEditorContext();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const draggingId = useSelectionStore((s) => s.draggingElementId);

  const { picking, blockPickPointer, onClickCapture, onDoubleClickCapture } =
    useCanvasPickMode(root);
  const { drop, resetDrag, onDragStart, onDragOver, onDragLeave, onDrop } =
    useCanvasDragDrop({
      root,
      canEdit,
      canCreate,
      queryClient,
      projectId,
      userId,
    });

  const onMouseOver = (event: React.MouseEvent): void => {
    if (isTypingInCanvas(root)) return;
    const id = elementNodeFrom(root, event.target)?.dataset.elementId;
    if (useSelectionStore.getState().hoveredElementId !== id) {
      setCanvasSelection({ hoveredElementId: id });
    }
  };

  const onMouseLeave = (): void => {
    if (isTypingInCanvas(root)) return;
    setCanvasSelection({ hoveredElementId: undefined });
  };

  const onDoubleClick = (event: React.MouseEvent): void => {
    const id = elementNodeFrom(root, event.target)?.dataset.elementId;
    if (!id) return;
    event.preventDefault();
    if (!canEdit) {
      showErrorToast(PERMISSION_ERRORS.cannotEdit);
      return;
    }
    const isSelected = useSelectionStore.getState().selectedElementId === id;
    setCanvasSelection({ selectedElementId: isSelected ? undefined : id });
  };

  const onContextMenu = (event: React.MouseEvent): void => {
    const shared = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-shared-section-id]",
    );
    const id =
      shared?.dataset.sharedSectionId ??
      elementNodeFrom(root, event.target)?.dataset.elementId;
    if (!id) {
      event.preventDefault();
      return;
    }
    setCanvasSelection({ selectedElementId: id });
  };

  const layer = (
    <div
      ref={setRoot}
      data-canvas-root
      data-picking={picking || undefined}
      className="relative"
      onMouseDownCapture={blockPickPointer}
      onMouseUpCapture={blockPickPointer}
      onClickCapture={onClickCapture}
      onDoubleClickCapture={onDoubleClickCapture}
      onContextMenuCapture={blockPickPointer}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={resetDrag}
    >
      <style>{CANVAS_CSS}</style>
      {children}
      <CanvasOverlay
        root={root}
        drop={drop}
        isDragging={!!draggingId || drop !== null}
      />
    </div>
  );

  if (permissionsRole === CollaboratorRole.VIEWER) return layer;
  return (
    <EditorContextMenu isReadOnly={isReadOnly} isLocked={isLocked}>
      {layer}
    </EditorContextMenu>
  );
}
