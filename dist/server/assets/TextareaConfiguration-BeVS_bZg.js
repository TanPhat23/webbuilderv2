import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-D43pR8IL.js";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { AlignLeft, Settings2, Hash, Maximize2, ShieldCheck, Lock, WrapText, SpellCheck, Keyboard } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider, b as ConfigSection } from "./AccordionSection-D9IjFlO-.js";
import "react";
import { V as ValidationConfiguration } from "./ValidationConfiguration-N5pSIYok.js";
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
const WRAP_OPTIONS = [
  {
    value: "soft",
    label: "Soft",
    description: "Wraps visually, no newlines added on submit"
  },
  {
    value: "hard",
    label: "Hard",
    description: "Inserts newlines at wrap points on submit (requires cols)"
  },
  {
    value: "off",
    label: "Off",
    description: "No wrapping — horizontal scrollbar instead"
  }
];
const RESIZE_OPTIONS = [
  { value: "both", label: "Both", description: "Resize in any direction" },
  {
    value: "vertical",
    label: "Vertical",
    description: "Resize vertically only"
  },
  {
    value: "horizontal",
    label: "Horizontal",
    description: "Resize horizontally only"
  },
  { value: "none", label: "None", description: "Disable resizing" }
];
function TextareaConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Textarea") {
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
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? void 0 : parsed);
  };
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "textarea-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(AlignLeft, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Textarea Settings" }),
          settings.name && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground", children: settings.name }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["general", "validation", "dimensions", "behavior"],
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
                    htmlFor: "textarea-name",
                    hint: "The name attribute for the textarea. Used as the key when the form is submitted.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-name",
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
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Placeholder",
                    htmlFor: "textarea-placeholder",
                    hint: "Ghost text shown inside the textarea when it's empty. Helps guide the user on what to enter.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-placeholder",
                        name: "placeholder",
                        type: "text",
                        value: settings.placeholder || "",
                        onChange: handleChange,
                        placeholder: "Enter text...",
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
                    htmlFor: "textarea-defaultValue",
                    hint: "Pre-filled text in the textarea. The user can change it.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-defaultValue",
                        name: "defaultValue",
                        type: "text",
                        value: settings.defaultValue ?? "",
                        onChange: handleChange,
                        placeholder: "None",
                        className: "h-7 w-full px-2 text-[11px] rounded-md",
                        autoComplete: "off"
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
              value: "dimensions",
              title: "Dimensions",
              icon: /* @__PURE__ */ jsx(Maximize2, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Rows",
                    htmlFor: "textarea-rows",
                    hint: "Number of visible text lines. Controls the initial height of the textarea.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-rows",
                        type: "number",
                        value: settings.rows ?? "",
                        onChange: (e) => handleNumberInput("rows", e),
                        placeholder: "4",
                        min: 1,
                        max: 100,
                        className: "h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Cols",
                    htmlFor: "textarea-cols",
                    hint: "Number of visible character columns. Controls the initial width of the textarea.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-cols",
                        type: "number",
                        value: settings.cols ?? "",
                        onChange: (e) => handleNumberInput("cols", e),
                        placeholder: "20",
                        min: 1,
                        max: 200,
                        className: "h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                      }
                    )
                  }
                ),
                (settings.rows || settings.cols) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: [
                    settings.rows ?? "auto",
                    " rows × ",
                    settings.cols ?? "auto",
                    " ",
                    "cols"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Resize",
                    htmlFor: "textarea-resize",
                    hint: "Controls whether the user can resize the textarea by dragging the corner handle.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.resize ?? "both",
                        onValueChange: (value) => updateSetting("resize", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "textarea-resize",
                              className: "h-7 w-[100px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: RESIZE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Maximize2, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: RESIZE_OPTIONS.find(
                    (o) => o.value === (settings.resize ?? "both")
                  )?.description })
                ] })
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
                    htmlFor: "textarea-required",
                    hint: "Make this field mandatory for form submission.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "textarea-required",
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
                    label: "Read only",
                    htmlFor: "textarea-readOnly",
                    hint: "User can see and select the text but cannot edit it. The value is still submitted with the form.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "textarea-readOnly",
                        checked: !!settings.readOnly,
                        onCheckedChange: (checked) => updateSetting("readOnly", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Disabled",
                    htmlFor: "textarea-disabled",
                    hint: "Prevents all interaction and dims the textarea. The value is NOT submitted with the form.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "textarea-disabled",
                        checked: !!settings.disabled,
                        onCheckedChange: (checked) => updateSetting("disabled", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsxs(
                  ConfigSection,
                  {
                    title: "Character Limits",
                    icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }),
                    children: [
                      /* @__PURE__ */ jsx(
                        ConfigField,
                        {
                          label: "Min length",
                          htmlFor: "textarea-minLength",
                          hint: "Minimum number of characters required.",
                          children: /* @__PURE__ */ jsx(
                            Input,
                            {
                              id: "textarea-minLength",
                              type: "number",
                              value: settings.minLength ?? "",
                              onChange: (e) => handleNumberInput("minLength", e),
                              placeholder: "0",
                              min: 0,
                              className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        ConfigField,
                        {
                          label: "Max length",
                          htmlFor: "textarea-maxLength",
                          hint: "Maximum number of characters allowed. The browser will prevent typing beyond this limit.",
                          children: /* @__PURE__ */ jsx(
                            Input,
                            {
                              id: "textarea-maxLength",
                              type: "number",
                              value: settings.maxLength ?? "",
                              onChange: (e) => handleNumberInput("maxLength", e),
                              placeholder: "∞",
                              min: 0,
                              className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                            }
                          )
                        }
                      ),
                      (settings.minLength !== void 0 || settings.maxLength !== void 0) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                        /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3 text-muted-foreground/40" }),
                        /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: [
                          settings.minLength !== void 0 ? settings.minLength : "0",
                          " → ",
                          settings.maxLength !== void 0 ? `${settings.maxLength} chars` : "∞"
                        ] })
                      ] })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "behavior",
              title: "Behavior",
              icon: /* @__PURE__ */ jsx(Keyboard, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Wrap",
                    htmlFor: "textarea-wrap",
                    hint: "Controls how text wrapping is handled when the form is submitted.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.wrap ?? "soft",
                        onValueChange: (value) => updateSetting("wrap", value),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "textarea-wrap",
                              className: "h-7 w-[100px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: WRAP_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(WrapText, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: WRAP_OPTIONS.find(
                    (o) => o.value === (settings.wrap ?? "soft")
                  )?.description })
                ] }),
                settings.wrap === "hard" && !settings.cols && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3 text-amber-500/60" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: "Hard wrap requires a cols value to be set" })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Spell check",
                    htmlFor: "textarea-spellCheck",
                    hint: "Enable browser spell checking for the textarea content.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "textarea-spellCheck",
                        checked: settings.spellCheck !== false,
                        onCheckedChange: (checked) => updateSetting("spellCheck", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(SpellCheck, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: settings.spellCheck !== false ? "Browser spell check enabled" : "Spell check disabled" })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Autocomplete",
                    htmlFor: "textarea-autoComplete",
                    hint: "Browser autocomplete hint. Common values: 'on', 'off'. Helps browsers pre-fill content.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "textarea-autoComplete",
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
  TextareaConfiguration as default
};
