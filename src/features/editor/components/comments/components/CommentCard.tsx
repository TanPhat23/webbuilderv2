"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import {
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ElementComment } from "@/features/comments";

interface CommentCardProps {
  comment: ElementComment;
  isEditing: boolean;
  editingText: string;
  isLoading: boolean;
  canEdit: boolean;
  onStartEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onEditTextChange: (text: string) => void;
  onDoubleClick?: () => void;
}

export function CommentCard({
  comment,
  isEditing,
  editingText,
  isLoading,
  canEdit,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onDoubleClick,
}: CommentCardProps) {
  const { user } = useUser();

  const authorName =
    comment.author?.firstName && comment.author?.lastName
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : comment.author?.email || "Unknown User";

  const authorInitial =
    comment.author?.firstName?.[0] ||
    comment.author?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
      onDoubleClick={onDoubleClick}
      className={cn(
        "bg-card rounded-lg p-3 space-y-2 border transition-all cursor-pointer",
        comment.resolved
          ? "border-accent bg-accent/50"
          : "border-border hover:border-primary hover:shadow-md",
      )}
    >
      {/* Comment header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar className="h-8 w-8 border-2 border-card shadow-sm">
            <AvatarImage src={comment.author?.imageUrl || undefined} />
            <AvatarFallback className="text-xs font-medium bg-linear-to-br from-primary to-accent text-primary-foreground">
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {authorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              comment.resolved
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-secondary text-secondary-foreground border-secondary",
            )}
          >
            {comment.resolved ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Resolved
              </>
            ) : (
              <>
                <Circle className="w-3 h-3 mr-1" />
                Active
              </>
            )}
          </Badge>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(comment.id, comment.content);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleResolved(comment.id);
                  }}
                >
                  {comment.resolved ? (
                    <>
                      <Circle className="h-3.5 w-3.5 mr-2" />
                      Mark as active
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                      Mark as resolved
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(comment.id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Comment content or edit form */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Textarea
            value={editingText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="min-h-20 text-sm resize-none border-border focus:border-primary"
            placeholder="Edit your comment..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdate(comment.id)}
              disabled={!editingText.trim() || isLoading}
            >
              Save changes
            </Button>
          </div>
        </motion.div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed pl-10">
          {comment.content}
        </p>
      )}
    </motion.div>
  );
}
