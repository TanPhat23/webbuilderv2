import _ from "lodash";
import { z } from "zod";
import { EditorElement } from "@/types/global.type";
import type { UserInfo, RemotePresence } from "@/interfaces/websocket";

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const RemoteUserSchema = z.object({
  x: z.number(),
  y: z.number(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const PresenceSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  cursorX: z.number(),
  cursorY: z.number(),
  elementId: z.string().nullable().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const OperationDataSchema = z.object({
  type: z.string(),
  elementId: z.string().optional(),
  element: z.custom<EditorElement>().optional(),
  updates: z.custom<Partial<EditorElement>>().optional(),
  newParentId: z.string().nullable().optional(),
  newPosition: z.number().optional(),
});

// ============================================================================
// Types & Interfaces
// ============================================================================

export type RemoteUser = z.infer<typeof RemoteUserSchema>;
export type OperationData = z.infer<typeof OperationDataSchema>;

export interface MouseStore {
  setRemoteUsers: (users: Record<string, RemoteUser>) => void;
  setSelectedByUser: (selected: Record<string, string>) => void;
  setUsers: (users: Record<string, UserInfo>) => void;
}

export interface InternalState {
  isUpdatingFromElementStore: boolean;
  lastAwarenessHash: string;
}

// ============================================================================
// Element Utilities
// ============================================================================

/**
 * Ensures elements have required fields initialized recursively.
 * Useful when loading elements from the server to guarantee settings/styles
 * objects exist before rendering.
 */
export const sanitizeElements = (
  elements: EditorElement[],
): EditorElement[] => {
  const sanitize = (el: EditorElement): EditorElement => {
    const sanitized = { ...el };
    sanitized.settings ??= {};
    sanitized.styles ??= {};

    if ("elements" in sanitized && _.isArray(sanitized.elements)) {
      sanitized.elements = (sanitized.elements as EditorElement[]).map(
        sanitize,
      );
    }
    return sanitized;
  };
  return elements.map(sanitize);
};

/**
 * Computes a string hash for elements to detect structural or content changes.
 * Useful for diffing before applying updates.
 */
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
  } catch (err) {
    console.warn("[Collab Utils] Hash computation failed:", err);
    return "";
  }
};

// ============================================================================
// Presence Utilities
// ============================================================================

/**
 * Converts a Map of RemotePresence entries into the Record shapes
 * needed by the mouse store.
 */
export const presencesToMouseStoreData = (
  presences: Map<string, RemotePresence>,
): {
  remoteUsers: Record<string, { x: number; y: number }>;
  selectedByUser: Record<string, string>;
  users: Record<string, UserInfo>;
} => {
  const remoteUsers: Record<string, { x: number; y: number }> = {};
  const selectedByUser: Record<string, string> = {};
  const users: Record<string, UserInfo> = {};

  presences.forEach((presence, uid) => {
    remoteUsers[uid] = {
      x: presence.cursorX,
      y: presence.cursorY,
    };

    if (presence.elementId) {
      selectedByUser[uid] = presence.elementId;
    }

    users[uid] = {
      userId: presence.userId,
      userName: presence.userName,
      email: "",
    };
  });

  return { remoteUsers, selectedByUser, users };
};

/**
 * Syncs remote presence data into the mouse store.
 * This is a convenience wrapper around presencesToMouseStoreData.
 */
export const syncPresencesToStore = (
  presences: Map<string, RemotePresence>,
  mouseStore: MouseStore,
): void => {
  const { remoteUsers, selectedByUser, users } =
    presencesToMouseStoreData(presences);
  mouseStore.setRemoteUsers(remoteUsers);
  mouseStore.setSelectedByUser(selectedByUser);
  mouseStore.setUsers(users);
};

// ============================================================================
// Conflict Resolution & Operations
// ============================================================================

/**
 * Merges concurrent element updates using lodash deep merging for settings/styles.
 * Used for client-side optimistic conflict resolution when two users edit
 * the same element simultaneously.
 *
 * Note: The server is authoritative — it handles conflict resolution via
 * timestamp-based LWW. This utility is for client-side reconciliation only.
 */
export const mergeElementUpdates = (
  baseElement: EditorElement,
  update1: Partial<EditorElement>,
  update2: Partial<EditorElement>,
): EditorElement => {
  const merged = _.cloneDeep(baseElement);

  const applyUpdate = (upd: Partial<EditorElement>) => {
    if (upd.styles) {
      merged.styles = _.merge({}, merged.styles, upd.styles);
    }
    if (upd.settings) {
      const mergedSettings = _.merge({}, merged.settings || {}, upd.settings);
      (merged as { settings?: unknown }).settings = mergedSettings;
    }

    const rest = _.omit(upd, ["styles", "settings", "id"]);
    Object.assign(merged, rest);
  };

  applyUpdate(update1);
  applyUpdate(update2);

  return merged;
};

export const getOperationTimestamp = (): number => Date.now();

/**
 * Generates a unique operation ID for tracking.
 * Format: `op-<userId>-<timestamp>-<random>`
 */
export const generateOperationId = (
  userId: string,
  timestamp: number,
): string => {
  const random = Math.random().toString(36).slice(2, 11);
  return `op-${userId}-${timestamp}-${random}`;
};

/**
 * Generates a unique request ID for WebSocket request/response correlation.
 * Format: `req-<timestamp>-<random>`
 */
export const generateRequestId = (): string => {
  const random = Math.random().toString(36).slice(2, 11);
  return `req-${Date.now()}-${random}`;
};

/**
 * Validates element operation using Zod.
 * Returns { valid: true } on success, or { valid: false, error: string } on failure.
 */
export const validateElementOperation = (
  operation: unknown,
): { valid: boolean; error?: string } => {
  const result = OperationDataSchema.safeParse(operation);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues
        .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        .join(", "),
    };
  }

  const op = result.data;
  if (op.type !== "create" && !op.elementId) {
    return { valid: false, error: "Element ID is required" };
  }

  switch (op.type) {
    case "create":
      if (!op.element) return { valid: false, error: "Element data required" };
      break;
    case "update":
      if (!op.updates) return { valid: false, error: "Updates required" };
      break;
    case "move":
      if (op.newParentId === undefined)
        return { valid: false, error: "New parent ID required" };
      break;
  }

  return { valid: true };
};

/**
 * Creates a debounced version of a sync function.
 * Useful for throttling store updates from rapid WebSocket messages.
 */
export const createDebouncedSync = (
  syncFn: () => void,
  delayMs = 100,
): (() => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      syncFn();
      timeout = null;
    }, delayMs);
  };
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Generates a stable HSL color based on a string (e.g., userId).
 * Used for remote cursor colors in the editor canvas.
 */
export const getUserColor = (userId: string): string => {
  const hash = _.reduce(
    Array.from(userId),
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Formats a RemotePresence object for debugging/logging.
 */
export const formatPresenceState = (presence: RemotePresence): string => {
  try {
    const cursor = `(${presence.cursorX.toFixed(0)}, ${presence.cursorY.toFixed(0)})`;
    const selected = presence.elementId || "none";
    return `User: ${presence.userName}, Cursor: ${cursor}, Selected: ${selected}`;
  } catch {
    return "Invalid presence state";
  }
};

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/**
 * @deprecated Use `createDebouncedSync` instead
 */
export const createDebouncedAwarenessSync = createDebouncedSync;

/**
 * @deprecated Awareness polling is no longer needed.
 * Presence is now handled via WebSocket `presence` messages.
 * This function is a no-op kept for backward compatibility.
 */
export const createSyncAwarenessToStore = (
  _provider: unknown,
  _mouseStore: MouseStore,
  _internalStateRef: { current: Pick<InternalState, "lastAwarenessHash"> },
): (() => void) => {
  return () => {
    // No-op: Presence is now handled by the WebSocketProvider/AwarenessController
    // via envelope-based `presence` messages, not by polling Yjs Awareness states.
  };
};

/**
 * @deprecated Awareness change observer is no longer needed.
 * This function is a no-op kept for backward compatibility.
 */
export const createAwarenessChangeObserver = (
  _syncFn: () => void,
): (() => void) => {
  return () => {
    // No-op: see createSyncAwarenessToStore
  };
};
