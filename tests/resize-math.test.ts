import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeResizePreview,
  detectLengthUnit,
  resizeCursor,
  type ResizeOrigin,
} from '../src/features/editor/utils/element/resizeMath';

function makeRect(left: number, top: number, width: number, height: number): DOMRectReadOnly {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

function makeOrigin(overrides: Partial<ResizeOrigin> = {}): ResizeOrigin {
  return {
    rect: makeRect(100, 100, 200, 100),
    parentRect: makeRect(0, 0, 1000, 500),
    parentWidth: 1000,
    parentHeight: 500,
    mainAxis: null,
    widthUnit: 'px',
    heightUnit: 'px',
    ...overrides,
  };
}

test('detectLengthUnit preserves % and defaults everything else to px', () => {
  assert.equal(detectLengthUnit('50%'), '%');
  assert.equal(detectLengthUnit('33.33%'), '%');
  assert.equal(detectLengthUnit('200px'), 'px');
  assert.equal(detectLengthUnit('auto'), 'px');
  assert.equal(detectLengthUnit(undefined), 'px');
});

test('east edge resize writes integer px by default and clamps to 20px minimum', () => {
  const origin = makeOrigin();
  const grown = computeResizePreview(
    'e',
    origin,
    { clientX: 350.4, clientY: 150, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(grown.widthPx, 250);
  assert.equal(grown.styles.default?.width, '250px');
  assert.equal(grown.styles.default?.height, undefined);
  assert.equal(grown.widthLabel, '250px');

  const tiny = computeResizePreview(
    'e',
    origin,
    { clientX: 105, clientY: 150, shiftKey: false, altKey: false },
    { default: {} },
  );
  assert.equal(tiny.widthPx, 20);
  assert.equal(tiny.styles.default?.width, '20px');
});

test('preserves % unit when axis already used %', () => {
  const origin = makeOrigin({ widthUnit: '%' });
  const res = computeResizePreview(
    'e',
    origin,
    { clientX: 600, clientY: 150, shiftKey: false, altKey: false },
    { default: { width: '20%' } },
  );
  assert.equal(res.styles.default?.width, '50.00%');
  assert.equal(res.widthLabel, '50.00%');
});

test('Shift on edge snaps to 8px increments; Shift on corner locks aspect ratio', () => {
  const origin = makeOrigin();
  const snapped = computeResizePreview(
    'e',
    origin,
    { clientX: 313, clientY: 150, shiftKey: true, altKey: false },
    { default: {} },
  );
  assert.equal(snapped.widthPx, 216);

  const locked = computeResizePreview(
    'se',
    origin,
    { clientX: 400, clientY: 220, shiftKey: true, altKey: false },
    { default: {} },
  );
  assert.equal(locked.widthPx, 300);
  assert.equal(locked.heightPx, 150);
});

test('Alt resizes symmetrically from center and updates absolute offsets', () => {
  const origin = makeOrigin();
  const sym = computeResizePreview(
    'e',
    origin,
    { clientX: 330, clientY: 150, shiftKey: false, altKey: true },
    { default: { position: 'absolute', left: '100px', top: '100px' } },
  );
  assert.equal(sym.widthPx, 260);
  assert.equal(sym.styles.default?.left, '70px');
});

test('resizing a flex Fill axis clears Fill on that axis only', () => {
  const origin = makeOrigin({ mainAxis: 'width' });
  const res = computeResizePreview(
    'e',
    origin,
    { clientX: 350, clientY: 150, shiftKey: false, altKey: false },
    { default: { flexGrow: 1, flexBasis: '0px', alignSelf: 'stretch' } },
  );
  assert.equal(res.styles.default?.width, '250px');
  assert.equal(res.styles.default?.flexGrow, undefined);
  assert.equal(res.styles.default?.flexBasis, undefined);
  assert.equal(res.styles.default?.flexShrink, '0');
  assert.equal(res.styles.default?.alignSelf, 'stretch');
  assert.equal(resizeCursor('se'), 'nwse-resize');
});
