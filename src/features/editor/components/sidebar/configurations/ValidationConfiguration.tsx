"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { InputElement } from "@/features/editor";
import { RuleType, ValidationRule } from "@/features/editor";
import { ConfigEmpty } from "./_shared";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  ShieldCheck,
  AlertCircle,
  Hash,
  Regex,
  Code2,
  Asterisk,
} from "lucide-react";


const ALL_RULES: RuleType[] = [
  "required",
  "minLength",
  "maxLength",
  "pattern",
  "custom",
];

interface RuleMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const RULE_META: Record<RuleType, RuleMeta> = {
  required: {
    label: "Required",
    description: "Makes this field mandatory for form submission",
    icon: <Asterisk className="h-3 w-3" />,
  },
  minLength: {
    label: "Min Length",
    description: "Minimum number of characters allowed",
    icon: <Hash className="h-3 w-3" />,
  },
  maxLength: {
    label: "Max Length",
    description: "Maximum number of characters allowed",
    icon: <Hash className="h-3 w-3" />,
  },
  min: {
    label: "Min Value",
    description: "Minimum numeric value allowed",
    icon: <Hash className="h-3 w-3" />,
  },
  max: {
    label: "Max Value",
    description: "Maximum numeric value allowed",
    icon: <Hash className="h-3 w-3" />,
  },
  pattern: {
    label: "Pattern",
    description: "Regular expression the value must match",
    icon: <Regex className="h-3 w-3" />,
  },
  custom: {
    label: "Custom",
    description: "Custom validation function (edit in code)",
    icon: <Code2 className="h-3 w-3" />,
  },
};

/* ─── Main Component ─── */

export default function ValidationConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [newRule, setNewRule] = React.useState<RuleType>("required");

  const validateRules =
    (selectedElement as InputElement)?.settings?.validateRules ?? [];

  const availableRules = ALL_RULES.filter(
    (rt) => !validateRules.some((rule) => rule.rule === rt),
  );

  /* ─── Handlers ─── */

  const updateValidationRule = <T extends ValidationRule>(
    updateRule: T,
  ): void => {
    if (!selectedElement) return;
    const currentRules = validateRules;
    const ruleIndex = currentRules.findIndex(
      (rule) => rule.rule === updateRule.rule,
    );

    let newRules: ValidationRule[];
    if (ruleIndex !== -1) {
      newRules = [
        ...currentRules.slice(0, ruleIndex),
        updateRule,
        ...currentRules.slice(ruleIndex + 1),
      ];
    } else {
      newRules = [...currentRules, updateRule];
    }

    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        validateRules: newRules,
      },
    });
  };

  const removeValidationRule = (ruleType: RuleType) => {
    if (!selectedElement) return;
    const newRules = validateRules.filter((rule) => rule.rule !== ruleType);
    updateElement(selectedElement.id, {
      settings: {
        ...selectedElement.settings,
        validateRules: newRules,
      },
    });
  };

  const handleAddRule = () => {
    if (validateRules.some((rule) => rule.rule === newRule)) return;

    let defaultRule: ValidationRule;

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
          message: "",
        } as ValidationRule;
        break;
      case "pattern":
        defaultRule = { rule: "pattern", value: "", message: "" };
        break;
      case "custom":
        defaultRule = {
          rule: "custom",
          message: "",
          validateFn: (value: unknown) => true,
        };
        break;
      default:
        return;
    }
    updateValidationRule(defaultRule);
  };

  /* ─── Rule Config Renderer ─── */

  const renderRuleControl = (rule: ValidationRule) => {
    switch (rule.rule) {
      case "required":
        return (
          <div className="flex items-center gap-2">
            <Switch
              id={`required-${rule.rule}`}
              checked={!!("value" in rule && rule.value)}
              onCheckedChange={(checked) =>
                updateValidationRule({
                  ...rule,
                  ...("value" in rule ? { value: !!checked } : {}),
                } as ValidationRule)
              }
              className="scale-75 origin-left"
            />
            <span className="text-[10px] text-muted-foreground">
              {"value" in rule && rule.value ? "Active" : "Inactive"}
            </span>
          </div>
        );

      case "minLength":
      case "maxLength":
      case "min":
      case "max":
        return (
          <Input
            type="number"
            value={
              "value" in rule && rule.value !== undefined ? rule.value : ""
            }
            min={0}
            onChange={(e) =>
              updateValidationRule({
                ...rule,
                ...("value" in rule ? { value: Number(e.target.value) } : {}),
              } as ValidationRule)
            }
            className="h-6 w-[72px] px-1.5 text-[11px] font-mono tabular-nums rounded-md"
            placeholder="0"
          />
        );

      case "pattern":
        return (
          <Input
            type="text"
            value={
              "value" in rule
                ? typeof rule.value === "string"
                  ? rule.value
                  : rule.value instanceof RegExp
                    ? rule.value.source
                    : ""
                : ""
            }
            onChange={(e) =>
              updateValidationRule({
                ...rule,
                ...("value" in rule ? { value: e.target.value } : {}),
              } as ValidationRule)
            }
            className="h-6 w-full max-w-[140px] px-1.5 text-[11px] font-mono rounded-md"
            placeholder="^[A-Za-z]+$"
            autoComplete="off"
          />
        );

      case "custom":
        return (
          <div className="flex items-center gap-1.5">
            <Code2 className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/60 italic">
              Edit in code
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── Render ─── */

  return (
    <div className="flex flex-col gap-3">
      {/* ── Add Rule Bar ── */}
      <div
        className={cn(
          "flex items-center gap-1.5",
          "rounded-lg border border-dashed border-border/50 bg-muted/20",
          "p-1.5",
        )}
      >
        <Select
          value={newRule}
          onValueChange={(value) => setNewRule(value as RuleType)}
        >
          <SelectTrigger
            className={cn(
              "h-7 flex-1 px-2 text-[11px] rounded-md",
              "border-border/40 bg-background",
            )}
          >
            <SelectValue placeholder="Select rule" />
          </SelectTrigger>
          <SelectContent>
            {availableRules.length > 0 ? (
              availableRules.map((rt) => {
                const meta = RULE_META[rt];
                return (
                  <SelectItem key={rt} value={rt}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </div>
                  </SelectItem>
                );
              })
            ) : (
              <SelectItem value="__none__" disabled>
                All rules added
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              onClick={handleAddRule}
              disabled={
                availableRules.length === 0 ||
                validateRules.some((rule) => rule.rule === newRule)
              }
              className={cn(
                "h-7 w-7 p-0 shrink-0 rounded-md",
                "bg-foreground/5 text-foreground/70 border border-border/40",
                "hover:bg-foreground/10 hover:text-foreground",
                "disabled:opacity-30",
                "transition-all duration-150",
              )}
              variant="ghost"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px]">
            Add validation rule
          </TooltipContent>
        </Tooltip>
      </div>

      {/* ── Empty State ── */}
      {validateRules.length === 0 && (
        <ConfigEmpty
          icon={<ShieldCheck className="h-5 w-5" />}
          message="No validation rules. Add one above to get started."
        />
      )}

      {/* ── Rule Cards ── */}
      <div className="flex flex-col gap-1.5">
        {validateRules.map((rule) => {
          const meta = RULE_META[rule.rule] ?? {
            label: rule.rule,
            description: "",
            icon: <AlertCircle className="h-3 w-3" />,
          };

          return (
            <div
              key={rule.rule}
              className={cn(
                "group/rule flex flex-col gap-2",
                "rounded-lg border border-border/40 bg-background",
                "p-2.5",
                "hover:border-border/60 hover:shadow-sm",
                "transition-all duration-150",
              )}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "flex items-center justify-center",
                          "h-5 w-5 rounded-md bg-muted/50 shrink-0",
                          "text-muted-foreground/70",
                        )}
                      >
                        {meta.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="text-[11px] max-w-[180px]"
                    >
                      {meta.description}
                    </TooltipContent>
                  </Tooltip>

                  <span className="text-[11px] font-medium text-foreground/80 truncate">
                    {meta.label}
                  </span>
                </div>

                {/* Remove button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => removeValidationRule(rule.rule)}
                      className={cn(
                        "flex items-center justify-center",
                        "h-5 w-5 rounded-md shrink-0",
                        "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                        "opacity-0 group-hover/rule:opacity-100 focus-visible:opacity-100",
                        "transition-all duration-150 outline-none",
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px]">
                    Remove rule
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Control row */}
              <div className="flex items-center gap-2">
                {renderRuleControl(rule)}
              </div>

              {/* Error message input */}
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                <Input
                  type="text"
                  placeholder="Error message (optional)"
                  value={rule.message ?? ""}
                  onChange={(e) =>
                    updateValidationRule({
                      ...rule,
                      message: e.target.value,
                    })
                  }
                  className={cn(
                    "h-6 flex-1 px-1.5 text-[10px] rounded-md",
                    "border-border/30 bg-muted/10 placeholder:text-muted-foreground/30",
                    "focus:border-border/50 focus:bg-background",
                    "transition-colors duration-150",
                  )}
                  autoComplete="off"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Summary ── */}
      {validateRules.length > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in-0 duration-150">
          <ShieldCheck className="h-3 w-3 text-emerald-500/60" />
          <span className="text-[10px] text-muted-foreground/50">
            {validateRules.length}{" "}
            {validateRules.length === 1 ? "rule" : "rules"} configured
          </span>
        </div>
      )}
    </div>
  );
}
