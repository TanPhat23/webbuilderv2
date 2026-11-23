import { EventEmitter } from "./EventEmitter";
import type {
  UserInfo,
  MousePosition,
  PresenceBroadcastPayload,
  RemotePresence,
} from "../../interfaces/websocket";

type AwarenessEvents = {
  change: [
    data: {
      remoteUsers: Record<string, MousePosition>;
      selectedByUser: Record<string, string | null>;
      users: Record<string, UserInfo>;
    },
  ];
};

export class AwarenessController extends EventEmitter<AwarenessEvents> {
  private readonly _remotePresences = new Map<string, RemotePresence>();
  private localSelectedElement: string | null = null;

  constructor(private readonly userId: string) {
    super();
  }

  public updateLocalSelection(elementId: string | null): void {
    this.localSelectedElement = elementId;
  }

  public getLocalSelectedElement(): string | null {
    return this.localSelectedElement;
  }

  public handleRemotePresence(data: PresenceBroadcastPayload): void {
    if (data.userId === this.userId) return;

    this._remotePresences.set(data.userId, {
      userId: data.userId,
      userName: data.userName,
      cursorX: data.cursorX,
      cursorY: data.cursorY,
      elementId: data.elementId,
      lastUpdated: Date.now(),
      meta: data.meta,
    });

    this.emitNormalizedChange();
  }

  public handleSyncUsers(
    users: Array<{
      userId: string;
      userName: string;
      presence: {
        cursorX: number;
        cursorY: number;
        elementId?: string | null;
      };
    }>,
  ): void {
    this._remotePresences.clear();

    for (const user of users) {
      if (user.userId === this.userId) continue;

      this._remotePresences.set(user.userId, {
        userId: user.userId,
        userName: user.userName,
        cursorX: user.presence.cursorX,
        cursorY: user.presence.cursorY,
        elementId: user.presence.elementId,
        lastUpdated: Date.now(),
      });
    }

    this.emitNormalizedChange();
  }

  public get remotePresences(): Map<string, RemotePresence> {
    return new Map(this._remotePresences);
  }

  private emitNormalizedChange(): void {
    const remoteUsers: Record<string, MousePosition> = {};
    const selectedByUser: Record<string, string | null> = {};
    const users: Record<string, UserInfo> = {};

    for (const [uid, presence] of this._remotePresences) {
      remoteUsers[uid] = {
        x: presence.cursorX,
        y: presence.cursorY,
      };

      if (presence.elementId) {
        selectedByUser[uid] = presence.elementId;
      }

      users[uid] = {
        userId: presence.userId,
        userName: presence.userName,
        email: "",
      };
    }

    this.emit("change", { remoteUsers, selectedByUser, users });
  }

  public pruneStale(maxAgeMs = 60_000): void {
    const now = Date.now();
    let changed = false;

    for (const [userId, presence] of this._remotePresences) {
      if (now - presence.lastUpdated > maxAgeMs) {
        this._remotePresences.delete(userId);
        changed = true;
      }
    }

    if (changed) {
      this.emitNormalizedChange();
    }
  }

  public destroy(): void {
    this._remotePresences.clear();
    this.removeAllListeners();
  }
}
