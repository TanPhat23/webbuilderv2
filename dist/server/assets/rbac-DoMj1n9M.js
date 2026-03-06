import { R as ROLE_PERMISSIONS, d as prisma, C as CollaboratorRole } from "./prisma-Cq49YOYM.js";
import "react/jsx-runtime";
import "react";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}
async function getUserProjectAccess(userId, projectId) {
  try {
    const project = await prisma.project.findUnique({
      where: { Id: projectId },
      select: { OwnerId: true, DeletedAt: true }
    });
    if (!project) {
      return null;
    }
    if (project.DeletedAt !== null) {
      return null;
    }
    if (project.OwnerId === userId) {
      return {
        userId,
        projectId,
        role: CollaboratorRole.OWNER,
        isOwner: true,
        isCollaborator: false
      };
    }
    const collaborator = await prisma.collaborator.findUnique({
      where: {
        UserId_ProjectId: {
          UserId: userId,
          ProjectId: projectId
        }
      },
      select: { Role: true }
    });
    if (collaborator) {
      return {
        userId,
        projectId,
        role: collaborator.Role,
        isOwner: false,
        isCollaborator: true
      };
    }
    return null;
  } catch (error) {
    console.error("[RBAC DAL] Error getting user project access:", error);
    return null;
  }
}
export {
  getUserProjectAccess as g,
  hasPermission as h
};
