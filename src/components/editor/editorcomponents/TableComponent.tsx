"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  TableElement,
  TableSettings,
  TableColumnDefinition,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import ElementLoader from "../ElementLoader";
import { cn } from "@/lib/utils";
import { useEditorElement, eventsStyle } from "./shared";

const TableComponent = ({ element, data }: EditorComponentProps) => {
  const tableElement = element as TableElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(tableElement);

  const settings = (tableElement.settings ?? {}) as TableSettings;
  const caption = settings.caption;
  const bordered = settings.bordered ?? true;
  const striped = settings.striped ?? false;
  const hoverable = settings.hoverable ?? true;
  const compact = settings.compact ?? false;
  const columns: TableColumnDefinition[] = settings.columns ?? [];

  const cellPadding = compact ? "6px 10px" : "10px 16px";

  const headerCellStyle = (
    col: TableColumnDefinition,
  ): React.CSSProperties => ({
    padding: cellPadding,
    textAlign: (col.align as React.CSSProperties["textAlign"]) ?? "left",
    fontWeight: 600,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-secondary, #64748b)",
    backgroundColor: "var(--bg-table-header, #f8fafc)",
    borderBottom: bordered ? "2px solid rgba(15,23,42,0.08)" : "none",
    whiteSpace: "nowrap",
    ...(col.width
      ? { width: typeof col.width === "number" ? `${col.width}px` : col.width }
      : {}),
  });

  const hasChildren = tableElement.elements && tableElement.elements.length > 0;

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(tableElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "auto",
        ...eventsStyle(eventsActive),
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "auto",
        }}
      >
        {caption && (
          <caption
            style={{
              padding: compact ? "8px 10px" : "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text-secondary, #64748b)",
              textAlign: "left",
              captionSide: "top",
            }}
          >
            {caption}
          </caption>
        )}

        {columns.length > 0 && (
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id} style={headerCellStyle(col)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {hasChildren ? (
            <tr>
              <td colSpan={columns.length || 1} style={{ padding: 0 }}>
                <ElementLoader elements={tableElement.elements} data={data} />
              </td>
            </tr>
          ) : (
            <tr>
              <td
                colSpan={columns.length || 1}
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--text-muted, #94a3b8)",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.5 }}
                  >
                    <path d="M12 3v18" />
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M3 15h18" />
                  </svg>
                  <span>Drop elements here to populate the table</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(striped || hoverable) && (
        <style>{`
          [data-element-id="${element.id}"] tbody tr:nth-child(even) {
            ${striped ? "background-color: var(--bg-table-stripe, rgba(248,250,252,0.5));" : ""}
          }
          ${
            hoverable
              ? `[data-element-id="${element.id}"] tbody tr:hover {
                   background-color: var(--bg-table-hover, rgba(241,245,249,0.8));
                   transition: background-color 0.15s ease;
                 }`
              : ""
          }
        `}</style>
      )}
    </div>
  );
};

export default TableComponent;
