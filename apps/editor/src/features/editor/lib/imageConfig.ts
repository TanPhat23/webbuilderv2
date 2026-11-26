import type { ImageSettings } from "@webbuilder/site-runtime/types/elements";

interface ObjectFitOption {
  readonly value: NonNullable<ImageSettings["objectFit"]>;
  readonly label: string;
  readonly description: string;
}

export const OBJECT_FIT_OPTIONS: readonly ObjectFitOption[] = [
  { value: "cover", label: "Cover", description: "Fill and crop to fit" },
  {
    value: "contain",
    label: "Contain",
    description: "Fit inside, may letterbox",
  },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  { value: "none", label: "None", description: "Original size" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Smaller of none or contain",
  },
];

export const IMAGE_LOADING_OPTIONS = [
  { value: "lazy", label: "Lazy" },
  { value: "eager", label: "Eager" },
] as const;

export const IMAGE_DECODING_OPTIONS = [
  { value: "async", label: "Async" },
  { value: "sync", label: "Sync" },
  { value: "auto", label: "Auto" },
] as const;

export function parseObjectFit(
  value: string,
): ImageSettings["objectFit"] | null {
  if (
    value === "cover" ||
    value === "contain" ||
    value === "fill" ||
    value === "none" ||
    value === "scale-down"
  ) {
    return value;
  }
  return null;
}

export function parseImageLoading(
  value: string,
): ImageSettings["loading"] | null {
  if (value === "lazy" || value === "eager") return value;
  return null;
}

export function parseImageDecoding(
  value: string,
): ImageSettings["decoding"] | null {
  if (value === "async" || value === "sync" || value === "auto") return value;
  return null;
}

export function extractImageFileName(src: string): string {
  if (src.startsWith("data:")) return "inline image";
  return src.split("/").pop()?.split("?")[0] ?? "";
}
