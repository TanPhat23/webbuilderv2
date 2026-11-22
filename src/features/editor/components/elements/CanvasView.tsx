import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import { getView } from "@/features/elements/registry";
import { getViewChildren } from "@/features/elements/element-children";
import { ChildElements } from "../context/ChildElementLoaderContext";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function CanvasView({ element, data }: EditorComponentProps) {
  const { rootProps, isEditing } = useCanvasElement(element);
  const View = getView(element.type);
  if (!View) return null;

  const elements = getViewChildren(element);
  const children = element.type === "Carousel"
    ? elements?.map((slide, index) => <ChildElements key={slide.id || index} elements={[slide]} data={data} />)
    : elements?.length ? <ChildElements elements={elements} data={data} /> : undefined;
  return <View element={element} rootProps={rootProps} data={isEditing ? undefined : data} mode="edit">{children}</View>;
}
