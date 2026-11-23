/**
 * Runs a React hook with working state, refs and effects, without a DOM or a
 * renderer. It installs a small hook dispatcher, so effects really run (the
 * server render in `test-hook-harness` never fires them). Re-renders happen
 * synchronously when state changes.
 */
import React from 'react';

type Cleanup = void | (() => void);
type Effect = { deps: unknown[] | undefined; create: () => Cleanup; cleanup: Cleanup; pending: boolean };

const internals = (React as unknown as Record<string, { H: unknown }>)[
  '__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE'
];

function sameDeps(a: unknown[] | undefined, b: unknown[] | undefined): boolean {
  if (!a || !b) return false;
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}

export interface MountedHook<T> {
  /** The latest value the hook returned. */
  readonly current: T;
  /** How many times the hook body has run. */
  readonly renders: number;
  rerender(): void;
  unmount(): void;
}

export function mountHook<T>(hook: () => T): MountedHook<T> {
  const slots: unknown[] = [];
  let cursor = 0;
  let current: T;
  let renders = 0;
  let rendering = false;
  let dirty = false;
  let mounted = true;
  const effects: Effect[] = [];

  function slot<S>(init: () => S): S {
    const index = cursor++;
    if (!(index in slots)) slots[index] = init();
    return slots[index] as S;
  }

  function useEffectImpl(create: () => Cleanup, deps?: unknown[]) {
    const effect = slot<Effect>(() => {
      const created: Effect = { deps: undefined, create, cleanup: undefined, pending: false };
      effects.push(created);
      return created;
    });
    if (!sameDeps(effect.deps, deps)) {
      effect.create = create;
      effect.deps = deps;
      effect.pending = true;
    }
  }

  const dispatcher = {
    useState<S>(initial: S | (() => S)) {
      const box = slot(() => ({
        value: typeof initial === 'function' ? (initial as () => S)() : initial,
      })) as { value: S };
      const set = slot(() => (next: S | ((prev: S) => S)) => {
        const value = typeof next === 'function' ? (next as (prev: S) => S)(box.value) : next;
        if (Object.is(value, box.value)) return;
        box.value = value;
        render();
      });
      return [box.value, set];
    },
    useReducer<S, A>(reducer: (s: S, a: A) => S, initial: S) {
      const box = slot(() => ({ value: initial }));
      const dispatch = slot(() => (action: A) => {
        const value = reducer(box.value, action);
        if (Object.is(value, box.value)) return;
        box.value = value;
        render();
      });
      return [box.value, dispatch];
    },
    useRef<R>(initial: R) {
      return slot(() => ({ current: initial }));
    },
    useMemo<M>(factory: () => M, deps?: unknown[]) {
      const memo = slot(() => ({ deps: undefined as unknown[] | undefined, value: undefined as M, set: false }));
      if (!memo.set || !sameDeps(memo.deps, deps)) {
        memo.value = factory();
        memo.deps = deps;
        memo.set = true;
      }
      return memo.value;
    },
    useCallback<F>(fn: F, deps?: unknown[]) {
      const memo = slot(() => ({ deps: undefined as unknown[] | undefined, value: undefined as F, set: false }));
      if (!memo.set || !sameDeps(memo.deps, deps)) {
        memo.value = fn;
        memo.deps = deps;
        memo.set = true;
      }
      return memo.value;
    },
    useEffect: useEffectImpl,
    useLayoutEffect: useEffectImpl,
    useInsertionEffect: useEffectImpl,
    useSyncExternalStore<S>(subscribe: (cb: () => void) => () => void, getSnapshot: () => S) {
      const value = getSnapshot();
      useEffectImpl(() => subscribe(() => render()), [subscribe]);
      return value;
    },
    useContext: () => undefined,
    useDebugValue: () => undefined,
    useId: () => 'test-id',
  };

  function runEffects() {
    for (const effect of effects) {
      if (!effect.pending) continue;
      effect.pending = false;
      if (typeof effect.cleanup === 'function') effect.cleanup();
      effect.cleanup = effect.create();
    }
  }

  function render() {
    if (!mounted) return;
    if (rendering) {
      dirty = true;
      return;
    }
    rendering = true;
    try {
      do {
        dirty = false;
        const previous = internals.H;
        internals.H = dispatcher;
        cursor = 0;
        try {
          current = hook();
          renders += 1;
        } finally {
          internals.H = previous;
        }
        runEffects();
      } while (dirty);
    } finally {
      rendering = false;
    }
  }

  render();

  return {
    get current() {
      return current;
    },
    get renders() {
      return renders;
    },
    rerender: render,
    unmount() {
      mounted = false;
      for (const effect of effects) {
        if (typeof effect.cleanup === 'function') effect.cleanup();
        effect.cleanup = undefined;
      }
    },
  };
}

type EventListenerCallback = (event: Record<string, unknown>) => void;

/** A tiny EventTarget with the surface the editor hooks use, plus listener bookkeeping. */
export class FakeTarget {
  listeners = new Map<string, Set<EventListenerCallback>>();
  addEventListener(type: string, fn: EventListenerCallback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  }
  removeEventListener(type: string, fn: EventListenerCallback) {
    this.listeners.get(type)?.delete(fn);
  }
  count(type: string): number {
    return this.listeners.get(type)?.size ?? 0;
  }
  dispatch(type: string, event: Record<string, unknown> = {}): void {
    for (const fn of [...(this.listeners.get(type) ?? [])]) fn({ type, ...event });
  }
}
