/** Matches the data-element-id attribute the site runtime puts on every element node. */
function findElementNode(doc: Document, elementId: string): HTMLElement | null {
  for (const node of doc.querySelectorAll<HTMLElement>("[data-element-id]")) {
    if (node.getAttribute("data-element-id") === elementId) return node;
  }
  return null;
}

/**
 * Opens the editor context menu for an element from the keyboard by
 * dispatching a contextmenu event at the centre of its node. Inside the site
 * iframe that goes through routeSiteContextMenu like a real right-click.
 * Returns false when the element has no node in this document.
 */
export function openElementContextMenu(doc: Document, elementId: string): boolean {
  const node = findElementNode(doc, elementId);
  const view = doc.defaultView;
  if (!node || !view) return false;
  const rect = node.getBoundingClientRect();
  node.dispatchEvent(
    new view.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view,
      button: 2,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    }),
  );
  return true;
}
