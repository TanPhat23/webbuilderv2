import type {
  LogicChangedPayload,
  LogicSyncPayload,
  WSEnvelope,
} from "@/features/collaboration";

export interface LogicChannelOptions {
  /** Settles the request with this id; returns whether one was waiting. */
  resolvePendingRequest: (requestId: string, ok: boolean, data: unknown) => boolean;
  onSync: (payload: LogicSyncPayload) => void;
  onChanged: (payload: LogicChangedPayload, own: boolean) => void;
}

/**
 * Routes the realtime server's logic messages. Kept apart from the element
 * handler because logic has no page sequence: every broadcast carries the whole
 * resulting document, so applying one is idempotent.
 */
export class LogicChannel {
  private readonly requests = new Set<string>();

  constructor(private readonly options: LogicChannelOptions) {}

  /** Remember a request so its error reply is handled here, not as an element error. */
  track(requestId: string): void {
    this.requests.add(requestId);
  }

  forget(requestId: string): void {
    this.requests.delete(requestId);
  }

  /** Returns true when the message was a logic message and has been dealt with. */
  handle(envelope: WSEnvelope<unknown>): boolean {
    if (envelope.type === "error") {
      const id = envelope.requestId;
      if (!id || !this.requests.has(id)) return false;
      this.requests.delete(id);
      this.options.resolvePendingRequest(id, false, envelope);
      return true;
    }
    if (envelope.type === "logic:sync") {
      const id = envelope.requestId;
      if (id) this.requests.delete(id);
      this.options.onSync(envelope.payload as LogicSyncPayload);
      if (id) this.options.resolvePendingRequest(id, true, envelope.payload);
      return true;
    }
    if (envelope.type === "logic:update") {
      const id = envelope.requestId;
      if (id) this.requests.delete(id);
      const payload = envelope.payload as LogicChangedPayload;
      const own = id ? this.options.resolvePendingRequest(id, true, payload) : false;
      this.options.onChanged(payload, own);
      return true;
    }
    return false;
  }
}
