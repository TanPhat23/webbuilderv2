import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { Quote, ExternalLink, Link2, BookOpen } from "lucide-react";
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
function BlockquoteConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Blockquote") {
    return null;
  }
  const settings = selectedElement.settings ?? {};
  const handleCiteChange = (e) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, cite: e.target.value || void 0 }
    });
  };
  const hasCite = !!settings.cite && settings.cite.length > 0;
  const isExternalCite = hasCite && (settings.cite.startsWith("http://") || settings.cite.startsWith("https://"));
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "blockquote-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Quote, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Blockquote Settings" }),
          hasCite && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400", children: "cited" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Citation",
          icon: /* @__PURE__ */ jsx(BookOpen, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Source URL",
                htmlFor: "blockquote-cite",
                hint: "The URL of the source document or message that the quote is taken from. This is used by search engines and assistive technologies to attribute the quote. It does not render visually — use content text for visible attribution.",
                vertical: true,
                children: /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "blockquote-cite",
                    type: "text",
                    value: settings.cite ?? "",
                    onChange: handleCiteChange,
                    placeholder: "https://example.com/article",
                    className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                    autoComplete: "off"
                  }
                )
              }
            ),
            hasCite && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isExternalCite ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                ),
                children: isExternalCite ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
                  "External source"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" }),
                  "Internal reference"
                ] })
              }
            ) }),
            /* @__PURE__ */ jsx(SectionDivider, {}),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(Quote, { className: "h-3 w-3 text-muted-foreground/40" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: hasCite ? "The cite attribute provides machine-readable attribution — it is not displayed visually by the browser" : "Add a source URL to semantically attribute this quote for SEO and accessibility" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Quote, { className: "h-2.5 w-2.5" }),
          "<blockquote>"
        ] }),
        hasCite && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" }),
          "cite"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  BlockquoteConfiguration as default
};
