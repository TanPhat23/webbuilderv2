import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { validateLogic, validateLogicScopes, setVariable, setFlow, moveLogic } from '../src/features/interactions/logic';

const empty = () => ({ v: 1 as const, variables: {}, flows: {} });

test('validates types, defaults, names and flow step paths', () => {
  assert.deepEqual(validateLogic({ v: 1, variables: { count: { type: 'number', default: 0 }, user: { type: 'object', default: null, lifetime: 'session' } }, flows: { greet: { do: [{ toast: 'Hello' }] } } }), []);
  const issues = validateLogic({ v: 1, variables: { 'bad-name': { type: 'number', default: 'x' } }, flows: { greet: { do: [{ toast: 3 }] } } });
  assert.ok(issues.some(i => i.path === 'logic.variables.bad-name'));
  assert.ok(issues.some(i => i.path === 'logic.variables.bad-name.default'));
  assert.ok(issues.some(i => i.path === 'logic.flows.greet.do[0].toast'));
});

test('rejects duplicate variable and flow names across project and pages', () => {
  const project = { v: 1, variables: { count: { type: 'number', default: 0 } }, flows: { greet: { do: [] } } };
  const pages = { one: { v: 1, variables: { count: { type: 'number', default: 1 } }, flows: {} }, two: { v: 1, variables: {}, flows: { greet: { do: [] } } } };
  const issues = validateLogicScopes(project, pages);
  assert.ok(issues.some(i => i.path === 'pages.one.variables.count'));
  assert.ok(issues.some(i => i.path === 'pages.two.flows.greet'));
});

test('operations validate and move definitions without mutating source documents', () => {
  const original = empty();
  const added = setVariable(original, 'count', { type: 'number', default: 0 });
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.deepEqual(original.variables, {});
  const flow = setFlow(added.logic, 'greet', [{ toast: 'Hello' }]);
  assert.equal(flow.ok, true);
  if (!flow.ok) return;
  const moved = moveLogic(flow.logic, empty(), 'variable', 'count');
  assert.equal(moved.ok, true);
  if (!moved.ok) return;
  assert.equal(Object.hasOwn(moved.from.variables, 'count'), false);
  assert.equal(moved.to.variables.count.default, 0);
  assert.equal(moveLogic(flow.logic, added.logic, 'variable', 'count').ok, false);
  assert.equal(setVariable(original, 'bad-name', { type: 'number', default: 0 }).ok, false);
});

test('published schema describes logic documents and nested flow steps', async () => {
  const { buildJsonSchema } = await import('../src/features/interactions/schema-json');
  const schema = buildJsonSchema() as any;
  assert.equal(schema.$defs.logic.properties.v.const, 1);
  assert.equal(schema.$defs.logic.properties.flows.additionalProperties.properties.do.items.$ref, '#/$defs/step');
  assert.equal(schema.$defs.variable.properties.type.enum.includes('number'), true);
});

test('published logic variable schema enforces matching default types', async () => {
  const { createRequire } = await import('node:module');
  const { buildJsonSchema } = await import('../src/features/interactions/schema-json');
  const schema: any = buildJsonSchema();
  delete schema.$schema;
  const Ajv = createRequire(import.meta.url)('ajv');
  const validate = new Ajv({ schemaId: 'auto' }).compile({ $ref: '#/$defs/logic', $defs: schema.$defs });
  assert.equal(validate({ v: 1, variables: { n: { type: 'number', default: 'wrong' } }, flows: {} }), false);
  assert.equal(validate({ v: 1, variables: { n: { type: 'number', default: 4 }, u: { type: 'object', default: null } }, flows: {} }), true);
});

test('reserved prototype names cannot be declared because expressions cannot reference them', () => {
  const issues = validateLogic({ v: 1, variables: { constructor: { type: 'string', default: '' }, prototype: { type: 'number', default: 0 } }, flows: {} });
  assert.ok(issues.some(i => i.path === 'logic.variables.constructor'));
  assert.ok(issues.some(i => i.path === 'logic.variables.prototype'));
});
