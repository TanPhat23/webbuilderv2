import type { ChangeEvent, ReactElement } from "react";
import { Code2, Eraser, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface CustomCssTabProps {
  readonly customCSS: string;
  readonly disabled?: boolean;
  readonly onCustomCSSChange: (value: string) => void;
}

export function CustomCssTab({
  customCSS,
  disabled = false,
  onCustomCSSChange,
}: CustomCssTabProps): ReactElement {
  const charCount = customCSS.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-primary" />
            Custom CSS
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {charCount} chars
          </Badge>
        </div>
        <CardDescription>
          Add project-wide CSS overrides applied to the canvas and published site.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="project-custom-css">Stylesheet</Label>
          {charCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onCustomCSSChange("")}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <Eraser data-icon="inline-start" />
              Clear
            </Button>
          )}
        </div>

        <Textarea
          id="project-custom-css"
          value={customCSS}
          disabled={disabled}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            onCustomCSSChange(event.target.value)
          }
          placeholder={`/* Example */\n.hero h1 {\n  letter-spacing: -0.03em;\n}`}
          spellCheck={false}
          className="min-h-64 font-mono text-xs leading-relaxed"
        />

        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Pure CSS only. Script tags and non-HTTPS imports are stripped automatically when saving.
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
