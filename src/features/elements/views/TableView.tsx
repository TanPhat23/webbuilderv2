import React from "react";
import type { TableElement } from "@/types/elements";
import { cn } from "@/lib/utils";
import type { ViewProps } from "../view-props";

export default function TableView({ element, rootProps, children }: ViewProps<TableElement>) {
  const { caption, columns, bordered, striped, hoverable, compact } =
    element.settings ?? {};
  const tableClassName = cn(
    "w-full",
    bordered && "border border-border [&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border",
    striped && "[&_tbody_tr:nth-child(even)]:bg-muted/30",
    hoverable && "[&_tbody_tr:hover]:bg-muted/40",
    compact
      ? "[&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1"
      : "[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2",
  );

  return (
    <div {...rootProps}>
      <table className={tableClassName}>
        {caption && <caption>{caption}</caption>}
        {!!columns?.length && (
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{ textAlign: column.align, width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          <tr>
            <td colSpan={columns?.length || 1}>{children}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
