import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ElementMessageHandler } from '../src/features/collaboration/lib/yjs/ElementMessageHandler';
import type { EditorElement } from '../src/types/global.type';

test('remote updates use the injected current element state and merge settings', () => {
  const element = { id: 'child', type: 'Text', pageId: 'page', content: '', settings: { existing: 'kept' } } as unknown as EditorElement;
  let patch: Partial<EditorElement> | undefined;
  const handler = new ElementMessageHandler({
    getElementState: () => ({
      elements: [element], loadElements: () => {}, remoteAdd: () => {},
      remoteUpdate: (_id, value) => { patch = value; }, remoteMove: () => {}, remoteDelete: () => {},
    }),
    handleSyncUsers: () => {}, handleRemotePresence: () => {}, resolvePendingRequest: () => false,
  });
  handler.handle({ type: 'element:update', payload: { id: 'child', settings: { added: 'value' } } } as any);
  assert.deepEqual(patch?.settings, { existing: 'kept', added: 'value' });
});

test('sync and remote operations are forwarded to the injected state', () => {
  const calls: unknown[][] = [];
  const element = { id: 'child', type: 'Text', pageId: 'page', content: '' } as EditorElement;
  const handler = new ElementMessageHandler({
    getElementState: () => ({
      elements: [],
      loadElements: (...args) => { calls.push(['load', ...args]); },
      remoteAdd: (...args) => { calls.push(['add', ...args]); },
      remoteUpdate: () => {},
      remoteMove: (...args) => { calls.push(['move', ...args]); },
      remoteDelete: (...args) => { calls.push(['delete', ...args]); },
    }),
    handleSyncUsers: () => {}, handleRemotePresence: () => {}, resolvePendingRequest: () => false,
  });
  handler.handle({ type: 'sync:page', payload: { elements: [element], users: [] } } as any);
  handler.handle({ type: 'element:create', payload: { element } } as any);
  handler.handle({ type: 'element:move', payload: { id: 'child', order: 2 } } as any);
  handler.handle({ type: 'element:delete', payload: { id: 'child' } } as any);
  assert.deepEqual(calls, [['load', [element], true], ['add', element], ['move', 'child', null, 2], ['delete', 'child']]);
});
