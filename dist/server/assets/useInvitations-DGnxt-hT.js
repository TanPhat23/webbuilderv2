import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { U as URLBuilder, A as API_ENDPOINTS, a as apiClient, W as onMutationError, an as onMutationSuccess, X as QUERY_CONFIG } from "./prisma-Cq49YOYM.js";
const invitationService = {
  /**
   * Create a new invitation for a project
   * @param data - Invitation creation data (projectId, email, role)
   * @returns Promise<Invitation> - The created invitation
   */
  createInvitation: async (data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.CREATE).build();
    return apiClient.post(url, data);
  },
  /**
   * Get all invitations for a specific project
   * @param projectId - The project ID
   * @returns Promise<Invitation[]> - Array of invitations
   */
  getProjectInvitations: async (projectId) => {
    try {
      const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.GET_BY_PROJECT(projectId)).build();
      const response = await apiClient.get(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn(
        `Failed to fetch invitations for project ${projectId}:`,
        error
      );
      return [];
    }
  },
  /**
   * Accept an invitation using a token
   * @param data - Acceptance data containing the invitation token
   * @returns Promise<void>
   */
  acceptInvitation: async (data) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.ACCEPT).build();
    await apiClient.post(url, data);
  },
  /**
   * Get pending invitations for a specific project
   * @param projectId - The project ID
   * @returns Promise<Invitation[]> - Array of pending invitations
   */
  getPendingInvitationsByProject: async (projectId) => {
    try {
      const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.GET_PENDING_BY_PROJECT(projectId)).build();
      const response = await apiClient.get(url);
      const invitations = Array.isArray(response) ? response : [];
      return invitations;
    } catch (error) {
      return [];
    }
  },
  /**
   * Cancel an invitation
   * @param invitationId - The invitation ID to cancel
   * @returns Promise<Invitation> - The updated invitation
   */
  cancelInvitation: async (invitationId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.CANCEL(invitationId)).build();
    return apiClient.patch(url, {});
  },
  /**
   * Update the status of an invitation
   * @param invitationId - The invitation ID
   * @param status - The new status
   * @returns Promise<Invitation> - The updated invitation
   */
  updateInvitationStatus: async (invitationId, status) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.UPDATE_STATUS(invitationId)).build();
    return apiClient.patch(url, { status });
  },
  /**
   * Delete an invitation (only for project owners)
   * @param invitationId - The invitation ID to delete
   * @returns Promise<boolean> - Success status
   */
  deleteInvitation: async (invitationId) => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.INVITATIONS.DELETE(invitationId)).build();
    return apiClient.delete(url);
  }
};
const invitationKeys = {
  all: ["invitations"],
  lists: () => [...invitationKeys.all, "list"],
  list: (filters) => [...invitationKeys.lists(), filters],
  byProject: (projectId) => [...invitationKeys.all, "project", projectId]
};
function useProjectInvitations(projectId, enabled = true) {
  return useQuery({
    queryKey: invitationKeys.byProject(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return await invitationService.getPendingInvitationsByProject(projectId) || [];
    },
    enabled: !!projectId && enabled,
    ...QUERY_CONFIG.SHORT,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
}
function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => invitationService.createInvitation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byProject(variables.projectId)
      });
      onMutationSuccess(`Invitation sent to ${variables.email}!`)();
    },
    onError: onMutationError("Failed to send invitation")
  });
}
function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => invitationService.acceptInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onMutationSuccess("Invitation accepted! You are now a collaborator.")();
    },
    onError: onMutationError("Failed to accept invitation")
  });
}
function useUpdateInvitationStatus(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      status
    }) => invitationService.updateInvitationStatus(invitationId, status),
    onSuccess: (updatedInvitation) => {
      queryClient.invalidateQueries({
        queryKey: projectId ? invitationKeys.byProject(projectId) : invitationKeys.all
      });
      onMutationSuccess(
        `Invitation status updated to ${updatedInvitation.status}!`
      )();
    },
    onError: onMutationError("Failed to update invitation status")
  });
}
function useCancelInvitation(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId) => invitationService.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId ? invitationKeys.byProject(projectId) : invitationKeys.all
      });
      onMutationSuccess("Invitation cancelled successfully!")();
    },
    onError: onMutationError("Failed to cancel invitation")
  });
}
function useDeleteInvitation(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId) => invitationService.deleteInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectId ? invitationKeys.byProject(projectId) : invitationKeys.all
      });
      onMutationSuccess("Invitation deleted successfully!")();
    },
    onError: onMutationError("Failed to delete invitation")
  });
}
function useInvitationManager(projectId) {
  const invitations = useProjectInvitations(projectId);
  const createInvitation = useCreateInvitation();
  const acceptInvitation = useAcceptInvitation();
  const cancelInvitation = useCancelInvitation(projectId || void 0);
  const updateInvitationStatus = useUpdateInvitationStatus(
    projectId || void 0
  );
  const deleteInvitation = useDeleteInvitation(projectId || void 0);
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
    refetch: invitations.refetch
  };
}
export {
  useInvitationManager as a,
  useAcceptInvitation as u
};
