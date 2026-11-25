import {
  WS_MESSAGE,
  type LogicChangedPayload,
  type LogicScope,
  type LogicSyncPayload,
  type LogicUpdatePayload,
  type WSEnvelope,
  type RealtimeProviderOptions,
} from "../../interfaces/websocket";
import type { ConnectionManager } from "./ConnectionManager";
import type { MessageDispatcher } from "./MessageDispatcher";
import type { MessageSender } from "./MessageSender";
import { LogicChannel } from "./LogicChannel";
import { AgentChannel } from "./AgentChannel";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLogicChangedPayload(value: unknown): value is LogicChangedPayload {
  return (
    isRecord(value) &&
    (value.scope === "project" || value.scope === "page") &&
    isRecord(value.logic)
  );
}

function isLogicSyncPayload(value: unknown): value is LogicSyncPayload {
  return isRecord(value) && isRecord(value.project);
}

function parseLogicChangedPayload(data: unknown): LogicChangedPayload {
  if (!isLogicChangedPayload(data)) {
    throw new Error("Unexpected logic update response payload");
  }
  return data;
}

function parseLogicSyncPayload(data: unknown): LogicSyncPayload {
  if (!isLogicSyncPayload(data)) {
    throw new Error("Unexpected logic sync response payload");
  }
  return data;
}

export class ProviderLogicClient {
  private readonly logicChannel: LogicChannel;
  private readonly agentChannel?: AgentChannel;

  constructor(private readonly deps: {
    projectId: string;
    pageId: string;
    userId: string;
    connection: ConnectionManager;
    dispatcher: MessageDispatcher;
    sender: MessageSender;
    onLogicSync?: (payload: LogicSyncPayload) => void;
    onLogicChanged?: (payload: LogicChangedPayload, own: boolean) => void;
    onAgentRequest?: RealtimeProviderOptions["onAgentRequest"];
  }) {
    this.logicChannel = new LogicChannel({
      resolvePendingRequest: (requestId, ok, data) =>
        deps.dispatcher.resolvePendingRequest(requestId, ok, data),
      onSync: (payload) => deps.onLogicSync?.(payload),
      onChanged: (payload, own) => deps.onLogicChanged?.(payload, own),
    });

    if (deps.onAgentRequest) {
      this.agentChannel = new AgentChannel({
        onRequest: deps.onAgentRequest,
        send: (requestId, outcome) => {
          const payload = outcome.ok
            ? { ok: true, result: outcome.result }
            : { ok: false, error: outcome.error };
          const envelope = deps.dispatcher.createEnvelope(
            WS_MESSAGE.AGENT_RESPONSE,
            deps.projectId,
            deps.pageId,
            payload,
            { userId: deps.userId, requestId },
          );
          deps.connection.send(JSON.stringify(envelope));
        },
      });
    }
  }

  public handleIncoming(envelope: WSEnvelope<unknown>): boolean {
    if (this.logicChannel.handle(envelope)) return true;
    return this.agentChannel?.handle(envelope) ?? false;
  }

  public async updateLogic(
    scope: LogicScope,
    patch: Record<string, unknown>,
    nullPaths?: string[][],
  ): Promise<LogicChangedPayload> {
    const payload: LogicUpdatePayload = {
      scope,
      patch,
      ...(nullPaths?.length ? { nullPaths } : {}),
    };
    return this.sendTracked(WS_MESSAGE.LOGIC_UPDATE, payload, parseLogicChangedPayload);
  }

  public requestLogicSync(): void {
    if (!this.deps.connection.connected) return;
    const envelope = this.deps.dispatcher.createEnvelope(
      WS_MESSAGE.LOGIC_SYNC,
      this.deps.projectId,
      this.deps.pageId,
      {},
      { userId: this.deps.userId },
    );
    this.deps.connection.send(JSON.stringify(envelope));
  }

  public async moveLogic(
    kind: "variable" | "flow",
    name: string,
    to: LogicScope,
  ): Promise<LogicSyncPayload> {
    return this.sendTracked(
      WS_MESSAGE.LOGIC_MOVE,
      {
        kind,
        name,
        to,
      },
      parseLogicSyncPayload,
    );
  }

  private async sendTracked<T>(
    type: Parameters<MessageDispatcher["createEnvelope"]>[0],
    payload: unknown,
    parse: (data: unknown) => T,
  ): Promise<T> {
    const requestId = this.deps.dispatcher.generateRequestId();
    const envelope = this.deps.dispatcher.createEnvelope(
      type,
      this.deps.projectId,
      this.deps.pageId,
      payload,
      { userId: this.deps.userId, requestId },
    );
    this.logicChannel.track(requestId);
    try {
      return await this.deps.sender.sendRequest(envelope, requestId, parse);
    } finally {
      this.logicChannel.forget(requestId);
    }
  }
}
