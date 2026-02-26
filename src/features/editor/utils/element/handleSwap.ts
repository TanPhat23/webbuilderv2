import { EditorElement } from "@/types/global.type";
import { elementHelper } from "./elementhelper";

/**
 * Handles swapping two elements in the editor tree.
 * Uses the elementHelper.mapSwapChildrenById for clean, efficient swapping.
 *
 * @param draggingElement - The element being dragged
 * @param hoveredElement - The element being hovered over
 * @param elements - The root elements array
 * @param setElements - Callback to update elements
 */
export function handleSwap(
  draggingElement: EditorElement,
  hoveredElement: EditorElement,
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void,
): void {
  if (!hoveredElement || draggingElement.id === hoveredElement.id) {
    return;
  }

  if (draggingElement.parentId !== hoveredElement.parentId) {
    return;
  }

  // Use the helper to perform the swap
  const updatedElements = elementHelper.mapSwapChildrenById(
    elements,
    draggingElement.parentId ?? null,
    draggingElement.id,
    hoveredElement.id,
  );

  // Check if swap actually occurred (elements were found and swapped)
  if (updatedElements !== elements) {
    setElements(updatedElements);
  }
}
