import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { projectScopedKeys } from '../src/features/collaboration/hooks/projectScopedKeys';

test('collaboration query keys retain their cache paths', () => {
  for (const root of ['invitations', 'collaborators']) {
    const keys = projectScopedKeys(root);
    assert.deepEqual(keys.all, [root]);
    assert.deepEqual(keys.lists(), [root, 'list']);
    assert.deepEqual(keys.list({ status: 'open' }), [root, 'list', { status: 'open' }]);
    assert.deepEqual(keys.byProject('project-1'), [root, 'project', 'project-1']);
  }
});
