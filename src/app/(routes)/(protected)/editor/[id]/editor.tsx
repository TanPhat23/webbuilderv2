"use client";

import React, { useMemo } from "react";
import EditorHeader from "@/components/editor/editor/EditorHeader";
import PreviewContainer from "@/components/editor/editor/PreviewContainer";
import EditorCanvas from "@/components/editor/editor/EditorCanvas";
import CodeSplit from "@/components/editor/editor/CodeSplit";
import { useEditorContext } from "@/providers/editorprovider";

type EditorProps = {
  id: string;
  pageId: string;
};

/**
 * PreviewChild
 *
 * Extracted to module level so its component identity is stable across renders.
 * Previously this was defined inside `Editor`, causing React to unmount/remount
 * the entire iframe portal content on every parent re-render (because the
 * function reference changed, React treated it as a different component type).
 *
 * Receives `iframeRef` via `React.cloneElement` from `PreviewContainer`.
 * Reads all other data from context/hooks so it doesn't need closure variables.
 */
const PreviewChild = React.memo(function PreviewChild({
  iframeRef,
}: {
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}) {
  const { editor, editingMode } = useEditorContext();

  const {
    isDraggingOver,
    isLoading,
    selectedElement,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    addNewSection,
    isReadOnly,
    isLocked,
    userId,
  } = editor;

  const isCodeMode = editingMode === "code";
  const effectiveUserId = userId ?? "guest";

  return (
    <div className="h-full w-full transition-opacity duration-200 ease-in-out">
      <EditorCanvas
        isDraggingOver={isDraggingOver}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        isLoading={isLoading}
        selectedElement={selectedElement ?? null}
        addNewSection={addNewSection}
        userId={effectiveUserId}
        iframeRef={iframeRef}
        isReadOnly={isReadOnly || isCodeMode}
        isLocked={isLocked || isCodeMode}
        showAddSectionButton={!isCodeMode}
      />
    </div>
  );
});

PreviewChild.displayName = "PreviewChild";

export default function Editor({ id }: EditorProps) {
  const { editor, editingMode } = useEditorContext();

  const { currentView, setCurrentView, isLoading } = editor;

  const isCodeMode = editingMode === "code";

  // PreviewChild is a stable module-level component, so this element's type
  // never changes between renders — React will reconcile instead of remount.
  const previewContent = useMemo(
    () => (
      <PreviewContainer currentView={currentView} isLoading={isLoading}>
        <PreviewChild />
      </PreviewContainer>
    ),
    [currentView, isLoading],
  );

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-background text-foreground relative">
      <EditorHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        projectId={id}
      />
      {isCodeMode ? <CodeSplit canvas={previewContent} /> : previewContent}
    </div>
  );
}
