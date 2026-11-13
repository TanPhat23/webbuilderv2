// src/features/interactions/schema.ts
/**
 * The interaction format: what an element does when an event fires.
 *
 * Stored in `element.settings.interactions`, keyed by interaction id, so the
 * realtime server's per-key deep merge lets collaborators edit different
 * interactions on one element without overwriting each other.
 *
 * A step is an object with exactly one verb key. Validation is hand-routed
 * (find the verb, then check that verb's schema) so every issue carries a
 * precise path such as `interactions.ix_1.do[2].url`.
 */
import { z } from "zod";
import { templateErrors } from "./runtime/expression";

export const ON_EVENTS = [
  "click", "dblclick", "mousedown", "mouseup", "mouseenter", "mouseleave",
  "focus", "blur", "change", "input", "submit", "keydown", "keyup",
  "load", "error", "visible",
] as const;

/** Events whose interactions may filter on `key`. */
export const KEY_EVENTS: ReadonlySet<string> = new Set(["keydown", "keyup"]);
export type OnEvent = (typeof ON_EVENTS)[number];

export const NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
export const IX_ID_RE = /^ix_[a-z0-9]{8}$/;
export const TOAST_KINDS = ["success", "error", "info", "warning"] as const;
export const ANIMATION_PRESETS = ["fadeIn", "slideIn", "bounce", "pulse", "shake", "spin"] as const;
export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

type WithId = { id?: string };
export type IfStep = WithId & { if: string; then: Step[]; else?: Step[] };
export type CallStep = WithId & {
  call: "api";
  method: (typeof HTTP_METHODS)[number];
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
};
export type Step = WithId &
  (
    | { navigate: string; newTab?: boolean; replace?: boolean }
    | { show: string; duration?: number }
    | { hide: string; duration?: number }
    | { toggle: string; duration?: number }
    | { scroll: string | number; smooth?: boolean; offset?: number }
    | { modal: "open" | "close"; target?: string }
    | { toast: string; kind?: (typeof TOAST_KINDS)[number]; duration?: number }
    | { copy: string }
    | { download: string; filename?: string }
    | { animate: string; preset: (typeof ANIMATION_PRESETS)[number]; duration?: number }
    | { class: "add" | "remove" | "toggle"; target: string; name: string }
    | { set: string; to: string }
    | Omit<CallStep, "id">
    | { submit: string }
    | { reset: string }
    | { wait: number }
    | Omit<IfStep, "id">
    | { run: string }
    | { code: string }
  );

export interface Interaction {
  on: OnEvent;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** keydown/keyup only: run just for this KeyboardEvent.key (case-insensitive). */
  key?: string;
  /** visible only: run the first time only (default true). */
  once?: boolean;
  do: Step[];
}
export type InteractionMap = Record<string, Interaction>;

export interface Issue {
  path: string;
  message: string;
  level: "error" | "incomplete" | "warning";
}

const stepId = z.string().regex(NAME_RE, "must be a name like signup or step_2").optional();
const elementRef = z.string().min(1);
const nonEmpty = z.string().min(1);
const duration = z.number().nonnegative().optional();

export const VERB_SCHEMAS = {
  navigate: z.strictObject({ id: stepId, navigate: nonEmpty, newTab: z.boolean().optional(), replace: z.boolean().optional() }),
  show: z.strictObject({ id: stepId, show: elementRef, duration }),
  hide: z.strictObject({ id: stepId, hide: elementRef, duration }),
  toggle: z.strictObject({ id: stepId, toggle: elementRef, duration }),
  scroll: z.strictObject({ id: stepId, scroll: z.union([elementRef, z.number()]), smooth: z.boolean().optional(), offset: z.number().optional() }),
  modal: z.strictObject({ id: stepId, modal: z.enum(["open", "close"]), target: elementRef.optional() }),
  toast: z.strictObject({ id: stepId, toast: nonEmpty, kind: z.enum(TOAST_KINDS).optional(), duration: z.number().positive().optional() }),
  copy: z.strictObject({ id: stepId, copy: nonEmpty }),
  download: z.strictObject({ id: stepId, download: nonEmpty, filename: z.string().optional() }),
  animate: z.strictObject({ id: stepId, animate: elementRef, preset: z.enum(ANIMATION_PRESETS), duration: z.number().positive().optional() }),
  class: z.strictObject({
    id: stepId,
    class: z.enum(["add", "remove", "toggle"]),
    target: elementRef,
    name: z.string().regex(/^[A-Za-z0-9_:\-/[\].%]+$/, "one class name, no spaces"),
  }),
  set: z.strictObject({ id: stepId, set: z.string().regex(NAME_RE, "must be a variable name"), to: z.string() }),
  call: z.strictObject({
    id: stepId,
    call: z.literal("api"),
    method: z.enum(HTTP_METHODS),
    url: nonEmpty,
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
    timeout: z.number().positive().max(60_000).optional(),
  }),
  submit: z.strictObject({ id: stepId, submit: elementRef }),
  reset: z.strictObject({ id: stepId, reset: elementRef }),
  wait: z.strictObject({ id: stepId, wait: z.number().nonnegative().max(60_000) }),
  if: z.strictObject({ id: stepId, if: nonEmpty, then: z.array(z.unknown()), else: z.array(z.unknown()).optional() }),
  run: z.strictObject({ id: stepId, run: z.string().regex(NAME_RE, "must be a flow name") }),
  code: z.strictObject({ id: stepId, code: nonEmpty }),
} as const;

export type Verb = keyof typeof VERB_SCHEMAS;
export const VERBS = Object.keys(VERB_SCHEMAS) as Verb[];
const VERB_SET = new Set<string>(VERBS);

/** Fields that hold element ids (checked against the page in references.ts). */
export const ELEMENT_FIELDS: Partial<Record<Verb, string[]>> = {
  show: ["show"], hide: ["hide"], toggle: ["toggle"], scroll: ["scroll"],
  modal: ["target"], animate: ["animate"], class: ["target"], submit: ["submit"],
  reset: ["reset"],
};

/** Fields that may contain `{{ }}` templates. */
export const TEMPLATE_FIELDS: Record<Verb, string[]> = {
  navigate: ["navigate"], show: [], hide: [], toggle: [], scroll: [], modal: [],
  toast: ["toast"], copy: ["copy"], download: ["download", "filename"],
  animate: [], class: [], set: ["to"], call: ["url", "body"], submit: [],
  reset: [], wait: [], if: ["if"], run: [], code: [],
};

export const InteractionHead = z.strictObject({
  on: z.enum(ON_EVENTS),
  enabled: z.boolean().optional(),
  preventDefault: z.boolean().optional(),
  stopPropagation: z.boolean().optional(),
  key: z.string().min(1).optional(),
  once: z.boolean().optional(),
  do: z.array(z.unknown()),
});

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const prototype = Object.getPrototypeOf(v);
  return prototype === Object.prototype || prototype === null;
}

export function verbOf(step: unknown): Verb | null {
  if (!isPlainObject(step)) return null;
  const verbs = Object.keys(step).filter((k) => VERB_SET.has(k));
  return verbs.length === 1 ? (verbs[0] as Verb) : null;
}

function joinPath(base: string, segs: readonly PropertyKey[]): string {
  return segs.reduce<string>(
    (acc, s) => (typeof s === "number" ? `${acc}[${s}]` : `${acc}.${String(s)}`),
    base,
  );
}

function zodIssues(
  schema: z.ZodType,
  value: unknown,
  path: string,
  out: Issue[],
) {
  const r = schema.safeParse(value, { reportInput: true });
  if (r.success) return;
  for (const issue of r.error.issues) {
    const input = (issue as { input?: unknown }).input;
    const missing = input === undefined || input === "";
    out.push({
      path: joinPath(path, issue.path),
      message: missing ? "required" : issue.message,
      level: missing ? "incomplete" : "error",
    });
  }
}

const MAX_NESTING = 32;

function validateSteps(value: unknown, path: string, out: Issue[], depth: number) {
  if (!Array.isArray(value)) {
    out.push({ path, message: "must be a list of steps", level: "error" });
    return;
  }
  if (depth > MAX_NESTING) {
    out.push({ path, message: "steps nested too deeply", level: "error" });
    return;
  }
  value.forEach((step, i) => validateStep(step, `${path}[${i}]`, out, depth));
}

function validateStep(step: unknown, path: string, out: Issue[], depth: number) {
  if (!isPlainObject(step)) {
    out.push({ path, message: "must be a step object", level: "error" });
    return;
  }
  const verbs = Object.keys(step).filter((k) => VERB_SET.has(k));
  if (verbs.length !== 1) {
    out.push({
      path,
      message: verbs.length
        ? `has more than one action: ${verbs.join(", ")}`
        : `needs one action: ${VERBS.join(", ")}`,
      level: "error",
    });
    return;
  }
  const verb = verbs[0] as Verb;
  zodIssues(VERB_SCHEMAS[verb], step, path, out);
  for (const field of TEMPLATE_FIELDS[verb]) {
    const v = step[field];
    if (typeof v !== "string") continue;
    for (const message of templateErrors(v)) {
      out.push({ path: `${path}.${field}`, message, level: "incomplete" });
    }
  }
  if (verb === "call" && isPlainObject(step.headers)) {
    for (const [k, v] of Object.entries(step.headers)) {
      if (typeof v !== "string") continue;
      for (const message of templateErrors(v)) {
        out.push({ path: `${path}.headers.${k}`, message, level: "incomplete" });
      }
    }
  }
  if (verb === "if") {
    if (step.then !== undefined) validateSteps(step.then, `${path}.then`, out, depth + 1);
    if (step.else !== undefined) validateSteps(step.else, `${path}.else`, out, depth + 1);
  }
}

/** Every structural and syntax issue in an interactions map. */
export function validateInteractionMap(value: unknown, at = "interactions"): Issue[] {
  if (value === undefined) return [];
  const out: Issue[] = [];
  if (!isPlainObject(value)) {
    out.push({ path: at, message: "must be an object keyed by interaction id", level: "error" });
    return out;
  }
  for (const [ixId, ix] of Object.entries(value)) {
    const path = `${at}.${ixId}`;
    if (!IX_ID_RE.test(ixId)) {
      out.push({ path, message: "interaction ids look like ix_ab12cd34", level: "error" });
    }
    if (!isPlainObject(ix)) {
      out.push({ path, message: "must be an interaction object", level: "error" });
      continue;
    }
    zodIssues(InteractionHead, ix, path, out);
    if (ix.key !== undefined && !KEY_EVENTS.has(String(ix.on))) {
      out.push({ path: `${path}.key`, message: "key only applies to keydown and keyup", level: "error" });
    }
    if (ix.once !== undefined && ix.on !== "visible") {
      out.push({ path: `${path}.once`, message: "once only applies to visible", level: "error" });
    }
    if (Array.isArray(ix.do)) validateSteps(ix.do, `${path}.do`, out, 0);
  }
  return out;
}
