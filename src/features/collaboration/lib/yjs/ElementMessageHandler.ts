import type { EditorElement } from "@/types/global.type";
import type {
  ElementOperationResult,
  WSEnvelope,
  SyncResponsePayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
  ErrorPayload,
  PresenceBroadcastPayload,
} from "@/features/collaboration";
import { OrderedElementSession, mergeServerPatch, type ElementOperation } from "./OrderedElementSession";
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";

type ErrorCallback = (payload: ErrorPayload & { requestId?: string }) => void;
type PresenceCallback = (payload: PresenceBroadcastPayload) => void;
type SyncedCallback = (synced: boolean) => void;
type SyncUsersCallback = (users: Record<string, unknown>) => void;

import type { RemoteElementState } from "../../interfaces/websocket/yjs-v2.interface";

export interface ElementMessageHandlerOptions {
  getElementState: () => RemoteElementState;
  requestSnapshot?: () => void;
  onPendingChange?: () => void;
  onError?: ErrorCallback;
  onPresence?: PresenceCallback;
  onSynced?: SyncedCallback;
  onSyncUsers?: SyncUsersCallback;
  handleSyncUsers: (users: SyncResponsePayload["users"]) => void;
  handleRemotePresence: (payload: PresenceBroadcastPayload) => void;
  resolvePendingRequest: (
    requestId: string,
    isSuccess: boolean,
    result: unknown,
  ) => boolean;
}

export class ElementMessageHandler {
  private ordered = false;
  private readonly session: OrderedElementSession;

  constructor(private readonly options: ElementMessageHandlerOptions) {
    this.session = new OrderedElementSession({
      render: (elements) => options.getElementState().loadElements(elements, true),
      requestSnapshot: () => options.requestSnapshot?.(),
      onCommitted: (operation, pending) => {
        const requestId = pending.requestId ?? operation.requestId;
        if (requestId) options.resolvePendingRequest(requestId, true, this.toOperationResult(operation as WSEnvelope<unknown>));
        options.onPendingChange?.();
      },
    });
  }

  recordLocal(envelope: WSEnvelope<unknown>): void {
    if (!envelope.type.startsWith("element:")) return;
    let operation = envelope as ElementOperation;
    if (operation.type === "element:create") {
      const payload = operation.payload as { element?: { id?: string } };
      const id = payload.element?.id;
      const local = id ? ElementTreeHelper.findById(this.options.getElementState().elements, id) : undefined;
      if (local) operation = { ...operation, payload: { ...operation.payload, element: local } };
    }
    this.session.recordLocal(operation);
    this.options.onPendingChange?.();
  }

  rejectLocal(envelope: WSEnvelope<unknown>): void {
    const id = envelope.clientOpId ?? envelope.requestId;
    if (id) this.session.reject(id);
    this.options.onPendingChange?.();
  }

  get pendingCount(): number { return this.session.pendingCount; }

  suspend(): void { this.session.suspend(); }

  dispose(): void { this.session.dispose(); }

  handle(envelope: WSEnvelope<unknown>): void {
    if (envelope.type === "error") {
      const payload = envelope.payload as ErrorPayload & { clientOpId?: string };
      const id = envelope.clientOpId ?? payload.clientOpId ?? envelope.requestId;
      const rejected = id ? this.session.reject(id) : undefined;
      const requestId = envelope.requestId ?? rejected?.requestId;
      if (requestId) this.options.resolvePendingRequest(requestId, false, envelope);
      this.options.onPendingChange?.();
      this.options.onError?.({ ...payload, requestId: envelope.requestId });
      return;
    }

    if (envelope.type === "sync:page") {
      const payload = envelope.payload as SyncResponsePayload;
      if (Number.isSafeInteger(payload.seq) && payload.seq! >= 0) {
        this.ordered = true;
        this.session.snapshot(payload.elements as EditorElement[], payload.seq!);
        this.options.handleSyncUsers(payload.users);
        this.options.onSynced?.(true);
        return;
      }
    }

    if (envelope.type.startsWith("element:") && Number.isSafeInteger(envelope.seq)) {
      this.ordered = true;
      this.session.receive(envelope as ElementOperation);
      return;
    }

    if (this.ordered && envelope.type.startsWith("element:")) {
      this.session.resync();
      return;
    }

    if (envelope.type.startsWith("element:")) {
      this.session.acknowledge(envelope as ElementOperation);
    }
    if (envelope.requestId) {
      this.options.resolvePendingRequest(envelope.requestId, true, this.toOperationResult(envelope));
    }

    switch (envelope.type) {
      case "sync:page": {
        const payload = envelope.payload as SyncResponsePayload;
        this.options.getElementState().loadElements(
          payload.elements as EditorElement[],
          true,
        );
        this.options.handleSyncUsers(payload.users);
        this.options.onSynced?.(true);
        break;
      }

      case "element:create": {
        const payload = envelope.payload as ElementCreateBroadcastPayload;
        this.options.getElementState().remoteAdd(payload.element);
        break;
      }

      case "element:update": {
        const payload = envelope.payload as ElementUpdateBroadcastPayload;
        const { id, settings, styles, ...rest } = payload;
        const existing = ElementTreeHelper.findById(
          this.options.getElementState().elements,
          id,
        );
        if (!existing) break;
        const patch = {
          ...(rest as Record<string, unknown>),
          ...(settings !== undefined && {
            settings: {
              ...mergeServerPatch((existing.settings as Record<string, unknown>) ?? {}, (settings as Record<string, unknown>) ?? {}),
            },
          }),
          ...(styles !== undefined && {
            styles: {
              ...mergeServerPatch((existing.styles as Record<string, unknown>) ?? {}, (styles as Record<string, unknown>) ?? {}),
            },
          }),
        } as Partial<EditorElement>;
        this.options.getElementState().remoteUpdate(id, patch);
        break;
      }

      case "element:move": {
        const payload = envelope.payload as ElementMoveBroadcastPayload;
        this.options.getElementState().remoteMove(
          payload.id,
          payload.parentId ?? null,
          payload.order,
        );
        break;
      }

      case "element:delete": {
        const payload = envelope.payload as ElementDeleteBroadcastPayload;
        this.options.getElementState().remoteDelete(payload.id);
        break;
      }

      case "presence": {
        const payload = envelope.payload as PresenceBroadcastPayload;
        this.options.handleRemotePresence(payload);
        this.options.onPresence?.(payload);
        break;
      }


    }
  }

  toOperationResult(envelope: WSEnvelope<unknown>): ElementOperationResult {
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
}
