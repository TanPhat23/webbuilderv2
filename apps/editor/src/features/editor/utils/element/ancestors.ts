import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

/** Longest text shown in a layer label, ellipsis included. */
export const LAYER_LABEL_TEXT_LIMIT = 24;

const ELLIPSIS = "…";

/** Collapses whitespace and cuts to `limit` characters, ellipsis included. */
export function clipText(raw: string, limit: number): string {
  const flat = raw.replace(/\s+/g, " ").trim();
  return flat.length <= limit ? flat : flat.slice(0, limit - ELLIPSIS.length) + ELLIPSIS;
}

/** Fills `trail` with the path from a root down to `id`; false when `id` is absent. */
function trace(nodes: readonly EditorElement[], id: string, trail: EditorElement[]): boolean {
  for (const node of nodes) {
    trail.push(node);
    if (node.id === id) return true;
    const kids = (node as { elements?: unknown }).elements;
    if (Array.isArray(kids) && trace(kids as EditorElement[], id, trail)) return true;
    trail.pop();
  }
  return false;
}

/**
 * `id`'s element followed by every ancestor, innermost first, up to the page
 * root, from the element's position in the tree (not the possibly stale
 * `parentId` field). Empty when `id` is not in the tree.
 */
export function getAncestorChain(elements: EditorElement[], id: string): EditorElement[] {
  const trail: EditorElement[] = [];
  return trace(elements, id, trail) ? trail.reverse() : [];
}

/** The element that contains `id`. Undefined for a page root or unknown id. */
export function findParentElement(
  elements: EditorElement[],
  id: string,
): EditorElement | undefined {
  return getAncestorChain(elements, id)[1];
}

/** `Type "name"`, else `Type "short text"`, else just the type. */
export function layerLabel(element: EditorElement): string {
  const name = element.name?.trim();
  const text =
    typeof element.content === "string"
      ? clipText(element.content.replace(/<[^>]*>/g, " "), LAYER_LABEL_TEXT_LIMIT)
      : "";
  const detail = name || text;
  return detail ? `${element.type} "${detail}"` : element.type;
}
