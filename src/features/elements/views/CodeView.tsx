import React from "react";
import type { CodeElement } from "@/types/elements";
import { resolveContent } from "../lib/resolveContent";
import type { ViewProps } from "../view-props";

export default function CodeView({ element, rootProps, data }: ViewProps<CodeElement>) {
  const content = resolveContent(element, data, false);
  return element.settings?.preformatted
    ? <pre {...rootProps}><code>{content}</code></pre>
    : <code {...rootProps}>{content}</code>;
}
