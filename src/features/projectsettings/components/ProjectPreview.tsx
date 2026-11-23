import { useMemo, useState } from "react";
import type {
  DesignSystem,
  SimpleColorScheme,
} from "../utils/designSystemUtils";
import { generatePreviewHTML } from "../utils/previewTemplate";
import { ProjectPreviewOverlay } from "./ProjectPreviewOverlay";

interface ProjectPreviewProps {
  projectId: string;
  className?: string;
  colors?: SimpleColorScheme;
  designSystem?: DesignSystem;
}

function ProjectPreviewFrame({
  className = "",
  colors,
  designSystem,
}: Omit<ProjectPreviewProps, "projectId">) {
  const [isLoading, setIsLoading] = useState(true);

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
    return generatePreviewHTML(system, resolvedColors);
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
  ]);

  return (
    <div
      className={`relative ${className} rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">
              Loading preview...
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full h-full">
        <iframe
          srcDoc={previewHtml}
          className="w-full h-full border-0 bg-white"
          title="Website Preview"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin"
        />

        <ProjectPreviewOverlay colors={colors} designSystem={designSystem} />
      </div>
    </div>
  );
}

export function ProjectPreview({
  projectId,
  ...rest
}: ProjectPreviewProps) {
  return <ProjectPreviewFrame key={projectId} {...rest} />;
}
