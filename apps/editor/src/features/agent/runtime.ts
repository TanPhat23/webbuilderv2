import { createExecutor, type AgentHost } from "./executor";
import type { AgentOutcome, AgentRequest } from "./protocol";

let execute: ((req: AgentRequest) => Promise<AgentOutcome>) | null = null;

/** The mounted editor registers itself here; the collaboration provider calls in. */
export function registerAgentHost(host: AgentHost | null): void {
  execute = host ? createExecutor(host) : null;
}

export async function runAgentRequest(req: AgentRequest): Promise<AgentOutcome> {
  if (!execute) return { ok: false, error: { code: "editor_not_ready", message: "The editor is still loading. Try again in a moment." } };
  return execute(req);
}
