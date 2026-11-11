import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '../src/client/queryclient';

test('server query clients do not share cached private data across requests', () => {
  const firstRequest = getQueryClient();
  firstRequest.setQueryData(['projects', 'user'], [{ id: 'private-project' }]);
  const secondRequest = getQueryClient();
  assert.notEqual(firstRequest, secondRequest);
  assert.equal(secondRequest.getQueryData(['projects', 'user']), undefined);
  assert.deepEqual(dehydrate(secondRequest).queries, []);
  firstRequest.clear();
  secondRequest.clear();
});
