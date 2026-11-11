/**
 * RBAC data access: asks the Go API for the signed-in user's role on a
 * project. Server-only (uses the request's Clerk session token).
 */

import { CollaboratorRole } from "@/features/collaboration";
import { Permission, ROLE_PERMISSIONS } from "../constants/rbac";
import { getAuthToken } from "../lib/gettoken";
import { projectService } from "@/features/projects/services/project.service";

/**
 * User access information for a project
 */
export interface UserProjectAccess {
  userId: string;
  projectId: string;
  role: CollaboratorRole;
  isOwner: boolean;
  isCollaborator: boolean;
}

const ROLES = new Set<string>(Object.values(CollaboratorRole));

/**
 * The signed-in user's role on a project, or null when they have no access
 * (missing, deleted or unshared project) or the check fails. `userId` must be
 * the signed-in user: the API answers for the session's user only.
 */
export async function getUserProjectAccess(
  userId: string,
  projectId: string,
): Promise<UserProjectAccess | null> {
  try {
    const { userId: sessionUserId, token } = await getAuthToken();
    if (sessionUserId !== userId) {
      console.error("[RBAC] Access can only be checked for the signed-in user");
      return null;
    }
    const access = await projectService.getProjectAccess(projectId, token);
    if (!ROLES.has(access.role)) return null;
    return {
      userId,
      projectId,
      role: access.role as CollaboratorRole,
      isOwner: access.isOwner,
      isCollaborator: access.isCollaborator,
    };
  } catch (error) {
    // 404 (no access) and transport errors both deny.
    console.error("[RBAC] Error getting user project access:", error);
    return null;
  }
}

/**
 * Get user's effective permissions for a project
 */
export async function getUserPermissions(
  userId: string,
  projectId: string,
): Promise<Permission[]> {
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) return [];

  return ROLE_PERMISSIONS[access.role];
}
