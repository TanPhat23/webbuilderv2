import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { f as Badge, j as cn, aj as Tooltip, ak as TooltipTrigger, al as TooltipContent, I as Input, B as Button } from "./prisma-Cq49YOYM.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { S as ScrollArea } from "./scroll-area-BYa8i-Jn.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { ListFilter, CheckCircle2, Circle, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { v4 } from "uuid";
import { S as SectionDivider, c as ConfigEmpty } from "./AccordionSection-BcJ45_Y5.js";
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
const SelectConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Select") return null;
  const selectElement = selectedElement;
  const settings = selectElement.settings || {};
  const options = useMemo(
    () => settings.selectOptions || [
      {
        id: "default-1",
        label: selectElement.content || "Option 1",
        value: "option-1"
      },
      { id: "default-2", label: "Option 2", value: "option-2" }
    ],
    [settings.selectOptions, selectElement.content]
  );
  const defaultValue = settings.defaultValue || "";
  const updateSettings = (newSettings) => {
    updateElement(selectElement.id, {
      settings: { ...settings, ...newSettings }
    });
  };
  const handleAddOption = () => {
    const newOption = {
      id: v4(),
      label: `Option ${options.length + 1}`,
      value: `option-${options.length + 1}`
    };
    updateSettings({ selectOptions: [...options, newOption] });
  };
  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    let newDefault = defaultValue;
    if (options[index].value === defaultValue) {
      newDefault = "";
    }
    updateSettings({ selectOptions: newOptions, defaultValue: newDefault });
  };
  const handleUpdateOption = (index, field, newValue) => {
    const newOptions = options.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: newValue };
      }
      return opt;
    });
    let newDefault = defaultValue;
    if (field === "value" && options[index].value === defaultValue) {
      newDefault = newValue;
    }
    updateSettings({ selectOptions: newOptions, defaultValue: newDefault });
  };
  const handleMoveOption = (index, direction) => {
    if (direction === "up" && index === 0 || direction === "down" && index === options.length - 1) {
      return;
    }
    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [
      newOptions[targetIndex],
      newOptions[index]
    ];
    updateSettings({ selectOptions: newOptions });
  };
  const handleSetDefault = (value) => {
    if (defaultValue === value) {
      updateSettings({ defaultValue: "" });
    } else {
      updateSettings({ defaultValue: value });
    }
  };
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "select-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(ListFilter, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Select Options" }),
          options.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(
            Badge,
            {
              variant: "secondary",
              className: "h-4 min-w-[18px] px-1 text-[9px] font-mono tabular-nums",
              children: options.length
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "flex items-center justify-between gap-2",
              "rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2",
              "transition-colors duration-150",
              settings.required && "border-foreground/10 bg-foreground/[0.03]"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground select-none", children: "Required" }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  id: "required-mode",
                  checked: settings.required,
                  onCheckedChange: (c) => updateSettings({ required: c }),
                  className: "scale-[0.65] origin-right"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "flex items-center justify-between gap-2",
              "rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2",
              "transition-colors duration-150",
              settings.disabled && "border-foreground/10 bg-foreground/[0.03]"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground select-none", children: "Disabled" }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  id: "disabled-mode",
                  checked: settings.disabled,
                  onCheckedChange: (c) => updateSettings({ disabled: c }),
                  className: "scale-[0.65] origin-right"
                }
              )
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none", children: "Options" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono tabular-nums", children: [
          options.length,
          " ",
          options.length === 1 ? "item" : "items"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[26px_1fr_1fr_52px] gap-1.5 px-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("span", { className: "cursor-help", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-muted-foreground/40" }) }) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "top", className: "text-[11px]", children: "Default selected option" })
        ] }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider", children: "Label" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider", children: "Value" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider text-center", children: "Actions" })
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-56 pr-2 -mr-2 rounded-lg border border-border/30 bg-muted/10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 p-1", children: [
        options.map((option, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "group/item grid grid-cols-[26px_1fr_1fr_52px] gap-1.5 items-center",
              "rounded-md border border-transparent",
              "hover:border-border/40 hover:bg-background hover:shadow-sm",
              "transition-all duration-150 p-1",
              defaultValue === option.value && "bg-primary/[0.03] border-primary/10"
            ),
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: cn(
                      "flex items-center justify-center",
                      "h-5 w-5 rounded-full outline-none",
                      "transition-all duration-150",
                      defaultValue === option.value ? "text-primary hover:text-primary/80" : "text-muted-foreground/30 hover:text-primary/50"
                    ),
                    onClick: () => handleSetDefault(option.value),
                    children: defaultValue === option.value ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5" })
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { side: "left", className: "text-[11px]", children: defaultValue === option.value ? "Default — click to unset" : "Set as default" })
              ] }) }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: option.label,
                  onChange: (e) => handleUpdateOption(index, "label", e.target.value),
                  placeholder: "Label",
                  className: cn(
                    "h-6 text-[10px] px-1.5 rounded-md",
                    "bg-transparent border-transparent",
                    "hover:border-border/40 hover:bg-background",
                    "focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/10",
                    "transition-colors duration-150"
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: option.value,
                  onChange: (e) => handleUpdateOption(index, "value", e.target.value),
                  placeholder: "value",
                  className: cn(
                    "h-6 text-[10px] px-1.5 rounded-md font-mono",
                    "bg-transparent border-transparent text-muted-foreground",
                    "hover:border-border/40 hover:bg-background",
                    "focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/10 focus:text-foreground",
                    "transition-colors duration-150"
                  )
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-0 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity duration-150", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsxs(Tooltip, { children: [
                    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: cn(
                          "flex items-center justify-center h-3 w-4",
                          "rounded-t-sm outline-none",
                          "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/60",
                          "disabled:opacity-20 disabled:pointer-events-none",
                          "transition-colors duration-100"
                        ),
                        disabled: index === 0,
                        onClick: () => handleMoveOption(index, "up"),
                        children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-2 w-2" })
                      }
                    ) }),
                    /* @__PURE__ */ jsx(TooltipContent, { side: "left", className: "text-[10px]", children: "Move up" })
                  ] }),
                  /* @__PURE__ */ jsxs(Tooltip, { children: [
                    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: cn(
                          "flex items-center justify-center h-3 w-4",
                          "rounded-b-sm outline-none",
                          "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/60",
                          "disabled:opacity-20 disabled:pointer-events-none",
                          "transition-colors duration-100"
                        ),
                        disabled: index === options.length - 1,
                        onClick: () => handleMoveOption(index, "down"),
                        children: /* @__PURE__ */ jsx(ArrowDown, { className: "h-2 w-2" })
                      }
                    ) }),
                    /* @__PURE__ */ jsx(TooltipContent, { side: "left", className: "text-[10px]", children: "Move down" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: cn(
                        "flex items-center justify-center",
                        "h-5 w-5 rounded-md outline-none",
                        "text-muted-foreground/40",
                        "hover:text-destructive hover:bg-destructive/10",
                        "transition-colors duration-150"
                      ),
                      onClick: () => handleRemoveOption(index),
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-2.5 w-2.5" })
                    }
                  ) }),
                  /* @__PURE__ */ jsx(TooltipContent, { side: "left", className: "text-[10px]", children: "Remove option" })
                ] })
              ] })
            ]
          },
          option.id || index
        )),
        options.length === 0 && /* @__PURE__ */ jsx(
          ConfigEmpty,
          {
            icon: /* @__PURE__ */ jsx(ListFilter, { className: "h-5 w-5" }),
            message: "No options added yet. Click below to add one.",
            className: "my-2"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: cn(
            "w-full h-8 text-[11px] font-medium",
            "border border-dashed border-border/40 rounded-lg",
            "text-muted-foreground/60",
            "hover:border-border/60 hover:bg-muted/20 hover:text-muted-foreground",
            "transition-all duration-150"
          ),
          onClick: handleAddOption,
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-3 w-3" }),
            "Add option"
          ]
        }
      ),
      options.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
        /* @__PURE__ */ jsx(ListFilter, { className: "h-3 w-3 text-muted-foreground/40" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: options.length }),
          " ",
          options.length === 1 ? "option" : "options",
          defaultValue && /* @__PURE__ */ jsxs(Fragment, { children: [
            " · default: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono font-medium text-muted-foreground/70", children: defaultValue })
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  SelectConfigurationAccordion
};
