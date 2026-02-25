/**
 * Mouse Store Selectors
 *
 * Provides memoized selectors for the mouse store to prevent unnecessary
 * re-renders. Components should use these selectors instead of destructuring
 * the full store with `useMouseStore()`.
 *
 * The mouse store is particularly performance-sensitive because cursor
 * positions update at high frequency during collaboration. Using targeted
 * selectors ensures that components only re-render when the specific data
 * they consume actually changes.
 **/

import { useShallow } from "zustand/react/shallow";
import { useMouseStore } from "@/globalstore/mouse-store";

// ─── Individual State Selectors ──────────────────────────────────────

/** Select only mouse positions. Re-renders only when positions change. */
export const useMousePositions = () => useMouseStore((s) => s.mousePositions);

/** Select only selected elements map. */
export const useSelectedElements = () =>
  useMouseStore((s) => s.selectedElements);

/** Select only the online collaborator users record. */
export const useCollaboratorUsers = () => useMouseStore((s) => s.users);

/** Select only remote user cursor positions. */
export const useRemoteUsers = () => useMouseStore((s) => s.remoteUsers);

/** Select only the selectedByUser mapping (clientId → elementId). */
export const useSelectedByUser = () => useMouseStore((s) => s.selectedByUser);

// ─── Individual Action Selectors ─────────────────────────────────────
// Actions are stable references in Zustand — they never change after store
// creation, so selecting them individually will never cause a re-render.

/** Select only the updateMousePosition action. */
export const useUpdateMousePosition = () =>
  useMouseStore((s) => s.updateMousePosition);

/** Select only the removeMousePosition action. */
export const useRemoveMousePosition = () =>
  useMouseStore((s) => s.removeMousePosition);

/** Select only the syncFromAwareness action. */
export const useSyncFromAwareness = () =>
  useMouseStore((s) => s.syncFromAwareness);

/** Select only the clear action. */
export const useClearMouseStore = () => useMouseStore((s) => s.clear);

// ─── Combined State Selectors ────────────────────────────────────────

/**
 * Select remote users + online users together (shallow compared).
 * Used by the EditorCanvas component to render collaborator cursors.
 */
export const useCollaborationCursors = () =>
  useMouseStore(
    useShallow((s) => ({
      remoteUsers: s.remoteUsers,
      users: s.users,
    })),
  );

/**
 * Select remote users + selectedByUser together (shallow compared).
 * Used for rendering collaborator selection indicators on elements.
 */
export const useCollaboratorSelections = () =>
  useMouseStore(
    useShallow((s) => ({
      selectedByUser: s.selectedByUser,
      users: s.users,
    })),
  );

// ─── Combined Action Selectors ───────────────────────────────────────

/** Select all position-related setters (no state, no re-renders). */
export const useMousePositionActions = () =>
  useMouseStore(
    useShallow((s) => ({
      updateMousePosition: s.updateMousePosition,
      removeMousePosition: s.removeMousePosition,
      setMousePositions: s.setMousePositions,
    })),
  );

/** Select all bulk setters used during awareness sync (no re-renders). */
export const useMouseSyncActions = () =>
  useMouseStore(
    useShallow((s) => ({
      setRemoteUsers: s.setRemoteUsers,
      setSelectedByUser: s.setSelectedByUser,
      setUsers: s.setUsers,
      syncFromAwareness: s.syncFromAwareness,
      removeUser: s.removeUser,
      clear: s.clear,
    })),
  );

// ─── State + Actions Combined ────────────────────────────────────────

/**
 * Full collaboration context — cursors, users, and sync actions.
 * Used by the collaboration provider / hook during initialization.
 */
export const useFullCollaborationContext = () =>
  useMouseStore(
    useShallow((s) => ({
      remoteUsers: s.remoteUsers,
      users: s.users,
      selectedByUser: s.selectedByUser,
      setRemoteUsers: s.setRemoteUsers,
      setSelectedByUser: s.setSelectedByUser,
      setUsers: s.setUsers,
      syncFromAwareness: s.syncFromAwareness,
      removeUser: s.removeUser,
      clear: s.clear,
    })),
  );
