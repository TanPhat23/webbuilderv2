import * as Y from "yjs";
import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import { MessageSender } from "./MessageSender";
import { AwarenessController } from "./AwarenessController";
import { ElementMessageHandler } from "./ElementMessageHandler";
import { ElementOperations } from "./ElementOperations";
import type { Page } from "@/features/pages";
import type {
  ElementOperationResult,
  PageOperationResult,
  YjsProviderV2Options,
  UserInfo,
  UpdateType,
  StatusListener,
  SyncedListener,
  EventType,
  ConflictMessage,
  ErrorMessage,
  WSEnvelope,
  PresenceBroadcastPayload,
  RemotePresence,
  CustomYjsProviderV2 as ICustomYjsProviderV2,
} from "@/features/collaboration";
import { Awareness } from "y-protocols/awareness";
import type { EditorElement } from "@/types/global.type";

export class CustomYjsProviderV2 implements ICustomYjsProviderV2 {
  public readonly doc: Y.Doc;
  public readonly awareness: Awareness;
  public connected = false;
  public isSynced = false;

  private connection: ConnectionManager;
  private dispatcher: MessageDispatcher;
  private sender: MessageSender;
  private awarenessController: AwarenessController;
  private messageHandler: ElementMessageHandler;
  private elementOps: ElementOperations;

  private readonly projectId: string;
  private readonly pageId: string;
  private readonly userId: string;
  private readonly userName: string;

  private readonly onSyncUsers?: (users: Record<string, UserInfo>) => void;
  private readonly onConflict?: (conflict: ConflictMessage) => void;
  private readonly onError?: (error: ErrorMessage) => void;
  private readonly onPresence?: (data: PresenceBroadcastPayload) => void;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();
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

    this.connection = new ConnectionManager({
      url: options.url,
      projectId: options.projectId,
      pageId: options.pageId,
      getToken: options.getToken,
    });
    this.dispatcher = new MessageDispatcher();
    this.sender = new MessageSender(this.connection, this.dispatcher);
    this.awarenessController = new AwarenessController(
      this.doc,
      this.userId,
      this.userName,
    );
    this.awareness = this.awarenessController.awareness;

    this.messageHandler = new ElementMessageHandler({
      onError: (payload) =>
        this.onError?.({
          type: "error",
          message: payload.message,
          code: payload.code,
          requestId: payload.requestId,
        }),
      onPresence: this.onPresence,
      onSynced: (synced) => {
        this.isSynced = synced;
        this.emitSynced(synced);
      },
      handleSyncUsers: (users) =>
        this.awarenessController.handleSyncUsers(users),
      handleRemotePresence: (payload) =>
        this.awarenessController.handleRemotePresence(payload),
      resolvePendingRequest: (requestId, isSuccess, result) =>
        this.dispatcher.resolvePendingRequest(requestId, isSuccess, result),
    });

    this.elementOps = new ElementOperations(
      this.projectId,
      this.pageId,
      this.userId,
      this.dispatcher,
      this.sender,
    );

    this.setupEventForwarding();
    void this.connection.connect();

    this.pruneInterval = setInterval(() => {
      this.awarenessController.pruneStale();
    }, 60_000);
  }

  // --------------------------------------------------------------------------
  // Event wiring
  // --------------------------------------------------------------------------

  private setupEventForwarding(): void {
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
        this.messageHandler.handle(envelope);
      } catch (err) {
        console.error("[CustomYjsProviderV2] Failed to parse message:", err);
      }
    });

    this.awarenessController.on("change", (data) => {
      this.onSyncUsers?.(data.users);
    });
  }

  // --------------------------------------------------------------------------
  // Element operations (outbound)
  // --------------------------------------------------------------------------

  public async createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationResult> {
    return this.elementOps.createElement(element, parentId, position);
  }

  public async updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    updateType: UpdateType = "partial",
  ): Promise<ElementOperationResult> {
    return this.elementOps.updateElement(elementId, updates, updateType);
  }

  public async deleteElement(
    elementId: string,
    deleteChildren = false,
    preserveStructure = true,
  ): Promise<ElementOperationResult> {
    return this.elementOps.deleteElement(
      elementId,
      deleteChildren,
      preserveStructure,
    );
  }

  public async moveElement(
    elementId: string,
    newParentId: string | null = null,
    newPosition?: number,
  ): Promise<ElementOperationResult> {
    return this.elementOps.moveElement(elementId, newParentId, newPosition);
  }

  // --------------------------------------------------------------------------
  // Page operations (REST — WS not implemented)
  // --------------------------------------------------------------------------

  public async createPage(_page: Page): Promise<PageOperationResult> {
    console.warn("[CustomYjsProviderV2] createPage — use REST API");
    return { operationType: "create", page: _page };
  }

  public async updatePage(
    pageId: string,
    _updates: Partial<Page>,
  ): Promise<PageOperationResult> {
    console.warn("[CustomYjsProviderV2] updatePage — use REST API");
    return { operationType: "update", pageId };
  }

  public async deletePage(pageId: string): Promise<PageOperationResult> {
    console.warn("[CustomYjsProviderV2] deletePage — use REST API");
    return { operationType: "delete", deletedPageId: pageId };
  }

  // --------------------------------------------------------------------------
  // Presence
  // --------------------------------------------------------------------------

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
      } satisfies import("@/features/collaboration").PresencePayload,
      { userId: this.userId },
    );
    this.sender.sendOrQueue(envelope);
  }

  public requestSync(): void {
    const envelope = this.dispatcher.createEnvelope(
      "sync:page",
      this.projectId,
      this.pageId,
      {},
      { userId: this.userId },
    );
    this.sender.sendOrQueue(envelope);
  }

  // --------------------------------------------------------------------------
  // Event subscription & control
  // --------------------------------------------------------------------------

  public on(event: EventType, callback: StatusListener | SyncedListener): void {
    if (event === "status") {
      this.statusListeners.add(callback as StatusListener);
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

  public get pendingUpdates(): number {
    return this.dispatcher.pendingCount;
  }

  public onPresenceChange(
    callback: (presences: Map<string, RemotePresence>) => void,
  ): () => void {
    try {
      callback(this.awarenessController.remotePresences);
    } catch (err) {
      console.error(
        "[CustomYjsProviderV2] onPresenceChange callback error:",
        err,
      );
    }

    const handler = () => {
      try {
        callback(this.awarenessController.remotePresences);
      } catch (err) {
        console.error(
          "[CustomYjsProviderV2] onPresenceChange callback error:",
          err,
        );
      }
    };

    this.awarenessController.on("change", handler);
    return () => this.awarenessController.off("change", handler);
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

  private emitStatus(status: string): void {
    this.statusListeners.forEach((l) => l({ status }));
  }

  private emitSynced(synced: boolean): void {
    this.syncedListeners.forEach((l) => l(synced));
  }
}
