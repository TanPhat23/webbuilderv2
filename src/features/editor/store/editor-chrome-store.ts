import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Left rail entries, in display order. */
export const RAIL_IDS = [
  "insert",
  "layers",
  "pages",
  "assets",
  "cms",
  "logic",
  "history",
  "ai",
] as const;
export type RailId = (typeof RAIL_IDS)[number];

type ChromeLayout = {
  activePanel: RailId;
  panelOpen: boolean;
  inspectorOpen: boolean;
};

export const DEFAULT_CHROME: ChromeLayout = {
  activePanel: "insert",
  panelOpen: true,
  inspectorOpen: true,
};

/** Persisted values may come from an older build: trust nothing. */
export function sanitizeChrome(value: unknown): ChromeLayout {
  const v = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const validPanel = (RAIL_IDS as readonly unknown[]).includes(v.activePanel);
  return {
    activePanel: validPanel
      ? (v.activePanel as RailId)
      : DEFAULT_CHROME.activePanel,
    panelOpen:
      typeof v.panelOpen === "boolean" ? v.panelOpen : DEFAULT_CHROME.panelOpen,
    inspectorOpen:
      typeof v.inspectorOpen === "boolean"
        ? v.inspectorOpen
        : DEFAULT_CHROME.inspectorOpen,
  };
}

interface EditorChromeState extends ChromeLayout {
  /** Opens `id`; re-selecting the open panel collapses it. */
  selectPanel: (id: RailId) => void;
  togglePanel: () => void;
  closePanel: () => void;
  toggleInspector: () => void;
}

export const useEditorChromeStore = create<EditorChromeState>()(
  persist(
    (set) => ({
      ...DEFAULT_CHROME,
      selectPanel: (id) =>
        set((s) =>
          s.activePanel === id && s.panelOpen
            ? { panelOpen: false }
            : { activePanel: id, panelOpen: true },
        ),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      closePanel: () => set({ panelOpen: false }),
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
    }),
    {
      name: "editor-chrome",
      version: 1,
      // Node (SSR) exposes `localStorage` as undefined rather than throwing;
      // throwing here makes zustand fall back to in-memory state.
      storage: createJSONStorage(() => {
        if (typeof window === "undefined" || !window.localStorage) {
          throw new Error("localStorage unavailable");
        }
        return window.localStorage;
      }),
      // The server renders defaults; EditorLayout rehydrates after mount so
      // the first client render matches the server HTML.
      skipHydration: true,
      partialize: ({ activePanel, panelOpen, inspectorOpen }) => ({
        activePanel,
        panelOpen,
        inspectorOpen,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeChrome(persisted),
      }),
    },
  ),
);
