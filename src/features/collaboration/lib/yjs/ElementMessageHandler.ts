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
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";

type ErrorCallback = (payload: ErrorPayload & { requestId?: string }) => void;
type PresenceCallback = (payload: PresenceBroadcastPayload) => void;
type SyncedCallback = (synced: boolean) => void;
type SyncUsersCallback = (users: Record<string, unknown>) => void;

interface RemoteElementState {
  elements: EditorElement[];
  loadElements: (elements: EditorElement[], skipSave?: boolean) => unknown;
  remoteAdd: (element: EditorElement) => void;
  remoteUpdate: (id: string, patch: Partial<EditorElement>) => void;
  remoteMove: (id: string, parentId: string | null, order: number) => void;
  remoteDelete: (id: string) => void;
}

export interface ElementMessageHandlerOptions {
  getElementState: () => RemoteElementState;
  onError?: ErrorCallback;
  onPresence?: PresenceCallback;
  onSynced?: SyncedCallback;
  onSyncUsers?: SyncUsersCallback;
  handleSyncUsers: (users: SyncResponsePayload["users"]) => void;
  handleRemotePresence: (payload: PresenceBroadcastPayload) => void;
  resolvePendingRequest: (
    requestId: string,
    isSuccess: boolean,
    result: ElementOperationResult,
  ) => boolean;
}

export class ElementMessageHandler {
  constructor(private readonly options: ElementMessageHandlerOptions) {}

  handle(envelope: WSEnvelope<unknown>): void {
    if (envelope.requestId) {
      const isSuccess = envelope.type !== "error";
      const wasResolved = this.options.resolvePendingRequest(
        envelope.requestId,
        isSuccess,
        this.toOperationResult(envelope),
      );
      if (wasResolved && !isSuccess) return;
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
              ...((existing.settings as Record<string, unknown>) ?? {}),
              ...((settings as Record<string, unknown>) ?? {}),
            },
          }),
          ...(styles !== undefined && {
            styles: {
              ...((existing.styles as Record<string, unknown>) ?? {}),
              ...((styles as Record<string, unknown>) ?? {}),
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

      case "error": {
        const payload = envelope.payload as ErrorPayload;
        this.options.onError?.({
          ...payload,
          requestId: envelope.requestId,
        });
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
