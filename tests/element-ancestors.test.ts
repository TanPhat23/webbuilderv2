import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

const { findParentElement, getAncestorChain, layerLabel, LAYER_LABEL_TEXT_LIMIT } = await import(
  '../apps/editor/src/features/editor/utils/element/ancestors'
);
const { resolveClickSelection, isClimbModifier } = await import(
  '../apps/editor/src/features/editor/utils/element/clickSelection'
);

const el = (id: string, type: string, extra: Record<string, unknown> = {}, elements?: EditorElement[]): EditorElement =>
  ({ id, type, content: '', pageId: 'page-1', styles: {}, tailwindStyles: '', ...extra, ...(elements ? { elements } : {}) }) as unknown as EditorElement;

// section > frame > card > (image, text); a second section for siblings.
const image = el('image', 'Image', { parentId: 'card' });
const text = el('text', 'Text', { parentId: 'card', content: 'Cardamom Kouign-Amann' });
const card = el('card', 'Frame', { parentId: 'frame' }, [image, text]);
const frame = el('frame', 'Frame', { parentId: 'section' }, [card]);
const section = el('section', 'Section', { name: 'Menu' }, [frame]);
const other = el('other', 'Section');
const tree = [section, other];

test('findParentElement returns the containing element and undefined for roots and unknown ids', () => {
  assert.equal(findParentElement(tree, 'text')?.id, 'card');
  assert.equal(findParentElement(tree, 'card')?.id, 'frame');
  assert.equal(findParentElement(tree, 'section'), undefined);
  assert.equal(findParentElement(tree, 'other'), undefined);
  assert.equal(findParentElement(tree, 'missing'), undefined);
});

test('findParentElement follows tree position, not a stale parentId', () => {
  const stray = el('stray', 'Text', { parentId: 'nowhere' });
  const holder = el('holder', 'Frame', {}, [stray]);
  assert.equal(findParentElement([holder], 'stray')?.id, 'holder');
});

test('getAncestorChain lists the element then every ancestor, innermost first, up to the root', () => {
  assert.deepEqual(getAncestorChain(tree, 'text').map((e) => e.id), ['text', 'card', 'frame', 'section']);
  assert.deepEqual(getAncestorChain(tree, 'section').map((e) => e.id), ['section']);
  assert.deepEqual(getAncestorChain(tree, 'other').map((e) => e.id), ['other']);
});

test('getAncestorChain is empty for an id that is not in the tree', () => {
  assert.deepEqual(getAncestorChain(tree, 'missing'), []);
  assert.deepEqual(getAncestorChain([], 'text'), []);
});

test('layerLabel shows the type plus the name, else a short text, else just the type', () => {
  assert.equal(layerLabel(section), 'Section "Menu"');
  assert.equal(layerLabel(frame), 'Frame');
  assert.equal(layerLabel(image), 'Image');
  assert.equal(layerLabel(el('t', 'Text', { name: '  Title  ', content: 'ignored' })), 'Text "Title"');
  assert.equal(layerLabel(el('t', 'Text', { content: 'Hello   world\n again' })), 'Text "Hello world again"');
});

test('layerLabel truncates long text with an ellipsis and ignores non-string content', () => {
  assert.equal(layerLabel(text), 'Text "Cardamom Kouign-Amann"');
  const label = layerLabel(el('t', 'Text', { content: 'x'.repeat(100) }));
  assert.equal(label, 'Text "' + 'x'.repeat(LAYER_LABEL_TEXT_LIMIT - 1) + '…"');
  assert.equal(layerLabel(el('t', 'Frame', { content: { not: 'a string' } })), 'Frame');
  assert.equal(layerLabel(el('t', 'Text', { content: '<b>Bold</b> move' })), 'Text "Bold move"');
});

// ---- resolveClickSelection -----------------------------------------------------------

const click = (over: Partial<Parameters<typeof resolveClickSelection>[1]>) =>
  resolveClickSelection(tree, { clickedId: 'text', selectedId: undefined, alt: false, mod: false, ...over });

test('a plain click selects the clicked element', () => {
  assert.equal(click({}), 'text');
  assert.equal(click({ selectedId: 'section' }), 'text');
});

test('Alt+click selects the parent of the clicked element and falls back to it at a root', () => {
  assert.equal(click({ alt: true }), 'card');
  assert.equal(click({ alt: true, clickedId: 'section' }), 'section');
});

test('Ctrl/Cmd+click on the selected element selects its parent', () => {
  assert.equal(click({ mod: true, selectedId: 'text' }), 'card');
});

test('Ctrl/Cmd+click inside the selected element selects the parent of the selection', () => {
  assert.equal(click({ mod: true, selectedId: 'card', clickedId: 'text' }), 'frame');
  assert.equal(click({ mod: true, selectedId: 'section', clickedId: 'image' }), 'section', 'root has no parent: stays');
});

test('repeated Ctrl/Cmd+click climbs one level at a time up to the root', () => {
  let selected: string | undefined = 'text';
  const seen: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    selected = click({ mod: true, selectedId: selected });
    seen.push(selected);
  }
  assert.deepEqual(seen, ['card', 'frame', 'section', 'section', 'section']);
});

test('Ctrl/Cmd+click outside the selection, or with no selection, is a normal click', () => {
  assert.equal(click({ mod: true }), 'text');
  assert.equal(click({ mod: true, selectedId: 'other' }), 'text');
  assert.equal(click({ mod: true, selectedId: 'image' }), 'text', 'a sibling is not inside the selection');
  assert.equal(click({ mod: true, selectedId: 'text', clickedId: 'card' }), 'card', 'an ancestor of the selection is not inside it');
});

test('Alt wins over Ctrl/Cmd so Alt+click keeps working', () => {
  assert.equal(click({ alt: true, mod: true, selectedId: 'text' }), 'card');
  assert.equal(click({ alt: true, mod: true, selectedId: 'card', clickedId: 'text' }), 'card');
});

test('a stale selected id that is not in the tree is ignored', () => {
  assert.equal(click({ mod: true, selectedId: 'gone' }), 'text');
});

test('the climb modifier is Ctrl or Cmd, but only Cmd on Apple where Ctrl+click is a right-click', () => {
  assert.equal(isClimbModifier({ ctrlKey: true }, false), true);
  assert.equal(isClimbModifier({ metaKey: true }, false), true);
  assert.equal(isClimbModifier({}, false), false);
  assert.equal(isClimbModifier({ metaKey: true }, true), true);
  assert.equal(isClimbModifier({ ctrlKey: true }, true), false, 'Ctrl+click opens the context menu on a Mac');
  assert.equal(isClimbModifier({ ctrlKey: false, metaKey: false }, true), false);
});

test('getAncestorChain finds an element in a later sibling subtree', () => {
  const deep = el('deep', 'Text');
  const wrap = el('wrap', 'Frame', {}, [deep]);
  const root2 = el('root2', 'Section', {}, [el('first', 'Frame'), wrap]);
  assert.deepEqual(getAncestorChain([section, root2], 'deep').map((e) => e.id), ['deep', 'wrap', 'root2']);
});
