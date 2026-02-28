"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationService } from "../services/invitation.service";
import type {
  CreateInvitationRequest,
  AcceptInvitationRequest,
} from "@/features/collaboration";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  onMutationError,
  onMutationSuccess,
} from "@/hooks/utils/mutationUtils";

export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...invitationKeys.lists(), filters] as const,
  byProject: (projectId: string) =>
    [...invitationKeys.all, "project", projectId] as const,
};

export function useProjectInvitations(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: invitationKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return (
        (await invitationService.getPendingInvitationsByProject(projectId)) ||
        []
      );
    },
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
      onMutationSuccess(`Invitation sent to ${variables.email}!`)();
    },
    onError: onMutationError("Failed to send invitation"),
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
      onMutationSuccess("Invitation accepted! You are now a collaborator.")();
    },
    onError: onMutationError("Failed to accept invitation"),
  });
}

export function useUpdateInvitationStatus(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: string;
      status: string;
    }) => invitationService.updateInvitationStatus(invitationId, status),
    onSuccess: (updatedInvitation) => {
      queryClient.invalidateQueries({
        queryKey: projectId
          ? invitationKeys.byProject(projectId)
          : invitationKeys.all,
      });
      onMutationSuccess(
        `Invitation status updated to ${updatedInvitation.status}!`,
      )();
    },
    onError: onMutationError("Failed to update invitation status"),
  });
}

export function useCancelInvitation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId
          ? invitationKeys.byProject(projectId)
          : invitationKeys.all,
      });
      onMutationSuccess("Invitation cancelled successfully!")();
    },
    onError: onMutationError("Failed to cancel invitation"),
  });
}

export function useDeleteInvitation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.deleteInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId
          ? invitationKeys.byProject(projectId)
          : invitationKeys.all,
      });
      onMutationSuccess("Invitation deleted successfully!")();
    },
    onError: onMutationError("Failed to delete invitation"),
  });
}

export function useInvitationManager(projectId: string | null) {
  const invitations = useProjectInvitations(projectId);
  const createInvitation = useCreateInvitation();
  const acceptInvitation = useAcceptInvitation();
  const cancelInvitation = useCancelInvitation(projectId || undefined);
  const updateInvitationStatus = useUpdateInvitationStatus(
    projectId || undefined,
  );
  const deleteInvitation = useDeleteInvitation(projectId || undefined);

  return {
    invitations: invitations.data || [],
    isLoading: invitations.isLoading,
    isError: invitations.isError,
    error: invitations.error,

    createInvitation: createInvitation.mutate,
    createInvitationAsync: createInvitation.mutateAsync,
    isCreating: createInvitation.isPending,

    acceptInvitation: acceptInvitation.mutate,
    acceptInvitationAsync: acceptInvitation.mutateAsync,
    isAccepting: acceptInvitation.isPending,

    cancelInvitation: cancelInvitation.mutate,
    cancelInvitationAsync: cancelInvitation.mutateAsync,
    isCancelling: cancelInvitation.isPending,

    updateInvitationStatus: updateInvitationStatus.mutate,
    updateInvitationStatusAsync: updateInvitationStatus.mutateAsync,
    isUpdatingStatus: updateInvitationStatus.isPending,

    deleteInvitation: deleteInvitation.mutate,
    deleteInvitationAsync: deleteInvitation.mutateAsync,
    isDeleting: deleteInvitation.isPending,

    refetch: invitations.refetch,
  };
}
