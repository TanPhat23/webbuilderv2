import React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable sortable table header component
 * Provides consistent sorting UI across all tables
 */
export function SortableHeader<TData, TValue>({
  column,
  children,
  className = "h-auto p-0 font-semibold",
}: SortableHeaderProps<TData, TValue>) {
  const sortDirection = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sortDirection === "asc")}
      className={className}
    >
      {children}
      {sortDirection === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sortDirection === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
