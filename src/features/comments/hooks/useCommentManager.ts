"use client";

import { useState, useCallback } from "react";
import { ElementComment } from "@/features/comments";
import {
  processComments,
  getUnresolvedCount,
  ViewMode,
  SortOrder,
} from "@/features/comments/utils/comments";

interface UseCommentManagerProps {
  comments: ElementComment[];
  isLoading: boolean;
  onUpdate: (
    commentId: string,
    content: string,
  ) => Promise<ElementComment | null>;
  onDelete: (commentId: string) => Promise<boolean>;
  onToggleResolved: (commentId: string) => Promise<ElementComment | null>;
}

interface CommentManagerState {
  editingCommentId: string | null;
  editingText: string;
  viewMode: ViewMode;
  sortOrder: SortOrder;
}

export function useCommentManager({
  comments,
  isLoading,
  onUpdate,
  onDelete,
  onToggleResolved,
}: UseCommentManagerProps) {
  const [state, setState] = useState<CommentManagerState>({
    editingCommentId: null,
    editingText: "",
    viewMode: "all",
    sortOrder: "newest",
  });

  // Update view mode
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode }));
  }, []);

  // Update sort order
  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    setState((prev) => ({ ...prev, sortOrder }));
  }, []);

  // Start editing a comment
  const startEditing = useCallback((commentId: string, content: string) => {
    setState((prev) => ({
      ...prev,
      editingCommentId: commentId,
      editingText: content,
    }));
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editingCommentId: null,
      editingText: "",
    }));
  }, []);

  // Update editing text
  const setEditingText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      editingText: text,
    }));
  }, []);

  // Handle update with editing state reset
  const handleUpdate = useCallback(
    async (commentId: string) => {
      if (!state.editingText.trim()) return;

      try {
        const result = await onUpdate(commentId, state.editingText);
        if (result) {
          cancelEditing();
        }
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    },
    [state.editingText, onUpdate, cancelEditing],
  );

  // Handle delete with confirmation
  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
      }

      try {
        const result = await onDelete(commentId);
        if (!result) {
          console.error("Failed to delete comment");
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    },
    [onDelete],
  );

  // Handle toggle resolved
  const handleToggleResolved = useCallback(
    async (commentId: string) => {
      try {
        const result = await onToggleResolved(commentId);
        if (!result) {
          console.error("Failed to toggle comment resolved status");
        }
      } catch (error) {
        console.error("Failed to toggle comment resolved status:", error);
      }
    },
    [onToggleResolved],
  );

  // Get processed comments (filtered and sorted)
  const processedComments = processComments(
    comments,
    state.viewMode,
    state.sortOrder,
  );

  // Get unresolved count
  const unresolvedCount = getUnresolvedCount(comments);

  return {
    // State
    editingCommentId: state.editingCommentId,
    editingText: state.editingText,
    viewMode: state.viewMode,
    sortOrder: state.sortOrder,
    isEditing: state.editingCommentId !== null,

    // Processed data
    processedComments,
    unresolvedCount,

    // Setters
    setViewMode,
    setSortOrder,
    setEditingText,
    startEditing,
    cancelEditing,

    // Handlers
    handleUpdate,
    handleDelete,
    handleToggleResolved,
  };
}
