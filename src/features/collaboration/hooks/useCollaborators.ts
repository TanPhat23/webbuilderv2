"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaboratorService } from "../services/collaborator.service";
import type { UpdateCollaboratorRoleRequest } from "@/features/collaboration";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  onMutationError,
  onMutationSuccess,
} from "@/hooks/utils/mutationUtils";

export const collaboratorKeys = {
  all: ["collaborators"] as const,
  lists: () => [...collaboratorKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...collaboratorKeys.lists(), filters] as const,
  byProject: (projectId: string) =>
    [...collaboratorKeys.all, "project", projectId] as const,
};

export function useProjectCollaborators(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: collaboratorKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return (
        (await collaboratorService.getProjectCollaborators(projectId)) || []
      );
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
  });
}

export function useUpdateCollaboratorRole(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collaboratorId,
      role,
    }: {
      collaboratorId: string;
      role: UpdateCollaboratorRoleRequest;
    }) => collaboratorService.updateCollaboratorRole(collaboratorId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId
          ? collaboratorKeys.byProject(projectId)
          : collaboratorKeys.all,
      });
      onMutationSuccess("Collaborator role updated successfully!")();
    },
    onError: onMutationError("Failed to update collaborator role"),
  });
}

export function useRemoveCollaborator(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collaboratorId: string) =>
      collaboratorService.removeCollaborator(collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId
          ? collaboratorKeys.byProject(projectId)
          : collaboratorKeys.all,
      });
      onMutationSuccess("Collaborator removed successfully!")();
    },
    onError: onMutationError("Failed to remove collaborator"),
  });
}

export function useLeaveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      collaboratorService.leaveProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: collaboratorKeys.byProject(projectId),
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onMutationSuccess("You have left the project successfully!")();
    },
    onError: onMutationError("Failed to leave project"),
  });
}

export function useCollaboratorManager(projectId: string | null) {
  const collaborators = useProjectCollaborators(projectId);
  const updateRole = useUpdateCollaboratorRole(projectId || undefined);
  const removeCollaborator = useRemoveCollaborator(projectId || undefined);
  const leaveProject = useLeaveProject();

  return {
    collaborators: collaborators.data || [],
    isLoading: collaborators.isLoading,
    isError: collaborators.isError,
    error: collaborators.error,

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

    refetch: collaborators.refetch,
  };
}
