import { ConnectionManager } from "./ConnectionManager";
import { MessageDispatcher } from "./MessageDispatcher";
import { MessageSender } from "./MessageSender";
import { AwarenessController } from "./AwarenessController";
import { ElementMessageHandler } from "./ElementMessageHandler";
import { ElementOperations } from "./ElementOperations";
import { ProviderLogicClient } from "./ProviderLogicClient";
import {
  bindProviderTransport,
  createServerErrorReporter,
} from "./providerTransport";
import type {
  ElementOperationResult,
  YjsProviderV2Options,
  UpdateType,
  StatusListener,
  SyncedListener,
  ErrorMessage,
  PresenceBroadcastPayload,
  PresencePayload,
  RemotePresence,
  LogicScope,
  LogicChangedPayload,
  LogicSyncPayload,
  CustomYjsProviderV2 as ICustomYjsProviderV2,
} from "../../interfaces/websocket";
import type { EditorElement } from "@/types/global.type";

const PRESENCE_PRUNE_INTERVAL_MS = 60_000;

export class CustomYjsProviderV2 implements ICustomYjsProviderV2 {
  public isSynced = false;

  private connection: ConnectionManager;
  private dispatcher: MessageDispatcher;
  private sender: MessageSender;
  private awarenessController: AwarenessController;
  private messageHandler: ElementMessageHandler;
  private elementOps: ElementOperations;
  private logicClient: ProviderLogicClient;

  private readonly projectId: string;
  private readonly pageId: string;
  private readonly userId: string;
  private readonly userName: string;

  private readonly onError?: (error: ErrorMessage) => void;
  private readonly onPresence?: (data: PresenceBroadcastPayload) => void;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();
  private lastStatus: string | null = null;
  private overflowReported = false;
  private pruneInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: YjsProviderV2Options) {
    if (typeof options.getElementState !== "function") {
      throw new Error("getElementState is required for real-time collaboration");
    }
    this.projectId = options.projectId;
    this.pageId = options.pageId;
    this.userId = options.userId;
    this.userName = options.userName ?? options.userId;
    this.onError = options.onError;
    this.onPresence = options.onPresence;

    this.connection = new ConnectionManager({
      url: options.url,
      projectId: options.projectId,
      pageId: options.pageId,
      getToken: options.getToken,
      writer: options.writer,
    });
    this.dispatcher = new MessageDispatcher(() => {
      if (this.overflowReported) return;
      this.overflowReported = true;
      this.onError?.({
        type: "error",
        code: "PROCESS_ERROR",
        message:
          "Too many offline changes are waiting to sync. The oldest were dropped; reload the page after reconnecting.",
      });
    });
    this.sender = new MessageSender(
      this.connection,
      this.dispatcher,
      (envelope) => this.messageHandler.recordLocal(envelope),
      (envelope) => this.messageHandler.rejectLocal(envelope),
    );
    this.awarenessController = new AwarenessController(this.userId);

    const reportServerError = createServerErrorReporter({
      connection: this.connection,
      isSynced: () => this.isSynced,
      emitStatus: (status) => this.emitStatus(status),
      onError: this.onError,
    });

    this.messageHandler = new ElementMessageHandler({
      getElementState: options.getElementState,
      onPendingChange: () => options.onPendingChange?.(this.pendingUpdates),
      requestSnapshot: () => {
        if (!this.connection.connected) return;
        const envelope = this.dispatcher.createEnvelope(
          "sync:page",
          this.projectId,
          this.pageId,
          {},
          { userId: this.userId },
        );
        this.connection.send(JSON.stringify(envelope));
      },
      onError: reportServerError,
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

    this.logicClient = new ProviderLogicClient({
      projectId: this.projectId,
      pageId: this.pageId,
      userId: this.userId,
      connection: this.connection,
      dispatcher: this.dispatcher,
      sender: this.sender,
      onLogicSync: options.onLogicSync,
      onLogicChanged: options.onLogicChanged,
      onAgentRequest: options.onAgentRequest,
    });

    if (options.onSyncUsers) {
      this.awarenessController.on("change", (data) =>
        options.onSyncUsers?.(data.users),
      );
    }

    bindProviderTransport({
      connection: this.connection,
      onOpen: () => this.emitStatus("connected"),
      onClose: () => {
        this.messageHandler.suspend();
        this.isSynced = false;
        this.emitStatus("disconnected");
      },
      onFatal: (message) => {
        this.messageHandler.suspend();
        this.isSynced = false;
        this.emitStatus("error");
        this.onError?.({ type: "error", message, code: "PROCESS_ERROR" });
      },
      onTransportError: (message) => {
        this.emitStatus("error");
        this.onError?.({ type: "error", message, code: "PROCESS_ERROR" });
      },
      onEnvelope: (envelope) => {
        if (this.logicClient.handleIncoming(envelope)) return;
        this.messageHandler.handle(envelope);
      },
    });

    void this.connection.connect();
    this.pruneInterval = setInterval(() => {
      this.awarenessController.pruneStale();
    }, PRESENCE_PRUNE_INTERVAL_MS);
  }

  public get connected(): boolean {
    return this.connection.connected;
  }

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

  public async updateLogic(
    scope: LogicScope,
    patch: Record<string, unknown>,
    nullPaths?: string[][],
  ): Promise<LogicChangedPayload> {
    return this.logicClient.updateLogic(scope, patch, nullPaths);
  }

  public requestLogicSync(): void {
    this.logicClient.requestLogicSync();
  }

  public async moveLogic(
    kind: "variable" | "flow",
    name: string,
    to: LogicScope,
  ): Promise<LogicSyncPayload> {
    return this.logicClient.moveLogic(kind, name, to);
  }

  public sendPresence(
    cursorX: number,
    cursorY: number,
    elementId?: string | null,
  ): void {
    if (elementId !== undefined) {
      this.awarenessController.updateLocalSelection(elementId);
    }
    const payload: PresencePayload = {
      userId: this.userId,
      userName: this.userName,
      cursorX,
      cursorY,
      elementId:
        elementId ?? this.awarenessController.getLocalSelectedElement(),
    };
    const envelope = this.dispatcher.createEnvelope(
      "presence",
      this.projectId,
      this.pageId,
      payload,
      { userId: this.userId },
    );
    this.sender.sendOrQueue(envelope);
  }

  public on(...args: ["status", StatusListener] | ["synced", SyncedListener]): void {
    if (args[0] === "status") {
      const listener = args[1];
      this.statusListeners.add(listener);
      const currentStatus =
        this.lastStatus ?? (this.connected ? "connected" : "connecting");
      listener({ status: currentStatus });
      return;
    }
    this.syncedListeners.add(args[1]);
  }

  public off(...args: ["status", StatusListener] | ["synced", SyncedListener]): void {
    if (args[0] === "status") {
      this.statusListeners.delete(args[1]);
      return;
    }
    this.syncedListeners.delete(args[1]);
  }

  public get pendingUpdates(): number {
    return Math.max(
      this.dispatcher.pendingCount,
      this.messageHandler.pendingCount,
    );
  }

  public onPresenceChange(
    callback: (presences: Map<string, RemotePresence>) => void,
  ): () => void {
    const invoke = () => {
      try {
        callback(this.awarenessController.remotePresences);
      } catch (err) {
        console.error(
          "[CustomYjsProviderV2] onPresenceChange callback error:",
          err,
        );
      }
    };
    invoke();
    this.awarenessController.on("change", invoke);
    return () => this.awarenessController.off("change", invoke);
  }

  public async reconnect(): Promise<void> {
    this.disconnect();
    await this.connection.connect();
  }

  public disconnect(): void {
    this.messageHandler.suspend();
    this.isSynced = false;
    this.connection.disconnect();
    this.emitStatus("disconnected");
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public destroy(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
    this.isSynced = false;
    this.lastStatus = "disconnected";
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
