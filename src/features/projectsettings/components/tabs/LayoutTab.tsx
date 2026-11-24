import type { ReactElement } from "react";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  RADIUS_SCALES,
  SHADOW_OPTIONS,
  SPACING_MULTIPLIERS,
} from "../../constants/themePresets";

interface LayoutTabProps {
  readonly spacing: number;
  readonly borderRadius: number;
  readonly shadowStyle: string;
  readonly disabled?: boolean;
  readonly onSpacingChange: (value: number) => void;
  readonly onBorderRadiusChange: (value: number) => void;
  readonly onShadowStyleChange: (value: string) => void;
}

export function LayoutTab({
  spacing,
  borderRadius,
  shadowStyle,
  disabled = false,
  onSpacingChange,
  onBorderRadiusChange,
  onShadowStyleChange,
}: LayoutTabProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="size-4 text-primary" />
          Spacing, Radius &amp; Elevation
        </CardTitle>
        <CardDescription>
          Configure rhythm, corner rounding, and shadow depth across your UI.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Base Spacing Unit</Label>
            <Badge variant="secondary" className="font-mono text-xs">
              {spacing}px
            </Badge>
          </div>
          <Slider
            value={[spacing]}
            disabled={disabled}
            onValueChange={([val]) => {
              if (val !== undefined) onSpacingChange(val);
            }}
            min={2}
            max={16}
            step={1}
          />
          <div className="flex items-end gap-3 rounded-lg border border-border bg-muted/40 p-3">
            {SPACING_MULTIPLIERS.map((multiplier) => {
              const sizePx = `${spacing * multiplier}px`;
              return (
                <div key={multiplier} className="flex flex-col items-center gap-1">
                  <div
                    style={{ width: sizePx, height: sizePx }}
                    className="rounded-xs bg-primary/80"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {multiplier}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Border Radius</Label>
            <Badge variant="secondary" className="font-mono text-xs">
              {borderRadius}px
            </Badge>
          </div>
          <Slider
            value={[borderRadius]}
            disabled={disabled}
            onValueChange={([val]) => {
              if (val !== undefined) onBorderRadiusChange(val);
            }}
            min={0}
            max={24}
            step={1}
          />
          <div className="grid grid-cols-4 gap-2">
            {RADIUS_SCALES.map((scale) => {
              const px = scale.compute(borderRadius);
              return (
                <div
                  key={scale.label}
                  className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/40 p-2"
                >
                  <div
                    className="size-8 border-2 border-primary bg-primary/15"
                    style={{ borderRadius: `${px}px` }}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {scale.label} · {px}px
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2.5">
          <Label>Shadow Depth</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={shadowStyle}
            disabled={disabled}
            onValueChange={(val) => {
              if (val) onShadowStyleChange(val);
            }}
            className="w-full"
          >
            {SHADOW_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                className="flex-1 text-xs uppercase"
                title={opt.label}
              >
                {opt.value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}
