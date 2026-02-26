/**
 * Custom hooks for the application
 * Organized by functionality into folders
 */

// =============================================================================
// TABLE MANAGEMENT HOOKS
// =============================================================================
export { useTableEditing } from "@/features/table";
export { useTableState } from "@/features/table";

// =============================================================================
// CMS HOOKS
// =============================================================================
export {
  useCMSContent,
  useCMSContentItem,
  getFieldValue,
  getFieldValues,
  useCMSContentTypes,
  useCMSManager,
} from "@/features/cms";

// =============================================================================
// EDITOR HOOKS
// =============================================================================
export { useEditor } from "@/features/editor/hooks/useEditor";
export type { Viewport } from "@/features/editor/hooks/useEditor";
export { useElementHandler } from "@/features/editor/hooks";
export { useGridEditor } from "@/features/editor/hooks/useGridEditor";
export { useResizeHandler } from "@/features/editor/hooks/useResizeHandler";

// =============================================================================
// ELEMENT COMMENTS HOOKS
// =============================================================================
export {
  elementCommentKeys,
  useElementComments,
  useProjectComments,
} from "@/features/comments";

// =============================================================================
// COMMENT MANAGER HOOK
// =============================================================================
export { useCommentManager } from "@/features/comments";

// =============================================================================
// CHAT HOOK
// =============================================================================
export { useChat } from "@/features/chat";

// =============================================================================
// UI HOOKS
// =============================================================================
export { useInView } from "@/features/ui";
export { useIsMobile } from "@/features/ui";

// =============================================================================
// IMAGE HOOKS
// =============================================================================
export {
  imageKeys,
  useUserImages,
  useImage,
  useUploadImage,
  useUploadBase64Image,
  useDeleteImage,
} from "@/features/images";

// =============================================================================
// SUBSCRIPTION HOOKS
// =============================================================================
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

// =============================================================================
// FEATURE HOOKS
// =============================================================================
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
  useComments,
  useComment,
  useCommentsByItem,
  useCommentCount,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useCreateReaction,
  useDeleteReaction,
  useReactions,
  useReactionSummary,
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

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================
export {
  notificationKeys,
  useNotifications,
  useUpdateNotification,
  useMarkAllAsRead,
  useCreateProfileUpdateNotification,
} from "@/features/notifications";

// =============================================================================
// COLLABORATION HOOKS
// =============================================================================
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

// =============================================================================
// USER HOOKS
// =============================================================================
export {
  userKeys,
  useSearchUsers,
  useUserByEmail,
  useUserByUsername,
} from "@/features/users";

// =============================================================================
// RBAC & PERMISSIONS HOOKS
// =============================================================================
export {
  useProjectPermissions,
  useCanEditOwnResource,
  useCanDeleteOwnResource,
  useRoleDescription,
  Permission,
} from "@/features/projects";
