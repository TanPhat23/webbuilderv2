import type { ColorScheme } from "../utils/designSystemUtils";

export interface ColorPreset {
  readonly name: string;
  readonly colors: ColorScheme;
}

export interface ColorFieldConfig {
  readonly key: keyof ColorScheme;
  readonly label: string;
  readonly bgClass: string;
  readonly placeholder: string;
}

export interface FontOption {
  readonly value: string;
  readonly label: string;
}

export interface ShadowOption {
  readonly value: string;
  readonly label: string;
  readonly shadow: string;
}

export interface RadiusScaleConfig {
  readonly label: string;
  readonly compute: (baseRadius: number) => number;
}

export const DEFAULT_COLORS: ColorScheme = {
  primary: "#3b82f6",
  primaryForeground: "#ffffff",
  secondary: "#e0e7ff",
  secondaryForeground: "#1e3a8a",
  accent: "#1e40af",
  accentForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#0f172a",
  card: "#f8fafc",
  cardForeground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
};

const LIGHT_SURFACE_BASE = {
  primaryForeground: "#ffffff",
  accentForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#0f172a",
  cardForeground: "#0f172a",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
} as const;

export const PRESET_COLORS: readonly ColorPreset[] = [
  { name: "Blue Ocean", colors: DEFAULT_COLORS },
  {
    name: "Green Forest",
    colors: {
      ...LIGHT_SURFACE_BASE,
      primary: "#10b981",
      secondary: "#d1fae5",
      secondaryForeground: "#065f46",
      accent: "#047857",
      card: "#f0fdf4",
      muted: "#dcfce7",
      mutedForeground: "#166534",
      border: "#bbf7d0",
    },
  },
  {
    name: "Purple Magic",
    colors: {
      ...LIGHT_SURFACE_BASE,
      primary: "#8b5cf6",
      secondary: "#ede9fe",
      secondaryForeground: "#5b21b6",
      accent: "#5b21b6",
      card: "#faf5ff",
      muted: "#f3e8ff",
      mutedForeground: "#7c3aed",
      border: "#e9d5ff",
    },
  },
  {
    name: "Orange Sunset",
    colors: {
      ...LIGHT_SURFACE_BASE,
      primary: "#f59e0b",
      secondary: "#fef3c7",
      secondaryForeground: "#92400e",
      accent: "#d97706",
      card: "#fffbeb",
      muted: "#fef3c7",
      mutedForeground: "#b45309",
      border: "#fde68a",
    },
  },
  {
    name: "Red Passion",
    colors: {
      ...LIGHT_SURFACE_BASE,
      primary: "#ef4444",
      secondary: "#fee2e2",
      secondaryForeground: "#991b1b",
      accent: "#dc2626",
      card: "#fef2f2",
      muted: "#fecaca",
      mutedForeground: "#b91c1c",
      border: "#fca5a5",
      destructive: "#dc2626",
    },
  },
  {
    name: "Pink Rose",
    colors: {
      ...LIGHT_SURFACE_BASE,
      primary: "#ec4899",
      secondary: "#fce7f3",
      secondaryForeground: "#9f1239",
      accent: "#be185d",
      card: "#fdf2f8",
      muted: "#fbcfe8",
      mutedForeground: "#db2777",
      border: "#f9a8d4",
    },
  },
];

export const COLOR_FIELDS: readonly ColorFieldConfig[] = [
  { key: "primary", label: "Primary", bgClass: "bg-primary", placeholder: "#3b82f6" },
  { key: "primaryForeground", label: "Primary FG", bgClass: "", placeholder: "#ffffff" },
  { key: "secondary", label: "Secondary", bgClass: "bg-secondary", placeholder: "#e0e7ff" },
  { key: "secondaryForeground", label: "Secondary FG", bgClass: "", placeholder: "#1e3a8a" },
  { key: "accent", label: "Accent", bgClass: "bg-accent", placeholder: "#1e40af" },
  { key: "accentForeground", label: "Accent FG", bgClass: "", placeholder: "#ffffff" },
  { key: "background", label: "Background", bgClass: "", placeholder: "#ffffff" },
  { key: "foreground", label: "Foreground", bgClass: "", placeholder: "#0f172a" },
  { key: "card", label: "Card", bgClass: "", placeholder: "#f8fafc" },
  { key: "cardForeground", label: "Card FG", bgClass: "", placeholder: "#0f172a" },
  { key: "muted", label: "Muted", bgClass: "", placeholder: "#f1f5f9" },
  { key: "mutedForeground", label: "Muted FG", bgClass: "", placeholder: "#64748b" },
  { key: "border", label: "Border", bgClass: "", placeholder: "#e2e8f0" },
  { key: "destructive", label: "Destructive", bgClass: "", placeholder: "#ef4444" },
  { key: "destructiveForeground", label: "Destructive FG", bgClass: "", placeholder: "#ffffff" },
];

export const FONT_OPTIONS: readonly FontOption[] = [
  { value: "Inter", label: "Inter (Sans)" },
  { value: "Lora", label: "Lora (Serif)" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Mono)" },
];

export const SHADOW_OPTIONS: readonly ShadowOption[] = [
  { value: "sm", label: "Small", shadow: "0px 1px 2px 0px hsl(0 0% 0% / 0.05)" },
  {
    value: "md",
    label: "Medium",
    shadow: "0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "lg",
    label: "Large",
    shadow: "0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "xl",
    label: "Extra Large",
    shadow: "0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1)",
  },
  {
    value: "2xl",
    label: "2X Large",
    shadow: "0px 25px 50px -12px hsl(0 0% 0% / 0.25)",
  },
];

export const SPACING_MULTIPLIERS = [1, 2, 4, 8, 12] as const;

export const RADIUS_SCALES: readonly RadiusScaleConfig[] = [
  { label: "SM", compute: (radius) => Math.max(0, radius - 4) },
  { label: "MD", compute: (radius) => Math.max(0, radius - 2) },
  { label: "LG", compute: (radius) => radius },
  { label: "XL", compute: (radius) => radius + 4 },
];
