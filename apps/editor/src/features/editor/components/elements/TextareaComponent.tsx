import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import TextareaView from "@webbuilder/site-runtime/elements/views/TextareaView";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function TextareaComponent({ element }: EditorComponentProps) {
  const { rootProps, eventsActive } = useCanvasElement(element);
  if (element.type !== "Textarea") return null;
  return <TextareaView element={element} mode="edit"
    rootProps={eventsActive ? { ...rootProps, disabled: false } : rootProps} />;
}
