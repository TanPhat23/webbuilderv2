"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { elementCommentService } from "@/services/elementcomment";
import {
  ElementComment,
  CreateElementCommentRequest,
  UpdateElementCommentRequest,
} from "@/interfaces/elementcomment.interface";
import { useUser } from "@clerk/nextjs";
import { useProjectStore } from "@/globalstore/project-store";
import { toast } from "sonner";

export const elementCommentKeys = {
  all: ["element-comments"] as const,
  lists: () => [...elementCommentKeys.all, "list"] as const,
  list: (elementId: string) =>
    [...elementCommentKeys.lists(), elementId] as const,
  projectList: (projectId: string) =>
    [...elementCommentKeys.all, "project", projectId] as const,
  details: () => [...elementCommentKeys.all, "detail"] as const,
  detail: (id: string) => [...elementCommentKeys.details(), id] as const,
  byAuthor: (authorId: string) =>
    [...elementCommentKeys.all, "byAuthor", authorId] as const,
};

interface UseElementCommentsOptions {
  elementId?: string;
  autoLoad?: boolean;
}

interface UseElementCommentsReturn {
  comments: ElementComment[];
  unresolvedCount: number;
  isLoading: boolean;
  error: Error | null;

  // Actions
  createComment: (content: string) => Promise<ElementComment | null>;
  updateComment: (
    commentId: string,
    content: string,
  ) => Promise<ElementComment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  toggleResolved: (commentId: string) => Promise<ElementComment | null>;
  refreshComments: () => Promise<void>;

  // Permissions
  canEditComment: (comment: ElementComment) => boolean;
  canDeleteComment: (comment: ElementComment) => boolean;
}

// Get comments for an element
export function useElementComments(
  options: UseElementCommentsOptions = {},
): UseElementCommentsReturn {
  const { elementId, autoLoad = true } = options;
  const { user } = useUser();
  const { project } = useProjectStore();
  const queryClient = useQueryClient();

  // Query for fetching comments
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: elementCommentKeys.list(elementId || ""),
    queryFn: () => elementCommentService.getElementComments(elementId || ""),
    enabled: autoLoad && !!elementId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const comments = commentsData?.data || [];
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!elementId || !project?.id || !content.trim()) {
        throw new Error("Missing required data");
      }

      const request: CreateElementCommentRequest = {
        elementId,
        content: content.trim(),
        projectId: project.id,
      };

      return elementCommentService.createElementComment(request);
    },
    onSuccess: (newComment) => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId!),
      });
      toast.success("Comment posted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to post comment: ${error.message}`);
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      elementCommentService.updateElementComment(commentId, {
        content: content.trim(),
      }),
    onSuccess: (updatedComment) => {
      // Update the specific comment in cache
      queryClient.setQueryData(
        elementCommentKeys.detail(updatedComment.id),
        updatedComment,
      );
      // Invalidate the element's comments list
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId!),
      });
      toast.success("Comment updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      elementCommentService.deleteElementComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.removeQueries({
        queryKey: elementCommentKeys.detail(commentId),
      });
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId!),
      });
      toast.success("Comment deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });

  // Toggle resolved mutation
  const toggleResolvedMutation = useMutation({
    mutationFn: (commentId: string) =>
      elementCommentService.toggleResolvedStatus(commentId),
    onSuccess: (updatedComment) => {
      // Update the specific comment in cache
      queryClient.setQueryData(
        elementCommentKeys.detail(updatedComment.id),
        updatedComment,
      );
      // Invalidate the element's comments list
      queryClient.invalidateQueries({
        queryKey: elementCommentKeys.list(elementId!),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update comment status: ${error.message}`);
    },
  });

  // Wrapper functions to maintain the same API
  const createComment = async (
    content: string,
  ): Promise<ElementComment | null> => {
    try {
      const result = await createCommentMutation.mutateAsync(content);
      return result;
    } catch {
      return null;
    }
  };

  const updateComment = async (
    commentId: string,
    content: string,
  ): Promise<ElementComment | null> => {
    try {
      const result = await updateCommentMutation.mutateAsync({
        commentId,
        content,
      });
      return result;
    } catch {
      return null;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      return true;
    } catch {
      return false;
    }
  };

  const toggleResolved = async (
    commentId: string,
  ): Promise<ElementComment | null> => {
    try {
      const result = await toggleResolvedMutation.mutateAsync(commentId);
      return result;
    } catch {
      return null;
    }
  };

  const refreshComments = async (): Promise<void> => {
    await refetch();
  };

  // Check if user can edit a comment
  const canEditComment = (comment: ElementComment): boolean => {
    return user?.id === comment.authorId;
  };

  // Check if user can delete a comment
  const canDeleteComment = (comment: ElementComment): boolean => {
    return user?.id === comment.authorId;
  };

  return {
    comments,
    unresolvedCount,
    isLoading:
      isLoading ||
      createCommentMutation.isPending ||
      updateCommentMutation.isPending ||
      deleteCommentMutation.isPending ||
      toggleResolvedMutation.isPending,
    error: (error as Error) || null,
    createComment,
    updateComment,
    deleteComment,
    toggleResolved,
    refreshComments,
    canEditComment,
    canDeleteComment,
  };
}

// Hook for fetching all project comments
export function useProjectComments(projectId?: string) {
  const queryClient = useQueryClient();

  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: elementCommentKeys.projectList(projectId || ""),
    queryFn: () => elementCommentService.getProjectComments(projectId || ""),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const comments = commentsData?.data || [];

  // Group comments by element ID
  const commentsByElement = comments.reduce(
    (acc, comment) => {
      if (!acc[comment.elementId]) {
        acc[comment.elementId] = [];
      }
      acc[comment.elementId].push(comment);
      return acc;
    },
    {} as Record<string, ElementComment[]>,
  );

  // Calculate stats
  const totalComments = comments.length;
  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const elementIds = Object.keys(commentsByElement);

  return {
    comments,
    commentsByElement,
    elementIds,
    totalComments,
    unresolvedCount,
    isLoading,
    error: (error as Error) || null,
    refetch,
  };
}
