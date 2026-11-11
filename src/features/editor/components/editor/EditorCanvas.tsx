import React, { useEffect, useRef, useState, memo } from "react";
import { EditorElement } from "@/types/global.type";
import ElementLoader from "@/features/editor/components/ElementLoader";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useEditorShortcuts } from "@/features/editor/hooks/useEditorShortcuts";
import RemoteCursorsOverlay from "@/features/editor/components/editor/RemoteCursorsOverlay";
import AddSectionDivider from "@/features/editor/components/editor/AddSectionDivider";

type EditorCanvasProps = {
  isDraggingOver: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  selectedElement: EditorElement | null;
  addNewSection: () => void;
  userId: string;
  isReadOnly?: boolean;
  isLocked?: boolean;
  showAddSectionButton?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
};

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  isDraggingOver,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isLoading,
  selectedElement,
  addNewSection,
  userId,
  isReadOnly = false,
  isLocked = false,
  showAddSectionButton = true,
  iframeRef,
}) => {
  const collab = useCollaborationOptional();

  const canvasRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  // Keyboard shortcut management extracted to hook
  useEditorShortcuts({
    canvasRef,
    iframeRef,
    isReadOnly,
    isLocked,
  });

  // Assign the canvas ref to the collaboration provider for mouse tracking
  useEffect(() => {
    if (collab && canvasRef.current) {
      (collab.canvasRef as React.RefObject<HTMLElement | null>).current =
        canvasRef.current;
    }
  }, [collab]);

  // Keep scroll offsets synced for collaborative cursors
  useEffect(() => {
    const container = innerContentRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollOffset({
        x: container.scrollLeft,
        y: container.scrollTop,
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className={`h-full relative flex flex-col bg-background ${
        isDraggingOver ? "bg-primary/10" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      id="canvas"
      tabIndex={0}
    >
      <RemoteCursorsOverlay userId={userId} scrollOffset={scrollOffset} />

      <div
        ref={innerContentRef}
        className="overflow-y-auto overflow-x-hidden flex-1 w-full scrollbar-hide p-4"
      >
        {isLoading ? null : (
          <ElementLoader
            isReadOnly={isReadOnly}
            isLocked={isLocked}
            iframeRef={iframeRef}
          />
        )}
      </div>

      {!selectedElement && showAddSectionButton && (
        <AddSectionDivider
          onAddSection={addNewSection}
          disabled={isReadOnly || isLocked}
        />
      )}
    </div>
  );
};

export default memo(EditorCanvas);
