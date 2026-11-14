// src/features/interactions/editing/logic-edit.ts
/** Form helpers for variable definitions in the Logic panel. */
import type { VariableDef } from "../runtime/variables";

export const VARIABLE_TYPES: VariableDef["type"][] = ["string", "number", "boolean", "object", "list"];

export function defaultFor(type: VariableDef["type"]): unknown {
  switch (type) {
    case "string": return "";
    case "number": return 0;
    case "boolean": return false;
    case "object": return {};
    case "list": return [];
  }
}

export const formatDefault = (type: VariableDef["type"], value: unknown): string =>
  type === "string" ? String(value ?? "") : JSON.stringify(value ?? null);

/** Parses what the maker typed into a default of the right type, or says why not. */
export function parseDefault(
  type: VariableDef["type"],
  text: string,
): { ok: true; value: unknown } | { ok: false; message: string } {
  if (type === "string") return { ok: true, value: text };
  if (type === "number") {
    const n = Number(text);
    return text.trim() !== "" && Number.isFinite(n) ? { ok: true, value: n } : { ok: false, message: "Enter a number" };
  }
  if (type === "boolean") {
    return text === "true" || text === "false" ? { ok: true, value: text === "true" } : { ok: false, message: "Use true or false" };
  }
  try {
    const value: unknown = JSON.parse(text);
    if (type === "list") return Array.isArray(value) ? { ok: true, value } : { ok: false, message: "Enter a JSON list like [1, 2]" };
    return value === null || (typeof value === "object" && !Array.isArray(value))
      ? { ok: true, value }
      : { ok: false, message: "Enter a JSON object like {\"a\": 1}, or null" };
  } catch {
    return { ok: false, message: "That isn't valid JSON" };
  }
}
