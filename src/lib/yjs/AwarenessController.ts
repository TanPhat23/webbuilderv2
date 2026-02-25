import { EventEmitter } from "events";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type {
  UserInfo,
  MousePosition,
  AwarenessState,
  PresenceBroadcastPayload,
  RemotePresence,
} from "@/interfaces/websocket";

/**
 * Bridges Yjs Awareness with the new WebSocket presence protocol.
 *
 * This controller manages two concerns:
 *   1. **Local state** — Keeps the Yjs Awareness instance updated with the
 *      current user's cursor position and element selection so that the
 *      Provider can read it and send `presence` envelope messages.
 *   2. **Remote state** — Receives incoming `presence` broadcasts from the
 *      server and updates both the Awareness instance and an internal
 *      RemotePresence map so the UI can render remote cursors.
 *
 * The actual WebSocket sending is NOT done here — the Provider reads local
 * state from this controller and creates the envelope messages itself.
 *
 * @see WebSocket API Reference — Section 3: Presence (Cursor/Selection)
 */
export class AwarenessController extends EventEmitter {
  public readonly awareness: Awareness;

  /** Tracks remote users' presence keyed by userId */
  private readonly _remotePresences = new Map<string, RemotePresence>();

  private lastSentSelectedElement: string | null = null;
  private lastAwarenessChangeTime = 0;
  private readonly awarenessThrottleMs = 100;

  constructor(
    doc: Y.Doc,
    private readonly userId: string,
    private readonly userName: string = userId,
  ) {
    super();
    this.awareness = this.initializeAwareness(doc);
    this.setupAwarenessState();
    this.awareness.on("change", this.handleAwarenessChange);
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initializes the Awareness instance, reusing one already attached to
   * the Y.Doc if present.
   */
  private initializeAwareness(doc: Y.Doc): Awareness {
    const existing = (doc as any).awareness;
    if (existing) return existing;

    const newAwareness = new Awareness(doc);
    (doc as any).awareness = newAwareness;
    return newAwareness;
  }

  /**
   * Sets the initial local state for the current user.
   */
  private setupAwarenessState(): void {
    try {
      this.awareness.setLocalState({
        user: {
          userId: this.userId,
          userName: this.userName,
          email: "",
          color: this.generateUserColor(this.userId),
        },
        cursor: { x: 0, y: 0 },
        selectedElement: null,
      });
      this.lastSentSelectedElement = null;
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to setup awareness state:",
        err,
      );
    }
  }

  // ==========================================================================
  // Local State Updates (written by the Provider before sending `presence`)
  // ==========================================================================

  /**
   * Updates the local user's cursor position in the Awareness instance.
   * The Provider reads this to build the `presence` envelope payload.
   */
  public updateLocalCursor(position: MousePosition): void {
    try {
      this.awareness.setLocalStateField("cursor", position);
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to update local cursor:",
        err,
      );
    }
  }

  /**
   * Updates the local user's selected element in the Awareness instance.
   * Skips the update if the value hasn't changed.
   */
  public updateLocalSelection(elementId: string | null): void {
    try {
      if (this.lastSentSelectedElement === elementId) return;

      this.awareness.setLocalStateField("selectedElement", elementId);
      this.lastSentSelectedElement = elementId;
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to update local selection:",
        err,
      );
    }
  }

  /**
   * Returns the current local cursor position from Awareness.
   * Used by the Provider to build presence payloads.
   */
  public getLocalCursor(): MousePosition | null {
    try {
      const state = this.awareness.getLocalState() as AwarenessState | null;
      return state?.cursor ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Returns the current local selected element from Awareness.
   */
  public getLocalSelectedElement(): string | null {
    try {
      const state = this.awareness.getLocalState() as AwarenessState | null;
      return state?.selectedElement ?? null;
    } catch {
      return null;
    }
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
  // Awareness Event Handling
  // ==========================================================================

  /**
   * Returns all current Awareness states.
   */
  public getStates(): Map<number, AwarenessState> {
    return this.awareness.getStates() as Map<number, AwarenessState>;
  }

  /**
   * Internal handler for Yjs Awareness changes.
   * Throttled to avoid excessive re-renders. Emits a normalized `change`
   * event that the Provider and mouse store can consume.
   */
  private handleAwarenessChange = (): void => {
    const now = Date.now();
    if (now - this.lastAwarenessChangeTime < this.awarenessThrottleMs) {
      return;
    }
    this.lastAwarenessChangeTime = now;

    this.emitNormalizedChange();
  };

  /**
   * Extracts normalized data from both the Awareness states and the
   * internal remote presences map, then emits a `change` event.
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

    // 1. Pull data from the internal remote presences (sourced from WS broadcasts)
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

    // 2. Also pull from Awareness states for any data not covered above
    //    (e.g., local state, or if some peer is using Awareness directly)
    const states = this.getStates();
    states.forEach((state, clientId) => {
      if (!state) return;
      const clientIdStr = clientId.toString();

      // Skip if we already have this user from WS presences
      if (this._remotePresences.has(clientIdStr)) return;

      if (state.user) {
        const u = state.user;
        users[clientIdStr] = {
          userId: u.userId || clientIdStr,
          userName: u.userName || u.name || "Unknown",
          email: u.email || "",
        };
      }

      if (state.cursor) {
        remoteUsers[clientIdStr] = state.cursor;
      }

      if (state.selectedElement !== undefined) {
        selectedByUser[clientIdStr] = state.selectedElement;
      }
    });

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
  // Utility
  // ==========================================================================

  /**
   * Generates a stable HSL color for a user based on their ID string.
   */
  private generateUserColor(userId: string): string {
    const hash = Array.from(userId).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0,
    );
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Cleans up all resources: removes Awareness listener, clears remote
   * presences, and removes all event listeners.
   */
  public destroy(): void {
    this.awareness.off("change", this.handleAwarenessChange);
    this._remotePresences.clear();
    this.removeAllListeners();
  }
}
