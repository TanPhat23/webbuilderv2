import { EventEmitter } from "./EventEmitter";
import type {
  UserInfo,
  MousePosition,
  PresenceBroadcastPayload,
  RemotePresence,
} from "@/features/collaboration";

/**
 * Tracks presence (cursor + selection) for the current page.
 *
 * Presence is ephemeral and travels as plain `presence` messages over the
 * WebSocket, so no CRDT state is involved:
 *   1. **Local state**: the current user's cursor and selection, read by the
 *      Provider when it builds outgoing `presence` envelopes.
 *   2. **Remote state**: incoming `presence` broadcasts and `sync` user lists,
 *      exposed as a RemotePresence map and a normalized `change` event.
 *
 * The WebSocket sending itself is done by the Provider.
 */
export class AwarenessController extends EventEmitter {
  /** Tracks remote users' presence keyed by userId */
  private readonly _remotePresences = new Map<string, RemotePresence>();

  private localCursor: MousePosition | null = null;
  private localSelectedElement: string | null = null;

  constructor(
    private readonly userId: string,
    private readonly userName: string = userId,
  ) {
    super();
  }

  // ==========================================================================
  // Local State Updates (written by the Provider before sending `presence`)
  // ==========================================================================

  public updateLocalCursor(position: MousePosition): void {
    this.localCursor = position;
  }

  public updateLocalSelection(elementId: string | null): void {
    this.localSelectedElement = elementId;
  }

  public getLocalCursor(): MousePosition | null {
    return this.localCursor;
  }

  public getLocalSelectedElement(): string | null {
    return this.localSelectedElement;
  }

  // ==========================================================================
  // Remote Presence (incoming `presence` broadcasts from server)
  // ==========================================================================

  /**
   * Processes an incoming `presence` broadcast from another user.
   * Updates both the internal RemotePresence map and emits a `change` event
   * so the mouse store gets updated.
   *
   * @see WebSocket API Reference — Section 4: Broadcasted Operations
   */
  public handleRemotePresence(data: PresenceBroadcastPayload): void {
    if (data.userId === this.userId) return; // Ignore own echoes

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

  /**
   * Initializes remote presences from a `sync` response's user list.
   * Replaces all existing remote presence data.
   *
   * @see WebSocket API Reference — Section 4: Initial State Sync
   */
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

  /**
   * Removes a disconnected user's presence data.
   */
  public removeUser(userId: string): void {
    if (this._remotePresences.delete(userId)) {
      this.emitNormalizedChange();
    }
  }

  /**
   * Returns a snapshot of all remote presences.
   */
  public get remotePresences(): Map<string, RemotePresence> {
    return new Map(this._remotePresences);
  }

  // ==========================================================================
  // Change notification
  // ==========================================================================

  /**
   * Extracts normalized data from the remote presences map and emits a
   * `change` event.
   *
   * The emitted data shape is compatible with the mouse store setters:
   *   - `remoteUsers`   — Record<string, MousePosition>
   *   - `selectedByUser` — Record<string, string | null>
   *   - `users`          — Record<string, UserInfo>
   */
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

  // ==========================================================================
  // Stale Presence Pruning
  // ==========================================================================

  /**
   * Remove presences older than `maxAgeMs`.
   * Call this periodically (e.g. every 60s) to clean up disconnected users
   * whose disconnect message may have been missed.
   */
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

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Clears remote presences and removes all event listeners.
   */
  public destroy(): void {
    this._remotePresences.clear();
    this.removeAllListeners();
  }
}
