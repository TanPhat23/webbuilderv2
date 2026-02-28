import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";

export type WSErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "JOIN_REQUIRED"
  | "PROCESS_ERROR";

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

/** Standard envelope for all WebSocket messages (client <-> server). */
export interface WSEnvelope<T = unknown> {
  type: WSMessageType;
  projectId: string;
  pageId: string;
  userId?: string;
  requestId?: string;
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
}

export interface ElementDeletePayload {
  id: string;
}

export type SyncRequestPayload = Record<string, never>;

export type SendMessagePayload =
  | { type: typeof WS_MESSAGE.JOIN; payload: JoinPayload }
  | { type: typeof WS_MESSAGE.PRESENCE; payload: PresencePayload }
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
  | { type: typeof WS_MESSAGE.ELEMENT_DELETE; id: string }
  | { type: typeof WS_MESSAGE.SYNC_PAGE };

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

export type WSMessage = WSClientMessage | WSServerMessage;

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

export interface WSProviderOptions extends WSConnectionOptions {
  pageId: string;
  userId: string;
  userName?: string;
  onSync?: (data: SyncResponsePayload) => void;
  onElementCreate?: (
    data: ElementCreateBroadcastPayload,
    envelope: WSEnvelope<ElementCreateBroadcastPayload>,
  ) => void;
  onElementUpdate?: (
    data: ElementUpdateBroadcastPayload,
    envelope: WSEnvelope<ElementUpdateBroadcastPayload>,
  ) => void;
  onElementMove?: (
    data: ElementMoveBroadcastPayload,
    envelope: WSEnvelope<ElementMoveBroadcastPayload>,
  ) => void;
  onElementDelete?: (
    data: ElementDeleteBroadcastPayload,
    envelope: WSEnvelope<ElementDeleteBroadcastPayload>,
  ) => void;
  onPresence?: (data: PresenceBroadcastPayload) => void;
  onError?: (data: ErrorPayload, envelope?: WSEnvelope<ErrorPayload>) => void;
  onStatusChange?: (status: WSConnectionState) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

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

export interface WSProviderPublicAPI {
  readonly isConnected: boolean;
  readonly isSynced: boolean;
  readonly connectionState: WSConnectionState;

  joinPage(pageId: string): void;
  sendPresence(data: Omit<PresencePayload, "userId" | "userName">): void;
  createElement(
    element: Partial<EditorElement> & { type: string },
    parentId?: string | null,
    order?: number,
  ): Promise<WSEnvelope<ElementCreateBroadcastPayload>>;
  updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
  ): Promise<WSEnvelope<ElementUpdateBroadcastPayload>>;
  moveElement(
    elementId: string,
    parentId: string | null,
    order: number,
  ): Promise<WSEnvelope<ElementMoveBroadcastPayload>>;
  deleteElement(
    elementId: string,
  ): Promise<WSEnvelope<ElementDeleteBroadcastPayload>>;
  requestSync(): void;
  reconnect(): Promise<void>;
  destroy(): void;
  onStatusChange(callback: (status: WSConnectionState) => void): () => void;
  onSyncEvent(callback: (data: SyncResponsePayload) => void): () => void;
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

export interface UseWSCollabOptions {
  projectId: string;
  pageId: string;
  wsUrl?: string;
  enabled?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export interface UseWSCollabReturn {
  isConnected: boolean;
  roomState: WSRoomState;
  error: string | null;
  isSynced: boolean;
  pendingUpdates: number;
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
    newParentId: string | null,
    newPosition: number,
  ) => Promise<void>;
  createPage: (page: Page) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  reconnect: () => Promise<void>;
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

export type WSMessageHandler<T = unknown> = (envelope: WSEnvelope<T>) => void;
export type WSStatusListener = (status: WSConnectionState) => void;
export type WSSyncListener = (data: SyncResponsePayload) => void;
export type WSPresenceListener = (data: PresenceBroadcastPayload) => void;
