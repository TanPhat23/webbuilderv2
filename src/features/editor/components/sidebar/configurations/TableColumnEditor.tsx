import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TableColumnDefinition } from "@/features/editor";
import { cn } from "@/lib/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from "lucide-react";
import { parseTableColumnWidth } from "../../../lib/tableConfig";
import { ConfigField, SectionDivider } from "./_shared";
import { ConfigTextInput } from "./_shared/ConfigInputs";

const ALIGN_OPTIONS = [
  { value: "left", label: "Left", icon: <AlignLeft className="h-3 w-3" /> },
  { value: "center", label: "Center", icon: <AlignCenter className="h-3 w-3" /> },
  { value: "right", label: "Right", icon: <AlignRight className="h-3 w-3" /> },
] as const;

interface TableColumnEditorProps {
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

export function TableColumnEditor({
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
}: TableColumnEditorProps) {
  const [widthDraft, setWidthDraft] = useState(
    column.width !== undefined ? String(column.width) : "",
  );

  useEffect(() => {
    setWidthDraft(column.width !== undefined ? String(column.width) : "");
  }, [column.width]);

  const updateField = <K extends keyof TableColumnDefinition>(
    field: K,
    value: TableColumnDefinition[K],
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
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-1 flex flex-col gap-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <SectionDivider />

          <ConfigTextInput
            id={`col-header-${column.id}`}
            name={`col-header-${column.id}`}
            label="Header"
            hint="The visible text displayed in the table header row."
            value={column.header || ""}
            placeholder="Column Name"
            onValueChange={(value) => updateField("header", value)}
            className="h-7 w-full max-w-[130px] px-2 text-[11px] rounded-md"
          />

          <ConfigField
            label="Width"
            htmlFor={`col-width-${column.id}`}
            hint="Column width. Use a number for pixels or a CSS length like '25%' or 'auto'."
          >
            <Input
              id={`col-width-${column.id}`}
              type="text"
              value={widthDraft}
              onChange={(e) => {
                const raw = e.target.value;
                setWidthDraft(raw);
                if (raw.trim() === "") {
                  updateField("width", undefined);
                } else if (!raw.trim().endsWith(".")) {
                  const parsed = parseTableColumnWidth(raw);
                  if (parsed !== undefined) updateField("width", parsed);
                }
              }}
              onBlur={() => {
                const parsed = parseTableColumnWidth(widthDraft);
                setWidthDraft(parsed !== undefined ? String(parsed) : "");
                if (parsed !== column.width) updateField("width", parsed);
              }}
              placeholder="auto"
              className="h-7 w-[80px] px-1.5 text-[11px] font-mono text-center rounded-md"
              autoComplete="off"
            />
          </ConfigField>

          <ConfigField
            label="Align"
            htmlFor={`col-align-${column.id}`}
            hint="Text alignment for this column's cells."
          >
            <div className="flex items-center gap-0.5">
              {ALIGN_OPTIONS.map((opt, optIdx) => (
                <button
                  key={opt.value}
                  id={optIdx === 0 ? `col-align-${column.id}` : undefined}
                  type="button"
                  onClick={() => updateField("align", opt.value)}
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

          <SectionDivider />

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
