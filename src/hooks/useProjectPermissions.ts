"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  CollaboratorRole,
  Collaborator,
} from "@/interfaces/collaboration.interface";
import { useProjectCollaborators } from "./features/useCollaborators";

/**
 * Permission types that can be checked
 */
export enum Permission {
  // Project-level permissions
  PROJECT_VIEW = "project:view",
  PROJECT_EDIT = "project:edit",
  PROJECT_DELETE = "project:delete",
  PROJECT_PUBLISH = "project:publish",
  PROJECT_SETTINGS = "project:settings",

  // Element permissions
  ELEMENT_VIEW = "element:view",
  ELEMENT_CREATE = "element:create",
  ELEMENT_EDIT = "element:edit",
  ELEMENT_DELETE = "element:delete",
  ELEMENT_REORDER = "element:reorder",

  // Page permissions
  PAGE_VIEW = "page:view",
  PAGE_CREATE = "page:create",
  PAGE_EDIT = "page:edit",
  PAGE_DELETE = "page:delete",

  // Collaboration permissions
  COLLABORATOR_VIEW = "collaborator:view",
  COLLABORATOR_INVITE = "collaborator:invite",
  COLLABORATOR_EDIT = "collaborator:edit",
  COLLABORATOR_REMOVE = "collaborator:remove",

  // Comment permissions
  COMMENT_VIEW = "comment:view",
  COMMENT_CREATE = "comment:create",
  COMMENT_EDIT_OWN = "comment:edit:own",
  COMMENT_EDIT_ALL = "comment:edit:all",
  COMMENT_DELETE_OWN = "comment:delete:own",
  COMMENT_DELETE_ALL = "comment:delete:all",
  COMMENT_RESOLVE = "comment:resolve",

  // Snapshot/Version permissions
  SNAPSHOT_VIEW = "snapshot:view",
  SNAPSHOT_CREATE = "snapshot:create",
  SNAPSHOT_RESTORE = "snapshot:restore",
  SNAPSHOT_DELETE = "snapshot:delete",

  // Export permissions
  EXPORT_CODE = "export:code",
  EXPORT_TEMPLATE = "export:template",

  // CMS permissions
  CMS_VIEW = "cms:view",
  CMS_EDIT = "cms:edit",
  CMS_PUBLISH = "cms:publish",
}

/**
 * Role definitions with their associated permissions (client-side mirror)
 */
const ROLE_PERMISSIONS: Record<CollaboratorRole, Permission[]> = {
  [CollaboratorRole.OWNER]: [
    Permission.PROJECT_VIEW,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_PUBLISH,
    Permission.PROJECT_SETTINGS,
    Permission.ELEMENT_VIEW,
    Permission.ELEMENT_CREATE,
    Permission.ELEMENT_EDIT,
    Permission.ELEMENT_DELETE,
    Permission.ELEMENT_REORDER,
    Permission.PAGE_VIEW,
    Permission.PAGE_CREATE,
    Permission.PAGE_EDIT,
    Permission.PAGE_DELETE,
    Permission.COLLABORATOR_VIEW,
    Permission.COLLABORATOR_INVITE,
    Permission.COLLABORATOR_EDIT,
    Permission.COLLABORATOR_REMOVE,
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_EDIT_OWN,
    Permission.COMMENT_EDIT_ALL,
    Permission.COMMENT_DELETE_OWN,
    Permission.COMMENT_DELETE_ALL,
    Permission.COMMENT_RESOLVE,
    Permission.SNAPSHOT_VIEW,
    Permission.SNAPSHOT_CREATE,
    Permission.SNAPSHOT_RESTORE,
    Permission.SNAPSHOT_DELETE,
    Permission.EXPORT_CODE,
    Permission.EXPORT_TEMPLATE,
    Permission.CMS_VIEW,
    Permission.CMS_EDIT,
    Permission.CMS_PUBLISH,
  ],
  [CollaboratorRole.EDITOR]: [
    Permission.PROJECT_VIEW,
    Permission.PROJECT_EDIT,
    Permission.ELEMENT_VIEW,
    Permission.ELEMENT_CREATE,
    Permission.ELEMENT_EDIT,
    Permission.ELEMENT_DELETE,
    Permission.ELEMENT_REORDER,
    Permission.PAGE_VIEW,
    Permission.PAGE_CREATE,
    Permission.PAGE_EDIT,
    Permission.PAGE_DELETE,
    Permission.COLLABORATOR_VIEW,
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_EDIT_OWN,
    Permission.COMMENT_DELETE_OWN,
    Permission.COMMENT_RESOLVE,
    Permission.SNAPSHOT_VIEW,
    Permission.SNAPSHOT_CREATE,
    Permission.EXPORT_CODE,
    Permission.CMS_VIEW,
    Permission.CMS_EDIT,
  ],
  [CollaboratorRole.VIEWER]: [
    Permission.PROJECT_VIEW,
    Permission.ELEMENT_VIEW,
    Permission.PAGE_VIEW,
    Permission.COLLABORATOR_VIEW,
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_EDIT_OWN,
    Permission.COMMENT_DELETE_OWN,
    Permission.SNAPSHOT_VIEW,
    Permission.CMS_VIEW,
  ],
};

/**
 * Check if a role has a specific permission
 */
function hasPermission(
  role: CollaboratorRole,
  permission: Permission,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Get user's role in a project
 */
function getUserRole(
  userId: string | null | undefined,
  projectId: string,
  collaborators: Collaborator[],
): CollaboratorRole | null {
  if (!userId || !collaborators) return null;

  // Find user in collaborators list
  const userCollab = collaborators.find(
    (c) => c.userId === userId || c.user?.id === userId,
  );

  if (!userCollab) return null;

  return userCollab.role as CollaboratorRole;
}

/**
 * Hook return type
 */
interface UseProjectPermissionsReturn {
  role: CollaboratorRole | null;
  isOwner: boolean;
  isEditor: boolean;
  isViewer: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
  canPublish: boolean;
  canExport: boolean;
}

/**
 * Hook to check user permissions in a project
 *
 * @param projectId - The project ID to check permissions for
 * @param enabled - Whether the query should be enabled (default: true)
 *
 * @example
 * ```tsx
 * const { canEdit, canDelete, hasPermission } = useProjectPermissions(projectId);
 *
 * if (canEdit) {
 *   // Show edit UI
 * }
 *
 * if (hasPermission(Permission.COLLABORATOR_INVITE)) {
 *   // Show invite button
 * }
 * ```
 */
export function useProjectPermissions(
  projectId: string | null,
  enabled = true,
): UseProjectPermissionsReturn {
  const { userId, isLoaded } = useAuth();

  // Get collaborators for this project
  const { data: collaborators = [], isLoading } = useProjectCollaborators(
    projectId,
    enabled && isLoaded && !!userId && !!projectId,
  );

  // Get user's role
  const role = getUserRole(userId, projectId || "", collaborators);

  // Permission checker functions
  const checkPermission = (permission: Permission): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!role) return false;
    return permissions.some((permission) => hasPermission(role, permission));
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!role) return false;
    return permissions.every((permission) => hasPermission(role, permission));
  };

  return {
    role,
    isOwner: role === CollaboratorRole.OWNER,
    isEditor: role === CollaboratorRole.EDITOR,
    isViewer: role === CollaboratorRole.VIEWER,
    isLoading: isLoading || !isLoaded,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    // Convenience flags
    canEdit: checkPermission(Permission.PROJECT_EDIT),
    canView: checkPermission(Permission.PROJECT_VIEW),
    canDelete: checkPermission(Permission.PROJECT_DELETE),
    canManageCollaborators: checkPermission(Permission.COLLABORATOR_EDIT),
    canPublish: checkPermission(Permission.PROJECT_PUBLISH),
    canExport: checkPermission(Permission.EXPORT_CODE),
  };
}

/**
 * Hook to check if user can edit a specific resource they own
 *
 * @param projectId - The project ID
 * @param resourceAuthorId - The author ID of the resource (e.g., comment author)
 *
 * @example
 * ```tsx
 * const canEditComment = useCanEditOwnResource(projectId, comment.authorId);
 * ```
 */
export function useCanEditOwnResource(
  projectId: string | null,
  resourceAuthorId: string | null,
): boolean {
  const { userId } = useAuth();
  const { hasPermission, role } = useProjectPermissions(projectId);

  if (!userId || !resourceAuthorId) return false;

  // User owns the resource
  const isOwner = userId === resourceAuthorId;

  // Check if user has permission to edit their own content
  if (isOwner) {
    return hasPermission(Permission.COMMENT_EDIT_OWN);
  }

  // Check if user has permission to edit all content
  return hasPermission(Permission.COMMENT_EDIT_ALL);
}

/**
 * Hook to check if user can delete a specific resource they own
 *
 * @param projectId - The project ID
 * @param resourceAuthorId - The author ID of the resource
 */
export function useCanDeleteOwnResource(
  projectId: string | null,
  resourceAuthorId: string | null,
): boolean {
  const { userId } = useAuth();
  const { hasPermission } = useProjectPermissions(projectId);

  if (!userId || !resourceAuthorId) return false;

  const isOwner = userId === resourceAuthorId;

  if (isOwner) {
    return hasPermission(Permission.COMMENT_DELETE_OWN);
  }

  return hasPermission(Permission.COMMENT_DELETE_ALL);
}

/**
 * Hook to get human-readable role description
 */
export function useRoleDescription(role: CollaboratorRole | null): string {
  if (!role) return "No access";

  const descriptions: Record<CollaboratorRole, string> = {
    [CollaboratorRole.OWNER]:
      "Full access to all project features including deletion and team management",
    [CollaboratorRole.EDITOR]:
      "Can edit project content, pages, and elements but cannot manage team or delete project",
    [CollaboratorRole.VIEWER]: "Read-only access with ability to comment",
  };

  return descriptions[role];
}
