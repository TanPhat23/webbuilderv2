import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createCollaborationFixture } from '../e2e/helpers/collaboration-fixture';

test('creates a project, finds its page and adds the requested existing editor', async () => {
  const calls: { method: string; path: string; body?: unknown }[] = [];
  const request = async (method: string, path: string, body?: unknown) => {
    calls.push({ method, path, body });
    if (path.startsWith('/api/v1/users/search?')) return [{ id: 'second-user', email: 'editor@example.test' }];
    if (method === 'POST' && path === '/api/v1/projects') return { id: 'project-id' };
    if (method === 'GET' && path === '/api/v1/projects/project-id/pages') return [{ id: 'page-id' }];
    if (method === 'POST' && path === '/api/v1/collaborators') return { id: 'collaborator-id' };
    return undefined;
  };
  const fixture = await createCollaborationFixture(request, 'e2e-test', 'editor@example.test', 'project-id');
  assert.equal(fixture.editorPath, '/editor/project-id?page=page-id');
  assert.deepEqual(calls[3].body, { projectId: 'project-id', userId: 'second-user', role: 'editor' });
  await fixture.cleanup();
  assert.deepEqual(calls.slice(-2).map(c => [c.method, c.path]), [['DELETE', '/api/v1/collaborators/collaborator-id'], ['DELETE', '/api/v1/projects/project-id']]);
});

test('removes the temporary project if provisioning fails', async () => {
  const calls: string[] = [];
  const request = async (method: string, path: string) => {
    calls.push(`${method} ${path}`);
    if (path.startsWith('/api/v1/users/search?')) return [{ id: 'second-user', email: 'editor@example.test' }];
    if (path === '/api/v1/projects') return { id: 'project-id' };
    if (path.endsWith('/pages')) return [];
    return undefined;
  };
  await assert.rejects(createCollaborationFixture(request, 'e2e-test', 'editor@example.test', 'project-id'), /page/i);
  assert.equal(calls.at(-1), 'DELETE /api/v1/projects/project-id');
});
