import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";

export type WSErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "JOIN_REQUIRED"
  | "ACCESS_DENIED"
  | "PROCESS_ERROR";

export const WS_MESSAGE = {
  JOIN: "join",
  PRESENCE: "presence",
  ELEMENT_CREATE: "element:create",
  ELEMENT_UPDATE: "element:update",
  ELEMENT_MOVE: "element:move",
  ELEMENT_DELETE: "element:delete",
  SYNC_PAGE: "sync:page",
  LOGIC_UPDATE: "logic:update",
  LOGIC_MOVE: "logic:move",
  LOGIC_SYNC: "logic:sync",
  ERROR: "error",
} as const;

export type WSMessageType = (typeof WS_MESSAGE)[keyof typeof WS_MESSAGE];

/** Standard envelope for all WebSocket messages (client <-> server). */
export interface WSEnvelope<T = unknown> {
  type: WSMessageType;
  projectId: string;
  pageId: string;
  userId?: string;
  requestId?: string;
  clientOpId?: string;
  seq?: number;
  /** Unix milliseconds */
  timestamp: number;
  payload: T;
}

export interface JoinPayload {
  pageId: string;
}

export interface PresencePayload {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  meta?: Record<string, unknown>;
}

export interface ElementCreatePayloadNode {
  type: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  tailwindStyles?: string;
  order: number;
  orderKey?: string;
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
  position?: number;
}

export interface ElementUpdatePayload {
  id: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ElementMovePayload {
  id: string;
  parentId: string | null;
  order: number;
  orderKey?: string;
}

export interface ElementDeletePayload {
  id: string;
}

export type SyncRequestPayload = Record<string, never>;

export type LogicScope = "project" | "page";

/** Sent by a client: a merge patch (null deletes a key) for one scope. */
export interface LogicUpdatePayload {
  scope: LogicScope;
  patch: Record<string, unknown>;
  nullPaths?: string[][];
}

/**
 * Broadcast after a committed update: the complete resulting document.
 * `revision` increases with every commit of that document (missing means 0).
 */
export interface LogicChangedPayload {
  scope: LogicScope;
  pageId?: string;
  logic: Record<string, unknown>;
  revision?: number;
}

/** Sent on join and on request: both documents that apply to the page, with their revisions. */
export interface LogicSyncPayload {
  project: Record<string, unknown>;
  page?: Record<string, unknown>;
  pageId?: string;
  projectRevision?: number;
  pageRevision?: number;
}

export type User = {
  userId: string;
  userName: string;
  email: string;
};

export interface SyncUser {
  userId: string;
  userName: string;
  presence: {
    cursorX: number;
    cursorY: number;
    elementId?: string | null;
  };
}

export interface SyncResponsePayload {
  seq?: number;
  elements: EditorElement[];
  users: SyncUser[];
}

export interface ElementCreateBroadcastPayload {
  element: EditorElement;
}

export interface ElementUpdateBroadcastPayload {
  id: string;
  settings?: Record<string, unknown> | null;
  styles?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ElementMoveBroadcastPayload {
  id: string;
  parentId: string | null;
  order: number;
}

export interface ElementDeleteBroadcastPayload {
  id: string;
}

export interface ErrorPayload {
  code: WSErrorCode;
  message: string;
}

export interface PresenceBroadcastPayload {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  meta?: Record<string, unknown>;
}

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

export type WSConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type WSRoomState = "connecting" | "connected" | "disconnected" | "error";

export interface WSConnectionOptions {
  url: string;
  projectId: string;
  getToken: () => Promise<string | null>;
  reconnectBaseInterval?: number;
  reconnectMultiplier?: number;
  maxReconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface RemotePresence {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  elementId?: string | null;
  lastUpdated: number;
  meta?: Record<string, unknown>;
}

export interface WSCollabState {
  roomState: WSRoomState;
  error: string | null;
  isSynced: boolean;
  pendingUpdates: number;
}

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
  isConnected: boolean;
  isSynced: boolean;
  roomState: WSRoomState;
  error: string | null;
  pendingUpdates: number;
  collabType: "websocket";
  canvasRef: React.RefObject<HTMLElement | null>;
  remotePresences: Map<string, RemotePresence>;
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
  createPage: (page: Page) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  reconnect: () => Promise<void>;
}
