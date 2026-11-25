import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSpacingPreview,
  readComputedSpacing,
  spacingCursor,
  type ComputedSpacing,
} from '../src/features/editor/utils/element/spacingMath';

const baseSpacing: ComputedSpacing = {
  padding: { top: 16, right: 20, bottom: 16, left: 20 },
  margin: { top: 8, right: 0, bottom: 8, left: 0 },
  gap: 12,
  gapAxis: 'vertical',
};

test('readComputedSpacing seeds pixel values and detects flex/grid gap axis', () => {
  const row = readComputedSpacing({
    paddingTop: '32px',
    paddingRight: '24px',
    paddingBottom: '32px',
    paddingLeft: '24px',
    marginTop: '12px',
    marginRight: '0px',
    marginBottom: '12px',
    marginLeft: '0px',
    gap: '16px',
    rowGap: '16px',
    columnGap: '16px',
    display: 'flex',
    flexDirection: 'row',
    gridTemplateColumns: 'none',
  });
  assert.equal(row.padding.top, 32);
  assert.equal(row.margin.top, 12);
  assert.equal(row.gap, 16);
  assert.equal(row.gapAxis, 'horizontal');
  assert.equal(spacingCursor('gap', row.gapAxis), 'ew-resize');
});

test('padding drags increase inward and clamp at 0', () => {
  const topIn = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 10, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(topIn.padding.top, 26);
  assert.equal(topIn.styles.default?.paddingTop, '26px');
  assert.deepEqual(topIn.activeSides, ['top']);

  const bottomIn = computeSpacingPreview(
    'padding-bottom',
    baseSpacing,
    { dx: 0, dy: -8, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(bottomIn.padding.bottom, 24);

  const clamped = computeSpacingPreview(
    'padding-left',
    baseSpacing,
    { dx: -100, dy: 0, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(clamped.padding.left, 0);
  assert.equal(clamped.styles.default?.paddingLeft, '0px');
});

test('margin drags increase outward', () => {
  const topOut = computeSpacingPreview(
    'margin-top',
    baseSpacing,
    { dx: 0, dy: -12, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(topOut.margin.top, 20);
  assert.equal(topOut.styles.default?.marginTop, '20px');

  const rightOut = computeSpacingPreview(
    'margin-right',
    baseSpacing,
    { dx: 14, dy: 0, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(rightOut.margin.right, 14);
});

test('Alt links opposite sides, Alt+Shift links all 4 sides, Shift snaps to 4px', () => {
  const sym = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 10, shiftKey: false, altKey: true },
    { default: {} },
  );
  assert.equal(sym.padding.top, 26);
  assert.equal(sym.padding.bottom, 26);
  assert.equal(sym.styles.default?.paddingTop, '26px');
  assert.equal(sym.styles.default?.paddingBottom, '26px');
  assert.deepEqual(sym.activeSides, ['top', 'bottom']);

  const all = computeSpacingPreview(
    'padding-top',
    baseSpacing,
    { dx: 0, dy: 7, shiftKey: true, altKey: true },
    { default: {} },
  );
  assert.equal(all.padding.top, 24);
  assert.equal(all.padding.right, 24);
  assert.equal(all.padding.bottom, 24);
  assert.equal(all.padding.left, 24);
  assert.deepEqual(all.activeSides, ['top', 'right', 'bottom', 'left']);

  const snapped = computeSpacingPreview(
    'margin-bottom',
    baseSpacing,
    { dx: 0, dy: 5, shiftKey: true, altKey: false },
    { default: {} },
  );
  assert.equal(snapped.margin.bottom, 12);
});

test('gap uses vertical dy for column and horizontal dx for row', () => {
  const colGap = computeSpacingPreview(
    'gap',
    { ...baseSpacing, gapAxis: 'vertical' },
    { dx: 40, dy: 8, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(colGap.gap, 20);
  assert.equal(colGap.styles.default?.gap, '20px');

  const rowGap = computeSpacingPreview(
    'gap',
    { ...baseSpacing, gapAxis: 'horizontal' },
    { dx: 10, dy: 40, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(rowGap.gap, 22);
  assert.equal(rowGap.styles.default?.gap, '22px');
});
