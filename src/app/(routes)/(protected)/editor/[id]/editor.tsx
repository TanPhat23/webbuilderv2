"use client";
import React from "react";
import EditorHeader from "@/components/editor/editor/EditorHeader";
import PreviewContainer from "@/components/editor/editor/PreviewContainer";
import EditorCanvas from "@/components/editor/editor/EditorCanvas";
import { useEditorContext } from "@/providers/editorprovider";
import { useCollaboration } from "@/providers/collaborationprovider";

type EditorProps = {
  id: string;
  pageId: string;
};

export default function Editor({ id }: EditorProps) {
  const { editor, userId } = useEditorContext();
  const collab = useCollaboration();

  const {
    currentView,
    setCurrentView,
    isDraggingOver,
    isLoading,
    selectedElement,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    addNewSection,
    isReadOnly,
    isLocked,
  } = editor;

  const effectiveUserId = userId || "guest";

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-background text-foreground relative">
      <EditorHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        projectId={id}
      />
      <PreviewContainer currentView={currentView} isLoading={isLoading}>
        <EditorCanvas
          isDraggingOver={isDraggingOver}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          isLoading={isLoading}
          selectedElement={selectedElement || null}
          addNewSection={addNewSection}
          userId={effectiveUserId}
          isReadOnly={isReadOnly}
          isLocked={isLocked}
        />
      </PreviewContainer>
    </div>
  );
}
