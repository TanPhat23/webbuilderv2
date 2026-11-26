import React from "react";
import { LayoutGroup } from "framer-motion";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import ListView from "@webbuilder/site-runtime/elements/views/ListView";
import { ChildElements } from "../context/ChildElementLoaderContext";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function ListComponent({ element, data }: EditorComponentProps) {
  const { rootProps } = useCanvasElement(element);
  if (element.type !== "List") return null;
  return <LayoutGroup>
    <ListView element={element} rootProps={rootProps} data={data} mode="edit">
      {Array.isArray(data) ? data.map((item, index) => (
        <ChildElements key={index} elements={element.elements} data={item} />
      )) : <ChildElements elements={element.elements} data={data} />}
    </ListView>
  </LayoutGroup>;
}
