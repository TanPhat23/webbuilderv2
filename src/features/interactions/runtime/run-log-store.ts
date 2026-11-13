import { create } from "zustand";
import type { RunLogEntry } from "./run";

export const RUN_LOG_LIMIT = 200;

interface RunLogState {
  entries: RunLogEntry[];
  push(entry: RunLogEntry): void;
  clear(): void;
}

/** What interactions did, newest last. Shown by RunLogPanel. */
export const useRunLogStore = create<RunLogState>()((set) => ({
  entries: [],
  push: (entry) =>
    set((s) => ({ entries: [...s.entries.slice(-(RUN_LOG_LIMIT - 1)), entry] })),
  clear: () => set({ entries: [] }),
}));
