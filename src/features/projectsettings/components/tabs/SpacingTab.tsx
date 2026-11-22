import { Move } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SPACING_MULTIPLIERS } from "../../constants/themePresets";

const NORMAL_TRACKING = { letterSpacing: "var(--tracking-normal)" } as const;

interface SpacingTabProps {
  spacing: number;
  onSpacingChange: (value: number) => void;
}

export function SpacingTab({ spacing, onSpacingChange }: SpacingTabProps) {
  return (
    <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
      <CardHeader className="rounded-t-[var(--radius-lg)]">
        <CardTitle
          className="flex items-center gap-2 text-lg text-foreground"
          style={NORMAL_TRACKING}
        >
          <Move className="w-5 h-5 text-primary" />
          Spacing System
        </CardTitle>
        <CardDescription className="text-muted-foreground" style={NORMAL_TRACKING}>
          Define your base spacing unit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
              Base Spacing Unit
            </Label>
            <span
              className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
              style={NORMAL_TRACKING}
            >
              {spacing}px
            </span>
          </div>
          <Slider
            value={[spacing]}
            onValueChange={([val]) => onSpacingChange(val)}
            min={2}
            max={16}
            step={1}
            className="w-full"
          />
          <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
            <Label
              className="text-sm font-semibold text-foreground mb-3 block"
              style={NORMAL_TRACKING}
            >
              Spacing Scale Preview
            </Label>
            <div className="flex items-end gap-2">
              {SPACING_MULTIPLIERS.map((multiplier) => {
                const size = `${spacing * multiplier}px`;
                return (
                  <div key={multiplier} className="text-center">
                    <div
                      style={{ width: size, height: size }}
                      className="bg-primary rounded mx-auto mb-1"
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      {multiplier}x
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
