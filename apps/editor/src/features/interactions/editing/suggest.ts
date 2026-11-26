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

function suggestBracketElement(
  afterOpen: string,
  caret: number,
): { from: number; items: Suggestion[] } | null | undefined {
  const bracketElement = /el\['(?:\\.|[^'\\])*'\]\.([\w$]*)$/.exec(afterOpen);
  if (!bracketElement) return undefined;
  const prefix = bracketElement[0].slice(0, -bracketElement[1].length || undefined);
  const items = EL_FIELDS.filter((f) => starts(f, bracketElement[1]))
    .map((f) => ({ label: f, insert: `${prefix}${f}` }));
  return items.length ? { from: caret - bracketElement[0].length, items } : null;
}

function suggestRootChildren(
  root: string,
  prefix: string,
  ctx: SuggestContext,
): Suggestion[] {
  if (root === "vars") {
    return ctx.variables.filter((v) => starts(v, prefix)).map((v) => ({ label: v, insert: `vars.${v}` }));
  }
  if (root === "steps") {
    return ctx.stepIds.filter((v) => starts(v, prefix)).map((v) => ({ label: v, insert: `steps.${v}.` }));
  }
  if (root === "el") {
    return ctx.elements
      .filter((e) => starts(e.name, prefix) || starts(e.id, prefix))
      .map((e) => ({
        label: e.name,
        insert: /^[A-Za-z_$][\w$]*$/.test(e.id)
          ? `el.${e.id}.`
          : `el['${e.id.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'].`,
        detail: e.id,
      }));
  }
  if (root === "event") {
    return EVENT_FIELDS.filter((f) => starts(f, prefix)).map((f) => ({ label: f, insert: `event.${f}` }));
  }
  return [];
}

function suggestDotToken(
  token: string,
  ctx: SuggestContext,
): Suggestion[] {
  const [root, ...rest] = token.split(".");
  if (rest.length === 0) {
    return ROOTS.filter((r) => starts(r, root)).map((r) => ({ label: r, insert: r === "form" ? r : `${r}.` }));
  }
  if (rest.length === 1) {
    return suggestRootChildren(root, rest[0], ctx);
  }
  if (rest.length === 2) {
    const [name, p] = rest;
    const pool = root === "steps" ? STEP_FIELDS : root === "el" ? EL_FIELDS : [];
    return pool.filter((f) => starts(f, p)).map((f) => ({ label: f, insert: `${root}.${name}.${f}` }));
  }
  return [];
}

export function suggest(
  text: string,
  caret: number,
  ctx: SuggestContext,
): { from: number; items: Suggestion[] } | null {
  const before = text.slice(0, caret);
  const open = before.lastIndexOf("{{");
  if (open < 0 || before.indexOf("}}", open) >= 0) return null;
  const afterOpen = before.slice(open + 2);
  const bracketed = suggestBracketElement(afterOpen, caret);
  if (bracketed !== undefined) return bracketed;

  const token = /[A-Za-z_$][\w$]*(?:\.[\w$]*)*$/.exec(afterOpen)?.[0] ?? "";
  const items = suggestDotToken(token, ctx);
  return items.length ? { from: caret - token.length, items } : null;
}
