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
import { sanitizeProjectCss } from "@/features/projects/lib/project-css";
import {
  findColorPreset,
  PRESET_COLORS,
  validateThemePatchObject,
} from "@/features/projects/lib/theme-tokens";
import type { AgentOutcome, AgentRequest } from "./protocol";
import {
  componentRoots, componentSetting, detach, usageCount, visitComponentTree,
  type ComponentSource,
} from "@/features/projects/lib/components";
import { elementHelper } from "@/features/elements/lib/elementhelper";
import { toTree } from "./readTree";

/** A change to the project's shared styling. A null theme value removes that key. */
export interface ProjectStylePatch {
  css?: string;
  theme?: Record<string, unknown>;
}

interface AgentComponents extends ComponentSource {
  pages: { id: string; name: string }[];
}

export interface AgentHost {
  isComponentPage?(): boolean;
  getComponents(): Promise<AgentComponents>;
  createComponent(name: string, fromElementId?: string): Promise<{ id: string; name: string; rootId?: string }>;
  getElements(): EditorElement[];
  getPageId(): string | undefined;
  /** False while a page is loading or syncing, so the tree is not yet the page's. */
  isReady(): boolean;
  canEdit(): boolean;
  /** Why canEdit is false, in words the CLI can pass on; shown instead of a generic refusal. */
  whyNotEditable?(): { code: string; message: string } | undefined;
  canEditProject(): boolean;
  canCreatePages(): boolean;
  /** Creates an empty page in this project. */
  createPage(name: string): Promise<{ id: string; name: string }>;
  /** Switches the builder to another page of this project; false if the project has no such page. */
  openPage(pageId: string): Promise<boolean>;
  /** Applies the patch and returns the patch that restores what it replaced. */
  setProjectStyle(patch: ProjectStylePatch): Promise<ProjectStylePatch>;
  notifyProjectChanged(summary: string, undo?: () => void): void;
  /** One call is one undo step. */
  replaceTree(next: EditorElement[]): void;
  getSelectedId(): string | undefined;
  generateCode(): Promise<string>;
  getPreamble(): Preamble;
  setPreamble(next: Preamble): void;
  /** After a successful write: for the toast and the status badge. */
  notifyChanged(summary: string): void;
}

const WRITE_TOOLS = new Set(["apply_edits", "set_code", "detach_component", "create_component"]);
const MAX_CSS = 100_000;
const MAX_PAGE_NAME = 255;
const MAX_THEME_JSON = 20_000;
const REMEMBER = 50;

const error = (code: string, message: string, issues?: { path: string; message: string }[]): AgentOutcome => ({ ok: false, error: { code, message, ...(issues && { issues }) } });

export function createExecutor(host: AgentHost) {
  // Requests can arrive twice (more than one API instance, a reconnect). The
  // first answer is the answer; applying twice would double the edit.
  const done = new Map<string, AgentOutcome>();
  const pending = new Map<string, Promise<AgentOutcome>>();
  const remember = (id: string, outcome: AgentOutcome) => {
    done.set(id, outcome);
    if (done.size > REMEMBER) done.delete(done.keys().next().value as string);
    return outcome;
  };

  /** Tools about the project, not the open page: they work whichever page is open. */
  async function runProjectTool(req: AgentRequest): Promise<AgentOutcome> {
    const args = (req.args ?? {}) as Record<string, unknown>;
    if (req.tool === "create_page") {
      if (!host.canCreatePages()) return error("forbidden", "The user cannot create pages in this project.");
      const name = typeof args.name === "string" ? args.name.trim() : "";
      if (!name) return error("invalid_edit", "Nothing was done.", [{ path: "name", message: "a page name is required" }]);
      if (name.length > MAX_PAGE_NAME) return error("invalid_edit", "Nothing was done.", [{ path: "name", message: `longer than ${MAX_PAGE_NAME} characters` }]);
      if (args.open !== undefined && typeof args.open !== "boolean") return error("invalid_edit", "Nothing was done.", [{ path: "open", message: "must be true or false" }]);
      const page = await host.createPage(name);
      host.notifyProjectChanged(`Page "${page.name}" created`);
      const opened = args.open === true && (await host.openPage(page.id));
      return { ok: true, result: { pageId: page.id, name: page.name, opened, note: opened ? "The editor is loading the new page. If the next call says editor_not_ready or no_editor_session, wait a moment and retry." : "The page is empty. Call open_page to work on it." } };
    }
    if (req.tool === "open_page") {
      if (typeof args.pageId !== "string" || !args.pageId) return error("invalid_edit", "Nothing was done.", [{ path: "pageId", message: "a page id is required" }]);
      if (host.getPageId() === args.pageId) return { ok: true, result: { pageId: args.pageId, alreadyOpen: true } };
      if (!(await host.openPage(args.pageId))) return error("page_not_found", `This project has no page ${args.pageId}. Use list_pages.`);
      // The editor reloads for the new page, so the next call can briefly answer editor_not_ready.
      return { ok: true, result: { pageId: args.pageId, opened: true, note: "The editor is loading the page. If the next call says editor_not_ready or no_editor_session, wait a moment and retry." } };
    }
    // set_project_style
    if (!host.canEditProject()) return error("forbidden", "The user cannot change this project's settings.");
    const patch: ProjectStylePatch = {};
    let mergedTheme: Record<string, unknown> | undefined;

    if (args.css !== undefined) {
      if (typeof args.css !== "string") return error("invalid_edit", "Nothing was applied.", [{ path: "css", message: "must be a string" }]);
      if (args.css.length > MAX_CSS) return error("invalid_edit", "Nothing was applied.", [{ path: "css", message: `longer than ${MAX_CSS} characters` }]);
      patch.css = sanitizeProjectCss(args.css);
    }

    if (args.preset !== undefined) {
      if (typeof args.preset !== "string") {
        return error("invalid_edit", "Nothing was applied.", [{ path: "preset", message: "must be a preset name string" }]);
      }
      const preset = findColorPreset(args.preset);
      if (!preset) {
        const available = PRESET_COLORS.map((p) => p.name).join(", ");
        return error("invalid_edit", "Nothing was applied.", [{ path: "preset", message: `unknown preset "${args.preset}". Available: ${available}` }]);
      }
      mergedTheme = { ...preset.colors };
    }

    if (args.theme !== undefined) {
      const t = args.theme;
      if (typeof t !== "object" || t === null || Array.isArray(t)) return error("invalid_edit", "Nothing was applied.", [{ path: "theme", message: "must be an object" }]);
      if (JSON.stringify(t).length > MAX_THEME_JSON) return error("invalid_edit", "Nothing was applied.", [{ path: "theme", message: "too large" }]);
      const themeRecord = t as Record<string, unknown>;
      const issues = validateThemePatchObject(themeRecord, "theme");
      if (issues.length > 0) return error("invalid_edit", "Nothing was applied.", issues);
      mergedTheme = { ...(mergedTheme ?? {}), ...themeRecord };
    }

    if (mergedTheme !== undefined) {
      patch.theme = mergedTheme;
    }

    if (patch.css === undefined && patch.theme === undefined) return error("invalid_edit", "Nothing was applied.", [{ path: "css", message: "send css, theme, preset or a combination" }]);
    const before = await host.setProjectStyle(patch);
    const summary = [patch.css !== undefined && "custom CSS", patch.theme && "theme"].filter(Boolean).join(" and ") + " updated";
    host.notifyProjectChanged(summary, () => void host.setProjectStyle(before));
    return { ok: true, result: { summary, previousCss: before.css ?? "" } };
  }

  async function createComponent(args: Record<string, unknown>): Promise<AgentOutcome> {
    if (!host.canCreatePages()) return error("forbidden", "The user cannot create pages in this project.");
    const name = typeof args.name === "string" ? args.name.trim() : "";
    if (!name || name.length > MAX_PAGE_NAME) return error("invalid_edit", "Nothing was done.", [{ path: "name", message: "must be 1 to 255 characters" }]);
    const from = args.fromElementId;
    if (from !== undefined && (typeof from !== "string" || !elementHelper.findById(host.getElements(), from))) {
      return error("invalid_edit", "Nothing was done.", [{ path: "fromElementId", message: "must identify an element on the open page" }]);
    }
    const result = await host.createComponent(name, from);
    if (from) host.notifyChanged(`Component "${name}" created`);
    else host.notifyProjectChanged(`Component "${name}" created`);
    return { ok: true, result };
  }

  async function run(req: AgentRequest): Promise<AgentOutcome> {
    if (req.tool === "open_page" || req.tool === "set_project_style" || req.tool === "create_page") return runProjectTool(req);
    const args = (req.args ?? {}) as Record<string, unknown>;
    if (req.tool === "list_components") {
      const source = await host.getComponents();
      const roots = componentRoots(source);
      return { ok: true, result: { components: source.pages.map(({ id, name }) => {
        const root = roots.get(id);
        return { id, name, usage: usageCount(source.elements, id), root: root ? {
          id: root.id, type: root.type, ...(root.name && { name: root.name }), ...(root.content && { content: root.content }),
        } : null };
      }) } };
    }
    if (req.tool === "create_component" && args.fromElementId === undefined) {
      return createComponent(args);
    }
    const pageId = host.getPageId();
    if (req.pageId && pageId !== req.pageId) {
      return error("page_not_open", `Page ${req.pageId} is not the page open in the builder. Ask the user to open it, then try again.`);
    }
    if (!pageId) return error("page_not_open", "No page is open in the builder.");
    if (!host.isReady()) return error("editor_not_ready", "The page is still loading. Try again in a moment.");
    if (WRITE_TOOLS.has(req.tool) && !host.canEdit()) {
      const why = host.whyNotEditable?.();
      return error(why?.code ?? "forbidden", why?.message ?? "The user has read-only access to this project.");
    }
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
      case "get_page": {
        let hasComponents = false;
        const elements = host.getElements();
        visitComponentTree(elements, (element) => { if (componentSetting(element)) hasComponents = true; });
        const names = hasComponents ? new Map((await host.getComponents()).pages.map(({ id, name }) => [id, name])) : undefined;
        return { ok: true, result: { pageId, source: "editor", elements: toTree(elements, names) } };
      }
      case "create_component":
        return createComponent(args);
      case "detach_component": {
        const id = args.elementId;
        const source = await host.getComponents();
        if (host.getPageId() !== pageId || !host.isReady()) return error("page_not_open", "The open page changed.");
        if (!host.canEdit()) return error("forbidden", "The open page is no longer editable.");
        const tree = host.getElements();
        const element = typeof id === "string" && elementHelper.findById(tree, id);
        if (!element || !componentSetting(element)) return error("invalid_edit", "Select a component instance.", [{ path: "elementId", message: "must identify a component instance" }]);
        const local = detach(element, source.elements, source.pageIds);
        host.replaceTree(elementHelper.mapUpdateById(tree, element.id, () => local));
        host.notifyChanged("Component detached");
        return { ok: true, result: { elementId: local.id } };
      }
      case "get_code":
        return { ok: true, result: { code: await host.generateCode() } };
      case "apply_edits": {
        const source = await host.getComponents();
        if (host.getPageId() !== pageId || !host.isReady()) return error("page_not_open", "The open page changed.");
        if (!host.canEdit()) return error("forbidden", "The open page is no longer editable.");
        const result = applyEdits(host.getElements(), args.operations, pageId, source);
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
        if (host.isComponentPage?.() && parsed.elements.length > 1) {
          return error("invalid_edit", "Nothing was applied.", [{ path: "code", message: "a component page can have only one root" }]);
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
    const inFlight = pending.get(req.requestId);
    if (inFlight) return inFlight;
    const reply = run(req)
      .catch((err) => error("internal", err instanceof Error ? err.message : "The editor failed to run the tool."))
      .then((outcome) => remember(req.requestId, outcome))
      .finally(() => { pending.delete(req.requestId); });
    pending.set(req.requestId, reply);
    return reply;
  };
}
