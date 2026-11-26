import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import TextView, { sanitizeTextContent } from "@webbuilder/site-runtime/elements/views/TextView";
import { useCanvasElement } from "./useCanvasElement";

export { sanitizeTextContent };

export function TextElementShell({ element, data }: EditorComponentProps) {
  const { rootProps, isEditing } = useCanvasElement(element);
  if (element.type !== "Text" && element.type !== "Span" && element.type !== "Label" &&
      element.type !== "Heading" && element.type !== "Blockquote") return null;
  return <TextView element={element} rootProps={rootProps} data={isEditing ? undefined : data} mode="edit" />;
}
