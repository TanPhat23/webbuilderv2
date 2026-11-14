// src/features/interactions/codegen/validate.ts
/**
 * What `/api/generate-code` must refuse before turning user data into source:
 * malformed interactions on any element (at any depth) and malformed logic.
 * Incomplete steps are drafts and are allowed; the generator skips them.
 */
import { validateLogic } from "../logic";
import { isPlainObject, validateInteractionMap, type Issue } from "../schema";

const MAX_DEPTH = 64;

export function codegenRequestErrors(elements: unknown[], logic?: unknown): Issue[] {
  const issues: Issue[] = [];
  const walk = (list: unknown, at: string, depth: number) => {
    if (!Array.isArray(list)) return;
    if (depth > MAX_DEPTH) {
      issues.push({ path: at, message: "elements nested too deeply", level: "error" });
      return;
    }
    list.forEach((el, i) => {
      if (!isPlainObject(el)) return;
      const path = `${at}[${i}]`;
      if (isPlainObject(el.settings) && el.settings.interactions !== undefined) {
        issues.push(...validateInteractionMap(el.settings.interactions, `${path}.settings.interactions`));
      }
      walk(el.elements, `${path}.elements`, depth + 1);
    });
  };
  walk(elements, "elements", 0);
  if (logic !== undefined && logic !== null) {
    const value = isPlainObject(logic) ? logic : {};
    issues.push(...validateLogic({ v: 1, variables: value.variables ?? {}, flows: value.flows ?? {} }));
  }
  return issues.filter((i) => i.level === "error");
}
