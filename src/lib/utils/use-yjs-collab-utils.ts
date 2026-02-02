import * as Y from "yjs";
import _ from "lodash";
import { z } from "zod";
import { EditorElement } from "@/types/global.type";
import { CustomYjsProviderV2 } from "@/lib/yjs/yjs-provider-v2";
import type { UserInfo } from "@/interfaces/yjs-v2.interface";

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const RemoteUserSchema = z.object({
  x: z.number(),
  y: z.number(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const AwarenessStateSchema = z.object({
  user: z.custom<UserInfo>().optional(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  remoteUsers: z
    .record(z.string(), z.object({ x: z.number(), y: z.number() }))
    .optional(),
  selectedElement: z.string().optional(),
  selectedByUser: z.record(z.string(), z.string()).optional(),
  users: z.record(z.string(), z.custom<UserInfo>()).optional(),
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
export type AwarenessState = z.infer<typeof AwarenessStateSchema>;
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
 * Ensures elements have required fields initialized recursively
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
 * Computes a string hash for elements to detect structural or content changes
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
    console.warn("[YJS Utils] Hash computation failed:", err);
    return "";
  }
};

/**
 * Creates an observer for Y.Text changes
 */
export const createElementsObserver = (
  latestHandlers: {
    handleSync: (elements: EditorElement[]) => void;
    handleUpdate: (elements: EditorElement[]) => void;
  },
  internalStateRef: {
    current: Pick<InternalState, "isUpdatingFromElementStore">;
  },
) => {
  return (event: Y.YEvent<Y.Text>, transaction: Y.Transaction) => {
    try {
      if (internalStateRef.current.isUpdatingFromElementStore) return;

      const elementsJson = event.target.toString();
      const parsed: EditorElement[] = elementsJson
        ? JSON.parse(elementsJson)
        : [];

      const origin = transaction?.origin;
      if (origin === "v2-sync" || origin !== "remote-update") {
        latestHandlers.handleSync(parsed);
      } else {
        latestHandlers.handleUpdate(parsed);
      }
    } catch (err) {
      console.warn("[YJS Utils] Elements parse failed:", err);
    }
  };
};

// ============================================================================
// Awareness & Sync Utilities
// ============================================================================

/**
 * Extracts awareness data and syncs it to the application store
 */
export const createSyncAwarenessToStore = (
  provider: CustomYjsProviderV2,
  mouseStore: MouseStore,
  internalStateRef: { current: Pick<InternalState, "lastAwarenessHash"> },
) => {
  return () => {
    const awareness = provider.awareness;
    if (!awareness) return;

    try {
      const allStates = awareness.getStates() as Map<number, AwarenessState>;
      if (!allStates || allStates.size === 0) return;

      // 1. Quick Change Detection via Hash
      const currentHash = Array.from(allStates.entries())
        .filter(
          ([_, state]) =>
            state?.cursor || state?.remoteUsers || state?.selectedElement,
        )
        .map(([clientId, state]) => {
          const cursor = state.cursor
            ? `${state.cursor.x},${state.cursor.y}`
            : "";
          const remote = state.remoteUsers
            ? JSON.stringify(state.remoteUsers)
            : "";
          return `${clientId}:${cursor}:${remote}:${state.selectedElement || ""}`;
        })
        .sort()
        .join("|");

      if (currentHash === internalStateRef.current.lastAwarenessHash) return;
      internalStateRef.current.lastAwarenessHash = currentHash;

      // 2. Data Extraction
      const remoteUsers: Record<string, RemoteUser> = {};
      const selectedByUser: Record<string, string> = {};
      let users: Record<string, UserInfo> = {};

      const localClientId = awareness.clientID.toString();
      let usersMapFound = false;

      allStates.forEach((state, clientId) => {
        if (!state) return;
        const clientIdStr = clientId.toString();

        if (clientIdStr === localClientId) {
          if (
            state.users &&
            _.isObject(state.users) &&
            !_.isEmpty(state.users)
          ) {
            users = { ...state.users };
            usersMapFound = true;
          }

          if (state.remoteUsers && _.isObject(state.remoteUsers)) {
            _.forEach(state.remoteUsers, (pos, userId) => {
              if (pos?.x != null && pos?.y != null) {
                remoteUsers[userId] = {
                  x: pos.x,
                  y: pos.y,
                  cursor: { x: pos.x, y: pos.y },
                };
              }
            });
          }

          if (state.selectedByUser && _.isObject(state.selectedByUser)) {
            Object.assign(selectedByUser, state.selectedByUser);
          }
        } else {
          if (state.cursor?.x != null && state.cursor?.y != null) {
            remoteUsers[clientIdStr] = {
              x: state.cursor.x,
              y: state.cursor.y,
              cursor: { x: state.cursor.x, y: state.cursor.y },
            };
          }

          if (state.selectedElement) {
            selectedByUser[clientIdStr] = state.selectedElement;
          }

          if (!usersMapFound && state.user) {
            users[clientIdStr] = state.user;
          }
        }
      });

      mouseStore.setRemoteUsers(remoteUsers);
      mouseStore.setSelectedByUser(selectedByUser);
      mouseStore.setUsers(users);
    } catch (err) {
      console.error("[YJS Utils] Awareness sync error:", err);
    }
  };
};

export const createAwarenessChangeObserver = (
  syncAwarenessToStore: () => void,
) => {
  return () => syncAwarenessToStore();
};

// ============================================================================
// Conflict Resolution & Operations
// ============================================================================

/**
 * Merges concurrent element updates using lodash deep merging for settings/styles
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

export const generateOperationId = (
  userId: string,
  timestamp: number,
): string => {
  const random = Math.random().toString(36).slice(2, 11);
  return `op-${userId}-${timestamp}-${random}`;
};

/**
 * Validates element operation using Zod
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

export const createDebouncedAwarenessSync = (
  syncFn: () => void,
  delayMs = 100,
) => {
  let timeout: NodeJS.Timeout | null = null;

  return () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      syncFn();
      timeout = null;
    }, delayMs);
  };
};

/**
 * Generates a stable HSL color based on a string
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

/**
 * Formats awareness state for debugging
 */
export const formatAwarenessState = (state: AwarenessState): string => {
  try {
    const user = state.user?.userName || "unknown";
    const cursor = state.cursor
      ? `(${state.cursor.x.toFixed(0)}, ${state.cursor.y.toFixed(0)})`
      : "none";
    const selected = state.selectedElement || "none";
    return `User: ${user}, Cursor: ${cursor}, Selected: ${selected}`;
  } catch {
    return "Invalid state";
  }
};
