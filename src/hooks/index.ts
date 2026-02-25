/**
 * Custom hooks for the application
 * Organized by functionality into folders
 */

// =============================================================================
// TABLE MANAGEMENT HOOKS
// =============================================================================
export { useTableEditing } from "./table/use-table-editing";
export { useTableState } from "./table/use-table-state";

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
} from "./cms";

// =============================================================================
// EDITOR HOOKS
// =============================================================================
export { useEditor } from "./editor/useEditor";
export type { Viewport } from "./editor/useEditor";
export { useElementHandler } from "./editor";
export { useGridEditor } from "./editor/useGridEditor";
export { useResizeHandler } from "./editor/useResizeHandler";

// =============================================================================
// ELEMENT COMMENTS HOOKS
// =============================================================================
export {
  elementCommentKeys,
  useElementComments,
  useProjectComments,
} from "./useElementComments";

// =============================================================================
// COMMENT MANAGER HOOK
// =============================================================================
export { useCommentManager } from "./useCommentManager";

// =============================================================================
// CHAT HOOK
// =============================================================================
export { useChat } from "./useChat";

// =============================================================================
// UI HOOKS
// =============================================================================
export { useInView } from "./ui/useInView";
export { useIsMobile } from "./ui/use-mobile";

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
} from "./images";

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
} from "./subscription";
export type { UserPlan } from "./subscription";

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
} from "./features/useMarketplace";
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
} from "./features/useComments";
export {
  projectKeys,
  useUserProjects,
  useProject,
  useProjectPages,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  usePublishProject,
} from "./features/useProjects";
export { useDashboard } from "./features/useDashboard";
export { analyticsKeys, useAnalytics } from "./features/useAnalytics";

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================
export {
  notificationKeys,
  useNotifications,
  useUpdateNotification,
  useMarkAllAsRead,
  useCreateProfileUpdateNotification,
} from "./features/useNotifications";

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
} from "./features/useInvitations";
export {
  collaboratorKeys,
  useProjectCollaborators,
  useUpdateCollaboratorRole,
  useRemoveCollaborator,
  useLeaveProject,
  useCollaboratorManager,
} from "./features/useCollaborators";

// =============================================================================
// USER HOOKS
// =============================================================================
export {
  userKeys,
  useSearchUsers,
  useUserByEmail,
  useUserByUsername,
} from "./features/useUsers";

// =============================================================================
// RBAC & PERMISSIONS HOOKS
// =============================================================================
export {
  useProjectPermissions,
  useCanEditOwnResource,
  useCanDeleteOwnResource,
  useRoleDescription,
  Permission,
} from "./useProjectPermissions";
