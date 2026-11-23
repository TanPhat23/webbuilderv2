import assert from "node:assert/strict";
import { test } from "node:test";
import { CollaboratorRole } from "../src/types/collaboration";
import { Permission } from "../src/features/auth/constants/rbac";
import {
  canChangeRole,
  canPerformAction,
  getAssignableRoles,
  getRoleHierarchy,
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isHigherRole,
} from "../src/features/auth/lib/permissions";

test("role permission queries enforce viewer, editor, and owner boundaries", () => {
  assert.equal(hasPermission(CollaboratorRole.VIEWER, Permission.PROJECT_VIEW), true);
  assert.equal(hasPermission(CollaboratorRole.VIEWER, Permission.ELEMENT_EDIT), false);
  assert.equal(hasPermission(CollaboratorRole.EDITOR, Permission.ELEMENT_EDIT), true);
  assert.equal(hasPermission(CollaboratorRole.EDITOR, Permission.PROJECT_DELETE), false);
  assert.equal(hasPermission(CollaboratorRole.OWNER, Permission.PROJECT_DELETE), true);

  assert.equal(
    hasAnyPermission(CollaboratorRole.VIEWER, [Permission.ELEMENT_EDIT, Permission.COMMENT_VIEW]),
    true,
  );
  assert.equal(
    hasAnyPermission(CollaboratorRole.VIEWER, [Permission.ELEMENT_EDIT, Permission.PROJECT_DELETE]),
    false,
  );
  assert.equal(
    hasAllPermissions(CollaboratorRole.EDITOR, [Permission.ELEMENT_VIEW, Permission.ELEMENT_EDIT]),
    true,
  );
  assert.equal(
    hasAllPermissions(CollaboratorRole.EDITOR, [Permission.ELEMENT_VIEW, Permission.PROJECT_DELETE]),
    false,
  );
  assert.ok(getRolePermissions(CollaboratorRole.OWNER).includes(Permission.PROJECT_SETTINGS));
});

test("canPerformAction maps resource actions including comment own/all checks", () => {
  assert.equal(canPerformAction(CollaboratorRole.VIEWER, "view", "project"), true);
  assert.equal(canPerformAction(CollaboratorRole.VIEWER, "edit", "element"), false);
  assert.equal(canPerformAction(CollaboratorRole.EDITOR, "edit", "element"), true);
  assert.equal(canPerformAction(CollaboratorRole.EDITOR, "delete", "project"), false);
  assert.equal(canPerformAction(CollaboratorRole.VIEWER, "edit", "comment"), true);
  assert.equal(canPerformAction(CollaboratorRole.VIEWER, "delete", "comment"), true);
  assert.equal(canPerformAction(CollaboratorRole.OWNER, "delete", "comment"), true);
});

test("role hierarchy, assignable roles, and role-change guards match ownership rules", () => {
  assert.ok(getRoleHierarchy(CollaboratorRole.OWNER) > getRoleHierarchy(CollaboratorRole.EDITOR));
  assert.ok(getRoleHierarchy(CollaboratorRole.EDITOR) > getRoleHierarchy(CollaboratorRole.VIEWER));
  assert.equal(isHigherRole(CollaboratorRole.OWNER, CollaboratorRole.EDITOR), true);
  assert.equal(isHigherRole(CollaboratorRole.EDITOR, CollaboratorRole.OWNER), false);
  assert.equal(isHigherRole(CollaboratorRole.VIEWER, CollaboratorRole.VIEWER), false);

  assert.deepEqual(getAssignableRoles(CollaboratorRole.OWNER), [
    CollaboratorRole.OWNER,
    CollaboratorRole.EDITOR,
    CollaboratorRole.VIEWER,
  ]);
  assert.deepEqual(getAssignableRoles(CollaboratorRole.EDITOR), []);
  assert.deepEqual(getAssignableRoles(CollaboratorRole.VIEWER), []);

  assert.equal(
    canChangeRole(CollaboratorRole.OWNER, CollaboratorRole.VIEWER, CollaboratorRole.EDITOR),
    true,
  );
  assert.equal(
    canChangeRole(CollaboratorRole.EDITOR, CollaboratorRole.VIEWER, CollaboratorRole.OWNER),
    false,
  );
});
