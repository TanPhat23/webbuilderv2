import { describe, it, expect, beforeEach, vi } from "vitest";
import type { EditorElement } from "@/types/global.type";

/**
 * Store helpers module
 * Provides utilities for testing Zustand stores and state management.
 */

// ============================================================================
// Store Mocking Utilities
// ============================================================================

/**
 * Creates a mock Zustand store getter.
 * Useful for testing store selectors and state access.
 *
 * @example
 * ```ts
 * const mockStore = createMockStoreGetter({ count: 0 });
 * expect(mockStore()).toEqual({ count: 0 });
 * ```
 */
export function createMockStoreGetter<T extends Record<string, any>>(
  initialState: T,
) {
  let state = { ...initialState };

  return {
    getState: () => state,
    setState: (updates: Partial<T> | ((state: T) => Partial<T>)) => {
      const newUpdates =
        typeof updates === "function" ? updates(state) : updates;
      state = { ...state, ...newUpdates };
    },
    subscribe: vi.fn(),
  };
}

/**
 * Creates a mock store with selector support.
 * Allows testing of selector functions and partial state selection.
 */
export function createMockStoreWithSelectors<T extends Record<string, any>>(
  initialState: T,
) {
  let state = { ...initialState };
  const subscribers = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (updates: Partial<T> | ((state: T) => Partial<T>)) => {
      const newUpdates =
        typeof updates === "function" ? updates(state) : updates;
      state = { ...state, ...newUpdates };
      subscribers.forEach((cb) => cb(state));
    },
    subscribe: (callback: (state: T) => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    select: <S,>(selector: (state: T) => S) => {
      return (callback: (selected: S) => void) => {
        return subscribers.add(() => callback(selector(state)));
      };
    },
  };
}

// ============================================================================
// Element Store Helpers
// ============================================================================

/**
 * Creates initial state for element store tests.
 */
export function createMockElementStoreState() {
  return {
    elements: [] as EditorElement[],
    past: [] as EditorElement[][],
    future: [] as EditorElement[][],
    yjsUpdateCallback: null as null | (() => void),
    collaborativeCallback: null as null | (() => void),
  };
}

/**
 * Creates element store state with sample elements.
 */
export function createMockElementStoreStateWithElements(
  elements: EditorElement[],
) {
  return {
    ...createMockElementStoreState(),
    elements,
  };
}

/**
 * Helper to verify store mutation functions were called correctly.
 */
export function verifyStoreMutation<T>(
  beforeState: T,
  afterState: T,
  expectedChanges: Partial<T>,
) {
  const changes = Object.keys(expectedChanges).reduce(
    (acc, key) => {
      const before = (beforeState as any)[key];
      const after = (afterState as any)[key];
      return {
        ...acc,
        [key]: {
          changed: before !== after,
          from: before,
          to: after,
        },
      };
    },
    {} as Record<
      string,
      { changed: boolean; from: any; to: any }
    >,
  );

  return changes;
}

// ============================================================================
// Selection Store Helpers
// ============================================================================

/**
 * Creates initial state for selection store tests.
 */
export function createMockSelectionStoreState() {
  return {
    selectedElement: undefined as string | undefined,
    selectedElements: [] as string[],
    isMultiSelectActive: false,
  };
}

/**
 * Creates selection store state with selected elements.
 */
export function createMockSelectionStoreStateWithSelection(
  selectedIds: string[],
) {
  return {
    ...createMockSelectionStoreState(),
    selectedElement: selectedIds[0],
    selectedElements: selectedIds,
    isMultiSelectActive: selectedIds.length > 1,
  };
}

// ============================================================================
// Mouse/Interaction Store Helpers
// ============================================================================

/**
 * Creates initial state for mouse/interaction store tests.
 */
export function createMockMouseStoreState() {
  return {
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
    hoveredElement: undefined as string | undefined,
  };
}

/**
 * Creates mock mouse position state.
 */
export function createMockMousePosition(x: number, y: number) {
  return {
    x,
    y,
  };
}

/**
 * Creates mock drag state.
 */
export function createMockDragState(
  isDragging: boolean,
  offsetX: number,
  offsetY: number,
) {
  return {
    isDragging,
    dragOffset: { x: offsetX, y: offsetY },
  };
}

// ============================================================================
// Page Store Helpers
// ============================================================================

/**
 * Creates initial state for page store tests.
 */
export function createMockPageStoreState() {
  return {
    pages: [] as Array<{ id: string; name: string; elements: EditorElement[] }>,
    currentPageId: "page-1",
  };
}

// ============================================================================
// Store Action Testing
// ============================================================================

/**
 * Helper to batch test multiple store actions and verify state transitions.
 *
 * @example
 * ```ts
 * const results = await testStoreActions([
 *   {
 *     name: "add element",
 *     action: () => store.addElement(element),
 *     verify: (state) => expect(state.elements).toHaveLength(1)
 *   },
 *   {
 *     name: "update element",
 *     action: () => store.updateElement(id, updates),
 *     verify: (state) => expect(state.elements[0]).toMatchObject(updates)
 *   }
+ * ]);
 * ```
 */
export function createStoreActionTester<T>(getState: () => T) {
  return {
    testAction: async (
      name: string,
      action: () => void | Promise<void>,
      verify: (state: T) => void,
    ) => {
      const stateBefore = getState();
      try {
        await action();
        const stateAfter = getState();
        verify(stateAfter);
        return { name, success: true, error: null };
      } catch (error) {
        return { name, success: false, error };
      }
    },

    testActions: async (
      tests: Array<{
        name: string;
        action: () => void | Promise<void>;
        verify: (state: T) => void;
      }>,
    ) => {
      const results = [];
      for (const test of tests) {
        const result = await this.testAction(test.name, test.action, test.verify);
        results.push(result);
      }
      return results;
    },
  };
}

// ============================================================================
// Store Snapshot Testing
// ============================================================================

/**
 * Creates a snapshot of store state for comparison.
 */
export function createStoreSnapshot<T>(state: T) {
  return {
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(state)),
    hash: JSON.stringify(state),
  };
}

/**
 * Compares two store snapshots and returns differences.
 */
export function compareSnapshots<T>(
  before: ReturnType<typeof createStoreSnapshot>,
  after: ReturnType<typeof createStoreSnapshot>,
): {
  changed: boolean;
  differences: Record<string, { before: any; after: any }>;
} {
  const beforeState = before.state as T;
  const afterState = after.state as T;

  const differences: Record<string, { before: any; after: any }> = {};
  let changed = false;

  const allKeys = new Set([
    ...Object.keys(beforeState),
    ...Object.keys(afterState),
  ]);

  allKeys.forEach((key) => {
    const beforeVal = (beforeState as any)[key];
    const afterVal = (afterState as any)[key];

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changed = true;
      differences[key] = { before: beforeVal, after: afterVal };
    }
  });

  return { changed, differences };
}

// ============================================================================
// Mock Store Selectors
// ============================================================================

/**
 * Creates a mock selector that extracts a subset of state.
 */
export function createMockSelector<T, S>(selector: (state: T) => S) {
  return {
    select: (state: T) => selector(state),
    isEqual: (prev: S, next: S) =>
      JSON.stringify(prev) === JSON.stringify(next),
  };
}

/**
 * Creates mock selectors for common element store patterns.
 */
export function createElementStoreSelectors() {
  return {
    selectElements: (state: any) => state.elements,
    selectElement: (id: string) => (state: any) =>
      state.elements.find((el: EditorElement) => el.id === id),
    selectChildElements: (parentId: string) => (state: any) =>
      state.elements.filter((el: EditorElement) => el.parentId === parentId),
    selectElementCount: (state: any) => state.elements.length,
    selectHasElements: (state: any) => state.elements.length > 0,
  };
}

/**
 * Creates mock selectors for common selection store patterns.
 */
export function createSelectionStoreSelectors() {
  return {
    selectSelectedElement: (state: any) => state.selectedElement,
    selectSelectedElements: (state: any) => state.selectedElements,
    selectIsMultiSelect: (state: any) => state.isMultiSelectActive,
    selectHasSelection: (state: any) =>
      state.selectedElements.length > 0,
    selectSelectionCount: (state: any) => state.selectedElements.length,
  };
}
