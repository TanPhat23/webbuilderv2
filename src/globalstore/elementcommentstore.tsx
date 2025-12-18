"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ElementComment } from "@/interfaces/elementcomment.interface";

interface ElementCommentStore {
  isCommentsVisible: boolean;
  showCommentButtons: boolean;
  activeCommentElementId: string | undefined;
  viewMode: "all" | "unresolved" | "resolved";
  sortOrder: "newest" | "oldest";

  toggleCommentsVisibility: () => void;
  setCommentsVisible: (visible: boolean) => void;
  toggleCommentButtons: () => void;
  setCommentButtonsVisible: (visible: boolean) => void;
  setActiveCommentElement: (elementId: string | undefined) => void;
  setViewMode: (mode: "all" | "unresolved" | "resolved") => void;
  setSortOrder: (order: "newest" | "oldest") => void;
  clearActiveElement: () => void;
}

export const useElementCommentStore = create<ElementCommentStore>()(
  persist(
    (set) => ({
      isCommentsVisible: true,
      showCommentButtons: true,
      activeCommentElementId: undefined,
      viewMode: "all",
      sortOrder: "newest",

      toggleCommentsVisibility: () => {
        set((state) => ({ isCommentsVisible: !state.isCommentsVisible }));
      },

      setCommentsVisible: (visible: boolean) => {
        set({ isCommentsVisible: visible });
      },

      toggleCommentButtons: () => {
        set((state) => ({ showCommentButtons: !state.showCommentButtons }));
      },

      setCommentButtonsVisible: (visible: boolean) => {
        set({ showCommentButtons: visible });
      },

      setActiveCommentElement: (elementId: string | undefined) => {
        set({ activeCommentElementId: elementId });
      },

      setViewMode: (mode: "all" | "unresolved" | "resolved") => {
        set({ viewMode: mode });
      },

      setSortOrder: (order: "newest" | "oldest") => {
        set({ sortOrder: order });
      },

      clearActiveElement: () => {
        set({ activeCommentElementId: undefined });
      },
    }),
    {
      name: "element-comments-ui-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isCommentsVisible: state.isCommentsVisible,
        showCommentButtons: state.showCommentButtons,
        viewMode: state.viewMode,
        sortOrder: state.sortOrder,
      }),
    },
  ),
);
