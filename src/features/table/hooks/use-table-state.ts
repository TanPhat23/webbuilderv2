"use client";
import { useState, useMemo } from "react";
import { SortingState } from "@tanstack/react-table";

interface UseTableStateOptions {
  /**
   * Initial sorting state
   */
  initialSorting?: SortingState;
  /**
   * Initial global filter value
   */
  initialFilter?: string;
}

interface UseTableStateReturn {
  /**
   * Current sorting state
   */
  sorting: SortingState;

  /**
   * Set sorting state
   */
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;

  /**
   * Current global filter value
   */
  globalFilter: string;

  /**
   * Set global filter value
   */
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;

  /**
   * Clear all filters and sorting
   */
  clearFilters: () => void;

  /**
   * Check if any filters are active
   */
  hasActiveFilters: boolean;
}

/**
 * Reusable hook for managing table state (sorting, filtering, etc.)
 */
export function useTableState(
  options: UseTableStateOptions = {},
): UseTableStateReturn {
  const [sorting, setSorting] = useState<SortingState>(
    options.initialSorting ?? [],
  );
  const [globalFilter, setGlobalFilter] = useState(options.initialFilter ?? "");

  const hasActiveFilters = useMemo(() => {
    return globalFilter.length > 0 || sorting.length > 0;
  }, [globalFilter, sorting]);

  const clearFilters = () => {
    setGlobalFilter("");
    setSorting([]);
  };

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    clearFilters,
    hasActiveFilters,
  };
}
