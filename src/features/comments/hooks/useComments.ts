"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/features/comments";
import {
  Comment,
  CommentFilter,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateReactionRequest,
} from "@/features/comments";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  showErrorToast,
  showSuccessToast,
} from "@/utils/errors/errorToast";
import { onMutationError } from "@/hooks/utils/mutationUtils";

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (filters?: CommentFilter) =>
    [...commentKeys.lists(), { filters }] as const,
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (id: string) => [...commentKeys.details(), id] as const,
  byItem: (itemId: string) => [...commentKeys.all, "byItem", itemId] as const,
  count: (itemId: string) => [...commentKeys.all, "count", itemId] as const,
  reactions: (commentId: string) =>
    [...commentKeys.all, "reactions", commentId] as const,
  reactionSummary: (commentId: string) =>
    [...commentKeys.all, "reactionSummary", commentId] as const,
};

/** Hook to get comments with optional filters. */
export function useComments(filter?: CommentFilter) {
  return useQuery({
    queryKey: commentKeys.list(filter),
    queryFn: () => commentService.getComments(filter),
    ...QUERY_CONFIG.SHORT,
  });
}

/** Hook to get a single comment by ID. */
export function useComment(commentId: string) {
  return useQuery({
    queryKey: commentKeys.detail(commentId),
    queryFn: () => commentService.getCommentById(commentId),
    enabled: !!commentId,
  });
}

/** Hook to get comments by marketplace item ID. */
export function useCommentsByItem(
  itemId: string,
  filter?: Omit<CommentFilter, "itemId">,
) {
  return useQuery({
    queryKey: commentKeys.byItem(itemId),
    queryFn: () => commentService.getCommentsByItemId(itemId, filter),
    enabled: !!itemId,
    ...QUERY_CONFIG.SHORT,
  });
}

/** Hook to get comment count for an item. */
export function useCommentCount(itemId: string) {
  return useQuery({
    queryKey: commentKeys.count(itemId),
    queryFn: () => commentService.getCommentCount(itemId),
    enabled: !!itemId,
    ...QUERY_CONFIG.DEFAULT,
  });
}

/** Hook to create a comment. */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      commentService.createComment(data),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byItem(newComment.itemId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.count(newComment.itemId),
      });
      showSuccessToast("Comment posted successfully!");
    },
    onError: onMutationError("Failed to post comment"),
  });
}

/** Hook to update a comment. */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequest;
    }) => commentService.updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        commentKeys.detail(updatedComment.id),
        updatedComment,
      );
      queryClient.invalidateQueries({
        queryKey: commentKeys.byItem(updatedComment.itemId),
      });
      showSuccessToast("Comment updated successfully!");
    },
    onError: onMutationError("Failed to update comment"),
  });
}

/** Hook to delete a comment. */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.removeQueries({ queryKey: commentKeys.detail(commentId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
      showSuccessToast("Comment deleted successfully!");
    },
    onError: onMutationError("Failed to delete comment"),
  });
}

/** Hook to create a reaction on a comment. */
export function useCreateReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: CreateReactionRequest;
    }) => commentService.createReaction(commentId, data),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactions(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactionSummary(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
    },
    onError: onMutationError("Failed to add reaction"),
  });
}

/** Hook to delete a reaction from a comment. */
export function useDeleteReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      reactionType,
    }: {
      commentId: string;
      reactionType: string;
    }) => commentService.deleteReaction(commentId, reactionType),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactions(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.reactionSummary(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
    },
    onError: onMutationError("Failed to remove reaction"),
  });
}

/** Hook to get reactions for a comment. */
export function useReactions(commentId: string) {
  return useQuery({
    queryKey: commentKeys.reactions(commentId),
    queryFn: () => commentService.getReactions(commentId),
    enabled: !!commentId,
  });
}

/** Hook to get reaction summary for a comment. */
export function useReactionSummary(commentId: string) {
  return useQuery({
    queryKey: commentKeys.reactionSummary(commentId),
    queryFn: () => commentService.getReactionSummary(commentId),
    enabled: !!commentId,
  });
}
