import { sanitizeProjectCss } from "@webbuilder/site-runtime/projects/project-css";
import type {
  JsonRecord,
  ProjectUpdateFields,
} from "@/features/projects/schema/project";
import {
  parseProjectAuthConfig,
  sanitizeRedirectPath,
  type ProjectAuthConfig,
} from "@webbuilder/site-runtime/auth";
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
  authEnabled?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  authLoginPath?: string;
  authAfterLoginPath?: string;
}

export interface ProjectSettingsSource {
  name?: string | null;
  description?: string | null;
  published?: boolean | null;
  subdomain?: string | null;
  header?: { cssStyles?: string | null } | null;
  styles?: unknown;
  authConfig?: unknown;
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
  authEnabled: false,
  supabaseUrl: "",
  supabaseAnonKey: "",
  authLoginPath: "/login",
  authAfterLoginPath: "/",
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
  const parsedAuth = parseProjectAuthConfig(project.authConfig);

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
    authEnabled: parsedAuth !== null,
    supabaseUrl: parsedAuth?.supabaseUrl ?? "",
    supabaseAnonKey: parsedAuth?.supabaseAnonKey ?? "",
    authLoginPath: parsedAuth?.loginPath ?? "/login",
    authAfterLoginPath: parsedAuth?.afterLoginPath ?? "/",
  };
}

export interface ProjectUpdatePermissions {
  readonly canPublish?: boolean;
  readonly canManageSettings?: boolean;
}

export interface BuiltProjectUpdatePayload<
  THeader extends object = NonNullable<ProjectUpdateFields["header"]>,
> {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly published?: boolean;
  readonly subdomain?: string | null;
  readonly authConfig?: ProjectAuthConfig | null;
  readonly header: Partial<THeader> & { cssStyles: string };
  readonly styles: JsonRecord;
}

function normalizeSubdomain(subdomain: string): string | null {
  const trimmed = subdomain.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function areProjectSettingsEqual(
  a: Readonly<ProjectSettingsState>,
  b: Readonly<ProjectSettingsState>,
): boolean {
  if (
    a.projectName !== b.projectName ||
    a.projectDescription !== b.projectDescription ||
    a.isPublished !== b.isPublished ||
    a.subdomain !== b.subdomain ||
    a.customCSS !== b.customCSS ||
    a.fontFamily !== b.fontFamily ||
    a.letterTracking !== b.letterTracking ||
    a.borderRadius !== b.borderRadius ||
    a.spacing !== b.spacing ||
    a.shadowStyle !== b.shadowStyle ||
    Boolean(a.authEnabled) !== Boolean(b.authEnabled) ||
    (a.supabaseUrl ?? "") !== (b.supabaseUrl ?? "") ||
    (a.supabaseAnonKey ?? "") !== (b.supabaseAnonKey ?? "") ||
    (a.authLoginPath ?? "/login") !== (b.authLoginPath ?? "/login") ||
    (a.authAfterLoginPath ?? "/") !== (b.authAfterLoginPath ?? "/")
  ) {
    return false;
  }

  for (const field of COLOR_FIELDS) {
    if (a.selectedColors[field.key] !== b.selectedColors[field.key]) {
      return false;
    }
  }
  return true;
}

export function buildProjectUpdatePayload<
  THeader extends object = NonNullable<ProjectUpdateFields["header"]>,
>({
  projectId,
  existingHeader,
  state,
  permissions,
}: {
  projectId: string;
  existingHeader?: THeader | null;
  state: ProjectSettingsState;
  permissions?: ProjectUpdatePermissions;
}): BuiltProjectUpdatePayload<THeader> {
  const baseHeader: Partial<THeader> = existingHeader ?? {};
  const includePublished = permissions === undefined || permissions.canPublish === true;
  const includeSubdomain = permissions === undefined || permissions.canManageSettings === true;
  const includeAuthConfig =
    includeSubdomain && state.authEnabled !== undefined;

  const builtAuthConfig: ProjectAuthConfig | null = state.authEnabled
    ? {
        provider: "supabase",
        supabaseUrl: (state.supabaseUrl ?? "").trim(),
        supabaseAnonKey: (state.supabaseAnonKey ?? "").trim(),
        loginPath: sanitizeRedirectPath(state.authLoginPath, "/login"),
        afterLoginPath: sanitizeRedirectPath(state.authAfterLoginPath, "/"),
      }
    : null;

  return {
    id: projectId,
    name: state.projectName.trim(),
    description: state.projectDescription || null,
    ...(includePublished ? { published: state.isPublished } : {}),
    ...(includeSubdomain ? { subdomain: normalizeSubdomain(state.subdomain) } : {}),
    ...(includeAuthConfig ? { authConfig: builtAuthConfig } : {}),
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
