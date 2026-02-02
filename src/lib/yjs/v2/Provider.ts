import * as Y from "yjs";
import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import { DocumentSyncer } from "./DocumentSyncer";
import { AwarenessController } from "./AwarenessController";
import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/interfaces/page.interface";
import type {
  ElementOperationRequest,
  ElementOperationSuccess,
  PageOperationRequest,
  PageOperationSuccess,
  V2Message,
  YjsProviderV2Options,
  UserInfo,
  UpdateType,
  StatusListener,
  SyncedListener,
  EventType,
  InitialSyncMessage,
  ConflictMessage,
  ErrorMessage,
  CustomYjsProviderV2 as ICustomYjsProviderV2,
} from "@/interfaces/yjs-v2.interface";
import { Awareness } from "y-protocols/awareness";

/**
 * Refactored CustomYjsProviderV2 using OOP patterns.
 * This class acts as a Facade, aggregating specialized components for:
 * - Connection: WebSocket lifecycle and reconnection (ConnectionManager)
 * - Messaging: Request/Response tracking and rate limiting (MessageDispatcher)
 * - Sync: Y.Doc structural updates (DocumentSyncer)
 * - Presence: Awareness and user status (AwarenessController)
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
  private syncer: DocumentSyncer;
  private awarenessController: AwarenessController;

  // Options & Listeners
  private readonly userId: string;
  private readonly onSyncUsers?: (users: Record<string, UserInfo>) => void;
  private readonly onConflict?: (conflict: ConflictMessage) => void;
  private readonly onError?: (error: ErrorMessage) => void;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();

  constructor(options: YjsProviderV2Options) {
    this.doc = options.doc;
    this.userId = options.userId;
    this.onSyncUsers = options.onSyncUsers;
    this.onConflict = options.onConflict;
    this.onError = options.onError;

    // Initialize specialized components
    this.connection = new ConnectionManager({
      url: options.url,
      pageId: options.pageId,
      projectId: options.projectId,
      getToken: options.getToken,
    });

    this.dispatcher = new MessageDispatcher();
    this.syncer = new DocumentSyncer(this.doc);
    this.awarenessController = new AwarenessController(this.doc, this.userId);
    this.awareness = this.awarenessController.awareness;

    this.setupEventForwarding();

    // Start connection
    void this.connection.connect();
  }

  /**
   * Orchestrates events between components and exposes a unified interface.
   */
  private setupEventForwarding(): void {
    // Connection events
    this.connection.on("open", () => {
      this.connected = true;
      this.emitStatus("connected");

      // Flush offline messages
      if (this.dispatcher.hasQueuedMessages()) {
        const queue = this.dispatcher.consumeQueue();
        queue.forEach((msg) => this.connection.send(JSON.stringify(msg)));
      }
    });

    this.connection.on("close", () => {
      this.connected = false;
      this.emitStatus("disconnected");
      this.dispatcher.rejectAllPendingRequests("Connection closed");
    });

    this.connection.on("error", (err: Error) => {
      this.emitStatus("error");
      this.onError?.({
        type: "error",
        message: err.message || "WebSocket error",
      });
    });

    this.connection.on("message", (data: any) => {
      try {
        const message = JSON.parse(data.toString()) as V2Message;
        this.handleMessage(message);
      } catch (err) {
        console.error("[CustomYjsProviderV2] Failed to parse message:", err);
      }
    });

    // Awareness events
    this.awarenessController.on("change", (data) => {
      if (this.onSyncUsers) {
        this.onSyncUsers(data.users);
      }
    });
  }

  /**
   * Routes incoming WebSocket messages to the appropriate component.
   */
  private handleMessage(message: V2Message): void {
    // 1. Resolve pending request promises if this is a response
    if (message.requestId) {
      const isSuccess = message.type !== "error";
      this.dispatcher.resolvePendingRequest(
        message.requestId,
        isSuccess,
        message,
      );
    }

    // 2. Process functional updates
    switch (message.type) {
      case "initialSync":
        this.syncer.applyInitialSync((message as InitialSyncMessage).elements);
        this.isSynced = true;
        this.emitSynced(true);
        break;

      case "elementOperationSuccess":
        this.syncer.handleElementOperation(message as ElementOperationSuccess);
        break;

      case "pageOperationSuccess":
        this.syncer.handlePageOperation(message as PageOperationSuccess);
        break;

      case "conflict":
        this.onConflict?.(message as ConflictMessage);
        break;

      case "error":
        this.onError?.(message as ErrorMessage);
        break;
    }
  }

  // ============================================================================
  // Element Operations (Async API)
  // ============================================================================

  public async createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<ElementOperationSuccess>({
      type: "elementOperation",
      operationType: "create",
      requestId,
      userId: this.userId,
      element,
      parentId,
      position,
    });
  }

  public async updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    updateType: UpdateType = "partial",
  ): Promise<ElementOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<ElementOperationSuccess>({
      type: "elementOperation",
      operationType: "update",
      requestId,
      userId: this.userId,
      elementId,
      updates,
      updateType,
    });
  }

  public async deleteElement(
    elementId: string,
    deleteChildren = false,
    preserveStructure = true,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<ElementOperationSuccess>({
      type: "elementOperation",
      operationType: "delete",
      requestId,
      userId: this.userId,
      elementId,
      deleteChildren,
      preserveStructure,
    });
  }

  public async moveElement(
    elementId: string,
    newParentId: string | null = null,
    newPosition?: number,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<ElementOperationSuccess>({
      type: "elementOperation",
      operationType: "move",
      requestId,
      userId: this.userId,
      elementId,
      newParentId,
      newPosition,
    });
  }

  // ============================================================================
  // Page Operations (Async API)
  // ============================================================================

  public async createPage(page: Page): Promise<PageOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<PageOperationSuccess>({
      type: "pageOperation",
      operationType: "create",
      requestId,
      userId: this.userId,
      page,
    });
  }

  public async updatePage(
    pageId: string,
    updates: Partial<Page>,
  ): Promise<PageOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<PageOperationSuccess>({
      type: "pageOperation",
      operationType: "update",
      requestId,
      userId: this.userId,
      pageId,
      updates,
    });
  }

  public async deletePage(pageId: string): Promise<PageOperationSuccess> {
    const requestId = this.dispatcher.generateRequestId();
    return this.sendRequest<PageOperationSuccess>({
      type: "pageOperation",
      operationType: "delete",
      requestId,
      userId: this.userId,
      pageId,
    });
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  private async sendRequest<T>(message: any): Promise<T> {
    if (!this.dispatcher.checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please slow down.");
    }

    const promise = this.dispatcher.createPendingRequest<T>(message.requestId);

    if (this.connected) {
      this.connection.send(JSON.stringify(message));
    } else {
      this.dispatcher.enqueueMessage(message);
    }

    return promise;
  }

  private emitStatus(status: string): void {
    const data = { status };
    this.statusListeners.forEach((listener) => listener(data));
  }

  private emitSynced(synced: boolean): void {
    this.syncedListeners.forEach((listener) => listener(synced));
  }

  // ============================================================================
  // Public Interface (Event Subscription & Control)
  // ============================================================================

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

  public async reconnect(): Promise<void> {
    await this.connection.connect();
  }

  public disconnect(): void {
    this.connection.disconnect();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public destroy(): void {
    this.connection.destroy();
    this.dispatcher.destroy();
    this.awarenessController.destroy();
    this.statusListeners.clear();
    this.syncedListeners.clear();
  }
}
