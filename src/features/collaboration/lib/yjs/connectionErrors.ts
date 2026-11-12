import type { WSErrorCode } from "../../interfaces/websocket/ws-collab.interface";

export type CloseClass =
  | { fatal: false }
  | { fatal: true; reason: "auth" | "forbidden" | "not_found" | "too_large"; message: string };

/**
 * Decides whether a WebSocket close should be retried. 1000/1001 and the
 * abnormal 1006/1011/1012/1013 closes are transient. Policy and auth
 * closes (1008, 4001/4401 unauthenticated, 4003/4403 forbidden, 4004/4404
 * missing project) will not fix themselves, so retrying only hammers the
 * server.
 */
export function classifyClose(code: number): CloseClass {
  switch (code) {
    case 4001:
    case 4401:
      return { fatal: true, reason: "auth", message: "Your session has expired. Sign in again to keep editing live." };
    case 1008:
    case 4003:
    case 4403:
      return { fatal: true, reason: "forbidden", message: "You don't have access to edit this project live." };
    case 4004:
    case 4404:
      return { fatal: true, reason: "not_found", message: "This project or page no longer exists." };
    case 1009:
      return { fatal: true, reason: "too_large", message: "That change was too large to send." };
    default:
      return { fatal: false };
  }
}

export interface ServerErrorHandling {
  /** Short message to show the user. */
  message: string;
  /** Resend `join` and request the page again. */
  rejoin: boolean;
  /** The page is unusable until this is resolved. */
  blocking: boolean;
}

/** Maps the server's error codes to what the client should do and say. */
export function handleServerError(code: WSErrorCode | string, serverMessage?: string): ServerErrorHandling {
  switch (code) {
    case "JOIN_REQUIRED":
      return { message: "Reconnecting to the page…", rejoin: true, blocking: false };
    case "NOT_FOUND":
      return { message: serverMessage || "This page no longer exists.", rejoin: false, blocking: true };
    case "VALIDATION_ERROR":
      return { message: serverMessage || "That change was rejected by the server.", rejoin: false, blocking: false };
    default:
      return {
        message: serverMessage || "The collaboration server couldn't process that change.",
        rejoin: false,
        blocking: false,
      };
  }
}
