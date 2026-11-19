import React from "react";
import DOMPurify from "isomorphic-dompurify";
import type { EditorElement } from "@/types/global.type";
import { resolveContent } from "@/features/editor/utils/element/resolveContent";
import type { ViewProps } from "../view-props";

type Text = Extract<EditorElement, { type: "Text" | "Span" | "Label" | "Heading" | "Blockquote" }>;
const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function sanitizeTextContent(content: string): string {
  return DOMPurify.sanitize(content);
}

export default function TextView({ element, rootProps, data }: ViewProps<Text>) {
  const content = resolveContent(element, data, false);
  const Tag = element.type === "Text" ? "div"
    : element.type === "Heading" ? headings[(element.settings?.level ?? 2) - 1] ?? "h2"
    : element.type === "Label" ? "label" : element.type === "Blockquote" ? "blockquote" : "span";

  return <Tag {...rootProps}
    htmlFor={element.type === "Label" ? element.settings?.htmlFor : undefined}
    cite={element.type === "Blockquote" ? element.settings?.cite : undefined}
    dangerouslySetInnerHTML={{ __html: sanitizeTextContent(content) }} />;
}
