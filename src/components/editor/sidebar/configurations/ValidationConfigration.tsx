import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { InputElement } from "@/interfaces/elements.interface";
import { RuleType, ValidationRule } from "@/interfaces/validate.interface";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const ALL_RULES: RuleType[] = [
  "required",
  "minLength",
  "maxLength",
  "pattern",
  "custom",
];

export default function ValidationConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [newRule, setNewRule] = React.useState<RuleType>("required");

  const validateRules =
    (selectedElement as InputElement)?.settings?.validateRules ?? [];
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
        defaultRule = {
          rule: "required",
          message: "",
        };
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
        defaultRule = {
          rule: "pattern",
          value: "",
          message: "",
        };
        break;
      case "custom":
        defaultRule = {
          rule: "custom",
          message: "",
          validateFn: (value: any) => true,
        };
        break;
      default:
        return;
    }
    updateValidationRule(defaultRule);
  };

  const renderRuleConfig = (rule: ValidationRule) => {
    switch (rule.rule) {
      case "required":
        return (
          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Label
                  htmlFor={`required-${rule.rule}`}
                  className="text-xs cursor-help"
                >
                  Required
                </Label>
              </HoverCardTrigger>
              <HoverCardContent>
                Makes this field mandatory for form submission.
              </HoverCardContent>
            </HoverCard>
            <Checkbox
              id={`required-${rule.rule}`}
              checked={!!("value" in rule && rule.value)}
              onCheckedChange={(checked) =>
                updateValidationRule({
                  ...rule,
                  ...("value" in rule ? { value: !!checked } : {}),
                } as ValidationRule)
              }
            />
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
            className="w-20 h-7 px-2 py-1 text-xs"
            placeholder={rule.rule}
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
            className="w-32 h-7 px-2 py-1 text-xs"
            placeholder="Regex pattern"
            autoComplete="off"
          />
        );
      case "custom":
        // Only allow editing the message for custom rules
        return (
          <div className="text-xs text-gray-500 italic">
            Custom validation function (edit in code)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2 items-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div>
              <Select
                value={newRule}
                onValueChange={(value) => setNewRule(value as RuleType)}
              >
                <SelectTrigger className="w-36 h-7 px-2 py-1 text-xs cursor-help">
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_RULES.filter(
                    (rt) => !validateRules.some((rule) => rule.rule === rt),
                  ).map((rt) => (
                    <SelectItem key={rt} value={rt} className="capitalize">
                      {rt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            Choose a validation rule to add to this input field.
          </HoverCardContent>
        </HoverCard>
        <Button
          type="button"
          className="h-7 px-3 py-1 text-xs"
          onClick={handleAddRule}
          disabled={validateRules.some((rule) => rule.rule === newRule)}
        >
          Add Rule
        </Button>
      </div>
      {validateRules.length === 0 && (
        <div className="text-xs text-gray-400">No validation rules set.</div>
      )}
      <div className="flex flex-col gap-2">
        {validateRules.map((rule) => (
          <div key={rule.rule} className="flex flex-row items-center gap-2">
            <Label className="capitalize text-xs w-20">{rule.rule}</Label>
            {renderRuleConfig(rule)}
            <Input
              type="text"
              className="w-32 h-7 px-2 py-1 text-xs"
              placeholder="Message"
              value={rule.message ?? ""}
              onChange={(e) =>
                updateValidationRule({
                  ...rule,
                  message: e.target.value,
                })
              }
            />
            <Button
              type="button"
              variant="destructive"
              className="h-7 px-2 py-1 text-xs"
              onClick={() => removeValidationRule(rule.rule)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
