import { getAncestorChain } from "../utils/element/ancestors";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

/** Longest element text copied into an agent reference. */
export const AGENT_REFERENCE_TEXT_LIMIT = 500;

const ELLIPSIS = "…";

function clipText(raw: string): string {
  const flat = raw.replace(/\s+/g, " ").trim();
  if (flat.length <= AGENT_REFERENCE_TEXT_LIMIT) return flat;
  return flat.slice(0, AGENT_REFERENCE_TEXT_LIMIT - ELLIPSIS.length) + ELLIPSIS;
}

function label(element: EditorElement): string {
  const name = element.name?.trim();
  return name ? `${element.type} "${name}"` : element.type;
}

/** Root-to-element chain; just the element when it is not in the tree. */
function ancestry(element: EditorElement, elements: EditorElement[]): EditorElement[] {
  const chain = getAncestorChain(elements, element.id).reverse();
  return chain.length > 0 ? chain : [element];
}

/**
 * Markdown block that tells an AI agent which element to edit through the
 * webbuilder MCP tools. Lines whose value is empty are omitted.
 */
export function buildAgentReference(
  element: EditorElement,
  elements: EditorElement[],
): string {
  const content = typeof element.content === "string" ? clipText(element.content) : "";
  const classes =
    typeof element.tailwindStyles === "string" ? element.tailwindStyles.trim() : "";
  const fields: ReadonlyArray<readonly [string, string | undefined]> = [
    ["Element ID", element.id],
    ["Type", element.type],
    ["Name", element.name?.trim()],
    ["Page ID", element.pageId],
    ["Path", ancestry(element, elements).map(label).join(" › ")],
    ["Classes", classes],
    ["Text", content],
  ];
  return [
    "Webbuilder element reference",
    ...fields.filter(([, value]) => value).map(([key, value]) => `- ${key}: ${value}`),
    "Edit this element with the webbuilder MCP tools, targeting the Element ID above.",
  ].join("\n");
}
