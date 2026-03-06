import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { MousePointerClick, Link2, ExternalLink, ArrowRight } from "lucide-react";
import { b as ConfigSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
import "react";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
const TARGET_OPTIONS = [
  { value: "_self", label: "Same tab" },
  { value: "_blank", label: "New tab" },
  { value: "_parent", label: "Parent frame" },
  { value: "_top", label: "Top frame" }
];
function ButtonConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Button") {
    return null;
  }
  const element = selectedElement;
  const href = element.href ?? "";
  const handleHrefChange = (e) => {
    updateElement(selectedElement.id, { href: e.target.value });
  };
  const updateSetting = (name, value) => {
    updateElement(selectedElement.id, {
      settings: { ...selectedElement.settings ?? {}, [name]: value }
    });
  };
  const hasHref = href.length > 0;
  const isExternalUrl = hasHref && (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//"));
  const isMailto = hasHref && href.startsWith("mailto:");
  const isTel = hasHref && href.startsWith("tel:");
  const isAnchor = hasHref && href.startsWith("#");
  const target = selectedElement.settings?.target ?? "_self";
  const getLinkTypeLabel = () => {
    if (isMailto) return "Email link";
    if (isTel) return "Phone link";
    if (isAnchor) return "Anchor link";
    if (isExternalUrl) return "External link";
    if (hasHref) return "Internal link";
    return null;
  };
  const getLinkTypeColor = () => {
    if (isMailto || isTel)
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    if (isAnchor)
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    if (isExternalUrl)
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  };
  const getLinkTypeIcon = () => {
    if (isExternalUrl) return /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" });
    if (isAnchor) return /* @__PURE__ */ jsx(ArrowRight, { className: "h-2.5 w-2.5" });
    return /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" });
  };
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "button-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(MousePointerClick, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Button Settings" }),
          hasHref && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsxs(
            "span",
            {
              className: cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                getLinkTypeColor()
              ),
              children: [
                getLinkTypeIcon(),
                isExternalUrl ? "external" : "linked"
              ]
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Link",
          icon: /* @__PURE__ */ jsx(Link2, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "URL",
                htmlFor: "button-href",
                hint: "Optional URL the button navigates to when clicked. Leave empty for buttons that only trigger actions/events. Supports absolute URLs, relative paths, anchors (#section), mailto:, and tel: links.",
                vertical: true,
                children: /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "button-href",
                    name: "href",
                    type: "text",
                    value: href,
                    onChange: handleHrefChange,
                    placeholder: "/page, https://..., #section, mailto:...",
                    className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                    autoComplete: "off"
                  }
                )
              }
            ),
            hasHref && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  getLinkTypeColor()
                ),
                children: [
                  getLinkTypeIcon(),
                  getLinkTypeLabel()
                ]
              }
            ) }),
            !hasHref && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(MousePointerClick, { className: "h-3 w-3 text-muted-foreground/40" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: "No link set — button will only trigger attached events or form actions" })
            ] })
          ]
        }
      ),
      hasHref && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsxs(
          ConfigSection,
          {
            title: "Behavior",
            icon: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }),
            children: [
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Target",
                  htmlFor: "button-target",
                  hint: "Where to open the linked URL. 'New tab' opens in a separate browser tab; 'Same tab' navigates in the current tab.",
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: target,
                      onValueChange: (value) => updateSetting("target", value),
                      children: [
                        /* @__PURE__ */ jsx(
                          SelectTrigger,
                          {
                            id: "button-target",
                            className: "h-7 w-[120px] px-2 text-[11px] rounded-md",
                            children: /* @__PURE__ */ jsx(SelectValue, {})
                          }
                        ),
                        /* @__PURE__ */ jsx(SelectContent, { children: TARGET_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                          opt.value === "_blank" && /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-muted-foreground" }),
                          /* @__PURE__ */ jsx("span", { children: opt.label })
                        ] }) }, opt.value)) })
                      ]
                    }
                  )
                }
              ),
              target === "_blank" && isExternalUrl && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-blue-500/60" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-blue-600/60 dark:text-blue-400/60 leading-tight", children: 'Opens in a new tab with rel="noopener noreferrer" for security' })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(MousePointerClick, { className: "h-2.5 w-2.5" }),
          "<button>"
        ] }),
        hasHref && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" }),
          "href"
        ] }),
        hasHref && target === "_blank" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
          "new tab"
        ] }),
        !hasHref && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "action only" })
      ] })
    ] }) })
  ] });
}
export {
  ButtonConfiguration as default
};
