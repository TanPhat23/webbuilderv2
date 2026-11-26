import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import ChoiceInputView from "@webbuilder/site-runtime/elements/views/ChoiceInputView";
import { useCanvasElement } from "./useCanvasElement";

export function ChoiceInputComponent({ element }: EditorComponentProps) {
  const { rootProps, eventsActive } = useCanvasElement(element);
  if (element.type !== "Checkbox" && element.type !== "Radio") return null;
  return <ChoiceInputView element={element} rootProps={rootProps} mode="edit" enableDisabledInput={eventsActive} />;
}
