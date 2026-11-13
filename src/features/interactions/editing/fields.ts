// src/features/interactions/editing/fields.ts
import {
  ANIMATION_PRESETS,
  HTTP_METHODS,
  TOAST_KINDS,
  VERBS,
  type Verb,
} from "../schema";

export type FieldKind =
  | "text" | "expr" | "element" | "number" | "boolean"
  | "select" | "variable" | "flow" | "code" | "headers";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  optional?: boolean;
  placeholder?: string;
}

const duration: FieldDef = { key: "duration", label: "Duration (ms)", kind: "number", optional: true };

export const FIELDS: Record<Verb, FieldDef[]> = {
  navigate: [
    { key: "navigate", label: "To", kind: "expr", placeholder: "/pricing or https://…" },
    { key: "newTab", label: "Open in new tab", kind: "boolean", optional: true },
    { key: "replace", label: "Replace history", kind: "boolean", optional: true },
  ],
  show: [{ key: "show", label: "Element", kind: "element" }, duration],
  hide: [{ key: "hide", label: "Element", kind: "element" }, duration],
  toggle: [{ key: "toggle", label: "Element", kind: "element" }, duration],
  scroll: [
    { key: "scroll", label: "To element", kind: "element" },
    { key: "offset", label: "Offset (px)", kind: "number", optional: true },
    { key: "smooth", label: "Smooth", kind: "boolean", optional: true },
  ],
  modal: [
    { key: "modal", label: "Action", kind: "select", options: ["open", "close"] },
    { key: "target", label: "Modal", kind: "element", optional: true },
  ],
  toast: [
    { key: "toast", label: "Message", kind: "expr" },
    { key: "kind", label: "Kind", kind: "select", options: TOAST_KINDS, optional: true },
    { key: "duration", label: "Duration (ms)", kind: "number", optional: true },
  ],
  copy: [{ key: "copy", label: "Text", kind: "expr" }],
  download: [
    { key: "download", label: "URL", kind: "expr" },
    { key: "filename", label: "File name", kind: "expr", optional: true },
  ],
  animate: [
    { key: "animate", label: "Element", kind: "element" },
    { key: "preset", label: "Animation", kind: "select", options: ANIMATION_PRESETS },
    { key: "duration", label: "Duration (ms)", kind: "number", optional: true },
  ],
  class: [
    { key: "class", label: "Action", kind: "select", options: ["add", "remove", "toggle"] },
    { key: "target", label: "Element", kind: "element" },
    { key: "name", label: "Class", kind: "text", placeholder: "is-open" },
  ],
  set: [
    { key: "set", label: "Variable", kind: "variable" },
    { key: "to", label: "Value", kind: "expr" },
  ],
  call: [
    { key: "method", label: "Method", kind: "select", options: HTTP_METHODS },
    { key: "url", label: "URL", kind: "expr", placeholder: "/api/signup" },
    { key: "body", label: "Body", kind: "expr", optional: true, placeholder: "{{ form }}" },
    { key: "headers", label: "Headers", kind: "headers", optional: true },
    { key: "timeout", label: "Timeout (ms)", kind: "number", optional: true },
  ],
  submit: [{ key: "submit", label: "Form", kind: "element" }],
  reset: [{ key: "reset", label: "Form", kind: "element" }],
  wait: [{ key: "wait", label: "Milliseconds", kind: "number" }],
  if: [{ key: "if", label: "Condition", kind: "expr", placeholder: "{{ steps.signup.ok }}" }],
  run: [{ key: "run", label: "Flow", kind: "flow" }],
  code: [{ key: "code", label: "JavaScript", kind: "code" }],
};

export const VERB_LABELS: Record<Verb, string> = {
  navigate: "Go to page or URL", show: "Show element", hide: "Hide element",
  toggle: "Toggle element", scroll: "Scroll to", modal: "Open or close modal",
  toast: "Show toast", copy: "Copy to clipboard", download: "Download file",
  animate: "Animate element", class: "Add, remove or toggle class",
  set: "Set variable", call: "Call API", submit: "Submit form", reset: "Reset form", wait: "Wait",
  if: "If / else", run: "Run flow", code: "Run code",
};

/** Verbs offered in the menu. set/run need something declared (Plan 2). */
export function menuVerbs(ctx: { variables: number; flows: number }): Verb[] {
  return VERBS.filter(
    (v) => (v !== "set" || ctx.variables > 0) && (v !== "run" || ctx.flows > 0),
  );
}

export function parseHeaders(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const at = line.indexOf(":");
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    if (key) Object.defineProperty(out, key, { value: line.slice(at + 1).trim(), enumerable: true, writable: true, configurable: true });
  }
  return out;
}

export const formatHeaders = (rec: Record<string, string>) =>
  Object.entries(rec)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
