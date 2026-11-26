import { create } from "zustand";
import type { StyleMap } from "./styleModel";

/** In-memory "copy styles" buffer for the Style tab's ⋯ menu. */
export const useStyleClipboard = create<{
  copied: StyleMap | null;
  copy: (s: StyleMap) => void;
}>()((set) => ({
  copied: null,
  copy: (s) => set({ copied: { ...s } }),
}));
