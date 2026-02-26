"use client";

import { useUpdateElement } from "@/features/editor";
import { useDragAndSelectionState } from "@/features/editor";
import { useElementHandler } from "@/hooks";
import { useResizeHandler } from "@/hooks";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import type React from "react";
import { type ReactNode, useRef, useState } from "react";
import { type ResizeDirection, getResizeHandles } from "@/features/editor";
import { useElementCommentStore } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { ElementCommentButton } from "@/features/editor/components/comments/ElementCommentButton";
import { useAltKey } from "@/features/editor/hooks/useAltKey";
import { ResizeHandle, STANDARD_DIRECTIONS } from "./ResizeHandle";
import { SpacingOverlay } from "./SpacingOverlay";
import { ElementLabel } from "./ElementLabel";
import { ResizeContext } from "./ResizeContext";

interface ResizeHandlerProps {
  element: EditorElement;
  children: ReactNode;
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

const FLEX_DISPLAYS = new Set(["flex", "grid", "inline-flex", "inline-grid"]);

const SPACING_HANDLES: ResizeDirection[] = [
  "margin-n",
  "margin-s",
  "margin-e",
  "margin-w",
  "padding-n",
  "padding-s",
  "padding-e",
  "padding-w",
];

function getVisibleHandles(
  element: EditorElement,
  isSelected: boolean,
  canResize: boolean,
  isResizing: boolean,
  currentResizeDirection: ResizeDirection | null,
  showSpacingHandles: boolean,
): ResizeDirection[] {
  if (!isSelected || !canResize) return [];

  if (isResizing && currentResizeDirection) return [currentResizeDirection];

  if (showSpacingHandles) {
    const handles = [...SPACING_HANDLES];
    if (FLEX_DISPLAYS.has(element.styles?.default?.display ?? "")) {
      handles.push("gap");
    }
    return handles;
  }

  return getResizeHandles(element.styles?.default).filter((h) =>
    STANDARD_DIRECTIONS.has(h),
  );
}

export default function ResizeHandler({
  element,
  children,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}: ResizeHandlerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const updateElement = useUpdateElement();
  const { draggedOverElement, selectedElement, hoveredElement } =
    useDragAndSelectionState();
  const { handleDoubleClick } = useElementHandler();
  const permissions = useEditorPermissions();
  const canResize = !isReadOnly && !isLocked && permissions.canEditElements;

  const {
    handleResizeStart,
    isResizing,
    currentResizeDirection,
    pendingStylesRef,
  } = useResizeHandler({
    element,
    updateElement,
    targetRef,
    enabled: canResize,
  });

  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const { showCommentButtons } = useElementCommentStore();
  const altKeyPressed = useAltKey(iframeRef);
  const showSpacingHandles = manualSpacingMode || altKeyPressed;

  const isSelected = selectedElement?.id === element.id;
  const isHovered =
    hoveredElement?.id === element.id &&
    draggedOverElement?.id !== element.id &&
    !isSelected;
  const isDraggedOver = draggedOverElement?.id === element.id && !isSelected;

  const visibleHandles = getVisibleHandles(
    element,
    isSelected,
    canResize,
    isResizing,
    currentResizeDirection,
    showSpacingHandles,
  );

  return (
    <ResizeContext value={{ pendingStylesRef }}>
      <div
        ref={targetRef}
        className="relative group"
        style={{
          width: element.styles?.default?.width ?? "auto",
          height: element.styles?.default?.height ?? "auto",
        }}
        id={element.id}
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleDoubleClick(e, element);
        }}
      >
        {isSelected && (
          <ElementLabel
            element={element}
            showSpacingInfo={showSpacingHandles}
            onToggleSpacing={() => setManualSpacingMode((prev) => !prev)}
          />
        )}

        {isSelected && showCommentButtons && (
          <ElementCommentButton element={element} />
        )}

        {children}

        {isSelected && (
          <SpacingOverlay element={element} show={showSpacingHandles} />
        )}

        {visibleHandles.map((dir) => (
          <ResizeHandle
            key={dir}
            direction={dir}
            onResizeStart={handleResizeStart}
            element={element}
            isResizing={isResizing}
            currentResizeDirection={currentResizeDirection}
          />
        ))}

        {isSelected && !showSpacingHandles && (
          <div className="absolute inset-0 pointer-events-none rounded-sm transition-all duration-200 border-2 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]" />
        )}

        {isHovered && (
          <div className="pointer-events-none absolute inset-0 border-2 border-blue-400/50 z-20 rounded-sm transition-colors duration-100" />
        )}

        {isDraggedOver && (
          <div
            className="pointer-events-none absolute inset-0 border-2 border-dashed border-green-600 z-20 rounded-sm bg-green-500/5"
            style={{ boxShadow: "0 0 0 1px rgba(22, 163, 74, 0.1)" }}
          />
        )}
      </div>
    </ResizeContext>
  );
}
