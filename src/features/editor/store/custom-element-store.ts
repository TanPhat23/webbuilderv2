"use client";

import { create } from "zustand";
import type { CustomElement } from "@/features/editor";

type CustomElementStoreState = {
  userComponents: CustomElement[];
  isLoading: boolean;
  error: string | null;

  setUserComponents: (components: CustomElement[]) => void;
  addUserComponent: (component: CustomElement) => void;
  updateUserComponent: (id: string, updates: Partial<CustomElement>) => void;
  removeUserComponent: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useCustomElementStore = create<CustomElementStoreState>((set) => ({
  userComponents: [],
  isLoading: false,
  error: null,

  setUserComponents: (components) => set({ userComponents: components }),

  addUserComponent: (component) =>
    set((state) => ({ userComponents: [component, ...state.userComponents] })),

  updateUserComponent: (id, updates) =>
    set((state) => ({
      userComponents: state.userComponents.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  removeUserComponent: (id) =>
    set((state) => ({
      userComponents: state.userComponents.filter((c) => c.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
