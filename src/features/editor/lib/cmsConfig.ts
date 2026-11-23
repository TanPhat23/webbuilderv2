import type { CMSContentSettings } from "@/types/elements";

export const CMS_DISPLAY_FIELDS = [
  "title",
  "excerpt",
  "content",
  "image",
  "author",
  "date",
  "status",
] as const;

export const DEFAULT_VISIBLE_CMS_FIELDS = ["title", "content"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function readCMSSettings(raw: unknown): CMSContentSettings {
  if (!isRecord(raw)) return {};
  const out: CMSContentSettings = {};
  if (typeof raw.contentTypeId === "string") out.contentTypeId = raw.contentTypeId;
  if (typeof raw.itemSlug === "string") out.itemSlug = raw.itemSlug;
  if (
    raw.displayMode === "list" ||
    raw.displayMode === "grid" ||
    raw.displayMode === "single"
  ) {
    out.displayMode = raw.displayMode;
  }
  if (typeof raw.limit === "number" && Number.isFinite(raw.limit)) {
    out.limit = raw.limit;
  }
  if (
    raw.sortBy === "title" ||
    raw.sortBy === "createdAt" ||
    raw.sortBy === "updatedAt"
  ) {
    out.sortBy = raw.sortBy;
  }
  if (raw.sortOrder === "asc" || raw.sortOrder === "desc") {
    out.sortOrder = raw.sortOrder;
  }
  if (Array.isArray(raw.fieldsToShow)) {
    out.fieldsToShow = raw.fieldsToShow.filter(
      (field): field is string => typeof field === "string",
    );
  }
  if (isRecord(raw.filterBy)) out.filterBy = raw.filterBy;
  return out;
}

export function getVisibleCMSFields(
  fieldsToShow?: readonly string[],
): string[] {
  return fieldsToShow ? [...fieldsToShow] : [...DEFAULT_VISIBLE_CMS_FIELDS];
}

export function isCMSFieldVisible(
  fieldsToShow: readonly string[] | undefined,
  field: string,
): boolean {
  return (fieldsToShow ?? DEFAULT_VISIBLE_CMS_FIELDS).includes(field);
}

export function countVisibleCMSFields(
  fieldsToShow?: readonly string[],
): number {
  return (fieldsToShow ?? DEFAULT_VISIBLE_CMS_FIELDS).length;
}

export function toggleCMSField(
  fieldsToShow: readonly string[] | undefined,
  field: string,
  checked: boolean,
): string[] {
  const current = getVisibleCMSFields(fieldsToShow);
  if (!checked) return current.filter((item) => item !== field);
  return current.includes(field) ? current : [...current, field];
}

export function parseCMSSortBy(
  value: string,
): CMSContentSettings["sortBy"] | null {
  if (value === "title" || value === "createdAt" || value === "updatedAt") {
    return value;
  }
  return null;
}

export function parseCMSSortOrder(value: string): "asc" | "desc" | null {
  if (value === "asc" || value === "desc") return value;
  return null;
}

export function clampCMSLimit(raw: string, fallback = 10): number {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(100, parsed);
}
