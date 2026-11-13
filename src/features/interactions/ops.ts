// src/features/interactions/ops.ts
/**
 * The one way to change interactions: used by the Interact tab, and the
 * surface the in-app assistant and MCP server will call (later plans).
 *
 * Pure: takes an element, returns its next `settings` (or the issues that
 * block the change). `ops-store.ts` applies the result to the editor.
 *
 * Strict by default (agents): incomplete steps are rejected. The editor
 * passes `allowIncomplete` because a maker saves a step before filling it in.
 * Only issues inside the interaction being changed can block the change.
 */
import {
  isPlainObject,
  validateInteractionMap,
  type Interaction,
  type InteractionMap,
  type Issue,
  type OnEvent,
  type Step,
} from "./schema";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function newInteractionId(random: () => number = Math.random): string {
  let id = "ix_";
  for (let i = 0; i < 8; i++) id += ALPHABET[Math.floor(random() * 36) % 36];
  return id;
}

type HasSettings = { settings?: unknown } | null | undefined;

export function getInteractions(el: HasSettings): InteractionMap {
  const settings = el?.settings;
  if (!isPlainObject(settings)) return {};
  const map = settings.interactions;
  return isPlainObject(map) ? (map as InteractionMap) : {};
}

export const hasInteractions = (el: HasSettings) => Object.keys(getInteractions(el)).length > 0;

export interface OpOptions {
  allowIncomplete?: boolean;
}

export type OpResult =
  | { ok: true; settings: Record<string, unknown>; id?: string }
  | { ok: false; issues: Issue[] };

function finish(
  el: HasSettings,
  map: InteractionMap,
  touched: string | null,
  opts: OpOptions,
  id?: string,
): OpResult {
  const prefix = touched ? `interactions.${touched}` : null;
  const issues = validateInteractionMap(map).filter(
    (i) =>
      (!prefix || i.path === prefix || i.path.startsWith(`${prefix}.`)) &&
      (i.level === "error" || (i.level === "incomplete" && !opts.allowIncomplete)),
  );
  if (issues.length) return { ok: false, issues };
  const settings = { ...(isPlainObject(el?.settings) ? el!.settings : {}), interactions: map };
  return id ? { ok: true, settings, id } : { ok: true, settings };
}

export function addInteraction(
  el: HasSettings,
  on: OnEvent,
  steps: Step[] = [],
  opts: OpOptions = {},
  random?: () => number,
): OpResult {
  const map = getInteractions(el);
  let id = newInteractionId(random);
  for (let i = 0; i < 10 && Object.hasOwn(map, id); i++) id = newInteractionId(random);
  if (Object.hasOwn(map, id)) {
    return {
      ok: false,
      issues: [{ path: "interactions", message: "could not generate a unique interaction id", level: "error" }],
    };
  }
  return finish(el, { ...map, [id]: { on, do: steps } }, id, opts, id);
}

export function updateInteraction(
  el: HasSettings,
  ixId: string,
  patch: Partial<Interaction>,
  opts: OpOptions = {},
): OpResult {
  const map = getInteractions(el);
  if (!Object.hasOwn(map, ixId)) {
    return {
      ok: false,
      issues: [{ path: `interactions.${ixId}`, message: "no such interaction", level: "error" }],
    };
  }
  return finish(el, { ...map, [ixId]: { ...map[ixId], ...patch } }, ixId, opts);
}

export function removeInteraction(el: HasSettings, ixId: string): OpResult {
  const { [ixId]: _removed, ...rest } = getInteractions(el);
  return finish(el, rest, null, { allowIncomplete: true });
}
