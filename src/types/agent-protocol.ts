export interface AgentIssue {
  path: string;
  message: string;
}

export interface AgentRequest {
  requestId: string;
  tool: string;
  pageId?: string;
  args: unknown;
}

export type AgentOutcome =
  | { ok: true; result: unknown }
  | { ok: false; error: { code: string; message: string; issues?: AgentIssue[] } };
