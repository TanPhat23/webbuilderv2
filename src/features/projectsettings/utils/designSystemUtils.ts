interface ColorScheme {
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

interface SimpleColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

export function generateShadowVars(style: string) {
  const shadows: Record<string, string> = {
    sm: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,
    md: `  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,
    lg: `  --shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,
    xl: `  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
    "2xl": `  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
  };
  return shadows[style] || shadows.md;
}

export function generateDesignSystemCSS(system: {
  colors?: SimpleColorScheme;
  fontFamily?: string;
  letterTracking?: number;
  borderRadius?: number;
  spacing?: number;
  shadowStyle?: string;
}) {
  const colorScheme = system.colors || {
    primary: "#3b82f6",
    secondary: "#e0e7ff",
    accent: "#1e40af",
  };
  const fontFamily = system.fontFamily || "Inter";
  const letterTracking = system.letterTracking || 0;
  const borderRadius = system.borderRadius || 8;
  const spacing = system.spacing || 4;
  const shadowStyle = system.shadowStyle || "md";

  return `
/* Design System Variables */
:root {
  /* Colors */
  --color-primary: ${colorScheme.primary};
  --color-secondary: ${colorScheme.secondary};
  --color-accent: ${colorScheme.accent};
  --primary: ${colorScheme.primary};
  --secondary: ${colorScheme.secondary};
  --accent: ${colorScheme.accent};

  /* Typography */
  --font-sans: "${fontFamily}", ui-sans-serif, system-ui, sans-serif;
  --tracking-normal: ${letterTracking}em;

  /* Spacing */
  --spacing: ${spacing}px;

  /* Border Radius */
  --radius: ${borderRadius}px;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* Shadows */
${generateShadowVars(shadowStyle)}
}

body {
  font-family: var(--font-sans);
  letter-spacing: var(--tracking-normal);
}

/* Color Utilities */
.text-primary, [class*="text-primary"] {
  color: ${colorScheme.primary} !important;
}

.bg-primary, [class*="bg-primary"] {
  background-color: ${colorScheme.primary} !important;
}

.border-primary, [class*="border-primary"] {
  border-color: ${colorScheme.primary} !important;
}

.text-secondary, [class*="text-secondary"] {
  color: ${colorScheme.secondary} !important;
}

.bg-secondary, [class*="bg-secondary"] {
  background-color: ${colorScheme.secondary} !important;
}

.text-accent, [class*="text-accent"] {
  color: ${colorScheme.accent} !important;
}

.bg-accent, [class*="bg-accent"] {
  background-color: ${colorScheme.accent} !important;
}
`;
}

export function generateColorsCSS(colors: ColorScheme) {
  return `
:root {
  /* Primary Colors */
  --color-primary: ${colors.primary};
  --primary: ${colors.primary};
  --primary-foreground: ${colors.primaryForeground};

  /* Secondary Colors */
  --color-secondary: ${colors.secondary};
  --secondary: ${colors.secondary};
  --secondary-foreground: ${colors.secondaryForeground};

  /* Accent Colors */
  --color-accent: ${colors.accent};
  --accent: ${colors.accent};
  --accent-foreground: ${colors.accentForeground};

  /* Background Colors */
  --background: ${colors.background};
  --foreground: ${colors.foreground};

  /* Card Colors */
  --card: ${colors.card};
  --card-foreground: ${colors.cardForeground};

  /* Muted Colors */
  --muted: ${colors.muted};
  --muted-foreground: ${colors.mutedForeground};

  /* Border */
  --border: ${colors.border};

  /* Destructive Colors */
  --destructive: ${colors.destructive};
  --destructive-foreground: ${colors.destructiveForeground};
}

/* Utility Classes */
.bg-primary {
  background-color: ${colors.primary} !important;
}

.text-primary {
  color: ${colors.primary} !important;
}

.text-primary-foreground {
  color: ${colors.primaryForeground} !important;
}

.bg-secondary {
  background-color: ${colors.secondary} !important;
}

.text-secondary-foreground {
  color: ${colors.secondaryForeground} !important;
}

.bg-accent {
  background-color: ${colors.accent} !important;
}

.text-accent-foreground {
  color: ${colors.accentForeground} !important;
}

.bg-card {
  background-color: ${colors.card} !important;
}

.text-card-foreground {
  color: ${colors.cardForeground} !important;
}

.bg-muted {
  background-color: ${colors.muted} !important;
}

.text-muted-foreground {
  color: ${colors.mutedForeground} !important;
}

.border-primary {
  border-color: ${colors.primary} !important;
}

.border-border {
  border-color: ${colors.border} !important;
}

.bg-destructive {
  background-color: ${colors.destructive} !important;
}

.text-destructive-foreground {
  color: ${colors.destructiveForeground} !important;
}

/* Hover States */
.hover\\:bg-primary\\/90:hover {
  background-color: ${colors.primary}e6 !important;
}

.hover\\:bg-secondary\\/90:hover {
  background-color: ${colors.secondary}e6 !important;
}

.hover\\:bg-accent\\/90:hover {
  background-color: ${colors.accent}e6 !important;
}
`;
}
