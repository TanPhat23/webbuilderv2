import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import "./project.service-Bci2lGYe.js";
import { h as cn } from "./prisma-BUnO9f9X.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { Heading, Type } from "lucide-react";
import { b as ConfigSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
import "react";
import "radix-ui";
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
const HEADING_LEVEL_OPTIONS = [
  {
    value: 1,
    label: "Heading 1",
    tag: "h1",
    description: "Page title — largest heading",
    fontSize: "2rem"
  },
  {
    value: 2,
    label: "Heading 2",
    tag: "h2",
    description: "Section heading",
    fontSize: "1.5rem"
  },
  {
    value: 3,
    label: "Heading 3",
    tag: "h3",
    description: "Sub-section heading",
    fontSize: "1.25rem"
  },
  {
    value: 4,
    label: "Heading 4",
    tag: "h4",
    description: "Minor heading",
    fontSize: "1.125rem"
  },
  {
    value: 5,
    label: "Heading 5",
    tag: "h5",
    description: "Small heading",
    fontSize: "1rem"
  },
  {
    value: 6,
    label: "Heading 6",
    tag: "h6",
    description: "Smallest heading",
    fontSize: "0.875rem"
  }
];
function HeadingConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Heading") {
    return null;
  }
  const settings = selectedElement.settings ?? { level: 2 };
  const currentLevel = settings.level ?? 2;
  const currentOption = HEADING_LEVEL_OPTIONS.find((opt) => opt.value === currentLevel) ?? HEADING_LEVEL_OPTIONS[1];
  const handleLevelChange = (level) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, level }
    });
  };
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "heading-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Heading, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Heading Settings" }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground uppercase", children: currentOption.tag }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: /* @__PURE__ */ jsxs(
      ConfigSection,
      {
        title: "Level",
        icon: /* @__PURE__ */ jsx(Type, { className: "h-3 w-3" }),
        children: [
          /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Heading level",
              hint: "Sets the semantic heading tag (h1–h6). Use h1 for page titles and progressively smaller levels for sub-sections. Proper heading hierarchy improves accessibility and SEO.",
              vertical: true,
              children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-1 w-full", children: HEADING_LEVEL_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleLevelChange(opt.value),
                  className: cn(
                    "flex items-center justify-center rounded-md py-1.5 text-[11px] font-mono font-semibold transition-all duration-150",
                    "border border-border/50 hover:border-border",
                    currentLevel === opt.value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  ),
                  title: opt.description,
                  children: [
                    "H",
                    opt.value
                  ]
                },
                opt.value
              )) })
            }
          ),
          /* @__PURE__ */ jsx(SectionDivider, {}),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pl-0.5 animate-in fade-in-0 duration-150", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "font-bold text-foreground/70 leading-none",
                style: { fontSize: currentOption.fontSize },
                children: "Aa"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground/70", children: currentOption.label }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: currentOption.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150", children: [
            /* @__PURE__ */ jsx(Heading, { className: "h-3 w-3 text-muted-foreground/40" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: currentLevel === 1 ? "Use only one h1 per page for best SEO" : `Renders as <${currentOption.tag}> in the document` })
          ] })
        ]
      }
    ) }) })
  ] });
}
export {
  HeadingConfiguration as default
};
