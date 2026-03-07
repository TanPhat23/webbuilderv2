import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { BarChart3, Loader, Percent, Settings2, Tag } from "lucide-react";
import { b as ConfigSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
import "react";
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
function ProgressConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Progress") {
    return null;
  }
  const settings = selectedElement.settings ?? {};
  const updateSetting = (name, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value }
    });
  };
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    updateSetting(name, isNaN(parsed) ? void 0 : parsed);
  };
  const handleLabelChange = (e) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, label: e.target.value || void 0 }
    });
  };
  const currentValue = settings.value ?? 0;
  const maxValue = settings.max ?? 100;
  const isIndeterminate = !!settings.indeterminate;
  const percentage = maxValue > 0 && !isIndeterminate ? Math.min(100, Math.round(currentValue / maxValue * 100)) : 0;
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "progress-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Progress Settings" }),
          !isIndeterminate && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums", children: [
            percentage,
            "%"
          ] }) }),
          isIndeterminate && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(Loader, { className: "h-3 w-3 text-muted-foreground/50 animate-spin" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Values",
          icon: /* @__PURE__ */ jsx(Settings2, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Indeterminate",
                htmlFor: "progress-indeterminate",
                hint: "Show an indeterminate (loading) state instead of a specific value. Useful when the completion percentage is unknown.",
                children: /* @__PURE__ */ jsx(
                  Switch,
                  {
                    id: "progress-indeterminate",
                    checked: isIndeterminate,
                    onCheckedChange: (checked) => updateSetting("indeterminate", !!checked),
                    className: "scale-75 origin-right"
                  }
                )
              }
            ),
            isIndeterminate && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(Loader, { className: "h-3 w-3 text-muted-foreground/40 animate-spin" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "Indeterminate — no specific value displayed" })
            ] }),
            !isIndeterminate && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(SectionDivider, {}),
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Value",
                  htmlFor: "progress-value",
                  hint: "The current progress value. Must be between 0 and the max value.",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "progress-value",
                        type: "number",
                        value: settings.value ?? "",
                        onChange: (e) => handleNumberInput("value", e),
                        placeholder: "0",
                        min: 0,
                        max: maxValue,
                        step: 1,
                        className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: [
                      "/ ",
                      maxValue
                    ] })
                  ] })
                }
              ),
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Max",
                  htmlFor: "progress-max",
                  hint: "The maximum value that represents 100% completion. Defaults to 100.",
                  children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "progress-max",
                      type: "number",
                      value: settings.max ?? "",
                      onChange: (e) => handleNumberInput("max", e),
                      placeholder: "100",
                      min: 0,
                      step: 1,
                      className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(SectionDivider, {}),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Percent, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono tabular-nums", children: [
                    currentValue,
                    " / ",
                    maxValue,
                    " (",
                    percentage,
                    "%)"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded-full bg-muted/60 overflow-hidden", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "h-full rounded-full transition-all duration-300",
                      percentage >= 100 ? "bg-emerald-500" : percentage >= 50 ? "bg-blue-500" : percentage >= 25 ? "bg-amber-500" : "bg-red-500"
                    ),
                    style: { width: `${Math.min(percentage, 100)}%` }
                  }
                ) }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: percentage >= 100 ? "Complete!" : percentage >= 75 ? "Almost there" : percentage >= 50 ? "Halfway done" : percentage > 0 ? "In progress" : "Not started" })
              ] }),
              currentValue > maxValue && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                /* @__PURE__ */ jsx(BarChart3, { className: "h-3 w-3 text-amber-500/60" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: [
                  "Value exceeds max — will be clamped to ",
                  maxValue
                ] })
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Accessibility",
          icon: /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Label",
                htmlFor: "progress-label",
                hint: "Accessible label for the progress bar. Describes what the progress represents (e.g. 'Upload progress', 'Loading files'). Used by screen readers.",
                children: /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "progress-label",
                    type: "text",
                    value: settings.label ?? "",
                    onChange: handleLabelChange,
                    placeholder: "Loading...",
                    className: "h-7 w-full max-w-[160px] px-2 text-[11px] rounded-md",
                    autoComplete: "off"
                  }
                )
              }
            ),
            settings.label && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 text-muted-foreground/40" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                "aria-label: “",
                settings.label,
                "”"
              ] })
            ] }),
            !settings.label && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 text-amber-500/60" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: "Add a label for better accessibility" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
        isIndeterminate ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-600 dark:text-blue-400", children: [
          /* @__PURE__ */ jsx(Loader, { className: "h-2.5 w-2.5 animate-spin" }),
          "indeterminate"
        ] }) : /* @__PURE__ */ jsxs(
          "span",
          {
            className: cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono",
              percentage >= 100 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/60 text-muted-foreground"
            ),
            children: [
              /* @__PURE__ */ jsx(Percent, { className: "h-2.5 w-2.5" }),
              percentage,
              "%"
            ]
          }
        ),
        settings.label && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Tag, { className: "h-2.5 w-2.5" }),
          "labeled"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ProgressConfiguration as default
};
