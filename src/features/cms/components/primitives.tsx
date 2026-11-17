import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
  column: any;
  children: React.ReactNode;
}

export function SortableHeader({ column, children }: SortableHeaderProps) {
  const dir = column.getIsSorted();

  return (
    <button
      onClick={() => column.toggleSorting(dir === "asc")}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      {dir === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : dir === "desc" ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}
