// src/features/interactions/editing/steps-edit.ts
/**
 * Immutable edits on a nested step list, addressed by path:
 *   step path  [1, "then", 0]  → the first step of step 1's then-branch
 *   list path  [1, "then"]     → that branch; []  → the top-level list
 */
import { verbOf, type IfStep, type Step, type Verb } from "../schema";

export type StepPath = Array<number | "then" | "else">;
type Branch = "then" | "else";

const isIf = (s: Step | undefined): s is IfStep =>
  !!s && typeof s === "object" && "if" in s;

function listAt(steps: Step[], listPath: StepPath): Step[] | undefined {
  let list: Step[] | undefined = steps;
  for (let i = 0; i < listPath.length; i += 2) {
    const step: Step | undefined = list?.[listPath[i] as number];
    if (!isIf(step)) return undefined;
    list = listPath[i + 1] === "then" ? step.then : (step.else ?? []);
  }
  return list;
}

function updateList(steps: Step[], listPath: StepPath, fn: (list: Step[]) => Step[]): Step[] {
  if (listPath.length === 0) return fn(steps);
  const [index, branch, ...rest] = listPath as [number, Branch, ...StepPath];
  return steps.map((s, i) => {
    if (i !== index || !isIf(s)) return s;
    const current = branch === "then" ? s.then : (s.else ?? []);
    return { ...s, [branch]: updateList(current, rest, fn) } as Step;
  });
}

const last = (path: StepPath) => path[path.length - 1] as number;
const parent = (path: StepPath) => path.slice(0, -1);

export const getStep = (steps: Step[], path: StepPath): Step | undefined =>
  listAt(steps, parent(path))?.[last(path)];

export const insertStep = (steps: Step[], listPath: StepPath, index: number, step: Step) =>
  updateList(steps, listPath, (l) => [...l.slice(0, index), step, ...l.slice(index)]);

export const removeStep = (steps: Step[], path: StepPath) =>
  updateList(steps, parent(path), (l) => l.filter((_, i) => i !== last(path)));

export const replaceStep = (steps: Step[], path: StepPath, step: Step) =>
  updateList(steps, parent(path), (l) => l.map((s, i) => (i === last(path) ? step : s)));

export const moveStep = (steps: Step[], listPath: StepPath, from: number, to: number) =>
  updateList(steps, listPath, (l) => {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= l.length || to >= l.length) return l;
    const next = [...l];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });

/** The validation path of a step, to match issues to rows. */
export const issuePath = (ixId: string, path: StepPath) =>
  `interactions.${ixId}.do` +
  path.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("");

/** Ids of steps that run before `path` (what `steps.<id>` may read there). */
export function stepIdsBefore(steps: Step[], path: StepPath): string[] {
  const seen = new Set<string>();
  const collect = (list: Step[], available: Set<string>) => {
    for (const s of list) {
      if (isIf(s)) {
        const thenIds = new Set(available);
        const elseIds = new Set(available);
        collect(s.then ?? [], thenIds);
        collect(s.else ?? [], elseIds);
        for (const id of thenIds) if (elseIds.has(id)) available.add(id);
      }
      if (s.id) available.add(s.id);
    }
  };
  let list = steps;
  for (let i = 0; i < path.length; i += 2) {
    const index = path[i] as number;
    collect(list.slice(0, index), seen);
    const branch = path[i + 1] as Branch | undefined;
    const step = list[index];
    if (!branch || !isIf(step)) break;
    list = branch === "then" ? step.then : (step.else ?? []);
  }
  return [...seen];
}

export function defaultStep(verb: Verb): Step {
  const defaults: Record<Verb, Step> = {
    navigate: { navigate: "" },
    show: { show: "" },
    hide: { hide: "" },
    toggle: { toggle: "" },
    scroll: { scroll: "" },
    modal: { modal: "open" },
    toast: { toast: "" },
    copy: { copy: "" },
    download: { download: "" },
    animate: { animate: "", preset: "fadeIn" },
    class: { class: "toggle", target: "", name: "" },
    set: { set: "", to: "" },
    call: { call: "api", method: "GET", url: "" },
    submit: { submit: "" },
    reset: { reset: "" },
    wait: { wait: 500 },
    if: { if: "", then: [], else: [] },
    run: { run: "" },
    code: { code: "" },
  };
  return structuredClone(defaults[verb]);
}

const strip = (t: string) => t.replace(/^\s*\{\{\s*|\s*\}\}\s*$/g, "");
const or = (v: unknown) => (v === undefined || v === "" ? "…" : String(v));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One-line sentence for a step row. */
export function summarize(step: Step, nameOf: (id: string) => string | undefined): string {
  const s = step as Record<string, any>;
  const name = (id: unknown) =>
    typeof id !== "string" || id === "" ? "…" : id.includes("{{") ? id : (nameOf(id) ?? "missing element");
  switch (verbOf(step)) {
    case "navigate": return `Go to ${or(s.navigate)}`;
    case "show": return `Show ${name(s.show)}`;
    case "hide": return `Hide ${name(s.hide)}`;
    case "toggle": return `Toggle ${name(s.toggle)}`;
    case "scroll": return typeof s.scroll === "number" ? `Scroll to ${s.scroll}px` : `Scroll to ${name(s.scroll)}`;
    case "modal": return `${cap(s.modal)} modal ${s.target ? name(s.target) : "(this element)"}`;
    case "toast": return `Show toast "${or(s.toast)}"`;
    case "copy": return `Copy "${or(s.copy)}"`;
    case "download": return `Download ${or(s.download)}`;
    case "animate": return `Animate ${name(s.animate)} (${s.preset})`;
    case "class": return `${cap(s.class)} class ${or(s.name)} on ${name(s.target)}`;
    case "set": return `Set ${or(s.set)} = ${or(s.to)}`;
    case "call": return `Call API ${s.method} ${or(s.url)}${s.id ? ` → ${s.id}` : ""}`;
    case "submit": return `Submit ${name(s.submit)}`;
    case "reset": return `Reset ${name(s.reset)}`;
    case "wait": return `Wait ${s.wait} ms`;
    case "if": return `If ${or(strip(s.if ?? ""))}`;
    case "run": return `Run flow ${or(s.run)}`;
    case "code": return "Run code";
    default: return "Invalid step";
  }
}
