import { WS_MESSAGE, type WSEnvelope } from "@/features/collaboration/interfaces/websocket/ws-collab.interface";
import type { AgentOutcome, AgentRequest } from "@/types/agent-protocol";

export interface AgentChannelOptions {
  onRequest: (req: AgentRequest) => Promise<AgentOutcome>;
  send: (requestId: string, outcome: AgentOutcome) => void;
}

/**
 * Routes `agent:request` messages (a CLI's tool call, relayed by the realtime
 * service) to the executor and sends the outcome back as `agent:response`.
 * Same shape as LogicChannel: dispatchMessage() returns true when the message was ours.
 */
export class AgentChannel {
  constructor(private readonly options: AgentChannelOptions) {}

  dispatchMessage(envelope: WSEnvelope<unknown>): boolean {
    if (envelope.type !== WS_MESSAGE.AGENT_REQUEST) return false;
    const requestId = envelope.requestId;
    if (!requestId) return true;
    const payload = (envelope.payload ?? {}) as { tool?: string; args?: unknown; pageId?: string };
    void this.options
      .onRequest({ requestId, tool: String(payload.tool ?? ""), args: payload.args, pageId: payload.pageId })
      .catch((): AgentOutcome => ({ ok: false, error: { code: "internal", message: "The editor failed to run the tool." } }))
      .then((outcome) => this.options.send(requestId, outcome));
    return true;
  }
}
