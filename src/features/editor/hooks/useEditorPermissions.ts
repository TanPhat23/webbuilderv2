/**
 * Editor-specific RBAC Hook
 *
 * Provides reusable permission checks and UI state for the editor
 * Integrates with both server-side RBAC and client-side hooks
 */

"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  useProjectPermissions,
  Permission,
} from "@/features/projects";
import { CollaboratorRole } from "@/features/collaboration";
import { useParams } from "next/navigation";

/**
 * Editor-specific permission result
 */
export interface EditorPermissions {
  // Core states
  role: CollaboratorRole | null;
  isLoading: boolean;

  // Element operations
  canCreateElements: boolean;
  canEditElements: boolean;
  canDeleteElements: boolean;
  canReorderElements: boolean;

  // Page operations
  canCreatePages: boolean;
  canEditPages: boolean;
  canDeletePages: boolean;

  // Project operations
  canEditProject: boolean;
  canDeleteProject: boolean;
  canPublishProject: boolean;
  canExportProject: boolean;
  canAccessSettings: boolean;

  // Collaboration features
  canInviteCollaborators: boolean;
  canManageCollaborators: boolean;

  // Comment/Feedback
  canCreateComments: boolean;
  canEditComments: boolean;
  canDeleteComments: boolean;
  canResolveComments: boolean;

  // Snapshot/Version control
  canCreateSnapshots: boolean;
  canRestoreSnapshots: boolean;
  canDeleteSnapshots: boolean;

  // CMS features
  canEditCMS: boolean;
  canPublishCMS: boolean;

  // Generic checkers
  hasPermission: (permission: Permission) => boolean;
  can: (action: EditorAction, resource: EditorResource) => boolean;
}

/**
 * Editor actions that might require permissions
 */
export type EditorAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "publish"
  | "export"
  | "manage"
  | "invite"
  | "resolve";

/**
 * Editor resources that permissions apply to
 */
export type EditorResource =
  | "project"
  | "element"
  | "page"
  | "collaborator"
  | "comment"
  | "snapshot"
  | "cms";

/**
 * Hook to get comprehensive editor permissions
 *
 * @param projectId - The project ID
 * @param enabled - Whether to enable the query
 *
 * @example
 * ```tsx
 * const permissions = useEditorPermissions(projectId);
 *
 * if (permissions.canDeleteElements) {
 *   // Show delete button
 * }
 *
 * if (permissions.can("publish", "project")) {
 *   // Show publish button
 * }
 * ```
 */
export function useEditorPermissions(
  projectId?: string | null,
  enabled = true,
): EditorPermissions {
  const { id } = useParams();
  const effectiveProjectId = projectId || id;
  const perms = useProjectPermissions(
    effectiveProjectId as string | null,
    enabled,
  );

  // Generic permission checker
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return perms.hasPermission(permission);
    },
    [perms],
  );

  // Action-resource based checker
  const can = useCallback(
    (action: EditorAction, resource: EditorResource): boolean => {
      const permissionKey = `${resource}:${action}` as Permission;
      return hasPermission(permissionKey);
    },
    [hasPermission],
  );

  // Derived permissions with memoization
  const editorPermissions = useMemo<EditorPermissions>(
    () => ({
      // Core states
      role: perms.role,
      isLoading: perms.isLoading,

      // Element operations
      canCreateElements: hasPermission(Permission.ELEMENT_CREATE),
      canEditElements: hasPermission(Permission.ELEMENT_EDIT),
      canDeleteElements: hasPermission(Permission.ELEMENT_DELETE),
      canReorderElements: hasPermission(Permission.ELEMENT_REORDER),

      // Page operations
      canCreatePages: hasPermission(Permission.PAGE_CREATE),
      canEditPages: hasPermission(Permission.PAGE_EDIT),
      canDeletePages: hasPermission(Permission.PAGE_DELETE),

      // Project operations
      canEditProject: hasPermission(Permission.PROJECT_EDIT),
      canDeleteProject: hasPermission(Permission.PROJECT_DELETE),
      canPublishProject: hasPermission(Permission.PROJECT_PUBLISH),
      canExportProject: hasPermission(Permission.EXPORT_CODE),
      canAccessSettings: hasPermission(Permission.PROJECT_SETTINGS),

      // Collaboration
      canInviteCollaborators: hasPermission(Permission.COLLABORATOR_INVITE),
      canManageCollaborators: hasPermission(Permission.COLLABORATOR_EDIT),

      // Comments
      canCreateComments: hasPermission(Permission.COMMENT_CREATE),
      canEditComments: perms.hasAnyPermission([
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_EDIT_ALL,
      ]),
      canDeleteComments: perms.hasAnyPermission([
        Permission.COMMENT_DELETE_OWN,
        Permission.COMMENT_DELETE_ALL,
      ]),
      canResolveComments: hasPermission(Permission.COMMENT_RESOLVE),

      // Snapshots
      canCreateSnapshots: hasPermission(Permission.SNAPSHOT_CREATE),
      canRestoreSnapshots: hasPermission(Permission.SNAPSHOT_RESTORE),
      canDeleteSnapshots: hasPermission(Permission.SNAPSHOT_DELETE),

      // CMS
      canEditCMS: hasPermission(Permission.CMS_EDIT),
      canPublishCMS: hasPermission(Permission.CMS_PUBLISH),

      // Generic checkers
      hasPermission,
      can,
    }),
    [perms, hasPermission, can],
  );

  return editorPermissions;
}

/**
 * Hook for checking if user can edit elements
 *
 * @example
 * ```tsx
 * const canEdit = useCanEditElements(projectId);
 * ```
 */
export function useCanEditElements(projectId: string | null): boolean {
  const { canEditElements } = useEditorPermissions(projectId);
  return canEditElements;
}

/**
 * Hook for checking if user can manage project
 *
 * @example
 * ```tsx
 * const isManager = useCanManageProject(projectId);
 * ```
 */
export function useCanManageProject(projectId: string | null): boolean {
  const { canEditProject, canAccessSettings } = useEditorPermissions(projectId);
  return canEditProject && canAccessSettings;
}

/**
 * Hook for checking if user can collaborate
 *
 * @example
 * ```tsx
 * const canCollaborate = useCanCollaborate(projectId);
 * ```
 */
export function useCanCollaborate(projectId: string | null): boolean {
  const { canInviteCollaborators, canManageCollaborators } =
    useEditorPermissions(projectId);
  return canInviteCollaborators || canManageCollaborators;
}

/**
 * Hook for checking if a specific element can be edited
 * Takes into account both element edit permission and element type
 *
 * @example
 * ```tsx
 * const canEditElement = useCanEditElement(projectId, elementType);
 * ```
 */
export function useCanEditElement(
  projectId: string | null,
  elementType?: string,
): boolean {
  const permissions = useEditorPermissions(projectId);

  // Check basic permission
  if (!permissions.canEditElements) {
    return false;
  }

  // You can add element-type-specific checks here if needed
  // e.g., some roles might not be able to edit certain component types
  if (elementType === "Form" && !permissions.role) {
    return false;
  }

  return true;
}

/**
 * Hook for getting UI state (enabled/disabled) for editor actions
 *
 * @example
 * ```tsx
 * const { deleteEnabled, editDisabledReason } = useEditorUIState(projectId);
 * ```
 */
export function useEditorUIState(projectId: string | null) {
  const permissions = useEditorPermissions(projectId);

  return {
    // Element toolbar
    deleteEnabled: permissions.canDeleteElements,
    editEnabled: permissions.canEditElements,
    createEnabled: permissions.canCreateElements,
    reorderEnabled: permissions.canReorderElements,

    // Page toolbar
    pageDeleteEnabled: permissions.canDeletePages,
    pageCreateEnabled: permissions.canCreatePages,
    pageEditEnabled: permissions.canEditPages,

    // Project actions
    publishEnabled: permissions.canPublishProject,
    exportEnabled: permissions.canExportProject,
    settingsEnabled: permissions.canAccessSettings,

    // Collaboration
    inviteEnabled: permissions.canInviteCollaborators,
    manageCollaboratorsEnabled: permissions.canManageCollaborators,

    // Comments
    commentCreateEnabled: permissions.canCreateComments,
    commentDeleteEnabled: permissions.canDeleteComments,
    commentEditEnabled: permissions.canEditComments,

    // Snapshot
    snapshotCreateEnabled: permissions.canCreateSnapshots,
    snapshotRestoreEnabled: permissions.canRestoreSnapshots,

    // Get reason why action is disabled
    getDisabledReason: (
      action: EditorAction,
      resource: EditorResource,
    ): string => {
      if (permissions.can(action, resource)) {
        return "";
      }

      const roleMsg = permissions.role
        ? `${permissions.role} role`
        : "Your role";
      return `${roleMsg} doesn't have permission to ${action} ${resource}`;
    },
  };
}

/**
 * Hook for edit-your-own resource pattern (comments)
 *
 * @example
 * ```tsx
 * const canEdit = useCanEditOwnComment(projectId, commentAuthorId);
 * ```
 */
export function useCanEditOwnComment(
  projectId: string | null,
  authorId: string | null,
): boolean {
  const { userId } = useAuth();
  const permissions = useEditorPermissions(projectId);

  if (!userId || !authorId) return false;

  const isAuthor = userId === authorId;

  if (isAuthor) {
    return permissions.hasPermission(Permission.COMMENT_EDIT_OWN);
  }

  return permissions.hasPermission(Permission.COMMENT_EDIT_ALL);
}

/**
 * Hook for delete-your-own resource pattern
 */
export function useCanDeleteOwnComment(
  projectId: string | null,
  authorId: string | null,
): boolean {
  const { userId } = useAuth();
  const permissions = useEditorPermissions(projectId);

  if (!userId || !authorId) return false;

  const isAuthor = userId === authorId;

  if (isAuthor) {
    return permissions.hasPermission(Permission.COMMENT_DELETE_OWN);
  }

  return permissions.hasPermission(Permission.COMMENT_DELETE_ALL);
}
