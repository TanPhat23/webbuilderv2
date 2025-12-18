"use client";

export { useWebSocket } from "./use-websocket";

export { useMouseTracking } from "./use-mouse-tracking";

export type {
  ConnectionState,
  WebSocketMessage,
  WebSocketError,
  SendMessagePayload,
  WebSocketErrorEvent,
  UseWebSocketOptions,
  UseWebSocketReturn,
  WebSocketMessageType,
  SyncMessage,
  UpdateMessage,
  ErrorMessage,
  UserDisconnectMessage,
} from "@/interfaces/realtime.interface";

export {
  isSyncMessage,
  isUpdateMessage,
  isErrorMessage,
  isMouseMoveMessage,
  isUserDisconnectMessage,
} from "@/interfaces/realtime.interface";

// Re-export MouseMoveMessage type
export type { MouseMoveMessage } from "@/interfaces/realtime.interface";
