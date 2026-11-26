import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import { Search, Smile, X } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic.mjs";
import {
  ALL_ICON_NAMES,
  DEFAULT_ICON_NAME,
  MAX_VISIBLE_ICONS,
  filterIconNames,
  isValidIconName,
} from "../../../lib/iconConfig";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [draft, setDraft] = useState(value);
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const { items: filteredIcons, total: totalMatches } = useMemo(
    () => filterIconNames(search, MAX_VISIBLE_ICONS),
    [search],
  );

  const validName = isValidIconName(draft) ? draft : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
            validName
              ? "border-border bg-muted/30"
              : "border-dashed border-border/50 bg-muted/10",
          )}
        >
          {validName ? (
            <DynamicIcon name={validName} size={20} strokeWidth={2} />
          ) : (
            <Smile className="h-5 w-5 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <Input
            type="text"
            value={draft}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              if (next.trim() !== "") onChange(next);
            }}
            onBlur={() => {
              const next = draft.trim() || DEFAULT_ICON_NAME;
              setDraft(next);
              if (next !== value) onChange(next);
            }}
            placeholder={DEFAULT_ICON_NAME}
            className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
            autoComplete="off"
          />
          {draft && !validName && (
            <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
              Unknown icon name
            </span>
          )}
          {validName && (
            <span className="text-[10px] text-muted-foreground/50 font-mono truncate">
              {validName}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-medium transition-colors px-1",
          isExpanded
            ? "text-primary"
            : "text-muted-foreground/60 hover:text-muted-foreground",
        )}
      >
        <Search className="h-3 w-3" />
        <span>{isExpanded ? "Hide icon browser" : "Browse icons"}</span>
        {!isExpanded && (
          <span className="text-muted-foreground/40 ml-auto">
            {ALL_ICON_NAMES.length.toLocaleString()} icons
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="h-7 w-full pl-7 pr-7 text-[11px] rounded-md"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-0.5">
            <span className="text-[10px] text-muted-foreground/50">
              {totalMatches > MAX_VISIBLE_ICONS
                ? `Showing ${MAX_VISIBLE_ICONS} of ${totalMatches.toLocaleString()} matches`
                : `${totalMatches} match${totalMatches !== 1 ? "es" : ""}`}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto rounded-md border border-border/30 bg-muted/10 p-1.5">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setDraft(name);
                  onChange(name);
                  setIsExpanded(false);
                  setSearch("");
                }}
                title={name}
                className={cn(
                  "flex items-center justify-center aspect-square rounded-md transition-all duration-100",
                  "hover:bg-muted/80 hover:shadow-sm",
                  value === name
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                    : "bg-background text-foreground/70 hover:text-foreground border border-transparent hover:border-border/50",
                )}
              >
                <DynamicIcon name={name} size={16} strokeWidth={2} />
              </button>
            ))}

            {filteredIcons.length === 0 && (
              <div className="col-span-6 flex flex-col items-center justify-center py-8 gap-2 text-center">
                <Search className="h-5 w-5 text-muted-foreground/30" />
                <span className="text-[11px] text-muted-foreground/50">
                  No icons matching &ldquo;{search}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
