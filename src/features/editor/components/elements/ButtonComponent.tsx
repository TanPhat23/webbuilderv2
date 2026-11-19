import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import ButtonView from "@/features/elements/views/ButtonView";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function ButtonComponent({ element }: EditorComponentProps) {
  const { rootProps } = useCanvasElement(element);
  if (element.type !== "Button") return null;
  const preventNavigation = (event: React.MouseEvent<HTMLElement>) => {
    if (event.currentTarget.tagName === "A") event.preventDefault();
  };
  return <ButtonView element={element}
    rootProps={{ ...rootProps, onClick: preventNavigation, onAuxClick: preventNavigation }} mode="edit" />;
}
