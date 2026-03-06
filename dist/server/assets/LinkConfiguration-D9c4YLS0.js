import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Link2, ExternalLink, Shield } from "lucide-react";
import { b as ConfigSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
import "react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
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
const LinkConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Link") {
    return null;
  }
  const href = selectedElement.href ?? "";
  const settings = selectedElement.settings ?? {};
  const target = settings.target ?? "_self";
  const nofollow = settings.nofollow ?? false;
  const noopener = settings.noopener ?? true;
  const noreferrer = settings.noreferrer ?? false;
  const handleHrefChange = (e) => {
    updateElement(selectedElement.id, {
      href: e.target.value
    });
  };
  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    const relParts = [];
    if (next.noopener ?? noopener) relParts.push("noopener");
    if (next.noreferrer ?? noreferrer) relParts.push("noreferrer");
    if (next.nofollow ?? nofollow) relParts.push("nofollow");
    updateElement(selectedElement.id, {
      settings: {
        ...next,
        rel: relParts.length > 0 ? relParts.join(" ") : void 0
      }
    });
  };
  const handleTargetChange = (value) => {
    const isExternal = value === "_blank";
    updateSettings({
      target: value,
      // Auto-enable noopener for external links (security best practice)
      noopener: isExternal ? true : noopener
    });
  };
  const isExternalUrl = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "link-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Link2, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Link Settings" }),
          isExternalUrl && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-muted-foreground/50" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(ConfigSection, { children: [
        /* @__PURE__ */ jsx(
          ConfigField,
          {
            label: "URL",
            htmlFor: "link-href",
            hint: "The destination URL. Use an absolute URL for external links or a relative path for internal pages.",
            children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "link-href",
                name: "href",
                type: "text",
                value: href,
                onChange: handleHrefChange,
                placeholder: "/page or https://...",
                className: "h-7 w-full max-w-[180px] px-2 text-[11px] font-mono",
                autoComplete: "off"
              }
            )
          }
        ),
        href && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-1 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              isExternalUrl ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            ),
            children: isExternalUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
              "External"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" }),
              "Internal"
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsx(
        ConfigSection,
        {
          title: "Behavior",
          icon: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }),
          children: /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Target",
              htmlFor: "link-target",
              hint: "Where to open the linked document.",
              children: /* @__PURE__ */ jsxs(Select, { value: target, onValueChange: handleTargetChange, children: [
                /* @__PURE__ */ jsx(
                  SelectTrigger,
                  {
                    id: "link-target",
                    className: "h-7 w-[120px] px-2 text-[11px] rounded-md",
                    children: /* @__PURE__ */ jsx(SelectValue, {})
                  }
                ),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "_self", children: /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1.5", children: "Same tab" }) }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "_blank", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-muted-foreground" }),
                    "New tab"
                  ] }) }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "_parent", children: "Parent frame" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "_top", children: "Top frame" })
                ] })
              ] })
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Security & SEO",
          icon: /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "noopener",
                htmlFor: "link-noopener",
                hint: "Prevents the new page from accessing window.opener. Recommended for external links.",
                children: /* @__PURE__ */ jsx(
                  Switch,
                  {
                    id: "link-noopener",
                    checked: noopener,
                    onCheckedChange: (checked) => updateSettings({ noopener: !!checked }),
                    className: "scale-75 origin-right"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "noreferrer",
                htmlFor: "link-noreferrer",
                hint: "Prevents the browser from sending the referring page's address. Implies noopener.",
                children: /* @__PURE__ */ jsx(
                  Switch,
                  {
                    id: "link-noreferrer",
                    checked: noreferrer,
                    onCheckedChange: (checked) => updateSettings({ noreferrer: !!checked }),
                    className: "scale-75 origin-right"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "nofollow",
                htmlFor: "link-nofollow",
                hint: "Tells search engines not to follow this link. Useful for untrusted or paid links.",
                children: /* @__PURE__ */ jsx(
                  Switch,
                  {
                    id: "link-nofollow",
                    checked: nofollow,
                    onCheckedChange: (checked) => updateSettings({ nofollow: !!checked }),
                    className: "scale-75 origin-right"
                  }
                )
              }
            ),
            (noopener || noreferrer || nofollow) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-wrap pt-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 mr-0.5", children: "rel=" }),
              noopener && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "noopener" }),
              noreferrer && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "noreferrer" }),
              nofollow && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "nofollow" })
            ] })
          ]
        }
      )
    ] }) })
  ] });
};
export {
  LinkConfigurationAccordion
};
