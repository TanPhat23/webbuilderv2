"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Grid,
  List,
} from "lucide-react";

export type SortOption = "name" | "views" | "created" | "modified";
export type ViewMode = "grid" | "list";

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: () => void;
  showPublishedOnly: boolean;
  onPublishedFilterToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showPublishedOnly,
  onPublishedFilterToggle,
  viewMode,
  onViewModeChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {/* Sort By Select */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSortOrderChange}
          title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
        >
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {/* Published Filter Toggle */}
        <Button
          variant={showPublishedOnly ? "default" : "outline"}
          size="icon"
          onClick={onPublishedFilterToggle}
          title={showPublishedOnly ? "Show all projects" : "Show published only"}
        >
          <Filter className="h-4 w-4" />
        </Button>

        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
