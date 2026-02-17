import type { ResponsiveStyles } from "@/interfaces/elements.interface";

/**
 * Styles helpers module
 * Provides factories for creating mock styles and CSS configurations in tests.
 */

// ============================================================================
// Responsive Styles
// ============================================================================

/**
 * Creates a mock ResponsiveStyles object with default values.
 * Useful for testing responsive design and style application.
 *
 * @example
 * ```ts
 * const styles = mockResponsiveStyles({
 *   default: { width: "50%", color: "red" }
 * });
 * ```
 */
export function mockResponsiveStyles(
  overrides: Partial<Record<string, React.CSSProperties>> = {},
): ResponsiveStyles {
  return {
    default: {
      width: "100%",
      height: "auto",
      ...overrides.default,
    },
    ...overrides,
  };
}

/**
 * Creates a mock ResponsiveStyles with mobile-first breakpoints.
 * Includes: default (mobile), tablet, and desktop styles.
 */
export function mockResponsiveStylesWithBreakpoints(
  overrides: Partial<Record<string, React.CSSProperties>> = {},
): ResponsiveStyles {
  return {
    default: {
      width: "100%",
      fontSize: "14px",
      padding: "8px",
      ...overrides.default,
    },
    tablet: {
      width: "80%",
      fontSize: "16px",
      padding: "12px",
      ...overrides.tablet,
    },
    desktop: {
      width: "60%",
      fontSize: "18px",
      padding: "16px",
      ...overrides.desktop,
    },
  };
}

// ============================================================================
// Tailwind Styles
// ============================================================================

/**
 * Creates a string of mock Tailwind CSS classes.
 * Useful for testing Tailwind class application and parsing.
 *
 * @example
 * ```ts
 * const classes = mockTailwindClasses("w-full h-auto");
 * ```
 */
export function mockTailwindClasses(classes: string = ""): string {
  const defaults = "flex flex-col w-full h-auto";
  return classes ? `${defaults} ${classes}` : defaults;
}

/**
 * Creates a responsive Tailwind class string with breakpoints.
 */
export function mockResponsiveTailwindClasses(): string {
  return "w-full md:w-4/5 lg:w-3/5 p-2 md:p-3 lg:p-4 text-sm md:text-base lg:text-lg";
}

// ============================================================================
// CSS Properties
// ============================================================================

/**
 * Creates mock CSS properties for a text element.
 */
export function mockTextStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    fontWeight: "normal",
    lineHeight: "1.5",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for a button element.
 */
export function mockButtonStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for a container/section element.
 */
export function mockContainerStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for a flex layout.
 */
export function mockFlexStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for a grid layout.
 */
export function mockGridStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    width: "100%",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for positioning (absolute/relative).
 */
export function mockPositioningStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    position: "relative",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    ...overrides,
  };
}

/**
 * Creates mock CSS properties for shadows and depth.
 */
export function mockShadowStyles(
  overrides: Partial<React.CSSProperties> = {},
): React.CSSProperties {
  return {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    ...overrides,
  };
}

// ============================================================================
// Style Utilities
// ============================================================================

/**
 * Merges multiple style objects into one.
 * Later styles override earlier ones.
 */
export function mergeStyles(
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Creates a CSS variable reference string.
 * @example
 * ```ts
 * const varRef = cssVar("primary-color"); // "var(--primary-color)"
 * ```
 */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

/**
 * Creates a simple theme object for testing style themes.
 */
export function mockTheme() {
  return {
    colors: {
      primary: "#007bff",
      secondary: "#6c757d",
      success: "#28a745",
      danger: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    typography: {
      h1: { fontSize: "32px", fontWeight: "bold" },
      h2: { fontSize: "24px", fontWeight: "bold" },
      h3: { fontSize: "20px", fontWeight: "bold" },
      body: { fontSize: "16px", fontWeight: "normal" },
      small: { fontSize: "12px", fontWeight: "normal" },
    },
  };
}
