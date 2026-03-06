import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Circle, CircleDot, Tag, Settings2, ShieldCheck, Lock } from "lucide-react";
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
function RadioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Radio") {
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
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "radio-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Radio Settings" }),
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
                    htmlFor: "radio-name",
                    hint: "The name attribute for the radio button. Radio buttons with the same name form a mutually exclusive group — only one can be selected at a time.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "radio-name",
                        name: "name",
                        type: "text",
                        value: settings.name || "",
                        onChange: handleChange,
                        placeholder: "groupName",
                        className: "h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                settings.name && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(CircleDot, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: [
                    "Group: “",
                    settings.name,
                    "” — all radios with this name share a group"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Value",
                    htmlFor: "radio-value",
                    hint: "The value submitted with the form when this radio button is selected. Each radio in a group should have a unique value.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "radio-value",
                        name: "value",
                        type: "text",
                        value: settings.value || "",
                        onChange: handleChange,
                        placeholder: "option-1",
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
                    htmlFor: "radio-label",
                    hint: "Visible label text displayed next to the radio button. Clicking the label also selects the radio.",
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "radio-label",
                        name: "label",
                        type: "text",
                        value: settings.label || "",
                        onChange: handleChange,
                        placeholder: "Option label",
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
              icon: /* @__PURE__ */ jsx(CircleDot, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Default selected",
                    htmlFor: "radio-defaultChecked",
                    hint: "Whether this radio button is initially selected when the page loads. Only one radio in a group should be default-selected.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "radio-defaultChecked",
                        checked: !!settings.defaultChecked,
                        onCheckedChange: (checked) => updateSetting("defaultChecked", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: settings.defaultChecked ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400", children: [
                  /* @__PURE__ */ jsx(CircleDot, { className: "h-2.5 w-2.5" }),
                  "selected"
                ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Circle, { className: "h-2.5 w-2.5" }),
                  "unselected"
                ] }) }),
                settings.defaultChecked && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(CircleDot, { className: "h-3 w-3 text-amber-500/60" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: [
                    "Ensure only one radio in the “",
                    settings.name || "unnamed",
                    "” group is default-selected"
                  ] })
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
                    htmlFor: "radio-required",
                    hint: "At least one radio button in the group must be selected for the form to be submitted.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "radio-required",
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
                    htmlFor: "radio-disabled",
                    hint: "Prevents all interaction and dims the radio button. The value is NOT submitted with the form.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "radio-disabled",
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
  RadioConfiguration as default
};
