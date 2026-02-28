export * from "./ws-collab.interface";

export type {
  // Message / operation helpers
  MessageType,
  OperationType,
  UpdateType,

  // Operation result shapes
  ElementOperationResult,
  PageOperationResult,
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
