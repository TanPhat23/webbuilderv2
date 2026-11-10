/**
 * Custom hooks for the application
 * Organized by functionality into folders
 */


export {
  useCMSContent,
  useCMSContentItem,
  getFieldValue,
  getFieldValues,
  useCMSContentTypes,
  useCMSManager,
} from "@/features/cms";

export { useEditor } from "@/features/editor/hooks/useEditor";
export type { Viewport } from "@/features/editor/hooks/useEditor";
export { useElementHandler } from "@/features/editor/hooks";
export { useResizeHandler } from "@/features/editor/hooks/useResizeHandler";

export {
  elementCommentKeys,
  useElementComments,
  useProjectComments,
} from "@/features/comments";

export { useCommentManager } from "@/features/comments";


export { useInView } from "@/features/ui";
export { useIsMobile } from "@/features/ui";

export {
  imageKeys,
  useUserImages,
  useImage,
  useUploadImage,
  useUploadBase64Image,
  useDeleteImage,
} from "@/features/images";

export {
  subscriptionKeys,
  useSubscriptionStatus,
  useAllSubscriptions,
  useCreatePayment,
  useCancelSubscription,
  userPlanKeys,
  useUserPlan,
} from "@/features/subscription";
export type { UserPlan } from "@/features/subscription";

export {
  useMarketplaceItems,
  useMarketplaceItem,
  useCreateMarketplaceItem,
  useUpdateMarketplaceItem,
  useDeleteMarketplaceItem,
  useIncrementDownloads,
  useDownloadMarketplaceItem,
  useIncrementLikes,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useTags,
  useCreateTag,
  useDeleteTag,
  useMarketplaceManager,
} from "@/features/marketplace";
export {
  commentKeys,
  useCommentsByItem,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useCreateReaction,
  useDeleteReaction,
} from "@/features/comments";
export {
  projectKeys,
  useUserProjects,
  useProject,
  useProjectPages,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  usePublishProject,
} from "@/features/projects";
export { useDashboard } from "@/features/dashboard";
export { useAnalytics } from "@/features/analytics";

export {
  notificationKeys,
  useNotifications,
  useUpdateNotification,
  useCreateProfileUpdateNotification,
} from "@/features/notifications";

export {
  invitationKeys,
  useProjectInvitations,
  useCreateInvitation,
  useAcceptInvitation,
  useCancelInvitation,
  useUpdateInvitationStatus,
  useDeleteInvitation,
  useInvitationManager,
} from "@/features/collaboration";
export {
  collaboratorKeys,
  useProjectCollaborators,
  useUpdateCollaboratorRole,
  useRemoveCollaborator,
  useLeaveProject,
  useCollaboratorManager,
} from "@/features/collaboration";

export {
  userKeys,
  useSearchUsers,
  useUserByEmail,
  useUserByUsername,
} from "@/features/users";

export {
  useProjectPermissions,
  useCanEditOwnResource,
  useCanDeleteOwnResource,
  useRoleDescription,
  Permission,
} from "@/features/projects";
