import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import SelectView from "@/features/elements/views/SelectView";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function SelectComponent({ element }: EditorComponentProps) {
  const { rootProps, eventsActive } = useCanvasElement(element);
  if (element.type !== "Select") return null;
  return <SelectView element={element} mode="edit"
    rootProps={eventsActive ? { ...rootProps, disabled: false } : rootProps} />;
}
