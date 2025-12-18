"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ToolbarPrefs = {
  showCss: boolean;
  showExport: boolean;
  showCollab: boolean;
  showViewports: boolean;
};

type ToolbarStore = ToolbarPrefs & {
  setShowCss: (v: boolean) => void;
  setShowExport: (v: boolean) => void;
  setShowCollab: (v: boolean) => void;
  setShowViewports: (v: boolean) => void;

  toggleShowCss: () => void;
  toggleShowExport: () => void;
  toggleShowCollab: () => void;
  toggleShowViewports: () => void;

  resetPreferences: () => void;
};

const DEFAULT_PREFS: ToolbarPrefs = {
  showCss: true,
  showExport: true,
  showCollab: true,
  showViewports: true,
};

export const useToolbarStore = create<ToolbarStore>()(
  persist(
    (set, get) => ({
      // defaults
      ...DEFAULT_PREFS,

      // setters
      setShowCss: (v: boolean) => set({ showCss: v }),
      setShowExport: (v: boolean) => set({ showExport: v }),
      setShowCollab: (v: boolean) => set({ showCollab: v }),
      setShowViewports: (v: boolean) => set({ showViewports: v }),

      // toggles
      toggleShowCss: () => set((s) => ({ showCss: !s.showCss })),
      toggleShowExport: () => set((s) => ({ showExport: !s.showExport })),
      toggleShowCollab: () => set((s) => ({ showCollab: !s.showCollab })),
      toggleShowViewports: () =>
        set((s) => ({ showViewports: !s.showViewports })),

      // reset
      resetPreferences: () => set({ ...DEFAULT_PREFS }),
    }),
    {
      name: "toolbar-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useToolbarStore;
