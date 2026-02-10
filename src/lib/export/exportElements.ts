import React from "react";
import ReactDOMServer from "react-dom/server";
import { getComponentMap } from "@/constants/elements";
import type { EditorElement } from "@/types/global.type";
import type { EditorComponentProps } from "@/interfaces/editor.interface";

/**
 * Render a collection of editor elements to a static HTML string.
 *
 * Notes / caveats:
 * - This attempts to render the same components used in the editor via
 *   `getComponentMap`. For server-side export to work reliably those components
 *   must be server-renderable (i.e. avoid client-only hooks or `use client`-only
 *   components). If some components are client-only, you'll need to provide
 *   server-safe templates/serializers for them instead.
 *
 * - The function is synchronous and returns the raw HTML string produced by
 *   React's `renderToStaticMarkup`.
 *
 * @param elements Editor elements to render
 * @param data Optional shared data passed through to components as `data`
 * @returns HTML string
 */
export function exportElementsToHtml(
  elements: EditorElement[],
  data?: any,
): string {
  const nodes = elements.map((element) => {
    const commonProps: EditorComponentProps = { element, data };
    const Component = getComponentMap(commonProps);

    if (!Component) {
      return React.createElement(
        "div",
        {
          key: element.id,
          "data-unknown-element": element.type,
        },
        `<!-- Unknown element: ${element.type} -->`,
      );
    }

    return React.createElement(Component, { key: element.id, ...commonProps });
  });

  try {
    const fragment = React.createElement(React.Fragment, null, ...nodes);
    return ReactDOMServer.renderToStaticMarkup(fragment);
  } catch (err) {
    console.error("exportElementsToHtml failed:", err);
    return "";
  }
}

export default exportElementsToHtml;
