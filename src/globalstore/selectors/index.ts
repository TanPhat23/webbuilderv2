/**
 * Store Selectors — Barrel Export
 *
 * Re-exports all memoized selectors for Zustand stores. Components should
 * import selectors from this module instead of destructuring the full store
 * to prevent unnecessary re-renders.
 *
 * @example
 * ```ts
 * import { useElements, useSelectedElement, useUpdateElement } from "@/globalstore/selectors";
 * ```
 */

export {
  // Element state selectors
  useElements,
  useCanUndo,
  useCanRedo,
  useUndoRedoState,
  // Element action selectors
  useElementActions,
  useUpdateElement,
  useAddElement,
  useDeleteElement,
  useInsertElement,
  useSwapElement,
  useHistoryActions,
  useElementCallbackSetters,
  // Element combined selectors
  useElementsWithUpdate,
  useElementsWithActions,
  useElementsWithLoad,
} from "./element-selectors";

export {
  // Selection state selectors
  useSelectedElement,
  useDraggingElement,
  useDraggedOverElement,
  useHoveredElement,
  // Selection action selectors
  useSetSelectedElement,
  useSetDraggingElement,
  useSetDraggedOverElement,
  useSetHoveredElement,
  useSelectionActions,
  useDragActions,
  // Selection combined state selectors
  useSelectionState,
  useDragState,
  useDragAndSelectionState,
  // Selection state + actions selectors
  useSelectedElementWithSetter,
  useFullDragContext,
  useInteractionSelectionState,
} from "./selection-selectors";

export {
  // Mouse state selectors
  useMousePositions,
  useSelectedElements,
  useCollaboratorUsers,
  useRemoteUsers,
  useSelectedByUser,
  // Mouse action selectors
  useUpdateMousePosition,
  useRemoveMousePosition,
  useSyncFromAwareness,
  useClearMouseStore,
  // Mouse combined state selectors
  useCollaborationCursors,
  useCollaboratorSelections,
  // Mouse action selectors
  useMousePositionActions,
  useMouseSyncActions,
  // Mouse state + actions selectors
  useFullCollaborationContext,
} from "./mouse-selectors";
