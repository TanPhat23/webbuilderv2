import { register } from 'node:module';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
const loader = `export async function load(url, context, nextLoad) { const result = await nextLoad(url, context); if (url.includes('src/utils/urlbuilder.ts')) result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})'); return result; }`;
register('data:text/javascript,' + encodeURIComponent(loader));

test('changing pages clears the previous page history and selection', async () => {
  const { ElementStore } = await import('../src/features/editor/store/element-store');
  const { SelectionStore } = await import('../src/features/editor/store/selection-store');
  const a = { id: 'a', type: 'Text', pageId: 'a', content: 'original' } as const;
  const b = { id: 'b', type: 'Text', pageId: 'b', content: 'second' } as const;
  ElementStore.getState().beginPage('project', 'a');
  ElementStore.getState().loadElements([a], true);
  SelectionStore.getState().setSelectedElement(a);
  ElementStore.getState().updateElement('a', { content: 'edited' });
  ElementStore.getState().beginPage('project', 'b');
  ElementStore.getState().loadElements([b], true);
  ElementStore.getState().undo();
  assert.deepEqual(ElementStore.getState().elements, [b]);
  assert.equal(SelectionStore.getState().selectedElementId, undefined);
});

test('selected element resolves current remote changes and disappears after deletion', async () => {
  const { ElementStore } = await import('../src/features/editor/store/element-store');
  const { SelectionStore } = await import('../src/features/editor/store/selection-store');
  const { getSelectedOrHoveredElement } = await import('../src/features/editor/store/selected-element');
  const element = { id: 'item', type: 'Text', pageId: 'page', content: 'old' } as const;
  ElementStore.getState().beginPage('project', 'page');
  ElementStore.getState().loadElements([element], true);
  SelectionStore.getState().setSelectedElement(element);
  ElementStore.getState().remoteUpdate('item', { content: 'new' });
  assert.equal(getSelectedOrHoveredElement()?.content, 'new');
  ElementStore.getState().remoteDelete('item');
  assert.equal(getSelectedOrHoveredElement(), undefined);
});
