import * as Y from "yjs";
import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import { MessageSender } from "./MessageSender";
import { DocumentSyncer } from "./DocumentSyncer";
import { AwarenessController } from "./AwarenessController";
import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/interfaces/page.interface";
import type {
  ElementOperationResult,
  PageOperationResult,
  V2Message,
  YjsProviderV2Options,
  UserInfo,
  UpdateType,
  StatusListener,
  SyncedListener,
  EventType,
  ConflictMessage,
  ErrorMessage,
  WSEnvelope,
  SyncResponsePayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
  ErrorPayload,
  PresenceBroadcastPayload,
  RemotePresence,
  ElementCreatePayload,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
  CustomYjsProviderV2 as ICustomYjsProviderV2,
} from "@/interfaces/websocket";
import { Awareness } from "y-protocols/awareness";

/**
 * CustomYjsProviderV2 — Facade that aggregates specialized components to
 * implement the new WebSocket collaboration protocol while keeping Y.Doc
 * as a local cache layer.
 *
 * Architecture:
 *   - ConnectionManager:    WebSocket lifecycle, reconnection with backoff+jitter
 *   - MessageDispatcher:    Envelope creation, request/response tracking, rate limiting
 *   - DocumentSyncer:       Y.Doc structural updates from server broadcasts
 *   - AwarenessController:  User presence (cursor/selection) via WS messages
 *
 * Protocol flow:
 *   1. Connect to `ws://<host>/ws/:project?token=<jwt>`
 *   2. ConnectionManager auto-sends `join` with the target pageId
 *   3. Server responds with `sync` containing full page state
 *   4. Client sends/receives element operations and presence updates
 *
 * All messages use the standard envelope format:
 *   { type, projectId, pageId, userId, requestId, timestamp, payload }
 *
 * @see WebSocket API Reference
 */
export class CustomYjsProviderV2 implements ICustomYjsProviderV2 {
  // Public YJS-compatible properties
  public readonly doc: Y.Doc;
  public readonly awareness: Awareness;

  // State
  public connected = false;
  public isSynced = false;

  // Components
  private connection: ConnectionManager;
  private dispatcher: MessageDispatcher;
  private sender: MessageSender;
  private syncer: DocumentSyncer;
  private awarenessController: AwarenessController;

  // Config
  private readonly projectId: string;
  private readonly pageId: string;
  private readonly userId: string;
  private readonly userName: string;

  // Callbacks
  private readonly onSyncUsers?: (users: Record<string, UserInfo>) => void;
  private readonly onConflict?: (conflict: ConflictMessage) => void;
  private readonly onError?: (error: ErrorMessage) => void;
  private readonly onPresence?: (data: PresenceBroadcastPayload) => void;

  // Event listeners
  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();

  // Stale presence pruning interval
  private pruneInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: YjsProviderV2Options) {
    this.doc = options.doc;
    this.projectId = options.projectId;
    this.pageId = options.pageId;
    this.userId = options.userId;
    this.userName = options.userName ?? options.userId;
    this.onSyncUsers = options.onSyncUsers;
    this.onConflict = options.onConflict;
    this.onError = options.onError;
    this.onPresence = options.onPresence;

    // Initialize specialized components
    this.connection = new ConnectionManager({
      url: options.url,
      projectId: options.projectId,
      pageId: options.pageId,
      getToken: options.getToken,
    });

    this.dispatcher = new MessageDispatcher();
    this.sender = new MessageSender(this.connection, this.dispatcher);
    this.syncer = new DocumentSyncer(this.doc, options.pageId);
    this.awarenessController = new AwarenessController(
      this.doc,
      this.userId,
      this.userName,
    );
    this.awareness = this.awarenessController.awareness;

    this.setupEventForwarding();

    // Start connection
    void this.connection.connect();

    // Periodically prune stale presences (every 60s)
    this.pruneInterval = setInterval(() => {
      this.awarenessController.pruneStale();
    }, 60_000);
  }

  // ==========================================================================
  // Event Wiring
  // ==========================================================================

  /**
   * Orchestrates events between components and exposes a unified interface.
   */
  private setupEventForwarding(): void {
    // ---- Connection events ----

    this.connection.on("open", () => {
      this.connected = true;
      this.emitStatus("connected");
    });

    this.connection.on("close", () => {
      this.connected = false;
      this.isSynced = false;
      this.emitStatus("disconnected");
    });

    this.connection.on("error", (err: Error) => {
      this.emitStatus("error");
      this.onError?.({
        type: "error",
        message: err.message || "WebSocket error",
        code: "PROCESS_ERROR",
      });
    });

    this.connection.on("message", (data: string) => {
      try {
        const envelope = JSON.parse(data) as WSEnvelope<unknown>;
        this.handleMessage(envelope);
      } catch (err) {
        console.error("[CustomYjsProviderV2] Failed to parse message:", err);
      }
    });

    // ---- Awareness events → sync to mouse store ----

    this.awarenessController.on("change", (data) => {
      if (this.onSyncUsers) {
        this.onSyncUsers(data.users);
      }
    });
  }

  // ==========================================================================
  // Incoming Message Router
  // ==========================================================================

  /**
   * Routes incoming WebSocket messages (in envelope format) to the
   * appropriate component handler.
   *
   * Message types handled:
   *   - `sync`           → Full state replacement via DocumentSyncer
   *   - `element:create`  → Insert element via DocumentSyncer
   *   - `element:update`  → Patch element via DocumentSyncer
   *   - `element:move`    → Reparent/reorder via DocumentSyncer
   *   - `element:delete`  → Remove element via DocumentSyncer
   *   - `presence`        → Update remote cursors via AwarenessController
   *   - `error`           → Error handling and pending request rejection
   */
  private handleMessage(envelope: WSEnvelope<unknown>): void {
    // 1. If the message has a requestId, try to resolve a pending request
    if (envelope.requestId) {
      const isSuccess = envelope.type !== "error";
      const wasResolved = this.dispatcher.resolvePendingRequest(
        envelope.requestId,
        isSuccess,
        this.envelopeToOperationResult(envelope),
      );
      // For error messages that resolved a pending request, we're done
      if (wasResolved && !isSuccess) return;
    }

    // 2. Route by message type
    switch (envelope.type) {
      case "sync:page": {
        const payload = envelope.payload as SyncResponsePayload;
        this.syncer.applySyncPayload(payload);
        this.awarenessController.handleSyncUsers(payload.users);
        this.isSynced = true;
        this.emitSynced(true);
        break;
      }

      case "element:create": {
        const payload = envelope.payload as ElementCreateBroadcastPayload;
        this.syncer.handleElementCreate(payload);
        break;
      }

      case "element:update": {
        const payload = envelope.payload as ElementUpdateBroadcastPayload;
        this.syncer.handleElementUpdate(payload);
        break;
      }

      case "element:move": {
        const payload = envelope.payload as ElementMoveBroadcastPayload;
        this.syncer.handleElementMove(payload);
        break;
      }

      case "element:delete": {
        const payload = envelope.payload as ElementDeleteBroadcastPayload;
        this.syncer.handleElementDelete(payload);
        break;
      }

      case "presence": {
        const payload = envelope.payload as PresenceBroadcastPayload;
        this.awarenessController.handleRemotePresence(payload);
        this.onPresence?.(payload);
        break;
      }

      case "error": {
        const payload = envelope.payload as ErrorPayload;
        this.onError?.({
          type: "error",
          message: payload.message,
          code: payload.code,
          requestId: envelope.requestId,
        });
        break;
      }
    }
  }

  /**
   * Converts an incoming envelope into an ElementOperationResult shape
   * so that pending request promises resolve with a consistent type.
   */
  private envelopeToOperationResult(
    envelope: WSEnvelope<unknown>,
  ): ElementOperationResult {
    switch (envelope.type) {
      case "element:create": {
        const payload = envelope.payload as ElementCreateBroadcastPayload;
        return {
          operationType: "create",
          element: payload.element as unknown as EditorElement,
          requestId: envelope.requestId,
        };
      }
      case "element:update": {
        const payload = envelope.payload as ElementUpdateBroadcastPayload;
        return {
          operationType: "update",
          elementId: payload.id,
          requestId: envelope.requestId,
        };
      }
      case "element:move": {
        const payload = envelope.payload as ElementMoveBroadcastPayload;
        return {
          operationType: "move",
          elementId: payload.id,
          parentId: payload.parentId,
          order: payload.order,
          requestId: envelope.requestId,
        };
      }
      case "element:delete": {
        const payload = envelope.payload as ElementDeleteBroadcastPayload;
        return {
          operationType: "delete",
          deletedElementId: payload.id,
          requestId: envelope.requestId,
        };
      }
      default:
        return {
          operationType: "update",
          requestId: envelope.requestId,
        };
    }
  }

  // ==========================================================================
  // Element Operations (Async API)
  //
  // Each method:
  //   1. Creates a standard envelope with a unique requestId
  //   2. Registers a pending request promise
  //   3. Sends the envelope (or queues it if offline)
  //   4. Returns the promise that resolves when the server responds
  // ==========================================================================

  public async createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();

    const envelope = this.dispatcher.createEnvelope<ElementCreatePayload>(
      "element:create",
      this.projectId,
      this.pageId,
      {
        element: {
          type: element.type,
          settings: (element.settings as Record<string, unknown>) ?? null,
          styles: (element.styles as Record<string, unknown>) ?? null,
          order: position ?? element.order ?? 0,
          parentId: parentId ?? element.parentId ?? null,
          // Pass through additional fields
          ...(element.content !== undefined
            ? { content: element.content }
            : {}),
          ...(element.name !== undefined ? { name: element.name } : {}),
          ...(element.id !== undefined ? { id: element.id } : {}),
        },
      },
      { userId: this.userId, requestId },
    );

    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  public async updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    _updateType: UpdateType = "partial",
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();

    const envelope = this.dispatcher.createEnvelope<ElementUpdatePayload>(
      "element:update",
      this.projectId,
      this.pageId,
      {
        id: elementId,
        ...(updates.settings !== undefined
          ? { settings: updates.settings as Record<string, unknown> }
          : {}),
        ...(updates.styles !== undefined
          ? { styles: updates.styles as Record<string, unknown> }
          : {}),
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.order !== undefined ? { order: updates.order } : {}),
      },
      { userId: this.userId, requestId },
    );

    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  public async deleteElement(
    elementId: string,
    _deleteChildren = false,
    _preserveStructure = true,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();

    const envelope = this.dispatcher.createEnvelope<ElementDeletePayload>(
      "element:delete",
      this.projectId,
      this.pageId,
      { id: elementId },
      { userId: this.userId, requestId },
    );

    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  public async moveElement(
    elementId: string,
    newParentId: string | null = null,
    newPosition?: number,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();

    const envelope = this.dispatcher.createEnvelope<ElementMovePayload>(
      "element:move",
      this.projectId,
      this.pageId,
      {
        id: elementId,
        parentId: newParentId,
        order: newPosition ?? 0,
      },
      { userId: this.userId, requestId },
    );

    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  // ==========================================================================
  // Page Operations (Async API)
  //
  // Note: Page operations are NOT part of the current WebSocket API spec.
  // These are kept as placeholders that log a warning. In production, page
  // CRUD should be handled via REST API endpoints.
  // ==========================================================================

  public async createPage(_page: Page): Promise<PageOperationResult> {
    console.warn(
      "[CustomYjsProviderV2] createPage via WebSocket not yet implemented — use REST API",
    );
    return {
      operationType: "create",
      page: _page,
    };
  }

  public async updatePage(
    pageId: string,
    _updates: Partial<Page>,
  ): Promise<PageOperationResult> {
    console.warn(
      "[CustomYjsProviderV2] updatePage via WebSocket not yet implemented — use REST API",
    );
    return {
      operationType: "update",
      pageId,
    };
  }

  public async deletePage(pageId: string): Promise<PageOperationResult> {
    console.warn(
      "[CustomYjsProviderV2] deletePage via WebSocket not yet implemented — use REST API",
    );
    return {
      operationType: "delete",
      deletedPageId: pageId,
    };
  }

  // ==========================================================================
  // Presence
  // ==========================================================================

  /**
   * Sends a `presence` envelope message with the current user's cursor
   * position and selected element.
   *
   * This is called by the collaboration provider's mouse tracking effect
   * and by the AwarenessController when the local state changes.
   */
  public sendPresence(
    cursorX: number,
    cursorY: number,
    elementId?: string | null,
  ): void {
    this.awarenessController.updateLocalCursor({ x: cursorX, y: cursorY });

    if (elementId !== undefined) {
      this.awarenessController.updateLocalSelection(elementId);
    }

    const envelope = this.dispatcher.createEnvelope(
      "presence",
      this.projectId,
      this.pageId,
      {
        userId: this.userId,
        userName: this.userName,
        cursorX,
        cursorY,
        elementId:
          elementId ?? this.awarenessController.getLocalSelectedElement(),
      } satisfies import("@/interfaces/websocket").PresencePayload,
      { userId: this.userId },
    );

    // Presence is fire-and-forget — no requestId tracking
    this.sendOrQueue(envelope);
  }

  /**
   * Requests a full state sync from the server.
   * The server will respond with a `sync` message containing the
   * authoritative page state.
   */
  public requestSync(): void {
    const envelope = this.dispatcher.createEnvelope(
      "sync:page",
      this.projectId,
      this.pageId,
      {},
      { userId: this.userId },
    );
    this.sendOrQueue(envelope);
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  /**
   * Sends an envelope as a tracked request with rate limiting.
   * Returns a promise that resolves when the server responds with a
   * matching requestId.
   */
  private async sendRequest<T>(
    envelope: WSEnvelope<unknown>,
    requestId: string,
  ): Promise<T> {
    return this.sender.sendRequest<T>(envelope, requestId);
  }

  /**
   * Sends the envelope immediately if connected, otherwise queues it
   * for later delivery.
   */
  private sendOrQueue(envelope: WSEnvelope<unknown>): void {
    this.sender.sendOrQueue(envelope);
  }

  private emitStatus(status: string): void {
    const data = { status };
    this.statusListeners.forEach((listener) => listener(data));
  }

  private emitSynced(synced: boolean): void {
    this.syncedListeners.forEach((listener) => listener(synced));
  }

  // ==========================================================================
  // Public Interface (Event Subscription & Control)
  // ==========================================================================

  public on(event: EventType, callback: StatusListener | SyncedListener): void {
    if (event === "status") {
      this.statusListeners.add(callback as StatusListener);
      // Immediately emit current status for late subscribers
      const currentStatus = this.connected ? "connected" : "connecting";
      (callback as StatusListener)({ status: currentStatus });
    } else if (event === "synced") {
      this.syncedListeners.add(callback as SyncedListener);
    }
  }

  public off(
    event: EventType,
    callback: StatusListener | SyncedListener,
  ): void {
    if (event === "status") {
      this.statusListeners.delete(callback as StatusListener);
    } else if (event === "synced") {
      this.syncedListeners.delete(callback as SyncedListener);
    }
  }

  /**
   * Number of pending (unresolved) requests currently tracked by the dispatcher.
   * Exposed primarily for UI/diagnostics (mirrors previous `pendingUpdates` usage).
   */
  public get pendingUpdates(): number {
    return this.dispatcher.pendingCount;
  }

  /**
   * Subscribe to normalized presence changes emitted by the internal AwarenessController.
   * The callback receives a Map keyed by userId containing `RemotePresence` entries.
   * Returns an unsubscribe function.
   */
  public onPresenceChange(
    callback: (presences: Map<string, RemotePresence>) => void,
  ): () => void {
    // Immediately emit current snapshot if available
    try {
      callback(this.awarenessController.remotePresences);
    } catch (err) {
      // Do not let subscriber errors bubble up and crash the provider
      // but log for visibility
      // eslint-disable-next-line no-console
      console.error(
        "[CustomYjsProviderV2] onPresenceChange callback error:",
        err,
      );
    }

    const handler = () => {
      try {
        callback(this.awarenessController.remotePresences);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          "[CustomYjsProviderV2] onPresenceChange callback error:",
          err,
        );
      }
    };

    // Listen to internal normalized presence change events
    this.awarenessController.on("change", handler);

    return () => {
      this.awarenessController.off("change", handler);
    };
  }

  public async reconnect(): Promise<void> {
    this.connection.disconnect();
    this.isSynced = false;
    await this.connection.connect();
  }

  public disconnect(): void {
    this.connection.disconnect();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public destroy(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
    this.connection.destroy();
    this.sender.destroy();
    this.dispatcher.destroy();
    this.awarenessController.destroy();
    this.statusListeners.clear();
    this.syncedListeners.clear();
  }
}
