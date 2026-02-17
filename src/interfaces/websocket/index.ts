// Consolidated re-exports for the WebSocket collaboration types.
//
// This module provides a single import surface for all websocket-related
// collaboration types used across the codebase.
//
// Prefer importing from "@/interfaces/websocket" instead of reaching into the
// individual files.
//
// Examples:
//   import { WSEnvelope, WSMessage, SendMessagePayload } from "@/interfaces/websocket";
//   import { CustomYjsProviderV2, UseYjsCollabV2Return } from "@/interfaces/websocket";
//
// NOTE: `ws-collab.interface.ts` is considered the canonical source for the
// envelope/payload shapes. This file re-exports those types and also selectively
// exports Yjs-specific provider and hook types that live in `yjs-v2.interface.ts`.

export * from "./ws-collab.interface";

export type {
  // Message / operation helpers
  MessageType,
  OperationType,
  UpdateType,

  // Operation result shapes
  ElementOperationResult,
  PageOperationResult,
  ElementOperationSuccess,
  PageOperationSuccess,

  // Backwards-compatible message aliases
  InitialSyncMessage,
  ErrorMessage,

  // Awareness / presence helpers
  MousePosition,
  UserInfo,
  AwarenessState,

  // Conflict resolution
  ConflictResolution,
  ConflictMessage,

  // Incoming Message Union
  V2Message,

  // PendingRequest / RateLimiter
  PendingRequest,
  RateLimiter,
  StatusListener,
  SyncedListener,
  EventType,
  ConnectionOptions,

  // Yjs provider public API and options
  CustomYjsProviderV2,
  YjsProviderV2Options,

  // Hook types
  RoomState,
  CollabState,
  UseYjsCollabV2Options,
  UseYjsCollabV2Return,
} from "./yjs-v2.interface";
