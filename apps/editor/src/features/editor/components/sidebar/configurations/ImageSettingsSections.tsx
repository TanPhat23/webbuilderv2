import { useState } from "react";
import type { ImageSettings } from "@webbuilder/site-runtime/types/elements";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Maximize2,
  Type,
  Zap,
} from "lucide-react";
import {
  IMAGE_DECODING_OPTIONS,
  IMAGE_LOADING_OPTIONS,
  OBJECT_FIT_OPTIONS,
  parseImageDecoding,
  parseImageLoading,
  parseObjectFit,
} from "../../../lib/imageConfig";
import { ConfigSection } from "./_shared";
import { ConfigSelectInput, ConfigTextInput } from "./_shared/ConfigInputs";

export function ImageAccessibilitySection({
  alt,
  hasImage,
  onChangeAlt,
}: {
  alt: string;
  hasImage: boolean;
  onChangeAlt: (value: string) => void;
}) {
  return (
    <ConfigSection title="Accessibility" icon={<Type className="h-3 w-3" />}>
      <ConfigTextInput
        id="image-alt"
        name="alt"
        label="Alt text"
        hint="Descriptive text for screen readers and SEO. Critical for accessibility."
        value={alt}
        placeholder="Describe the image..."
        onValueChange={onChangeAlt}
        className="h-7 w-full max-w-[160px] px-2 text-[11px] rounded-md"
      />

      {hasImage && (
        <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
          {alt.length > 0 ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
              <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                Alt text provided
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-amber-500/60" />
              <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
                Missing alt text — add for better accessibility
              </span>
            </>
          )}
        </div>
      )}
    </ConfigSection>
  );
}

export function ImageBehaviorSections({
  objectFit,
  loading,
  decoding,
  onUpdateSetting,
}: {
  objectFit: NonNullable<ImageSettings["objectFit"]>;
  loading: NonNullable<ImageSettings["loading"]>;
  decoding: NonNullable<ImageSettings["decoding"]>;
  onUpdateSetting: <K extends keyof ImageSettings>(
    key: K,
    value: ImageSettings[K],
  ) => void;
}) {
  const handleSelect = <K extends keyof ImageSettings>(
    key: K,
    parser: (raw: string) => ImageSettings[K] | null,
  ) => (raw: string) => {
    const parsed = parser(raw);
    if (parsed !== null) onUpdateSetting(key, parsed);
  };

  return (
    <>
      <ConfigSection title="Display" icon={<Maximize2 className="h-3 w-3" />}>
        <ConfigSelectInput
          id="object-fit"
          label="Object Fit"
          hint="How the image should fill its container"
          value={objectFit}
          onValueChange={handleSelect("objectFit", parseObjectFit)}
          options={OBJECT_FIT_OPTIONS}
          className="h-7 w-[110px] px-2 text-[11px] rounded-md"
        />
      </ConfigSection>

      <ConfigSection title="Performance" icon={<Zap className="h-3 w-3" />}>
        <ConfigSelectInput
          id="image-loading"
          label="Loading"
          hint="'Lazy' defers loading until the image enters the viewport — recommended for below-the-fold images."
          value={loading}
          onValueChange={handleSelect("loading", parseImageLoading)}
          options={IMAGE_LOADING_OPTIONS}
          className="h-7 w-[90px] px-2 text-[11px] rounded-md"
        />

        <ConfigSelectInput
          id="image-decoding"
          label="Decoding"
          hint="'Async' allows the browser to decode the image off the main thread — recommended for performance."
          value={decoding}
          onValueChange={handleSelect("decoding", parseImageDecoding)}
          options={IMAGE_DECODING_OPTIONS}
          className="h-7 w-[90px] px-2 text-[11px] rounded-md"
        />

        <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
          {loading === "lazy" && decoding === "async" ? (
            <>
              <Zap className="h-3 w-3 text-emerald-500/60" />
              <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                Optimized for performance
              </span>
            </>
          ) : (
            <>
              <Zap className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                Consider lazy loading + async decoding
              </span>
            </>
          )}
        </div>
      </ConfigSection>
    </>
  );
}

export function ImagePreviewSection({
  src,
  alt,
  objectFit,
}: {
  src: string;
  alt: string;
  objectFit: NonNullable<ImageSettings["objectFit"]>;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <ConfigSection title="Preview" icon={<Eye className="h-3 w-3" />}>
      <div
        className={cn(
          "w-full h-28 rounded-lg overflow-hidden",
          "bg-muted/20 border border-border/30",
          "ring-1 ring-border/10",
        )}
      >
        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-1 h-full text-muted-foreground/40">
            <AlertCircle className="h-5 w-5" />
            <span className="text-[10px]">Failed to load image</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt || "Preview"}
            className="w-full h-full transition-all duration-300"
            style={{ objectFit }}
            onLoad={() => setHasError(false)}
            onError={() => setHasError(true)}
          />
        )}
      </div>
    </ConfigSection>
  );
}
