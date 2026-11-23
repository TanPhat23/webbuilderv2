
import { test, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { render, cleanup, byLabel, maybeByLabel, byText, click, type, keyDown, blur, focus, $q, $$q, React, flush, win, act } from './support/sidebar-dom-harness';
import { makeSp } from './support/sidebar-fixtures';
import { ColorRow } from '../src/features/editor/components/sidebar/style/ColorRow';
import { PropInput, StyleField } from '../src/features/editor/components/sidebar/style/PropInput';
import { Section } from '../src/features/editor/components/sidebar/style/SectionHeader';
import { AlignmentControl } from '../src/features/editor/components/sidebar/style/AlignmentControl';
import { MoreToggle, Segmented } from '../src/features/editor/components/sidebar/style/controls';

after(cleanup);
beforeEach(cleanup);
const h = React.createElement;

// ---------- ColorRow ----------
test('ColorRow commits typed text on Enter and clears on empty', async () => {
  const { sp, calls } = makeSp({ values: { color: '#ff0000' } });
  const r = await render(h(ColorRow, { sp, k: 'color', label: 'Text colour' }));
  const text = byLabel<HTMLInputElement>(r.container, 'Text colour');
  assert.equal(text.value, '#ff0000');
  await type(text, ' blue ');
  await keyDown(text, 'Enter');
  assert.deepEqual(calls.pop(), ['set', 'color', 'blue']);
  await type(text, '   ');
  await blur(text);
  assert.deepEqual(calls.pop(), ['set', 'color', undefined]);
});

test('ColorRow native picker and alpha input write a joined colour', async () => {
  const { sp, calls } = makeSp({ values: { color: '#ff0000' } });
  const r = await render(h(ColorRow, { sp, k: 'color', label: 'Text colour' }));
  const picker = byLabel<HTMLInputElement>(r.container, 'Text colour picker');
  assert.equal(picker.value, '#ff0000');
  await type(picker, '#00ff00');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], 'color');
  assert.match(String(calls[0][2]), /^#00ff00/i);

  const alpha = byLabel<HTMLInputElement>(r.container, 'Text colour opacity');
  assert.equal(alpha.disabled, false);
  await type(alpha, '50');
  await blur(alpha);
  assert.equal(calls.length, 2);
  assert.equal(calls[1][1], 'color');
  await keyDown(alpha, 'Enter');
});

test('ColorRow disables alpha for non-hex values and shows breakpoint override clear', async () => {
  const { sp, calls } = makeSp({ values: { color: 'var(--x)' }, inherited: { color: 'red' }, breakpoint: 'md' });
  const r = await render(h(ColorRow, { sp, k: 'color', label: 'Text colour' }));
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Text colour opacity').disabled, true);
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Text colour').value, 'var(--x)');
  await click(byLabel(r.container, 'Clear Text colour override'));
  assert.deepEqual(calls[0], ['clear', ['color']]);
  // alpha blur on a non-hex colour is a no-op
  const alpha = byLabel<HTMLInputElement>(r.container, 'Text colour opacity');
  await blur(alpha);
  assert.equal(calls.length, 1);
});

test('ColorRow has no override dot on the default breakpoint and placeholder falls back to None', async () => {
  const { sp } = makeSp({ values: { color: '#fff' } });
  const r = await render(h(ColorRow, { sp, k: 'color', label: 'C' }));
  assert.equal(maybeByLabel(r.container, 'Clear C override'), null);
  const { sp: sp2 } = makeSp({ disabled: true });
  const r2 = await render(h(ColorRow, { sp: sp2, k: 'color', label: 'D' }));
  assert.equal(byLabel<HTMLInputElement>(r2.container, 'D').placeholder, 'None');
  assert.equal(byLabel<HTMLInputElement>(r2.container, 'D').disabled, true);
});

// ---------- PropInput ----------
test('PropInput commits normalised values on Enter and blur, flags invalid input', async () => {
  const commits: (string | undefined)[] = [];
  const r = await render(h(PropInput, { value: '10px', prefix: 'W', label: 'Width', onCommit: (v: string | undefined) => commits.push(v) }));
  const input = byLabel<HTMLInputElement>(r.container, 'Width');
  assert.equal(input.value, '10');
  assert.match(r.container.textContent ?? '', /px/);
  await focus(input);
  await type(input, '24');
  await keyDown(input, 'Enter');
  assert.deepEqual(commits, ['24px']);
  await type(input, '!!not css!!');
  await keyDown(input, 'Enter');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(commits.length, 1);
  await type(input, '30');
  assert.equal(input.getAttribute('aria-invalid'), 'false');
  await blur(input);
  assert.deepEqual(commits, ['24px', '30px']);
});

test('PropInput does not recommit an unchanged value and Escape reverts', async () => {
  const commits: unknown[] = [];
  const r = await render(h(PropInput, { value: '10px', prefix: 'W', label: 'Width', onCommit: (v: unknown) => commits.push(v) }));
  const input = byLabel<HTMLInputElement>(r.container, 'Width');
  await focus(input);
  await keyDown(input, 'Enter');
  assert.deepEqual(commits, []);
  await type(input, '99');
  await keyDown(input, 'Escape');
  assert.equal(input.value, '10');
  await blur(input);
  assert.deepEqual(commits, []);
});

test('PropInput arrow keys step the value (shift steps by ten) and free inputs pass text through', async () => {
  const commits: unknown[] = [];
  const r = await render(h(PropInput, { value: '10px', prefix: 'W', label: 'Width', onCommit: (v: unknown) => commits.push(v) }));
  const input = byLabel<HTMLInputElement>(r.container, 'Width');
  await keyDown(input, 'ArrowUp');
  await keyDown(input, 'ArrowDown', { shiftKey: true });
  assert.equal(commits.length, 2);
  assert.match(String(commits[0]), /11/);
  assert.match(String(commits[1]), /1/);

  const free: unknown[] = [];
  const r2 = await render(h(PropInput, { value: 'repeat(2, 1fr)', free: true, prefix: 'C', label: 'Cols', onCommit: (v: unknown) => free.push(v) }));
  const fin = byLabel<HTMLInputElement>(r2.container, 'Cols');
  assert.equal(fin.value, 'repeat(2, 1fr)');
  await focus(fin);
  await type(fin, '  1fr 2fr ');
  await keyDown(fin, 'Enter');
  await type(fin, '   ');
  await keyDown(fin, 'Enter');
  await keyDown(fin, 'ArrowUp');
  assert.deepEqual(free, ['1fr 2fr', undefined]);
});

test('PropInput scrubs the prefix with the pointer and shows the override dot', async () => {
  const commits: unknown[] = [];
  let cleared = 0;
  const r = await render(h(PropInput, {
    value: '10px', prefix: h('i', { 'data-testid': 'pfx' }, 'W'), label: 'Width', overridden: true,
    onClearOverride: () => { cleared++; }, onCommit: (v: unknown) => commits.push(v),
  }));
  await click(byLabel(r.container, 'Clear Width override'));
  assert.equal(cleared, 1);
  const prefix = $q(r.container, 'i').parentElement as HTMLElement;
  const ev = (type: string, x: number, extra: object = {}) =>
    new win.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, ...extra });
  await act(() => { prefix.dispatchEvent(ev('pointerdown', 0)); });
  await act(() => { prefix.dispatchEvent(ev('pointermove', 20)); });
  await act(() => { prefix.dispatchEvent(ev('pointermove', 20, { shiftKey: true })); });
  await act(() => { prefix.dispatchEvent(ev('pointermove', 20, { altKey: true })); });
  await act(() => { prefix.dispatchEvent(ev('pointerup', 20)); });
  await act(() => { prefix.dispatchEvent(ev('pointermove', 40)); });
  assert.equal(commits.length, 3, 'moves after pointerup are ignored');
});

test('PropInput prefix scrubbing is ignored when disabled or free', async () => {
  const commits: unknown[] = [];
  const r = await render(h(PropInput, { value: '10px', prefix: h('i', null, 'W'), label: 'Width', disabled: true, onCommit: (v: unknown) => commits.push(v) }));
  const prefix = $q(r.container, 'i').parentElement as HTMLElement;
  await act(() => { prefix.dispatchEvent(new win.MouseEvent('pointerdown', { bubbles: true, cancelable: true })); });
  await act(() => { prefix.dispatchEvent(new win.MouseEvent('pointermove', { bubbles: true, clientX: 50 })); });
  assert.deepEqual(commits, []);
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Width').disabled, true);
});

test('StyleField binds a style key, placeholders and clears overrides', async () => {
  const { sp, calls } = makeSp({ values: { width: '10px' }, inherited: { width: '5px', height: undefined }, breakpoint: 'sm' });
  const r = await render(h('div', null,
    h(StyleField, { sp, k: 'width', prefix: 'W', label: 'Width' }),
    h(StyleField, { sp, k: 'height', prefix: 'H', label: 'Height' }),
    h(StyleField, { sp, k: 'gap', prefix: 'G', label: 'Gap' }),
    h(StyleField, { sp, k: 'zIndex', prefix: 'Z', label: 'Z', defaultUnit: '' }),
  ));
  const w = byLabel<HTMLInputElement>(r.container, 'Width');
  assert.equal(w.placeholder, '5px');
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Height').placeholder, 'Auto');
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Gap').placeholder, '—');
  assert.equal(byLabel<HTMLInputElement>(r.container, 'Z').placeholder, 'Auto');
  await focus(w);
  await type(w, '33');
  await keyDown(w, 'Enter');
  assert.deepEqual(calls.pop(), ['set', 'width', '33px']);
  await click(byLabel(r.container, 'Clear Width override'));
  assert.deepEqual(calls.pop(), ['clear', ['width']]);
});

// ---------- Section ----------
test('Section renders children only when on and toggles via +/-', async () => {
  const log: string[] = [];
  const optional = (on: boolean) => ({ on, onAdd: () => log.push('add'), onRemove: () => log.push('remove') });
  const off = await render(h(Section, { title: 'Border', optional: optional(false), actions: h('b', null, 'ACT') }, h('p', null, 'body')));
  assert.ok(!off.container.textContent!.includes('body'));
  assert.ok(!off.container.textContent!.includes('ACT'));
  await click(byLabel(off.container, 'Add border'));
  const on = await render(h(Section, { title: 'Border', optional: optional(true), actions: h('b', null, 'ACT') }, h('p', null, 'body')));
  assert.ok(on.container.textContent!.includes('body'));
  assert.ok(on.container.textContent!.includes('ACT'));
  await click(byLabel(on.container, 'Remove border'));
  assert.deepEqual(log, ['add', 'remove']);
  const dis = await render(h(Section, { title: 'Border', optional: optional(true), disabled: true }));
  assert.equal(maybeByLabel(dis.container, 'Remove border'), null);
  const plain = await render(h(Section, { title: 'Plain' }, h('p', null, 'x')));
  assert.equal(maybeByLabel(plain.container, 'Remove plain'), null);
  assert.ok(plain.container.textContent!.includes('Plain'));
});

// ---------- AlignmentControl ----------
test('AlignmentControl presses the active cell and sets both axes on click', async () => {
  const { sp, calls } = makeSp({ values: { justifyContent: 'center', alignItems: 'flex-end' } });
  const r = await render(h(AlignmentControl, { sp }));
  const pressed = $$q(r.container, 'button[aria-pressed="true"]');
  assert.equal(pressed.length, 1);
  assert.equal(pressed[0].getAttribute('aria-label'), 'Align end, justify center');
  await click(byLabel(r.container, 'Align start, justify end'));
  assert.deepEqual(calls[0], ['setMany', { justifyContent: 'flex-end', alignItems: 'flex-start' }]);
  const { sp: sp2 } = makeSp();
  const r2 = await render(h(AlignmentControl, { sp: sp2 }));
  assert.equal($$q(r2.container, 'button[aria-pressed="true"]').length, 0, 'default stretch matches no cell');
  const { sp: sp3 } = makeSp({ disabled: true, inherited: { justifyContent: 'flex-end', alignItems: 'center' } });
  const r3 = await render(h(AlignmentControl, { sp: sp3 }));
  assert.equal($$q<HTMLButtonElement>(r3.container, 'button')[0].disabled, true);
  assert.equal($$q(r3.container, 'button[aria-pressed="true"]')[0].getAttribute('aria-label'), 'Align center, justify end');
});

// ---------- controls ----------
test('MoreToggle reflects open state and calls onToggle', async () => {
  let n = 0;
  const r = await render(h(MoreToggle, { open: true, onToggle: () => n++, label: 'More' }));
  const b = byLabel(r.container, 'More');
  assert.equal(b.getAttribute('aria-expanded'), 'true');
  await click(b);
  assert.equal(n, 1);
});

test('Segmented reports selection, ignores deselect, honours disabled', async () => {
  const picked: string[] = [];
  const opts = [{ value: 'a', label: 'A', title: 'Opt A' }, { value: 'b', label: 'B', title: 'Opt B' }];
  const r = await render(h(Segmented, { value: 'a', options: opts, onChange: (v: string) => picked.push(v) }));
  assert.equal(byLabel(r.container, 'Opt A').getAttribute('aria-checked'), 'true');
  await click(byLabel(r.container, 'Opt B'));
  assert.deepEqual(picked, ['b']);
  await click(byLabel(r.container, 'Opt A')); // already selected: radix deselects -> '' ignored
  assert.deepEqual(picked, ['b']);
  const d = await render(h(Segmented, { value: undefined, options: opts, onChange: (v: string) => picked.push(v), disabled: true }));
  assert.equal(byLabel<HTMLButtonElement>(d.container, 'Opt A').disabled, true);
});
