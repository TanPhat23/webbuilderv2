import { iconNames } from "lucide-react/dynamic.mjs";
import type { IconName } from "lucide-react/dynamic.mjs";

export const ALL_ICON_NAMES: readonly IconName[] = Array.from(iconNames);
const ICON_NAME_SET: ReadonlySet<string> = new Set(iconNames);

export const MAX_VISIBLE_ICONS = 60;
export const DEFAULT_ICON_NAME = "star";
export const DEFAULT_ICON_SIZE = 24;
export const DEFAULT_ICON_STROKE_WIDTH = 2;
export const DEFAULT_ICON_COLOR = "currentColor";
export const DEFAULT_ICON_FILL = "none";

export const ICON_SIZE_PRESETS = [16, 20, 24, 32, 40, 48, 64] as const;
export const ICON_STROKE_PRESETS = [0.5, 1, 1.5, 2, 2.5, 3] as const;

export interface IconColorPreset {
  readonly color: string;
  readonly label: string;
}

const BASE_ICON_COLOR_PRESETS: readonly IconColorPreset[] = [
  { color: "currentColor", label: "Inherit" },
  { color: "#000000", label: "Black" },
  { color: "#ffffff", label: "White" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
];

export const ICON_COLOR_PRESETS: readonly IconColorPreset[] = [
  ...BASE_ICON_COLOR_PRESETS,
  { color: "#6b7280", label: "Gray" },
];

export const FILL_COLOR_PRESETS: readonly IconColorPreset[] = [
  { color: "none", label: "None" },
  ...BASE_ICON_COLOR_PRESETS,
];

export function isValidIconName(value: string): value is IconName {
  return value.length > 0 && ICON_NAME_SET.has(value);
}

export function filterIconNames(
  search: string,
  limit = MAX_VISIBLE_ICONS,
): { items: IconName[]; total: number } {
  const query = search.trim().toLowerCase();
  if (!query) {
    return {
      items: ALL_ICON_NAMES.slice(0, limit),
      total: ALL_ICON_NAMES.length,
    };
  }
  const matches = ALL_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(query),
  );
  return {
    items: matches.slice(0, limit),
    total: matches.length,
  };
}

export function clampIconMetric(
  raw: string,
  min: number,
  max: number,
): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
}
