import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deletePageFromList } from '../src/features/editor/store/delete-page';

test('deletes the selected page from its owning project', async () => {
  const pages = [{ Id: 'page-a', ProjectId: 'project-a' }, { Id: 'page-b', ProjectId: 'project-a' }];
  const calls: unknown[] = [];
  const result = await deletePageFromList(pages, 'page-b', async (projectId, pageId) => {
    calls.push({ projectId, pageId });
  });
  assert.deepEqual(calls, [{ projectId: 'project-a', pageId: 'page-b' }]);
  assert.deepEqual(result, [pages[0]]);
});

test('leaves the pages intact when deletion fails or the page is missing', async () => {
  const pages = [{ Id: 'page-a', ProjectId: 'project-a' }];
  await assert.rejects(deletePageFromList(pages, 'page-a', async () => { throw new Error('failed'); }));
  assert.deepEqual(pages, [{ Id: 'page-a', ProjectId: 'project-a' }]);
  assert.deepEqual(await deletePageFromList(pages, 'missing', async () => { throw new Error('unexpected'); }), pages);
});
