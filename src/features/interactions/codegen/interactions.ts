// src/features/interactions/codegen/interactions.ts
/**
 * Turns a page's interactions, variables and flows into one readable
 * TypeScript module (spec §3 "Codegen").
 *
 * - one named async function per interaction, with a header comment naming the
 *   source element and interaction ids;
 * - flows as named functions;
 * - variables as a typed store;
 * - expressions compiled to plain property access and operators.
 *
 * The output mirrors the interpreter in `runtime/` step for step: a failing
 * step throws (which stops that interaction), `call` records its result and
 * never throws, and a step that points at a missing element or variable is a
 * no-op. Only the helpers a project actually calls are emitted.
 */
import { compileTemplate, expressionHelpers } from "./expression";
import { isPlainObject, ON_EVENTS, TOAST_KINDS, VERB_SCHEMAS, verbOf, type Interaction, type InteractionMap, type Step } from "../schema";
import type { VariableDef } from "../runtime/variables";

export interface CodegenElement {
  id: string;
  name?: string;
  settings?: unknown;
  elements?: unknown;
}

export interface CodegenInput {
  elements: CodegenElement[];
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
  /** Prefix for persisted variables in sessionStorage/localStorage. */
  namespace?: string;
}

const MAX_FLOW_DEPTH = 16;
const lit = (value: unknown) => JSON.stringify(value);
const pad = (lines: string[], by: string) => lines.map((l) => (l ? by + l : l));

/** `signup button` -> `SignupButton`. */
function pascal(raw: string): string {
  return raw
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

/** A unique identifier: the base, then base2, base3… */
function uniqueName(base: string, used: Set<string>): string {
  let name = base;
  for (let n = 2; used.has(name); n++) name = `${base}${n}`;
  used.add(name);
  return name;
}

/**
 * Text safe inside a `//` or `/** *\/` comment: no comment terminator and no
 * line terminator (JavaScript also ends lines at U+2028 and U+2029).
 * Code never interpolates raw user strings; it goes through `lit` (JSON).
 */
const comment = (raw: unknown) => String(raw).replace(/\*\//g, "* /").replace(/[\r\n\u2028\u2029]+/g, " ");
const isToastKind = (kind: unknown): kind is (typeof TOAST_KINDS)[number] => (TOAST_KINDS as readonly unknown[]).includes(kind);
const isEvent = (on: unknown): on is Interaction["on"] => (ON_EVENTS as readonly unknown[]).includes(on);

const TS_TYPES: Record<VariableDef["type"], string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  object: "Record<string, unknown>",
  list: "unknown[]",
};

const ANIMATION_KEYFRAMES = `{
  fadeIn: [{ opacity: 0 }, { opacity: 1 }],
  slideIn: [{ opacity: 0, transform: "translateY(1rem)" }, { opacity: 1, transform: "translateY(0)" }],
  bounce: [{ transform: "translateY(0)", offset: 0 }, { transform: "translateY(-1rem)", offset: 0.4 }, { transform: "translateY(-0.4rem)", offset: 0.7 }, { transform: "translateY(0)", offset: 1 }],
  pulse: [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }],
  shake: [{ transform: "translateX(0)" }, { transform: "translateX(-0.5rem)" }, { transform: "translateX(0.5rem)" }, { transform: "translateX(-0.5rem)" }, { transform: "translateX(0.5rem)" }, { transform: "translateX(0)" }],
  spin: [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
}`;

interface Helper {
  code: string;
  uses?: string[];
}

/** Everything the steps may call. A helper is emitted only if referenced. */
const HELPERS: Record<string, Helper> = {
  read: { code: expressionHelpers.read },
  text: { code: expressionHelpers.text },
  add: { code: expressionHelpers.add, uses: ["text"] },
  compare: { code: expressionHelpers.compare },
  fail: { code: `const fail = (message: string): never => {\n  throw new Error(message);\n};` },
  sleep: { code: `const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));` },
  byId: {
    uses: ["text"],
    code: `const byId = (id: unknown): HTMLElement | null => {
  const wanted = text(id);
  for (const node of document.querySelectorAll<HTMLElement>("[data-element-id]")) {
    if (node.dataset.elementId === wanted) return node;
  }
  return null;
};`,
  },
  elementScope: {
    uses: ["byId"],
    code: `/** \`el.<id>\` in expressions: read lazily from the live page. */
const elementScope = (): Record<string, unknown> =>
  new Proxy({} as Record<string, unknown>, {
    get: (_target, key) => {
      const node = typeof key === "string" ? byId(key) : null;
      if (!node) return undefined;
      const field = node as HTMLElement & { value?: unknown; checked?: unknown };
      return { value: field.value ?? null, checked: field.checked ?? null, visible: node.style.display !== "none" && !node.hidden, text: node.textContent ?? "" };
    },
  });`,
  },
  setVisible: {
    uses: ["byId"],
    code: `const setVisible = (id: unknown, mode: "show" | "hide" | "toggle"): boolean | undefined => {
  const node = byId(id);
  if (!node) return undefined;
  const show = mode === "show" || (mode === "toggle" && node.style.display === "none");
  node.style.display = show ? "" : "none";
  return show;
};`,
  },
  setModal: {
    uses: ["byId"],
    code: `const setModal = (id: unknown, open: boolean) => {
  const node = byId(id);
  if (!node) return;
  node.style.display = open ? "block" : "none";
  node.setAttribute("aria-hidden", open ? "false" : "true");
};`,
  },
  scrollToTarget: {
    uses: ["byId"],
    code: `const scrollToTarget = (target: unknown, opts: { smooth?: boolean; offset?: number } = {}) => {
  const behavior = opts.smooth === false ? "auto" : "smooth";
  if (typeof target === "number") return window.scrollTo({ top: target, behavior });
  const node = byId(target);
  if (!node) return;
  if (opts.offset) window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top + opts.offset, behavior });
  else node.scrollIntoView({ behavior, block: "start" });
};`,
  },
  webUrl: {
    uses: ["text"],
    code: `/** Only web URLs and relative paths may be used for navigation or requests. */
const webUrl = (value: unknown): string => {
  const url = text(value).trim();
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!url || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) throw new Error("URL must use HTTP or HTTPS");
  return url;
};`,
  },
  go: {
    uses: ["webUrl"],
    code: `const go = (url: unknown, opts: { newTab?: boolean; replace?: boolean } = {}) => {
  const target = webUrl(url);
  if (opts.newTab) window.open(target, "_blank", "noopener");
  else if (opts.replace) window.location.replace(target);
  else window.location.assign(target);
};`,
  },
  downloadFile: {
    uses: ["webUrl", "text"],
    code: `const downloadFile = (url: unknown, filename?: unknown) => {
  const link = document.createElement("a");
  link.href = webUrl(url);
  link.download = filename === undefined ? "" : text(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};`,
  },
  animateElement: {
    uses: ["byId"],
    code: `const ANIMATIONS: Record<string, Keyframe[]> = ${ANIMATION_KEYFRAMES};
const animateElement = (id: unknown, preset: string, duration = 1000) => {
  byId(id)?.animate(ANIMATIONS[preset], { duration, easing: preset === "spin" ? "linear" : "ease" });
};`,
  },
  classify: {
    uses: ["byId", "text"],
    code: `const classify = (id: unknown, op: "add" | "remove" | "toggle", name: unknown) => {
  const node = byId(id);
  if (!node) return;
  const cls = text(name);
  if (!/^[A-Za-z0-9_:\\-/[\\].%]+$/.test(cls)) throw new Error("one class name, no spaces");
  node.classList[op](cls);
};`,
  },
  formById: {
    uses: ["byId"],
    code: `const formById = (id: unknown): HTMLFormElement | null => {
  const node = byId(id);
  return node instanceof HTMLFormElement ? node : null;
};`,
  },
  callApi: {
    uses: ["webUrl"],
    code: `interface CallResult {
  ok: boolean;
  status: number;
  data: unknown;
  error: string | null;
}

/** Never throws: the result says whether it worked, so a later \`if\` can branch on it. */
const callApi = async (
  url: unknown,
  init: { method: string; headers?: Record<string, string>; hasBody?: boolean; body?: unknown; timeout?: number },
): Promise<CallResult> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeout ?? 15_000);
  try {
    const headers: Record<string, string> = { ...init.headers };
    let body: string | undefined;
    if (init.hasBody) {
      body = typeof init.body === "string" ? init.body : JSON.stringify(init.body ?? null);
      const hasType = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
      if (typeof init.body !== "string" && !hasType) headers["Content-Type"] = "application/json";
    }
    const res = await fetch(webUrl(url), { method: init.method, headers, body, signal: controller.signal });
    const raw = await res.text();
    let data: unknown = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // Not JSON: keep the text.
    }
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : \`HTTP \${res.status}\` };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: controller.signal.aborted ? "timed out" : e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
};`,
  },
};

interface ElementInfo {
  id: string;
  name: string;
  interactions: InteractionMap;
}

function collectElements(tree: unknown, out: ElementInfo[] = []): ElementInfo[] {
  if (!Array.isArray(tree)) return out;
  for (const el of tree as CodegenElement[]) {
    const map = isPlainObject(el.settings) ? el.settings.interactions : undefined;
    if (isPlainObject(map) && Object.keys(map).length) {
      const id = String(el.id);
      out.push({ id, name: typeof el.name === "string" && el.name ? el.name : id, interactions: map as InteractionMap });
    }
    collectElements(el.elements, out);
  }
  return out;
}

/** True when there is anything to generate. */
export function hasInteractionCode(input: CodegenInput): boolean {
  return (
    collectElements(input.elements).length > 0 ||
    Object.keys(input.variables).length > 0 ||
    Object.keys(input.flows).length > 0
  );
}

export function toCode(input: CodegenInput): string {
  const { variables, flows } = input;
  const variableNames = new Set(Object.keys(variables));
  const hasVariables = variableNames.size > 0;
  const used = new Set<string>(Object.keys(HELPERS));
  const flowFns = new Map<string, string>();
  for (const name of Object.keys(flows)) flowFns.set(name, uniqueName(`flow${pascal(name)}`, used));
  let usesToast = false;

  /** Statements for a list of steps. `at` is the step path, for messages. */
  function emitSteps(steps: Step[], at: string): string[] {
    return steps.flatMap((step, i) => emitStep(step, `${at}[${i}]`));
  }

  function emitStep(step: Step, at: string): string[] {
    const verb = verbOf(step);
    const s = step as Step & Record<string, unknown>;
    if (!verb) return [`fail(${lit(`${at}: not a valid step`)});`];
    // A draft step (a required field still empty) does nothing until it's filled in.
    if (!VERB_SCHEMAS[verb].safeParse(step).success) return [`// ${comment(at)}: incomplete ${verb} step, skipped`];
    const t = (field: unknown) => compileTemplate(String(field));
    /** A string for the verbs that need one; literals and template strings need no conversion. */
    const str = (field: unknown) => {
      const code = t(field);
      return code.startsWith('"') || code.startsWith("`") ? code : `text(${code})`;
    };
    const record = (expr: string) => (typeof s.id === "string" ? `ctx.steps[${lit(s.id)}] = ${expr};` : expr + ";");
    const call = (expr: string) => (typeof s.id === "string" ? [record(expr)] : [`${expr};`]);
    const opts = (o: Record<string, unknown>) => {
      const parts = Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${lit(v)}`);
      return parts.length ? `{ ${parts.join(", ")} }` : "";
    };
    const optArg = (o: Record<string, unknown>) => (opts(o) ? `, ${opts(o)}` : "");

    switch (verb) {
      case "navigate":
        return [`go(${t(s.navigate)}${optArg({ newTab: s.newTab || undefined, replace: s.replace || undefined })});`];
      case "show":
      case "hide":
      case "toggle":
        return call(`setVisible(${t(s[verb])}, ${lit(verb)})`);
      case "scroll": {
        const target = typeof s.scroll === "string" ? t(s.scroll) : lit(s.scroll);
        return [`scrollToTarget(${target}${optArg({ smooth: s.smooth, offset: s.offset })});`];
      }
      case "modal":
        return [`setModal(${s.target === undefined ? "ctx.elementId" : t(s.target)}, ${s.modal === "open"});`];
      case "toast": {
        usesToast = true;
        const kind = isToastKind(s.kind) ? s.kind : "info";
        return [`toast.${kind}(${str(s.toast)}${s.duration ? `, { duration: ${lit(s.duration)} }` : ""});`];
      }
      case "copy":
        return [`await navigator.clipboard.writeText(${str(s.copy)});`];
      case "download":
        return [`downloadFile(${t(s.download)}${s.filename !== undefined ? `, ${t(s.filename)}` : ""});`];
      case "animate":
        return [`animateElement(${t(s.animate)}, ${lit(s.preset)}${s.duration ? `, ${lit(s.duration)}` : ""});`];
      case "class":
        return [`classify(${t(s.target)}, ${lit(s.class)}, ${t(s.name)});`];
      case "submit":
        return [`formById(${t(s.submit)})?.requestSubmit();`];
      case "reset":
        return [`formById(${t(s.reset)})?.reset();`];
      case "wait":
        return [`await sleep(${Number(s.wait)});`];
      case "set": {
        const name = String(s.set);
        if (!variableNames.has(name)) return [`// ${comment(at)}: no variable named ${comment(name)}, skipped`];
        const assign = `setVar(${lit(name)}, ${t(s.to)} as Variables[${lit(name)}]);`;
        return typeof s.id === "string" ? [assign, `ctx.steps[${lit(s.id)}] = getVar(${lit(name)});`] : [assign];
      }
      case "call": {
        const headers = Object.entries((s.headers ?? {}) as Record<string, string>)
          .filter(([k]) => k !== "__proto__")
          .map(([k, v]) => `${lit(k)}: ${str(v)}`);
        const hasBody = s.body !== undefined && s.method !== "GET";
        const init = [
          `method: ${lit(s.method)}`,
          headers.length ? `headers: { ${headers.join(", ")} }` : "",
          hasBody ? `hasBody: true, body: ${t(s.body)}` : "",
          s.timeout !== undefined ? `timeout: ${lit(s.timeout)}` : "",
        ].filter(Boolean);
        return call(`await callApi(${t(s.url)}, { ${init.join(", ")} })`);
      }
      case "if": {
        const ifStep = step as Extract<Step, { if: string }>;
        const then = pad(emitSteps(ifStep.then, `${at}.then`), "  ");
        const otherwise = ifStep.else ? pad(emitSteps(ifStep.else, `${at}.else`), "  ") : null;
        const branches = (test: string) => [
          `if (${test}) {`,
          ...then,
          ...(otherwise ? ["} else {", ...otherwise] : []),
          "}",
        ];
        if (typeof s.id !== "string") return branches(t(ifStep.if));
        return ["{", `  const taken = Boolean(${t(ifStep.if)});`, `  ctx.steps[${lit(s.id)}] = taken;`, ...pad(branches("taken"), "  "), "}"];
      }
      case "run": {
        const fn = flowFns.get(String(s.run));
        if (!fn) return [`// ${comment(at)}: no flow named ${comment(String(s.run))}, skipped`];
        return typeof s.id === "string"
          ? [`await ${fn}(ctx, depth + 1);`, `ctx.steps[${lit(s.id)}] = true;`]
          : [`await ${fn}(ctx, depth + 1);`];
      }
      case "code":
        return [
          "// Custom code step: runs as written, with `scope` in reach.",
          ...call(`new Function("scope", ${lit(s.code)})(scope)`),
        ];
    }
  }

  const functionBody = (steps: Step[], at: string) => {
    const lines = emitSteps(steps, at);
    return lines.length ? pad(lines, "  ") : ["  // No steps yet."];
  };

  /** `scope` is declared only when a step reads it (an unused local would not compile under noUnusedLocals). */
  const usesCtx = (body: string[]) => body.some((l) => /\bctx\b/.test(l)) || body.some((l) => /\bscope\b/.test(l));
  const scopeLine = (body: string[]) => (body.some((l) => /\bscope\b/.test(l)) ? ["  const scope = scopeOf(ctx);"] : []);

  // Flows.
  const flowBlocks = Object.entries(flows).map(([name, flow]) => {
    const body = functionBody(flow.do, `flow:${name}.do`);
    return [
      `/** Flow "${comment(name)}". */`,
      `export async function ${flowFns.get(name)}(${usesCtx(body) ? "ctx" : "_ctx"}: Ctx, depth = 0): Promise<void> {`,
      `  if (depth > ${MAX_FLOW_DEPTH}) throw new Error("flows nested more than ${MAX_FLOW_DEPTH} deep");`,
      ...scopeLine(body),
      ...body,
      "}",
    ].join("\n");
  });

  // Interactions.
  interface Bound {
    fn: string;
    elementId: string;
    on: Interaction["on"];
    ix: Interaction;
  }
  const bound: Bound[] = [];
  const interactionBlocks: string[] = [];
  for (const el of collectElements(input.elements)) {
    for (const [ixId, ix] of Object.entries(el.interactions)) {
      if (!isPlainObject(ix) || ix.enabled === false || !Array.isArray(ix.do) || !isEvent(ix.on)) continue;
      const fn = uniqueName(`on${pascal(el.name) || pascal(el.id)}${pascal(ix.on)}`, used);
      bound.push({ fn, elementId: el.id, on: ix.on, ix });
      const body = functionBody(ix.do, `${ixId}.do`);
      const usesDepth = body.some((line) => line.includes("depth + 1"));
      interactionBlocks.push([
        `/** Element "${comment(el.name)}" (${comment(el.id)}), interaction ${comment(ixId)}: on ${comment(ix.on)}. */`,
        `async function ${fn}(${usesCtx(body) ? "ctx" : "_ctx"}: Ctx${usesDepth ? ", depth = 0" : ""}): Promise<void> {`,
        ...scopeLine(body),
        ...body,
        "}",
      ].join("\n"));
    }
  }

  const bindings = bound.map(({ fn, elementId, on, ix }) => {
    const options: Record<string, unknown> = {
      key: ix.key,
      once: on === "visible" && ix.once === false ? false : undefined,
      // A submit event refreshes the page unless the interaction says otherwise.
      preventDefault: ix.preventDefault ?? (on === "submit" ? true : undefined),
      stopPropagation: ix.stopPropagation || undefined,
    };
    const o = Object.entries(options).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${lit(v)}`);
    return `  bind(${lit(elementId)}, ${lit(on)}, ${fn}${o.length ? `, { ${o.join(", ")} }` : ""});`;
  });

  // Variables.
  const variableBlock = hasVariables
    ? [
        "export interface Variables {",
        ...Object.entries(variables).map(([n, d]) => `  ${lit(n)}: ${Object.hasOwn(TS_TYPES, d.type) ? TS_TYPES[d.type] : "unknown"};`),
        "}",
        "",
        `type Lifetime = "page" | "session" | "local";`,
        `const NAMESPACE = ${lit(input.namespace ?? "app")};`,
        "const definitions: { [K in keyof Variables]: { default: Variables[K]; lifetime: Lifetime } } = {",
        ...Object.entries(variables).map(
          ([n, d]) => `  ${lit(n)}: { default: ${lit(d.default ?? null)}, lifetime: ${lit(d.lifetime ?? "page")} },`,
        ),
        "};",
        "",
        "// Storage can be missing or throw (private mode, blocked site data): fall back to memory.",
        "const storageFor = (lifetime: Lifetime): Storage | null => {",
        "  try {",
        `    const storage = lifetime === "session" ? window.sessionStorage : lifetime === "local" ? window.localStorage : null;`,
        `    storage?.getItem("wb:probe");`,
        "    return storage;",
        "  } catch {",
        "    return null;",
        "  }",
        "};",
        "",
        "const values: Record<string, unknown> = Object.create(null);",
        "const listeners = new Set<() => void>();",
        "for (const [name, def] of Object.entries(definitions)) {",
        "  let value: unknown = JSON.parse(JSON.stringify(def.default));",
        "  try {",
        "    const stored = storageFor(def.lifetime)?.getItem(`wb:${NAMESPACE}:${name}`);",
        "    if (stored != null) value = JSON.parse(stored);",
        "  } catch {",
        "    // Unreadable or corrupt: keep the default.",
        "  }",
        "  values[name] = value;",
        "}",
        "",
        "export const getVar = <K extends keyof Variables>(name: K): Variables[K] => values[name] as Variables[K];",
        "export const getVars = (): Variables => ({ ...values }) as unknown as Variables;",
        "export const setVar = <K extends keyof Variables>(name: K, value: Variables[K]): void => {",
        "  values[name] = value;",
        "  try {",
        "    storageFor(definitions[name].lifetime)?.setItem(`wb:${NAMESPACE}:${name}`, JSON.stringify(value));",
        "  } catch {",
        "    // Quota or blocked: the value still lives in memory.",
        "  }",
        "  for (const listener of listeners) listener();",
        "};",
        "/** For React: `useSyncExternalStore(subscribe, getVars)`. */",
        "export const subscribe = (listener: () => void) => {",
        "  listeners.add(listener);",
        "  return () => {",
        "    listeners.delete(listener);",
        "  };",
        "};",
      ].join("\n")
    : "";

  const blocks = [...flowBlocks, ...interactionBlocks];
  const ctxBlock = `export interface Ctx {
  /** The element whose interaction is running. */
  elementId: string;
  event: unknown;
  form: Record<string, unknown>;
  /** Results of steps that have an \`id\`. */
  steps: Record<string, unknown>;
}`;
  const scopeBlock = `const scopeOf = (ctx: Ctx) => ({
  get vars() {
    return ${hasVariables ? "getVars()" : "{}"};
  },
  event: ctx.event,
  form: ctx.form,
  el: ${/read\(scope, "el"\)/.test(blocks.join("\n")) ? "elementScope()" : "{}"},
  steps: ctx.steps,
});`;

  // The binder: wires each interaction to its element.
  const binder = bindings.length
    ? `type Handler = (ctx: Ctx) => Promise<void>;
interface BindOptions {
  /** keydown/keyup: run only for this key (case-insensitive). */
  key?: string;
  /** visible: run the first time only (default true). */
  once?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

const summarize = (event: Event) => {
  const target = event.target as (EventTarget & { value?: unknown; checked?: unknown }) | null;
  return {
    type: event.type,
    value: target && "value" in target ? target.value : null,
    checked: target && "checked" in target ? target.checked : null,
    key: (event as KeyboardEvent).key ?? null,
  };
};

const formValues = (target: EventTarget | null): Record<string, unknown> => {
  const element = target as Element | null;
  const form = (element?.tagName === "FORM" ? element : element?.closest?.("form")) as HTMLFormElement | null;
  const result: Record<string, unknown> = Object.create(null);
  if (!form) return result;
  for (const [key, value] of new FormData(form)) result[key] = typeof value === "string" ? value : value.name;
  return result;
};

const run = (handler: Handler, elementId: string, event: Event | null) =>
  handler({ elementId, event: event ? summarize(event) : null, form: event ? formValues(event.target) : Object.create(null), steps: Object.create(null) }).catch(
    (error: unknown) => console.error(\`Interaction failed on \${elementId}:\`, error),
  );

/**
 * Attach every interaction to its element (found by \`data-element-id\`).
 * Call it once the page is rendered; it returns a function that removes them.
 */
export function bindInteractions(root: ParentNode = document): () => void {
  const cleanups: Array<() => void> = [];
  const elementsOf = (id: string) =>
    [...root.querySelectorAll<HTMLElement>("[data-element-id]")].filter((node) => node.dataset.elementId === id);

  const bind = (elementId: string, on: string, handler: Handler, options: BindOptions = {}) => {
    for (const node of elementsOf(elementId)) {
      if (on === "load") {
        void run(handler, elementId, null);
      } else if (on === "visible") {
        let done = false;
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting) || (done && options.once !== false)) return;
          done = true;
          void run(handler, elementId, null);
        });
        observer.observe(node);
        cleanups.push(() => observer.disconnect());
      } else {
        const listener = (event: Event) => {
          if (options.key && (event as KeyboardEvent).key?.toLowerCase() !== options.key.toLowerCase()) return;
          if (options.preventDefault) event.preventDefault();
          if (options.stopPropagation) event.stopPropagation();
          void run(handler, elementId, event);
        };
        node.addEventListener(on, listener);
        cleanups.push(() => node.removeEventListener(on, listener));
      }
    }
  };

${bindings.length ? bindings.join("\n") : "  // No interactions yet."}

  return () => cleanups.forEach((cleanup) => cleanup());
}`
    : `/** Attach every interaction to its element. There are none yet. */
export function bindInteractions(_root: ParentNode = document): () => void {
  return () => {};
}`;

  // Assemble, then pull in exactly the helpers the body uses.
  const body = [
    variableBlock,
    blocks.length || bindings.length ? ctxBlock : "",
    blocks.some((b) => b.includes("scopeOf(ctx)")) ? scopeBlock : "",
    ...blocks,
    binder,
  ]
    .filter(Boolean)
    .join("\n\n");
  const needed = new Set<string>();
  const visit = (name: string) => {
    if (needed.has(name)) return;
    needed.add(name);
    HELPERS[name].uses?.forEach(visit);
  };
  for (const name of Object.keys(HELPERS)) {
    // A call to the helper itself, not a method of the same name (e.g. `listeners.add(`).
    if (new RegExp(`(?<![.\\w$])${name}\\(`).test(body)) visit(name);
  }
  const helperBlock = Object.keys(HELPERS)
    .filter((n) => needed.has(n))
    .map((n) => HELPERS[n].code)
    .join("\n");

  const header = [
    "/**",
    " * Interactions generated from the editor: variables, flows and the handlers",
    " * for each element. Call `bindInteractions()` once the page has rendered.",
    ...(usesToast ? [' * Toasts use "sonner".'] : []),
    " */",
  ].join("\n");

  return [header, usesToast ? `import { toast } from "sonner";` : "", helperBlock, body]
    .filter(Boolean)
    .join("\n\n") + "\n";
}
