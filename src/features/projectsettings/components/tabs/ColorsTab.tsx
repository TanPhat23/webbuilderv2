import { Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { COLOR_FIELDS, PRESET_COLORS } from "../../constants/themePresets";
import type { ColorScheme } from "../../utils/designSystemUtils";
import { ColorInput } from "../ColorInput";

const NORMAL_TRACKING = { letterSpacing: "var(--tracking-normal)" } as const;
const SWATCH_KEYS: readonly (keyof ColorScheme)[] = ["primary", "secondary", "accent"];

interface ColorsTabProps {
  selectedColors: ColorScheme;
  onColorChange: (key: keyof ColorScheme, value: string) => void;
  onPresetSelect: (colors: ColorScheme) => void;
}

export function ColorsTab({
  selectedColors,
  onColorChange,
  onPresetSelect,
}: ColorsTabProps) {
  return (
    <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
      <CardHeader className="rounded-t-[var(--radius-lg)]">
        <CardTitle
          className="flex items-center gap-2 text-lg text-foreground"
          style={NORMAL_TRACKING}
        >
          <Palette className="w-5 h-5 text-primary" />
          Color Scheme
        </CardTitle>
        <CardDescription className="text-muted-foreground" style={NORMAL_TRACKING}>
          Choose colors for your project theme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
            Custom Colors
          </Label>
          <div className="p-6 rounded-[var(--radius-lg)] border-2 border-border bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {COLOR_FIELDS.map((field) => (
                <ColorInput
                  key={field.key}
                  label={field.label}
                  value={selectedColors[field.key]}
                  onChange={(value) => onColorChange(field.key, value)}
                  placeholder={field.placeholder}
                  bgClass={field.bgClass}
                  id={`${field.key}-color`}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
            Preset Colors
          </Label>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onPresetSelect(preset.colors)}
                className="p-4 rounded-[var(--radius-lg)] border-2 border-border bg-card"
              >
                <div className="flex justify-center gap-2 mb-3">
                  {SWATCH_KEYS.map((swatchKey) => {
                    const color = preset.colors[swatchKey];
                    return (
                      <div
                        key={swatchKey}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 4px 16px ${color}40`,
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-sm font-bold" style={NORMAL_TRACKING}>
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
