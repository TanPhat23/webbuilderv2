"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationService } from "@/services/invitation";
import type {
  Invitation,
  CreateInvitationRequest,
  AcceptInvitationRequest,
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

// Query keys for invitations
export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...invitationKeys.lists(), filters] as const,
  byProject: (projectId: string) =>
    [...invitationKeys.all, "project", projectId] as const,
};

/**
 * Hook to get all invitations for a specific project.
 *
 * @param projectId - The project ID.
 * @param enabled   - Whether the query should be enabled (default: true).
 */
export function useProjectInvitations(
  projectId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: invitationKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      const invitations =
        await invitationService.getPendingInvitationsByProject(projectId);
      return invitations || [];
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

/**
 * Hook to create a new invitation.
 * Automatically invalidates project invitations cache on success.
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvitationRequest) => {
      return await invitationService.createInvitation(data);
    },
    onSuccess: (newInvitation, variables) => {
      // Update cache with new invitation
      queryClient.setQueryData<Invitation[]>(
        invitationKeys.byProject(variables.projectId),
        (old = []) => [newInvitation, ...old],
      );

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byProject(variables.projectId),
      });

      showSuccessToast(`Invitation sent to ${variables.email}!`);
    },
    onError: onMutationError("Failed to send invitation"),
  });
}

/**
 * Hook to accept an invitation.
 * Invalidates both invitations and collaborators caches.
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptInvitationRequest) => {
      return await invitationService.acceptInvitation(data);
    },
    onSuccess: () => {
      // Invalidate all invitation and collaborator queries
      // since we don't know which project this invitation was for
      queryClient.invalidateQueries({
        queryKey: invitationKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["collaborators"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      showSuccessToast("Invitation accepted! You are now a collaborator.");
    },
    onError: onMutationError("Failed to accept invitation"),
  });
}

/**
 * Hook to update invitation status.
 *
 * @param projectId - Optional project ID for optimistic updates.
 */
export function useUpdateInvitationStatus(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      status,
    }: {
      invitationId: string;
      status: string;
    }) => {
      return await invitationService.updateInvitationStatus(
        invitationId,
        status,
      );
    },
    onSuccess: (updatedInvitation) => {
      showSuccessToast(
        `Invitation status updated to ${updatedInvitation.status}!`,
      );

      if (projectId) {
        queryClient.setQueryData<Invitation[]>(
          invitationKeys.byProject(projectId),
          (old = []) =>
            old.map((inv) =>
              inv.id === updatedInvitation.id ? updatedInvitation : inv,
            ),
        );
      }

      // Invalidate to ensure consistency
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: invitationKeys.byProject(projectId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: invitationKeys.all,
        });
      }
    },
    onError: onMutationError("Failed to update invitation status"),
  });
}

/**
 * Hook to cancel an invitation.
 *
 * @param projectId - Optional project ID for optimistic updates.
 */
export function useCancelInvitation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return await invitationService.cancelInvitation(invitationId);
    },
    onSuccess: (updatedInvitation) => {
      showSuccessToast("Invitation cancelled successfully!");

      if (projectId) {
        queryClient.setQueryData<Invitation[]>(
          invitationKeys.byProject(projectId),
          (old = []) =>
            old.map((inv) =>
              inv.id === updatedInvitation.id ? updatedInvitation : inv,
            ),
        );
      }

      // Invalidate to ensure consistency
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: invitationKeys.byProject(projectId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: invitationKeys.all,
        });
      }
    },
    onError: onMutationError("Failed to cancel invitation"),
  });
}

/**
 * Hook to delete/revoke an invitation.
 *
 * @param projectId - Optional project ID for optimistic updates.
 */
export function useDeleteInvitation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return await invitationService.deleteInvitation(invitationId);
    },
    onMutate: async (invitationId) => {
      if (!projectId) return {};

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: invitationKeys.byProject(projectId),
      });

      // Snapshot previous value
      const previousInvitations = queryClient.getQueryData<Invitation[]>(
        invitationKeys.byProject(projectId),
      );

      // Optimistically remove from cache
      queryClient.setQueryData<Invitation[]>(
        invitationKeys.byProject(projectId),
        (old = []) => old.filter((inv) => inv.id !== invitationId),
      );

      return { previousInvitations, projectId };
    },
    onSuccess: () => {
      showSuccessToast("Invitation deleted successfully!");
    },
    onError: (error, _invitationId, context) => {
      // Rollback on error
      if (context?.previousInvitations && context?.projectId) {
        queryClient.setQueryData(
          invitationKeys.byProject(context.projectId),
          context.previousInvitations,
        );
      }

      showErrorToast(getErrorMessage(error, "Failed to delete invitation"));
    },
    onSettled: (_, __, ___, context) => {
      // Always refetch after deletion to ensure consistency
      if (context?.projectId) {
        queryClient.invalidateQueries({
          queryKey: invitationKeys.byProject(context.projectId),
        });
      }
    },
  });
}

/**
 * Combined hook for invitation management.
 * Provides all invitation operations in a single hook.
 */
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
    // Query states
    invitations: invitations.data || [],
    isLoading: invitations.isLoading,
    isError: invitations.isError,
    error: invitations.error,

    // Mutations
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

    // Refetch
    refetch: invitations.refetch,
  };
}
