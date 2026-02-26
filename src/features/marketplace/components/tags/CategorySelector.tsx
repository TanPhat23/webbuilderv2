"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, X, Search } from "lucide-react";
import type { Category } from "@/features/marketplace";

interface CategorySelectorProps {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  categories?: Category[];
  isCategoriesLoading: boolean;
}

export function CategorySelector({
  selectedCategories,
  onToggleCategory,
  categories,
  isCategoriesLoading,
}: CategorySelectorProps) {
  const [categorySearch, setCategorySearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch.trim()) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [categories, categorySearch]);

  return (
    <div className="space-y-3">
      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md">
          {selectedCategories.map((categoryId) => {
            const category = categories?.find((c) => c.id === categoryId);
            return category ? (
              <Badge
                key={categoryId}
                variant="default"
                className="cursor-pointer text-xs"
                onClick={() => onToggleCategory(categoryId)}
              >
                {category.name}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Category Selection */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="pl-7 h-8 text-sm"
        />
      </div>

      <div className="max-h-20 overflow-y-auto space-y-1">
        {isCategoriesLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.slice(0, 6).map((category, index) => (
            <div
              key={`category-${category.id || index}`}
              className="flex items-center space-x-2 hover:bg-muted/50 rounded px-2 py-1"
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
                className="h-3 w-3"
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-xs cursor-pointer flex-1"
              >
                {category.name}
              </Label>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No categories found
          </p>
        )}
      </div>
    </div>
  );
}
