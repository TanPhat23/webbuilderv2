import { replacePlaceholders } from "./replacePlaceholders";

interface ContentElement {
  content?: unknown;
}

export function resolveContent(
  element: ContentElement,
  data: unknown,
  isEditing: boolean,
): string {
  const rawContent = typeof element.content === "string" ? element.content : "";
  const dataContent =
    typeof data === "string"
      ? data
      : data && typeof data === "object" && "content" in data && typeof data.content === "string"
        ? data.content
        : "";

  let content = dataContent || rawContent;

  if (rawContent && data && typeof data === "object") {
    content = replacePlaceholders(rawContent, data);
  }

  return isEditing ? rawContent : content;
}
