import { Type } from "lucide-react";
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
import { FONT_OPTIONS } from "../../constants/themePresets";

const NORMAL_TRACKING = { letterSpacing: "var(--tracking-normal)" } as const;

interface TypographyTabProps {
  fontFamily: string;
  letterTracking: number;
  onFontFamilyChange: (value: string) => void;
  onLetterTrackingChange: (value: number) => void;
}

export function TypographyTab({
  fontFamily,
  letterTracking,
  onFontFamilyChange,
  onLetterTrackingChange,
}: TypographyTabProps) {
  return (
    <Card className="border-0 shadow-[var(--shadow-lg)] bg-card">
      <CardHeader className="rounded-t-[var(--radius-lg)]">
        <CardTitle
          className="flex items-center gap-2 text-lg text-foreground"
          style={NORMAL_TRACKING}
        >
          <Type className="w-5 h-5 text-primary" />
          Typography
        </CardTitle>
        <CardDescription className="text-muted-foreground" style={NORMAL_TRACKING}>
          Configure fonts and text spacing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
            Font Family
          </Label>
          <Select value={fontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger className="w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
            <p
              style={{ fontFamily, letterSpacing: "var(--tracking-normal)" }}
              className="text-2xl font-semibold text-foreground"
            >
              The quick brown fox jumps over the lazy dog
            </p>
            <p
              style={{ fontFamily, letterSpacing: "var(--tracking-normal)" }}
              className="text-sm text-muted-foreground mt-2"
            >
              Preview of {fontFamily} font family
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-foreground" style={NORMAL_TRACKING}>
              Letter Spacing
            </Label>
            <span
              className="text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]"
              style={NORMAL_TRACKING}
            >
              {letterTracking.toFixed(3)}em
            </span>
          </div>
          <Slider
            value={[letterTracking]}
            onValueChange={([val]) => onLetterTrackingChange(val)}
            min={-0.05}
            max={0.1}
            step={0.005}
            className="w-full"
          />
          <div className="p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border">
            <p
              style={{ letterSpacing: `${letterTracking}em`, fontFamily }}
              className="text-lg text-foreground"
            >
              Adjusted letter spacing example text
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
