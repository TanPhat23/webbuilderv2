import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ElementStrategyMap,
  getElementStrategy,
} from '../src/features/editor/utils/element/create/elementStrategyMap';
import type { ElementType } from '../src/types/global.type';

const ALL_TYPES = Object.keys(ElementStrategyMap) as ElementType[];

const build = (type: ElementType, extra: Record<string, unknown> = {}) =>
  getElementStrategy(type).buildElement({
    id: `id-${type}`,
    type,
    pageId: 'page-1',
    ...extra,
  } as never) as Record<string, any>;

test('every element type has a strategy that preserves identity fields', () => {
  assert.equal(ALL_TYPES.length, 34);
  for (const type of ALL_TYPES) {
    const el = build(type, { src: '/a.png', href: '/b' });
    assert.equal(el.id, `id-${type}`, type);
    assert.equal(el.type, type, type);
    assert.equal(el.pageId, 'page-1', type);
    assert.equal(el.src, '/a.png', type);
    assert.equal(el.href, '/b', type);
    assert.deepEqual(el.elements, [], type);
    assert.equal(typeof el.content, 'string', type);
    assert.equal(typeof el.tailwindStyles, 'string', type);
    assert.equal(typeof el.styles, 'object', type);
  }
});

test('an empty parentId is normalised to undefined, a real one is kept', () => {
  for (const type of ALL_TYPES) {
    assert.equal(build(type, { parentId: '' }).parentId, undefined, type);
    assert.equal(build(type).parentId, undefined, type);
    assert.equal(build(type, { parentId: 'parent-1' }).parentId, 'parent-1', type);
  }
});

test('template content, styles and tailwind classes win over strategy defaults', () => {
  const styles = { default: { color: 'red' } };
  for (const type of ALL_TYPES) {
    const el = build(type, {
      content: 'custom',
      styles,
      tailwindStyles: 'p-4',
    });
    assert.equal(el.content, 'custom', type);
    assert.deepEqual(el.styles, styles, type);
    assert.equal(el.tailwindStyles, 'p-4', type);
  }
});

test('an empty template does not wipe strategy defaults', () => {
  const heading = build('Heading', { styles: {}, tailwindStyles: '' });
  assert.equal(heading.content, 'Heading');
  assert.equal(heading.styles.default.fontWeight, '700');
  assert.match(heading.tailwindStyles, /text-2xl/);
  // An explicit empty-string content is still an explicit value.
  assert.equal(build('Heading', { content: '' }).content, '');
});

test('built elements never share mutable state between calls', () => {
  for (const type of ALL_TYPES) {
    const first = build(type);
    const second = build(type);
    assert.deepEqual(first, second, type);
    first.elements.push('x');
    if (first.settings && typeof first.settings === 'object') {
      first.settings.__mutated = true;
    }
    first.styles.__mutated = true;
    const third = build(type);
    assert.deepEqual(third, second, `${type} leaked mutation`);
  }
});

test('content-less leaf types fall back to their placeholder content', () => {
  const expected: Partial<Record<ElementType, string>> = {
    Text: 'Text',
    Span: 'Span text',
    Heading: 'Heading',
    Label: 'Label',
    Link: 'Link',
    Button: 'Click me',
    Video: 'Video',
    Audio: 'Audio',
    IFrame: 'Embedded content',
    Image: 'Image',
    Checkbox: 'Checkbox label',
    Radio: 'Radio label',
    Blockquote: 'Blockquote text goes here...',
  };
  for (const [type, content] of Object.entries(expected)) {
    assert.equal(build(type as ElementType).content, content, type);
  }
  assert.match(build('Code').content, /console\.log/);
  for (const type of ['Frame', 'Section', 'Nav', 'Header', 'Footer', 'Article', 'Aside', 'Form', 'Table'] as ElementType[]) {
    assert.equal(build(type).content, '', type);
  }
});

test('strategies seed the documented default settings', () => {
  assert.deepEqual(build('Text').settings, null);
  assert.deepEqual(build('Heading').settings, { level: 2 });
  assert.deepEqual(build('Label').settings, { htmlFor: '' });
  assert.deepEqual(build('Blockquote').settings, { cite: '' });
  assert.deepEqual(build('Code').settings, { language: 'javascript', preformatted: true });
  assert.equal(build('Icon').settings.iconName, 'star');
  assert.equal(build('Icon').settings.size, 24);
  assert.deepEqual(build('Image').settings, { objectFit: 'cover', loading: 'lazy', decoding: 'async' });
  assert.equal(build('Video').settings.playsInline, true);
  assert.equal(build('Video').settings.autoplay, false);
  assert.equal(build('Audio').settings.preload, 'metadata');
  assert.equal(build('IFrame').settings.sandbox, 'allow-scripts allow-same-origin');
  assert.equal(build('IFrame').settings.height, 400);
  assert.equal(build('Input').settings.type, 'text');
  assert.equal(build('Textarea').settings.rows, 4);
  assert.equal(build('Checkbox').settings.label, 'Checkbox label');
  assert.equal(build('Radio').settings.label, 'Radio label');
  assert.deepEqual(
    [build('Progress').settings.value, build('Progress').settings.max],
    [50, 100],
  );
  assert.equal(build('Form').settings.method, 'post');
  assert.equal(build('Form').settings.encType, 'application/x-www-form-urlencoded');
  assert.equal(build('Carousel').settings.autoplay, true);
});

test('table strategy seeds three left-aligned columns with unique ids', () => {
  const { columns, bordered, striped } = build('Table').settings;
  assert.equal(columns.length, 3);
  assert.equal(new Set(columns.map((c: { id: string }) => c.id)).size, 3);
  assert.ok(columns.every((c: { align: string }) => c.align === 'left'));
  assert.equal(bordered, true);
  assert.equal(striped, false);
});

test('CMS strategies seed their data-binding settings', () => {
  const list = build('CMSContentList').settings;
  assert.equal(list.displayMode, 'list');
  assert.equal(list.limit, 10);
  assert.equal(list.sortOrder, 'desc');
  const grid = build('CMSContentGrid').settings;
  assert.equal(grid.displayMode, 'grid');
  assert.equal(grid.limit, 6);
  assert.deepEqual(grid.fieldsToShow, ['title', 'content']);
  const item = build('CMSContentItem').settings;
  assert.equal(item.itemSlug, '');
  assert.equal(item.contentTypeId, '');
});

test('getElementStrategy rejects unknown types, including prototype keys', () => {
  for (const bad of ['Nope', 'constructor', 'toString', '__proto__', '']) {
    assert.throws(
      () => getElementStrategy(bad as ElementType),
      /No strategy found for element type/,
      bad,
    );
  }
});
