import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getElementStrategy } from '../src/features/editor/utils/element/create/elementStrategyMap';

test('link elements can be created with their page and destination', () => {
  const element = getElementStrategy('Link').buildElement({
    id: 'element-a', type: 'Link', pageId: 'page-a', href: '/about',
  });
  assert.equal(element.type, 'Link');
  assert.equal(element.pageId, 'page-a');
  assert.equal(element.href, '/about');
  assert.ok(element.content);
});
