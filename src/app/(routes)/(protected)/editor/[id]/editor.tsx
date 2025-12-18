"use client";
import React, { useState, useEffect } from "react";
import EditorHeader from "@/components/editor/editor/EditorHeader";
import PreviewContainer from "@/components/editor/editor/PreviewContainer";
import EditorCanvas from "@/components/editor/editor/EditorCanvas";
import { useEditor } from "@/hooks";
import { useAuth } from "@clerk/nextjs";
import * as Y from "yjs";

type EditorProps = {
  id: string;
  pageId: string;
};

export default function Editor({ id, pageId }: EditorProps) {
  const { userId } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const effectiveUserId = userId || "guest";

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    collab,
  } = useEditor(id, pageId, {
    enableCollab: isMounted && !!effectiveUserId,
    userId: effectiveUserId,
  });

  // Extract Yjs-specific properties
  const ydoc = collab.ydoc as Y.Doc | null;
  const provider = collab.provider;

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-background text-foreground relative">
      <EditorHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        projectId={id}
        isConnected={collab.isConnected}
        isSynced={collab.isSynced}
        ydoc={ydoc}
        collabType={collab.type}
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
          ydoc={ydoc}
          provider={provider}
        />
      </PreviewContainer>
    </div>
  );
}
