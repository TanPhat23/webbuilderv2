/**
 * Role-Based Access Control (RBAC) System
 *
 * This module defines utilities for managing access control in collaborative projects.
 */

import {
  Permission,
  ROLE_PERMISSIONS,
  ROLE_DESCRIPTIONS,
} from "@/features/auth";
import { CollaboratorRole } from "@/features/collaboration";

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: CollaboratorRole,
  permission: Permission,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: CollaboratorRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: CollaboratorRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: CollaboratorRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role can perform an action on a resource
 * This is a convenience function that maps common actions to permissions
 */
export function canPerformAction(
  role: CollaboratorRole,
  action: "view" | "create" | "edit" | "delete",
  resource:
    | "project"
    | "element"
    | "page"
    | "collaborator"
    | "comment"
    | "snapshot"
    | "cms",
): boolean {
  const permissionKey = `${resource}:${action}` as Permission;

  // Special case for comments - check "own" permissions for editors/viewers
  if (resource === "comment" && (action === "edit" || action === "delete")) {
    const ownPermission = `${resource}:${action}:own` as Permission;
    const allPermission = `${resource}:${action}:all` as Permission;
    return (
      hasPermission(role, allPermission) || hasPermission(role, ownPermission)
    );
  }

  return hasPermission(role, permissionKey);
}

/**
 * Get the hierarchy level of a role (higher = more permissions)
 */
export function getRoleHierarchy(role: CollaboratorRole): number {
  const hierarchy: Record<CollaboratorRole, number> = {
    [CollaboratorRole.VIEWER]: 1,
    [CollaboratorRole.EDITOR]: 2,
    [CollaboratorRole.OWNER]: 3,
  };
  return hierarchy[role];
}

/**
 * Check if one role has higher privileges than another
 */
export function isHigherRole(
  role1: CollaboratorRole,
  role2: CollaboratorRole,
): boolean {
  return getRoleHierarchy(role1) > getRoleHierarchy(role2);
}

/**
 * Get available roles that can be assigned by a user with a given role
 * For example, owners can assign any role, but editors cannot assign roles
 */
export function getAssignableRoles(
  userRole: CollaboratorRole,
): CollaboratorRole[] {
  if (userRole === CollaboratorRole.OWNER) {
    return [
      CollaboratorRole.OWNER,
      CollaboratorRole.EDITOR,
      CollaboratorRole.VIEWER,
    ];
  }
  return [];
}

/**
 * Validate if a role change is allowed
 */
export function canChangeRole(
  currentUserRole: CollaboratorRole,
  targetCurrentRole: CollaboratorRole,
  targetNewRole: CollaboratorRole,
): boolean {
  // Only owners can change roles
  if (currentUserRole !== CollaboratorRole.OWNER) {
    return false;
  }

  // Can't demote yourself from owner if you're the last owner
  // (This check should be done at the application level with database query)

  return true;
}
