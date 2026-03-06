import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { TextCursorInput, Settings2, ShieldCheck, Hash, Lock, Keyboard, Type, AtSign, KeyRound, Phone, Globe } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider, b as ConfigSection } from "./AccordionSection-BcJ45_Y5.js";
import "react";
import { V as ValidationConfiguration } from "./ValidationConfiguration-B7uKEdJo.js";
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
const INPUT_TYPE_OPTIONS = [
  { value: "text", label: "Text", icon: /* @__PURE__ */ jsx(Type, { className: "h-3 w-3" }) },
  { value: "email", label: "Email", icon: /* @__PURE__ */ jsx(AtSign, { className: "h-3 w-3" }) },
  {
    value: "password",
    label: "Password",
    icon: /* @__PURE__ */ jsx(KeyRound, { className: "h-3 w-3" })
  },
  { value: "number", label: "Number", icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }) },
  { value: "tel", label: "Tel", icon: /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }) },
  { value: "url", label: "URL", icon: /* @__PURE__ */ jsx(Globe, { className: "h-3 w-3" }) }
];
function InputConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Input") {
    return null;
  }
  const settings = selectedElement.settings ?? {};
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
  const isNumberType = settings.type === "number";
  const currentType = INPUT_TYPE_OPTIONS.find((opt) => opt.value === settings.type) ?? INPUT_TYPE_OPTIONS[0];
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "input-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(TextCursorInput, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Input Settings" }),
          settings.name && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground", children: settings.name }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["general", "validation", "constraints"],
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "general",
              title: "General",
              icon: /* @__PURE__ */ jsx(Settings2, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Name",
                    htmlFor: "input-name",
                    hint: "The name attribute for the input field. Used as the key when the form is submitted.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "input-name",
                        name: "name",
                        type: "text",
                        value: settings.name || "",
                        onChange: handleChange,
                        placeholder: "fieldName",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Type",
                    htmlFor: "input-type",
                    hint: "The input type determines validation behavior and the keyboard layout shown on mobile devices.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.type || "text",
                        onValueChange: (value) => updateSetting("type", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "input-type",
                              className: "h-7 w-[120px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: INPUT_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: opt.icon }),
                            /* @__PURE__ */ jsx("span", { children: opt.label })
                          ] }) }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40", children: currentType.icon }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                    currentType.label,
                    " input",
                    isNumberType && " — numeric keyboard on mobile",
                    settings.type === "email" && " — email keyboard on mobile",
                    settings.type === "tel" && " — phone keyboard on mobile",
                    settings.type === "url" && " — URL keyboard on mobile",
                    settings.type === "password" && " — characters hidden"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Placeholder",
                    htmlFor: "input-placeholder",
                    hint: "Ghost text shown inside the input when it's empty. Helps guide the user on what to enter.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "input-placeholder",
                        name: "placeholder",
                        type: "text",
                        value: settings.placeholder || "",
                        onChange: handleChange,
                        placeholder: "Enter value...",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Default value",
                    htmlFor: "input-defaultValue",
                    hint: "Pre-filled value in the input field. The user can change it.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "input-defaultValue",
                        name: "defaultValue",
                        type: "text",
                        value: settings.defaultValue ?? "",
                        onChange: handleChange,
                        placeholder: "None",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            AccordionSection,
            {
              value: "validation",
              title: "Validation Rules",
              icon: /* @__PURE__ */ jsx(ShieldCheck, {}),
              nested: true,
              children: /* @__PURE__ */ jsx(ValidationConfiguration, {})
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "constraints",
              title: "Constraints",
              icon: /* @__PURE__ */ jsx(Lock, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Required",
                    htmlFor: "input-required",
                    hint: "Make this field mandatory for form submission.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "input-required",
                        checked: !!settings.required,
                        onCheckedChange: (checked) => updateSetting("required", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Pattern",
                    htmlFor: "input-pattern",
                    hint: "Regular expression pattern for native HTML validation. The input value must match this pattern.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "input-pattern",
                        name: "pattern",
                        type: "text",
                        value: settings.pattern || "",
                        onChange: handleChange,
                        placeholder: "[A-Za-z]+",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                isNumberType && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(SectionDivider, {}),
                  /* @__PURE__ */ jsxs(
                    ConfigSection,
                    {
                      title: "Number Constraints",
                      icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }),
                      children: [
                        /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: "Min",
                            htmlFor: "input-min",
                            hint: "Minimum allowed numeric value.",
                            children: /* @__PURE__ */ jsx(
                              Input,
                              {
                                id: "input-min",
                                type: "number",
                                value: settings.min ?? "",
                                onChange: (e) => updateSetting(
                                  "min",
                                  e.target.value ? Number(e.target.value) : void 0
                                ),
                                placeholder: "0",
                                className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: "Max",
                            htmlFor: "input-max",
                            hint: "Maximum allowed numeric value.",
                            children: /* @__PURE__ */ jsx(
                              Input,
                              {
                                id: "input-max",
                                type: "number",
                                value: settings.max ?? "",
                                onChange: (e) => updateSetting(
                                  "max",
                                  e.target.value ? Number(e.target.value) : void 0
                                ),
                                placeholder: "100",
                                className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          ConfigField,
                          {
                            label: "Step",
                            htmlFor: "input-step",
                            hint: "Increment step for the number input. Determines the granularity of valid values.",
                            children: /* @__PURE__ */ jsx(
                              Input,
                              {
                                id: "input-step",
                                type: "number",
                                value: settings.step ?? "",
                                onChange: (e) => updateSetting(
                                  "step",
                                  e.target.value ? Number(e.target.value) : void 0
                                ),
                                placeholder: "1",
                                className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                              }
                            )
                          }
                        ),
                        (settings.min !== void 0 || settings.max !== void 0) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                          /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3 text-muted-foreground/40" }),
                          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: [
                            settings.min !== void 0 ? settings.min : "−∞",
                            " → ",
                            settings.max !== void 0 ? settings.max : "+∞",
                            settings.step ? ` (step: ${settings.step})` : ""
                          ] })
                        ] })
                      ]
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "advanced",
              title: "Advanced",
              icon: /* @__PURE__ */ jsx(Keyboard, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Autocomplete",
                    htmlFor: "input-autoComplete",
                    hint: "Browser autocomplete hint. Common values: 'on', 'off', 'name', 'email', 'tel', 'address-line1', etc.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "input-autoComplete",
                        name: "autoComplete",
                        type: "text",
                        value: settings.autoComplete || "",
                        onChange: handleChange,
                        placeholder: "on / off",
                        className: "h-7 w-full max-w-[120px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Keyboard, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: settings.autoComplete === "off" ? "Browser autocomplete disabled" : settings.autoComplete ? `Autocomplete hint: "${settings.autoComplete}"` : "Using browser default autocomplete" })
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
  InputConfiguration as default
};
