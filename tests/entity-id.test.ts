import { test } from 'node:test';
import assert from 'node:assert/strict';
import { version, validate, v4 } from 'uuid';
import { newEntityId } from '../src/lib/entity-id';

test('new entity IDs are valid UUIDv7 values and remain unique', () => {
  const ids = Array.from({ length: 1000 }, () => newEntityId());
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.ok(validate(id));
    assert.equal(version(id), 7);
  }
});

test('project and page schemas preserve supplied v4 and v7 IDs', async () => {
  const { CreateProjectSchema } = await import('../src/features/projects/schema/project');
  const { CreatePageSchema } = await import('../src/features/projects/schema/page');
  for (const id of [v4(), newEntityId()]) {
    assert.equal(CreateProjectSchema.parse({ id, name: 'Project' }).id, id);
    assert.equal(CreatePageSchema.parse({ Id: id, Name: 'Page', ProjectId: 'project' }).Id, id);
  }
});
