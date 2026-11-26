import type { EditorElement } from "../types/global.type";

export function getViewChildren(element: EditorElement): EditorElement[] | undefined {
  if (element.type === "Select") return undefined;
  return "elements" in element && Array.isArray(element.elements) ? element.elements : undefined;
}
