import { elementTree } from "@webbuilder/site-runtime/elements/lib/element-tree-helper";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

/** Longest text shown in a layer label, ellipsis included. */
export const LAYER_LABEL_TEXT_LIMIT = 24;

const ELLIPSIS = "…";

/**
 * The element that contains `id`, from its position in the tree (not the
 * possibly stale `parentId` field). Undefined for a page root or unknown id.
 */
export function findParentElement(
  elements: EditorElement[],
  id: string,
): EditorElement | undefined {
  const parentId = elementTree.findLocation(elements, id)?.parentId;
  return parentId ? elementTree.findById(elements, parentId) : undefined;
}

/**
 * `id`'s element followed by every ancestor, innermost first, up to the page
 * root. Empty when `id` is not in the tree.
 */
export function getAncestorChain(elements: EditorElement[], id: string): EditorElement[] {
  const chain: EditorElement[] = [];
  let current = elementTree.findById(elements, id);
  while (current) {
    chain.push(current);
    current = findParentElement(elements, current.id);
  }
  return chain;
}

function shortText(content: unknown): string {
  if (typeof content !== "string") return "";
  const flat = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return flat.length <= LAYER_LABEL_TEXT_LIMIT
    ? flat
    : flat.slice(0, LAYER_LABEL_TEXT_LIMIT - ELLIPSIS.length) + ELLIPSIS;
}

/** `Type "name"`, else `Type "short text"`, else just the type. */
export function layerLabel(element: EditorElement): string {
  const name = element.name?.trim();
  const detail = name ? name : shortText(element.content);
  return detail ? `${element.type} "${detail}"` : element.type;
}
