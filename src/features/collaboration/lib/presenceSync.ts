import type {
  MousePosition,
  RemotePresence,
  User,
} from "../interfaces/websocket";

export const HIDDEN_CURSOR: MousePosition = { x: -1, y: -1 };
export const PRESENCE_SEND_THROTTLE_MS = 50;
export const TINY_CURSOR_DELTA_PX = 3;

export function canStartCollabRoom({
  enabled,
  isLoaded,
  userId,
  pageId,
}: {
  enabled: boolean;
  isLoaded: boolean;
  userId: string | null | undefined;
  pageId: string;
}): boolean {
  return Boolean(enabled && isLoaded && userId && pageId && pageId !== "undefined");
}

export function extractProviderErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string" && error.message) {
      return error.message;
    }
    if ("error" in error && typeof error.error === "string" && error.error) {
      return error.error;
    }
  }
  return "Unknown provider error";
}

export function buildMouseStorePresencePatch(
  presences: ReadonlyMap<string, RemotePresence>,
  existingUsers: Readonly<Record<string, User>>,
): {
  remoteUsers: Record<string, MousePosition>;
  selectedByUser: Record<string, string>;
  users: Record<string, User>;
} {
  const remoteUsers: Record<string, MousePosition> = {};
  const selectedByUser: Record<string, string> = {};
  const users: Record<string, User> = { ...existingUsers };

  presences.forEach((presence, uid) => {
    remoteUsers[uid] = { x: presence.cursorX, y: presence.cursorY };
    if (presence.elementId) {
      selectedByUser[uid] = presence.elementId;
    }
    users[uid] = {
      userId: presence.userId,
      userName: presence.userName,
      email: existingUsers[uid]?.email ?? "",
    };
  });

  return { remoteUsers, selectedByUser, users };
}
