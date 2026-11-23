import { cn } from "@/lib/utils";
import type {
  DesignSystem,
  SimpleColorScheme,
} from "../utils/designSystemUtils";

interface ProjectPreviewOverlayProps {
  colors?: SimpleColorScheme;
  designSystem?: DesignSystem;
}

interface OverlayRow {
  readonly label: string;
  readonly value: string;
  readonly uppercase?: boolean;
}

export function ProjectPreviewOverlay({
  colors,
  designSystem,
}: ProjectPreviewOverlayProps) {
  const resolvedColors = designSystem?.colors ?? colors;
  const swatches = resolvedColors
    ? [
        { label: "Primary Color", color: resolvedColors.primary },
        { label: "Secondary Color", color: resolvedColors.secondary },
        { label: "Accent Color", color: resolvedColors.accent },
      ]
    : [];

  const typographyRows: OverlayRow[] = [
    designSystem?.fontFamily
      ? { label: "Font:", value: designSystem.fontFamily }
      : null,
    designSystem?.letterTracking !== undefined &&
    designSystem.letterTracking !== 0
      ? {
          label: "Tracking:",
          value: `${designSystem.letterTracking.toFixed(3)}em`,
        }
      : null,
  ].filter((row): row is OverlayRow => row !== null);

  const layoutRows: OverlayRow[] = [
    designSystem?.spacing !== undefined
      ? { label: "Spacing:", value: `${designSystem.spacing}px` }
      : null,
    designSystem?.borderRadius !== undefined
      ? { label: "Radius:", value: `${designSystem.borderRadius}px` }
      : null,
  ].filter((row): row is OverlayRow => row !== null);

  const shadowRows: OverlayRow[] = designSystem?.shadowStyle
    ? [{ label: "Shadow:", value: designSystem.shadowStyle, uppercase: true }]
    : [];

  const sections = [typographyRows, layoutRows, shadowRows].filter(
    (rows) => rows.length > 0,
  );
  const hasOverlayCard = swatches.length > 0 || sections.length > 0;

  return (
    <>
      {hasOverlayCard && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">
                Live Preview
              </span>
            </div>

            {swatches.length > 0 && (
              <div className="flex gap-1.5">
                {swatches.map((swatch) => (
                  <div
                    key={swatch.label}
                    className="w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.label}
                  />
                ))}
              </div>
            )}

            {sections.map((rows, index) => (
              <div
                key={rows[0].label}
                className={cn(
                  "text-xs text-gray-600 space-y-1",
                  (index > 0 || swatches.length > 0) && "border-t pt-2 mt-2",
                )}
              >
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="font-medium">{row.label}</span>
                    <span
                      className={cn(
                        "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded",
                        row.uppercase && "uppercase",
                      )}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 z-10">
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="font-medium">Ready</span>
          </div>
          <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded font-mono">
            Preview Mode
          </div>
        </div>
      </div>
    </>
  );
}
