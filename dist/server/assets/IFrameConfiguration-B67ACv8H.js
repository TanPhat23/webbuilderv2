import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Globe, CheckCircle2, ExternalLink, Settings2, Shield, Lock, Loader, Monitor } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider, b as ConfigSection } from "./AccordionSection-BcJ45_Y5.js";
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
const SANDBOX_OPTIONS = [
  {
    value: "allow-scripts",
    label: "Scripts",
    description: "Allow JavaScript execution"
  },
  {
    value: "allow-same-origin",
    label: "Same Origin",
    description: "Treat content as same-origin"
  },
  {
    value: "allow-forms",
    label: "Forms",
    description: "Allow form submission"
  },
  {
    value: "allow-popups",
    label: "Popups",
    description: "Allow popups (window.open, target=_blank)"
  },
  {
    value: "allow-modals",
    label: "Modals",
    description: "Allow modal dialogs (alert, confirm, prompt)"
  },
  {
    value: "allow-top-navigation",
    label: "Top Navigation",
    description: "Allow navigating the top-level browsing context"
  }
];
const LOADING_OPTIONS = [
  { value: "lazy", label: "Lazy", description: "Load when near viewport" },
  { value: "eager", label: "Eager", description: "Load immediately" }
];
const REFERRER_POLICY_OPTIONS = [
  { value: "no-referrer", label: "No Referrer" },
  { value: "no-referrer-when-downgrade", label: "No Referrer When Downgrade" },
  { value: "origin", label: "Origin" },
  { value: "origin-when-cross-origin", label: "Origin When Cross-Origin" },
  { value: "same-origin", label: "Same Origin" },
  { value: "strict-origin", label: "Strict Origin" },
  {
    value: "strict-origin-when-cross-origin",
    label: "Strict Origin When Cross-Origin"
  },
  { value: "unsafe-url", label: "Unsafe URL" }
];
function IFrameConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "IFrame") {
    return null;
  }
  const element = selectedElement;
  const settings = element.settings ?? {};
  const src = element.src ?? "";
  const handleSrcChange = (e) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };
  const updateSetting = (key, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value }
    });
  };
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? void 0 : parsed);
  };
  const currentSandboxValues = settings.sandbox ? settings.sandbox.split(" ").filter(Boolean) : [];
  const isSandboxEnabled = settings.sandbox !== void 0;
  const toggleSandboxValue = (value) => {
    const current = new Set(currentSandboxValues);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    const newSandbox = Array.from(current).join(" ");
    updateSetting("sandbox", newSandbox || "");
  };
  const toggleSandboxEnabled = (enabled) => {
    if (enabled) {
      updateSetting("sandbox", "allow-scripts allow-same-origin");
    } else {
      updateSetting("sandbox", void 0);
    }
  };
  const hasSrc = src.length > 0;
  const isExternalUrl = hasSrc && (src.startsWith("http://") || src.startsWith("https://"));
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "iframe-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "IFrame Settings" }),
          hasSrc && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-500/60" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["source", "security", "display"],
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "source",
              title: "Source",
              icon: /* @__PURE__ */ jsx(Settings2, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Source URL",
                    htmlFor: "iframe-src",
                    hint: "The URL of the page to embed. Must be a valid URL that allows embedding (not blocked by X-Frame-Options or CSP).",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "iframe-src",
                        type: "text",
                        value: src,
                        onChange: handleSrcChange,
                        placeholder: "https://example.com",
                        className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                hasSrc && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isExternalUrl ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    ),
                    children: isExternalUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
                      "External embed"
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Globe, { className: "h-2.5 w-2.5" }),
                      "Internal embed"
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Allow",
                    htmlFor: "iframe-allow",
                    hint: "Feature policy directives (Permissions-Policy). Controls which browser features the iframe can access. Example: 'camera; microphone; fullscreen'.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "iframe-allow",
                        type: "text",
                        value: settings.allow ?? "",
                        onChange: (e) => updateSetting("allow", e.target.value || void 0),
                        placeholder: "camera; microphone; fullscreen",
                        className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                settings.allow && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 mr-0.5", children: "allow=" }),
                  settings.allow.split(";").map((p) => p.trim()).filter(Boolean).map((permission) => /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground",
                      children: permission
                    },
                    permission
                  ))
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "security",
              title: "Security",
              icon: /* @__PURE__ */ jsx(Shield, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Sandbox",
                    htmlFor: "iframe-sandbox-toggle",
                    hint: "Enable sandboxing to restrict iframe capabilities. When enabled, all restrictions are applied and you selectively allow features. This is a security best practice for embedding third-party content.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "iframe-sandbox-toggle",
                        checked: isSandboxEnabled,
                        onCheckedChange: toggleSandboxEnabled,
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                isSandboxEnabled && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsxs(
                    ConfigSection,
                    {
                      title: "Sandbox Permissions",
                      icon: /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3" }),
                      children: [
                        SANDBOX_OPTIONS.map((opt) => /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: opt.label,
                            hint: opt.description,
                            children: /* @__PURE__ */ jsx(
                              Switch,
                              {
                                checked: currentSandboxValues.includes(opt.value),
                                onCheckedChange: () => toggleSandboxValue(opt.value),
                                className: "scale-75 origin-right"
                              }
                            )
                          },
                          opt.value
                        )),
                        currentSandboxValues.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx(SectionDivider, {}),
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-wrap pt-0.5 animate-in fade-in-0 duration-150", children: [
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 mr-0.5", children: "sandbox=" }),
                            currentSandboxValues.map((v) => /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground",
                                children: v
                              },
                              v
                            ))
                          ] })
                        ] }),
                        currentSandboxValues.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                          /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3 text-amber-500/60" }),
                          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: "Maximum restriction — no permissions granted" })
                        ] })
                      ]
                    }
                  )
                ] }),
                !isSandboxEnabled && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: "No sandbox — iframe has full access to browser APIs" })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Referrer policy",
                    htmlFor: "iframe-referrerPolicy",
                    hint: "Controls how much referrer information is sent when navigating from the iframe. Stricter policies improve privacy.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.referrerPolicy ?? "strict-origin-when-cross-origin",
                        onValueChange: (value) => updateSetting(
                          "referrerPolicy",
                          value
                        ),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "iframe-referrerPolicy",
                              className: "h-7 w-[160px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: REFERRER_POLICY_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: opt.label }) }, opt.value)) })
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
              value: "display",
              title: "Display",
              icon: /* @__PURE__ */ jsx(Monitor, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Loading",
                    htmlFor: "iframe-loading",
                    hint: "Lazy loading defers loading the iframe until it's near the viewport, improving initial page performance.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.loading ?? "lazy",
                        onValueChange: (value) => updateSetting(
                          "loading",
                          value
                        ),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "iframe-loading",
                              className: "h-7 w-[100px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: LOADING_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Loader, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: LOADING_OPTIONS.find(
                    (o) => o.value === (settings.loading ?? "lazy")
                  )?.description })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Width",
                    htmlFor: "iframe-width",
                    hint: "Intrinsic width of the iframe in pixels. Can be overridden by CSS styles.",
                    children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "iframe-width",
                          type: "number",
                          value: settings.width ?? "",
                          onChange: (e) => handleNumberInput("width", e),
                          placeholder: "auto",
                          min: 0,
                          className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Height",
                    htmlFor: "iframe-height",
                    hint: "Intrinsic height of the iframe in pixels. Can be overridden by CSS styles.",
                    children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "iframe-height",
                          type: "number",
                          value: settings.height ?? "",
                          onChange: (e) => handleNumberInput("height", e),
                          placeholder: "auto",
                          min: 0,
                          className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                    ] })
                  }
                ),
                (settings.width || settings.height) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Monitor, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: [
                    settings.width ?? "auto",
                    " × ",
                    settings.height ?? "auto"
                  ] })
                ] })
              ]
            }
          )
        ]
      }
    ) })
  ] });
}
export {
  IFrameConfiguration as default
};
