export interface ColorScheme {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
}

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

export interface ThemeTokens {
  readonly colors: ColorScheme;
  readonly fontFamily: string;
  readonly letterTracking: number;
  readonly borderRadius: number;
  readonly spacing: number;
  readonly shadowStyle: string;
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

export const COLOR_TOKEN_KEYS: ReadonlySet<keyof ColorScheme> = new Set(
  COLOR_FIELDS.map((field) => field.key),
);

export const SHADOW_STYLE_KEYS: ReadonlySet<string> = new Set(
  SHADOW_OPTIONS.map((opt) => opt.value),
);

const SAFE_CSS_VALUE_PATTERN = /^[#a-zA-Z0-9(),.%_\s-]+$/;

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: DEFAULT_COLORS,
  fontFamily: "Inter",
  letterTracking: 0,
  borderRadius: 8,
  spacing: 4,
  shadowStyle: "md",
};

export function findColorPreset(name: string): ColorPreset | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  return PRESET_COLORS.find((preset) => preset.name.toLowerCase() === normalized);
}

export function isSafeCssValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 120 && SAFE_CSS_VALUE_PATTERN.test(trimmed);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export interface ThemeValidationIssue {
  readonly path: string;
  readonly message: string;
}

export function validateThemePatchObject(
  theme: Record<string, unknown>,
  pathPrefix = "theme",
): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];

  for (const [key, value] of Object.entries(theme)) {
    if (value === null) continue;
    const fieldPath = `${pathPrefix}.${key}`;

    if (COLOR_TOKEN_KEYS.has(key as keyof ColorScheme)) {
      if (typeof value !== "string" || !isSafeCssValue(value)) {
        issues.push({
          path: fieldPath,
          message: "must be a valid CSS color string (e.g. #3b82f6) or null",
        });
      }
      continue;
    }

    switch (key) {
      case "fontFamily":
        if (typeof value !== "string" || !isSafeCssValue(value)) {
          issues.push({
            path: fieldPath,
            message: "must be a valid font family name (e.g. Inter, Lora, JetBrains Mono) or null",
          });
        }
        break;
      case "shadowStyle":
        if (typeof value !== "string" || !SHADOW_STYLE_KEYS.has(value)) {
          issues.push({
            path: fieldPath,
            message: "must be one of sm, md, lg, xl, 2xl or null",
          });
        }
        break;
      case "letterTracking":
        if (typeof value !== "number" || !Number.isFinite(value) || value < -0.1 || value > 0.25) {
          issues.push({
            path: fieldPath,
            message: "must be a number between -0.1 and 0.25",
          });
        }
        break;
      case "borderRadius":
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 48) {
          issues.push({
            path: fieldPath,
            message: "must be a number between 0 and 48",
          });
        }
        break;
      case "spacing":
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 32) {
          issues.push({
            path: fieldPath,
            message: "must be a number between 0 and 32",
          });
        }
        break;
      default:
        break;
    }
  }

  return issues;
}

export function parseImportedThemeJson(
  rawJson: string,
  current: Readonly<ThemeTokens>,
): { readonly ok: true; readonly value: ThemeTokens } | { readonly ok: false; readonly error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "Invalid JSON syntax" };
  }

  if (!isPlainRecord(parsed)) {
    return { ok: false, error: "Theme JSON must be an object" };
  }

  const issues = validateThemePatchObject(parsed, "theme");
  if (issues.length > 0) {
    return { ok: false, error: `${issues[0].path}: ${issues[0].message}` };
  }

  const nextColors: ColorScheme = { ...current.colors };
  for (const field of COLOR_FIELDS) {
    const candidate = parsed[field.key];
    if (typeof candidate === "string") {
      nextColors[field.key] = candidate.trim();
    }
  }

  return {
    ok: true,
    value: {
      colors: nextColors,
      fontFamily:
        typeof parsed.fontFamily === "string"
          ? parsed.fontFamily.trim()
          : current.fontFamily,
      letterTracking:
        typeof parsed.letterTracking === "number"
          ? parsed.letterTracking
          : current.letterTracking,
      borderRadius:
        typeof parsed.borderRadius === "number"
          ? parsed.borderRadius
          : current.borderRadius,
      spacing:
        typeof parsed.spacing === "number" ? parsed.spacing : current.spacing,
      shadowStyle:
        typeof parsed.shadowStyle === "string"
          ? parsed.shadowStyle
          : current.shadowStyle,
    },
  };
}
