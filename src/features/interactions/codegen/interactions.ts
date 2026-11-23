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
  /** The form handles its own submit (a form library), so interactions leave it alone. */
  customSubmit: boolean;
}

function collectElements(tree: unknown, out: ElementInfo[] = []): ElementInfo[] {
  if (!Array.isArray(tree)) return out;
  for (const el of tree as CodegenElement[]) {
    const map = isPlainObject(el.settings) ? el.settings.interactions : undefined;
    if (isPlainObject(map) && Object.keys(map).length) {
      const id = String(el.id);
      out.push({
        id,
        name: typeof el.name === "string" && el.name ? el.name : id,
        interactions: map as InteractionMap,
        customSubmit: isPlainObject(el.settings) && el.settings.customSubmit === true,
      });
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

interface EmitContext {
  variableNames: ReadonlySet<string>;
  flowFns: ReadonlyMap<string, string>;
  onToast: () => void;
}

const templateExpr = (field: unknown) => compileTemplate(String(field));
const stringExpr = (field: unknown) => {
  const code = templateExpr(field);
  return code.startsWith('"') || code.startsWith("`") ? code : `text(${code})`;
};
const recordResult = (stepId: unknown, expr: string) =>
  typeof stepId === "string" ? `ctx.steps[${lit(stepId)}] = ${expr};` : `${expr};`;
const formatCallStep = (stepId: unknown, expr: string) => [recordResult(stepId, expr)];
const formatOptionsArg = (o: Record<string, unknown>) => {
  const parts = Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${lit(v)}`);
  return parts.length ? `, { ${parts.join(", ")} }` : "";
};

function emitIfStep(
  step: Extract<Step, { if: string }>,
  stepId: unknown,
  at: string,
  emitStepsList: (steps: Step[], path: string) => string[],
): string[] {
  const then = pad(emitStepsList(step.then, `${at}.then`), "  ");
  const otherwise = step.else ? pad(emitStepsList(step.else, `${at}.else`), "  ") : null;
  const branches = (test: string) => [
    `if (${test}) {`,
    ...then,
    ...(otherwise ? ["} else {", ...otherwise] : []),
    "}",
  ];
  if (typeof stepId !== "string") return branches(templateExpr(step.if));
  return [
    "{",
    `  const taken = Boolean(${templateExpr(step.if)});`,
    `  ctx.steps[${lit(stepId)}] = taken;`,
    ...pad(branches("taken"), "  "),
    "}",
  ];
}

function emitCallStep(s: Record<string, unknown>, stepId: unknown): string[] {
  const headers = Object.entries((s.headers ?? {}) as Record<string, string>)
    .filter(([k]) => k !== "__proto__")
    .map(([k, v]) => `${lit(k)}: ${stringExpr(v)}`);
  const hasBody = s.body !== undefined && s.method !== "GET";
  const init = [
    `method: ${lit(s.method)}`,
    headers.length ? `headers: { ${headers.join(", ")} }` : "",
    hasBody ? `hasBody: true, body: ${templateExpr(s.body)}` : "",
    s.timeout !== undefined ? `timeout: ${lit(s.timeout)}` : "",
  ].filter(Boolean);
  return formatCallStep(stepId, `await callApi(${templateExpr(s.url)}, { ${init.join(", ")} })`);
}

type SimpleStepEmitter = (
  s: Record<string, unknown>,
  at: string,
  ctx: EmitContext,
) => string[];

const emitVisibilityStep =
  (verb: "show" | "hide" | "toggle"): SimpleStepEmitter =>
  (s) =>
    formatCallStep(s.id, `setVisible(${templateExpr(s[verb])}, ${lit(verb)})`);

const SIMPLE_STEP_EMITTERS: Record<string, SimpleStepEmitter> = {
  navigate: (s) => [
    `go(${templateExpr(s.navigate)}${formatOptionsArg({ newTab: s.newTab || undefined, replace: s.replace || undefined })});`,
  ],
  show: emitVisibilityStep("show"),
  hide: emitVisibilityStep("hide"),
  toggle: emitVisibilityStep("toggle"),
  scroll: (s) => {
    const target = typeof s.scroll === "string" ? templateExpr(s.scroll) : lit(s.scroll);
    return [`scrollToTarget(${target}${formatOptionsArg({ smooth: s.smooth, offset: s.offset })});`];
  },
  modal: (s) => [
    `setModal(${s.target === undefined ? "ctx.elementId" : templateExpr(s.target)}, ${s.modal === "open"});`,
  ],
  toast: (s, _at, ctx) => {
    ctx.onToast();
    const kind = isToastKind(s.kind) ? s.kind : "info";
    return [`toast.${kind}(${stringExpr(s.toast)}${s.duration ? `, { duration: ${lit(s.duration)} }` : ""});`];
  },
  copy: (s) => [`await navigator.clipboard.writeText(${stringExpr(s.copy)});`],
  download: (s) => [
    `downloadFile(${templateExpr(s.download)}${s.filename !== undefined ? `, ${templateExpr(s.filename)}` : ""});`,
  ],
  animate: (s) => [
    `animateElement(${templateExpr(s.animate)}, ${lit(s.preset)}${s.duration ? `, ${lit(s.duration)}` : ""});`,
  ],
  class: (s) => [`classify(${templateExpr(s.target)}, ${lit(s.class)}, ${templateExpr(s.name)});`],
  submit: (s) => [`formById(${templateExpr(s.submit)})?.requestSubmit();`],
  reset: (s) => [`formById(${templateExpr(s.reset)})?.reset();`],
  wait: (s) => [`await sleep(${Number(s.wait)});`],
  set: (s, at, ctx) => {
    const name = String(s.set);
    if (!ctx.variableNames.has(name)) return [`// ${comment(at)}: no variable named ${comment(name)}, skipped`];
    const assign = `setVar(${lit(name)}, ${templateExpr(s.to)} as Variables[${lit(name)}]);`;
    return typeof s.id === "string" ? [assign, `ctx.steps[${lit(s.id)}] = getVar(${lit(name)});`] : [assign];
  },
  run: (s, at, ctx) => {
    const fn = ctx.flowFns.get(String(s.run));
    if (!fn) return [`// ${comment(at)}: no flow named ${comment(String(s.run))}, skipped`];
    return typeof s.id === "string"
      ? [`await ${fn}(ctx, depth + 1);`, `ctx.steps[${lit(s.id)}] = true;`]
      : [`await ${fn}(ctx, depth + 1);`];
  },
  code: (s) => [
    "// Custom code step: runs as written, with `scope` in reach.",
    ...formatCallStep(s.id, `new Function("scope", ${lit(s.code)})(scope)`),
  ],
};

function emitSimpleStep(
  verb: string,
  s: Record<string, unknown>,
  at: string,
  ctx: EmitContext,
): string[] | null {
  if (!Object.hasOwn(SIMPLE_STEP_EMITTERS, verb)) return null;
  return SIMPLE_STEP_EMITTERS[verb](s, at, ctx);
}

function emitSteps(steps: Step[], at: string, ctx: EmitContext): string[] {
  return steps.flatMap((step, i) => emitStep(step, `${at}[${i}]`, ctx));
}

function emitStep(step: Step, at: string, ctx: EmitContext): string[] {
  const verb = verbOf(step);
  if (!verb) return [`fail(${lit(`${at}: not a valid step`)});`];
  if (!VERB_SCHEMAS[verb].safeParse(step).success) return [`// ${comment(at)}: incomplete ${verb} step, skipped`];
  const s = step as Step & Record<string, unknown>;
  if (verb === "call") return emitCallStep(s, s.id);
  if (verb === "if") {
    return emitIfStep(step as Extract<Step, { if: string }>, s.id, at, (nested, path) =>
      emitSteps(nested, path, ctx),
    );
  }
  return emitSimpleStep(verb, s, at, ctx) ?? [];
}

const usesCtx = (body: string[]) => body.some((l) => /\bctx\b/.test(l)) || body.some((l) => /\bscope\b/.test(l));
const scopeLine = (body: string[]) => (body.some((l) => /\bscope\b/.test(l)) ? ["  const scope = scopeOf(ctx);"] : []);
const functionBody = (steps: Step[], at: string, ctx: EmitContext) => {
  const lines = emitSteps(steps, at, ctx);
  return lines.length ? pad(lines, "  ") : ["  // No steps yet."];
};

function emitFlowBlocks(
  flows: Record<string, { do: Step[] }>,
  ctx: EmitContext,
): string[] {
  return Object.entries(flows).map(([name, flow]) => {
    const body = functionBody(flow.do, `flow:${name}.do`, ctx);
    return [
      `/** Flow "${comment(name)}". */`,
      `export async function ${ctx.flowFns.get(name)}(${usesCtx(body) ? "ctx" : "_ctx"}: Ctx, depth = 0): Promise<void> {`,
      `  if (depth > ${MAX_FLOW_DEPTH}) throw new Error("flows nested more than ${MAX_FLOW_DEPTH} deep");`,
      ...scopeLine(body),
      ...body,
      "}",
    ].join("\n");
  });
}

function emitInteractionBlocks(
  elements: CodegenElement[],
  used: Set<string>,
  ctx: EmitContext,
): { blocks: string[]; bindings: string[]; skippedSubmit: boolean } {
  interface Bound {
    fn: string;
    elementId: string;
    on: Interaction["on"];
    ix: Interaction;
  }
  const bound: Bound[] = [];
  const blocks: string[] = [];
  let skippedSubmit = false;

  for (const el of collectElements(elements)) {
    for (const [ixId, ix] of Object.entries(el.interactions)) {
      if (!isPlainObject(ix) || ix.enabled === false || !Array.isArray(ix.do) || !isEvent(ix.on)) continue;
      if (el.customSubmit && ix.on === "submit") {
        skippedSubmit = true;
        continue;
      }
      const fn = uniqueName(`on${pascal(el.name) || pascal(el.id)}${pascal(ix.on)}`, used);
      bound.push({ fn, elementId: el.id, on: ix.on, ix });
      const body = functionBody(ix.do, `${ixId}.do`, ctx);
      const usesDepth = body.some((line) => line.includes("depth + 1"));
      blocks.push([
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
      preventDefault: ix.preventDefault ?? (on === "submit" ? true : undefined),
      stopPropagation: ix.stopPropagation || undefined,
    };
    const o = Object.entries(options).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${lit(v)}`);
    return `  bind(${lit(elementId)}, ${lit(on)}, ${fn}${o.length ? `, { ${o.join(", ")} }` : ""});`;
  });

  return { blocks, bindings, skippedSubmit };
}

function emitVariablesBlock(
  variables: Record<string, VariableDef>,
  namespace: string | undefined,
): string {
  if (Object.keys(variables).length === 0) return "";
  return [
    "export interface Variables {",
    ...Object.entries(variables).map(([n, d]) => `  ${lit(n)}: ${Object.hasOwn(TS_TYPES, d.type) ? TS_TYPES[d.type] : "unknown"};`),
    "}",
    "",
    `type Lifetime = "page" | "session" | "local";`,
    `const NAMESPACE = ${lit(namespace ?? "app")};`,
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
  ].join("\n");
}

function emitBinderBlock(bindings: string[]): string {
  if (!bindings.length) {
    return `/** Attach every interaction to its element. There are none yet. */
export function bindInteractions(_root: ParentNode = document): () => void {
  return () => {};
}`;
  }
  return `type Handler = (ctx: Ctx) => Promise<void>;
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

${bindings.join("\n")}

  return () => cleanups.forEach((cleanup) => cleanup());
}`;
}

function collectUsedHelperCode(body: string): string {
  const needed = new Set<string>();
  const visit = (name: string) => {
    if (needed.has(name)) return;
    needed.add(name);
    HELPERS[name].uses?.forEach(visit);
  };
  for (const name of Object.keys(HELPERS)) {
    if (new RegExp(`(?<![.\\w$])${name}\\(`).test(body)) visit(name);
  }
  return Object.keys(HELPERS)
    .filter((n) => needed.has(n))
    .map((n) => HELPERS[n].code)
    .join("\n");
}

function buildModuleHeader(skippedSubmit: boolean, usesToast: boolean): string {
  return [
    "/**",
    " * Interactions generated from the editor: variables, flows and the handlers",
    " * for each element. Call `bindInteractions()` once the page has rendered.",
    ...(skippedSubmit ? [" * Submit interactions of forms that handle their own submit are not bound."] : []),
    ...(usesToast ? [' * Toasts use "sonner".'] : []),
    " */",
  ].join("\n");
}

export function toCode(input: CodegenInput): string {
  const { variables, flows } = input;
  const variableNames = new Set(Object.keys(variables));
  const hasVariables = variableNames.size > 0;
  const used = new Set<string>(Object.keys(HELPERS));
  const flowFns = new Map<string, string>();
  for (const name of Object.keys(flows)) flowFns.set(name, uniqueName(`flow${pascal(name)}`, used));

  let usesToast = false;
  const ctx: EmitContext = {
    variableNames,
    flowFns,
    onToast: () => {
      usesToast = true;
    },
  };

  const flowBlocks = emitFlowBlocks(flows, ctx);
  const { blocks: interactionBlocks, bindings, skippedSubmit } = emitInteractionBlocks(input.elements, used, ctx);
  const variableBlock = emitVariablesBlock(variables, input.namespace);
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

  const body = [
    variableBlock,
    blocks.length || bindings.length ? ctxBlock : "",
    blocks.some((b) => b.includes("scopeOf(ctx)")) ? scopeBlock : "",
    ...blocks,
    emitBinderBlock(bindings),
  ]
    .filter(Boolean)
    .join("\n\n");

  const helperBlock = collectUsedHelperCode(body);
  const header = buildModuleHeader(skippedSubmit, usesToast);

  return [header, usesToast ? `import { toast } from "sonner";` : "", helperBlock, body]
    .filter(Boolean)
    .join("\n\n") + "\n";
}
