import React from "react";
import type { TableElement } from "@/features/editor/interfaces/elements.interface";
import type { ViewProps } from "../view-props";

export default function TableView({ element, rootProps, children }: ViewProps<TableElement>) {
  const { caption, columns } = element.settings ?? {};
  return (
    <div {...rootProps}>
      <table className="w-full">
        {caption && <caption>{caption}</caption>}
        {!!columns?.length && <thead><tr>
          {columns.map((column) => (
            <th key={column.id} style={{ textAlign: column.align, width: column.width }}>{column.header}</th>
          ))}
        </tr></thead>}
        <tbody><tr><td colSpan={columns?.length || 1}>{children}</td></tr></tbody>
      </table>
    </div>
  );
}
