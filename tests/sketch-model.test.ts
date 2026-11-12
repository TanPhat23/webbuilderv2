import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  cloneWithNewIds, dropTarget, groupByPage, toSketch, type PageItem,
} from '../src/features/editor/components/wireframe/sketchModel';

test('leaf elements map to sketch kinds', () => {
  assert.deepEqual(toSketch({ type: 'Heading', content: 'Hello' }), { kind: 'heading', width: 40 });
  assert.deepEqual(toSketch({ type: 'Heading', content: 'x'.repeat(200) }), { kind: 'heading', width: 90 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'Short' }), { kind: 'text', lines: 1 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'x'.repeat(100) }), { kind: 'text', lines: 2 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'x'.repeat(300) }), { kind: 'text', lines: 3 });
  assert.deepEqual(toSketch({ type: 'Button' }), { kind: 'button' });
  assert.deepEqual(toSketch({ type: 'Link' }), { kind: 'link' });
  assert.deepEqual(toSketch({ type: 'Image' }), { kind: 'media' });
  assert.deepEqual(toSketch({ type: 'Carousel', elements: [{ type: 'Image' }] }), { kind: 'media' });
  assert.deepEqual(toSketch({ type: 'Input' }), { kind: 'field' });
  assert.deepEqual(toSketch({ type: 'Icon' }), { kind: 'icon' });
  assert.deepEqual(toSketch({ type: 'Separator' }), { kind: 'rule' });
  assert.deepEqual(toSketch({ type: 'SomethingCustom' }), { kind: 'plain' });
});

test('container direction from styles', () => {
  const kids = [{ type: 'Button' }];
  const dir = (styles: Record<string, unknown>) => {
    const n = toSketch({ type: 'Section', styles: { default: styles }, elements: kids });
    return n.kind === 'box' ? [n.dir, n.cols] : null;
  };
  assert.deepEqual(dir({ display: 'flex' }), ['row', undefined]);
  assert.deepEqual(dir({ display: 'flex', flexDirection: 'column' }), ['col', undefined]);
  assert.deepEqual(dir({ display: 'block' }), ['col', undefined]);
  assert.deepEqual(dir({}), ['col', undefined]);
  assert.deepEqual(dir({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }), ['row', 3]);
  assert.deepEqual(dir({ display: 'grid', gridTemplateColumns: '1fr 2fr' }), ['row', 2]);
});

test('container direction from tailwind classes when styles are silent', () => {
  const dir = (tw: string) => {
    const n = toSketch({ type: 'Frame', tailwindStyles: tw, elements: [{ type: 'Text' }] });
    return n.kind === 'box' ? [n.dir, n.cols] : null;
  };
  assert.deepEqual(dir('flex items-center'), ['row', undefined]);
  assert.deepEqual(dir('flex flex-col gap-4'), ['col', undefined]);
  assert.deepEqual(dir('flex flex-col md:flex-row'), ['row', undefined]);
  assert.deepEqual(dir('grid grid-cols-1 md:grid-cols-3'), ['row', 3]);
  assert.deepEqual(dir('p-4 rounded'), ['col', undefined]);
});

test('an empty container is still a box', () => {
  assert.deepEqual(toSketch({ type: 'Section', elements: [] }), { kind: 'box', dir: 'col', children: [] });
  assert.deepEqual(toSketch({ type: 'Section' }), { kind: 'box', dir: 'col', children: [] });
});

test('depth and child limits', () => {
  let deep: { type: string; elements?: unknown[] } = { type: 'Text' };
  for (let i = 0; i < 6; i++) deep = { type: 'Frame', elements: [deep] };
  let n = toSketch(deep as never);
  let depth = 0;
  while (n.kind === 'box') { n = n.children[0]; depth++; }
  assert.equal(depth, 4);
  assert.deepEqual(n, { kind: 'more' });

  const wide = toSketch({ type: 'Section', elements: Array.from({ length: 9 }, () => ({ type: 'Button' })) });
  assert.equal(wide.kind, 'box');
  if (wide.kind === 'box') {
    assert.equal(wide.children.length, 7);
    assert.deepEqual(wide.children[6], { kind: 'more', count: 3 });
  }
});

test('groupByPage: nested response', () => {
  const g = groupByPage([
    { id: 'a', pageId: 'p1', elements: [{ id: 'a1', pageId: 'p1', parentId: 'a' }] },
    { id: 'b', pageId: 'p2' },
  ]);
  assert.deepEqual([...g.keys()], ['p1', 'p2']);
  assert.equal(g.get('p1')!.length, 1);
  assert.equal(g.get('p1')![0].elements!.length, 1);
});

test('groupByPage: flat response with parentId, ordered', () => {
  const flat: PageItem[] = [
    { id: 'a2', pageId: 'p1', parentId: 'a', order: 1 },
    { id: 'a', pageId: 'p1', order: 1 },
    { id: 'a1', pageId: 'p1', parentId: 'a', order: 0 },
    { id: 'z', pageId: 'p1', order: 0 },
  ];
  const g = groupByPage(flat);
  const top = g.get('p1')!;
  assert.deepEqual(top.map((e) => e.id), ['z', 'a']);
  assert.deepEqual(top[1].elements!.map((e) => e.id), ['a1', 'a2']);
});

test('groupByPage: a child listed both nested and flat is attached once', () => {
  const g = groupByPage([
    { id: 'a', pageId: 'p1', elements: [{ id: 'a1', pageId: 'p1', parentId: 'a' }] },
    { id: 'a1', pageId: 'p1', parentId: 'a' },
  ]);
  assert.equal(g.get('p1')!.length, 1);
  assert.equal(g.get('p1')![0].elements!.length, 1);
});

test('cloneWithNewIds gives every node a new id and re-parents children', () => {
  let n = 0;
  type Node = { id: string; parentId?: string | null; name?: string; elements?: Node[] };
  const src: Node = { id: 's', parentId: null, name: 'Hero', elements: [{ id: 'c', parentId: 's', elements: [{ id: 'g', parentId: 'c' }] }] };
  const copy = cloneWithNewIds(src, () => `new${++n}`);
  assert.equal(copy.id, 'new1');
  assert.equal(copy.parentId, null);
  assert.equal(copy.name, 'Hero');
  assert.equal(copy.elements![0].id, 'new2');
  assert.equal(copy.elements![0].parentId, 'new1');
  assert.equal(copy.elements![0].elements![0].parentId, 'new2');
  assert.equal(src.elements![0].id, 'c');
});

test('dropTarget: gap index to store move, no-ops return null', () => {
  const ids = ['a', 'b', 'c'];
  assert.deepEqual(dropTarget(ids, 'c', 0), { targetId: 'a', position: 'before' });
  assert.deepEqual(dropTarget(ids, 'a', 3), { targetId: 'c', position: 'after' });
  assert.deepEqual(dropTarget(ids, 'a', 2), { targetId: 'c', position: 'before' });
  assert.equal(dropTarget(ids, 'b', 1), null);
  assert.equal(dropTarget(ids, 'b', 2), null);
  assert.equal(dropTarget(ids, 'x', 1), null);
  assert.equal(dropTarget(['a'], 'a', 0), null);
});
