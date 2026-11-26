import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  $$q,
  $q,
  act,
  cleanup,
  click,
  flush,
  React,
  render,
  type,
  win,
} from './support/sidebar-dom-harness';
import LiveEditorDemo from '../apps/editor/src/features/landing/components/LiveEditorDemo';
import { CollaborationSettingsPanel } from '../apps/editor/src/features/collaboration/components/CollaborationManager';
import InvitationCard from '../apps/editor/src/features/collaboration/components/InvitationCard';
import InviteMemberDialog from '../apps/editor/src/features/collaboration/components/InviteMemberDialog';
import { CollaboratorRole } from '../apps/editor/src/features/collaboration/interfaces/collaboration.interface';
import { collaboratorKeys } from '../apps/editor/src/features/collaboration/hooks/useCollaborators';
import { invitationKeys } from '../apps/editor/src/features/collaboration/hooks/useInvitations';
import { userKeys } from '../apps/editor/src/features/users/hooks/useUsers';

const h = React.createElement;

const realFetch = globalThis.fetch;
const realError = console.error;
const realLog = console.log;
const fetchCalls: Array<{ method: string; path: string; body: unknown }> = [];

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

beforeEach(() => {
  fetchCalls.length = 0;
  console.error = () => {};
  console.log = () => {};
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://localhost:3000',
    );
    if (url.pathname === '/api/gettoken') {
      return Response.json({ tokenJWT: 'tok-test' });
    }
    const method = init?.method ?? 'GET';
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    fetchCalls.push({ method, path: url.pathname, body });
    if (url.pathname === '/api/v1/users/search') {
      return Response.json([
        { id: 'u2', email: 'alex@example.com', firstName: 'Alex', lastName: 'Ng' },
      ]);
    }
    return Response.json({ ok: true, id: 'res-1', email: 'new@example.com', role: 'viewer' });
  }) as typeof fetch;
});

afterEach(async () => {
  await cleanup();
  globalThis.fetch = realFetch;
  console.error = realError;
  console.log = realLog;
});

after(cleanup);

test('LiveEditorDemo updates heading size, alignment, block selection, button style, and inline text edits', async () => {
  const prevMatchMedia = win.matchMedia;
  win.matchMedia = () => ({
    matches: true,
    media: '',
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

  try {
    const r = await render(h(LiveEditorDemo));

    assert.ok($q(r.container, 'h2').textContent?.includes('Edit this page'));
    assert.ok(r.container.textContent?.includes('Updates as you edit'));

    const buttons = $$q<HTMLButtonElement>(r.container, 'button');
    const sizeM = buttons.find((b) => b.textContent === 'M');
    const alignCenter = buttons.find((b) => b.textContent === 'Center');
    assert.ok(sizeM && alignCenter);
    await click(sizeM);
    await click(alignCenter);
    assert.equal(sizeM.getAttribute('aria-pressed'), 'true');
    assert.ok($q(r.container, 'pre[aria-label="Generated React code"]').textContent?.includes('text-3xl'));
    assert.ok($q(r.container, 'pre[aria-label="Generated React code"]').textContent?.includes('items-center'));

    const headingBox = $q<HTMLElement>(r.container, '[role="textbox"][aria-label="Heading text"]');
    const bodyBox = $q<HTMLElement>(r.container, '[role="textbox"][aria-label="Paragraph text"]');
    const btnBox = $q<HTMLElement>(r.container, '[role="textbox"][aria-label="Button label"]');

    await act(() => {
      headingBox.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      headingBox.textContent = 'A'.repeat(100);
      headingBox.dispatchEvent(new win.Event('input', { bubbles: true }));
    });
    assert.equal(headingBox.textContent?.length, 72);

    await act(() => {
      bodyBox.focus();
      bodyBox.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true }));
      bodyBox.textContent = 'Updated summary copy';
      bodyBox.dispatchEvent(new win.Event('input', { bubbles: true }));
    });
    assert.ok(r.container.textContent?.includes('Paragraph'));

    await act(() => {
      btnBox.focus();
      btnBox.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true }));
      btnBox.textContent = 'Book Now';
      btnBox.dispatchEvent(new win.Event('input', { bubbles: true }));
    });
    const outlineBtn = $$q<HTMLButtonElement>(r.container, 'button').find((b) => b.textContent === 'Outline');
    assert.ok(outlineBtn);
    await click(outlineBtn);
    assert.ok($q(r.container, 'pre[aria-label="Generated React code"]').textContent?.includes('border border-black'));
  } finally {
    win.matchMedia = prevMatchMedia;
  }
});

test('CollaborationSettingsPanel, InviteMemberDialog, and InvitationCard render collaborator views and submit invites', async () => {
  const client = makeQueryClient();
  try {
    client.setQueryData(collaboratorKeys.byProject('p1'), [
      {
        id: 'col-1',
        projectId: 'p1',
        userId: 'owner-1',
        role: CollaboratorRole.OWNER,
        invitedBy: 'owner-1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        user: { id: 'owner-1', email: 'owner@example.com', firstName: 'Owner', lastName: 'One' },
      },
      {
        id: 'col-2',
        projectId: 'p1',
        userId: 'editor-1',
        role: CollaboratorRole.EDITOR,
        invitedBy: 'owner-1',
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02',
        user: { id: 'editor-1', email: 'editor@example.com', firstName: 'Ed', lastName: 'Itor' },
      },
    ]);
    client.setQueryData(invitationKeys.byProject('p1'), [
      {
        id: 'inv-1',
        email: 'pending@example.com',
        projectId: 'p1',
        role: CollaboratorRole.VIEWER,
        token: 'tok',
        status: 'pending',
        expiresAt: '2026-12-31',
        createdAt: '2026-01-03',
      },
    ]);

    const ownerMount = await render(
      h(
        QueryClientProvider,
        { client },
        h(CollaborationSettingsPanel, { projectId: 'p1', currentUserId: 'owner-1', isOwner: true }),
      ),
    );
    assert.ok(ownerMount.container.textContent?.includes('Team Members'));
    assert.ok(ownerMount.container.textContent?.includes('Pending Invitations'));
    assert.ok(ownerMount.container.textContent?.includes('Invite Member'));

    const memberMount = await render(
      h(
        QueryClientProvider,
        { client },
        h(CollaborationSettingsPanel, { projectId: 'p1', currentUserId: 'editor-1', isOwner: false }),
      ),
    );
    assert.equal(memberMount.container.textContent?.includes('Pending Invitations'), false);
    await cleanup();

    const invited: Array<[string, CollaboratorRole]> = [];
    let openState = true;
    client.setQueryData(userKeys.search('alex', 20, 0), [
      { id: 'u2', email: 'alex@example.com', firstName: 'Alex', lastName: 'Ng' },
    ]);
    await render(
      h(
        QueryClientProvider,
        { client },
        h(InviteMemberDialog, {
          isOpen: true,
          onOpenChange: (next) => { openState = next; },
          onInvite: async (email, role) => { invited.push([email, role]); },
          isCreating: false,
        }),
      ),
    );
    const cmdInput = $q<HTMLInputElement>(document.body, 'input[placeholder*="Search users"]');
    await type(cmdInput, 'alex');
    await flush(10);
    const sendDialogBtn = $$q<HTMLButtonElement>(document.body, 'button').find((b) =>
      b.textContent?.includes('Send Invitation'),
    );
    assert.ok(sendDialogBtn);
    await click(sendDialogBtn);
    await flush(10);
    assert.deepEqual(invited, [['alex', CollaboratorRole.VIEWER]]);
    assert.equal(openState, false);
    await cleanup();

    const card = await render(
      h(QueryClientProvider, { client }, h(InvitationCard, { projectId: 'p1', projectName: 'Launchpad' })),
    );
    const emailInput = $q<HTMLInputElement>(card.container, '#invite-email');
    const form = $q<HTMLFormElement>(card.container, 'form');
    assert.ok(card.container.textContent?.includes('Launchpad'));
    await type(emailInput, 'colleague@example.com');
    await act(async () => {
      form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(10);
    assert.equal(
      fetchCalls.some((c) => c.method === 'POST' && c.path === '/api/v1/invitations'),
      true,
    );
  } finally {
    await cleanup();
    client.clear();
  }
});
