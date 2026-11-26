import { useSyncExternalStore } from "react";
import type { RunLogEntry } from "./run";

export const RUN_LOG_LIMIT = 200;

export interface RunLogState {
  readonly entries: RunLogEntry[];
  push(entry: RunLogEntry): void;
  clear(): void;
}

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

const push = (entry: RunLogEntry): void => {
  state = {
    entries: [...state.entries.slice(-(RUN_LOG_LIMIT - 1)), entry],
    push,
    clear,
  };
  notify();
};

const clear = (): void => {
  state = { entries: [], push, clear };
  notify();
};

let state: RunLogState = { entries: [], push, clear };

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getState(): RunLogState {
  return state;
}

interface UseRunLogStore {
  <T>(selector: (s: RunLogState) => T): T;
  getState: () => RunLogState;
}

function useRunLogStoreImpl<T>(selector: (s: RunLogState) => T): T {
  const snapshot = useSyncExternalStore(subscribe, getState, getState);
  return selector(snapshot);
}

/** What interactions did, newest last. Shown by RunLogPanel. */
export const useRunLogStore: UseRunLogStore = Object.assign(useRunLogStoreImpl, {
  getState,
});
