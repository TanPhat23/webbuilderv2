import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";

// ============================================================================
// Error Codes
// ============================================================================

export type WSErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "JOIN_REQUIRED"
  | "PROCESS_ERROR";

// ============================================================================
// Message Types
// ============================================================================

export const WS_MESSAGE = {
  JOIN: "join",
  PRESENCE: "presence",
  ELEMENT_CREATE: "element:create",
  ELEMENT_UPDATE: "element:update",
  ELEMENT_MOVE: "element:move",
  ELEMENT_DELETE: "element:delete",
  SYNC_PAGE: "sync:page",
  ERROR: "error",
} as const;

export type WSMessageType = (typeof WS_MESSAGE)[keyof typeof WS_MESSAGE];

// ============================================================================
// Message Envelope
// ============================================================================

/**
 * Standard envelope used for all WebSocket communication (client <-> server).
 * Every message sent or received follows this structure.
 *
 * @see WebSocket API Reference — Section 2: Message Envelope
 */
export interface WSEnvelope<T = unknown> {
  /** The action type (e.g., `element:update`) */
  type: WSMessageType;
  /** ID of the project */
  projectId: string;
  /** ID of the page */
  pageId: string;
  /** ID of the acting user (optional but recommended) */
  userId?: string;
  /** Client-generated ID to correlate request/response (useful for acknowledgements) */
  requestId?: string;
  /** Unix milliseconds */
  timestamp: number;
  /** Action-specific data */
  payload: T;
}

// ============================================================================
// Payload Types — Client to Server
// ============================================================================

/** Payload for `join` message. Must be sent before performing any element operations. */
export interface JoinPayload {
  pageId: string;
}

/** Payload for `presence` message. Broadcasts cursor/selection to other users. */
export interface PresencePayload {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  meta?: Record<string, unknown>;
}

/** Payload for `element:create` (client -> server) */
export interface ElementCreatePayloadNode {
  type: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  tailwindStyles?: string;
  order: number;
  parentId?: string | null;
  content?: string;
  name?: string;
  id?: string;
  src?: string;
  href?: string;
  elements?: ElementCreatePayloadNode[];
}

export interface ElementCreatePayload {
  element: ElementCreatePayloadNode;
}

/** Payload for `element:update` (client -> server, patch semantics) */
export interface ElementUpdatePayload {
  id: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  /** Allow additional partial fields */
  [key: string]: unknown;
}

/** Payload for `element:move` (reparent or reorder) */
export interface ElementMovePayload {
  id: string;
  parentId: string | null;
  order: number;
}

/** Payload for `element:delete` */
export interface ElementDeletePayload {
  id: string;
}

/** Payload for client-initiated `sync` request (empty payload) */
export type SyncRequestPayload = Record<string, never>;

/**
 * Messages that can be sent from client to server (un-enveloped). These are
 * wrapped in `WSEnvelope` before being sent on the wire.
 */
export type SendMessagePayload =
  | {
      type: typeof WS_MESSAGE.JOIN;
      payload: JoinPayload;
    }
  | {
      type: typeof WS_MESSAGE.PRESENCE;
      payload: PresencePayload;
    }
  | {
      type: typeof WS_MESSAGE.ELEMENT_CREATE;
      element: Partial<EditorElement> & { type: string };
      parentId?: string | null;
      order?: number;
    }
  | {
      type: typeof WS_MESSAGE.ELEMENT_UPDATE;
      id: string;
      settings?: Record<string, unknown> | null;
      styles?: Record<string, unknown> | null;
      [key: string]: unknown;
    }
  | {
      type: typeof WS_MESSAGE.ELEMENT_MOVE;
      id: string;
      parentId: string | null;
      order: number;
    }
  | {
      type: typeof WS_MESSAGE.ELEMENT_DELETE;
      id: string;
    }
  | {
      type: typeof WS_MESSAGE.SYNC_PAGE;
    };

// ============================================================================
// Payload Types — Server to Client
// ============================================================================

/** Basic user type used across presence & awareness */
export type User = {
  userId: string;
  userName: string;
  email: string;
};

/** User presence info included in sync responses */
export interface SyncUser {
  userId: string;
  userName: string;
  presence: {
    cursorX: number;
    cursorY: number;
    elementId?: string | null;
  };
}

/** Payload for server `sync` response (sent after `join` or on `sync` request) */
export interface SyncResponsePayload {
  elements: EditorElement[];
  users: SyncUser[];
}

/** Payload for server `element:create` broadcast (after persistence) */
export interface ElementCreateBroadcastPayload {
  element: EditorElement;
}

/** Payload for server `element:update` broadcast (merged patch) */
export interface ElementUpdateBroadcastPayload {
  id: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Payload for server `element:move` broadcast */
export interface ElementMoveBroadcastPayload {
  id: string;
  parentId: string | null;
  order: number;
}

/** Payload for server `element:delete` broadcast */
export interface ElementDeleteBroadcastPayload {
  id: string;
}

/** Payload for server `error` message */
export interface ErrorPayload {
  code: WSErrorCode;
  message: string;
}

/** Payload for server `presence` broadcast (another user's presence update) */
export interface PresenceBroadcastPayload {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  meta?: Record<string, unknown>;
}

// ============================================================================
// Discriminated Union of All Messages
// ============================================================================

export type WSClientMessage =
  | WSEnvelope<JoinPayload>
  | WSEnvelope<PresencePayload>
  | WSEnvelope<ElementCreatePayload>
  | WSEnvelope<ElementUpdatePayload>
  | WSEnvelope<ElementMovePayload>
  | WSEnvelope<ElementDeletePayload>
  | WSEnvelope<SyncRequestPayload>;

export type WSServerMessage =
  | WSEnvelope<SyncResponsePayload>
  | WSEnvelope<ElementCreateBroadcastPayload>
  | WSEnvelope<ElementUpdateBroadcastPayload>
  | WSEnvelope<ElementMoveBroadcastPayload>
  | WSEnvelope<ElementDeleteBroadcastPayload>
  | WSEnvelope<ErrorPayload>
  | WSEnvelope<PresenceBroadcastPayload>;

export type WSMessage = WSClientMessage | WSServerMessage;

// ============================================================================
// Connection & Provider Types
// ============================================================================

export type WSConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type WSRoomState = "connecting" | "connected" | "disconnected" | "error";

export interface WSConnectionOptions {
  /** WebSocket server base URL (e.g., `ws://localhost:8080`) */
  url: string;
  /** Project ID — used in the WebSocket URL path `/ws/:project` */
  projectId: string;
  /** Function that returns a JWT token for authentication */
  getToken: () => Promise<string | null>;
  /** Base interval for reconnection in ms (default: 500) */
  reconnectBaseInterval?: number;
  /** Multiplier for exponential backoff (default: 1.5) */
  reconnectMultiplier?: number;
  /** Maximum reconnection interval in ms (default: 30000) */
  maxReconnectInterval?: number;
  /** Maximum number of reconnection attempts before giving up (default: Infinity) */
  maxReconnectAttempts?: number;
}

export interface WSProviderOptions extends WSConnectionOptions {
  /** Current page ID to join on connect */
  pageId: string;
  /** Current user ID */
  userId: string;
  /** Current user display name */
  userName?: string;
  /** Callback when initial sync is received */
  onSync?: (data: SyncResponsePayload) => void;
  /** Callback when an element is created by another user */
  onElementCreate?: (
    data: ElementCreateBroadcastPayload,
    envelope: WSEnvelope<ElementCreateBroadcastPayload>,
  ) => void;
  /** Callback when an element is updated by another user */
  onElementUpdate?: (
    data: ElementUpdateBroadcastPayload,
    envelope: WSEnvelope<ElementUpdateBroadcastPayload>,
  ) => void;
  /** Callback when an element is moved by another user */
  onElementMove?: (
    data: ElementMoveBroadcastPayload,
    envelope: WSEnvelope<ElementMoveBroadcastPayload>,
  ) => void;
  /** Callback when an element is deleted by another user */
  onElementDelete?: (
    data: ElementDeleteBroadcastPayload,
    envelope: WSEnvelope<ElementDeleteBroadcastPayload>,
  ) => void;
  /** Callback when a presence update is received */
  onPresence?: (data: PresenceBroadcastPayload) => void;
  /** Callback when an error message is received */
  onError?: (data: ErrorPayload, envelope?: WSEnvelope<ErrorPayload>) => void;
  /** Callback when the connection status changes */
  onStatusChange?: (status: WSConnectionState) => void;
  /** Callback when disconnected */
  onDisconnect?: () => void;
  /** Callback when reconnected */
  onReconnect?: () => void;
}

// ============================================================================
// Pending Request Tracking
// ============================================================================

export interface WSPendingRequest<T = unknown> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  type: WSMessageType;
  timestamp: number;
}

export interface WSRateLimiter {
  tokens: number;
  maxTokens: number;
  /** Tokens replenished per second */
  refillRate: number;
  lastRefill: number;
}

// ============================================================================
// Provider Public Interface
// ============================================================================

export interface WSProviderPublicAPI {
  /** Whether the WebSocket is currently connected */
  readonly isConnected: boolean;
  /** Whether the initial sync has been received */
  readonly isSynced: boolean;
  /** Current connection state */
  readonly connectionState: WSConnectionState;

  /**
   * Join a page room. Must be called before element operations.
   * The server will automatically respond with a `sync` message.
   */
  joinPage(pageId: string): void;

  /** Send a presence update (cursor position, selection) */
  sendPresence(data: Omit<PresencePayload, "userId" | "userName">): void;

  /** Create a new element */
  createElement(
    element: Partial<EditorElement> & { type: string },
    parentId?: string | null,
    order?: number,
  ): Promise<WSEnvelope<ElementCreateBroadcastPayload>>;

  /** Update an element (partial patch semantics) */
  updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
  ): Promise<WSEnvelope<ElementUpdateBroadcastPayload>>;

  /** Move/reparent an element */
  moveElement(
    elementId: string,
    parentId: string | null,
    order: number,
  ): Promise<WSEnvelope<ElementMoveBroadcastPayload>>;

  /** Delete an element */
  deleteElement(
    elementId: string,
  ): Promise<WSEnvelope<ElementDeleteBroadcastPayload>>;

  /** Request a full state sync from the server */
  requestSync(): void;

  /** Reconnect the WebSocket */
  reconnect(): Promise<void>;

  /** Disconnect and clean up all resources */
  destroy(): void;

  /** Subscribe to status changes. Returns an unsubscribe function. */
  onStatusChange(callback: (status: WSConnectionState) => void): () => void;

  /** Subscribe to sync events. Returns an unsubscribe function. */
  onSyncEvent(callback: (data: SyncResponsePayload) => void): () => void;
}

// ============================================================================
// Presence State
// ============================================================================

/** Represents a remote user's presence state tracked locally */
export interface RemotePresence {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  lastUpdated: number;
  meta?: Record<string, unknown>;
}

// ============================================================================
// Collaboration Collab State (internal provider state)
// ============================================================================

export interface WSCollabState {
  roomState: WSRoomState;
  error: string | null;
  isSynced: boolean;
  pendingUpdates: number;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseWSCollabOptions {
  /** Project ID */
  projectId: string;
  /** Page ID to join */
  pageId: string;
  /** WebSocket server URL (default: `ws://localhost:8080`) */
  wsUrl?: string;
  /** Whether collaboration is enabled */
  enabled?: boolean;
  /** Called after initial sync is received */
  onSync?: () => void;
  /** Called on any error */
  onError?: (error: Error) => void;
  /** Called on disconnect */
  onDisconnect?: () => void;
  /** Called on reconnect */
  onReconnect?: () => void;
}

export interface UseWSCollabReturn {
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Room/connection state */
  roomState: WSRoomState;
  /** Error message, if any */
  error: string | null;
  /** Whether initial sync is complete */
  isSynced: boolean;
  /** Number of pending (unacknowledged) operations */
  pendingUpdates: number;
  /** Ref to attach to the canvas element for mouse tracking */
  canvasRef: React.RefObject<HTMLElement | null>;
  /** Remote users' presence state */
  remotePresences: Map<string, RemotePresence>;

  /** Create an element */
  createElement: (
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ) => Promise<void>;
  /** Update an element (partial) */
  updateElement: (
    elementId: string,
    updates: Partial<EditorElement>,
  ) => Promise<void>;
  /** Delete an element */
  deleteElement: (elementId: string) => Promise<void>;
  /** Move an element */
  moveElement: (
    elementId: string,
    newParentId: string | null,
    newPosition: number,
  ) => Promise<void>;

  /** Page operations (forwarded to REST or WS as appropriate) */
  createPage: (page: Page) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;

  /** Force reconnect */
  reconnect: () => Promise<void>;
}

// ============================================================================
// Collaboration Provider Context Types
// ============================================================================

export interface WSCollaborationConfig {
  projectId: string;
  pageId: string;
  wsUrl?: string;
  enabled?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export interface CollaborationContextValue {
  // Connection state
  isConnected: boolean;
  isSynced: boolean;
  roomState: WSRoomState;
  error: string | null;
  pendingUpdates: number;
  collabType: "websocket";

  // Canvas ref for mouse tracking
  canvasRef: React.RefObject<HTMLElement | null>;

  // Remote users
  remotePresences: Map<string, RemotePresence>;

  // Element operations
  createElement: (
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ) => Promise<void>;
  updateElement: (
    elementId: string,
    updates: Partial<EditorElement>,
  ) => Promise<void>;
  deleteElement: (elementId: string) => Promise<void>;
  moveElement: (
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ) => Promise<void>;

  // Page operations
  createPage: (page: Page) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;

  // Control
  reconnect: () => Promise<void>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isWSEnvelope(data: unknown): data is WSEnvelope {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    "projectId" in data &&
    "timestamp" in data &&
    "payload" in data
  );
}

export function isSyncMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<SyncResponsePayload> {
  return (
    msg.type === "sync:page" &&
    msg.payload != null &&
    typeof msg.payload === "object" &&
    "elements" in (msg.payload as object)
  );
}

export function isElementCreateMessage(
  msg: WSEnvelope<ElementCreateBroadcastPayload>,
): msg is WSEnvelope<ElementCreateBroadcastPayload> {
  return msg.type === WS_MESSAGE.ELEMENT_CREATE;
}

export function isElementUpdateMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<ElementUpdateBroadcastPayload> {
  return msg.type === "element:update";
}

export function isElementMoveMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<ElementMoveBroadcastPayload> {
  return msg.type === "element:move";
}

export function isElementDeleteMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<ElementDeleteBroadcastPayload> {
  return msg.type === "element:delete";
}

export function isErrorMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<ErrorPayload> {
  return msg.type === "error";
}

export function isPresenceMessage(
  msg: WSEnvelope,
): msg is WSEnvelope<PresenceBroadcastPayload> {
  return msg.type === "presence";
}

// ============================================================================
// Utility Types
// ============================================================================

export type WSMessageHandler<T = unknown> = (envelope: WSEnvelope<T>) => void;

export type WSStatusListener = (status: WSConnectionState) => void;

export type WSSyncListener = (data: SyncResponsePayload) => void;

export type WSPresenceListener = (data: PresenceBroadcastPayload) => void;
