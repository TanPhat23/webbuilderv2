"use client";

import React, { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEMPLATE_TYPES = [
  { id: "full-site", label: "Full Website" },
  { id: "page", label: "Single Page" },
  { id: "section", label: "Section" },
  { id: "block", label: "Block" },
] as const;

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch categories with React Query
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  // Get current filter state from URL
  const currentTemplateType = searchParams.get("templateType");
  const currentCategoryId = searchParams.get("categoryId");
  const currentFeatured = searchParams.get("featured") === "true";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.push(`/marketplace?${params.toString()}`);
    },
    [searchParams, router],
  );

  const toggleTemplateType = (type: string) => {
    if (currentTemplateType === type) {
      updateFilter("templateType", null);
    } else {
      updateFilter("templateType", type);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (currentCategoryId === categoryId) {
      updateFilter("categoryId", null);
    } else {
      updateFilter("categoryId", categoryId);
    }
  };

  const toggleFeatured = () => {
    if (currentFeatured) {
      updateFilter("featured", null);
    } else {
      updateFilter("featured", "true");
    }
  };

  const clearAllFilters = () => {
    router.push("/marketplace");
  };

  const hasActiveFilters =
    currentTemplateType || currentCategoryId || currentFeatured;

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filter Templates</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <FilterSection title="Category" defaultOpen={true}>
          {isCategoriesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-3 pl-1">
              {categories.map((category, index) => (
                <div key={`category-${category.id || index}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentCategoryId === category.id}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-muted-foreground cursor-pointer flex items-center justify-between flex-1"
                  >
                    <span>{category.name}</span>
                    {category.count !== undefined && (
                      <span className="text-xs">{category.count}</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pl-1">
              No categories available
            </p>
          )}
        </FilterSection>

        {/* Template Type Filter */}
        <FilterSection title="Template Type" defaultOpen={true}>
          <div className="space-y-3 pl-1">
            {TEMPLATE_TYPES.map((type, index) => (
              <div key={`type-${type.id || index}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={currentTemplateType === type.id}
                  onCheckedChange={() => toggleTemplateType(type.id)}
                />
                <Label
                  htmlFor={`type-${type.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Features Filter */}
        <FilterSection title="Features" defaultOpen={true}>
          <div className="space-y-3 pl-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={currentFeatured}
                onCheckedChange={toggleFeatured}
              />
              <Label
                htmlFor="featured"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Featured Only
              </Label>
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

// Reusable collapsible filter section component
function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium"
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
