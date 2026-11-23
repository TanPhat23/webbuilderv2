import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeDimensionStyles, computeSpacingStyles, resizeHandles } from '../src/features/editor/utils/element/resizeStyles';
import { startResizeDrag } from '../src/features/editor/utils/element/resizeDrag';
import { useResizeHandler } from '../src/features/editor/hooks/useResizeHandler';
import { FakeTarget, mountHook } from './support/editor-logic-hook-runner';

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRectReadOnly;
const origin = { rect: rect(100, 50, 200, 100), parentRect: rect(0, 0, 1000, 500) };
const at = (clientX: number, clientY: number, shiftKey = false) => ({ clientX, clientY, shiftKey });
const parent = { width: 1000, height: 500, mainAxis: null as 'width' | 'height' | null };

test('every resize direction maps to a handle with a cursor', () => {
  assert.equal(Object.keys(resizeHandles).length, 17);
  for (const handle of Object.values(resizeHandles)) assert.ok(handle.cursor);
  assert.equal(resizeHandles.se.kind, 'dimensions');
  assert.equal(resizeHandles['padding-n'].kind, 'spacing');
});

test('spacing handles add the signed pointer delta and never go below zero', () => {
  const styles = { default: { color: 'red' } } as never;
  const out = computeSpacingStyles(resizeHandles['padding-s'] as never, { paddingBottom: '10px' } as never, styles, { clientX: 0, clientY: 15 });
  assert.deepEqual(out, { default: { color: 'red', paddingBottom: '25px' } });
  const north = computeSpacingStyles(resizeHandles['padding-n'] as never, undefined, { default: {} } as never, { clientX: 0, clientY: 30 });
  assert.equal((north.default as Record<string, string>).paddingTop, '0px', 'dragging against the sign clamps to 0');
  const gap = computeSpacingStyles(resizeHandles.gap as never, { gap: '4px' } as never, {} as never, { clientX: 0, clientY: 6 });
  assert.equal((gap.default as Record<string, string>).gap, '10px');
});

test('dimension handles resize from the east/south edges as percentages of the parent', () => {
  const out = computeDimensionStyles(resizeHandles.se as never, origin, at(400, 250), { default: {} } as never, parent);
  assert.deepEqual(out.default, { width: '30.00%', height: '40.00%' });
  const east = computeDimensionStyles(resizeHandles.e as never, origin, at(600, 999), { default: {} } as never, parent);
  assert.deepEqual(east.default, { width: '50.00%' });
});

test('west/north handles grow toward the pointer and position absolute elements', () => {
  const styles = { default: { position: 'absolute' } } as never;
  const out = computeDimensionStyles(resizeHandles.nw as never, origin, at(50, 25), styles, parent);
  assert.deepEqual(out.default, { position: 'absolute', width: '25.00%', height: '25.00%', left: '5.00%', top: '5.00%' });
});

test('sizes are clamped to a 20px minimum and to 100 percent', () => {
  const small = computeDimensionStyles(resizeHandles.se as never, origin, at(0, 0), { default: {} } as never, parent);
  assert.deepEqual(small.default, { width: '2.00%', height: '4.00%' });
  const big = computeDimensionStyles(resizeHandles.e as never, origin, at(99999, 0), { default: {} } as never, parent);
  assert.equal((big.default as Record<string, string>).width, '100.00%');
});

test('holding shift on a corner keeps the aspect ratio', () => {
  const wide = computeDimensionStyles(resizeHandles.se as never, origin, at(500, 160, true), { default: {} } as never, parent);
  // width drag (+200) beats the height drag, so height follows at ratio 2.
  assert.deepEqual(wide.default, { width: '40.00%', height: '40.00%' });
  const tall = computeDimensionStyles(resizeHandles.se as never, origin, at(310, 450, true), { default: {} } as never, parent);
  assert.deepEqual(tall.default, { width: '80.00%', height: '80.00%' });
  const nw = computeDimensionStyles(resizeHandles.nw as never, origin, at(0, 40, true), { default: { position: 'absolute' } } as never, parent);
  assert.equal((nw.default as Record<string, string>).left, '0.00%');
  assert.equal((nw.default as Record<string, string>).top, '0.00%');
  const tallNw = computeDimensionStyles(resizeHandles.nw as never, origin, at(95, -100, true), { default: { position: 'absolute' } } as never, parent);
  assert.equal((tallNw.default as Record<string, string>).top, '0.00%');
  // Shift on an edge handle does not lock the ratio.
  const edge = computeDimensionStyles(resizeHandles.e as never, origin, at(500, 160, true), { default: {} } as never, parent);
  assert.deepEqual(edge.default, { width: '40.00%' });
  // A zero-height origin cannot lock a ratio either.
  const flat = { rect: rect(0, 0, 100, 0), parentRect: origin.parentRect };
  const flatOut = computeDimensionStyles(resizeHandles.se as never, flat, at(300, 50, true), { default: {} } as never, parent);
  assert.deepEqual(flatOut.default, { width: '30.00%', height: '10.00%' });
});

test('fixing the main axis drops Fill styles; the cross axis drops stretch', () => {
  const fill = { default: { flexGrow: '1', flexBasis: '0%', alignSelf: 'stretch' } } as never;
  const width = computeDimensionStyles(resizeHandles.e as never, origin, at(400, 0), fill, { ...parent, mainAxis: 'width' });
  assert.deepEqual(width.default, { alignSelf: 'stretch', width: '30.00%', flexShrink: '0' });
  const height = computeDimensionStyles(resizeHandles.s as never, origin, at(0, 250), fill, { ...parent, mainAxis: 'width' });
  assert.deepEqual(height.default, { flexGrow: '1', flexBasis: '0%', height: '40.00%' });
});

// --- startResizeDrag against a fake DOM -----------------------------------

function fakeDom(options: { display?: string; flexDirection?: string; parentWidth?: number; parentHeight?: number; hasParent?: boolean } = {}) {
  const doc = new FakeTarget() as FakeTarget & Record<string, unknown>;
  const win = new FakeTarget() as FakeTarget & Record<string, unknown>;
  const body = { style: {} as Record<string, string> };
  const parentEl = {
    ownerDocument: doc,
    clientWidth: options.parentWidth ?? 1000,
    clientHeight: options.parentHeight ?? 500,
    getBoundingClientRect: () => rect(0, 0, 1000, 500),
  };
  const target = {
    ownerDocument: doc,
    parentElement: options.hasParent === false ? null : parentEl,
    style: {} as Record<string, string>,
    getBoundingClientRect: () => rect(100, 50, 200, 100),
  };
  doc.body = body;
  doc.defaultView = win;
  doc.getElementById = (id: string) => (id === 'preview-iframe' ? parentEl : null);
  (parentEl as Record<string, unknown>).ownerDocument = Object.assign(doc, {
    defaultView: Object.assign(win, {
      getComputedStyle: () => ({ display: options.display ?? 'block', flexDirection: options.flexDirection ?? 'row' }),
    }),
  });
  return { doc, win, body, target, parentEl };
}

const frames: Array<() => void> = [];
Object.assign(globalThis, {
  requestAnimationFrame: (fn: () => void) => frames.push(fn),
  cancelAnimationFrame: (id: number) => void (frames[id - 1] = () => {}),
});
const flushFrames = () => frames.splice(0).forEach((fn) => fn());

test('a drag previews styles on the target and reports them on mouseup', () => {
  const { doc, win, body, target } = fakeDom();
  const pending = { current: null as never };
  const finished: unknown[] = [];
  const dispose = startResizeDrag({
    target: target as never, direction: 'se', start: { clientX: 0, clientY: 0 }, pending,
    readStyles: () => undefined, readTarget: () => target as never, finish: (s) => finished.push(s),
  });
  assert.equal(body.style.userSelect, 'none');
  assert.equal(body.style.cursor, 'nwse-resize');
  let prevented = 0;
  doc.dispatch('mousemove', { clientX: 400, clientY: 250, shiftKey: false, preventDefault: () => prevented++ });
  doc.dispatch('mousemove', { clientX: 400, clientY: 250, shiftKey: false, preventDefault: () => prevented++ });
  assert.equal(prevented, 2);
  assert.equal(frames.length, 1, 'frames are coalesced');
  flushFrames();
  assert.equal(target.style.width, '30.00%');
  assert.equal(target.style.height, '40.00%');
  doc.dispatch('mouseup');
  assert.equal(finished.length, 1);
  assert.deepEqual((finished[0] as { default: unknown }).default, { width: '30.00%', height: '40.00%' });
  assert.equal(doc.count('mousemove'), 0);
  assert.equal(win.count('mouseup'), 0);
  assert.equal(body.style.userSelect, '');
  assert.equal(pending.current, null);
  dispose();
});

test('a flex parent turns Fill into a fixed size and clears the preview flex props', () => {
  const { doc, target } = fakeDom({ display: 'flex', flexDirection: 'column' });
  target.style.flexGrow = '1';
  const pending = { current: null as never };
  const base = { default: { flexGrow: '1', flexBasis: '0%' } } as never;
  startResizeDrag({
    target: target as never, direction: 's', start: { clientX: 0, clientY: 0 }, pending,
    readStyles: () => base, readTarget: () => target as never, finish: () => {},
  });
  doc.dispatch('mousemove', { clientX: 0, clientY: 250, shiftKey: false, preventDefault() {} });
  flushFrames();
  assert.equal(target.style.height, '40.00%');
  assert.equal(target.style.flexGrow, '');
  assert.equal(target.style.flexBasis, '');
  assert.equal(target.style.flexShrink, '0');
});

test('spacing drags use the pointer delta from the start point', () => {
  const { doc, target } = fakeDom();
  const pending = { current: null as never };
  const finished: unknown[] = [];
  startResizeDrag({
    target: target as never, direction: 'gap', start: { clientX: 10, clientY: 10 }, pending,
    readStyles: () => ({ default: { gap: '2px' } }) as never, readTarget: () => target as never, finish: (s) => finished.push(s),
  });
  doc.dispatch('mousemove', { clientX: 10, clientY: 20, shiftKey: false, preventDefault() {} });
  flushFrames();
  assert.equal(target.style.gap, '12px');
  doc.dispatch('mouseup');
  assert.equal((finished[0] as { default: { gap: string } }).default.gap, '12px');
});

test('the parent falls back to the iframe and a zero-size parent leaves styles unchanged', () => {
  const { doc, target } = fakeDom({ hasParent: false, parentWidth: 0, parentHeight: 0 });
  const pending = { current: null as never };
  const start = { default: { width: '10%' } } as never;
  startResizeDrag({
    target: target as never, direction: 'e', start: { clientX: 0, clientY: 0 }, pending,
    readStyles: () => start, readTarget: () => target as never, finish: () => {},
  });
  doc.dispatch('mousemove', { clientX: 300, clientY: 0, shiftKey: false, preventDefault() {} });
  // The iframe fallback has no client size, so its bounding rect (1000x500) is used.
  assert.deepEqual((pending.current as { default: unknown }).default, { width: '20.00%' });
  flushFrames();
});

test('disposing mid-drag cancels the frame and resets the body', () => {
  const { doc, body, target } = fakeDom();
  const pending = { current: null as never };
  const dispose = startResizeDrag({
    target: target as never, direction: 'e', start: { clientX: 0, clientY: 0 }, pending,
    readStyles: () => undefined, readTarget: () => target as never, finish: () => assert.fail('finish must not run'),
  });
  doc.dispatch('mousemove', { clientX: 300, clientY: 0, shiftKey: false, preventDefault() {} });
  dispose();
  flushFrames();
  assert.equal(target.style.width, undefined, 'the cancelled frame never previews');
  assert.equal(body.style.cursor, '');
  assert.equal(doc.count('mouseup'), 0);
});

test('a frame whose target is gone does nothing', () => {
  const { doc, target } = fakeDom();
  const pending = { current: null as never };
  startResizeDrag({
    target: target as never, direction: 'e', start: { clientX: 0, clientY: 0 }, pending,
    readStyles: () => undefined, readTarget: () => null, finish: () => {},
  });
  doc.dispatch('mousemove', { clientX: 300, clientY: 0, shiftKey: false, preventDefault() {} });
  flushFrames();
  assert.equal(target.style.width, undefined);
});

// --- useResizeHandler -------------------------------------------------------

test('useResizeHandler starts a drag, tracks the direction and saves styles on release', () => {
  const { doc, target } = fakeDom();
  const updates: unknown[] = [];
  const element = { id: 'el-1', styles: { default: {} } } as never;
  const hook = mountHook(() => useResizeHandler({
    element, updateElement: (id, patch) => updates.push([id, patch]), targetRef: { current: target as never },
  }));
  assert.equal(hook.current.isResizing, false);
  const calls: string[] = [];
  const event = { clientX: 0, clientY: 0, preventDefault: () => calls.push('prevent'), stopPropagation: () => calls.push('stop') };
  hook.current.handleResizeStart('se', event as never);
  assert.deepEqual(calls, ['prevent', 'stop']);
  assert.equal(hook.current.currentResizeDirection, 'se');
  assert.equal(hook.current.isResizing, true);
  doc.dispatch('mousemove', { clientX: 400, clientY: 250, shiftKey: false, preventDefault() {} });
  flushFrames();
  doc.dispatch('mouseup');
  assert.equal(hook.current.isResizing, false);
  assert.equal(updates.length, 1);
  assert.equal((updates[0] as [string, { styles: { default: unknown } }])[0], 'el-1');
  assert.deepEqual((updates[0] as [string, { styles: { default: unknown } }])[1].styles.default, { width: '30.00%', height: '40.00%' });
  hook.unmount();
});

test('useResizeHandler ignores starts when disabled or without a target, and restarts cleanly', () => {
  const { doc, target } = fakeDom();
  const event = { clientX: 0, clientY: 0, preventDefault() {}, stopPropagation() {} } as never;
  const disabled = mountHook(() => useResizeHandler({ element: { id: 'a' } as never, updateElement() {}, targetRef: { current: target as never }, enabled: false }));
  disabled.current.handleResizeStart('e', event);
  assert.equal(disabled.current.isResizing, false);
  const noTarget = mountHook(() => useResizeHandler({ element: { id: 'a' } as never, updateElement() {}, targetRef: { current: null } }));
  noTarget.current.handleResizeStart('e', event);
  assert.equal(noTarget.current.isResizing, false);

  const updates: unknown[] = [];
  const live = mountHook(() => useResizeHandler({ element: { id: 'a', styles: undefined } as never, updateElement: (...a) => updates.push(a), targetRef: { current: target as never } }));
  live.current.handleResizeStart('e', event);
  live.current.handleResizeStart('w', event);
  assert.equal(doc.count('mouseup'), 1, 'the first drag was disposed before the second began');
  assert.equal(live.current.currentResizeDirection, 'w');
  // Releasing without moving reports no styles, so nothing is saved.
  doc.dispatch('mouseup');
  assert.equal(updates.length, 0);
  live.current.handleResizeStart('e', event);
  live.unmount();
  assert.equal(doc.count('mouseup'), 0, 'unmount disposes the active drag');
});
