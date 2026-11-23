import type { SelectOption, SelectSettings } from "@/types/elements";
import type { EditorElement } from "@/types/global.type";

export type { SelectOption, SelectSettings };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSelectOption(value: unknown): value is SelectOption {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.value === "string"
  );
}

export function readSelectSettings(raw: unknown): SelectSettings {
  if (!isRecord(raw)) return {};
  const out: SelectSettings = {};
  if (typeof raw.name === "string") out.name = raw.name;
  if (Array.isArray(raw.selectOptions)) {
    out.selectOptions = raw.selectOptions.filter(isSelectOption);
  }
  if (typeof raw.defaultValue === "string") out.defaultValue = raw.defaultValue;
  if (typeof raw.required === "boolean") out.required = raw.required;
  if (typeof raw.disabled === "boolean") out.disabled = raw.disabled;
  return out;
}

export function resolveSelectOptions(
  settings: SelectSettings,
  fallbackLabel?: string,
  fallbackElements?: readonly EditorElement[],
): SelectOption[] {
  if (settings.selectOptions) return settings.selectOptions;
  if (fallbackElements && fallbackElements.length > 0) {
    return fallbackElements.map((option, index) => ({
      id: option.id,
      label: option.content || `Option ${index + 1}`,
      value: option.content || "",
    }));
  }
  return [
    {
      id: "default-1",
      label: fallbackLabel || "Option 1",
      value: "option-1",
    },
    { id: "default-2", label: "Option 2", value: "option-2" },
  ];
}

export function addSelectOption(
  options: readonly SelectOption[],
  id: string,
): SelectOption[] {
  const existingValues = new Set(options.map((opt) => opt.value));
  let nextIndex = options.length + 1;
  while (existingValues.has(`option-${nextIndex}`)) {
    nextIndex += 1;
  }
  return [
    ...options,
    {
      id,
      label: `Option ${nextIndex}`,
      value: `option-${nextIndex}`,
    },
  ];
}

export function removeSelectOption(
  options: readonly SelectOption[],
  index: number,
  defaultValue: string | undefined,
): { selectOptions: SelectOption[]; defaultValue: string | undefined } {
  const removed = options[index];
  return {
    selectOptions: options.filter((_, i) => i !== index),
    defaultValue:
      defaultValue !== undefined && removed?.value === defaultValue
        ? undefined
        : defaultValue,
  };
}

export function updateSelectOptionField(
  options: readonly SelectOption[],
  index: number,
  field: keyof SelectOption,
  newValue: string,
  defaultValue: string | undefined,
): { selectOptions: SelectOption[]; defaultValue: string | undefined } {
  const previous = options[index];
  const selectOptions = options.map((opt, i) =>
    i === index ? { ...opt, [field]: newValue } : opt,
  );
  const nextDefault =
    field === "value" &&
    defaultValue !== undefined &&
    previous?.value === defaultValue
      ? newValue
      : defaultValue;
  return { selectOptions, defaultValue: nextDefault };
}

export function moveSelectOption(
  options: readonly SelectOption[],
  index: number,
  direction: "up" | "down",
): SelectOption[] | null {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= options.length) return null;
  const next = [...options];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function toggleDefaultSelectOption(
  currentDefault: string | undefined,
  value: string,
): string | undefined {
  return currentDefault === value ? undefined : value;
}
