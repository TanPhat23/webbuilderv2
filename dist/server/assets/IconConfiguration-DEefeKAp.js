import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-D43pR8IL.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { Smile, PenTool, Ruler, Paintbrush, Droplets, Palette, Search, X } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider, b as ConfigSection } from "./AccordionSection-D9IjFlO-.js";
import { DynamicIcon, iconNames } from "lucide-react/dynamic.mjs";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-D5_jSc2n.js";
import "./checkbox-Cs4k79tJ.js";
const ALL_ICON_NAMES = Array.from(iconNames);
const MAX_VISIBLE_ICONS = 60;
const DEFAULT_SIZE = 24;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_COLOR = "currentColor";
const DEFAULT_FILL = "none";
const ICON_COLOR_PRESETS = [
  { color: "currentColor", label: "Inherit" },
  { color: "#000000", label: "Black" },
  { color: "#ffffff", label: "White" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#6b7280", label: "Gray" }
];
const FILL_COLOR_PRESETS = [
  { color: "none", label: "None" },
  { color: "currentColor", label: "Inherit" },
  { color: "#000000", label: "Black" },
  { color: "#ffffff", label: "White" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" }
];
function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.slice(0, MAX_VISIBLE_ICONS);
    const query = search.toLowerCase().trim();
    return ALL_ICON_NAMES.filter(
      (name) => name.toLowerCase().includes(query)
    ).slice(0, MAX_VISIBLE_ICONS);
  }, [search]);
  const totalMatches = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.length;
    const query = search.toLowerCase().trim();
    return ALL_ICON_NAMES.filter((name) => name.toLowerCase().includes(query)).length;
  }, [search]);
  const isValidIcon = value && ALL_ICON_NAMES.includes(value);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
            isValidIcon ? "border-border bg-muted/30" : "border-dashed border-border/50 bg-muted/10"
          ),
          children: isValidIcon ? /* @__PURE__ */ jsx(DynamicIcon, { name: value, size: 20, strokeWidth: 2 }) : /* @__PURE__ */ jsx(Smile, { className: "h-5 w-5 text-muted-foreground/30" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            value: value || "",
            onChange: (e) => onChange(e.target.value),
            placeholder: "icon-name",
            className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
            autoComplete: "off"
          }
        ),
        value && !isValidIcon && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60", children: "Unknown icon name" }),
        isValidIcon && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 font-mono truncate", children: value })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setIsExpanded(!isExpanded),
        className: cn(
          "flex items-center gap-1.5 text-[10px] font-medium transition-colors px-1",
          isExpanded ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
        ),
        children: [
          /* @__PURE__ */ jsx(Search, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: isExpanded ? "Hide icon browser" : "Browse icons" }),
          !isExpanded && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground/40 ml-auto", children: [
            ALL_ICON_NAMES.length.toLocaleString(),
            " icons"
          ] })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search icons...",
            className: "h-7 w-full pl-7 pr-7 text-[11px] rounded-md",
            autoComplete: "off"
          }
        ),
        search && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setSearch(""),
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 px-0.5", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: totalMatches > MAX_VISIBLE_ICONS ? `Showing ${MAX_VISIBLE_ICONS} of ${totalMatches.toLocaleString()} matches` : `${totalMatches} match${totalMatches !== 1 ? "es" : ""}` }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto rounded-md border border-border/30 bg-muted/10 p-1.5", children: [
        filteredIcons.map((name) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              onChange(name);
              setIsExpanded(false);
              setSearch("");
            },
            title: name,
            className: cn(
              "flex items-center justify-center aspect-square rounded-md transition-all duration-100",
              "hover:bg-muted/80 hover:shadow-sm",
              value === name ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary" : "bg-background text-foreground/70 hover:text-foreground border border-transparent hover:border-border/50"
            ),
            children: /* @__PURE__ */ jsx(
              DynamicIcon,
              {
                name,
                size: 16,
                strokeWidth: 2
              }
            )
          },
          name
        )),
        filteredIcons.length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-6 flex flex-col items-center justify-center py-8 gap-2 text-center", children: [
          /* @__PURE__ */ jsx(Search, { className: "h-5 w-5 text-muted-foreground/30" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground/50", children: [
            "No icons matching “",
            search,
            "”"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function IconConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Icon") {
    return null;
  }
  const settings = selectedElement.settings ?? {};
  const updateSetting = (key, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value }
    });
  };
  const handleIconNameChange = (iconName2) => {
    updateSetting("iconName", iconName2 || void 0);
  };
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    updateSetting(name, isNaN(parsed) ? void 0 : parsed);
  };
  const iconName = settings.iconName ?? "";
  const size = settings.size ?? DEFAULT_SIZE;
  const strokeWidth = settings.strokeWidth ?? DEFAULT_STROKE_WIDTH;
  const color = settings.color ?? DEFAULT_COLOR;
  const fill = settings.fill ?? DEFAULT_FILL;
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;
  const isValidIcon = iconName.length > 0 && ALL_ICON_NAMES.includes(iconName);
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "icon-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: isValidIcon ? /* @__PURE__ */ jsx(
            DynamicIcon,
            {
              name: iconName,
              size: 14,
              strokeWidth: 2
            }
          ) : /* @__PURE__ */ jsx(Smile, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Icon Settings" }),
          iconName && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-mono",
                isValidIcon ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              ),
              children: iconName
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: [
      /* @__PURE__ */ jsxs(
        Accordion,
        {
          type: "multiple",
          defaultValue: ["icon-select", "sizing", "colors"],
          className: "w-full",
          children: [
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "icon-select",
                title: "Icon",
                icon: /* @__PURE__ */ jsx(Smile, {}),
                nested: true,
                children: /* @__PURE__ */ jsx(IconPicker, { value: iconName, onChange: handleIconNameChange })
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "sizing",
                title: "Sizing",
                icon: /* @__PURE__ */ jsx(Ruler, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Size",
                      htmlFor: "icon-size",
                      hint: "The width and height of the icon in pixels. The icon scales proportionally.",
                      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            id: "icon-size",
                            type: "number",
                            value: size,
                            onChange: (e) => handleNumberInput("size", e),
                            placeholder: "24",
                            min: 8,
                            max: 512,
                            step: 1,
                            className: "h-7 w-[64px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 pl-0.5", children: [16, 20, 24, 32, 40, 48, 64].map((presetSize) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => updateSetting("size", presetSize),
                      className: cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-all",
                        size === presetSize ? "bg-primary text-primary-foreground font-medium" : "bg-muted/40 text-muted-foreground/60 hover:bg-muted/80 hover:text-muted-foreground"
                      ),
                      children: presetSize
                    },
                    presetSize
                  )) }),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Stroke width",
                      htmlFor: "icon-strokeWidth",
                      hint: "The thickness of the icon's lines. Default is 2. Lower values create thinner icons, higher values create bolder icons.",
                      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            id: "icon-strokeWidth",
                            type: "number",
                            value: strokeWidth,
                            onChange: (e) => handleNumberInput("strokeWidth", e),
                            placeholder: "2",
                            min: 0.5,
                            max: 4,
                            step: 0.25,
                            className: "h-7 w-[64px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 pl-0.5", children: [0.5, 1, 1.5, 2, 2.5, 3].map((presetStroke) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => updateSetting("strokeWidth", presetStroke),
                      className: cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-all",
                        strokeWidth === presetStroke ? "bg-primary text-primary-foreground font-medium" : "bg-muted/40 text-muted-foreground/60 hover:bg-muted/80 hover:text-muted-foreground"
                      ),
                      children: presetStroke
                    },
                    presetStroke
                  )) }),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Absolute stroke",
                      htmlFor: "icon-absoluteStrokeWidth",
                      hint: "When enabled, the stroke width stays constant regardless of the icon size. When disabled (default), the stroke scales proportionally with the icon.",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "icon-absoluteStrokeWidth",
                          checked: absoluteStrokeWidth,
                          onCheckedChange: (checked) => updateSetting("absoluteStrokeWidth", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                    /* @__PURE__ */ jsx(PenTool, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: absoluteStrokeWidth ? `Fixed ${strokeWidth}px stroke — consistent at any size` : `Proportional stroke — scales with ${size}px icon` })
                  ] }),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-2 animate-in fade-in-0 duration-150", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center rounded-lg border border-border/40 bg-muted/10 p-3", children: isValidIcon ? /* @__PURE__ */ jsx(
                    DynamicIcon,
                    {
                      name: iconName,
                      size: Math.min(size, 64),
                      strokeWidth,
                      absoluteStrokeWidth,
                      color,
                      fill
                    }
                  ) : /* @__PURE__ */ jsx(
                    Smile,
                    {
                      size: Math.min(size, 64),
                      strokeWidth,
                      className: "text-muted-foreground/30"
                    }
                  ) }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5 animate-in fade-in-0 duration-150", children: [
                    /* @__PURE__ */ jsx(Ruler, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono tabular-nums", children: [
                      size,
                      "px · stroke ",
                      strokeWidth
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "colors",
                title: "Colors",
                icon: /* @__PURE__ */ jsx(Palette, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsxs(
                    ConfigSection,
                    {
                      title: "Stroke Color",
                      icon: /* @__PURE__ */ jsx(Paintbrush, { className: "h-3 w-3" }),
                      children: [
                        /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: "Color",
                            htmlFor: "icon-color",
                            hint: "The stroke (outline) color of the icon. Use 'currentColor' to inherit the text color from the parent element.",
                            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                              /* @__PURE__ */ jsx(
                                "div",
                                {
                                  className: "w-6 h-6 rounded border border-border/60 shrink-0",
                                  style: {
                                    backgroundColor: color === "currentColor" ? "#6b7280" : color
                                  }
                                }
                              ),
                              /* @__PURE__ */ jsx(
                                Input,
                                {
                                  id: "icon-color",
                                  type: "text",
                                  value: color,
                                  onChange: (e) => updateSetting("color", e.target.value || DEFAULT_COLOR),
                                  placeholder: "currentColor",
                                  className: "h-7 w-[110px] px-2 text-[11px] font-mono rounded-md",
                                  autoComplete: "off"
                                }
                              )
                            ] })
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 flex-wrap pl-0.5", children: ICON_COLOR_PRESETS.map((preset) => /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => updateSetting("color", preset.color),
                            title: preset.label,
                            className: cn(
                              "w-5 h-5 rounded-full border transition-all",
                              color === preset.color ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary" : "border-border/50 hover:border-border hover:scale-110",
                              preset.color === "currentColor" && "bg-gradient-to-br from-gray-400 to-gray-600"
                            ),
                            style: preset.color !== "currentColor" ? { backgroundColor: preset.color } : void 0
                          },
                          preset.color
                        )) }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                          /* @__PURE__ */ jsx(Paintbrush, { className: "h-3 w-3 text-muted-foreground/40" }),
                          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: color === "currentColor" ? "Inheriting color from parent text color" : `Stroke: ${color}` })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsxs(
                    ConfigSection,
                    {
                      title: "Fill Color",
                      icon: /* @__PURE__ */ jsx(Droplets, { className: "h-3 w-3" }),
                      children: [
                        /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: "Fill",
                            htmlFor: "icon-fill",
                            hint: "The fill color for the icon interior. Use 'none' for outlined icons (default). Use 'currentColor' to fill with the inherited text color.",
                            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                              /* @__PURE__ */ jsx(
                                "div",
                                {
                                  className: cn(
                                    "w-6 h-6 rounded border border-border/60 shrink-0",
                                    fill === "none" && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]"
                                  ),
                                  style: fill !== "none" ? {
                                    backgroundColor: fill === "currentColor" ? "#6b7280" : fill
                                  } : void 0
                                }
                              ),
                              /* @__PURE__ */ jsx(
                                Input,
                                {
                                  id: "icon-fill",
                                  type: "text",
                                  value: fill,
                                  onChange: (e) => updateSetting("fill", e.target.value || DEFAULT_FILL),
                                  placeholder: "none",
                                  className: "h-7 w-[110px] px-2 text-[11px] font-mono rounded-md",
                                  autoComplete: "off"
                                }
                              )
                            ] })
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 flex-wrap pl-0.5", children: FILL_COLOR_PRESETS.map((preset) => /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => updateSetting("fill", preset.color),
                            title: preset.label,
                            className: cn(
                              "w-5 h-5 rounded-full border transition-all",
                              fill === preset.color ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary" : "border-border/50 hover:border-border hover:scale-110",
                              preset.color === "none" && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:6px_6px]",
                              preset.color === "currentColor" && "bg-gradient-to-br from-gray-400 to-gray-600"
                            ),
                            style: preset.color !== "none" && preset.color !== "currentColor" ? { backgroundColor: preset.color } : void 0
                          },
                          preset.color
                        )) }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                          /* @__PURE__ */ jsx(Droplets, { className: "h-3 w-3 text-muted-foreground/40" }),
                          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: fill === "none" ? "No fill — outlined icon" : fill === "currentColor" ? "Fill inheriting parent text color" : `Fill: ${fill}` })
                        ] })
                      ]
                    }
                  )
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, { className: "mt-2" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150", children: [
        isValidIcon ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400", children: [
          /* @__PURE__ */ jsx(
            DynamicIcon,
            {
              name: iconName,
              size: 10,
              strokeWidth: 2
            }
          ),
          iconName
        ] }) : iconName ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400", children: [
          /* @__PURE__ */ jsx(Smile, { className: "h-2.5 w-2.5" }),
          "unknown"
        ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Smile, { className: "h-2.5 w-2.5" }),
          "no icon"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Ruler, { className: "h-2.5 w-2.5" }),
          size,
          "px"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(PenTool, { className: "h-2.5 w-2.5" }),
          strokeWidth
        ] }),
        fill !== "none" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Droplets, { className: "h-2.5 w-2.5" }),
          "filled"
        ] })
      ] })
    ] })
  ] });
}
export {
  IconConfiguration as default
};
