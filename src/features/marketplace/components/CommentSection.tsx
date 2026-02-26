"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Heart, 
  ThumbsUp, 
  Smile,
  Edit,
  Trash2,
  Reply,
  MoreVertical,
  Flag,
  Loader2
} from "lucide-react";
import { Comment } from "@/features/comments";
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useCreateReaction,
  useDeleteReaction,
} from "@/features/comments";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@clerk/nextjs";

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const createReaction = useCreateReaction();
  const deleteReaction = useDeleteReaction();

  const isAuthor = userId === comment.authorId;
  const userHasLiked = comment.reactions?.some(
    (r) => r.userId === userId && r.type === "like"
  );

  const likeCount = comment.reactions?.filter((r) => r.type === "like").length || 0;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    await updateComment.mutateAsync({
      commentId: comment.id,
      data: { content: editContent.trim() },
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync(comment.id);
    }
  };

  const handleReaction = async (type: string) => {
    const hasReacted = comment.reactions?.some(
      (r) => r.userId === userId && r.type === type
    );

    if (hasReacted) {
      await deleteReaction.mutateAsync({ commentId: comment.id, reactionType: type });
    } else {
      await createReaction.mutateAsync({ commentId: comment.id, data: { type } });
    }
  };

  const getAuthorInitials = () => {
    const firstName = comment.author?.firstName || "";
    const lastName = comment.author?.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return comment.author?.email?.[0]?.toUpperCase() || "U";
  };

  const getAuthorName = () => {
    const firstName = comment.author?.firstName || "";
    const lastName = comment.author?.lastName || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return comment.author?.email || "Anonymous";
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={comment.author?.imageUrl || undefined} />
        <AvatarFallback className="text-xs">{getAuthorInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{getAuthorName()}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.edited && (
              <Badge variant="outline" className="text-xs py-0 px-1.5">
                Edited
              </Badge>
            )}
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-20"
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={updateComment.isPending || !editContent.trim()}
              >
                {updateComment.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateComment.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            <div className="flex items-center gap-4 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 gap-1.5",
                  userHasLiked && "text-red-500 hover:text-red-600"
                )}
                onClick={() => handleReaction("like")}
              >
                <Heart className={cn("h-4 w-4", userHasLiked && "fill-current")} />
                {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4" />
                <span className="text-xs">Reply</span>
              </Button>

              {!isAuthor && (
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5">
                  <Flag className="h-4 w-4" />
                  <span className="text-xs">Report</span>
                </Button>
              )}
            </div>

            {showReplyForm && (
              <div className="pt-3">
                <CommentForm
                  itemId={comment.itemId}
                  parentId={comment.id}
                  onSuccess={() => setShowReplyForm(false)}
                  placeholder="Write a reply..."
                  submitLabel="Reply"
                  autoFocus
                />
              </div>
            )}
          </>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 pt-4 pl-4 border-l-2 border-border/50">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentFormProps {
  itemId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
}

function CommentForm({
  itemId,
  parentId,
  onSuccess,
  placeholder = "Write a comment...",
  submitLabel = "Post Comment",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createComment.mutateAsync({
      content: content.trim(),
      itemId,
      parentId: parentId || null,
    });

    setContent("");
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-none"
        autoFocus={autoFocus}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createComment.isPending || !content.trim()}
          size="sm"
        >
          {createComment.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface CommentSectionProps {
  itemId: string;
}

export function CommentSection({ itemId }: CommentSectionProps) {
  const { data: commentsData, isLoading } = useCommentsByItem(itemId, {
    status: "published",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { userId } = useAuth();

  const comments = commentsData?.data || [];
  const totalComments = commentsData?.total || 0;

  return (
    <Card className="border border-border/40 bg-card/40 backdrop-blur-sm">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Comments</h3>
              <p className="text-sm text-muted-foreground">
                {totalComments} {totalComments === 1 ? "comment" : "comments"}
              </p>
            </div>
          </div>
        </div>

        {userId && (
          <div>
            <CommentForm itemId={itemId} />
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Import the hook
import { useCommentsByItem } from "@/features/comments";
