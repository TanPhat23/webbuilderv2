export class UnsupportedPatch extends Error {}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => deepEqual(v, b[i]))
    );
  }
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
    );
  }
  return false;
}

const hasNullInMap = (v: unknown): boolean =>
  v === null || (isRecord(v) && Object.values(v).some(hasNullInMap));

function defineOwnField(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

export function diffPatch(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(before)) {
    if (!Object.hasOwn(after, key)) defineOwnField(patch, key, null);
  }
  for (const [key, value] of Object.entries(after)) {
    const old = before[key];
    if (deepEqual(old, value)) continue;
    if (hasNullInMap(value)) {
      throw new UnsupportedPatch(
        "An empty (null) value inside a variable's default can't be synced yet. Use {} or a real value.",
      );
    }
    defineOwnField(
      patch,
      key,
      isRecord(value) && isRecord(old) ? diffPatch(old, value) : value,
    );
  }
  return patch;
}

/** Merge patch plus explicit paths for literal nulls in variable defaults. */
export function encodeLogicPatch(
  before: object,
  after: object,
): { patch: Record<string, unknown>; nullPaths: string[][] } {
  const nullPaths: string[][] = [];
  const diff = (old: object, next: object, path: string[]): Record<string, unknown> => {
    const patch: Record<string, unknown> = {};
    for (const key of Object.keys(old)) {
      if (!Object.hasOwn(next, key)) defineOwnField(patch, key, null);
    }
    for (const [key, value] of Object.entries(next)) {
      const oldValue: unknown = Object.hasOwn(old, key) ? Reflect.get(old, key) : undefined;
      if (deepEqual(oldValue, value)) continue;
      const at = [...path, key];
      if (value === null) {
        if (at[0] !== "variables" || at.length < 3 || at[2] !== "default") {
          throw new UnsupportedPatch(
            "Only variable defaults can contain literal null values.",
          );
        }
        nullPaths.push(at);
      } else {
        const nextValue = isRecord(value)
          ? diff(isRecord(oldValue) ? oldValue : {}, value, at)
          : value;
        defineOwnField(patch, key, nextValue);
      }
    }
    return patch;
  };
  return { patch: diff(before, after, []), nullPaths };
}

/** Mirror of the server's merge: objects merge, `null` deletes, everything else replaces. */
export function applyPatch(
  base: object,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      delete out[key];
    } else if (isRecord(value)) {
      const existing = out[key];
      defineOwnField(out, key, applyPatch(isRecord(existing) ? existing : {}, value));
    } else {
      defineOwnField(out, key, value);
    }
  }
  return out;
}

export function applyEncodedPatch(
  base: object,
  patch: Record<string, unknown>,
  nullPaths: string[][],
): Record<string, unknown> {
  const result = applyPatch(base, patch);
  for (const path of nullPaths) {
    let parent = result;
    for (const key of path.slice(0, -1)) {
      const existing = parent[key];
      const child = isRecord(existing) ? { ...existing } : {};
      defineOwnField(parent, key, child);
      parent = child;
    }
    defineOwnField(parent, path[path.length - 1], null);
  }
  return result;
}
