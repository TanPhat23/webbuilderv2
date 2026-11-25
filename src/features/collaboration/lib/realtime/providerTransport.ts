import type {
  ErrorMessage,
  WSErrorCode,
  WSEnvelope,
} from "../../interfaces/websocket";
import type { ConnectionManager } from "./ConnectionManager";
import { handleServerError } from "./connectionErrors";

const REJOIN_THROTTLE_MS = 5_000;

function isWireEnvelope(value: unknown): value is WSEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function parseWireEnvelope(data: unknown): WSEnvelope<unknown> | null {
  if (typeof data !== "string") {
    console.error(
      "[RealtimeProvider] Received non-string message payload:",
      data,
    );
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(data);
    if (!isWireEnvelope(parsed)) {
      console.error("[RealtimeProvider] Invalid message envelope:", parsed);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("[RealtimeProvider] Failed to parse message:", error);
    return null;
  }
}

export function createServerErrorReporter({
  connection,
  isSynced,
  emitStatus,
  onError,
}: {
  connection: ConnectionManager;
  isSynced: () => boolean;
  emitStatus: (status: string) => void;
  onError?: (error: ErrorMessage) => void;
}): (payload: { code: WSErrorCode; message: string; requestId?: string }) => void {
  let lastRejoinAt = 0;

  return (payload) => {
    const handling = handleServerError(payload.code, payload.message);
    if (handling.rejoin && Date.now() - lastRejoinAt > REJOIN_THROTTLE_MS) {
      lastRejoinAt = Date.now();
      if (connection.rejoin()) return;
    }
    if (!isSynced() || handling.blocking) emitStatus("error");
    onError?.({
      type: "error",
      message: handling.message,
      code: payload.code,
      requestId: payload.requestId,
    });
  };
}

export function bindProviderTransport({
  connection,
  onOpen,
  onClose,
  onFatal,
  onTransportError,
  onEnvelope,
}: {
  connection: ConnectionManager;
  onOpen: () => void;
  onClose: () => void;
  onFatal: (message: string) => void;
  onTransportError: (message: string) => void;
  onEnvelope: (envelope: WSEnvelope<unknown>) => void;
}): void {
  connection.on("open", onOpen);
  connection.on("close", onClose);
  connection.on("fatal", (info) => onFatal(info.message));
  connection.on("error", (error: Error) => onTransportError(error.message));
  connection.on("message", (data: unknown) => {
    const envelope = parseWireEnvelope(data);
    if (envelope) onEnvelope(envelope);
  });
}
