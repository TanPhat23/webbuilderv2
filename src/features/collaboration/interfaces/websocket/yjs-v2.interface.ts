import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";
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
  LogicScope,
  LogicUpdatePayload,
  LogicChangedPayload,
  LogicSyncPayload,
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
  LogicScope,
  LogicUpdatePayload,
  LogicChangedPayload,
  LogicSyncPayload,
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

  /** Sends a logic patch; resolves with the committed document or rejects with the server's reason. */
  updateLogic(scope: LogicScope, patch: Record<string, unknown>, nullPaths?: string[][]): Promise<LogicChangedPayload>;
  moveLogic(kind: "variable" | "flow", name: string, to: LogicScope): Promise<LogicSyncPayload>;
  /** Asks the server for the current logic documents; they arrive through `onLogicSync`. */
  requestLogicSync(): void;
}

export interface RemoteElementState {
  elements: EditorElement[];
  loadElements: (elements: EditorElement[], skipSave?: boolean) => unknown;
  remoteAdd: (element: EditorElement) => void;
  remoteUpdate: (id: string, patch: Partial<EditorElement>) => void;
  remoteMove: (id: string, parentId: string | null, order: number) => void;
  remoteDelete: (id: string) => void;
}

export interface YjsProviderV2Options {
  url: string;
  pageId: string;
  projectId: string;
  userId: string;
  userName?: string;
  getToken: () => Promise<string | null>;
  getElementState: () => RemoteElementState;
  onPendingChange?: (count: number) => void;
  onSyncUsers?: (users: Record<string, UserInfo>) => void;
  onError?: (error: ErrorMessage) => void;
  onPresence?: (data: PresenceBroadcastPayload) => void;
  onLogicSync?: (payload: LogicSyncPayload) => void;
  /** `own` is true when this is the acknowledgement of a change this client sent. */
  onLogicChanged?: (payload: LogicChangedPayload, own: boolean) => void;
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
