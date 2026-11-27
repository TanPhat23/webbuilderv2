import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { useEventModeStore, useIsEditingElement, useUpdateElement } from "@/features/editor";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { useEditorFlagsOptional } from "@/features/editor/components/context/EditorFlagsContext";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import { eventsStyle } from "./eventsStyle";
import { takeCaretRequest, type CaretPoint } from "./caretRequest";

interface UseCanvasElementOptions {
  /** Extra inline styles, applied over the element's own styles. */
  style?: React.CSSProperties;
}

type CaretDocument = Document & {
  caretPositionFromPoint?: (
    x: number,
    y: number,
  ) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

/** The collapsed range under `point`, when it falls inside `node`. */
function caretRangeAt(node: HTMLElement, point: CaretPoint): Range | null {
  const doc = node.ownerDocument as CaretDocument;
  let range: Range | null = null;
  if (typeof doc.caretPositionFromPoint === "function") {
    const position = doc.caretPositionFromPoint(point.x, point.y);
    if (position) {
      range = doc.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  } else if (typeof doc.caretRangeFromPoint === "function") {
    range = doc.caretRangeFromPoint(point.x, point.y);
  }
  return range && node.contains(range.startContainer) ? range : null;
}

/**
 * Focuses `node` and parks the caret under `point` when the document can
 * resolve it, otherwise after its last character.
 */
function focusWithCaret(node: HTMLElement, point: CaretPoint | null): void {
  node.focus();
  const view = node.ownerDocument.defaultView;
  const selection = view?.getSelection();
  if (!selection) return;
  let range = point ? caretRangeAt(node, point) : null;
  if (!range) {
    range = node.ownerDocument.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

export type CanvasElementRootProps = {
  id: string;
  ref: React.RefCallback<HTMLElement>;
  "data-element-id": string;
  "data-element-type": string;
  className: string | undefined;
  contentEditable: true | undefined;
  suppressContentEditableWarning: true;
  onBlur: (e: React.FocusEvent<HTMLElement>) => void;
  style: React.CSSProperties;
};

export interface UseCanvasElementResult {
  rootProps: CanvasElementRootProps;
  eventsActive: boolean;
  isEditing: boolean;
}

/**
 * Root-node props shared by element renderers: data attributes, the
 * element's own classes and styles, drag source and contentEditable state,
 * plus element event handlers. Spread `rootProps` onto the element's root
 * node.
 *
 * Hover, selection, drag & drop and the context menu are handled once for
 * the whole canvas (see useCanvasController), which finds elements through
 * `data-element-id`. The root node is the element itself, with no editor
 * wrapper, so it lays out exactly as in the preview.
 *
 * Selecting an element does not edit its text: inline editing starts only
 * when `editingElementId` names it (double click), and ends on blur/Escape.
 */
export function useCanvasElement(
  element: EditorElement,
  { style }: UseCanvasElementOptions = {},
): UseCanvasElementResult {
  const eventsActive = useEventModeStore(
    (state) => state.isEventModeEnabled && !state.disabledElementEvents.has(element.id),
  );
  const canEdit = useEditorFlagsOptional()?.canEdit ?? false;
  const isEditingThis = useIsEditingElement(element.id);
  const updateElement = useUpdateElement();
  const nodeRef = useRef<HTMLElement | null>(null);

  const isEditing =
    canEdit && isEditingThis && elementUtils.isEditableElement(element);

  useEffect(() => {
    if (isEditing && nodeRef.current) {
      focusWithCaret(nodeRef.current, takeCaretRequest(element.id));
    }
  }, [isEditing, element.id]);

  const setNode = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (!isEditing) return;
      const content = e.currentTarget.textContent ?? "";
      if (content !== element.content) {
        updateElement(element.id, { content });
      }
      useSelectionStore.getState().setEditingElementId(undefined);
    },
    [isEditing, element.id, element.content, updateElement],
  );

  const rootProps: CanvasElementRootProps = {
    id: element.id,
    ref: setNode,
    "data-element-id": element.id,
    "data-element-type": element.type,
    className: element.tailwindStyles,
    contentEditable: isEditing || undefined,
    suppressContentEditableWarning: true,
    onBlur,
    style: {
      ...style,
      ...eventsStyle(eventsActive),
    } as React.CSSProperties,
  };

  return { rootProps, eventsActive, isEditing };
}
