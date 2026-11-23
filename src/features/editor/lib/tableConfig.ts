import type { TableColumnDefinition, TableSettings } from "@/types/elements";

export interface TableAppearanceOption {
  readonly key: "bordered" | "striped" | "hoverable" | "compact";
  readonly id: string;
  readonly label: string;
  readonly chipLabel: string;
  readonly hint: string;
}

export const TABLE_APPEARANCE_OPTIONS: readonly TableAppearanceOption[] = [
  {
    key: "bordered",
    id: "table-bordered",
    label: "Bordered",
    chipLabel: "bordered",
    hint: "Add visible borders around each cell in the table.",
  },
  {
    key: "striped",
    id: "table-striped",
    label: "Striped rows",
    chipLabel: "striped",
    hint: "Alternate row background colors for improved readability.",
  },
  {
    key: "hoverable",
    id: "table-hoverable",
    label: "Hover highlight",
    chipLabel: "hoverable",
    hint: "Highlight rows when the user hovers over them.",
  },
  {
    key: "compact",
    id: "table-compact",
    label: "Compact",
    chipLabel: "compact",
    hint: "Reduce cell padding for a more dense, compact table layout.",
  },
];

export function createTableColumn(
  existingCount: number,
  id: string,
): TableColumnDefinition {
  return {
    id,
    header: `Column ${existingCount + 1}`,
    align: "left",
  };
}

export function updateTableColumnAt(
  columns: readonly TableColumnDefinition[],
  index: number,
  updated: TableColumnDefinition,
): TableColumnDefinition[] {
  return columns.map((col, i) => (i === index ? updated : col));
}

export function removeTableColumnAt(
  columns: readonly TableColumnDefinition[],
  index: number,
): TableColumnDefinition[] | undefined {
  const next = columns.filter((_, i) => i !== index);
  return next.length > 0 ? next : undefined;
}

export function moveTableColumn(
  columns: readonly TableColumnDefinition[],
  index: number,
  direction: "up" | "down",
): TableColumnDefinition[] | null {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= columns.length) return null;
  const next = [...columns];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function parseTableColumnWidth(raw: string): number | string | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (/^-\d+(\.\d+)?/.test(trimmed)) return undefined;
  return trimmed;
}

export function getActiveTableAppearanceFlags(
  settings: TableSettings,
): string[] {
  return TABLE_APPEARANCE_OPTIONS.filter((opt) => Boolean(settings[opt.key])).map(
    (opt) => opt.chipLabel,
  );
}
