import React from "react";
import type { CodeElement } from "@/features/editor/interfaces/elements.interface";
import { resolveContent } from "@/features/editor/utils/element/resolveContent";
import type { ViewProps } from "../view-props";

export default function CodeView({ element, rootProps, data }: ViewProps<CodeElement>) {
  const content = resolveContent(element, data, false);
  return element.settings?.preformatted
    ? <pre {...rootProps}><code>{content}</code></pre>
    : <code {...rootProps}>{content}</code>;
}
