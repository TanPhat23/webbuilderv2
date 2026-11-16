import { create } from "zustand";

interface AgentActivity {
  /** When a CLI last called this tab, or null. */
  lastAt: number | null;
  /** True while a write is being applied. */
  editing: boolean;
  mark: (editing: boolean) => void;
}

export const useAgentActivity = create<AgentActivity>((set) => ({
  lastAt: null,
  editing: false,
  mark: (editing) => set({ lastAt: Date.now(), editing }),
}));
