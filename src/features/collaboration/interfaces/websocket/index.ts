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
  ConnectionOptions,

  // Realtime provider public API and options
  RealtimeProviderClient,
  RealtimeProviderOptions,
  RemoteElementState,

  // Hook types
  RoomState,
  CollabState,
} from "./realtime-provider.interface";
