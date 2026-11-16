// $WEB/src/features/agent/executor.ts
/**
 * Runs the CLI's tool calls inside this editor tab. The tab is the only writer:
 * it validates, checks permission, applies through one replaceTree call (one
 * undo step) and answers. Pure apart from the injected host.
 */
import { isEqual } from "lodash-es";
import type { EditorElement } from "@/types/global.type";
import { parseCode } from "@/features/editor/lib/code/parseCode";
import type { Preamble } from "@/features/editor/lib/code/customCode";
import { applyEdits } from "./editOps";
import type { AgentOutcome, AgentRequest } from "./protocol";

export interface AgentHost {
  getElements(): EditorElement[];
  getPageId(): string | undefined;
  canEdit(): boolean;
  /** One call is one undo step. */
  replaceTree(next: EditorElement[]): void;
  getSelectedId(): string | undefined;
  generateCode(): Promise<string>;
  getPreamble(): Preamble;
  setPreamble(next: Preamble): void;
  /** After a successful write: for the toast and the status badge. */
  notifyChanged(summary: string): void;
}

const WRITE_TOOLS = new Set(["apply_edits", "set_code"]);
const REMEMBER = 50;

const error = (code: string, message: string, issues?: { path: string; message: string }[]): AgentOutcome => ({ ok: false, error: { code, message, ...(issues && { issues }) } });

export function createExecutor(host: AgentHost) {
  // Requests can arrive twice (more than one API instance, a reconnect). The
  // first answer is the answer; applying twice would double the edit.
  const done = new Map<string, AgentOutcome>();
  const remember = (id: string, outcome: AgentOutcome) => {
    done.set(id, outcome);
    if (done.size > REMEMBER) done.delete(done.keys().next().value as string);
    return outcome;
  };

  async function run(req: AgentRequest): Promise<AgentOutcome> {
    const pageId = host.getPageId();
    if (req.pageId && pageId !== req.pageId) {
      return error("page_not_open", `Page ${req.pageId} is not the page open in the builder. Ask the user to open it, then try again.`);
    }
    if (!pageId) return error("page_not_open", "No page is open in the builder.");
    if (WRITE_TOOLS.has(req.tool) && !host.canEdit()) return error("forbidden", "The user has read-only access to this project.");
    const args = (req.args ?? {}) as Record<string, unknown>;

    switch (req.tool) {
      case "get_selection": {
        const id = host.getSelectedId();
        const found: { id: string; type: string; name?: string; content?: string }[] = [];
        const visit = (list: EditorElement[]) => {
          for (const e of list) {
            const r = e as unknown as { id: string; type: string; name?: string; content?: string; elements?: EditorElement[] };
            if (r.id === id) found.push({ id: r.id, type: r.type, name: r.name, content: r.content });
            if (r.elements) visit(r.elements);
          }
        };
        visit(host.getElements());
        return { ok: true, result: { elements: found } };
      }
      case "get_code":
        return { ok: true, result: { code: await host.generateCode() } };
      case "apply_edits": {
        const result = applyEdits(host.getElements(), args.operations, pageId);
        if (!result.ok) return error("invalid_edit", "Nothing was applied.", result.issues);
        host.replaceTree(result.elements);
        const summary = `${result.changes} change${result.changes === 1 ? "" : "s"}`;
        host.notifyChanged(summary);
        return { ok: true, result: { summary, created: result.created } };
      }
      case "set_code": {
        if (typeof args.code !== "string" || !args.code) return error("invalid_edit", "Nothing was applied.", [{ path: "code", message: "the code is empty" }]);
        const parsed = parseCode(args.code, host.getElements(), pageId);
        if (!parsed.ok) {
          const d = parsed.diagnostic;
          return error("invalid_edit", "Nothing was applied.", [{ path: `code:${d.line}:${d.column}`, message: d.message }]);
        }
        host.replaceTree(parsed.elements);
        if (!isEqual(parsed.preamble, host.getPreamble())) host.setPreamble(parsed.preamble);
        host.notifyChanged("code updated");
        return { ok: true, result: { summary: "code applied" } };
      }
      default:
        return error("unknown_tool", `Unknown tool "${req.tool}".`);
    }
  }

  return async (req: AgentRequest): Promise<AgentOutcome> => {
    const seen = done.get(req.requestId);
    if (seen) return seen;
    try {
      return remember(req.requestId, await run(req));
    } catch (err) {
      return remember(req.requestId, error("internal", err instanceof Error ? err.message : "The editor failed to run the tool."));
    }
  };
}
