export type { ColorScheme } from "@/features/projects/lib/theme-tokens";

export interface SimpleColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface DesignSystem {
  colors?: SimpleColorScheme;
  fontFamily?: string;
  letterTracking?: number;
  borderRadius?: number;
  spacing?: number;
  shadowStyle?: string;
}

export interface ResolvedDesignSystem {
  readonly colors: SimpleColorScheme;
  readonly fontFamily: string;
  readonly letterTracking: number;
  readonly borderRadius: number;
  readonly spacing: number;
  readonly shadowStyle: string;
}

const DEFAULT_COLORS: SimpleColorScheme = {
  primary: "#3b82f6",
  secondary: "#e0e7ff",
  accent: "#1e40af",
};

const CSS_VALUE_PATTERN = /^[#a-zA-Z0-9(),.%_\s-]+$/;

const SHADOW_MAP: Readonly<Record<string, string>> = {
  sm: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.08), 0px 1px 2px -1px hsl(0 0% 0% / 0.08);
  --shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
  md: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0px 6px 10px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
  lg: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0px 10px 15px -3px hsl(0 0% 0% / 0.12), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.14), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
  xl: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 10px 15px -3px hsl(0 0% 0% / 0.12), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 10px 15px -3px hsl(0 0% 0% / 0.12), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0px 14px 20px -3px hsl(0 0% 0% / 0.14), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 18px 25px -5px hsl(0 0% 0% / 0.16), 0px 8px 10px -6px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
  "2xl": `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);
  --shadow-md: 0px 12px 24px -6px hsl(0 0% 0% / 0.18);
  --shadow-lg: 0px 18px 32px -8px hsl(0 0% 0% / 0.2);
  --shadow-xl: 0px 22px 40px -10px hsl(0 0% 0% / 0.22);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
};

function sanitizeCssToken(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed && CSS_VALUE_PATTERN.test(trimmed) ? trimmed : fallback;
}

export function resolveDesignSystemTokens(
  system: DesignSystem,
  fallbackColors?: SimpleColorScheme,
): ResolvedDesignSystem {
  const rawColors = system.colors ?? fallbackColors ?? DEFAULT_COLORS;
  const shadowCandidate = sanitizeCssToken(system.shadowStyle, "md");
  return {
    colors: {
      primary: sanitizeCssToken(rawColors.primary, DEFAULT_COLORS.primary),
      secondary: sanitizeCssToken(rawColors.secondary, DEFAULT_COLORS.secondary),
      accent: sanitizeCssToken(rawColors.accent, DEFAULT_COLORS.accent),
    },
    fontFamily: sanitizeCssToken(system.fontFamily, "Inter"),
    letterTracking:
      typeof system.letterTracking === "number" &&
      Number.isFinite(system.letterTracking)
        ? system.letterTracking
        : 0,
    borderRadius:
      typeof system.borderRadius === "number" &&
      Number.isFinite(system.borderRadius)
        ? Math.max(0, system.borderRadius)
        : 8,
    spacing:
      typeof system.spacing === "number" && Number.isFinite(system.spacing)
        ? Math.max(0, system.spacing)
        : 4,
    shadowStyle: Object.hasOwn(SHADOW_MAP, shadowCandidate)
      ? shadowCandidate
      : "md",
  };
}

export function generateDesignSystemCSS(system: DesignSystem): string {
  const resolved = resolveDesignSystemTokens(system);
  const shadowVars = SHADOW_MAP[resolved.shadowStyle] ?? SHADOW_MAP.md;

  return `
:root {
  --color-primary: ${resolved.colors.primary};
  --color-secondary: ${resolved.colors.secondary};
  --color-accent: ${resolved.colors.accent};
  --primary: ${resolved.colors.primary};
  --secondary: ${resolved.colors.secondary};
  --accent: ${resolved.colors.accent};
  --font-sans: "${resolved.fontFamily}", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --tracking-normal: ${resolved.letterTracking}em;
  --spacing: ${resolved.spacing}px;
  --radius: ${resolved.borderRadius}px;
  --radius-sm: max(0px, calc(var(--radius) - 4px));
  --radius-md: max(0px, calc(var(--radius) - 2px));
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
${shadowVars}
}

body {
  font-family: var(--font-sans);
  letter-spacing: var(--tracking-normal);
}
`;
}
