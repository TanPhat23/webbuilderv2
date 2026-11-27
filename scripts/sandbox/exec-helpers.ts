// Pure helpers shared by the sandbox bot's POST /exec endpoint and the sandbox.sh
// "exec" client (exec-cli.ts). No Playwright runtime imports, so unit tests can
// load this file without a browser.
import type { BrowserContext, Page } from '@playwright/test';
import path from 'node:path';

/** What an exec script's default export receives. */
export interface ExecContext {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly projectId: string;
  readonly baseURL: string;
  readonly log: (...args: unknown[]) => void;
}
/** The default export of a script run through `sandbox.sh exec`. */
export type ExecFn = (ctx: ExecContext) => Promise<unknown> | unknown;

export interface ExecErrorInfo { readonly name: string; readonly message: string; readonly stack?: string }
export interface ExecResponse {
  readonly ok: boolean;
  readonly result: JsonValue;
  readonly logs: readonly string[];
  readonly error?: ExecErrorInfo;
  readonly consoleErrors: readonly string[];
  readonly durationMs: number;
}

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export const EXEC_EXTENSIONS: readonly string[] = ['.ts', '.mjs', '.js'];
export const DEFAULT_EXEC_TIMEOUT_MS = 60_000;
export const MIN_EXEC_TIMEOUT_MS = 1_000;
export const MAX_EXEC_TIMEOUT_MS = 600_000;

/** Raised for a request the bot refuses (bad file, bad body); maps to HTTP 400. */
export class ExecInputError extends Error {
  override readonly name = 'ExecInputError';
}

/**
 * Resolve `file` against `root` and return its absolute path, or throw
 * ExecInputError unless it stays inside `root` and has a .ts/.mjs/.js extension.
 * Purely lexical; callers that touch the disk should re-check the realpath.
 */
export function resolveExecFile(root: string, file: unknown): string {
  if (typeof file !== 'string' || file.trim() === '') throw new ExecInputError('file must be a non-empty string');
  if (file.includes('\0')) throw new ExecInputError('file must not contain NUL bytes');
  const base = path.resolve(root);
  const abs = path.resolve(base, file);
  if (!isInside(base, abs)) throw new ExecInputError('file must resolve inside the repo root');
  if (!EXEC_EXTENSIONS.includes(path.extname(abs).toLowerCase())) {
    throw new ExecInputError(`file must end in ${EXEC_EXTENSIONS.join(', ')}`);
  }
  return abs;
}

/** True when `child` is `root` itself or a descendant of it. */
export function isInside(root: string, child: string): boolean {
  const rel = path.relative(root, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** Validate an optional per-run timeout; defaults to 60s and must be 1s..10min. */
export function resolveExecTimeout(value: unknown): number {
  if (value === undefined || value === null) return DEFAULT_EXEC_TIMEOUT_MS;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new ExecInputError('timeoutMs must be a number');
  if (value < MIN_EXEC_TIMEOUT_MS || value > MAX_EXEC_TIMEOUT_MS) {
    throw new ExecInputError(`timeoutMs must be between ${MIN_EXEC_TIMEOUT_MS} and ${MAX_EXEC_TIMEOUT_MS}`);
  }
  return Math.floor(value);
}

/** Wrap a `sandbox.sh exec -e` body as an ES module whose default export gets the exec context in scope. */
export function wrapExecBody(body: string): string {
  if (body.trim() === '') throw new ExecInputError('the -e body is empty');
  return `export default async function ({ page, context, projectId, baseURL, log }) {\n${body}\n}\n`;
}

export interface JsonSafeLimits { readonly maxDepth: number; readonly maxString: number; readonly maxEntries: number }
const DEFAULT_LIMITS: JsonSafeLimits = { maxDepth: 8, maxString: 20_000, maxEntries: 500 };

/**
 * Convert anything a script can return into plain JSON: undefined/functions/symbols
 * become markers or null, bigint a string, Error {name,message,stack}, Map/Set
 * arrays, Date an ISO string, class instances (Page, Locator…) a "[Ctor]" marker,
 * cycles "[Circular]", and depth, string length and entry count are capped.
 */
export function toJsonSafe(value: unknown, limits: JsonSafeLimits = DEFAULT_LIMITS): JsonValue {
  return convert(value, limits, [], 0);
}

function convert(value: unknown, limits: JsonSafeLimits, ancestors: object[], depth: number): JsonValue {
  switch (typeof value) {
    case 'undefined': return null;
    case 'boolean': return value;
    case 'number': return Number.isFinite(value) ? value : String(value);
    case 'string': return value.length > limits.maxString ? `${value.slice(0, limits.maxString)}…[truncated ${value.length - limits.maxString} chars]` : value;
    case 'bigint': return value.toString();
    case 'symbol': return value.toString();
    case 'function': return `[Function ${value.name || 'anonymous'}]`;
    default: break;
  }
  if (value === null) return null;
  const obj = value as object;
  if (ancestors.includes(obj)) return '[Circular]';
  if (depth >= limits.maxDepth) return Array.isArray(obj) ? '[Array]' : '[Object]';
  const next = [...ancestors, obj];
  if (obj instanceof Date) return Number.isNaN(obj.getTime()) ? 'Invalid Date' : obj.toISOString();
  if (obj instanceof Error) {
    return { name: obj.name, message: obj.message, ...(obj.stack ? { stack: obj.stack } : {}) };
  }
  if (Array.isArray(obj)) return capArray(obj, limits, next, depth);
  if (obj instanceof Set) return capArray([...obj], limits, next, depth);
  if (obj instanceof Map) return capArray([...obj.entries()], limits, next, depth);
  if (ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer) return `[${obj.constructor.name} ${obj.byteLength} bytes]`;
  const proto: unknown = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype) {
    const toJSON = (obj as { toJSON?: unknown }).toJSON;
    if (typeof toJSON === 'function') {
      try { return convert((toJSON as () => unknown).call(obj), limits, next, depth + 1); } catch { /* fall through */ }
    }
    return `[${obj.constructor?.name ?? 'Object'}]`;
  }
  const out: { [key: string]: JsonValue } = {};
  const keys = Object.keys(obj);
  for (const key of keys.slice(0, limits.maxEntries)) {
    let child: unknown;
    try { child = (obj as Record<string, unknown>)[key]; } catch (e) { child = `[Throws ${(e as Error).message}]`; }
    out[key] = convert(child, limits, next, depth + 1);
  }
  if (keys.length > limits.maxEntries) out['…'] = `[${keys.length - limits.maxEntries} more keys]`;
  return out;
}

function capArray(items: readonly unknown[], limits: JsonSafeLimits, ancestors: object[], depth: number): JsonValue[] {
  const out = items.slice(0, limits.maxEntries).map((item) => convert(item, limits, ancestors, depth + 1));
  if (items.length > limits.maxEntries) out.push(`[${items.length - limits.maxEntries} more items]`);
  return out;
}

// eslint-disable-next-line no-control-regex -- Playwright colours its error text with ANSI escapes
const ANSI = /\x1b\[[0-9;]*m/g;
const plain = (s: string): string => s.replace(ANSI, '');

/** Describe a thrown value (anything can be thrown) as {name, message, stack}, minus ANSI colour codes. */
export function describeError(e: unknown): ExecErrorInfo {
  if (e instanceof Error) return { name: e.name, message: plain(e.message), ...(e.stack ? { stack: plain(e.stack) } : {}) };
  return { name: 'NonError', message: typeof e === 'string' ? e : JSON.stringify(toJsonSafe(e)) };
}
