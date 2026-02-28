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
  JoinPayload,
  PresencePayload,
  ElementCreatePayload,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
  SyncRequestPayload,
} from "./ws-collab.interface";

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
  JoinPayload,
  PresencePayload,
  ElementCreatePayload,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
  SyncRequestPayload,
};

export type MessageType = WSMessageType;

export type OperationType = "create" | "update" | "delete" | "move";

export type UpdateType = "full" | "partial" | "style" | "content";

export type BaseMessage = WSEnvelope<unknown>;

export interface ElementOperationResult {
  operationType: OperationType;
  element?: EditorElement;
  deletedElementId?: string;
  elementId?: string;
  parentId?: string | null;
  order?: number;
  requestId?: string;
}

export interface PageOperationResult {
  operationType: OperationType;
  page?: Page;
  pageId?: string;
  deletedPageId?: string;
  requestId?: string;
}


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

export type V2Message = WSEnvelope<unknown>;

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

export interface ConnectionOptions {
  url: string;
  projectId: string;
  pageId: string;
  getToken: () => Promise<string | null>;
  reconnectBaseInterval?: number;
  reconnectMultiplier?: number;
  maxReconnectInterval?: number;
}

export interface CustomYjsProviderV2 {
  doc: Y.Doc;
  awareness: Awareness;
  connected: boolean;
  isSynced: boolean;

  on(event: EventType, callback: StatusListener | SyncedListener): void;
  off(event: EventType, callback: StatusListener | SyncedListener): void;
  disconnect(): void;
  reconnect(): Promise<void>;
  destroy(): void;

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

  sendPresence(
    cursorX: number,
    cursorY: number,
    elementId?: string | null,
  ): void;
  requestSync(): void;

  createPage(page: Page): Promise<PageOperationResult>;
  updatePage(
    pageId: string,
    updates: Partial<Page>,
  ): Promise<PageOperationResult>;
  deletePage(pageId: string): Promise<PageOperationResult>;
}

export interface YjsProviderV2Options {
  url: string;
  pageId: string;
  projectId: string;
  userId: string;
  userName?: string;
  getToken: () => Promise<string | null>;
  doc: Y.Doc;
  onSyncUsers?: (users: Record<string, UserInfo>) => void;
  onConflict?: (conflict: ConflictMessage) => void;
  onError?: (error: ErrorMessage) => void;
  onPresence?: (data: PresenceBroadcastPayload) => void;
}

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
