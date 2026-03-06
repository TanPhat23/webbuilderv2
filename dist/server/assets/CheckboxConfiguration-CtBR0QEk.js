import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { CheckSquare, Tag, Settings2, MinusSquare, ShieldCheck, Lock } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
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
import "./select-CPjHyyea.js";
function CheckboxConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Checkbox") {
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
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "checkbox-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(CheckSquare, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Checkbox Settings" }),
          settings.name && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground", children: settings.name }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["general", "state", "validation", "constraints"],
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
                    htmlFor: "checkbox-name",
                    hint: "The name attribute for the checkbox. Used as the key when the form is submitted.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "checkbox-name",
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
                    label: "Value",
                    htmlFor: "checkbox-value",
                    hint: "The value submitted with the form when the checkbox is checked. Defaults to 'on' if not set.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "checkbox-value",
                        name: "value",
                        type: "text",
                        value: settings.value || "",
                        onChange: handleChange,
                        placeholder: "on",
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
                    label: "Label text",
                    htmlFor: "checkbox-label",
                    hint: "Visible label text displayed next to the checkbox. Clicking the label also toggles the checkbox.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "checkbox-label",
                        name: "label",
                        type: "text",
                        value: settings.label || "",
                        onChange: handleChange,
                        placeholder: "Accept terms",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                settings.label && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                    "Label: “",
                    settings.label,
                    "”"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "state",
              title: "State",
              icon: /* @__PURE__ */ jsx(CheckSquare, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Default checked",
                    htmlFor: "checkbox-defaultChecked",
                    hint: "Whether the checkbox is initially checked when the page loads.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "checkbox-defaultChecked",
                        checked: !!settings.defaultChecked,
                        onCheckedChange: (checked) => updateSetting("defaultChecked", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Indeterminate",
                    htmlFor: "checkbox-indeterminate",
                    hint: "Show the checkbox in an indeterminate (mixed) state. Typically used for 'select all' checkboxes where only some children are checked.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "checkbox-indeterminate",
                        checked: !!settings.indeterminate,
                        onCheckedChange: (checked) => updateSetting("indeterminate", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                  settings.defaultChecked && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400", children: [
                    /* @__PURE__ */ jsx(CheckSquare, { className: "h-2.5 w-2.5" }),
                    "checked"
                  ] }),
                  settings.indeterminate && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400", children: [
                    /* @__PURE__ */ jsx(MinusSquare, { className: "h-2.5 w-2.5" }),
                    "indeterminate"
                  ] }),
                  !settings.defaultChecked && !settings.indeterminate && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "unchecked" })
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
                    htmlFor: "checkbox-required",
                    hint: "The checkbox must be checked for the form to be submitted. Commonly used for terms & conditions.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "checkbox-required",
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
                    label: "Disabled",
                    htmlFor: "checkbox-disabled",
                    hint: "Prevents all interaction and dims the checkbox. The value is NOT submitted with the form.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "checkbox-disabled",
                        checked: !!settings.disabled,
                        onCheckedChange: (checked) => updateSetting("disabled", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                  settings.required && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-mono text-red-600 dark:text-red-400", children: "required" }),
                  settings.disabled && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "disabled" }),
                  !settings.required && !settings.disabled && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "No constraints applied" })
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
  CheckboxConfiguration as default
};
