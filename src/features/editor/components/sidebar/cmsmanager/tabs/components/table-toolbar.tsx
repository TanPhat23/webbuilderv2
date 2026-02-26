import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TableToolbarProps {
  /**
   * Title to display in the toolbar
   */
  title: string;
  /**
   * Function to call when add button is clicked
   */
  onAdd: () => void;
  /**
   * Current search/filter value
   */
  searchValue: string;
  /**
   * Function to call when search value changes
   */
  onSearchChange: (value: string) => void;
  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;
  /**
   * Whether the add button is disabled
   */
  addDisabled?: boolean;
  /**
   * Custom add button text (defaults to "Add Row")
   */
  addButtonText?: string;
  /**
   * Whether to show the search input
   */
  showSearch?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * Reusable table toolbar component
 * Provides consistent header with search and add functionality across all tables
 */
export function TableToolbar({
  title,
  onAdd,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  addDisabled = false,
  addButtonText = "Add Row",
  showSearch = true,
  className = "space-y-4",
}: TableToolbarProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          size="sm"
          onClick={onAdd}
          disabled={addDisabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
      </div>

      {showSearch && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
    </div>
  );
}
