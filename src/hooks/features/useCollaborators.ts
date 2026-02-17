"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaboratorService } from "@/services/collaborator";
import type {
  Collaborator,
  UpdateCollaboratorRoleRequest,
} from "@/interfaces/collaboration.interface";
import { QUERY_CONFIG } from "@/lib/utils/query/queryConfig";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils/errors/errorToast";
import {
  getErrorMessage,
  onMutationError,
} from "@/lib/utils/hooks/mutationUtils";

// Query keys for collaborators
export const collaboratorKeys = {
  all: ["collaborators"] as const,
  lists: () => [...collaboratorKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...collaboratorKeys.lists(), filters] as const,
  byProject: (projectId: string) =>
    [...collaboratorKeys.all, "project", projectId] as const,
};

/**
 * Hook to get all collaborators for a specific project.
 *
 * @param projectId - The project ID.
 * @param enabled   - Whether the query should be enabled (default: true).
 */
export function useProjectCollaborators(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: collaboratorKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      const collaborators =
        await collaboratorService.getProjectCollaborators(projectId);
      return collaborators || [];
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
  });
}

/**
 * Hook to update a collaborator's role.
 * Only project owners can perform this action.
 */
export function useUpdateCollaboratorRole(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collaboratorId,
      role,
    }: {
      collaboratorId: string;
      role: UpdateCollaboratorRoleRequest;
    }) => {
      return await collaboratorService.updateCollaboratorRole(
        collaboratorId,
        role,
      );
    },
    onMutate: async ({ collaboratorId, role }) => {
      if (!projectId) return {};

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: collaboratorKeys.byProject(projectId),
      });

      // Snapshot the previous value
      const previousCollaborators = queryClient.getQueryData<Collaborator[]>(
        collaboratorKeys.byProject(projectId),
      );

      // Optimistically update the collaborator's role
      queryClient.setQueryData<Collaborator[]>(
        collaboratorKeys.byProject(projectId),
        (old) =>
          old
            ? old.map((collab) =>
                collab.id === collaboratorId
                  ? { ...collab, role: role.role }
                  : collab,
              )
            : [],
      );

      return { previousCollaborators, projectId };
    },
    onSuccess: (updatedCollaborator, _variables, context) => {
      // Update with server data
      if (context?.projectId) {
        queryClient.setQueryData<Collaborator[]>(
          collaboratorKeys.byProject(context.projectId),
          (old) =>
            old
              ? old.map((collab) =>
                  collab.id === updatedCollaborator.id
                    ? updatedCollaborator
                    : collab,
                )
              : [],
        );
      }

      showSuccessToast("Collaborator role updated successfully!");
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousCollaborators && context?.projectId) {
        queryClient.setQueryData(
          collaboratorKeys.byProject(context.projectId),
          context.previousCollaborators,
        );
      }

      showErrorToast(
        getErrorMessage(error, "Failed to update collaborator role"),
      );
    },
    onSettled: (_, __, ___, context) => {
      // Always refetch after error or success
      if (context?.projectId) {
        queryClient.invalidateQueries({
          queryKey: collaboratorKeys.byProject(context.projectId),
        });
      } else {
        // If no projectId, invalidate all collaborator queries
        queryClient.invalidateQueries({
          queryKey: collaboratorKeys.all,
        });
      }
    },
  });
}

/**
 * Hook to remove a collaborator from a project.
 * Only project owners can perform this action.
 */
export function useRemoveCollaborator(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaboratorId: string) => {
      return await collaboratorService.removeCollaborator(collaboratorId);
    },
    onMutate: async (collaboratorId) => {
      if (!projectId) return {};

      await queryClient.cancelQueries({
        queryKey: collaboratorKeys.byProject(projectId),
      });

      const previousCollaborators = queryClient.getQueryData<Collaborator[]>(
        collaboratorKeys.byProject(projectId),
      );

      queryClient.setQueryData<Collaborator[]>(
        collaboratorKeys.byProject(projectId),
        (old) =>
          old ? old.filter((collab) => collab.id !== collaboratorId) : [],
      );

      return { previousCollaborators, projectId };
    },
    onSuccess: (_, __, context) => {
      showSuccessToast("Collaborator removed successfully!");

      if (context?.projectId) {
        queryClient.invalidateQueries({
          queryKey: collaboratorKeys.byProject(context.projectId),
        });
      }
    },
    onError: (error, _collaboratorId, context) => {
      // Rollback on error
      if (context?.previousCollaborators && context?.projectId) {
        queryClient.setQueryData(
          collaboratorKeys.byProject(context.projectId),
          context.previousCollaborators,
        );
      }

      showErrorToast(getErrorMessage(error, "Failed to remove collaborator"));
    },
    onSettled: (_, __, ___, context) => {
      if (context?.projectId) {
        queryClient.invalidateQueries({
          queryKey: collaboratorKeys.byProject(context.projectId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: collaboratorKeys.all,
        });
      }
    },
  });
}

/**
 * Hook to leave a project (remove self as collaborator).
 */
export function useLeaveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      return await collaboratorService.leaveProject(projectId);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: collaboratorKeys.byProject(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      showSuccessToast("You have left the project successfully!");
    },
    onError: onMutationError("Failed to leave project"),
  });
}

/**
 * Combined hook for collaborator management.
 * Provides all collaborator operations in a single hook.
 */
export function useCollaboratorManager(projectId: string | null) {
  const collaborators = useProjectCollaborators(projectId);
  const updateRole = useUpdateCollaboratorRole(projectId || undefined);
  const removeCollaborator = useRemoveCollaborator(projectId || undefined);
  const leaveProject = useLeaveProject();

  return {
    // Query states
    collaborators: collaborators.data || [],
    isLoading: collaborators.isLoading,
    isError: collaborators.isError,
    error: collaborators.error,

    // Mutations
    updateCollaboratorRole: (
      collaboratorId: string,
      role: UpdateCollaboratorRoleRequest,
    ) => updateRole.mutate({ collaboratorId, role }),
    updateCollaboratorRoleAsync: (
      collaboratorId: string,
      role: UpdateCollaboratorRoleRequest,
    ) => updateRole.mutateAsync({ collaboratorId, role }),
    isUpdatingRole: updateRole.isPending,

    removeCollaborator: removeCollaborator.mutate,
    removeCollaboratorAsync: removeCollaborator.mutateAsync,
    isRemoving: removeCollaborator.isPending,

    leaveProject: leaveProject.mutate,
    leaveProjectAsync: leaveProject.mutateAsync,
    isLeaving: leaveProject.isPending,

    // Refetch
    refetch: collaborators.refetch,
  };
}
