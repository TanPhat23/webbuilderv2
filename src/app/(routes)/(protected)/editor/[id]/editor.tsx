"use client";

import React from "react";
import EditorHeader from "@/components/editor/editor/EditorHeader";
import PreviewContainer from "@/components/editor/editor/PreviewContainer";
import EditorCanvas from "@/components/editor/editor/EditorCanvas";
import CodeSplit from "@/components/editor/editor/CodeSplit";
import { useEditorContext } from "@/providers/editorprovider";

type EditorProps = {
  id: string;
  pageId: string;
};

export default function Editor({ id }: EditorProps) {
  const { editor, userId, editingMode } = useEditorContext();

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

  const effectiveUserId = userId ?? "guest";

  const baseCanvasProps = {
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    isLoading,
    selectedElement: selectedElement ?? null,
    addNewSection,
    userId: effectiveUserId,
  } as const;

  const renderCanvas = (
    overrides?: Partial<React.ComponentProps<typeof EditorCanvas>>,
  ) => <EditorCanvas {...baseCanvasProps} {...overrides} />;

  const isCodeMode = editingMode === "code";

  function PreviewChild({
    iframeRef,
  }: {
    iframeRef?: React.RefObject<HTMLIFrameElement>;
  }) {
    return (
      <div className="h-full w-full transition-opacity duration-200 ease-in-out">
        {renderCanvas({
          iframeRef,
          isReadOnly: isReadOnly || isCodeMode,
          isLocked: isLocked || isCodeMode,
          showAddSectionButton: !isCodeMode,
        })}
      </div>
    );
  }

  const previewContent = (
    <PreviewContainer currentView={currentView} isLoading={isLoading}>
      <PreviewChild />
    </PreviewContainer>
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
