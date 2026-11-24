import type { ReactElement } from "react";
import { Check, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  COLOR_FIELDS,
  DEFAULT_COLORS,
  PRESET_COLORS,
  type ColorFieldConfig,
} from "../../constants/themePresets";
import type { ColorScheme } from "../../utils/designSystemUtils";
import { ColorInput } from "../ColorInput";

const SWATCH_KEYS: readonly (keyof ColorScheme)[] = [
  "primary",
  "secondary",
  "accent",
];

interface ColorGroupDefinition {
  readonly label: string;
  readonly keys: readonly (keyof ColorScheme)[];
}

const COLOR_GROUPS: readonly ColorGroupDefinition[] = [
  {
    label: "Brand & Accent",
    keys: [
      "primary",
      "primaryForeground",
      "secondary",
      "secondaryForeground",
      "accent",
      "accentForeground",
    ],
  },
  {
    label: "Surfaces",
    keys: [
      "background",
      "foreground",
      "card",
      "cardForeground",
      "muted",
      "mutedForeground",
    ],
  },
  {
    label: "Borders & Feedback",
    keys: ["border", "destructive", "destructiveForeground"],
  },
];

const FIELD_BY_KEY: ReadonlyMap<keyof ColorScheme, ColorFieldConfig> = new Map(
  COLOR_FIELDS.map((field) => [field.key, field]),
);

function isPresetActive(
  selectedColors: Readonly<ColorScheme>,
  presetColors: Readonly<ColorScheme>,
): boolean {
  return COLOR_FIELDS.every(
    (field) =>
      selectedColors[field.key].toLowerCase() ===
      presetColors[field.key].toLowerCase(),
  );
}

interface ColorsTabProps {
  readonly selectedColors: ColorScheme;
  readonly disabled?: boolean;
  readonly onColorChange: (key: keyof ColorScheme, value: string) => void;
  readonly onPresetSelect: (colors: ColorScheme) => void;
}

export function ColorsTab({
  selectedColors,
  disabled = false,
  onColorChange,
  onPresetSelect,
}: ColorsTabProps): ReactElement {
  const isDefault = isPresetActive(selectedColors, DEFAULT_COLORS);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-primary" />
            Color System
          </CardTitle>
          {!isDefault && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onPresetSelect(DEFAULT_COLORS)}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <RotateCcw data-icon="inline-start" />
              Default
            </Button>
          )}
        </div>
        <CardDescription>
          Pick a theme preset or fine-tune individual color tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Theme Presets
          </Label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {PRESET_COLORS.map((preset) => {
              const active = isPresetActive(selectedColors, preset.colors);
              return (
                <button
                  key={preset.name}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPresetSelect(preset.colors)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border p-2.5 text-left transition-colors hover:border-ring/60 disabled:cursor-not-allowed disabled:opacity-60",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-background/60",
                  )}
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      {SWATCH_KEYS.map((swatchKey) => (
                        <span
                          key={swatchKey}
                          className="size-3.5 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors[swatchKey] }}
                        />
                      ))}
                    </div>
                    <span className="truncate text-xs font-medium text-foreground">
                      {preset.name}
                    </span>
                  </div>
                  {active && <Check className="size-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {COLOR_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </Label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {group.keys.map((key) => {
                  const field = FIELD_BY_KEY.get(key);
                  if (!field) return null;
                  return (
                    <ColorInput
                      key={field.key}
                      label={field.label}
                      value={selectedColors[field.key]}
                      disabled={disabled}
                      onChange={(value) => onColorChange(field.key, value)}
                      placeholder={field.placeholder}
                      bgClass={field.bgClass}
                      id={`${field.key}-color`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
