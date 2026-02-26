"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

/* ─── Constants ──────────────────────────────────────────────────── */

const ITEM_HEIGHT = 28;
const LIST_HEIGHT = 240;
const OVERSCAN = 5;
const DEFAULT_SENTINEL = "__default__";

interface FontFamilyPickerProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  fonts: string[];
  className?: string;
}

interface VirtualListProps {
  fonts: string[];
  value: string | undefined;
  onSelect: (item: string) => void;
}

function VirtualList({ fonts, value, onSelect }: VirtualListProps) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const allItems = [DEFAULT_SENTINEL, ...fonts];

  const filtered = useMemo<string[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return [
      DEFAULT_SENTINEL,
      ...fonts.filter((f) => f.toLowerCase().includes(q)),
    ];
  }, [query, allItems, fonts]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
  });

  useEffect(() => {
    if (value) {
      const idx = filtered.indexOf(value);
      if (idx > 0) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(idx, { align: "center" });
        });
      }
    }
   
  }, []);

  const noResults = filtered.length === 1 && query.trim().length > 0;

  return (
    // shouldFilter={false} — we manage filtering ourselves via useMemo
    <Command shouldFilter={false} className="rounded-none">
      <CommandInput
        placeholder="Search fonts…"
        value={query}
        onValueChange={setQuery}
        className="h-8 text-[11px]"
      />

      {/* Virtual scroll container — replaces CommandList */}
      <div
        ref={listRef}
        style={{ height: LIST_HEIGHT, overflow: "auto" }}
        className="overscroll-contain p-1"
      >
        {noResults ? (
          <CommandEmpty className="text-[11px]">No fonts found.</CommandEmpty>
        ) : (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const item = filtered[virtualRow.index]!;
              const isDefault = item === DEFAULT_SENTINEL;
              const isSelected = isDefault ? !value : value === item;
              const label = isDefault ? "Default" : item;

              return (
                <CommandPrimitive.Item
                  key={virtualRow.key}
                  value={item}
                  onSelect={() => onSelect(item)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    fontFamily: isDefault ? undefined : item,
                  }}
                  className={cn(
                    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                    "flex cursor-pointer select-none items-center gap-1.5 rounded-sm px-2 text-[11px] outline-none",
                    isSelected && "bg-accent/60 text-accent-foreground",
                    isDefault && "italic text-muted-foreground",
                  )}
                >
                  <Check
                    className={cn(
                      "size-3 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{label}</span>
                </CommandPrimitive.Item>
              );
            })}
          </div>
        )}
      </div>
    </Command>
  );
}

/* ─── Main picker ────────────────────────────────────────────────── */

export function FontFamilyPicker({
  value,
  onChange,
  fonts,
  className,
}: FontFamilyPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item === DEFAULT_SENTINEL ? undefined : item);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-8 flex-1 items-center justify-between rounded-md border border-input bg-background px-2 text-[10px] font-normal",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className,
          )}
          style={{ fontFamily: value ?? undefined }}
        >
          <span className="truncate">{value ?? "Default"}</span>
          <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-52 p-0" align="start" sideOffset={4}>
        {/* Only mount VirtualList when open so listRef is valid on init */}
        {open && (
          <VirtualList fonts={fonts} value={value} onSelect={handleSelect} />
        )}
      </PopoverContent>
    </Popover>
  );
}
