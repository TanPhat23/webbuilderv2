import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default from "react";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input, B as Button } from "./prisma-Cq49YOYM.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Table, FileText, Settings2, Columns3, Plus, ArrowUpDown, Paintbrush, Type, GripVertical, ChevronUp, ChevronDown, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { A as AccordionSection, C as ConfigField, c as ConfigEmpty, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
import { v4 } from "uuid";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "clsx";
import "class-variance-authority";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
const ALIGN_OPTIONS = [
  { value: "left", label: "Left", icon: /* @__PURE__ */ jsx(AlignLeft, { className: "h-3 w-3" }) },
  {
    value: "center",
    label: "Center",
    icon: /* @__PURE__ */ jsx(AlignCenter, { className: "h-3 w-3" })
  },
  { value: "right", label: "Right", icon: /* @__PURE__ */ jsx(AlignRight, { className: "h-3 w-3" }) }
];
function ColumnEditor({
  column,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) {
  const handleChange = (field, value) => {
    onChange({ ...column, [field]: value });
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "rounded-lg border transition-all duration-150",
        isExpanded ? "border-border bg-muted/10 shadow-sm" : "border-border/40 bg-background hover:border-border/60"
      ),
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onToggleExpand,
            className: cn(
              "flex items-center gap-2 w-full px-2.5 py-1.5 text-left transition-colors",
              "hover:bg-muted/30 rounded-t-lg",
              !isExpanded && "rounded-b-lg"
            ),
            children: [
              /* @__PURE__ */ jsx(GripVertical, { className: "h-3 w-3 text-muted-foreground/30 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground/50 tabular-nums w-4 shrink-0", children: index + 1 }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-foreground/80 truncate flex-1", children: column.header || "Untitled Column" }),
              column.accessor && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground shrink-0", children: column.accessor }),
              isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3 text-muted-foreground/40 shrink-0" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 text-muted-foreground/40 shrink-0" })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxs("div", { className: "px-2.5 pb-2.5 pt-1 flex flex-col gap-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: [
          /* @__PURE__ */ jsx(SectionDivider, {}),
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Header",
              htmlFor: `col-header-${column.id}`,
              hint: "The visible text displayed in the table header row.",
              children: /* @__PURE__ */ jsx(
                Input,
                {
                  id: `col-header-${column.id}`,
                  type: "text",
                  value: column.header || "",
                  onChange: (e) => handleChange("header", e.target.value),
                  placeholder: "Column Name",
                  className: "h-7 w-full max-w-[130px] px-2 text-[11px] rounded-md",
                  autoComplete: "off"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Accessor",
              htmlFor: `col-accessor-${column.id}`,
              hint: "The data field key that maps to this column. Used to extract values from data rows.",
              children: /* @__PURE__ */ jsx(
                Input,
                {
                  id: `col-accessor-${column.id}`,
                  type: "text",
                  value: column.accessor || "",
                  onChange: (e) => handleChange("accessor", e.target.value || void 0),
                  placeholder: "fieldKey",
                  className: "h-7 w-full max-w-[130px] px-2 text-[11px] font-mono rounded-md",
                  autoComplete: "off"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Width",
              htmlFor: `col-width-${column.id}`,
              hint: "Column width. Use a number for pixels or a string like '25%', 'auto', '1fr', etc.",
              children: /* @__PURE__ */ jsx(
                Input,
                {
                  id: `col-width-${column.id}`,
                  type: "text",
                  value: column.width ?? "",
                  onChange: (e) => {
                    const raw = e.target.value;
                    const asNum = Number(raw);
                    handleChange(
                      "width",
                      raw === "" ? void 0 : !isNaN(asNum) && raw.trim() === String(asNum) ? asNum : raw
                    );
                  },
                  placeholder: "auto",
                  className: "h-7 w-[80px] px-1.5 text-[11px] font-mono text-center rounded-md",
                  autoComplete: "off"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Align",
              htmlFor: `col-align-${column.id}`,
              hint: "Text alignment for this column's cells.",
              children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: ALIGN_OPTIONS.map((opt) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleChange("align", opt.value),
                  title: opt.label,
                  className: cn(
                    "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-100",
                    "border border-transparent",
                    (column.align ?? "left") === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60 hover:bg-muted/50 hover:text-muted-foreground"
                  ),
                  children: opt.icon
                },
                opt.value
              )) })
            }
          ),
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Sortable",
              htmlFor: `col-sortable-${column.id}`,
              hint: "Allow users to sort the table by this column.",
              children: /* @__PURE__ */ jsx(
                Switch,
                {
                  id: `col-sortable-${column.id}`,
                  checked: !!column.sortable,
                  onCheckedChange: (checked) => handleChange("sortable", !!checked),
                  className: "scale-75 origin-right"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(SectionDivider, {}),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  onClick: onMoveUp,
                  disabled: isFirst,
                  className: "h-6 w-6 p-0",
                  title: "Move up",
                  children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  onClick: onMoveDown,
                  disabled: isLast,
                  className: "h-6 w-6 p-0",
                  title: "Move down",
                  children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                onClick: onRemove,
                className: "h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10",
                title: "Remove column",
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3 mr-1" }),
                  "Remove"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function TableConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [expandedColumnId, setExpandedColumnId] = React__default.useState(null);
  if (!selectedElement || selectedElement.type !== "Table") {
    return null;
  }
  const element = selectedElement;
  const settings = element.settings ?? {};
  const columns = settings.columns ?? [];
  const updateSetting = (key, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value }
    });
  };
  const handleCaptionChange = (e) => {
    updateSetting("caption", e.target.value || void 0);
  };
  const addColumn = () => {
    const newColumn = {
      id: v4(),
      header: `Column ${columns.length + 1}`,
      accessor: void 0,
      width: void 0,
      align: "left",
      sortable: false
    };
    const updated = [...columns, newColumn];
    updateSetting("columns", updated);
    setExpandedColumnId(newColumn.id);
  };
  const updateColumn = (index, updated) => {
    const next = [...columns];
    next[index] = updated;
    updateSetting("columns", next);
  };
  const removeColumn = (index) => {
    const next = columns.filter((_, i) => i !== index);
    updateSetting("columns", next.length > 0 ? next : void 0);
    if (columns[index]?.id === expandedColumnId) {
      setExpandedColumnId(null);
    }
  };
  const moveColumn = (index, direction) => {
    const next = [...columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateSetting("columns", next);
  };
  const hasCaption = !!settings.caption && settings.caption.length > 0;
  const sortableCount = columns.filter((c) => c.sortable).length;
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "table-settings", className: "border-border/40", children: [
    /* @__PURE__ */ jsx(
      AccordionTrigger,
      {
        className: cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90"
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Table, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Table Settings" }),
          columns.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums", children: [
            columns.length,
            " col",
            columns.length !== 1 ? "s" : ""
          ] }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: [
      /* @__PURE__ */ jsxs(
        Accordion,
        {
          type: "multiple",
          defaultValue: ["general", "columns", "appearance"],
          className: "w-full",
          children: [
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "general",
                title: "General",
                icon: /* @__PURE__ */ jsx(Settings2, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Caption",
                      htmlFor: "table-caption",
                      hint: "An accessible caption for the table. Rendered as a <caption> element above the table. Important for screen readers to understand the table's purpose.",
                      vertical: true,
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "table-caption",
                          type: "text",
                          value: settings.caption ?? "",
                          onChange: handleCaptionChange,
                          placeholder: "Table description...",
                          className: "h-7 w-full px-2 text-[11px] rounded-md",
                          autoComplete: "off"
                        }
                      )
                    }
                  ),
                  hasCaption ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                    /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3 text-emerald-500/60" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600/60 dark:text-emerald-400/60", children: "Caption set — accessible to screen readers" })
                  ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                    /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3 text-amber-500/60" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: "Add a caption for better accessibility" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "columns",
                title: "Columns",
                icon: /* @__PURE__ */ jsx(Columns3, {}),
                badge: columns.length > 0 ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums", children: columns.length }) : void 0,
                nested: true,
                children: [
                  columns.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5", children: columns.map((col, index) => /* @__PURE__ */ jsx(
                    ColumnEditor,
                    {
                      column: col,
                      index,
                      isExpanded: expandedColumnId === col.id,
                      onToggleExpand: () => setExpandedColumnId(
                        expandedColumnId === col.id ? null : col.id
                      ),
                      onChange: (updated) => updateColumn(index, updated),
                      onRemove: () => removeColumn(index),
                      onMoveUp: () => moveColumn(index, "up"),
                      onMoveDown: () => moveColumn(index, "down"),
                      isFirst: index === 0,
                      isLast: index === columns.length - 1
                    },
                    col.id
                  )) }) : /* @__PURE__ */ jsx(
                    ConfigEmpty,
                    {
                      icon: /* @__PURE__ */ jsx(Columns3, { className: "h-5 w-5" }),
                      message: "No columns defined. Add columns to configure the table structure."
                    }
                  ),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      onClick: addColumn,
                      className: "w-full h-7 text-[11px] gap-1.5",
                      children: [
                        /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                        "Add Column"
                      ]
                    }
                  ),
                  columns.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(SectionDivider, {}),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                        /* @__PURE__ */ jsx(Columns3, { className: "h-2.5 w-2.5" }),
                        columns.length,
                        " column",
                        columns.length !== 1 ? "s" : ""
                      ] }),
                      sortableCount > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                        /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-2.5 w-2.5" }),
                        sortableCount,
                        " sortable"
                      ] })
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "appearance",
                title: "Appearance",
                icon: /* @__PURE__ */ jsx(Paintbrush, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Bordered",
                      htmlFor: "table-bordered",
                      hint: "Add visible borders around each cell in the table.",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "table-bordered",
                          checked: !!settings.bordered,
                          onCheckedChange: (checked) => updateSetting("bordered", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Striped rows",
                      htmlFor: "table-striped",
                      hint: "Alternate row background colors for improved readability.",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "table-striped",
                          checked: !!settings.striped,
                          onCheckedChange: (checked) => updateSetting("striped", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Hover highlight",
                      htmlFor: "table-hoverable",
                      hint: "Highlight rows when the user hovers over them.",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "table-hoverable",
                          checked: !!settings.hoverable,
                          onCheckedChange: (checked) => updateSetting("hoverable", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Compact",
                      htmlFor: "table-compact",
                      hint: "Reduce cell padding for a more dense, compact table layout.",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "table-compact",
                          checked: !!settings.compact,
                          onCheckedChange: (checked) => updateSetting("compact", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                    settings.bordered && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "bordered" }),
                    settings.striped && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "striped" }),
                    settings.hoverable && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "hoverable" }),
                    settings.compact && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "compact" }),
                    !settings.bordered && !settings.striped && !settings.hoverable && !settings.compact && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Paintbrush, { className: "h-3 w-3 text-muted-foreground/40" }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "Default appearance — no special styles" })
                    ] })
                  ] })
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, { className: "mt-2" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Table, { className: "h-2.5 w-2.5" }),
          "<table>"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums", children: [
          /* @__PURE__ */ jsx(Columns3, { className: "h-2.5 w-2.5" }),
          columns.length,
          " col",
          columns.length !== 1 ? "s" : ""
        ] }),
        hasCaption && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Type, { className: "h-2.5 w-2.5" }),
          "captioned"
        ] }),
        sortableCount > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums", children: [
          /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-2.5 w-2.5" }),
          sortableCount,
          " sortable"
        ] })
      ] })
    ] })
  ] });
}
export {
  TableConfiguration as default
};
