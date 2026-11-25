import { projectScopedKeys } from "./projectScopedKeys";
import { useScopedMutation } from "./useScopedMutation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationService } from "../services/invitation.service";
import type {
  CreateInvitationRequest,
  AcceptInvitationRequest,
  Invitation,
} from "../interfaces/collaboration.interface";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  createMutationErrorHandler,
  createMutationSuccessHandler,
} from "@/hooks/utils/mutationUtils";

export const invitationKeys = projectScopedKeys("invitations");

export function resolveInvitationScopeKey(projectId?: string) {
  return projectId ? invitationKeys.byProject(projectId) : invitationKeys.all;
}

export async function getProjectInvitations(
  projectId: string | null,
): Promise<Invitation[]> {
  if (!projectId) throw new Error("Project ID is required");
  return (await invitationService.listPendingInvitationsByProject(projectId)) || [];
}

export function useProjectInvitations(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: invitationKeys.byProject(projectId || ""),
    queryFn: () => getProjectInvitations(projectId),
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) =>
      invitationService.createInvitation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byProject(variables.projectId),
      });
      createMutationSuccessHandler(`Invitation sent to ${variables.email}!`)();
    },
    onError: createMutationErrorHandler("Failed to send invitation"),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) =>
      invitationService.acceptInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      createMutationSuccessHandler("Invitation accepted! You are now a collaborator.")();
    },
    onError: createMutationErrorHandler("Failed to accept invitation"),
  });
}

export function useUpdateInvitationStatus(projectId?: string) {
  return useScopedMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: string;
      status: string;
    }) => invitationService.updateInvitationStatus(invitationId, status),
    invalidateKey: resolveInvitationScopeKey(projectId),
    successMessage: (updatedInvitation) =>
      `Invitation status updated to ${updatedInvitation.status}!`,
    errorMessage: "Failed to update invitation status",
  });
}

export function useCancelInvitation(projectId?: string) {
  return useScopedMutation({
    mutationFn: (invitationId: string) =>
      invitationService.cancelInvitation(invitationId),
    invalidateKey: resolveInvitationScopeKey(projectId),
    successMessage: "Invitation cancelled successfully!",
    errorMessage: "Failed to cancel invitation",
  });
}

export function useDeleteInvitation(projectId?: string) {
  return useScopedMutation({
    mutationFn: (invitationId: string) =>
      invitationService.deleteInvitation(invitationId),
    invalidateKey: resolveInvitationScopeKey(projectId),
    successMessage: "Invitation deleted successfully!",
    errorMessage: "Failed to delete invitation",
  });
}
