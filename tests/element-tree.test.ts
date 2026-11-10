import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ElementTreeHelper } from '../src/features/editor/utils/element/element-tree-helper';
import type { EditorElement } from '../src/types/global.type';

const element = (type: string, id: string, elements?: EditorElement[]): EditorElement =>
  ({ type, id, pageId: 'page', content: '', ...(elements ? { elements } : {}) }) as EditorElement;

test('tree edits traverse actual child arrays, including Select elements', () => {
  const child = element('Text', 'child');
  const select = element('Select', 'select', [child]);
  const tree = [element('Frame', 'frame', [select])];
  assert.equal(ElementTreeHelper.findById(tree, 'child'), child);
  const updated = ElementTreeHelper.mapUpdateById(tree, 'child', el => ({ ...el, content: 'updated' }));
  assert.equal(ElementTreeHelper.findById(updated, 'child')?.content, 'updated');
  assert.equal(ElementTreeHelper.findById(tree, 'child')?.content, '');
  const deleted = ElementTreeHelper.mapDeleteById(tree, 'child');
  assert.equal(ElementTreeHelper.findById(deleted, 'child'), undefined);
  assert.equal(ElementTreeHelper.isContainerElement(select), false);
});

test('updating a matching parent does not also update descendants', () => {
  const tree = [element('Frame', 'same', [element('Text', 'same')])];
  const updated = ElementTreeHelper.mapUpdateById(tree, 'same', el => ({ ...el, content: 'updated' }));
  assert.equal(updated[0].content, 'updated');
  assert.equal((updated[0] as any).elements[0].content, '');
  assert.equal(ElementTreeHelper.flatten(ElementTreeHelper.mapDeleteById(tree, 'same')).length, 0);
});
