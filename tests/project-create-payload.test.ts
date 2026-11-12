import { register } from 'node:module';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// The service also runs in Vite; provide its build-time environment to node:test.
register('data:text/javascript,' + encodeURIComponent(`
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  return result;
}`));

test('project creation sends blank optional descriptions as null and preserves real text', async (t) => {
  let received: Record<string, unknown> | undefined;
  const server = createServer(async (request, response) => {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    received = JSON.parse(raw);
    response.writeHead(201, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ id: received?.id, name: received?.name }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const previous = process.env.GO_SERVER_URL;
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  process.env.GO_SERVER_URL = `http://127.0.0.1:${address.port}`;
  try {
    const { projectService } = await import('../src/features/projects/services/project.service');
    for (const [label, description, expected] of [
      ['empty', '', null],
      ['whitespace', ' \t\n ', null],
      ['omitted', undefined, null],
      ['null', null, null],
      ['text', '  A real description  ', '  A real description  '],
    ] as const) {
      await t.test(label, async () => {
        const project = { id: '019aa560-0000-7000-8000-000000000001', name: 'New project', description };
        await projectService.createProjectWithPage(project, 'test-token');
        assert.deepEqual(received, { id: project.id, name: 'New project', description: expected });
      });
    }
  } finally {
    if (previous === undefined) delete process.env.GO_SERVER_URL;
    else process.env.GO_SERVER_URL = previous;
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
