// $WEB/src/features/agent/protocol.ts
export interface AgentIssue {
  path: string;
  message: string;
}

/** A tool call from the user's CLI, delivered to this tab by the realtime service. */
export interface AgentRequest {
  requestId: string;
  tool: string;
  pageId?: string;
  args: unknown;
}

export type AgentOutcome =
  | { ok: true; result: unknown }
  | { ok: false; error: { code: string; message: string; issues?: AgentIssue[] } };
