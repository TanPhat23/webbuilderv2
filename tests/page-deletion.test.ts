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

test('rejects IDs that could escape the page endpoint', async () => {
  const { deletePageInputSchema } = await import('../src/features/projects/schema/page-deletion');
  assert.equal(deletePageInputSchema.safeParse({ projectId: 'project-a', pageId: 'page-b' }).success, true);
  for (const pageId of ['../../victim', '%2e%2e', '..', 'a\\b', 'a/b']) {
    assert.equal(deletePageInputSchema.safeParse({ projectId: 'project-a', pageId }).success, false);
  }
});

test('changes the selected page only when it was deleted', async () => {
  const { pageAfterDeletion } = await import('../src/features/editor/store/delete-page');
  const remaining = [{ Id: 'other', ProjectId: 'project-a' }];
  assert.equal(pageAfterDeletion({ Id: 'deleted', ProjectId: 'project-a' }, 'deleted', remaining), remaining[0]);
  assert.equal(pageAfterDeletion({ Id: 'other', ProjectId: 'project-a' }, 'deleted', remaining)?.Id, 'other');
  assert.equal(pageAfterDeletion({ Id: 'deleted', ProjectId: 'project-a' }, 'deleted', []), null);
});
