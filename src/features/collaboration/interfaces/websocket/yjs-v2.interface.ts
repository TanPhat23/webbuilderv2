import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";
import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import type React from "react";
import type {
  WSEnvelope,
  WSMessageType,
  WSErrorCode,
  SyncResponsePayload,
  SyncUser,
  ErrorPayload,
  PresenceBroadcastPayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
  RemotePresence,
  // Client payloads & helpers (centralized in ws-collab)
  JoinPayload,
  PresencePayload,
  ElementCreatePayload,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
  SyncRequestPayload,
} from "./ws-collab.interface";

// ============================================================================
// Re-export WS types used by the Yjs layer
// ============================================================================

export type {
  WSEnvelope,
  WSMessageType,
  WSErrorCode,
  SyncResponsePayload,
  SyncUser,
  ErrorPayload,
  PresenceBroadcastPayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
  RemotePresence,
  // Client payloads (re-exported to avoid local duplicates)
  JoinPayload,
  PresencePayload,
  ElementCreatePayload,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
  SyncRequestPayload,
};

// ============================================================================
// Message Types (new envelope-based protocol)
// ============================================================================

/**
 * All message types in the new WebSocket API.
 * Use centralized WS types from `ws-collab.interface.ts`.
 */
export type MessageType = WSMessageType;

export type OperationType = "create" | "update" | "delete" | "move";

export type UpdateType = "full" | "partial" | "style" | "content";

// ============================================================================
// Base Message Interface (Envelope)
// ============================================================================

/**
 * All messages follow the standard `WSEnvelope` shape.
 * Re-export alias kept for backward compatibility.
 */
export type BaseMessage = WSEnvelope<unknown>;

// ============================================================================
// Client → Server Payloads
// ============================================================================

// Client payloads (e.g., `JoinPayload`, `PresencePayload`, `ElementCreatePayload`)
// are re-exported from `ws-collab.interface.ts` and should be used instead of
// local duplicate definitions.

// ============================================================================
// Server → Client Broadcast types
// ============================================================================

export interface ElementOperationResult {
  operationType: OperationType;
  /** Present for create/update broadcasts */
  element?: EditorElement;
  /** Present for delete broadcasts */
  deletedElementId?: string;
  /** Present for move broadcasts */
  elementId?: string;
  parentId?: string | null;
  order?: number;
  /** Original requestId for correlation */
  requestId?: string;
}

/**
 * Replaces the old `PageOperationSuccess`.
 * Page operations are currently not part of the WS API spec, but we keep
 * this type for future extension.
 */
export interface PageOperationResult {
  operationType: OperationType;
  page?: Page;
  pageId?: string;
  deletedPageId?: string;
  requestId?: string;
}

// ============================================================================
// Legacy compat aliases — old code may reference these names
// ============================================================================

/** @deprecated Use `ElementOperationResult` */
export type ElementOperationSuccess = ElementOperationResult;

/** @deprecated Use `PageOperationResult` */
export type PageOperationSuccess = PageOperationResult;

/** @deprecated Use `WSEnvelope<SyncResponsePayload>` */
export type InitialSyncMessage = WSEnvelope<SyncResponsePayload>;

/** Error message from the server — the provider may emit either a full envelope or a plain error object */
export type ErrorMessage =
  | WSEnvelope<ErrorPayload>
  | {
      type: "error";
      requestId?: string;
      message?: string;
      error?: string;
      code?: string;
      payload?: ErrorPayload;
    };

// ============================================================================
// Awareness / Presence
// ============================================================================

export interface MousePosition {
  x: number;
  y: number;
}

export interface UserInfo {
  userId: string;
  userName: string;
  email: string;
}

export interface AwarenessState {
  user?: {
    name: string;
    color: string;
    userId?: string;
    userName?: string;
    email?: string;
  };
  cursor?: MousePosition;
  selectedElement?: string | null;
  remoteUsers?: Record<string, MousePosition>;
  selectedByUser?: Record<string, string | null>;
  users?: Record<string, UserInfo>;
}

// ============================================================================
// Conflict Resolution (server handles via LWW / timestamp)
// ============================================================================

export interface ConflictResolution {
  strategy: string;
  winningUserId: string;
  resolvedAt: number;
}

export interface ConflictMessage {
  type: "error";
  documentId?: string;
  elementId?: string;
  conflictType?: string;
  resolution?: ConflictResolution;
  code?: string;
  message?: string;
}

// ============================================================================
// Incoming Message Union
//
// The Provider parses raw WebSocket data into WSEnvelope and then switches
// on `envelope.type`. This union covers all possible inbound message shapes.
// ============================================================================

export type V2Message = WSEnvelope<unknown>;

// ============================================================================
// Provider Configuration
// ============================================================================

export interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export interface RateLimiter {
  tokens: number;
  maxTokens: number;
  /** Tokens replenished per second */
  refillRate: number;
  lastRefill: number;
}

export type StatusListener = (data: { status: string }) => void;
export type SyncedListener = (synced: boolean) => void;
export type EventType = "status" | "synced";

// ============================================================================
// Connection Options
// ============================================================================

export interface ConnectionOptions {
  /** WebSocket server base URL (e.g. `ws://localhost:8080`) */
  url: string;
  /** Project ID — used in the URL path `/ws/:project` */
  projectId: string;
  /** Page ID to join after connecting */
  pageId: string;
  /** Returns a JWT token for auth */
  getToken: () => Promise<string | null>;
  /** Base interval for reconnection in ms (default: 500) */
  reconnectBaseInterval?: number;
  /** Multiplier for exponential backoff (default: 1.5) */
  reconnectMultiplier?: number;
  /** Maximum reconnection interval in ms (default: 30000) */
  maxReconnectInterval?: number;
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Public API surface of the Yjs-backed collaborative provider.
 * Uses the new WS envelope protocol under the hood while keeping
 * Y.Doc + Awareness for local state management.
 */
export interface CustomYjsProviderV2 {
  /** Local Y.Doc instance (used as cache layer) */
  doc: Y.Doc;
  /** Yjs Awareness instance for cursor/selection tracking */
  awareness: Awareness;
  /** Whether the WebSocket is currently connected */
  connected: boolean;
  /** Whether the initial sync has been received from the server */
  isSynced: boolean;

  on(event: EventType, callback: StatusListener | SyncedListener): void;
  off(event: EventType, callback: StatusListener | SyncedListener): void;
  disconnect(): void;
  reconnect(): Promise<void>;
  destroy(): void;

  // Element operations — send enveloped messages, return server response
  createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationResult>;
  updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    updateType?: UpdateType,
  ): Promise<ElementOperationResult>;
  deleteElement(
    elementId: string,
    deleteChildren?: boolean,
    preserveStructure?: boolean,
  ): Promise<ElementOperationResult>;
  moveElement(
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ): Promise<ElementOperationResult>;

  // Presence — sends `presence` envelope messages
  sendPresence(
    cursorX: number,
    cursorY: number,
    elementId?: string | null,
  ): void;

  // Sync — request a full state sync from the server
  requestSync(): void;

  // Page operations (placeholder — not in current WS API spec)
  createPage(page: Page): Promise<PageOperationResult>;
  updatePage(
    pageId: string,
    updates: Partial<Page>,
  ): Promise<PageOperationResult>;
  deletePage(pageId: string): Promise<PageOperationResult>;
}

export interface YjsProviderV2Options {
  /** WebSocket server base URL */
  url: string;
  /** Page ID to join */
  pageId: string;
  /** Project ID */
  projectId: string;
  /** Current user ID */
  userId: string;
  /** Current user display name */
  userName?: string;
  /** Returns a JWT token */
  getToken: () => Promise<string | null>;
  /** Y.Doc instance to use for local state */
  doc: Y.Doc;
  /** Called when sync users list is received */
  onSyncUsers?: (users: Record<string, UserInfo>) => void;
  /** Called on conflict/error (server-side resolution) */
  onConflict?: (conflict: ConflictMessage) => void;
  /** Called on error messages */
  onError?: (error: ErrorMessage) => void;
  /** Called on presence updates from other users */
  onPresence?: (data: PresenceBroadcastPayload) => void;
}

// ============================================================================
// Hook Types
// ============================================================================

export type RoomState = "connecting" | "connected" | "disconnected" | "error";

export interface CollabState {
  roomState: RoomState;
  error: string | null;
  isSynced: boolean;
  pendingUpdates: number;
}

export interface UseYjsCollabV2Options {
  pageId: string;
  projectId: string;
  wsUrl?: string;
  enabled?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
  onConflict?: (conflict: ConflictMessage) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  debounceMs?: number;
  throttleMs?: number;
  enableDebug?: boolean;
}

export interface UseYjsCollabV2Return {
  isConnected: boolean;
  roomState: RoomState;
  error: string | null;
  isSynced: boolean;
  pendingUpdates: number;
  ydoc: Y.Doc | null;
  provider: CustomYjsProviderV2 | null;
  canvasRef: React.RefObject<HTMLElement | null>;
  createElement: (
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ) => Promise<ElementOperationResult>;
  updateElement: (
    elementId: string,
    updates: Partial<EditorElement>,
    updateType?: UpdateType,
  ) => Promise<ElementOperationResult>;
  deleteElement: (
    elementId: string,
    deleteChildren?: boolean,
    preserveStructure?: boolean,
  ) => Promise<ElementOperationResult>;
  moveElement: (
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ) => Promise<ElementOperationResult>;
  createPage: (page: Page) => Promise<PageOperationResult>;
  updatePage: (
    pageId: string,
    updates: Partial<Page>,
  ) => Promise<PageOperationResult>;
  deletePage: (pageId: string) => Promise<PageOperationResult>;
  reconnect: () => Promise<void>;
}
