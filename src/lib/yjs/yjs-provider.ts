import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import {
  WebSocketMessage,
  SendMessagePayload,
} from "@/interfaces/realtime.interface";
import { EditorElement } from "@/types/global.type";

export interface YjsProviderOptions {
  url: string;
  roomId: string;
  userId: string;
  projectId?: string;
  getToken?: () => Promise<string | null>;
  doc: Y.Doc;
  onSyncUsers?: (users: Record<string, any>) => void;
}

/**
 * Custom Yjs provider for online-only operation via WebSocket.
 * Handles real-time collaboration with mouse tracking and element selection sync.
 */
export class CustomYjsProvider {
  public doc: Y.Doc;
  public awareness: any;
  public ws: WebSocket | null = null;
  public connected = false;
  public synched = false;

  private url: string;
  private roomId: string;
  private userId: string;
  private projectId?: string;
  private getToken?: () => Promise<string | null>;
  private messageQueue: SendMessagePayload[] = [];
  private onSyncUsers?: (users: Record<string, any>) => void;

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectInterval = 3000;

  private statusListeners: Set<(data: any) => void> = new Set();
  private syncedListeners: Set<(synced: boolean) => void> = new Set();

  private docUpdateHandler: ((update: Uint8Array, origin: any) => void) | null =
    null;
  private awarenessChangeHandler: ((changes: any) => void) | null = null;

  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private lastTokenRefreshTime = 0;
  private tokenRefreshIntervalMs = 4 * 60 * 1000;

  private initialSyncReceived = false;
  private isDestroying = false;
  private syncTimeoutId: NodeJS.Timeout | null = null;
  private lastAwarenessChangeTime = 0;
  private awarenessThrottleMs = 100;

  constructor({
    url,
    roomId,
    userId,
    projectId,
    getToken,
    doc,
    onSyncUsers,
  }: YjsProviderOptions) {
    this.url = url;
    this.roomId = roomId;
    this.userId = userId;
    this.projectId = projectId;
    this.getToken = getToken;
    this.doc = doc;
    this.onSyncUsers = onSyncUsers;

    // Get or create awareness instance
    this.awareness = (doc as any).awareness;
    if (!this.awareness) {
      this.awareness = new Awareness(doc);
      (doc as any).awareness = this.awareness;
    }

    this.docUpdateHandler = this.handleDocUpdate.bind(this);
    this.awarenessChangeHandler = this.handleAwarenessChange.bind(this);

    this.doc.on("update", this.docUpdateHandler);

    if (this.awareness) {
      try {
        this.awareness.setLocalState({
          user: { name: userId, color: this.getUserColor(userId) },
          cursor: { x: 0, y: 0 },
          selectedElement: null,
          remoteUsers: {},
          selectedByUser: {},
          users: {},
        });
      } catch (err) {
        console.warn(
          "[YjsProvider] Failed to initialize awareness state:",
          err,
        );
      }
      this.awareness.on("change", this.awarenessChangeHandler);
    }

    this.connect();
  }

  private async connect() {
    if (this.isDestroying || this.connected) return;

    try {
      if (!this.roomId || this.roomId === "undefined" || this.roomId === "") {
        console.error("[YjsProvider] Invalid roomId for WebSocket connection.");
        this.emitStatus("error");
        return;
      }

      const token = await this.getToken?.();
      if (!token) {
        console.error(
          "[YjsProvider] No token available for WebSocket connection",
        );
        this.emitStatus("error");
        this.scheduleReconnect(3000);
        return;
      }

      const wsUrl = `${this.url}/ws/${this.roomId}?token=${encodeURIComponent(token)}${
        this.projectId ? `&projectId=${encodeURIComponent(this.projectId)}` : ""
      }`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.isDestroying) {
          this.ws?.close();
          return;
        }

        this.connected = true;
        this.lastTokenRefreshTime = Date.now();
        this.initialSyncReceived = false;

        this.emitStatus("connected");

        if (this.syncTimeoutId) clearTimeout(this.syncTimeoutId);
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.syncTimeoutId = setTimeout(() => {
          if (!this.initialSyncReceived && !this.isDestroying) {
            console.warn(
              "[YjsProvider] ⚠️ Initial sync timeout. Server did not respond with data.",
            );
            this.initialSyncReceived = true;
            this.synched = true;
            this.emitSynced(true);
          }
        }, 2000);

        this.setupTokenRefresh();

        // Request initial sync from server

        this.send({ type: "sync", elements: [] });

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) this.send(message);
        }
      };

      this.ws.onmessage = (event) => {
        if (this.isDestroying) return;
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(data);
        } catch (err) {
          console.error("[YjsProvider] Failed to parse message:", err);
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        if (this.isDestroying) return;

        console.warn(
          `[YjsProvider] WebSocket closed (Code: ${event.code}, Clean: ${event.wasClean}).`,
        );

        this.connected = false;
        this.synched = false;

        this.emitStatus("disconnected");

        if (this.syncTimeoutId) clearTimeout(this.syncTimeoutId);
        if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);

        this.scheduleReconnect(this.reconnectInterval);
      };

      this.ws.onerror = (error) => {
        if (this.isDestroying) return;

        const errorMsg =
          error instanceof Event ? "WebSocket connection error" : String(error);
        console.error("[YjsProvider] ❌ WebSocket error:", errorMsg);

        this.emitStatus("error");

        if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);
      };
    } catch (err) {
      if (this.isDestroying) return;
      console.error("[YjsProvider] Connection attempt failed:", err);
      this.scheduleReconnect(this.reconnectInterval);
    }
  }

  private setupTokenRefresh() {
    if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);

    this.tokenRefreshInterval = setInterval(() => {
      if (this.isDestroying || !this.connected) return;

      const timeSinceLastRefresh = Date.now() - this.lastTokenRefreshTime;
      if (timeSinceLastRefresh > this.tokenRefreshIntervalMs) {
        this.disconnect(true);
        this.connect();
      }
    }, 25000);
  }

  private scheduleReconnect(delay: number) {
    if (this.isDestroying) return;

    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isDestroying) {
        this.connect();
      }
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    if (message.type === "sync") {
      this.handleSyncMessage(message);
    } else if (message.type === "update") {
      console.log("[YjsProvider] 📨 Routing update message to handler");
      this.handleUpdateMessage(message);
    } else if (message.type === "currentState") {
      this.handleCurrentStateMessage(message);
    } else if (message.type === "mouseMove") {
      this.handleMouseMoveMessage(message);
    } else if (message.type === "userDisconnect") {
      this.handleUserDisconnectMessage(message);
    } else if (message.type === "error") {
      console.error(
        "[YjsProvider] ❌ Server error message:",
        (message as any).error,
      );
      this.emitStatus("error");
    } else {
      console.warn(
        "[YjsProvider] Unknown message type:",
        (message as any).type,
      );
    }
  }

  private handleSyncMessage(message: WebSocketMessage) {
    const syncMessage = message as any;

    // Only process the first sync message
    if (this.initialSyncReceived) {
      return;
    }

    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = null;
    }

    if (
      "elements" in syncMessage &&
      syncMessage.elements &&
      syncMessage.elements.length > 0
    ) {
      try {
        Y.transact(
          this.doc,
          () => {
            const yElementsText = this.doc.getText("elementsJson");
            yElementsText.delete(0, yElementsText.length);
            yElementsText.insert(0, JSON.stringify(syncMessage.elements));
          },
          "sync",
        );
      } catch (err) {
        console.error("[YjsProvider] Error applying sync elements:", err);
      }
    } else {
      console.warn("[YjsProvider] ⚠️ Sync message has no elements or empty");
    }

    this.initialSyncReceived = true;
    this.synched = true;
    this.emitSynced(true);
  }

  private handleUpdateMessage(message: WebSocketMessage) {
    if ("elements" in message && message.elements) {
      console.log(
        "[YjsProvider] 📥 Received update message with",
        message.elements.length,
        "elements from remote user",
      );
      try {
        Y.transact(
          this.doc,
          () => {
            const yElementsText = this.doc.getText("elementsJson");
            yElementsText.delete(0, yElementsText.length);
            yElementsText.insert(0, JSON.stringify(message.elements));
          },
          "remote-update",
        );
        console.log(
          "[YjsProvider] ✅ Applied remote update with",
          message.elements.length,
          "elements",
        );
      } catch (err) {
        console.error("[YjsProvider] Error applying update elements:", err);
      }
    }
  }

  private handleCurrentStateMessage(message: WebSocketMessage) {
    if (!this.awareness) {
      console.warn(
        "[YjsProvider] ⚠️ Awareness not available, cannot update currentState",
      );
      console.warn(
        "[YjsProvider] Attempting to create awareness and sync users directly",
      );

      // Try to sync users directly even if awareness isn't available
      if (this.onSyncUsers && "users" in message && message.users) {
        console.log(
          "[YjsProvider] Syncing users via callback:",
          Object.keys(message.users).length,
          "users",
        );
        this.onSyncUsers(message.users);
      }
      return;
    }

    try {
      if (!this.awareness.getLocalState()) {
        this.awareness.setLocalState({
          user: { name: this.userId, color: this.getUserColor(this.userId) },
          cursor: { x: 0, y: 0 },
          selectedElement: null,
          remoteUsers: {},
          selectedByUser: {},
          users: {},
        });
      }

      // Update mouse positions from current state
      if ("mousePositions" in message && message.mousePositions) {
        const remoteUsers: any = {};
        Object.entries(message.mousePositions).forEach(
          ([userId, pos]: [string, any]) => {
            if (userId !== this.userId) {
              remoteUsers[userId] = {
                x: pos.X,
                y: pos.Y,
                cursor: { x: pos.X, y: pos.Y },
              };
            }
          },
        );
        if (Object.keys(remoteUsers).length > 0) {
          this.awareness.setLocalStateField("remoteUsers", remoteUsers);
        }
      }

      // Update selected elements
      if ("selectedElements" in message && message.selectedElements) {
        const selectedByUser: any = {};
        Object.entries(message.selectedElements).forEach(
          ([userId, elementId]: [string, any]) => {
            if (userId !== this.userId) {
              selectedByUser[userId] = elementId;
            }
          },
        );
        if (Object.keys(selectedByUser).length > 0) {
          this.awareness.setLocalStateField("selectedByUser", selectedByUser);
        }
      }

      // Update users info
      if ("users" in message && message.users) {
        this.awareness.setLocalStateField("users", message.users);

        // Explicitly sync to mousestore after updating users
        // This is critical for ensuring the UI sees the updated users list
        if (this.onSyncUsers) {
          this.onSyncUsers(message.users);
        }
      }
    } catch (err) {
      console.error("[YjsProvider] Error updating currentState:", err);
    }
  }

  private handleMouseMoveMessage(message: WebSocketMessage) {
    if (!this.awareness) {
      console.warn(
        "[YjsProvider] ⚠️ Awareness not available, cannot update mouse position",
      );
      return;
    }

    try {
      const userId = (message as any).userId;
      const x = (message as any).x;
      const y = (message as any).y;

      if (
        userId &&
        userId !== this.userId &&
        typeof x === "number" &&
        typeof y === "number"
      ) {
        const currentState = this.awareness.getLocalState() || {};
        const remoteUsers = currentState.remoteUsers || {};

        remoteUsers[userId] = { x, y };

        this.awareness.setLocalStateField("remoteUsers", remoteUsers);
      }
    } catch (err) {
      console.error("[YjsProvider] Error handling mouseMove message:", err);
    }
  }

  private handleElementSelectedMessage(message: WebSocketMessage) {
    if (!this.awareness) {
      console.warn(
        "[YjsProvider] ⚠️ Awareness not available, cannot update selection",
      );
      return;
    }

    try {
      const userId = (message as any).userId;
      const elementId = (message as any).elementId;

      if (userId && userId !== this.userId && elementId) {
        const currentState = this.awareness.getLocalState() || {};
        const selectedByUser = currentState.selectedByUser || {};

        selectedByUser[userId] = elementId;

        this.awareness.setLocalStateField("selectedByUser", selectedByUser);
      }
    } catch (err) {
      console.error(
        "[YjsProvider] Error handling elementSelected message:",
        err,
      );
    }
  }

  private handleUserDisconnectMessage(message: WebSocketMessage) {
    if (!this.awareness) {
      console.warn(
        "[YjsProvider] ⚠️ Awareness not available, cannot handle disconnect",
      );
      return;
    }

    try {
      const userId = (message as any).userId;

      if (userId && userId !== this.userId) {
        const currentState = this.awareness.getLocalState() || {};
        const remoteUsers = currentState.remoteUsers || {};
        const selectedByUser = currentState.selectedByUser || {};

        // Remove user's cursor position
        delete remoteUsers[userId];

        // Remove user's selection
        delete selectedByUser[userId];

        this.awareness.setLocalStateField("remoteUsers", remoteUsers);
        this.awareness.setLocalStateField("selectedByUser", selectedByUser);
      }
    } catch (err) {
      console.error(
        "[YjsProvider] Error handling userDisconnect message:",
        err,
      );
    }
  }

  private handleDocUpdate(update: Uint8Array, origin: any) {
    if (origin === this || origin === "sync" || origin === "remote-update") {
      return;
    }

    if (!this.synched) {
      console.warn(
        "[YjsProvider] ⚠️ Ignoring local update - waiting for initial sync from server",
      );
      return;
    }

    try {
      const yElementsText = this.doc.getText("elementsJson");
      const elementsJson = yElementsText.toString();
      const elements: EditorElement[] = elementsJson
        ? JSON.parse(elementsJson)
        : [];
      console.log(
        "[YjsProvider] Local doc update, elements length:",
        elements.length,
      );

      if (!elements || elements.length === 0) {
        console.log(
          "[YjsProvider] ⚠️ Skipping update with empty elements (length=0)",
        );
        return;
      }

      this.send({ type: "update", elements: elements });
    } catch (err) {
      console.error("[YjsProvider] Error sending doc update:", err);
    }
  }

  private handleAwarenessChange({ added, updated, removed }: any) {
    if (!this.awareness || this.isDestroying) return;

    // Throttle awareness updates for performance
    const now = Date.now();
    if (now - this.lastAwarenessChangeTime < this.awarenessThrottleMs) {
      return;
    }
    this.lastAwarenessChangeTime = now;

    try {
      const localState = this.awareness.getLocalState();
      if (!localState) return;

      // Mouse movement tracking removed
    } catch (err) {
      // Removed error logging for awareness changes
    }
  }

  public send(message: SendMessagePayload) {
    if (this.isDestroying) return;

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (err) {
        console.error("[YjsProvider] Error sending message:", err);
        this.messageQueue.push(message);
      }
    } else {
      this.messageQueue.push(message);
    }
  }

  public sendUpdate(elements: EditorElement[]) {
    if (!this.synched) {
      console.warn("[YjsProvider] Cannot send update - not synched yet");
      return;
    }

    if (!elements || elements.length === 0) {
      console.warn("[YjsProvider] Cannot send update - empty elements");
      return;
    }

    this.send({ type: "update", elements: elements });
  }

  private getUserColor(userId: string): string {
    const hue =
      userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  private emitStatus(status: string) {
    this.statusListeners.forEach((listener) => listener({ status }));
  }

  private emitSynced(synced: boolean) {
    this.syncedListeners.forEach((listener) => listener(synced));
  }

  public on(event: string, listener: (data: any) => void) {
    if (event === "status") {
      this.statusListeners.add(listener);
      const initialStatus = this.connected ? "connected" : "disconnected";

      listener({ status: initialStatus });
    } else if (event === "synced") {
      this.syncedListeners.add(listener);

      listener(this.synched);
    }
  }

  public off(event: string, listener: (data: any) => void) {
    if (event === "status") {
      this.statusListeners.delete(listener);
    } else if (event === "synced") {
      this.syncedListeners.delete(listener);
    }
  }

  public disconnect(preserveListeners = false) {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);
    if (this.syncTimeoutId) clearTimeout(this.syncTimeoutId);

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.synched = false;
    this.initialSyncReceived = false;
  }

  public destroy() {
    this.isDestroying = true;
    this.disconnect();

    if (this.docUpdateHandler) this.doc.off("update", this.docUpdateHandler);
    if (this.awareness && this.awarenessChangeHandler) {
      try {
        this.awareness.off("change", this.awarenessChangeHandler);
      } catch (err) {
        console.error("[YjsProvider] Error removing awareness listener:", err);
      }
    }

    this.statusListeners.clear();
    this.syncedListeners.clear();
  }
}
