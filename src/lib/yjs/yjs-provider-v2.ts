import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/interfaces/page.interface";
import type {
  ElementOperationRequest,
  ElementOperationSuccess,
  PageOperationRequest,
  PageOperationSuccess,
  V2Message,
  YjsProviderV2Options,
  PendingRequest,
  RateLimiter,
  AwarenessState,
  StatusListener,
  SyncedListener,
  EventType,
  InitialSyncMessage,
  ElementOperationSuccess as ElementOpSuccess,
  MouseMoveMessage,
  ElementSelectMessage,
  ConflictMessage,
  CurrentStateMessage,
  ErrorMessage,
  MousePosition,
  UserInfo,
  UpdateType,
  UserDisconnectMessage,
} from "@/interfaces/yjs-v2.interface";
import { ElementTreeHelper } from "@/lib/utils/element-tree-helper";

export const parseElementsJson = (json: string): EditorElement[] => {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch (err) {
    console.error("[YjsProvider] Failed to parse elements JSON:", err);
    return [];
  }
};

export class CustomYjsProviderV2 {
  // Public properties
  public readonly doc: Y.Doc;
  public readonly awareness: Awareness;
  public ws: WebSocket | null = null;
  public connected = false;
  public synched = false;

  // Connection configuration
  private readonly url: string;
  private readonly pageId: string;
  private readonly projectId: string;
  private readonly userId: string;
  private readonly getToken: () => Promise<string | null>;

  // Callbacks
  private readonly onSyncUsers?: (users: Record<string, UserInfo>) => void;
  private readonly onConflict?: (conflict: ConflictMessage) => void;
  private readonly onError?: (error: ErrorMessage) => void;

  // Message queue and request tracking
  private readonly messageQueue: ElementOperationRequest[] = [];
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;

  // Reconnection state
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly reconnectInterval = 3000;
  private readonly maxReconnectInterval = 30000;
  private reconnectAttempts = 0;

  // Event listeners
  private readonly statusListeners = new Set<StatusListener>();
  private readonly syncedListeners = new Set<SyncedListener>();

  // Token refresh
  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private lastTokenRefreshTime = 0;
  private readonly tokenRefreshIntervalMs = 4 * 60 * 1000; // 4 minutes

  // Sync state
  private initialSyncReceived = false;
  private isDestroying = false;
  private syncTimeoutId: NodeJS.Timeout | null = null;

  // Awareness throttling
  private lastAwarenessChangeTime = 0;
  private readonly awarenessThrottleMs = 100;
  private lastSentSelectedElement: string | null = null;
  private lastKnownUsers: Set<string> = new Set();

  // Rate limiting
  private readonly operationRateLimiter: RateLimiter = {
    tokens: 100,
    maxTokens: 100,
    refillRate: 100,
    lastRefill: Date.now(),
  };

  constructor(options: YjsProviderV2Options) {
    const {
      url,
      pageId,
      projectId,
      userId,
      getToken,
      doc,
      onSyncUsers,
      onConflict,
      onError,
    } = options;

    this.url = url;
    this.pageId = pageId;
    this.projectId = projectId;
    this.userId = userId;
    this.getToken = getToken;
    this.doc = doc;
    this.onSyncUsers = onSyncUsers;
    this.onConflict = onConflict;
    this.onError = onError;

    this.awareness = this.initializeAwareness(doc);
    this.setupAwarenessState();
    this.awareness.on("change", this.handleAwarenessChange);
    void this.connect();
  }

  private initializeAwareness(doc: Y.Doc): Awareness {
    const existingAwareness = (doc as unknown as { awareness?: Awareness })
      .awareness;
    if (existingAwareness) return existingAwareness;

    const newAwareness = new Awareness(doc);
    (doc as unknown as { awareness: Awareness }).awareness = newAwareness;
    return newAwareness;
  }

  private setupAwarenessState(): void {
    try {
      this.awareness.setLocalState({
        user: { name: this.userId, color: this.generateUserColor(this.userId) },
        cursor: { x: 0, y: 0 },
        selectedElement: null,
      });
      this.lastSentSelectedElement = null;
    } catch (err) {}
  }

  private async connect(): Promise<void> {
    if (this.isDestroying || this.connected) return;

    try {
      this.validatePageId();
      const token = await this.getAuthToken();
      const wsUrl = this.buildWebSocketUrl(token);

      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (err) {
      if (!this.isDestroying) {
        this.scheduleReconnect();
      }
    }
  }

  private validatePageId(): void {
    if (!this.pageId || this.pageId === "undefined" || this.pageId === "") {
      throw new Error("Invalid pageId for WebSocket connection");
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = await this.getToken();
    if (!token) {
      this.emitStatus("error");
      this.scheduleReconnect();
      throw new Error("No authentication token available");
    }
    return token;
  }

  private buildWebSocketUrl(token: string): string {
    const params = new URLSearchParams({
      projectId: this.projectId,
      token,
    });
    return `${this.url}/ws/${this.pageId}?${params.toString()}`;
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = this.handleWebSocketOpen;
    this.ws.onmessage = this.handleWebSocketMessage;
    this.ws.onclose = this.handleWebSocketClose;
    this.ws.onerror = this.handleWebSocketError;
  }

  private readonly handleWebSocketOpen = (): void => {
    if (this.isDestroying) {
      this.ws?.close();
      return;
    }

    this.connected = true;
    this.lastTokenRefreshTime = Date.now();
    this.initialSyncReceived = false;
    this.reconnectAttempts = 0;

    this.emitStatus("connected");
    this.clearTimeouts();
    this.scheduleSyncTimeout();
    this.setupTokenRefresh();
    this.flushMessageQueue();
  };

  private readonly handleWebSocketMessage = (event: MessageEvent): void => {
    if (this.isDestroying) return;
    try {
      const data = JSON.parse(event.data) as V2Message;
      this.handleMessage(data);
    } catch (err) {
      console.error("[YjsProviderV2] Failed to parse message:", err);
    }
  };

  private readonly handleWebSocketClose = (event: CloseEvent): void => {
    if (this.isDestroying) return;

    this.connected = false;
    this.synched = false;
    this.emitStatus("disconnected");

    this.clearTimeouts();
    this.rejectAllPendingRequests(new Error("Connection closed"));
    this.scheduleReconnect();
  };

  private readonly handleWebSocketError = (): void => {
    if (this.isDestroying) return;

    console.error("[YjsProviderV2] WebSocket connection error");
    this.emitStatus("error");

    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
  };

  private clearTimeouts(): void {
    if (this.syncTimeoutId) clearTimeout(this.syncTimeoutId);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
  }

  private scheduleSyncTimeout(): void {
    this.syncTimeoutId = setTimeout(() => {
      if (!this.initialSyncReceived && !this.isDestroying) {
        this.initialSyncReceived = true;
        this.synched = true;
        this.emitSynced(true);
      }
    }, 5000);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) void this.sendMessage(message);
    }
  }

  private rejectAllPendingRequests(error: Error): void {
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(error);
    });
    this.pendingRequests.clear();
  }

  private setupTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }

    this.tokenRefreshInterval = setInterval(() => {
      if (this.isDestroying || !this.connected) return;

      const timeSinceLastRefresh = Date.now() - this.lastTokenRefreshTime;
      if (timeSinceLastRefresh > this.tokenRefreshIntervalMs) {
        this.disconnect();
        void this.connect();
      }
    }, 25000);
  }

  private scheduleReconnect(): void {
    if (this.isDestroying || this.reconnectTimeout) return;

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval,
    );

    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isDestroying) {
        void this.connect();
      }
    }, delay);
  }

  private handleMessage(message: V2Message): void {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      this.resolvePendingRequest(message);
      return;
    }

    this.routeMessage(message);
  }

  private resolvePendingRequest(message: V2Message): void {
    const { requestId } = message;
    if (!requestId) return;

    const pending = this.pendingRequests.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(requestId);

    if (message.type === "error") {
      const errorMsg = message as ErrorMessage;
      const errorText =
        errorMsg.message || errorMsg.error || errorMsg.code || "Unknown error";
      console.error(
        `[YjsProviderV2] Error response for request ${requestId}:`,
        errorMsg,
      );
      pending.reject(new Error(errorText));
      this.onError?.(errorMsg);
    } else {
      pending.resolve(message as ElementOperationSuccess);
    }
  }

  private routeMessage(message: V2Message): void {
    switch (message.type) {
      case "initialSync":
        this.handleInitialSync(message);
        break;
      case "elementOperationSuccess":
        this.handleElementOperationSuccess(message);
        break;
      case "pageOperationSuccess":
        this.handlePageOperationSuccess(message as PageOperationSuccess);
        break;
      case "mouseMove":
        this.handleMouseMove(message);
        break;
      case "elementSelect":
        this.handleElementSelect(message);
        break;
      case "conflict":
        this.handleConflict(message);
        break;
      case "currentState":
        this.handleCurrentState(message);
        break;
      case "userDisconnect":
        this.handleUserDisconnect(message as UserDisconnectMessage);
        break;
      case "error":
        this.handleErrorMessage(message);
        break;
      default:
        console.warn(
          "[YjsProviderV2] Unknown message type:",
          (message as V2Message).type,
        );
    }
  }

  private handleInitialSync(message: InitialSyncMessage): void {
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = null;
    }

    this.initialSyncReceived = true;

    try {
      this.applyInitialSyncToDoc(message.elements);
      this.synched = true;
      this.emitSynced(true);
    } catch (err) {
      console.error("[YjsProviderV2] Failed to process initial sync:", err);
    }
  }

  private applyInitialSyncToDoc(elements: EditorElement[]): void {
    Y.transact(
      this.doc,
      () => {
        const yElementsText = this.doc.getText("elementsJson");
        yElementsText.delete(0, yElementsText.length);
        yElementsText.insert(0, JSON.stringify(elements));
      },
      "v2-sync",
    );
  }

  private handleElementOperationSuccess(
    message: ElementOperationSuccess,
  ): void {
    try {
      const currentElements = this.getCurrentElements();
      this.updateVersionTracking(message.version);

      const updatedElements = this.applyElementOperation(
        currentElements,
        message,
      );

      this.updateElementsInDoc(updatedElements);
    } catch (err) {
      console.error(
        "[YjsProviderV2] Error handling elementOperationSuccess:",
        err,
      );
    }
  }

  private handlePageOperationSuccess(message: PageOperationSuccess): void {
    try {
      const currentPages = this.getCurrentPages();
      this.updateVersionTracking(message.version);

      let updatedPages = [...currentPages];
      if (message.operationType === "create" && message.page) {
        updatedPages.push(message.page);
      } else if (
        message.operationType === "update" &&
        message.pageId &&
        message.page
      ) {
        updatedPages = updatedPages.map((p) =>
          p.Id === message.pageId ? { ...p, ...message.page! } : p,
        );
      } else if (message.operationType === "delete" && message.pageId) {
        updatedPages = updatedPages.filter((p) => p.Id !== message.pageId);
      }

      this.updatePagesInDoc(updatedPages);
    } catch (err) {
      console.error(
        "[YjsProviderV2] Error handling pageOperationSuccess:",
        err,
      );
    }
  }

  private getCurrentElements(): EditorElement[] {
    const yElementsText = this.doc.getText("elementsJson");
    const elementsJson = yElementsText.toString();
    return parseElementsJson(elementsJson);
  }

  private getCurrentPages(): Page[] {
    const yPagesText = this.doc.getText("pagesJson");
    const pagesJson = yPagesText.toString();
    try {
      return pagesJson ? JSON.parse(pagesJson) : [];
    } catch (err) {
      console.error("[YjsProviderV2] Failed to parse pages JSON:", err);
      return [];
    }
  }

  private updatePagesInDoc(pages: Page[]): void {
    this.doc.transact(() => {
      const yPagesText = this.doc.getText("pagesJson");
      yPagesText.delete(0, yPagesText.length);
      yPagesText.insert(0, JSON.stringify(pages));
    }, "v2-page-update");
  }

  private updateVersionTracking(version: number): void {
    const yState = this.doc.getMap("state");
    const currentVersion = (yState.get("version") as number) || 0;
    if (version > currentVersion) {
      yState.set("version", version);
    }
  }

  private applyElementOperation(
    elements: EditorElement[],
    message: ElementOperationSuccess,
  ): EditorElement[] {
    let updatedElements = [...elements];

    if (message.element?.id) {
      updatedElements = this.applyElementUpsert(
        updatedElements,
        message.element,
      );
    }

    if (message.deletedElementId) {
      updatedElements = this.applyElementDelete(
        updatedElements,
        message.deletedElementId,
        message.deletedChildren,
      );
    }

    if (message.operationType === "move" && message.elementId) {
      updatedElements = this.applyElementMove(updatedElements, message);
    }

    if (message.movedChildren?.length) {
      updatedElements = this.applyMovedChildren(updatedElements, message);
    }

    return updatedElements;
  }

  private applyElementUpsert(
    elements: EditorElement[],
    element: EditorElement,
  ): EditorElement[] {
    const existing = ElementTreeHelper.findById(elements, element.id);

    if (existing) {
      return ElementTreeHelper.mapUpdateById(
        elements,
        element.id,
        () => element,
      );
    }

    // If element has a parentId, insert it into the parent's children
    if (element.parentId) {
      return ElementTreeHelper.mapUpdateById(
        elements,
        element.parentId,
        (parent) => {
          const containerParent = parent as unknown as {
            elements?: EditorElement[];
          };
          const currentChildren = containerParent.elements || [];

          // Insert at specified position or end
          const newChildren = ElementTreeHelper.insertAtPosition(
            currentChildren,
            element,
            element.order,
          );

          return {
            ...parent,
            elements: newChildren,
          } as EditorElement;
        },
      );
    }

    // Otherwise add to root level
    return [...elements, element];
  }

  private applyElementDelete(
    elements: EditorElement[],
    elementId: string,
    deletedChildren?: string[],
  ): EditorElement[] {
    let updated = ElementTreeHelper.mapDeleteById(elements, elementId);

    if (deletedChildren?.length) {
      for (const childId of deletedChildren) {
        updated = ElementTreeHelper.mapDeleteById(updated, childId);
      }
    }

    return updated;
  }

  private applyElementMove(
    elements: EditorElement[],
    message: ElementOperationSuccess,
  ): EditorElement[] {
    const { elementId, newParentId, newPosition } = message;
    if (!elementId) return elements;

    const elementToMove = ElementTreeHelper.findById(elements, elementId);
    if (!elementToMove) return elements;

    let updated = ElementTreeHelper.mapDeleteById(elements, elementId);

    const movedElement: EditorElement = {
      ...elementToMove,
      parentId: newParentId ?? undefined,
      order: newPosition,
    };

    if (newParentId) {
      updated = this.insertIntoParent(
        updated,
        newParentId,
        movedElement,
        newPosition,
      );
    } else {
      updated = ElementTreeHelper.insertAtPosition(
        updated,
        movedElement,
        newPosition,
      );
    }

    return updated;
  }

  private insertIntoParent(
    elements: EditorElement[],
    parentId: string,
    element: EditorElement,
    position?: number,
  ): EditorElement[] {
    return ElementTreeHelper.mapUpdateById(elements, parentId, (parent) => {
      const containerParent = parent as unknown as {
        elements?: EditorElement[];
      };
      const currentChildren = containerParent.elements || [];
      const updatedChildren = ElementTreeHelper.insertAtPosition(
        currentChildren,
        element,
        position,
      );

      return {
        ...parent,
        elements: updatedChildren,
      } as EditorElement;
    });
  }

  private applyMovedChildren(
    elements: EditorElement[],
    message: ElementOperationSuccess,
  ): EditorElement[] {
    const { movedChildren, newParentId, newPosition } = message;
    if (!movedChildren?.length) return elements;

    let updated = elements;
    for (const childId of movedChildren) {
      updated = ElementTreeHelper.mapUpdateById(updated, childId, (el) => ({
        ...el,
        parentId: newParentId ?? undefined,
        order: newPosition,
      }));
    }

    return updated;
  }

  private updateElementsInDoc(elements: EditorElement[]): void {
    Y.transact(
      this.doc,
      () => {
        const yElementsText = this.doc.getText("elementsJson");
        yElementsText.delete(0, yElementsText.length);
        yElementsText.insert(0, JSON.stringify(elements));
      },
      "remote-update",
    );
  }

  private handleMouseMove(message: MouseMoveMessage): void {
    if (!this.awareness) return;

    try {
      const { userId, x, y } = message;
      if (userId === this.userId) return;
      if (typeof x !== "number" || typeof y !== "number") return;

      const currentState = (this.awareness.getLocalState() ||
        {}) as AwarenessState;
      const remoteUsers = { ...currentState.remoteUsers, [userId]: { x, y } };

      this.awareness.setLocalStateField("remoteUsers", remoteUsers);
    } catch (err) {
      console.error("[YjsProviderV2] Error handling mouseMove:", err);
    }
  }

  private handleElementSelect(message: ElementSelectMessage): void {
    if (!this.awareness) return;

    try {
      const { userId, elementId } = message;
      if (userId === this.userId) return;

      const currentState = (this.awareness.getLocalState() ||
        {}) as AwarenessState;
      const selectedByUser = {
        ...currentState.selectedByUser,
        [userId]: elementId,
      };

      this.awareness.setLocalStateField("selectedByUser", selectedByUser);
    } catch (err) {
      console.error("[YjsProviderV2] Error handling elementSelect:", err);
    }
  }

  private handleConflict(message: ConflictMessage): void {
    this.onConflict?.(message);
  }

  private handleCurrentState(message: CurrentStateMessage): void {
    if (message.users) {
      this.onSyncUsers?.(message.users);
    }

    if (!this.awareness) return;

    try {
      this.ensureAwarenessState();
      this.updateMousePositions(message.mousePositions);
      this.updateSelectedElements(message.selectedElements);
      this.updateUsersInfo(message.users);
    } catch (err) {
      console.error("[YjsProviderV2] Error handling currentState:", err);
    }
  }

  private ensureAwarenessState(): void {
    if (!this.awareness.getLocalState()) {
      this.awareness.setLocalState({
        user: { name: this.userId, color: this.generateUserColor(this.userId) },
        cursor: { x: 0, y: 0 },
        selectedElement: null,
        remoteUsers: {},
        selectedByUser: {},
        users: {},
      });
    }
  }

  private updateMousePositions(
    mousePositions?: Record<string, MousePosition>,
  ): void {
    if (!mousePositions) return;

    const remoteUsers: Record<
      string,
      MousePosition & { cursor: MousePosition }
    > = {};
    for (const [userId, pos] of Object.entries(mousePositions)) {
      if (userId !== this.userId) {
        remoteUsers[userId] = { x: pos.x, y: pos.y, cursor: pos };
      }
    }

    if (Object.keys(remoteUsers).length > 0) {
      this.awareness.setLocalStateField("remoteUsers", remoteUsers);
    }
  }

  private updateSelectedElements(
    selectedElements?: Record<string, string>,
  ): void {
    if (!selectedElements) return;

    const selectedByUser: Record<string, string> = {};
    for (const [userId, elementId] of Object.entries(selectedElements)) {
      if (userId !== this.userId) {
        selectedByUser[userId] = elementId;
      }
    }

    if (Object.keys(selectedByUser).length > 0) {
      this.awareness.setLocalStateField("selectedByUser", selectedByUser);
    }
  }

  private updateUsersInfo(users?: Record<string, UserInfo>): void {
    if (!users) return;
    const currentUserIds = new Set(Object.keys(users));

    // Find users that have disconnected
    const disconnectedUsers = Array.from(this.lastKnownUsers).filter(
      (userId) => !currentUserIds.has(userId) && userId !== this.userId,
    );

    // Remove disconnected users from awareness
    for (const userId of disconnectedUsers) {
      this.removeUserFromAwareness(userId);
    }

    // Update last known users
    this.lastKnownUsers = currentUserIds;

    this.awareness.setLocalStateField("users", users);
  }

  private removeUserFromAwareness(userId: string): void {
    if (!this.awareness) return;

    try {
      const currentState = (this.awareness.getLocalState() ||
        {}) as AwarenessState;

      // Remove from remoteUsers
      const remoteUsers = { ...currentState.remoteUsers };
      delete remoteUsers[userId];

      // Remove from selectedByUser
      const selectedByUser = { ...currentState.selectedByUser };
      delete selectedByUser[userId];

      this.awareness.setLocalStateField("remoteUsers", remoteUsers);
      this.awareness.setLocalStateField("selectedByUser", selectedByUser);
    } catch (err) {
      console.error("[YjsProviderV2] Error removing user from awareness:", err);
    }
  }

  private handleUserDisconnect(message: UserDisconnectMessage): void {
    const { userId } = message;
    if (userId === this.userId) return;

    this.removeUserFromAwareness(userId);
    this.lastKnownUsers.delete(userId);
  }

  private handleErrorMessage(message: ErrorMessage): void {
    const errorDetail =
      message.message || message.error || message.code || "Unknown error";
    console.error("[YjsProviderV2] Server error:", errorDetail, message);
    this.onError?.(message);
  }

  private readonly handleAwarenessChange = (): void => {
    const now = Date.now();
    if (now - this.lastAwarenessChangeTime < this.awarenessThrottleMs) {
      return;
    }
    this.lastAwarenessChangeTime = now;

    const localState = this.awareness.getLocalState() as AwarenessState | null;
    if (!localState || !this.connected) return;

    if (localState.cursor) {
      this.sendMousePosition(localState.cursor.x, localState.cursor.y);
    }

    const currentSelected = localState.selectedElement;
    if (this.shouldSendSelection(currentSelected)) {
      this.selectElement(currentSelected!);
      this.lastSentSelectedElement = currentSelected!;
    }
  };

  private shouldSendSelection(selected: string | null | undefined): boolean {
    return (
      selected !== this.lastSentSelectedElement &&
      !!selected &&
      typeof selected === "string" &&
      selected.trim() !== ""
    );
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${++this.requestIdCounter}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const timePassed = now - this.operationRateLimiter.lastRefill;

    const tokensToAdd =
      (timePassed / 1000) * this.operationRateLimiter.refillRate;
    this.operationRateLimiter.tokens = Math.min(
      this.operationRateLimiter.maxTokens,
      this.operationRateLimiter.tokens + tokensToAdd,
    );
    this.operationRateLimiter.lastRefill = now;

    if (this.operationRateLimiter.tokens >= 1) {
      this.operationRateLimiter.tokens -= 1;
      return true;
    }

    console.warn("[YjsProviderV2] Rate limit exceeded");
    return false;
  }

  private sendMessage<T = any>(message: V2Message): Promise<T> | void;
  private sendMessage<T = any>(
    message: V2Message,
    requireResponse: true,
  ): Promise<T>;
  private sendMessage(message: V2Message, requireResponse: false): void;
  private sendMessage<T = any>(
    message: V2Message,
    requireResponse = false,
  ): Promise<T> | void {
    if (!this.connected || !this.ws) {
      if (
        message.type === "elementOperation" ||
        message.type === "pageOperation"
      ) {
        this.messageQueue.push(message as any);
      }
      return requireResponse
        ? Promise.reject(new Error("Not connected"))
        : undefined;
    }

    if (
      (message.type === "elementOperation" ||
        message.type === "pageOperation") &&
      !this.checkRateLimit()
    ) {
      return requireResponse
        ? Promise.reject(new Error("Rate limit exceeded"))
        : undefined;
    }

    try {
      this.ws.send(JSON.stringify(message));

      if (requireResponse && "requestId" in message && message.requestId) {
        return this.createPendingRequest<T>(message.requestId);
      }
    } catch (err) {
      console.error("[YjsProviderV2] Failed to send message:", err);
      if (requireResponse) {
        return Promise.reject(err);
      }
    }
  }

  private createPendingRequest<T = any>(requestId: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Request timeout"));
      }, 30000);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });
    });
  }

  async createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: ElementOperationRequest = {
      type: "elementOperation",
      operationType: "create",
      requestId,
      userId: this.userId,
      element,
      parentId,
      position,
    };

    return this.sendMessage<ElementOperationSuccess>(message, true);
  }

  async updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    updateType: UpdateType = "partial",
  ): Promise<ElementOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: ElementOperationRequest = {
      type: "elementOperation",
      operationType: "update",
      requestId,
      userId: this.userId,
      elementId,
      updates,
      updateType,
    };

    return this.sendMessage<ElementOperationSuccess>(message, true);
  }

  async deleteElement(
    elementId: string,
    deleteChildren = false,
    preserveStructure = true,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: ElementOperationRequest = {
      type: "elementOperation",
      operationType: "delete",
      requestId,
      userId: this.userId,
      elementId,
      deleteChildren,
      preserveStructure,
    };

    return this.sendMessage<ElementOperationSuccess>(message, true);
  }

  async moveElement(
    elementId: string,
    newParentId?: string | null,
    newPosition?: number,
  ): Promise<ElementOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: ElementOperationRequest = {
      type: "elementOperation",
      operationType: "move",
      requestId,
      userId: this.userId,
      elementId,
      newParentId,
      newPosition,
    };

    return this.sendMessage<ElementOperationSuccess>(message, true);
  }

  sendMousePosition(x: number, y: number): void {
    this.sendMessage({ type: "mouseMove", userId: this.userId, x, y }, false);
  }

  selectElement(elementId: string | null): void {
    if (
      !elementId ||
      typeof elementId !== "string" ||
      elementId.trim() === ""
    ) {
      return;
    }

    const trimmedId = elementId.trim();
    this.sendMessage(
      { type: "elementSelect", userId: this.userId, elementId: trimmedId },
      false,
    );
    this.lastSentSelectedElement = trimmedId;
  }

  private generateUserColor(userId: string): string {
    const hue =
      Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  private emitStatus(status: string): void {
    this.statusListeners.forEach((listener) => listener({ status }));
  }

  private emitSynced(synced: boolean): void {
    this.syncedListeners.forEach((listener) => listener(synced));
  }

  public on(event: EventType, callback: StatusListener | SyncedListener): void {
    if (event === "status") {
      this.statusListeners.add(callback as StatusListener);
      const initialStatus = this.connected ? "connected" : "disconnected";
      (callback as StatusListener)({ status: initialStatus });
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

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.synched = false;
  }

  public async reconnect(): Promise<void> {
    // Gracefully disconnect first
    this.disconnect();

    // Reset reconnection state for immediate retry
    this.reconnectAttempts = 0;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Reconnect immediately
    await this.connect();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public isSynced(): boolean {
    return this.synched;
  }

  async createPage(page: Page): Promise<PageOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: PageOperationRequest = {
      type: "pageOperation",
      operationType: "create",
      requestId,
      userId: this.userId,
      page,
    };

    return this.sendMessage<PageOperationSuccess>(message, true);
  }

  async updatePage(
    pageId: string,
    updates: Partial<Page>,
  ): Promise<PageOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: PageOperationRequest = {
      type: "pageOperation",
      operationType: "update",
      requestId,
      userId: this.userId,
      pageId,
      updates,
    };

    return this.sendMessage<PageOperationSuccess>(message, true);
  }

  async deletePage(pageId: string): Promise<PageOperationSuccess> {
    const requestId = this.generateRequestId();
    const message: PageOperationRequest = {
      type: "pageOperation",
      operationType: "delete",
      requestId,
      userId: this.userId,
      pageId,
    };

    return this.sendMessage<PageOperationSuccess>(message, true);
  }

  public destroy(): void {
    this.isDestroying = true;

    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.syncTimeoutId) clearTimeout(this.syncTimeoutId);
    if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);

    this.rejectAllPendingRequests(new Error("Provider destroyed"));

    this.statusListeners.clear();
    this.syncedListeners.clear();

    this.disconnect();

    if (this.awareness) {
      try {
        this.awareness.off("change", this.handleAwarenessChange);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
