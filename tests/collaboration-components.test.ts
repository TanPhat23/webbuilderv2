import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CollaboratorsTable from '../src/features/collaboration/components/CollaboratorsTable';
import InvitationsTable from '../src/features/collaboration/components/InvitationsTable';
import ConfirmationDialogs from '../src/features/collaboration/components/ConfirmationDialogs';
import { getRoleBadgeVariant, getRoleIcon } from '../src/features/collaboration/components/utils';
import { CollaboratorRole } from '../src/features/collaboration/interfaces/collaboration.interface';

type Props = Record<string, any>;
const h = React.createElement;

/** All props bags in an element tree, without rendering anything. */
function propsIn(node: unknown, out: Props[] = []): Props[] {
  if (Array.isArray(node)) node.forEach((n) => propsIn(n, out));
  else if (React.isValidElement(node)) {
    const props = node.props as Props;
    out.push(props);
    propsIn(props.children, out);
  }
  return out;
}
function textIn(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textIn).join('');
  if (React.isValidElement(node)) return textIn((node.props as Props).children);
  return '';
}
const html = (el: React.ReactElement) => renderToStaticMarkup(el);

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const DAY = 86_400_000;

const collab = (over: Props = {}) => ({
  id: 'c1', projectId: 'p', userId: 'u1', role: CollaboratorRole.EDITOR, invitedBy: 'owner',
  createdAt: ago(3 * DAY), updatedAt: ago(DAY),
  user: { id: 'u1', email: 'ann@x.io', firstName: 'Ann', lastName: 'Lee' },
  ...over,
}) as any;

const invite = (over: Props = {}) => ({
  id: 'i1', email: 'new@x.io', projectId: 'p', role: CollaboratorRole.VIEWER, token: 't',
  status: 'pending', expiresAt: new Date(Date.now() + 5 * DAY).toISOString(), createdAt: ago(DAY),
  ...over,
}) as any;

// ----------------------------------------------------------------- utils

test('role helpers map every role to an icon and badge variant', () => {
  assert.equal(getRoleBadgeVariant(CollaboratorRole.OWNER), 'default');
  assert.equal(getRoleBadgeVariant(CollaboratorRole.EDITOR), 'secondary');
  assert.equal(getRoleBadgeVariant(CollaboratorRole.VIEWER), 'outline');
  assert.equal(getRoleBadgeVariant('stranger' as never), 'outline');
  for (const role of [CollaboratorRole.OWNER, CollaboratorRole.EDITOR, CollaboratorRole.VIEWER]) {
    assert.ok(getRoleIcon(role), role);
  }
  assert.equal(getRoleIcon('stranger' as never), null);
  assert.match(html(getRoleIcon(CollaboratorRole.OWNER) as React.ReactElement), /yellow-500/);
});

// ----------------------------------------------------------------- CollaboratorsTable

const tableProps = (over: Props = {}) => ({
  collaborators: [collab()],
  currentUserId: 'me',
  isOwner: true,
  isLoading: false,
  isUpdatingRole: false,
  onUpdateRole: () => {},
  onRemoveCollaborator: () => {},
  ...over,
});
const renderCollab = (over: Props = {}) => html(h(CollaboratorsTable, tableProps(over)));

test('CollaboratorsTable shows a spinner while loading and a prompt when empty', () => {
  assert.match(renderCollab({ isLoading: true }), /animate-spin/);
  assert.doesNotMatch(renderCollab({ isLoading: true }), /<table/);
  assert.match(renderCollab({ collaborators: [] }), /No team members yet/);
});

test('CollaboratorsTable lists name, email and relative join date', () => {
  const out = renderCollab();
  assert.match(out, /Ann Lee/);
  assert.match(out, /ann@x\.io/);
  assert.match(out, /3 days ago/);
  assert.match(out, />A</, 'avatar initial');
  assert.doesNotMatch(out, /\(You\)/);
});

test('display name and avatar fall back through first name, last name, email and unknown', () => {
  const user = (u: Props | undefined) => collab({ user: u && { id: 'x', email: 'zed@x.io', ...u } });
  const out = (c: unknown) => renderCollab({ collaborators: [c] });
  assert.match(out(user({ firstName: 'Solo' })), /Solo/);
  assert.match(out(user({ lastName: 'Only' })), /Only/);
  assert.match(out(user({ lastName: 'only' })), />O</);
  assert.match(out(user({})), /Unknown User/);
  assert.match(out(user({})), />Z</, 'email initial');
  assert.match(out(user(undefined)), /Unknown User/);
  assert.match(out(user({ email: '' })), /Unknown User/);
});

test('the current user is tagged, and may leave unless they own the project', () => {
  const mine = collab({ userId: 'me' });
  const out = renderCollab({ collaborators: [mine], isOwner: false });
  assert.match(out, /\(You\)/);
  assert.match(out, /Leave/);
  const owner = collab({ userId: 'me', role: CollaboratorRole.OWNER });
  assert.doesNotMatch(renderCollab({ collaborators: [owner] }), /Leave/);
});

test('only an owner gets the role picker and delete button for other members', () => {
  assert.match(renderCollab({ isOwner: true }), /w-\[140px\]/);
  const asEditor = renderCollab({ isOwner: false });
  assert.doesNotMatch(asEditor, /w-\[140px\]/);
  assert.match(asEditor, /capitalize">editor</);
  const ownerRow = renderCollab({ collaborators: [collab({ role: CollaboratorRole.OWNER })] });
  assert.doesNotMatch(ownerRow, /w-\[140px\]/);
  assert.match(ownerRow, /capitalize">owner</);
});

test('CollaboratorsTable wires role changes and removals to its callbacks', () => {
  const calls: unknown[][] = [];
  const tree = (CollaboratorsTable as unknown as (p: Props) => unknown)(
    tableProps({
      collaborators: [collab(), collab({ id: 'c2', userId: 'me' })],
      onUpdateRole: (...a: unknown[]) => calls.push(['role', ...a]),
      onRemoveCollaborator: (...a: unknown[]) => calls.push(['remove', ...a]),
    }),
  );
  const bags = propsIn(tree);
  bags.find((p) => typeof p.onValueChange === 'function')!.onValueChange(CollaboratorRole.VIEWER);
  for (const p of bags.filter((b) => typeof b.onClick === 'function')) p.onClick();
  assert.deepEqual(calls, [
    ['role', 'c1', CollaboratorRole.VIEWER],
    ['remove', 'c1'],
    ['remove', 'c2'],
  ]);
  const disabled = (CollaboratorsTable as unknown as (p: Props) => unknown)(tableProps({ isUpdatingRole: true }));
  assert.equal(propsIn(disabled).find((p) => 'onValueChange' in p)!.disabled, true);
});

// ----------------------------------------------------------------- InvitationsTable

const renderInvites = (over: Props = {}) =>
  html(h(InvitationsTable, { invitations: [invite()], isLoading: false, onDeleteInvitation: () => {}, ...over }));

test('InvitationsTable shows loading and empty states', () => {
  assert.match(renderInvites({ isLoading: true }), /animate-spin/);
  assert.match(renderInvites({ invitations: [] }), /No pending invitations/);
});

test('invitation status is Pending, Expired or Accepted, in that precedence', () => {
  assert.match(renderInvites(), /Pending/);
  const expired = invite({ expiresAt: ago(DAY) });
  assert.match(renderInvites({ invitations: [expired] }), /Expired/);
  const accepted = invite({ acceptedAt: ago(DAY), expiresAt: ago(DAY) });
  const out = renderInvites({ invitations: [accepted] });
  assert.match(out, /Accepted/);
  assert.doesNotMatch(out, /Expired/, 'accepted beats expired');
});

test('InvitationsTable renders email, role and the sent time', () => {
  const out = renderInvites();
  assert.match(out, /new@x\.io/);
  assert.match(out, /capitalize">viewer</);
  assert.match(out, /1 day ago/);
});

test('only unaccepted invitations can be revoked', () => {
  const deleted: string[] = [];
  const tree = (InvitationsTable as unknown as (p: Props) => unknown)({
    invitations: [invite(), invite({ id: 'i2', acceptedAt: ago(DAY) })],
    isLoading: false,
    onDeleteInvitation: (id: string) => deleted.push(id),
  });
  const buttons = propsIn(tree).filter((p) => typeof p.onClick === 'function');
  assert.equal(buttons.length, 1);
  buttons[0].onClick();
  assert.deepEqual(deleted, ['i1']);
});

// ----------------------------------------------------------------- ConfirmationDialogs

function dialogs(over: Props = {}) {
  const calls: string[] = [];
  const props = {
    deleteCollaboratorId: null, deleteInvitationId: null,
    collaborators: [collab({ id: 'c1', userId: 'u1' }), collab({ id: 'c2', userId: 'me' })],
    currentUserId: 'me', isRemoving: false, isDeleting: false,
    onCancelRemoveCollaborator: () => calls.push('cancel-collab'),
    onConfirmRemoveCollaborator: () => calls.push('confirm-collab'),
    onCancelDeleteInvitation: () => calls.push('cancel-invite'),
    onConfirmDeleteInvitation: () => calls.push('confirm-invite'),
    ...over,
  };
  const tree = (ConfirmationDialogs as unknown as (p: Props) => unknown)(props);
  return { tree, calls, bags: propsIn(tree), text: textIn(tree) };
}

test('each alert dialog is open only while its id is set', () => {
  const closed = dialogs().bags.filter((p) => 'onOpenChange' in p);
  assert.deepEqual(closed.map((p) => p.open), [false, false]);
  assert.deepEqual(dialogs({ deleteCollaboratorId: 'c1' }).bags.filter((p) => 'onOpenChange' in p).map((p) => p.open), [true, false]);
  assert.deepEqual(dialogs({ deleteInvitationId: 'i1' }).bags.filter((p) => 'onOpenChange' in p).map((p) => p.open), [false, true]);
});

test('removing someone else says Remove; removing yourself says Leave', () => {
  assert.match(dialogs({ deleteCollaboratorId: 'c1' }).text, /Remove Team Member/);
  assert.match(dialogs({ deleteCollaboratorId: 'c1' }).text, /They will lose access/);
  const leaving = dialogs({ deleteCollaboratorId: 'c2' }).text;
  assert.match(leaving, /Leave Project/);
  assert.match(leaving, /You will lose access/);
  assert.match(dialogs().text, /Revoke Invitation/);
});

test('closing a dialog cancels it, opening does not, and confirm buttons call through', () => {
  const d = dialogs();
  const [collabDialog, inviteDialog] = d.bags.filter((p) => 'onOpenChange' in p);
  collabDialog.onOpenChange(true);
  inviteDialog.onOpenChange(true);
  assert.deepEqual(d.calls, []);
  collabDialog.onOpenChange(false);
  inviteDialog.onOpenChange(false);
  for (const p of d.bags.filter((b) => typeof b.onClick === 'function')) p.onClick();
  assert.deepEqual(d.calls, ['cancel-collab', 'cancel-invite', 'confirm-collab', 'confirm-invite']);
});

test('the confirm buttons show a spinner while the request is in flight', () => {
  const idle = dialogs();
  const busy = dialogs({ isRemoving: true, isDeleting: true });
  const spinners = (t: unknown) => propsIn(t).filter((p) => String(p.className ?? '').includes('animate-spin')).length;
  assert.equal(spinners(idle.tree), 0);
  assert.equal(spinners(busy.tree), 2);
});
