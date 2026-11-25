import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDropPosition,
  isHorizontalFlow,
  isNoOpMove,
  resolveNearestChildSlot,
} from '../src/features/editor/utils/element/dropPosition';
import type { FrameElement, TextElement } from '../src/types/elements/elements';

const text = (id: string, parentId?: string): TextElement => ({
  id,
  type: 'Text',
  content: id,
  pageId: 'p1',
  parentId,
  styles: {},
  tailwindStyles: '',
});

const frame = (id: string, elements: TextElement[]): FrameElement => ({
  id,
  type: 'Frame',
  content: '',
  pageId: 'p1',
  styles: {},
  tailwindStyles: '',
  elements,
});

test('isHorizontalFlow detects flex-row and multi-column CSS grids', () => {
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'row' }), true);
  assert.equal(isHorizontalFlow({ display: 'flex', flexDirection: 'column' }), false);
  assert.equal(
    isHorizontalFlow({ display: 'grid', flexDirection: 'row', gridTemplateColumns: '200px 200px' }),
    true,
  );
  assert.equal(
    isHorizontalFlow({ display: 'grid', flexDirection: 'row', gridTemplateColumns: '400px' }),
    false,
  );
});

test('isNoOpMove identifies moves that leave the element in its exact current slot', () => {
  const tree = [frame('f1', [text('a', 'f1'), text('b', 'f1'), text('c', 'f1')])];
  assert.equal(isNoOpMove(tree, 'b', 'b', 'before'), true);
  assert.equal(isNoOpMove(tree, 'b', 'a', 'after'), true);
  assert.equal(isNoOpMove(tree, 'b', 'c', 'before'), true);
  assert.equal(isNoOpMove(tree, 'c', 'f1', 'inside'), true);
  assert.equal(isNoOpMove(tree, 'b', 'a', 'before'), false);
  assert.equal(isNoOpMove(tree, 'b', 'c', 'after'), false);
  assert.equal(isNoOpMove(tree, 'a', 'f1', 'inside'), false);
  assert.equal(
    computeDropPosition(
      { left: 0, top: 0, width: 100, height: 100 },
      { x: 50, y: 50 },
      { isContainer: true, horizontal: false },
    ),
    'inside',
  );
  // Generous 28% / 36px edge band makes swapping containers easy
  assert.equal(
    computeDropPosition(
      { left: 0, top: 0, width: 200, height: 200 },
      { x: 100, y: 28 },
      { isContainer: true, horizontal: false },
    ),
    'before',
  );
  assert.equal(
    computeDropPosition(
      { left: 0, top: 0, width: 200, height: 200 },
      { x: 100, y: 172 },
      { isContainer: true, horizontal: false },
    ),
    'after',
  );
});

test('resolveNearestChildSlot snaps gap/padding hits to the nearest sibling slot', () => {
  const verticalChildren = [
    { id: 'c1', box: { left: 0, top: 20, width: 200, height: 80 } },
    { id: 'c2', box: { left: 0, top: 120, width: 200, height: 80 } },
  ];
  // Cursor in the 20px gap between c1 (bottom 100) and c2 (top 120)
  const inGap = resolveNearestChildSlot(verticalChildren, { x: 100, y: 112 }, false);
  assert.deepEqual(inGap, { targetId: 'c2', position: 'before' });

  const afterLast = resolveNearestChildSlot(verticalChildren, { x: 100, y: 230 }, false);
  assert.deepEqual(afterLast, { targetId: 'c2', position: 'after' });

  const horizontalChildren = [
    { id: 'h1', box: { left: 0, top: 0, width: 100, height: 80 } },
    { id: 'h2', box: { left: 130, top: 0, width: 100, height: 80 } },
  ];
  const inRowGap = resolveNearestChildSlot(horizontalChildren, { x: 110, y: 40 }, true);
  assert.deepEqual(inRowGap, { targetId: 'h1', position: 'after' });

  assert.equal(resolveNearestChildSlot([], { x: 10, y: 10 }, false), null);
});
