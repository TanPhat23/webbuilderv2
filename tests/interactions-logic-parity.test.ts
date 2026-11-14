// Client/server parity: the same fixtures are checked by the Go validator
// (webbuilder.api.go internal/realtime/domain/logic/parity_test.go).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateLogic } from '../src/features/interactions/logic';

const here = join(import.meta.dirname, 'fixtures', 'logic-parity.json');
const fixtures = JSON.parse(readFileSync(here, 'utf8')) as { cases: { name: string; accept: boolean; doc: unknown }[] };

test('logic parity fixtures: storable means no error-level issues', () => {
  for (const c of fixtures.cases) {
    const errors = validateLogic(c.doc).filter((i) => i.level === 'error');
    assert.equal(errors.length === 0, c.accept, `${c.name}: ${JSON.stringify(errors)}`);
  }
});

test('logic parity fixtures match the API copy', (t) => {
  const api = process.env.WEBBUILDER_API_DIR ?? join(import.meta.dirname, '..', '..', 'Go', 'webbuilder.api.go');
  const copy = join(api, 'internal', 'realtime', 'domain', 'logic', 'testdata', 'parity.json');
  if (!existsSync(copy)) return t.skip(`API repo not found at ${api}`);
  assert.deepEqual(JSON.parse(readFileSync(copy, 'utf8')), fixtures);
});
