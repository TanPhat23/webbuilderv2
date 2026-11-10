import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EventEmitter } from '../src/features/collaboration/lib/yjs/EventEmitter';

test('collaboration emitter registers, removes, and clears listeners', () => {
  const emitter = new EventEmitter<{ open: [string]; close: [] }>();
  const seen: string[] = [];
  const listener = (value: string) => seen.push(value);
  assert.equal(emitter.emit('open', 'before'), false);
  emitter.on('open', listener);
  assert.equal(emitter.emit('open', 'joined'), true);
  emitter.off('open', listener);
  assert.equal(emitter.emit('open', 'after'), false);
  emitter.on('open', listener).on('close', () => seen.push('closed'));
  emitter.removeAllListeners('open');
  assert.equal(emitter.emit('open', 'ignored'), false);
  emitter.emit('close');
  emitter.removeAllListeners();
  assert.equal(emitter.emit('close'), false);
  assert.deepEqual(seen, ['joined', 'closed']);
});
