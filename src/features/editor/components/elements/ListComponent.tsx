import React from "react";
import { LayoutGroup } from "framer-motion";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import ListView from "@/features/elements/views/ListView";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function ListComponent({ element, data }: EditorComponentProps) {
  const { rootProps } = useCanvasElement(element);
  if (element.type !== "List") return null;
  return <LayoutGroup>
    <ListView element={element} rootProps={rootProps} data={data} mode="edit">
      {Array.isArray(data) ? data.map((item, index) => (
        <ElementLoader key={index} elements={element.elements} data={item} />
      )) : <ElementLoader elements={element.elements} data={data} />}
    </ListView>
  </LayoutGroup>;
}
