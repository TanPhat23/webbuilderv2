import type { EditorElement } from "@/types/global.type";
import type { Page } from "./page.interface";
import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import type React from "react";
import type { CustomYjsProviderV2 } from "@/lib/yjs/yjs-provider-v2";

// ============================================================================
// Message Types
// ============================================================================

export type MessageType =
  | "elementOperation"
  | "elementOperationSuccess"
  | "pageOperation"
  | "pageOperationSuccess"
  | "initialSync"
  | "error"
  | "mouseMove"
  | "elementSelect"
  | "conflict"
  | "currentState"
  | "userDisconnect";

export type OperationType = "create" | "update" | "delete" | "move";

export type UpdateType = "full" | "partial" | "style" | "content";

// ============================================================================
// Base Message Interface
// ============================================================================

export interface BaseMessage {
  type: MessageType;
  requestId?: string;
}

// ============================================================================
// Element Operation Messages
// ============================================================================

export interface ElementOperationRequest extends BaseMessage {
  type: "elementOperation";
  operationType: OperationType;
  requestId: string;
  userId: string;
  elementId?: string;
  element?: EditorElement;
  parentId?: string | null;
  position?: number;
  updates?: Partial<EditorElement>;
  updateType?: UpdateType;
  deleteChildren?: boolean;
  preserveStructure?: boolean;
  newParentId?: string | null;
  newPosition?: number;
}

export interface ElementOperationSuccess extends BaseMessage {
  type: "elementOperationSuccess";
  requestId: string;
  operationType: string;
  element?: EditorElement;
  elementId?: string;
  deletedElementId?: string;
  deletedChildren?: string[];
  movedChildren?: string[];
  oldParentId?: string | null;
  newParentId?: string | null;
  oldPosition?: number;
  newPosition?: number;
  version: number;
  timestamp: number;
}

// ============================================================================
// Page Operation Messages
// ============================================================================

export interface PageOperationRequest extends BaseMessage {
  type: "pageOperation";
  operationType: OperationType;
  requestId: string;
  userId: string;
  pageId?: string;
  page?: Page;
  updates?: Partial<Page>;
}

export interface PageOperationSuccess extends BaseMessage {
  type: "pageOperationSuccess";
  requestId: string;
  operationType: string;
  page?: Page;
  pageId?: string;
  deletedPageId?: string;
  version: number;
  timestamp: number;
}

// ============================================================================
// Sync & State Messages
// ============================================================================

export interface InitialSyncMessage extends BaseMessage {
  type: "initialSync";
  documentId: string;
  version: number;
  elements: EditorElement[];
  timestamp: number;
}

export interface ErrorMessage extends BaseMessage {
  type: "error";
  requestId?: string;
  message?: string;
  error?: string;
  code?: string;
}

// ============================================================================
// Awareness Messages
// ============================================================================

export interface MousePosition {
  x: number;
  y: number;
}

export interface MouseMoveMessage extends BaseMessage {
  type: "mouseMove";
  userId: string;
  x: number;
  y: number;
}

export interface ElementSelectMessage extends BaseMessage {
  type: "elementSelect";
  userId: string;
  elementId: string | null;
}

// ============================================================================
// Conflict Resolution
// ============================================================================

export interface ConflictResolution {
  strategy: string;
  winningUserId: string;
  resolvedAt: number;
}

export interface ConflictMessage extends BaseMessage {
  type: "conflict";
  documentId: string;
  elementId: string;
  conflictType: string;
  resolution: ConflictResolution;
}

// ============================================================================
// User & State Information
// ============================================================================

export interface UserInfo {
  userId: string;
  userName: string;
  email: string;
}

export interface CurrentStateMessage extends BaseMessage {
  type: "currentState";
  mousePositions?: Record<string, MousePosition>;
  selectedElements?: Record<string, string>;
  users?: Record<string, UserInfo>;
  timestamp: number;
}

export interface UserDisconnectMessage extends BaseMessage {
  type: "userDisconnect";
  userId: string;
  timestamp: number;
}

// ============================================================================
// Union Types
// ============================================================================

export type V2Message =
  | ElementOperationRequest
  | ElementOperationSuccess
  | PageOperationRequest
  | PageOperationSuccess
  | InitialSyncMessage
  | ErrorMessage
  | MouseMoveMessage
  | ElementSelectMessage
  | ConflictMessage
  | CurrentStateMessage
  | UserDisconnectMessage;

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
  refillRate: number;
  lastRefill: number;
}

export interface AwarenessState {
  user?: { name: string; color: string };
  cursor?: MousePosition;
  selectedElement?: string | null;
  remoteUsers?: Record<string, MousePosition>;
  selectedByUser?: Record<string, string | null>;
  users?: Record<string, UserInfo>;
}

export type StatusListener = (data: { status: string }) => void;
export type SyncedListener = (synced: boolean) => void;
export type EventType = "status" | "synced";

export interface YjsProviderV2Options {
  url: string;
  pageId: string;
  projectId: string;
  userId: string;
  getToken: () => Promise<string | null>;
  doc: Y.Doc;
  onSyncUsers?: (users: Record<string, UserInfo>) => void;
  onConflict?: (conflict: ConflictMessage) => void;
  onError?: (error: ErrorMessage) => void;
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
  ) => Promise<ElementOperationSuccess>;
  updateElement: (
    elementId: string,
    updates: Partial<EditorElement>,
    updateType?: UpdateType,
  ) => Promise<ElementOperationSuccess>;
  deleteElement: (
    elementId: string,
    deleteChildren?: boolean,
    preserveStructure?: boolean,
  ) => Promise<ElementOperationSuccess>;
  moveElement: (
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ) => Promise<ElementOperationSuccess>;
  createPage: (page: Page) => Promise<PageOperationSuccess>;
  updatePage: (
    pageId: string,
    updates: Partial<Page>,
  ) => Promise<PageOperationSuccess>;
  deletePage: (pageId: string) => Promise<PageOperationSuccess>;
  reconnect: () => Promise<void>;
}
