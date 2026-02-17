/**
 * Element Store Selectors
 *
 * Provides memoized selectors for the element store to prevent unnecessary
 * re-renders. Components should use these selectors instead of destructuring
 * the full store with `useElementStore()`.
 *
 * @example
 * ```ts
 * // ❌ Bad — re-renders on ANY store change (elements, past, future, callbacks)
 * const { elements, updateElement } = useElementStore();
 *
 * // ✅ Good — only re-renders when `elements` changes
 * const elements = useElements();
 *
 * // ✅ Good — actions are stable refs, never cause re-renders
 * const { updateElement, deleteElement } = useElementActions();
 * ```
 */

import { useShallow } from "zustand/react/shallow";
import { useElementStore } from "@/globalstore/element-store";
import type { EditorElement } from "@/types/global.type";

// ─── State Selectors ─────────────────────────────────────────────────

/** Select only the elements array. Re-renders only when elements change. */
export const useElements = (): EditorElement[] =>
  useElementStore((s) => s.elements);

/** Select whether undo is available. */
export const useCanUndo = (): boolean =>
  useElementStore((s) => s.past.length > 0);

/** Select whether redo is available. */
export const useCanRedo = (): boolean =>
  useElementStore((s) => s.future.length > 0);

/** Select undo/redo availability together (shallow compared). */
export const useUndoRedoState = () =>
  useElementStore(
    useShallow((s) => ({
      canUndo: s.past.length > 0,
      canRedo: s.future.length > 0,
    })),
  );

// ─── Action Selectors ────────────────────────────────────────────────
// Actions are stable references in Zustand — they never change after store
// creation, so selecting them individually or together will never trigger
// a re-render on its own.

/** Select all CRUD mutation actions (no state, no re-renders). */
export const useElementActions = () =>
  useElementStore(
    useShallow((s) => ({
      loadElements: s.loadElements,
      updateElement: s.updateElement,
      deleteElement: s.deleteElement,
      addElement: s.addElement,
      insertElement: s.insertElement,
      swapElement: s.swapElement,
      updateAllElements: s.updateAllElements,
    })),
  );

/** Select only the updateElement action. */
export const useUpdateElement = () =>
  useElementStore((s) => s.updateElement);

/** Select only the addElement action. */
export const useAddElement = () =>
  useElementStore((s) => s.addElement);

/** Select only the deleteElement action. */
export const useDeleteElement = () =>
  useElementStore((s) => s.deleteElement);

/** Select only the insertElement action. */
export const useInsertElement = () =>
  useElementStore((s) => s.insertElement);

/** Select only the swapElement action. */
export const useSwapElement = () =>
  useElementStore((s) => s.swapElement);

/** Select undo/redo actions. */
export const useHistoryActions = () =>
  useElementStore(
    useShallow((s) => ({
      undo: s.undo,
      redo: s.redo,
      clearHistory: s.clearHistory,
    })),
  );

/** Select callback setters (used during editor initialization). */
export const useElementCallbackSetters = () =>
  useElementStore(
    useShallow((s) => ({
      setYjsUpdateCallback: s.setYjsUpdateCallback,
      setCollaborativeCallback: s.setCollaborativeCallback,
    })),
  );

// ─── Combined Selectors ──────────────────────────────────────────────
// For components that need both state and a small set of actions.

/** Elements + updateElement — common pattern in sidebar config panels. */
export const useElementsWithUpdate = () =>
  useElementStore(
    useShallow((s) => ({
      elements: s.elements,
      updateElement: s.updateElement,
    })),
  );

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
