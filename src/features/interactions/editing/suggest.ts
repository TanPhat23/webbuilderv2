// src/features/interactions/editing/suggest.ts
/** Autocomplete for `{{ … }}` fields: roots, then names under each root. */
export interface SuggestContext {
  variables: string[];
  stepIds: string[];
  elements: { id: string; name: string }[];
}

export interface Suggestion {
  label: string;
  insert: string;
  detail?: string;
}

const ROOTS = ["vars", "steps", "el", "event", "form"];
const STEP_FIELDS = ["ok", "status", "data", "error"];
const EL_FIELDS = ["value", "checked", "visible", "text"];
const EVENT_FIELDS = ["value", "checked", "key"];

const starts = (s: string, prefix: string) => s.toLowerCase().startsWith(prefix.toLowerCase());

export function suggest(
  text: string,
  caret: number,
  ctx: SuggestContext,
): { from: number; items: Suggestion[] } | null {
  const before = text.slice(0, caret);
  const open = before.lastIndexOf("{{");
  if (open < 0 || before.indexOf("}}", open) >= 0) return null;
  const bracketElement = /el\['(?:\\.|[^'\\])*'\]\.([\w$]*)$/.exec(before.slice(open + 2));
  if (bracketElement) {
    const prefix = bracketElement[0].slice(0, -bracketElement[1].length || undefined);
    const items = EL_FIELDS.filter((f) => starts(f, bracketElement[1]))
      .map((f) => ({ label: f, insert: `${prefix}${f}` }));
    return items.length ? { from: caret - bracketElement[0].length, items } : null;
  }
  const token = /[A-Za-z_$][\w$]*(?:\.[\w$]*)*$/.exec(before.slice(open + 2))?.[0] ?? "";
  const from = caret - token.length;
  const [root, ...rest] = token.split(".");
  let items: Suggestion[] = [];

  if (rest.length === 0) {
    items = ROOTS.filter((r) => starts(r, root)).map((r) => ({ label: r, insert: `${r}.` }));
  } else if (rest.length === 1) {
    const p = rest[0];
    if (root === "vars") {
      items = ctx.variables.filter((v) => starts(v, p)).map((v) => ({ label: v, insert: `vars.${v}` }));
    } else if (root === "steps") {
      items = ctx.stepIds.filter((v) => starts(v, p)).map((v) => ({ label: v, insert: `steps.${v}.` }));
    } else if (root === "el") {
      items = ctx.elements
        .filter((e) => starts(e.name, p) || starts(e.id, p))
        .map((e) => ({ label: e.name, insert: /^[A-Za-z_$][\w$]*$/.test(e.id)
          ? `el.${e.id}.` : `el['${e.id.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'].`, detail: e.id }));
    } else if (root === "event") {
      items = EVENT_FIELDS.filter((f) => starts(f, p)).map((f) => ({ label: f, insert: `event.${f}` }));
    }
  } else if (rest.length === 2) {
    const [name, p] = rest;
    const pool = root === "steps" ? STEP_FIELDS : root === "el" ? EL_FIELDS : [];
    items = pool.filter((f) => starts(f, p)).map((f) => ({ label: f, insert: `${root}.${name}.${f}` }));
  }
  return items.length ? { from, items } : null;
}
