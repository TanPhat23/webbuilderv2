import { replacePlaceholders } from "./replacePlaceholders";

interface ContentElement {
  content?: unknown;
}

export function resolveContent(
  element: ContentElement,
  data: unknown,
  isEditing: boolean,
): string {
  let content =
    (typeof data === "string" ? data : "") ||
    (typeof data === "object" && data && typeof (data as Record<string, unknown>).content === "string"
      ? (data as Record<string, string>).content
      : "") ||
    (typeof element.content === "string" ? element.content : "") ||
    "";

  if (typeof element.content === "string" && data && typeof data === "object") {
    content = replacePlaceholders(element.content, data);
  }

  return isEditing ? (element.content as string) ?? "" : content;
}
