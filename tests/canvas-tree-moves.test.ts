import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EditorElement } from '../src/types/global.type';
import { ElementTreeHelper as T } from '../src/features/editor/utils/element/element-tree-helper';
import { computeDropPosition, isHorizontalFlow } from '../src/features/editor/utils/element/dropPosition';

const el = (id: string, type = 'Text', parentId?: string, elements?: EditorElement[]) =>
  ({ id, type, parentId, pageId: 'p', ...(elements ? { elements } : {}) }) as unknown as EditorElement;

/** root: [A(Section)[a1, a2], B(Section)[b1], c] */
function tree() {
  return [
    el('A', 'Section', undefined, [el('a1', 'Text', 'A'), el('a2', 'Text', 'A')]),
    el('B', 'Section', undefined, [el('b1', 'Text', 'B')]),
    el('c'),
  ];
}
const ids = (list: EditorElement[]): unknown =>
  list.map((e) => {
    const kids = (e as { elements?: EditorElement[] }).elements;
    return kids ? { [e.id]: ids(kids) } : e.id;
  });

test('updates keep untouched subtrees by identity', () => {
  const before = tree();
  const after = T.mapUpdateById(before, 'a1', (e) => ({ ...e, content: 'x' }) as EditorElement);
  assert.notEqual(after, before);
  assert.notEqual(after[0], before[0]);
  assert.equal(after[1], before[1]);
  assert.equal(after[2], before[2]);
  assert.equal(T.mapUpdateById(before, 'missing', (e) => e), before);
});

test('deletes keep untouched subtrees by identity', () => {
  const before = tree();
  const after = T.mapDeleteById(before, 'b1');
  assert.deepEqual(ids(after), [{ A: ['a1', 'a2'] }, { B: [] }, 'c']);
  assert.equal(after[0], before[0]);
  assert.equal(T.mapDeleteById(before, 'missing'), before);
});

test('moves before, after and inside other elements, fixing parentId', () => {
  assert.deepEqual(ids(T.mapMoveRelative(tree(), 'a2', 'a1', 'before')), [{ A: ['a2', 'a1'] }, { B: ['b1'] }, 'c']);
  const intoB = T.mapMoveRelative(tree(), 'a1', 'B', 'inside');
  assert.deepEqual(ids(intoB), [{ A: ['a2'] }, { B: ['b1', 'a1'] }, 'c']);
  assert.equal(T.findById(intoB, 'a1')?.parentId, 'B');
  const toRoot = T.mapMoveRelative(tree(), 'b1', 'c', 'after');
  assert.deepEqual(ids(toRoot), [{ A: ['a1', 'a2'] }, { B: [] }, 'c', 'b1']);
  assert.equal(T.findById(toRoot, 'b1')?.parentId, undefined);
});

test('refuses moves onto itself, into its own subtree, or into non-containers', () => {
  const before = tree();
  assert.equal(T.mapMoveRelative(before, 'A', 'A', 'inside'), before);
  assert.equal(T.mapMoveRelative(before, 'A', 'a1', 'after'), before);
  assert.equal(T.mapMoveRelative(before, 'a1', 'c', 'inside'), before);
});

test('inserts new elements relative to a target and reports locations', () => {
  const next = T.mapInsertRelative(tree(), el('n'), 'a1', 'after');
  assert.deepEqual(ids(next), [{ A: ['a1', 'n', 'a2'] }, { B: ['b1'] }, 'c']);
  assert.equal(T.findById(next, 'n')?.parentId, 'A');
  assert.deepEqual(T.findLocation(next, 'n'), { parentId: 'A', index: 1 });
  assert.deepEqual(T.findLocation(next, 'c'), { parentId: null, index: 2 });
  const sibling = T.mapInsertAfterId(tree(), 'b1', el('m', 'Text', 'stale'));
  assert.equal(T.findById(sibling, 'm')?.parentId, 'B');
});

test('drop position: containers take drops inside except at the edges', () => {
  const box = { left: 0, top: 0, width: 200, height: 100 };
  const opts = { isContainer: true, horizontal: false };
  assert.equal(computeDropPosition(box, { x: 50, y: 5 }, opts), 'before');
  assert.equal(computeDropPosition(box, { x: 50, y: 50 }, opts), 'inside');
  assert.equal(computeDropPosition(box, { x: 50, y: 95 }, opts), 'after');
});

test('drop position: other elements split in half along the flow axis', () => {
  const box = { left: 0, top: 0, width: 200, height: 100 };
  assert.equal(computeDropPosition(box, { x: 150, y: 10 }, { isContainer: false, horizontal: false }), 'before');
  assert.equal(computeDropPosition(box, { x: 150, y: 10 }, { isContainer: false, horizontal: true }), 'after');
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'row' }), true);
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'column' }), false);
  assert.equal(isHorizontalFlow({ display: 'block', flexDirection: 'row' }), false);
});
