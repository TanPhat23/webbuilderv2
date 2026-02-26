"use client";

import { useAuth } from "@clerk/nextjs";
import {
  CollaboratorRole,
  Collaborator,
} from "@/features/collaboration";
import {
  Permission,
  ROLE_PERMISSIONS,
  ROLE_DESCRIPTIONS,
} from "@/features/auth/constants/rbac";
import { useProjectCollaborators } from "@/features/collaboration";

export { Permission };

function hasPermission(
  role: CollaboratorRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

function getUserRole(
  userId: string | null | undefined,
  collaborators: Collaborator[],
): CollaboratorRole | null {
  if (!userId) return null;
  const collab = collaborators.find(
    (c) => c.userId === userId || c.user?.id === userId,
  );
  return collab ? (collab.role as CollaboratorRole) : null;
}

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

export function useProjectPermissions(
  projectId: string | null,
  enabled = true,
): UseProjectPermissionsReturn {
  const { userId, isLoaded } = useAuth();

  const { data: collaborators = [], isLoading } = useProjectCollaborators(
    projectId,
    enabled && isLoaded && !!userId && !!projectId,
  );

  const role = getUserRole(userId, collaborators);

  const checkPermission = (permission: Permission): boolean =>
    role ? hasPermission(role, permission) : false;

  const checkAnyPermission = (permissions: Permission[]): boolean =>
    role ? permissions.some((p) => hasPermission(role, p)) : false;

  const checkAllPermissions = (permissions: Permission[]): boolean =>
    role ? permissions.every((p) => hasPermission(role, p)) : false;

  return {
    role,
    isOwner: role === CollaboratorRole.OWNER,
    isEditor: role === CollaboratorRole.EDITOR,
    isViewer: role === CollaboratorRole.VIEWER,
    isLoading: isLoading || !isLoaded,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canEdit: checkPermission(Permission.PROJECT_EDIT),
    canView: checkPermission(Permission.PROJECT_VIEW),
    canDelete: checkPermission(Permission.PROJECT_DELETE),
    canManageCollaborators: checkPermission(Permission.COLLABORATOR_EDIT),
    canPublish: checkPermission(Permission.PROJECT_PUBLISH),
    canExport: checkPermission(Permission.EXPORT_CODE),
  };
}

export function useCanEditOwnResource(
  projectId: string | null,
  resourceAuthorId: string | null,
): boolean {
  const { userId } = useAuth();
  const { hasPermission: checkPermission } = useProjectPermissions(projectId);

  if (!userId || !resourceAuthorId) return false;

  return userId === resourceAuthorId
    ? checkPermission(Permission.COMMENT_EDIT_OWN)
    : checkPermission(Permission.COMMENT_EDIT_ALL);
}

export function useCanDeleteOwnResource(
  projectId: string | null,
  resourceAuthorId: string | null,
): boolean {
  const { userId } = useAuth();
  const { hasPermission: checkPermission } = useProjectPermissions(projectId);

  if (!userId || !resourceAuthorId) return false;

  return userId === resourceAuthorId
    ? checkPermission(Permission.COMMENT_DELETE_OWN)
    : checkPermission(Permission.COMMENT_DELETE_ALL);
}

export function useRoleDescription(role: CollaboratorRole | null): string {
  if (!role) return "No access";
  return ROLE_DESCRIPTIONS[role];
}
