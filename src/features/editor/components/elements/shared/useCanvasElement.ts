import type React from "react";
import type { EditorElement } from "@/types/global.type";
import { useElementInteraction } from "@/features/editor/hooks/element/useElementInteraction";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement } from "./useEditorElement";
import { eventsStyle } from "./eventsStyle";

interface UseCanvasElementOptions {
  /** Stretch to the resize wrapper (width/height 100%). Default true. */
  fill?: boolean;
  /** Extra inline styles, applied over the element's own styles. */
  style?: React.CSSProperties;
}

/**
 * Root-node props shared by element renderers: workflow event ref/handlers,
 * selection/hover/contentEditable handlers, data attributes and styles.
 * Spread `rootProps` onto the element's root node.
 */
export function useCanvasElement(
  element: EditorElement,
  { fill = true, style }: UseCanvasElementOptions = {},
) {
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });
  const { getCommonProps } = useElementInteraction();
  const commonProps = getCommonProps(element);

  const rootProps = {
    ref: elementRef as React.Ref<any>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...commonProps,
    ...eventHandlers,
    style: {
      ...elementHelper.getSafeStyles(element),
      ...(fill ? { width: "100%", height: "100%" } : { width: "100%" }),
      ...style,
      ...eventsStyle(eventsActive),
    } as React.CSSProperties,
  };

  return {
    rootProps,
    eventsActive,
    isEditing: !!commonProps.contentEditable,
  };
}
