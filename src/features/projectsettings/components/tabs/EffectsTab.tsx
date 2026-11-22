import { Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RADIUS_SCALES, SHADOW_OPTIONS } from "../../constants/themePresets";

const NORMAL_TRACKING = { letterSpacing: "var(--tracking-normal)" } as const;

interface EffectsTabProps {
  borderRadius: number;
  shadowStyle: string;
  onBorderRadiusChange: (value: number) => void;
  onShadowStyleChange: (value: string) => void;
}

export function EffectsTab({
  borderRadius,
  shadowStyle,
  onBorderRadiusChange,
  onShadowStyleChange,
}: EffectsTabProps) {
  return (
    <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
      <CardHeader className="rounded-t-[var(--radius-lg)]">
        <CardTitle
          className="flex items-center gap-2 text-lg text-foreground"
          style={NORMAL_TRACKING}
        >
          <Layers className="w-5 h-5 text-primary" />
          Effects &amp; Borders
        </CardTitle>
        <CardDescription className="text-muted-foreground" style={NORMAL_TRACKING}>
          Configure shadows and border radius
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
              Border Radius
            </Label>
            <span
              className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
              style={NORMAL_TRACKING}
            >
              {borderRadius}px
            </span>
          </div>
          <Slider
            value={[borderRadius]}
            onValueChange={([val]) => onBorderRadiusChange(val)}
            min={0}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
            <Label
              className="text-sm font-semibold text-foreground mb-3 block"
              style={NORMAL_TRACKING}
            >
              Radius Scale Preview
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {RADIUS_SCALES.map((scale) => {
                const px = scale.compute(borderRadius);
                return (
                  <div key={scale.label} className="text-center">
                    <div className="h-16 bg-primary" style={{ borderRadius: `${px}px` }}>
                      <p
                        className="text-xs text-primary-foreground p-2 font-bold"
                        style={NORMAL_TRACKING}
                      >
                        {scale.label}
                      </p>
                    </div>
                    <span className="text-xs font-mono mt-1 block text-muted-foreground">
                      {px}px
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
            Shadow Style
          </Label>
          <Select value={shadowStyle} onValueChange={onShadowStyleChange}>
            <SelectTrigger className="w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHADOW_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
            <Label
              className="text-sm font-semibold text-foreground mb-3 block"
              style={NORMAL_TRACKING}
            >
              Shadow Preview
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {SHADOW_OPTIONS.slice(0, 3).map((opt) => (
                <div
                  key={opt.value}
                  className="h-20 bg-card rounded-[var(--radius-lg)] flex items-center justify-center"
                  style={{ boxShadow: opt.shadow }}
                >
                  <span className="text-sm font-medium text-foreground" style={NORMAL_TRACKING}>
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
