import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { redirectModules } from './support/test-stub-modules';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@tanstack/react-router': './test-router-stub.ts',
});

const { authState } = await import('./support/test-clerk-stub');
const { paramsState } = await import('./support/test-router-stub');
const { CollaboratorRole } = await import('../apps/editor/src/types/collaboration');
const { Permission, ROLE_PERMISSIONS } = await import('../apps/editor/src/features/auth/constants/rbac');
const { collaboratorKeys } = await import('../apps/editor/src/features/collaboration/hooks/useCollaborators');
const projectPerms = await import('../apps/editor/src/features/projects/hooks/useProjectPermissions');
const editorPerms = await import('../apps/editor/src/features/editor/hooks/useEditorPermissions');

type Collab = { userId: string; role: string; user?: { id: string } };

function render<T>(
  hook: () => T,
  seed: Record<string, Collab[]> = {},
): T {
  // gcTime: Infinity keeps react-query from scheduling timers that would hold
  // the process open after the test finishes.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  try {
    for (const [projectId, collabs] of Object.entries(seed)) {
      client.setQueryData(collaboratorKeys.byProject(projectId), collabs);
    }
    let result: T | undefined;
    function Probe(): ReactNode {
      result = hook();
      return null;
    }
    renderToStaticMarkup(
      createElement(QueryClientProvider, { client }, createElement(Probe)),
    );
    return result as T;
  } finally {
    client.clear();
  }
}

function as(userId: string | null, role?: CollaboratorRoleValue, extra: Partial<Collab> = {}) {
  authState.userId = userId;
  authState.isLoaded = true;
  paramsState.params = {};
  return role ? { p1: [{ userId: userId ?? 'x', role, ...extra }] } : { p1: [] };
}
type CollaboratorRoleValue = (typeof CollaboratorRole)[keyof typeof CollaboratorRole];

test('role resolution: owner / editor / viewer flags follow the collaborator row', () => {
  for (const [role, flags] of [
    [CollaboratorRole.OWNER, [true, false, false]],
    [CollaboratorRole.EDITOR, [false, true, false]],
    [CollaboratorRole.VIEWER, [false, false, true]],
  ] as const) {
    const perms = render(() => projectPerms.useProjectPermissions('p1'), as('u1', role));
    assert.equal(perms.role, role);
    assert.deepEqual([perms.isOwner, perms.isEditor, perms.isViewer], flags);
    assert.equal(perms.isLoading, false);
  }
});

test('role resolution also matches on the nested user id and ignores other users', () => {
  authState.userId = 'u1';
  authState.isLoaded = true;
  const viaNested = render(
    () => projectPerms.useProjectPermissions('p1'),
    { p1: [{ userId: 'other', user: { id: 'u1' }, role: CollaboratorRole.EDITOR }] },
  );
  assert.equal(viaNested.role, CollaboratorRole.EDITOR);

  const stranger = render(
    () => projectPerms.useProjectPermissions('p1'),
    { p1: [{ userId: 'someone-else', role: CollaboratorRole.OWNER }] },
  );
  assert.equal(stranger.role, null);
  assert.equal(stranger.canEdit, false);
  assert.equal(stranger.hasPermission(Permission.PROJECT_VIEW), false);
  assert.equal(stranger.hasAnyPermission([Permission.PROJECT_VIEW]), false);
  assert.equal(stranger.hasAllPermissions([Permission.PROJECT_VIEW]), false);
});

test('signed-out users have no role and the hook reports loading until Clerk is ready', () => {
  const out = render(() => projectPerms.useProjectPermissions('p1'), as(null));
  assert.equal(out.role, null);
  assert.equal(out.canView, false);

  authState.userId = 'u1';
  authState.isLoaded = false;
  assert.equal(render(() => projectPerms.useProjectPermissions('p1')).isLoading, true);
  authState.isLoaded = true;
});

test('permission helpers match the RBAC table for every role', () => {
  for (const role of Object.values(CollaboratorRole)) {
    const perms = render(() => projectPerms.useProjectPermissions('p1'), as('u1', role));
    const granted = ROLE_PERMISSIONS[role];
    for (const p of Object.values(Permission)) {
      assert.equal(perms.hasPermission(p), granted.includes(p), `${role} ${p}`);
    }
    assert.equal(perms.canEdit, granted.includes(Permission.PROJECT_EDIT));
    assert.equal(perms.canView, true);
    assert.equal(perms.canDelete, role === CollaboratorRole.OWNER);
    assert.equal(perms.canPublish, role === CollaboratorRole.OWNER);
    assert.equal(perms.canManageCollaborators, role === CollaboratorRole.OWNER);
    assert.equal(perms.canExport, role !== CollaboratorRole.VIEWER);
    assert.equal(perms.hasAllPermissions(granted), true);
    assert.equal(
      perms.hasAnyPermission([Permission.PROJECT_DELETE, Permission.PROJECT_VIEW]),
      true,
    );
  }
  const viewer = render(() => projectPerms.useProjectPermissions('p1'), as('u1', CollaboratorRole.VIEWER));
  assert.equal(viewer.hasAnyPermission([Permission.PROJECT_DELETE, Permission.PROJECT_PUBLISH]), false);
  assert.equal(viewer.hasAllPermissions([Permission.PROJECT_VIEW, Permission.PROJECT_DELETE]), false);
});

test('a disabled or project-less query yields no role', () => {
  authState.userId = 'u1';
  const noProject = render(() => projectPerms.useProjectPermissions(null));
  assert.equal(noProject.role, null);
  const disabled = render(() => projectPerms.useProjectPermissions('p1', false));
  assert.equal(disabled.role, null);
});

test('own-vs-all resource checks pick the right permission', () => {
  const owner = as('u1', CollaboratorRole.OWNER);
  const viewer = as('u1', CollaboratorRole.VIEWER);
  const editorSeed = as('u1', CollaboratorRole.EDITOR);

  assert.equal(render(() => projectPerms.useCanEditOwnResource('p1', 'u1'), viewer), true);
  assert.equal(render(() => projectPerms.useCanEditOwnResource('p1', 'u2'), viewer), false);
  assert.equal(render(() => projectPerms.useCanEditOwnResource('p1', 'u2'), owner), true);
  assert.equal(render(() => projectPerms.useCanEditOwnResource('p1', null), owner), false);
  assert.equal(render(() => projectPerms.useCanDeleteOwnResource('p1', 'u1'), editorSeed), true);
  assert.equal(render(() => projectPerms.useCanDeleteOwnResource('p1', 'u2'), editorSeed), false);
  assert.equal(render(() => projectPerms.useCanDeleteOwnResource('p1', 'u2'), owner), true);
  assert.equal(render(() => projectPerms.useCanDeleteOwnResource('p1', null), owner), false);

  authState.userId = null;
  assert.equal(render(() => projectPerms.useCanEditOwnResource('p1', 'u1')), false);
  assert.equal(render(() => projectPerms.useCanDeleteOwnResource('p1', 'u1')), false);
});

test('useRoleDescription maps roles to copy and null to "No access"', () => {
  assert.equal(render(() => projectPerms.useRoleDescription(null)), 'No access');
  assert.match(render(() => projectPerms.useRoleDescription(CollaboratorRole.OWNER)), /Full access/);
  assert.match(render(() => projectPerms.useRoleDescription(CollaboratorRole.VIEWER)), /Read-only/);
});

test('useEditorPermissions maps each editor capability from the role', () => {
  const owner = render(() => editorPerms.useEditorPermissions('p1'), as('u1', CollaboratorRole.OWNER));
  for (const [key, value] of Object.entries(owner)) {
    if (typeof value === 'boolean' && key !== 'isLoading') assert.equal(value, true, key);
  }
  assert.equal(owner.role, CollaboratorRole.OWNER);

  const editor = render(() => editorPerms.useEditorPermissions('p1'), as('u1', CollaboratorRole.EDITOR));
  assert.equal(editor.canCreateElements, true);
  assert.equal(editor.canDeleteElements, true);
  assert.equal(editor.canExportProject, true);
  assert.equal(editor.canEditComments, true);
  assert.equal(editor.canDeleteComments, true);
  assert.equal(editor.canPublishProject, false);
  assert.equal(editor.canDeleteProject, false);
  assert.equal(editor.canAccessSettings, false);
  assert.equal(editor.canInviteCollaborators, false);
  assert.equal(editor.canManageCollaborators, false);
  assert.equal(editor.canRestoreSnapshots, false);
  assert.equal(editor.canPublishCMS, false);
  assert.equal(editor.canEditCMS, true);

  const viewer = render(() => editorPerms.useEditorPermissions('p1'), as('u1', CollaboratorRole.VIEWER));
  assert.equal(viewer.canEditElements, false);
  assert.equal(viewer.canCreateComments, true);
  assert.equal(viewer.canResolveComments, false);
  assert.equal(viewer.canEditComments, true, 'viewers may edit their own comments');
});

test('can(action, resource) composes the permission key', () => {
  const viewer = render(() => editorPerms.useEditorPermissions('p1'), as('u1', CollaboratorRole.VIEWER));
  assert.equal(viewer.can('view', 'element'), true);
  assert.equal(viewer.can('create', 'element'), false);
  assert.equal(viewer.can('publish', 'project'), false);
  assert.equal(viewer.can('view', 'cms'), true);
  assert.equal(viewer.hasPermission(Permission.SNAPSHOT_VIEW), true);
});

test('useEditorPermissions falls back to the route param when no project id is passed', () => {
  authState.userId = 'u1';
  paramsState.params = { id: 'p1' };
  const seed = { p1: [{ userId: 'u1', role: CollaboratorRole.EDITOR }] };
  assert.equal(render(() => editorPerms.useEditorPermissions(null), seed).role, CollaboratorRole.EDITOR);
  assert.equal(render(() => editorPerms.useEditorPermissions(undefined), seed).canEditElements, true);
  paramsState.params = {};
  assert.equal(render(() => editorPerms.useEditorPermissions(null), seed).role, null);
});

test('convenience hooks combine the underlying capabilities', () => {
  const owner = as('u1', CollaboratorRole.OWNER);
  const editor = as('u1', CollaboratorRole.EDITOR);
  const viewer = as('u1', CollaboratorRole.VIEWER);

  assert.equal(render(() => editorPerms.useCanEditElements('p1'), editor), true);
  assert.equal(render(() => editorPerms.useCanEditElements('p1'), viewer), false);
  assert.equal(render(() => editorPerms.useCanManageProject('p1'), owner), true);
  assert.equal(render(() => editorPerms.useCanManageProject('p1'), editor), false);
  assert.equal(render(() => editorPerms.useCanCollaborate('p1'), owner), true);
  assert.equal(render(() => editorPerms.useCanCollaborate('p1'), editor), false);

  assert.equal(render(() => editorPerms.useCanEditElement('p1', 'Text'), editor), true);
  assert.equal(render(() => editorPerms.useCanEditElement('p1'), viewer), false);
  assert.equal(render(() => editorPerms.useCanEditElement('p1', 'Form'), editor), true);
});

test('useEditorUIState exposes toolbar flags and human-readable disabled reasons', () => {
  const ui = render(() => editorPerms.useEditorUIState('p1'), as('u1', CollaboratorRole.VIEWER));
  assert.equal(ui.deleteEnabled, false);
  assert.equal(ui.editEnabled, false);
  assert.equal(ui.createEnabled, false);
  assert.equal(ui.reorderEnabled, false);
  assert.equal(ui.pageDeleteEnabled, false);
  assert.equal(ui.pageCreateEnabled, false);
  assert.equal(ui.pageEditEnabled, false);
  assert.equal(ui.publishEnabled, false);
  assert.equal(ui.exportEnabled, false);
  assert.equal(ui.settingsEnabled, false);
  assert.equal(ui.inviteEnabled, false);
  assert.equal(ui.manageCollaboratorsEnabled, false);
  assert.equal(ui.commentCreateEnabled, true);
  assert.equal(ui.commentDeleteEnabled, true);
  assert.equal(ui.commentEditEnabled, true);
  assert.equal(ui.snapshotCreateEnabled, false);
  assert.equal(ui.snapshotRestoreEnabled, false);
  assert.equal(ui.getDisabledReason('view', 'project'), '');
  assert.equal(
    ui.getDisabledReason('publish', 'project'),
    "viewer role doesn't have permission to publish project",
  );

  const anon = render(() => editorPerms.useEditorUIState('p1'), as(null));
  assert.equal(
    anon.getDisabledReason('edit', 'page'),
    "Your role doesn't have permission to edit page",
  );

  const owner = render(() => editorPerms.useEditorUIState('p1'), as('u1', CollaboratorRole.OWNER));
  assert.equal(owner.deleteEnabled && owner.publishEnabled && owner.snapshotRestoreEnabled, true);
});

test('comment own/all hooks respect authorship and missing identities', () => {
  const viewer = as('u1', CollaboratorRole.VIEWER);
  const owner = as('u1', CollaboratorRole.OWNER);

  assert.equal(render(() => editorPerms.useCanEditOwnComment('p1', 'u1'), viewer), true);
  assert.equal(render(() => editorPerms.useCanEditOwnComment('p1', 'u2'), viewer), false);
  assert.equal(render(() => editorPerms.useCanEditOwnComment('p1', 'u2'), owner), true);
  assert.equal(render(() => editorPerms.useCanEditOwnComment('p1', null), owner), false);

  assert.equal(render(() => editorPerms.useCanDeleteOwnComment('p1', 'u1'), viewer), true);
  assert.equal(render(() => editorPerms.useCanDeleteOwnComment('p1', 'u2'), viewer), false);
  assert.equal(render(() => editorPerms.useCanDeleteOwnComment('p1', 'u2'), owner), true);
  assert.equal(render(() => editorPerms.useCanDeleteOwnComment('p1', null), owner), false);

  authState.userId = null;
  assert.equal(render(() => editorPerms.useCanEditOwnComment('p1', 'u1')), false);
  assert.equal(render(() => editorPerms.useCanDeleteOwnComment('p1', 'u1')), false);
});
