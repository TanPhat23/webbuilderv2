// src/features/interactions/runtime/variables.ts
/**
 * Runtime values of declared variables. A variable's lifetime decides where
 * it lives: `page` in memory (reset on load), `session` in sessionStorage,
 * `local` in localStorage. Storage can be missing or throw (private mode,
 * blocked site data), so every access falls back to memory.
 */
export type Lifetime = "page" | "session" | "local";

export interface VariableDef {
  type: "string" | "number" | "boolean" | "object" | "list";
  default: unknown;
  lifetime?: Lifetime;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface VariableStore {
  has(name: string): boolean;
  get(name: string): unknown;
  set(name: string, value: unknown): boolean;
  snapshot(): Record<string, unknown>;
  subscribe(fn: () => void): () => void;
}

/** Returns the storage if it can be read, else null. */
export function safeStorage(get: () => StorageLike): StorageLike | null {
  try {
    const s = get();
    s.getItem("wb:probe");
    return s;
  } catch {
    return null;
  }
}

const copy = (v: unknown): unknown =>
  v === undefined ? null : JSON.parse(JSON.stringify(v));

export function createVariableStore(
  defs: Record<string, VariableDef>,
  opts: { namespace: string; session?: StorageLike | null; local?: StorageLike | null },
): VariableStore {
  const values = new Map<string, unknown>();
  const listeners = new Set<() => void>();
  const declared = (name: string) => Object.hasOwn(defs, name);
  const key = (name: string) => `wb:${opts.namespace}:${name}`;
  const storageFor = (name: string): StorageLike | null | undefined => {
    const lifetime = defs[name]?.lifetime ?? "page";
    if (lifetime === "session") return opts.session;
    if (lifetime === "local") return opts.local;
    return null;
  };

  for (const [name, def] of Object.entries(defs)) {
    let value = copy(def.default);
    const storage = storageFor(name);
    if (storage) {
      try {
        const raw = storage.getItem(key(name));
        if (raw !== null) value = JSON.parse(raw);
      } catch {
        // Unreadable or corrupt: keep the default.
      }
    }
    values.set(name, value);
  }

  return {
    has: declared,
    get: (name) => values.get(name),
    set(name, value) {
      if (!declared(name)) return false;
      values.set(name, value);
      const storage = storageFor(name);
      if (storage) {
        try {
          storage.setItem(key(name), JSON.stringify(value));
        } catch {
          // Quota or blocked: the value still lives in memory.
        }
      }
      for (const fn of listeners) fn();
      return true;
    },
    snapshot: () => Object.fromEntries(values),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
