/** Versioned page and project logic documents and immutable editing operations. */
import { z } from 'zod';
import { isPlainObject, NAME_RE, validateInteractionMap, type Issue, type Step } from './schema';
import type { VariableDef } from './runtime/variables';

export interface LogicDocument {
  v: 1;
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
}

export const VariableSchema = z.strictObject({
  type: z.enum(['string', 'number', 'boolean', 'object', 'list']),
  default: z.unknown(),
  lifetime: z.enum(['page', 'session', 'local']).optional(),
});

export function emptyLogic(): LogicDocument {
  return { v: 1, variables: {}, flows: {} };
}

function validDefault(type: string, value: unknown): boolean {
  switch (type) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'object': return value === null || isPlainObject(value);
    case 'list': return Array.isArray(value);
    default: return false;
  }
}

export function validateLogic(value: unknown, at = 'logic'): Issue[] {
  const issues: Issue[] = [];
  const error = (path: string, message: string) => issues.push({ path, message, level: 'error' });
  if (!isPlainObject(value)) {
    error(at, 'must be a logic document');
    return issues;
  }
  for (const key of Object.keys(value)) if (!['v', 'variables', 'flows'].includes(key)) error(`${at}.${key}`, 'unknown field');
  if (value.v !== 1) error(`${at}.v`, 'must be 1');
  if (!isPlainObject(value.variables)) error(`${at}.variables`, 'must be an object');
  else for (const [name, def] of Object.entries(value.variables)) {
    const path = `${at}.variables.${name}`;
    if (!NAME_RE.test(name) || ['__proto__', 'constructor', 'prototype'].includes(name)) error(path, 'must be a valid expression-accessible name');
    const result = VariableSchema.safeParse(def);
    if (!result.success) {
      for (const issue of result.error.issues) error([path, ...issue.path].join('.'), issue.message);
    } else if (!isPlainObject(def) || !Object.hasOwn(def, 'default') || !validDefault(result.data.type, result.data.default)) {
      error(`${path}.default`, 'default must match the variable type');
    }
  }
  if (!isPlainObject(value.flows)) error(`${at}.flows`, 'must be an object');
  else for (const [name, flow] of Object.entries(value.flows)) {
    const path = `${at}.flows.${name}`;
    if (!NAME_RE.test(name)) error(path, 'must be a valid name');
    if (!isPlainObject(flow)) { error(path, 'must be a flow object'); continue; }
    for (const key of Object.keys(flow)) if (key !== 'do') error(`${path}.${key}`, 'unknown field');
    // A flow always has a step list (possibly empty); the server requires it too.
    if (!Array.isArray(flow.do)) { error(`${path}.do`, 'must be a list of steps'); continue; }
    const prefix = 'interactions.ix_aaaaaaaa';
    for (const issue of validateInteractionMap({ ix_aaaaaaaa: { on: 'click', do: flow.do } })) {
      issues.push({ ...issue, path: path + issue.path.slice(prefix.length) });
    }
  }
  return issues;
}

export function validateLogicScopes(project: unknown, pages: Record<string, unknown>): Issue[] {
  const issues = validateLogic(project, 'project');
  const seen = { variables: new Set<string>(), flows: new Set<string>() };
  const collect = (document: unknown, path: string) => {
    if (!isPlainObject(document)) return;
    for (const kind of ['variables', 'flows'] as const) {
      const entries = document[kind];
      if (!isPlainObject(entries)) continue;
      for (const name of Object.keys(entries)) {
        if (seen[kind].has(name)) issues.push({ path: `${path}.${kind}.${name}`, message: `duplicate ${kind === 'variables' ? 'variable' : 'flow'} name`, level: 'error' });
        else seen[kind].add(name);
      }
    }
  };
  collect(project, 'project');
  for (const [id, page] of Object.entries(pages)) {
    issues.push(...validateLogic(page, `pages.${id}`));
    collect(page, `pages.${id}`);
  }
  return issues;
}

type Result = { ok: true; logic: LogicDocument } | { ok: false; issues: Issue[] };
/** Structural errors only: whether incomplete steps may stay is up to the caller (`editLogic`). */
function checked(logic: LogicDocument): Result {
  const issues = validateLogic(logic).filter((i) => i.level === 'error');
  return issues.length ? { ok: false, issues } : { ok: true, logic };
}
export function setVariable(logic: LogicDocument, name: string, definition: VariableDef): Result {
  return checked({ ...logic, variables: { ...logic.variables, [name]: definition } });
}
export function removeVariable(logic: LogicDocument, name: string): Result {
  const { [name]: _, ...variables } = logic.variables;
  return checked({ ...logic, variables });
}
export function setFlow(logic: LogicDocument, name: string, steps: Step[]): Result {
  return checked({ ...logic, flows: { ...logic.flows, [name]: { do: steps } } });
}
export function removeFlow(logic: LogicDocument, name: string): Result {
  const { [name]: _, ...flows } = logic.flows;
  return checked({ ...logic, flows });
}
export function moveLogic(from: LogicDocument, to: LogicDocument, kind: 'variable' | 'flow', name: string):
  | { ok: true; from: LogicDocument; to: LogicDocument }
  | { ok: false; issues: Issue[] } {
  const key = kind === 'variable' ? 'variables' : 'flows';
  if (!Object.hasOwn(from[key], name) || Object.hasOwn(to[key], name)) {
    return { ok: false, issues: [{ path: `logic.${key}.${name}`, message: 'source missing or destination already exists', level: 'error' }] };
  }
  const updatedFrom = kind === 'variable' ? removeVariable(from, name) : removeFlow(from, name);
  const updatedTo = kind === 'variable' ? setVariable(to, name, from.variables[name]) : setFlow(to, name, from.flows[name].do);
  if (!updatedFrom.ok) return updatedFrom;
  if (!updatedTo.ok) return updatedTo;
  return { ok: true, from: updatedFrom.logic, to: updatedTo.logic };
}
