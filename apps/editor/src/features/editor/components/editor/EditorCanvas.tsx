import React, { useEffect, useRef, memo } from "react";
import { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import ElementLoader from "@/features/editor/components/ElementLoader";
import { useCollaborationOptional } from "@/features/collaboration/context/CollaborationContext";
import { useEditorShortcuts } from "@/features/editor/hooks/useEditorShortcuts";
import AddSectionDivider from "@/features/editor/components/editor/AddSectionDivider";
import EmptyPageStarter from "@/features/editor/components/editor/EmptyPageStarter";
import { useElementStore } from "@/features/editor/store/element-store";
import { useElements } from "@/features/editor";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useForwardChromeShortcuts } from "@/features/editor/components/layout/useForwardChromeShortcuts";
import { useDynamicPagePreview } from "@/features/editor/hooks/useDynamicPagePreview";

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
  isReadOnly = false,
  isLocked = false,
  showAddSectionButton = true,
  iframeRef,
}) => {
  const collab = useCollaborationOptional();
  const { editor, renderAgentPlaybackHud } = useEditorContext();
  const { previewData } = useDynamicPagePreview();
  const elements = useElements();
  const isMaster = useElementStore((state) => state.isComponentPage);
  // Elements arrive over the collab socket after the REST queries finish, so
  // the page is only known to be empty once it has synced.
  const isSynced = collab ? collab.isSynced : true;
  const isEmpty = !isLoading && isSynced && elements.length === 0;
  const canInsert =
    !isReadOnly && !isLocked && editor.permissions.canCreateElements;

  useForwardChromeShortcuts(iframeRef);

  const canvasRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut management extracted to hook
  useEditorShortcuts({
    canvasRef,
    iframeRef,
    isReadOnly,
    isLocked,
  });

  useEffect(() => {
    if (!collab) return;
    collab.setCanvasElement?.(canvasRef.current);
    return () => {
      collab.setCanvasElement?.(null);
    };
  }, [collab]);

  return (
    <div
      ref={canvasRef}
      className={`h-full relative flex flex-col bg-background ${
        isDraggingOver ? "bg-primary/10" : ""
      }`}
      onDrop={handleDrop}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      id="canvas"
      tabIndex={0}
    >
      <div
        ref={innerContentRef}
        className="overflow-y-auto overflow-x-hidden flex-1 w-full scrollbar-hide p-4"
      >
        {isLoading ? null : isEmpty && canInsert && showAddSectionButton ? (
          <EmptyPageStarter onAddSection={addNewSection} />
        ) : (
          <ElementLoader
            data={previewData}
            isReadOnly={isReadOnly}
            isLocked={isLocked}
            iframeRef={iframeRef}
          />
        )}
      </div>

      {!selectedElement && !isEmpty && !isMaster && showAddSectionButton && (
        <AddSectionDivider
          onAddSection={addNewSection}
          disabled={isReadOnly || isLocked}
        />
      )}

      {renderAgentPlaybackHud?.()}
    </div>
  );
};

export default memo(EditorCanvas);
