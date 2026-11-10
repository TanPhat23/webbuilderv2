/**
 * Element Store Selectors
 *
 * Provides memoized selectors for the element store to prevent unnecessary
 * re-renders. Components should use these selectors instead of destructuring
 * the full store with `useElementStore()`.
 **/

import { useShallow } from "zustand/react/shallow";
import { useElementStore } from "@/features/editor";
import type { EditorElement } from "@/types/global.type";

// ─── State Selectors ─────────────────────────────────────────────────

/** Select only the elements array. Re-renders only when elements change. */
export const useElements = (): EditorElement[] =>
  useElementStore((s) => s.elements);

/** Select only the updateElement action. */
export const useUpdateElement = () => useElementStore((s) => s.updateElement);

/** Select only the addElement action. */
export const useAddElement = () => useElementStore((s) => s.addElement);

/** Select only the insertElement action. */
export const useInsertElement = () => useElementStore((s) => s.insertElement);

/** Select only the swapElement action. */
export const useSwapElement = () => useElementStore((s) => s.swapElement);

/** Elements + full CRUD — used by canvas / wireframe views. */
export const useElementsWithActions = () =>
  useElementStore(
    useShallow((s) => ({
      elements: s.elements,
      addElement: s.addElement,
      deleteElement: s.deleteElement,
      updateElement: s.updateElement,
      insertElement: s.insertElement,
      swapElement: s.swapElement,
    })),
  );

/** loadElements action + elements — used by snapshot manager. */
export const useElementsWithLoad = () =>
  useElementStore(
    useShallow((s) => ({
      elements: s.elements,
      loadElements: s.loadElements,
    })),
  );
