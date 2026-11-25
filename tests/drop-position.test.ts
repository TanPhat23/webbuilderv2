import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDropPosition,
  isHorizontalFlow,
  isNoOpMove,
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
});
