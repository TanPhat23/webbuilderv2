import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CMSContentSettings } from "@/features/editor";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Eye,
  FileText,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  SortAsc,
  SortDesc,
  Type,
  User,
} from "lucide-react";
import {
  CMS_DISPLAY_FIELDS,
  clampCMSLimit,
  countVisibleCMSFields,
  isCMSFieldVisible,
  parseCMSSortBy,
  parseCMSSortOrder,
  toggleCMSField,
} from "../../../lib/cmsConfig";
import { ConfigField, ConfigSection } from "./_shared";
import { ConfigSelectInput } from "./_shared/ConfigInputs";

const FIELD_ICONS: Record<string, ReactNode> = {
  title: <Type className="h-3 w-3" />,
  excerpt: <AlignLeft className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  author: <User className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  status: <CheckCircle2 className="h-3 w-3" />,
};

const SORT_BY_OPTIONS = [
  { value: "title", label: "Title", icon: <Type className="h-3 w-3" /> },
  { value: "createdAt", label: "Created Date", icon: <Calendar className="h-3 w-3" /> },
  { value: "updatedAt", label: "Updated Date", icon: <Calendar className="h-3 w-3" /> },
] as const;

const SORT_ORDER_OPTIONS = [
  { value: "asc", label: "Ascending", icon: <SortAsc className="h-3 w-3" /> },
  { value: "desc", label: "Descending", icon: <SortDesc className="h-3 w-3" /> },
] as const;

export function CMSDisplaySection({
  limit,
  defaultLimit,
  onUpdate,
}: {
  limit?: number;
  defaultLimit: number;
  onUpdate: (patch: Partial<CMSContentSettings>) => void;
}) {
  const effectiveLimit = limit ?? defaultLimit;
  const [limitInput, setLimitInput] = useState(String(effectiveLimit));

  useEffect(() => {
    setLimitInput(String(effectiveLimit));
  }, [effectiveLimit]);

  return (
    <ConfigSection title="Display" icon={<LayoutGrid className="h-3 w-3" />}>
      <ConfigField
        label="Max items"
        htmlFor="limit"
        hint="Maximum number of items to display."
      >
        <div className="flex items-center gap-1">
          <Input
            id="limit"
            type="number"
            min={1}
            max={100}
            value={limitInput}
            onChange={(e) => {
              const raw = e.target.value;
              setLimitInput(raw);
              if (raw.trim() === "") return;
              const parsed = Number.parseInt(raw, 10);
              if (Number.isFinite(parsed) && parsed > 0) {
                onUpdate({ limit: clampCMSLimit(raw, defaultLimit) });
              }
            }}
            onBlur={() => {
              const clamped = clampCMSLimit(limitInput, defaultLimit);
              setLimitInput(String(clamped));
              if (clamped !== limit) onUpdate({ limit: clamped });
            }}
            className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
          />
          <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
            items
          </span>
        </div>
      </ConfigField>

      <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
        <LayoutGrid className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50">
          Showing up to{" "}
          <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
            {effectiveLimit}
          </span>{" "}
          items
        </span>
      </div>
    </ConfigSection>
  );
}

export function CMSSortingSection({
  sortBy,
  sortOrder,
  onUpdate,
}: {
  sortBy: CMSContentSettings["sortBy"];
  sortOrder: CMSContentSettings["sortOrder"];
  onUpdate: (patch: Partial<CMSContentSettings>) => void;
}) {
  const effectiveSortBy = sortBy || "createdAt";
  const effectiveSortOrder = sortOrder || "desc";

  return (
    <ConfigSection title="Sorting" icon={<ArrowUpDown className="h-3 w-3" />}>
      <ConfigSelectInput
        id="sortBy"
        label="Sort by"
        hint="Which field to sort content items by."
        value={effectiveSortBy}
        onValueChange={(value) => {
          const parsed = parseCMSSortBy(value);
          if (parsed) onUpdate({ sortBy: parsed });
        }}
        options={SORT_BY_OPTIONS}
        className="h-7 w-[124px] px-2 text-[11px] rounded-md"
      />

      <ConfigSelectInput
        id="sortOrder"
        label="Order"
        hint="Ascending (A–Z, oldest) or Descending (Z–A, newest)."
        value={effectiveSortOrder}
        onValueChange={(value) => {
          const parsed = parseCMSSortOrder(value);
          if (parsed) onUpdate({ sortOrder: parsed });
        }}
        options={SORT_ORDER_OPTIONS}
        className="h-7 w-[124px] px-2 text-[11px] rounded-md"
      />

      <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
        <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50">
          Sorted by{" "}
          <span className="font-medium text-muted-foreground/70">
            {effectiveSortBy}
          </span>
          ,{" "}
          <span className="font-medium text-muted-foreground/70">
            {effectiveSortOrder === "asc" ? "ascending" : "descending"}
          </span>
        </span>
      </div>
    </ConfigSection>
  );
}

export function CMSVisibleFieldsSection({
  fieldsToShow,
  onUpdate,
}: {
  fieldsToShow?: string[];
  onUpdate: (patch: Partial<CMSContentSettings>) => void;
}) {
  const activeFieldCount = countVisibleCMSFields(fieldsToShow);

  return (
    <ConfigSection title="Visible Fields" icon={<Eye className="h-3 w-3" />}>
      <div className="flex flex-col gap-1">
        {CMS_DISPLAY_FIELDS.map((field) => {
          const isActive = isCMSFieldVisible(fieldsToShow, field);
          return (
            <div
              key={field}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors duration-150",
                isActive ? "bg-muted/30" : "bg-transparent hover:bg-muted/10",
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-md shrink-0 transition-colors duration-150",
                    isActive
                      ? "bg-foreground/5 text-foreground/60"
                      : "bg-muted/30 text-muted-foreground/40",
                  )}
                >
                  {FIELD_ICONS[field] ?? <Hash className="h-3 w-3" />}
                </span>
                <label
                  htmlFor={`field-${field}`}
                  className={cn(
                    "text-[11px] font-medium capitalize truncate transition-colors duration-150",
                    isActive ? "text-foreground/80" : "text-muted-foreground/60",
                  )}
                >
                  {field}
                </label>
              </div>

              <Switch
                id={`field-${field}`}
                checked={isActive}
                onCheckedChange={(checked) =>
                  onUpdate({
                    fieldsToShow: toggleCMSField(fieldsToShow, field, checked),
                  })
                }
                className="scale-[0.65] origin-right"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150">
        <CheckSquare className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50">
          <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
            {activeFieldCount}
          </span>{" "}
          {activeFieldCount === 1 ? "field" : "fields"} visible in grid
        </span>
      </div>
    </ConfigSection>
  );
}
