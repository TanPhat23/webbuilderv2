/**
 * Authorization Helpers
 *
 * This module provides functions to check if a user has access to perform
 * specific actions on projects and their resources.
 */

import { CollaboratorRole } from "@/features/collaboration";
import { Permission } from "../constants/rbac";
import { hasPermission } from "./permissions";
import { getUserProjectAccess, getUserPermissions } from "../data/rbac";
import { type UserProjectAccess } from "../data/rbac";

export type { UserProjectAccess };

export { getUserProjectAccess, getUserPermissions };

/**
 * Result of an authorization check
 */
export interface AuthorizationResult {
  authorized: boolean;
  role?: CollaboratorRole;
  reason?: string;
}

/**
 * Check if user has permission to perform an action on a project
 */
export async function authorizeUserAction(
  userId: string,
  projectId: string,
  permission: Permission,
): Promise<AuthorizationResult> {
  const access = await getUserProjectAccess(userId, projectId);

  if (!access) {
    return {
      authorized: false,
      reason: "User does not have access to this project",
    };
  }

  const hasRequiredPermission = hasPermission(access.role, permission);

  if (!hasRequiredPermission) {
    return {
      authorized: false,
      role: access.role,
      reason: `User role '${access.role}' does not have permission '${permission}'`,
    };
  }

  return {
    authorized: true,
    role: access.role,
  };
}

/**
 * Check if user has any of the specified permissions
 */
export async function authorizeUserAnyPermission(
  userId: string,
  projectId: string,
  permissions: Permission[],
): Promise<AuthorizationResult> {
  const access = await getUserProjectAccess(userId, projectId);

  if (!access) {
    return {
      authorized: false,
      reason: "User does not have access to this project",
    };
  }

  const hasAnyPermission = permissions.some((permission) =>
    hasPermission(access.role, permission),
  );

  if (!hasAnyPermission) {
    return {
      authorized: false,
      role: access.role,
      reason: `User role '${access.role}' does not have any of the required permissions`,
    };
  }

  return {
    authorized: true,
    role: access.role,
  };
}

/**
 * Middleware-friendly authorization check
 * Throws an error if authorization fails
 */
export async function requirePermission(
  userId: string,
  projectId: string,
  permission: Permission,
): Promise<UserProjectAccess> {
  const result = await authorizeUserAction(userId, projectId, permission);

  if (!result.authorized) {
    const error = new Error(result.reason || "Unauthorized");
    (error as any).status = 403;
    throw error;
  }

  const access = await getUserProjectAccess(userId, projectId);
  if (!access) {
    const error = new Error("Failed to get user access information");
    (error as any).status = 500;
    throw error;
  }

  return access;
}

/**
 * Check if user has permission to access realtime collaboration features
 */
export async function canAccessRealtimeCollab(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) return false;

  // All roles with project access can use realtime features
  // Viewers can see cursors but can't edit
  return hasPermission(access.role, Permission.PROJECT_VIEW);
}
