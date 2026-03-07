import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-D43pR8IL.js";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { FileText, CheckCircle2, ExternalLink, ArrowRight, Globe, ShieldCheck, Lock, Settings2, Send } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
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
const METHOD_OPTIONS = [
  {
    value: "post",
    label: "POST",
    description: "Send data in the request body",
    icon: /* @__PURE__ */ jsx(Send, { className: "h-3 w-3" })
  },
  {
    value: "get",
    label: "GET",
    description: "Send data as URL parameters",
    icon: /* @__PURE__ */ jsx(Globe, { className: "h-3 w-3" })
  }
];
const TARGET_OPTIONS = [
  { value: "_self", label: "Same tab" },
  { value: "_blank", label: "New tab" },
  { value: "_parent", label: "Parent frame" },
  { value: "_top", label: "Top frame" }
];
const ENCODING_OPTIONS = [
  { value: "application/x-www-form-urlencoded", label: "URL Encoded" },
  { value: "multipart/form-data", label: "Multipart" },
  { value: "text/plain", label: "Plain Text" }
];
const FormConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Form") {
    return null;
  }
  const settings = selectedElement.settings || {};
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value }
    });
  };
  const updateSetting = (name, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value }
    });
  };
  const hasAction = !!settings.action && settings.action.length > 0;
  const isExternalAction = hasAction && (settings.action.startsWith("http://") || settings.action.startsWith("https://"));
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "form-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Form Settings" }),
          hasAction && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-500/60" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["general", "validation", "advanced"],
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "general",
              title: "General",
              icon: /* @__PURE__ */ jsx(Globe, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Action URL",
                    htmlFor: "form-action",
                    hint: "The URL where the form data will be submitted. Use a relative path for same-origin or an absolute URL for external endpoints.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "form-action",
                        name: "action",
                        type: "text",
                        value: settings.action || "",
                        onChange: handleChange,
                        placeholder: "/api/submit",
                        className: "h-7 w-full max-w-[160px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                hasAction && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isExternalAction ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    ),
                    children: isExternalAction ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5" }),
                      "External endpoint"
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(ArrowRight, { className: "h-2.5 w-2.5" }),
                      "Internal endpoint"
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Method",
                    htmlFor: "form-method",
                    hint: "HTTP method for form submission. POST is recommended for data mutations.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.method || "post",
                        onValueChange: (value) => updateSetting("method", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "form-method",
                              className: "h-7 w-[100px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: METHOD_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: opt.icon }),
                            /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px]", children: opt.label })
                          ] }) }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Encoding",
                    htmlFor: "form-encType",
                    hint: "How form data is encoded when sent. Use 'Multipart' for file uploads.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.encType || "application/x-www-form-urlencoded",
                        onValueChange: (value) => updateSetting("encType", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "form-encType",
                              className: "h-7 w-[120px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: ENCODING_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Autocomplete",
                    htmlFor: "form-autoComplete",
                    hint: "Enable or disable browser autocomplete for all form fields.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.autoComplete || "on",
                        onValueChange: (value) => updateSetting("autoComplete", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "form-autoComplete",
                              className: "h-7 w-[80px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsxs(SelectContent, { children: [
                            /* @__PURE__ */ jsx(SelectItem, { value: "on", children: "On" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "off", children: "Off" })
                          ] })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Target",
                    htmlFor: "form-target",
                    hint: "Where to display the response after form submission.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.target || "_self",
                        onValueChange: (value) => updateSetting("target", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "form-target",
                              className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
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
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "validation",
              title: "Validation",
              icon: /* @__PURE__ */ jsx(ShieldCheck, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Validate on submit",
                    htmlFor: "validate-on-submit",
                    hint: "Enable client-side validation before form submission. This will check all input rules before allowing the form to submit.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "validate-on-submit",
                        checked: !!settings.validateOnSubmit,
                        onCheckedChange: (checked) => updateSetting("validateOnSubmit", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: settings.validateOnSubmit ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3 w-3 text-emerald-500/60" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600/60 dark:text-emerald-400/60", children: "Client-side validation active" })
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "No client-side validation — browser defaults apply" })
                ] }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "advanced",
              title: "Advanced",
              icon: /* @__PURE__ */ jsx(Settings2, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Redirect URL",
                    htmlFor: "form-redirectUrl",
                    hint: "URL to redirect to after successful form submission.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "form-redirectUrl",
                        name: "redirectUrl",
                        type: "text",
                        value: settings.redirectUrl || "",
                        onChange: handleChange,
                        placeholder: "/thank-you",
                        className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "No validate (HTML)",
                    htmlFor: "form-noValidate",
                    hint: "Disable the browser's built-in form validation. Use this if you handle validation entirely in JavaScript.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "form-noValidate",
                        checked: !!settings.noValidate,
                        onCheckedChange: (checked) => updateSetting("noValidate", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Charset",
                    htmlFor: "form-acceptCharset",
                    hint: "Character encoding for form submission. Almost always UTF-8.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "form-acceptCharset",
                        name: "acceptCharset",
                        type: "text",
                        value: settings.acceptCharset || "",
                        onChange: handleChange,
                        placeholder: "UTF-8",
                        className: "h-7 w-[90px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 pt-1 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5", children: [
                    /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: settings.noValidate ? "Browser validation disabled — ensure JS validation is in place" : "Browser validation enabled" })
                  ] }),
                  isExternalAction && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5", children: [
                    /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-amber-500/50" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/50 dark:text-amber-400/50 leading-tight", children: "Submitting to an external endpoint — ensure CORS is configured" })
                  ] })
                ] })
              ]
            }
          )
        ]
      }
    ) })
  ] });
};
export {
  FormConfigurationAccordion
};
