import type React from "react";
import { useCallback } from "react";
import type { EditorElement } from "@/types/global.type";
import { useIsSelected, useUpdateElement } from "@/features/editor";
import { useEditorFlagsOptional } from "@/features/editor/components/context/EditorFlagsContext";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement } from "./useEditorElement";
import { eventsStyle } from "./eventsStyle";

interface UseCanvasElementOptions {
  /** Extra inline styles, applied over the element's own styles. */
  style?: React.CSSProperties;
}

/**
 * Root-node props shared by element renderers: data attributes, the
 * element's own classes and styles, drag source and contentEditable state,
 * plus workflow event handlers. Spread `rootProps` onto the element's root
 * node.
 *
 * Hover, selection, drag & drop and the context menu are handled once for
 * the whole canvas (see CanvasInteractionLayer), which finds elements through
 * `data-element-id`. The root node is the element itself, with no editor
 * wrapper, so it lays out exactly as in the preview.
 */
export function useCanvasElement(
  element: EditorElement,
  { style }: UseCanvasElementOptions = {},
) {
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });
  const canEdit = useEditorFlagsOptional()?.canEdit ?? false;
  const isSelected = useIsSelected(element.id);
  const updateElement = useUpdateElement();

  const isEditing =
    canEdit && isSelected && elementHelper.isEditableElement(element);

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (!isEditing) return;
      const content = e.currentTarget.textContent ?? "";
      if (content !== element.content) {
        updateElement(element.id, { content });
      }
    },
    [isEditing, element.id, element.content, updateElement],
  );

  const rootProps = {
    ref: elementRef as React.Ref<any>,
    id: element.id,
    "data-element-id": element.id,
    "data-element-type": element.type,
    className: element.tailwindStyles,
    draggable: canEdit && !isEditing,
    contentEditable: isEditing || undefined,
    suppressContentEditableWarning: true,
    onBlur,
    ...eventHandlers,
    style: {
      ...elementHelper.getSafeStyles(element),
      ...style,
      ...eventsStyle(eventsActive),
    } as React.CSSProperties,
  };

  return { rootProps, eventsActive, isEditing };
}
