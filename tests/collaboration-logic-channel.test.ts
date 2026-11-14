import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { LogicChannel } from '../src/features/collaboration/lib/yjs/LogicChannel';

function channel() {
  const settled: { id: string; ok: boolean; data: unknown }[] = [];
  const waiting = new Set<string>();
  const synced: unknown[] = [];
  const changed: { payload: unknown; own: boolean }[] = [];
  const ch = new LogicChannel({
    resolvePendingRequest: (id, ok, data) => {
      if (!waiting.delete(id)) return false;
      settled.push({ id, ok, data });
      return true;
    },
    onSync: (p) => synced.push(p),
    onChanged: (payload, own) => changed.push({ payload, own }),
  });
  return { ch, settled, waiting, synced, changed };
}
const env = (type: string, extra: Record<string, unknown> = {}) => ({ type, projectId: 'p', pageId: 'home', payload: {}, ...extra }) as never;

test('ignores messages that are not about logic', () => {
  const { ch } = channel();
  assert.equal(ch.handle(env('element:update')), false);
  assert.equal(ch.handle(env('error', { requestId: 'other' })), false);
});

test('an error for a logic request rejects it and is not passed on', () => {
  const { ch, settled, waiting } = channel();
  ch.track('r1');
  waiting.add('r1');
  assert.equal(ch.handle(env('error', { requestId: 'r1', payload: { code: 'VALIDATION_ERROR', message: 'nope' } })), true);
  assert.equal(settled[0].ok, false);
  // a second error for the same request is not ours any more
  assert.equal(ch.handle(env('error', { requestId: 'r1' })), false);
});

test('our own broadcast settles the request and is marked own', () => {
  const { ch, settled, waiting, changed } = channel();
  waiting.add('r2');
  assert.equal(ch.handle(env('logic:update', { requestId: 'r2', payload: { scope: 'project', logic: {} } })), true);
  assert.equal(settled[0].ok, true);
  assert.equal(changed[0].own, true);
});

test('someone else’s broadcast is applied without settling anything', () => {
  const { ch, settled, changed } = channel();
  ch.handle(env('logic:update', { requestId: 'theirs', payload: { scope: 'page', pageId: 'home', logic: {} } }));
  assert.equal(settled.length, 0);
  assert.equal(changed[0].own, false);
});

test('a sync is delivered to the store', () => {
  const { ch, synced } = channel();
  assert.equal(ch.handle(env('logic:sync', { payload: { project: {}, pageId: 'home' } })), true);
  assert.equal(synced.length, 1);
});
