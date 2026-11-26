import DOMPurify from "isomorphic-dompurify";

const ALLOWED_RICH_TEXT_TAGS: readonly string[] = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
  "span",
  "div",
];

const FORBIDDEN_RICH_TEXT_TAGS: readonly string[] = [
  "script",
  "style",
  "iframe",
];

const ALLOWED_RICH_TEXT_ATTRS: readonly string[] = ["href", "target", "rel"];

export function sanitizeRichTextHtml(html: string): string {
  if (!html) {
    return "";
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_RICH_TEXT_TAGS],
    FORBID_TAGS: [...FORBIDDEN_RICH_TEXT_TAGS],
    ALLOWED_ATTR: [...ALLOWED_RICH_TEXT_ATTRS],
  });
}

const HTML_ENTITY_MAP: Readonly<Record<string, string>> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export function stripHtmlToPreview(html: string): string {
  if (!html) {
    return "";
  }
  const withoutTags = html
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const decoded = withoutTags.replace(
    /&(?:nbsp|amp|lt|gt|quot|#39);/g,
    (entity) => HTML_ENTITY_MAP[entity] ?? entity,
  );
  return decoded.replace(/\s+/g, " ").trim();
}

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}
