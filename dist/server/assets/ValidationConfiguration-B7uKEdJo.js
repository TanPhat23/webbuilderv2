import { jsxs, jsx } from "react/jsx-runtime";
import React__default from "react";
import { j as cn, aj as Tooltip, ak as TooltipTrigger, B as Button, al as TooltipContent, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Plus, ShieldCheck, X, AlertCircle, Code2, Regex, Hash, Asterisk } from "lucide-react";
import { c as ConfigEmpty } from "./AccordionSection-BcJ45_Y5.js";
const ALL_RULES = [
  "required",
  "minLength",
  "maxLength",
  "pattern",
  "custom"
];
const RULE_META = {
  required: {
    label: "Required",
    description: "Makes this field mandatory for form submission",
    icon: /* @__PURE__ */ jsx(Asterisk, { className: "h-3 w-3" })
  },
  minLength: {
    label: "Min Length",
    description: "Minimum number of characters allowed",
    icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" })
  },
  maxLength: {
    label: "Max Length",
    description: "Maximum number of characters allowed",
    icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" })
  },
  min: {
    label: "Min Value",
    description: "Minimum numeric value allowed",
    icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" })
  },
  max: {
    label: "Max Value",
    description: "Maximum numeric value allowed",
    icon: /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" })
  },
  pattern: {
    label: "Pattern",
    description: "Regular expression the value must match",
    icon: /* @__PURE__ */ jsx(Regex, { className: "h-3 w-3" })
  },
  custom: {
    label: "Custom",
    description: "Custom validation function (edit in code)",
    icon: /* @__PURE__ */ jsx(Code2, { className: "h-3 w-3" })
  }
};
function ValidationConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [newRule, setNewRule] = React__default.useState("required");
  const validateRules = selectedElement?.settings?.validateRules ?? [];
  const availableRules = ALL_RULES.filter(
    (rt) => !validateRules.some((rule) => rule.rule === rt)
  );
  const updateValidationRule = (updateRule) => {
    if (!selectedElement) return;
    const currentRules = validateRules;
    const ruleIndex = currentRules.findIndex(
      (rule) => rule.rule === updateRule.rule
    );
    let newRules;
    if (ruleIndex !== -1) {
      newRules = [
        ...currentRules.slice(0, ruleIndex),
        updateRule,
        ...currentRules.slice(ruleIndex + 1)
      ];
    } else {
      newRules = [...currentRules, updateRule];
    }
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        validateRules: newRules
      }
    });
  };
  const removeValidationRule = (ruleType) => {
    if (!selectedElement) return;
    const newRules = validateRules.filter((rule) => rule.rule !== ruleType);
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        validateRules: newRules
      }
    });
  };
  const handleAddRule = () => {
    if (validateRules.some((rule) => rule.rule === newRule)) return;
    let defaultRule;
    switch (newRule) {
      case "required":
        defaultRule = { rule: "required", message: "" };
        break;
      case "minLength":
      case "maxLength":
      case "min":
      case "max":
        defaultRule = {
          rule: newRule,
          value: 0,
          message: ""
        };
        break;
      case "pattern":
        defaultRule = { rule: "pattern", value: "", message: "" };
        break;
      case "custom":
        defaultRule = {
          rule: "custom",
          message: "",
          validateFn: (value) => true
        };
        break;
      default:
        return;
    }
    updateValidationRule(defaultRule);
  };
  const renderRuleControl = (rule) => {
    switch (rule.rule) {
      case "required":
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Switch,
            {
              id: `required-${rule.rule}`,
              checked: !!("value" in rule && rule.value),
              onCheckedChange: (checked) => updateValidationRule({
                ...rule,
                ..."value" in rule ? { value: !!checked } : {}
              }),
              className: "scale-75 origin-left"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "value" in rule && rule.value ? "Active" : "Inactive" })
        ] });
      case "minLength":
      case "maxLength":
      case "min":
      case "max":
        return /* @__PURE__ */ jsx(
          Input,
          {
            type: "number",
            value: "value" in rule && rule.value !== void 0 ? rule.value : "",
            min: 0,
            onChange: (e) => updateValidationRule({
              ...rule,
              ..."value" in rule ? { value: Number(e.target.value) } : {}
            }),
            className: "h-6 w-[72px] px-1.5 text-[11px] font-mono tabular-nums rounded-md",
            placeholder: "0"
          }
        );
      case "pattern":
        return /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            value: "value" in rule ? typeof rule.value === "string" ? rule.value : rule.value instanceof RegExp ? rule.value.source : "" : "",
            onChange: (e) => updateValidationRule({
              ...rule,
              ..."value" in rule ? { value: e.target.value } : {}
            }),
            className: "h-6 w-full max-w-[140px] px-1.5 text-[11px] font-mono rounded-md",
            placeholder: "^[A-Za-z]+$",
            autoComplete: "off"
          }
        );
      case "custom":
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Code2, { className: "h-3 w-3 text-muted-foreground/50" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 italic", children: "Edit in code" })
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-1.5",
          "rounded-lg border border-dashed border-border/50 bg-muted/20",
          "p-1.5"
        ),
        children: [
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: newRule,
              onValueChange: (value) => setNewRule(value),
              children: [
                /* @__PURE__ */ jsx(
                  SelectTrigger,
                  {
                    className: cn(
                      "h-7 flex-1 px-2 text-[11px] rounded-md",
                      "border-border/40 bg-background"
                    ),
                    children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select rule" })
                  }
                ),
                /* @__PURE__ */ jsx(SelectContent, { children: availableRules.length > 0 ? availableRules.map((rt) => {
                  const meta = RULE_META[rt];
                  return /* @__PURE__ */ jsx(SelectItem, { value: rt, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: meta.icon }),
                    /* @__PURE__ */ jsx("span", { children: meta.label })
                  ] }) }, rt);
                }) : /* @__PURE__ */ jsx(SelectItem, { value: "__none__", disabled: true, children: "All rules added" }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                size: "sm",
                onClick: handleAddRule,
                disabled: availableRules.length === 0 || validateRules.some((rule) => rule.rule === newRule),
                className: cn(
                  "h-7 w-7 p-0 shrink-0 rounded-md",
                  "bg-foreground/5 text-foreground/70 border border-border/40",
                  "hover:bg-foreground/10 hover:text-foreground",
                  "disabled:opacity-30",
                  "transition-all duration-150"
                ),
                variant: "ghost",
                children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsx(TooltipContent, { side: "right", className: "text-[11px]", children: "Add validation rule" })
          ] })
        ]
      }
    ),
    validateRules.length === 0 && /* @__PURE__ */ jsx(
      ConfigEmpty,
      {
        icon: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }),
        message: "No validation rules. Add one above to get started."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5", children: validateRules.map((rule) => {
      const meta = RULE_META[rule.rule] ?? {
        label: rule.rule,
        description: "",
        icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" })
      };
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "group/rule flex flex-col gap-2",
            "rounded-lg border border-border/40 bg-background",
            "p-2.5",
            "hover:border-border/60 hover:shadow-sm",
            "transition-all duration-150"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "flex items-center justify-center",
                        "h-5 w-5 rounded-md bg-muted/50 shrink-0",
                        "text-muted-foreground/70"
                      ),
                      children: meta.icon
                    }
                  ) }),
                  /* @__PURE__ */ jsx(
                    TooltipContent,
                    {
                      side: "left",
                      className: "text-[11px] max-w-[180px]",
                      children: meta.description
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-foreground/80 truncate", children: meta.label })
              ] }),
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeValidationRule(rule.rule),
                    className: cn(
                      "flex items-center justify-center",
                      "h-5 w-5 rounded-md shrink-0",
                      "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                      "opacity-0 group-hover/rule:opacity-100 focus-visible:opacity-100",
                      "transition-all duration-150 outline-none"
                    ),
                    children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { side: "right", className: "text-[11px]", children: "Remove rule" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: renderRuleControl(rule) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 text-muted-foreground/30 shrink-0" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  placeholder: "Error message (optional)",
                  value: rule.message ?? "",
                  onChange: (e) => updateValidationRule({
                    ...rule,
                    message: e.target.value
                  }),
                  className: cn(
                    "h-6 flex-1 px-1.5 text-[10px] rounded-md",
                    "border-border/30 bg-muted/10 placeholder:text-muted-foreground/30",
                    "focus:border-border/50 focus:bg-background",
                    "transition-colors duration-150"
                  ),
                  autoComplete: "off"
                }
              )
            ] })
          ]
        },
        rule.rule
      );
    }) }),
    validateRules.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3 w-3 text-emerald-500/60" }),
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
        validateRules.length,
        " ",
        validateRules.length === 1 ? "rule" : "rules",
        " configured"
      ] })
    ] })
  ] });
}
export {
  ValidationConfiguration as V
};
