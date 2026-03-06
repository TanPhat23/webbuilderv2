import { jsx, jsxs } from "react/jsx-runtime";
import { A as Accordion } from "./accordion-Dg3retHz.js";
import { aj as Tooltip, ak as TooltipTrigger, j as cn, al as TooltipContent, I as Input, O as Label, ai as TooltipProvider, B as Button, k as elementHelper, p as projectService, f as Badge } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Square, Rows3, LayoutGrid, Scissors, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, GripHorizontal, GripVertical, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, WrapText, Columns3, Pipette, ChevronsUpDown, Check, CornerUpLeft, Link2, Link2Off, Type, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, Underline, Strikethrough, ChevronUp, ChevronDown, AlignHorizontalDistributeStart, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignVerticalDistributeStart, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd, FlipHorizontal2, FlipVertical2, Layers, MapPin, Ruler, Palette, BoxSelect, SunDim, Box, Image, Move3D, Sparkles, Paintbrush, Code2, AppWindow, Smartphone, Tablet, Monitor, TvMinimalPlay } from "lucide-react";
import { T as ToggleGroup, a as ToggleGroupItem, C as ConfigField, A as AccordionSection, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
import { C as Checkbox } from "./checkbox-BX2VzNwa.js";
import "clsx";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { S as Slider } from "./slider-Cs09bDyX.js";
import { useQuery } from "@tanstack/react-query";
import "sonner";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DKb-aivU.js";
import { C as Command, a as CommandInput, c as CommandEmpty } from "./editorprovider-R8xfLE4-.js";
import { Command as Command$1 } from "cmdk";
import { S as Separator } from "./separator-4Scmx0hq.js";
import { T as Textarea } from "./textarea-BDhK7YnG.js";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "tailwind-merge";
import "react-hook-form";
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
import "yjs";
import "y-indexeddb";
import "events";
import "y-protocols/awareness";
import "./page-Cy1amgId.js";
import "./scroll-area-BYa8i-Jn.js";
import "./card-LOcGasZb.js";
import "./dropdown-menu-B0s9PypA.js";
import "date-fns";
import "./avatar-vyaRObia.js";
const DISPLAY_OPTIONS = [
  { value: "block", label: "Block", icon: Square },
  { value: "flex", label: "Flex", icon: Rows3 },
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "none", label: "None", icon: Scissors }
];
function DisplayModeToggle({ value, onChange }) {
  return /* @__PURE__ */ jsx(
    ToggleGroup,
    {
      type: "single",
      value,
      onValueChange: (val) => {
        if (val) onChange(val);
      },
      className: "w-full h-8 gap-0 rounded-lg bg-muted/50 p-0.5",
      children: DISPLAY_OPTIONS.map((option) => {
        const Icon = option.icon;
        return /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
            ToggleGroupItem,
            {
              value: option.value,
              "aria-label": option.label,
              className: cn(
                "flex-1 h-7 rounded-md text-muted-foreground",
                "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              ),
              children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
            }
          ) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: option.label })
        ] }, option.value);
      })
    }
  );
}
const DIRECTION_OPTIONS = [
  { value: "row", label: "Row", icon: ArrowRight },
  { value: "column", label: "Column", icon: ArrowDown },
  { value: "row-reverse", label: "Row Reverse", icon: ArrowLeft },
  { value: "column-reverse", label: "Column Reverse", icon: ArrowUp }
];
function FlexDirectionToggle({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsx(
    ToggleGroup,
    {
      type: "single",
      value,
      onValueChange: (val) => {
        if (val) onChange(val);
      },
      className: "w-full h-8 gap-0 rounded-lg bg-muted/50 p-0.5",
      children: DIRECTION_OPTIONS.map((option) => {
        const Icon = option.icon;
        return /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
            ToggleGroupItem,
            {
              value: option.value,
              "aria-label": option.label,
              className: cn(
                "flex-1 h-7 rounded-md text-muted-foreground",
                "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              ),
              children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
            }
          ) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: option.label })
        ] }, option.value);
      })
    }
  );
}
const JUSTIFY_VALUES = ["flex-start", "center", "flex-end"];
const ALIGN_VALUES = ["flex-start", "center", "flex-end"];
function AlignmentMatrix({
  justifyContent,
  alignItems,
  onBatchUpdate,
  className
}) {
  const currentJustify = justifyContent || "flex-start";
  const currentAlign = alignItems || "flex-start";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "rounded-lg border border-border/60 bg-background p-1 shrink-0",
        className
      ),
      children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-0", children: ALIGN_VALUES.map(
        (align) => JUSTIFY_VALUES.map((justify) => {
          const isActive = currentJustify === justify && currentAlign === align;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onBatchUpdate({
                justifyContent: justify,
                alignItems: align
              }),
              className: cn(
                "w-6 h-6 flex items-center justify-center rounded-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
              ),
              "aria-pressed": isActive,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "rounded-full transition-all",
                    isActive ? "w-2 h-2 bg-primary shadow-sm shadow-primary/30" : "w-1.5 h-1.5 bg-current"
                  )
                }
              )
            },
            `${justify}-${align}`
          );
        })
      ) })
    }
  );
}
function CompactInput$1({
  label,
  icon,
  iconTooltip,
  iconTooltipSide = "left",
  value,
  onChange,
  placeholder = "auto",
  badge,
  className,
  type = "text"
}) {
  const prefixContent = icon ? iconTooltip ? /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center text-muted-foreground/60 shrink-0", children: icon }) }),
    /* @__PURE__ */ jsx(TooltipContent, { side: iconTooltipSide, className: "text-[11px]", children: iconTooltip })
  ] }) : /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center text-muted-foreground/60 shrink-0", children: icon }) : label ? /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground select-none shrink-0", children: label }) : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 h-8",
        className
      ),
      children: [
        prefixContent,
        /* @__PURE__ */ jsx(
          Input,
          {
            type,
            value,
            onChange: (e) => onChange(e.target.value),
            placeholder,
            className: "h-6 border-0 bg-transparent px-0.5 text-[11px] font-mono shadow-none focus-visible:ring-0",
            autoComplete: "off"
          }
        ),
        badge && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 select-none shrink-0", children: badge })
      ]
    }
  );
}
function SizeRow({ width, height, updateStyle }) {
  const widthStr = width?.toString() || "auto";
  const heightStr = height?.toString() || "auto";
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
    /* @__PURE__ */ jsx(
      CompactInput$1,
      {
        label: "W",
        value: widthStr,
        onChange: (val) => updateStyle("width", val),
        placeholder: "auto",
        badge: widthStr === "100%" ? "Fill" : void 0
      }
    ),
    /* @__PURE__ */ jsx(
      CompactInput$1,
      {
        label: "H",
        value: heightStr,
        onChange: (val) => updateStyle("height", val),
        placeholder: "auto"
      }
    )
  ] });
}
function GapControls({
  gap,
  rowGap,
  columnGap,
  updateStyle,
  gapPlaceholder = "0",
  subGapPlaceholder = "—"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 flex-1 min-w-0", children: [
    /* @__PURE__ */ jsx(
      CompactInput$1,
      {
        icon: /* @__PURE__ */ jsx(GripHorizontal, { className: "h-3 w-3" }),
        iconTooltip: "Gap",
        iconTooltipSide: "left",
        value: gap?.toString() || "",
        onChange: (val) => updateStyle("gap", val),
        placeholder: gapPlaceholder
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
      /* @__PURE__ */ jsx(
        CompactInput$1,
        {
          icon: /* @__PURE__ */ jsx(GripVertical, { className: "h-3 w-3" }),
          iconTooltip: "Row Gap",
          iconTooltipSide: "left",
          value: rowGap?.toString() || "",
          onChange: (val) => updateStyle("rowGap", val),
          placeholder: subGapPlaceholder
        }
      ),
      /* @__PURE__ */ jsx(
        CompactInput$1,
        {
          icon: /* @__PURE__ */ jsx(GripHorizontal, { className: "h-3 w-3" }),
          iconTooltip: "Column Gap",
          iconTooltipSide: "left",
          value: columnGap?.toString() || "",
          onChange: (val) => updateStyle("columnGap", val),
          placeholder: subGapPlaceholder
        }
      )
    ] })
  ] });
}
function CompactPaddingRow({
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  updateStyle
}) {
  const horizontalValue = paddingLeft?.toString() || paddingRight?.toString() || "0";
  const verticalValue = paddingTop?.toString() || paddingBottom?.toString() || "0";
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
    /* @__PURE__ */ jsx(
      CompactInput$1,
      {
        icon: /* @__PURE__ */ jsx(AlignHorizontalJustifyCenter, { className: "h-3 w-3" }),
        iconTooltip: "Horizontal Padding (Left & Right)",
        iconTooltipSide: "bottom",
        value: horizontalValue,
        onChange: (val) => {
          updateStyle("paddingLeft", val);
          updateStyle("paddingRight", val);
        },
        placeholder: "0"
      }
    ),
    /* @__PURE__ */ jsx(
      CompactInput$1,
      {
        icon: /* @__PURE__ */ jsx(AlignVerticalJustifyCenter, { className: "h-3 w-3" }),
        iconTooltip: "Vertical Padding (Top & Bottom)",
        iconTooltipSide: "bottom",
        value: verticalValue,
        onChange: (val) => {
          updateStyle("paddingTop", val);
          updateStyle("paddingBottom", val);
        },
        placeholder: "0"
      }
    )
  ] });
}
function ClipContentCheck({
  overflow,
  updateStyle,
  idSuffix = ""
}) {
  const id = `clip-content${idSuffix ? `-${idSuffix}` : ""}`;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-0.5", children: [
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        id,
        checked: overflow === "hidden",
        onCheckedChange: (checked) => updateStyle("overflow", checked ? "hidden" : "visible"),
        className: "h-3.5 w-3.5"
      }
    ),
    /* @__PURE__ */ jsx(
      Label,
      {
        htmlFor: id,
        className: "text-[11px] font-medium text-muted-foreground select-none cursor-pointer",
        children: "Clip content"
      }
    )
  ] });
}
function WrapToggle({ flexWrap, updateStyle }) {
  const isWrap = flexWrap === "wrap";
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => updateStyle("flexWrap", isWrap ? "nowrap" : "wrap"),
        className: cn(
          "h-8 w-8 flex items-center justify-center rounded-md border border-border/60 shrink-0 transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isWrap ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-muted-foreground hover:text-foreground"
        ),
        "aria-label": isWrap ? "Disable wrap" : "Enable wrap",
        "aria-pressed": isWrap,
        children: /* @__PURE__ */ jsx(WrapText, { className: "h-3.5 w-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "right", className: "text-[11px]", children: isWrap ? "Wrap (on)" : "Wrap (off)" })
  ] });
}
function DisplaySection({
  styles,
  updateStyle,
  batchUpdateStyle
}) {
  const display = styles.display || "block";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
    /* @__PURE__ */ jsx(
      DisplayModeToggle,
      {
        value: display,
        onChange: (val) => updateStyle("display", val)
      }
    ),
    display === "flex" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200", children: [
      /* @__PURE__ */ jsx(
        FlexDirectionToggle,
        {
          value: styles.flexDirection || "row",
          onChange: (val) => updateStyle("flexDirection", val)
        }
      ),
      /* @__PURE__ */ jsx(
        SizeRow,
        {
          width: styles.width,
          height: styles.height,
          updateStyle
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5", children: [
        /* @__PURE__ */ jsx(
          AlignmentMatrix,
          {
            justifyContent: styles.justifyContent,
            alignItems: styles.alignItems,
            onBatchUpdate: batchUpdateStyle
          }
        ),
        /* @__PURE__ */ jsx(
          GapControls,
          {
            gap: styles.gap,
            rowGap: styles.rowGap,
            columnGap: styles.columnGap,
            updateStyle
          }
        ),
        /* @__PURE__ */ jsx(
          WrapToggle,
          {
            flexWrap: styles.flexWrap,
            updateStyle
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        CompactPaddingRow,
        {
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          updateStyle
        }
      ),
      /* @__PURE__ */ jsx(
        ClipContentCheck,
        {
          overflow: styles.overflow,
          updateStyle,
          idSuffix: "flex"
        }
      )
    ] }),
    display === "grid" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200", children: [
      /* @__PURE__ */ jsx(
        SizeRow,
        {
          width: styles.width,
          height: styles.height,
          updateStyle
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsx(
          CompactInput$1,
          {
            icon: /* @__PURE__ */ jsx(Columns3, { className: "h-3 w-3" }),
            iconTooltip: "Columns",
            iconTooltipSide: "left",
            value: styles.gridTemplateColumns?.toString() || "",
            onChange: (val) => updateStyle("gridTemplateColumns", val),
            placeholder: "e.g. 1fr 1fr"
          }
        ),
        /* @__PURE__ */ jsx(
          CompactInput$1,
          {
            icon: /* @__PURE__ */ jsx(Rows3, { className: "h-3 w-3" }),
            iconTooltip: "Rows",
            iconTooltipSide: "left",
            value: styles.gridTemplateRows?.toString() || "",
            onChange: (val) => updateStyle("gridTemplateRows", val),
            placeholder: "e.g. auto 1fr"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsx(
          CompactInput$1,
          {
            icon: /* @__PURE__ */ jsx(GripHorizontal, { className: "h-3 w-3" }),
            iconTooltip: "Gap",
            iconTooltipSide: "left",
            value: styles.gap?.toString() || "",
            onChange: (val) => updateStyle("gap", val),
            placeholder: "8px"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
          /* @__PURE__ */ jsx(
            CompactInput$1,
            {
              icon: /* @__PURE__ */ jsx(GripVertical, { className: "h-3 w-3" }),
              iconTooltip: "Row Gap",
              iconTooltipSide: "left",
              value: styles.rowGap?.toString() || "",
              onChange: (val) => updateStyle("rowGap", val),
              placeholder: "8px"
            }
          ),
          /* @__PURE__ */ jsx(
            CompactInput$1,
            {
              icon: /* @__PURE__ */ jsx(GripHorizontal, { className: "h-3 w-3" }),
              iconTooltip: "Column Gap",
              iconTooltipSide: "left",
              value: styles.columnGap?.toString() || "",
              onChange: (val) => updateStyle("columnGap", val),
              placeholder: "16px"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/70 select-none px-0.5", children: "Justify" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: styles.justifyItems || "stretch",
              onValueChange: (value) => updateStyle("justifyItems", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Justify" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "stretch", children: "Stretch" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "start", children: "Start" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "center", children: "Center" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "end", children: "End" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/70 select-none px-0.5", children: "Align" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: styles.alignItems || "stretch",
              onValueChange: (value) => updateStyle("alignItems", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Align" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "stretch", children: "Stretch" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "start", children: "Start" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "center", children: "Center" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "end", children: "End" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        ClipContentCheck,
        {
          overflow: styles.overflow,
          updateStyle,
          idSuffix: "grid"
        }
      )
    ] }),
    display !== "flex" && display !== "grid" && display !== "none" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200", children: [
      /* @__PURE__ */ jsx(
        SizeRow,
        {
          width: styles.width,
          height: styles.height,
          updateStyle
        }
      ),
      /* @__PURE__ */ jsx(
        ClipContentCheck,
        {
          overflow: styles.overflow,
          updateStyle,
          idSuffix: "block"
        }
      )
    ] })
  ] });
}
const BG_COLOR_PRESETS = [
  { label: "Background", value: "var(--background)" },
  { label: "Card", value: "var(--card)" },
  { label: "Primary", value: "var(--primary)" },
  { label: "Secondary", value: "var(--secondary)" },
  { label: "Muted", value: "var(--muted)" },
  { label: "Accent", value: "var(--accent)" },
  { label: "Destructive", value: "var(--destructive)" }
];
const TEXT_COLOR_PRESETS = [
  { label: "Foreground", value: "var(--foreground)" },
  { label: "Card FG", value: "var(--card-foreground)" },
  { label: "Primary FG", value: "var(--primary-foreground)" },
  { label: "Secondary FG", value: "var(--secondary-foreground)" },
  { label: "Muted FG", value: "var(--muted-foreground)" },
  { label: "Accent FG", value: "var(--accent-foreground)" },
  { label: "Destructive FG", value: "var(--destructive-foreground)" }
];
function resolveSelectValue(color) {
  if (!color) return "default";
  if (color.startsWith("var(")) return color;
  return "custom";
}
function isValidHex(value) {
  return /^#([0-9A-Fa-f]{0,8})$/.test(value);
}
function ColorSwatch({ color, className }) {
  const isVar = color.startsWith("var(");
  const isTransparent = !color || color === "transparent";
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "inline-block h-4 w-4 shrink-0 rounded-[4px] border border-border/60 shadow-sm",
        isTransparent && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
        className
      ),
      style: !isTransparent ? { backgroundColor: isVar ? `hsl(${color})` : color } : void 0,
      children: isVar && /* @__PURE__ */ jsx(
        "span",
        {
          className: "block h-full w-full rounded-[3px]",
          style: { backgroundColor: color }
        }
      )
    }
  );
}
function ColorPickerField({
  label,
  hint,
  value,
  onChange,
  presets = BG_COLOR_PRESETS,
  className
}) {
  const [selectValue, setSelectValue] = useState(() => resolveSelectValue(value));
  const [hexInput, setHexInput] = useState(
    () => value && !value.startsWith("var(") ? value : ""
  );
  useEffect(() => {
    const next = resolveSelectValue(value);
    setSelectValue(next);
    if (next === "custom" && value) {
      setHexInput(value);
    } else if (next !== "custom") {
      setHexInput("");
    }
  }, [value]);
  const handleSelectChange = useCallback(
    (next) => {
      setSelectValue(next);
      if (next === "default") {
        onChange(void 0);
        setHexInput("");
      } else if (next === "custom") {
        onChange("");
        setHexInput("");
      } else {
        onChange(next);
        setHexInput("");
      }
    },
    [onChange]
  );
  const handleHexChange = useCallback(
    (e) => {
      const raw = e.target.value;
      if (isValidHex(raw)) {
        setHexInput(raw);
        onChange(raw);
      }
    },
    [onChange]
  );
  const handleNativeColorChange = useCallback(
    (e) => {
      const raw = e.target.value;
      setHexInput(raw);
      setSelectValue("custom");
      onChange(raw);
    },
    [onChange]
  );
  const isCustom = selectValue === "custom";
  const displayColor = isCustom ? hexInput : value;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
    /* @__PURE__ */ jsxs(ConfigField, { label, hint, children: [
      displayColor && displayColor.length > 0 && /* @__PURE__ */ jsx(ColorSwatch, { color: displayColor }),
      /* @__PURE__ */ jsxs(Select, { value: selectValue, onValueChange: handleSelectChange, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[120px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Default" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "default", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Default" }) }),
          presets.map((preset) => /* @__PURE__ */ jsx(SelectItem, { value: preset.value, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ColorSwatch, { color: preset.value, className: "h-3 w-3 rounded-sm" }),
            /* @__PURE__ */ jsx("span", { children: preset.label })
          ] }) }, preset.value)),
          /* @__PURE__ */ jsx(SelectItem, { value: "custom", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Pipette, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { children: "Custom" })
          ] }) })
        ] })
      ] })
    ] }),
    isCustom && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-[calc(50%-60px)] animate-in fade-in-0 slide-in-from-top-1 duration-150", children: [
      /* @__PURE__ */ jsxs("label", { className: "relative cursor-pointer group", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: hexInput || "#000000",
            onChange: handleNativeColorChange,
            className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full",
            tabIndex: -1
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "h-7 w-7 rounded-md border border-border/60 shadow-sm",
              "transition-all group-hover:border-foreground/30 group-hover:shadow-md"
            ),
            style: { backgroundColor: hexInput || "transparent" }
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "text",
          value: hexInput,
          onChange: handleHexChange,
          placeholder: "#000000",
          maxLength: 9,
          className: "h-7 w-[88px] px-2 text-[11px] font-mono tracking-wide",
          autoComplete: "off"
        }
      )
    ] })
  ] });
}
function parseCSSValue(value) {
  if (value === void 0 || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
function formatCSSValue(value, unit) {
  if (unit === "") return value.toString();
  return `${value}${unit}`;
}
function SliderField({
  label,
  hint,
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  rawNumber = false,
  placeholder,
  allowTextInput = false,
  inputWidth = "w-[56px]",
  className,
  showSlider = true,
  showUnit = true
}) {
  const numericValue = useMemo(() => parseCSSValue(value), [value]);
  const handleSliderChange = useCallback(
    ([val]) => {
      if (rawNumber) {
        onChange(val);
      } else {
        onChange(formatCSSValue(val, unit));
      }
    },
    [onChange, rawNumber, unit]
  );
  const handleInputChange = useCallback(
    (e) => {
      const raw = e.target.value;
      if (allowTextInput) {
        onChange(raw);
        return;
      }
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        if (rawNumber) {
          onChange(parsed);
        } else {
          onChange(formatCSSValue(parsed, unit));
        }
      } else if (raw === "" || raw === "-") {
        if (rawNumber) {
          onChange(0);
        } else {
          onChange(formatCSSValue(0, unit));
        }
      }
    },
    [onChange, rawNumber, unit, allowTextInput]
  );
  const inputDisplayValue = useMemo(() => {
    if (value === void 0 || value === null) return "";
    if (typeof value === "number") return value.toString();
    if (allowTextInput) return value;
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toString();
  }, [value, allowTextInput]);
  return /* @__PURE__ */ jsxs(ConfigField, { label, hint, htmlFor: id, className, children: [
    showSlider && /* @__PURE__ */ jsx(
      Slider,
      {
        id,
        min,
        max,
        step,
        value: [numericValue],
        onValueChange: handleSliderChange,
        className: cn("flex-1 min-w-[60px]", !showSlider && "hidden")
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          id: showSlider ? void 0 : id,
          type: allowTextInput ? "text" : "number",
          value: inputDisplayValue,
          onChange: handleInputChange,
          placeholder: placeholder ?? (rawNumber ? "0" : `0`),
          className: cn(
            "h-7 px-1.5 text-[11px] text-center font-mono tabular-nums",
            "rounded-md border-border/60 bg-background",
            "focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10",
            "transition-colors",
            inputWidth
          ),
          autoComplete: "off",
          min: allowTextInput ? void 0 : min,
          max: allowTextInput ? void 0 : max,
          step: allowTextInput ? void 0 : step
        }
      ),
      showUnit && unit && !rawNumber && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none w-[18px] text-left", children: unit })
    ] })
  ] });
}
function parseDisplayValue(value) {
  if (value === void 0 || value === null || value === "") return "0";
  const str = String(value);
  const num = parseInt(str, 10);
  if (isNaN(num)) return "0";
  return String(num);
}
function InlineValue({
  value,
  onChange,
  className,
  orientation,
  ariaLabel
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const displayed = parseDisplayValue(value);
  const startEditing = useCallback(() => {
    setDraft(displayed);
    setEditing(true);
  }, [displayed]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);
  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === displayed) return;
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && String(num) === trimmed) {
      onChange(`${num}px`);
    } else {
      onChange(trimmed);
    }
  }, [draft, displayed, onChange]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = parseInt(displayed, 10) || 0;
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = current + delta;
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange]
  );
  if (editing) {
    return /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "text",
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        onBlur: commit,
        onKeyDown: handleKeyDown,
        "aria-label": ariaLabel,
        className: cn(
          "bg-transparent text-center font-mono outline-none",
          "border border-white/30 rounded-sm",
          "text-[10px] leading-none",
          orientation === "horizontal" ? "w-7.5 h-4 px-0.5" : "w-6.5 h-3.5 px-0.5",
          className
        )
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: startEditing,
      "aria-label": ariaLabel,
      className: cn(
        "text-[10px] font-mono leading-none cursor-text",
        "rounded-sm px-0.5 py-px",
        "hover:bg-white/10 transition-colors duration-100",
        "tabular-nums select-none min-w-4.5 text-center",
        className
      ),
      children: displayed
    }
  );
}
function SpacingBoxModel({
  margin,
  padding,
  onMarginChange,
  onPaddingChange,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-col gap-1", className), children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative flex flex-col items-center",
        "rounded-lg border border-dashed border-orange-400/40",
        "bg-orange-500/6",
        "px-2 pt-1 pb-1"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-0.75 left-1.5 text-[8px] font-semibold uppercase tracking-widest text-orange-400/60 select-none pointer-events-none", children: "margin" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-5", children: /* @__PURE__ */ jsx(
          InlineValue,
          {
            value: margin.top,
            onChange: (v) => onMarginChange("top", v),
            orientation: "horizontal",
            ariaLabel: "Margin top",
            className: "text-orange-300/90"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full gap-0", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 shrink-0", children: /* @__PURE__ */ jsx(
            InlineValue,
            {
              value: margin.left,
              onChange: (v) => onMarginChange("left", v),
              orientation: "vertical",
              ariaLabel: "Margin left",
              className: "text-orange-300/90"
            }
          ) }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "relative flex flex-col items-center flex-1",
                "rounded-md border border-dashed border-emerald-400/40",
                "bg-emerald-500/6",
                "px-2 pt-1 pb-1",
                "min-h-20"
              ),
              children: [
                /* @__PURE__ */ jsx("span", { className: "absolute top-0.5 left-1.25 text-[8px] font-semibold uppercase tracking-widest text-emerald-400/60 select-none pointer-events-none", children: "padding" }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-4.5", children: /* @__PURE__ */ jsx(
                  InlineValue,
                  {
                    value: padding.top,
                    onChange: (v) => onPaddingChange("top", v),
                    orientation: "horizontal",
                    ariaLabel: "Padding top",
                    className: "text-emerald-300/90"
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full gap-0 flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-7 shrink-0", children: /* @__PURE__ */ jsx(
                    InlineValue,
                    {
                      value: padding.left,
                      onChange: (v) => onPaddingChange("left", v),
                      orientation: "vertical",
                      ariaLabel: "Padding left",
                      className: "text-emerald-300/90"
                    }
                  ) }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: cn(
                        "flex-1 rounded border border-border/30",
                        "bg-muted/20",
                        "flex items-center justify-center",
                        "min-h-6 min-w-10"
                      ),
                      children: /* @__PURE__ */ jsx("span", { className: "text-[8px] text-muted-foreground/40 select-none uppercase tracking-wider font-medium", children: "content" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-7 shrink-0", children: /* @__PURE__ */ jsx(
                    InlineValue,
                    {
                      value: padding.right,
                      onChange: (v) => onPaddingChange("right", v),
                      orientation: "vertical",
                      ariaLabel: "Padding right",
                      className: "text-emerald-300/90"
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-4.5", children: /* @__PURE__ */ jsx(
                  InlineValue,
                  {
                    value: padding.bottom,
                    onChange: (v) => onPaddingChange("bottom", v),
                    orientation: "horizontal",
                    ariaLabel: "Padding bottom",
                    className: "text-emerald-300/90"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-8 shrink-0", children: /* @__PURE__ */ jsx(
            InlineValue,
            {
              value: margin.right,
              onChange: (v) => onMarginChange("right", v),
              orientation: "vertical",
              ariaLabel: "Margin right",
              className: "text-orange-300/90"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-5", children: /* @__PURE__ */ jsx(
          InlineValue,
          {
            value: margin.bottom,
            onChange: (v) => onMarginChange("bottom", v),
            orientation: "horizontal",
            ariaLabel: "Margin bottom",
            className: "text-orange-300/90"
          }
        ) })
      ]
    }
  ) });
}
const ITEM_HEIGHT = 28;
const LIST_HEIGHT = 240;
const OVERSCAN = 5;
const DEFAULT_SENTINEL = "__default__";
function VirtualList({ fonts, value, onSelect }) {
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  const allItems = [DEFAULT_SENTINEL, ...fonts];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return [
      DEFAULT_SENTINEL,
      ...fonts.filter((f) => f.toLowerCase().includes(q))
    ];
  }, [query, allItems, fonts]);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN
  });
  useEffect(() => {
    if (value) {
      const idx = filtered.indexOf(value);
      if (idx > 0) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(idx, { align: "center" });
        });
      }
    }
  }, []);
  const noResults = filtered.length === 1 && query.trim().length > 0;
  return (
    // shouldFilter={false} — we manage filtering ourselves via useMemo
    /* @__PURE__ */ jsxs(Command, { shouldFilter: false, className: "rounded-none", children: [
      /* @__PURE__ */ jsx(
        CommandInput,
        {
          placeholder: "Search fonts…",
          value: query,
          onValueChange: setQuery,
          className: "h-8 text-[11px]"
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: listRef,
          style: { height: LIST_HEIGHT, overflow: "auto" },
          className: "overscroll-contain p-1",
          children: noResults ? /* @__PURE__ */ jsx(CommandEmpty, { className: "text-[11px]", children: "No fonts found." }) : /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative"
              },
              children: virtualizer.getVirtualItems().map((virtualRow) => {
                const item = filtered[virtualRow.index];
                const isDefault = item === DEFAULT_SENTINEL;
                const isSelected = isDefault ? !value : value === item;
                const label = isDefault ? "Default" : item;
                return /* @__PURE__ */ jsxs(
                  Command$1.Item,
                  {
                    value: item,
                    onSelect: () => onSelect(item),
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                      fontFamily: isDefault ? void 0 : item
                    },
                    className: cn(
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                      "flex cursor-pointer select-none items-center gap-1.5 rounded-sm px-2 text-[11px] outline-none",
                      isSelected && "bg-accent/60 text-accent-foreground",
                      isDefault && "italic text-muted-foreground"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(
                        Check,
                        {
                          className: cn(
                            "size-3 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "truncate", children: label })
                    ]
                  },
                  virtualRow.key
                );
              })
            }
          )
        }
      )
    ] })
  );
}
function FontFamilyPicker({
  value,
  onChange,
  fonts,
  className
}) {
  const [open, setOpen] = useState(false);
  const handleSelect = useCallback(
    (item) => {
      onChange(item === DEFAULT_SENTINEL ? void 0 : item);
      setOpen(false);
    },
    [onChange]
  );
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        role: "combobox",
        "aria-expanded": open,
        className: cn(
          "flex h-8 flex-1 items-center justify-between rounded-md border border-input bg-background px-2 text-[10px] font-normal",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className
        ),
        style: { fontFamily: value ?? void 0 },
        children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: value ?? "Default" }),
          /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ml-1 size-3 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-52 p-0", align: "start", sideOffset: 4, children: open && /* @__PURE__ */ jsx(VirtualList, { fonts, value, onSelect: handleSelect }) })
  ] });
}
function parseNumericValue$1(value) {
  if (value === void 0 || value === null || value === "") return "0";
  const str = String(value);
  const num = parseInt(str, 10);
  return isNaN(num) ? "0" : String(num);
}
const BORDER_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "none"
];
const STYLE_LABELS = {
  solid: "—",
  dashed: "- -",
  dotted: "···",
  double: "═",
  none: "✕",
  groove: "grv",
  ridge: "rdg",
  inset: "ins",
  outset: "out"
};
function InlineNumber({
  value,
  onChange,
  className,
  ariaLabel,
  min = 0
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const displayed = parseNumericValue$1(value);
  const startEditing = useCallback(() => {
    setDraft(displayed);
    setEditing(true);
  }, [displayed]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);
  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === displayed) return;
    const num = Math.max(min, parseInt(trimmed, 10) || 0);
    onChange(`${num}px`);
  }, [draft, displayed, onChange, min]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = Math.max(min, parseInt(displayed, 10) || 0);
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = Math.max(min, current + delta);
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange, min]
  );
  if (editing) {
    return /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "text",
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        onBlur: commit,
        onKeyDown: handleKeyDown,
        "aria-label": ariaLabel,
        className: cn(
          "w-7 h-4 bg-transparent text-center font-mono outline-none",
          "border border-white/30 rounded-sm text-[10px] leading-none px-0.5",
          className
        )
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: startEditing,
      "aria-label": ariaLabel,
      className: cn(
        "text-[10px] font-mono leading-none cursor-text",
        "rounded-sm px-0.5 py-px min-w-4.5 text-center",
        "hover:bg-white/10 transition-colors duration-100 tabular-nums select-none",
        className
      ),
      children: displayed
    }
  );
}
const CORNER_ROTATIONS = {
  topLeft: "rotate-0",
  topRight: "rotate-90",
  bottomRight: "rotate-180",
  bottomLeft: "-rotate-90"
};
function CornerRadiusInput({
  value,
  onChange,
  ariaLabel,
  corner
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const displayed = parseNumericValue$1(value);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);
  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === displayed) return;
    const num = Math.max(0, parseInt(trimmed, 10) || 0);
    onChange(`${num}px`);
  }, [draft, displayed, onChange]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") commit();
      else if (e.key === "Escape") setEditing(false);
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = Math.max(0, parseInt(displayed, 10) || 0);
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = Math.max(0, current + delta);
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange]
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
    /* @__PURE__ */ jsx(
      CornerUpLeft,
      {
        className: cn(
          "h-2.5 w-2.5 text-violet-400/50",
          CORNER_ROTATIONS[corner]
        )
      }
    ),
    editing ? /* @__PURE__ */ jsx(
      Input,
      {
        ref: inputRef,
        type: "text",
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        onBlur: commit,
        onKeyDown: handleKeyDown,
        "aria-label": ariaLabel,
        className: "w-7 h-3.5 bg-transparent text-center font-mono outline-none border border-white/30 rounded-sm text-[9px] leading-none px-0.5 text-violet-300/90"
      }
    ) : /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => {
          setDraft(displayed);
          setEditing(true);
        },
        "aria-label": ariaLabel,
        className: "text-[9px] font-mono leading-none cursor-text rounded-sm px-0.5 py-px min-w-4.5 text-center hover:bg-white/10 transition-colors tabular-nums select-none text-violet-300/80",
        children: displayed
      }
    )
  ] });
}
function SideWidth({
  side,
  width,
  style,
  color,
  onWidthChange,
  onStyleCycle
}) {
  const isHorizontal = side === "top" || side === "bottom";
  const displayWidth = parseNumericValue$1(width);
  const currentStyle = style ?? "solid";
  const isNone = currentStyle === "none" || displayWidth === "0";
  const lineColor = color ? color.startsWith("var(") ? void 0 : color : "hsl(var(--border))";
  const lineStyle = currentStyle === "dashed" ? "dashed" : currentStyle === "dotted" ? "dotted" : currentStyle === "double" ? "double" : "solid";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-1",
        isHorizontal ? "flex-row justify-center w-full" : "flex-col"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onStyleCycle,
            title: `Border style: ${currentStyle}`,
            className: cn(
              "text-[9px] font-mono rounded px-1 py-0.5 select-none",
              "hover:bg-white/10 transition-colors tabular-nums",
              isNone ? "text-muted-foreground/30" : "text-sky-300/80 hover:text-sky-200"
            ),
            children: STYLE_LABELS[currentStyle]
          }
        ),
        /* @__PURE__ */ jsx(
          InlineNumber,
          {
            value: width,
            onChange: onWidthChange,
            ariaLabel: `${side} border width`,
            className: cn(isNone ? "text-muted-foreground/30" : "text-sky-300/90")
          }
        ),
        !isNone && /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(isHorizontal ? "flex-1 h-0" : "flex-1 w-0"),
            style: isHorizontal ? {
              borderTopWidth: `${Math.min(
                parseInt(displayWidth, 10) || 1,
                4
              )}px`,
              borderTopStyle: lineStyle,
              borderTopColor: lineColor,
              minWidth: "8px"
            } : {
              borderLeftWidth: `${Math.min(
                parseInt(displayWidth, 10) || 1,
                4
              )}px`,
              borderLeftStyle: lineStyle,
              borderLeftColor: lineColor,
              minHeight: "8px"
            }
          }
        )
      ]
    }
  );
}
function UniformControls({
  linkedWidth,
  linked,
  onToggleLinked,
  onWidthChange,
  currentStyle,
  onStyleChange,
  borderColor,
  onColorChange
}) {
  const [draftColor, setDraftColor] = useState(borderColor ?? "");
  useEffect(() => {
    setDraftColor(borderColor ?? "");
  }, [borderColor]);
  const commitColor = useCallback(() => {
    const trimmed = draftColor.trim();
    onColorChange(trimmed || void 0);
  }, [draftColor, onColorChange]);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 px-0.5", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onToggleLinked,
        title: linked ? "Unlink sides" : "Link all sides",
        className: cn(
          "flex items-center justify-center h-6 w-6 rounded-md border transition-colors shrink-0",
          linked ? "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20" : "border-border/40 bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
        ),
        children: linked ? /* @__PURE__ */ jsx(Link2, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Link2Off, { className: "h-3 w-3" })
      }
    ),
    linked && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-1.5 h-6 shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground/50 font-medium select-none", children: "W" }),
      /* @__PURE__ */ jsx(
        InlineNumber,
        {
          value: linkedWidth,
          onChange: onWidthChange,
          ariaLabel: "Border width all sides",
          className: "text-sky-300/90"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground/40 select-none", children: "px" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: BORDER_STYLES.map((s) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onStyleChange(s),
        title: s,
        className: cn(
          "h-6 px-1.5 text-[9px] font-mono rounded-md border transition-colors",
          currentStyle === s ? "border-sky-500/40 bg-sky-500/10 text-sky-300" : "border-border/40 bg-muted/10 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30"
        ),
        children: STYLE_LABELS[s]
      },
      s
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative h-5 w-5 shrink-0 rounded border border-border/60 overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            value: borderColor && !borderColor.startsWith("var(") ? borderColor : "#000000",
            onChange: (e) => onColorChange(e.target.value),
            className: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
            "aria-label": "Border color picker"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full w-full rounded",
            style: {
              backgroundColor: borderColor && !borderColor.startsWith("var(") ? borderColor : borderColor ? void 0 : "hsl(var(--border))"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: draftColor,
          onChange: (e) => setDraftColor(e.target.value),
          onBlur: commitColor,
          onKeyDown: (e) => e.key === "Enter" && commitColor(),
          placeholder: "color",
          className: "h-6 flex-1 min-w-0 bg-transparent border border-border/40 rounded-md px-1.5 text-[10px] font-mono text-muted-foreground focus:outline-none focus:border-sky-500/40"
        }
      )
    ] })
  ] });
}
function BorderBoxModel({
  sides,
  radii,
  borderColor,
  onSideChange,
  onRadiusChange,
  onColorChange,
  onStyleChange,
  className
}) {
  const [linked, setLinked] = useState(true);
  const linkedWidth = parseNumericValue$1(sides.top.width);
  const currentStyle = sides.top.style ?? "solid";
  const cycleSideStyle = useCallback(
    (side) => {
      const idx = BORDER_STYLES.indexOf(
        sides[side].style ?? "solid"
      );
      const next = BORDER_STYLES[(idx + 1) % BORDER_STYLES.length];
      onSideChange(side, "style", next);
      if (linked) {
        ["top", "right", "bottom", "left"].forEach((s) => {
          if (s !== side) onSideChange(s, "style", next);
        });
      }
    },
    [sides, linked, onSideChange]
  );
  const handleLinkedWidthChange = useCallback(
    (v) => {
      ["top", "right", "bottom", "left"].forEach(
        (s) => onSideChange(s, "width", v)
      );
    },
    [onSideChange]
  );
  const handleWidthChange = useCallback(
    (side, v) => {
      if (linked) {
        handleLinkedWidthChange(v);
      } else {
        onSideChange(side, "width", v);
      }
    },
    [linked, handleLinkedWidthChange, onSideChange]
  );
  const handleGlobalStyleChange = useCallback(
    (s) => {
      onStyleChange(s);
    },
    [onStyleChange]
  );
  const previewColor = borderColor && !borderColor.startsWith("var(") ? borderColor : "hsl(var(--border))";
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative flex flex-col",
          "rounded-lg bg-muted/10 border border-border/30",
          "px-1 py-1 gap-0"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              CornerRadiusInput,
              {
                corner: "topLeft",
                value: radii.topLeft,
                onChange: (v) => onRadiusChange("topLeft", v),
                ariaLabel: "Top-left radius"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
              SideWidth,
              {
                side: "top",
                width: sides.top.width,
                style: sides.top.style,
                color: sides.top.color ?? borderColor,
                onWidthChange: (v) => handleWidthChange("top", v),
                onStyleCycle: () => cycleSideStyle("top")
              }
            ) }),
            /* @__PURE__ */ jsx(
              CornerRadiusInput,
              {
                corner: "topRight",
                value: radii.topRight,
                onChange: (v) => onRadiusChange("topRight", v),
                ariaLabel: "Top-right radius"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center w-8 shrink-0", children: /* @__PURE__ */ jsx(
              SideWidth,
              {
                side: "left",
                width: sides.left.width,
                style: sides.left.style,
                color: sides.left.color ?? borderColor,
                onWidthChange: (v) => handleWidthChange("left", v),
                onStyleCycle: () => cycleSideStyle("left")
              }
            ) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "flex-1 min-h-12 rounded-sm flex items-center justify-center",
                  "bg-muted/20"
                ),
                style: {
                  borderWidth: "1px",
                  borderStyle: currentStyle === "none" ? "dashed" : currentStyle,
                  borderColor: currentStyle === "none" ? "hsl(var(--border) / 0.3)" : previewColor,
                  borderRadius: `${parseNumericValue$1(radii.topLeft)}px ${parseNumericValue$1(radii.topRight)}px ${parseNumericValue$1(radii.bottomRight)}px ${parseNumericValue$1(radii.bottomLeft)}px`
                },
                children: /* @__PURE__ */ jsx("span", { className: "text-[8px] text-muted-foreground/30 uppercase tracking-wider font-medium select-none", children: "border" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center w-8 shrink-0", children: /* @__PURE__ */ jsx(
              SideWidth,
              {
                side: "right",
                width: sides.right.width,
                style: sides.right.style,
                color: sides.right.color ?? borderColor,
                onWidthChange: (v) => handleWidthChange("right", v),
                onStyleCycle: () => cycleSideStyle("right")
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              CornerRadiusInput,
              {
                corner: "bottomLeft",
                value: radii.bottomLeft,
                onChange: (v) => onRadiusChange("bottomLeft", v),
                ariaLabel: "Bottom-left radius"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
              SideWidth,
              {
                side: "bottom",
                width: sides.bottom.width,
                style: sides.bottom.style,
                color: sides.bottom.color ?? borderColor,
                onWidthChange: (v) => handleWidthChange("bottom", v),
                onStyleCycle: () => cycleSideStyle("bottom")
              }
            ) }),
            /* @__PURE__ */ jsx(
              CornerRadiusInput,
              {
                corner: "bottomRight",
                value: radii.bottomRight,
                onChange: (v) => onRadiusChange("bottomRight", v),
                ariaLabel: "Bottom-right radius"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      UniformControls,
      {
        linked,
        onToggleLinked: () => setLinked((l) => !l),
        linkedWidth,
        onWidthChange: handleLinkedWidthChange,
        currentStyle,
        onStyleChange: handleGlobalStyleChange,
        borderColor,
        onColorChange
      }
    )
  ] });
}
const FONT_WEIGHTS = [
  { label: "Thin", value: 100, abbr: "100" },
  { label: "Extra Light", value: 200, abbr: "200" },
  { label: "Light", value: 300, abbr: "Lt" },
  { label: "Regular", value: 400, abbr: "Rg" },
  { label: "Medium", value: 500, abbr: "Md" },
  { label: "Semi Bold", value: 600, abbr: "Sb" },
  { label: "Bold", value: 700, abbr: "Bd" },
  { label: "Extra Bold", value: 800, abbr: "Eb" },
  { label: "Black", value: 900, abbr: "Bk" }
];
const FONT_SIZE_UNITS = ["px", "rem", "em", "%", "vw", "vh"];
function parseFontSize(v) {
  if (!v) return "16px";
  return String(v);
}
function parseUnit(fontSize) {
  return fontSize.match(/[a-z%]+$/)?.[0] ?? "px";
}
function parseNumeric(fontSize) {
  return fontSize.replace(/[^0-9.]/g, "") || "16";
}
function parseLineHeight(v) {
  if (v === void 0 || v === null || v === "") return "1.5";
  return String(v);
}
function parseLetterSpacing(v) {
  if (v === void 0 || v === null || v === "") return "0";
  const num = parseFloat(String(v));
  return isNaN(num) ? "0" : String(num);
}
function parseFontWeight(v) {
  const n = Number(v);
  return isNaN(n) || !n ? 400 : n;
}
function NudgeInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  ariaLabel,
  className
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);
  const nudge = useCallback(
    (delta) => {
      const num = parseFloat(value) || 0;
      let next = Math.round((num + delta) * 1e3) / 1e3;
      if (min !== void 0) next = Math.max(min, next);
      if (max !== void 0) next = Math.min(max, next);
      onChange(String(next));
    },
    [value, min, max, onChange]
  );
  const commit = useCallback(
    (raw) => {
      setFocused(false);
      const trimmed = raw.trim();
      if (trimmed) onChange(trimmed);
    },
    [onChange]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex h-8 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            "aria-label": ariaLabel,
            value: focused ? draft : value,
            onFocus: () => {
              setDraft(value);
              setFocused(true);
            },
            onChange: (e) => setDraft(e.target.value),
            onBlur: (e) => commit(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") commit(draft);
              else if (e.key === "Escape") {
                setFocused(false);
                setDraft(value);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                nudge(step);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                nudge(-step);
              }
            },
            className: "min-w-0 flex-1 bg-transparent px-2 text-[11px] font-mono text-foreground outline-none placeholder:text-muted-foreground",
            placeholder: "—"
          }
        ),
        suffix && /* @__PURE__ */ jsx("span", { className: "flex items-center pr-1 text-[9px] font-medium text-muted-foreground/50 select-none", children: suffix }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col border-l border-input", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              tabIndex: -1,
              onMouseDown: (e) => {
                e.preventDefault();
                nudge(step);
              },
              className: "flex h-4 w-4 items-center justify-center text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronUp, { className: "size-2.5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              tabIndex: -1,
              onMouseDown: (e) => {
                e.preventDefault();
                nudge(-step);
              },
              className: "flex h-4 w-4 items-center justify-center border-t border-input text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors",
              children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-2.5" })
            }
          )
        ] })
      ]
    }
  );
}
function Row({
  label,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2", className), children: [
    /* @__PURE__ */ jsx(Label, { className: "w-14 shrink-0 text-[10px] font-medium text-muted-foreground/70", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center gap-1.5 min-w-0", children })
  ] });
}
function SectionLabel({
  icon,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
    icon && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40 [&>svg]:size-3", children: icon }),
    /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none", children })
  ] });
}
function LivePreview({ values }) {
  const fontSize = parseFontSize(values.fontSize);
  const previewSize = (() => {
    const raw = parseFloat(fontSize);
    if (isNaN(raw)) return "14px";
    const unit = parseUnit(fontSize);
    const px = unit === "rem" || unit === "em" ? raw * 16 : raw;
    return `${Math.min(Math.max(px, 10), 30)}px`;
  })();
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/10 px-3 py-2", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "max-w-full select-none leading-tight truncate",
        style: {
          fontFamily: values.fontFamily ?? void 0,
          fontSize: previewSize,
          fontWeight: values.fontWeight ?? 400,
          fontStyle: values.fontStyle ?? "normal",
          color: values.color ?? void 0,
          letterSpacing: values.letterSpacing ? `${parseLetterSpacing(values.letterSpacing)}px` : void 0,
          lineHeight: values.lineHeight ? parseLineHeight(values.lineHeight) : void 0,
          textAlign: values.textAlign ?? "center",
          textTransform: values.textTransform ?? void 0,
          textDecoration: values.textDecoration ?? void 0
        },
        children: values.fontFamily || "Typography"
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 left-2 text-[8px] font-mono text-muted-foreground/30 select-none", children: values.fontWeight ?? 400 }),
    /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 right-2 text-[8px] font-mono text-muted-foreground/30 select-none", children: fontSize })
  ] });
}
function TypographyPanel({
  values,
  onChange,
  fonts = [],
  className
}) {
  const fontWeight = parseFontWeight(values.fontWeight);
  const fontSize = parseFontSize(values.fontSize);
  const unit = parseUnit(fontSize);
  const numericSize = parseNumeric(fontSize);
  const lineHeight = parseLineHeight(values.lineHeight);
  const letterSpacing = parseLetterSpacing(values.letterSpacing);
  const wordSpacing = values.wordSpacing ? String(parseFloat(String(values.wordSpacing)) || 0) : "0";
  const [colorDraft, setColorDraft] = useState(values.color ?? "");
  useEffect(() => setColorDraft(values.color ?? ""), [values.color]);
  const commitColor = useCallback(() => {
    onChange("color", colorDraft.trim() || void 0);
  }, [colorDraft, onChange]);
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-3", className), children: [
    /* @__PURE__ */ jsx(LivePreview, { values }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(SectionLabel, { icon: /* @__PURE__ */ jsx(Type, {}), children: "Font" }),
      /* @__PURE__ */ jsx(Row, { label: "Family", children: fonts.length > 0 ? /* @__PURE__ */ jsx(
        FontFamilyPicker,
        {
          value: values.fontFamily,
          onChange: (v) => onChange("fontFamily", v),
          fonts
        }
      ) : /* @__PURE__ */ jsx(
        Input,
        {
          value: values.fontFamily ?? "",
          onChange: (e) => onChange("fontFamily", e.target.value || void 0),
          placeholder: "Inter, sans-serif",
          className: "h-8 flex-1 text-[10px] font-mono",
          style: { fontFamily: values.fontFamily ?? void 0 }
        }
      ) }),
      /* @__PURE__ */ jsxs(Row, { label: "Size", children: [
        /* @__PURE__ */ jsx(
          NudgeInput,
          {
            value: numericSize,
            onChange: (v) => onChange("fontSize", `${v}${unit}`),
            min: 1,
            max: 999,
            step: 1,
            ariaLabel: "Font size",
            className: "w-20"
          }
        ),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: unit,
            onValueChange: (u) => onChange("fontSize", `${numericSize}${u}`),
            children: [
              /* @__PURE__ */ jsx(
                SelectTrigger,
                {
                  size: "sm",
                  className: "h-8 w-16 text-[10px] font-mono",
                  children: /* @__PURE__ */ jsx(SelectValue, {})
                }
              ),
              /* @__PURE__ */ jsx(SelectContent, { children: FONT_SIZE_UNITS.map((u) => /* @__PURE__ */ jsx(
                SelectItem,
                {
                  value: u,
                  className: "text-[10px] font-mono",
                  children: u
                },
                u
              )) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Row, { label: "Weight", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-0.5", children: /* @__PURE__ */ jsx(TooltipProvider, { children: FONT_WEIGHTS.map((w) => /* @__PURE__ */ jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            size: "xs",
            variant: fontWeight === w.value ? "secondary" : "ghost",
            onClick: () => onChange("fontWeight", w.value),
            className: "h-6 px-1.5 text-[9px] font-mono",
            style: { fontWeight: w.value },
            children: w.abbr
          }
        ) }),
        /* @__PURE__ */ jsxs(TooltipContent, { side: "bottom", className: "text-[10px]", children: [
          w.label,
          " (",
          w.value,
          ")"
        ] })
      ] }, w.value)) }) }) }),
      /* @__PURE__ */ jsxs(Row, { label: "Style", children: [
        /* @__PURE__ */ jsxs(
          ToggleGroup,
          {
            type: "single",
            value: values.fontStyle ?? "normal",
            onValueChange: (v) => onChange("fontStyle", v || "normal"),
            className: "gap-0",
            children: [
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  ToggleGroupItem,
                  {
                    value: "normal",
                    size: "sm",
                    className: "h-7 w-7 px-0 text-[10px] font-medium",
                    children: "N"
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Normal" })
              ] }),
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  ToggleGroupItem,
                  {
                    value: "italic",
                    size: "sm",
                    className: "h-7 w-7 px-0",
                    children: /* @__PURE__ */ jsx(Italic, { className: "size-3" })
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Italic" })
              ] }),
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  ToggleGroupItem,
                  {
                    value: "oblique",
                    size: "sm",
                    className: "h-7 w-7 px-0 text-[10px] italic -skew-x-6 font-medium",
                    children: "O"
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Oblique" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input shadow-xs", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "color",
                  value: values.color && !values.color.startsWith("var(") ? values.color : "#000000",
                  onChange: (e) => onChange("color", e.target.value),
                  className: "absolute inset-0 size-full cursor-pointer opacity-0",
                  "aria-label": "Text color"
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "size-full",
                  style: {
                    backgroundColor: values.color && !values.color.startsWith("var(") ? values.color : values.color ? void 0 : "hsl(var(--foreground))",
                    ...values.color?.startsWith("var(") ? { backgroundColor: values.color } : {}
                  }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Text color" })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: colorDraft,
              onChange: (e) => setColorDraft(e.target.value),
              onBlur: commitColor,
              onKeyDown: (e) => e.key === "Enter" && commitColor(),
              placeholder: "var(--foreground)",
              className: "h-7 w-24 text-[10px] font-mono"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: "Metrics" }),
      /* @__PURE__ */ jsxs(Row, { label: "Line H", children: [
        /* @__PURE__ */ jsx(
          NudgeInput,
          {
            value: lineHeight,
            onChange: (v) => onChange("lineHeight", v),
            min: 0.5,
            max: 10,
            step: 0.1,
            ariaLabel: "Line height",
            className: "w-20"
          }
        ),
        /* @__PURE__ */ jsx(Label, { className: "ml-1 shrink-0 text-[10px] font-medium text-muted-foreground/70", children: "Letter" }),
        /* @__PURE__ */ jsx(
          NudgeInput,
          {
            value: letterSpacing,
            onChange: (v) => onChange("letterSpacing", `${v}px`),
            min: -20,
            max: 100,
            step: 0.5,
            suffix: "px",
            ariaLabel: "Letter spacing",
            className: "w-24"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Row, { label: "Word", children: /* @__PURE__ */ jsx(
        NudgeInput,
        {
          value: wordSpacing,
          onChange: (v) => onChange("wordSpacing", `${v}px`),
          min: -20,
          max: 100,
          step: 1,
          suffix: "px",
          ariaLabel: "Word spacing",
          className: "w-24"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: "Text" }),
      /* @__PURE__ */ jsx(Row, { label: "Align", children: /* @__PURE__ */ jsx(
        ToggleGroup,
        {
          type: "single",
          value: values.textAlign ?? "",
          onValueChange: (v) => onChange("textAlign", v || void 0),
          className: "gap-0",
          children: [
            {
              v: "left",
              icon: /* @__PURE__ */ jsx(AlignLeft, { className: "size-3" }),
              label: "Left"
            },
            {
              v: "center",
              icon: /* @__PURE__ */ jsx(AlignCenter, { className: "size-3" }),
              label: "Center"
            },
            {
              v: "right",
              icon: /* @__PURE__ */ jsx(AlignRight, { className: "size-3" }),
              label: "Right"
            },
            {
              v: "justify",
              icon: /* @__PURE__ */ jsx(AlignJustify, { className: "size-3" }),
              label: "Justify"
            }
          ].map(({ v, icon, label }) => /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              ToggleGroupItem,
              {
                value: v,
                size: "sm",
                className: "h-7 w-7 px-0",
                children: icon
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: label })
          ] }, v))
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Case", children: /* @__PURE__ */ jsxs(
        ToggleGroup,
        {
          type: "single",
          value: values.textTransform ?? "none",
          onValueChange: (v) => onChange(
            "textTransform",
            !v || v === "none" ? void 0 : v
          ),
          className: "gap-0",
          children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "none",
                  size: "sm",
                  className: "h-7 w-7 px-0",
                  children: /* @__PURE__ */ jsx(Minus, { className: "size-3" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "None" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "capitalize",
                  size: "sm",
                  className: "h-7 px-2 text-[9px] font-semibold",
                  children: "Aa"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Capitalize" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "uppercase",
                  size: "sm",
                  className: "h-7 px-2 text-[9px] font-semibold",
                  children: "AA"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Uppercase" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "lowercase",
                  size: "sm",
                  className: "h-7 px-2 text-[9px] font-semibold",
                  children: "aa"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Lowercase" })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Decor", children: /* @__PURE__ */ jsxs(
        ToggleGroup,
        {
          type: "single",
          value: values.textDecoration ?? "none",
          onValueChange: (v) => onChange(
            "textDecoration",
            !v || v === "none" ? void 0 : v
          ),
          className: "gap-0",
          children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "none",
                  size: "sm",
                  className: "h-7 w-7 px-0",
                  children: /* @__PURE__ */ jsx(Minus, { className: "size-3" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "None" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "underline",
                  size: "sm",
                  className: "h-7 w-7 px-0",
                  children: /* @__PURE__ */ jsx(Underline, { className: "size-3" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Underline" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "line-through",
                  size: "sm",
                  className: "h-7 w-7 px-0",
                  children: /* @__PURE__ */ jsx(Strikethrough, { className: "size-3" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Strikethrough" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "overline",
                  size: "sm",
                  className: "h-7 w-7 px-0 text-[10px] font-medium overline",
                  children: "O"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Overline" })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Shadow", children: /* @__PURE__ */ jsx(
        Input,
        {
          value: values.textShadow ?? "",
          onChange: (e) => onChange("textShadow", e.target.value || void 0),
          placeholder: "2px 2px 4px #000",
          className: "h-8 flex-1 text-[10px] font-mono"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(Separator, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: "Overflow" }),
      /* @__PURE__ */ jsx(Row, { label: "Wrap", children: /* @__PURE__ */ jsxs(
        Select,
        {
          value: values.whiteSpace ?? "normal",
          onValueChange: (v) => onChange("whiteSpace", v),
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { size: "sm", className: "h-8 flex-1 text-[10px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: [
              { v: "normal", label: "Normal" },
              { v: "nowrap", label: "No Wrap" },
              { v: "pre", label: "Pre" },
              { v: "pre-wrap", label: "Pre Wrap" },
              { v: "pre-line", label: "Pre Line" }
            ].map(({ v, label }) => /* @__PURE__ */ jsx(SelectItem, { value: v, className: "text-[10px]", children: label }, v)) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Overflow", children: /* @__PURE__ */ jsxs(
        ToggleGroup,
        {
          type: "single",
          value: values.textOverflow ?? "clip",
          onValueChange: (v) => v && onChange("textOverflow", v),
          className: "gap-0",
          children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "clip",
                  size: "sm",
                  className: "h-7 px-2 text-[9px]",
                  children: "Clip"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Clip overflow" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "ellipsis",
                  size: "sm",
                  className: "h-7 px-2 text-[9px]",
                  children: "…"
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: "Ellipsis" })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(Row, { label: "Break", children: /* @__PURE__ */ jsx(
        ToggleGroup,
        {
          type: "single",
          value: values.wordBreak ?? "normal",
          onValueChange: (v) => v && onChange("wordBreak", v),
          className: "gap-0",
          children: [
            { v: "normal", label: "—", tooltip: "Normal" },
            { v: "break-all", label: "All", tooltip: "Break All" },
            { v: "break-word", label: "Wrd", tooltip: "Break Word" },
            { v: "keep-all", label: "Keep", tooltip: "Keep All" }
          ].map(({ v, label, tooltip }) => /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              ToggleGroupItem,
              {
                value: v,
                size: "sm",
                className: "h-7 px-2 text-[9px]",
                children: label
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[10px]", children: tooltip })
          ] }, v))
        }
      ) })
    ] })
  ] }) });
}
function parseNumericValue(value) {
  if (value === void 0 || value === null || value === "") return "";
  if (typeof value === "number") return value.toString();
  const parsed = parseFloat(value);
  return isNaN(parsed) ? "" : parsed.toString();
}
function parseRotation(transform) {
  if (!transform) return "0";
  const match = transform.match(/rotate\(([^)]+)\)/);
  if (!match) return "0";
  const parsed = parseFloat(match[1]);
  return isNaN(parsed) ? "0" : parsed.toString();
}
function buildTransformWithRotation(existingTransform, degrees) {
  if (!existingTransform) {
    return degrees === 0 ? "" : `rotate(${degrees}deg)`;
  }
  const hasRotate = /rotate\([^)]*\)/.test(existingTransform);
  if (hasRotate) {
    const updated = existingTransform.replace(
      /rotate\([^)]*\)/,
      degrees === 0 ? "" : `rotate(${degrees}deg)`
    );
    return updated.trim();
  }
  return degrees === 0 ? existingTransform : `${existingTransform} rotate(${degrees}deg)`.trim();
}
function hasScale(transform, axis) {
  if (!transform) return false;
  const regex = new RegExp(`scale${axis}\\(\\s*-1\\s*\\)`);
  return regex.test(transform);
}
function toggleScale(existingTransform, axis) {
  const scaleStr = `scale${axis}(-1)`;
  const regex = new RegExp(`\\s*scale${axis}\\(\\s*-1\\s*\\)`);
  if (!existingTransform) return scaleStr;
  if (regex.test(existingTransform)) {
    return existingTransform.replace(regex, "").trim();
  }
  return `${existingTransform} ${scaleStr}`.trim();
}
function inferHConstraint(styles) {
  const hasLeft = styles.left !== void 0 && styles.left !== "" && styles.left !== "auto";
  const hasRight = styles.right !== void 0 && styles.right !== "" && styles.right !== "auto";
  if (hasLeft && hasRight) return "center";
  if (hasRight) return "right";
  if (hasLeft) return "left";
  return "";
}
function inferVConstraint(styles) {
  const hasTop = styles.top !== void 0 && styles.top !== "" && styles.top !== "auto";
  const hasBottom = styles.bottom !== void 0 && styles.bottom !== "" && styles.bottom !== "auto";
  if (hasTop && hasBottom) return "center";
  if (hasBottom) return "bottom";
  if (hasTop) return "top";
  return "";
}
function IconBtn({
  tooltip,
  active,
  onClick,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick,
        className: cn(
          "flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground",
          "transition-all duration-150 hover:bg-muted/60 hover:text-foreground",
          active && "bg-muted text-foreground shadow-sm",
          className
        ),
        "aria-label": tooltip,
        children
      }
    ) }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: tooltip })
  ] });
}
function CompactInput({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  type = "text",
  className
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center h-8 rounded-lg bg-muted/50 border border-border/40 overflow-hidden",
        "focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-foreground/10",
        "transition-colors",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center h-full px-2 text-[11px] font-medium text-muted-foreground select-none shrink-0 border-r border-border/30", children: label }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type,
            value,
            onChange: (e) => onChange(e.target.value),
            placeholder,
            className: cn(
              "flex-1 h-full bg-transparent px-2 text-[12px] font-mono tabular-nums text-foreground",
              "outline-none border-none min-w-0",
              "placeholder:text-muted-foreground/40"
            )
          }
        ),
        suffix && /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center h-full px-1.5 text-[10px] text-muted-foreground/60 font-medium select-none shrink-0", children: suffix })
      ]
    }
  );
}
function PositionSection({
  styles,
  updateStyle,
  className
}) {
  const positionValue = styles.position || "static";
  const isPositioned = positionValue !== "static";
  const showOffsets = positionValue === "absolute" || positionValue === "relative" || positionValue === "fixed" || positionValue === "sticky";
  const rotation = useMemo(
    () => parseRotation(styles.transform),
    [styles.transform]
  );
  const isFlippedH = useMemo(
    () => hasScale(styles.transform, "X"),
    [styles.transform]
  );
  const isFlippedV = useMemo(
    () => hasScale(styles.transform, "Y"),
    [styles.transform]
  );
  const hConstraint = useMemo(
    () => inferHConstraint(styles),
    [styles.left, styles.right]
  );
  const vConstraint = useMemo(
    () => inferVConstraint(styles),
    [styles.top, styles.bottom]
  );
  const handlePositionChange = useCallback(
    (value) => {
      if (value === "static") {
        updateStyle("position", void 0);
        updateStyle("top", void 0);
        updateStyle("right", void 0);
        updateStyle("bottom", void 0);
        updateStyle("left", void 0);
      } else {
        updateStyle("position", value);
      }
    },
    [updateStyle]
  );
  const handleHConstraintChange = useCallback(
    (constraint) => {
      const currentLeft = parseNumericValue(styles.left);
      const currentRight = parseNumericValue(styles.right);
      switch (constraint) {
        case "left":
          updateStyle("left", currentLeft || "0");
          updateStyle("right", void 0);
          break;
        case "center":
          updateStyle("left", currentLeft || "0");
          updateStyle("right", currentRight || "0");
          break;
        case "right":
          updateStyle("left", void 0);
          updateStyle("right", currentRight || "0");
          break;
      }
    },
    [updateStyle, styles.left, styles.right]
  );
  const handleVConstraintChange = useCallback(
    (constraint) => {
      const currentTop = parseNumericValue(styles.top);
      const currentBottom = parseNumericValue(styles.bottom);
      switch (constraint) {
        case "top":
          updateStyle("top", currentTop || "0");
          updateStyle("bottom", void 0);
          break;
        case "center":
          updateStyle("top", currentTop || "0");
          updateStyle("bottom", currentBottom || "0");
          break;
        case "bottom":
          updateStyle("top", void 0);
          updateStyle("bottom", currentBottom || "0");
          break;
      }
    },
    [updateStyle, styles.top, styles.bottom]
  );
  const handleXChange = useCallback(
    (val) => {
      if (hConstraint === "right") {
        updateStyle("right", val ? `${val}px` : void 0);
      } else {
        updateStyle("left", val ? `${val}px` : void 0);
      }
    },
    [updateStyle, hConstraint]
  );
  const handleYChange = useCallback(
    (val) => {
      if (vConstraint === "bottom") {
        updateStyle("bottom", val ? `${val}px` : void 0);
      } else {
        updateStyle("top", val ? `${val}px` : void 0);
      }
    },
    [updateStyle, vConstraint]
  );
  const handleRotationChange = useCallback(
    (val) => {
      const deg = parseFloat(val) || 0;
      const newTransform = buildTransformWithRotation(
        styles.transform,
        deg
      );
      updateStyle("transform", newTransform || void 0);
    },
    [updateStyle, styles.transform]
  );
  const handleFlipH = useCallback(() => {
    const newTransform = toggleScale(
      styles.transform,
      "X"
    );
    updateStyle("transform", newTransform || void 0);
  }, [updateStyle, styles.transform]);
  const handleFlipV = useCallback(() => {
    const newTransform = toggleScale(
      styles.transform,
      "Y"
    );
    updateStyle("transform", newTransform || void 0);
  }, [updateStyle, styles.transform]);
  const handleResetOffsets = useCallback(() => {
    updateStyle("top", void 0);
    updateStyle("right", void 0);
    updateStyle("bottom", void 0);
    updateStyle("left", void 0);
  }, [updateStyle]);
  const xValue = useMemo(() => {
    if (hConstraint === "right") return parseNumericValue(styles.right);
    return parseNumericValue(styles.left);
  }, [hConstraint, styles.left, styles.right]);
  const yValue = useMemo(() => {
    if (vConstraint === "bottom") return parseNumericValue(styles.bottom);
    return parseNumericValue(styles.top);
  }, [vConstraint, styles.top, styles.bottom]);
  const xLabel = hConstraint === "right" ? "R" : "X";
  const yLabel = vConstraint === "bottom" ? "B" : "Y";
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-3", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Position" }),
      /* @__PURE__ */ jsxs(Select, { value: positionValue, onValueChange: handlePositionChange, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-6 w-[90px] px-2 text-[10px] rounded-md border-border/40 bg-muted/30", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Static" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "static", children: "Static" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "relative", children: "Relative" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "absolute", children: "Absolute" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "fixed", children: "Fixed" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "sticky", children: "Sticky" })
        ] })
      ] })
    ] }),
    showOffsets && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(
        ToggleGroup,
        {
          type: "single",
          value: hConstraint,
          onValueChange: handleHConstraintChange,
          className: "h-8 gap-0 rounded-lg bg-muted/40 p-0.5 border border-border/30",
          children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "left",
                  "aria-label": "Pin left",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignHorizontalDistributeStart, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Left" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "center",
                  "aria-label": "Pin center horizontal",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignHorizontalDistributeCenter, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Left & Right" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "right",
                  "aria-label": "Pin right",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignHorizontalDistributeEnd, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Right" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        ToggleGroup,
        {
          type: "single",
          value: vConstraint,
          onValueChange: handleVConstraintChange,
          className: "h-8 gap-0 rounded-lg bg-muted/40 p-0.5 border border-border/30",
          children: [
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "top",
                  "aria-label": "Pin top",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignVerticalDistributeStart, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Top" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "center",
                  "aria-label": "Pin center vertical",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignVerticalDistributeCenter, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Top & Bottom" })
            ] }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                ToggleGroupItem,
                {
                  value: "bottom",
                  "aria-label": "Pin bottom",
                  className: cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80"
                  ),
                  children: /* @__PURE__ */ jsx(AlignVerticalDistributeEnd, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Pin Bottom" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(IconBtn, { tooltip: "Reset offsets", onClick: handleResetOffsets, children: /* @__PURE__ */ jsx(Minus, { className: "h-3.5 w-3.5" }) })
    ] }),
    showOffsets && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        CompactInput,
        {
          label: xLabel,
          value: xValue,
          onChange: handleXChange,
          placeholder: "0"
        }
      ),
      /* @__PURE__ */ jsx(
        CompactInput,
        {
          label: yLabel,
          value: yValue,
          onChange: handleYChange,
          placeholder: "0"
        }
      )
    ] }),
    isPositioned && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_auto] gap-2 items-center", children: [
      /* @__PURE__ */ jsx(
        CompactInput,
        {
          label: "↻",
          value: rotation,
          onChange: handleRotationChange,
          placeholder: "0",
          suffix: "°"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsx(
          IconBtn,
          {
            tooltip: "Flip horizontal",
            active: isFlippedH,
            onClick: handleFlipH,
            children: /* @__PURE__ */ jsx(FlipHorizontal2, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          IconBtn,
          {
            tooltip: "Flip vertical",
            active: isFlippedV,
            onClick: handleFlipV,
            children: /* @__PURE__ */ jsx(FlipVertical2, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center h-7 rounded-md bg-muted/40 border border-border/30 px-1.5 gap-1", children: [
            /* @__PURE__ */ jsx(Layers, { className: "h-3 w-3 text-muted-foreground/60" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: styles.zIndex ?? "",
                onChange: (e) => {
                  const val = e.target.value;
                  updateStyle(
                    "zIndex",
                    val === "" ? void 0 : parseInt(val, 10)
                  );
                },
                placeholder: "0",
                className: cn(
                  "w-[32px] h-full bg-transparent text-[11px] font-mono tabular-nums text-foreground",
                  "outline-none border-none text-center",
                  "placeholder:text-muted-foreground/40"
                ),
                "aria-label": "Z-Index"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: "Z-Index (stack order)" })
        ] })
      ] })
    ] }),
    !isPositioned && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground/70", children: "Z-Index" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center h-7 rounded-md bg-muted/40 border border-border/30 px-1.5 gap-1", children: [
        /* @__PURE__ */ jsx(Layers, { className: "h-3 w-3 text-muted-foreground/60" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: styles.zIndex ?? "",
            onChange: (e) => {
              const val = e.target.value;
              updateStyle(
                "zIndex",
                val === "" ? void 0 : parseInt(val, 10)
              );
            },
            placeholder: "auto",
            className: cn(
              "w-[48px] h-full bg-transparent text-[11px] font-mono tabular-nums text-foreground",
              "outline-none border-none text-center",
              "placeholder:text-muted-foreground/40"
            ),
            "aria-label": "Z-Index"
          }
        )
      ] })
    ] })
  ] });
}
const AppearanceAccordion = ({
  currentBreakpoint
}) => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const responsiveStyles = selectedElement?.styles ?? {};
  const styles = responsiveStyles[currentBreakpoint] ?? {};
  const updateStyle = (property, value) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, [property]: value };
    elementHelper.updateElementStyle(
      selectedElement,
      newStyles,
      currentBreakpoint,
      updateElement
    );
  };
  const batchUpdateStyle = (partial) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, ...partial };
    elementHelper.updateElementStyle(
      selectedElement,
      newStyles,
      currentBreakpoint,
      updateElement
    );
  };
  if (!selectedElement) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    AccordionSection,
    {
      value: "appearance",
      title: "Appearance",
      icon: /* @__PURE__ */ jsx(Paintbrush, {}),
      children: /* @__PURE__ */ jsxs(
        Accordion,
        {
          type: "multiple",
          defaultValue: [
            "display",
            "position",
            "size",
            "spacing",
            "colors",
            "border",
            "box-shadow",
            "opacity",
            "background",
            "transform",
            "effects",
            "overflow"
          ],
          className: "w-full flex flex-col gap-0.5",
          children: [
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "display",
                title: "Auto layout",
                icon: /* @__PURE__ */ jsx(LayoutGrid, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(
                  DisplaySection,
                  {
                    styles,
                    updateStyle,
                    batchUpdateStyle
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "position",
                title: "Position",
                icon: /* @__PURE__ */ jsx(MapPin, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(
                  PositionSection,
                  {
                    styles,
                    updateStyle: (property, value) => updateStyle(
                      property,
                      value
                    )
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs(AccordionSection, { value: "size", title: "Size", icon: /* @__PURE__ */ jsx(Ruler, {}), nested: true, children: [
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Width",
                  hint: "Element width — use px, %, auto, etc.",
                  children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: styles.width || "auto",
                      onChange: (e) => updateStyle("width", e.target.value),
                      className: "h-7 w-[90px] px-1.5 text-[11px] font-mono rounded-md text-center"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Height",
                  hint: "Element height — use px, %, auto, etc.",
                  children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: styles.height || "auto",
                      onChange: (e) => updateStyle("height", e.target.value),
                      className: "h-7 w-[90px] px-1.5 text-[11px] font-mono rounded-md text-center"
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "colors",
                title: "Colors",
                icon: /* @__PURE__ */ jsx(Palette, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ColorPickerField,
                    {
                      label: "Background",
                      hint: "Background color of the element",
                      value: styles.backgroundColor,
                      onChange: (color) => updateStyle("backgroundColor", color),
                      presets: BG_COLOR_PRESETS
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ColorPickerField,
                    {
                      label: "Text",
                      hint: "Text / foreground color",
                      value: styles.color,
                      onChange: (color) => updateStyle("color", color),
                      presets: TEXT_COLOR_PRESETS
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "border",
                title: "Border",
                icon: /* @__PURE__ */ jsx(Square, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(
                  BorderBoxModel,
                  {
                    sides: {
                      top: {
                        width: styles.borderWidth,
                        style: styles.borderStyle,
                        color: styles.borderColor
                      },
                      right: {
                        width: styles.borderWidth,
                        style: styles.borderStyle,
                        color: styles.borderColor
                      },
                      bottom: {
                        width: styles.borderWidth,
                        style: styles.borderStyle,
                        color: styles.borderColor
                      },
                      left: {
                        width: styles.borderWidth,
                        style: styles.borderStyle,
                        color: styles.borderColor
                      }
                    },
                    radii: {
                      topLeft: styles.borderTopLeftRadius,
                      topRight: styles.borderTopRightRadius,
                      bottomRight: styles.borderBottomRightRadius,
                      bottomLeft: styles.borderBottomLeftRadius
                    },
                    borderColor: styles.borderColor,
                    onSideChange: (side, field, value) => {
                      if (field === "width") {
                        updateStyle("borderWidth", parseInt(value, 10) || 0);
                      } else if (field === "style") {
                        updateStyle(
                          "borderStyle",
                          value
                        );
                      } else if (field === "color") {
                        updateStyle("borderColor", value);
                      }
                    },
                    onRadiusChange: (corner, value) => {
                      const keyMap = {
                        topLeft: "borderTopLeftRadius",
                        topRight: "borderTopRightRadius",
                        bottomRight: "borderBottomRightRadius",
                        bottomLeft: "borderBottomLeftRadius"
                      };
                      updateStyle(keyMap[corner], value);
                    },
                    onColorChange: (color) => updateStyle("borderColor", color),
                    onStyleChange: (style) => updateStyle(
                      "borderStyle",
                      style
                    )
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "box-shadow",
                title: "Box Shadow",
                icon: /* @__PURE__ */ jsx(BoxSelect, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Shadow",
                    hint: "Box shadow preset from your theme tokens",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: styles.boxShadow ? styles.boxShadow : "none",
                        onValueChange: (value) => updateStyle("boxShadow", value === "none" ? void 0 : value),
                        children: [
                          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "None" }) }),
                          /* @__PURE__ */ jsxs(SelectContent, { children: [
                            /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "None" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-2xs)", children: "2xs" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-xs)", children: "xs" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-sm)", children: "sm" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow)", children: "default" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-md)", children: "md" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-lg)", children: "lg" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-xl)", children: "xl" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "var(--shadow-2xl)", children: "2xl" })
                          ] })
                        ]
                      }
                    )
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "opacity",
                title: "Opacity",
                icon: /* @__PURE__ */ jsx(SunDim, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(
                  SliderField,
                  {
                    label: "Opacity",
                    id: "opacity",
                    hint: "Element transparency — 0 is fully transparent, 100 is fully opaque",
                    value: typeof styles.opacity === "number" ? Math.round(styles.opacity * 100) : 100,
                    onChange: (val) => updateStyle(
                      "opacity",
                      (typeof val === "number" ? val : parseInt(String(val)) || 100) / 100
                    ),
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%",
                    rawNumber: true
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(AccordionSection, { value: "spacing", title: "Spacing", icon: /* @__PURE__ */ jsx(Box, {}), nested: true, children: /* @__PURE__ */ jsx(
              SpacingBoxModel,
              {
                margin: {
                  top: styles.marginTop,
                  right: styles.marginRight,
                  bottom: styles.marginBottom,
                  left: styles.marginLeft
                },
                padding: {
                  top: styles.paddingTop,
                  right: styles.paddingRight,
                  bottom: styles.paddingBottom,
                  left: styles.paddingLeft
                },
                onMarginChange: (dir, val) => {
                  const key = `margin${dir.charAt(0).toUpperCase() + dir.slice(1)}`;
                  updateStyle(key, val);
                },
                onPaddingChange: (dir, val) => {
                  const key = `padding${dir.charAt(0).toUpperCase() + dir.slice(1)}`;
                  updateStyle(key, val);
                }
              }
            ) }),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "background",
                title: "Background",
                icon: /* @__PURE__ */ jsx(Image, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Image URL",
                      htmlFor: "backgroundImage",
                      hint: "CSS background-image value",
                      vertical: true,
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "backgroundImage",
                          type: "text",
                          value: styles.backgroundImage || "",
                          placeholder: "url(https://...)",
                          onChange: (e) => updateStyle("backgroundImage", e.target.value),
                          className: "h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(ConfigField, { label: "Size", hint: "Background sizing mode", children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: styles.backgroundSize?.toString() || "auto",
                      onValueChange: (value) => updateStyle("backgroundSize", value),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Size" }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "cover", children: "Cover" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "contain", children: "Contain" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "100% 100%", children: "100%" })
                        ] })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Position",
                      htmlFor: "backgroundPosition",
                      hint: "Background position (e.g. center center)",
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "backgroundPosition",
                          type: "text",
                          value: styles.backgroundPosition || "",
                          placeholder: "center center",
                          onChange: (e) => updateStyle("backgroundPosition", e.target.value),
                          className: "h-7 w-[110px] px-1.5 text-[11px] font-mono rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(ConfigField, { label: "Repeat", hint: "Background repeat behavior", children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: styles.backgroundRepeat || "repeat",
                      onValueChange: (value) => updateStyle("backgroundRepeat", value),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Repeat" }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "repeat", children: "Repeat" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "no-repeat", children: "No Repeat" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "repeat-x", children: "Repeat X" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "repeat-y", children: "Repeat Y" })
                        ] })
                      ]
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "transform",
                title: "Transform",
                icon: /* @__PURE__ */ jsx(Move3D, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Transform",
                      htmlFor: "transform",
                      hint: "CSS transform (e.g. rotate(45deg) scale(1.2))",
                      vertical: true,
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "transform",
                          type: "text",
                          value: styles.transform || "",
                          placeholder: "rotate(45deg) scale(1.2)",
                          onChange: (e) => updateStyle("transform", e.target.value),
                          className: "h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Origin",
                      htmlFor: "transformOrigin",
                      hint: "Transform origin point",
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "transformOrigin",
                          type: "text",
                          value: styles.transformOrigin || "",
                          placeholder: "center center",
                          onChange: (e) => updateStyle("transformOrigin", e.target.value),
                          className: "h-7 w-[110px] px-1.5 text-[11px] font-mono rounded-md"
                        }
                      )
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "effects",
                title: "Effects",
                icon: /* @__PURE__ */ jsx(Sparkles, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Filter",
                      htmlFor: "filter",
                      hint: "CSS filter (blur, brightness, contrast, etc.)",
                      vertical: true,
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "filter",
                          type: "text",
                          value: styles.filter || "",
                          placeholder: "blur(5px) brightness(1.2)",
                          onChange: (e) => updateStyle("filter", e.target.value),
                          className: "h-7 w-full px-1.5 text-[11px] font-mono rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(ConfigField, { label: "Cursor", hint: "Mouse cursor style on hover", children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: styles.cursor || "auto",
                      onValueChange: (value) => updateStyle("cursor", value),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Cursor" }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "pointer", children: "Pointer" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "text", children: "Text" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "move", children: "Move" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "not-allowed", children: "Not Allowed" })
                        ] })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Visibility",
                      hint: "Controls element visibility without removing it from layout",
                      children: /* @__PURE__ */ jsxs(
                        Select,
                        {
                          value: styles.visibility || "visible",
                          onValueChange: (value) => updateStyle(
                            "visibility",
                            value
                          ),
                          children: [
                            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Visibility" }) }),
                            /* @__PURE__ */ jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsx(SelectItem, { value: "visible", children: "Visible" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "hidden", children: "Hidden" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "collapse", children: "Collapse" })
                            ] })
                          ]
                        }
                      )
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "overflow",
                title: "Overflow",
                icon: /* @__PURE__ */ jsx(Layers, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Overflow",
                      hint: "How content that overflows the element is handled",
                      children: /* @__PURE__ */ jsxs(
                        Select,
                        {
                          value: styles.overflow || "visible",
                          onValueChange: (value) => updateStyle(
                            "overflow",
                            value
                          ),
                          children: [
                            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Overflow" }) }),
                            /* @__PURE__ */ jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsx(SelectItem, { value: "visible", children: "Visible" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "hidden", children: "Hidden" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "scroll", children: "Scroll" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" })
                            ] })
                          ]
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(ConfigField, { label: "Overflow X", hint: "Horizontal overflow behavior", children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: styles.overflowX || "visible",
                      onValueChange: (value) => updateStyle(
                        "overflowX",
                        value
                      ),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "X" }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "visible", children: "Visible" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "hidden", children: "Hidden" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "scroll", children: "Scroll" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" })
                        ] })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(ConfigField, { label: "Overflow Y", hint: "Vertical overflow behavior", children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: styles.overflowY || "visible",
                      onValueChange: (value) => updateStyle(
                        "overflowY",
                        value
                      ),
                      children: [
                        /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[100px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Y" }) }),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "visible", children: "Visible" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "hidden", children: "Hidden" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "scroll", children: "Scroll" }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" })
                        ] })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Box Sizing",
                      hint: "Whether padding and border are included in the element's total width and height",
                      children: /* @__PURE__ */ jsxs(
                        Select,
                        {
                          value: styles.boxSizing || "content-box",
                          onValueChange: (value) => updateStyle("boxSizing", value),
                          children: [
                            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-[110px] px-2 text-[11px] rounded-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Box Sizing" }) }),
                            /* @__PURE__ */ jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsx(SelectItem, { value: "content-box", children: "Content Box" }),
                              /* @__PURE__ */ jsx(SelectItem, { value: "border-box", children: "Border Box" })
                            ] })
                          ]
                        }
                      )
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    }
  );
};
const TypographyAccordion = ({
  currentBreakpoint
}) => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [fonts, setFonts] = useState([]);
  const { data, isLoading } = useQuery({
    queryKey: ["fonts"],
    queryFn: () => projectService.getFonts()
  });
  useEffect(() => {
    if (data && data.length > 0) {
      setFonts(data);
    }
  }, [data]);
  const responsiveStyles = selectedElement?.styles ?? {};
  const styles = responsiveStyles[currentBreakpoint] ?? {};
  const updateStyle = (property, value) => {
    if (!selectedElement) return;
    const newStyles = { ...styles, [property]: value };
    elementHelper.updateElementStyle(
      selectedElement,
      newStyles,
      currentBreakpoint,
      updateElement
    );
  };
  if (!selectedElement) return null;
  const values = {
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    color: styles.color,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    wordSpacing: styles.wordSpacing,
    textAlign: styles.textAlign,
    textTransform: styles.textTransform,
    textDecoration: typeof styles.textDecoration === "string" ? styles.textDecoration : void 0,
    textShadow: styles.textShadow,
    whiteSpace: styles.whiteSpace,
    textOverflow: styles.textOverflow,
    wordBreak: styles.wordBreak
  };
  return /* @__PURE__ */ jsx(AccordionSection, { value: "typography", title: "Typography", icon: /* @__PURE__ */ jsx(Type, {}), children: /* @__PURE__ */ jsx(
    TypographyPanel,
    {
      values,
      onChange: (property, value) => updateStyle(
        property,
        value
      ),
      fonts: isLoading ? [] : fonts
    }
  ) });
};
function TailwindAccordion() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [value, setValue] = useState(
    selectedElement?.tailwindStyles ?? ""
  );
  const debounceRef = useRef(null);
  useEffect(() => {
    setValue(selectedElement?.tailwindStyles ?? "");
  }, [selectedElement?.id, selectedElement?.tailwindStyles]);
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);
  if (!selectedElement) return null;
  const commit = (val) => {
    updateElement(selectedElement.id, { tailwindStyles: val });
  };
  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      commit(next);
      debounceRef.current = null;
    }, 250);
  };
  const handleBlur = () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    commit(value);
  };
  const classCount = value.trim().split(/\s+/).filter(Boolean).length;
  return /* @__PURE__ */ jsx(
    AccordionSection,
    {
      value: "tailwind",
      title: "Tailwind CSS",
      icon: /* @__PURE__ */ jsx(Code2, {}),
      badge: classCount > 0 ? /* @__PURE__ */ jsx(
        Badge,
        {
          variant: "secondary",
          className: "h-4 min-w-[18px] px-1 text-[9px] font-mono tabular-nums",
          children: classCount
        }
      ) : void 0,
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-muted-foreground/40 shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 leading-tight", children: "Add utility classes to override or extend styles" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative group/tw", children: [
          /* @__PURE__ */ jsx(
            Textarea,
            {
              value,
              onChange: handleChange,
              onBlur: handleBlur,
              placeholder: "p-4 bg-white rounded-lg shadow hover:scale-105 ...",
              className: cn(
                "min-h-[72px] resize-y text-[11px] font-mono leading-relaxed",
                "rounded-lg border-border/50 bg-muted/20",
                "placeholder:text-muted-foreground/30",
                "focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10",
                "transition-colors duration-150"
              ),
              rows: 3
            }
          ),
          classCount > 0 && /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "absolute bottom-1.5 right-1.5",
                "flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm",
                "border border-border/40 px-1.5 py-0.5",
                "text-[9px] font-mono text-muted-foreground/50 tabular-nums",
                "opacity-0 group-hover/tw:opacity-100 group-focus-within/tw:opacity-100",
                "transition-opacity duration-150"
              ),
              children: [
                classCount,
                " ",
                classCount === 1 ? "class" : "classes"
              ]
            }
          )
        ] }),
        classCount === 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 animate-in fade-in-0 slide-in-from-top-1 duration-200", children: ["p-4", "rounded-lg", "shadow-md", "hover:opacity-80"].map(
          (example) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                const next = value ? `${value} ${example}` : example;
                setValue(next);
                commit(next);
              },
              className: cn(
                "inline-flex items-center rounded-md px-1.5 py-0.5",
                "text-[10px] font-mono text-muted-foreground/60",
                "bg-muted/30 border border-border/30",
                "hover:bg-muted/60 hover:text-muted-foreground hover:border-border/50",
                "transition-all duration-150 cursor-pointer"
              ),
              children: example
            },
            example
          )
        ) })
      ] })
    }
  );
}
const BREAKPOINTS = [
  {
    value: "default",
    label: "Base",
    description: "All screen sizes",
    icon: /* @__PURE__ */ jsx(AppWindow, { className: "h-3.5 w-3.5" })
  },
  {
    value: "sm",
    label: "SM",
    description: "Small — 640px+",
    icon: /* @__PURE__ */ jsx(Smartphone, { className: "h-3.5 w-3.5" })
  },
  {
    value: "md",
    label: "MD",
    description: "Medium — 768px+",
    icon: /* @__PURE__ */ jsx(Tablet, { className: "h-3.5 w-3.5" })
  },
  {
    value: "lg",
    label: "LG",
    description: "Large — 1024px+",
    icon: /* @__PURE__ */ jsx(Monitor, { className: "h-3.5 w-3.5" })
  },
  {
    value: "xl",
    label: "XL",
    description: "Extra large — 1280px+",
    icon: /* @__PURE__ */ jsx(TvMinimalPlay, { className: "h-3.5 w-3.5" })
  }
];
const BreakpointSelector = ({
  currentBreakpoint,
  onBreakpointChange
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 px-0.5 mb-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none", children: "Breakpoint" }),
    /* @__PURE__ */ jsx(
      ToggleGroup,
      {
        type: "single",
        value: currentBreakpoint,
        onValueChange: (value) => {
          if (value) {
            onBreakpointChange(value);
          }
        },
        variant: "outline",
        size: "sm",
        className: "h-8 gap-0 rounded-lg bg-muted/40 p-0.5",
        children: BREAKPOINTS.map((bp) => /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
            ToggleGroupItem,
            {
              value: bp.value,
              "aria-label": bp.description,
              className: cn(
                "h-7 w-8 min-w-0 rounded-md p-0",
                "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                "transition-all duration-150 ease-out",
                "hover:text-foreground/80"
              ),
              children: /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: bp.icon })
            }
          ) }),
          /* @__PURE__ */ jsxs(TooltipContent, { side: "bottom", className: "text-[11px]", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: bp.label }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1.5", children: bp.description })
          ] })
        ] }, bp.value))
      }
    )
  ] });
};
function Styles() {
  const selectedElement = useSelectedElement();
  const [currentBreakpoint, setCurrentBreakpoint] = useState("default");
  if (!selectedElement) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx(
      BreakpointSelector,
      {
        currentBreakpoint,
        onBreakpointChange: setCurrentBreakpoint
      }
    ),
    /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["appearance", "typography", "tailwind"],
        className: "w-full flex flex-col gap-0.5",
        children: [
          /* @__PURE__ */ jsx(AppearanceAccordion, { currentBreakpoint }),
          selectedElement.type === "Text" && /* @__PURE__ */ jsx(TypographyAccordion, { currentBreakpoint }),
          /* @__PURE__ */ jsx(TailwindAccordion, {})
        ]
      }
    )
  ] });
}
export {
  Styles as default
};
