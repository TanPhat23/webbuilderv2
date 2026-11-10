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
import { useMouseStore } from "@/features/editor";

/** Select only the online collaborator users record. */
export const useCollaboratorUsers = () => useMouseStore((s) => s.users);

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
