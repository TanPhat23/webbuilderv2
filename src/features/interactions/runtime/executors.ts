// src/features/interactions/runtime/executors.ts
/**
 * What each verb does to the page. DOM access goes through a small Platform
 * port so the executors can be tested without a browser, and so the editor
 * can swap behaviour (navigation must not leave the editor).
 *
 */
import { toast as sonner } from "sonner";
import { toText } from "./expression";
import { skip, type CallResult, type Executors, type StepApi } from "./run";
import type { CallStep } from "../schema";

export interface NodeLike {
  tagName: string;
  style: { display: string; animationDuration?: string };
  hidden?: boolean;
  classList: { add(c: string): void; remove(c: string): void; toggle(c: string): void };
  setAttribute(name: string, value: string): void;
  scrollIntoView(opts: { behavior: "smooth" | "auto"; block: "start" }): void;
  getBoundingClientRect(): { top: number };
  requestSubmit?(): void;
  reset?(): void;
  value?: unknown;
  checked?: unknown;
  textContent?: string | null;
}

export type ToastKind = "success" | "error" | "info" | "warning";

export interface Platform {
  byId(id: string): NodeLike | null;
  navigate(url: string, opts: { newTab: boolean; replace: boolean }): void;
  toast(kind: ToastKind, text: string, duration?: number): void;
  copy(text: string): Promise<void>;
  fetch(
    url: string,
    init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal },
  ): Promise<{ ok: boolean; status: number; text(): Promise<string> }>;
  download(url: string, filename?: string): void;
  scrollTo(y: number, smooth: boolean): void;
  scrollY(): number;
  later(fn: () => void, ms: number): void;
  runCode(code: string, scope: Record<string, unknown>): unknown;
}

const missing = (id: string) => skip(`element ${id} is not on the page`);

/** Only web URLs and relative paths may be used for navigation or requests. */
function webUrl(value: unknown): string {
  const url = toText(value).trim();
  let parsed: URL;
  try { parsed = new URL(url, "https://interactions.invalid/"); }
  catch { throw new Error("Invalid URL"); }
  if (!url || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
    throw new Error("URL must use HTTP or HTTPS");
  }
  return url;
}

// Executor instances are created per event, so animation ownership must be shared.
const animations = new WeakMap<NodeLike, { cls: string; duration: string }>();

export function createExecutors(p: Platform): Executors {
  const visibility =
    (mode: "show" | "hide" | "toggle") =>
    (step: Record<string, string>, { value }: StepApi) => {
      const id = toText(value(step[mode]));
      const node = p.byId(id);
      if (!node) return missing(id);
      const hidden = node.style.display === "none";
      const show = mode === "show" || (mode === "toggle" && hidden);
      node.style.display = show ? "" : "none";
      return show;
    };

  return {
    navigate: (s, { value }) => {
      p.navigate(webUrl(value(s.navigate)), { newTab: !!s.newTab, replace: !!s.replace });
    },
    show: visibility("show"),
    hide: visibility("hide"),
    toggle: visibility("toggle"),
    scroll: (s, { value }) => {
      const smooth = s.smooth !== false;
      const target = typeof s.scroll === "string" ? value(s.scroll) : s.scroll;
      if (typeof target === "number") {
        p.scrollTo(target, smooth);
        return;
      }
      const id = toText(target);
      const node = p.byId(id);
      if (!node) return missing(id);
      if (s.offset) {
        p.scrollTo(p.scrollY() + node.getBoundingClientRect().top + s.offset, smooth);
      } else {
        node.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      }
    },
    modal: (s, { ctx, value }) => {
      const id = s.target === undefined ? ctx.elementId : toText(value(s.target));
      const node = p.byId(id);
      if (!node) return missing(id);
      const open = s.modal === "open";
      node.style.display = open ? "block" : "none";
      node.setAttribute("aria-hidden", open ? "false" : "true");
    },
    toast: (s, { value }) => {
      p.toast(s.kind ?? "info", toText(value(s.toast)), s.duration);
    },
    copy: async (s, { value }) => {
      await p.copy(toText(value(s.copy)));
    },
    download: (s, { value }) => {
      p.download(
        webUrl(value(s.download)),
        s.filename !== undefined ? toText(value(s.filename)) : undefined,
      );
    },
    animate: (s, { value }) => {
      const id = toText(value(s.animate));
      const node = p.byId(id);
      if (!node) return missing(id);
      const cls = `ix-animate-${s.preset}`;
      const previous = animations.get(node);
      const originalDuration = previous?.duration ?? node.style.animationDuration ?? "";
      if (previous) node.classList.remove(previous.cls);
      // Force style resolution so repeating a preset restarts it.
      node.getBoundingClientRect();
      const active = { cls, duration: originalDuration };
      animations.set(node, active);
      node.style.animationDuration = `${s.duration ?? 1000}ms`;
      node.classList.add(cls);
      p.later(() => {
        if (animations.get(node) !== active) return;
        node.classList.remove(cls);
        node.style.animationDuration = originalDuration;
        animations.delete(node);
      }, s.duration ?? 1000);
    },
    class: (s, { value }) => {
      const id = toText(value(s.target));
      const node = p.byId(id);
      if (!node) return missing(id);
      const name = toText(value(s.name));
      if (!/^[A-Za-z0-9_:\-/[\].%]+$/.test(name)) throw new Error("one class name, no spaces");
      node.classList[s.class as "add" | "remove" | "toggle"](name);
    },
    submit: (s, { value }) => {
      const id = toText(value(s.submit));
      const node = p.byId(id);
      if (!node) return missing(id);
      if (node.tagName !== "FORM" || !node.requestSubmit) {
        return skip(`element ${id} is not a form`);
      }
      node.requestSubmit();
    },
    reset: (s, { value }) => {
      const id = toText(value(s.reset));
      const node = p.byId(id);
      if (!node) return missing(id);
      if (node.tagName !== "FORM" || !node.reset) {
        return skip(`element ${id} is not a form`);
      }
      node.reset();
    },
    call: (s, { value }) => callApi(p, s as CallStep, value),
    code: (s, { ctx }) =>
      p.runCode(s.code, {
        vars: ctx.vars.snapshot(),
        steps: ctx.steps,
        event: ctx.event ?? null,
        form: ctx.form ?? {},
      }),
  };
}

async function callApi(
  p: Platform,
  s: CallStep,
  value: (t: string) => unknown,
): Promise<CallResult> {
  let controller: AbortController | undefined;
  try {
    const headers: Record<string, string> = Object.create(null);
    for (const [k, v] of Object.entries(s.headers ?? {})) headers[k] = toText(value(v));
    let body: string | undefined;
    if (s.body !== undefined && s.method !== "GET") {
      const v = value(s.body);
      body = typeof v === "string" ? v : JSON.stringify(v ?? null);
      const hasType = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
      if (typeof v !== "string" && !hasType) headers["Content-Type"] = "application/json";
    }
    controller = new AbortController();
    const signalController = controller;
    p.later(() => signalController.abort(), s.timeout ?? 15_000);
    const res = await p.fetch(webUrl(value(s.url)), {
      method: s.method,
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Not JSON: keep the text.
    }
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    const error = controller?.signal.aborted
      ? "timed out"
      : e instanceof Error
        ? e.message
        : String(e);
    return { ok: false, status: 0, data: null, error };
  }
}

/** `el.<id>` for expressions: read lazily from the live page. */
export function elementScope(byId: (id: string) => NodeLike | null): Record<string, unknown> {
  const read = (id: string) => {
    const n = byId(id);
    if (!n) return undefined;
    return {
      value: n.value ?? null,
      checked: n.checked ?? null,
      visible: n.style.display !== "none" && !n.hidden,
      text: n.textContent ?? "",
    };
  };
  return new Proxy({} as Record<string, unknown>, {
    get: (_t, key) => (typeof key === "string" ? read(key) : undefined),
    getOwnPropertyDescriptor: (_t, key) => {
      if (typeof key !== "string") return undefined;
      const v = read(key);
      return v === undefined
        ? undefined
        : { value: v, enumerable: true, configurable: true, writable: false };
    },
  });
}

export function browserPlatform(
  doc: Document,
  host: Element,
  isPageElement: (id: string) => boolean,
): Platform {
  const win = doc.defaultView ?? window;
  return {
    byId: (id) => {
      if (!isPageElement(id)) return null;
      if (host.getAttribute("data-element-id") === id) return host as unknown as NodeLike;
      for (const node of host.querySelectorAll("[data-element-id]")) {
        if (node.getAttribute("data-element-id") === id) return node as unknown as NodeLike;
      }
      return null;
    },
    navigate(url, { newTab, replace }) {
      if (newTab) win.open(url, "_blank", "noopener");
      else if (replace) win.location.replace(url);
      else win.location.assign(url);
    },
    toast: (kind, text, duration) => {
      sonner[kind](text, duration ? { duration } : undefined);
    },
    copy: (text) => win.navigator.clipboard.writeText(text),
    fetch: (url, init) => win.fetch(url, init),
    download(url, filename) {
      const a = doc.createElement("a");
      a.href = url;
      a.download = filename ?? "";
      doc.body.appendChild(a);
      a.click();
      a.remove();
    },
    scrollTo: (y, smooth) => win.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" }),
    scrollY: () => win.scrollY,
    later: (fn, ms) => {
      win.setTimeout(fn, ms);
    },
    // The `code` step is the explicit escape hatch (spec §1), like the old
    // customCode action.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    runCode: (code, scope) => new Function("scope", code)(scope),
  };
}

/** In the editor, navigation would leave the editor: say where it would go. */
export function editorPlatform(
  doc: Document,
  host: Element,
  isPageElement: (id: string) => boolean,
): Platform {
  return {
    ...browserPlatform(doc, host, isPageElement),
    navigate: (url, { newTab }) => {
      sonner.info(`Would ${newTab ? "open" : "go to"} ${url}`, {
        description: "Navigation runs in Preview.",
      });
    },
  };
}
