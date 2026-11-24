import { useMemo, useState, type ReactElement } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type {
  DesignSystem,
  SimpleColorScheme,
} from "../utils/designSystemUtils";
import { generatePreviewHTML } from "../utils/previewTemplate";
import {
  buildOverlaySwatches,
} from "./ProjectPreviewOverlay";

type PreviewViewport = "desktop" | "tablet" | "mobile";

interface ViewportConfig {
  readonly label: string;
  readonly widthClass: string;
  readonly widthLabel: string;
}

const VIEWPORT_CONFIGS: Readonly<Record<PreviewViewport, ViewportConfig>> = {
  desktop: { label: "Desktop", widthClass: "w-full", widthLabel: "100%" },
  tablet: { label: "Tablet", widthClass: "w-full max-w-[768px]", widthLabel: "768px" },
  mobile: { label: "Mobile", widthClass: "w-full max-w-[390px]", widthLabel: "390px" },
};

interface ProjectPreviewProps {
  readonly projectId: string;
  readonly className?: string;
  readonly colors?: SimpleColorScheme;
  readonly designSystem?: DesignSystem;
  readonly customCSS?: string;
}

function isPreviewViewport(value: string): value is PreviewViewport {
  return value === "desktop" || value === "tablet" || value === "mobile";
}

function ProjectPreviewFrame({
  className = "",
  colors,
  designSystem,
  customCSS,
}: Omit<ProjectPreviewProps, "projectId">): ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  const hasDesignSystem = designSystem !== undefined;
  const primary = colors?.primary;
  const secondary = colors?.secondary;
  const accent = colors?.accent;
  const dsPrimary = designSystem?.colors?.primary;
  const dsSecondary = designSystem?.colors?.secondary;
  const dsAccent = designSystem?.colors?.accent;
  const fontFamily = designSystem?.fontFamily;
  const letterTracking = designSystem?.letterTracking;
  const borderRadius = designSystem?.borderRadius;
  const spacing = designSystem?.spacing;
  const shadowStyle = designSystem?.shadowStyle;

  const previewHtml = useMemo(() => {
    const resolvedColors =
      primary || secondary || accent
        ? {
            primary: primary ?? "",
            secondary: secondary ?? "",
            accent: accent ?? "",
          }
        : undefined;
    const resolvedDsColors =
      dsPrimary || dsSecondary || dsAccent
        ? {
            primary: dsPrimary ?? "",
            secondary: dsSecondary ?? "",
            accent: dsAccent ?? "",
          }
        : undefined;
    const system: DesignSystem = hasDesignSystem
      ? {
          colors: resolvedDsColors,
          fontFamily,
          letterTracking,
          borderRadius,
          spacing,
          shadowStyle,
        }
      : { colors: resolvedColors };
    return generatePreviewHTML(system, resolvedColors, customCSS);
  }, [
    primary,
    secondary,
    accent,
    dsPrimary,
    dsSecondary,
    dsAccent,
    fontFamily,
    letterTracking,
    borderRadius,
    spacing,
    shadowStyle,
    hasDesignSystem,
    customCSS,
  ]);

  const swatches = buildOverlaySwatches(designSystem?.colors ?? colors);
  const activeViewport = VIEWPORT_CONFIGS[viewport];
  const hasCustomCss = Boolean(customCSS && customCSS.trim().length > 0);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-foreground">
              Live Preview
            </span>
          </div>

          {swatches.length > 0 && (
            <div className="flex items-center gap-1 border-l border-border pl-2.5">
              {swatches.map((swatch) => (
                <span
                  key={swatch.label}
                  className="size-3.5 rounded-full border border-border"
                  style={{ backgroundColor: swatch.color }}
                  title={`${swatch.label}: ${swatch.color}`}
                />
              ))}
            </div>
          )}

          {fontFamily && (
            <Badge variant="secondary" className="font-mono text-[11px]">
              {fontFamily}
            </Badge>
          )}
          {spacing !== undefined && borderRadius !== undefined && (
            <Badge variant="outline" className="hidden font-mono text-[11px] sm:inline-flex">
              {spacing}px / r:{borderRadius}px
            </Badge>
          )}
          {shadowStyle && (
            <Badge variant="outline" className="hidden font-mono text-[11px] uppercase md:inline-flex">
              {shadowStyle}
            </Badge>
          )}
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={viewport}
          onValueChange={(nextValue) => {
            if (isPreviewViewport(nextValue)) {
              setViewport(nextValue);
            }
          }}
          aria-label="Preview viewport size"
        >
          <ToggleGroupItem value="desktop" aria-label="Desktop view" title="Desktop">
            <Monitor />
          </ToggleGroupItem>
          <ToggleGroupItem value="tablet" aria-label="Tablet view" title="Tablet (768px)">
            <Tablet />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label="Mobile view" title="Mobile (390px)">
            <Smartphone />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="relative flex flex-1 justify-center overflow-hidden bg-muted/30 p-3 sm:p-4">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2.5">
              <Spinner className="size-6 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                Loading preview...
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-full overflow-hidden rounded-lg border border-border bg-background shadow-md transition-[max-width] duration-200",
            activeViewport.widthClass,
          )}
        >
          <iframe
            srcDoc={previewHtml}
            className="size-full border-0 bg-background"
            title="Website Preview"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span>{activeViewport.label} ({activeViewport.widthLabel})</span>
        <span>{hasCustomCss ? "Custom CSS applied" : "Design system tokens"}</span>
      </div>
    </div>
  );
}

export function ProjectPreview({
  projectId,
  ...rest
}: ProjectPreviewProps): ReactElement {
  return <ProjectPreviewFrame key={projectId} {...rest} />;
}
