import type { ReactElement } from "react";
import { RotateCcw, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { FONT_OPTIONS } from "../../constants/themePresets";

interface TypographyTabProps {
  readonly fontFamily: string;
  readonly letterTracking: number;
  readonly disabled?: boolean;
  readonly onFontFamilyChange: (value: string) => void;
  readonly onLetterTrackingChange: (value: number) => void;
}

export function TypographyTab({
  fontFamily,
  letterTracking,
  disabled = false,
  onFontFamilyChange,
  onLetterTrackingChange,
}: TypographyTabProps): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Type className="size-4 text-primary" />
          Typography
        </CardTitle>
        <CardDescription>
          Choose the project typeface and fine-tune letter tracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="font-family-select">Font Family</Label>
          <Select
            value={fontFamily}
            disabled={disabled}
            onValueChange={onFontFamilyChange}
          >
            <SelectTrigger id="font-family-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Letter Spacing</Label>
            <div className="flex items-center gap-1.5">
              {letterTracking !== 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onLetterTrackingChange(0)}
                  className="h-6 px-2 text-xs text-muted-foreground"
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset
                </Button>
              )}
              <Badge variant="secondary" className="font-mono text-xs">
                {letterTracking.toFixed(3)}em
              </Badge>
            </div>
          </div>

          <Slider
            value={[letterTracking]}
            disabled={disabled}
            onValueChange={([val]) => {
              if (val !== undefined) onLetterTrackingChange(val);
            }}
            min={-0.05}
            max={0.1}
            step={0.005}
            className="w-full"
          />

          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>-0.05em (Tight)</span>
            <span>0.00em</span>
            <span>+0.10em (Wide)</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p
            style={{ fontFamily, letterSpacing: `${letterTracking}em` }}
            className="text-lg font-semibold text-foreground"
          >
            Sphinx of black quartz, judge my vow
          </p>
          <p
            style={{ fontFamily, letterSpacing: `${letterTracking}em` }}
            className="mt-1 text-xs text-muted-foreground"
          >
            {fontFamily} &middot; {letterTracking.toFixed(3)}em tracking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
