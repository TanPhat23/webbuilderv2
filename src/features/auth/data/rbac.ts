/**
 * RBAC Data Access Layer
 *
 * This module provides data access functions for role-based access control,
 * including user project access checks and collaborator management.
 */

import { CollaboratorRole } from "@/features/collaboration";
import { Permission, ROLE_PERMISSIONS } from "../constants/rbac";
import prisma from "@/lib/prisma";

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

/**
 * Get user's role and access level for a project
 */
export async function getUserProjectAccess(
  userId: string,
  projectId: string
): Promise<UserProjectAccess | null> {
  try {
    // First check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { Id: projectId },
      select: { OwnerId: true, DeletedAt: true },
    });

    if (!project) {
      return null;
    }

    // Don't allow access to deleted projects
    if (project.DeletedAt !== null) {
      return null;
    }

    // User is the owner
    if (project.OwnerId === userId) {
      return {
        userId,
        projectId,
        role: CollaboratorRole.OWNER,
        isOwner: true,
        isCollaborator: false,
      };
    }

    // Check if user is a collaborator
    const collaborator = await prisma.collaborator.findUnique({
      where: {
        UserId_ProjectId: {
          UserId: userId,
          ProjectId: projectId,
        },
      },
      select: { Role: true },
    });

    if (collaborator) {
      return {
        userId,
        projectId,
        role: collaborator.Role as CollaboratorRole,
        isOwner: false,
        isCollaborator: true,
      };
    }

    // User has no access
    return null;
  } catch (error) {
    console.error("[RBAC DAL] Error getting user project access:", error);
    return null;
  }
}

/**
 * Get target collaborator info for modification checks
 */
export async function getCollaboratorInfo(collaboratorId: string) {
  try {
    const collaborator = await prisma.collaborator.findUnique({
      where: { Id: collaboratorId },
      select: { UserId: true, Role: true, ProjectId: true },
    });
    return collaborator;
  } catch (error) {
    console.error("[RBAC DAL] Error getting collaborator info:", error);
    return null;
  }
}

/**
 * Check if user owns a specific resource (e.g., comment)
 */
export async function userOwnsResource(
  userId: string,
  resourceType: "comment",
  resourceId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "comment": {
        const comment = await prisma.comment.findUnique({
          where: { Id: resourceId },
          select: { AuthorId: true },
        });
        return comment?.AuthorId === userId;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error("[RBAC DAL] Error checking resource ownership:", error);
    return false;
  }
}

/**
 * Get all projects where user has a specific permission
 */
export async function getUserProjectsWithPermission(
  userId: string,
  permission: Permission
): Promise<string[]> {
  try {
    // Get owned projects (owners have all permissions)
    const ownedProjects = await prisma.project.findMany({
      where: {
        OwnerId: userId,
        DeletedAt: null,
      },
      select: { Id: true },
    });

    // Get collaborated projects where user has the permission
    const collaborations = await prisma.collaborator.findMany({
      where: {
        UserId: userId,
      },
      select: { ProjectId: true, Role: true },
    });

    const collaboratedProjects = collaborations
      .filter((collab) =>
        ROLE_PERMISSIONS[collab.Role as CollaboratorRole].includes(permission)
      )
      .map((collab) => collab.ProjectId);

    // Combine and deduplicate
    const allProjectIds = [
      ...ownedProjects.map((p) => p.Id),
      ...collaboratedProjects,
    ];

    return [...new Set(allProjectIds)];
  } catch (error) {
    console.error(
      "[RBAC DAL] Error getting user projects with permission:",
      error
    );
    return [];
  }
}

/**
 * Get user's effective permissions for a project
 */
export async function getUserPermissions(
  userId: string,
  projectId: string
): Promise<Permission[]> {
  const access = await getUserProjectAccess(userId, projectId);
  if (!access) return [];

  return ROLE_PERMISSIONS[access.role];
}

/**
 * Count projects owned by user (for owner checks)
 */
export async function countOwnedProjects(userId: string): Promise<number> {
  try {
    return await prisma.project.count({
      where: { OwnerId: userId },
    });
  } catch (error) {
    console.error("[RBAC DAL] Error counting owned projects:", error);
    return 0;
  }
}
