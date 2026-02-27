"use client";

import React from "react";
import { MessageSquare, Layers } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { ElementComment } from "@/features/comments";
import { CommentCard } from "./CommentCard";
import { ElementCommentGroup } from "./ElementCommentGroup";
import { EmptyState } from "./EmptyState";
import {
  getEmptyStateMessage,
  ViewMode,
} from "@/features/comments/utils/comments";

interface CommentsListViewProps {
  comments: ElementComment[];
  isLoading: boolean;
  viewMode: ViewMode;
  isEditing: boolean;
  editingCommentId: string | null;
  editingText: string;
  isAllComments: boolean;
  commentsByElement?: Record<string, ElementComment[]>;
  elementIds?: string[];
  onStartEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onEditTextChange: (text: string) => void;
  onElementSelect: (elementId: string) => void;
  userId?: string;
}

export function CommentsListView({
  comments,
  isLoading,
  viewMode,
  isEditing,
  editingCommentId,
  editingText,
  isAllComments,
  commentsByElement = {},
  elementIds = [],
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onElementSelect,
  userId,
}: CommentsListViewProps) {
  const emptyMessage = getEmptyStateMessage(viewMode);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Spinner className="h-8 w-8 mb-2" />
        <p className="text-sm">Loading comments...</p>
      </div>
    );
  }

  if (isAllComments) {
    if (elementIds.length === 0) {
      return (
        <EmptyState
          title={emptyMessage.title}
          description={emptyMessage.description}
          icon="message"
        />
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Layers className="h-3.5 w-3.5" />
          <span>Double-click any comment to focus on its element</span>
        </div>
        <AnimatePresence mode="popLayout">
          {elementIds.map((elementId: string) => (
            <ElementCommentGroup
              key={elementId}
              elementId={elementId}
              comments={commentsByElement[elementId] || []}
              isEditing={isEditing}
              editingCommentId={editingCommentId}
              editingText={editingText}
              isLoading={isLoading}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleResolved={onToggleResolved}
              onEditTextChange={onEditTextChange}
              onElementSelect={onElementSelect}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Single element comments
  if (comments.length === 0) {
    return (
      <EmptyState
        title={emptyMessage.title}
        description={emptyMessage.description}
        icon="message"
      />
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isEditing={isEditing && editingCommentId === comment.id}
            editingText={editingText}
            isLoading={isLoading}
            canEdit={userId === comment.authorId}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleResolved={onToggleResolved}
            onEditTextChange={onEditTextChange}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
