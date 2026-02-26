/**
 * Role-Based Access Control (RBAC) Constants
 *
 * This module defines permissions, roles, and role descriptions for the RBAC system.
 */

import { CollaboratorRole } from "@/features/collaboration";

/**
 * Granular permissions for project resources
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
 * Role definitions with their associated permissions
 */
export const ROLE_PERMISSIONS: Record<CollaboratorRole, Permission[]> = {
  [CollaboratorRole.OWNER]: [
    // Owners have all permissions
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
    // Editors can modify content but not project settings or collaborators
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
    // Viewers can only view content and add comments
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
 * Human-readable descriptions for roles
 */
export const ROLE_DESCRIPTIONS: Record<CollaboratorRole, string> = {
  [CollaboratorRole.OWNER]: "Full access to all project features including deletion and team management",
  [CollaboratorRole.EDITOR]: "Can edit project content, pages, and elements but cannot manage team or delete project",
  [CollaboratorRole.VIEWER]: "Read-only access with ability to comment",
};
