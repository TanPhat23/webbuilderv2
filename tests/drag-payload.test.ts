import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCreateDrag,
  readDropPayload,
  setElementTypeDrag,
  setMoveDrag,
  setTemplateDrag,
} from '../src/features/editor/utils/element/dragPayload';

/** Minimal DataTransfer: lowercases formats like browsers do. */
function fakeDataTransfer(): DataTransfer {
  const data = new Map<string, string>();
  return {
    effectAllowed: 'uninitialized',
    setData: (format: string, value: string) => void data.set(format.toLowerCase(), value),
    getData: (format: string) => data.get(format.toLowerCase()) ?? '',
    get types() {
      return [...data.keys()];
    },
  } as unknown as DataTransfer;
}

test('palette element drags read back as create payloads', () => {
  const dt = fakeDataTransfer();
  setElementTypeDrag(dt, 'Button');
  assert.deepEqual(readDropPayload(dt), { kind: 'create', elementType: 'Button' });
  assert.equal(isCreateDrag(dt), true);
});

test('template drags read back as template payloads', () => {
  const dt = fakeDataTransfer();
  setTemplateDrag(dt, 3);
  assert.deepEqual(readDropPayload(dt), { kind: 'template', index: 3 });
  assert.equal(isCreateDrag(dt), true);
});

test('existing element drags read back as move payloads and are not create drags', () => {
  const dt = fakeDataTransfer();
  setMoveDrag(dt, 'el-1');
  assert.deepEqual(readDropPayload(dt), { kind: 'move', elementId: 'el-1' });
  assert.equal(dt.effectAllowed, 'move');
  assert.equal(isCreateDrag(dt), false);
});

test('image drags count as create drags but have no canvas drop payload', () => {
  const dt = fakeDataTransfer();
  dt.setData('application/json', JSON.stringify({ type: 'image', imageLink: 'x' }));
  assert.equal(isCreateDrag(dt), true);
  assert.equal(readDropPayload(dt), null);
});

test('empty drags have no payload', () => {
  assert.equal(readDropPayload(fakeDataTransfer()), null);
});
