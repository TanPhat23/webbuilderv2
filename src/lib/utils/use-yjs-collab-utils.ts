import * as Y from "yjs";
import { EditorElement } from "@/types/global.type";
import {
  CustomYjsProviderV2,
  parseElementsJson,
} from "@/lib/yjs/yjs-provider-v2";

export const sanitizeElements = (
  elements: EditorElement[],
): EditorElement[] => {
  const sanitize = (el: EditorElement): EditorElement => {
    const sanitized = { ...el };
    if (sanitized.settings === null || sanitized.settings === undefined) {
      sanitized.settings = {};
    }
    if (sanitized.styles === null || sanitized.styles === undefined) {
      sanitized.styles = {};
    }
    if ("elements" in sanitized && Array.isArray(sanitized.elements)) {
      sanitized.elements = sanitized.elements.map(sanitize);
    }
    return sanitized;
  };
  return elements.map(sanitize);
};

export const computeHash = (elements: EditorElement[]): string => {
  try {
    return elements
      .map((el) => {
        const styleStr = JSON.stringify(el.styles || {});
        const settingsStr = JSON.stringify(el.settings || {});
        const contentStr = JSON.stringify(el.content || "");
        return `${el.id}:${el.type}:${styleStr}:${settingsStr}:${contentStr}`;
      })
      .join("|");
  } catch {
    return "";
  }
};

export const createElementsObserver = (
  latestHandlers: {
    handleSync: (elements: EditorElement[]) => void;
    handleUpdate: (elements: EditorElement[]) => void;
  },
  internalStateRef: { current: { isUpdatingFromElementStore: boolean } },
) => {
  return (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
    try {
      if (internalStateRef.current.isUpdatingFromElementStore) {
        return;
      }
      const elementsJson = event.target.toString();
      const parsed = elementsJson ? JSON.parse(elementsJson) : [];
      const isRemoteUpdate =
        transaction && transaction.origin === "remote-update";
      const isV2Sync = transaction && transaction.origin === "v2-sync";

      if (isV2Sync) {
        latestHandlers.handleSync(parsed);
      } else if (isRemoteUpdate) {
        latestHandlers.handleUpdate(parsed);
      } else {
        latestHandlers.handleSync(parsed);
      }
    } catch (err) {
      console.warn("[useYjsCollab] Elements parse failed:", err);
    }
  };
};

export const createSyncAwarenessToStore = (
  provider: CustomYjsProviderV2,
  mouseStore: any,
  internalStateRef: { current: { lastAwarenessHash: string } },
) => {
  return () => {
    if (!provider.awareness) return;

    try {
      const allStates = provider.awareness.getStates();
      if (!allStates) return;

      // Generate hash to detect changes
      const stateKeys: string[] = [];
      allStates.forEach((state: any, clientId: number) => {
        if (state?.cursor || state?.remoteUsers || state?.selectedElement) {
          const cursorStr = state.cursor
            ? `${state.cursor.x},${state.cursor.y}`
            : "";
          const remoteUsersStr = state.remoteUsers
            ? JSON.stringify(state.remoteUsers)
            : "";
          const selectedElementStr = state.selectedElement || "";
          stateKeys.push(
            `${clientId}:${cursorStr}:${remoteUsersStr}:${selectedElementStr}`,
          );
        }
      });

      const currentHash = stateKeys.sort().join("|");
      if (currentHash === internalStateRef.current.lastAwarenessHash) {
        return;
      }
      internalStateRef.current.lastAwarenessHash = currentHash;

      // Extract awareness data from all states
      const remoteUsers: Record<
        string,
        { x: number; y: number; cursor?: { x: number; y: number } }
      > = {};
      const selectedByUser: Record<string, string | null> = {};
      let users: Record<string, any> = {};

      const localClientId = provider.awareness?.clientID?.toString();
      let usersMapFound = false;

      allStates.forEach((state: any, clientId: number) => {
        if (!state) return;

        const clientIdStr = clientId.toString();

        // Process local state
        if (clientIdStr === localClientId) {
          // Extract users map from local state
          if (
            state.users &&
            typeof state.users === "object" &&
            Object.keys(state.users).length > 0
          ) {
            users = { ...state.users };
            usersMapFound = true;
          }

          // Extract remote users positions
          if (state.remoteUsers && typeof state.remoteUsers === "object") {
            Object.entries(state.remoteUsers).forEach(([userId, pos]) => {
              if (
                pos &&
                typeof pos === "object" &&
                "x" in pos &&
                "y" in pos &&
                typeof pos.x === "number" &&
                typeof pos.y === "number"
              ) {
                remoteUsers[userId] = {
                  x: pos.x,
                  y: pos.y,
                  cursor: { x: pos.x, y: pos.y },
                };
              }
            });
          }

          // Extract selected elements
          if (
            state.selectedByUser &&
            typeof state.selectedByUser === "object"
          ) {
            Object.assign(selectedByUser, state.selectedByUser);
          }

          return;
        }

        // Process remote states
        // Extract cursor position
        if (state.cursor && typeof state.cursor === "object") {
          const x = state.cursor.x;
          const y = state.cursor.y;
          if (typeof x === "number" && typeof y === "number") {
            remoteUsers[clientIdStr] = {
              x,
              y,
              cursor: { x, y },
            };
          }
        }

        // Extract selected element
        if (state.selectedElement) {
          selectedByUser[clientIdStr] = state.selectedElement;
        }

        // Extract user info if not found in local state
        if (!usersMapFound && state.user && typeof state.user === "object") {
          users[clientIdStr] = state.user;
        }
      });

      // Update mouse store with extracted data
      mouseStore.setRemoteUsers(remoteUsers);
      mouseStore.setSelectedByUser(selectedByUser as any);
      mouseStore.setUsers(users as any);
    } catch (err) {
      console.error("[useYjsCollab] Error syncing awareness to store:", err);
    }
  };
};

export const createAwarenessChangeObserver = (
  syncAwarenessToStore: () => void,
) => {
  return ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    // Sync on any awareness change (add, update, or remove)
    syncAwarenessToStore();
  };
};

/**
 * Validate and merge element updates for conflict resolution
 * Used to intelligently merge concurrent updates
 */
export const mergeElementUpdates = (
  baseElement: EditorElement,
  update1: Partial<EditorElement>,
  update2: Partial<EditorElement>,
): EditorElement => {
  const merged: any = { ...baseElement };

  // Fields that should use last-write-wins
  const lwwFields = ["content", "type"];

  // Fields that can be merged at deeper level
  const mergeableFields = ["styles", "settings"];

  // Apply first update
  Object.entries(update1).forEach(([key, value]) => {
    if (lwwFields.includes(key)) {
      merged[key] = value;
    } else if (mergeableFields.includes(key) && typeof value === "object") {
      merged[key] = {
        ...(merged[key] || {}),
        ...(value || {}),
      };
    } else {
      merged[key] = value;
    }
  });

  // Apply second update with last-write-wins for conflicting fields
  Object.entries(update2).forEach(([key, value]) => {
    if (mergeableFields.includes(key) && typeof value === "object") {
      merged[key] = {
        ...(merged[key] || {}),
        ...(value || {}),
      };
    } else {
      merged[key] = value;
    }
  });

  return merged as EditorElement;
};

/**
 * Calculate operation timestamp with millisecond precision
 */
export const getOperationTimestamp = (): number => {
  return Date.now();
};

/**
 * Generate a unique operation ID
 */
export const generateOperationId = (
  userId: string,
  timestamp: number,
): string => {
  return `op-${userId}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate element operation for consistency
 */
export const validateElementOperation = (
  operation: any,
): { valid: boolean; error?: string } => {
  if (!operation.type) {
    return { valid: false, error: "Operation type is required" };
  }

  if (!operation.elementId && operation.type !== "create") {
    return { valid: false, error: "Element ID is required for this operation" };
  }

  if (operation.type === "create" && !operation.element) {
    return {
      valid: false,
      error: "Element data is required for create operation",
    };
  }

  if (operation.type === "update" && !operation.updates) {
    return { valid: false, error: "Updates are required for update operation" };
  }

  if (operation.type === "move") {
    if (operation.newParentId === undefined) {
      return {
        valid: false,
        error: "New parent ID is required for move operation",
      };
    }
  }

  return { valid: true };
};

/**
 * Create a debounced awareness sync function
 */
export const createDebouncedAwarenessSync = (
  syncFn: () => void,
  delayMs: number = 100,
) => {
  let timeout: NodeJS.Timeout | null = null;

  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      syncFn();
      timeout = null;
    }, delayMs);
  };
};

/**
 * Get remote user color based on user ID
 */
export const getUserColor = (userId: string): string => {
  const hue =
    Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Format awareness state for debugging
 */
export const formatAwarenessState = (state: any): string => {
  try {
    const user = state?.user?.name || "unknown";
    const cursor = state?.cursor
      ? `(${state.cursor.x.toFixed(0)}, ${state.cursor.y.toFixed(0)})`
      : "none";
    const selectedElement = state?.selectedElement || "none";
    return `User: ${user}, Cursor: ${cursor}, Selected: ${selectedElement}`;
  } catch {
    return "Invalid state";
  }
};
