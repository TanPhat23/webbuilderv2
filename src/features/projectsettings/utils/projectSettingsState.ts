import { sanitizeProjectCss } from "@/features/projects/lib/project-css";
import type {
  JsonRecord,
  ProjectUpdateFields,
} from "@/features/projects/schema/project";
import { COLOR_FIELDS, DEFAULT_COLORS } from "../constants/themePresets";
import type { ColorScheme } from "./designSystemUtils";

export interface ProjectSettingsState {
  projectName: string;
  projectDescription: string;
  isPublished: boolean;
  subdomain: string;
  customCSS: string;
  selectedColors: ColorScheme;
  fontFamily: string;
  letterTracking: number;
  borderRadius: number;
  spacing: number;
  shadowStyle: string;
}

export interface ProjectSettingsSource {
  name?: string | null;
  description?: string | null;
  published?: boolean | null;
  subdomain?: string | null;
  header?: { cssStyles?: string | null } | null;
  styles?: unknown;
}

export const INITIAL_PROJECT_SETTINGS_STATE: ProjectSettingsState = {
  projectName: "",
  projectDescription: "",
  isPublished: false,
  subdomain: "",
  customCSS: "",
  selectedColors: { ...DEFAULT_COLORS },
  fontFamily: "Inter",
  letterTracking: 0,
  borderRadius: 8,
  spacing: 4,
  shadowStyle: "md",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readNumber(record: Record<string, unknown>, key: string, fallback: number): number {
  const value = record[key];
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function extractColorScheme(styles: Record<string, unknown>): ColorScheme {
  const colors: ColorScheme = { ...DEFAULT_COLORS };
  for (const field of COLOR_FIELDS) {
    colors[field.key] = readString(styles, field.key, DEFAULT_COLORS[field.key]);
  }
  return colors;
}

export function extractProjectSettings(
  project: ProjectSettingsSource,
): ProjectSettingsState {
  const styles = isRecord(project.styles) ? project.styles : {};
  const cssStyles =
    project.header && typeof project.header.cssStyles === "string"
      ? project.header.cssStyles
      : "";

  return {
    projectName: project.name || "",
    projectDescription: project.description || "",
    isPublished: Boolean(project.published),
    subdomain: project.subdomain || "",
    customCSS: cssStyles,
    selectedColors: extractColorScheme(styles),
    fontFamily: readString(styles, "fontFamily", "Inter"),
    letterTracking: readNumber(styles, "letterTracking", 0),
    borderRadius: readNumber(styles, "borderRadius", 8),
    spacing: readNumber(styles, "spacing", 4),
    shadowStyle: readString(styles, "shadowStyle", "md"),
  };
}

export function buildProjectUpdatePayload<
  THeader extends object = NonNullable<ProjectUpdateFields["header"]>,
>({
  projectId,
  existingHeader,
  state,
}: {
  projectId: string;
  existingHeader?: THeader | null;
  state: ProjectSettingsState;
}): ProjectUpdateFields & {
  id: string;
  header: Partial<THeader> & { cssStyles: string };
  styles: JsonRecord;
} {
  const baseHeader: Partial<THeader> = existingHeader ?? {};
  return {
    id: projectId,
    name: state.projectName,
    description: state.projectDescription || null,
    published: state.isPublished,
    subdomain: state.subdomain || null,
    header: {
      ...baseHeader,
      cssStyles: sanitizeProjectCss(state.customCSS),
    },
    styles: {
      ...state.selectedColors,
      fontFamily: state.fontFamily,
      borderRadius: state.borderRadius,
      spacing: state.spacing,
      letterTracking: state.letterTracking,
      shadowStyle: state.shadowStyle,
    } satisfies JsonRecord,
  };
}

function parseEmbeddedJsonMessage(rawMessage: string): string | null {
  const jsonMatch = rawMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!isRecord(parsed)) return null;
    if (typeof parsed.errorMessage === "string" && parsed.errorMessage) {
      return parsed.errorMessage;
    }
    if (typeof parsed.message === "string" && parsed.message) {
      return parsed.message;
    }
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

export function extractUpdateErrorMessage(error: unknown): string {
  const fallback = "Failed to update project";
  if (!isRecord(error) && !(error instanceof Error)) return fallback;
  const raw =
    error instanceof Error
      ? error.message
      : typeof error.message === "string" || typeof error.message === "number"
        ? String(error.message)
        : "";
  if (!raw) return fallback;
  return parseEmbeddedJsonMessage(raw) ?? raw;
}
