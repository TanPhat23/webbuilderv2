import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  directionalClasses,
  getResizeHandles,
  handlesForSize,
  hasGap,
  hasMargin,
  hasPadding,
  type ResizeDirection,
} from '../apps/editor/src/features/editor/constants/direction';

const CORNERS_AND_EDGES: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

test('hasMargin / hasPadding / hasGap treat unset, null, 0 and "0" as absent', () => {
  for (const absent of [undefined, null, 0, '0'] as const) {
    assert.equal(hasMargin({ marginTop: absent as never }, 'marginTop'), false, String(absent));
    assert.equal(hasPadding({ paddingTop: absent as never }, 'paddingTop'), false, String(absent));
    assert.equal(hasGap({ gap: absent as never }), false, String(absent));
  }
  assert.equal(hasMargin(undefined, 'marginTop'), false);
  assert.equal(hasPadding(undefined, 'paddingTop'), false);
  assert.equal(hasGap(undefined), false);
  assert.equal(hasMargin({ marginTop: '8px' }, 'marginTop'), true);
  assert.equal(hasMargin({ marginTop: 4 }, 'marginTop'), true);
  assert.equal(hasPadding({ paddingLeft: '1rem' }, 'paddingLeft'), true);
  assert.equal(hasGap({ gap: '12px' }), true);
  assert.equal(hasGap({ gap: 2 }), true);
});

test('every ResizeDirection has a positioning class with a matching cursor', () => {
  const keys = Object.keys(directionalClasses);
  assert.equal(keys.length, 17);
  assert.match(directionalClasses.n, /cursor-n-resize/);
  assert.match(directionalClasses['margin-e'], /cursor-e-resize/);
  assert.match(directionalClasses['padding-w'], /cursor-w-resize/);
  assert.match(directionalClasses.gap, /cursor-ns-resize/);
});

test('getResizeHandles always offers the eight resize handles', () => {
  assert.deepEqual(getResizeHandles(undefined), CORNERS_AND_EDGES);
  assert.deepEqual(getResizeHandles({ marginTop: 0, paddingTop: '0' }), CORNERS_AND_EDGES);
});

test('getResizeHandles adds margin, padding and gap handles per side', () => {
  const handles = getResizeHandles({
    marginTop: '4px',
    marginBottom: '4px',
    marginRight: '4px',
    marginLeft: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingRight: '2px',
    paddingLeft: '2px',
    gap: '8px',
  });
  assert.deepEqual(handles.slice(8), [
    'margin-n', 'margin-s', 'margin-e', 'margin-w',
    'padding-n', 'padding-s', 'padding-e', 'padding-w',
    'gap',
  ]);
  assert.deepEqual(getResizeHandles({ marginLeft: 3 }).slice(8), ['margin-w']);
  assert.deepEqual(getResizeHandles({ paddingBottom: 3 }).slice(8), ['padding-s']);
  assert.deepEqual(getResizeHandles({ gap: 1 }).slice(8), ['gap']);
});

test('handlesForSize keeps everything on a comfortably large element', () => {
  assert.deepEqual(handlesForSize(CORNERS_AND_EDGES, 200, 120), CORNERS_AND_EDGES);
});

test('handlesForSize drops mid-edge handles when the edge is short', () => {
  const narrow = handlesForSize(CORNERS_AND_EDGES, 40, 200);
  assert.ok(!narrow.includes('n') && !narrow.includes('s'));
  assert.ok(narrow.includes('e') && narrow.includes('w'));
  const short = handlesForSize(CORNERS_AND_EDGES, 200, 40);
  assert.ok(!short.includes('e') && !short.includes('w'));
  assert.ok(short.includes('n') && short.includes('s'));
});

test('handlesForSize collapses corner pairs that would touch', () => {
  // Too narrow for two corners on a horizontal edge: only the east corners survive.
  assert.deepEqual(handlesForSize(['ne', 'nw', 'se', 'sw'], 10, 200), ['ne', 'se']);
  // Too short: only the bottom corners survive.
  assert.deepEqual(handlesForSize(['ne', 'nw', 'se', 'sw'], 200, 10), ['se', 'sw']);
  // Tiny in both directions: a single bottom-right handle, nothing else.
  assert.deepEqual(handlesForSize(CORNERS_AND_EDGES, 10, 10), ['se']);
  assert.deepEqual(handlesForSize(['margin-n', 'gap', 'padding-e'], 10, 10), []);
});

test('handlesForSize leaves margin/padding/gap handles alone on normal sizes', () => {
  const extra: ResizeDirection[] = ['margin-n', 'padding-e', 'gap'];
  assert.deepEqual(handlesForSize(extra, 100, 100), extra);
});
