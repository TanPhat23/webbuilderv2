import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { toast } from 'sonner';
import { QueryClient } from '@tanstack/react-query';
import { componentFromDrop } from '../src/features/editor/lib/componentDrop';
import { resolveInsertedElement } from '../src/features/editor/lib/dropElement';
import { projectKeys } from '../src/features/projects/hooks/useProjects';
import { projectComponentElementsKey } from '../src/features/editor/hooks/useProjectComponents';
import { componentLibraryKey } from '../src/features/editor/services/component-library.service';
import { customComps } from '../src/features/editor/lib/customcomponents/customComponents';
import type { EditorElement } from '../src/types/global.type';

const clients: QueryClient[] = [];
after(() => clients.forEach((c) => c.clear()));

const el = (over: Record<string, unknown>) =>
  ({ content: '', styles: {}, elements: undefined, ...over }) as unknown as EditorElement;

const page = (id: string, type: 'sp' | 'cp', deleted = false) =>
  ({ Id: id, Type: type, Name: id, ProjectId: 'proj', DeletedAt: deleted ? new Date() : null }) as never;

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  clients.push(client);
  client.setQueryData(projectKeys.pages('proj'), [
    page('home', 'sp'),
    page('card', 'cp'),
    page('old', 'cp', true),
    page('twin', 'cp'),
  ]);
  client.setQueryData(projectComponentElementsKey('proj'), [
    el({ id: 'card-root', pageId: 'card', type: 'Frame', elements: [el({ id: 'card-text', pageId: 'card', type: 'Text', parentId: 'card-root' })] }),
    el({ id: 'old-root', pageId: 'old', type: 'Frame' }),
    el({ id: 'twin-a', pageId: 'twin', type: 'Frame' }),
    el({ id: 'twin-b', pageId: 'twin', type: 'Frame' }),
  ]);
  client.setQueryData(componentLibraryKey('u1'), [
    {
      id: 'snap-ok',
      name: 'Hero',
      structure: el({
        id: 'hero',
        pageId: 'elsewhere',
        type: 'Frame',
        settings: { sharedSection: 'x', keep: 1 },
        elements: [el({ id: 'hero-text', pageId: 'elsewhere', type: 'Text', parentId: 'hero' })],
      }),
    },
    { id: 'snap-bad', name: 'Broken', structure: { id: 5, type: 'Nope' } },
  ]);
  return client;
}

test('a component drop becomes a linked instance of the master on the target page', () => {
  const instance = componentFromDrop({ kind: 'component', id: 'card' }, setup(), 'proj', 'home', 'u1');
  assert.ok(instance);
  assert.equal(instance.pageId, 'home');
  assert.equal(instance.type, 'Frame');
  assert.deepEqual((instance.settings as { component: unknown }).component, { pageId: 'card', rootId: 'card-root' });
  assert.notEqual(instance.id, 'card-root');
});

test('component drops are refused for unknown, deleted or ambiguous masters', () => {
  const client = setup();
  for (const id of ['missing', 'old', 'twin', 'home']) {
    assert.equal(componentFromDrop({ kind: 'component', id }, client, 'proj', 'home', 'u1'), undefined, id);
  }
});

test('a component cannot be dropped into itself (cycle)', () => {
  assert.equal(componentFromDrop({ kind: 'component', id: 'card' }, setup(), 'proj', 'card', 'u1'), undefined);
});

test('component drops with an empty cache are refused', () => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  clients.push(client);
  assert.equal(componentFromDrop({ kind: 'component', id: 'card' }, client, 'proj', 'home', 'u1'), undefined);
});

test('a snapshot drop clones the saved structure with fresh ids and no shared-section marker', () => {
  const root = componentFromDrop({ kind: 'snapshot', id: 'snap-ok' }, setup(), 'proj', 'home', 'u1');
  assert.ok(root);
  assert.equal(root.pageId, 'home');
  assert.notEqual(root.id, 'hero');
  const child = (root as unknown as { elements: EditorElement[] }).elements[0];
  assert.equal(child.pageId, 'home');
  assert.equal(child.parentId, root.id);
  assert.notEqual(child.id, 'hero-text');
  assert.deepEqual(root.settings, { keep: 1 });
});

test('snapshot drops need a signed-in user and a valid saved structure', () => {
  const client = setup();
  assert.equal(componentFromDrop({ kind: 'snapshot', id: 'snap-ok' }, client, 'proj', 'home', null), undefined);
  assert.equal(componentFromDrop({ kind: 'snapshot', id: 'snap-bad' }, client, 'proj', 'home', 'u1'), undefined);
  assert.equal(componentFromDrop({ kind: 'snapshot', id: 'nope' }, client, 'proj', 'home', 'u1'), undefined);
  assert.equal(componentFromDrop({ kind: 'snapshot', id: 'snap-ok' }, client, 'proj', 'home', 'other-user'), undefined);
});

test('resolveInsertedElement creates a fresh element for palette drags', () => {
  const created = resolveInsertedElement({ kind: 'create', elementType: 'Button' }, 'home', setup(), 'proj', 'u1');
  assert.equal(created?.type, 'Button');
  assert.equal(created?.pageId, 'home');
});

test('resolveInsertedElement builds a template by index and ignores a bad index', () => {
  const client = setup();
  const built = resolveInsertedElement({ kind: 'template', index: 0 }, 'home', client, 'proj', 'u1');
  assert.ok(built);
  assert.equal(built.pageId, 'home');
  assert.equal(built.type, customComps[0].type);
  assert.equal(resolveInsertedElement({ kind: 'template', index: 99_999 }, 'home', client, 'proj', 'u1'), undefined);
  assert.equal(resolveInsertedElement({ kind: 'template', index: -1 }, 'home', client, 'proj', 'u1'), undefined);
});

test('resolveInsertedElement inserts components and snapshots, or toasts when it cannot', () => {
  const client = setup();
  const before = () => toast.getToasts().length;

  const ok = resolveInsertedElement({ kind: 'component', id: 'card' }, 'home', client, 'proj', 'u1');
  assert.equal(ok?.pageId, 'home');
  const snap = resolveInsertedElement({ kind: 'snapshot', id: 'snap-ok' }, 'home', client, 'proj', 'u1');
  assert.equal(snap?.pageId, 'home');

  const count = before();
  assert.equal(resolveInsertedElement({ kind: 'component', id: 'missing' }, 'home', client, 'proj', 'u1'), undefined);
  assert.equal(toast.getToasts().length, count + 1);
  assert.equal(
    (toast.getToasts().at(-1) as { title?: string } | undefined)?.title,
    'This component cannot be inserted here.',
  );

  // Without a project nothing is inserted and nothing is reported.
  assert.equal(resolveInsertedElement({ kind: 'component', id: 'card' }, 'home', client, null, 'u1'), undefined);
  assert.equal(toast.getToasts().length, count + 1);
});
