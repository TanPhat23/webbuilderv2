import React from "react";
import { Table2 } from "lucide-react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import { getView } from "@webbuilder/site-runtime/elements/registry";
import { ChildElements } from "../context/ChildElementLoaderContext";
import { useCanvasElement } from "./shared/useCanvasElement";

export default function TableComponent({ element, data }: EditorComponentProps) {
  const { rootProps } = useCanvasElement(element);
  const View = getView("Table");
  if (element.type !== "Table" || !View) return null;
  return (
    <View element={element} rootProps={rootProps} mode="edit">
      {element.elements?.length ? <ChildElements elements={element.elements} data={data} /> : (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
          <Table2 className="size-8 opacity-50" />
          <span>Drop elements here to populate the table</span>
        </div>
      )}
    </View>
  );
}
