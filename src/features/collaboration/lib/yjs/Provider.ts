import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import { MessageSender } from "./MessageSender";
import { AwarenessController } from "./AwarenessController";
import { ElementMessageHandler } from "./ElementMessageHandler";
import { ElementOperations } from "./ElementOperations";
import type {
  ElementOperationResult,
  YjsProviderV2Options,
  UserInfo,
  UpdateType,
  StatusListener,
  SyncedListener,
  EventType,
  ErrorMessage,
  WSEnvelope,
  PresenceBroadcastPayload,
  RemotePresence,
  CustomYjsProviderV2 as ICustomYjsProviderV2,
} from "@/features/collaboration";
import type { EditorElement } from "@/types/global.type";

export class CustomYjsProviderV2 implements ICustomYjsProviderV2 {
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
  private readonly onError?: (error: ErrorMessage) => void;
  private readonly onPresence?: (data: PresenceBroadcastPayload) => void;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();
  private lastStatus: string | null = null;
  private pruneInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: YjsProviderV2Options) {
    if (typeof options.getElementState !== "function") {
      throw new Error("getElementState is required for real-time collaboration");
    }
    this.projectId = options.projectId;
    this.pageId = options.pageId;
    this.userId = options.userId;
    this.userName = options.userName ?? options.userId;
    this.onSyncUsers = options.onSyncUsers;
    this.onError = options.onError;
    this.onPresence = options.onPresence;

    this.connection = new ConnectionManager({
      url: options.url,
      projectId: options.projectId,
      pageId: options.pageId,
      getToken: options.getToken,
    });
    this.dispatcher = new MessageDispatcher();
    this.sender = new MessageSender(
      this.connection,
      this.dispatcher,
      (envelope) => this.messageHandler.recordLocal(envelope),
      (envelope) => this.messageHandler.rejectLocal(envelope),
    );
    this.awarenessController = new AwarenessController(
      this.userId,
      this.userName,
    );

    this.messageHandler = new ElementMessageHandler({
      getElementState: options.getElementState,
      onPendingChange: () => options.onPendingChange?.(this.pendingUpdates),
      requestSnapshot: () => {
        if (!this.connection.connected) return;
        const envelope = this.dispatcher.createEnvelope("sync:page", this.projectId, this.pageId, {}, { userId: this.userId });
        this.connection.send(JSON.stringify(envelope));
      },
      onError: (payload) => {
        // The transport can be open while the server failed to load the page.
        if (!this.isSynced) this.emitStatus("error");
        this.onError?.({
          type: "error",
          message: payload.message,
          code: payload.code,
          requestId: payload.requestId,
        });
      },
      onPresence: this.onPresence,
      onSynced: (synced) => {
        this.isSynced = synced;
        if (synced && this.connected) this.emitStatus("connected");
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

  // Event wiring

  private setupEventForwarding(): void {
    this.connection.on("open", () => {
      this.connected = true;
      this.emitStatus("connected");
    });

    this.connection.on("close", () => {
      this.messageHandler.suspend();
      this.connected = false;
      this.isSynced = false;
      this.emitStatus("disconnected");
    });

    this.connection.on("error", this.handleConnectionError);
    this.connection.on("message", this.handleMessage);

    this.awarenessController.on("change", (...args: unknown[]) => {
      const [data] = args;
      const users =
        data &&
        typeof data === "object" &&
        "users" in data &&
        data.users &&
        typeof data.users === "object"
          ? (data.users as Record<string, UserInfo>)
          : {};

      this.onSyncUsers?.(users);
    });
  }

  private readonly handleConnectionError = (error: Error): void => {
    const message = error instanceof Error ? error.message : "WebSocket error";
    this.emitStatus("error");
    this.onError?.({ type: "error", message, code: "PROCESS_ERROR" });
  };

  private readonly handleMessage = (data: unknown): void => {
    if (typeof data !== "string") {
      console.error(
        "[CustomYjsProviderV2] Received non-string message payload:",
        data,
      );
      return;
    }

    try {
      const envelope = JSON.parse(data) as WSEnvelope<unknown>;
      this.messageHandler.handle(envelope);
    } catch (error) {
      console.error("[CustomYjsProviderV2] Failed to parse message:", error);
    }
  };

  // Element operations (outbound)

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

  // Presence

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

  // Event subscription & control

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
    return Math.max(this.dispatcher.pendingCount, this.messageHandler.pendingCount);
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
    this.messageHandler.suspend();
    this.connection.disconnect();
    this.isSynced = false;
    await this.connection.connect();
  }

  public disconnect(): void {
    this.messageHandler.suspend();
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
    this.messageHandler.dispose();
    this.sender.destroy();
    this.dispatcher.destroy();
    this.awarenessController.destroy();
    this.statusListeners.clear();
    this.syncedListeners.clear();
  }

  private emitStatus(status: string): void {
    if (status === this.lastStatus) return;
    this.lastStatus = status;
    this.statusListeners.forEach((l) => l({ status }));
  }

  private emitSynced(synced: boolean): void {
    this.syncedListeners.forEach((l) => l(synced));
  }
}
