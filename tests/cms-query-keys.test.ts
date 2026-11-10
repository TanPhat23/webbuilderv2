import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { cmsKeys } from '../src/features/cms/query-keys';

test('invalidating public CMS content reaches lists and individual items', async () => {
  const client = new QueryClient();
  const list = cmsKeys.publicContentList('type-a', 10, 'title', 'asc');
  const item = cmsKeys.publicContentDetail('type-a', 'hello');
  client.setQueryData(list, ['item']);
  client.setQueryData(item, { title: 'hello' });
  await client.invalidateQueries({ queryKey: cmsKeys.publicContent() });
  await client.invalidateQueries({ queryKey: cmsKeys.publicContentItem() });
  assert.equal(client.getQueryState(list)?.isInvalidated, true);
  assert.equal(client.getQueryState(item)?.isInvalidated, true);
});
