/**
 * Which interactions a DOM event should run. One listener on a wrapper node
 * receives every event; these helpers turn the event's target into the chain
 * of element ids it passed through and pick the matching interactions.
 *
 * Pure: the DOM is reached only through the ChainNode shape.
 */
import { isPlainObject, type Interaction, type InteractionMap, type OnEvent } from "../schema";

export function indexInteractions(
  tree: { id: string; settings?: unknown; elements?: unknown }[],
): Map<string, InteractionMap> {
  const index = new Map<string, InteractionMap>();
  const visit = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const el of list as { id: string; settings?: unknown; elements?: unknown }[]) {
      const settings = el.settings;
      const map = isPlainObject(settings) ? settings.interactions : undefined;
      if (isPlainObject(map) && Object.keys(map).length) index.set(el.id, map as InteractionMap);
      visit(el.elements);
    }
  };
  visit(tree);
  return index;
}

export interface ChainNode {
  parentElement: ChainNode | null;
  getAttribute?(name: string): string | null;
}

/** Element ids from the event target up to (not including) the root. */
export function chainIds(node: ChainNode | null, root: unknown): string[] {
  const out: string[] = [];
  let n = node;
  for (; n && n !== root; n = n.parentElement) {
    const id = n.getAttribute?.("data-element-id");
    if (id) out.push(id);
  }
  return n === root ? out : [];
}

/** Ids in `into` that are not in `from`: the elements the pointer entered (or left). */
export function enteredIds(into: string[], from: string[]): string[] {
  const before = new Set(from);
  return into.filter((id) => !before.has(id));
}

export interface Planned {
  elementId: string;
  ixId: string;
  ix: Interaction;
}

export function plan(
  index: Map<string, InteractionMap>,
  ids: string[],
  on: OnEvent,
  opts: { bubble: boolean; key?: string },
): { runs: Planned[]; preventDefault: boolean; stopPropagation: boolean } {
  const runs: Planned[] = [];
  let preventDefault = false;
  let stopPropagation = false;
  const pressed = opts.key?.toLowerCase();
  for (const elementId of ids) {
    const map = index.get(elementId);
    if (!map) continue;
    let stop = false;
    for (const [ixId, ix] of Object.entries(map)) {
      if (!isPlainObject(ix) || ix.on !== on || ix.enabled === false) continue;
      if (typeof ix.key === "string" && ix.key.toLowerCase() !== pressed) continue;
      runs.push({ elementId, ixId, ix });
      if (ix.preventDefault || (on === "submit" && ix.preventDefault !== false)) {
        preventDefault = true;
      }
      if (ix.stopPropagation) stop = stopPropagation = true;
    }
    if (stop && opts.bubble) break;
  }
  return { runs, preventDefault, stopPropagation };
}

/**
 * Native event type → interaction `on`, for events delegated from the host.
 * Handled separately by InteractionHost: mouseover/mouseout (enter/leave),
 * error (doesn't bubble, so a capture listener), load and visible (no DOM
 * event on the element).
 */
export const NATIVE_EVENTS: Record<string, OnEvent> = {
  click: "click",
  dblclick: "dblclick",
  mousedown: "mousedown",
  mouseup: "mouseup",
  focusin: "focus",
  focusout: "blur",
  change: "change",
  input: "input",
  submit: "submit",
  keydown: "keydown",
  keyup: "keyup",
};

/** Events that belong to the element itself, not its ancestors. */
export const SELF_ONLY: ReadonlySet<OnEvent> = new Set<OnEvent>(["focus", "blur", "error"]);

/** Element ids with an enabled `visible` interaction, and whether each should keep firing. */
export function visibleTargets(index: Map<string, InteractionMap>): Map<string, { repeat: boolean }> {
  const out = new Map<string, { repeat: boolean }>();
  for (const [elementId, map] of index) {
    for (const ix of Object.values(map)) {
      if (!isPlainObject(ix) || ix.on !== "visible" || ix.enabled === false) continue;
      const repeat = ix.once === false || out.get(elementId)?.repeat === true;
      out.set(elementId, { repeat });
    }
  }
  return out;
}

/**
 * Keep this tracker for the lifetime of a host. `take` marks each once-only
 * interaction when it is dispatched, independently of its neighbours.
 * Call `reconcile` after index changes so deleted interactions can be re-added.
 */
export function createVisibleTracker() {
  const fired = new Map<string, Set<string>>();
  return {
    take(index: Map<string, InteractionMap>, elementId: string): Planned[] {
      const runs = plan(index, [elementId], "visible", { bubble: false }).runs;
      let seen = fired.get(elementId);
      if (!seen) fired.set(elementId, (seen = new Set()));
      return runs.filter(({ ixId, ix }) => {
        if (ix.once === false) return true;
        if (seen!.has(ixId)) return false;
        seen!.add(ixId);
        return true;
      });
    },
    reconcile(index: Map<string, InteractionMap>): void {
      for (const [elementId, ids] of fired) {
        const map = index.get(elementId);
        for (const id of ids) {
          if (!map || !Object.hasOwn(map, id) || map[id]?.on !== "visible") ids.delete(id);
        }
        if (!ids.size) fired.delete(elementId);
      }
    },
  };
}
