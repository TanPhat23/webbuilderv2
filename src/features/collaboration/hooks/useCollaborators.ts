import { projectScopedKeys } from "./projectScopedKeys";
import { useScopedMutation } from "./useScopedMutation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaboratorService } from "../services/collaborator.service";
import type { UpdateCollaboratorRoleRequest } from "../interfaces/collaboration.interface";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  createMutationErrorHandler,
  createMutationSuccessHandler,
} from "@/hooks/utils/mutationUtils";

export const collaboratorKeys = projectScopedKeys("collaborators");

export function resolveCollaboratorScopeKey(projectId?: string) {
  return projectId
    ? collaboratorKeys.byProject(projectId)
    : collaboratorKeys.all;
}

export function useProjectCollaborators(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: collaboratorKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return (
        (await collaboratorService.listProjectCollaborators(projectId)) || []
      );
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
  });
}

export function useUpdateCollaboratorRole(projectId?: string) {
  return useScopedMutation({
    mutationFn: ({
      collaboratorId,
      role,
    }: {
      collaboratorId: string;
      role: UpdateCollaboratorRoleRequest;
    }) => collaboratorService.updateCollaboratorRole(collaboratorId, role),
    invalidateKey: resolveCollaboratorScopeKey(projectId),
    successMessage: "Collaborator role updated successfully!",
    errorMessage: "Failed to update collaborator role",
  });
}

export function useRemoveCollaborator(projectId?: string) {
  return useScopedMutation({
    mutationFn: (collaboratorId: string) =>
      collaboratorService.removeCollaborator(collaboratorId),
    invalidateKey: resolveCollaboratorScopeKey(projectId),
    successMessage: "Collaborator removed successfully!",
    errorMessage: "Failed to remove collaborator",
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
      createMutationSuccessHandler("You have left the project successfully!")();
    },
    onError: createMutationErrorHandler("Failed to leave project"),
  });
}
