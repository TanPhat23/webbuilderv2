"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  TableElement,
  TableSettings,
  TableColumnDefinition,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  ConfigEmpty,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Table,
  Settings2,
  Columns3,
  Paintbrush,
  Plus,
  Trash2,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpDown,
  Type,
  Hash,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* ─── Alignment Options ─── */

const ALIGN_OPTIONS = [
  { value: "left", label: "Left", icon: <AlignLeft className="h-3 w-3" /> },
  {
    value: "center",
    label: "Center",
    icon: <AlignCenter className="h-3 w-3" />,
  },
  { value: "right", label: "Right", icon: <AlignRight className="h-3 w-3" /> },
] as const;

/* ─── Column Editor Sub-component ─── */

interface ColumnEditorProps {
  column: TableColumnDefinition;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (updated: TableColumnDefinition) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function ColumnEditor({
  column,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ColumnEditorProps) {
  const handleChange = (
    field: keyof TableColumnDefinition,
    value: unknown,
  ) => {
    onChange({ ...column, [field]: value });
  };

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-150",
        isExpanded
          ? "border-border bg-muted/10 shadow-sm"
          : "border-border/40 bg-background hover:border-border/60",
      )}
    >
      {/* Column header row */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          "flex items-center gap-2 w-full px-2.5 py-1.5 text-left transition-colors",
          "hover:bg-muted/30 rounded-t-lg",
          !isExpanded && "rounded-b-lg",
        )}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
        <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums w-4 shrink-0">
          {index + 1}
        </span>
        <span className="text-[11px] font-medium text-foreground/80 truncate flex-1">
          {column.header || "Untitled Column"}
        </span>
        {column.accessor && (
          <span className="inline-flex items-center rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
            {column.accessor}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        )}
      </button>

      {/* Expanded column fields */}
      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-1 flex flex-col gap-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <SectionDivider />

          {/* Header */}
          <ConfigField
            label="Header"
            htmlFor={`col-header-${column.id}`}
            hint="The visible text displayed in the table header row."
          >
            <Input
              id={`col-header-${column.id}`}
              type="text"
              value={column.header || ""}
              onChange={(e) => handleChange("header", e.target.value)}
              placeholder="Column Name"
              className="h-7 w-full max-w-[130px] px-2 text-[11px] rounded-md"
              autoComplete="off"
            />
          </ConfigField>

          {/* Accessor */}
          <ConfigField
            label="Accessor"
            htmlFor={`col-accessor-${column.id}`}
            hint="The data field key that maps to this column. Used to extract values from data rows."
          >
            <Input
              id={`col-accessor-${column.id}`}
              type="text"
              value={column.accessor || ""}
              onChange={(e) =>
                handleChange("accessor", e.target.value || undefined)
              }
              placeholder="fieldKey"
              className="h-7 w-full max-w-[130px] px-2 text-[11px] font-mono rounded-md"
              autoComplete="off"
            />
          </ConfigField>

          {/* Width */}
          <ConfigField
            label="Width"
            htmlFor={`col-width-${column.id}`}
            hint="Column width. Use a number for pixels or a string like '25%', 'auto', '1fr', etc."
          >
            <Input
              id={`col-width-${column.id}`}
              type="text"
              value={column.width ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                const asNum = Number(raw);
                handleChange(
                  "width",
                  raw === ""
                    ? undefined
                    : !isNaN(asNum) && raw.trim() === String(asNum)
                      ? asNum
                      : raw,
                );
              }}
              placeholder="auto"
              className="h-7 w-[80px] px-1.5 text-[11px] font-mono text-center rounded-md"
              autoComplete="off"
            />
          </ConfigField>

          {/* Align */}
          <ConfigField
            label="Align"
            htmlFor={`col-align-${column.id}`}
            hint="Text alignment for this column's cells."
          >
            <div className="flex items-center gap-0.5">
              {ALIGN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange("align", opt.value)}
                  title={opt.label}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-100",
                    "border border-transparent",
                    (column.align ?? "left") === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground/60 hover:bg-muted/50 hover:text-muted-foreground",
                  )}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </ConfigField>

          {/* Sortable */}
          <ConfigField
            label="Sortable"
            htmlFor={`col-sortable-${column.id}`}
            hint="Allow users to sort the table by this column."
          >
            <Switch
              id={`col-sortable-${column.id}`}
              checked={!!column.sortable}
              onCheckedChange={(checked) =>
                handleChange("sortable", !!checked)
              }
              className="scale-75 origin-right"
            />
          </ConfigField>

          <SectionDivider />

          {/* Actions */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={isFirst}
                className="h-6 w-6 p-0"
                title="Move up"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={isLast}
                className="h-6 w-6 p-0"
                title="Move down"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Remove column"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function TableConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [expandedColumnId, setExpandedColumnId] = React.useState<
    string | null
  >(null);

  if (!selectedElement || selectedElement.type !== "Table") {
    return null;
  }

  const element = selectedElement as TableElement;
  const settings: TableSettings = element.settings ?? {};
  const columns = settings.columns ?? [];

  /* ─── Handlers ─── */

  const updateSetting = <K extends keyof TableSettings>(
    key: K,
    value: TableSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value },
    });
  };

  const handleCaptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSetting("caption", e.target.value || undefined);
  };

  /* ─── Column Operations ─── */

  const addColumn = () => {
    const newColumn: TableColumnDefinition = {
      id: uuidv4(),
      header: `Column ${columns.length + 1}`,
      accessor: undefined,
      width: undefined,
      align: "left",
      sortable: false,
    };
    const updated = [...columns, newColumn];
    updateSetting("columns", updated);
    setExpandedColumnId(newColumn.id);
  };

  const updateColumn = (
    index: number,
    updated: TableColumnDefinition,
  ) => {
    const next = [...columns];
    next[index] = updated;
    updateSetting("columns", next);
  };

  const removeColumn = (index: number) => {
    const next = columns.filter((_, i) => i !== index);
    updateSetting("columns", next.length > 0 ? next : undefined);
    if (columns[index]?.id === expandedColumnId) {
      setExpandedColumnId(null);
    }
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const next = [...columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateSetting("columns", next);
  };

  /* ─── Derived State ─── */

  const hasCaption = !!settings.caption && settings.caption.length > 0;
  const sortableCount = columns.filter((c) => c.sortable).length;

  return (
    <AccordionItem value="table-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <Table className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Table Settings</span>
          {columns.length > 0 && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums">
                {columns.length} col{columns.length !== 1 ? "s" : ""}
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["general", "columns", "appearance"]}
          className="w-full"
        >
          {/* ── General ── */}
          <AccordionSection
            value="general"
            title="General"
            icon={<Settings2 />}
            nested
          >
            {/* Caption */}
            <ConfigField
              label="Caption"
              htmlFor="table-caption"
              hint="An accessible caption for the table. Rendered as a <caption> element above the table. Important for screen readers to understand the table's purpose."
              vertical
            >
              <Input
                id="table-caption"
                type="text"
                value={settings.caption ?? ""}
                onChange={handleCaptionChange}
                placeholder="Table description..."
                className="h-7 w-full px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Caption indicator */}
            {hasCaption ? (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <FileText className="h-3 w-3 text-emerald-500/60" />
                <span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
                  Caption set — accessible to screen readers
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <FileText className="h-3 w-3 text-amber-500/60" />
                <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                  Add a caption for better accessibility
                </span>
              </div>
            )}
          </AccordionSection>

          {/* ── Columns ── */}
          <AccordionSection
            value="columns"
            title="Columns"
            icon={<Columns3 />}
            badge={
              columns.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums">
                  {columns.length}
                </span>
              ) : undefined
            }
            nested
          >
            {columns.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {columns.map((col, index) => (
                  <ColumnEditor
                    key={col.id}
                    column={col}
                    index={index}
                    isExpanded={expandedColumnId === col.id}
                    onToggleExpand={() =>
                      setExpandedColumnId(
                        expandedColumnId === col.id ? null : col.id,
                      )
                    }
                    onChange={(updated) => updateColumn(index, updated)}
                    onRemove={() => removeColumn(index)}
                    onMoveUp={() => moveColumn(index, "up")}
                    onMoveDown={() => moveColumn(index, "down")}
                    isFirst={index === 0}
                    isLast={index === columns.length - 1}
                  />
                ))}
              </div>
            ) : (
              <ConfigEmpty
                icon={<Columns3 className="h-5 w-5" />}
                message="No columns defined. Add columns to configure the table structure."
              />
            )}

            <SectionDivider />

            {/* Add column button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addColumn}
              className="w-full h-7 text-[11px] gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Add Column
            </Button>

            {/* Column summary */}
            {columns.length > 0 && (
              <>
                <SectionDivider />
                <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    <Columns3 className="h-2.5 w-2.5" />
                    {columns.length} column{columns.length !== 1 ? "s" : ""}
                  </span>
                  {sortableCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      <ArrowUpDown className="h-2.5 w-2.5" />
                      {sortableCount} sortable
                    </span>
                  )}
                </div>
              </>
            )}
          </AccordionSection>

          {/* ── Appearance ── */}
          <AccordionSection
            value="appearance"
            title="Appearance"
            icon={<Paintbrush />}
            nested
          >
            {/* Bordered */}
            <ConfigField
              label="Bordered"
              htmlFor="table-bordered"
              hint="Add visible borders around each cell in the table."
            >
              <Switch
                id="table-bordered"
                checked={!!settings.bordered}
                onCheckedChange={(checked) =>
                  updateSetting("bordered", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Striped */}
            <ConfigField
              label="Striped rows"
              htmlFor="table-striped"
              hint="Alternate row background colors for improved readability."
            >
              <Switch
                id="table-striped"
                checked={!!settings.striped}
                onCheckedChange={(checked) =>
                  updateSetting("striped", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Hoverable */}
            <ConfigField
              label="Hover highlight"
              htmlFor="table-hoverable"
              hint="Highlight rows when the user hovers over them."
            >
              <Switch
                id="table-hoverable"
                checked={!!settings.hoverable}
                onCheckedChange={(checked) =>
                  updateSetting("hoverable", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Compact */}
            <ConfigField
              label="Compact"
              htmlFor="table-compact"
              hint="Reduce cell padding for a more dense, compact table layout."
            >
              <Switch
                id="table-compact"
                checked={!!settings.compact}
                onCheckedChange={(checked) =>
                  updateSetting("compact", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Appearance summary */}
            <SectionDivider />
            <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
              {settings.bordered && (
                <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  bordered
                </span>
              )}
              {settings.striped && (
                <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  striped
                </span>
              )}
              {settings.hoverable && (
                <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  hoverable
                </span>
              )}
              {settings.compact && (
                <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  compact
                </span>
              )}
              {!settings.bordered &&
                !settings.striped &&
                !settings.hoverable &&
                !settings.compact && (
                  <div className="flex items-center gap-1.5">
                    <Paintbrush className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/50">
                      Default appearance — no special styles
                    </span>
                  </div>
                )}
            </div>
          </AccordionSection>
        </Accordion>

        {/* ── Final Summary ── */}
        <SectionDivider className="mt-2" />
        <div className="flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Table className="h-2.5 w-2.5" />
            &lt;table&gt;
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums">
            <Columns3 className="h-2.5 w-2.5" />
            {columns.length} col{columns.length !== 1 ? "s" : ""}
          </span>
          {hasCaption && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Type className="h-2.5 w-2.5" />
              captioned
            </span>
          )}
          {sortableCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground tabular-nums">
              <ArrowUpDown className="h-2.5 w-2.5" />
              {sortableCount} sortable
            </span>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
