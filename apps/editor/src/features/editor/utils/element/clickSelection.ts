import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { findParentElement, getAncestorChain } from "./ancestors";

export interface ClickSelectionInput {
  readonly clickedId: string;
  readonly selectedId: string | undefined;
  /** Alt held when the press started. */
  readonly alt: boolean;
  /** Ctrl or Cmd held when the press started. */
  readonly mod: boolean;
}

/**
 * Which element a canvas click selects.
 * - Alt+click: the parent of the clicked element.
 * - Ctrl/Cmd+click on the selection (or inside it): the selection's parent, so
 *   repeating the click climbs one level at a time.
 * - Anything else: the clicked element.
 */
export function resolveClickSelection(
  elements: EditorElement[],
  { clickedId, selectedId, alt, mod }: ClickSelectionInput,
): string {
  if (alt) return findParentElement(elements, clickedId)?.id ?? clickedId;
  if (mod && selectedId !== undefined) {
    const insideSelection = getAncestorChain(elements, clickedId).some(
      (element) => element.id === selectedId,
    );
    if (insideSelection) return findParentElement(elements, selectedId)?.id ?? selectedId;
  }
  return clickedId;
}
