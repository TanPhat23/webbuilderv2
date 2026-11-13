// src/features/interactions/editing/pick-store.ts
import { create } from "zustand";

interface PickState {
  /** Set while a field waits for the maker to click an element on the canvas. */
  onPick: ((id: string) => void) | null;
  start(cb: (id: string) => void): void;
  cancel(): void;
  /** Hands `id` to the waiting field. Returns false when nothing is waiting. */
  pick(id: string): boolean;
}

export const usePickStore = create<PickState>()((set, get) => ({
  onPick: null,
  start: (cb) => set({ onPick: cb }),
  cancel: () => set({ onPick: null }),
  pick: (id) => {
    const cb = get().onPick;
    if (!cb) return false;
    set({ onPick: null });
    cb(id);
    return true;
  },
}));
