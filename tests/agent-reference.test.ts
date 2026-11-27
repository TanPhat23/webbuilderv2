import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

const { buildAgentReference, AGENT_REFERENCE_TEXT_LIMIT } = await import(
  '../apps/editor/src/features/editor/lib/agentReference'
);

const base = { pageId: 'page-1', styles: {}, tailwindStyles: '' } as const;

function tree(textOver: Record<string, unknown> = {}): { elements: EditorElement[]; text: EditorElement } {
  const text = {
    ...base, id: 'text-1', type: 'Text', name: 'Title', content: 'Hello world', parentId: 'frame-1',
    tailwindStyles: 'text-xl font-bold', ...textOver,
  } as unknown as EditorElement;
  const frame = { ...base, id: 'frame-1', type: 'Frame', content: '', parentId: 'section-1', elements: [text] } as unknown as EditorElement;
  const section = { ...base, id: 'section-1', type: 'Section', name: 'Hero', content: '', elements: [frame] } as unknown as EditorElement;
  return { elements: [section], text };
}

test('builds the Markdown reference with id, type, name, page, ancestor path, classes and text', () => {
  const { elements, text } = tree();
  const lines = buildAgentReference(text, elements).split('\n');
  assert.deepEqual(lines, [
    'Webbuilder element reference',
    '- Element ID: text-1',
    '- Type: Text',
    '- Name: Title',
    '- Page ID: page-1',
    '- Path: Section "Hero" › Frame › Text "Title"',
    '- Classes: text-xl font-bold',
    '- Text: Hello world',
    'Edit this element with the webbuilder MCP tools, targeting the Element ID above.',
  ]);
});

test('omits lines whose value is empty and lists only the element itself for a root', () => {
  const root = { ...base, id: 'root-1', type: 'Section', content: '', pageId: '' } as unknown as EditorElement;
  const out = buildAgentReference(root, [root]);
  assert.equal(
    out,
    [
      'Webbuilder element reference',
      '- Element ID: root-1',
      '- Type: Section',
      '- Path: Section',
      'Edit this element with the webbuilder MCP tools, targeting the Element ID above.',
    ].join('\n'),
  );
  for (const label of ['Name', 'Page ID', 'Classes', 'Text']) assert.ok(!out.includes('- ' + label + ':'), label);
});

test('truncates long text to the limit with an ellipsis but never truncates classes', () => {
  const classes = Array.from({ length: 80 }, (_, i) => 'class-' + i).join(' ');
  const { elements, text } = tree({ content: 'x'.repeat(2000), tailwindStyles: classes });
  const out = buildAgentReference(text, elements);
  const textLine = out.split('\n').find((l) => l.startsWith('- Text: '));
  assert.ok(textLine);
  const value = textLine.slice('- Text: '.length);
  assert.equal(value.length, AGENT_REFERENCE_TEXT_LIMIT);
  assert.equal(AGENT_REFERENCE_TEXT_LIMIT, 500);
  assert.ok(value.endsWith('…'));
  assert.ok(out.includes('- Classes: ' + classes));
});

test('keeps text of exactly the limit untouched and collapses line breaks', () => {
  const exact = tree({ content: 'y'.repeat(500) });
  assert.ok(buildAgentReference(exact.text, exact.elements).includes('- Text: ' + 'y'.repeat(500) + '\n'));
  const multi = tree({ content: 'one\n\n  two' });
  assert.ok(buildAgentReference(multi.text, multi.elements).includes('- Text: one two\n'));
});

test('survives a parentId cycle and a missing parent', () => {
  const a = { ...base, id: 'a', type: 'Frame', content: '', parentId: 'b' } as unknown as EditorElement;
  const b = { ...base, id: 'b', type: 'Frame', content: '', parentId: 'a', elements: [a] } as unknown as EditorElement;
  assert.ok(buildAgentReference(a, [b]).includes('- Path: Frame › Frame'));
  const orphan = { ...base, id: 'o', type: 'Text', content: '', parentId: 'ghost' } as unknown as EditorElement;
  assert.ok(buildAgentReference(orphan, [orphan]).includes('- Path: Text\n'));
});
