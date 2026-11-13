/** Non-blocking warnings for references that cannot be resolved on this page. */
import {
  ELEMENT_FIELDS,
  TEMPLATE_FIELDS,
  isPlainObject,
  verbOf,
  type InteractionMap,
  type Issue,
} from "./schema";
import { templateRefs } from "./runtime/expression";

export interface RefContext {
  elementIds: ReadonlySet<string>;
  variables: ReadonlySet<string>;
  flows: ReadonlySet<string>;
}

export function referenceWarnings(map: InteractionMap, ctx: RefContext, at = "interactions"): Issue[] {
  const out: Issue[] = [];
  const warn = (path: string, message: string) => out.push({ path, message, level: "warning" });
  const checkTemplate = (text: string, path: string, seen: ReadonlySet<string>) => {
    for (const [root, name] of templateRefs(text)) {
      if (!name) continue;
      if (root === "vars" && !ctx.variables.has(name)) warn(path, `no variable named ${name}`);
      if (root === "el" && !ctx.elementIds.has(name)) warn(path, `missing element ${name}`);
      if (root === "steps" && !seen.has(name)) warn(path, `no earlier step with id ${name}`);
    }
  };

  const walk = (steps: unknown, path: string, seen: Set<string>, depth: number): void => {
    // Match the validation limit; also avoid recursive malformed input hanging the editor.
    if (!Array.isArray(steps) || depth > 32) return;
    steps.forEach((raw, i) => {
      const verb = verbOf(raw);
      if (!verb || !isPlainObject(raw)) return;
      const p = `${path}[${i}]`;
      for (const field of ELEMENT_FIELDS[verb] ?? []) {
        const value = raw[field];
        if (typeof value === "string" && value && !value.includes("{{") && !ctx.elementIds.has(value)) {
          warn(`${p}.${field}`, `missing element ${value}`);
        }
      }
      if (verb === "set" && typeof raw.set === "string" && raw.set && !ctx.variables.has(raw.set)) {
        warn(`${p}.set`, `no variable named ${raw.set}`);
      }
      if (verb === "run" && typeof raw.run === "string" && raw.run && !ctx.flows.has(raw.run)) {
        warn(`${p}.run`, `no flow named ${raw.run}`);
      }
      for (const field of TEMPLATE_FIELDS[verb]) {
        const value = raw[field];
        if (typeof value === "string") checkTemplate(value, `${p}.${field}`, seen);
      }
      if (verb === "call" && isPlainObject(raw.headers)) {
        for (const [name, value] of Object.entries(raw.headers)) {
          if (typeof value === "string") checkTemplate(value, `${p}.headers.${name}`, seen);
        }
      }
      if (verb === "if") {
        // Only ids present after both paths have definitely run after the conditional.
        const thenSeen = new Set(seen);
        const elseSeen = new Set(seen);
        walk(raw.then, `${p}.then`, thenSeen, depth + 1);
        walk(raw.else, `${p}.else`, elseSeen, depth + 1);
        for (const id of thenSeen) if (elseSeen.has(id)) seen.add(id);
      }
      if (typeof raw.id === "string" && raw.id) seen.add(raw.id);
    });
  };

  for (const [ixId, ix] of Object.entries(map)) {
    if (isPlainObject(ix)) walk(ix.do, `${at}.${ixId}.do`, new Set(), 0);
  }
  return out;
}
