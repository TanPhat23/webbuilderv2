import { EventEmitter } from "events";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type {
  UserInfo,
  MousePosition,
  AwarenessState,
} from "@/interfaces/yjs-v2.interface";

/**
 * Manages user presence, mouse positions, and awareness state in the YJS environment.
 * This class encapsulates the logic for broadcasting local user activity and
 * processing remote user activity.
 */
export class AwarenessController extends EventEmitter {
  public readonly awareness: Awareness;
  private lastSentSelectedElement: string | null = null;
  private lastAwarenessChangeTime = 0;
  private readonly awarenessThrottleMs = 100;

  constructor(
    doc: Y.Doc,
    private userId: string,
  ) {
    super();
    this.awareness = this.initializeAwareness(doc);
    this.setupAwarenessState();
    this.awareness.on("change", this.handleAwarenessChange);
  }

  /**
   * Initializes the awareness instance, reusing an existing one if present on the doc.
   */
  private initializeAwareness(doc: Y.Doc): Awareness {
    const existingAwareness = (doc as any).awareness;
    if (existingAwareness) return existingAwareness;

    const newAwareness = new Awareness(doc);
    (doc as any).awareness = newAwareness;
    return newAwareness;
  }

  /**
   * Sets initial local state for the user.
   */
  private setupAwarenessState(): void {
    try {
      this.awareness.setLocalState({
        user: {
          userId: this.userId,
          userName: this.userId,
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

  /**
   * Updates the local user's cursor position and broadcasts to the network.
   */
  public updateLocalCursor(position: MousePosition): void {
    try {
      const state = this.awareness.getLocalState() as AwarenessState;
      this.awareness.setLocalStateField("cursor", position);
    } catch (err) {
      console.error(
        "[AwarenessController] Failed to update local cursor:",
        err,
      );
    }
  }

  /**
   * Updates the local user's selected element and broadcasts to the network.
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
   * Returns all current awareness states.
   */
  public getStates(): Map<number, AwarenessState> {
    return this.awareness.getStates() as Map<number, AwarenessState>;
  }

  /**
   * Internal handler for awareness changes (added, updated, removed).
   * Emits throttled 'change' events.
   */
  private handleAwarenessChange = (): void => {
    const now = Date.now();
    if (now - this.lastAwarenessChangeTime < this.awarenessThrottleMs) {
      return;
    }
    this.lastAwarenessChangeTime = now;

    // Process states and emit normalized data
    const states = this.getStates();
    const remoteUsers: Record<string, MousePosition> = {};
    const selectedByUser: Record<string, string | null> = {};
    const users: Record<string, UserInfo> = {};

    states.forEach((state, clientId) => {
      if (!state) return;

      const clientIdStr = clientId.toString();

      if (state.user) {
        // Map awareness user to UserInfo interface, ensuring all required fields are present
        const u = state.user as any;
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
  };

  /**
   * Generates a stable color for a user based on their ID.
   */
  private generateUserColor(userId: string): string {
    const hash = Array.from(userId).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0,
    );
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    this.awareness.off("change", this.handleAwarenessChange);
    this.removeAllListeners();
  }
}
