import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface ContentElement {
  content?: unknown;
}

export function resolveContent(
  element: ContentElement,
  data: Record<string, unknown> | undefined,
  isEditing: boolean,
): string {
  let content =
    (typeof data === "string" ? data : "") ||
    (typeof data === "object" && data && typeof data.content === "string"
      ? data.content
      : "") ||
    (typeof element.content === "string" ? element.content : "") ||
    "";

  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }

  return isEditing ? (element.content as string) ?? "" : content;
}
