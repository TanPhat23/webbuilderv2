"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Eye, MousePointer } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useElementCommentStore } from "@/features/editor";
import { useSelectedElementWithSetter } from "@/features/editor";
import { useElementComments, useProjectComments } from "@/hooks";
import { useProjectStore } from "@/features/editor";
import { useCommentManager } from "@/features/comments";

import { CommentsPanelHeader } from "./components/CommentsPanelHeader";
import { CommentsListView } from "./components/CommentsListView";
import { CommentInput } from "./components/CommentInput";
import { COMMENTS_SCROLL_HEIGHT, COMMENTS_PANEL } from "@/features/comments";

/**
 * ElementCommentsPanel - Main component for displaying and managing comments
 * in the editor. Supports both single-element and project-wide comment views.
 */
export function ElementCommentsPanel() {
  const { user } = useUser();
  const { project } = useProjectStore();
  const { selectedElement, setSelectedElement } =
    useSelectedElementWithSetter();
  const {
    activeCommentElementId,
    isCommentsVisible,
    toggleCommentsVisibility,
    setActiveCommentElement,
  } = useElementCommentStore();

  const [newCommentText, setNewCommentText] = useState("");

  // Determine if we're showing single element or all comments
  const elementId = selectedElement?.id || activeCommentElementId;
  const showAllComments = !elementId;

  // Clear active comment element when selected element changes
  useEffect(() => {
    if (
      selectedElement &&
      activeCommentElementId &&
      activeCommentElementId !== selectedElement.id
    ) {
      setActiveCommentElement(undefined);
    }
  }, [selectedElement?.id, activeCommentElementId, setActiveCommentElement]);

  // Single element comments
  const {
    comments: singleElementComments,
    unresolvedCount: singleUnresolvedCount,
    isLoading: singleLoading,
    createComment,
    updateComment,
    deleteComment,
    toggleResolved,
  } = useElementComments({
    elementId: elementId || undefined,
    autoLoad: !showAllComments,
  });

  // All project comments
  const {
    commentsByElement,
    elementIds,
    totalComments,
    unresolvedCount: projectUnresolvedCount,
    isLoading: projectLoading,
  } = useProjectComments(showAllComments ? project?.id : undefined);

  const isLoading = showAllComments ? projectLoading : singleLoading;
  const unresolvedCount = showAllComments
    ? projectUnresolvedCount
    : singleUnresolvedCount;

  // Use comment manager hook for state and operations
  const {
    editingCommentId,
    editingText,
    viewMode,
    sortOrder,
    isEditing,
    processedComments,
    setViewMode,
    setSortOrder,
    setEditingText,
    startEditing,
    cancelEditing,
    handleUpdate,
    handleDelete,
    handleToggleResolved,
  } = useCommentManager({
    comments: showAllComments ? [] : singleElementComments,
    isLoading,
    onUpdate: updateComment,
    onDelete: deleteComment,
    onToggleResolved: toggleResolved,
  });

  const handleCreateComment = async () => {
    if (!newCommentText.trim()) return;

    const result = await createComment(newCommentText);
    if (result) {
      setNewCommentText("");
    }
  };

  const handleElementSelect = (id: string) => {
    setActiveCommentElement(id);
  };

  const handleClearSelection = () => {
    setActiveCommentElement(undefined);
    setSelectedElement(undefined);
  };

  // Hidden state - show floating button
  if (!isCommentsVisible) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={COMMENTS_PANEL.POSITION}
      >
        <Button
          size="icon"
          variant="outline"
          onClick={toggleCommentsVisibility}
          className="h-12 w-12 rounded-full shadow-xl hover:shadow-2xl transition-all bg-card border-border"
          title="Show comments"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </motion.div>
    );
  }

  // Visible panel
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <Card
        className={`${COMMENTS_PANEL.POSITION} ${COMMENTS_PANEL.WIDTH} shadow-2xl border-border`}
      >
        <CommentsPanelHeader
          title={showAllComments ? "All Comments" : "Comments"}
          description={
            showAllComments
              ? `${totalComments} comments across project`
              : "Collaborate on elements"
          }
          showAllComments={showAllComments}
          totalComments={totalComments}
          unresolvedCount={unresolvedCount}
          viewMode={viewMode}
          sortOrder={sortOrder}
          onViewModeChange={setViewMode}
          onSortOrderChange={setSortOrder}
          onClose={toggleCommentsVisibility}
          onClearSelection={handleClearSelection}
        />

        <CardContent className="space-y-4 p-4 pt-0">
          {/* Comments list */}
          <ScrollArea className={`${COMMENTS_SCROLL_HEIGHT} pr-3`}>
            <CommentsListView
              comments={showAllComments ? [] : processedComments}
              isLoading={isLoading}
              viewMode={viewMode}
              isEditing={isEditing}
              editingCommentId={editingCommentId}
              editingText={editingText}
              isAllComments={showAllComments}
              commentsByElement={commentsByElement}
              elementIds={elementIds}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleResolved={handleToggleResolved}
              onEditTextChange={setEditingText}
              onElementSelect={handleElementSelect}
              userId={user?.id}
            />
          </ScrollArea>

          {/* New comment input or select element message */}
          {!showAllComments ? (
            <CommentInput
              value={newCommentText}
              onChange={setNewCommentText}
              onSubmit={handleCreateComment}
              isLoading={isLoading}
              placeholder="Share your thoughts..."
            />
          ) : (
            <div className="text-center py-8 border-t border-border">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                <MousePointer />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Select an element
              </p>
              <p className="text-xs text-muted-foreground">
                Click on an element or focus button to add comments
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
