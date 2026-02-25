"use client";

import React, { useMemo } from "react";
import EditorHeader from "@/components/editor/editor/EditorHeader";
import PreviewContainer from "@/components/editor/editor/PreviewContainer";
import EditorCanvas from "@/components/editor/editor/EditorCanvas";
import CodeSplit from "@/components/editor/editor/CodeSplit";
import { useEditorContext } from "@/providers/editorprovider";

type EditorProps = {
  id: string;
};

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
      <div className="flex-1 min-h-0 overflow-hidden">
        {isCodeMode ? <CodeSplit canvas={previewContent} /> : previewContent}
      </div>
    </div>
  );
}
