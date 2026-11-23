import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { ElementTreeHelper as H } from '../src/features/elements/lib/element-tree-helper';
import {
  generateImports,
  getAvailableComponentImports,
  getComponentImport,
  getComponentImports,
  registerComponentImport,
} from '../src/features/editor/lib/code/generateImports';
import {
  CMSContentGridGenerateStrategy,
  CMSContentItemGenerateStrategy,
  CMSContentListGenerateStrategy,
  generateStrategies,
} from '../src/features/editor/lib/code/generatestrategies';

const n = (id: string, type = 'Frame', elements?: unknown[]) =>
  ({ id, type, content: '', pageId: 'p', ...(elements ? { elements } : {}) }) as never;
type N = { id: string; elements?: N[]; parentId?: string };
const ids = (list: unknown) => (list as N[]).map((e) => e.id);
const tree = () => [
  n('a', 'Text'),
  n('b', 'Frame', [n('b1', 'Text'), n('b2', 'Section', [n('b2a', 'Text')])]),
  n('c', 'Text'),
];

test('isEditableElement is true for text-like types only', () => {
  assert.equal(H.isEditableElement(n('x', 'Text')), true);
  assert.equal(H.isEditableElement(n('x', 'Frame')), false);
});

test('flatten returns every element depth-first', () => {
  assert.deepEqual(ids(H.flatten(tree())), ['a', 'b', 'b1', 'b2', 'b2a', 'c']);
  assert.deepEqual(H.flatten([]), []);
});

test('mapAddChildById appends to the root or to a container, and skips non-containers', () => {
  assert.deepEqual(ids(H.mapAddChildById(tree(), null, n('new'))), ['a', 'b', 'c', 'new']);
  const inFrame = H.mapAddChildById(tree(), 'b', n('new')) as unknown as N[];
  assert.deepEqual(ids(inFrame[1].elements), ['b1', 'b2', 'new']);
  const original = tree();
  assert.deepEqual(H.mapAddChildById(original, 'a', n('new')), tree(), 'a Text cannot hold children');
  assert.equal(H.mapAddChildById(original, 'ghost', n('new')), original);
});

test('mapSwapChildrenById swaps siblings at the root and inside a container', () => {
  assert.deepEqual(ids(H.mapSwapChildrenById(tree(), null, 'a', 'c')), ['c', 'b', 'a']);
  const swapped = H.mapSwapChildrenById(tree(), 'b', 'b1', 'b2') as unknown as N[];
  assert.deepEqual(ids(swapped[1].elements), ['b2', 'b1']);
});

test('mapSwapChildrenById is a no-op for missing ids or parents', () => {
  const original = tree();
  assert.equal(H.mapSwapChildrenById(original, null, 'a', 'nope'), original);
  assert.equal(H.mapSwapChildrenById(original, 'ghost', 'a', 'c'), original);
  assert.equal(H.mapSwapChildrenById(original, 'a', 'x', 'y'), original, 'non-container parent');
});

test('mapRecursively applies the updater to every node, descending into containers', () => {
  const seen: string[] = [];
  const out = H.mapRecursively(tree(), (e) => {
    seen.push(e.id);
    return { ...e, name: `n-${e.id}` } as never;
  });
  assert.deepEqual(seen, ['a', 'b', 'b1', 'b2', 'b2a', 'c']);
  assert.deepEqual(H.flatten(out).map((e) => (e as unknown as { name: string }).name), ['n-a', 'n-b', 'n-b1', 'n-b2', 'n-b2a', 'n-c']);
});

test('mapInsertRelative places an element before, after or inside the target', () => {
  const before = H.mapInsertRelative(tree(), n('new'), 'c', 'before') as unknown as N[];
  assert.deepEqual(ids(before), ['a', 'b', 'new', 'c']);
  const after = H.mapInsertRelative(tree(), n('new'), 'b1', 'after') as unknown as N[];
  assert.deepEqual(ids(after[1].elements), ['b1', 'new', 'b2']);
  assert.equal(after[1].elements![1].parentId, 'b');
  const inside = H.mapInsertRelative(tree(), n('new'), 'b', 'inside') as unknown as N[];
  assert.deepEqual(ids(inside[1].elements), ['b1', 'b2', 'new']);
  assert.equal(inside[1].elements![2].parentId, 'b');
});

test('mapInsertRelative refuses missing targets and non-container "inside" targets', () => {
  const original = tree();
  assert.equal(H.mapInsertRelative(original, n('new'), 'ghost', 'before'), original);
  assert.equal(H.mapInsertRelative(original, n('new'), 'ghost', 'inside'), original);
  assert.equal(H.mapInsertRelative(original, n('new'), 'a', 'inside'), original);
});

test('mapInsertAt clamps the index and can target a nested parent', () => {
  assert.deepEqual(ids(H.mapInsertAt(tree(), null, -5, n('new'))), ['new', 'a', 'b', 'c']);
  assert.deepEqual(ids(H.mapInsertAt(tree(), null, 99, n('new'))), ['a', 'b', 'c', 'new']);
  const nested = H.mapInsertAt(tree(), 'b2', 0, n('new')) as unknown as N[];
  assert.deepEqual(ids(nested[1].elements![1].elements), ['new', 'b2a']);
  const original = tree();
  assert.deepEqual(H.mapInsertAt(original, 'a', 0, n('new')), tree(), 'a leaf parent is left alone');
});

test('mapMoveRelative moves within and across containers', () => {
  const moved = H.mapMoveRelative(tree(), 'a', 'b1', 'after') as unknown as N[];
  assert.deepEqual(ids(moved), ['b', 'c']);
  assert.deepEqual(ids(moved[0].elements), ['b1', 'a', 'b2']);
  assert.equal(moved[0].elements![1].parentId, 'b');

  const up = H.mapMoveRelative(tree(), 'b2a', 'a', 'before') as unknown as N[];
  assert.deepEqual(ids(up), ['b2a', 'a', 'b', 'c']);
  assert.equal(up[0].parentId, undefined);
});

test('mapMoveRelative refuses impossible moves and returns the same array', () => {
  const original = tree();
  assert.equal(H.mapMoveRelative(original, 'a', 'a', 'after'), original, 'onto itself');
  assert.equal(H.mapMoveRelative(original, 'ghost', 'a', 'after'), original, 'missing source');
  assert.equal(H.mapMoveRelative(original, 'b', 'b2a', 'inside'), original, 'into own descendant');
  assert.equal(H.mapMoveRelative(original, 'a', 'ghost', 'before'), original, 'missing target');
});

// ------------------------------------------------------------- import registry

const snapshot = { ...getAvailableComponentImports() };
afterEach(() => {
  for (const key of Object.keys(getAvailableComponentImports())) {
    if (!(key in snapshot)) delete (getAvailableComponentImports() as Record<string, string>)[key];
  }
});

test('getAvailableComponentImports returns a defensive copy', () => {
  const copy = getAvailableComponentImports();
  copy.Carousel = 'tampered';
  assert.notEqual(getAvailableComponentImports().Carousel, 'tampered');
  assert.match(getAvailableComponentImports().Button, /components\/ui\/button/);
});

test('getComponentImport / getComponentImports look up known components only', () => {
  assert.match(getComponentImport('Badge')!, /ui\/badge/);
  assert.equal(getComponentImport('Nope'), undefined);
  const subset = getComponentImports(['Badge', 'Nope', 'Switch']);
  assert.deepEqual(Object.keys(subset), ['Badge', 'Switch']);
  assert.deepEqual(getComponentImports([]), {});
});

test('registerComponentImport makes generateImports emit a custom component', () => {
  assert.equal(generateImports('<Fancy />'), "import React from 'react';");
  registerComponentImport('Fancy', "import { Fancy } from '@/components/fancy';");
  assert.equal(getComponentImport('Fancy'), "import { Fancy } from '@/components/fancy';");
  assert.match(generateImports('<Fancy />'), /components\/fancy/);
});

// ------------------------------------------------------------- CMS strategies

const el = (type: string, extra: Record<string, unknown> = {}) =>
  ({ id: `id-${type}`, type, name: type, content: '', tailwindStyles: '', ...extra }) as never;

test('CMS strategies render a div carrying their settings and child template', () => {
  const cases = [
    [new CMSContentListGenerateStrategy(), 'CMSContentList', { contentTypeId: 'ct1', limit: 10 }],
    [new CMSContentItemGenerateStrategy(), 'CMSContentItem', { contentTypeId: 'ct1', itemSlug: 'hello' }],
    [new CMSContentGridGenerateStrategy(), 'CMSContentGrid', { contentTypeId: 'ct1', limit: 6 }],
  ] as const;
  for (const [strategy, type, settings] of cases) {
    const node = strategy.generate(el(type, { settings, elements: [el('Text', { content: 'tpl' })] }));
    assert.ok(node, type);
    const code = generate(node as t.Node).code;
    assert.match(code, /^<div/, type);
    assert.match(code, /contentTypeId="ct1"/, type);
    assert.match(code, /tpl/, type);
    assert.equal(strategy.generate(el('Text')), null, `${type} ignores other types`);
    assert.equal(generateStrategies[type], generateStrategies[type]);
  }
});
